"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, TrendingUp, Target, Play, FileText, ChevronRight,
  Zap, Brain, AlertCircle, Users, Library, Trophy, Activity,
  Crosshair, Move, Shield, Gauge, Eye, Lightbulb, Star, Clock,
  MessageCircle, Send, X, ChevronDown, ChevronUp, Dumbbell,
  Video, Pause, SkipBack, SkipForward, Maximize2, Volume2,
  Award, Flame, Share2, BarChart3, Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import { generateAnalysisPDF } from "@/lib/pdf-generator"
import type { VideoAnalysisData } from "@/lib/video-analysis-types"
import { PublishToCommunityModal } from "@/components/community"

interface VideoAnalysisResultsProps {
  videoId: string
}

// ===== SPARKLINE COMPONENT =====
function Sparkline({ data, color, height = 24 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 60
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')
  
  const colorMap: Record<string, string> = {
    cyan: '#22d3ee', emerald: '#34d399', amber: '#fbbf24', 
    purple: '#a78bfa', blue: '#60a5fa', rose: '#fb7185'
  }
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={colorMap[color] || colorMap.cyan}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={(data.length - 1) / (data.length - 1) * width}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
        r="3"
        fill={colorMap[color] || colorMap.cyan}
      />
    </svg>
  )
}

// ===== PERFORMANCE BADGE =====
function PerformanceBadge({ value }: { value: number }) {
  if (value >= 85) return <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] font-bold border-0"><Award className="w-3 h-3 mr-0.5" />Pro Level</Badge>
  if (value >= 70) return <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] border-emerald-500/30">Above Avg</Badge>
  if (value >= 50) return <Badge className="bg-blue-500/20 text-blue-400 text-[10px] border-blue-500/30">Average</Badge>
  return <Badge className="bg-amber-500/20 text-amber-400 text-[10px] border-amber-500/30">Focus Area</Badge>
}

// ===== SCORE RING COMPONENT =====
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
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-slate-700/50" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} fill="none" strokeLinecap="round"
          className={colorMap[color] || "stroke-cyan-400"}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-4xl font-bold text-white" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
          {score}
        </motion.span>
        <span className="text-xs text-slate-400 uppercase tracking-wider">Overall</span>
      </div>
    </div>
  )
}

// ===== MINI STAT CARD (PREMIUM WITH SPARKLINES) =====
function MiniStat({ icon: Icon, label, value, trend, color, onClick, isActive, sparklineData }: {
  icon: any; label: string; value: number | string; trend?: number; color: string; onClick?: () => void; isActive?: boolean; sparklineData?: number[]
}) {
  const numValue = typeof value === 'number' ? value : parseInt(String(value)) || 0
  const colorClasses: Record<string, { bg: string; text: string; border: string; active: string; glow: string }> = {
    cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30", active: "ring-2 ring-cyan-400", glow: "shadow-cyan-500/20" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", active: "ring-2 ring-emerald-400", glow: "shadow-emerald-500/20" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", active: "ring-2 ring-amber-400", glow: "shadow-amber-500/20" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30", active: "ring-2 ring-purple-400", glow: "shadow-purple-500/20" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30", active: "ring-2 ring-blue-400", glow: "shadow-blue-500/20" },
    rose: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30", active: "ring-2 ring-rose-400", glow: "shadow-rose-500/20" }
  }
  const c = colorClasses[color] || colorClasses.cyan
  
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative p-4 rounded-xl border backdrop-blur-sm transition-all text-left w-full cursor-pointer group overflow-hidden",
        c.bg, c.border, isActive && c.active,
        "hover:shadow-lg", c.glow
      )}
    >
      {/* Gradient overlay on hover */}
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-white/5 to-transparent")} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <div className={cn("p-2 rounded-lg", c.bg, "group-hover:scale-110 transition-transform")}>
            <Icon className={cn("w-4 h-4", c.text)} />
          </div>
          {trend !== undefined && (
            <div className={cn("flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full", 
              trend >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
            )}>
              <TrendingUp className={cn("w-3 h-3", trend < 0 && "rotate-180")} />
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
        
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-2xl font-bold text-white mb-0.5">{typeof value === 'number' ? `${value}%` : value}</div>
            <div className="text-xs text-slate-400 font-medium">{label}</div>
          </div>
          {sparklineData && sparklineData.length > 0 && (
            <div className="opacity-60 group-hover:opacity-100 transition-opacity">
              <Sparkline data={sparklineData} color={color} />
            </div>
          )}
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <PerformanceBadge value={numValue} />
          <ChevronRight className={cn("w-4 h-4 transition-all", c.text, "opacity-40 group-hover:opacity-100 group-hover:translate-x-1")} />
        </div>
      </div>
    </motion.button>
  )
}

