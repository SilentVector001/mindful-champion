
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createReminderFromCoachKai, hasReminderIntent } from "@/lib/notifications/coach-kai-reminder-tool"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message, actionType, currentPage, emotion, conversationHistory } = await req.json()
    
    // Check if this is a reminder request - handle it first
    const isReminderRequest = hasReminderIntent(message);
    
    // Check if user is asking about coaching, partners, or help
    const needsPartnerRecommendation = message.toLowerCase().match(
      /coach|instructor|lesson|help|improve|teach|learn|mentor|guidance|trainer/
    );

    // Find or create AIConversation for this user
    let existingConversation = await prisma.aIConversation.findFirst({
      where: { 
        userId: session.user.id,
      },
      orderBy: { updatedAt: 'desc' }
    })

    // If no conversation exists or the last one is old (more than 24 hours), create a new one
    const shouldCreateNew = !existingConversation || 
      (new Date().getTime() - new Date(existingConversation.updatedAt).getTime()) > 24 * 60 * 60 * 1000

    let conversation: any;
    if (shouldCreateNew) {
      // Generate conversation title from the first message
      const titlePreview = message.length > 50 
        ? message.substring(0, 50) + '...' 
        : message
      
      conversation = await prisma.aIConversation.create({
        data: {
          userId: session.user.id,
          title: titlePreview,
          messageCount: 0,
        }
      })
    } else {
      conversation = existingConversation
    }

    // Save user message to AIMessage (for admin viewing)
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        userId: session.user.id,
        role: 'user',
        content: message,
      }
    })

    // Also save to ChatMessage for backwards compatibility
    await prisma.chatMessage.create({
      data: {
        userId: session.user.id,
        role: 'user',
        content: message,
      }
    })

    // Update conversation message count and timestamp
    await prisma.aIConversation.update({
      where: { id: conversation.id },
      data: {
        messageCount: { increment: 1 },
        updatedAt: new Date(),
      }
    })

    // Handle reminder creation if detected
    let reminderResult = null;
    if (isReminderRequest) {
      reminderResult = await createReminderFromCoachKai({
        userId: session.user.id,
        userMessage: message,
        conversationId: conversation.id,
      });
    }

    // Get user context for personalized coaching
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        matches: {
          orderBy: { date: 'desc' },
          take: 5
        },
        trainingPlans: {
          where: { 
            weekOf: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          }
        },
        mentalSessions: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      }
    })

    // Fetch wearable health insights for personalized coaching
    let healthInsights = null;
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/wearables/insights`, {
        headers: {
          'Cookie': req.headers.get('cookie') || '',
        },
      });
      if (response.ok) {
        healthInsights = await response.json();
      }
    } catch (error) {
      console.log('No wearable data available');
    }

    // Fetch available partners if recommendation might be needed
    let partnersData: Array<{
      id: string;
      name: string;
      type: any;
      rating: number;
      expertise: any;
      bio: string | undefined;
      services: Array<{ name: string; duration: number; price: number }>;
    }> = [];
    
    if (needsPartnerRecommendation) {
      const partners = await prisma.partner.findMany({
        where: {
          status: 'ACTIVE',
          isAvailable: true,
        },
        include: {
          services: {
            where: { isActive: true },
            take: 2, // Just get a couple services for context
          }
        },
        orderBy: [
          { featured: 'desc' },
          { rating: 'desc' }
        ],
        take: 5, // Top 5 partners
      });

      partnersData = partners.map(p => ({
        id: p.id,
        name: p.name,
        type: p.partnerType,
        rating: p.rating,
        expertise: p.expertise,
        bio: p.bio?.substring(0, 150),
        services: p.services.map((s: any) => ({
          name: s.name,
          duration: s.duration,
          price: s.price,
        }))
      }));
    }

    // Enhanced context-aware coaching prompt based on emotion and page
    const emotionalContext = getEmotionalContext(emotion, user)
    const pageContext = getPageContext(currentPage)
    
    let systemPrompt = `You are Coach Kai, an elite AI pickleball coach with years of virtual coaching experience. You communicate like a trusted mentor texting their athlete - warm, direct, and insightful. You're currently on the ${currentPage || 'dashboard'} with the player.

