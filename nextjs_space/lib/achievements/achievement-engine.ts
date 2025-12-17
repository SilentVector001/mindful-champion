/**
 * Achievement Engine for Mindful Champion
 * 
 * Core logic for checking, awarding, and tracking user achievements
 */

import { prisma } from '@/lib/db';

export interface EventData {
  drillId?: string;
  drillName?: string;
  category?: string;
  skillLevel?: string;
  videoId?: string;
  programId?: string;
  day?: number;
  completionCount?: number;
}

export interface AchievementUnlockResult {
  unlocked: boolean;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    tier: string;
    category: string;
    icon: string;
    points: number;
  }>;
  totalPointsEarned: number;
}

/**
 * Main function to check for achievement unlocks after an event
 */
export async function checkAchievements(
  userId: string,
  eventType: 'drill_completion' | 'video_completion' | 'program_completion',
  eventData: EventData
): Promise<AchievementUnlockResult> {
  const unlockedAchievements: any[] = [];
  let totalPoints = 0;

  try {
    // Get all active achievements
    const achievements = await prisma.achievement.findMany({
      where: { isActive: true },
    });

    // Check each achievement
    for (const achievement of achievements) {
      const requirement = achievement.requirement as any;

      // Skip if user already has this achievement
      const existing = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
      });

      if (existing) {
        continue;
      }

      // Check if achievement should be unlocked
      const shouldUnlock = await checkAchievementCriteria(
        userId,
        achievement,
        requirement,
        eventType,
        eventData
      );

      if (shouldUnlock) {
        // Award achievement
        await awardAchievement(userId, achievement.id);
        
        unlockedAchievements.push({
          id: achievement.achievementId,
          name: achievement.name,
          description: achievement.description,
          tier: achievement.tier,
          category: achievement.category,
          icon: achievement.icon || '🏆',
          points: achievement.points,
        });
        
        totalPoints += achievement.points;
      } else {
        // Update progress
        await updateAchievementProgress(
          userId,
          achievement,
          requirement,
          eventData
        );
      }
    }

    // Update user stats if achievements were unlocked
    if (unlockedAchievements.length > 0) {
      await updateUserAchievementStats(userId);
    }

    return {
      unlocked: unlockedAchievements.length > 0,
      achievements: unlockedAchievements,
      totalPointsEarned: totalPoints,
    };
  } catch (error) {
    console.error('Error checking achievements:', error);
    throw error;
  }
}

/**
 * Check if achievement criteria is met
 */
async function checkAchievementCriteria(
  userId: string,
  achievement: any,
  requirement: any,
  eventType: string,
  eventData: EventData
): Promise<boolean> {
  const { type, criteria } = requirement;

  switch (type) {
    case 'drill_completion':
      return await checkDrillCompletionCriteria(userId, criteria, eventData);

    case 'section_completion':
      return await checkSectionCompletionCriteria(userId, criteria);

    case 'level_completion':
      return await checkLevelCompletionCriteria(userId, criteria);

    case 'multi_section':
      return await checkMultiSectionCriteria(userId, criteria);

    case 'ultimate':
      return await checkUltimateCriteria(userId);

    default:
      return false;
  }
}

/**
 * Check drill completion criteria (Bronze, Silver, Gold medals)
 */
async function checkDrillCompletionCriteria(
  userId: string,
  criteria: any,
  eventData: EventData
): Promise<boolean> {
  const { category, completions } = criteria;

  // Count total drill completions in this category
  const count = await prisma.drillCompletion.count({
    where: {
      userId,
      drillCategory: category,
      status: 'COMPLETED',
    },
  });

  return count >= completions;
}

/**
 * Check section completion criteria (Category badges)
 */
async function checkSectionCompletionCriteria(
  userId: string,
  criteria: any
): Promise<boolean> {
  const { category } = criteria;

  // Get all unique drills in this category that user has completed
  const completedDrills = await prisma.drillCompletion.findMany({
    where: {
      userId,
      drillCategory: category,
      status: 'COMPLETED',
    },
    select: {
      drillId: true,
    },
    
  });

  // Count total drills in this category
  // Note: This assumes we have a comprehensive drill library
  // For now, we'll use a threshold (e.g., 10 unique drills = section complete)
  const uniqueDrillsCompleted = completedDrills.length;
  
  // Section is complete if user has done at least 10 unique drills in the category
  // This can be adjusted based on actual drill library size
  return uniqueDrillsCompleted >= 10;
}

/**
 * Check level completion criteria (Skill level badges)
 */
async function checkLevelCompletionCriteria(
  userId: string,
  criteria: any
): Promise<boolean> {
  const { skillLevel } = criteria;

  // Get all sections/categories
  const categories = [
    'serving',
    'return_of_serve',
    'dinking',
    'third_shot',
    'volleys',
    'strategy',
    'footwork',
    'mental_game',
  ];

  // Check if user has completed enough drills in each category at this skill level
  let completedSections = 0;

  for (const category of categories) {
    const drillCount = await prisma.drillCompletion.count({
      where: {
        userId,
        drillCategory: category,
        skillLevel: skillLevel,
        status: 'COMPLETED',
      },
      
    });

    // If user has at least 5 unique drills in this category at this level, consider it complete
    if (drillCount >= 5) {
      completedSections++;
    }
  }

  // Need to complete at least 6 out of 8 sections to earn level badge
  return completedSections >= 6;
}