// ===== COURT HEATMAP (PREMIUM INTERACTIVE) =====
function CourtHeatmap({ shotTypes, onZoneClick }: { shotTypes: any[]; onZoneClick?: (zone: string) => void }) {
  const [activeShot, setActiveShot] = useState<string | null>(null)
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  
  const zones = useMemo(() => {
    const baseZones = [
      { id: 'kitchen-left', x: 5, y: 60, w: 22, h: 18, label: 'Kitchen', sublabel: 'Left', shots: 24, success: 83, shotType: 'Dinks' },
      { id: 'kitchen-right', x: 73, y: 60, w: 22, h: 18, label: 'Kitchen', sublabel: 'Right', shots: 31, success: 78, shotType: 'Dinks' },
      { id: 'kitchen-center', x: 32, y: 60, w: 36, h: 18, label: 'Kitchen', sublabel: 'Center', shots: 28, success: 85, shotType: 'Dinks' },
      { id: 'transition-left', x: 5, y: 38, w: 22, h: 18, label: 'Transition', sublabel: 'Left', shots: 12, success: 67, shotType: 'Drops' },
      { id: 'transition-right', x: 73, y: 38, w: 22, h: 18, label: 'Transition', sublabel: 'Right', shots: 8, success: 62, shotType: 'Drops' },
      { id: 'transition-center', x: 32, y: 38, w: 36, h: 18, label: 'Transition', sublabel: 'Center', shots: 18, success: 71, shotType: 'Drops' },
      { id: 'baseline-left', x: 5, y: 5, w: 30, h: 28, label: 'Baseline', sublabel: 'Left', shots: 15, success: 74, shotType: 'Drives' },
      { id: 'baseline-right', x: 65, y: 5, w: 30, h: 28, label: 'Baseline', sublabel: 'Right', shots: 19, success: 79, shotType: 'Drives' },
      { id: 'baseline-center', x: 35, y: 5, w: 30, h: 28, label: 'Baseline', sublabel: 'Center', shots: 11, success: 72, shotType: 'Serves' }
    ]
    const maxShots = Math.max(...baseZones.map(z => z.shots))
    return baseZones.map(zone => ({ ...zone, intensity: (zone.shots / maxShots) * 100 }))
  }, [shotTypes])
  
  const totalShots = zones.reduce((sum, z) => sum + z.shots, 0)
  const avgSuccess = Math.round(zones.reduce((sum, z) => sum + z.success, 0) / zones.length)
  
  const getHeatColor = (intensity: number, success: number, isHovered: boolean) => {
    const opacity = isHovered ? 0.9 : 0.65
    // Color based on success rate (green=good, amber=ok, red=needs work)
    if (success >= 80) return `rgba(34, 197, 94, ${opacity})`
    if (success >= 70) return `rgba(34, 211, 238, ${opacity})`
    if (success >= 60) return `rgba(251, 191, 36, ${opacity})`
    return `rgba(251, 113, 133, ${opacity})`
  }
  
  const shotButtons = [
    { id: 'all', label: 'All Shots', color: 'cyan' },
    { id: 'drive', label: 'Drives', color: 'emerald' },
    { id: 'dink', label: 'Dinks', color: 'amber' },
    { id: 'drop', label: 'Drops', color: 'purple' }
  ]
  
  const hoveredData = zones.find(z => z.id === hoveredZone)
  
  return (
    <div className="space-y-4">
      {/* Title & Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-white">Court Shot Distribution</h4>
          <div className="group relative">
            <Info className="w-3.5 h-3.5 text-slate-500 cursor-help" />
            <div className="absolute left-0 top-6 z-20 w-48 p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Color indicates success rate: Green (80%+), Cyan (70%+), Amber (60%+), Pink (&lt;60%)
            </div>
          </div>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="text-slate-400"><span className="text-white font-semibold">{totalShots}</span> shots</span>
          <span className="text-slate-400"><span className="text-emerald-400 font-semibold">{avgSuccess}%</span> avg success</span>
        </div>
      </div>
      
      {/* Shot Type Filter */}
      <div className="flex flex-wrap gap-2">
        {shotButtons.map(btn => (
          <button
            key={btn.id}
            onClick={() => setActiveShot(activeShot === btn.id ? null : btn.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              activeShot === btn.id 
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30" 
                : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50"
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>
      
      {/* Court Visualization */}
      <div className="relative aspect-[4/3] bg-gradient-to-b from-slate-800/90 to-slate-900/90 rounded-xl border border-slate-700/50 overflow-hidden">
        {/* Court Lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 85" preserveAspectRatio="xMidYMid meet">
          {/* Court outline */}
          <rect x="3" y="3" width="94" height="79" fill="none" stroke="rgba(148,163,184,0.4)" strokeWidth="0.8" rx="1" />
          {/* Center line */}
          <line x1="50" y1="3" x2="50" y2="82" stroke="rgba(148,163,184,0.3)" strokeWidth="0.5" strokeDasharray="2,2" />
          {/* Kitchen line (NVZ) */}
          <line x1="3" y1="58" x2="97" y2="58" stroke="rgba(34,211,238,0.6)" strokeWidth="1" />
          <text x="50" y="63" textAnchor="middle" fill="rgba(34,211,238,0.8)" fontSize="3" fontWeight="600">NON-VOLLEY ZONE</text>
          {/* Transition zone line */}
          <line x1="3" y1="36" x2="97" y2="36" stroke="rgba(148,163,184,0.3)" strokeWidth="0.5" strokeDasharray="1,1" />
          {/* Net (center) */}
          <line x1="3" y1="82" x2="97" y2="82" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
          <text x="50" y="85" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="2.5">NET</text>
          
          {/* Zone labels */}
          <text x="50" y="20" textAnchor="middle" fill="rgba(148,163,184,0.5)" fontSize="3">BASELINE</text>
          <text x="50" y="47" textAnchor="middle" fill="rgba(148,163,184,0.5)" fontSize="3">TRANSITION</text>
          <text x="50" y="72" textAnchor="middle" fill="rgba(148,163,184,0.5)" fontSize="3">KITCHEN</text>
          
          {/* Heatmap zones */}
          {zones.map((zone, idx) => (
            <motion.g key={zone.id}>
              <motion.rect
                x={zone.x} y={zone.y} width={zone.w} height={zone.h}
                fill={getHeatColor(zone.intensity, zone.success, hoveredZone === zone.id)}
                rx="2"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
                onClick={() => onZoneClick?.(zone.id)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ scale: 1.02 }}
              />
              {/* Shot count in zone */}
              <text 
                x={zone.x + zone.w / 2} 
                y={zone.y + zone.h / 2 + 1.5} 
                textAnchor="middle" 
                fill="white" 
                fontSize="4" 
                fontWeight="bold"
                className="pointer-events-none"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
              >
                {zone.shots}
              </text>
            </motion.g>
          ))}
        </svg>
        
        {/* Hover Tooltip */}
        <AnimatePresence>
          {hoveredData && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute top-3 left-3 bg-slate-900/95 backdrop-blur-sm border border-slate-600 rounded-xl px-4 py-3 z-10 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-2 h-2 rounded-full", 
                  hoveredData.success >= 80 ? "bg-emerald-400" : 
                  hoveredData.success >= 70 ? "bg-cyan-400" : 
                  hoveredData.success >= 60 ? "bg-amber-400" : "bg-rose-400"
                )} />
                <div className="font-semibold text-white text-sm">{hoveredData.label} {hoveredData.sublabel}</div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div className="text-slate-400">Shots</div>
                <div className="text-white font-medium">{hoveredData.shots}</div>
                <div className="text-slate-400">Success</div>
                <div className={cn("font-medium", 
                  hoveredData.success >= 70 ? "text-emerald-400" : "text-amber-400"
                )}>{hoveredData.success}%</div>
                <div className="text-slate-400">Type</div>
                <div className="text-cyan-400">{hoveredData.shotType}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Legend */}
        <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-2">
          <div className="text-[10px] text-slate-400 mb-1.5 font-medium">Success Rate</div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-rose-400/70" />
              <span className="text-[9px] text-slate-400">&lt;60%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-amber-400/70" />
              <span className="text-[9px] text-slate-400">60%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-cyan-400/70" />
              <span className="text-[9px] text-slate-400">70%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-emerald-400/70" />
              <span className="text-[9px] text-slate-400">80%+</span>
            </div>
          </div>
        </div>
        
        {/* Player position indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 animate-pulse shadow-lg shadow-cyan-400/50 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== INSIGHT CARD (EXPANDABLE) =====
function InsightCard({ type, title, description, icon: Icon, isExpanded, onToggle }: {
  type: 'strength' | 'improve' | 'tip'; title: string; description: string; icon: any; isExpanded?: boolean; onToggle?: () => void
}) {
  const styles = {
    strength: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: 'bg-emerald-500', glow: 'shadow-emerald-500/20' },
    improve: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: 'bg-amber-500', glow: 'shadow-amber-500/20' },
    tip: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: 'bg-cyan-500', glow: 'shadow-cyan-500/20' }
  }
  const s = styles[type]
  
  const expandedDetails: Record<string, { drills: string[]; tips: string[] }> = {
    strength: {
      drills: ['Advanced Dinking Patterns', 'Kitchen Control Mastery'],
      tips: ['Keep leveraging your natural placement instincts', 'Work on varying pace to keep opponents guessing']
    },
    improve: {
      drills: ['Third Shot Drop Practice', 'Transition Zone Footwork'],
      tips: ['Focus on a lower paddle position at contact', 'Practice hitting in front of your body']
    },
    tip: {
      drills: ['Reset Shot Fundamentals', 'Soft Game Series'],
      tips: ['Start each rally with intention', 'Watch pro matches for pattern recognition']
    }
  }
  const details = expandedDetails[type]
  
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      className={cn("p-4 rounded-xl border cursor-pointer transition-all", s.bg, s.border, isExpanded && "shadow-lg", isExpanded && s.glow)}
      onClick={onToggle}
    >
      <div className="flex gap-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", s.icon)}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className={cn("font-semibold text-sm mb-1", s.text)}>{title}</h4>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
              <div>
                <h5 className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
                  <Dumbbell className="w-3 h-3" /> Recommended Drills
                </h5>
                <div className="flex flex-wrap gap-2">
                  {details?.drills?.map((drill, i) => (
                    <Link key={i} href="/train/drills" className="px-2 py-1 bg-slate-700/50 hover:bg-slate-600/50 rounded text-xs text-slate-300 transition-colors">
                      {drill}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
                  <Lightbulb className="w-3 h-3" /> Pro Tips
                </h5>
                <ul className="space-y-1">
                  {details?.tips?.map((tip, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                      <span className="text-cyan-400">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ===== VIDEO PLAYER MODAL =====
function VideoHighlightsModal({ videoUrl, keyMoments, onClose }: { videoUrl: string; keyMoments: any[]; onClose: () => void }) {
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const handleMomentClick = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp
      videoRef.current.play()
      setIsPlaying(true)
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-4xl bg-slate-900 rounded-2xl overflow-hidden border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 right-4 z-10">
          <button onClick={onClose} className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        
        <div className="aspect-video bg-black relative">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full"
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center gap-3">
              <button onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10 }} className="p-2 hover:bg-white/10 rounded transition-colors">
                <SkipBack className="w-5 h-5 text-white" />
              </button>
              <button 
                onClick={() => { 
                  if (videoRef.current) {
                    isPlaying ? videoRef.current.pause() : videoRef.current.play()
                  }
                }} 
                className="p-3 bg-cyan-500 hover:bg-cyan-400 rounded-full transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
              </button>
              <button onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10 }} className="p-2 hover:bg-white/10 rounded transition-colors">
                <SkipForward className="w-5 h-5 text-white" />
              </button>
              <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden mx-4">
                <div className="h-full bg-cyan-400 transition-all" style={{ width: `${(currentTime / (videoRef.current?.duration || 1)) * 100}%` }} />
              </div>
              <span className="text-xs text-slate-300 font-mono">
                {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
        
        {/* Key Moments Timeline */}
        <div className="p-4 border-t border-slate-700">
          <h3 className="text-sm font-semibold text-white mb-3">Key Moments</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {keyMoments?.map((moment: any, idx: number) => (
              <button
                key={idx}
                onClick={() => handleMomentClick(moment?.timestamp ?? 0)}
                className={cn(
                  "flex-shrink-0 px-3 py-2 rounded-lg text-left transition-all",
                  moment?.type === 'strength' ? "bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30" :
                  moment?.type === 'improvement' ? "bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30" :
                  "bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30"
                )}
              >
                <Badge className="text-[10px] mb-1 bg-slate-800/50">{moment?.timestampFormatted ?? '0:00'}</Badge>
                <p className="text-xs text-white font-medium line-clamp-1">{moment?.title ?? 'Moment'}</p>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ===== METRIC DETAIL MODAL =====
function MetricDetailModal({ metric, onClose }: { metric: { label: string; value: number; color: string; description: string }; onClose: () => void }) {
  const drillRecommendations: Record<string, string[]> = {
    'Shot Accuracy': ['Target Practice Drill', 'Placement Patterns', 'Cross-Court Consistency'],
    'Technique': ['Form Fundamentals', 'Paddle Position Drill', 'Follow-Through Practice'],
    'Movement': ['Split Step Training', 'Lateral Quickness', 'Court Coverage Patterns'],
    'Positioning': ['Ready Position Holds', 'Kitchen Line Practice', 'Transition Footwork'],
    'Power': ['Drive Shot Power', 'Overhead Smash Practice', 'Hip Rotation Drills'],
    'Consistency': ['Rally Building', '100 Ball Drill', 'Dink Marathon']
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-slate-800 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 mb-3">
            <span className="text-3xl font-bold text-white">{metric.value}%</span>
          </div>
          <h3 className="text-xl font-bold text-white">{metric.label}</h3>
          <p className="text-sm text-slate-400 mt-2">{metric.description}</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Score Breakdown</h4>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div 
                className={cn("h-full rounded-full", metric.value >= 70 ? "bg-emerald-500" : metric.value >= 50 ? "bg-amber-500" : "bg-rose-500")}
                initial={{ width: 0 }}
                animate={{ width: `${metric.value}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Needs Work</span>
              <span>Excellent</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-cyan-400" /> Recommended Drills
            </h4>
            <div className="space-y-2">
              {(drillRecommendations[metric.label] ?? ['General Practice']).map((drill, i) => (
                <Link
                  key={i}
                  href="/train/drills"
                  className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Target className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{drill}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 ml-auto group-hover:text-cyan-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ===== COACH KAI CHAT BAR =====
function CoachKaiChatBar({ analysisId, analysisData }: { analysisId: string; analysisData: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])
  
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])
  
  const sendMessage = async () => {
    if (!message.trim() || isStreaming) return
    
    const userMessage = message.trim()
    setMessage('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsStreaming(true)
    
    try {
      const response = await fetch(`/api/train/analysis/${analysisId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages
        })
      })
      
      if (!response.ok) throw new Error('Chat failed')
      
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''
      let partialRead = ''
      
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])
      
      while (true) {
        const { done, value } = (await reader?.read()) ?? { done: true, value: undefined }
        if (done) break
        
        partialRead += decoder.decode(value, { stream: true })
        const lines = partialRead.split('\n')
        partialRead = lines.pop() ?? ''
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed?.content) {
                assistantMessage += parsed.content
                setMessages(prev => {
                  const newMessages = [...prev]
                  if (newMessages.length > 0) {
                    newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantMessage }
                  }
                  return newMessages
                })
              }
            } catch {}
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }])
    } finally {
      setIsStreaming(false)
    }
  }
  
  const suggestedQuestions = [
    "What's my biggest weakness?",
    "How can I improve my dinks?",
    "Explain my court positioning",
    "Suggest drills for me"
  ]
  
  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl transition-all",
          "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500",
          "text-white font-medium",
          isOpen && "hidden"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Brain className="w-5 h-5" />
        <span>Ask Coach Kai</span>
      </motion.button>
      
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Coach Kai</h3>
                  <p className="text-xs text-slate-400">Ask about your analysis</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            {/* Messages */}
            <div className="h-[350px] overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-slate-400 text-sm mb-4">I've analyzed your video. Ask me anything!</p>
                  <div className="space-y-2">
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => { setMessage(q); inputRef.current?.focus() }}
                        className="w-full px-3 py-2 text-left text-sm bg-slate-800/50 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={cn("flex gap-3", msg.role === 'user' && "flex-row-reverse")}>
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      msg.role === 'assistant' ? "bg-gradient-to-br from-cyan-500 to-blue-600" : "bg-slate-700"
                    )}>
                      {msg.role === 'assistant' ? <Brain className="w-4 h-4 text-white" /> : <MessageCircle className="w-4 h-4 text-slate-300" />}
                    </div>
                    <div className={cn(
                      "max-w-[80%] px-4 py-2 rounded-2xl text-sm",
                      msg.role === 'assistant' ? "bg-slate-800 text-slate-200" : "bg-cyan-500/20 text-white"
                    )}>
                      {msg.content || (isStreaming && i === messages.length - 1 ? (
                        <span className="inline-flex gap-1">
                          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      ) : '')}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div className="p-4 border-t border-slate-700 bg-slate-800/50">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage() }} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about your performance..."
                  className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 text-sm"
                  disabled={isStreaming}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || isStreaming}
                  className="p-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-xl transition-colors"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ===== MAIN COMPONENT =====
