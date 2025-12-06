
import { prisma } from './db';
import { checkTierUnlocksForUser } from './rewards/award-points';

export async function awardAchievement(userId: string, achievementId: string) {
  try {
    // Check if user already has this achievement
    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId,
        },
      },
    });

    if (existing) {
      return { success: false, message: 'Achievement already unlocked' };
    }

    // Get achievement details
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) {
      return { success: false, message: 'Achievement not found' };
    }

    // Use the actual points value from the achievement
    const pointsToAward = achievement?.points ?? 0;

    // Award achievement and points in a transaction
    await prisma.$transaction(async (tx: any) => {
      // Create user achievement
      await tx.userAchievement.create({
        data: {
          userId,
          achievementId,
        },
      });

      // Award reward points
      await tx.user.update({
        where: { id: userId },
        data: {
          rewardPoints: {
            increment: pointsToAward,
          },
        },
      });

      // Update achievement stats
      await tx.userAchievementStats.upsert({
        where: { userId },
        create: {
          userId,
          totalPoints: pointsToAward,
          totalAchievements: 1,
          bronzeMedals: achievement.tier === 'BRONZE' ? 1 : 0,
          silverMedals: achievement.tier === 'SILVER' ? 1 : 0,
          goldMedals: achievement.tier === 'GOLD' ? 1 : 0,
        },
        update: {
          totalPoints: {
            increment: pointsToAward,
          },
          totalAchievements: {
            increment: 1,
          },
          bronzeMedals: achievement.tier === 'BRONZE' ? { increment: 1 } : undefined,
          silverMedals: achievement.tier === 'SILVER' ? { increment: 1 } : undefined,
          goldMedals: achievement.tier === 'GOLD' ? { increment: 1 } : undefined,
          lastAchievementUnlock: new Date(),
        },
      });
    });

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
      checkTierUnlocksForUser(userId, updatedUser).catch(console.error);
    }

    return {
      success: true,
      achievement,
      pointsAwarded: pointsToAward,
    };
  } catch (error) {
    console.error('Error awarding achievement:', error);
    return { success: false, message: 'Failed to award achievement' };
  }
}
