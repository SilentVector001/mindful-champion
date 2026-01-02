// @ts-nocheck
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildEnhancedKaiSystemPrompt, FUNCTION_TOOLS, PICKLEBALL_KNOWLEDGE_BASE, GoalContext } from "@/lib/coach-kai/enhanced-system-prompt";
import { detectIntent, matchDeficiency, processFunctionCall, FunctionResult } from "@/lib/coach-kai/function-handler";
import { getUserGoalContext, createGoalFromChat, updateGoalProgress, completeMilestone, getCelebrationMessage } from "@/lib/coach-kai/goal-functions";

/**
 * Enhanced Coach Kai - Emotionally Intelligent AI Coach with Function Calling
 * 
 * Features:
 * - GPT-4o level intelligence with custom system prompt
 * - Function calling for calendar, messaging, drills, analysis
 * - DEEP GOALS INTEGRATION - create, update, celebrate goals via chat
 * - Pickleball deficiency knowledge base
 * - Emotional intelligence and intent detection
 * - Streaming responses with action suggestions
 */

/**
 * ULTRA-AGGRESSIVE sanitization to remove ALL technical syntax
 * Ensures ONLY natural language reaches users
 * Preserves word boundaries to prevent "wordsmashing"
 */
function sanitizeResponse(content: string): string {
  if (!content) return '';
  
  let sanitized = content;
  
  // STEP 1: Check if this looks like pure XML garbage - return fallback
  if (sanitized.trim().startsWith('<tool_call') || sanitized.trim().startsWith('<function_call')) {
    return "I'd love to help you with that! What specific aspect of your pickleball game would you like to work on? 🎾";
  }
  
  // STEP 2: Remove entire XML blocks (greedy match)
  sanitized = sanitized.replace(/<tool_call_id>[^<]*<\/tool_call_id>/gi, '');
  sanitized = sanitized.replace(/<function_call_name>[^<]*<\/function_call_name>/gi, '');
  sanitized = sanitized.replace(/<function_call_arguments>[^<]*<\/function_call_arguments>/gi, '');
  sanitized = sanitized.replace(/<[a-zA-Z_][a-zA-Z0-9_-]*[^>]*>[\s\S]*?<\/[a-zA-Z_][a-zA-Z0-9_-]*>/gi, '');
  
  // STEP 3: Remove any remaining tags
  sanitized = sanitized.replace(/<\/?[a-zA-Z_][a-zA-Z0-9_:-]*[^>]*>/g, '');
  
  // STEP 4: Remove code blocks and JSON
  sanitized = sanitized.replace(/```[\s\S]*?```/g, '');
  sanitized = sanitized.replace(/`[^`]+`/g, '');
  sanitized = sanitized.replace(/\{[^{}]*"(function|name|arguments|tool|call_id)"[^{}]*\}/gi, '');
  
  // STEP 5: Remove technical identifiers
  sanitized = sanitized.replace(/call_[a-zA-Z0-9]+/g, '');
  sanitized = sanitized.replace(/\b(goalId|skillArea|targetDays|milestoneId|progressIncrement):\s*["']?[^,\n}]+["']?/gi, '');
  sanitized = sanitized.replace(/\[(SYSTEM|DEBUG|FUNCTION|TOOL|HINT)[^\]]*\]/gi, '');
  
  // STEP 6: Fix word boundaries - add spaces before capitals in middle of words
  sanitized = sanitized.replace(/([a-z])([A-Z])/g, '$1 $2');
  sanitized = sanitized.replace(/([a-zA-Z]),([a-zA-Z])/g, '$1, $2'); // comma spacing
  sanitized = sanitized.replace(/([a-zA-Z])—([a-zA-Z])/g, '$1 — $2'); // em-dash spacing
  
  // STEP 7: Clean whitespace
  sanitized = sanitized.replace(/[ \t]{2,}/g, ' ');
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
  
  // If result is empty or just whitespace, return fallback
  if (!sanitized.trim() || sanitized.trim().length < 10) {
    return "I'd love to help you with that! What would you like to work on? 🎾";
  }
  
  return sanitized.trim();
}

/**
 * Check if content contains XML/function call syntax - MORE PATTERNS
 */
function containsXMLSyntax(content: string): boolean {
  if (!content) return false;
  const xmlPatterns = [
    /<tool_call/i,
    /<function_call/i,
    /<invoke/i,
    /</i,
    /call_[a-zA-Z0-9]{15,}/,
    /<[a-z_]+>[^<]*<\/[a-z_]+>/i,
    /"function":/i,
    /"tool":/i,
    /"arguments":/i
  ];
  return xmlPatterns.some(p => p.test(content));
}

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

    const { messages, hasMedia, goalContext: clientGoalContext } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1];
    const messageText = lastUserMessage?.content || '';

    // ============================================
    // LOAD USER DATA AND GOAL CONTEXT
    // ============================================
    
    const [user, goalContext, conversation] = await Promise.all([
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
      getUserGoalContext(session.user.id),
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
    
    // Check if user is confirming a previous suggestion (e.g., "yes", "sounds good", "let's do it")
    const isConfirmation = /^(yes|yeah|yep|sure|ok|okay|sounds good|let's do it|do it|go ahead|please|absolutely|definitely|perfect|great)\b/i.test(messageText.trim());
    
    // If confirming, look for pending goal/drill suggestion in conversation
    let pendingAction: { type: string; title: string; skillArea?: string } | null = null;
    if (isConfirmation && messages.length >= 2) {
      const prevAssistantMsg = messages.slice(0, -1).reverse().find((m: any) => m.role === 'assistant');
      if (prevAssistantMsg?.content) {
        const content = prevAssistantMsg.content.toLowerCase();
        // Extract skill area from previous message
        const skillMatch = content.match(/(?:improve|work on|practice|focus on|master)\s+(?:your\s+)?(\w+(?:\s+\w+)?)/i);
        const goalMatch = content.match(/(?:goal|plan)[:\s]+["']?([^"'\n]+)["']?/i);
        
        if (content.includes('goal') || content.includes('plan') || content.includes('milestone')) {
          pendingAction = {
            type: 'goal',
            title: goalMatch?.[1] || skillMatch?.[1] || 'Improve My Game',
            skillArea: skillMatch?.[1]?.toLowerCase() || 'backhand'
          };
        } else if (content.includes('drill') || content.includes('exercise')) {
          pendingAction = {
            type: 'drill',
            title: skillMatch?.[1] || 'Practice Drill',
            skillArea: skillMatch?.[1]?.toLowerCase()
          };
        }
      }
    }
    
    // Build conversation history context
    const recentHistory = conversation?.messages
      ?.slice(0, 3)
      ?.map((m: any) => `${m.role}: ${m.content?.substring(0, 100)}`)
      ?.join('\n') || '';

    // ============================================
    // BUILD ENHANCED SYSTEM PROMPT WITH GOAL CONTEXT
    // ============================================
    
    // Transform goal context for system prompt
    const formattedGoalContext: GoalContext = {
      activeGoals: goalContext.activeGoals?.map(g => ({
        id: g.id,
        title: g.title,
        progress: g.progress || 0,
        category: g.category,
        milestones: g.milestones?.map(m => ({
          id: m.id,
          title: m.title,
          status: m.status || 'PENDING'
        }))
      })) || [],
      recentlyCompleted: goalContext.recentlyCompleted || [],
      totalProgress: goalContext.totalProgress || 0,
      streak: goalContext.streak || 0,
      nextMilestone: goalContext.nextMilestone
    };
    
    const systemPrompt = buildEnhancedKaiSystemPrompt(
      userName,
      skillLevel,
      rating,
      goals,
      challenges,
      recentHistory,
      formattedGoalContext as any
    );

    // Add context hints based on detected intent
    let contextHint = '';
    if (detectedIntent === 'goal_create') {
      contextHint = '\n\n[SYSTEM HINT: User wants to set a goal. USE the create_goal function! Extract the skill area they want to improve and create an actionable goal title. Be enthusiastic!]';
    } else if (detectedIntent === 'goal_progress') {
      // Find relevant active goal to update
      const relevantGoal = formattedGoalContext.activeGoals?.[0];
      if (relevantGoal) {
        contextHint = `\n\n[SYSTEM HINT: User is reporting progress. USE update_goal_progress function with goalId: "${relevantGoal.id}" for their "${relevantGoal.title}" goal. Celebrate their dedication!]`;
      } else {
        contextHint = '\n\n[SYSTEM HINT: User wants to log progress but has no active goals. Encourage them to create one first using create_goal function!]';
      }
    } else if (detectedIntent === 'scheduling') {
      contextHint = '\n\n[SYSTEM HINT: User appears to be discussing scheduling. Consider using add_to_calendar function.]';
    } else if (detectedIntent === 'social') {
      contextHint = '\n\n[SYSTEM HINT: User wants to connect with someone. Ask for confirmation before using send_message function.]';
    } else if (detectedIntent === 'technique' && matchedDeficiency) {
      contextHint = `\n\n[SYSTEM HINT: User has ${matchedDeficiency.category} issue. Recommend: "${matchedDeficiency.drill}" - ${matchedDeficiency.drillDescription}]`;
    } else if (detectedIntent === 'analysis' || hasMedia) {
      contextHint = '\n\n[SYSTEM HINT: User is discussing video/image analysis. Use analyze_technique function if appropriate.]';
    }

    // ============================================
    // HANDLE CONFIRMATION - AUTO-EXECUTE GOAL CREATION
    // ============================================
    
    let createdGoal: any = null;
    if (isConfirmation && pendingAction?.type === 'goal') {
      try {
        // Directly create the goal when user confirms
        const goalResult = await createGoalFromChat(
          session.user.id,
          `Improve My ${pendingAction.skillArea?.charAt(0).toUpperCase()}${pendingAction.skillArea?.slice(1) || 'Game'}`,
          pendingAction.skillArea || 'backhand',
          30
        );
        if (goalResult.success) {
          createdGoal = goalResult.goal;
          console.log('[Coach Kai] Goal created on confirmation:', createdGoal.title);
        }
      } catch (e) {
        console.error('[Coach Kai] Failed to create goal on confirmation:', e);
      }
    }

    // ============================================
    // BUILD CONVERSATION FOR LLM
    // ============================================
    
    // Add context about created goal if applicable
    let goalCreationContext = '';
    if (createdGoal) {
      goalCreationContext = `\n\n[IMPORTANT: You just created a goal for the user! Goal: "${createdGoal.title}" with ${createdGoal.Milestone?.length || 4} milestones. Celebrate this and explain what milestones were added. Be enthusiastic! DO NOT use function calls - the goal is already created.]`;
    }
    
    const conversationMessages = [
      { role: "system", content: systemPrompt + contextHint + goalCreationContext },
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

    // Create streaming response with BUFFERED SANITIZATION
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    let fullResponse = '';
    let toolCalls: any[] = [];
    let contentBuffer = ''; // Buffer to catch XML spans across chunks
    const BUFFER_SIZE = 100; // Keep last 100 chars to detect split XML
    
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
                  
                  // Handle text content with BUFFERED AGGRESSIVE sanitization
                  if (delta?.content) {
                    fullResponse += delta.content;
                    contentBuffer += delta.content;
                    
                    // Check buffered content for XML patterns
                    if (containsXMLSyntax(contentBuffer)) {
                      console.log('[Coach Kai] Detected XML in buffer, skipping chunk');
                      // Don't send this chunk - it contains XML
                      // Keep buffering to catch the complete XML block
                      continue;
                    }
                    
                    // If buffer is clean and large enough, send it
                    if (contentBuffer.length >= 15) { // Min 15 chars before sending
                      const sanitizedContent = sanitizeResponse(contentBuffer);
                      
                      // Double-check sanitized output doesn't contain XML residue
                      if (!containsXMLSyntax(sanitizedContent) && sanitizedContent.trim().length > 0) {
                        // Only send words, not fragments
                        const words = sanitizedContent.trim().split(/\s+/);
                        if (words.length > 0 && words[0].length > 1) {
                          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                            type: 'text', 
                            content: sanitizedContent + ' '
                          })}\n\n`));
                        }
                      }
                      
                      // Reset buffer but keep last BUFFER_SIZE chars for continuity
                      contentBuffer = contentBuffer.slice(-BUFFER_SIZE);
                    }
                  }
                  
                  // Handle tool calls (proper function calling from LLM)
                  if (delta?.tool_calls) {
                    console.log('[Coach Kai] Tool call detected:', delta.tool_calls);
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
          
          // Flush remaining buffer at the end
          if (contentBuffer.trim().length > 0) {
            const sanitizedContent = sanitizeResponse(contentBuffer);
            if (!containsXMLSyntax(sanitizedContent) && sanitizedContent.trim().length > 0) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'text', 
                content: sanitizedContent 
              })}\n\n`));
            }
          }
          
          // Process completed tool calls - EXECUTE goal functions directly
          const actionSuggestions: FunctionResult[] = [];
          let goalCreatedDuringStream: any = null;
          let progressUpdated: any = null;
          let milestoneCompleted: any = null;
          
          for (const tc of toolCalls) {
            if (tc?.function?.name && tc?.function?.arguments) {
              try {
                const args = JSON.parse(tc.function.arguments);
                
                // EXECUTE goal functions directly instead of just suggesting
                if (tc.function.name === 'create_goal') {
                  console.log('[Coach Kai] Executing create_goal:', args);
                  const result = await createGoalFromChat(
                    session.user.id,
                    args.title || `Improve My ${args.skillArea}`,
                    args.skillArea,
                    args.targetDays || 30
                  );
                  if (result.success) {
                    goalCreatedDuringStream = result.goal;
                    console.log('[Coach Kai] Goal created:', result.goal?.title);
                    // Send success event
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                      type: 'goal_created',
                      goal: {
                        id: result.goal.id,
                        title: result.goal.title,
                        milestones: result.goal.Milestone?.length || 0
                      }
                    })}\n\n`));
                  }
                  continue; // Don't add to action suggestions since we executed it
                }
                
                if (tc.function.name === 'update_goal_progress' && args.goalId) {
                  console.log('[Coach Kai] Executing update_goal_progress:', args);
                  const result = await updateGoalProgress(
                    session.user.id,
                    args.goalId,
                    args.progressIncrement || 10
                  );
                  if (result.success) {
                    progressUpdated = result;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                      type: 'progress_updated',
                      goal: result.goal,
                      celebration: result.celebration
                    })}\n\n`));
                  }
                  continue;
                }
                
                if (tc.function.name === 'complete_milestone' && args.milestoneId) {
                  console.log('[Coach Kai] Executing complete_milestone:', args);
                  const result = await completeMilestone(
                    session.user.id,
                    args.milestoneId
                  );
                  if (result.success) {
                    milestoneCompleted = result;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                      type: 'milestone_completed',
                      milestone: result.milestone,
                      goalProgress: result.goalProgress,
                      celebration: result.celebration
                    })}\n\n`));
                  }
                  continue;
                }
                
                // For other functions, create action suggestions
                const result = processFunctionCall({
                  name: tc.function.name,
                  arguments: args
                });
                actionSuggestions.push(result);
              } catch (e) {
                console.error('[Coach Kai] Failed to parse/execute tool call:', e);
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
          
          // Send action suggestions as cards (frontend expects 'cards')
          if (actionSuggestions.length > 0) {
            // Convert FunctionResult format to ActionCard format
            const actionCards = actionSuggestions.map((s, idx) => ({
              id: `action-${Date.now()}-${idx}`,
              type: s.type === 'goal_create' ? 'goal' : s.type === 'resource' && s.data?.type === 'drill' ? 'drill' : 'drill',
              title: s.data?.title || s.action,
              description: s.confirmationPrompt || s.data?.details || '',
              icon: s.type === 'goal_create' ? 'target' : 'play',
              priority: 'high' as const,
              action: s.type === 'goal_create' ? 'create-goal' : s.type === 'resource' ? 'start-drill' : undefined,
              data: s.data,
              href: s.type === 'resource' && s.data?.type === 'drill' ? '/train/drills' : undefined
            }));
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'actions', 
              cards: actionCards 
            })}\n\n`));
          }
          
          // Send completion with metadata (include any created/updated goal)
          const finalGoal = goalCreatedDuringStream || createdGoal;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'complete',
            intent: detectedIntent,
            deficiency: matchedDeficiency?.category || null,
            goalCreated: finalGoal ? {
              id: finalGoal.id,
              title: finalGoal.title,
              milestones: finalGoal.Milestone?.length || 0
            } : null,
            progressUpdated: progressUpdated ? {
              goalId: progressUpdated.goal?.id,
              newProgress: progressUpdated.goal?.progress,
              celebration: progressUpdated.celebration
            } : null,
            milestoneCompleted: milestoneCompleted ? {
              milestoneId: milestoneCompleted.milestone?.id,
              goalProgress: milestoneCompleted.goalProgress,
              celebration: milestoneCompleted.celebration
            } : null
          })}\n\n`));
          
          // Save to database (async, don't block response) with sanitized response
          const sanitizedFullResponse = sanitizeResponse(fullResponse);
          saveConversation(session.user.id, messageText, sanitizedFullResponse).catch(console.error);
          
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
