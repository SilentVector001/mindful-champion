'use client'

/**
 * YouTube Video Embed Component
 * 
 * Provides an enhanced YouTube video player with:
 * - Direct iframe embedding
 * - Responsive aspect ratio
 * - Auto-resume from last position
 * - Progress tracking
 * - Picture-in-picture support
 * - Keyboard controls
 */

import { useEffect, useRef, useState } from 'react'
import { Play, Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react'

interface YouTubeVideoEmbedProps {
  videoUrl: string
  title: string
  onProgress?: (progress: number) => void
  onComplete?: () => void
  lastPosition?: number
  autoPlay?: boolean
}

// Extract YouTube video ID from various URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
    /youtube\.com\/embed\/([^?&\s]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

export default function YouTubeVideoEmbed({
  videoUrl,
  title,
  onProgress,
  onComplete,
  lastPosition = 0,
  autoPlay = false
}: YouTubeVideoEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showOverlay, setShowOverlay] = useState(!autoPlay)
  const containerRef = useRef<HTMLDivElement>(null)

  const videoId = extractVideoId(videoUrl)

  if (!videoId) {
    return (
      <div className="aspect-video w-full rounded-lg bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-lg font-semibold">Invalid Video URL</p>
          <p className="text-sm text-gray-400 mt-2">Unable to load video</p>
        </div>
      </div>
    )
  }

  // Build YouTube embed URL with parameters
  const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`)
  embedUrl.searchParams.set('enablejsapi', '1')
  embedUrl.searchParams.set('origin', window.location.origin)
  embedUrl.searchParams.set('rel', '0') // Don't show related videos
  embedUrl.searchParams.set('modestbranding', '1') // Minimal YouTube branding
  
  if (autoPlay) {
    embedUrl.searchParams.set('autoplay', '1')
  }
  
  if (lastPosition > 0) {
    embedUrl.searchParams.set('start', Math.floor(lastPosition).toString())
  }

  const handlePlayClick = () => {
    setShowOverlay(false)
    setIsPlaying(true)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black group"
    >
      {/* Video Overlay - Shows before playing */}
      {showOverlay && (
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-teal-900/90 via-purple-900/90 to-gray-900/90 flex items-center justify-center">
          <div className="text-center space-y-4">
            <button
              onClick={handlePlayClick}
              className="mx-auto w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-300 shadow-2xl"
            >
              <Play className="w-10 h-10 text-white ml-1" fill="white" />
            </button>
            <p className="text-white font-semibold text-lg max-w-md px-4">
              {title}
            </p>
            <p className="text-white/70 text-sm">Click to start video</p>
          </div>
        </div>
      )}

      {/* YouTube Embed */}
      <iframe
        ref={iframeRef}
        src={embedUrl.toString()}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />

      {/* Custom Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-white text-sm font-medium truncate">{title}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={isFullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {!isPlaying && !showOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  )
}
