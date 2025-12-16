
"use client"

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import {
  Play, Pause, SkipBack, SkipForward, Rewind, FastForward,
  Target, Zap, TrendingUp, Eye, CheckCircle2, AlertCircle,
  ChevronLeft, ChevronRight, Maximize2, Film, Star, Trophy, MousePointerClick,
  MapPin, Brain, Lightbulb, Gauge, Users, Crosshair, Route, Footprints
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface ShotMoment {
  id: number
  time: number
  type: string
  quality: 'excellent' | 'good' | 'needs-work'
  score: number
  thumbnail: string
  analysis: {
    technique: string
    power: number
    accuracy: number
    timing: number
    positioning: number
    notes: string[]
    improvements: string[]
  }
  courtPosition?: {
    courtZone: 'baseline' | 'transition-zone' | 'kitchen-line' | 'mid-court'
    positionQuality: number
    courtCoverage: number
    balanceAndStance: number
  }
  shotSelection?: {
    shotPurpose: string
    wasItOptimal: boolean
    betterAlternative: string | null
    tacticalReasoning: string
  }
  decisionMaking?: {
    situationReading: number
    anticipation: number
    riskAssessment: 'too-aggressive' | 'perfect' | 'too-conservative'
    gameAwareness: number
  }
  tacticalFeedback?: {
    strengths: string[]
    improvements: string[]
    coachKaiTip: string
  }
  positioningImprovements?: {
    currentPositionIssues: string | null
    optimalPosition: string
    recoveryPath: string
    footworkNotes: string
  }
}

interface ShotByBreakdownProps {
  videoUrl: string
  analysisData: any
  className?: string
}

export default function ShotByBreakdown({ videoUrl, analysisData, className }: ShotByBreakdownProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const thumbnailVideoRef = useRef<HTMLVideoElement>(null)
  const timelineScrollRef = useRef<HTMLDivElement>(null)
  const [selectedShot, setSelectedShot] = useState<ShotMoment | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [thumbnails, setThumbnails] = useState<{ [key: number]: string }>({})
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState(true)

  // Extract detected shots from analysis data, or use empty array as fallback
  const detectedShots = analysisData?.detectedShots || []
  
  // Convert detected shots to ShotMoment format with enhanced fields
  const shotMoments: ShotMoment[] = Array.isArray(detectedShots) 
    ? detectedShots.map((shot: any) => ({
        id: shot.id || 0,
        time: shot.time || 0,
        type: shot.type || 'Unknown Shot',
        quality: shot.quality || 'good',
        score: shot.score || 70,
        thumbnail: '/placeholder-shot.jpg',
        analysis: {
          technique: shot.analysis?.technique || 'Shot executed',
          power: shot.analysis?.power || 70,
          accuracy: shot.analysis?.accuracy || 70,
          timing: shot.analysis?.timing || 70,
          positioning: shot.analysis?.positioning || 70,
          notes: Array.isArray(shot.analysis?.notes) ? shot.analysis.notes : [],
          improvements: Array.isArray(shot.analysis?.improvements) ? shot.analysis.improvements : [],
        },
        courtPosition: shot.courtPosition,
        shotSelection: shot.shotSelection,
        decisionMaking: shot.decisionMaking,
        tacticalFeedback: shot.tacticalFeedback,
        positioningImprovements: shot.positioningImprovements,
      }))
    : []

  // Auto-select first shot on mount and generate thumbnails
  useEffect(() => {
    if (shotMoments.length > 0 && !selectedShot) {
      setSelectedShot(shotMoments[0])
    }
    
    // Generate thumbnails from video
    const generateThumbnails = async () => {
      if (!thumbnailVideoRef.current) return
      
      const video = thumbnailVideoRef.current
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) return
      
      canvas.width = 320
      canvas.height = 180
      
      const newThumbnails: { [key: number]: string } = {}
      
      for (const shot of shotMoments) {
        try {
          // Seek to the shot time
          video.currentTime = shot.time
          
          // Wait for seek to complete
          await new Promise((resolve) => {
            video.addEventListener('seeked', resolve, { once: true })
          })
          
          // Draw frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          
          // Convert to data URL
          newThumbnails[shot.id] = canvas.toDataURL('image/jpeg', 0.8)
        } catch (error) {
          console.error(`Error generating thumbnail for shot ${shot.id}:`, error)
        }
      }
      
      setThumbnails(newThumbnails)
      setIsLoadingThumbnails(false)
    }
    
    if (thumbnailVideoRef.current) {
      thumbnailVideoRef.current.addEventListener('loadeddata', generateThumbnails, { once: true })
    }
    
    return () => {
      if (thumbnailVideoRef.current) {
        thumbnailVideoRef.current.removeEventListener('loadeddata', generateThumbnails)
      }
    }
  }, [])

  const jumpToShot = (shot: ShotMoment) => {
    if (videoRef.current) {
      videoRef.current.currentTime = shot.time
      videoRef.current.pause()
      setIsPlaying(false)
      setSelectedShot(shot)
      
      // Smooth scroll to show selected shot is centered in timeline
      if (timelineScrollRef.current) {
        const shotElement = timelineScrollRef.current.querySelector(`[data-shot-id="${shot.id}"]`)
        if (shotElement) {
          shotElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        }
      }
    }
  }

  const playSlowMotion = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
      setPlaybackSpeed(speed)
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'border-emerald-500 bg-emerald-500/10'
      case 'good':
        return 'border-cyan-500 bg-cyan-500/10'
      case 'needs-work':
        return 'border-amber-500 bg-amber-500/10'
      default:
        return 'border-slate-600'
    }
  }

  const getQualityBadge = (quality: string, score: number) => {
    switch (quality) {
      case 'excellent':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><Star className="w-3 h-3 mr-1" />{score}/100</Badge>
      case 'good':
        return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />{score}/100</Badge>
      case 'needs-work':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><AlertCircle className="w-3 h-3 mr-1" />{score}/100</Badge>
      default:
        return null
    }
  }

  // Show message if no shots detected
  if (shotMoments.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg shadow-emerald-500/30">
            <Film className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent">
              Shot-by-Shot Breakdown
            </h2>
            <p className="text-slate-400">Analyze every key moment in detail with slow-motion replay</p>
          </div>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 shadow-2xl shadow-emerald-500/10">
          <CardContent className="p-12 text-center">
            <div className="mb-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full blur-xl opacity-50" />
                <div className="relative bg-gradient-to-r from-cyan-500 to-emerald-500 p-4 rounded-full">
                  <Film className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Shot Detection In Progress
            </h3>
            <p className="text-slate-300 max-w-md mx-auto">
              Our AI is analyzing your video to identify key shots and moments. This may take a few moments. Please refresh the page shortly to see the detailed shot-by-shot breakdown.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg shadow-emerald-500/30">
          <Film className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent">
            Shot-by-Shot Breakdown
          </h2>
          <p className="text-slate-400">Analyze every key moment in detail with slow-motion replay</p>
        </div>
      </div>

      {/* Hidden video for thumbnail generation */}
      <video
        ref={thumbnailVideoRef}
        src={videoUrl}
        className="hidden"
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Timeline Scrubber with Thumbnails */}
      <Card className="bg-slate-800/50 border-slate-700 shadow-2xl shadow-emerald-500/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            Key Moments Timeline
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-cyan-400 animate-pulse" />
            {shotMoments.length} key shots identified • Click any shot for detailed analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Horizontal scroll container */}
            <div 
              ref={timelineScrollRef}
              className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50 hover:scrollbar-thumb-slate-500"
            >
              {shotMoments.map((shot) => (
                <motion.div
                  key={shot.id}
                  data-shot-id={shot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: shot.id * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => jumpToShot(shot)}
                  className={cn(
                    "flex-shrink-0 w-48 cursor-pointer rounded-lg border-2 overflow-hidden transition-all duration-300 group",
                    selectedShot?.id === shot.id
                      ? 'border-emerald-500 ring-4 ring-emerald-500/50 shadow-xl shadow-emerald-500/50'
                      : getQualityColor(shot.quality) + ' hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/30'
                  )}
                >
                  <div className="relative aspect-video bg-slate-900">
                    {/* Thumbnail */}
                    {thumbnails[shot.id] ? (
                      <Image
                        src={thumbnails[shot.id]}
                        alt={`${shot.type} at ${shot.time}s`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                        {isLoadingThumbnails ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                        ) : (
                          <Play className="w-12 h-12 text-white/30 group-hover:text-white/60 transition-colors" />
                        )}
                      </div>
                    )}
                    
                    {/* Play overlay on hover */}
                    {selectedShot?.id !== shot.id && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    
                    {/* Selected indicator */}
                    {selectedShot?.id === shot.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 border-4 border-emerald-500 pointer-events-none"
                      />
                    )}
                    
                    {/* Time stamp */}
                    <div className="absolute top-2 left-2 bg-black/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs text-white font-mono border border-white/10">
                      {Math.floor(shot.time / 60)}:{(shot.time % 60).toFixed(1).padStart(4, '0')}
                    </div>
                    {/* Quality badge */}
                    <div className="absolute top-2 right-2">
                      {getQualityBadge(shot.quality, shot.score)}
                    </div>
                  </div>
                  <div className={cn(
                    "p-3 transition-colors",
                    selectedShot?.id === shot.id
                      ? "bg-emerald-500/20"
                      : "bg-slate-900/50 group-hover:bg-slate-900/70"
                  )}>
                    <p className="text-sm font-semibold text-white truncate">{shot.type}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {shot.quality === 'excellent' && <Star className="w-3.5 h-3.5 text-emerald-400" />}
                      {shot.quality === 'good' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                      {shot.quality === 'needs-work' && <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
                      <span className="text-xs text-slate-300 capitalize font-medium">{shot.quality.replace('-', ' ')}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Shot Analysis */}
      <AnimatePresence mode="wait">
        {selectedShot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-emerald-400" />
                      {selectedShot.type} Analysis
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {selectedShot.analysis.technique}
                    </CardDescription>
                  </div>
                  {getQualityBadge(selectedShot.quality, selectedShot.score)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Video Player with Controls */}
                <div className="space-y-3">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      className="w-full h-full object-contain"
                      playsInline
                    />
                  </div>
                  
                  {/* Playback Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => jumpToShot(selectedShot)}>
                        <SkipBack className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (videoRef.current) {
                            if (isPlaying) {
                              videoRef.current.pause()
                            } else {
                              videoRef.current.play()
                            }
                            setIsPlaying(!isPlaying)
                          }
                        }}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={playbackSpeed === 0.25 ? "default" : "outline"}
                        onClick={() => playSlowMotion(0.25)}
                        className={cn(playbackSpeed === 0.25 && "bg-emerald-500 hover:bg-emerald-600")}
                      >
                        0.25x
                      </Button>
                      <Button
                        size="sm"
                        variant={playbackSpeed === 0.5 ? "default" : "outline"}
                        onClick={() => playSlowMotion(0.5)}
                        className={cn(playbackSpeed === 0.5 && "bg-emerald-500 hover:bg-emerald-600")}
                      >
                        0.5x
                      </Button>
                      <Button
                        size="sm"
                        variant={playbackSpeed === 1 ? "default" : "outline"}
                        onClick={() => playSlowMotion(1)}
                        className={cn(playbackSpeed === 1 && "bg-emerald-500 hover:bg-emerald-600")}
                      >
                        1x
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Technical Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Power', value: selectedShot.analysis.power, icon: Zap, color: 'text-purple-400' },
                    { name: 'Accuracy', value: selectedShot.analysis.accuracy, icon: Target, color: 'text-cyan-400' },
                    { name: 'Timing', value: selectedShot.analysis.timing, icon: TrendingUp, color: 'text-emerald-400' },
                    { name: 'Positioning', value: selectedShot.analysis.positioning, icon: Eye, color: 'text-blue-400' }
                  ].map((metric) => {
                    const Icon = metric.icon
                    return (
                      <div key={metric.name} className="bg-slate-900/50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">{metric.name}</span>
                          <Icon className={cn("w-4 h-4", metric.color)} />
                        </div>
                        <div className="text-2xl font-bold text-white">{metric.value}%</div>
                        <Progress value={metric.value} className="h-2" />
                      </div>
                    )
                  })}
                </div>

                {/* Court Position Analysis */}
                {selectedShot.courtPosition && (
                  <div className="bg-gradient-to-br from-slate-900/70 to-blue-900/20 border border-blue-500/30 rounded-lg p-5 space-y-4">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-400" />
                      Court Position & Balance
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <span className="text-xs text-slate-400">Court Zone</span>
                        <Badge className={cn(
                          "w-full justify-center font-semibold",
                          selectedShot.courtPosition.courtZone === 'kitchen-line' && "bg-emerald-500",
                          selectedShot.courtPosition.courtZone === 'baseline' && "bg-blue-500",
                          selectedShot.courtPosition.courtZone === 'transition-zone' && "bg-amber-500",
                          selectedShot.courtPosition.courtZone === 'mid-court' && "bg-purple-500"
                        )}>
                          {selectedShot.courtPosition.courtZone.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-slate-400">Position Quality</span>
                        <div className="text-lg font-bold text-white">{selectedShot.courtPosition.positionQuality}%</div>
                        <Progress value={selectedShot.courtPosition.positionQuality} className="h-1.5" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-slate-400">Court Coverage</span>
                        <div className="text-lg font-bold text-white">{selectedShot.courtPosition.courtCoverage}%</div>
                        <Progress value={selectedShot.courtPosition.courtCoverage} className="h-1.5" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-slate-400">Balance & Stance</span>
                        <div className="text-lg font-bold text-white">{selectedShot.courtPosition.balanceAndStance}%</div>
                        <Progress value={selectedShot.courtPosition.balanceAndStance} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Shot Selection Intelligence */}
                {selectedShot.shotSelection && (
                  <div className={cn(
                    "rounded-lg p-5 space-y-3 border-2",
                    selectedShot.shotSelection.wasItOptimal 
                      ? "bg-gradient-to-br from-emerald-900/30 to-green-900/20 border-emerald-500/40" 
                      : "bg-gradient-to-br from-amber-900/30 to-orange-900/20 border-amber-500/40"
                  )}>
                    <div className="flex items-start justify-between">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <Brain className={cn(
                          "w-5 h-5",
                          selectedShot.shotSelection.wasItOptimal ? "text-emerald-400" : "text-amber-400"
                        )} />
                        Shot Selection Intelligence
                      </h4>
                      <Badge className={cn(
                        selectedShot.shotSelection.wasItOptimal 
                          ? "bg-emerald-500 hover:bg-emerald-600" 
                          : "bg-amber-500 hover:bg-amber-600"
                      )}>
                        {selectedShot.shotSelection.wasItOptimal ? "Optimal Choice" : "Could Improve"}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-slate-400 font-medium">Purpose: </span>
                        <span className="text-white">{selectedShot.shotSelection.shotPurpose}</span>
                      </div>
                      <div className="bg-slate-900/40 rounded p-3 border border-slate-700/50">
                        <span className="text-slate-300 italic">{selectedShot.shotSelection.tacticalReasoning}</span>
                      </div>
                      {selectedShot.shotSelection.betterAlternative && (
                        <div className="bg-amber-900/20 border border-amber-500/30 rounded p-3 flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-amber-300 font-medium text-xs">Better Alternative: </span>
                            <span className="text-amber-100">{selectedShot.shotSelection.betterAlternative}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Decision Making Analysis */}
                {selectedShot.decisionMaking && (
                  <div className="bg-gradient-to-br from-slate-900/70 to-purple-900/20 border border-purple-500/30 rounded-lg p-5 space-y-4">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Gauge className="w-5 h-5 text-purple-400" />
                      Decision Making & Game IQ
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-purple-300" />
                          <span className="text-xs text-slate-400">Situation Reading</span>
                        </div>
                        <div className="text-xl font-bold text-white">{selectedShot.decisionMaking.situationReading}%</div>
                        <Progress value={selectedShot.decisionMaking.situationReading} className="h-1.5" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-cyan-300" />
                          <span className="text-xs text-slate-400">Anticipation</span>
                        </div>
                        <div className="text-xl font-bold text-white">{selectedShot.decisionMaking.anticipation}%</div>
                        <Progress value={selectedShot.decisionMaking.anticipation} className="h-1.5" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Gauge className="w-4 h-4 text-emerald-300" />
                          <span className="text-xs text-slate-400">Risk Assessment</span>
                        </div>
                        <Badge className={cn(
                          "w-full justify-center capitalize",
                          selectedShot.decisionMaking.riskAssessment === 'perfect' && "bg-emerald-500",
                          selectedShot.decisionMaking.riskAssessment === 'too-aggressive' && "bg-red-500",
                          selectedShot.decisionMaking.riskAssessment === 'too-conservative' && "bg-amber-500"
                        )}>
                          {selectedShot.decisionMaking.riskAssessment.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-300" />
                          <span className="text-xs text-slate-400">Game Awareness</span>
                        </div>
                        <div className="text-xl font-bold text-white">{selectedShot.decisionMaking.gameAwareness}%</div>
                        <Progress value={selectedShot.decisionMaking.gameAwareness} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Coach Kai's Tactical Feedback */}
                {selectedShot.tacticalFeedback && (
                  <div className="bg-gradient-to-br from-cyan-900/20 via-emerald-900/20 to-cyan-900/20 border-2 border-cyan-500/40 rounded-lg p-5 space-y-4">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-cyan-400" />
                      Coach Kai's Tactical Insights
                    </h4>
                    
                    {selectedShot.tacticalFeedback.strengths.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Tactical Strengths
                        </h5>
                        <ul className="space-y-1.5">
                          {selectedShot.tacticalFeedback.strengths.map((strength, index) => (
                            <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedShot.tacticalFeedback.improvements.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-amber-300 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Tactical Improvements
                        </h5>
                        <ul className="space-y-1.5">
                          {selectedShot.tacticalFeedback.improvements.map((improvement, index) => (
                            <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                              <Crosshair className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedShot.tacticalFeedback.coachKaiTip && (
                      <div className="bg-gradient-to-r from-cyan-900/30 to-emerald-900/30 border border-cyan-500/30 rounded-lg p-4 mt-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 p-2 bg-cyan-500/20 rounded-full">
                            <Trophy className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div className="flex-1">
                            <h6 className="text-xs font-semibold text-cyan-300 mb-1">Coach Kai's Wisdom</h6>
                            <p className="text-sm text-white italic leading-relaxed">
                              "{selectedShot.tacticalFeedback.coachKaiTip}"
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Positioning Improvements */}
                {selectedShot.positioningImprovements && (
                  <div className="bg-gradient-to-br from-slate-900/70 to-indigo-900/20 border border-indigo-500/30 rounded-lg p-5 space-y-3">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Footprints className="w-5 h-5 text-indigo-400" />
                      Positioning & Footwork Guidance
                    </h4>
                    
                    {selectedShot.positioningImprovements.currentPositionIssues && (
                      <div className="bg-red-900/20 border border-red-500/30 rounded p-3 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-red-300 font-medium text-xs">Current Issues: </span>
                          <span className="text-red-100 text-sm">{selectedShot.positioningImprovements.currentPositionIssues}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="bg-slate-900/40 rounded p-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs text-slate-400 font-medium">Optimal Position</span>
                        </div>
                        <p className="text-sm text-white">{selectedShot.positioningImprovements.optimalPosition}</p>
                      </div>
                      
                      <div className="bg-slate-900/40 rounded p-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <Route className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs text-slate-400 font-medium">Recovery Path</span>
                        </div>
                        <p className="text-sm text-white">{selectedShot.positioningImprovements.recoveryPath}</p>
                      </div>
                      
                      <div className="bg-slate-900/40 rounded p-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <Footprints className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs text-slate-400 font-medium">Footwork Notes</span>
                        </div>
                        <p className="text-sm text-white">{selectedShot.positioningImprovements.footworkNotes}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Analysis Notes */}
                {selectedShot.analysis.notes.length > 0 && (
                  <div className="bg-slate-900/50 rounded-lg p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      What You Did Well
                    </h4>
                    <ul className="space-y-1">
                      {selectedShot.analysis.notes.map((note, index) => (
                        <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Improvements */}
                {selectedShot.analysis.improvements.length > 0 && (
                  <div className="bg-slate-900/50 rounded-lg p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-1">
                      {selectedShot.analysis.improvements.map((improvement, index) => (
                        <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedShot.id === 1}
                    onClick={() => {
                      const prevShot = shotMoments.find(s => s.id === selectedShot.id - 1)
                      if (prevShot) jumpToShot(prevShot)
                    }}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous Shot
                  </Button>
                  
                  <span className="text-sm text-slate-400">
                    Shot {selectedShot.id} of {shotMoments.length}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedShot.id === shotMoments.length}
                    onClick={() => {
                      const nextShot = shotMoments.find(s => s.id === selectedShot.id + 1)
                      if (nextShot) jumpToShot(nextShot)
                    }}
                  >
                    Next Shot
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedShot && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-slate-800/80 via-cyan-900/20 to-emerald-900/20 border-cyan-500/30 shadow-2xl shadow-cyan-500/20 relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-emerald-500/5 to-cyan-500/5 animate-pulse" />
            
            <CardContent className="relative p-16 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-6"
              >
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full blur-xl opacity-50 animate-pulse" />
                  <div className="relative bg-gradient-to-r from-cyan-500 to-emerald-500 p-4 rounded-full">
                    <MousePointerClick className="w-16 h-16 text-white animate-bounce" />
                  </div>
                </div>
              </motion.div>
              
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent"
              >
                Select a Shot to Analyze
              </motion.h3>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-slate-300 mb-6 max-w-md mx-auto"
              >
                Click any shot in the timeline above to view detailed frame-by-frame analysis, technique metrics, and personalized improvement suggestions
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-4 text-sm text-slate-400"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-emerald-400" />
                  <span>Technique Scores</span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-cyan-400" />
                  <span>Slow Motion Replay</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span>Improvement Tips</span>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
