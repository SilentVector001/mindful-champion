//@ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const targetUserId = params.userId

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        nickname: true,
        image: true,
        skillLevel: true,
        playerRating: true,
        currentStreak: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get XP data
    const userXP = await prisma.userXP.findUnique({
      where: { userId: targetUserId }
    })

    // Get badges
    const badges = await prisma.userBadge.findMany({
      where: { userId: targetUserId },
      orderBy: { earnedAt: 'desc' }
    })

    // Calculate ranks for all leaderboards
    const ranks = {}

    // XP Ranks
    if (userXP) {
      const xpRankAll = await prisma.userXP.count({
        where: { totalXP: { gt: userXP.totalXP } }
      })
      ranks.xpAll = xpRankAll + 1

      const xpRankWeekly = await prisma.userXP.count({
        where: { weeklyXP: { gt: userXP.weeklyXP } }
      })
      ranks.xpWeekly = xpRankWeekly + 1

      const xpRankMonthly = await prisma.userXP.count({
        where: { monthlyXP: { gt: userXP.monthlyXP } }
      })
      ranks.xpMonthly = xpRankMonthly + 1
    }

    // Streak Rank
    const streakRank = await prisma.user.count({
      where: { currentStreak: { gt: user.currentStreak } }
    })
    ranks.streak = streakRank + 1

    // Training Rank
    const drillCount = await prisma.drillCompletion.count({
      where: { userId: targetUserId, status: 'COMPLETED' }
    })
    const drillRank = await prisma.drillCompletion.groupBy({
      by: ['userId'],
      _count: { id: true },
      where: { status: 'COMPLETED' },
      having: { id: { _count: { gt: drillCount } } }
    })
    ranks.training = drillRank.length + 1

    // Video Rank
    const videoCount = await prisma.VideoAnalysis.count({
      where: { userId: targetUserId, analysisStatus: { in: ['ANALYZED', 'COMPLETED'] } }
    })
    const videoRank = await prisma.VideoAnalysis.groupBy({
      by: ['userId'],
      _count: { id: true },
      where: { analysisStatus: { in: ['ANALYZED', 'COMPLETED'] } },
      having: { id: { _count: { gt: videoCount } } }
    })
    ranks.videos = videoRank.length + 1

    // Goals Rank
    const goalCount = await prisma.goal.count({
      where: { userId: targetUserId, status: 'COMPLETED' }
    })
    const goalRank = await prisma.goal.groupBy({
      by: ['userId'],
      _count: { id: true },
      where: { status: 'COMPLETED' },
      having: { id: { _count: { gt: goalCount } } }
    })
    ranks.goals = goalRank.length + 1

    return NextResponse.json({
      user: {
        name: user.nickname || user.name,
        fullName: user.name,
        image: user.image,
        skillLevel: user.skillLevel,
        rating: user.playerRating
      },
      xp: userXP,
      badges,
      ranks,
      stats: {
        streak: user.currentStreak,
        drillsCompleted: drillCount,
        videosAnalyzed: videoCount,
        goalsCompleted: goalCount,
        totalXP: userXP?.totalXP || 0,
        level: userXP?.level || 1
      }
    })
  } catch (error) {
    console.error('Error fetching user leaderboard data:', error)
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
  }
}
