
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * COMPREHENSIVE AI COACHING SYSTEM
 * 
 * This system provides:
 * - Truly intelligent, context-aware conversations
 * - Sports psychology and mental game coaching
 * - Emotional intelligence and support
 * - Multi-topic conversation capability
 * - Persistent conversation memory across sessions
 * - Interest tracking and personalized follow-ups
 */

export async function POST(req: NextRequest) {
  try {
    // Check for API key first
    if (!process.env.ABACUSAI_API_KEY) {
      console.error('[Coach Kai] CRITICAL: ABACUSAI_API_KEY is not configured');
      return NextResponse.json(
        { error: "AI service not configured. Please contact support." },
        { status: 503 }
      );
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
    
    // Get or create conversation for this user
    let userConversation;
    try {
      userConversation = await prisma.aIConversation.findFirst({
        where: { userId: session.user.id }
      });

      if (!userConversation) {
        userConversation = await prisma.aIConversation.create({
          data: {
            userId: session.user.id,
            title: 'Coach Kai Conversation',
            messageCount: 0
          }
        });
      }

      // Save user message to database
      await prisma.aIMessage.create({
        data: {
          conversationId: userConversation.id,
          userId: session.user.id,
          role: 'user',
          content: lastUserMessage.content,
        }
      });
    } catch (dbError: any) {
      console.error('[Coach Kai] Database error saving user message:', dbError.message);
      // Continue anyway - we can still respond even if saving failed
    }

    // ============================================
    // LOAD FULL USER CONTEXT
    // ============================================
    
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          matches: {
            orderBy: { date: 'desc' },
            take: 10
          },
          mentalSessions: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });
    } catch (dbError: any) {
      console.error('[Coach Kai] Database error fetching user:', dbError.message);
      // Continue with null user - we'll use defaults
      user = null;
    }

    // ============================================
    // NOTE: Frontend already sends conversation history
    // ============================================
    // The frontend sends the last 9 messages + new message (10 total).
    // We don't need to load from database here as it would cause duplication.
    // The database is still used for persistence and history viewing.

    // ============================================
    // DETECT USER EMOTIONAL STATE & NEEDS
    // ============================================
    
    const messageText = lastUserMessage.content.toLowerCase();
    
    // Emotional state detection
    const isStressed = /stress|anxiety|anxious|worried|nervous|scared|afraid/i.test(messageText);
    const isFrustrated = /frustrat|annoying|annoyed|angry|mad|upset/i.test(messageText);
    const isSad = /sad|depress|down|bad day|feel bad|feeling low|unmotivated/i.test(messageText);
    const isHappy = /happy|excited|great|awesome|amazing|fantastic|pumped/i.test(messageText);
    const needsMotivation = /unmotivat|lazy|don't want|no energy|tired|exhausted/i.test(messageText);
    const preBigEvent = /big match|tournament|competition|important game|nervous about|before.*match/i.test(messageText);
    
    // Topic detection
    const mentalGameTopic = /mental|psychology|mindset|confidence|focus|concentration|visualization/i.test(messageText);
    const techniqueTopic = /technique|form|shot|serve|volley|dink|drive|strategy|tactic/i.test(messageText);
    const fitnessTopicDetected = /fitness|workout|exercise|conditioning|training|strength/i.test(messageText);
    const injuryTopic = /injury|hurt|pain|sore|recover/i.test(messageText);
    const equipmentTopic = /paddle|shoes|gear|equipment/i.test(messageText);
    const partnerTopic = /partner|doubles|teammate/i.test(messageText);

    // ============================================
    // SMART PARTNER RECOMMENDATIONS
    // ============================================
    
    let partnersContext = '';
    const needsExpertHelp = /coach|instructor|lesson|private.*lesson|work.*with.*pro|expert.*help/i.test(messageText);
    const needsPlayPartner = /looking.*partner|need.*partner|find.*partner|play.*with/i.test(messageText);
    const needsEquipment = /buy.*paddle|best.*paddle|recommend.*paddle|gear|equipment/i.test(messageText);
    
    if (needsExpertHelp || needsPlayPartner || needsEquipment) {
      try {
        const partners = await prisma.partner.findMany({
          where: {
            status: 'ACTIVE',
            isAvailable: true,
          },
          orderBy: [
            { featured: 'desc' },
            { rating: 'desc' }
          ],
          take: 3,
        });

        if (partners.length > 0) {
          partnersContext = `\n\n🎯 AVAILABLE RESOURCES:
${partners.map(p => `• ${p.name} - ${p.partnerType?.replace(/_/g, ' ').toLowerCase()} (⭐ ${p.rating}/5.0)
  Specializes in: ${Array.isArray(p.expertise) ? p.expertise.slice(0, 3).join(', ') : 'various areas'}`).join('\n\n')}

💡 When appropriate, mention 1-2 specific resources by name and let them know they can explore all options at /partners.`;
        }
      } catch (dbError: any) {
        console.error('[Coach Kai] Database error fetching partners:', dbError.message);
        // Continue without partner recommendations
      }
    }

    // ============================================
    // BUILD COMPREHENSIVE USER PROFILE
    // ============================================
    
    const userGoals = user?.primaryGoals ? (Array.isArray(user.primaryGoals) ? user.primaryGoals.join(', ') : JSON.stringify(user.primaryGoals)) : 'improve overall game';
    const userChallenges = user?.biggestChallenges ? (Array.isArray(user.biggestChallenges) ? user.biggestChallenges.join(', ') : JSON.stringify(user.biggestChallenges)) : 'developing consistency';
    
    // Calculate total losses
    const totalLosses = (user?.totalMatches || 0) - (user?.totalWins || 0);
    
    // Recent performance context
    const recentMatches = user?.matches?.slice(0, 5) || [];
    const recentWins = recentMatches.filter((m: any) => m.result === 'WIN').length;
    const recentLosses = recentMatches.filter((m: any) => m.result === 'LOSS').length;
    
    // Calculate current streak from recent matches
    let currentStreak = 0;
    if (recentMatches.length > 0) {
      const firstResult = recentMatches[0].result;
      for (const match of recentMatches) {
        if (match.result === firstResult) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    
    // Mental training context
    const recentMentalSessions = user?.mentalSessions || [];
    const recentTopics = recentMentalSessions.map((s: any) => s.primaryTopic).slice(0, 3);

    // ============================================
    // GET RECENT RESPONSES TO AVOID REPETITION
    // ============================================
    
    // Get last 3 assistant responses from the messages array to avoid repetition
    const recentAssistantResponses = messages
      .filter((msg: any) => msg.role === 'assistant')
      .slice(-3)
      .map((msg: any) => msg.content)
      .join(' | ');

    // ============================================
    // COMPREHENSIVE SYSTEM PROMPT
    // ============================================
    
    const systemPrompt = `You are Coach Kai, ${user?.firstName || user?.name || 'Champion'}'s AI pickleball coach and mental training companion.

🎯 PLAYER PROFILE:
• ${user?.skillLevel || 'Beginner'} level (${user?.playerRating || '2.0'} rating)
• Goals: ${userGoals}
• Working on: ${userChallenges}
• Recent matches: ${recentWins}W-${recentLosses}L

💭 CURRENT STATE:
${isStressed ? '• User is stressed/anxious - be calming and supportive' : ''}
${isFrustrated ? '• User is frustrated - acknowledge feelings, provide perspective' : ''}
${isSad ? '• User is having a tough day - be extra empathetic' : ''}
${isHappy ? '• User is in good spirits - celebrate with them!' : ''}
${needsMotivation ? '• User needs motivation - inspire and energize' : ''}

${partnersContext}

🎤 VOICE MODE ACTIVE:
• You're having a VOICE conversation (Push-to-Talk/Walkie-Talkie style)
• When they ask "can you hear me?", confirm you CAN hear them: "Yes, I hear you loud and clear!"
• Never say you can't hear them - this is a live voice conversation
• Respond naturally as if you're chatting in person on the court

🎭 YOUR STYLE:
• KEEP RESPONSES SHORT: Maximum 2-3 sentences per response
• Be conversational, warm, and authentic like a trusted friend
• Use their name naturally (${user?.firstName || user?.name || 'Champion'})
• Give specific, actionable advice
• Use 1-2 emojis naturally
• Ask ONE follow-up question when helpful
• Remember our conversation history

🚫 CRITICAL ANTI-REPETITION RULES:
1. NEVER repeat or echo back what the user just said
2. NEVER start your response with their exact words
3. Each response must be UNIQUE and DIFFERENT from previous ones
4. VARY your greetings every time - use different openings like "What's up", "How's it going", "Ready to", "Let's", etc.
5. If they greet you (hi, hello, hey), respond with a COMPLETELY DIFFERENT greeting each time
6. NEVER use the same emoji combinations twice in a row
7. Change your sentence structure and phrasing with each response
${recentAssistantResponses ? `8. Your recent responses were: "${recentAssistantResponses}" - AVOID these words, phrases, and patterns entirely. Say something FRESH and NEW!` : ''}

⚡ CRITICAL RULE: NO LONG RESPONSES! Stay concise, punchy, and conversational. Think of this as a quick chat between points, not a coaching lecture.

Respond to their message with care, keep it brief, and make it FRESH! 🏓`;

    // ============================================
    // BUILD CONVERSATION CONTEXT FROM FRONTEND
    // ============================================
    // The frontend already sends the full conversation context (last 9 + new = 10 messages).
    // We just need to add the system prompt and use the messages from the request.
    
    const conversationMessages = [
      { role: "system", content: systemPrompt },
      // Use messages from frontend request (already includes full context)
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // ============================================
    // CALL AI WITH MODEL FALLBACK & TIMEOUT
    // ============================================
    
    const { callAbacusAI } = await import('@/lib/ai/abacus-client');
    
    const aiResponse = await callAbacusAI({
      messages: conversationMessages,
      max_tokens: 120, // ENFORCED SHORT: Maximum 120 tokens for very concise responses
      temperature: 1.0, // MAXIMUM creativity for maximum variety
      presence_penalty: 0.9, // MAXIMUM encouragement for diverse topics
      frequency_penalty: 1.2, // BEYOND MAXIMUM - aggressively reduce repetitive phrases
      top_p: 0.95, // High nucleus sampling for maximum variety
      stream: false,
      timeoutMs: 60000, // 60 second timeout
    }, {
      userId: session.user.id,
      enableFallback: true, // Enable automatic model fallback
    });

    // Check if AI call was successful
    if (!aiResponse.success || !aiResponse.data) {
      console.error('[Coach Kai] AI call failed:', {
        error: aiResponse.error,
        attemptedModels: aiResponse.attemptedModels,
        userId: session.user.id
      });
      
      return NextResponse.json(
        { error: aiResponse.error || "Coach Kai is temporarily unavailable. Please try again in a moment." },
        { status: 503 }
      );
    }

    console.log(`[Coach Kai] ✅ Response generated with model: ${aiResponse.model}`);
    
    const data = aiResponse.data;
    let assistantMessage = data.choices?.[0]?.message?.content || "I'm having trouble connecting right now. Please try again!";

    // ============================================
    // REPETITION DETECTION & AUTO-REGENERATION
    // ============================================
    // Check if the response is too similar to recent responses
    if (recentAssistantResponses) {
      const recentResponses = recentAssistantResponses.toLowerCase();
      const currentResponse = assistantMessage.toLowerCase();
      
      // Check for significant overlap (more than 50% of words match)
      const currentWordsArray = currentResponse.split(/\s+/).filter((w: string) => w.length > 3);
      const currentWords = new Set<string>(currentWordsArray);
      const recentWords = recentResponses.split(/\s+/).filter((w: string) => w.length > 3);
      
      let matchCount = 0;
      Array.from(currentWords).forEach((word: string) => {
        if (recentWords.includes(word)) matchCount++;
      });
      
      const overlapPercentage = currentWords.size > 0 ? (matchCount / currentWords.size) : 0;
      
      if (overlapPercentage > 0.5) {
        console.log('⚠️ High repetition detected, regenerating response...');
        
        // Add a strong anti-repetition instruction and regenerate
        const regenerateMessages = [
          ...conversationMessages,
          {
            role: 'system',
            content: 'CRITICAL: Your last response was repetitive. Generate a COMPLETELY DIFFERENT response with NEW words, NEW phrases, and a FRESH perspective. Do NOT use the same greeting, structure, or phrases.'
          }
        ];
        
        try {
          const regenerateAIResponse = await callAbacusAI({
            messages: regenerateMessages,
            max_tokens: 120,
            temperature: 1.2, // EXTRA HIGH creativity for regeneration
            presence_penalty: 1.0, // MAXIMUM for regeneration
            frequency_penalty: 1.5, // ULTRA-HIGH for regeneration - force new words
            top_p: 0.98, // Very high nucleus sampling for regeneration
            stream: false,
            timeoutMs: 60000,
          }, {
            userId: session.user.id,
            enableFallback: true,
          });
          
          if (regenerateAIResponse.success && regenerateAIResponse.data) {
            const regenerateData = regenerateAIResponse.data;
            assistantMessage = regenerateData.choices?.[0]?.message?.content || assistantMessage;
            console.log('✅ Response regenerated successfully with model:', regenerateAIResponse.model);
          } else {
            console.log('⚠️ Regeneration failed, using original response');
          }
        } catch (regenerateError) {
          console.log('⚠️ Regeneration error, using original response:', regenerateError);
        }
      }
    }

    // ============================================
    // SAVE RESPONSE & UPDATE CONVERSATION
    // ============================================
    
    try {
      if (userConversation?.id) {
        await prisma.aIMessage.create({
          data: {
            conversationId: userConversation.id,
            userId: session.user.id,
            role: 'assistant',
            content: assistantMessage,
          }
        });

        await prisma.aIConversation.update({
          where: { id: userConversation.id },
          data: {
            messageCount: { increment: 2 },
            updatedAt: new Date()
          }
        });
      }
    } catch (dbError: any) {
      console.error('[Coach Kai] Database error saving assistant message:', dbError.message);
      // Continue anyway - we can still return the response even if saving failed
    }

    // ============================================
    // DETECT & LOG INTERESTS FOR FUTURE PERSONALIZATION
    // ============================================
    
    const detectedInterests = [];
    if (mentalGameTopic) detectedInterests.push('mental_game');
    if (techniqueTopic) detectedInterests.push('technique');
    if (fitnessTopicDetected) detectedInterests.push('fitness');
    if (equipmentTopic) detectedInterests.push('equipment');
    if (partnerTopic) detectedInterests.push('partner_play');
    
    // Log conversation metadata for analytics
    console.log('[Coach Kai] Conversation:', {
      userId: session.user.id,
      messageLength: lastUserMessage.content.length,
      emotionalState: { isStressed, isFrustrated, isSad, needsMotivation },
      topics: detectedInterests,
      hasPartnerRecommendations: !!partnersContext,
    });

    return NextResponse.json({ 
      message: assistantMessage,
      metadata: {
        interests: detectedInterests,
        emotionalSupport: isStressed || isFrustrated || isSad || needsMotivation
      }
    });
    
  } catch (error: any) {
    console.error("[Coach Kai] Unexpected error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
