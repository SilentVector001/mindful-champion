export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/achievements
 * Get all achievement definitions, optionally filtered by category or tier
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tier = searchParams.get('tier');
    const userId = searchParams.get('userId') || session?.user?.id;

    // Build where clause
    const where: any = { isActive: true };
    if (category) where.category = category;
    if (tier) where.tier = tier;

    // Get achievements
    const achievements = await prisma.achievement.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    // If userId provided, include user's progress
    if (userId) {
      const [userAchievements, progressRecords] = await Promise.all([
        prisma.userAchievement.findMany({
          where: { userId },
          select: { achievementId: true, unlockedAt: true },
        }),
        prisma.achievementProgress.findMany({
          where: { userId },
          select: {
            achievementId: true,
            currentValue: true,
            targetValue: true,
            percentage: true,
          },
        }),
      ]);

      // Create lookup maps
      const unlockedMap = new Map(
        userAchievements.map((ua: any) => [ua.achievementId, ua.unlockedAt])
      );
      const progressMap = new Map(
        progressRecords.map((pr: any) => [pr.achievementId, pr])
      );

      // Enrich achievements with user data
      const enrichedAchievements = achievements.map((achievement: any) => ({
        ...achievement,
        unlocked: unlockedMap.has(achievement.id),
        unlockedAt: unlockedMap.get(achievement.id),
        progress: progressMap.get(achievement.id),
      }));

      return NextResponse.json({ achievements: enrichedAchievements });
    }

    return NextResponse.json({ achievements });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
