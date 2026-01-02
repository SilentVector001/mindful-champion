//@ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.toDateString() === d2.toDateString()
}

function isYesterday(d: Date): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return isSameDay(d, yesterday)
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let streak = await prisma.trainingStreak.findUnique({
      where: { userId: session.user.id }
    })

    if (!streak) {
      streak = await prisma.trainingStreak.create({
        data: { userId: session.user.id }
      })
    }

    // Check if streak is still valid
    if (streak.lastTrainedAt) {
      const lastTrained = new Date(streak.lastTrainedAt)
      const today = new Date()
      
      if (!isSameDay(lastTrained, today) && !isYesterday(lastTrained)) {
        // Streak broken
        streak = await prisma.trainingStreak.update({
          where: { userId: session.user.id },
          data: { currentStreak: 0, streakStarted: null }
        })
      }
    }

    return NextResponse.json(streak)
  } catch (error) {
    console.error('Error fetching streak:', error)
    return NextResponse.json({ error: 'Failed to fetch streak' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    let streak = await prisma.trainingStreak.findUnique({
      where: { userId: session.user.id }
    })

    if (!streak) {
      streak = await prisma.trainingStreak.create({
        data: {
          userId: session.user.id,
          currentStreak: 1,
          longestStreak: 1,
          lastTrainedAt: now,
          streakStarted: now,
          totalDaysTrained: 1
        }
      })
      return NextResponse.json({ ...streak, isNewDay: true })
    }

    // Check if already trained today
    if (streak.lastTrainedAt && isSameDay(new Date(streak.lastTrainedAt), now)) {
      return NextResponse.json({ ...streak, isNewDay: false })
    }

    // Check if continuing streak
    let newStreak = 1
    let streakStarted = now

    if (streak.lastTrainedAt && isYesterday(new Date(streak.lastTrainedAt))) {
      newStreak = streak.currentStreak + 1
      streakStarted = streak.streakStarted || now
    }

    const longestStreak = Math.max(newStreak, streak.longestStreak)

    streak = await prisma.trainingStreak.update({
      where: { userId: session.user.id },
      data: {
        currentStreak: newStreak,
        longestStreak,
        lastTrainedAt: now,
        streakStarted,
        totalDaysTrained: { increment: 1 }
      }
    })

    // Award streak badges
    const streakMilestones = [3, 7, 14, 30, 60, 100]
    for (const milestone of streakMilestones) {
      if (newStreak >= milestone) {
        await prisma.userBadge.upsert({
          where: { userId_badgeId: { userId: session.user.id, badgeId: `streak-${milestone}` } },
          create: {
            userId: session.user.id,
            badgeId: `streak-${milestone}`,
            badgeName: `${milestone} Day Streak`,
            badgeIcon: '🔥',
            badgeColor: milestone >= 30 ? 'gold' : milestone >= 7 ? 'orange' : 'yellow',
            category: 'streak'
          },
          update: {}
        })
      }
    }

    return NextResponse.json({ ...streak, isNewDay: true, streakBonusXP: newStreak * 5 })
  } catch (error) {
    console.error('Error updating streak:', error)
    return NextResponse.json({ error: 'Failed to update streak' }, { status: 500 })
  }
}
