
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { WearableService } from '@/lib/wearables/wearable-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wearables/insights
 * Get health insights for Coach Kai
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const insights = await WearableService.getHealthInsightsForCoach(session.user.id);

    if (!insights) {
      return NextResponse.json(
        { error: 'No health data available' },
        { status: 404 }
      );
    }

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error fetching health insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health insights' },
      { status: 500 }
    );
  }
}