🎯 YOUR COACHING PHILOSOPHY:
• Give specific, actionable advice tailored to their exact skill level and goals
• Keep responses SHORT (2-4 sentences max) but packed with value
• Use 2-3 relevant emojis to add warmth and visual breaks
• When asked for drills, provide ONE complete drill with: name, setup, execution, reps, and what to focus on
• Make every word count - no fluff, just coaching gold

${emotionalContext}

${pageContext}

${partnersData.length > 0 ? `
AVAILABLE COACHING PARTNERS:
${partnersData.map(p => `
• ${p.name} (${p.type?.replace(/_/g, ' ')}) - ${p.rating}⭐
  ${Array.isArray(p.expertise) ? p.expertise.slice(0, 3).join(', ') : 'Various skills'}
  ${p.services.map(s => `${s.name} (${s.duration}min, $${s.price/100})`).join(', ')}
`).join('\n')}

When recommending coaches, be natural: "Check out ${partnersData[0]?.name} - they're amazing with [area]!" Keep it to 1-2 recommendations max.
` : ''}

Player Profile:
• ${user?.firstName || user?.name || 'Champion'} | Age: ${user?.ageRange || 'Not set'} | ${user?.location || 'Location not set'}
• ${user?.skillLevel || 'BEGINNER'} | ${user?.playerRating || '2.0'} rating
• Matches: ${user?.totalMatches || 0} (${user?.totalWins || 0} wins, ${user?.totalMatches ? ((user?.totalWins || 0) / user.totalMatches * 100).toFixed(0) : 0}% win rate)
• ${user?.currentStreak || 0} day streak | Playing ${user?.playingFrequency || 'regularly'}
• Goals: ${user?.primaryGoals ? JSON.parse(JSON.stringify(user.primaryGoals)).join(', ') : 'General improvement'}
• Challenges: ${user?.biggestChallenges ? JSON.parse(JSON.stringify(user.biggestChallenges)).join(', ') : 'Unknown'}

Recent Matches: ${user?.matches?.length ? user.matches.slice(0, 2).map(m => `${m.result} vs ${m.opponent} (${m.playerScore}-${m.opponentScore})`).join(', ') : 'No recent matches'}

${user?.ageRange ? `
🧠 AGE-APPROPRIATE COMMUNICATION:
${['18-24', '25-34'].includes(user.ageRange) ? `
• This player is younger (${user.ageRange}) - use contemporary language, emojis, and references
• Focus on performance, competitive edge, and progressive skill development
` : ['55-64', '65+'].includes(user.ageRange) ? `
• This player is mature (${user.ageRange}) - be respectful, clear, and patient
• Focus on injury prevention, technique over power, strategy over speed
` : `
• This player is mid-age (${user.ageRange}) - balance modern and traditional approaches
• Mix technical precision with practical application
`}
` : ''}

${conversationHistory && conversationHistory.length > 0 ? `
💭 CONVERSATION MEMORY:
Recent context: ${conversationHistory.slice(-4).map((msg: any) => `${msg.role === 'user' ? user?.firstName : 'Coach'}: ${msg.content.substring(0, 100)}`).join(' | ')}

CRITICAL: Build on previous topics! Reference what they asked before. Make it a real conversation!
` : ''}

🔔 REMINDER CAPABILITIES:
You can help users set reminders! When they ask to be reminded about something, acknowledge it naturally:
• "Got it! I'll remind you to practice serves tomorrow at 3 PM 🏓"
• "Perfect! Set up a daily reminder for 8 AM to review your goals 🎯"
• "Done! You'll get a reminder every Monday about tournaments 🏆"

${reminderResult ? `
📋 REMINDER STATUS:
${reminderResult.success 
  ? `✅ Successfully created: "${reminderResult.reminder?.title}"`
  : `⚠️ Issue with reminder: ${reminderResult.error || 'parsing failed'}`
}

${reminderResult.confirmationMessage ? `Include this in your response: ${reminderResult.confirmationMessage}` : ''}
` : ''}

