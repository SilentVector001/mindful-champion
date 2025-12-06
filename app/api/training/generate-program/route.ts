
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { selectedSkills, customGoal, userSkillLevel, userGoals } = await request.json()

    if (!selectedSkills?.length && !customGoal?.trim()) {
      return NextResponse.json({ error: "Please select skills or provide a custom goal" }, { status: 400 })
    }

    // Build video search criteria
    let searchCriteria = []
    
    if (selectedSkills?.length > 0) {
      // Map skill selections to topics
      const topicMappings: Record<string, string[]> = {
        'Basic Serve': ['serving'],
        'Power Serve': ['serving'],
        'Spin Serve': ['serving'],
        'Placement': ['serving'],
        'Consistency': ['serving'],
        'Deep Return': ['return of serve'],
        'Attacking Return': ['return of serve'],
        'Defensive Return': ['return of serve'],
        'Positioning': ['strategy', 'footwork'],
        'Soft Touch': ['dinking'],
        'Cross-Court Dinks': ['dinking'],
        'Straight Dinks': ['dinking'],
        'Speed-ups': ['dinking'],
        'Reset Shots': ['dinking'],
        'Third Shot Drop': ['third shot'],
        'Third Shot Drive': ['third shot'],
        'Selection': ['third shot', 'strategy'],
        'Timing': ['third shot', 'strategy'],
        'Punch Volley': ['volleys'],
        'Block Volley': ['volleys'],
        'Attacking Volley': ['volleys'],
        'Defensive Volley': ['volleys'],
        'Court Positioning': ['strategy'],
        'Communication': ['strategy'],
        'Mental Toughness': ['mental game'],
        'Game Planning': ['strategy']
      }

      for (const skill of selectedSkills) {
        const topics = topicMappings[skill] || []
        searchCriteria.push(...topics)
      }
    }

    // Use LLM to analyze custom goal and generate video selection
    if (customGoal?.trim()) {
      try {
        const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4.1-mini',
            messages: [
              {
                role: 'system',
                content: `You are a pickleball training expert. Analyze the user's goal and recommend relevant video topics. Available topics: serving, return of serve, dinking, third shot, volleys, footwork, strategy, mental game, advanced techniques, fundamentals.
                
                Respond with a JSON object containing:
                {
                  "topics": ["topic1", "topic2", ...],
                  "skillLevel": "beginner|intermediate|advanced",
                  "programName": "Custom Program Name",
                  "description": "Brief description of what this program will help with"
                }
                
                Respond with raw JSON only.`
              },
              {
                role: 'user',
                content: `User's skill level: ${userSkillLevel || 'intermediate'}
User's goals from onboarding: ${JSON.stringify(userGoals || [])}
Custom goal: ${customGoal}

Please analyze this goal and recommend appropriate pickleball video topics.`
              }
            ],
            response_format: { type: "json_object" },
            max_tokens: 500
          })
        })

        const data = await response.json()
        const analysis = JSON.parse(data.choices[0].message.content)
        
        searchCriteria.push(...(analysis.topics || []))
      } catch (error) {
        console.error("Error analyzing custom goal:", error)
        // Fallback to basic skill level videos
        searchCriteria.push('fundamentals', 'strategy')
      }
    }

    // Remove duplicates and get unique topics
    const uniqueTopics = [...new Set(searchCriteria)]

    // Build video search query
    const skillLevelFilter = userSkillLevel ? userSkillLevel.toUpperCase() : 'INTERMEDIATE'
    const allowedSkillLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].filter(level => {
      if (skillLevelFilter === 'BEGINNER') return ['BEGINNER', 'INTERMEDIATE'].includes(level)
      if (skillLevelFilter === 'INTERMEDIATE') return ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(level)
      return ['INTERMEDIATE', 'ADVANCED'].includes(level)
    }) as ('BEGINNER' | 'INTERMEDIATE' | 'ADVANCED')[]

    // Search for relevant videos
    const videos = await prisma.trainingVideo.findMany({
      where: {
        AND: [
          { skillLevel: { in: allowedSkillLevels } },
          {
            OR: uniqueTopics.map(topic => ({
              OR: [
                { primaryTopic: { contains: topic, mode: 'insensitive' } },
                { secondaryTopics: { array_contains: topic } }
              ]
            }))
          }
        ]
      },
      take: 15, // Limit to 15 videos for custom program
      orderBy: [
        { skillLevel: 'asc' },
        { title: 'asc' }
      ]
    })

    // Generate program structure
    const programName = customGoal?.trim() 
      ? `Custom: ${customGoal.slice(0, 30)}${customGoal.length > 30 ? '...' : ''}`
      : `${selectedSkills?.slice(0, 2).join(' & ')} Training`

    const program = {
      name: programName,
      description: customGoal?.trim() || `Focused training on ${selectedSkills?.slice(0, 3).join(', ')}`,
      estimatedDays: Math.max(7, Math.ceil(videos.length * 0.8)),
      videoCount: videos.length,
      selectedVideos: videos.map(v => ({
        id: v.id,
        videoId: v.videoId,
        title: v.title,
        duration: v.duration,
        skillLevel: v.skillLevel,
        primaryTopic: v.primaryTopic
      })),
      focusAreas: uniqueTopics
    }

    // Save custom program
    const customProgram = await prisma.customProgram.create({
      data: {
        userId: session.user.id,
        programName: program.name,
        selectedSkills: selectedSkills || [],
        generatedVideoIds: videos.map(v => v.videoId),
        customGoalText: customGoal?.trim() || null,
        estimatedDays: program.estimatedDays
      }
    })

    return NextResponse.json({ program, customProgramId: customProgram.id })
  } catch (error) {
    console.error("Error generating custom program:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
