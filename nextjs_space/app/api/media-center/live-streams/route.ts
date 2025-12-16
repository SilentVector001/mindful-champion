
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { LiveStreamService } from '@/lib/media-center/live-stream-service';
import { SubscriptionUtils } from '@/lib/media-center/subscription-utils';
import { LiveStreamStatus } from '@/lib/prisma-types';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Get user's tier access (for future premium features, but videos are free)
    const tierAccess = await SubscriptionUtils.getUserTierAccess(userId);
    
    // All YouTube videos are free and embeddable - no subscription required!
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as LiveStreamStatus;
    const action = searchParams.get('action'); // 'current' | 'schedule'

    let streams;
    
    if (action === 'schedule') {
      const days = parseInt(searchParams.get('days') || '7');
      streams = await LiveStreamService.getStreamSchedule(days);
    } else {
      streams = await LiveStreamService.getLiveStreams(status);
    }

    // Get active custom streams and merge with regular streams
    const customStreams = await prisma.customStream.findMany({
      where: { isActive: true },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    // Transform custom streams to match LiveStream format
    const transformedCustomStreams = customStreams.map(cs => ({
      id: cs.id,
      title: cs.title,
      description: cs.description,
      platform: cs.platform,
      streamUrl: cs.streamUrl,
      thumbnailUrl: cs.thumbnail,
      embedCode: null,
      status: 'LIVE', // Assume custom streams are live
      scheduledAt: cs.createdAt.toISOString(),
      startedAt: cs.createdAt.toISOString(),
      endedAt: null,
      viewerCount: 0,
      isSubscriberOnly: false,
      eventType: null,
      isCustom: true, // Flag to identify custom streams
    }));

    // Merge streams - custom streams first (higher priority)
    const allStreams = [...transformedCustomStreams, ...streams];

    return NextResponse.json({
      success: true,
      streams: allStreams,
      customStreamsCount: customStreams.length,
      streamingPlatforms: LiveStreamService.getStreamingPlatforms(),
      tierAccess: {
        ...tierAccess,
        canAccessLiveStreams: true // Free YouTube content accessible to all
      }
    });

  } catch (error) {
    console.error('Error fetching live streams:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch live streams',
      streamingPlatforms: LiveStreamService.getStreamingPlatforms()
    }, { status: 500 });
  }
}

// Sync live streams from external APIs
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admins to trigger sync
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: 'Admin access required'
      }, { status: 403 });
    }

    await LiveStreamService.syncLiveStreams();
    
    return NextResponse.json({
      success: true,
      message: 'Live streams sync completed'
    });

  } catch (error) {
    console.error('Error syncing live streams:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to sync live streams'
    }, { status: 500 });
  }
}
