
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get community statistics and activity
    const [
      totalUsers,
      activeUsersToday,
      recentAchievements,
      leaderboard,
      communityActivity,
      currentUser
    ] = await Promise.all([
      // Total registered users
      prisma.user.count(),

      // Users active today
      prisma.user.count({
        where: {
          lastActiveDate: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Recent community achievements (last 7 days)
      prisma.userAchievement.findMany({
        where: {
          unlockedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          user: {
            select: {
              firstName: true,
              name: true,
              skillLevel: true
            }
          },
          achievement: {
            select: {
              name: true,
              description: true,
              icon: true,
              tier: true
            }
          }
        },
        orderBy: { unlockedAt: 'desc' },
        take: 10
      }),

      // Top players leaderboard
      prisma.user.findMany({
        where: {
          rewardPoints: { gt: 0 }
        },
        select: {
          id: true,
          firstName: true,
          name: true,
          rewardPoints: true,
          skillLevel: true,
          currentStreak: true,
          totalWins: true,
          totalMatches: true
        },
        orderBy: { rewardPoints: 'desc' },
        take: 10
      }),

      // Recent community activity (training sessions)
      prisma.trainingPlan.findMany({
        where: {
          completed: true,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        include: {
          user: {
            select: {
              firstName: true,
              name: true,
              skillLevel: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 8
      }),

      // Current user's rank - we'll calculate this after getting user's points
      prisma.user.findUnique({
        where: { id: userId },
        select: { rewardPoints: true }
      })
    ])

    // Calculate additional community metrics
    const totalSessions = await prisma.trainingPlan.count({
      where: { completed: true }
    })

    const totalMatches = await prisma.match.count()

    // Calculate user's position in community
    const userRewardPoints = currentUser?.rewardPoints || 0
    const userRank = await prisma.user.count({
      where: {
        rewardPoints: { gt: userRewardPoints }
      }
    })
    const userPosition = userRank + 1

    return NextResponse.json({
      success: true,
      community: {
        // Overall stats
        totalUsers,
        activeUsersToday,
        totalSessions,
        totalMatches,
        
        // Social proof
        socialProof: {
          playersTrainedToday: activeUsersToday,
          totalTrainingSessions: totalSessions,
          totalMatches: totalMatches
        },

        // Leaderboard
        leaderboard: leaderboard.map((user, index) => ({
          rank: index + 1,
          name: user.firstName || user.name || 'Anonymous',
          points: user.rewardPoints,
          skillLevel: user.skillLevel,
          streak: user.currentStreak,
          winRate: user.totalMatches > 0 
            ? Math.round((user.totalWins / user.totalMatches) * 100)
            : 0,
          isCurrentUser: user.id === userId
        })),

        // User's community position
        userRank: {
          position: userPosition,
          percentile: totalUsers > 0 
            ? Math.round(((totalUsers - userPosition) / totalUsers) * 100)
            : 0
        },

        // Recent achievements feed
        recentAchievements: recentAchievements.map(ua => ({
          id: ua.id,
          playerName: ua.user.firstName || ua.user.name || 'Anonymous',
          achievementName: ua.achievement.name,
          description: ua.achievement.description,
          icon: ua.achievement.icon,
          tier: ua.achievement.tier,
          unlockedAt: ua.unlockedAt,
          timeAgo: Math.floor((Date.now() - ua.unlockedAt.getTime()) / (1000 * 60 * 60)) // hours ago
        })),

        // Community activity
        recentActivity: communityActivity.map(session => ({
          id: session.id,
          playerName: session.user.firstName || session.user.name || 'Anonymous',
          skillLevel: session.user.skillLevel,
          activity: `Completed ${session.focus} training`,
          timeAgo: Math.floor((Date.now() - session.createdAt.getTime()) / (1000 * 60)) // minutes ago
        }))
      }
    })

  } catch (error) {
    console.error('Error fetching community data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch community data' },
      { status: 500 }
    )
  }
}
