'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Loader2,
  AlertCircle,
  RefreshCw,
  PictureInPicture,
  Circle,
  Wifi,
  WifiOff,
  ExternalLink,
  Youtube,
  Tv,
  Radio
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// Simple YouTube iframe player - no dynamic imports to avoid chunk loading issues
const YouTubePlayer = ({ videoId, onReady }: { videoId: string; onReady?: () => void }) => {
  const onReadyRef = useRef(onReady);
  
  // Keep ref updated
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);
  
  // CRITICAL FIX: Call onReady immediately on mount - no dependencies to avoid re-running
  useEffect(() => {
    // Call onReady very quickly on mount to clear loading state
    const immediateTimer = setTimeout(() => {
      if (onReadyRef.current) {
        onReadyRef.current();
      }
    }, 50); // 50ms - very fast
    
    return () => clearTimeout(immediateTimer);
  }, []); // Empty deps - only run once on mount
  
  return (
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="absolute inset-0 w-full h-full"
      style={{ border: 'none' }}
      onLoad={() => {
        // Call onReady immediately on iframe load as well
        if (onReadyRef.current) {
          onReadyRef.current();
        }
      }}
    />
  );
};

interface EnhancedVideoPlayerProps {
  url: string;
  title: string;
  platform?: string;
  isLive?: boolean;
  onError?: (error: any) => void;
  onReady?: () => void;
  className?: string;
  thumbnailUrl?: string;
}

