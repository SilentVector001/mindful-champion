
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { markAchievementNotified } from '@/lib/achievements/achievement-engine';

/**
 * PATCH /api/achievements/notification
 * Mark achievement notification as seen
 * 
 * Body: { achievementId: string }
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { achievementId } = body;

    if (!achievementId) {
      return NextResponse.json(
        { error: 'Missing achievementId' },
        { status: 400 }
      );
    }

    await markAchievementNotified(session.user.id, achievementId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking achievement notification:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification' },
      { status: 500 }
    );
  }
}
