/**
 * Enhanced Activity Tracking Utilities
 * Provides consistent timestamp handling and detailed activity descriptions
 */

import { prisma } from './db'

export type ActivityType = 
  | 'page_view'
  | 'navigation'
  | 'video_interaction'
  | 'drill_completion'
  | 'security_event'
  | 'authentication'
  | 'subscription_change'
  | 'payment'
  | 'achievement_unlock'
  | 'goal_milestone'
  | 'match_record'
  | 'feature_interaction'

export interface ActivityDescription {
  title: string
  description: string
  category: string
  metadata?: Record<string, any>
}

/**
 * Get current UTC timestamp
 */
export function getCurrentTimestamp(): Date {
  return new Date()
}

/**
 * Format timestamp consistently for display
 */
export function formatTimestamp(date: Date | string, includeTime: boolean = true): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }
  
  if (includeTime) {
    return d.toLocaleString('en-US', { ...dateOptions, ...timeOptions })
  }
  
  return d.toLocaleDateString('en-US', dateOptions)
}

/**
 * Get relative time description (e.g., "2 hours ago", "3 days ago")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffSeconds < 60) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? 's' : ''} ago`
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) !== 1 ? 's' : ''} ago`
}

/**
 * Generate detailed activity description based on type and data
 */
export function getActivityDescription(type: ActivityType, data: any): ActivityDescription {
  switch (type) {
    case 'page_view':
      return {
        title: 'Page Viewed',
        description: `Visited ${data.title || data.path}`,
        category: 'Navigation',
        metadata: {
          path: data.path,
          duration: data.duration ? `${Math.round(data.duration / 1000)}s` : null,
          referrer: data.referrer,
        }
      }
      
    case 'navigation':
      return {
        title: 'Navigation Path',
        description: `Navigated from ${data.fromPath} to ${data.toPath}`,
        category: 'Navigation',
        metadata: {
          sequence: data.sequence,
        }
      }
      
    case 'video_interaction':
      const videoAction = data.interactionType === 'START' ? 'Started watching' :
                         data.interactionType === 'PAUSE' ? 'Paused' :
                         data.interactionType === 'RESUME' ? 'Resumed' :
                         data.interactionType === 'COMPLETE' ? 'Completed' :
                         data.interactionType === 'SKIP' ? 'Skipped' : 'Interacted with'
      
      return {
        title: 'Video Interaction',
        description: `${videoAction} "${data.videoTitle || 'Video'}"`,
        category: 'Training',
        metadata: {
          videoId: data.videoId,
          watchPercentage: data.watchPercentage ? `${Math.round(data.watchPercentage)}%` : null,
          currentTime: data.currentTime,
          totalDuration: data.totalDuration,
        }
      }
      
    case 'drill_completion':
      return {
        title: 'Drill Activity',
        description: `${data.status === 'COMPLETED' ? 'Completed' : 
                        data.status === 'IN_PROGRESS' ? 'Started' : 
                        'Attempted'} drill: "${data.drillName}"`,
        category: 'Training',
        metadata: {
          drillCategory: data.drillCategory,
          skillLevel: data.skillLevel,
          timeSpent: data.timeSpent ? `${Math.round(data.timeSpent / 60)}m` : null,
          performanceScore: data.performanceScore,
        }
      }
      
    case 'security_event':
      return {
        title: 'Security Event',
        description: data.description || data.eventType.replace(/_/g, ' '),
        category: 'Security',
        metadata: {
          severity: data.severity,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          eventType: data.eventType,
        }
      }
      
    case 'authentication':
      const authAction = data.eventType === 'SUCCESSFUL_LOGIN' ? 'Logged in' :
                        data.eventType === 'FAILED_LOGIN' ? 'Failed login attempt' :
                        data.eventType === 'LOGOUT' ? 'Logged out' :
                        data.eventType === 'PASSWORD_RESET' ? 'Reset password' :
                        'Authentication event'
      
      return {
        title: 'Authentication',
        description: authAction,
        category: 'Security',
        metadata: {
          ipAddress: data.ipAddress,
          deviceType: data.deviceType,
          browser: data.browser,
        }
      }
      
    case 'subscription_change':
      return {
        title: 'Subscription Change',
        description: `Subscription ${data.action || 'updated'}: ${data.tier} (${data.status})`,
        category: 'Account',
        metadata: {
          previousTier: data.previousTier,
          newTier: data.tier,
          billingCycle: data.billingCycle,
        }
      }
      
    case 'payment':
      return {
        title: 'Payment',
        description: `Payment ${data.status}: $${(data.amount / 100).toFixed(2)}`,
        category: 'Billing',
        metadata: {
          subscriptionTier: data.subscriptionTier,
          billingCycle: data.billingCycle,
          paymentIntentId: data.stripePaymentIntentId,
        }
      }
      
    case 'achievement_unlock':
      return {
        title: 'Achievement Unlocked',
        description: `Unlocked "${data.achievementName}"`,
        category: 'Progress',
        metadata: {
          points: data.points,
          type: data.type,
        }
      }
      
    case 'goal_milestone':
      return {
        title: 'Goal Milestone',
        description: `Reached milestone in goal: "${data.goalName}"`,
        category: 'Progress',
        metadata: {
          currentValue: data.currentValue,
          targetValue: data.targetValue,
          percentage: data.percentage,
        }
      }
      
    case 'match_record':
      return {
        title: 'Match Recorded',
        description: `Recorded ${data.result === 'WIN' ? 'win' : 
                              data.result === 'LOSS' ? 'loss' : 
                              'match'} (${data.userScore}-${data.opponentScore})`,
        category: 'Performance',
        metadata: {
          matchType: data.matchType,
          opponent: data.opponentName,
          location: data.location,
        }
      }
      
    case 'feature_interaction':
      return {
        title: 'Feature Used',
        description: `Used feature: ${data.featureName}`,
        category: 'Engagement',
        metadata: {
          action: data.action,
          context: data.context,
        }
      }
      
    default:
      return {
        title: 'Activity',
        description: 'User activity',
        category: 'General',
        metadata: data,
      }
  }
}