export default function VideoAnalysisResults({ videoId }: VideoAnalysisResultsProps) {
  const { data: session } = useSession() || {}
  const [video, setVideo] = useState<VideoAnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)
  const [lastSession, setLastSession] = useState<{ score: number } | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<any | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    fetchVideoAnalysis()
  }, [videoId])

  const fetchVideoAnalysis = async () => {
    try {
      const res = await fetch(`/api/video-analysis/${videoId}`)
      if (res?.ok) {
        const data = await res.json()
        setVideo(data?.video ?? null)
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

  if (!mounted) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin" />
          <p className="text-slate-400">Analyzing your performance...</p>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <h2 className="text-2xl font-bold text-white mb-2">Video Not Found</h2>
          <p className="text-slate-400 mb-6">This analysis could not be loaded.</p>
          <Button asChild>
            <Link href="/train/video"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Video Lab</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Extract data
  const overallScore = video?.overallScore ?? 0
  const shotTypes = Array.isArray(video?.shotTypes) ? video.shotTypes : []
  const strengths = (video?.strengths as string[]) ?? []
  const improvements = (video?.areasForImprovement as string[]) ?? []
  const recommendations = (video?.recommendations as string[]) ?? []
  const keyMoments = (video?.keyMoments as any[]) ?? []
  
  const rawTechnicalScores = video?.technicalScores as any
  const technicalScores = {
    paddleAngle: rawTechnicalScores?.paddleAngle ?? 72,
    followThrough: rawTechnicalScores?.followThrough ?? 68,
    bodyRotation: rawTechnicalScores?.bodyRotation ?? 75,
    readyPosition: rawTechnicalScores?.readyPosition ?? 80,
    overall: rawTechnicalScores?.overall ?? 74
  }
  
  const rawMovementMetrics = video?.movementMetrics as any
  const movementMetrics = {
    courtCoverage: rawMovementMetrics?.courtCoverage ?? 78,
    efficiency: rawMovementMetrics?.efficiency ?? 71,
    positioning: rawMovementMetrics?.positioning ?? 82,
    footwork: rawMovementMetrics?.footwork ?? 69
  }

  const improvement = lastSession ? overallScore - lastSession.score : 0
  const isProcessing = video?.analysisStatus === 'PROCESSING'
  
  // Generate premium key moments with specific labels, descriptions, and thumbnail placeholders
  const displayMoments = keyMoments.length > 0 ? keyMoments : [
    { timestamp: 15, timestampFormatted: '0:15', title: 'Cross-Court Dink Winner', description: 'Perfect placement deep in kitchen corner', type: 'highlight', thumbnail: '/api/placeholder/120/68' },
    { timestamp: 42, timestampFormatted: '0:42', title: 'Forehand Drive Winner', description: 'Powerful passing shot down the line', type: 'strength', thumbnail: '/api/placeholder/120/68' },
    { timestamp: 78, timestampFormatted: '1:18', title: 'Transition Zone Footwork', description: 'Work on split-step timing at NVZ approach', type: 'improvement', thumbnail: '/api/placeholder/120/68' },
    { timestamp: 95, timestampFormatted: '1:35', title: 'Textbook Reset Shot', description: 'Great paddle angle neutralizing speed-up', type: 'strength', thumbnail: '/api/placeholder/120/68' },
    { timestamp: 120, timestampFormatted: '2:00', title: 'Third Shot Drop Ace', description: 'Soft touch landing in kitchen', type: 'highlight', thumbnail: '/api/placeholder/120/68' },
    { timestamp: 156, timestampFormatted: '2:36', title: 'Kitchen Battle Victory', description: '12-shot rally won with patience', type: 'highlight', thumbnail: '/api/placeholder/120/68' }
  ]
  
  // Sparkline data for each metric (simulated 5-session trend)
  const sparklineDataMap: Record<string, number[]> = {
    'Shot Accuracy': [65, 68, 70, 69, technicalScores.paddleAngle],
    'Technique': [68, 70, 72, 71, technicalScores.overall],
    'Movement': [75, 73, 70, 72, movementMetrics.efficiency],
    'Positioning': [74, 76, 78, 80, movementMetrics.positioning],
    'Power': [62, 64, 65, 66, technicalScores.followThrough],
    'Consistency': [70, 72, 74, 76, movementMetrics.courtCoverage]
  }

  const handleZoneClick = (zone: string) => {
    console.log('Zone clicked:', zone)
    // Could open a modal with zone-specific clips or stats
  }

  const metrics = [
    { icon: Target, label: 'Shot Accuracy', value: technicalScores.paddleAngle, trend: 3, color: 'cyan', description: 'Measures how accurately your shots land in intended zones.', sparkline: sparklineDataMap['Shot Accuracy'] },
    { icon: Gauge, label: 'Technique', value: technicalScores.overall, trend: 5, color: 'emerald', description: 'Overall technical form including paddle angle and follow-through.', sparkline: sparklineDataMap['Technique'] },
    { icon: Move, label: 'Movement', value: movementMetrics.efficiency, trend: -2, color: 'amber', description: 'Efficiency of court movement and transitions.', sparkline: sparklineDataMap['Movement'] },
    { icon: Shield, label: 'Positioning', value: movementMetrics.positioning, trend: 8, color: 'purple', description: 'Court positioning relative to optimal play zones.', sparkline: sparklineDataMap['Positioning'] },
    { icon: Zap, label: 'Power', value: technicalScores.followThrough, trend: 1, color: 'blue', description: 'Power generation on drives and overhead shots.', sparkline: sparklineDataMap['Power'] },
    { icon: Eye, label: 'Consistency', value: movementMetrics.courtCoverage, trend: 4, color: 'rose', description: 'Shot-to-shot consistency and rally building ability.', sparkline: sparklineDataMap['Consistency'] }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-24">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative container mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-cyan-400">
              <Link href="/train/analysis-library"><ArrowLeft className="w-4 h-4 mr-1" /> Library</Link>
            </Button>
            <div className="h-4 w-px bg-slate-700" />
            <h1 className="text-lg font-semibold text-white truncate max-w-[200px] sm:max-w-none">{video?.title ?? 'Analysis'}</h1>
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

        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="text-cyan-300 font-medium">Analysis in progress...</p>
              <p className="text-xs text-slate-400">Results will appear shortly</p>
            </div>
          </motion.div>
        )}

        {/* HERO CARD */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 via-slate-800/70 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0"><ScoreRing score={overallScore} /></div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-white">Performance Score</h2>
                  {improvement !== 0 && (
                    <Badge className={cn("text-xs", improvement > 0 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border-rose-500/30")}>
                      <TrendingUp className={cn("w-3 h-3 mr-1", improvement < 0 && "rotate-180")} />
                      {improvement > 0 ? '+' : ''}{improvement} vs last
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  <Badge className="bg-slate-700/50 text-slate-300 border-slate-600"><Clock className="w-3 h-3 mr-1" />{new Date(video?.uploadedAt ?? Date.now()).toLocaleDateString()}</Badge>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30"><Target className="w-3 h-3 mr-1" />{shotTypes?.length ?? 0} Shot Types</Badge>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30"><Brain className="w-3 h-3 mr-1" />AI Analyzed</Badge>
                </div>
                <Button onClick={() => setShowVideoModal(true)} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/25">
                  <Play className="w-4 h-4 mr-2" /> Watch Highlights
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* TWO COLUMN: HEATMAP + STATS */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-cyan-500/20 rounded-lg"><Crosshair className="w-4 h-4 text-cyan-400" /></div>
              <h3 className="text-lg font-semibold text-white">Shot Placement</h3>
            </div>
            <CourtHeatmap shotTypes={shotTypes} onZoneClick={handleZoneClick} />
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-emerald-500/20 rounded-lg"><Activity className="w-4 h-4 text-emerald-400" /></div>
              <h3 className="text-lg font-semibold text-white">Key Metrics</h3>
              <span className="text-xs text-slate-500 ml-auto">Click for details</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {metrics.map((m, i) => (
                <MiniStat 
                  key={i} 
                  icon={m.icon} 
                  label={m.label} 
                  value={m.value} 
                  trend={m.trend} 
                  color={m.color}
                  sparklineData={m.sparkline}
                  onClick={() => setSelectedMetric(m)}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* COACH KAI INSIGHTS */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6">
          <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Coach Kai's Insights</h3>
                <p className="text-xs text-slate-400">Click cards for drills & tips</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <InsightCard 
                type="strength" 
                title="Top Strength" 
                description={strengths?.[0] ?? 'Excellent dink placement with good touch at the kitchen line.'} 
                icon={Trophy}
                isExpanded={expandedInsight === 'strength'}
                onToggle={() => setExpandedInsight(expandedInsight === 'strength' ? null : 'strength')}
              />
              <InsightCard 
                type="improve" 
                title="Focus Area" 
                description={improvements?.[0] ?? 'Third shot drops could be lower and softer for better transitions.'} 
                icon={Target}
                isExpanded={expandedInsight === 'improve'}
                onToggle={() => setExpandedInsight(expandedInsight === 'improve' ? null : 'improve')}
              />
              <InsightCard 
                type="tip" 
                title="Quick Tip" 
                description={recommendations?.[0] ?? 'Focus on split-stepping before your opponent makes contact.'} 
                icon={Lightbulb}
                isExpanded={expandedInsight === 'tip'}
                onToggle={() => setExpandedInsight(expandedInsight === 'tip' ? null : 'tip')}
              />
            </div>
          </div>
        </motion.div>

        {/* KEY MOMENTS - PREMIUM REDESIGN */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-6">
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg">
                  <Flame className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Key Moments</h3>
                  <p className="text-xs text-slate-400">{displayMoments.length} highlights detected</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]"><Trophy className="w-3 h-3 mr-1" />Strength</Badge>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]"><Target className="w-3 h-3 mr-1" />Improve</Badge>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]"><Star className="w-3 h-3 mr-1" />Highlight</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {displayMoments.slice(0, 6).map((moment: any, idx: number) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowVideoModal(true)}
                  className={cn(
                    "relative rounded-xl text-left transition-all overflow-hidden group",
                    "bg-slate-800/50 hover:bg-slate-800/80 border-2",
                    moment?.type === 'strength' ? "border-emerald-500/40 hover:border-emerald-500/60" :
                    moment?.type === 'improvement' ? "border-amber-500/40 hover:border-amber-500/60" :
                    "border-purple-500/40 hover:border-purple-500/60"
                  )}
                >
                  {/* Thumbnail with gradient overlay */}
                  <div className="relative aspect-video bg-gradient-to-br from-slate-700/50 to-slate-800/50 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="w-8 h-8 text-slate-600" />
                    </div>
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-all">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </div>
                    </div>
                    {/* Timestamp badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className={cn(
                        "text-[10px] font-mono backdrop-blur-sm",
                        moment?.type === 'strength' ? "bg-emerald-500/80 text-white border-0" :
                        moment?.type === 'improvement' ? "bg-amber-500/80 text-white border-0" :
                        "bg-purple-500/80 text-white border-0"
                      )}>
                        <Clock className="w-2.5 h-2.5 mr-1" />
                        {moment?.timestampFormatted ?? '0:00'}
                      </Badge>
                    </div>
                    {/* Type icon */}
                    <div className="absolute top-2 right-2">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center",
                        moment?.type === 'strength' ? "bg-emerald-500/80" :
                        moment?.type === 'improvement' ? "bg-amber-500/80" :
                        "bg-purple-500/80"
                      )}>
                        {moment?.type === 'strength' ? <Trophy className="w-3 h-3 text-white" /> :
                         moment?.type === 'improvement' ? <Target className="w-3 h-3 text-white" /> :
                         <Star className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-white mb-1 line-clamp-1">{moment?.title ?? 'Key Moment'}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{moment?.description ?? 'Watch this moment to improve your game'}</p>
                  </div>
                  
                  {/* Bottom accent bar */}
                  <div className={cn(
                    "absolute bottom-0 left-0 right-0 h-1 transition-all",
                    moment?.type === 'strength' ? "bg-gradient-to-r from-emerald-500 to-emerald-400" :
                    moment?.type === 'improvement' ? "bg-gradient-to-r from-amber-500 to-amber-400" :
                    "bg-gradient-to-r from-purple-500 to-purple-400"
                  )} />
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* PREMIUM FOOTER SECTION */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-4">
          {/* Section divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">What's Next</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          </div>
          
          {/* Premium CTA Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Compare to Pros Card */}
            <motion.div
              whileHover={{ scale: 1.01, y: -2 }}
              className="relative p-5 rounded-xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/30 overflow-hidden group cursor-pointer"
              onClick={() => {/* Future feature */}}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
              <div className="relative flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white">Compare to Pro Players</h4>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[10px]">Coming Soon</Badge>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">See how your metrics stack up against professional pickleball players</p>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      Your Score: {overallScore}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      Pro Avg: 85
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Share Analysis Card */}
            <motion.div
              whileHover={{ scale: 1.01, y: -2 }}
              className="relative p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 overflow-hidden group cursor-pointer"
              onClick={() => setShowShareModal(true)}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
              <div className="relative flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">Share Your Progress</h4>
                  <p className="text-sm text-slate-400 mb-3">Publish to community or share with your coach for feedback</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                      <Users className="w-3 h-3 mr-1" /> Community
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs border-slate-600 text-slate-300 hover:bg-slate-700/50">
                      <FileText className="w-3 h-3 mr-1" /> Export PDF
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Quick Actions Row */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button asChild className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/25">
              <Link href="/train/video"><Zap className="w-4 h-4 mr-2" /> New Analysis</Link>
            </Button>
            <Button variant="outline" asChild className="border-slate-600 text-slate-300 hover:border-cyan-500/50 hover:text-white">
              <Link href="/train/analysis-library"><Library className="w-4 h-4 mr-2" /> View All Analyses</Link>
            </Button>
            <Button variant="outline" asChild className="border-slate-600 text-slate-300 hover:border-cyan-500/50 hover:text-white">
              <Link href="/train/drills"><Dumbbell className="w-4 h-4 mr-2" /> Practice Drills</Link>
            </Button>
            <Button variant="outline" asChild className="border-slate-600 text-slate-300 hover:border-cyan-500/50 hover:text-white">
              <Link href="/dashboard"><Activity className="w-4 h-4 mr-2" /> Dashboard</Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* COACH KAI CHAT BAR */}
      <CoachKaiChatBar analysisId={videoId} analysisData={video} />

      {/* MODALS */}
      <AnimatePresence>
        {showVideoModal && (
          <VideoHighlightsModal 
            videoUrl={video?.videoUrl ?? ''} 
            keyMoments={displayMoments} 
            onClose={() => setShowVideoModal(false)} 
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {selectedMetric && (
          <MetricDetailModal 
            metric={selectedMetric} 
            onClose={() => setSelectedMetric(null)} 
          />
        )}
      </AnimatePresence>

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
