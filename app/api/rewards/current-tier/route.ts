import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Get user's current tier and progress
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's current points
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { rewardPoints: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userPoints = user?.rewardPoints ?? 0;

    // Get all tiers
    const allTiers = await prisma.rewardTier.findMany({
      orderBy: { tierLevel: 'asc' }
    });

    // Find current tier (highest tier user qualifies for)
    let currentTier = null;
    let nextTier = null;

    for (let i = 0; i < (allTiers?.length ?? 0); i++) {
      const tier = allTiers?.[i];
      if (!tier) continue;
      
      if (userPoints >= (tier?.minPoints ?? 0)) {
        currentTier = tier;
        nextTier = allTiers?.[i + 1] ?? null;
      } else {
        if (!currentTier) {
          nextTier = tier; // User hasn't reached first tier yet
        }
        break;
      }
    }

    // If no tier found, default to first tier as next
    if (!currentTier && !nextTier) {
      nextTier = allTiers?.[0] ?? null;
    }

    // Calculate progress to next tier
    let progressPercentage = 0;
    let pointsToNext = 0;

    if (nextTier) {
      const tierStart = currentTier?.minPoints ?? 0;
      const tierEnd = nextTier?.minPoints ?? 0;
      const tierRange = tierEnd - tierStart;
      const userProgress = userPoints - tierStart;
      progressPercentage = tierRange > 0 ? Math.min(100, (userProgress / tierRange) * 100) : 0;
      pointsToNext = Math.max(0, tierEnd - userPoints);
    } else {
      // User is at max tier
      progressPercentage = 100;
      pointsToNext = 0;
    }

    // Get user's unlocked tiers
    const unlockedTiers = await prisma.tierUnlock.findMany({
      where: { userId: session.user.id },
      include: { tier: true },
      orderBy: { unlockedAt: 'desc' }
    });

    return NextResponse.json({
      currentTier,
      nextTier,
      userPoints,
      progressPercentage,
      pointsToNext,
      unlockedTiers,
      allTiers
    });
  } catch (error) {
    console.error('Get current tier error:', error);
    return NextResponse.json(
      { error: 'Failed to get current tier' },
      { status: 500 }
    );
  }
}