export function EnhancedVideoPlayer({
  url,
  title,
  platform,
  isLive = false,
  onError,
  onReady,
  className = '',
  thumbnailUrl
}: EnhancedVideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // No need to convert URL - we'll extract ID directly
  const videoUrl = url;
  
  // Player state
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Loading and error states
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [networkQuality, setNetworkQuality] = useState<'good' | 'medium' | 'poor'>('good');
  
  // Quality settings
  const [quality, setQuality] = useState<'auto' | 'high' | 'medium' | 'low'>('auto');
  
  // Picture-in-picture
  const [isPiP, setIsPiP] = useState(false);

  // Auto-hide controls
  useEffect(() => {
    if (playing && showControls && !isLive) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      setControlsTimeout(timeout);
      
      return () => clearTimeout(timeout);
    }
  }, [playing, showControls, isLive]);

  // Detect network quality
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const updateNetworkQuality = () => {
          const effectiveType = connection.effectiveType;
          if (effectiveType === '4g') {
            setNetworkQuality('good');
          } else if (effectiveType === '3g') {
            setNetworkQuality('medium');
          } else {
            setNetworkQuality('poor');
          }
        };
        
        updateNetworkQuality();
        connection.addEventListener('change', updateNetworkQuality);
        
        return () => connection.removeEventListener('change', updateNetworkQuality);
      }
    }
  }, []);

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const handleToggleMute = () => {
    setMuted(!muted);
  };

  const handleProgress = (state: any) => {
    setPlayed(state.played);
    setLoaded(state.loaded);
    
    // Detect buffering
    if (state.loaded - state.played < 0.05 && playing) {
      setIsBuffering(true);
    } else {
      setIsBuffering(false);
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleSeek = (value: number[]) => {
    const seekTo = value[0];
    setPlayed(seekTo);
    playerRef.current?.seekTo(seekTo);
  };

  const handleReady = () => {
    setIsReady(true);
    setIsLoading(false);
    setHasError(false);
    if (onReady) onReady();
  };

  const handleError = (error: any) => {
    console.error('Video player error:', error);
    setHasError(true);
    setIsLoading(false);
    setErrorMessage(getErrorMessage(error));
    if (onError) onError(error);
  };

  const handleBuffer = () => {
    setIsBuffering(true);
  };

  const handleBufferEnd = () => {
    setIsBuffering(false);
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setPlayed(0);
    // Force reload by remounting player
    setIsReady(false);
    setTimeout(() => setIsReady(false), 100);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePictureInPicture = async () => {
    try {
      const videoElement = playerRef.current?.getInternalPlayer();
      if (videoElement && 'requestPictureInPicture' in videoElement) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          setIsPiP(false);
        } else {
          await videoElement.requestPictureInPicture();
          setIsPiP(true);
        }
      }
    } catch (error) {
      console.error('Picture-in-Picture error:', error);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
  };

  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    return 'Unable to load video. The stream may be unavailable or your connection may be unstable.';
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // Extract YouTube video ID from URL - IMPROVED: More robust extraction
  const getYouTubeId = (url: string): string | null => {
    if (!url) return null;
    
    // Clean the URL
    const cleanUrl = url.trim();
    
    // Try multiple patterns for maximum compatibility
    const patterns = [
      // Standard embed URL: https://www.youtube.com/embed/VIDEO_ID
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      // Short URL: https://youtu.be/VIDEO_ID
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      // With additional parameters
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})[?&]/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
      // Direct video ID (11 characters)
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match && match[1]) {
        console.log('✅ Extracted YouTube ID:', match[1], 'from URL:', cleanUrl);
        return match[1];
      }
    }
    
    console.warn('⚠️ Could not extract YouTube ID from URL:', cleanUrl);
    return null;
  };

  const youtubeId = getYouTubeId(videoUrl);
  
  // Debug logging
  useEffect(() => {
    console.log('EnhancedVideoPlayer - URL:', url);
    console.log('EnhancedVideoPlayer - Converted URL:', videoUrl);
    console.log('EnhancedVideoPlayer - Extracted YouTube ID:', youtubeId);
  }, [url, videoUrl, youtubeId]);

  // CRITICAL FAILSAFE: Force clear loading state after maximum timeout
  useEffect(() => {
    if (isLoading && youtubeId) {
      // If still loading after 300ms, force clear the loading state
      const maxLoadingTimer = setTimeout(() => {
        console.log('Force clearing loading state after timeout');
        setIsLoading(false);
        setIsReady(true);
      }, 300); // 300ms maximum loading time - very fast
      
      return () => clearTimeout(maxLoadingTimer);
    }
  }, [isLoading, youtubeId]);

  return (
    <div
      ref={containerRef}
      className={`relative aspect-video bg-black rounded-b-lg overflow-hidden group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      {/* Video Player */}
      {youtubeId ? (
        <YouTubePlayer videoId={youtubeId} onReady={handleReady} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-white text-lg">Invalid video URL</p>
            <p className="text-gray-400 text-sm mt-2">Please check the video source</p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && !hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center z-20"
          >
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
              <p className="text-white text-lg">Loading stream...</p>
              {thumbnailUrl && (
                <div className="mt-4 opacity-30">
                  <img src={thumbnailUrl} alt={title} className="max-w-xs rounded-lg" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buffering Overlay */}
      <AnimatePresence>
        {isBuffering && isReady && !hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 pointer-events-none"
          >
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-2" />
              <p className="text-white text-sm">Buffering...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Overlay */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 flex items-center justify-center z-20"
          >
            <div className="text-center max-w-md px-4">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-white text-xl font-bold mb-2">Stream Unavailable</h3>
              <p className="text-gray-300 mb-6">{errorMessage}</p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleRetry}
                  className="bg-white text-black hover:bg-gray-200"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <p className="text-gray-400 text-sm">
                  If the problem persists, the stream may have ended or your connection may be unstable.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Indicator */}
      {isLive && isReady && !hasError && (
        <div className="absolute top-4 left-4 z-30">
          <Badge className="bg-red-500 text-white shadow-lg">
            <Circle className="w-2 h-2 mr-2 fill-current animate-pulse" />
            LIVE
          </Badge>
        </div>
      )}

      {/* Network Quality Indicator */}
      {isReady && !hasError && (
        <div className="absolute top-4 right-4 z-30">
          <Badge 
            variant="secondary" 
            className={`shadow-lg ${
              networkQuality === 'good' ? 'bg-green-500/20 text-green-300' :
              networkQuality === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
              'bg-red-500/20 text-red-300'
            }`}
          >
            {networkQuality === 'good' ? (
              <Wifi className="w-3 h-3 mr-1" />
            ) : networkQuality === 'medium' ? (
              <Wifi className="w-3 h-3 mr-1" />
            ) : (
              <WifiOff className="w-3 h-3 mr-1" />
            )}
            {networkQuality === 'good' ? 'HD' : networkQuality === 'medium' ? 'SD' : 'Low'}
          </Badge>
        </div>
      )}

      {/* Custom Controls */}
      <AnimatePresence>
        {(showControls || !playing) && isReady && !hasError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 z-30"
          >
            {/* Progress Bar */}
            {!isLive && (
              <div className="mb-4">
                <Slider
                  value={[played]}
                  min={0}
                  max={0.999999}
                  step={0.001}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-white/70 mt-1">
                  <span>{formatTime(duration * played)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Play/Pause */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-white/20 h-10 w-10 p-0"
                  onClick={handlePlayPause}
                >
                  {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:text-white hover:bg-white/20 h-10 w-10 p-0"
                    onClick={handleToggleMute}
                  >
                    {muted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>
                  <Slider
                    value={[muted ? 0 : volume]}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="w-20 cursor-pointer hidden sm:block"
                  />
                </div>

                {/* Time Display */}
                {!isLive && (
                  <span className="text-white text-sm hidden md:block">
                    {formatTime(duration * played)} / {formatTime(duration)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Settings */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:text-white hover:bg-white/20 h-10 w-10 p-0"
                    >
                      <Settings className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black/90 text-white border-white/20">
                    <DropdownMenuLabel>Playback Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/20" />
                    
                    {!isLive && (
                      <>
                        <DropdownMenuLabel className="text-xs text-gray-400">Speed</DropdownMenuLabel>
                        {playbackRates.map((rate) => (
                          <DropdownMenuItem
                            key={rate}
                            onClick={() => setPlaybackRate(rate)}
                            className={`cursor-pointer ${
                              playbackRate === rate ? 'bg-white/20' : ''
                            }`}
                          >
                            {rate}x {playbackRate === rate && '✓'}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator className="bg-white/20" />
                      </>
                    )}
                    
                    <DropdownMenuLabel className="text-xs text-gray-400">Quality</DropdownMenuLabel>
                    {['auto', 'high', 'medium', 'low'].map((q) => (
                      <DropdownMenuItem
                        key={q}
                        onClick={() => setQuality(q as any)}
                        className={`cursor-pointer capitalize ${
                          quality === q ? 'bg-white/20' : ''
                        }`}
                      >
                        {q} {quality === q && '✓'}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Picture-in-Picture */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-white/20 h-10 w-10 p-0 hidden sm:flex"
                  onClick={togglePictureInPicture}
                >
                  <PictureInPicture className="w-5 h-5" />
                </Button>

                {/* Fullscreen */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-white/20 h-10 w-10 p-0"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Play Button (when paused) */}
      {!playing && isReady && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <Button
            size="lg"
            onClick={handlePlayPause}
            className="pointer-events-auto bg-white/20 hover:bg-white/30 backdrop-blur-lg border-2 border-white/50 rounded-full w-20 h-20 p-0"
          >
            <Play className="w-10 h-10 text-white ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