/**
 * Check multi-section criteria (Combo badges)
 */
async function checkMultiSectionCriteria(
  userId: string,
  criteria: any
): Promise<boolean> {
  const { sections } = criteria;

  // Check if user has completed all required sections
  for (const section of sections) {
    const completed = await checkSectionCompletionCriteria(userId, {
      category: section,
    });

    if (!completed) {
      return false;
    }
  }

  return true;
}

/**
 * Check ultimate criteria (Complete everything - Crown)
 */
async function checkUltimateCriteria(userId: string): Promise<boolean> {
  // Check if user has completed all level badges
  const levelBadges = [
    'beginner_champion',
    'intermediate_master',
    'advanced_expert',
    'pro_legend',
  ];

  for (const badgeId of levelBadges) {
    const achievement = await prisma.achievement.findUnique({
      where: { achievementId: badgeId },
    });

    if (!achievement) continue;

    const userAchievement = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    if (!userAchievement) {
      return false;
    }
  }

  return true;
}

/**
 * Award achievement to user and reward points
 */
async function awardAchievement(userId: string, achievementId: string): Promise<void> {
  try {
    // Get achievement details to award correct points
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
      select: { 
        id: true, 
        name: true, 
        points: true,
        tier: true 
      }
    });

    if (!achievement) {
      console.error(`Achievement ${achievementId} not found`);
      return;
    }

    // Create achievement record and award points in a transaction
    await prisma.$transaction(async (tx: any) => {
      // Create user achievement
      await tx.userAchievement.create({
        data: {
          userId,
          achievementId,
          notified: false,
        },
      });

      // Award reward points using the points field from achievement
      await tx.user.update({
        where: { id: userId },
        data: {
          rewardPoints: {
            increment: achievement?.points ?? 0
          }
        }
      });
    });

    console.log(`🏆 Achievement awarded: ${achievement?.name ?? achievementId} (${achievement?.points ?? 0} points) to user ${userId}`);

    // Check for tier unlocks (async, don't wait)
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        email: true,
        firstName: true,
        name: true,
        rewardPoints: true 
      }
    });
    
    if (updatedUser) {
      // Import and trigger tier unlock check
      const { checkTierUnlocksForUser } = await import('@/lib/rewards/award-points');
      checkTierUnlocksForUser(userId, updatedUser).catch(console.error);
    }
  } catch (error) {
    console.error('Error awarding achievement:', error);
  }
}

/**
 * Update achievement progress for locked achievements
 */
async function updateAchievementProgress(
  userId: string,
  achievement: any,
  requirement: any,
  eventData: EventData
): Promise<void> {
  try {
    const { type, criteria } = requirement;
    let currentValue = 0;
    let targetValue = 0;

    // Calculate progress based on achievement type
    switch (type) {
      case 'drill_completion':
        const drillCount = await prisma.drillCompletion.count({
          where: {
            userId,
            drillCategory: criteria.category,
            status: 'COMPLETED',
          },
        });
        currentValue = drillCount;
        targetValue = criteria.completions || 1;
        break;

      case 'section_completion':
        const uniqueDrills = await prisma.drillCompletion.count({
          where: {
            userId,
            drillCategory: criteria.category,
            status: 'COMPLETED',
          },
          
        });
        currentValue = uniqueDrills;
        targetValue = 10; // Target for section completion
        break;

      case 'level_completion':
        const categories = [
          'serving',
          'return_of_serve',
          'dinking',
          'third_shot',
          'volleys',
          'strategy',
          'footwork',
          'mental_game',
        ];
        
        let completedSections = 0;
        for (const category of categories) {
          const count = await prisma.drillCompletion.count({
            where: {
              userId,
              drillCategory: category,
              skillLevel: criteria.skillLevel,
              status: 'COMPLETED',
            },
            
          });
          if (count >= 5) completedSections++;
        }
        
        currentValue = completedSections;
        targetValue = 6;
        break;

      default:
        return;
    }

    const percentage = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;

    // Upsert progress record
    await prisma.achievementProgress.upsert({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
      update: {
        currentValue,
        targetValue,
        percentage: Math.min(percentage, 100),
      },
      create: {
        userId,
        achievementId: achievement.id,
        currentValue,
        targetValue,
        percentage: Math.min(percentage, 100),
      },
    });
  } catch (error) {
    console.error('Error updating achievement progress:', error);
  }
}

/**
 * Update user achievement stats
 */
