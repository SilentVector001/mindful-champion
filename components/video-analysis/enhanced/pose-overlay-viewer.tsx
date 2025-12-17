
'use client';

/**
 * Pose Overlay Viewer Component
 * Displays video with pose tracking overlays
 */

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, SkipBack, SkipForward, Eye, EyeOff } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface PoseOverlayViewerProps {
  videoUrl: string;
  overlays: Array<{
    frameIndex: number;
    timestamp: number;
    overlayData: {
      skeleton: Array<{ from: {x: number; y: number}; to: {x: number; y: number} }>;
      keypoints: Array<{ x: number; y: number; label: string; score: number }>;
      angles: Array<{ x: number; y: number; value: number; label: string }>;
      indicators: Array<{ x: number; y: number; color: string; type: string }>;
    };
  }>;
}

export function PoseOverlayViewer({ videoUrl, overlays }: PoseOverlayViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);

  // Draw overlays on canvas
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || !showOverlay) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Find closest overlay for current time
    const currentOverlay = overlays.find(
      overlay => Math.abs(overlay.timestamp - currentTime) < 0.5
    );

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentOverlay) {
      const { overlayData } = currentOverlay;

      // Draw skeleton
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      overlayData.skeleton.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.from.x, line.from.y);
        ctx.lineTo(line.to.x, line.to.y);
        ctx.stroke();
      });

      // Draw keypoints
      overlayData.keypoints.forEach(kp => {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#FF0000';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Draw angles
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;

      overlayData.angles.forEach(angle => {
        const text = `${angle.value.toFixed(0)}°`;
        ctx.strokeText(text, angle.x + 10, angle.y - 10);
        ctx.fillText(text, angle.x + 10, angle.y - 10);
      });

      // Draw indicators
      overlayData.indicators.forEach(indicator => {
        ctx.beginPath();
        ctx.arc(indicator.x, indicator.y, 15, 0, 2 * Math.PI);
        ctx.strokeStyle = indicator.color;
        ctx.lineWidth = 4;
        ctx.stroke();
      });
    }
  }, [currentTime, overlays, showOverlay]);

  // Update current time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.currentTime + 5, duration);
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(video.currentTime - 5, 0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>Pose Tracking Analysis</span>
            <Badge variant="secondary">{overlays.length} Frames</Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOverlay(!showOverlay)}
          >
            {showOverlay ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Overlay
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Overlay
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            {showOverlay && (
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
            )}
          </div>

          {/* Video Controls */}
          <div className="mt-4 space-y-3">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full"
            />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={skipBackward}>
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={togglePlay}>
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={skipForward}>
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
              <div className="w-20" /> {/* Spacer */}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-semibold mb-2">Overlay Legend</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span>Skeleton</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span>Keypoints</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-green-500 rounded-full" />
                <span>Good Form</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-red-500 rounded-full" />
                <span>Needs Work</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
