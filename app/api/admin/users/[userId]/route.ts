export const dynamic = "force-dynamic"


import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }


    // Fetch comprehensive user data
    const [
      user,
      recentSessions,
      pageViews,
      videoInteractions,
      drillCompletions,
      securityLogs,
      recentMatches,
      achievements,
      goals,
      payments,
      subscriptions
    ] = await Promise.all([
      // Main user data
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: {
              matches: true,
              goals: true,
              userAchievements: true,
              payments: true,
              securityLogs: true,
            }
          },
          tierUnlocks: {
            include: {
              tier: true
            },
            orderBy: {
              unlockedAt: 'desc'
            }
          },
          userAchievements: {
            take: 10,
            orderBy: {
              unlockedAt: 'desc'
            }
          }
        }
      }),
      // Recent sessions
      prisma.userSession.findMany({
        where: { userId },
        orderBy: { startTime: 'desc' },
        take: 10,
        select: {
          id: true,
          startTime: true,
          endTime: true,
          duration: true,
          deviceType: true,
          browser: true,
          ipAddress: true,
        }
      }),
      // Page views (last 30 days)
      prisma.pageView.findMany({
        where: {
          userId,
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { timestamp: 'desc' },
        take: 50,
      }),
      // Video interactions
      prisma.videoInteraction.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 20,
      }),
      // Drill completions
      prisma.drillCompletion.findMany({
        where: { userId },
        orderBy: { startTime: 'desc' },
        take: 20,
      }),
      // Security logs
      prisma.securityLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 20,
      }),
      // Recent matches
      prisma.match.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 10,
      }),
      // Achievements
      prisma.userAchievement.findMany({
        where: { userId },
        include: {
          achievement: true
        },
        orderBy: { unlockedAt: 'desc' },
      }),
      // Goals
      prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      // Payments
      prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      // Subscriptions
      prisma.subscription.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })
    ])

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate analytics
    const totalPageViews = await prisma.pageView.count({ where: { userId } })
    const totalSessionTime = recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0)
    const avgSessionTime = recentSessions.length > 0 
      ? Math.round(totalSessionTime / recentSessions.length) 
      : 0

    // Most viewed pages
    const pageViewStats = await prisma.pageView.groupBy({
      by: ['path'],
      where: { userId },
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 10,
    })

    // Video engagement
    const videoStats = {
      totalWatched: await prisma.videoInteraction.count({
        where: { userId, interactionType: 'COMPLETE' }
      }),
      totalStarted: await prisma.videoInteraction.count({
        where: { userId, interactionType: 'PLAY' }
      }),
    }

    // Drill performance
    const drillStats = {
      completed: await prisma.drillCompletion.count({
        where: { userId, status: 'COMPLETED' }
      }),
      inProgress: await prisma.drillCompletion.count({
        where: { userId, status: 'IN_PROGRESS' }
      }),
      abandoned: await prisma.drillCompletion.count({
        where: { userId, status: 'ABANDONED' }
      }),
    }

    // Calculate lifetime value
    const lifetimeValue = payments.reduce((sum, p) => sum + p.amount, 0) / 100

    // Activity timeline (combine all activities)
    const timeline = [
      ...securityLogs.map(log => ({
        type: 'security',
        event: log.eventType,
        description: log.description,
        timestamp: log.timestamp,
        severity: log.severity,
      })),
      ...payments.map(payment => ({
        type: 'payment',
        event: 'PAYMENT',
        description: `Payment of $${(payment.amount / 100).toFixed(2)} for ${payment.subscriptionTier}`,
        timestamp: payment.createdAt,
      })),
      ...achievements.map(ach => ({
        type: 'achievement',
        event: 'ACHIEVEMENT_EARNED',
        description: `Earned "${ach.achievement.name}"`,
        timestamp: ach.unlockedAt,
      })),
      ...recentMatches.slice(0, 5).map(match => ({
        type: 'match',
        event: 'MATCH_PLAYED',
        description: `${match.result} against ${match.opponent} (${match.score})`,
        timestamp: match.date,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50)

    // Get video analysis count for user
    const videoAnalysisCount = await prisma.videoAnalysis.count({ where: { userId } })

    return NextResponse.json({
      user,
      sessions: recentSessions,
      pageViews: pageViewStats,
      videoInteractions,
      drillCompletions,
      securityLogs,
      matches: recentMatches,
      achievements,
      goals,
      payments,
      subscriptions,
      // Stats object matching frontend expectations
      stats: {
        videoAnalysisCount,
        achievementsCount: achievements.length,
        goalsCount: goals.length,
        matchesCount: recentMatches.length,
      },
      // Full analytics
      analytics: {
        totalPageViews,
        avgSessionTime,
        totalSessionTime,
        videoStats,
        drillStats,
        lifetimeValue,
      },
      // Recent activity for the activity tab
      recentActivity: timeline.slice(0, 20).map(item => ({
        type: item.type,
        description: item.description,
        createdAt: item.timestamp,
      })),
      // Reward points and tier unlocks at root level for Points tab
      rewardPoints: user?.rewardPoints || 0,
      tierUnlocks: user?.tierUnlocks || [],
      userAchievements: user?.userAchievements || [],
      timeline,
    })
  } catch (error) {
    console.error("Admin user detail error:", error)
    return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { action, data } = body

    let result

    switch (action) {
      case 'updateStatus':
        result = await prisma.user.update({
          where: { id: userId },
          data: {
            accountLocked: data.locked,
            accountLockedReason: data.reason || null,
            accountLockedUntil: data.lockedUntil ? new Date(data.lockedUntil) : null,
          }
        })
        
        // Log the security event
        await prisma.securityLog.create({
          data: {
            userId,
            eventType: data.locked ? 'ACCOUNT_LOCKED' : 'ACCOUNT_UNLOCKED',
            severity: 'HIGH',
            description: `Account ${data.locked ? 'locked' : 'unlocked'} by admin: ${data.reason || 'No reason provided'}`,
          }
        })
        break

      case 'updateSubscription':
        result = await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionTier: data.tier,
            subscriptionStatus: data.status,
          }
        })
        break

      case 'resetPassword':
        // Generate password reset token
        const crypto = require('crypto')
        const token = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        await prisma.passwordResetLog.create({
          data: {
            userId,
            token,
            expiresAt,
            ipAddress: req.headers.get('x-forwarded-for') || 'admin',
          }
        })

        result = { token, expiresAt }
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Admin user update error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
