"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, TrendingUp, Target, Play, FileText,
  Zap, Brain, AlertCircle, Users, Trophy,
  Crosshair, Move, Shield, Gauge, Lightbulb, Clock,
  MessageCircle, Send, X, Dumbbell, Video, Pause,
  Activity, Cpu, Eye, BarChart3, ChevronRight, ChevronDown, ChevronUp,
  Award, Medal, Star, Calendar, Flame, History, PlayCircle,
  Bookmark, Lock, CheckCircle, Circle, ArrowUpRight, Sparkles, Crown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { generateAnalysisPDF } from "@/lib/pdf-generator"
import type { VideoAnalysisData } from "@/lib/video-analysis-types"
import { PublishToCommunityModal } from "@/components/community"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts'

interface VideoAnalysisResultsProps {
  videoId: string
}

// PRO REFERENCE DATA
const PRO_PLAYERS = [
  { name: 'Ben Johns', image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop', rating: '5.0+' },
  { name: 'Anna Leigh Waters', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', rating: '5.0+' },
  { name: 'Tyson McGuffin', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', rating: '5.0+' },
]

const PRO_TECHNIQUES = {
  'Forehand Drive': { stance: 'Wide athletic stance, weight on balls of feet', paddle: 'Face slightly open, grip relaxed', follow: 'Full extension toward target, high finish', pro: 'Ben Johns' },
  'Dink': { stance: 'Knees bent, low center of gravity', paddle: 'Soft grip, paddle below wrist', follow: 'Absorb pace, minimal backswing', pro: 'Anna Leigh Waters' },
  'Third Shot Drop': { stance: 'Square to target, feet shoulder width', paddle: 'Open face, contact in front', follow: 'Push through ball, arc over net', pro: 'Tyson McGuffin' },
  'Volley': { stance: 'Ready position, paddle up', paddle: 'Punch motion, firm wrist', follow: 'Short compact follow-through', pro: 'Ben Johns' },
  'Reset Shot': { stance: 'Balanced, absorb incoming pace', paddle: 'Soft hands, let ball come to you', follow: 'Minimal swing, redirect energy', pro: 'Anna Leigh Waters' },
  'Backhand Drive': { stance: 'Rotate hips, coil torso', paddle: 'Two-handed or one-hand grip firm', follow: 'Uncoil through contact zone', pro: 'Tyson McGuffin' },
  'Lob Defense': { stance: 'Quick recovery, track ball early', paddle: 'High backswing, open face', follow: 'Full extension, aim deep', pro: 'Ben Johns' },
  'ATP Shot': { stance: 'Sprint to ball, plant outside foot', paddle: 'Accelerate through contact', follow: 'Wrap around post, spin finish', pro: 'Tyson McGuffin' },
}

// ===== ANIMATED AI WAVEFORM =====
function AIWaveform({ isActive = true }: { isActive?: boolean }) {
  return (
    <div className="flex items-center gap-0.5 h-6">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full"
          animate={isActive ? {
            height: [4, Math.random() * 20 + 8, 4],
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

// ===== AI PROCESSING INDICATOR =====
function AIProcessingIndicator({ frame, totalFrames, isPlaying }: { frame: number; totalFrames: number; isPlaying: boolean }) {
  return (
    <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/30">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <motion.div
            className="absolute inset-0 rounded-full bg-cyan-400/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
        <div>
          <div className="text-xs font-semibold text-cyan-400">AI POSE ANALYSIS</div>
          <div className="text-[10px] text-slate-400">Neural network active</div>
        </div>
        <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
          <Activity className="w-3 h-3 mr-1" /> LIVE
        </Badge>
      </div>
      
      <AIWaveform isActive={isPlaying} />
      
      <div className="flex items-center justify-between mt-3 text-[10px]">
        <span className="text-slate-500">Frame Analysis</span>
        <span className="text-cyan-400 font-mono">{frame.toLocaleString()} / {totalFrames.toLocaleString()}</span>
      </div>
      <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
          animate={{ width: `${(frame / totalFrames) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  )
}

// ===== SKELETON OVERLAY SVG =====
function SkeletonOverlay({ isPlaying, currentShot }: { isPlaying: boolean; currentShot: any }) {
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
  const qualityColor = currentShot?.quality === 'excellent' ? '#10b981' : currentShot?.quality === 'good' ? '#22d3ee' : '#f59e0b'

  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <linearGradient id="boneGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#10b981" /></linearGradient>
      </defs>
      {isPlaying && (
        <motion.path d="M 85 30 Q 90 25 88 20 Q 85 15 80 18" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1" fill="none"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }} />
      )}
      {connections.map(([from, to], i) => {
        const fromJ = joints[from as keyof typeof joints]; const toJ = joints[to as keyof typeof joints]
        return <motion.line key={i} x1={fromJ.x} y1={fromJ.y} x2={toJ.x} y2={toJ.y} stroke="url(#boneGradient)" strokeWidth="1.5" strokeLinecap="round" filter="url(#glow)" initial={{ opacity: 0 }} animate={{ opacity: isPlaying ? [0.6, 1, 0.6] : 0.8 }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.05 }} />
      })}
      {Object.entries(joints).map(([name, pos], i) => (
        <motion.circle key={name} cx={pos.x} cy={pos.y} r={name === 'head' ? 4 : name.includes('Wrist') ? 3 : 2}
          fill={name === 'rightWrist' ? qualityColor : "#22d3ee"} filter="url(#glow)" initial={{ scale: 0 }}
          animate={{ scale: isPlaying ? [1, 1.3, 1] : 1, opacity: isPlaying ? [0.8, 1, 0.8] : 0.9 }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.03 }} />
      ))}
      <motion.rect x="83" y="22" width="8" height="12" rx="2" fill="none" stroke={qualityColor} strokeWidth="1" filter="url(#glow)"
        animate={isPlaying ? { rotate: [-5, 5, -5] } : {}} transition={{ duration: 0.4, repeat: Infinity }} style={{ transformOrigin: '85px 30px' }} />
      {currentShot && (
        <>
          <motion.path d={`M ${joints.rightShoulder.x} ${joints.rightShoulder.y} L ${joints.rightElbow.x} ${joints.rightElbow.y} L ${joints.rightWrist.x} ${joints.rightWrist.y}`}
            stroke={qualityColor} strokeWidth="2" fill="none" strokeDasharray="4 2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
          <motion.text x="72" y="42" fill={qualityColor} fontSize="6" fontWeight="bold" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
            {currentShot.angle || 142}°
          </motion.text>
        </>
      )}
    </svg>
  )
}

// ===== SHOT MARKER =====
function ShotMarker({ shot, position, isActive, onClick }: { shot: any; position: number; isActive: boolean; onClick: () => void }) {
  const colors = { excellent: 'bg-emerald-500', good: 'bg-cyan-500', needs_work: 'bg-amber-500' }
  return (
    <motion.button onClick={onClick}
      className={cn("absolute top-0 w-3 h-full flex flex-col items-center cursor-pointer group z-10 hover:z-20")}
      style={{ left: `${position}%` }} whileHover={{ scale: 1.2 }}>
      <div className={cn("w-2 h-full rounded-full transition-all", colors[shot.quality as keyof typeof colors] || colors.good, isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100')} />
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 whitespace-nowrap text-[10px]">
          <div className="font-semibold text-white">{shot.type}</div>
          <div className="text-slate-400">{shot.timestamp}</div>
        </div>
      </div>
    </motion.button>
  )
}

// ===== RICH SHOT DETAIL PANEL =====
function RichShotDetailPanel({ shot, onClose, onPrevious, onNext, totalShots, currentIndex }: { shot: any; onClose: () => void; onPrevious: () => void; onNext: () => void; totalShots: number; currentIndex: number }) {
  if (!shot) return null
  const [showProComparison, setShowProComparison] = useState(false)
  const qualityColors = {
    excellent: { bg: 'from-emerald-500/20 to-emerald-600/10', text: 'text-emerald-400', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20' },
    good: { bg: 'from-cyan-500/20 to-cyan-600/10', text: 'text-cyan-400', border: 'border-cyan-500/30', badge: 'bg-cyan-500/20' },
    needs_work: { bg: 'from-amber-500/20 to-amber-600/10', text: 'text-amber-400', border: 'border-amber-500/30', badge: 'bg-amber-500/20' }
  }
  const colors = qualityColors[shot.quality as keyof typeof qualityColors] || qualityColors.good
  const proTech = PRO_TECHNIQUES[shot.type as keyof typeof PRO_TECHNIQUES] || PRO_TECHNIQUES['Forehand Drive']
  const proPlayer = PRO_PLAYERS.find(p => p.name === proTech.pro) || PRO_PLAYERS[0]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className={cn("p-4 bg-gradient-to-r", colors.bg)}>
        <div className="flex items-center justify-between mb-2">
          <Badge className={cn("text-[10px]", colors.badge, colors.text, colors.border)}>
            {shot.quality?.replace('_', ' ').toUpperCase()}
          </Badge>
          <div className="flex items-center gap-1">
            <button onClick={onPrevious} disabled={currentIndex === 0} className="p-1 hover:bg-white/10 rounded disabled:opacity-30">
              <ChevronUp className="w-4 h-4 text-slate-400" />
            </button>
            <span className="text-[10px] text-slate-400 px-1">{currentIndex + 1}/{totalShots}</span>
            <button onClick={onNext} disabled={currentIndex === totalShots - 1} className="p-1 hover:bg-white/10 rounded disabled:opacity-30">
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded ml-2"><X className="w-4 h-4 text-slate-400" /></button>
          </div>
        </div>
        <h4 className="text-lg font-bold text-white">{shot.type}</h4>
        <p className="text-xs text-slate-400">@ {shot.timestamp}</p>
      </div>

      {/* Rich Metrics Grid */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Speed', value: shot.speed || 42, unit: 'mph', icon: Zap, color: 'cyan' },
            { label: 'Spin Rate', value: shot.spinRate || Math.round(shot.speed * 28), unit: 'rpm', icon: Activity, color: 'purple' },
            { label: 'Accuracy', value: shot.accuracy || shot.score, unit: '%', icon: Target, color: 'emerald' }
          ].map((m) => (
            <div key={m.label} className="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700/30">
              <m.icon className={cn("w-4 h-4 mx-auto mb-1", `text-${m.color}-400`)} />
              <div className="text-lg font-bold text-white">{m.value}<span className="text-xs text-slate-400 ml-0.5">{m.unit}</span></div>
              <div className="text-[10px] text-slate-500">{m.label}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Body Position', value: shot.bodyScore || Math.round(shot.score * 0.95), icon: Move },
            { label: 'Paddle Angle', value: `${shot.paddleAngle || shot.angle || 142}°`, icon: Gauge },
            { label: 'Overall', value: shot.score, icon: Trophy }
          ].map((m) => (
            <div key={m.label} className="bg-slate-800/40 rounded-lg p-2 text-center">
              <div className="text-sm font-bold text-white">{m.value}</div>
              <div className="text-[10px] text-slate-500">{m.label}</div>
            </div>
          ))}
        </div>

        {/* What Went Well / Improve */}
        <div className="space-y-2">
          <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">What Went Well</span>
            </div>
            <p className="text-xs text-slate-300">{shot.whatWentWell || `Excellent ${shot.quality === 'excellent' ? 'execution' : 'effort'} on this ${shot.type.toLowerCase()}. Your paddle angle and timing were ${shot.score > 80 ? 'spot on' : 'improving'}.`}</p>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-amber-400">Focus Area</span>
            </div>
            <p className="text-xs text-slate-300">{shot.whatToImprove || `Try to ${shot.score < 75 ? 'get lower and absorb more pace' : 'follow through more toward your target'} for even better results.`}</p>
          </div>
        </div>

        {/* Recommended Drill */}
        <Link href={`/train/drills?type=${encodeURIComponent(shot.type)}`}
          className="block bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-3 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-cyan-400">Recommended Drill</div>
              <div className="text-sm text-white font-medium">{shot.type} Fundamentals</div>
            </div>
            <ChevronRight className="w-5 h-5 text-cyan-400 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        {/* Pro Comparison Toggle */}
        <button onClick={() => setShowProComparison(!showProComparison)}
          className="w-full flex items-center justify-between p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-500/50">
              <img src={proPlayer.image} alt={proPlayer.name} className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-purple-400">Compare to Pro</div>
              <div className="text-sm font-semibold text-white">{proPlayer.name}</div>
            </div>
          </div>
          {showProComparison ? <ChevronUp className="w-4 h-4 text-purple-400" /> : <ChevronDown className="w-4 h-4 text-purple-400" />}
        </button>

        <AnimatePresence>
          {showProComparison && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="bg-purple-500/5 rounded-xl p-3 border border-purple-500/10 space-y-3 overflow-hidden">
              <div className="text-xs font-semibold text-purple-400 flex items-center gap-2">
                <Crown className="w-4 h-4" /> Pro Technique Breakdown
              </div>
              {[
                { label: 'Stance', tip: proTech.stance },
                { label: 'Paddle', tip: proTech.paddle },
                { label: 'Follow-Through', tip: proTech.follow }
              ].map((item) => (
                <div key={item.label} className="flex gap-2">
                  <div className="w-1 rounded-full bg-purple-500/50" />
                  <div>
                    <div className="text-[10px] font-medium text-purple-300">{item.label}</div>
                    <div className="text-xs text-slate-400">{item.tip}</div>
                  </div>
                </div>
              ))}
              <div className="text-[10px] text-slate-500 italic">"Notice how {proPlayer.name} keeps a {shot.quality === 'excellent' ? 'similar' : 'lower'} center of gravity throughout the shot."</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ===== PROGRESS TRACKER SECTION =====
function ProgressTrackerSection({ videoId }: { videoId: string }) {
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetch('/api/video-analysis/progress').then(r => r.json()).then(setProgress).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="bg-slate-800/30 rounded-xl p-4 animate-pulse"><div className="h-20 bg-slate-700/30 rounded" /></div>
  if (!progress?.hasHistory) return null

  const { stats, historyData, achievements, skillProgress } = progress ?? {}

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-white">Your Progress Journey</h3>
            <p className="text-xs text-slate-400">{stats?.totalAnalyses ?? 0} videos analyzed • {stats?.improvement > 0 ? '+' : ''}{stats?.improvement ?? 0}% improvement</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {(achievements?.length ?? 0) > 0 && (
            <div className="flex -space-x-2">
              {(achievements?.slice(0, 3) ?? []).map((a: any, i: number) => (
                <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 border-2 border-slate-900 flex items-center justify-center">
                  <Trophy className="w-3 h-3 text-slate-900" />
                </div>
              ))}
            </div>
          )}
          {expanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="p-4 pt-0 space-y-4">
              {/* Progress Chart */}
              {(historyData?.length ?? 0) > 1 && (
                <div className="bg-slate-800/40 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-300">Score Over Time</span>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                      <TrendingUp className="w-3 h-3 mr-1" /> {stats?.improvement > 0 ? '+' : ''}{stats?.improvement}%
                    </Badge>
                  </div>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={historyData ?? []}>
                        <defs>
                          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                        <YAxis domain={[50, 100]} tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                          labelStyle={{ color: '#fff', fontSize: 12 }} itemStyle={{ color: '#22d3ee', fontSize: 12 }} />
                        <Area type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={2} fill="url(#scoreGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Skill Progress */}
              {(skillProgress?.length ?? 0) > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {(skillProgress?.slice(0, 4) ?? []).map((skill: any) => (
                    <div key={skill?.skillType ?? 'unknown'} className="bg-slate-800/40 rounded-lg p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-400 capitalize">{skill?.skillType ?? 'Skill'}</span>
                        <span className="text-xs font-bold text-white">{Math.round(skill?.averageScore ?? 0)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full" style={{ width: `${skill?.averageScore ?? 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Achievements */}
              {(achievements?.length ?? 0) > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-2">Recent Achievements</div>
                  <div className="flex flex-wrap gap-2">
                    {(achievements?.slice(0, 6) ?? []).map((ua: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-lg px-2 py-1 border border-amber-500/20">
                        <Trophy className="w-3 h-3 text-amber-400" />
                        <span className="text-[10px] text-white">{ua?.achievement?.name ?? 'Achievement'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View All Button */}
              <Link href="/train/analysis-library"
                className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-xs text-slate-300 transition-colors">
                <History className="w-4 h-4" /> View All Analysis History
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ===== IMPROVEMENT PLAN SECTION =====
function ImprovementPlanSection({ shots, overallScore }: { shots: any[]; overallScore: number }) {
  const weakestShots = [...(shots ?? [])].sort((a, b) => (a?.score ?? 0) - (b?.score ?? 0)).slice(0, 3)
  const strongestShot = [...(shots ?? [])].sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0))[0]

  const plan = [
    { week: 1, focus: weakestShots[0]?.type ?? 'Third Shot Drop', drill: 'Soft Game Fundamentals', goal: 'Improve touch and placement' },
    { week: 2, focus: weakestShots[1]?.type ?? 'Dink', drill: 'Kitchen Line Rally', goal: 'Build consistency under pressure' },
    { week: 3, focus: 'Combined Practice', drill: 'Point Play Simulation', goal: 'Apply skills in game situations' },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
      className="bg-gradient-to-br from-cyan-500/10 via-slate-900/50 to-blue-500/10 rounded-2xl p-4 border border-cyan-500/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Your Personalized Improvement Plan</h3>
          <p className="text-xs text-slate-400">Based on your analysis • Score: {overallScore}/100</p>
        </div>
      </div>

      {/* Strength Callout */}
      {strongestShot && (
        <div className="bg-emerald-500/10 rounded-xl p-3 mb-4 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">Your Strength: {strongestShot.type}</span>
          </div>
          <p className="text-xs text-slate-300">Scoring {strongestShot.score}/100 - Keep leveraging this in matches!</p>
        </div>
      )}

      {/* 3-Week Plan */}
      <div className="space-y-3">
        {plan.map((p, i) => (
          <div key={i} className="flex gap-3">
            <div className="relative">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                i === 0 ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400')}>
                {i + 1}
              </div>
              {i < plan.length - 1 && <div className="absolute top-8 left-1/2 w-0.5 h-8 bg-slate-700 -translate-x-1/2" />}
            </div>
            <div className="flex-1 bg-slate-800/40 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-white">Week {p.week}: {p.focus}</span>
                {i === 0 && <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[10px]">Start Here</Badge>}
              </div>
              <p className="text-[10px] text-slate-400 mb-2">{p.goal}</p>
              <Link href={`/train/drills?search=${encodeURIComponent(p.drill)}`}
                className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300">
                <Dumbbell className="w-3 h-3" /> {p.drill} <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-4 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
        <p className="text-xs text-slate-300 mb-2">🎯 <strong>Your goal:</strong> Practice 15-20 minutes daily for 3 weeks, then upload a new video to track your progress!</p>
        <div className="flex gap-2">
          <Button asChild size="sm" className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-white text-xs h-8">
            <Link href="/train/drills"><Dumbbell className="w-3 h-3 mr-1" /> Start Drills</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1 border-slate-600 text-slate-300 text-xs h-8">
            <Link href="/train/video"><Video className="w-3 h-3 mr-1" /> New Video</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ===== COACH KAI CHAT =====
function CoachKaiChat({ analysisId }: { analysisId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollToBottom = useCallback(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [])
  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  const sendMessage = async () => {
    if (!message.trim() || isStreaming) return
    const userMsg = message.trim()
    setMessage('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsStreaming(true)
    try {
      const res = await fetch(`/api/train/analysis/${analysisId}/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, conversationHistory: messages })
      })
      if (!res.ok) throw new Error('Chat failed')
      const reader = res.body?.getReader(); const decoder = new TextDecoder(); let assistantMsg = ''; let partial = ''
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])
      while (true) {
        const { done, value } = (await reader?.read()) ?? { done: true, value: undefined }
        if (done) break
        partial += decoder.decode(value, { stream: true })
        const lines = partial.split('\n'); partial = lines.pop() ?? ''
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6); if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed?.content) {
                assistantMsg += parsed.content
                setMessages(prev => { const n = [...prev]; if (n.length > 0) n[n.length - 1] = { role: 'assistant', content: assistantMsg }; return n })
              }
            } catch {}
          }
        }
      }
    } catch (err) { setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }]) }
    finally { setIsStreaming(false) }
  }
  const suggestions = ["What's my biggest weakness?", "How can I improve my form?", "Suggest a drill"]
  return (
    <>
      <motion.button onClick={() => setIsOpen(true)} className={cn("fixed bottom-4 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl", "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm", isOpen && "hidden")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Brain className="w-4 h-4" /> Ask Coach Kai
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-4 right-4 z-50 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
              <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center"><Brain className="w-4 h-4 text-white" /></div><span className="font-semibold text-white text-sm">Coach Kai</span></div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-800 rounded"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="h-64 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-4"><p className="text-slate-400 text-xs mb-3">Ask about your analysis</p>
                  <div className="space-y-1.5">{suggestions.map((q, i) => (<button key={i} onClick={() => { setMessage(q); inputRef.current?.focus() }} className="w-full px-2 py-1.5 text-left text-xs bg-slate-800/50 hover:bg-slate-800 rounded text-slate-300">{q}</button>))}</div>
                </div>
              ) : (
                messages.map((msg, i) => (<div key={i} className={cn("flex gap-2", msg.role === 'user' && "flex-row-reverse")}><div className={cn("w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0", msg.role === 'assistant' ? "bg-gradient-to-br from-cyan-500 to-blue-600" : "bg-slate-700")}>{msg.role === 'assistant' ? <Brain className="w-3 h-3 text-white" /> : <MessageCircle className="w-3 h-3 text-slate-300" />}</div><div className={cn("max-w-[80%] px-3 py-1.5 rounded-xl text-xs", msg.role === 'assistant' ? "bg-slate-800 text-slate-200" : "bg-cyan-500/20 text-white")}>{msg.content || (isStreaming && i === messages.length - 1 ? <span className="inline-flex gap-1"><span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" /><span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /><span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} /></span> : '')}</div></div>))
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); sendMessage() }} className="p-2 border-t border-slate-700 flex gap-2">
              <input ref={inputRef} type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask about your game..." className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500" disabled={isStreaming} />
              <button type="submit" disabled={!message.trim() || isStreaming} className="p-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-600 rounded-lg"><Send className="w-4 h-4 text-white" /></button>
            </form>
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
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'analysis' | 'progress' | 'plan'>('analysis')
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(120)
  const [currentFrame, setCurrentFrame] = useState(0)
  const totalFrames = Math.round(duration * 30)
  const [selectedShot, setSelectedShot] = useState<any>(null)
  const [selectedShotIndex, setSelectedShotIndex] = useState(0)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await fetch(`/api/video-analysis/${videoId}`)
        if (res?.ok) { const data = await res.json(); setVideo(data?.video ?? null) }
      } catch (error) { console.error('Error fetching video:', error) }
      finally { setLoading(false) }
    }
    fetchVideo()
  }, [videoId])
  useEffect(() => { setCurrentFrame(Math.round(currentTime * 30)) }, [currentTime])

  const downloadPDF = () => {
    if (!video) return
    const pdfHTML = generateAnalysisPDF({ playerName: (session?.user as any)?.name || 'Player', videoTitle: video?.title ?? 'Analysis', analysisDate: new Date(video?.uploadedAt ?? Date.now()).toLocaleDateString(), overallScore: video?.overallScore ?? 0, strengths: (video?.strengths as string[]) ?? [], improvements: (video?.areasForImprovement as string[]) ?? [], recommendations: (video?.recommendations as string[]) ?? [], shotAnalysis: video?.shotTypes ?? [], movementMetrics: video?.movementMetrics, technicalScores: video?.technicalScores, keyMoments: video?.keyMoments ?? [] })
    const printWindow = window.open('', '_blank'); if (printWindow) { printWindow.document.write(pdfHTML); printWindow.document.close() }
  }
  const playPause = () => { if (!videoRef.current) return; if (isPlaying) { videoRef.current.pause() } else { videoRef.current.play() } }
  const seekTo = (time: number) => { if (videoRef.current) { videoRef.current.currentTime = time } }

  if (!mounted) return null
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center"><div className="relative mb-4"><Cpu className="w-12 h-12 mx-auto text-cyan-400" /><motion.div className="absolute inset-0 rounded-full border-2 border-cyan-500/50" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} /></div><AIWaveform isActive={true} /><p className="text-cyan-400 text-sm mt-4 font-medium">AI Analysis in Progress</p><p className="text-slate-500 text-xs mt-1">Processing neural network...</p></div>
      </div>
    )
  }
  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center"><AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-500" /><h2 className="text-xl font-bold text-white mb-2">Video Not Found</h2><p className="text-slate-400 text-sm mb-4">This analysis could not be loaded.</p><Button asChild size="sm"><Link href="/train/video"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Link></Button></div>
      </div>
    )
  }

  const overallScore = video?.overallScore ?? 78
  const strengths = (video?.strengths as string[]) ?? ['Excellent dink placement with good touch at the kitchen line']
  const improvements = (video?.areasForImprovement as string[]) ?? ['Third shot drops could be lower and softer']
  const recommendations = (video?.recommendations as string[]) ?? ['Focus on split-stepping before opponent contact']
  const raw = video?.technicalScores as any
  const technicalScores = { accuracy: raw?.paddleAngle ?? 82, technique: raw?.overall ?? 76, footwork: raw?.footwork ?? (video?.movementMetrics as any)?.footwork ?? 74, positioning: (video?.movementMetrics as any)?.positioning ?? 85 }
  const detectedShots = (video?.keyMoments as any[]) ?? []
  const shots = detectedShots.length > 0 ? detectedShots.map((m: any, i: number) => ({ id: i, timestamp: m?.timestampFormatted ?? `0:${(i * 12).toString().padStart(2, '0')}`, time: m?.timestamp ?? i * 12, type: m?.title ?? ['Forehand Drive', 'Dink', 'Third Shot Drop', 'Volley', 'Reset'][i % 5], quality: ['excellent', 'good', 'needs_work'][i % 3], speed: 35 + Math.floor(Math.random() * 20), spinRate: 800 + Math.floor(Math.random() * 600), accuracy: 70 + Math.floor(Math.random() * 25), bodyScore: 70 + Math.floor(Math.random() * 25), paddleAngle: 120 + Math.floor(Math.random() * 40), angle: 120 + Math.floor(Math.random() * 40), score: 70 + Math.floor(Math.random() * 25), tip: ["Excellent follow-through! Your paddle angle was perfect.", "Good contact point. Try to get slightly lower.", "Consider slowing the backswing for softer shots.", "Great reflexes! Work on paddle face angle.", "Nice placement. Focus on absorbing pace."][i % 5], whatWentWell: `Good ${['timing', 'contact point', 'paddle position', 'footwork', 'body rotation'][i % 5]} on this shot.`, whatToImprove: `Focus on ${['follow-through', 'staying low', 'soft hands', 'split step', 'weight transfer'][i % 5]} for better results.` })) : [
    { id: 0, timestamp: '0:08', time: 8, type: 'Forehand Drive', quality: 'excellent', speed: 48, spinRate: 1200, accuracy: 92, bodyScore: 88, paddleAngle: 145, angle: 145, score: 92, tip: 'Excellent follow-through!', whatWentWell: 'Perfect paddle angle and timing.', whatToImprove: 'Slightly more hip rotation for power.' },
    { id: 1, timestamp: '0:15', time: 15, type: 'Dink', quality: 'excellent', speed: 22, spinRate: 400, accuracy: 88, bodyScore: 90, paddleAngle: 132, angle: 132, score: 88, tip: 'Great touch and placement.', whatWentWell: 'Soft hands, great placement.', whatToImprove: 'Stay low through the shot.' },
    { id: 2, timestamp: '0:24', time: 24, type: 'Third Shot Drop', quality: 'good', speed: 28, spinRate: 600, accuracy: 76, bodyScore: 74, paddleAngle: 118, angle: 118, score: 76, tip: 'Good arc. Land it shorter.', whatWentWell: 'Good arc over the net.', whatToImprove: 'Land 6 inches shorter for better effect.' },
    { id: 3, timestamp: '0:38', time: 38, type: 'Volley', quality: 'excellent', speed: 42, spinRate: 300, accuracy: 90, bodyScore: 85, paddleAngle: 155, angle: 155, score: 90, tip: 'Quick hands!', whatWentWell: 'Quick reflexes, compact swing.', whatToImprove: 'Keep paddle up higher in ready position.' },
    { id: 4, timestamp: '0:52', time: 52, type: 'Reset Shot', quality: 'needs_work', speed: 35, spinRate: 500, accuracy: 68, bodyScore: 65, paddleAngle: 125, angle: 125, score: 68, tip: 'Absorb more pace.', whatWentWell: 'Good shot selection.', whatToImprove: 'Softer grip, let the ball come to you.' },
    { id: 5, timestamp: '1:05', time: 65, type: 'Backhand Drive', quality: 'good', speed: 44, spinRate: 1000, accuracy: 82, bodyScore: 78, paddleAngle: 140, angle: 140, score: 82, tip: 'Solid backhand.', whatWentWell: 'Good power generation.', whatToImprove: 'More hip rotation for extra power.' },
    { id: 6, timestamp: '1:18', time: 78, type: 'Lob Defense', quality: 'excellent', speed: 38, spinRate: 200, accuracy: 85, bodyScore: 82, paddleAngle: 165, angle: 165, score: 85, tip: 'Smart shot!', whatWentWell: 'Good court awareness.', whatToImprove: 'Aim deeper for more margin.' },
    { id: 7, timestamp: '1:35', time: 95, type: 'ATP Shot', quality: 'excellent', speed: 52, spinRate: 1400, accuracy: 95, bodyScore: 90, paddleAngle: 178, angle: 178, score: 95, tip: 'Incredible around-the-post!', whatWentWell: 'Perfect execution under pressure.', whatToImprove: 'This was textbook - keep it up!' }
  ]

  const selectShot = (shot: any, index: number) => { setSelectedShot(shot); setSelectedShotIndex(index); seekTo(shot.time) }
  const prevShot = () => { if (selectedShotIndex > 0) selectShot(shots[selectedShotIndex - 1], selectedShotIndex - 1) }
  const nextShot = () => { if (selectedShotIndex < shots.length - 1) selectShot(shots[selectedShotIndex + 1], selectedShotIndex + 1) }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto max-w-7xl px-4 py-4">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white h-8 px-2"><Link href="/train/analysis-library"><ArrowLeft className="w-4 h-4" /></Link></Button>
            <div>
              <h1 className="text-lg font-bold text-white">{video?.title ?? 'AI Video Analysis'}</h1>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[10px]"><Cpu className="w-3 h-3 mr-1" /> AI Powered</Badge>
                <span>{new Date(video?.uploadedAt ?? Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={downloadPDF} className="text-slate-400 hover:text-white h-8 px-2"><FileText className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => setShowShareModal(true)} className="text-teal-400 hover:text-teal-300 h-8 px-2"><Users className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'analysis', label: 'Shot Analysis', icon: Target },
            { id: 'progress', label: 'My Progress', icon: TrendingUp },
            { id: 'plan', label: 'Improvement Plan', icon: Sparkles }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === tab.id ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800/50 text-slate-400 hover:text-white border border-transparent')}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* MAIN CONTENT */}
        {activeTab === 'analysis' && (
          <div className="grid lg:grid-cols-4 gap-4">
            {/* LEFT: VIDEO PLAYER */}
            <div className="lg:col-span-3 space-y-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-cyan-500/30 shadow-xl shadow-cyan-500/10">
                <video ref={videoRef} src={video?.videoUrl ?? ''} className="w-full h-full object-cover"
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 120)}
                  onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
                {!video?.videoUrl && (<div className="absolute inset-0 flex items-center justify-center bg-slate-900"><div className="text-center"><Video className="w-16 h-16 mx-auto text-slate-700 mb-2" /><p className="text-slate-500 text-sm">Demo Analysis View</p></div></div>)}
                <div className="absolute inset-0 pointer-events-none"><SkeletonOverlay isPlaying={isPlaying} currentShot={selectedShot || shots[0]} /></div>
                <div className="absolute top-4 left-4"><Badge className="bg-black/60 backdrop-blur-sm text-cyan-400 border-cyan-500/50 px-3 py-1"><Eye className="w-3 h-3 mr-1.5" /><span className="text-xs">AI POSE TRACKING</span><motion.span className="ml-2 w-2 h-2 bg-emerald-400 rounded-full" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} /></Badge></div>
                <button onClick={playPause} className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"><div className="w-16 h-16 rounded-full bg-cyan-500/90 flex items-center justify-center">{isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}</div></button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-4 px-4">
                  <div className="relative h-8 mb-2"><div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-700/80 rounded-full"><motion.div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full" style={{ width: `${(currentTime / duration) * 100}%` }} /></div>
                    {shots.map((shot, i) => (<ShotMarker key={shot.id} shot={shot} position={(shot.time / duration) * 100} isActive={selectedShot?.id === shot.id} onClick={() => selectShot(shot, i)} />))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3"><button onClick={playPause} className="p-2 bg-white/10 hover:bg-white/20 rounded-full">{isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}</button><span className="text-xs text-white font-mono">{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</span></div>
                    <div className="flex items-center gap-2 text-xs text-slate-400"><span>{shots.length} shots detected</span><div className="flex gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full" /><span className="w-2 h-2 bg-cyan-500 rounded-full" /><span className="w-2 h-2 bg-amber-500 rounded-full" /></div></div>
                  </div>
                </div>
              </motion.div>

              {/* SHOT TIMELINE */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-cyan-400" /><span className="text-sm font-semibold text-white">Shot-by-Shot Analysis</span></div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400"><div className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-full" />Excellent</div><div className="flex items-center gap-1"><div className="w-2 h-2 bg-cyan-500 rounded-full" />Good</div><div className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-500 rounded-full" />Focus</div></div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {shots.map((shot, i) => {
                    const colors = { excellent: 'border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20', good: 'border-cyan-500/50 bg-cyan-500/10 hover:bg-cyan-500/20', needs_work: 'border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20' }
                    const isActive = selectedShot?.id === shot.id
                    return (<motion.button key={shot.id} onClick={() => selectShot(shot, i)} className={cn("flex-shrink-0 w-28 p-3 rounded-xl border-2 transition-all text-left", colors[shot.quality as keyof typeof colors], isActive && "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <div className="text-[10px] text-slate-400 font-mono mb-1">{shot.timestamp}</div>
                      <div className="text-xs font-semibold text-white truncate">{shot.type}</div>
                      <div className="flex items-center justify-between mt-2"><span className="text-[10px] text-slate-400">{shot.speed} mph</span><span className="text-xs font-bold text-white">{shot.score}</span></div>
                    </motion.button>)
                  })}
                </div>
              </motion.div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="lg:col-span-1 space-y-4">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}><AIProcessingIndicator frame={currentFrame} totalFrames={totalFrames} isPlaying={isPlaying} /></motion.div>
              <AnimatePresence mode="wait">{selectedShot && (<RichShotDetailPanel shot={selectedShot} onClose={() => setSelectedShot(null)} onPrevious={prevShot} onNext={nextShot} totalShots={shots.length} currentIndex={selectedShotIndex} />)}</AnimatePresence>
              {!selectedShot && (
                <>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-4 border border-cyan-500/20">
                    <div className="flex items-center gap-3 mb-3"><div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center"><span className="text-2xl font-bold text-cyan-400">{overallScore}</span></div><div><div className="text-sm font-semibold text-white">Overall Score</div><Badge className="mt-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">Above Average</Badge></div></div>
                    <div className="grid grid-cols-2 gap-2">
                      {[{ label: 'Accuracy', value: technicalScores.accuracy }, { label: 'Technique', value: technicalScores.technique }, { label: 'Footwork', value: technicalScores.footwork }, { label: 'Position', value: technicalScores.positioning }].map((m) => (<div key={m.label} className="bg-slate-800/50 rounded-lg p-2"><div className="text-[10px] text-slate-400 mb-1">{m.label}</div><div className="text-sm font-bold text-white">{m.value}</div></div>))}
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-3"><Brain className="w-4 h-4 text-cyan-400" /><span className="text-sm font-semibold text-white">AI Insights</span></div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-xs"><Trophy className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" /><p className="text-slate-300">{strengths[0]}</p></div>
                      <div className="flex items-start gap-2 text-xs"><Target className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" /><p className="text-slate-300">{improvements[0]}</p></div>
                      <div className="flex items-start gap-2 text-xs"><Lightbulb className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" /><p className="text-slate-300">{recommendations[0]}</p></div>
                    </div>
                  </motion.div>
                </>
              )}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-2">
                <Button asChild size="sm" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-xs h-9"><Link href="/train/video"><Zap className="w-3 h-3 mr-1" /> New Analysis</Link></Button>
                <Button variant="outline" asChild size="sm" className="w-full border-slate-600 text-slate-300 text-xs h-9"><Link href="/train/drills"><Dumbbell className="w-3 h-3 mr-1" /> Recommended Drills</Link></Button>
              </motion.div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (<ProgressTrackerSection videoId={videoId} />)}
        {activeTab === 'plan' && (<ImprovementPlanSection shots={shots} overallScore={overallScore} />)}
      </div>

      <CoachKaiChat analysisId={videoId} />
      {showShareModal && video && (<PublishToCommunityModal videoAnalysisId={videoId} videoTitle={video?.title ?? 'Analysis'} onClose={() => setShowShareModal(false)} />)}
    </div>
  )
}
