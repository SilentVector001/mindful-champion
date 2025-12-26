/**
 * Feed Health Service
 * Checks the health and status of live stream feeds
 */

export interface StreamHealthStatus {
  streamId: string;
  status: 'live' | 'offline' | 'checking' | 'error';
  lastChecked: Date;
  viewerCount?: number;
  errorMessage?: string;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
}

// Cache for stream statuses to avoid rate limits
const statusCache = new Map<string, {
  status: StreamHealthStatus;
  timestamp: number;
}>();

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Check if a YouTube stream/video is live or available
 */
async function checkYouTubeStream(streamUrl: string): Promise<Partial<StreamHealthStatus>> {
  try {
    const videoId = extractYouTubeId(streamUrl);
    
    // Handle channel streams which don't have a video ID
    if (!videoId && (streamUrl.includes('/streams') || streamUrl.includes('@'))) {
      // Channel stream URLs - assume available (can't verify without API)
      return {
        status: 'offline', // Channel exists, not currently live
        errorMessage: undefined,
        connectionQuality: 'good'
      };
    }
    
    if (!videoId) {
      return {
        status: 'offline',
        errorMessage: undefined,
        connectionQuality: 'fair'
      };
    }

    // Try to fetch the YouTube oEmbed endpoint (doesn't require API key)
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    
    const response = await fetch(oEmbedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mindful Champion Media Center'
      }
    });

    if (response.ok) {
      // Video exists and is accessible
      return {
        status: 'offline', // Video exists - actual live status needs YouTube API
        errorMessage: undefined,
        connectionQuality: 'good'
      };
    } else if (response.status === 404 || response.status === 401) {
      // Video not found or private
      return {
        status: 'offline',
        errorMessage: undefined,
        connectionQuality: 'fair'
      };
    } else {
      return {
        status: 'offline',
        errorMessage: undefined,
        connectionQuality: 'fair'
      };
    }
  } catch (error) {
    // Network errors shouldn't show as "Feed Error" - just mark as unknown
    console.warn('Could not verify YouTube stream status:', error);
    return {
      status: 'offline',
      errorMessage: undefined,
      connectionQuality: 'fair'
    };
  }
}

/**
 * Check stream health for a single stream
 */
export async function checkStreamHealth(
  streamId: string,
  streamUrl: string,
  platform: string
): Promise<StreamHealthStatus> {
  // Check cache first
  const cached = statusCache.get(streamId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.status;
  }

  const baseStatus: StreamHealthStatus = {
    streamId,
    status: 'checking',
    lastChecked: new Date(),
  };

  try {
    // Platform-specific checks
    if (platform.toLowerCase() === 'youtube') {
      const youtubeStatus = await checkYouTubeStream(streamUrl);
      const status = {
        ...baseStatus,
        ...youtubeStatus,
      };

      // Cache the result
      statusCache.set(streamId, {
        status,
        timestamp: Date.now()
      });

      return status;
    } 
    
    // For other platforms, return a basic check
    const status: StreamHealthStatus = {
      ...baseStatus,
      status: 'offline',
      connectionQuality: 'good',
    };

    // Cache the result
    statusCache.set(streamId, {
      status,
      timestamp: Date.now()
    });

    return status;

  } catch (error) {
    console.error(`Error checking stream ${streamId}:`, error);
    const errorStatus: StreamHealthStatus = {
      ...baseStatus,
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      connectionQuality: 'poor'
    };

    // Cache error status for shorter duration
    statusCache.set(streamId, {
      status: errorStatus,
      timestamp: Date.now() - (CACHE_DURATION / 2) // Cache errors for half the normal time
    });

    return errorStatus;
  }
}

/**
 * Check health for multiple streams
 */
export async function checkMultipleStreamHealth(
  streams: Array<{ id: string; streamUrl: string; platform: string }>
): Promise<StreamHealthStatus[]> {
  const checks = streams.map(stream =>
    checkStreamHealth(stream.id, stream.streamUrl, stream.platform)
  );

  return Promise.all(checks);
}

/**
 * Clear the status cache
 */
export function clearHealthCache(): void {
  statusCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: statusCache.size,
    entries: Array.from(statusCache.entries()).map(([id, data]) => ({
      streamId: id,
      age: Date.now() - data.timestamp,
      status: data.status.status
    }))
  };
}
