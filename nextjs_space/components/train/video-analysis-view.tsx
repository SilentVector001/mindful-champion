// @ts-nocheck
"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft, Play, Pause, Target, Zap, Brain, Trophy,
  TrendingUp, ChevronRight, Download, Share2, Eye, Clock,
  BarChart3, Flame, MapPin, Activity, Filter, ChevronDown,
  Sparkles, Award, CircleDot, Layers, Grid3X3, Video
} from "lucide-react"
import { cn } from "@/lib/utils"
import MainNavigation from "@/components/navigation/main-navigation"

interface VideoAnalysisViewProps {
  analysis: any
  user: any
}

// Court Heat Map Component
function CourtHeatMap({ data, title }: { data?: any, title: string }) {
  // Generate heat map cells with varying intensities
  const generateHeatData = () => {
    const zones = [
      // Kitchen zone (front) - high activity
      { x: 10, y: 5, intensity: 0.9, label: 'Kitchen Left' },
      { x: 35, y: 5, intensity: 0.95, label: 'Kitchen Center' },
      { x: 60, y: 5, intensity: 0.85, label: 'Kitchen Right' },
      // Transition zone
      { x: 10, y: 25, intensity: 0.6, label: 'Trans Left' },
      { x: 35, y: 25, intensity: 0.7, label: 'Trans Center' },
      { x: 60, y: 25, intensity: 0.55, label: 'Trans Right' },
      // Baseline zone
      { x: 10, y: 45, intensity: 0.4, label: 'Base Left' },
      { x: 35, y: 45, intensity: 0.5, label: 'Base Center' },
      { x: 60, y: 45, intensity: 0.35, label: 'Base Right' },
    ]
    return zones
  }

  const heatData = data || generateHeatData()

  const getHeatColor = (intensity: number) => {
    if (intensity > 0.8) return 'rgba(239, 68, 68, 0.8)' // Red - hot
    if (intensity > 0.6) return 'rgba(251, 146, 60, 0.7)' // Orange
    if (intensity > 0.4) return 'rgba(250, 204, 21, 0.6)' // Yellow
    if (intensity > 0.2) return 'rgba(74, 222, 128, 0.5)' // Green
    return 'rgba(96, 165, 250, 0.4)' // Blue - cold
  }

  return (
    <div className="relative">
      <h4 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-cyan-400" />
        {title}
      </h4>
      <div className="relative aspect-[4/3] bg-emerald-900/30 rounded-xl overflow-hidden border border-emerald-700/30">
        {/* Court lines */}
        <svg viewBox="0 0 80 60" className="absolute inset-0 w-full h-full">
          {/* Court outline */}
          <rect x="2" y="2" width="76" height="56" fill="none" stroke="#ffffff20" strokeWidth="0.5" />
          {/* Kitchen line */}
          <line x1="2" y1="15" x2="78" y2="15" stroke="#ffffff30" strokeWidth="0.5" />
          {/* Center line */}
          <line x1="40" y1="2" x2="40" y2="58" stroke="#ffffff20" strokeWidth="0.3" strokeDasharray="2,2" />
          {/* Net */}
          <line x1="2" y1="30" x2="78" y2="30" stroke="#ffffff40" strokeWidth="1" />
        </svg>
        
        {/* Heat zones */}
        {heatData.map((zone, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="absolute rounded-full blur-xl"
            style={{
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: '35%',
              height: '35%',
              background: `radial-gradient(circle, ${getHeatColor(zone.intensity)} 0%, transparent 70%)`,
            }}
          />
        ))}
        
        {/* Legend */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] text-slate-400">
          <span>Cold</span>
          <div className="flex gap-0.5">
            {['#60a5fa', '#4ade80', '#facc15', '#fb923c', '#ef4444'].map((c, i) => (
              <div key={i} className="w-3 h-2 rounded-sm" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span>Hot</span>
        </div>
      </div>
    </div>
  )
}

// Shot Distribution Donut Chart
function ShotDistributionChart({ data }: { data?: any }) {
  const shots = data || [
    { type: 'Dinks', count: 24, percentage: 35, color: '#06b6d4' },
    { type: 'Drives', count: 18, percentage: 26, color: '#f59e0b' },
    { type: 'Drops', count: 12, percentage: 17, color: '#10b981' },
    { type: 'Volleys', count: 10, percentage: 15, color: '#8b5cf6' },
    { type: 'Lobs', count: 5, percentage: 7, color: '#ec4899' }
  ]
  
  // Calculate donut segments
  let cumulativePercentage = 0
  const segments = shots.map(shot => {
    const start = cumulativePercentage
    cumulativePercentage += shot.percentage
    return { ...shot, start, end: cumulativePercentage }
  })

  return (
    <div>
      <h4 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
        <Target className="w-4 h-4 text-cyan-400" />
        Shot Distribution
      </h4>
      <div className="flex items-center gap-4">
        {/* Donut Chart */}
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            {segments.map((seg, i) => {
              const circumference = 2 * Math.PI * 15.915
              const strokeDasharray = `${(seg.percentage / 100) * circumference} ${circumference}`
              const strokeDashoffset = -((seg.start / 100) * circumference)
              return (
                <motion.circle
                  key={i}
                  cx="18" cy="18" r="15.915"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="3"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.15 }}
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{shots.reduce((a, b) => a + b.count, 0)}</span>
            <span className="text-[10px] text-slate-400">Total Shots</span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex-1 space-y-1.5">
          {shots.map((shot, i) => (
            <motion.div
              key={shot.type}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: shot.color }} />
                <span className="text-slate-300">{shot.type}</span>
              </div>
              <span className="text-white font-medium">{shot.percentage}%</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Rally Card Component
function RallyCard({ rally, index, onClick, isActive }: any) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "w-full p-3 rounded-xl border text-left transition-all",
        isActive
          ? "bg-cyan-500/20 border-cyan-500"
          : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <Badge variant="outline" className="text-[10px] border-slate-600 text-slate-400">
          Rally #{rally.number}
        </Badge>
        <span className="text-xs text-slate-500">{rally.timestamp}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-white text-sm font-medium">{rally.shotCount} shots</p>
          <p className="text-slate-400 text-xs">{rally.outcome}</p>
        </div>
        <div className={cn(
          "px-2 py-1 rounded text-xs font-medium",
          rally.won ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
        )}>
          {rally.won ? 'Won' : 'Lost'}
        </div>
      </div>
    </motion.button>
  )
}

// Metric Card
function MetricCard({ icon: Icon, label, value, subValue, trend, color }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
    >
      <div className="flex items-start justify-between mb-2">
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs",
            trend > 0 ? "text-emerald-400" : "text-rose-400"
          )}>
            <TrendingUp className={cn("w-3 h-3", trend < 0 && "rotate-180")} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
      {subValue && <p className="text-[10px] text-slate-500 mt-1">{subValue}</p>}
    </motion.div>
  )
}

// Skill Radar/Gauge
function SkillGauge({ label, score, maxScore = 100 }: any) {
  const percentage = (score / maxScore) * 100
  const getColor = () => {
    if (percentage >= 80) return 'from-emerald-500 to-emerald-400'
    if (percentage >= 60) return 'from-cyan-500 to-cyan-400'
    if (percentage >= 40) return 'from-amber-500 to-amber-400'
    return 'from-rose-500 to-rose-400'
  }

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-medium">{score}</span>
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

export default function VideoAnalysisView({ analysis, user }: VideoAnalysisViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(120)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedRally, setSelectedRally] = useState<number | null>(null)
  const [showVideo, setShowVideo] = useState(true)

  // Analysis data
  const overallScore = analysis?.overallScore ?? 4.04
  const fileName = analysis?.fileName || analysis?.title || 'Match Analysis'
  const analysisDate = analysis?.createdAt
    ? new Date(analysis.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Jan 9, 2026'

  // Technique moments - clear feedback on specific shots
  const techniqueMoments = [
    { timestamp: '0:08', shot: 'Forehand Drive', quality: 'good', feedback: 'Great paddle angle and follow-through. Keep this up!' },
    { timestamp: '0:24', shot: 'Third Shot Drop', quality: 'good', feedback: 'Soft hands, nice arc. Landed in the kitchen.' },
    { timestamp: '0:45', shot: 'Backhand Dink', quality: 'improve', feedback: 'Paddle face opened too early - caused the pop-up.' },
    { timestamp: '1:02', shot: 'Serve', quality: 'good', feedback: 'Deep placement with good spin. Opponent was pushed back.' },
    { timestamp: '1:18', shot: 'Volley', quality: 'improve', feedback: 'Step into the shot more - you were reaching.' },
    { timestamp: '1:35', shot: 'Reset Shot', quality: 'good', feedback: 'Nice soft reset under pressure. Smart play.' },
  ]

  // AI Insights - actionable coaching feedback
  const aiInsights = [
    { type: 'strength', title: 'Strong Kitchen Presence', detail: 'You won 73% of points when at the non-volley zone. Keep getting there!' },
    { type: 'strength', title: 'Effective Third Shot Drops', detail: 'Your drops are landing consistently in the kitchen with good arc.' },
    { type: 'improve', title: 'Backhand Dink Control', detail: 'Focus on keeping paddle face closed longer to avoid pop-ups.' },
    { type: 'improve', title: 'Footwork on Volleys', detail: 'Step forward into volleys instead of reaching - adds power and control.' },
  ]

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause()
      else videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <MainNavigation />
      
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/train/video">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">{fileName}</h1>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Clock className="w-3 h-3" /> {analysisDate}
                <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-[10px]">
                  AI Analyzed
                </Badge>
              </p>
            </div>
          </div>
          
          {/* DUPR-style Rating */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              {overallScore.toFixed(2)}
            </div>
            <p className="text-slate-400 text-xs">Skill Rating</p>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Video & Rallies */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Player */}
            <Card className="bg-slate-900/60 border-slate-700/50 overflow-hidden">
              <div className="relative aspect-video bg-slate-900">
                {analysis?.videoUrl ? (
                  <video
                    ref={videoRef}
                    src={analysis.videoUrl}
                    className="w-full h-full object-contain"
                    poster={analysis.thumbnailUrl || "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200&q=80"}
                    onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
                    onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration)}
                  />
                ) : (
                  /* Show pickleball action shot as placeholder */
                  <Image
                    src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200&q=80"
                    alt="Pickleball match footage"
                    fill
                    className="object-cover"
                  />
                )}
                
                {/* Play button overlay */}
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </div>
                </button>
                
                {/* Video info badge */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-slate-900/80 text-white border-0 text-xs">
                    <Video className="w-3 h-3 mr-1" /> Your Uploaded Video
                  </Badge>
                </div>
                
                {/* Timeline */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-white text-xs font-mono">{formatTime(currentTime)}</span>
                    <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>
                    <span className="text-slate-400 text-xs font-mono">{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-slate-900/50 border border-slate-700/50 p-1 w-full">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="rallies" className="flex-1">Technique</TabsTrigger>
                <TabsTrigger value="patterns" className="flex-1">AI Insights</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-4 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <ShotDistributionChart />
                  <CourtHeatMap title="Court Coverage" />
                </div>
                
                {/* Skill Breakdown */}
                <Card className="bg-slate-900/60 border-slate-700/50">
                  <CardContent className="p-4">
                    <h4 className="text-white font-medium text-sm mb-4 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      Performance Breakdown
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <SkillGauge label="Serve Accuracy" score={78} />
                      <SkillGauge label="Return Depth" score={65} />
                      <SkillGauge label="Dink Consistency" score={82} />
                      <SkillGauge label="Net Play" score={71} />
                      <SkillGauge label="Shot Selection" score={68} />
                      <SkillGauge label="Court Movement" score={74} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Technique Moments Tab */}
              <TabsContent value="rallies" className="mt-4">
                <Card className="bg-slate-900/60 border-slate-700/50">
                  <CardContent className="p-4">
                    <h4 className="text-white font-medium text-sm mb-4 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      Key Technique Moments
                    </h4>
                    <p className="text-slate-400 text-xs mb-4">
                      Click any moment to jump to that point in the video and see the AI feedback.
                    </p>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                      {techniqueMoments.map((moment, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={cn(
                            "w-full p-3 rounded-xl border text-left transition-all",
                            selectedRally === i
                              ? "bg-cyan-500/20 border-cyan-500"
                              : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600"
                          )}
                          onClick={() => setSelectedRally(i)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className={cn(
                              "text-[10px]",
                              moment.quality === 'good' ? "border-emerald-500 text-emerald-400" : "border-amber-500 text-amber-400"
                            )}>
                              {moment.quality === 'good' ? '✓ Good Form' : '⚠ Needs Work'}
                            </Badge>
                            <span className="text-xs text-slate-500">{moment.timestamp}</span>
                          </div>
                          <p className="text-white text-sm font-medium">{moment.shot}</p>
                          <p className="text-slate-400 text-xs mt-1">{moment.feedback}</p>
                        </motion.button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AI Insights Tab */}
              <TabsContent value="patterns" className="mt-4">
                <Card className="bg-slate-900/60 border-slate-700/50">
                  <CardContent className="p-4">
                    <h4 className="text-white font-medium text-sm mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      AI Coaching Insights
                    </h4>
                    <div className="space-y-3">
                      {aiInsights.map((insight, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={cn(
                            "p-3 rounded-lg border",
                            insight.type === 'strength'
                              ? "bg-emerald-500/10 border-emerald-500/30"
                              : "bg-amber-500/10 border-amber-500/30"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "p-1.5 rounded-lg",
                              insight.type === 'strength' ? "bg-emerald-500/20" : "bg-amber-500/20"
                            )}>
                              {insight.type === 'strength' ? (
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Target className="w-4 h-4 text-amber-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{insight.title}</p>
                              <p className="text-slate-400 text-xs mt-0.5">{insight.detail}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Stats & Quick Actions */}
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                icon={Flame}
                label="Rallies Won"
                value="67%"
                subValue="8 of 12"
                trend={12}
                color="bg-emerald-500/20 text-emerald-400"
              />
              <MetricCard
                icon={Target}
                label="Avg Rally"
                value="12.6"
                subValue="shots per rally"
                color="bg-cyan-500/20 text-cyan-400"
              />
              <MetricCard
                icon={Zap}
                label="Winners"
                value="14"
                subValue="+3 from avg"
                trend={8}
                color="bg-amber-500/20 text-amber-400"
              />
              <MetricCard
                icon={Activity}
                label="Errors"
                value="6"
                subValue="-2 from avg"
                trend={-15}
                color="bg-rose-500/20 text-rose-400"
              />
            </div>

            {/* Video Library Preview */}
            <Card className="bg-slate-900/60 border-slate-700/50">
              <CardContent className="p-4">
                <h4 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
                  <Video className="w-4 h-4 text-cyan-400" />
                  My Video Library
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="aspect-video bg-slate-800 rounded-lg overflow-hidden relative group cursor-pointer">
                      <Image
                        src={`https://images.unsplash.com/photo-1610552050890-fe99536c2615?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGFuZHNjYXBlJTIwbmF0dXJlfGVufDB8fDB8fHww + i}-24cecd4e34b8?w=200`}
                        alt="Video"
                        fill
                        className="object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/train/video">
                  <Button variant="ghost" size="sm" className="w-full mt-3 text-cyan-400 hover:text-cyan-300">
                    View All Videos <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Improvement Tips */}
            <Card className="bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 border-cyan-500/30">
              <CardContent className="p-4">
                <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-cyan-400" />
                  AI Coaching Tip
                </h4>
                <p className="text-slate-300 text-sm">
                  Track <span className="text-cyan-400 font-medium">how much you move</span>, your <span className="text-cyan-400 font-medium">positioning</span> with different partners, and your <span className="text-cyan-400 font-medium">efficiency</span> in reaching the kitchen line when serving.
                </p>
                <Button className="w-full mt-3 bg-cyan-500 hover:bg-cyan-600 text-sm">
                  <Sparkles className="w-4 h-4 mr-2" /> Get Personalized Drills
                </Button>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800">
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
