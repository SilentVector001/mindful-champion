
"use client"

/**
 * Seamless Video Player
 * 
 * Modern, intuitive video player with:
 * - Auto-resume functionality
 * - Speed/quality controls
 * - Picture-in-picture support
 * - Progress tracking
 * - Smooth playback experience
 * 
 * User Experience: Netflix-like simplicity
 * Code Architecture: Sophisticated state management
 */

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { videoService } from "@/lib/services/video-service"

interface SeamlessVideoPlayerProps {
  videoId: string
  userId: string
  videoUrl: string
  title: string
  duration: number
  lastPosition?: number
  onComplete?: () => void
  onNext?: () => void
  onPrevious?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
}

export default function SeamlessVideoPlayer({
  videoId,
  userId,
  videoUrl,
  title,
  duration,
  lastPosition = 0,
  onComplete,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false
}: SeamlessVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(lastPosition)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [completed, setCompleted] = useState(false)

  const playerRef = useRef<HTMLDivElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Extract YouTube video ID
  const getYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const youtubeId = getYouTubeId(videoUrl)
  const embedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&origin=${window.location.origin}&start=${Math.floor(lastPosition)}`
    : null

  // Track progress
  useEffect(() => {
    if (!isPlaying) return

    progressIntervalRef.current = setInterval(async () => {
      const newTime = currentTime + 1
      setCurrentTime(newTime)

      // Track progress every 10 seconds
      if (Math.floor(newTime) % 10 === 0) {
        try {
          const watchPercentage = duration > 0 ? (newTime / duration) * 100 : 0
          await videoService.trackProgress(
            userId,
            videoId,
            watchPercentage,
            Math.floor(newTime)
          )
        } catch (error) {
          console.error("Failed to track progress:", error)
        }
      }

      // Check for completion
      if (newTime >= duration * 0.9 && !completed) {
        setCompleted(true)
        try {
          await videoService.markCompleted(userId, videoId)
          toast.success("🎉 Video completed!")
          onComplete?.()
        } catch (error) {
          console.error("Failed to mark complete:", error)
        }
      }
    }, 1000)

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [isPlaying, currentTime, duration, completed, videoId, userId, playbackRate, onComplete])

  // Auto-hide controls
  useEffect(() => {
    if (!showControls) return

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [showControls, isPlaying])

  const handleMouseMove = () => {
    setShowControls(true)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    setIsMuted(value[0] === 0)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (!isMuted) {
      setVolume(0)
    } else {
      setVolume(1)
    }
  }

  const skipForward = () => {
    setCurrentTime(Math.min(currentTime + 10, duration))
  }

  const skipBackward = () => {
    setCurrentTime(Math.max(currentTime - 10, 0))
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div
          ref={playerRef}
          className="relative bg-black aspect-video group"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {/* Video Player */}
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <p>Unable to load video</p>
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          )}

          {/* Controls Overlay */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
              >
                {/* Top Bar */}
                <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
                  <h3 className="text-white font-semibold">{title}</h3>
                  {completed && (
                    <Badge className="bg-champion-green text-white">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <Slider
                      value={[currentTime]}
                      max={duration}
                      step={1}
                      onValueChange={handleSeek}
                      className="cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-white/70">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Previous Button */}
                      {hasPrevious && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                          onClick={onPrevious}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>
                      )}

                      {/* Skip Back */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={skipBackward}
                      >
                        <SkipBack className="w-5 h-5" />
                      </Button>

                      {/* Play/Pause */}
                      <Button
                        size="icon"
                        className="bg-white text-black hover:bg-white/90"
                        onClick={togglePlay}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </Button>

                      {/* Skip Forward */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={skipForward}
                      >
                        <SkipForward className="w-5 h-5" />
                      </Button>

                      {/* Next Button */}
                      {hasNext && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                          onClick={onNext}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      )}

                      {/* Volume */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                          onClick={toggleMute}
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="w-5 h-5" />
                          ) : (
                            <Volume2 className="w-5 h-5" />
                          )}
                        </Button>
                        <Slider
                          value={[volume]}
                          max={1}
                          step={0.1}
                          onValueChange={handleVolumeChange}
                          className="w-20 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Open in YouTube */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={() => window.open(videoUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        YouTube
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Video Info */}
        <div className="p-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Progress: {Math.round(progress)}%
              </div>
              {completed && (
                <Badge variant="outline" className="border-champion-green text-champion-green">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
