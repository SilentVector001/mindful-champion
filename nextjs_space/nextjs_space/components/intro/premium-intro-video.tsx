'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IntroVideoProps {
  variant?: 'full' | 'compact';
  autoPlay?: boolean;
  onComplete?: () => void;
  className?: string;
}

export default function PremiumIntroVideo({ 
  variant = 'full', 
  autoPlay = true, 
  onComplete,
  className = ''
}: IntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const isCompact = variant === 'compact';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Auto-play on mount
    const playVideo = async () => {
      try {
        await video.play();
      } catch (err) {
        console.log('Autoplay with sound prevented, trying muted:', err);
        video.muted = true;
        setIsMuted(true);
        try {
          await video.play();
        } catch (err2) {
          console.log('Autoplay failed:', err2);
        }
      }
    };

    playVideo();

    return () => {
      video.pause();
    };
  }, []);

  const handleMuteToggle = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVideoToggle = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (videoEnabled) {
      video.pause();
    } else {
      video.play();
    }
    setVideoEnabled(!videoEnabled);
  };

  return (
    <div 
      className={`relative group ${isCompact ? 'h-32 md:h-40' : 'h-96 lg:h-[500px]'} ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Element - Autoplays and Loops */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover rounded-xl"
        muted={isMuted}
        loop
        autoPlay
        playsInline
        preload="auto"
      >
        <source src="/videos/getting-started-guide.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Video Disabled Overlay */}
      <AnimatePresence>
        {!videoEnabled && (
          <motion.div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <EyeOff className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <p className="text-white/70 text-lg">Video Paused</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simple Video Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="absolute top-4 right-4 flex items-center gap-2 z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Video On/Off Toggle */}
            <Button
              onClick={handleVideoToggle}
              size="sm"
              variant="secondary"
              className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-white/20"
              title={videoEnabled ? "Pause Video" : "Play Video"}
            >
              {videoEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            
            {/* Volume Toggle */}
            <Button
              onClick={handleMuteToggle}
              size="sm"
              variant="secondary"
              className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-white/20"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
