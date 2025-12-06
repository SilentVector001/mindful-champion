/**
 * Simple achievement checker for common user actions
 * These achievements are based on actual user activities that we track:
 * - Video uploads
 * - Practice logs
 * - Account age/login streaks
 */

import { prisma } from '@/lib/db';
import { logActivity } from '@/lib/activity-tracker';

export type SimpleAchievementType = 
  | 'FIRST_VIDEO'
  | 'VIDEO_MASTER_5'
  | 'VIDEO_MASTER_10'
  | 'FIRST_PRACTICE'
  | 'PRACTICE_WARRIOR_5'
  | 'PRACTICE_WARRIOR_10'
  | 'PRACTICE_STREAK_7'
  | 'ACCOUNT_VETERAN_30'
  | 'PRO_SUBSCRIBER';

interface SimpleAchievement {
  id: SimpleAchievementType;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  checkFunction: (userId: string) => Promise<boolean>;
}

const simpleAchievements: SimpleAchievement[] = [
  {
    id: 'FIRST_VIDEO',
    name: 'First Video Upload',
    description: 'Upload your first video for analysis',
    icon: '🎥',
    points: 10,
    category: 'video',
    checkFunction: async (userId: string) => {
      const count = await prisma.videoAnalysis.count({
        where: { userId }
      });
      return count >= 1;
    }
  },
  {
    id: 'VIDEO_MASTER_5',
    name: 'Video Master',
    description: 'Upload 5 videos for analysis',
    icon: '🎬',
    points: 50,
    category: 'video',
    checkFunction: async (userId: string) => {
      const count = await prisma.videoAnalysis.count({
        where: { userId }
      });
      return count >= 5;
    }
  },
  {
    id: 'VIDEO_MASTER_10',
    name: 'Video Expert',
    description: 'Upload 10 videos for analysis',
    icon: '🏆',
    points: 100,
    category: 'video',
    checkFunction: async (userId: string) => {
      const count = await prisma.videoAnalysis.count({
        where: { userId }
      });
      return count >= 10;
    }
  },
  {
    id: 'FIRST_PRACTICE',
    name: 'First Practice Session',
    description: 'Log your first practice session',
    icon: '📝',
    points: 10,
    category: 'practice',
    checkFunction: async (userId: string) => {
      const count = await prisma.practiceLog.count({
        where: { userId }
      });
      return count >= 1;
    }
  },
  {
    id: 'PRACTICE_WARRIOR_5',
    name: 'Practice Warrior',
    description: 'Log 5 practice sessions',
    icon: '💪',
    points: 50,
    category: 'practice',
    checkFunction: async (userId: string) => {
      const count = await prisma.practiceLog.count({
        where: { userId }
      });
      return count >= 5;
    }
  },
  {
    id: 'PRACTICE_WARRIOR_10',
    name: 'Practice Champion',
    description: 'Log 10 practice sessions',
    icon: '🥇',
    points: 100,
    category: 'practice',
    checkFunction: async (userId: string) => {
      const count = await prisma.practiceLog.count({
        where: { userId }
      });
      return count >= 10;
    }
  },
  {
    id: 'PRACTICE_STREAK_7',
    name: 'Week Streak',
    description: 'Practice for 7 consecutive days',
    icon: '🔥',
    points: 150,
    category: 'practice',
    checkFunction: async (userId: string) => {
      const logs = await prisma.practiceLog.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 30
      });
      
      if (logs.length === 0) return false;
      
      // Group logs by date
      const logsByDate = new Set<string>();
      logs.forEach(log => {
        const dateKey = log.date.toISOString().split('T')[0];
        logsByDate.add(dateKey);
      });
      
      // Count consecutive days
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let currentDate = new Date(today);
      
      while (streak < 7) {
        const dateKey = currentDate.toISOString().split('T')[0];
        if (logsByDate.has(dateKey)) {
          streak++;
        } else {
          break;
        }
        currentDate.setDate(currentDate.getDate() - 1);
      }
      
      return streak >= 7;
    }
  },
  {
    id: 'ACCOUNT_VETERAN_30',
    name: 'Veteran Champion',
    description: 'Account active for 30 days',
    icon: '🎖️',
    points: 75,
    category: 'milestone',
    checkFunction: async (userId: string) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true }
      });
      
      if (!user) return false;
      
      const daysSinceCreation = Math.floor(
        (new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return daysSinceCreation >= 30;
    }
  },
  {
    id: 'PRO_SUBSCRIBER',
    name: 'Pro Champion',
    description: 'Upgrade to PRO subscription',
    icon: '⭐',
    points: 200,
    category: 'subscription',
    checkFunction: async (userId: string) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionTier: true }
      });
      
      return user?.subscriptionTier === 'PRO' || user?.subscriptionTier === 'PREMIUM';
    }
  }
];

