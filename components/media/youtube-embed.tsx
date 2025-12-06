
'use client';

import { useState } from 'react';
import { ExternalLink, Play, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { mediaDesignTokens } from '@/lib/media-design-system';

interface YouTubeEmbedProps {
  videoUrl: string;
  title?: string;
  fallbackUrl?: string;
  aspectRatio?: '16/9' | '4/3';
}

/**
 * YouTube video embed component with fallback to external link
 * Handles video embedding with proper aspect ratio and error states
 */
export function YouTubeEmbed({ 
  videoUrl, 
  title = 'Video', 
  fallbackUrl,
  aspectRatio = '16/9'
}: YouTubeEmbedProps) {
  const [embedError, setEmbedError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Extract YouTube video ID from various URL formats
  const getYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/live\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) return match[1];
    }
    return null;
  };

  const videoId = getYouTubeId(videoUrl);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1` : null;

  // If no valid video ID or embed error, show fallback
  if (!embedUrl || embedError) {
    return (
      <Card className={`${mediaDesignTokens.radius.md} overflow-hidden ${mediaDesignTokens.borders.light}`}>
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-400" />
            <p className="text-sm text-gray-600">
              {embedError ? 'Unable to load video player' : 'Video preview unavailable'}
            </p>
            <Button
              onClick={() => window.open(fallbackUrl || videoUrl, '_blank')}
              className={`${mediaDesignTokens.radius.full} bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg`}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Watch on YouTube
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${mediaDesignTokens.radius.md} overflow-hidden ${mediaDesignTokens.borders.light} ${mediaDesignTokens.shadows.md}`}>
      <div className={`relative bg-black aspect-[${aspectRatio}]`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
            <div className="text-center space-y-3">
              <Play className="w-16 h-16 mx-auto text-white animate-pulse" />
              <p className="text-white text-sm">Loading player...</p>
            </div>
          </div>
        )}
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setEmbedError(true);
            setIsLoading(false);
          }}
        />
      </div>
      {/* External link fallback always available */}
      <div className="p-4 bg-white border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(fallbackUrl || videoUrl, '_blank')}
          className={`w-full ${mediaDesignTokens.radius.full}`}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open in YouTube
        </Button>
      </div>
    </Card>
  );
}
