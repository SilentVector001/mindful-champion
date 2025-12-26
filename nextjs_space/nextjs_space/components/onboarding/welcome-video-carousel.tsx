'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function WelcomeVideoCarousel() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Toggle play/pause
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  // Toggle mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVideoClick = () => {
    togglePlayPause()
  }

  return (
    <div className="welcome-video-carousel-container w-full mb-8">
      <div className="relative mx-auto max-w-3xl">
        {/* Video Container */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-teal-50 to-cyan-50 shadow-xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="welcome-video-carousel-wrapper absolute inset-0"
          >
            <video
              ref={videoRef}
              className="welcome-video-carousel-video w-full h-full object-cover cursor-pointer"
              muted={isMuted}
              playsInline
              onClick={handleVideoClick}
              onLoadedData={() => setIsLoading(false)}
              onEnded={() => setIsPlaying(false)}
            >
              <source src="/welcome-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="text-white">
                  <svg
                    className="animate-spin h-8 w-8 mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              </div>
            )}

            {/* Play Button Overlay (when paused) */}
            {!isPlaying && !isLoading && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                onClick={handleVideoClick}
              >
                <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Play className="h-10 w-10 text-champion-green ml-1" />
                </div>
              </div>
            )}

            {/* Control Overlay - Bottom Center */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4">
              <div className="flex items-center justify-center gap-3">
                {/* Play/Pause and Mute Controls */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlayPause}
                  className="welcome-video-carousel-control h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:text-white transition-all"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="welcome-video-carousel-control h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:text-white transition-all"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
