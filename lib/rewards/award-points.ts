import { prisma } from '@/lib/db';

/**
 * Award points to a user and check for tier unlocks
 * @param userId - The user's ID
 * @param points - Number of points to award
 * @param reason - Reason for awarding points (for logging)
 * @returns Updated user points
 */
export async function awardPoints(
  userId: string,
  points: number,
  reason?: string
): Promise<{ success: boolean; newTotal: number; error?: string }> {
  try {
    // Update user points
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        rewardPoints: {
          increment: points
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        name: true,
        rewardPoints: true
      }
    });

    console.log(`✅ Awarded ${points} points to user ${userId}. New total: ${updatedUser?.rewardPoints ?? 0}. Reason: ${reason ?? 'N/A'}`);

    // Check for tier unlocks (async, don't wait)
    checkTierUnlocksForUser(userId, updatedUser).catch(console.error);

    return {
      success: true,
      newTotal: updatedUser?.rewardPoints ?? 0
    };
  } catch (error) {
    console.error('Error awarding points:', error);
    return {
      success: false,
      newTotal: 0,
      error: 'Failed to award points'
    };
  }
}

/**
 * Check if user has unlocked any new tiers and send notifications
 * Exported so it can be called from achievement engine
 */
export async function checkTierUnlocksForUser(userId: string, user: any) {
  try {
    // Get all tiers
    const allTiers = await prisma.rewardTier.findMany({
      orderBy: { tierLevel: 'asc' }
    });

    // Get user's existing unlocks
    const existingUnlocks = await prisma.tierUnlock.findMany({
      where: { userId },
      select: { tierId: true }
    });

    const unlockedTierIds = new Set(existingUnlocks?.map?.(u => u?.tierId) ?? []);
    const userPoints = user?.rewardPoints ?? 0;

    // Find tiers that should be unlocked but haven't been
    for (const tier of allTiers ?? []) {
      if (!tier) continue;
      
      const shouldBeUnlocked = userPoints >= (tier?.minPoints ?? 0);
      const alreadyUnlocked = unlockedTierIds?.has?.(tier?.id ?? '');

      if (shouldBeUnlocked && !alreadyUnlocked) {
        // Create tier unlock record
        const unlock = await prisma.tierUnlock.create({
          data: {
            userId,
            tierId: tier.id,
            pointsAtUnlock: userPoints,
            emailSent: false,
            celebrationShown: false
          }
        });

        console.log(`🎉 User ${userId} unlocked tier: ${tier?.displayName ?? ''}`);

        // Send email notification (async, don't wait)
        const { sendRewardTierUnlockEmail } = await import('@/lib/email/reward-tier-unlock-email');
        
        const nextTier = allTiers?.find?.(t => (t?.tierLevel ?? 0) === (tier?.tierLevel ?? 0) + 1);

        const emailData = {
          email: user?.email ?? '',
          firstName: (user?.firstName ?? user?.name?.split?.(' ')?.[0] ?? 'Champion'),
          tierName: tier?.name ?? '',
          tierDisplayName: tier?.displayName ?? '',
          tierIcon: tier?.icon ?? '🏆',
          tierColor: tier?.colorPrimary ?? '#FFD700',
          pointsAtUnlock: userPoints,
          benefits: (tier?.benefits as string[]) ?? [],
          nextTierName: nextTier?.displayName,
          nextTierPoints: nextTier?.minPoints
        };

        sendRewardTierUnlockEmail(emailData)
          .then(() => {
            // Mark email as sent
            prisma.tierUnlock.update({
              where: { id: unlock?.id },
              data: { 
                emailSent: true, 
                emailSentAt: new Date() 
              }
            }).catch(console.error);
          })
          .catch(console.error);
      }
    }
  } catch (error) {
    console.error('Error checking tier unlocks:', error);
  }
}

/**
 * Deduct points from a user (for redemptions)
 */
export async function deductPoints(
  userId: string,
  points: number,
  reason?: string
): Promise<{ success: boolean; newTotal: number; error?: string }> {
  try {
    // Check if user has enough points
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { rewardPoints: true }
    });

    if (!user || (user?.rewardPoints ?? 0) < points) {
      return {
        success: false,
        newTotal: user?.rewardPoints ?? 0,
        error: 'Insufficient points'
      };
    }

    // Deduct points
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        rewardPoints: {
          decrement: points
        }
      },
      select: { rewardPoints: true }
    });

    console.log(`💸 Deducted ${points} points from user ${userId}. New total: ${updatedUser?.rewardPoints ?? 0}. Reason: ${reason ?? 'N/A'}`);

    return {
      success: true,
      newTotal: updatedUser?.rewardPoints ?? 0
    };
  } catch (error) {
    console.error('Error deducting points:', error);
    return {
      success: false,
      newTotal: 0,
      error: 'Failed to deduct points'
    };
  }
}
