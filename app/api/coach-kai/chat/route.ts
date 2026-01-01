export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildEnhancedKaiSystemPrompt, FUNCTION_TOOLS, PICKLEBALL_KNOWLEDGE_BASE } from "@/lib/coach-kai/enhanced-system-prompt";
import { detectIntent, matchDeficiency, processFunctionCall, FunctionResult } from "@/lib/coach-kai/function-handler";

/**
 * Enhanced Coach Kai - Emotionally Intelligent AI Coach with Function Calling
 * 
 * Features:
 * - GPT-4o level intelligence with custom system prompt
 * - Function calling for calendar, messaging, drills, analysis
 * - Pickleball deficiency knowledge base
 * - Emotional intelligence and intent detection
 * - Streaming responses with action suggestions
 */

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ABACUSAI_API_KEY) {
      console.error('[Coach Kai] ABACUSAI_API_KEY not configured');
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, hasMedia } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1];
    const messageText = lastUserMessage?.content || '';

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
    
    const detectedIntent = detectIntent(messageText);
    const matchedDeficiency = matchDeficiency(messageText);
    
    // Build conversation history context
    const recentHistory = conversation?.messages
      ?.slice(0, 3)
      ?.map((m: any) => `${m.role}: ${m.content?.substring(0, 100)}`)
      ?.join('\n') || '';

    // ============================================
    // BUILD ENHANCED SYSTEM PROMPT
    // ============================================
    
    const systemPrompt = buildEnhancedKaiSystemPrompt(
      userName,
      skillLevel,
      rating,
      goals,
      challenges,
      recentHistory
    );

    // Add context hints based on detected intent
    let contextHint = '';
    if (detectedIntent === 'scheduling') {
      contextHint = '\n\n[SYSTEM HINT: User appears to be discussing scheduling. Consider using add_to_calendar function.]';
    } else if (detectedIntent === 'social') {
      contextHint = '\n\n[SYSTEM HINT: User wants to connect with someone. Ask for confirmation before using send_message function.]';
    } else if (detectedIntent === 'technique' && matchedDeficiency) {
      contextHint = `\n\n[SYSTEM HINT: User has ${matchedDeficiency.category} issue. Recommend: "${matchedDeficiency.drill}" - ${matchedDeficiency.drillDescription}]`;
    } else if (detectedIntent === 'analysis' || hasMedia) {
      contextHint = '\n\n[SYSTEM HINT: User is discussing video/image analysis. Use analyze_technique function if appropriate.]';
    }

    // ============================================
    // BUILD CONVERSATION FOR LLM
    // ============================================
    
    const conversationMessages = [
      { role: "system", content: systemPrompt + contextHint },
      ...messages.slice(-9).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // ============================================
    // STREAM RESPONSE FROM LLM WITH FUNCTION CALLING
    // ============================================
    
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',  // Fixed: was 'gpt-4.1-mini' (invalid model)
        messages: conversationMessages,
        stream: true,
        max_tokens: 1000,
        temperature: 0.85,
        presence_penalty: 0.5,
        frequency_penalty: 0.4,
        tools: FUNCTION_TOOLS,
        tool_choice: 'auto'
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
    let toolCalls: any[] = [];
    let currentToolCall: any = null;
    
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
                  const delta = parsed.choices?.[0]?.delta;
                  
                  // Handle text content
                  if (delta?.content) {
                    fullResponse += delta.content;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                      type: 'text', 
                      content: delta.content 
                    })}\n\n`));
                  }
                  
                  // Handle tool calls
                  if (delta?.tool_calls) {
                    for (const tc of delta.tool_calls) {
                      if (tc.index !== undefined) {
                        if (!toolCalls[tc.index]) {
                          toolCalls[tc.index] = { id: tc.id, function: { name: '', arguments: '' } };
                        }
                        if (tc.function?.name) {
                          toolCalls[tc.index].function.name = tc.function.name;
                        }
                        if (tc.function?.arguments) {
                          toolCalls[tc.index].function.arguments += tc.function.arguments;
                        }
                      }
                    }
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
          
          // Process completed tool calls into action suggestions
          const actionSuggestions: FunctionResult[] = [];
          
          for (const tc of toolCalls) {
            if (tc?.function?.name && tc?.function?.arguments) {
              try {
                const args = JSON.parse(tc.function.arguments);
                const result = processFunctionCall({
                  name: tc.function.name,
                  arguments: args
                });
                actionSuggestions.push(result);
              } catch (e) {
                console.error('[Coach Kai] Failed to parse tool call:', e);
              }
            }
          }
          
          // Also detect actions from text if no tool calls
          if (actionSuggestions.length === 0 && matchedDeficiency) {
            actionSuggestions.push({
              type: 'resource',
              action: 'Start Drill',
              data: {
                type: 'drill',
                title: matchedDeficiency.drill,
                details: matchedDeficiency.drillDescription,
                category: matchedDeficiency.category,
                whyItHelps: matchedDeficiency.whyItHelps
              },
              requiresConfirmation: true,
              confirmationPrompt: `Start the "${matchedDeficiency.drill}" to improve your ${matchedDeficiency.category.toLowerCase()}?`
            });
          }
          
          // Send action suggestions
          if (actionSuggestions.length > 0) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'actions', 
              suggestions: actionSuggestions 
            })}\n\n`));
          }
          
          // Send completion with metadata
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'complete',
            intent: detectedIntent,
            deficiency: matchedDeficiency?.category || null
          })}\n\n`));
          
          // Save to database (async, don't block response)
          saveConversation(session.user.id, messageText, fullResponse).catch(console.error);
          
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
