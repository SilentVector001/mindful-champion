// Coach Kai Goal Creation API - Creates goals from conversation context
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendGoalConfirmation } from '@/lib/notifications/goal-notifications'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, category, targetDate, milestones, source = 'coach_kai' } = await request.json()

    if (!title) {
      return NextResponse.json({ error: 'Goal title is required' }, { status: 400 })
    }

    // Map category string to enum
    const categoryMap: Record<string, string> = {
      'SERVE_IMPROVEMENT': 'TECHNIQUE',
      'DINK_MASTERY': 'TECHNIQUE',
      'THIRD_SHOT_DROPS': 'TECHNIQUE',
      'VOLLEY_SKILLS': 'TECHNIQUE',
      'FOOTWORK': 'FITNESS',
      'MENTAL_GAME': 'MENTAL',
      'TOURNAMENT_PREP': 'COMPETITION',
      'GENERAL_IMPROVEMENT': 'TECHNIQUE',
      'CONSISTENCY': 'TECHNIQUE',
      'POWER': 'FITNESS',
      'DEFENSE': 'TECHNIQUE',
      'OFFENSIVE': 'TECHNIQUE'
    }

    const goalCategory = categoryMap[category] || 'TECHNIQUE'

    // Create the goal
    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        title,
        description,
        category: goalCategory as any,
        targetDate: targetDate ? new Date(targetDate) : null,
        status: 'ACTIVE',
        progress: 0,
        milestones: {
          create: milestones?.map((m: any, index: number) => ({
            title: m.title || m,
            description: m.description,
            targetValue: m.targetValue,
            unit: m.unit,
            order: index,
            status: 'NOT_STARTED'
          })) || []
        }
      },
      include: {
        milestones: true
      }
    })

    // Send confirmation notification
    try {
      await sendGoalConfirmation(session.user.id, {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        targetDate: goal.targetDate,
        userId: session.user.id,
        progress: goal.progress,
        createdAt: goal.createdAt
      })
    } catch (notifError) {
      console.error('Failed to send goal confirmation:', notifError)
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: 'GOAL_CREATED',
        title: 'New Goal Created',
        description: `Created goal "${title}" via ${source}`,
        category: 'goals'
      }
    })

    return NextResponse.json({
      success: true,
      goal: {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        progress: goal.progress,
        milestones: goal.milestones
      },
      message: `Goal "${title}" created successfully!`,
      navigationUrl: `/progress/goals?highlight=${goal.id}`
    })
  } catch (error: any) {
    console.error('Coach Kai goal creation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create goal' }, { status: 500 })
  }
}
