
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PodcastService } from '@/lib/media-center/podcast-service';
import { EventsService } from '@/lib/media-center/events-service';
import { LiveStreamService } from '@/lib/media-center/live-stream-service';
import { ApiCache } from '@/lib/media-center/api-cache';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admins to trigger full sync
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: 'Admin access required'
      }, { status: 403 });
    }

    const { action } = await request.json();
    
    switch (action) {
      case 'podcasts':
        await PodcastService.syncAllPodcastFeeds();
        return NextResponse.json({
          success: true,
          message: 'Podcast sync completed'
        });

      case 'events':
        await EventsService.syncUpcomingEvents();
        return NextResponse.json({
          success: true,
          message: 'Events sync completed'
        });

      case 'live-streams':
        await LiveStreamService.syncLiveStreams();
        return NextResponse.json({
          success: true,
          message: 'Live streams sync completed'
        });

      case 'cache-cleanup':
        await ApiCache.cleanup();
        return NextResponse.json({
          success: true,
          message: 'Cache cleanup completed'
        });

      case 'full-sync':
        // Run all sync operations
        await Promise.all([
          PodcastService.syncAllPodcastFeeds(),
          EventsService.syncUpcomingEvents(),
          LiveStreamService.syncLiveStreams()
        ]);
        
        // Clean up expired cache entries
        await ApiCache.cleanup();
        
        return NextResponse.json({
          success: true,
          message: 'Full sync completed'
        });

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid sync action'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Error during sync operation:', error);
    return NextResponse.json({
      success: false,
      message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: 'Admin access required'
      }, { status: 403 });
    }

    // Return sync status information
    const cacheStats = await prisma.apiCache.groupBy({
      by: ['cacheKey'],
      _count: true,
      where: {
        expiresAt: {
          gt: new Date()
        }
      }
    });

    const podcastStats = await prisma.podcastShow.count({
      where: { isActive: true }
    });

    const eventStats = await prisma.externalEvent.count({
      where: { 
        isActive: true,
        startDate: { gte: new Date() }
      }
    });

    const liveStreamStats = await prisma.liveStream.count();

    return NextResponse.json({
      success: true,
      stats: {
        activeCacheEntries: cacheStats.length,
        activePodcastShows: podcastStats,
        upcomingEvents: eventStats,
        liveStreams: liveStreamStats
      },
      lastSyncTimes: {
        // These would be stored in a separate sync log table in a real implementation
        podcasts: 'Manual sync required',
        events: 'Manual sync required',
        liveStreams: 'Manual sync required'
      }
    });

  } catch (error) {
    console.error('Error fetching sync status:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch sync status'
    }, { status: 500 });
  }
}
