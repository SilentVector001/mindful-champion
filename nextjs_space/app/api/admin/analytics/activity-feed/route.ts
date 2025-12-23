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

    // Extended to 30 days for better coverage of all activity
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    console.log('[Activity Feed] Fetching activities since:', sevenDaysAgo.toISOString())

    // Helper function for safe queries
    const safeQuery = async <T>(name: string, query: () => Promise<T>): Promise<T | []> => {
      try {
        return await query()
      } catch (e: any) {
        console.error(`[Activity Feed] Query "${name}" failed:`, e?.message || e)
        return [] as any
      }
    }

    // Fetch various activities - each query wrapped safely
    const [recentActivityLogs, recentSignups, recentVideos, recentMatches, recentGoals, recentChats, recentPayments, recentTrainingProgress] = await Promise.all([
      safeQuery('activityLog', () => prisma.activityLog.findMany({
        where: { timestamp: { gte: thirtyDaysAgo } },
        orderBy: { timestamp: 'desc' },
        take: 50,
        include: { user: { select: { id: true, name: true, firstName: true, lastName: true, email: true } } }
      })),
      
      safeQuery('users', () => prisma.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        orderBy: { createdAt: 'desc' },
        take: 30,
        select: { id: true, name: true, firstName: true, lastName: true, email: true, createdAt: true, subscriptionTier: true }
      })),

      safeQuery('videoAnalysis', () => prisma.videoAnalysis.findMany({
        where: { uploadedAt: { gte: sevenDaysAgo } },
        orderBy: { uploadedAt: 'desc' },
        take: 20,
        include: { user: { select: { id: true, name: true, firstName: true, lastName: true, email: true } } }
      })),

      safeQuery('match', () => prisma.match.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { user: { select: { id: true, name: true, firstName: true, lastName: true, email: true } } }
      })),

      safeQuery('goal', () => prisma.goal.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { user: { select: { id: true, name: true, firstName: true, lastName: true, email: true } } }
      })),

      safeQuery('aIConversation', () => prisma.aIConversation.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { user: { select: { id: true, name: true, firstName: true, lastName: true, email: true } } }
      })),

      safeQuery('payment', () => prisma.payment.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { user: { select: { id: true, name: true, firstName: true, lastName: true, email: true } } }
      })),
      
      safeQuery('userProgram', () => prisma.userProgram.findMany({
        where: { completedAt: { not: null, gte: thirtyDaysAgo } },
        orderBy: { completedAt: 'desc' },
        take: 30,
        include: {
          user: { select: { id: true, name: true, firstName: true, lastName: true, email: true } },
          program: { select: { name: true } }
        }
      }))
    ])

    // Combine and format all activities
    const activities: any[] = []

    // Add activity logs (from the new ActivityLog table)
    recentActivityLogs.forEach((log: any) => {
      const userName = log.user?.name || 
        `${log.user?.firstName || ''} ${log.user?.lastName || ''}`.trim() || 
        log.user?.email || 'User'
      
      activities.push({
        id: `activity-log-${log.id}`,
        type: log.type?.toLowerCase() || 'activity',
        userId: log.userId,
        userEmail: log.user?.email || null,
        userName: userName,
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

    // Add training program completions
    (recentTrainingProgress as any[] ?? []).forEach((progress: any) => {
      activities.push({
        id: `training-${progress.id}`,
        type: 'training_complete',
        userId: progress.user?.id,
        userEmail: progress.user?.email,
        userName: progress.user?.name || `${progress.user?.firstName || ''} ${progress.user?.lastName || ''}`.trim() || progress.user?.email || 'User',
        description: `Completed training in ${progress.program?.name || 'Training Program'}`,
        details: `Training Progress`,
        createdAt: progress.completedAt,
        timeAgo: getTimeAgo(progress.completedAt)
      })
    })

    // Sort by most recent
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Take top 50
    const topActivities = activities.slice(0, 50)

    console.log('[Activity Feed] Summary:')
    console.log('  - Current time:', new Date().toISOString())
    console.log('  - Fetching since (30 days):', thirtyDaysAgo.toISOString())
    console.log('  - Activity Logs:', recentActivityLogs.length)
    console.log('  - Signups:', recentSignups.length)
    console.log('  - Videos:', recentVideos.length)
    console.log('  - Matches:', recentMatches.length)
    console.log('  - Goals:', recentGoals.length)
    console.log('  - Chats:', recentChats.length)
    console.log('  - Payments:', recentPayments.length)
    console.log('  - Training Progress:', (recentTrainingProgress as any[] ?? []).length)
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
        payments: recentPayments.length,
        trainingProgress: recentTrainingProgress.length
      },
      meta: {
        fetchedAt: new Date().toISOString(),
        oldestActivityDate: thirtyDaysAgo.toISOString(),
        mostRecentActivity: topActivities.length > 0 ? {
          type: topActivities[0].type,
          createdAt: topActivities[0].createdAt,
          ageInHours: Math.floor((Date.now() - new Date(topActivities[0].createdAt).getTime()) / (1000 * 60 * 60))
        } : null
      }
    })
  } catch (error: any) {
    console.error('[Activity Feed] Error fetching activity feed:', error)
    console.error('[Activity Feed] Error stack:', error?.stack)
    console.error('[Activity Feed] Error name:', error?.name)
    console.error('[Activity Feed] Error code:', error?.code)
    
    // Check for specific Prisma errors
    const isPrismaError = error?.name?.includes('Prisma') || error?.code?.startsWith('P')
    const errorMessage = isPrismaError 
      ? `Database error: ${error?.code || 'Unknown'} - ${error?.meta?.cause || error?.message || 'Query failed'}`
      : (error instanceof Error ? error.message : 'Unknown error')
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch activity feed', 
        details: errorMessage,
        errorType: error?.name || 'Unknown',
        timestamp: new Date().toISOString()
      },
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