/**
 * Create a comprehensive activity log entry
 */
export async function logActivity(
  userId: string,
  type: ActivityType,
  data: any,
  sessionId?: string
) {
  const timestamp = getCurrentTimestamp()
  const description = getActivityDescription(type, data)
  
  try {
    // Create a generic activity log entry
    await prisma.activityLog.create({
      data: {
        userId,
        sessionId,
        type,
        title: description.title,
        description: description.description,
        category: description.category,
        metadata: description.metadata || {},
        timestamp,
      }
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}

/**
 * Get user activity timeline with enhanced descriptions
 */
export async function getUserActivityTimeline(
  userId: string,
  limit: number = 50
) {
  try {
    // Get all activity types
    const [
      pageViews,
      navigationPaths,
      videoInteractions,
      drillCompletions,
      securityLogs,
      userSessions,
    ] = await Promise.all([
      prisma.pageView.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit,
      }),
      prisma.navigationPath.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit,
      }),
      prisma.videoInteraction.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit,
      }),
      prisma.drillCompletion.findMany({
        where: { userId },
        orderBy: { startTime: 'desc' },
        take: limit,
      }),
      prisma.securityLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit,
      }),
      prisma.userSession.findMany({
        where: { userId },
        orderBy: { startTime: 'desc' },
        take: limit,
      }),
    ])
    
    // Combine and sort all activities
    const activities = [
      ...pageViews.map((pv: any) => ({
        type: 'page_view' as ActivityType,
        timestamp: pv.timestamp,
        data: pv,
      })),
      ...navigationPaths.map((np: any) => ({
        type: 'navigation' as ActivityType,
        timestamp: np.timestamp,
        data: np,
      })),
      ...videoInteractions.map((vi: any) => ({
        type: 'video_interaction' as ActivityType,
        timestamp: vi.timestamp,
        data: vi,
      })),
      ...drillCompletions.map((dc: any) => ({
        type: 'drill_completion' as ActivityType,
        timestamp: dc.startTime,
        data: dc,
      })),
      ...securityLogs.map((sl: any) => ({
        type: 'security_event' as ActivityType,
        timestamp: sl.timestamp,
        data: sl,
      })),
      ...userSessions.map((us: any) => ({
        type: 'authentication' as ActivityType,
        timestamp: us.startTime,
        data: {
          eventType: 'SUCCESSFUL_LOGIN',
          ...us,
        },
      })),
    ]
    
    // Sort by timestamp (newest first) and limit
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
      .map(activity => ({
        ...activity,
        ...getActivityDescription(activity.type, activity.data),
        timestampFormatted: formatTimestamp(activity.timestamp),
        relativeTime: getRelativeTime(activity.timestamp),
      }))
  } catch (error) {
    console.error('Failed to get user activity timeline:', error)
    return []
  }
}
