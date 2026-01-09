// @ts-nocheck
"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft, Play, Pause, Target, Zap, Brain, Trophy,
  TrendingUp, ChevronRight, Eye, Clock, BarChart3, Activity,
  Sparkles, Award, Video, CheckCircle, AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"
import MainNavigation from "@/components/navigation/main-navigation"

interface VideoAnalysisViewProps {
  analysis: any
  user: any
}

// Animated Pose Skeleton - Shows body tracking during analysis
function AnimatedPoseSkeleton({ isAnalyzing, analysisPhase }: { isAnalyzing: boolean, analysisPhase: string }) {
  // Body keypoints for pickleball stance
  const [pose, setPose] = useState(0)
  
  useEffect(() => {
    if (!isAnalyzing) return
    const interval = setInterval(() => {
      setPose(p => (p + 1) % 4)
    }, 800)
    return () => clearInterval(interval)
  }, [isAnalyzing])

  // Different poses for animation
  const poses = [
    // Ready stance
    { head: { x: 50, y: 15 }, shoulders: [{ x: 35, y: 25 }, { x: 65, y: 25 }], elbows: [{ x: 28, y: 40 }, { x: 72, y: 40 }], wrists: [{ x: 25, y: 55 }, { x: 78, y: 45 }], hips: [{ x: 40, y: 55 }, { x: 60, y: 55 }], knees: [{ x: 38, y: 75 }, { x: 62, y: 75 }], ankles: [{ x: 36, y: 95 }, { x: 64, y: 95 }] },
    // Forehand prep
    { head: { x: 48, y: 15 }, shoulders: [{ x: 33, y: 26 }, { x: 63, y: 24 }], elbows: [{ x: 20, y: 35 }, { x: 75, y: 50 }], wrists: [{ x: 10, y: 40 }, { x: 85, y: 40 }], hips: [{ x: 38, y: 55 }, { x: 58, y: 55 }], knees: [{ x: 35, y: 75 }, { x: 60, y: 75 }], ankles: [{ x: 32, y: 95 }, { x: 62, y: 95 }] },
    // Forehand swing
    { head: { x: 52, y: 14 }, shoulders: [{ x: 37, y: 24 }, { x: 67, y: 26 }], elbows: [{ x: 50, y: 30 }, { x: 80, y: 35 }], wrists: [{ x: 70, y: 20 }, { x: 90, y: 45 }], hips: [{ x: 42, y: 54 }, { x: 62, y: 56 }], knees: [{ x: 40, y: 74 }, { x: 64, y: 76 }], ankles: [{ x: 38, y: 95 }, { x: 66, y: 95 }] },
    // Follow through
    { head: { x: 54, y: 13 }, shoulders: [{ x: 40, y: 23 }, { x: 70, y: 25 }], elbows: [{ x: 60, y: 25 }, { x: 82, y: 38 }], wrists: [{ x: 80, y: 15 }, { x: 92, y: 50 }], hips: [{ x: 44, y: 53 }, { x: 64, y: 55 }], knees: [{ x: 42, y: 73 }, { x: 66, y: 75 }], ankles: [{ x: 40, y: 95 }, { x: 68, y: 95 }] },
  ]

  const currentPose = poses[pose]
  
  // Colors for different body parts
  const jointColor = "#22d3ee" // cyan-400
  const boneColor = "#0891b2" // cyan-600
  const highlightColor = "#f59e0b" // amber-500

  return (
    <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl overflow-hidden border border-slate-700/50">
      {/* Scanning effect */}
      {isAnalyzing && (
        <motion.div
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      )}
      
      {/* Grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        {[...Array(10)].map((_, i) => (
          <line key={`h-${i}`} x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke="#22d3ee" strokeWidth="0.5" />
        ))}
        {[...Array(10)].map((_, i) => (
          <line key={`v-${i}`} x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="#22d3ee" strokeWidth="0.5" />
        ))}
      </svg>

      {/* Skeleton SVG */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        {/* Bones/Connections */}
        {/* Spine */}
        <motion.line
          x1={currentPose.head.x} y1={currentPose.head.y + 3}
          x2={(currentPose.shoulders[0].x + currentPose.shoulders[1].x) / 2} y2={currentPose.shoulders[0].y}
          stroke={boneColor} strokeWidth="2" strokeLinecap="round"
          animate={{ x1: currentPose.head.x, y1: currentPose.head.y + 3 }}
          transition={{ duration: 0.3 }}
        />
        {/* Shoulders */}
        <motion.line
          x1={currentPose.shoulders[0].x} y1={currentPose.shoulders[0].y}
          x2={currentPose.shoulders[1].x} y2={currentPose.shoulders[1].y}
          stroke={boneColor} strokeWidth="2" strokeLinecap="round"
          animate={{ x1: currentPose.shoulders[0].x, x2: currentPose.shoulders[1].x }}
          transition={{ duration: 0.3 }}
        />
        {/* Left arm */}
        <motion.line
          x1={currentPose.shoulders[0].x} y1={currentPose.shoulders[0].y}
          x2={currentPose.elbows[0].x} y2={currentPose.elbows[0].y}
          stroke={boneColor} strokeWidth="2" strokeLinecap="round"
          animate={{ x2: currentPose.elbows[0].x, y2: currentPose.elbows[0].y }}
          transition={{ duration: 0.3 }}
        />
        <motion.line
          x1={currentPose.elbows[0].x} y1={currentPose.elbows[0].y}
          x2={currentPose.wrists[0].x} y2={currentPose.wrists[0].y}
          stroke={boneColor} strokeWidth="2" strokeLinecap="round"
          animate={{ x1: currentPose.elbows[0].x, y1: currentPose.elbows[0].y, x2: currentPose.wrists[0].x, y2: currentPose.wrists[0].y }}
          transition={{ duration: 0.3 }}
        />
        {/* Right arm (paddle arm) - highlighted */}
        <motion.line
          x1={currentPose.shoulders[1].x} y1={currentPose.shoulders[1].y}
          x2={currentPose.elbows[1].x} y2={currentPose.elbows[1].y}
          stroke={highlightColor} strokeWidth="2.5" strokeLinecap="round"
          animate={{ x2: currentPose.elbows[1].x, y2: currentPose.elbows[1].y }}
          transition={{ duration: 0.3 }}
        />
        <motion.line
          x1={currentPose.elbows[1].x} y1={currentPose.elbows[1].y}
          x2={currentPose.wrists[1].x} y2={currentPose.wrists[1].y}
          stroke={highlightColor} strokeWidth="2.5" strokeLinecap="round"
          animate={{ x1: currentPose.elbows[1].x, y1: currentPose.elbows[1].y, x2: currentPose.wrists[1].x, y2: currentPose.wrists[1].y }}
          transition={{ duration: 0.3 }}
        />
        {/* Torso to hips */}
        <motion.line
          x1={(currentPose.shoulders[0].x + currentPose.shoulders[1].x) / 2} y1={currentPose.shoulders[0].y}
          x2={(currentPose.hips[0].x + currentPose.hips[1].x) / 2} y2={currentPose.hips[0].y}
          stroke={boneColor} strokeWidth="2" strokeLinecap="round"
        />
        {/* Hips */}
        <motion.line
          x1={currentPose.hips[0].x} y1={currentPose.hips[0].y}
          x2={currentPose.hips[1].x} y2={currentPose.hips[1].y}
          stroke={boneColor} strokeWidth="2" strokeLinecap="round"
        />
        {/* Left leg */}
        <motion.line x1={currentPose.hips[0].x} y1={currentPose.hips[0].y} x2={currentPose.knees[0].x} y2={currentPose.knees[0].y} stroke={boneColor} strokeWidth="2" strokeLinecap="round" />
        <motion.line x1={currentPose.knees[0].x} y1={currentPose.knees[0].y} x2={currentPose.ankles[0].x} y2={currentPose.ankles[0].y} stroke={boneColor} strokeWidth="2" strokeLinecap="round" />
        {/* Right leg */}
        <motion.line x1={currentPose.hips[1].x} y1={currentPose.hips[1].y} x2={currentPose.knees[1].x} y2={currentPose.knees[1].y} stroke={boneColor} strokeWidth="2" strokeLinecap="round" />
        <motion.line x1={currentPose.knees[1].x} y1={currentPose.knees[1].y} x2={currentPose.ankles[1].x} y2={currentPose.ankles[1].y} stroke={boneColor} strokeWidth="2" strokeLinecap="round" />

        {/* Joints */}
        {/* Head */}
        <motion.circle cx={currentPose.head.x} cy={currentPose.head.y} r="4" fill={jointColor} animate={{ cx: currentPose.head.x, cy: currentPose.head.y }} transition={{ duration: 0.3 }} />
        {/* Shoulders */}
        <motion.circle cx={currentPose.shoulders[0].x} cy={currentPose.shoulders[0].y} r="2.5" fill={jointColor} animate={{ cx: currentPose.shoulders[0].x }} transition={{ duration: 0.3 }} />
        <motion.circle cx={currentPose.shoulders[1].x} cy={currentPose.shoulders[1].y} r="2.5" fill={jointColor} animate={{ cx: currentPose.shoulders[1].x }} transition={{ duration: 0.3 }} />
        {/* Elbows */}
        <motion.circle cx={currentPose.elbows[0].x} cy={currentPose.elbows[0].y} r="2" fill={jointColor} animate={{ cx: currentPose.elbows[0].x, cy: currentPose.elbows[0].y }} transition={{ duration: 0.3 }} />
        <motion.circle cx={currentPose.elbows[1].x} cy={currentPose.elbows[1].y} r="2.5" fill={highlightColor} animate={{ cx: currentPose.elbows[1].x, cy: currentPose.elbows[1].y }} transition={{ duration: 0.3 }} />
        {/* Wrists */}
        <motion.circle cx={currentPose.wrists[0].x} cy={currentPose.wrists[0].y} r="2" fill={jointColor} animate={{ cx: currentPose.wrists[0].x, cy: currentPose.wrists[0].y }} transition={{ duration: 0.3 }} />
        <motion.circle cx={currentPose.wrists[1].x} cy={currentPose.wrists[1].y} r="3" fill={highlightColor} animate={{ cx: currentPose.wrists[1].x, cy: currentPose.wrists[1].y }} transition={{ duration: 0.3 }}>
          <animate attributeName="r" values="3;4;3" dur="0.5s" repeatCount="indefinite" />
        </motion.circle>
        {/* Hips */}
        <motion.circle cx={currentPose.hips[0].x} cy={currentPose.hips[0].y} r="2" fill={jointColor} />
        <motion.circle cx={currentPose.hips[1].x} cy={currentPose.hips[1].y} r="2" fill={jointColor} />
        {/* Knees */}
        <motion.circle cx={currentPose.knees[0].x} cy={currentPose.knees[0].y} r="2" fill={jointColor} />
        <motion.circle cx={currentPose.knees[1].x} cy={currentPose.knees[1].y} r="2" fill={jointColor} />
        {/* Ankles */}
        <motion.circle cx={currentPose.ankles[0].x} cy={currentPose.ankles[0].y} r="2" fill={jointColor} />
        <motion.circle cx={currentPose.ankles[1].x} cy={currentPose.ankles[1].y} r="2" fill={jointColor} />
      </svg>

      {/* Analysis status overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: isAnalyzing ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 1, repeat: isAnalyzing ? Infinity : 0 }}
              className={cn(
                "w-2 h-2 rounded-full",
                isAnalyzing ? "bg-cyan-400" : "bg-emerald-400"
              )}
            />
            <span className="text-xs text-slate-300">
              {isAnalyzing ? 'Tracking Motion...' : 'Analysis Complete'}
            </span>
          </div>
          <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
            {analysisPhase}
          </Badge>
        </div>
      </div>
    </div>
  )
}

// Score Ring Component
function ScoreRing({ score, label, size = 120 }: { score: number, label: string, size?: number }) {
  const percentage = (score / 10) * 100
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  
  const getColor = () => {
    if (score >= 8) return { ring: '#10b981', bg: '#10b981' } // emerald
    if (score >= 6) return { ring: '#22d3ee', bg: '#22d3ee' } // cyan
    if (score >= 4) return { ring: '#f59e0b', bg: '#f59e0b' } // amber
    return { ring: '#ef4444', bg: '#ef4444' } // red
  }
  const colors = getColor()

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {/* Background ring */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
        {/* Score ring */}
        <motion.circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke={colors.ring}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score.toFixed(1)}</span>
        <span className="text-xs text-slate-400">{label}</span>
      </div>
    </div>
  )
}

// Skill Bar
function SkillBar({ label, score, maxScore = 10 }: { label: string, score: number, maxScore?: number }) {
  const percentage = (score / maxScore) * 100
  const getColor = () => {
    if (percentage >= 80) return 'from-emerald-500 to-emerald-400'
    if (percentage >= 60) return 'from-cyan-500 to-cyan-400'
    if (percentage >= 40) return 'from-amber-500 to-amber-400'
    return 'from-rose-500 to-rose-400'
  }

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-medium">{score.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn("h-full rounded-full bg-gradient-to-r", getColor())}
        />
      </div>
    </div>
  )
}

