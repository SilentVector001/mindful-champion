import { prisma } from '@/lib/db';

export type ActivityType = 
  | 'VIDEO_UPLOAD'
  | 'VIDEO_ANALYSIS_COMPLETE'
  | 'PRACTICE_LOG_CREATED'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'SUBSCRIPTION_CREATED'
  | 'SUBSCRIPTION_UPGRADED'
  | 'PROFILE_UPDATED'
  | 'ACCOUNT_CREATED'
  | 'LOGIN'
  | 'LOGOUT';

export type ActivityCategory =
  | 'video'
  | 'practice'
  | 'achievement'
  | 'subscription'
  | 'profile'
  | 'auth';

interface LogActivityParams {
  userId: string;
  type: ActivityType;
  title: string;
  description: string;
  category: ActivityCategory;
  metadata?: Record<string, any>;
  sessionId?: string;
}

/**
 * Log a user activity to the database
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        description: params.description,
        category: params.category,
        metadata: params.metadata || {},
        sessionId: params.sessionId,
        timestamp: new Date()
      }
    });
    console.log(`✅ Activity logged: ${params.type} for user ${params.userId}`);
  } catch (error) {
    console.error('❌ Failed to log activity:', error);
    // Don't throw - activity logging should not break the main flow
  }
}

/**
 * Get recent activities for a user
 */
export async function getUserActivities(
  userId: string,
  limit: number = 50
) {
  try {
    return await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  } catch (error) {
    console.error('❌ Failed to fetch activities:', error);
    return [];
  }
}

/**
 * Get activity count by type for a user
 */
export async function getActivityCountByType(
  userId: string,
  type: ActivityType
): Promise<number> {
  try {
    return await prisma.activityLog.count({
      where: { userId, type }
    });
  } catch (error) {
    console.error('❌ Failed to count activities:', error);
    return 0;
  }
}

/**
 * Delete old activities (for cleanup)
 */
export async function deleteOldActivities(daysToKeep: number = 90): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const result = await prisma.activityLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    });
    
    return result.count;
  } catch (error) {
    console.error('❌ Failed to delete old activities:', error);
    return 0;
  }
}
