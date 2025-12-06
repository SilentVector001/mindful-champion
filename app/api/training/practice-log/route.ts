
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { logActivity } from "@/lib/activity-tracker"
import { checkAndAwardSimpleAchievements } from "@/lib/achievements/check-simple-achievements"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { date, durationMinutes, focusAreas, notes, satisfactionRating } = await request.json()

    if (!durationMinutes || durationMinutes < 1) {
      return NextResponse.json({ error: "Duration must be at least 1 minute" }, { status: 400 })
    }

    // Create practice log
    const practiceLog = await prisma.practiceLog.create({
      data: {
        userId: session.user.id,
        date: date ? new Date(date) : new Date(),
        durationMinutes: durationMinutes,
        focusAreas: focusAreas || [],
        notes: notes || null,
        satisfactionRating: satisfactionRating || null
      }
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      type: 'PRACTICE_LOG_CREATED',
      title: 'Practice Session Logged',
      description: `Logged ${durationMinutes} minutes of practice`,
      category: 'practice',
      metadata: {
        practiceLogId: practiceLog.id,
        durationMinutes: durationMinutes,
        focusAreas: focusAreas || [],
        satisfactionRating: satisfactionRating
      }
    });

    // Check for achievements (don't wait - run async)
    checkAndAwardSimpleAchievements(session.user.id, 'practice').catch(console.error);

    // Check for practice-related achievements
    await checkPracticeAchievements(session.user.id)

    return NextResponse.json({ practiceLog })
  } catch (error) {
    console.error("Error creating practice log:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const practiceLogs = await prisma.practiceLog.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
      take: limit
    })

    // Get practice statistics
    const totalSessions = await prisma.practiceLog.count({
      where: { userId: session.user.id }
    })

    const totalMinutes = await prisma.practiceLog.aggregate({
      where: { userId: session.user.id },
      _sum: { durationMinutes: true }
    })

    // Get current streak
    const currentStreak = await calculatePracticeStreak(session.user.id)

    const stats = {
      totalSessions,
      totalMinutes: totalMinutes._sum.durationMinutes || 0,
      totalHours: Math.round((totalMinutes._sum.durationMinutes || 0) / 60 * 10) / 10,
      currentStreak
    }

    return NextResponse.json({ practiceLogs, stats })
  } catch (error) {
    console.error("Error fetching practice logs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to calculate practice streak
async function calculatePracticeStreak(userId: string): Promise<number> {
  const logs = await prisma.practiceLog.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 30 // Check last 30 days
  })

  if (logs.length === 0) return 0

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Group logs by date
  const logsByDate = new Map<string, boolean>()
  logs.forEach(log => {
    const dateKey = log.date.toISOString().split('T')[0]
    logsByDate.set(dateKey, true)
  })

  // Count consecutive days from today backwards
  let currentDate = new Date(today)
  
  while (streak < 30) {
    const dateKey = currentDate.toISOString().split('T')[0]
    
    if (logsByDate.has(dateKey)) {
      streak++
    } else {
      break
    }
    
    currentDate.setDate(currentDate.getDate() - 1)
  }

  return streak
}

// Helper function to check practice achievements
async function checkPracticeAchievements(userId: string) {
  try {
    const totalSessions = await prisma.practiceLog.count({
      where: { userId }
    })

    const currentStreak = await calculatePracticeStreak(userId)

    const achievements = [
      { name: 'Practice Champion', threshold: totalSessions, type: 'sessions', value: 10 },
      { name: 'Week Warrior', threshold: currentStreak, type: 'streak', value: 7 }
    ]

    for (const achievement of achievements) {
      if (achievement.threshold >= achievement.value) {
        const existingAchievement = await prisma.userAchievement.findFirst({
          where: {
            userId: userId,
            achievement: {
              name: achievement.name
            }
          }
        })

        if (!existingAchievement) {
          const achievementRecord = await prisma.achievement.findFirst({
            where: { name: achievement.name }
          })

          if (achievementRecord) {
            await prisma.userAchievement.create({
              data: {
                userId: userId,
                achievementId: achievementRecord.id,
                unlockedAt: new Date()
              }
            })
          }
        }
      }
    }
  } catch (error) {
    console.error("Error checking practice achievements:", error)
  }
}
