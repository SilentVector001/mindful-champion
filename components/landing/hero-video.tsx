
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroVideoProps {
  className?: string;
  autoPlay?: boolean;
  showControls?: boolean;
}

export default function HeroVideo({ 
  className = '', 
  autoPlay = true,
  showControls = true 
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
      if (autoPlay) {
        video.play().catch(err => {
          console.log('Autoplay prevented:', err);
          setIsPlaying(false);
        });
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [autoPlay]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-xl ${className}`}>
      {/* Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
        poster="/intro-video/mindful_champion_intro.mp4?frame=1"
      >
        <source src="/intro-video/mindful_champion_intro.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />

      {/* Loading state */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            className="absolute inset-0 bg-slate-900 flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white/70 text-sm">Loading video...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Controls */}
      {showControls && isLoaded && (
        <motion.div
          className="absolute top-4 right-4 flex items-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <Button
            onClick={togglePlay}
            size="sm"
            variant="secondary"
            className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-white/20 transition-all duration-200"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={toggleMute}
            size="sm"
            variant="secondary"
            className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-white/20 transition-all duration-200"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
        </motion.div>
      )}

      {/* Subtle indicator that video is playing */}
      {isPlaying && (
        <motion.div
          className="absolute bottom-4 left-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex items-center gap-2 bg-teal-500/20 backdrop-blur-sm border border-teal-500/30 rounded-full px-3 py-1.5">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-teal-400">LIVE</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
