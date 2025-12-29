
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PodcastService } from '@/lib/media-center/podcast-service';
import { SubscriptionUtils } from '@/lib/media-center/subscription-utils';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Get user's tier access
    const tierAccess = await SubscriptionUtils.getUserTierAccess(userId);
    
    const { searchParams } = new URL(request.url);
    const showId = searchParams.get('showId');
    const action = searchParams.get('action'); // 'shows' | 'episodes'

    if (action === 'shows' || !showId) {
      // Return podcast shows
      const shows = await prisma.podcastShow.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        include: {
          episodes: {
            orderBy: { publishDate: 'desc' },
            take: tierAccess.canAccessAllPodcasts ? undefined : tierAccess.maxPodcastEpisodes,
            ...(userId && {
              include: {
                userProgress: {
                  where: { userId }
                }
              }
            })
          }
        }
      });

      return NextResponse.json({
        success: true,
        shows,
        tierAccess,
        maxEpisodes: tierAccess.maxPodcastEpisodes
      });
    }

    if (showId) {
      // Return episodes for specific show
      const episodes = await PodcastService.getPodcastEpisodesForTier(
        showId, 
        tierAccess.canAccessAllPodcasts ? -1 : tierAccess.maxPodcastEpisodes
      );

      // Include user progress if logged in
      if (userId) {
        for (const episode of episodes) {
          const progress = await PodcastService.getUserPodcastProgress(userId, episode.id);
          (episode as any).userProgress = progress;
        }
      }

      return NextResponse.json({
        success: true,
        episodes,
        tierAccess,
        maxEpisodes: tierAccess.maxPodcastEpisodes,
        showUpgradePrompt: tierAccess.showUpgradePrompts && episodes.length >= tierAccess.maxPodcastEpisodes
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid request parameters'
    }, { status: 400 });

  } catch (error) {
    console.error('Error fetching podcasts:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch podcast data'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const { episodeId, lastPosition, completed } = await request.json();
    
    const progress = await PodcastService.updatePodcastProgress(
      session.user.id,
      episodeId,
      lastPosition,
      completed
    );

    return NextResponse.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('Error updating podcast progress:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update progress'
    }, { status: 500 });
  }
}
