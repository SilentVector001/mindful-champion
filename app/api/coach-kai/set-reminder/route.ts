// Coach Kai Reminder API - Creates reminders from conversation
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reminderText, scheduledTime, goalId, deliveryMethod = 'in_app' } = await request.json()

    if (!reminderText) {
      return NextResponse.json({ error: 'Reminder text is required' }, { status: 400 })
    }

    // Parse the scheduled time or default to tomorrow 9am
    let nextTrigger: Date
    if (scheduledTime) {
      nextTrigger = new Date(scheduledTime)
    } else {
      nextTrigger = new Date()
      nextTrigger.setDate(nextTrigger.getDate() + 1)
      nextTrigger.setHours(9, 0, 0, 0)
    }

    // Create the reminder
    const reminder = await prisma.coachKaiReminder.create({
      data: {
        userId: session.user.id,
        reminderText,
        parsedData: {
          goalId,
          deliveryMethod,
          originalRequest: reminderText
        },
        isActive: true,
        nextTrigger,
        createdFrom: 'coach_kai_chat'
      }
    })

    // Also create a scheduled notification
    await prisma.scheduledNotification.create({
      data: {
        userId: session.user.id,
        category: 'GOALS',
        type: 'GOAL_REMINDER',
        title: 'Coach Kai Reminder',
        message: reminderText,
        data: {
          reminderId: reminder.id,
          goalId
        },
        scheduledFor: nextTrigger,
        status: 'PENDING',
        deliveryMethod: deliveryMethod === 'email' ? 'EMAIL' : 'IN_APP',
        source: 'COACH_KAI'
      }
    })

    return NextResponse.json({
      success: true,
      reminder: {
        id: reminder.id,
        text: reminderText,
        scheduledFor: nextTrigger
      },
      message: `Reminder set for ${nextTrigger.toLocaleDateString()} at ${nextTrigger.toLocaleTimeString()}`
    })
  } catch (error: any) {
    console.error('Set reminder error:', error)
    return NextResponse.json({ error: error.message || 'Failed to set reminder' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reminders = await prisma.coachKaiReminder.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      orderBy: { nextTrigger: 'asc' }
    })

    return NextResponse.json({ reminders })
  } catch (error: any) {
    console.error('Get reminders error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get reminders' }, { status: 500 })
  }
}
