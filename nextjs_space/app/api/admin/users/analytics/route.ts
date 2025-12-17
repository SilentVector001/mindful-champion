export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const timeframe = searchParams.get('timeframe') || '30' // days
    const startDate = new Date(Date.now() - parseInt(timeframe) * 24 * 60 * 60 * 1000)

    // Get user growth data
    const userGrowth = await prisma.$queryRaw<any[]>`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM "User"
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    // Get subscription distribution over time
    const subscriptionTrend = await prisma.$queryRaw<any[]>`
      SELECT 
        DATE(created_at) as date,
        subscription_tier as tier,
        COUNT(*) as count
      FROM "User"
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at), subscription_tier
      ORDER BY date ASC
    `

    // Get engagement metrics
    const [
      totalUsers,
      activeUsers30Days,
      activeUsers7Days,
      activeUsersToday,
      totalPageViews,
      totalVideoInteractions,
      totalDrillCompletions,
      avgSessionDuration,
    ] = await Promise.all([
      prisma.user.count(),
      
      prisma.user.count({
        where: {
          lastActiveDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      prisma.user.count({
        where: {
          lastActiveDate: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      prisma.user.count({
        where: {
          lastActiveDate: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      prisma.pageView.count({
        where: {
          timestamp: { gte: startDate }
        }
      }),
      
      prisma.videoInteraction.count({
        where: {
          timestamp: { gte: startDate }
        }
      }),
      
      prisma.drillCompletion.count({
        where: {
          startTime: { gte: startDate },
          status: 'COMPLETED'
        }
      }),
      
      prisma.userSession.aggregate({
        where: {
          startTime: { gte: startDate },
          duration: { not: null }
        },
        _avg: {
          duration: true
        }
      })
    ])

    // Get daily active users trend
    const dailyActiveUsers = await prisma.$queryRaw<any[]>`
      SELECT 
        DATE(timestamp) as date,
        COUNT(DISTINCT user_id) as active_users
      FROM "PageView"
      WHERE timestamp >= ${startDate}
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `

    // Get most popular pages
    const popularPages = await prisma.pageView.groupBy({
      by: ['path'],
      where: {
        timestamp: { gte: startDate }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // Get most watched videos
    const popularVideos = await prisma.videoInteraction.groupBy({
      by: ['videoId', 'videoTitle'],
      where: {
        timestamp: { gte: startDate },
        interactionType: 'COMPLETE'
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // Get drill completion stats
    const drillStats = await prisma.drillCompletion.groupBy({
      by: ['drillCategory'],
      where: {
        startTime: { gte: startDate },
        status: 'COMPLETED'
      },
      _count: {
        id: true
      },
      _avg: {
        performanceScore: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    // Get revenue metrics
    const revenueData = await prisma.payment.aggregate({
      where: {
        createdAt: { gte: startDate },
        status: 'succeeded'
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    const revenueByTier = await prisma.payment.groupBy({
      by: ['subscriptionTier'],
      where: {
        createdAt: { gte: startDate },
        status: 'succeeded'
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    // Get trial conversion data
    const trialUsers = await prisma.user.count({
      where: { isTrialActive: true }
    })

    const convertedUsers = await prisma.user.count({
      where: {
        isTrialActive: false,
        subscriptionTier: { in: ['PREMIUM', 'PRO'] },
        createdAt: { lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Users past trial period
      }
    })

    const totalTrialUsers = await prisma.user.count({
      where: {
        createdAt: { lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    })

    const conversionRate = totalTrialUsers > 0 ? (convertedUsers / totalTrialUsers * 100) : 0

    // Get churn data
    const canceledSubscriptions = await prisma.subscription.count({
      where: {
        status: 'CANCELED',
        updatedAt: { gte: startDate }
      }
    })

    const totalActiveSubscriptions = await prisma.subscription.count({
      where: { status: 'ACTIVE' }
    })

    const churnRate = totalActiveSubscriptions > 0 
      ? (canceledSubscriptions / (totalActiveSubscriptions + canceledSubscriptions) * 100) 
      : 0

    // Get user behavior patterns
    const sessionsByTimeOfDay = await prisma.$queryRaw<any[]>`
      SELECT 
        EXTRACT(HOUR FROM start_time) as hour,
        COUNT(*) as session_count,
        AVG(duration) as avg_duration
      FROM "UserSession"
      WHERE start_time >= ${startDate}
      GROUP BY EXTRACT(HOUR FROM start_time)
      ORDER BY hour ASC
    `

    // Get achievement statistics
    const achievementStats = await prisma.userAchievement.groupBy({
      by: ['achievementId'],
      where: {
        unlockedAt: { gte: startDate }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // Get common navigation paths
    const navigationPaths = await prisma.navigationPath.groupBy({
      by: ['fromPath', 'toPath'],
      where: {
        timestamp: { gte: startDate }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 20
    })

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsers30Days,
        activeUsers7Days,
        activeUsersToday,
        engagementRate: totalUsers > 0 ? (activeUsers30Days / totalUsers * 100) : 0,
      },
      userGrowth,
      subscriptionTrend,
      engagement: {
        totalPageViews,
        totalVideoInteractions,
        totalDrillCompletions,
        avgSessionDuration: Math.round(avgSessionDuration._avg.duration || 0),
        dailyActiveUsers,
      },
      content: {
        popularPages: popularPages.map(p => ({
          path: p.path,
          views: p._count.id
        })),
        popularVideos: popularVideos.map(v => ({
          videoId: v.videoId,
          title: v.videoTitle,
          completions: v._count.id
        })),
        drillStats: drillStats.map(d => ({
          category: d.drillCategory,
          completions: d._count.id,
          avgScore: Math.round(d._avg.performanceScore || 0)
        }))
      },
      revenue: {
        total: (revenueData._sum.amount || 0) / 100,
        transactionCount: revenueData._count.id,
        byTier: revenueByTier.map(r => ({
          tier: r.subscriptionTier,
          amount: (r._sum.amount || 0) / 100,
          count: r._count.id
        })),
        mrr: 0, // Would calculate based on monthly subscriptions
      },
      conversion: {
        trialUsers,
        convertedUsers,
        conversionRate: Math.round(conversionRate * 100) / 100,
        churnRate: Math.round(churnRate * 100) / 100,
        canceledSubscriptions,
      },
      userBehavior: {
        sessionsByTimeOfDay: sessionsByTimeOfDay.map(s => ({
          hour: parseInt(s.hour),
          sessions: parseInt(s.session_count),
          avgDuration: Math.round(parseFloat(s.avg_duration || '0'))
        })),
        topAchievements: achievementStats.slice(0, 5),
        navigationPaths: navigationPaths.map(np => ({
          from: np.fromPath,
          to: np.toPath,
          count: np._count.id
        }))
      }
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
