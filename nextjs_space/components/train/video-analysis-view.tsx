// @ts-nocheck
"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft, Play, Pause, Target, Zap, Brain, Trophy, TrendingUp, TrendingDown,
  ChevronRight, Download, Share2, Eye, Clock, BarChart3, Activity, Sparkles,
  Award, Video, CheckCircle, AlertTriangle, Flame, MapPin, Lightbulb, Dumbbell
} from "lucide-react"
import { cn } from "@/lib/utils"
import MainNavigation from "@/components/navigation/main-navigation"

interface VideoAnalysisViewProps {
  analysis: any
  user: any
}

// Court Heat Map - Shows position coverage
function CourtHeatMap({ data }: { data?: any }) {
  const zones = data?.zones || [
    { x: 15, y: 12, intensity: 0.95 },
    { x: 50, y: 12, intensity: 0.85 },
    { x: 85, y: 12, intensity: 0.75 },
    { x: 15, y: 40, intensity: 0.55 },
    { x: 50, y: 40, intensity: 0.70 },
    { x: 85, y: 40, intensity: 0.45 },
    { x: 15, y: 70, intensity: 0.30 },
    { x: 50, y: 70, intensity: 0.50 },
    { x: 85, y: 70, intensity: 0.25 },
  ]

  const getHeatColor = (intensity: number) => {
    if (intensity > 0.8) return 'rgba(239, 68, 68, 0.85)'
    if (intensity > 0.6) return 'rgba(251, 146, 60, 0.75)'
    if (intensity > 0.4) return 'rgba(250, 204, 21, 0.65)'
    if (intensity > 0.2) return 'rgba(74, 222, 128, 0.55)'
    return 'rgba(96, 165, 250, 0.45)'
  }

  return (
    <div className="relative aspect-[4/3] bg-emerald-900/40 rounded-xl overflow-hidden border border-emerald-700/30">
      <svg viewBox="0 0 100 80" className="absolute inset-0 w-full h-full">
        <rect x="5" y="5" width="90" height="70" fill="none" stroke="#ffffff20" strokeWidth="0.5" />
        <line x1="5" y1="20" x2="95" y2="20" stroke="#ffffff30" strokeWidth="0.5" />
        <line x1="50" y1="5" x2="50" y2="75" stroke="#ffffff20" strokeWidth="0.3" strokeDasharray="2,2" />
        <line x1="5" y1="40" x2="95" y2="40" stroke="#ffffff40" strokeWidth="1" />
      </svg>
      
      {zones.map((zone, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          className="absolute rounded-full blur-xl"
          style={{
            left: `${zone.x}%`,
            top: `${zone.y}%`,
            width: '30%',
            height: '30%',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${getHeatColor(zone.intensity)} 0%, transparent 70%)`,
          }}
        />
      ))}
      
      <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] text-slate-400 bg-black/40 px-2 py-1 rounded">
        <span>Cold</span>
        {['#60a5fa', '#4ade80', '#facc15', '#fb923c', '#ef4444'].map((c, i) => (
          <div key={i} className="w-3 h-2 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span>Hot</span>
      </div>
    </div>
  )
}

// Shot Distribution Donut
function ShotDistributionChart({ data }: { data?: any }) {
  const shots = data || [
    { type: 'Dinks', count: 24, percentage: 35, color: '#06b6d4' },
    { type: 'Drives', count: 18, percentage: 26, color: '#f59e0b' },
    { type: 'Drops', count: 12, percentage: 17, color: '#10b981' },
    { type: 'Volleys', count: 10, percentage: 15, color: '#8b5cf6' },
    { type: 'Lobs', count: 5, percentage: 7, color: '#ec4899' }
  ]
  
  const totalShots = shots.reduce((a: number, b: any) => a + b.count, 0)
  let cumulativePercentage = 0
  const segments = shots.map((shot: any) => {
    const start = cumulativePercentage
    cumulativePercentage += shot.percentage
    return { ...shot, start, end: cumulativePercentage }
  })

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          {segments.map((seg: any, i: number) => {
            const circumference = 2 * Math.PI * 15.915
            const strokeDasharray = `${(seg.percentage / 100) * circumference} ${circumference}`
            const strokeDashoffset = -((seg.start / 100) * circumference)
            return (
              <motion.circle
                key={i}
                cx="18" cy="18" r="15.915"
                fill="none"
                stroke={seg.color}
                strokeWidth="3.5"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{totalShots}</span>
          <span className="text-[10px] text-slate-400">Total Shots</span>
        </div>
      </div>
      
      <div className="flex-1 space-y-2">
        {shots.map((shot: any, i: number) => (
          <motion.div
            key={shot.type}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: shot.color }} />
              <span className="text-slate-300">{shot.type}</span>
            </div>
            <span className="text-white font-medium">{shot.percentage}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Stat Card with trend
function StatCard({ icon: Icon, value, label, subLabel, trend, color }: any) {
  const isPositive = trend > 0
  return (
    <Card className="bg-slate-800/60 border-slate-700/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
              isPositive ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
            )}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
        {subLabel && <p className="text-xs text-slate-500">{subLabel}</p>}
      </CardContent>
    </Card>
  )
}

// Drill Recommendation Card
function DrillCard({ drill }: { drill: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-colors cursor-pointer group"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
        <Dumbbell className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium group-hover:text-cyan-400 transition-colors">{drill.name}</p>
        <p className="text-slate-400 text-sm truncate">{drill.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge className="bg-slate-700 text-slate-300 text-[10px]">{drill.duration}</Badge>
          <Badge className="bg-amber-500/20 text-amber-400 text-[10px]">{drill.focus}</Badge>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
    </motion.div>
  )
}

// AI Insight Card
function InsightCard({ type, message, timestamp }: { type: 'good' | 'improve', message: string, timestamp?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "p-4 rounded-xl border",
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
  const [activeTab, setActiveTab] = useState('overview')

  // Analysis data with defaults
  const overallScore = analysis?.overallScore ?? 72
  const fileName = analysis?.fileName || analysis?.title || 'Match Analysis'
  const videoUrl = analysis?.videoUrl || analysis?.cloudStoragePath
  const analysisDate = analysis?.createdAt
    ? new Date(analysis.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  // Stats
  const stats = {
    ralliesWon: { value: '67%', label: 'Rallies Won', sub: '8 of 12', trend: 12 },
    avgRally: { value: '12.6', label: 'Avg Rally', sub: 'shots per rally', trend: null },
    winners: { value: '14', label: 'Winners', sub: '+3 from avg', trend: 8 },
    errors: { value: '6', label: 'Errors', sub: '-2 from avg', trend: -15 },
  }

  // Recommended drills based on analysis
  const recommendedDrills = [
    { name: 'Kitchen Line Dinks', description: 'Improve soft game control at the net', duration: '10 min', focus: 'Dinks' },
    { name: 'Third Shot Drop Mastery', description: 'Perfect your transition game', duration: '15 min', focus: 'Drops' },
    { name: 'Split Step Timing', description: 'Better positioning and reaction time', duration: '8 min', focus: 'Footwork' },
  ]

  // AI insights
  const insights = [
    { type: 'good' as const, message: 'Great paddle preparation - early backswing sets you up well', timestamp: '0:08' },
    { type: 'good' as const, message: 'Solid contact point at the front of your body', timestamp: '0:15' },
    { type: 'improve' as const, message: 'Try bending knees more during dinks for better stability', timestamp: '0:24' },
    { type: 'improve' as const, message: 'Follow through could extend more toward target', timestamp: '0:31' },
    { type: 'good' as const, message: 'Nice split step before opponent contact', timestamp: '0:45' },
  ]

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause()
      else videoRef.current.play()
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <MainNavigation user={user} />
      
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/train/analysis">
              <Button variant="ghost" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">{fileName}</h1>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" /> {analysisDate}
                <Badge className="bg-cyan-500/20 text-cyan-400 ml-2">AI Analyzed</Badge>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold text-cyan-400">{overallScore.toFixed(2)}</p>
            <p className="text-slate-400 text-sm">Skill Rating</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Video + Tabs */}
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
                    poster="/images/video-poster.jpg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                    <Video className="w-16 h-16 text-slate-600" />
                  </div>
                )}
                
                <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                  <div className={cn(
                    "w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center",
                    isPlaying && "opacity-0 hover:opacity-100"
                  )}>
                    {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-1" />}
                  </div>
                </button>
                
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <Badge className="bg-slate-900/80 text-white"><Video className="w-3 h-3 mr-1" /> Your Uploaded Video</Badge>
                </div>
              </div>
              
              {/* Timeline */}
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-10">{formatTime(currentTime)}</span>
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden cursor-pointer"
                    onClick={(e) => {
                      if (videoRef.current && duration) {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const pct = (e.clientX - rect.left) / rect.width
                        videoRef.current.currentTime = pct * duration
                      }
                    }}
                  >
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 w-10 text-right">{formatTime(duration)}</span>
                </div>
              </div>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-slate-800 border border-slate-700">
                <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500">Overview</TabsTrigger>
                <TabsTrigger value="technique" className="data-[state=active]:bg-cyan-500">Technique</TabsTrigger>
                <TabsTrigger value="insights" className="data-[state=active]:bg-cyan-500">AI Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Shot Distribution */}
                  <Card className="bg-slate-900/60 border-slate-700/50">
                    <CardContent className="p-5">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-cyan-400" /> Shot Distribution
                      </h3>
                      <ShotDistributionChart />
                    </CardContent>
                  </Card>

                  {/* Court Coverage */}
                  <Card className="bg-slate-900/60 border-slate-700/50">
                    <CardContent className="p-5">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-cyan-400" /> Court Coverage
                      </h3>
                      <CourtHeatMap />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="technique" className="mt-4 space-y-4">
                {insights.map((insight, i) => (
                  <InsightCard key={i} {...insight} />
                ))}
              </TabsContent>

              <TabsContent value="insights" className="mt-4">
                <Card className="bg-slate-900/60 border-slate-700/50">
                  <CardContent className="p-5">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-400" /> AI Coaching Tip
                    </h3>
                    <p className="text-slate-300">
                      Track <span className="text-cyan-400 font-medium">how much you move</span>, your <span className="text-cyan-400 font-medium">positioning</span> with different partners, and your <span className="text-cyan-400 font-medium">efficiency</span> in reaching the kitchen line when serving.
                    </p>
                    <Button className="mt-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600">
                      <Sparkles className="w-4 h-4 mr-2" /> Get Personalized Drills
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Stats + Drills */}
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard icon={Flame} value={stats.ralliesWon.value} label={stats.ralliesWon.label} subLabel={stats.ralliesWon.sub} trend={stats.ralliesWon.trend} color="bg-gradient-to-br from-orange-500 to-red-500" />
              <StatCard icon={BarChart3} value={stats.avgRally.value} label={stats.avgRally.label} subLabel={stats.avgRally.sub} color="bg-gradient-to-br from-cyan-500 to-blue-500" />
              <StatCard icon={Zap} value={stats.winners.value} label={stats.winners.label} subLabel={stats.winners.sub} trend={stats.winners.trend} color="bg-gradient-to-br from-emerald-500 to-teal-500" />
              <StatCard icon={Target} value={stats.errors.value} label={stats.errors.label} subLabel={stats.errors.sub} trend={stats.errors.trend} color="bg-gradient-to-br from-rose-500 to-pink-500" />
            </div>

            {/* My Video Library */}
            <Card className="bg-slate-900/60 border-slate-700/50">
              <CardContent className="p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-400" /> My Video Library
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="aspect-video bg-slate-800 rounded-lg overflow-hidden relative group cursor-pointer">
                      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/train/analysis">
                  <Button variant="link" className="w-full mt-3 text-cyan-400">
                    View All Videos <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recommended Drills */}
            <Card className="bg-slate-900/60 border-slate-700/50">
              <CardContent className="p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-emerald-400" /> Recommended Drills
                </h3>
                <div className="space-y-3">
                  {recommendedDrills.map((drill, i) => (
                    <DrillCard key={i} drill={drill} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
