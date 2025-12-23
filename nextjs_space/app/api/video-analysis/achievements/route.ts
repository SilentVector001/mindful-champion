import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET - Get all achievements and user's unlocked status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all achievements
    const allAchievements = await prisma.videoAnalysisAchievement.findMany({
      orderBy: [{ category: 'asc' }, { threshold: 'asc' }]
    })

    // Get user's unlocked achievements
    const userAchievements = await prisma.videoAnalysisUserAchievement.findMany({
      where: { userId: user.id },
      select: { achievementId: true, unlockedAt: true, value: true }
    })

    const unlockedIds = new Set(userAchievements?.map(a => a?.achievementId) ?? [])

    // Combine data
    const achievements = (allAchievements ?? []).map(a => ({
      ...a,
      unlocked: unlockedIds.has(a?.id ?? ''),
      unlockedAt: userAchievements?.find(ua => ua?.achievementId === a?.id)?.unlockedAt,
      unlockedValue: userAchievements?.find(ua => ua?.achievementId === a?.id)?.value
    }))

    // Group by category
    const byCategory: Record<string, typeof achievements> = {}
    for (const a of achievements ?? []) {
      const cat = a?.category ?? 'other'
      if (!byCategory[cat]) byCategory[cat] = []
      byCategory[cat].push(a)
    }

    return NextResponse.json({
      achievements: achievements ?? [],
      byCategory: byCategory ?? {},
      totalUnlocked: userAchievements?.length ?? 0,
      totalAchievements: allAchievements?.length ?? 0,
      totalPoints: (userAchievements ?? []).reduce((sum, ua) => {
        const ach = allAchievements?.find(a => a?.id === ua?.achievementId)
        return sum + (ach?.points ?? 0)
      }, 0)
    })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 })
  }
}
