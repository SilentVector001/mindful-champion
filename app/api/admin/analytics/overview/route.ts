
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

async function safeQuery<T>(
  queryFn: () => Promise<T>,
  defaultValue: T,
  errorLabel: string
): Promise<T> {
  try {
    return await queryFn()
  } catch (error) {
    console.error(`Analytics query error [${errorLabel}]:`, error)
    return defaultValue
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check admin authentication
    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const period = parseInt(searchParams.get('period') || '30')
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period)

    console.log(`Analytics: Fetching data for period ${period} days`)

    // Run analytics queries with individual error handling
    const totalUsers = await safeQuery(() => prisma.user.count(), 0, 'totalUsers')
    const activeUsers = await safeQuery(() => prisma.user.count({
      where: { lastActiveDate: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
    }), 0, 'activeUsers')
    const newUsers = await safeQuery(() => prisma.user.count({
      where: { createdAt: { gte: startDate, lte: endDate } }
    }), 0, 'newUsers')
    const trialUsers = await safeQuery(() => prisma.user.count({
      where: { isTrialActive: true, subscriptionTier: 'FREE' }
    }), 0, 'trialUsers')
    const premiumUsers = await safeQuery(() => prisma.user.count({
      where: { subscriptionTier: 'PREMIUM' }
    }), 0, 'premiumUsers')
    const proUsers = await safeQuery(() => prisma.user.count({
      where: { subscriptionTier: 'PRO' }
    }), 0, 'proUsers')
    const onboardingCompleted = await safeQuery(() => prisma.user.count({
      where: { onboardingCompleted: true }
    }), 0, 'onboardingCompleted')
    const lockedAccounts = await safeQuery(() => prisma.user.count({
      where: { accountLocked: true }
    }), 0, 'lockedAccounts')

    // Engagement Metrics
    const totalSessions = await safeQuery(() => prisma.userSession.count({
      where: { startTime: { gte: startDate, lte: endDate } }
    }), 0, 'totalSessions')
    const totalPageViews = await safeQuery(() => prisma.pageView.count({
      where: { timestamp: { gte: startDate, lte: endDate } }
    }), 0, 'totalPageViews')
    const totalVideoWatches = await safeQuery(() => prisma.videoInteraction.count({
      where: {
        timestamp: { gte: startDate, lte: endDate },
        interactionType: { in: ['PLAY', 'COMPLETE'] }
      }
    }), 0, 'totalVideoWatches')
    const totalDrillCompletions = await safeQuery(() => prisma.drillCompletion.count({
      where: { startTime: { gte: startDate, lte: endDate } }
    }), 0, 'totalDrillCompletions')
    const totalMatches = await safeQuery(() => prisma.match.count({
      where: { date: { gte: startDate, lte: endDate } }
    }), 0, 'totalMatches')
    const avgSessionDuration = await safeQuery(async () => {
      const result = await prisma.userSession.aggregate({
        where: {
          startTime: { gte: startDate, lte: endDate },
          duration: { not: null }
        },
        _avg: { duration: true }
      })
      return result._avg.duration || 0
    }, 0, 'avgSessionDuration')

    // Revenue Metrics
    const totalRevenue = await safeQuery(async () => {
      const result = await prisma.payment.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'succeeded'
        },
        _sum: { amount: true }
      })
      return result._sum.amount || 0
    }, 0, 'totalRevenue')
    const payments = await safeQuery(() => prisma.payment.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'succeeded'
      }
    }), 0, 'payments')
    const revenueByTier = await safeQuery(() => prisma.payment.groupBy({
      by: ['subscriptionTier'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'succeeded'
      },
      _sum: { amount: true },
      _count: { id: true }
    }), [], 'revenueByTier')

    // Conversion & Retention
    const trialConversions = await safeQuery(() => prisma.user.count({
      where: {
        subscriptionTier: { in: ['PREMIUM', 'PRO'] },
        createdAt: { gte: startDate, lte: endDate }
      }
    }), 0, 'trialConversions')
    const churnedUsers = await safeQuery(() => prisma.user.count({
      where: {
        subscriptionStatus: 'CANCELED',
        updatedAt: { gte: startDate, lte: endDate }
      }
    }), 0, 'churnedUsers')

    // Popular Content
    const popularPages = await safeQuery(() => prisma.pageView.groupBy({
      by: ['path'],
      where: {
        timestamp: { gte: startDate, lte: endDate }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    }), [], 'popularPages')

    const popularVideos = await safeQuery(() => prisma.videoInteraction.groupBy({
      by: ['videoId', 'videoTitle'],
      where: {
        timestamp: { gte: startDate, lte: endDate },
        interactionType: 'COMPLETE'
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    }), [], 'popularVideos')

    const popularDrills = await safeQuery(() => prisma.drillCompletion.groupBy({
      by: ['drillName', 'drillCategory'],
      where: {
        startTime: { gte: startDate, lte: endDate }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    }), [], 'popularDrills')

    const popularAchievements = await safeQuery(() => prisma.userAchievement.count({
      where: {
        unlockedAt: { gte: startDate, lte: endDate }
      }
    }), 0, 'popularAchievements')

    // AI Coach & Mental Training
    const totalAIConversations = await safeQuery(() => prisma.coach.count({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      }
    }), 0, 'totalAIConversations')

    const totalMentalSessions = await safeQuery(() => prisma.mentalSession.count({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      }
    }), 0, 'totalMentalSessions')

    // Calculate derived metrics
    const freeUsers = totalUsers - premiumUsers - proUsers
    const trialConversionRate = trialConversions > 0 ? ((trialConversions / newUsers) * 100).toFixed(2) : "0.00"
    const churnRate = churnedUsers > 0 ? ((churnedUsers / totalUsers) * 100).toFixed(2) : "0.00"
    const onboardingRate = totalUsers > 0 ? ((onboardingCompleted / totalUsers) * 100).toFixed(2) : "0.00"
    const monthlyRevenue = totalRevenue / 100 // Convert from cents to dollars
    const mrr = ((premiumUsers * 9.99) + (proUsers * 19.99)).toFixed(2)

    // Build response
    const analyticsData = {
      overview: {
        totalUsers,
        activeUsers,
        newUsers,
        freeUsers,
        trialUsers,
        premiumUsers,
        proUsers,
        onboardingCompleted,
        onboardingRate,
        lockedAccounts
      },
      engagement: {
        totalSessions,
        totalPageViews,
        totalVideoWatches,
        totalDrillCompletions,
        totalMatches,
        avgSessionDuration: Math.round(avgSessionDuration || 0),
        totalAIConversations,
        totalMentalSessions
      },
      revenue: {
        totalRevenue: monthlyRevenue,
        mrr: parseFloat(mrr),
        payments,
        revenueByTier: revenueByTier.map((tier: any) => ({
          tier: tier.subscriptionTier,
          amount: (tier._sum.amount || 0) / 100,
          count: tier._count?.id || 0
        }))
      },
      conversions: {
        trialConversionRate: parseFloat(trialConversionRate),
        trialConversions,
        churnRate: parseFloat(churnRate),
        churnedUsers
      },
      trends: {
        userGrowth: [],
        dauTrend: []
      },
      popular: {
        pages: popularPages.map((page: any) => ({
          path: page.path,
          views: page._count?.id || 0
        })),
        videos: popularVideos.map((video: any) => ({
          id: video.videoId,
          title: video.videoTitle || video.videoId,
          completions: video._count?.id || 0
        })),
        drills: popularDrills.map((drill: any) => ({
          name: drill.drillName,
          category: drill.drillCategory,
          completions: drill._count?.id || 0
        })),
        achievements: [] // Simplified - total count is: popularAchievements
      }
    }

    return NextResponse.json(analyticsData)

  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json({
      error: 'Failed to fetch analytics data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
