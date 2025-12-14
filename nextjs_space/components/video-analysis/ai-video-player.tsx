
"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize, Settings, Eye, EyeOff, Grid3x3, Ruler, TrendingUp,
  Target, Zap, Loader2, RefreshCw, AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PoseKeypoint {
  x: number
  y: number
  score: number
  name: string
}

interface BodyAngle {
  name: string
  angle: number
  ideal: number
  color: string
}

interface AIVideoPlayerProps {
  videoUrl: string
  videoId?: string // Add videoId prop for fetching signed URLs
  analysisData: any
  keyMoments?: any[]
  className?: string
}

export default function AIVideoPlayer({
  videoUrl,
  videoId,
  analysisData,
  keyMoments = [],
  className
}: AIVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  
  // Overlay controls
  const [showPoseSkeleton, setShowPoseSkeleton] = useState(true)
  const [showAngles, setShowAngles] = useState(true)
  const [showTrajectory, setShowTrajectory] = useState(true)
  const [showGrid, setShowGrid] = useState(false)
  const [showCorrections, setShowCorrections] = useState(true)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [bufferHealth, setBufferHealth] = useState(0)
  const [networkQuality, setNetworkQuality] = useState<'good' | 'medium' | 'poor'>('good')
  // Simulated pose data for current frame
  const [currentPose, setCurrentPose] = useState<PoseKeypoint[]>([])
  const [bodyAngles, setBodyAngles] = useState<BodyAngle[]>([])
  const [actualVideoUrl, setActualVideoUrl] = useState<string>(videoUrl)
  
  // Fetch signed URL if videoId is provided (for S3 videos)
  useEffect(() => {
    const fetchSignedUrl = async () => {
      // If videoId is provided, fetch signed URL from S3
      if (videoId) {
        try {
          console.log('[VideoPlayer] Fetching signed URL for video:', videoId)
          const response = await fetch(`/api/video-analysis/${videoId}/signed-url`)
          
          if (!response.ok) {
            const error = await response.json()
            console.error('[VideoPlayer] Failed to fetch signed URL:', error)
            
            // If the video needs re-upload (410 Gone status for local videos)
            if (error.needsReupload) {
              setVideoError(error.message || 'Video file not available. Please re-upload this video.')
              return
            }
            
            throw new Error(error.error || 'Failed to fetch video URL')
          }
          
          const data = await response.json()
          console.log('[VideoPlayer] Got signed URL, expires in:', data.expiresIn, 'seconds')
          setActualVideoUrl(data.videoUrl)
          setVideoError(null)
        } catch (error) {
          console.error('[VideoPlayer] Error fetching signed URL:', error)
          setVideoError(error instanceof Error ? error.message : 'Failed to load video')
        }
      } else if (!videoUrl) {
        // No videoId and no videoUrl
        setVideoError('No video source provided.')
      } else {
        // Use provided videoUrl directly (for legacy videos)
        setActualVideoUrl(videoUrl)
      }
    }
    
    fetchSignedUrl()
  }, [videoId, videoUrl])

  // Buffer monitoring and network optimization
  useEffect(() => {
    let bufferCheckInterval: NodeJS.Timeout;
    
    const video = videoRef.current;
    if (video) {
      bufferCheckInterval = setInterval(() => {
        try {
          if (video.buffered && video.currentTime) {
            const bufferedEnd = video.buffered.length > 0 ? video.buffered.end(video.buffered.length - 1) : 0;
            const bufferAhead = bufferedEnd - video.currentTime;
            setBufferHealth(Math.min(100, (bufferAhead / 5) * 100)); // 5 seconds = 100% health
            
            // Preload more if buffer is low
            if (bufferHealth < 30 && !video.seeking) {
              video.preload = 'auto';
            }
          }
        } catch (error) {
          console.error('Buffer monitoring error:', error);
        }
      }, 1000);
    }
    
    return () => {
      if (bufferCheckInterval) clearInterval(bufferCheckInterval);
    };
  }, [bufferHealth]);

  // Initialize video
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsVideoLoaded(true)
      setVideoError(null)
      // Optimize for analysis playback
      video.preload = 'metadata'
      video.playsInline = true
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      setCurrentFrame(Math.floor(video.currentTime * 30)) // Assuming 30fps
      updatePoseData(video.currentTime)
    }

    const handleError = (e: Event) => {
      const target = e.target as HTMLVideoElement
      let errorMessage = 'Failed to load video. '
      
      if (target.error) {
        switch (target.error.code) {
          case target.error.MEDIA_ERR_ABORTED:
            errorMessage += 'Video playback was aborted.'
            break
          case target.error.MEDIA_ERR_NETWORK:
            errorMessage += 'A network error occurred while loading the video.'
            break
          case target.error.MEDIA_ERR_DECODE:
            errorMessage += 'The video file is corrupted or in an unsupported format.'
            break
          case target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage += 'The video file was not found or the format is not supported.'
            break
          default:
            errorMessage += 'An unknown error occurred.'
        }
      } else {
        errorMessage += 'The file may be missing or in an unsupported format.'
      }
      
      console.error('Video loading error:', {
        error: e,
        videoUrl: actualVideoUrl,
        errorCode: target.error?.code,
        errorMessage: target.error?.message
      })
      setVideoError(errorMessage)
      setIsVideoLoaded(false)
      setIsVideoReady(false)
    }

    const handleCanPlay = () => {
      setIsVideoLoaded(true)
      setIsVideoReady(true)
      setVideoError(null)
    }

    const handleLoadStart = () => {
      setIsVideoReady(false)
    }

    const handleWaiting = () => {
      // Video is buffering but don't show loading overlay
    }

    const handlePlaying = () => {
      setIsVideoReady(true)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('error', handleError)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('playing', handlePlaying)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('error', handleError)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('playing', handlePlaying)
    }
  }, [actualVideoUrl])

  // Draw overlays on canvas
  useEffect(() => {
    drawOverlays()
  }, [currentTime, showPoseSkeleton, showAngles, showTrajectory, showGrid, showCorrections, currentPose, bodyAngles])

  const updatePoseData = useCallback((time: number) => {
    // Simulate pose detection data based on video time
    // In production, this would come from your AI analysis
    const phase = Math.sin(time * 2) * 0.5 + 0.5 // 0 to 1
    
    const basePose: PoseKeypoint[] = [
      { name: 'nose', x: 0.5, y: 0.2, score: 0.95 },
      { name: 'leftShoulder', x: 0.4, y: 0.35, score: 0.92 },
      { name: 'rightShoulder', x: 0.6, y: 0.35, score: 0.93 },
      { name: 'leftElbow', x: 0.35, y: 0.5 + phase * 0.1, score: 0.90 },
      { name: 'rightElbow', x: 0.65, y: 0.5 + phase * 0.15, score: 0.91 },
      { name: 'leftWrist', x: 0.3, y: 0.65 + phase * 0.2, score: 0.88 },
      { name: 'rightWrist', x: 0.7, y: 0.6 + phase * 0.25, score: 0.89 },
      { name: 'leftHip', x: 0.42, y: 0.6, score: 0.94 },
      { name: 'rightHip', x: 0.58, y: 0.6, score: 0.94 },
      { name: 'leftKnee', x: 0.4, y: 0.8 - phase * 0.05, score: 0.91 },
      { name: 'rightKnee', x: 0.6, y: 0.8 - phase * 0.05, score: 0.92 },
      { name: 'leftAnkle', x: 0.38, y: 0.95, score: 0.90 },
      { name: 'rightAnkle', x: 0.62, y: 0.95, score: 0.90 },
    ]

    setCurrentPose(basePose)

    // Calculate body angles
    const rightElbowAngle = 90 + phase * 45
    const leftKneeAngle = 160 - phase * 30
    const shoulderAngle = 25 + phase * 15

    setBodyAngles([
      { name: 'Right Elbow', angle: Math.round(rightElbowAngle), ideal: 110, color: Math.abs(rightElbowAngle - 110) < 15 ? '#10b981' : '#f59e0b' },
      { name: 'Left Knee Bend', angle: Math.round(leftKneeAngle), ideal: 145, color: Math.abs(leftKneeAngle - 145) < 15 ? '#10b981' : '#f59e0b' },
      { name: 'Shoulder Rotation', angle: Math.round(shoulderAngle), ideal: 30, color: Math.abs(shoulderAngle - 30) < 10 ? '#10b981' : '#f59e0b' },
      { name: 'Paddle Angle', angle: Math.round(75 + phase * 20), ideal: 85, color: '#10b981' }
    ])
  }, [])

  const drawOverlays = useCallback(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const width = canvas.width
    const height = canvas.height

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.lineWidth = 1
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.moveTo((width / 3) * (i + 1), 0)
        ctx.lineTo((width / 3) * (i + 1), height)
        ctx.stroke()
        
        ctx.beginPath()
        ctx.moveTo(0, (height / 3) * (i + 1))
        ctx.lineTo(width, (height / 3) * (i + 1))
        ctx.stroke()
      }
    }

    // Draw pose skeleton
    if (showPoseSkeleton && currentPose.length > 0) {
      const connections = [
        ['nose', 'leftShoulder'], ['nose', 'rightShoulder'],
        ['leftShoulder', 'rightShoulder'],
        ['leftShoulder', 'leftElbow'], ['leftElbow', 'leftWrist'],
        ['rightShoulder', 'rightElbow'], ['rightElbow', 'rightWrist'],
        ['leftShoulder', 'leftHip'], ['rightShoulder', 'rightHip'],
        ['leftHip', 'rightHip'],
        ['leftHip', 'leftKnee'], ['leftKnee', 'leftAnkle'],
        ['rightHip', 'rightKnee'], ['rightKnee', 'rightAnkle']
      ]

      // Draw skeleton lines
      ctx.strokeStyle = '#06b6d4'
      ctx.lineWidth = 3
      ctx.shadowColor = '#06b6d4'
      ctx.shadowBlur = 10

      connections.forEach(([start, end]) => {
        const startPoint = currentPose.find(p => p.name === start)
        const endPoint = currentPose.find(p => p.name === end)
        
        if (startPoint && endPoint && startPoint.score > 0.5 && endPoint.score > 0.5) {
          ctx.beginPath()
          ctx.moveTo(startPoint.x * width, startPoint.y * height)
          ctx.lineTo(endPoint.x * width, endPoint.y * height)
          ctx.stroke()
        }
      })

      // Draw keypoints
      ctx.shadowBlur = 0
      currentPose.forEach(point => {
        if (point.score > 0.5) {
          ctx.fillStyle = '#06b6d4'
          ctx.beginPath()
          ctx.arc(point.x * width, point.y * height, 6, 0, 2 * Math.PI)
          ctx.fill()
          
          // Outer glow
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(point.x * width, point.y * height, 10, 0, 2 * Math.PI)
          ctx.stroke()
        }
      })
    }

    // Draw angle measurements
    if (showAngles && bodyAngles.length > 0) {
      ctx.font = 'bold 16px Inter, system-ui, sans-serif'
      ctx.shadowBlur = 4
      
      bodyAngles.forEach((angle, i) => {
        const y = 60 + i * 70
        
        // Background box
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
        ctx.fillRect(width - 220, y - 35, 210, 60)
        
        // Border
        ctx.strokeStyle = angle.color
        ctx.lineWidth = 2
        ctx.strokeRect(width - 220, y - 35, 210, 60)
        
        // Angle name
        ctx.fillStyle = '#e2e8f0'
        ctx.textAlign = 'left'
        ctx.fillText(angle.name, width - 210, y - 15)
        
        // Current angle
        ctx.font = 'bold 20px Inter, system-ui, sans-serif'
        ctx.fillStyle = angle.color
        ctx.fillText(`${angle.angle}°`, width - 210, y + 10)
        
        // Ideal angle
        ctx.font = '12px Inter, system-ui, sans-serif'
        ctx.fillStyle = '#94a3b8'
        ctx.fillText(`Ideal: ${angle.ideal}°`, width - 130, y + 10)
      })
    }

    // Draw trajectory prediction
    if (showTrajectory) {
      const trajectoryPoints = []
      const startTime = currentTime
      for (let i = 0; i < 15; i++) {
        const t = startTime + i * 0.033
        const x = 0.7 + Math.sin(t * 3) * 0.15
        const y = 0.6 - Math.cos(t * 4) * 0.2 - i * 0.01
        trajectoryPoints.push({ x, y })
      }

      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 3
      ctx.setLineDash([10, 5])
      ctx.shadowColor = '#f59e0b'
      ctx.shadowBlur = 8
      
      ctx.beginPath()
      trajectoryPoints.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x * width, point.y * height)
        } else {
          ctx.lineTo(point.x * width, point.y * height)
        }
      })
      ctx.stroke()
      ctx.setLineDash([])
      
      // Draw ball at end of trajectory
      const lastPoint = trajectoryPoints[trajectoryPoints.length - 1]
      ctx.fillStyle = '#f59e0b'
      ctx.beginPath()
      ctx.arc(lastPoint.x * width, lastPoint.y * height, 8, 0, 2 * Math.PI)
      ctx.fill()
    }

    // Draw form correction arrows
    if (showCorrections) {
      drawCorrectionArrow(ctx, width * 0.65, height * 0.5, width * 0.65, height * 0.42, 'Raise elbow 8cm', '#10b981')
      drawCorrectionArrow(ctx, width * 0.4, height * 0.8, width * 0.42, height * 0.78, 'Bend knee more', '#f59e0b')
    }

    ctx.shadowBlur = 0
  }, [currentPose, bodyAngles, showPoseSkeleton, showAngles, showTrajectory, showGrid, showCorrections, currentTime])

  const drawCorrectionArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    label: string,
    color: string
  ) => {
    // Arrow line
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.shadowColor = color
    ctx.shadowBlur = 8
    
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.stroke()
    
    // Arrowhead
    const angle = Math.atan2(toY - fromY, toX - fromX)
    const arrowLength = 15
    
    ctx.beginPath()
    ctx.moveTo(toX, toY)
    ctx.lineTo(
      toX - arrowLength * Math.cos(angle - Math.PI / 6),
      toY - arrowLength * Math.sin(angle - Math.PI / 6)
    )
    ctx.moveTo(toX, toY)
    ctx.lineTo(
      toX - arrowLength * Math.cos(angle + Math.PI / 6),
      toY - arrowLength * Math.sin(angle + Math.PI / 6)
    )
    ctx.stroke()
    
    // Label
    ctx.font = 'bold 14px Inter, system-ui, sans-serif'
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.shadowBlur = 4
    ctx.fillText(label, (fromX + toX) / 2, fromY - 10)
    
    ctx.shadowBlur = 0
  }

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const skipBackward = () => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, video.currentTime - 5)
  }

  const skipForward = () => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.min(duration, video.currentTime + 5)
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return
    video.volume = value[0]
    setVolume(value[0])
  }

  const changeSpeed = (speed: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = speed
    setPlaybackSpeed(speed)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <Card className={cn("bg-slate-900/50 border-slate-700 overflow-hidden", className)}>
      <CardContent className="p-0">
        <div ref={containerRef} className="relative aspect-video bg-black">
          {/* Video element */}
          {actualVideoUrl && (
            <video
              ref={videoRef}
              src={actualVideoUrl}
              className="w-full h-full object-contain"
              playsInline
              preload="metadata"
            />
          )}
          
          {/* Canvas overlay */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            width={1280}
            height={720}
          />

          {/* Error overlay */}
          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-10">
              <div className="text-center p-6 max-w-md">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Video Loading Error</h3>
                <p className="text-slate-300 mb-4">{videoError}</p>
                <div className="text-sm text-slate-400 space-y-2">
                  <p className="font-semibold">Possible reasons:</p>
                  <ul className="list-disc list-inside text-left space-y-1">
                    <li>The video file was not found on the server</li>
                    <li>The video may have been deleted or moved</li>
                    <li>The file format may not be supported by your browser</li>
                    <li>Network connection issues</li>
                    <li>Video needs to be re-uploaded</li>
                  </ul>
                  <p className="mt-3 text-xs">
                    <strong>Note:</strong> Videos are stored locally on the server.
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/train/video'}
                    className="bg-cyan-500 hover:bg-cyan-600"
                  >
                    Upload New Video
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Loading overlay - Only show when video is actually not ready */}
          {!isVideoReady && !videoError && actualVideoUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-5">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-3" />
                <p className="text-slate-300">Loading video...</p>
              </div>
            </div>
          )}
          
          {/* Overlay controls toggle buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              size="sm"
              variant={showPoseSkeleton ? "default" : "secondary"}
              onClick={() => setShowPoseSkeleton(!showPoseSkeleton)}
              className="gap-2 bg-slate-800/90 hover:bg-cyan-500/90"
            >
              <Target className="w-4 h-4" />
              Pose
            </Button>
            <Button
              size="sm"
              variant={showAngles ? "default" : "secondary"}
              onClick={() => setShowAngles(!showAngles)}
              className="gap-2 bg-slate-800/90 hover:bg-cyan-500/90"
            >
              <Ruler className="w-4 h-4" />
              Angles
            </Button>
            <Button
              size="sm"
              variant={showTrajectory ? "default" : "secondary"}
              onClick={() => setShowTrajectory(!showTrajectory)}
              className="gap-2 bg-slate-800/90 hover:bg-cyan-500/90"
            >
              <TrendingUp className="w-4 h-4" />
              Path
            </Button>
            <Button
              size="sm"
              variant={showCorrections ? "default" : "secondary"}
              onClick={() => setShowCorrections(!showCorrections)}
              className="gap-2 bg-slate-800/90 hover:bg-cyan-500/90"
            >
              <Zap className="w-4 h-4" />
              Tips
            </Button>
            <Button
              size="sm"
              variant={showGrid ? "default" : "secondary"}
              onClick={() => setShowGrid(!showGrid)}
              className="gap-2 bg-slate-800/90 hover:bg-cyan-500/90"
            >
              <Grid3x3 className="w-4 h-4" />
              Grid
            </Button>
          </div>
          
          {/* Frame counter */}
          <div className="absolute top-4 left-4 bg-black/80 px-3 py-1.5 rounded-lg border border-cyan-500/30">
            <div className="text-xs text-slate-400">Frame</div>
            <div className="text-lg font-bold text-cyan-400">{currentFrame}</div>
          </div>
        </div>
        
        {/* Video controls */}
        <div className="bg-slate-900 p-4 space-y-3">
          {/* Progress bar */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          
          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={skipBackward}>
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={togglePlay} className="bg-cyan-500 hover:bg-cyan-600">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={skipForward}>
                <SkipForward className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-2 ml-4">
                <Button size="sm" variant="ghost" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[0.5, 1, 1.5, 2].map(speed => (
                  <Button
                    key={speed}
                    size="sm"
                    variant={playbackSpeed === speed ? "default" : "ghost"}
                    onClick={() => changeSpeed(speed)}
                    className={cn(
                      "text-xs",
                      playbackSpeed === speed && "bg-cyan-500 hover:bg-cyan-600"
                    )}
                  >
                    {speed}x
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
