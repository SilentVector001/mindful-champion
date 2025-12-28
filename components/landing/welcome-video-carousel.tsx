"use client"

import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { useSession } from "next-auth/react"
import { Volume2, VolumeX, RotateCcw, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"

const videos = [
  "/videos/welcome-1.mp4",
  "/videos/welcome-2.mp4"
]

export interface WelcomeVideoCarouselRef {
  playVideo: () => void
}

const WelcomeVideoCarousel = forwardRef<WelcomeVideoCarouselRef>((props, ref) => {
  const { data: session, status } = useSession() || {}
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isEnded, setIsEnded] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Expose playVideo method to parent components
  useImperativeHandle(ref, () => ({
    playVideo: () => {
      if (videoRef.current) {
        setIsEnded(false)
        setCurrentIndex(0)
        videoRef.current.currentTime = 0
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
      }
    }
  }))

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-play first video on mount
  useEffect(() => {
    if (mounted && videoRef.current && status !== "loading") {
      videoRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {
        // Autoplay blocked - show play button
        setIsPlaying(false)
      })
    }
  }, [mounted, status])

  const handleVideoEnd = () => {
    if (currentIndex < videos.length - 1) {
      // Play next video
      setCurrentIndex(prev => prev + 1)
    } else {
      // All videos finished
      setIsEnded(true)
      setIsPlaying(false)
    }
  }

  // When video source changes, play it
  useEffect(() => {
    if (videoRef.current && currentIndex > 0) {
      videoRef.current.load()
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }, [currentIndex])

  const handleReplay = () => {
    setCurrentIndex(0)
    setIsEnded(false)
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.load()
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
      }
    }, 100)
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
      }
    }
  }

  // Don't render for authenticated users or before mount
  if (!mounted || status === "loading") return null
  if (session) return null

  return (
    <section className="bg-slate-900 py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
          <video
            ref={videoRef}
            src={videos[currentIndex]}
            className="w-full aspect-video"
            playsInline
            onEnded={handleVideoEnd}
            muted={isMuted}
          />
          
          {/* Controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
              </div>
              
              {/* Progress dots */}
              <div className="flex gap-1.5">
                {videos.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentIndex ? "bg-teal-500" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
              
              {isEnded && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={handleReplay}
                >
                  <RotateCcw className="w-5 h-5 mr-1" />
                  Replay
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})

WelcomeVideoCarousel.displayName = "WelcomeVideoCarousel"

export default WelcomeVideoCarousel
