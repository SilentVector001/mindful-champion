import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkAndAwardSimpleAchievements } from '@/lib/achievements/check-simple-achievements';

export const dynamic = 'force-dynamic';

/**
 * Check for new achievements and return them
 * This endpoint is called by the client to check for achievements
 * and display notifications when new achievements are unlocked
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { actionType } = body; // 'video' | 'practice' | 'subscription' | 'all'

    // Check and award achievements
    const result = await checkAndAwardSimpleAchievements(
      session.user.id,
      actionType || 'all'
    );

    return NextResponse.json({
      success: true,
      newAchievements: result.newAchievements,
      totalPointsEarned: result.totalPointsEarned,
      message: result.newAchievements.length > 0 
        ? `${result.newAchievements.length} new achievement${result.newAchievements.length > 1 ? 's' : ''} unlocked!`
        : 'No new achievements'
    });
  } catch (error) {
    console.error('[CheckAchievements] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check achievements',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get pending achievement notifications
 * This returns achievements that were unlocked but haven't been shown to the user yet
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prisma } = await import('@/lib/db');

    // Get achievements that were recently unlocked (within last 5 minutes)
    const recentlyUnlocked = await prisma.achievementProgress.findMany({
      where: {
        userId: session.user.id,
        percentage: 100,
        lastUpdated: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        }
      },
      include: {
        achievement: true
      },
      orderBy: {
        lastUpdated: 'desc'
      },
      take: 10
    });

    const notifications = recentlyUnlocked.map(progress => ({
      id: progress.achievement.achievementId,
      name: progress.achievement.name,
      description: progress.achievement.description,
      icon: progress.achievement.icon,
      points: progress.achievement.points,
      unlockedAt: progress.lastUpdated
    }));

    return NextResponse.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('[GetAchievementNotifications] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get achievement notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
