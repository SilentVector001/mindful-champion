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
  Lightbulb, Activity, CheckCircle, AlertCircle, TrendingUp,
  ChevronRight, Download, Share2, Eye, Cpu, Clock, Crosshair,
  Gauge, BarChart3, Ruler, RotateCcw, Maximize2, Volume2, VolumeX,
  Users, Video, Repeat, ChevronDown, Sparkles, Award, Flag
} from "lucide-react"
import { cn } from "@/lib/utils"
import MainNavigation from "@/components/navigation/main-navigation"

interface VideoAnalysisViewProps {
  analysis: any
  user: any
}

// Pro comparison videos library (matched to deficiencies)
const PRO_TECHNIQUE_VIDEOS = {
  'third_shot_drop': {
    title: 'Pro Third Shot Drop',
    url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600',
    coach: 'Ben Johns',
    duration: '0:24'
  },
  'backhand_volley': {
    title: 'Pro Backhand Volley',
    url: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=600',
    coach: 'Anna Leigh Waters',
    duration: '0:18'
  },
  'serve': {
    title: 'Pro Power Serve',
    url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600',
    coach: 'Tyson McGuffin',
    duration: '0:22'
  },
  'dink': {
    title: 'Pro Dink Technique',
    url: 'https://i.ytimg.com/vi/AWPoIeIxR8M/sddefault.jpg voices?w=600',
    coach: 'Catherine Parenteau',
    duration: '0:20'
  },
  'footwork': {
    title: 'Pro Footwork Patterns',
    url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600',
    coach: 'Collin Johns',
    duration: '0:30'
  }
}

// Micro-drill videos matched to deficiencies
const DRILL_VIDEOS = [
  {
    id: 'drill_1',
    title: 'Third Shot Drop Mastery',
    description: 'Master the soft touch needed for consistent third shot drops',
    duration: '5:30',
    difficulty: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400',
    matchesDeficiency: ['third_shot', 'soft_game', 'drop_shot']
  },
  {
    id: 'drill_2',
    title: 'Backhand Pop-Up Fix',
    description: 'Stop popping up backhands under pressure with this drill',
    duration: '4:15',
    difficulty: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=400',
    matchesDeficiency: ['backhand', 'volley', 'pop_up']
  },
  {
    id: 'drill_3',
    title: 'Transition Zone Footwork',
    description: 'Quick feet drills for the kitchen transition',
    duration: '6:00',
    difficulty: 'Advanced',
    thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
    matchesDeficiency: ['footwork', 'transition', 'movement']
  },
  {
    id: 'drill_4',
    title: 'Power Serve Technique',
    description: 'Add 10mph to your serve with proper mechanics',
    duration: '7:20',
    difficulty: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
    matchesDeficiency: ['serve', 'power', 'consistency']
  },
  {
    id: 'drill_5',
    title: 'Dink Battle Consistency',
    description: 'Win more dink rallies with patience and placement',
    duration: '5:45',
    difficulty: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400',
    matchesDeficiency: ['dink', 'patience', 'placement']
  }
]

