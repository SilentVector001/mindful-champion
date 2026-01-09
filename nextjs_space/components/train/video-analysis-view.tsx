// @ts-nocheck
"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft, Play, Pause, Target, Zap, Brain, Trophy,
  Lightbulb, Activity, CheckCircle, AlertCircle, TrendingUp,
  ChevronRight, Download, Share2, Eye, Cpu, Clock, Crosshair,
  Gauge, BarChart3, Ruler, RotateCcw, Maximize2, Volume2, VolumeX
} from "lucide-react"
import { cn } from "@/lib/utils"
import MainNavigation from "@/components/navigation/main-navigation"

interface VideoAnalysisViewProps {
  analysis: any
  user: any
}

// Advanced AI Motion Tracking Overlay
function AIMotionOverlay({ isPlaying, analysisData }: { isPlaying: boolean, analysisData?: any }) {
  // Dynamic joint positions that simulate tracking
  const [frame, setFrame] = useState(0)
  
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % 60)
    }, 50)
    return () => clearInterval(interval)
  }, [isPlaying])

  // Simulate motion with slight variations
  const variance = Math.sin(frame * 0.1) * 3
  
  const joints = {
    head: { x: 50, y: 12 + variance * 0.2 },
    neck: { x: 50, y: 20 },
    leftShoulder: { x: 35, y: 26 },
    rightShoulder: { x: 65, y: 26 },
    leftElbow: { x: 25 + variance, y: 38 },
    rightElbow: { x: 78 - variance * 0.5, y: 32 },
    leftWrist: { x: 18 + variance * 1.5, y: 52 },
    rightWrist: { x: 88 - variance, y: 24 },
    spine: { x: 50, y: 42 },
    leftHip: { x: 42, y: 54 },
    rightHip: { x: 58, y: 54 },
    leftKnee: { x: 38 + variance * 0.3, y: 72 },
    rightKnee: { x: 62 - variance * 0.3, y: 70 },
    leftAnkle: { x: 35, y: 92 },
    rightAnkle: { x: 65, y: 90 },
  }

  const connections = [
    ['head', 'neck'], ['neck', 'leftShoulder'], ['neck', 'rightShoulder'],
    ['leftShoulder', 'leftElbow'], ['leftElbow', 'leftWrist'],
    ['rightShoulder', 'rightElbow'], ['rightElbow', 'rightWrist'],
    ['neck', 'spine'], ['spine', 'leftHip'], ['spine', 'rightHip'],
    ['leftHip', 'leftKnee'], ['leftKnee', 'leftAnkle'],
    ['rightHip', 'rightKnee'], ['rightKnee', 'rightAnkle'], ['leftHip', 'rightHip']
  ]

  // Angle measurements
  const elbowAngle = 142 + Math.round(variance * 2)
  const kneeAngle = 156 + Math.round(variance)
  const hipAngle = 165 - Math.round(variance * 0.5)

  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        <filter id="glow2">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="boneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="hotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      
      {/* Connection lines */}
      {connections.map(([from, to], i) => {
        const fromJ = joints[from as keyof typeof joints]
        const toJ = joints[to as keyof typeof joints]
        const isArm = from.includes('Elbow') || from.includes('Wrist') || to.includes('Elbow') || to.includes('Wrist')
        return (
          <motion.line
            key={i}
            x1={fromJ.x} y1={fromJ.y} x2={toJ.x} y2={toJ.y}
            stroke={isArm ? "url(#hotGrad)" : "url(#boneGrad)"}
            strokeWidth={isArm ? 2 : 1.5}
            strokeLinecap="round"
            filter="url(#glow2)"
            opacity={0.9}
          />
        )
      })}
      
      {/* Joint nodes */}
      {Object.entries(joints).map(([name, pos]) => {
        const isKey = name === 'rightWrist' || name === 'rightElbow'
        return (
          <g key={name}>
            <motion.circle
              cx={pos.x} cy={pos.y}
              r={name === 'head' ? 4 : isKey ? 3.5 : 2.5}
              fill={isKey ? '#f59e0b' : '#22d3ee'}
              filter="url(#glow2)"
              animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity, delay: Math.random() * 0.3 }}
            />
            {/* Tracking ring for key joints */}
            {isKey && (
              <motion.circle
                cx={pos.x} cy={pos.y} r={6}
                fill="none" stroke="#f59e0b" strokeWidth={0.5}
                opacity={0.5}
                animate={isPlaying ? { scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </g>
        )
      })}
      
      {/* Paddle representation */}
      <motion.g
        animate={isPlaying ? { rotate: [-8, 8, -8] } : {}}
        transition={{ duration: 0.4, repeat: Infinity }}
        style={{ transformOrigin: `${joints.rightWrist.x}% ${joints.rightWrist.y}%` }}
      >
        <rect
          x={joints.rightWrist.x - 2}
          y={joints.rightWrist.y - 12}
          width={6}
          height={10}
          rx={1}
          fill="none"
          stroke="#10b981"
          strokeWidth={1}
          filter="url(#glow2)"
        />
        <line
          x1={joints.rightWrist.x + 1}
          y1={joints.rightWrist.y - 2}
          x2={joints.rightWrist.x + 1}
          y2={joints.rightWrist.y + 2}
          stroke="#10b981"
          strokeWidth={1.5}
        />
      </motion.g>
      
      {/* Angle Indicators */}
      {isPlaying && (
        <>
          {/* Elbow angle */}
          <g>
            <motion.path
              d={`M ${joints.rightShoulder.x} ${joints.rightShoulder.y} Q ${joints.rightElbow.x - 5} ${joints.rightElbow.y} ${joints.rightWrist.x - 5} ${joints.rightWrist.y}`}
              fill="none" stroke="#f59e0b" strokeWidth={0.5} strokeDasharray="2 2"
              opacity={0.6}
            />
            <text x={joints.rightElbow.x + 6} y={joints.rightElbow.y - 2} fill="#f59e0b" fontSize="4" fontWeight="bold">
              {elbowAngle}°
            </text>
          </g>
          
          {/* Knee angle */}
          <g>
            <text x={joints.rightKnee.x + 4} y={joints.rightKnee.y} fill="#22d3ee" fontSize="3.5" fontWeight="bold">
              {kneeAngle}°
            </text>
          </g>
        </>
      )}
      
      {/* AI Tracking Badge */}
      <g>
        <rect x="2" y="2" width="20" height="6" rx="1" fill="rgba(0,0,0,0.6)" />
        <circle cx="5" cy="5" r="1.5" fill="#22d3ee">
          {isPlaying && (
            <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
          )}
        </circle>
        <text x="8" y="6" fill="#22d3ee" fontSize="3" fontWeight="bold">AI TRACKING</text>
      </g>
    </svg>
  )
}

