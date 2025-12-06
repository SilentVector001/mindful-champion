
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { LiveScoresService } from '@/lib/media-center/live-scores-service';
import { SubscriptionUtils } from '@/lib/media-center/subscription-utils';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Get user's tier access
    const tierAccess = await SubscriptionUtils.getUserTierAccess(userId);
    
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    let matches;
    
    // Always show sample data for everyone - live scores are a preview feature
    // Premium users will get real-time data when available
    try {
      if (tournamentId) {
        matches = await LiveScoresService.getTournamentMatches(tournamentId);
      } else {
        matches = await LiveScoresService.getLiveScores();
      }
      
      // If no matches returned, show sample data
      if (!matches || matches.length === 0) {
        matches = LiveScoresService.getSampleLiveScores();
      }
    } catch (err) {
      console.error('Error fetching live scores from service:', err);
      matches = LiveScoresService.getSampleLiveScores();
    }

    return NextResponse.json({
      success: true,
      matches,
      tierAccess: {
        ...tierAccess,
        canAccessLiveStreams: true, // Always allow viewing sample data
        canAccessAdvancedFeatures: tierAccess.canAccessAdvancedFeatures
      }
    });
  } catch (error) {
    console.error('Error fetching live scores:', error);
    return NextResponse.json({
      success: true, // Return success with sample data instead of error
      message: 'Showing sample data',
      matches: LiveScoresService.getSampleLiveScores()
    });
  }
}
