//@ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const programId = searchParams.get('programId')

    // Get user program progress
    const userPrograms = await prisma.userProgram.findMany({
      where: { userId: session.user.id },
      include: { TrainingProgram: true }
    })

    // Get drill progress
    const drillProgress = await prisma.drillProgress.findMany({
      where: { 
        userId: session.user.id,
        ...(programId ? { programId } : {})
      }
    })

    // Get day progress
    const dayProgress = await prisma.programDayProgress.findMany({
      where: {
        userId: session.user.id,
        ...(programId ? { programId } : {})
      },
      orderBy: { dayNumber: 'asc' }
    })

    // Get XP and streak
    const userXP = await prisma.userXP.findUnique({
      where: { userId: session.user.id }
    })

    const streak = await prisma.trainingStreak.findUnique({
      where: { userId: session.user.id }
    })

    // Get badges
    const badges = await prisma.userBadge.findMany({
      where: { userId: session.user.id },
      orderBy: { earnedAt: 'desc' },
      take: 20
    })

    // Calculate stats
    const totalDrillsCompleted = drillProgress.reduce((sum, d) => sum + (d?.completedCount ?? 0), 0)
    const totalTimeSpent = drillProgress.reduce((sum, d) => sum + (d?.totalTimeSpent ?? 0), 0)
    const completedPrograms = userPrograms.filter(p => p?.status === 'COMPLETED')?.length ?? 0

    return NextResponse.json({
      programs: userPrograms,
      drillProgress,
      dayProgress,
      xp: userXP ?? { totalXP: 0, level: 1, weeklyXP: 0 },
      streak: streak ?? { currentStreak: 0, longestStreak: 0, totalDaysTrained: 0 },
      badges,
      stats: {
        totalDrillsCompleted,
        totalTimeSpent,
        completedPrograms,
        activePrograms: userPrograms.filter(p => p?.status === 'IN_PROGRESS')?.length ?? 0
      }
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, programId, drillId, dayNumber, timeSpent, rating, notes } = await req.json()

    if (type === 'drill_complete') {
      // Update drill progress
      const drillProgress = await prisma.drillProgress.upsert({
        where: {
          userId_drillId_programId: {
            userId: session.user.id,
            drillId,
            programId: programId || 'standalone'
          }
        },
        update: {
          completedCount: { increment: 1 },
          totalTimeSpent: { increment: timeSpent || 0 },
          lastRating: rating,
          personalNotes: notes,
          lastCompletedAt: new Date()
        },
        create: {
          userId: session.user.id,
          drillId,
          programId: programId || 'standalone',
          dayNumber,
          completedCount: 1,
          totalTimeSpent: timeSpent || 0,
          lastRating: rating,
          personalNotes: notes,
          lastCompletedAt: new Date()
        }
      })

      // Award XP for drill completion
      const xpAmount = 25 + (rating === 5 ? 10 : 0)
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/training/xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': req.headers.get('cookie') || '' },
        body: JSON.stringify({
          amount: xpAmount,
          source: 'drill_complete',
          sourceId: drillId,
          description: `Completed drill`
        })
      })

      return NextResponse.json({ success: true, drillProgress, xpEarned: xpAmount })
    }

    if (type === 'day_complete') {
      // Update day progress
      const dayProgress = await prisma.programDayProgress.upsert({
        where: {
          userId_programId_dayNumber: {
            userId: session.user.id,
            programId,
            dayNumber
          }
        },
        update: {
          status: 'completed',
          timeSpent: { increment: timeSpent || 0 },
          completedAt: new Date(),
          notes
        },
        create: {
          userId: session.user.id,
          programId,
          dayNumber,
          status: 'completed',
          timeSpent: timeSpent || 0,
          completedAt: new Date(),
          notes
        }
      })

      // Update user program progress
      const program = await prisma.trainingProgram.findUnique({
        where: { id: programId }
      })

      if (program) {
        const completedDays = await prisma.programDayProgress.count({
          where: {
            userId: session.user.id,
            programId,
            status: 'completed'
          }
        })

        const completionPercentage = (completedDays / program.durationDays) * 100

        await prisma.userProgram.update({
          where: {
            userId_programId: { userId: session.user.id, programId }
          },
          data: {
            currentDay: dayNumber + 1,
            completionPercentage,
            lastTrainedAt: new Date(),
            ...(completionPercentage >= 100 ? { status: 'COMPLETED', completedAt: new Date() } : {})
          }
        })
      }

      // Update streak
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/training/streak`, {
        method: 'POST',
        headers: { 'Cookie': req.headers.get('cookie') || '' }
      })

      // Award XP for day completion
      const xpAmount = 100
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/training/xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': req.headers.get('cookie') || '' },
        body: JSON.stringify({
          amount: xpAmount,
          source: 'program_day',
          sourceId: `${programId}-day-${dayNumber}`,
          description: `Completed Day ${dayNumber}`
        })
      })

      return NextResponse.json({ success: true, dayProgress, xpEarned: xpAmount })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}
