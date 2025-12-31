export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildKaiSystemPrompt } from "@/lib/coach-kai/system-prompt";
import { extractTechniquesFromText, matchDrillsToTechniques } from "@/lib/coach-kai/drill-matcher";
import { detectEmotion, getEmotionalAcknowledgment } from "@/lib/coach-kai/emotion-detector";
import { parseKaiResponse } from "@/lib/coach-kai/response-parser";

/**
 * Enhanced Coach Kai - Emotionally Intelligent AI Coach with Action Cards
 * 
 * Features:
 * - Emotional intelligence (detects frustration, excitement, anxiety)
 * - Technical insight extraction (identifies technique issues)
 * - Action cards (drills, goals, video analysis, pro comparison)
 * - Conversation memory
 * - Streaming responses
 */

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ABACUSAI_API_KEY || process.env.ABACUS_API_KEY;
    if (!apiKey) {
      console.error('[Coach Kai] No Abacus AI API key configured');
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1];
    const messageText = lastUserMessage.content;

    // ============================================
    // LOAD USER DATA AND CONTEXT
    // ============================================
    
    const [user, userGoals, conversation] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          firstName: true,
          name: true,
          skillLevel: true,
          playerRating: true,
          primaryGoals: true,
          biggestChallenges: true
        }
      }),
      prisma.goal.findMany({
        where: { userId: session.user.id, status: 'ACTIVE' },
        select: { title: true, progress: true },
        take: 5
      }),
      prisma.aIConversation.findFirst({
        where: { userId: session.user.id },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: { content: true, role: true }
          }
        }
      })
    ]);

    const userName = user?.firstName || user?.name?.split(' ')[0] || 'Champion';
    const skillLevel = user?.skillLevel || 'INTERMEDIATE';
    const rating = user?.playerRating || '3.0';
    const goals = Array.isArray(user?.primaryGoals) ? user.primaryGoals as string[] : [];
    const challenges = Array.isArray(user?.biggestChallenges) ? user.biggestChallenges as string[] : [];

    // ============================================
    // ANALYZE USER MESSAGE
    // ============================================
    
    // Detect emotional state
    const emotionAnalysis = detectEmotion(messageText);
    
    // Extract technical topics
    const detectedTechniques = extractTechniquesFromText(messageText);
    
    // Match relevant drills
    const relevantDrills = matchDrillsToTechniques(detectedTechniques, skillLevel, 5);
    
    // Get recent conversation topics
    const recentTopics = conversation?.messages
      ?.filter((m: any) => m.role === 'user')
      ?.slice(0, 3)
      ?.flatMap((m: any) => extractTechniquesFromText(m.content)) || [];

    // ============================================
    // BUILD SYSTEM PROMPT
    // ============================================
    
    const systemPrompt = buildKaiSystemPrompt(
      userName,
      skillLevel,
      rating,
      goals,
      challenges,
      relevantDrills,
      userGoals.map(g => ({ title: g.title, progress: g.progress })),
      [...new Set(recentTopics)]
    );

    // ============================================
    // BUILD CONVERSATION CONTEXT
    // ============================================
    
    const conversationMessages = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-9).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // ============================================
    // STREAM RESPONSE FROM LLM
    // ============================================
    
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: conversationMessages,
        stream: true,
        max_tokens: 800,
        temperature: 0.9,
        presence_penalty: 0.6,
        frequency_penalty: 0.5
      })
    });

    if (!response.ok) {
      console.error('[Coach Kai] LLM API error:', response.status);
      return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    let fullResponse = '';
    
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  if (content) {
                    fullResponse += content;
                    
                    // Stream text content (stop at action cards marker)
                    if (!fullResponse.includes('[ACTION_CARDS]')) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content })}\n\n`));
                    }
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
          
          // Parse complete response for action cards
          const parsed = parseKaiResponse(fullResponse);
          
          // Send action cards
          if (parsed.actionCards.length > 0) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'actions', 
              cards: parsed.actionCards 
            })}\n\n`));
          }
          
          // Send completion with metadata
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'complete',
            emotion: emotionAnalysis.primaryEmotion,
            techniques: detectedTechniques,
            needsSupport: emotionAnalysis.needsSupport
          })}\n\n`));
          
          // Save to database (async, don't block response)
          saveConversation(session.user.id, messageText, parsed.message).catch(console.error);
          
        } catch (error) {
          console.error('[Coach Kai] Stream error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error: any) {
    console.error('[Coach Kai] Error:', error.message);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

// Save conversation to database
async function saveConversation(userId: string, userMessage: string, assistantMessage: string) {
  try {
    let conversation = await prisma.aIConversation.findFirst({
      where: { userId }
    });

    if (!conversation) {
      conversation = await prisma.aIConversation.create({
        data: {
          userId,
          title: 'Coach Kai Conversation',
          messageCount: 0
        }
      });
    }

    await prisma.aIMessage.createMany({
      data: [
        { conversationId: conversation.id, userId, role: 'user', content: userMessage },
        { conversationId: conversation.id, userId, role: 'assistant', content: assistantMessage }
      ]
    });

    await prisma.aIConversation.update({
      where: { id: conversation.id },
      data: { messageCount: { increment: 2 }, updatedAt: new Date() }
    });
  } catch (e) {
    console.error('[Coach Kai] Failed to save conversation:', e);
  }
}
