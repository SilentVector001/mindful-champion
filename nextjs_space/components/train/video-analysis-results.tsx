"use client"

import { useState, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, TrendingUp, Target, Play, FileText, ChevronRight,
  Zap, Brain, AlertCircle, Users, Library, Trophy, Activity,
  Crosshair, Move, Shield, Gauge, Eye, Lightbulb, Star, Clock
} from "lucide-react"
import { cn } from "@/lib/utils"
import { generateAnalysisPDF } from "@/lib/pdf-generator"
import type { VideoAnalysisData } from "@/lib/video-analysis-types"
import { PublishToCommunityModal } from "@/components/community"

interface VideoAnalysisResultsProps {
  videoId: string
}

// Circular Progress Ring Component
function ScoreRing({ score, size = 140, strokeWidth = 10, color = "cyan" }: { 
  score: number; size?: number; strokeWidth?: number; color?: string 
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference
  
  const colorMap: Record<string, string> = {
    cyan: "stroke-cyan-400",
    emerald: "stroke-emerald-400",
    amber: "stroke-amber-400",
    purple: "stroke-purple-400"
  }
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-slate-700/50"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={colorMap[color] || "stroke-cyan-400"}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          className="text-4xl font-bold text-white"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-slate-400 uppercase tracking-wider">Overall</span>
      </div>
    </div>
  )
}

// Mini Stat Card Component
function MiniStat({ icon: Icon, label, value, trend, color }: {
  icon: any; label: string; value: number | string; trend?: number; color: string
}) {
  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
    rose: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30" }
  }
  const c = colorClasses[color] || colorClasses.cyan
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        "relative p-4 rounded-xl border backdrop-blur-sm transition-all",
        c.bg, c.border
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={cn("p-2 rounded-lg", c.bg)}>
          <Icon className={cn("w-4 h-4", c.text)} />
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-0.5 text-xs font-medium",
            trend >= 0 ? "text-emerald-400" : "text-rose-400"
          )}>
            <TrendingUp className={cn("w-3 h-3", trend < 0 && "rotate-180")} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">
        {typeof value === 'number' ? `${value}%` : value}
      </div>
      <div className="text-xs text-slate-400">{label}</div>
    </motion.div>
  )
}