async function updateUserAchievementStats(userId: string): Promise<void> {
  try {
    // Count achievements by tier
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
    });

    const bronzeMedals = userAchievements.filter(
      (ua) => ua.achievement.tier === 'BRONZE'
    ).length;

    const silverMedals = userAchievements.filter(
      (ua) => ua.achievement.tier === 'SILVER'
    ).length;

    const goldMedals = userAchievements.filter(
      (ua) => ua.achievement.tier === 'GOLD'
    ).length;

    const badges = userAchievements.filter(
      (ua) => ua.achievement.tier === 'BADGE'
    ).length;

    const hasCrown = userAchievements.some(
      (ua) => ua.achievement.tier === 'CROWN'
    );

    // Calculate total points
    const totalPoints = userAchievements.reduce(
      (sum, ua) => sum + ua.achievement.points,
      0
    );

    // Determine rank based on points
    const rank = calculateRank(totalPoints);

    // Get last achievement unlock date
    const lastAchievement = userAchievements.sort(
      (a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime()
    )[0];

    // Upsert stats
    await prisma.userAchievementStats.upsert({
      where: { userId },
      update: {
        totalPoints,
        totalAchievements: userAchievements.length,
        bronzeMedals,
        silverMedals,
        goldMedals,
        badges,
        hasCrown,
        rank,
        lastAchievementUnlock: lastAchievement?.unlockedAt,
      },
      create: {
        userId,
        totalPoints,
        totalAchievements: userAchievements.length,
        bronzeMedals,
        silverMedals,
        goldMedals,
        badges,
        hasCrown,
        rank,
        lastAchievementUnlock: lastAchievement?.unlockedAt,
      },
    });
  } catch (error) {
    console.error('Error updating user achievement stats:', error);
  }
}

/**
 * Calculate user rank based on total points
 */
function calculateRank(points: number): string {
  if (points >= 3000) return 'Legendary Champion';
  if (points >= 2000) return 'Master Player';
  if (points >= 1000) return 'Expert';
  if (points >= 500) return 'Advanced';
  if (points >= 250) return 'Intermediate';
  if (points >= 100) return 'Beginner+';
  return 'Beginner';
}

/**
 * Get user's achievement progress
 */
export async function getUserAchievementProgress(userId: string) {
  try {
    const [
      unlockedAchievements,
      progressRecords,
      stats,
    ] = await Promise.all([
      prisma.userAchievement.findMany({
        where: { userId },
        include: {
          achievement: true,
        },
        orderBy: {
          unlockedAt: 'desc',
        },
      }),
      prisma.achievementProgress.findMany({
        where: { userId },
        include: {
          achievement: true,
        },
      }),
      prisma.userAchievementStats.findUnique({
        where: { userId },
      }),
    ]);

    return {
      unlocked: unlockedAchievements.map((ua) => ({
        ...ua.achievement,
        unlockedAt: ua.unlockedAt,
        notified: ua.notified,
      })),
      progress: progressRecords.map((pr) => ({
        ...pr.achievement,
        currentValue: pr.currentValue,
        targetValue: pr.targetValue,
        percentage: pr.percentage,
      })),
      stats: stats || {
        totalPoints: 0,
        totalAchievements: 0,
        bronzeMedals: 0,
        silverMedals: 0,
        goldMedals: 0,
        badges: 0,
        hasCrown: false,
        rank: 'Beginner',
      },
    };
  } catch (error) {
    console.error('Error getting user achievement progress:', error);
    throw error;
  }
}

/**
 * Mark achievement notification as seen
 */
export async function markAchievementNotified(
  userId: string,
  achievementId: string
): Promise<void> {
  try {
    const achievement = await prisma.achievement.findUnique({
      where: { achievementId },
    });

    if (!achievement) return;

    await prisma.userAchievement.update({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
      data: {
        notified: true,
      },
    });
  } catch (error) {
    console.error('Error marking achievement as notified:', error);
  }
}

/**
 * Get achievement leaderboard
 */
export async function getAchievementLeaderboard(
  limit: number = 10,
  period: 'all' | 'week' | 'month' = 'all'
) {
  try {
    const whereClause: any = {};

    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      whereClause.lastAchievementUnlock = { gte: weekAgo };
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      whereClause.lastAchievementUnlock = { gte: monthAgo };
    }

    const leaderboard = await prisma.userAchievementStats.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            skillLevel: true,
          },
        },
      },
      orderBy: {
        totalPoints: 'desc',
      },
      take: limit,
    });

    return leaderboard.map((entry, index) => ({
      position: index + 1,
      userId: entry.user.id,
      name: entry.user.name || 'Anonymous',
      image: entry.user.image,
      skillLevel: entry.user.skillLevel,
      totalPoints: entry.totalPoints,
      totalAchievements: entry.totalAchievements,
      rank: entry.rank,
      hasCrown: entry.hasCrown,
    }));
  } catch (error) {
    console.error('Error getting achievement leaderboard:', error);
    throw error;
  }
}

export default {
  checkAchievements,
  getUserAchievementProgress,
  markAchievementNotified,
  getAchievementLeaderboard,
};