🏓 DRILL LIBRARY - Use these when players ask for specific drills:
• DINKING: "Cross-Court Dinking Ladder" - Partners dink cross-court, each hit must land 6 inches deeper than previous. Reset at 10 hits. Builds depth control.
• SERVES: "Target Zones" - Place cones in 4 corners of service box. Hit 5 serves to each zone. Focus on spin and placement over power.
• VOLLEYS: "Rapid Fire Volley" - Partner feeds balls from baseline, you volley from kitchen line. 30 seconds per set, 3 sets. Work on quick hands and resets.
• FOOTWORK: "Shadow Court" - No ball, just movement. Practice split-step → lateral slide → recover. 20 reps each side. Build muscle memory.
• THIRD SHOT: "Drop & Go" - Serve, receive return, hit drop shot, move to net. Repeat 20 times. Focus on soft hands and forward momentum.
• SPEED-UPS: "Attack Line" - Partner feeds soft balls at kitchen line. Attack with topspin speed-ups. 15 reps. Work on timing and wrist snap.

CRITICAL FORMATTING RULES:
🎯 STYLE: Write like you're texting a trusted friend. Be conversational, warm, and direct.
📏 LENGTH: Keep responses SHORT - 2-4 sentences max. Break up longer responses with line breaks.
😊 EMOJIS: Use 2-3 relevant emojis per response to add personality and make it visually engaging
🚫 NO BULLET POINTS: Never use bullet points, dashes, or structured lists. Write in natural paragraphs.
✨ FORMATTING: Use line breaks between ideas. Each paragraph should be 1-2 sentences max.
💬 TONE: Match your emotional state. Be encouraging, analytical, excited, or caring as appropriate.
🏓 SPECIFICITY: Give one specific, actionable piece of advice. Don't overwhelm with multiple points.

RESPONSE STRUCTURE:
1. Quick acknowledgment with emoji (1 sentence)
2. Main advice/answer with emoji (1-2 sentences)
3. Encouraging closer or question (optional, 1 sentence)

EXAMPLES OF GOOD RESPONSES:
"Hey ${user?.firstName || 'champ'}! 🏓 Love that you're working on your serve!

The key is getting that paddle high and using your whole body for power, not just your arm. 💪 Start with a high backswing and step into it.

Try practicing 20 serves today focusing just on that high contact point! 🎯"

"Nice work on those matches! 🔥 Your win rate is climbing!

I'd focus on consistency at the net - that's where you'll win more points at your level. 🏆 Practice your dinking and stay patient.

Want me to suggest some specific drills for net play? 🏓"

