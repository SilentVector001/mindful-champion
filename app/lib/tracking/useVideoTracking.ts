
'use client';

import { useCallback, useRef } from 'react';
import { useSession } from './SessionManager';

export function useVideoTracking(videoId: string, videoTitle?: string, videoUrl?: string) {
  const { sessionId } = useSession();
  const lastUpdateRef = useRef<number>(0);

  const trackInteraction = useCallback(async (
    interactionType: 'PLAY' | 'PAUSE' | 'SEEK' | 'COMPLETE' | 'PROGRESS_UPDATE',
    currentTime?: number,
    totalDuration?: number
  ) => {
    if (!sessionId) return;

    const watchPercentage = totalDuration && currentTime 
      ? (currentTime / totalDuration) * 100 
      : undefined;

    try {
      await fetch('/api/tracking/video-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          videoId,
          videoTitle,
          videoUrl,
          interactionType,
          currentTime,
          watchPercentage,
          totalDuration,
        }),
      });
    } catch (error) {
      console.error('Failed to track video interaction:', error);
    }
  }, [sessionId, videoId, videoTitle, videoUrl]);

  const onPlay = useCallback((currentTime?: number, totalDuration?: number) => {
    trackInteraction('PLAY', currentTime, totalDuration);
  }, [trackInteraction]);

  const onPause = useCallback((currentTime?: number, totalDuration?: number) => {
    trackInteraction('PAUSE', currentTime, totalDuration);
  }, [trackInteraction]);

  const onSeek = useCallback((currentTime?: number, totalDuration?: number) => {
    trackInteraction('SEEK', currentTime, totalDuration);
  }, [trackInteraction]);

  const onComplete = useCallback((totalDuration?: number) => {
    trackInteraction('COMPLETE', totalDuration, totalDuration);
  }, [trackInteraction]);

  const onProgress = useCallback((currentTime: number, totalDuration: number) => {
    // Only track progress every 10 seconds to avoid excessive API calls
    const now = Date.now();
    if (now - lastUpdateRef.current > 10000) {
      trackInteraction('PROGRESS_UPDATE', currentTime, totalDuration);
      lastUpdateRef.current = now;
    }
  }, [trackInteraction]);

  return {
    onPlay,
    onPause,
    onSeek,
    onComplete,
    onProgress,
  };
}
