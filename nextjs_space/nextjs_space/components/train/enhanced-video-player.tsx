
'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
  Download,
  CheckCircle2,
  Play,
  Clock,
  Sparkles,
  RotateCcw,
  Trophy
} from 'lucide-react'
import { useSession } from 'next-auth/react'

interface EnhancedVideoPlayerProps {
  videoId: string
  videoDbId: string
  title: string
  duration?: string
  onComplete?: () => void
}

export default function EnhancedVideoPlayer({
  videoId,
  videoDbId,
  title,
  duration,
  onComplete
}: EnhancedVideoPlayerProps) {
  const { data: session } = useSession() || {}
  const [progress, setProgress] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [canDownload, setCanDownload] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const playerRef = useRef<HTMLIFrameElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)

  // Fetch initial progress
  useEffect(() => {
    fetchProgress()
    checkProStatus()
  }, [videoDbId])

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/training/video-progress?videoId=${videoDbId}`)
      const data = await response.json()
      setProgress(data.progress)
      if (data.lastPosition) {
        setCurrentTime(data.lastPosition)
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkProStatus = async () => {
    // Check if user is Pro subscriber
    try {
      const response = await fetch('/api/user/subscription')
      const data = await response.json()
      setCanDownload(data.tier === 'PRO')
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  // Track progress every 5 seconds
  useEffect(() => {
    if (!isLoading && videoDbId) {
      // Start tracking after video loads
      progressIntervalRef.current = setInterval(() => {
        trackProgress()
      }, 5000)

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
        }
      }
    }
  }, [isLoading, videoDbId, currentTime, videoDuration])

  const trackProgress = async () => {
    if (!videoDbId || videoDuration === 0) return

    const percentage = (currentTime / videoDuration) * 100

    try {
      const response = await fetch('/api/training/video-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: videoDbId,
          position: Math.floor(currentTime),
          percentage: Math.min(Math.floor(percentage), 100),
          completed: percentage >= 90
        })
      })

      const data = await response.json()
      if (data.autoCompleted && !progress?.watched) {
        toast.success('🎉 Video completed! Great work, Champion!')
        setProgress({ ...progress, watched: true })
        onComplete?.()
      }
    } catch (error) {
      console.error('Error tracking progress:', error)
    }
  }

  const handleDownload = async () => {
    if (!canDownload) {
      toast.error('Upgrade to Pro for offline downloads')
      return
    }

    setIsDownloading(true)
    try {
      const response = await fetch('/api/training/download-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: videoDbId })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success('Video available for offline viewing!')
        await fetchProgress()
      } else if (data.upgradeRequired) {
        toast.error('Pro subscription required', {
          description: 'Upgrade to Pro to download videos for offline viewing'
        })
      }
    } catch (error) {
      console.error('Error downloading video:', error)
      toast.error('Failed to download video')
    } finally {
      setIsDownloading(false)
    }
  }

  const resumeVideo = () => {
    if (progress?.lastPosition && playerRef.current) {
      const resumeTime = progress.lastPosition
      const newSrc = `https://www.youtube.com/embed/${videoId}?start=${resumeTime}&autoplay=1`
      playerRef.current.src = newSrc
      toast.success(`Resuming from ${Math.floor(resumeTime / 60)}:${(resumeTime % 60).toString().padStart(2, '0')}`)
    }
  }

  const watchPercentage = progress?.watchPercentage || 0
  const isCompleted = progress?.watched || false
  const hasProgress = progress?.lastPosition > 0

  return (
    <Card className="overflow-hidden shadow-xl">
      <CardContent className="p-0">
        {/* Video Player */}
        <div className="relative aspect-video bg-black">
          <iframe
            ref={playerRef}
            src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            onLoad={() => setIsLoading(false)}
          />
          
          {/* Status Badges */}
          <div className="absolute top-4 right-4 flex gap-2">
            {isCompleted && (
              <Badge className="bg-green-600 text-white shadow-lg">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
            {progress?.downloadedOffline && (
              <Badge className="bg-blue-600 text-white shadow-lg">
                <Download className="w-3 h-3 mr-1" />
                Offline Ready
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {hasProgress && !isCompleted && (
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-emerald-900">
                Your Progress: {Math.floor(watchPercentage)}%
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={resumeVideo}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Resume
              </Button>
            </div>
            <Progress value={watchPercentage} className="h-2 bg-emerald-100" />
          </div>
        )}

        {/* Actions */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              {duration && (
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <Clock className="w-4 h-4" />
                  {duration}
                </p>
              )}
            </div>
          </div>

          {/* Download Button (Pro Only) */}
          {canDownload && !progress?.downloadedOffline && (
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? 'Preparing Download...' : 'Download for Offline Viewing'}
            </Button>
          )}

          {!canDownload && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">
                    Upgrade to Pro for Offline Downloads
                  </p>
                  <p className="text-xs text-amber-800 mt-1">
                    Download videos and watch them anywhere, anytime - even without internet!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Completion Message */}
          {isCompleted && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Trophy className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900">
                    Congratulations, Champion! 🎉
                  </p>
                  <p className="text-xs text-green-800 mt-1">
                    You've completed this training video. Keep up the great work!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
