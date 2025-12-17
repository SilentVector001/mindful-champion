import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendRewardTierUnlockEmail } from '@/lib/email/reward-tier-unlock-email';

export const dynamic = 'force-dynamic';

// Check if user has unlocked any new tiers
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's current points
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        name: true,
        rewardPoints: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all tiers ordered by level
    const allTiers = await prisma.rewardTier.findMany({
      orderBy: { tierLevel: 'asc' }
    });

    // Get user's existing unlocks
    const existingUnlocks = await prisma.tierUnlock.findMany({
      where: { userId: user.id },
      select: { tierId: true }
    });

    const unlockedTierIds = new Set(existingUnlocks?.map?.(u => u?.tierId) ?? []);

    // Find tiers that should be unlocked but haven't been
    const newUnlocks: any[] = [];
    for (const tier of allTiers ?? []) {
      if (!tier) continue;
      
      const shouldBeUnlocked = (user?.rewardPoints ?? 0) >= (tier?.minPoints ?? 0);
      const alreadyUnlocked = unlockedTierIds?.has?.(tier?.id ?? '');

      if (shouldBeUnlocked && !alreadyUnlocked) {
        // Create tier unlock record
        const unlock = await prisma.tierUnlock.create({
          data: {
            userId: user.id,
            tierId: tier.id,
            pointsAtUnlock: user.rewardPoints,
            emailSent: false,
            celebrationShown: false
          }
        });

        // Find next tier
        const nextTier = allTiers?.find?.(t => (t?.tierLevel ?? 0) === (tier?.tierLevel ?? 0) + 1);

        // Send email notification (async, don't wait)
        const emailData = {
          email: user?.email ?? '',
          firstName: (user?.firstName ?? user?.name?.split?.(' ')?.[0] ?? 'Champion'),
          tierName: tier?.name ?? '',
          tierDisplayName: tier?.displayName ?? '',
          tierIcon: tier?.icon ?? '🏆',
          tierColor: tier?.colorPrimary ?? '#FFD700',
          pointsAtUnlock: user?.rewardPoints ?? 0,
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

        newUnlocks.push({
          ...unlock,
          tier: {
            ...tier,
            nextTierName: nextTier?.displayName,
            nextTierPoints: nextTier?.minPoints
          }
        });
      }
    }

    return NextResponse.json({ 
      hasNewUnlocks: newUnlocks?.length > 0,
      unlocks: newUnlocks
    });
  } catch (error) {
    console.error('Check tier unlock error:', error);
    return NextResponse.json(
      { error: 'Failed to check tier unlocks' },
      { status: 500 }
    );
  }
}
