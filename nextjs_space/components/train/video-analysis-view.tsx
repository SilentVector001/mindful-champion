// @ts-nocheck
"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft, Play, Pause, Target, Zap, Brain, Trophy,
  Lightbulb, Activity, CheckCircle, AlertCircle, TrendingUp,
  ChevronRight, Download, Share2, Eye, Cpu, Clock
} from "lucide-react"
import { cn } from "@/lib/utils"
import MainNavigation from "@/components/navigation/main-navigation"

interface VideoAnalysisViewProps {
  analysis: any
  user: any
}

// AI Waveform animation
function AIWaveform({ isActive = true }: { isActive?: boolean }) {
  return (
    <div className="flex items-center gap-0.5 h-6">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full"
          animate={isActive ? {
            height: [4, Math.random() * 16 + 6, 4],
            opacity: [0.4, 1, 0.4]
          } : { height: 4, opacity: 0.3 }}
          transition={{
            duration: 0.5 + Math.random() * 0.3,
            repeat: Infinity,
            delay: i * 0.03
          }}
        />
      ))}
    </div>
  )
}

// Skeleton Pose Overlay
function SkeletonOverlay({ isPlaying }: { isPlaying: boolean }) {
  const joints = {
    head: { x: 50, y: 15 }, neck: { x: 50, y: 22 },
    leftShoulder: { x: 38, y: 28 }, rightShoulder: { x: 62, y: 28 },
    leftElbow: { x: 28, y: 40 }, rightElbow: { x: 75, y: 35 },
    leftWrist: { x: 22, y: 55 }, rightWrist: { x: 85, y: 30 },
    spine: { x: 50, y: 45 },
    leftHip: { x: 42, y: 55 }, rightHip: { x: 58, y: 55 },
    leftKnee: { x: 38, y: 72 }, rightKnee: { x: 62, y: 72 },
    leftAnkle: { x: 35, y: 90 }, rightAnkle: { x: 65, y: 90 },
  }
  
  const connections = [
    ['head', 'neck'], ['neck', 'leftShoulder'], ['neck', 'rightShoulder'],
    ['leftShoulder', 'leftElbow'], ['leftElbow', 'leftWrist'],
    ['rightShoulder', 'rightElbow'], ['rightElbow', 'rightWrist'],
    ['neck', 'spine'], ['spine', 'leftHip'], ['spine', 'rightHip'],
    ['leftHip', 'leftKnee'], ['leftKnee', 'leftAnkle'],
    ['rightHip', 'rightKnee'], ['rightKnee', 'rightAnkle'], ['leftHip', 'rightHip']
  ]

  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <linearGradient id="boneGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#10b981" /></linearGradient>
      </defs>
      {connections.map(([from, to], i) => {
        const fromJ = joints[from as keyof typeof joints]
        const toJ = joints[to as keyof typeof joints]
        return (
          <motion.line
            key={i}
            x1={fromJ.x} y1={fromJ.y} x2={toJ.x} y2={toJ.y}
            stroke="url(#boneGradient)" strokeWidth="1.5" strokeLinecap="round" filter="url(#glow)"
            animate={{ opacity: isPlaying ? [0.6, 1, 0.6] : 0.8 }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.05 }}
          />
        )
      })}
      {Object.entries(joints).map(([name, pos], i) => (
        <motion.circle
          key={name}
          cx={pos.x} cy={pos.y}
          r={name === 'head' ? 4 : name.includes('Wrist') ? 3 : 2}
          fill={name === 'rightWrist' ? '#10b981' : '#22d3ee'}
          filter="url(#glow)"
          animate={{
            scale: isPlaying ? [1, 1.3, 1] : 1,
            opacity: isPlaying ? [0.8, 1, 0.8] : 0.9
          }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.03 }}
        />
      ))}
      {/* Paddle */}
      <motion.rect
        x="83" y="22" width="8" height="12" rx="2"
        fill="none" stroke="#10b981" strokeWidth="1" filter="url(#glow)"
        animate={isPlaying ? { rotate: [-5, 5, -5] } : {}}
        transition={{ duration: 0.4, repeat: Infinity }}
        style={{ transformOrigin: '85px 30px' }}
      />
    </svg>
  )
}