// Shot Distribution Chart
function ShotDistributionChart({ data }: { data: any }) {
  const shots = data || [
    { type: 'Dinks', count: 24, percentage: 35, color: 'from-cyan-500 to-cyan-400' },
    { type: 'Drives', count: 18, percentage: 26, color: 'from-amber-500 to-amber-400' },
    { type: 'Drops', count: 12, percentage: 17, color: 'from-emerald-500 to-emerald-400' },
    { type: 'Volleys', count: 10, percentage: 15, color: 'from-purple-500 to-purple-400' },
    { type: 'Serves', count: 5, percentage: 7, color: 'from-rose-500 to-rose-400' }
  ]
  
  return (
    <div className="space-y-3">
      {shots.map((shot, i) => (
        <motion.div
          key={shot.type}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="space-y-1"
        >
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">{shot.type}</span>
            <span className="text-white font-medium">{shot.count} ({shot.percentage}%)</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${shot.percentage}%` }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className={cn("h-full rounded-full bg-gradient-to-r", shot.color)}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Key Moment Timeline Item
function TimelineMoment({ moment, onClick, isActive }: any) {
  const qualityColors = {
    excellent: 'bg-emerald-500 border-emerald-400',
    good: 'bg-cyan-500 border-cyan-400',
    needs_work: 'bg-amber-500 border-amber-400'
  }
  
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-all w-full text-left",
        isActive 
          ? "bg-cyan-500/20 border-cyan-500" 
          : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
      )}
    >
      <div className={cn(
        "w-2 h-2 rounded-full border",
        qualityColors[moment.quality as keyof typeof qualityColors] || qualityColors.good
      )} />
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{moment.type}</p>
        <p className="text-slate-500 text-xs">{moment.time}s</p>
      </div>
      <Badge variant="outline" className={cn(
        "text-xs capitalize",
        moment.quality === 'excellent' ? 'border-emerald-500 text-emerald-400' :
        moment.quality === 'needs_work' ? 'border-amber-500 text-amber-400' :
        'border-cyan-500 text-cyan-400'
      )}>
        {moment.quality?.replace('_', ' ')}
      </Badge>
    </motion.button>
  )
}

// Deficiency Card with Matched Drill
function DeficiencyCard({ deficiency, drill, index }: any) {
  const [showDrill, setShowDrill] = useState(false)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium text-sm">{deficiency.title}</h4>
              <p className="text-slate-400 text-xs mt-1">{deficiency.description}</p>
            </div>
          </div>
          
          {drill && (
            <>
              <button
                onClick={() => setShowDrill(!showDrill)}
                className="flex items-center gap-2 text-cyan-400 text-sm hover:text-cyan-300 transition-colors w-full"
              >
                <Sparkles className="w-4 h-4" />
                <span>Recommended Drill</span>
                <ChevronDown className={cn(
                  "w-4 h-4 ml-auto transition-transform",
                  showDrill && "rotate-180"
                )} />
              </button>
              
              <AnimatePresence>
                {showDrill && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-3 bg-slate-900/50 rounded-lg">
                      <div className="flex gap-3">
                        <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={drill.thumbnail}
                            alt={drill.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{drill.title}</p>
                          <p className="text-slate-500 text-xs">{drill.duration} • {drill.difficulty}</p>
                          <Button size="sm" className="mt-2 h-7 text-xs bg-cyan-500 hover:bg-cyan-600">
                            Watch Drill
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Technique Score Gauge
function TechniqueGauge({ label, score, icon: Icon, color }: any) {
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (score / 100) * circumference
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="48" cy="48" r="40"
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
          />
          <motion.circle
            cx="48" cy="48" r="40"
            fill="none"
            stroke={`url(#gradient-${label})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color.split(' ')[0]} />
              <stop offset="100%" stopColor={color.split(' ')[1] || color.split(' ')[0]} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-5 h-5 text-slate-400 mb-1" />
          <span className="text-xl font-bold text-white">{score}</span>
        </div>
      </div>
      <p className="text-slate-400 text-xs mt-2 text-center">{label}</p>
    </div>
  )
}

export default function VideoAnalysisView({ analysis, user }: VideoAnalysisViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const proVideoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(120)
  const [isMuted, setIsMuted] = useState(true)
  const [showComparison, setShowComparison] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedMoment, setSelectedMoment] = useState<number | null>(null)

  // Analysis data
  const overallScore = analysis?.overallScore ?? 72
  const fileName = analysis?.fileName || analysis?.title || 'IMG_0421.mov'
  const analysisDate = analysis?.createdAt 
    ? new Date(analysis.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) 
    : '1/8/2026'

  // Technical scores
  const technicalScores = [
    { label: 'Technique', score: 76, icon: Target, color: '#06b6d4 #22d3ee' },
    { label: 'Footwork', score: 68, icon: Activity, color: '#10b981 #34d399' },
    { label: 'Positioning', score: 82, icon: Crosshair, color: '#f59e0b #fbbf24' },
    { label: 'Strategy', score: 78, icon: Brain, color: '#8b5cf6 #a78bfa' }
  ]

  // Key moments
  const keyMoments = (analysis?.keyMoments as any[]) || [
    { time: 8, type: 'Forehand Drive', quality: 'excellent' },
    { time: 15, type: 'Dink Rally', quality: 'excellent' },
    { time: 24, type: 'Third Shot Drop', quality: 'good' },
    { time: 38, type: 'Backhand Volley', quality: 'needs_work' },
    { time: 52, type: 'Reset Shot', quality: 'good' },
    { time: 67, type: 'Overhead Smash', quality: 'needs_work' }
  ]

  // Deficiencies with matched drills
  const deficiencies = [
    {
      title: 'Backhand Volley Pop-Ups',
      description: 'Your backhand volleys tend to pop up under pressure, giving opponents easy put-aways.',
      drill: DRILL_VIDEOS[1]
    },
    {
      title: 'Transition Zone Footwork',
      description: 'Split-step timing is late when moving from baseline to kitchen.',
      drill: DRILL_VIDEOS[2]
    },
    {
      title: 'Overhead Power',
      description: 'Smashes lack follow-through and power, often landing short.',
      drill: DRILL_VIDEOS[3]
    }
  ]

  // Strengths
  const strengths = [
    'Strong serve placement with excellent depth control',
    'Effective third shot drops to neutralize attacks',
    'Solid court positioning during rallies',
    'Consistent dinking game with controlled pace'
  ]

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        proVideoRef.current?.pause()
      } else {
        videoRef.current.play()
        proVideoRef.current?.play()
      }
    }
    setIsPlaying(!isPlaying)
  }

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <MainNavigation />
      
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]" />
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
              <h1 className="text-2xl font-bold text-white">{fileName}</h1>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="w-4 h-4" />
                <span>{analysisDate}</span>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                  <CheckCircle className="w-3 h-3 mr-1" /> AI Analyzed
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Overall Score */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl blur-xl opacity-40" />
            <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-4 text-center min-w-[100px]">
              <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                {overallScore}
              </div>
              <p className="text-slate-400 text-xs">Overall Score</p>
            </div>
          </motion.div>
        </div>

        {/* Video Comparison Section */}
        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          {/* Your Video */}
          <Card className="bg-slate-900/60 border-slate-700/50 overflow-hidden">
            <div className="p-3 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-cyan-500 text-cyan-400">Your Form</Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowComparison(!showComparison)}
                className="text-slate-400 text-xs"
              >
                <Users className="w-4 h-4 mr-1" />
                {showComparison ? 'Hide' : 'Show'} Pro Comparison
              </Button>
            </div>
            <div className="relative aspect-video bg-black">
              {analysis?.videoUrl ? (
                <video
                  ref={videoRef}
                  src={analysis.videoUrl}
                  className="w-full h-full object-contain"
                  muted={isMuted}
                  loop
                  playsInline
                  onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
                  onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration)}
                  poster={analysis.thumbnailUrl}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
                  {/* Placeholder with pose skeleton */}
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                    <defs>
                      <linearGradient id="skeletonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    {/* Skeleton lines */}
                    {[
                      [50, 15, 50, 25], [50, 25, 35, 30], [50, 25, 65, 30],
                      [35, 30, 25, 45], [65, 30, 80, 40], [25, 45, 20, 60],
                      [80, 40, 88, 28], [50, 25, 50, 50], [50, 50, 40, 55],
                      [50, 50, 60, 55], [40, 55, 35, 75], [60, 55, 65, 75],
                      [35, 75, 32, 92], [65, 75, 68, 92]
                    ].map(([x1, y1, x2, y2], i) => (
                      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke="url(#skeletonGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                    ))}
                    {/* Joints */}
                    {[
                      [50, 15, 4], [50, 25, 2], [35, 30, 2], [65, 30, 2],
                      [25, 45, 2], [80, 40, 3], [20, 60, 2], [88, 28, 2],
                      [50, 50, 2], [40, 55, 2], [60, 55, 2], [35, 75, 2],
                      [65, 75, 2], [32, 92, 2], [68, 92, 2]
                    ].map(([cx, cy, r], i) => (
                      <circle key={i} cx={cx} cy={cy} r={r} fill="#22d3ee" />
                    ))}
                    {/* Paddle */}
                    <rect x="85" y="20" width="6" height="12" rx="1" fill="none" stroke="#10b981" strokeWidth="1" />
                  </svg>
                </div>
              )}
              
              {/* AI Badge */}
              <div className="absolute top-3 left-3">
                <Badge className="bg-cyan-500/90 text-white border-0">
                  <Eye className="w-3 h-3 mr-1" /> AI Pose Detection
                </Badge>
              </div>
            </div>
          </Card>

          {/* Pro Comparison Video */}
          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card className="bg-slate-900/60 border-slate-700/50 overflow-hidden h-full">
                  <div className="p-3 border-b border-slate-700/50 flex items-center gap-2">
                    <Badge variant="outline" className="border-amber-500 text-amber-400">Pro Form</Badge>
                    <span className="text-slate-400 text-xs">Ben Johns • Third Shot Drop</span>
                  </div>
                  <div className="relative aspect-video bg-black">
                    <Image
                      src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800"
                      alt="Pro technique"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Button
                        size="lg"
                        className="rounded-full w-16 h-16 bg-white/20 backdrop-blur hover:bg-white/30"
                      >
                        <Play className="w-8 h-8 text-white" />
                      </Button>
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-amber-500/90 text-white border-0">
                        <Trophy className="w-3 h-3 mr-1" /> Pro Reference
                      </Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Video Controls */}
        <Card className="bg-slate-900/60 border-slate-700/50 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                onClick={togglePlay}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <span className="text-white text-sm font-mono min-w-[80px]">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              
              {/* Timeline with markers */}
              <div className="flex-1 relative h-2 bg-slate-800 rounded-full cursor-pointer group">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
                {/* Key moment markers */}
                {keyMoments.map((moment, i) => (
                  <button
                    key={i}
                    onClick={() => seekTo(moment.time)}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-transform hover:scale-125",
                      moment.quality === 'excellent' ? 'bg-emerald-500 border-emerald-400' :
                      moment.quality === 'needs_work' ? 'bg-amber-500 border-amber-400' :
                      'bg-cyan-500 border-cyan-400'
                    )}
                    style={{ left: `${(moment.time / duration) * 100}%` }}
                    title={moment.type}
                  />
                ))}
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-400"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-700/50 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="moments">Key Moments</TabsTrigger>
            <TabsTrigger value="drills">Drills For You</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Technique Scores */}
              <Card className="bg-slate-900/60 border-slate-700/50">
                <CardContent className="p-6">
                  <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    Technique Scores
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {technicalScores.map((score) => (
                      <TechniqueGauge key={score.label} {...score} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shot Distribution */}
              <Card className="bg-slate-900/60 border-slate-700/50">
                <CardContent className="p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-400" />
                    Shot Distribution
                  </h3>
                  <ShotDistributionChart data={null} />
                </CardContent>
              </Card>

              {/* Strengths & Improvements */}
              <div className="space-y-4">
                <Card className="bg-slate-900/60 border-slate-700/50">
                  <CardContent className="p-4">
                    <h3 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {strengths.slice(0, 3).map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle className="w-3 h-3 text-emerald-400 mt-1 flex-shrink-0" />
                          <span className="line-clamp-2">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-900/60 border-slate-700/50">
                  <CardContent className="p-4">
                    <h3 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Areas to Improve
                    </h3>
                    <ul className="space-y-2">
                      {deficiencies.slice(0, 3).map((d, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <AlertCircle className="w-3 h-3 text-amber-400 mt-1 flex-shrink-0" />
                          <span className="line-clamp-2">{d.title}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Key Moments Tab */}
          <TabsContent value="moments" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {keyMoments.map((moment, i) => (
                <TimelineMoment
                  key={i}
                  moment={moment}
                  onClick={() => {
                    seekTo(moment.time)
                    setSelectedMoment(i)
                  }}
                  isActive={selectedMoment === i}
                />
              ))}
            </div>
          </TabsContent>

          {/* Drills Tab */}
          <TabsContent value="drills" className="space-y-4">
            <p className="text-slate-400 text-sm mb-4">
              Based on your analysis, we've identified specific drills to address your areas for improvement.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deficiencies.map((def, i) => (
                <DeficiencyCard key={i} deficiency={def} drill={def.drill} index={i} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600">
            <Download className="w-4 h-4 mr-2" /> Download PDF Report
          </Button>
          <Button variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800">
            <Share2 className="w-4 h-4 mr-2" /> Share Analysis
          </Button>
        </div>
      </div>
    </div>
  )
}