BAD EXAMPLES (DON'T DO THIS):
- Long paragraphs without breaks
- Bullet point lists
- Over-explaining with multiple techniques
- No emojis or personality
- Generic advice not tailored to their level`

    // Add specific prompts based on action type
    if (actionType === 'suggest_drill') {
      systemPrompt += `\n\nProvide a specific drill recommendation based on their skill level, recent challenges, and current focus areas.`
    } else if (actionType === 'daily_goal') {
      systemPrompt += `\n\nSuggest a clear, achievable daily goal based on their current progress and skill level.`
    } else if (actionType === 'quick_tip') {
      systemPrompt += `\n\nShare one quick, actionable tip they can apply immediately to improve their game.`
    } else if (actionType === 'analyze_stats') {
      systemPrompt += `\n\nAnalyze their recent performance data and provide insights for improvement.`
    } else if (actionType === 'improvement_plan') {
      systemPrompt += `\n\nCreate a personalized improvement plan based on their goals, challenges, and current skill level.`
    } else if (actionType === 'find_partners') {
      systemPrompt += `\n\nProvide advice on finding good practice partners and what to look for based on their skill level.`
    } else if (actionType === 'form_analysis') {
      systemPrompt += `\n\nFocus on form and technique advice based on common issues for their skill level.`
    }

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ]

    const { callAbacusAI } = await import('@/lib/ai/abacus-client');
    
    const aiResponse = await callAbacusAI({
      messages,
      stream: true,
      max_tokens: 1500,
      temperature: 0.8, // Slightly higher for more personality
      timeoutMs: 60000, // 60 second timeout
    }, {
      userId: session.user.id,
      enableFallback: true, // Enable automatic model fallback
    });

    if (!aiResponse.success || !aiResponse.data) {
      console.error('[Coach Kai Streaming] AI call failed:', {
        error: aiResponse.error,
        attemptedModels: aiResponse.attemptedModels,
        userId: session.user.id
      });
      throw new Error(aiResponse.error || 'AI API error')
    }
    
    console.log(`[Coach Kai Streaming] ✅ Stream started with model: ${aiResponse.model}`);
    const response = aiResponse.data as Response;

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()
        let assistantMessage = ''

        try {
          while (true) {
            const { done, value } = await reader?.read() ?? { done: true, value: undefined }
            if (done) break
            
            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  // Save assistant message to AIMessage (for admin viewing)
                  await prisma.aIMessage.create({
                    data: {
                      conversationId: conversation.id,
                      userId: session.user.id,
                      role: 'assistant',
                      content: assistantMessage,
                    }
                  })

                  // Also save to ChatMessage for backwards compatibility
                  await prisma.chatMessage.create({
                    data: {
                      userId: session.user.id,
                      role: 'assistant',
                      content: assistantMessage,
                    }
                  })

                  // Update conversation message count
                  await prisma.aIConversation.update({
                    where: { id: conversation.id },
                    data: {
                      messageCount: { increment: 1 },
                      updatedAt: new Date(),
                    }
                  })
                  
                  controller.close()
                  return
                }
                
                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content || ''
                  if (content) {
                    assistantMessage += content
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error("AI Coach error:", error)
    return NextResponse.json(
      { error: "Failed to get AI coaching response" },
      { status: 500 }
    )
  }
}

function getEmotionalContext(emotion: string, user: any) {
  switch (emotion) {
    case 'encouraging':
      return `💪 VIBE: Super encouraging and supportive! Celebrate their progress, build confidence. Use emojis like 💪🌟✨🎯 and uplifting language. Make them feel like a champion!`
    
    case 'analytical':
      return `🧠 VIBE: Smart and data-focused. Break things down simply and clearly. Use emojis like 📊🎯📈🔍 to highlight key points. Be the knowledgeable coach they can trust.`
    
    case 'celebrating':
      return `🎉 VIBE: SUPER EXCITED! They're crushing it! Use celebration emojis like 🔥🏆🎉💯⚡ Show BIG enthusiasm for their wins and keep that momentum rolling!`
    
    case 'concerned':
      return `❤️ VIBE: Caring and gentle. They might be struggling or away for a bit. Use warm emojis like 💙🤗💪 Be understanding and supportive, no pressure - just help them get back on track.`
    
    case 'motivating':
      return `⚡ VIBE: HIGH ENERGY! Time to level up! Use power emojis like 💪🔥⚡🚀 Challenge them, push boundaries, inspire peak performance. Be the coach that gets them FIRED UP!`
    
    default: // neutral
      return `🏓 VIBE: Chill and helpful. Ready for whatever they need. Use friendly emojis like 👋🏓💬 Keep it warm but balanced.`
  }
}

function getPageContext(page: string) {
  switch (page) {
    case 'home':
      return `📍 LOCATION: Main dashboard. Give them energy for the day! Quick motivation, today's focus. Ask what they want to crush today! 🎯`
    
    case 'train':
      return `📍 LOCATION: Training mode. Get specific with drills, technique tips, and skill work. They're ready to practice! 🏓`
    
    case 'progress':
      return `📍 LOCATION: Checking their stats. Help them see patterns, celebrate wins, spot areas to improve. Make the data exciting! 📊`
    
    case 'connect':
      return `📍 LOCATION: Community section. Help them find practice partners, plan matches, engage with others. Social coaching! 🤝`
    
    case 'settings':
      return `📍 LOCATION: Settings area. Help them dial in their experience, set goals, customize their journey. 🎚️`
    
    default:
      return `📍 LOCATION: General area. Give them what they need right now - be flexible and responsive! 💬`
  }
}