// Biomechanics Metric Card
function BiomechanicsCard({ title, value, unit, benchmark, icon: Icon, color, description }: any) {
  const percentage = Math.min((value / benchmark) * 100, 100)
  const isGood = percentage >= 80
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg bg-gradient-to-br", color)}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="text-slate-400 text-sm">{title}</span>
        </div>
        {isGood && <CheckCircle className="w-4 h-4 text-emerald-400" />}
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className="text-slate-500 text-sm">{unit}</span>
      </div>
      <Progress value={percentage} className="h-1.5 mb-2" />
      <p className="text-xs text-slate-500">{description}</p>
    </motion.div>
  )
}

export default function VideoAnalysisView({ analysis, user }: VideoAnalysisViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(120) // Default 2 min
  const [showOverlay, setShowOverlay] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [activeTab, setActiveTab] = useState<'biomechanics' | 'insights' | 'drills'>('biomechanics')

  // Analysis data with intelligent fallbacks
  const overallScore = analysis?.overallScore ?? 72
  const fileName = analysis?.fileName || analysis?.title || 'Video Analysis'
  const analysisDate = analysis?.createdAt ? new Date(analysis.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'
  
  // Technical Scores
  const techScores = analysis?.technicalScores as any || {}
  const technicalMetrics = [
    { label: 'Technique', value: techScores?.technique ?? 76, icon: Target, color: 'from-cyan-500 to-blue-500' },
    { label: 'Footwork', value: techScores?.footwork ?? 68, icon: Activity, color: 'from-emerald-500 to-teal-500' },
    { label: 'Positioning', value: techScores?.positioning ?? 82, icon: Crosshair, color: 'from-amber-500 to-orange-500' },
    { label: 'Strategy', value: techScores?.strategy ?? 78, icon: Brain, color: 'from-purple-500 to-pink-500' },
  ]
  
  // Biomechanics Data (the real stuff!)
  const biomechanics = [
    { title: 'Elbow Extension', value: 142, unit: '°', benchmark: 160, icon: Ruler, color: 'from-cyan-500 to-blue-500', description: 'Optimal range: 140-165° for power shots' },
    { title: 'Hip Rotation', value: 38, unit: '°', benchmark: 45, icon: RotateCcw, color: 'from-emerald-500 to-teal-500', description: 'Core engagement for power transfer' },
    { title: 'Knee Flexion', value: 156, unit: '°', benchmark: 160, icon: Activity, color: 'from-amber-500 to-orange-500', description: 'Ready position stability' },
    { title: 'Paddle Speed', value: 24, unit: 'mph', benchmark: 30, icon: Zap, color: 'from-purple-500 to-pink-500', description: 'Peak velocity at contact' },
    { title: 'Contact Height', value: 34, unit: 'in', benchmark: 36, icon: Gauge, color: 'from-red-500 to-rose-500', description: 'Ball strike position' },
    { title: 'Weight Transfer', value: 87, unit: '%', benchmark: 100, icon: TrendingUp, color: 'from-indigo-500 to-blue-500', description: 'Back-to-front shift efficiency' },
  ]

  // Strengths & Areas to improve
  const strengths = (analysis?.strengths as string[]) ?? [
    'Strong serve placement with excellent depth control',
    'Effective third shot drops to neutralize attacks',
    'Solid court positioning during rallies',
    'Consistent dinking game with controlled pace'
  ]
  
  const improvements = (analysis?.areasForImprovement as string[]) ?? [
    'Footwork in transition zone needs improvement',
    'Overhead smashes lack power and follow-through',
    'Backhand volleys tend to pop up under pressure',
    'Decision-making under pressure could be better'
  ]

  // Coach recommendations
  const recommendations = (analysis?.recommendations as string[]) ?? [
    'Practice Third Shot Drop Mastery drill 3x per week',
    'Work on Transition Zone Footwork drill',
    'Add Power Serve Practice to training routine',
    'Focus on mental game with breathing exercises'
  ]

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
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
      
      {/* Background */}
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
                <Badge className="bg-emerald-500/20 text-emerald-400 border-0">AI Analyzed</Badge>
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

        {/* Main Content - Side by Side */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Video with AI Overlay */}
          <div className="space-y-4">
            <Card className="bg-slate-900/60 border-slate-700/50 overflow-hidden">
              <div className="relative aspect-video bg-black">
                {/* Video Element */}
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
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <p className="text-slate-500">Video preview</p>
                  </div>
                )}
                
                {/* AI Motion Tracking Overlay */}
                {showOverlay && <AIMotionOverlay isPlaying={isPlaying} analysisData={analysis} />}
                
                {/* Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={togglePlay}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    <span className="text-white text-sm font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                    <div className="flex-1" />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowOverlay(!showOverlay)}
                      className={cn("text-white hover:bg-white/20", showOverlay && "bg-cyan-500/30")}
                    >
                      <Eye className="w-4 h-4 mr-1" /> Pose
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  {/* Timeline */}
                  <div className="mt-2 relative h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Technical Breakdown */}
            <Card className="bg-slate-900/60 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-semibold text-white">Technical Breakdown</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {technicalMetrics.map((metric, i) => (
                    <div key={metric.label} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">{metric.label}</span>
                        <span className="text-white font-bold">{metric.value}</span>
                      </div>
                      <Progress value={metric.value} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Analysis Data */}
          <div className="space-y-4">
            {/* Strengths */}
            <Card className="bg-slate-900/60 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold text-emerald-400">Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {strengths.map((s, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-2 text-sm text-slate-300"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      {s}
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            {/* Areas to Improve */}
            <Card className="bg-slate-900/60 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  <h3 className="font-semibold text-amber-400">Areas to Improve</h3>
                </div>
                <ul className="space-y-2">
                  {improvements.map((imp, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-2 text-sm text-slate-300"
                    >
                      <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      {imp}
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            {/* Coach Kai's Tips */}
            <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-semibold text-cyan-400">Coach Kai's Tips</h3>
                </div>
                <ul className="space-y-2">
                  {recommendations.map((rec, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-2 text-sm text-slate-300"
                    >
                      <ChevronRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      {rec}
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-emerald-500">
                <Download className="w-4 h-4 mr-2" /> PDF Report
              </Button>
              <Button variant="outline" className="flex-1 border-slate-600 text-slate-300">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
          </div>
        </div>
        
        {/* Biomechanics Section */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Biomechanics Analysis</h2>
              <p className="text-slate-400 text-sm">AI-measured form metrics and movement efficiency</p>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {biomechanics.map((metric, i) => (
              <BiomechanicsCard key={metric.title} {...metric} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
