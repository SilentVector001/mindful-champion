import { NextRequest, NextResponse } from 'next/server'
export const dynamic = "force-dynamic";
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get activity data from the last 7 days (extended from 24 hours for better visibility)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    console.log('[Activity Feed] Fetching activities since:', sevenDaysAgo.toISOString())

    // Fetch various activities
    const [recentActivityLogs, recentSignups, recentVideos, recentMatches, recentGoals, recentChats, recentPayments] = await Promise.all([
      // Recent activity logs (NEW - captures all logged activities)
      prisma.activityLog.findMany({
        where: { timestamp: { gte: sevenDaysAgo } },
        orderBy: { timestamp: 'desc' },
        take: 50
      }),
      // Recent signups
      prisma.user.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          subscriptionTier: true
        }
      }),

      // Recent video uploads
      prisma.videoAnalysis.findMany({
        where: { uploadedAt: { gte: sevenDaysAgo } },
        orderBy: { uploadedAt: 'desc' },
        take: 20,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),

      // Recent matches
      prisma.match.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),

      // Recent goals
      prisma.goal.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),

      // Recent coach conversations
      prisma.aIConversation.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),

      // Recent payments/subscriptions
      prisma.payment.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })
    ])

    // Combine and format all activities
    const activities: any[] = []

    // Add activity logs (from the new ActivityLog table)
    recentActivityLogs.forEach((log: any) => {
      // Get user info if userId exists
      activities.push({
        id: `activity-log-${log.id}`,
        type: log.type?.toLowerCase() || 'activity',
        userId: log.userId,
        userEmail: null, // Will be populated if needed
        userName: 'User', // Will be populated if needed
        description: log.description || log.title,
        details: log.category,
        createdAt: log.timestamp,
        timeAgo: getTimeAgo(log.timestamp)
      })
    })

    // Add signups
    recentSignups.forEach((user: any) => {
      activities.push({
        id: `signup-${user.id}`,
        type: 'signup',
        userId: user.id,
        userEmail: user.email,
        userName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        description: `Joined the platform${user.subscriptionTier ? ` as ${user.subscriptionTier}` : ''}`,
        details: user.email,
        createdAt: user.createdAt,
        timeAgo: getTimeAgo(user.createdAt)
      })
    })

    // Add video uploads
    recentVideos.forEach((video: any) => {
      activities.push({
        id: `video-${video.id}`,
        type: 'video_upload',
        userId: video.user?.id,
        userEmail: video.user?.email,
        userName: video.user?.name || `${video.user?.firstName || ''} ${video.user?.lastName || ''}`.trim() || video.user?.email || 'User',
        description: `Uploaded video: ${video.title}`,
        details: `${Math.round(video.duration / 60)} min • ${video.analysisStatus}`,
        createdAt: video.uploadedAt,
        timeAgo: getTimeAgo(video.uploadedAt)
      })
    })

    // Add matches
    recentMatches.forEach((match: any) => {
      const result = match.result === 'WIN' ? '🏆 Won' : match.result === 'LOSS' ? 'Lost' : 'Drew'
      activities.push({
        id: `match-${match.id}`,
        type: 'match',
        userId: match.user?.id,
        userEmail: match.user?.email,
        userName: match.user?.name || `${match.user?.firstName || ''} ${match.user?.lastName || ''}`.trim() || match.user?.email || 'User',
        description: `Recorded a match • ${result}`,
        details: `${match.playerScore}-${match.opponentScore} • ${match.matchType || 'Singles'}`,
        createdAt: match.createdAt,
        timeAgo: getTimeAgo(match.createdAt)
      })
    })

    // Add goals
    recentGoals.forEach((goal: any) => {
      activities.push({
        id: `goal-${goal.id}`,
        type: 'goal_created',
        userId: goal.user?.id,
        userEmail: goal.user?.email,
        userName: goal.user?.name || `${goal.user?.firstName || ''} ${goal.user?.lastName || ''}`.trim() || goal.user?.email || 'User',
        description: `Set a new goal: ${goal.title}`,
        details: `Target: ${new Date(goal.targetDate).toLocaleDateString()}`,
        createdAt: goal.createdAt,
        timeAgo: getTimeAgo(goal.createdAt)
      })
    })

    // Add chat conversations
    recentChats.forEach((chat: any) => {
      activities.push({
        id: `chat-${chat.id}`,
        type: 'chat',
        userId: chat.user?.id,
        userEmail: chat.user?.email,
        userName: chat.user?.name || `${chat.user?.firstName || ''} ${chat.user?.lastName || ''}`.trim() || chat.user?.email || 'User',
        description: `Started a conversation with Coach Kai`,
        details: `${(chat.messages as any[])?.length || 0} messages`,
        createdAt: chat.createdAt,
        timeAgo: getTimeAgo(chat.createdAt)
      })
    })

    // Add payments
    recentPayments.forEach((payment: any) => {
      activities.push({
        id: `payment-${payment.id}`,
        type: 'subscription',
        userId: payment.user?.id,
        userEmail: payment.user?.email,
        userName: payment.user?.name || `${payment.user?.firstName || ''} ${payment.user?.lastName || ''}`.trim() || payment.user?.email || 'User',
        description: `Subscribed to ${payment.subscriptionTier}`,
        details: `$${((payment.amount || 0) / 100).toFixed(2)} • ${payment.billingCycle || 'One-time'}`,
        createdAt: payment.createdAt,
        timeAgo: getTimeAgo(payment.createdAt)
      })
    })

    // Sort by most recent
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Take top 50
    const topActivities = activities.slice(0, 50)

    console.log('[Activity Feed] Summary:')
    console.log('  - Current time:', new Date().toISOString())
    console.log('  - Fetching activities since:', sevenDaysAgo.toISOString())
    console.log('  - Activity Logs:', recentActivityLogs.length, '(NEW)')
    console.log('  - Signups:', recentSignups.length)
    console.log('  - Videos:', recentVideos.length)
    console.log('  - Matches:', recentMatches.length)
    console.log('  - Goals:', recentGoals.length)
    console.log('  - Chats:', recentChats.length)
    console.log('  - Payments:', recentPayments.length)
    console.log('  - Total activities:', activities.length)
    console.log('  - Returning:', topActivities.length, 'activities')
    
    // Log most recent activity timestamp for debugging
    if (topActivities.length > 0) {
      console.log('  - Most recent activity:', topActivities[0].type, 'at', new Date(topActivities[0].createdAt).toISOString())
      console.log('  - Most recent activity age (hours):', Math.floor((Date.now() - new Date(topActivities[0].createdAt).getTime()) / (1000 * 60 * 60)))
    }

    return NextResponse.json({
      success: true,
      activities: topActivities,
      total: activities.length,
      breakdown: {
        activityLogs: recentActivityLogs.length,
        signups: recentSignups.length,
        videos: recentVideos.length,
        matches: recentMatches.length,
        goals: recentGoals.length,
        chats: recentChats.length,
        payments: recentPayments.length
      },
      meta: {
        fetchedAt: new Date().toISOString(),
        oldestActivityDate: sevenDaysAgo.toISOString(),
        mostRecentActivity: topActivities.length > 0 ? {
          type: topActivities[0].type,
          createdAt: topActivities[0].createdAt,
          ageInHours: Math.floor((Date.now() - new Date(topActivities[0].createdAt).getTime()) / (1000 * 60 * 60))
        } : null
      }
    })
  } catch (error) {
    console.error('[Activity Feed] Error fetching activity feed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity feed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays}d ago`
}
