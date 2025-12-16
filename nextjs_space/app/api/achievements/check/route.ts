import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkAchievements } from '@/lib/achievements/achievement-engine';

/**
 * POST /api/achievements/check
 * Check for achievement unlocks after an event
 * 
 * Body: {
 *   eventType: 'drill_completion' | 'video_completion' | 'program_completion',
 *   eventData: {
 *     drillId?: string,
 *     drillName?: string,
 *     category?: string,
 *     skillLevel?: string,
 *     videoId?: string,
 *     programId?: string,
 *     day?: number
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { eventType, eventData } = body;

    if (!eventType || !eventData) {
      return NextResponse.json(
        { error: 'Missing eventType or eventData' },
        { status: 400 }
      );
    }

    const result = await checkAchievements(
      session.user.id,
      eventType,
      eventData
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking achievements:', error);
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    );
  }
}
