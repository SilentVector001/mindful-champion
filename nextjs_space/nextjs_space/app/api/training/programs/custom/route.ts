
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = "force-dynamic";
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'

import { prisma } from '@/lib/db'


// Simple keyword matching for MVP - can be enhanced with AI later
const matchVideosToGoal = (goal: string, skillLevel: string) => {
  const goalLower = goal.toLowerCase()
  
  // Define keyword mappings
  const keywordMap: Record<string, string[]> = {
    serving: ['serve', 'serving', 'serves'],
    dinking: ['dink', 'dinking', 'soft game', 'kitchen line', 'touch'],
    thirdshot: ['third shot', '3rd shot', 'drop shot', 'transition'],
    volley: ['volley', 'volleys', 'net play', 'punch'],
    strategy: ['strategy', 'positioning', 'court', 'doubles'],
    footwork: ['footwork', 'movement', 'agility', 'court coverage'],
    mental: ['mental', 'mindset', 'focus', 'confidence', 'pressure']
  }
  
  // Find matching topics
  const matchedTopics: string[] = []
  for (const [topic, keywords] of Object.entries(keywordMap)) {
    if (keywords.some(keyword => goalLower.includes(keyword))) {
      matchedTopics.push(topic)
    }
  }
  
  return {
    topics: matchedTopics.length > 0 ? matchedTopics : ['general'],
    estimatedDays: Math.max(7, Math.min(matchedTopics.length * 3, 21))
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { goal, skillLevel } = body

    if (!goal) {
      return NextResponse.json({ error: 'Goal required' }, { status: 400 })
    }

    // Match goal to video topics
    const { topics, estimatedDays } = matchVideosToGoal(goal, skillLevel)
    
    // Find relevant videos
    const videos = await prisma.trainingVideo.findMany({
      where: {
        OR: topics.map(topic => ({
          primaryTopic: {
            contains: topic,
            mode: 'insensitive' as any
          }
        })),
        skillLevel: {
          in: [skillLevel, 'BEGINNER'] // Include beginner videos as foundation
        }
      },
      take: 15 // Limit to 15 videos
    })

    // Create custom program
    const customProgram = await prisma.customProgram.create({
      data: {
        userId: session.user.id,
        programName: `Custom: ${goal.slice(0, 50)}${goal.length > 50 ? '...' : ''}`,
        selectedSkills: topics,
        generatedVideoIds: videos.map(v => v.id),
        customGoalText: goal,
        estimatedDays,
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({ 
      success: true,
      programId: customProgram.id,
      videosCount: videos.length,
      estimatedDays,
      topics
    })

  } catch (error) {
    console.error('Error creating custom program:', error)
    return NextResponse.json(
      { error: 'Failed to create custom program' },
      { status: 500 }
    )
  }
}
