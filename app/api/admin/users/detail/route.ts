export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getUserActivityTimeline, formatTimestamp, getRelativeTime } from "@/lib/tracking-utils"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Get comprehensive user data
    const [
      user,
      subscriptions,
      payments,
      achievements,
      goals,
      matches,
      securityLogs,
      pageViews,
      videoInteractions,
      drillCompletions,
      userSessions,
      achievementStats,
    ] = await Promise.all([
      // Main user data
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscriptions: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          userAchievements: {
            include: {
              achievement: true,
            },
            orderBy: { unlockedAt: 'desc' },
            take: 20,
          },
          goals: {
            include: {
              milestones: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          matches: {
            orderBy: { date: 'desc' },
            take: 10,
          },
        }
      }),
      
      // All subscriptions
      prisma.subscription.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      
      // All payments
      prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      
      // Achievement progress
      prisma.achievementProgress.findMany({
        where: { userId },
        include: {
          achievement: true,
        },
        orderBy: { percentage: 'desc' },
      }),
      
      // Goals
      prisma.goal.findMany({
        where: { userId },
        include: {
          milestones: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      
      // Matches
      prisma.match.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 20,
      }),
      
      // Security logs
      prisma.securityLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 50,
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
        take: 100,
      }),
      
      // Video interactions
      prisma.videoInteraction.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 50,
      }),
      
      // Drill completions
      prisma.drillCompletion.findMany({
        where: { userId },
        orderBy: { startTime: 'desc' },
        take: 50,
      }),
      
      // User sessions
      prisma.userSession.findMany({
        where: { userId: userId },
        orderBy: { startTime: 'desc' },
        take: 30,
      }),
      
      // Achievement stats
      prisma.userAchievementStats.findUnique({
        where: { userId },
      }),
    ])

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate engagement metrics
    const totalSessions = userSessions.length
    const avgSessionDuration = userSessions.length > 0
      ? userSessions
          .filter(s => s.duration)
          .reduce((sum, s) => sum + (s.duration || 0), 0) / 
        userSessions.filter(s => s.duration).length
      : 0

    const totalPageViews = pageViews.length
    const totalVideoWatched = videoInteractions.filter(v => v.interactionType === 'COMPLETE').length
    const totalDrillsCompleted = drillCompletions.filter(d => d.status === 'COMPLETED').length

    // Calculate revenue from this user
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0) / 100

    // Recent activity timeline with enhanced descriptions
    const recentActivity = await getUserActivityTimeline(userId, 50)

    // Get most viewed pages
    const pageViewCounts: { [key: string]: number } = {}
    pageViews.forEach(pv => {
      pageViewCounts[pv.path] = (pageViewCounts[pv.path] || 0) + 1
    })
    const topPages = Object.entries(pageViewCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }))

    // Navigation paths
    const navigationPaths = await prisma.navigationPath.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 50,
    })

    // Common paths
    const commonPaths: { [key: string]: number } = {}
    navigationPaths.forEach(np => {
      const pathKey = `${np.fromPath} → ${np.toPath}`
      commonPaths[pathKey] = (commonPaths[pathKey] || 0) + 1
    })
    const topNavigationPaths = Object.entries(commonPaths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }))

    // Format security logs with better timestamp handling
    const formattedSecurityLogs = securityLogs.map(log => ({
      ...log,
      timestampFormatted: formatTimestamp(log.timestamp),
      relativeTime: getRelativeTime(log.timestamp),
    }))
    
    // Format user sessions with better timestamp handling
    const formattedSessions = userSessions.slice(0, 10).map(session => ({
      ...session,
      startTimeFormatted: formatTimestamp(session.startTime),
      startTimeRelative: getRelativeTime(session.startTime),
      endTimeFormatted: session.endTime ? formatTimestamp(session.endTime) : null,
    }))

    return NextResponse.json({
      user,
      subscriptions,
      payments,
      achievements,
      achievementStats,
      goals,
      matches,
      securityLogs: formattedSecurityLogs,
      engagementMetrics: {
        totalSessions,
        avgSessionDuration: Math.round(avgSessionDuration),
        totalPageViews,
        totalVideoWatched,
        totalDrillsCompleted,
        totalRevenue,
      },
      recentActivity,
      topPages,
      topNavigationPaths,
      userSessions: formattedSessions,
      pageViews,
      videoInteractions,
      drillCompletions,
    })
  } catch (error) {
    console.error("Error fetching user details:", error)
    return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 })
  }
}