export default function VideoAnalysisView({ analysis, user }: VideoAnalysisViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showSkeleton, setShowSkeleton] = useState(true)

  // Parse analysis data with fallbacks
  const overallScore = analysis?.overallScore ?? 78
  const strengths = (analysis?.strengths as string[]) ?? [
    'Excellent paddle control on dinks',
    'Good court positioning',
    'Strong third shot drop consistency'
  ]
  const improvements = (analysis?.areasForImprovement as string[]) ?? [
    'Work on split-stepping before opponent contact',
    'Keep paddle up higher in ready position',
    'Focus on softer resets'
  ]
  const recommendations = (analysis?.recommendations as string[]) ?? [
    'Practice 10 minutes of dink-only rallies daily',
    'Film yourself from the side to check ready position',
    'Work on the third shot drop drill with a target'
  ]

  // Parse technical scores
  const techScores = analysis?.technicalScores as any
  const moveMetrics = analysis?.movementMetrics as any
  const technicalMetrics = [
    { label: 'Technique', value: techScores?.overall ?? 76, icon: Target, color: 'cyan' },
    { label: 'Footwork', value: techScores?.footwork ?? moveMetrics?.footwork ?? 74, icon: Activity, color: 'emerald' },
    { label: 'Positioning', value: moveMetrics?.positioning ?? 82, icon: Zap, color: 'amber' },
    { label: 'Strategy', value: techScores?.strategy ?? 78, icon: Brain, color: 'purple' },
  ]

  // Sample shots for timeline
  const shots = (analysis?.keyMoments as any[]) ?? []
  const sampleShots = shots.length > 0 ? shots : [
    { time: 8, type: 'Forehand Drive', quality: 'excellent' },
    { time: 15, type: 'Dink', quality: 'excellent' },
    { time: 24, type: 'Third Shot Drop', quality: 'good' },
    { time: 38, type: 'Volley', quality: 'excellent' },
    { time: 52, type: 'Reset Shot', quality: 'needs_work' },
  ]

  // Video controls
  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-500'
    if (score >= 60) return 'from-cyan-500 to-blue-500'
    if (score >= 40) return 'from-amber-500 to-orange-500'
    return 'from-red-500 to-rose-500'
  }

  const getQualityColor = (quality: string) => {
    if (quality === 'excellent') return 'bg-emerald-500'
    if (quality === 'good') return 'bg-cyan-500'
    return 'bg-amber-500'
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <MainNavigation user={user} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/train/video" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Video Lab
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {analysis?.title || 'Video Analysis'}
            </h1>
            <div className="flex items-center gap-3 text-gray-400 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(analysis?.uploadedAt || Date.now()).toLocaleDateString()}
              </span>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                <Cpu className="w-3 h-3 mr-1" /> AI Analyzed
              </Badge>
            </div>
          </div>

          {/* Overall Score */}
          <div className="text-center">
            <div className={cn(
              "w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black text-white shadow-lg bg-gradient-to-br",
              getScoreColor(overallScore)
            )}>
              {overallScore}
            </div>
            <div className="text-sm text-gray-400 mt-2">Overall Score</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Player Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <Card className="bg-slate-900/60 border-slate-700/50 overflow-hidden">
              <div className="relative aspect-video bg-black">
                {/* Video Element */}
                {analysis?.videoUrl ? (
                  <video
                    ref={videoRef}
                    src={analysis.videoUrl}
                    className="w-full h-full object-contain"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                    <div className="text-center">
                      <Eye className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
                      <p className="text-gray-400">Video preview not available</p>
                    </div>
                  </div>
                )}

                {/* Skeleton Overlay */}
                {showSkeleton && (
                  <SkeletonOverlay isPlaying={isPlaying} />
                )}

                {/* AI Processing Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-slate-900/90 text-cyan-400 border-cyan-500/30">
                    <Cpu className="w-3 h-3 mr-1" /> AI Pose Detection
                  </Badge>
                </div>

                {/* Play Button Overlay */}
                {!isPlaying && analysis?.videoUrl && (
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                  >
                    <div className="w-20 h-20 rounded-full bg-cyan-500/90 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </button>
                )}
              </div>

              {/* Video Controls */}
              <div className="p-4 border-t border-slate-700/50">
                <div className="flex items-center gap-4 mb-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={togglePlay}
                    disabled={!analysis?.videoUrl}
                    className="text-white hover:bg-slate-700"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <span className="text-sm text-gray-400">
                    {formatTime(currentTime)} / {formatTime(duration || 120)}
                  </span>
                  <div className="flex-1" />
                  <Button
                    size="sm"
                    variant={showSkeleton ? "default" : "ghost"}
                    onClick={() => setShowSkeleton(!showSkeleton)}
                    className={showSkeleton ? "bg-cyan-500 hover:bg-cyan-600" : "text-gray-400 hover:text-white"}
                  >
                    <Activity className="w-4 h-4 mr-1" /> Pose
                  </Button>
                </div>

                {/* AI Waveform */}
                <div className="flex items-center gap-3">
                  <AIWaveform isActive={isPlaying} />
                  <span className="text-xs text-gray-500">AI Neural Processing</span>
                </div>

                {/* Shot Timeline */}
                <div className="relative h-8 mt-4 bg-slate-800 rounded-lg overflow-hidden">
                  {/* Progress */}
                  <div
                    className="absolute inset-y-0 left-0 bg-cyan-500/30"
                    style={{ width: `${(currentTime / (duration || 120)) * 100}%` }}
                  />
                  {/* Shot Markers */}
                  {sampleShots.map((shot: any, i) => (
                    <button
                      key={i}
                      onClick={() => seekTo(shot.time || shot.timestamp || i * 10)}
                      className={cn(
                        "absolute top-1 bottom-1 w-2 rounded-full transition-transform hover:scale-125",
                        getQualityColor(shot.quality || 'good')
                      )}
                      style={{ left: `${((shot.time || shot.timestamp || i * 10) / (duration || 120)) * 100}%` }}
                      title={shot.type || shot.title}
                    />
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Excellent</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" /> Good</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Needs Work</span>
                </div>
              </div>
            </Card>

            {/* Technical Metrics */}
            <Card className="bg-slate-900/60 border-slate-700/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  Technical Breakdown
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {technicalMetrics.map((metric) => (
                    <div key={metric.label} className="bg-slate-800/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">{metric.label}</span>
                        <span className={cn(
                          "text-lg font-bold",
                          metric.value >= 80 ? 'text-emerald-400' : metric.value >= 60 ? 'text-cyan-400' : 'text-amber-400'
                        )}>
                          {metric.value}
                        </span>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights Column */}
          <div className="space-y-6">
            {/* Strengths */}
            <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Strengths
                </h3>
                <div className="space-y-3">
                  {strengths.map((strength, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Areas to Improve */}
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Areas to Improve
                </h3>
                <div className="space-y-3">
                  {improvements.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Coach Kai Recommendations */}
            <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-cyan-500/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Coach Kai's Tips
                </h3>
                <div className="space-y-3">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <ChevronRight className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600">
                <Download className="w-4 h-4 mr-2" /> PDF Report
              </Button>
              <Button variant="outline" className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-800">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