// Court Heatmap Component
function CourtHeatmap({ shotTypes }: { shotTypes: any[] }) {
  const [activeShot, setActiveShot] = useState<string | null>(null)
  
  // Generate zone data from shot types
  const zones = useMemo(() => {
    const baseZones = [
      { id: 'kitchen-left', x: 5, y: 35, w: 22, h: 30, label: 'Kitchen L' },
      { id: 'kitchen-right', x: 73, y: 35, w: 22, h: 30, label: 'Kitchen R' },
      { id: 'mid-left', x: 5, y: 5, w: 22, h: 25, label: 'Mid L' },
      { id: 'mid-right', x: 73, y: 5, w: 22, h: 25, label: 'Mid R' },
      { id: 'mid-center', x: 32, y: 5, w: 36, h: 25, label: 'Mid Center' },
      { id: 'nvz-left', x: 32, y: 35, w: 18, h: 30, label: 'NVZ L' },
      { id: 'nvz-right', x: 50, y: 35, w: 18, h: 30, label: 'NVZ R' },
      { id: 'baseline-left', x: 5, y: 70, w: 30, h: 25, label: 'Base L' },
      { id: 'baseline-right', x: 65, y: 70, w: 30, h: 25, label: 'Base R' },
      { id: 'baseline-center', x: 35, y: 70, w: 30, h: 25, label: 'Base C' }
    ]
    
    // Assign random intensities for demo (in real app, calculate from shot data)
    return baseZones.map(zone => ({
      ...zone,
      intensity: Math.random() * 100
    }))
  }, [shotTypes])
  
  const getHeatColor = (intensity: number) => {
    if (intensity > 75) return 'rgba(34, 211, 238, 0.6)' // cyan hot
    if (intensity > 50) return 'rgba(52, 211, 153, 0.5)' // emerald warm
    if (intensity > 25) return 'rgba(251, 191, 36, 0.4)' // amber medium
    return 'rgba(148, 163, 184, 0.2)' // slate cool
  }
  
  const shotButtons = [
    { id: 'all', label: 'All Shots', color: 'cyan' },
    { id: 'drive', label: 'Drives', color: 'emerald' },
    { id: 'dink', label: 'Dinks', color: 'amber' },
    { id: 'serve', label: 'Serves', color: 'purple' }
  ]
  
  return (
    <div className="space-y-4">
      {/* Shot Type Toggles */}
      <div className="flex flex-wrap gap-2">
        {shotButtons.map(btn => (
          <button
            key={btn.id}
            onClick={() => setActiveShot(activeShot === btn.id ? null : btn.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              activeShot === btn.id
                ? `bg-${btn.color}-500 text-white`
                : `bg-slate-700/50 text-slate-300 hover:bg-slate-600/50`
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>
      
      {/* Court Diagram */}
      <div className="relative aspect-[4/3] bg-gradient-to-b from-slate-800/80 to-slate-900/80 rounded-xl border border-slate-700/50 overflow-hidden">
        {/* Court Lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Outer boundary */}
          <rect x="2" y="2" width="96" height="96" fill="none" stroke="rgba(148,163,184,0.3)" strokeWidth="0.5" />
          {/* Center line */}
          <line x1="50" y1="2" x2="50" y2="98" stroke="rgba(148,163,184,0.3)" strokeWidth="0.3" />
          {/* Kitchen line */}
          <line x1="2" y1="35" x2="98" y2="35" stroke="rgba(34,211,238,0.4)" strokeWidth="0.5" />
          <line x1="2" y1="65" x2="98" y2="65" stroke="rgba(34,211,238,0.4)" strokeWidth="0.5" />
          {/* Net */}
          <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
          
          {/* Heat zones */}
          {zones.map(zone => (
            <motion.rect
              key={zone.id}
              x={zone.x}
              y={zone.y}
              width={zone.w}
              height={zone.h}
              fill={getHeatColor(zone.intensity)}
              rx="2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: Math.random() * 0.3 }}
            />
          ))}
        </svg>
        
        {/* Legend */}
        <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-2 py-1 rounded">
          <span>Cold</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 rounded-sm bg-slate-600/50" />
            <div className="w-3 h-3 rounded-sm bg-amber-500/50" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500/50" />
            <div className="w-3 h-3 rounded-sm bg-cyan-500/60" />
          </div>
          <span>Hot</span>
        </div>
        
        {/* Your Position Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50" />
        </div>
      </div>
    </div>
  )
}

// Quick Insight Card
function InsightCard({ type, title, description, icon: Icon }: {
  type: 'strength' | 'improve' | 'tip'; title: string; description: string; icon: any
}) {
  const styles = {
    strength: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: 'bg-emerald-500' },
    improve: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: 'bg-amber-500' },
    tip: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: 'bg-cyan-500' }
  }
  const s = styles[type]
  
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={cn("p-4 rounded-xl border", s.bg, s.border)}
    >
      <div className="flex gap-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", s.icon)}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h4 className={cn("font-semibold text-sm mb-1", s.text)}>{title}</h4>
          <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function VideoAnalysisResults({ videoId }: VideoAnalysisResultsProps) {
  const { data: session } = useSession() || {}
  const [video, setVideo] = useState<VideoAnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)
  const [lastSession, setLastSession] = useState<{ score: number } | null>(null)

  useEffect(() => {
    fetchVideoAnalysis()
  }, [videoId])

  const fetchVideoAnalysis = async () => {
    try {
      const res = await fetch(`/api/video-analysis/${videoId}`)
      if (res?.ok) {
        const data = await res.json()
        setVideo(data?.video ?? null)
        // Simulate last session for comparison
        setLastSession({ score: Math.max(0, (data?.video?.overallScore ?? 0) - Math.floor(Math.random() * 15)) })
      }
    } catch (error) {
      console.error('Error fetching video:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = () => {
    if (!video) return
    const pdfHTML = generateAnalysisPDF({
      playerName: (session?.user as any)?.name || 'Player',
      videoTitle: video?.title ?? 'Analysis',
      analysisDate: new Date(video?.uploadedAt ?? Date.now()).toLocaleDateString(),
      overallScore: video?.overallScore ?? 0,
      strengths: (video?.strengths as string[]) ?? [],
      improvements: (video?.areasForImprovement as string[]) ?? [],
      recommendations: (video?.recommendations as string[]) ?? [],
      shotAnalysis: video?.shotTypes ?? [],
      movementMetrics: video?.movementMetrics,
      technicalScores: video?.technicalScores,
      keyMoments: video?.keyMoments ?? []
    })
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(pdfHTML)
      printWindow.document.close()
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin" />
          <p className="text-slate-400">Loading analysis...</p>
        </div>
      </div>
    )
  }

  // Not Found State
  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <h2 className="text-2xl font-bold text-white mb-2">Video Not Found</h2>
          <p className="text-slate-400 mb-6">This analysis could not be loaded.</p>
          <Button asChild>
            <Link href="/train/video">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Video Lab
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Extract data with safe defaults
  const overallScore = video?.overallScore ?? 0
  const shotTypes = Array.isArray(video?.shotTypes) ? video.shotTypes : []
  const strengths = (video?.strengths as string[]) ?? []
  const improvements = (video?.areasForImprovement as string[]) ?? []
  const recommendations = (video?.recommendations as string[]) ?? []
  const keyMoments = (video?.keyMoments as any[]) ?? []
  
  const rawTechnicalScores = video?.technicalScores as any
  const technicalScores = {
    paddleAngle: rawTechnicalScores?.paddleAngle ?? 0,
    followThrough: rawTechnicalScores?.followThrough ?? 0,
    bodyRotation: rawTechnicalScores?.bodyRotation ?? 0,
    readyPosition: rawTechnicalScores?.readyPosition ?? 0,
    overall: rawTechnicalScores?.overall ?? 0
  }
  
  const rawMovementMetrics = video?.movementMetrics as any
  const movementMetrics = {
    courtCoverage: rawMovementMetrics?.courtCoverage ?? 0,
    efficiency: rawMovementMetrics?.efficiency ?? 0,
    positioning: rawMovementMetrics?.positioning ?? 0,
    footwork: rawMovementMetrics?.footwork ?? 0
  }

  const improvement = lastSession ? overallScore - lastSession.score : 0
  const isProcessing = video?.analysisStatus === 'PROCESSING'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative container mx-auto max-w-6xl px-4 py-6">
        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-cyan-400">
              <Link href="/train/analysis-library">
                <ArrowLeft className="w-4 h-4 mr-1" /> Library
              </Link>
            </Button>
            <div className="h-4 w-px bg-slate-700" />
            <h1 className="text-lg font-semibold text-white truncate max-w-[200px] sm:max-w-none">
              {video?.title ?? 'Analysis'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={downloadPDF} className="border-slate-600 text-slate-300 hover:border-cyan-500/50">
              <FileText className="w-4 h-4 mr-1" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowShareModal(true)} className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10">
              <Users className="w-4 h-4 mr-1" /> Share
            </Button>
          </div>
        </motion.div>

        {/* Processing Banner */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center gap-3"
          >
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="text-cyan-300 font-medium">Analysis in progress...</p>
              <p className="text-xs text-slate-400">Results will appear shortly</p>
            </div>
          </motion.div>
        )}

        {/* ===== SECTION 1: Hero Summary Card ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="relative bg-gradient-to-br from-slate-800/90 via-slate-800/70 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6 overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
            
            <div className="relative flex flex-col md:flex-row items-center gap-6">
              {/* Score Ring */}
              <div className="flex-shrink-0">
                <ScoreRing score={overallScore} />
              </div>
              
              {/* Stats & Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-white">Performance Score</h2>
                  {improvement !== 0 && (
                    <Badge className={cn(
                      "text-xs",
                      improvement > 0 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                    )}>
                      <TrendingUp className={cn("w-3 h-3 mr-1", improvement < 0 && "rotate-180")} />
                      {improvement > 0 ? '+' : ''}{improvement} vs last
                    </Badge>
                  )}
                </div>
                
                {/* Quick Badges */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  <Badge className="bg-slate-700/50 text-slate-300 border-slate-600">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(video?.uploadedAt ?? Date.now()).toLocaleDateString()}
                  </Badge>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                    <Target className="w-3 h-3 mr-1" />
                    {shotTypes?.length ?? 0} Shot Types
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    <Brain className="w-3 h-3 mr-1" />
                    AI Analyzed
                  </Badge>
                </div>
                
                {/* Watch Highlights CTA */}
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/25">
                  <Play className="w-4 h-4 mr-2" /> Watch Highlights
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ===== SECTION 2: Two Column Layout - Heatmap + Stats ===== */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Court Heatmap */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Crosshair className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Shot Placement</h3>
            </div>
            <CourtHeatmap shotTypes={shotTypes} />
          </motion.div>
          
          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Key Metrics</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <MiniStat icon={Target} label="Shot Accuracy" value={technicalScores.paddleAngle} trend={3} color="cyan" />
              <MiniStat icon={Gauge} label="Technique" value={technicalScores.overall} trend={5} color="emerald" />
              <MiniStat icon={Move} label="Movement" value={movementMetrics.efficiency} trend={-2} color="amber" />
              <MiniStat icon={Shield} label="Positioning" value={movementMetrics.positioning} trend={8} color="purple" />
              <MiniStat icon={Zap} label="Power" value={technicalScores.followThrough} color="blue" />
              <MiniStat icon={Eye} label="Consistency" value={movementMetrics.courtCoverage} color="rose" />
            </div>
          </motion.div>
        </div>

        {/* ===== SECTION 3: Coach Kai Insights ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Coach Kai's Insights</h3>
                <p className="text-xs text-slate-400">Personalized analysis & recommendations</p>
              </div>
            </div>
            
            {strengths.length === 0 && improvements.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Brain className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>Analysis in progress. Insights coming soon...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-3">
                {strengths.slice(0, 1).map((s, i) => (
                  <InsightCard key={`s-${i}`} type="strength" title="Top Strength" description={s} icon={Trophy} />
                ))}
                {improvements.slice(0, 1).map((imp, i) => (
                  <InsightCard key={`i-${i}`} type="improve" title="Focus Area" description={imp} icon={Target} />
                ))}
                {recommendations.slice(0, 1).map((r, i) => (
                  <InsightCard key={`r-${i}`} type="tip" title="Quick Tip" description={r} icon={Lightbulb} />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* ===== SECTION 4: Key Moments Strip ===== */}
        {keyMoments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">Key Moments</h3>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {keyMoments.slice(0, 5).map((moment: any, idx: number) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.03 }}
                  className={cn(
                    "flex-shrink-0 w-40 p-3 rounded-xl border text-left transition-all",
                    moment?.type === 'strength' ? "bg-emerald-500/10 border-emerald-500/30" :
                    moment?.type === 'improvement' ? "bg-amber-500/10 border-amber-500/30" :
                    "bg-purple-500/10 border-purple-500/30"
                  )}
                >
                  <Badge className="text-xs mb-2 bg-slate-800/50">
                    {moment?.timestampFormatted ?? '0:00'}
                  </Badge>
                  <p className="text-sm text-white font-medium line-clamp-2">
                    {moment?.title ?? 'Moment'}
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== SECTION 5: Quick Actions Footer ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-3 pt-4 border-t border-slate-800"
        >
          <Button variant="outline" asChild className="border-slate-600 text-slate-300 hover:border-cyan-500/50">
            <Link href="/train/video">
              <Zap className="w-4 h-4 mr-2" /> New Analysis
            </Link>
          </Button>
          <Button variant="outline" asChild className="border-slate-600 text-slate-300 hover:border-cyan-500/50">
            <Link href="/train/analysis-library">
              <Library className="w-4 h-4 mr-2" /> View All
            </Link>
          </Button>
          <Button variant="outline" asChild className="border-slate-600 text-slate-300 hover:border-cyan-500/50">
            <Link href="/dashboard">
              <ChevronRight className="w-4 h-4 mr-2" /> Dashboard
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Share Modal */}
      {showShareModal && video && (
        <PublishToCommunityModal
          videoAnalysisId={videoId}
          videoTitle={video?.title ?? 'Analysis'}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  )
}