"use client"

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Play, Pause, SkipBack, SkipForward, Film, Clock, Target,
  Zap, Activity, Grid3x3, ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface ShotClip {
  id: string
  type: 'serve' | 'forehand' | 'backhand' | 'volley' | 'dink' | 'smash'
  timestamp: number
  duration: number
  quality: 'excellent' | 'good' | 'needs_work'
  analysis: string
}

interface ShotClipsViewerProps {
  videoUrl: string
  shots: ShotClip[]
  className?: string
}

export default function ShotClipsViewer({ videoUrl, shots, className }: ShotClipsViewerProps) {
  const [selectedShotType, setSelectedShotType] = useState<string>('all')
  const [currentClipIndex, setCurrentClipIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [videoLoadError, setVideoLoadError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Safety check for shots array
  const validShots = Array.isArray(shots) ? shots : []

  // Quality priority for sorting (higher number = higher priority)
  const qualityPriority = {
    'excellent': 3,
    'good': 2,
    'needs_work': 1
  }

  // Sort and limit to top 5 key shots based on quality
  const getTopShots = (shotList: ShotClip[], limit: number = 5): ShotClip[] => {
    if (!Array.isArray(shotList) || shotList.length === 0) {
      return []
    }
    return [...shotList]
      .sort((a, b) => {
        // First sort by quality (excellent > good > needs_work)
        const priorityDiff = qualityPriority[b.quality] - qualityPriority[a.quality]
        if (priorityDiff !== 0) return priorityDiff
        // If same quality, sort by timestamp (earlier first)
        return a.timestamp - b.timestamp
      })
      .slice(0, limit)
  }

  const topShots = getTopShots(validShots, 5)

  // Group top shots by type
  const shotsByType = topShots.reduce((acc, shot) => {
    if (!acc[shot.type]) {
      acc[shot.type] = []
    }
    acc[shot.type].push(shot)
    return acc
  }, {} as Record<string, ShotClip[]>)

  const shotTypeCounts = {
    serve: shotsByType.serve?.length || 0,
    forehand: shotsByType.forehand?.length || 0,
    backhand: shotsByType.backhand?.length || 0,
    volley: shotsByType.volley?.length || 0,
    dink: shotsByType.dink?.length || 0,
    smash: shotsByType.smash?.length || 0,
  }

  const filteredShots = selectedShotType === 'all' 
    ? topShots 
    : shotsByType[selectedShotType] || []

  const currentShot = filteredShots[currentClipIndex]

  const getShotTypeColor = (type: string) => {
    const colors = {
      serve: 'from-blue-500 to-cyan-500',
      forehand: 'from-green-500 to-emerald-500',
      backhand: 'from-purple-500 to-pink-500',
      volley: 'from-amber-500 to-orange-500',
      dink: 'from-teal-500 to-cyan-500',
      smash: 'from-red-500 to-pink-500',
    }
    return colors[type as keyof typeof colors] || 'from-slate-500 to-gray-500'
  }

  const getQualityBadge = (quality: string) => {
    const badges = {
      excellent: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: '🎯 Excellent' },
      good: { color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', label: '✅ Good' },
      needs_work: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: '💪 Needs Work' },
    }
    return badges[quality as keyof typeof badges] || badges.good
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const playClip = (shot: ShotClip) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = shot.timestamp
    video.play()
    setIsPlaying(true)

    // Stop after duration
    setTimeout(() => {
      video.pause()
      setIsPlaying(false)
    }, shot.duration * 1000)
  }

  const goToNextClip = () => {
    if (currentClipIndex < filteredShots.length - 1) {
      setCurrentClipIndex(currentClipIndex + 1)
    }
  }

  const goToPrevClip = () => {
    if (currentClipIndex > 0) {
      setCurrentClipIndex(currentClipIndex - 1)
    }
  }

  useEffect(() => {
    setCurrentClipIndex(0)
  }, [selectedShotType])

  useEffect(() => {
    if (currentShot) {
      playClip(currentShot)
    }
  }, [currentClipIndex])

  if (!validShots || validShots.length === 0) {
    return (
      <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
        <CardContent className="p-12 text-center">
          <Film className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold text-white mb-2">No Shot Clips Available</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Run shot detection analysis to automatically identify and clip individual shots from your video.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">Individual Shot Clips</CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Showing top 5 AI-analyzed key shots based on quality • {shots.length} total shots detected
              </p>
            </div>
          </div>
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-sm">
            Top {topShots.length} Shots
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Shot Type Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedShotType === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedShotType('all')}
            className={cn(
              selectedShotType === 'all' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                : 'border-slate-600 text-slate-300'
            )}
          >
            All Types ({topShots.length})
          </Button>
          {Object.entries(shotTypeCounts).map(([type, count]) => (
            count > 0 && (
              <Button
                key={type}
                size="sm"
                variant={selectedShotType === type ? 'default' : 'outline'}
                onClick={() => setSelectedShotType(type)}
                className={cn(
                  selectedShotType === type
                    ? `bg-gradient-to-r ${getShotTypeColor(type)} text-white`
                    : 'border-slate-600 text-slate-300'
                )}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}s ({count})
              </Button>
            )
          ))}
        </div>

        {/* Current Clip Player */}
        {currentShot && (
          <motion.div
            key={currentShot.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                playsInline
                onLoadedData={() => {
                  setIsVideoLoaded(true)
                  setVideoLoadError(false)
                }}
                onError={() => {
                  setVideoLoadError(true)
                  setIsVideoLoaded(false)
                }}
              />
              
              {/* Loading overlay */}
              {!isVideoLoaded && !videoLoadError && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 pointer-events-none">
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin" />
                    <p className="text-sm text-slate-300">Loading video...</p>
                  </div>
                </div>
              )}
              
              {/* Error overlay */}
              {videoLoadError && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 pointer-events-none">
                  <div className="text-center px-4">
                    <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-300">Failed to load video</p>
                  </div>
                </div>
              )}
              
              {/* Overlay Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={goToPrevClip}
                      disabled={currentClipIndex === 0}
                      className="text-white hover:bg-white/20"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => currentShot && playClip(currentShot)}
                      className="bg-cyan-500 hover:bg-cyan-600"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={goToNextClip}
                      disabled={currentClipIndex === filteredShots.length - 1}
                      className="text-white hover:bg-white/20"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{formatTime(currentShot.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clip Info */}
            <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={`bg-gradient-to-r ${getShotTypeColor(currentShot.type)} text-white border-0`}>
                    {currentShot.type.charAt(0).toUpperCase() + currentShot.type.slice(1)}
                  </Badge>
                  <Badge className={cn("border", getQualityBadge(currentShot.quality).color)}>
                    {getQualityBadge(currentShot.quality).label}
                  </Badge>
                </div>
                <span className="text-sm text-slate-400">
                  Clip {currentClipIndex + 1} of {filteredShots.length}
                </span>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">AI Analysis</h4>
                <p className="text-sm text-slate-300">{currentShot.analysis}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Shot Grid Thumbnails */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filteredShots.map((shot, index) => (
            <motion.button
              key={shot.id}
              onClick={() => setCurrentClipIndex(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative aspect-video rounded-lg border-2 transition-all overflow-hidden",
                currentClipIndex === index
                  ? `border-cyan-500 shadow-lg shadow-cyan-500/50`
                  : 'border-slate-700 hover:border-slate-500'
              )}
            >
              <video
                src={videoUrl}
                className="w-full h-full object-cover"
                preload="metadata"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Play className="w-8 h-8 text-white" />
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                <Badge className={`text-xs bg-gradient-to-r ${getShotTypeColor(shot.type)} text-white border-0`}>
                  {shot.type}
                </Badge>
                <span className="text-xs text-white bg-black/60 px-2 py-0.5 rounded">
                  {formatTime(shot.timestamp)}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
