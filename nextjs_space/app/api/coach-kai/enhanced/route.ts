// Enhanced Coach Kai API with Function Calling Support
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { buildCoachKaiSystemPrompt } from '@/lib/coach-kai/system-prompt'
import { detectIntent, extractSkillArea, searchDrills, formatDrillsForResponse, createGoalSuggestion, recommendProgram, NAVIGATION_DESTINATIONS } from '@/lib/coach-kai/function-tools'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages, conversationHistory } = await request.json()
    const lastUserMessage = messages?.[messages.length - 1]?.content || ''

    // Get comprehensive user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
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
        currentStreak: true,
        playingFrequency: true,
        location: true
      }
    })

    // Get user's active goals
    const activeGoals = await prisma.goal.findMany({
      where: { 
        userId: session.user.id,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        title: true,
        progress: true,
        category: true
      },
      take: 5
    })

    // Get recent video analysis (if any)
    const recentAnalysis = await prisma.videoAnalysis.findFirst({
      where: {
        userId: session.user.id,
        analysisStatus: 'COMPLETED'
      },
      orderBy: { analyzedAt: 'desc' },
      select: {
        overallScore: true,
        strengths: true,
        areasForImprovement: true
      }
    })

    // Detect user intent and extract skill area
    const intent = detectIntent(lastUserMessage)
    const skillArea = extractSkillArea(lastUserMessage)

    // Prepare contextual data for the prompt
    const contextualAdditions: string[] = []

    // If goal-setting intent detected, add drill recommendations and goal suggestion
    if (intent === 'GOAL_SETTING' && skillArea) {
      const recommendedDrills = searchDrills({
        category: skillArea,
        skillLevel: user?.skillLevel || 'INTERMEDIATE',
        limit: 3
      })
      
      const goalSuggestion = createGoalSuggestion(skillArea, lastUserMessage)
      const program = recommendProgram(skillArea, user?.skillLevel || 'INTERMEDIATE')

      contextualAdditions.push(`
🎯 CONTEXTUAL DATA FOR THIS RESPONSE:
User Intent: GOAL_SETTING
Skill Area: ${skillArea}

Suggested Goal to Create:
- Title: ${goalSuggestion.title}
- Description: ${goalSuggestion.description}
- Category: ${goalSuggestion.category}
- Milestones: ${goalSuggestion.suggestedMilestones.join(', ')}

Recommended Drills:
${recommendedDrills.map(d => `- ${d.name} (${d.difficulty}): ${d.tagline}`).join('\n')}

${program ? `Recommended Program: ${program.programName} - ${program.reason}` : ''}

INSTRUCTION: Help the user create this goal! Mention the specific drills and include a link to the goals page.
`)
    }

    // If drill request detected
    if (intent === 'DRILL_REQUEST' && skillArea) {
      const drills = searchDrills({
        category: skillArea,
        skillLevel: user?.skillLevel || 'INTERMEDIATE',
        limit: 5
      })
      
      contextualAdditions.push(`
🎯 CONTEXTUAL DATA FOR THIS RESPONSE:
User Intent: DRILL_REQUEST
Skill Area: ${skillArea}

Matching Drills:
${drills.map(d => `- ${d.name} (${d.difficulty}, ${d.duration}min): ${d.tagline}`).join('\n')}

INSTRUCTION: Recommend these specific drills and include a link to the drill library!
`)
    }

    // If progress check detected
    if (intent === 'PROGRESS_CHECK') {
      contextualAdditions.push(`
🎯 CONTEXTUAL DATA FOR THIS RESPONSE:
User Intent: PROGRESS_CHECK

User Stats:
- Total Matches: ${user?.totalMatches || 0}
- Win Rate: ${user?.totalMatches ? ((user?.totalWins || 0) / user.totalMatches * 100).toFixed(1) : 0}%
- Current Streak: ${user?.currentStreak || 0}
- Active Goals: ${activeGoals.length}

INSTRUCTION: Summarize their progress positively and suggest next steps!
`)
    }

    const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Champion'

    // Build enhanced system prompt
    const systemPrompt = buildCoachKaiSystemPrompt({
      firstName,
      skillLevel: user?.skillLevel || 'INTERMEDIATE',
      playerRating: user?.playerRating || '2.5',
      primaryGoals: Array.isArray(user?.primaryGoals) ? user.primaryGoals as string[] : [],
      biggestChallenges: Array.isArray(user?.biggestChallenges) ? user.biggestChallenges as string[] : [],
      ageRange: user?.ageRange || 'unknown',
      totalMatches: user?.totalMatches || 0,
      totalWins: user?.totalWins || 0,
      playingFrequency: user?.playingFrequency || 'Regular',
      location: user?.location || '',
      coachingStylePreference: user?.coachingStylePreference || 'Balanced',
      activeGoals: activeGoals.map(g => ({
        title: g.title,
        progress: g.progress,
        category: g.category
      })),
      recentAnalysis: recentAnalysis ? {
        score: recentAnalysis.overallScore || 0,
        strengths: Array.isArray(recentAnalysis.strengths) ? recentAnalysis.strengths as string[] : [],
        improvements: Array.isArray(recentAnalysis.areasForImprovement) ? recentAnalysis.areasForImprovement as string[] : []
      } : undefined,
      matchHistory: {
        wins: user?.totalWins || 0,
        losses: (user?.totalMatches || 0) - (user?.totalWins || 0),
        streak: user?.currentStreak || 0
      }
    }, conversationHistory) + contextualAdditions.join('\n')

    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ]

    // Call LLM API with streaming
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: fullMessages,
        stream: true,
        max_tokens: 1500,
        temperature: 0.8
      })
    })

    if (!response.ok) {
      throw new Error('LLM API error')
    }

    // Stream response back
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
    console.error('Enhanced Coach Kai API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
