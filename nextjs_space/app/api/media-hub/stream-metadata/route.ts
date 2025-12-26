
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = "force-dynamic";

interface StreamMetadata {
  streamId: string;
  title: string;
  description?: string;
  platform: string;
  isLive: boolean;
  viewerCount: number;
  thumbnailUrl?: string;
  embedUrl: string;
  quality: string;
  duration?: number;
  startTime?: Date;
  tags?: string[];
  chatEnabled: boolean;
  fullscreenEnabled: boolean;
  seekable: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    const streamUrl = searchParams.get('streamUrl');
    const platform = searchParams.get('platform');
    
    if (!streamUrl) {
      return NextResponse.json(
        { success: false, error: 'Stream URL required' },
        { status: 400 }
      );
    }

    // Mock metadata for different streaming platforms
    const mockMetadata: { [key: string]: StreamMetadata } = {
      'pickleballtv': {
        streamId: 'pbtv-vegas-2024',
        title: 'PPA Vegas Open - Men\'s Singles Semifinals LIVE',
        description: 'Watch Ben Johns vs Connor Garnett in the men\'s singles semifinals from the PPA Vegas Open. Live coverage with expert commentary.',
        platform: 'PickleballTV',
        isLive: true,
        viewerCount: 12847,
        thumbnailUrl: 'https://images.unsplash.com/photo-1642104798671-01a4129f4fdc?w=600&h=340&fit=crop&crop=center',
        embedUrl: streamUrl,
        quality: 'HD',
        startTime: new Date(Date.now() - 45 * 60 * 1000),
        tags: ['PPA Tour', 'Men\'s Singles', 'Live', 'Pro Pickleball'],
        chatEnabled: true,
        fullscreenEnabled: true,
        seekable: false // Live streams typically not seekable
      },
      'tennis-channel': {
        streamId: 'tc-mlp-austin-2024',
        title: 'MLP Austin Championship - Team Finals LIVE',
        description: 'Major League Pickleball team championship final between Austin Ignite and Texas Rangers. Premium broadcast coverage.',
        platform: 'Tennis Channel',
        isLive: true,
        viewerCount: 8234,
        thumbnailUrl: 'https://images.unsplash.com/photo-1693142517898-2f986215e412?w=600&h=340&fit=crop&crop=center',
        embedUrl: streamUrl,
        quality: '4K',
        startTime: new Date(Date.now() - 60 * 60 * 1000),
        tags: ['MLP', 'Team Championship', 'Live', 'Professional'],
        chatEnabled: false,
        fullscreenEnabled: true,
        seekable: false
      },
      'youtube': {
        streamId: 'yt-pickleball-highlights',
        title: 'Pro Pickleball Highlights & Analysis',
        description: 'Weekly highlights and expert analysis of professional pickleball matches from top tournaments worldwide.',
        platform: 'YouTube',
        isLive: false,
        viewerCount: 45623,
        thumbnailUrl: 'https://images.unsplash.com/photo-1686721135030-e2ab79e27b16?w=600&h=340&fit=crop&crop=center',
        embedUrl: streamUrl,
        quality: '1080p',
        duration: 1800, // 30 minutes
        tags: ['Highlights', 'Analysis', 'Pro Tips', 'Tutorial'],
        chatEnabled: true,
        fullscreenEnabled: true,
        seekable: true
      }
    };

    // Determine platform from URL or parameter
    let detectedPlatform = platform?.toLowerCase();
    if (!detectedPlatform) {
      if (streamUrl.includes('pickleballtv.com')) {
        detectedPlatform = 'pickleballtv';
      } else if (streamUrl.includes('tennischannel')) {
        detectedPlatform = 'tennis-channel';
      } else if (streamUrl.includes('youtube.com') || streamUrl.includes('youtu.be')) {
        detectedPlatform = 'youtube';
      } else {
        detectedPlatform = 'pickleballtv'; // Default fallback
      }
    }

    const metadata = mockMetadata[detectedPlatform] || mockMetadata['pickleballtv'];

    // Simulate different viewer counts and live status based on time
    const now = new Date();
    const hour = now.getHours();
    
    // Adjust viewer count based on time of day (more viewers during peak hours)
    const peakMultiplier = (hour >= 18 && hour <= 22) ? 1.5 : 1.0;
    metadata.viewerCount = Math.floor(metadata.viewerCount * peakMultiplier);

    // Add some randomness to make it feel live
    if (metadata.isLive) {
      metadata.viewerCount += Math.floor(Math.random() * 500 - 250);
      metadata.viewerCount = Math.max(metadata.viewerCount, 100);
    }

    return NextResponse.json({
      success: true,
      metadata: metadata,
      lastUpdated: new Date(),
      embedSupport: {
        iframe: true,
        autoplay: true,
        controls: true,
        fullscreen: metadata.fullscreenEnabled,
        responsive: true
      }
    });

  } catch (error) {
    console.error('Error fetching stream metadata:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stream metadata' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { action, streamId, eventData } = await request.json();

    switch (action) {
      case 'track-view':
        // Track stream view for analytics
        console.log(`User ${session.user.id} viewing stream ${streamId}`);
        
        return NextResponse.json({ 
          success: true,
          message: 'View tracked successfully'
        });

      case 'report-quality':
        // Handle stream quality reports
        console.log(`Quality report for stream ${streamId}:`, eventData);
        
        return NextResponse.json({ 
          success: true,
          message: 'Quality report received'
        });

      case 'track-engagement':
        // Track user engagement (play, pause, seek, fullscreen, etc.)
        console.log(`Engagement event for stream ${streamId}:`, eventData);
        
        return NextResponse.json({ 
          success: true,
          message: 'Engagement tracked'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error handling stream metadata action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
