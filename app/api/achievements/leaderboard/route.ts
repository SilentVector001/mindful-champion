
import { NextRequest, NextResponse } from 'next/server';
import { getAchievementLeaderboard } from '@/lib/achievements/achievement-engine';

export const dynamic = "force-dynamic";

/**
 * GET /api/achievements/leaderboard
 * Get achievement leaderboard
 * 
 * Query params:
 * - limit: number (default: 10)
 * - period: 'all' | 'week' | 'month' (default: 'all')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const period = (searchParams.get('period') || 'all') as 'all' | 'week' | 'month';

    const leaderboard = await getAchievementLeaderboard(limit, period);

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
