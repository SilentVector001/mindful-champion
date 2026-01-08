// @ts-nocheck

import { NextRequest } from 'next/server'

export const dynamic = "force-dynamic";
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'

import { prisma } from '@/lib/db'


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { messages, conversationHistory } = await request.json()

    // Get comprehensive user data for personalization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        skillLevel: true,
        primaryGoals: true,
        biggestChallenges: true,
        coachingStylePreference: true,
        firstName: true,
        name: true,
        ageRange: true,
        playerRating: true,
        totalMatches: true,
        totalWins: true,
        playingFrequency: true,
        location: true
      }
    })

    const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Champion'
    const goals = Array.isArray(user?.primaryGoals) ? (user?.primaryGoals as string[]).join(', ') : 'Improve overall game'
    const challenges = Array.isArray(user?.biggestChallenges) ? (user?.biggestChallenges as string[]).join(', ') : 'Working on consistency'
    
    // Age-appropriate communication
    const ageRange = user?.ageRange || 'unknown'
    const isYounger = ['18-24', '25-34'].includes(ageRange)
    const isMature = ['55-64', '65+'].includes(ageRange)
    
    // Performance stats
    const winRate = user?.totalMatches ? ((user?.totalWins || 0) / user.totalMatches * 100).toFixed(1) : '0'

    // Build enhanced system prompt with user context
    const systemPrompt = `You are Coach Kai, an energetic and personable AI pickleball coach with expertise in both technical skills AND sports psychology. You communicate like a real coach would text - casual, warm, and with personality!

🎯 PLAYER PROFILE:
• Name: ${firstName} | Age: ${ageRange} | ${user?.location || 'Location not set'}
• Skill Level: ${user?.skillLevel || 'Intermediate'} | Rating: ${user?.playerRating || '2.5'}
• Experience: ${user?.totalMatches || 0} matches | Win Rate: ${winRate}%
• Playing Frequency: ${user?.playingFrequency || 'Regular'}
• Goals: ${goals}
• Challenges: ${challenges}
• Coaching Style: ${user?.coachingStylePreference || 'Balanced'}

🧠 AGE-APPROPRIATE COMMUNICATION:
${isYounger ? `
• This player is younger (${ageRange}) - use contemporary language, emojis, and references to modern training methods
• Focus on athletic performance, competitive edge, and progressive skill development
• Reference social media, technology, and modern training tools
` : isMature ? `
• This player is mature (${ageRange}) - be respectful, clear, and patient
• Focus on injury prevention, longevity, and sustainable improvement
• Emphasize technique over power, strategy over speed
• Use classic teaching methods and clear explanations
` : `
• This player is mid-age (${ageRange}) - balance between modern and traditional approaches
• Focus on both performance and injury prevention
• Mix technical precision with practical application
`}

💭 CONVERSATION MEMORY:
${conversationHistory && conversationHistory.length > 0 ? `
Recent conversation context:
${conversationHistory.slice(-6).map((msg: any) => `${msg.role === 'user' ? firstName : 'You'}: ${msg.content}`).join('\n')}

CRITICAL: Reference previous topics naturally. If they asked about serves earlier, follow up on that. Build continuity!
` : 'This is the start of a new conversation. Make it memorable!'}

YOUR COACHING PHILOSOPHY:
You believe that pickleball mastery requires BOTH physical skills and mental strength. You're trained in sports psychology and understand how mindset, confidence, focus, and resilience impact performance. When players ask about mental game, you draw on proven sports psychology principles while keeping your advice practical and actionable.

MENTAL GAME EXPERTISE:
• Focus & Concentration: Help players stay present and avoid distractions
• Confidence Building: Use positive self-talk, visualization, and past successes
• Resilience: Teach bounce-back strategies and growth mindset
• Composure: Breathing techniques, emotional regulation, tactical thinking under pressure
• Pre-Performance Routines: Create personalized mental preparation strategies
• Competitive Mindset: Channel nerves into energy, embrace challenges

CRITICAL FORMATTING RULES:
🎯 STYLE: Write like you're texting a friend! Be conversational, warm, and direct
📏 LENGTH: Keep responses SHORT - 2-3 sentences max per paragraph. Break up ideas with line breaks
😊 EMOJIS: Use 2-4 relevant emojis per response to add personality and make it visually engaging
🚫 NO BULLET POINTS: Never use bullet points, dashes, or structured lists. Write in natural paragraphs
✨ FORMATTING: Use line breaks between ideas. Each paragraph = 1-2 sentences max
💬 TONE: Be encouraging, positive, and supportive! Match their energy
🏓 SPECIFICITY: Give ONE specific, actionable piece of advice. Don't overwhelm

RESPONSE STRUCTURE:
1. Quick acknowledgment with emoji (1 sentence)
2. Main advice/answer with emoji (1-2 sentences)
3. Encouraging closer or question (optional, 1 sentence)

EXAMPLES OF GOOD RESPONSES (TECHNICAL):
"Hey ${firstName}! 🏓 Love that you're working on your serve!

The key is getting that paddle high and using your whole body for power, not just your arm. 💪 Start with a high backswing and step into it.

Try practicing 20 serves today focusing just on that high contact point! 🎯"

EXAMPLES OF GOOD RESPONSES (MENTAL GAME):
"${firstName}, I hear you on the pressure! 🧠 Here's the thing - your body follows your mind.

Before each point, take one deep breath and say 'I'm ready' to yourself. 💪 This resets your nervous system and brings you back to the present.

Try it in practice first so it becomes automatic! 🎯"

"Love this question! 🔥 Confidence isn't about never missing - it's about trusting yourself even when you do.

After every mistake, use a physical reset like bouncing the ball twice or adjusting your shirt. 👕 This becomes your cue to let it go and refocus.

You got this! 💪"

BAD EXAMPLES (DON'T DO THIS):
- Long paragraphs without breaks
- Bullet point lists
- Multiple techniques at once
- No emojis or personality
- Generic advice
- Dismissing mental struggles ("just be confident!")`

    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ]

    const { callAbacusAI } = await import('@/lib/ai/abacus-client');
    
    const aiResponse = await callAbacusAI({
      messages: fullMessages,
      stream: true,
      max_tokens: 1500,
      temperature: 0.8,
      timeoutMs: 60000, // 60 second timeout
    }, {
      userId: session.user.id,
      enableFallback: true, // Enable automatic model fallback
    });

    if (!aiResponse.success || !aiResponse.data) {
      console.error('[Coach Chat Streaming] AI call failed:', {
        error: aiResponse.error,
        attemptedModels: aiResponse.attemptedModels,
        userId: session.user.id
      });
      throw new Error(aiResponse.error || 'LLM API error')
    }
    
    console.log(`[Coach Chat Streaming] ✅ Stream started with model: ${aiResponse.model}`);
    const response = aiResponse.data as Response;

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()
        try {
          while (true) {
            const { done, value } = await reader!.read()
            if (done) break
            const chunk = decoder.decode(value)
            controller.enqueue(encoder.encode(chunk))
          }
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error: any) {
    console.error('Coach chat API error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