/**
 * Check and award achievements for a user based on a specific action
 */
export async function checkAndAwardSimpleAchievements(
  userId: string,
  actionType?: 'video' | 'practice' | 'subscription' | 'all'
): Promise<{
  newAchievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    points: number;
  }>;
  totalPointsEarned: number;
}> {
  const newAchievements: any[] = [];
  let totalPointsEarned = 0;

  try {
    // Filter achievements by action type if specified
    const achievementsToCheck = actionType && actionType !== 'all'
      ? simpleAchievements.filter(a => a.category === actionType)
      : simpleAchievements;

    for (const achievement of achievementsToCheck) {
      // Check if user already has this achievement
      const existing = await prisma.achievementProgress.findFirst({
        where: {
          userId,
          achievement: {
            achievementId: achievement.id
          }
        },
        include: {
          achievement: true
        }
      });

      // If achievement is already unlocked (percentage = 100), skip
      if (existing && existing.percentage >= 100) {
        continue;
      }

      // Check if achievement criteria is met
      const isUnlocked = await achievement.checkFunction(userId);

      if (isUnlocked) {
        // Find or create the achievement definition
        let achievementRecord = await prisma.achievement.findFirst({
          where: { achievementId: achievement.id }
        });

        if (!achievementRecord) {
          // Create achievement if it doesn't exist
          achievementRecord = await prisma.achievement.create({
            data: {
              achievementId: achievement.id,
              name: achievement.name,
              description: achievement.description,
              icon: achievement.icon,
              points: achievement.points,
              category: achievement.category.toUpperCase() as any,
              tier: achievement.points >= 100 ? 'GOLD' : achievement.points >= 50 ? 'SILVER' : 'BRONZE',
              requirement: {},
              isActive: true
            }
          });
        }

        // Update progress to 100%
        await prisma.achievementProgress.upsert({
          where: {
            userId_achievementId: {
              userId,
              achievementId: achievementRecord.id
            }
          },
          update: {
            currentValue: 1,
            targetValue: 1,
            percentage: 100
          },
          create: {
            userId,
            achievementId: achievementRecord.id,
            currentValue: 1,
            targetValue: 1,
            percentage: 100
          }
        });

        // Award points to user
        await prisma.user.update({
          where: { id: userId },
          data: {
            rewardPoints: {
              increment: achievement.points
            }
          }
        });

        // Log achievement unlock activity
        await logActivity({
          userId,
          type: 'ACHIEVEMENT_UNLOCKED',
          title: 'Achievement Unlocked!',
          description: `Unlocked: ${achievement.name}`,
          category: 'achievement',
          metadata: {
            achievementId: achievement.id,
            achievementName: achievement.name,
            points: achievement.points
          }
        });

        console.log(`🏆 Achievement unlocked: ${achievement.name} (${achievement.points} points) for user ${userId}`);

        newAchievements.push({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          points: achievement.points
        });

        totalPointsEarned += achievement.points;
      }
    }

    return {
      newAchievements,
      totalPointsEarned
    };
  } catch (error) {
    console.error('Error checking simple achievements:', error);
    return {
      newAchievements: [],
      totalPointsEarned: 0
    };
  }
}

/**
 * Initialize simple achievements in the database
 */
export async function initializeSimpleAchievements(): Promise<void> {
  try {
    for (const achievement of simpleAchievements) {
      await prisma.achievement.upsert({
        where: { achievementId: achievement.id },
        update: {
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          points: achievement.points,
          category: achievement.category.toUpperCase() as any,
          tier: achievement.points >= 100 ? 'GOLD' : achievement.points >= 50 ? 'SILVER' : 'BRONZE',
          isActive: true
        },
        create: {
          achievementId: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          points: achievement.points,
          category: achievement.category.toUpperCase() as any,
          tier: achievement.points >= 100 ? 'GOLD' : achievement.points >= 50 ? 'SILVER' : 'BRONZE',
          requirement: {},
          isActive: true
        }
      });
    }
    console.log('✅ Simple achievements initialized');
  } catch (error) {
    console.error('Error initializing simple achievements:', error);
  }
}