// Feedback Item
function FeedbackItem({ type, message, timestamp }: { type: 'good' | 'improve', message: string, timestamp?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "p-3 rounded-lg border",
        type === 'good' 
          ? "bg-emerald-500/10 border-emerald-500/30" 
          : "bg-amber-500/10 border-amber-500/30"
      )}
    >
      <div className="flex items-start gap-3">
        {type === 'good' ? (
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        )}
        <div>
          <p className="text-white text-sm">{message}</p>
          {timestamp && <p className="text-slate-500 text-xs mt-1">@ {timestamp}</p>}
        </div>
      </div>
    </motion.div>
  )
}

export default function VideoAnalysisView({ analysis, user }: VideoAnalysisViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [analysisPhase, setAnalysisPhase] = useState('Pose Detection')

  // Cycle through analysis phases
  useEffect(() => {
    const phases = ['Pose Detection', 'Motion Analysis', 'Form Scoring', 'Complete']
    let idx = 0
    const interval = setInterval(() => {
      idx = (idx + 1) % phases.length
      setAnalysisPhase(phases[idx])
      if (phases[idx] === 'Complete') {
        setTimeout(() => setIsAnalyzing(false), 1000)
      }
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  // Analysis data
  const overallScore = analysis?.overallScore ?? 7.2
  const fileName = analysis?.fileName || analysis?.title || 'Match Analysis'
  const videoUrl = analysis?.videoUrl || analysis?.cloudStoragePath
  const analysisDate = analysis?.createdAt
    ? new Date(analysis.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  // Detailed scores
  const scores = {
    form: analysis?.formScore ?? 7.5,
    footwork: analysis?.footworkScore ?? 6.8,
    power: analysis?.powerScore ?? 7.8,
    consistency: analysis?.consistencyScore ?? 7.0,
    positioning: analysis?.positioningScore ?? 6.5,
  }

  // Feedback items
  const feedback = [
    { type: 'good' as const, message: 'Great paddle preparation - early backswing sets you up well', timestamp: '0:08' },
    { type: 'good' as const, message: 'Solid contact point at the front of your body', timestamp: '0:15' },
    { type: 'improve' as const, message: 'Try bending knees more during dinks for better stability', timestamp: '0:24' },
    { type: 'improve' as const, message: 'Follow through could extend more toward target', timestamp: '0:31' },
    { type: 'good' as const, message: 'Nice split step before opponent contact', timestamp: '0:45' },
  ]

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <MainNavigation user={user} />
      
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/train/analysis">
            <Button variant="ghost" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Videos
            </Button>
          </Link>
          <Badge className="bg-emerald-500/20 text-emerald-400">
            <CheckCircle className="w-3 h-3 mr-1" /> Analysis Complete
          </Badge>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Video & Pose */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <Card className="bg-slate-900/60 border-slate-700/50 overflow-hidden">
              <div className="relative aspect-video bg-black">
                {videoUrl ? (
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    playsInline
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                    <div className="text-center">
                      <Video className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">Video processing...</p>
                    </div>
                  </div>
                )}
                
                {/* Play overlay */}
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
                >
                  <div className={cn(
                    "w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center transition-transform group-hover:scale-110",
                    isPlaying && "opacity-0 group-hover:opacity-100"
                  )}>
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white ml-1" />
                    )}
                  </div>
                </button>
              </div>
              
              {/* Video Controls */}
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={togglePlay}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <div className="flex-1">
                    <Progress value={duration ? (currentTime / duration) * 100 : 0} className="h-1.5" />
                  </div>
                  <span className="text-xs text-slate-400">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-white font-semibold">{fileName}</h2>
                    <p className="text-slate-500 text-sm">Analyzed {analysisDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Feedback */}
            <Card className="bg-slate-900/60 border-slate-700/50">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-cyan-400" /> AI Coach Feedback
                </h3>
                <div className="space-y-3">
                  {feedback.map((item, i) => (
                    <FeedbackItem key={i} {...item} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Scores & Analysis */}
          <div className="space-y-6">
            {/* Overall Score */}
            <Card className="bg-slate-900/60 border-slate-700/50">
              <CardContent className="p-6 flex flex-col items-center">
                <h3 className="text-slate-400 text-sm mb-4">Overall Performance</h3>
                <ScoreRing score={overallScore} label="out of 10" size={140} />
              </CardContent>
            </Card>

            {/* Pose Visualization */}
            <Card className="bg-slate-900/60 border-slate-700/50">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" /> Motion Tracking
                </h3>
                <AnimatedPoseSkeleton isAnalyzing={isAnalyzing} analysisPhase={analysisPhase} />
              </CardContent>
            </Card>

            {/* Skill Breakdown */}
            <Card className="bg-slate-900/60 border-slate-700/50">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" /> Skill Breakdown
                </h3>
                <div className="space-y-4">
                  <SkillBar label="Form & Technique" score={scores.form} />
                  <SkillBar label="Footwork" score={scores.footwork} />
                  <SkillBar label="Power" score={scores.power} />
                  <SkillBar label="Consistency" score={scores.consistency} />
                  <SkillBar label="Court Positioning" score={scores.positioning} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
