/**
 * Feed Status API
 * Returns health status for all LiveStream entries
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkMultipleStreamHealth, StreamHealthStatus } from '@/lib/media-center/feed-health-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const streamIds = searchParams.get('streamIds')?.split(',');

    // Fetch live streams from database
    const streams = await prisma.liveStream.findMany({
      where: streamIds ? {
        id: {
          in: streamIds
        }
      } : {
        status: {
          in: ['LIVE', 'UPCOMING']
        }
      },
      select: {
        id: true,
        title: true,
        streamUrl: true,
        platform: true,
        status: true,
        viewerCount: true,
        scheduledAt: true,
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    });

    // Check health for all streams
    const healthChecks = streams.map(stream => ({
      id: stream.id,
      streamUrl: stream.streamUrl,
      platform: stream.platform
    }));

    const healthStatuses = await checkMultipleStreamHealth(healthChecks);

    // Combine stream data with health status
    const results = streams.map((stream, index) => {
      const health = healthStatuses[index];
      
      return {
        streamId: stream.id,
        title: stream.title,
        platform: stream.platform,
        status: health.status,
        lastChecked: health.lastChecked,
        viewerCount: health.viewerCount || stream.viewerCount || 0,
        errorMessage: health.errorMessage,
        connectionQuality: health.connectionQuality,
        scheduledAt: stream.scheduledAt,
        isLive: stream.status === 'LIVE',
        isUpcoming: stream.status === 'UPCOMING',
      };
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: results.length,
      streams: results
    });

  } catch (error) {
    console.error('Error fetching feed status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch feed status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
