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
  SkipBack, SkipForward
} from "lucide-react"
import { cn } from "@/lib/utils"
import { generateAnalysisPDF } from "@/lib/pdf-generator"
import type { VideoAnalysisData } from "@/lib/video-analysis-types"
import { PublishToCommunityModal } from "@/components/community"

interface VideoAnalysisResultsProps {
  videoId: string
}

// ===== SCORE DISPLAY (Letter Grade Style) =====
function ScoreGrade({ score, size = "lg" }: { score: number; size?: "sm" | "lg" }) {
  const getGrade = (s: number): { grade: string; color: string; bg: string } => {
    if (s >= 90) return { grade: "A+", color: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-600/10" }
    if (s >= 85) return { grade: "A", color: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-600/10" }
    if (s >= 80) return { grade: "A-", color: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-600/10" }
    if (s >= 77) return { grade: "B+", color: "text-cyan-400", bg: "from-cyan-500/20 to-cyan-600/10" }
    if (s >= 73) return { grade: "B", color: "text-cyan-400", bg: "from-cyan-500/20 to-cyan-600/10" }
    if (s >= 70) return { grade: "B-", color: "text-cyan-400", bg: "from-cyan-500/20 to-cyan-600/10" }
    if (s >= 67) return { grade: "C+", color: "text-amber-400", bg: "from-amber-500/20 to-amber-600/10" }
    if (s >= 63) return { grade: "C", color: "text-amber-400", bg: "from-amber-500/20 to-amber-600/10" }
    if (s >= 60) return { grade: "C-", color: "text-amber-400", bg: "from-amber-500/20 to-amber-600/10" }
    return { grade: "D", color: "text-rose-400", bg: "from-rose-500/20 to-rose-600/10" }
  }
  const { grade, color, bg } = getGrade(score)
  
  if (size === "sm") {
    return (
      <div className={cn("px-2 py-0.5 rounded-md bg-gradient-to-br text-xs font-bold", bg, color)}>
        {grade}
      </div>
    )
  }
  
  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn("w-28 h-28 rounded-2xl bg-gradient-to-br flex flex-col items-center justify-center", bg)}
    >
      <span className={cn("text-4xl font-bold", color)}>{grade}</span>
      <span className="text-xs text-slate-400 mt-1">{score}/100</span>
    </motion.div>
  )
}

// ===== SIMPLE COURT VISUALIZATION (No numbers, just visual heat) =====
function SimpleCourtViz() {
  return (
    <div className="relative w-full aspect-[4/3] max-w-[280px] mx-auto">
      <svg viewBox="0 0 100 75" className="w-full h-full">
        {/* Court background */}
        <rect x="5" y="5" width="90" height="65" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="0.5"/>
        
        {/* Kitchen zone (NVZ) - bottom */}
        <rect x="5" y="50" width="90" height="20" fill="rgba(34, 211, 238, 0.15)" rx="1"/>
        
        {/* Shot pattern dots - visual representation */}
        {/* Kitchen area - high activity (green dots) */}
        <circle cx="25" cy="58" r="3" fill="rgba(34, 197, 94, 0.7)"/>
        <circle cx="50" cy="55" r="4" fill="rgba(34, 197, 94, 0.8)"/>
        <circle cx="75" cy="60" r="3.5" fill="rgba(34, 197, 94, 0.7)"/>
        <circle cx="40" cy="62" r="2.5" fill="rgba(34, 197, 94, 0.6)"/>
        <circle cx="65" cy="57" r="2" fill="rgba(34, 197, 94, 0.5)"/>
        
        {/* Transition zone - medium activity (cyan dots) */}
        <circle cx="30" cy="38" r="2.5" fill="rgba(34, 211, 238, 0.6)"/>
        <circle cx="55" cy="42" r="2" fill="rgba(34, 211, 238, 0.5)"/>
        <circle cx="70" cy="35" r="2" fill="rgba(34, 211, 238, 0.5)"/>
        
        {/* Baseline - some activity (amber dots for areas to improve) */}
        <circle cx="25" cy="20" r="2" fill="rgba(251, 191, 36, 0.6)"/>
        <circle cx="75" cy="18" r="2.5" fill="rgba(251, 191, 36, 0.5)"/>
        <circle cx="50" cy="15" r="1.5" fill="rgba(251, 191, 36, 0.4)"/>
        
        {/* Court lines */}
        <line x1="50" y1="5" x2="50" y2="70" stroke="#475569" strokeWidth="0.3" strokeDasharray="2,2"/>
        <line x1="5" y1="50" x2="95" y2="50" stroke="#22d3ee" strokeWidth="0.8"/>
        <line x1="5" y1="70" x2="95" y2="70" stroke="#fff" strokeWidth="1" opacity="0.6"/>
        
        {/* Labels */}
        <text x="50" y="74" textAnchor="middle" fill="#94a3b8" fontSize="3">NET</text>
      </svg>
      
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2 text-[10px] text-slate-400">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500/70"/>
          <span>Strong</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-cyan-500/60"/>
          <span>Good</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500/60"/>
          <span>Focus</span>
        </div>
      </div>
    </div>
  )
}

// ===== METRIC CARD (Score out of 10) =====
function MetricCard({ icon: Icon, label, rawScore, color }: {
  icon: any; label: string; rawScore: number; color: string
}) {
  // Convert percentage to /10 score
  const score = Math.round((rawScore / 10)) / 1
  const displayScore = score.toFixed(1)
  
  const colorMap: Record<string, { icon: string; text: string; bar: string }> = {
    cyan: { icon: "bg-cyan-500/20 text-cyan-400", text: "text-cyan-400", bar: "bg-cyan-500" },
    emerald: { icon: "bg-emerald-500/20 text-emerald-400", text: "text-emerald-400", bar: "bg-emerald-500" },
    amber: { icon: "bg-amber-500/20 text-amber-400", text: "text-amber-400", bar: "bg-amber-500" },
    purple: { icon: "bg-purple-500/20 text-purple-400", text: "text-purple-400", bar: "bg-purple-500" }
  }
  const c = colorMap[color] ?? colorMap.cyan
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
      <div className={cn("p-2 rounded-lg", c.icon)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-400 truncate">{label}</div>
        <div className="flex items-baseline gap-1">
          <span className={cn("text-xl font-bold", c.text)}>{displayScore}</span>
          <span className="text-xs text-slate-500">/10</span>
        </div>
      </div>
      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${rawScore}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", c.bar)}
        />
      </div>
    </div>
  )
}

// ===== INSIGHT PILL =====
function InsightPill({ type, text }: { type: 'strength' | 'improve' | 'tip'; text: string }) {
  const styles = {
    strength: { bg: "bg-emerald-500/10 border-emerald-500/30", icon: Trophy, iconColor: "text-emerald-400", label: "Strength" },
    improve: { bg: "bg-amber-500/10 border-amber-500/30", icon: Target, iconColor: "text-amber-400", label: "Focus" },
    tip: { bg: "bg-cyan-500/10 border-cyan-500/30", icon: Lightbulb, iconColor: "text-cyan-400", label: "Tip" }
  }
  const s = styles[type]
  
  return (
    <div className={cn("p-3 rounded-xl border", s.bg)}>
      <div className="flex items-start gap-2">
        <s.icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", s.iconColor)} />
        <div>
          <div className={cn("text-xs font-semibold mb-0.5", s.iconColor)}>{s.label}</div>
          <p className="text-sm text-slate-300 leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  )
}

// ===== KEY MOMENT THUMBNAIL =====
function MomentThumb({ moment, onClick }: { moment: any; onClick: () => void }) {
  const typeColors = {
    strength: "border-emerald-500/50 bg-emerald-500/10",
    improvement: "border-amber-500/50 bg-amber-500/10",
    highlight: "border-purple-500/50 bg-purple-500/10"
  }
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-20 h-14 rounded-lg border-2 overflow-hidden flex-shrink-0 group transition-all hover:scale-105",
        typeColors[moment?.type as keyof typeof typeColors] ?? typeColors.highlight
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50">
        <Play className="w-4 h-4 text-white opacity-70 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
        <span className="text-[9px] text-white font-mono">{moment?.timestampFormatted ?? '0:00'}</span>
      </div>
    </button>
  )
}

// ===== VIDEO PLAYER MODAL =====
function VideoModal({ videoUrl, keyMoments, onClose }: { videoUrl: string; keyMoments: any[]; onClose: () => void }) {
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="relative w-full max-w-3xl bg-slate-900 rounded-2xl overflow-hidden border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full">
          <X className="w-5 h-5 text-white" />
        </button>
        
        <div className="aspect-video bg-black relative">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full"
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-3">
            <div className="flex items-center gap-2">
              <button onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10 }} className="p-1.5 hover:bg-white/10 rounded">
                <SkipBack className="w-4 h-4 text-white" />
              </button>
              <button 
                onClick={() => videoRef.current && (isPlaying ? videoRef.current.pause() : videoRef.current.play())}
                className="p-2 bg-cyan-500 hover:bg-cyan-400 rounded-full"
              >
                {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
              </button>
              <button onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10 }} className="p-1.5 hover:bg-white/10 rounded">
                <SkipForward className="w-4 h-4 text-white" />
              </button>
              <div className="flex-1 h-1 bg-slate-700 rounded-full mx-2">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${(currentTime / (videoRef.current?.duration || 1)) * 100}%` }} />
              </div>
              <span className="text-xs text-slate-300 font-mono">
                {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
        
        {keyMoments?.length > 0 && (
          <div className="p-3 border-t border-slate-700">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {keyMoments.slice(0, 6).map((m: any, i: number) => (
                <button
                  key={i}
                  onClick={() => { if (videoRef.current) { videoRef.current.currentTime = m?.timestamp ?? 0; videoRef.current.play() }}}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 whitespace-nowrap"
                >
                  {m?.timestampFormatted ?? '0:00'} - {m?.title?.slice(0, 20) ?? 'Moment'}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
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
  
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])
  
  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])
  
  const sendMessage = async () => {
    if (!message.trim() || isStreaming) return
    const userMsg = message.trim()
    setMessage('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsStreaming(true)
    
    try {
      const res = await fetch(`/api/train/analysis/${analysisId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, conversationHistory: messages })
      })
      
      if (!res.ok) throw new Error('Chat failed')
      
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMsg = ''
      let partial = ''
      
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])
      
      while (true) {
        const { done, value } = (await reader?.read()) ?? { done: true, value: undefined }
        if (done) break
        partial += decoder.decode(value, { stream: true })
        const lines = partial.split('\n')
        partial = lines.pop() ?? ''
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed?.content) {
                assistantMsg += parsed.content
                setMessages(prev => {
                  const newMsgs = [...prev]
                  if (newMsgs.length > 0) newMsgs[newMsgs.length - 1] = { role: 'assistant', content: assistantMsg }
                  return newMsgs
                })
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }])
    } finally {
      setIsStreaming(false)
    }
  }
  
  const suggestions = ["What's my biggest weakness?", "How can I improve?", "Suggest a drill for me"]
  
  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl",
          "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm",
          isOpen && "hidden"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Brain className="w-4 h-4" />
        Ask Coach Kai
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-white text-sm">Coach Kai</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-800 rounded">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            
            <div className="h-64 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-slate-400 text-xs mb-3">Ask me about your analysis!</p>
                  <div className="space-y-1.5">
                    {suggestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => { setMessage(q); inputRef.current?.focus() }}
                        className="w-full px-2 py-1.5 text-left text-xs bg-slate-800/50 hover:bg-slate-800 rounded text-slate-300"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={cn("flex gap-2", msg.role === 'user' && "flex-row-reverse")}>
                    <div className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0",
                      msg.role === 'assistant' ? "bg-gradient-to-br from-cyan-500 to-blue-600" : "bg-slate-700"
                    )}>
                      {msg.role === 'assistant' ? <Brain className="w-3 h-3 text-white" /> : <MessageCircle className="w-3 h-3 text-slate-300" />}
                    </div>
                    <div className={cn(
                      "max-w-[80%] px-3 py-1.5 rounded-xl text-xs",
                      msg.role === 'assistant' ? "bg-slate-800 text-slate-200" : "bg-cyan-500/20 text-white"
                    )}>
                      {msg.content || (isStreaming && i === messages.length - 1 ? (
                        <span className="inline-flex gap-1">
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      ) : '')}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); sendMessage() }} className="p-2 border-t border-slate-700 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about your game..."
                className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                disabled={isStreaming}
              />
              <button
                type="submit"
                disabled={!message.trim() || isStreaming}
                className="p-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-600 rounded-lg"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
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
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await fetch(`/api/video-analysis/${videoId}`)
        if (res?.ok) {
          const data = await res.json()
          setVideo(data?.video ?? null)
        }
      } catch (error) {
        console.error('Error fetching video:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchVideo()
  }, [videoId])

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
          <div className="w-12 h-12 mx-auto mb-3 rounded-full border-3 border-cyan-500/30 border-t-cyan-500 animate-spin" />
          <p className="text-slate-400 text-sm">Analyzing your performance...</p>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-500" />
          <h2 className="text-xl font-bold text-white mb-2">Video Not Found</h2>
          <p className="text-slate-400 text-sm mb-4">This analysis could not be loaded.</p>
          <Button asChild size="sm">
            <Link href="/train/video"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Extract and normalize data
  const overallScore = video?.overallScore ?? 75
  const strengths = (video?.strengths as string[]) ?? ['Excellent dink placement with good touch at the kitchen line']
  const improvements = (video?.areasForImprovement as string[]) ?? ['Third shot drops could be lower and softer']
  const recommendations = (video?.recommendations as string[]) ?? ['Focus on split-stepping before opponent contact']
  
  const raw = video?.technicalScores as any
  const technicalScores = {
    accuracy: raw?.paddleAngle ?? 78,
    technique: raw?.overall ?? 74,
    footwork: raw?.footwork ?? (video?.movementMetrics as any)?.footwork ?? 71,
    positioning: (video?.movementMetrics as any)?.positioning ?? 82
  }
  
  // Key moments
  const keyMoments = (video?.keyMoments as any[]) ?? [
    { timestamp: 15, timestampFormatted: '0:15', title: 'Cross-Court Dink Winner', type: 'highlight' },
    { timestamp: 42, timestampFormatted: '0:42', title: 'Forehand Drive', type: 'strength' },
    { timestamp: 78, timestampFormatted: '1:18', title: 'Transition Footwork', type: 'improvement' },
    { timestamp: 95, timestampFormatted: '1:35', title: 'Reset Shot', type: 'strength' },
    { timestamp: 120, timestampFormatted: '2:00', title: 'Third Shot Drop', type: 'highlight' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto max-w-5xl px-4 py-4">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white h-8 px-2">
              <Link href="/train/analysis-library"><ArrowLeft className="w-4 h-4" /></Link>
            </Button>
            <h1 className="text-base font-semibold text-white truncate">{video?.title ?? 'Analysis'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={downloadPDF} className="text-slate-400 hover:text-white h-8 px-2">
              <FileText className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowShareModal(true)} className="text-teal-400 hover:text-teal-300 h-8 px-2">
              <Users className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* MAIN GRID - Single screen layout */}
        <div className="grid lg:grid-cols-3 gap-4">
          
          {/* LEFT COLUMN: Video + Court */}
          <div className="lg:col-span-1 space-y-4">
            {/* Video Preview */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-video bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 cursor-pointer group"
              onClick={() => setShowVideoModal(true)}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Video className="w-10 h-10 text-slate-600" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-14 h-14 rounded-full bg-cyan-500/90 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex gap-1 overflow-hidden">
                {keyMoments.slice(0, 4).map((m: any, i: number) => (
                  <MomentThumb key={i} moment={m} onClick={() => setShowVideoModal(true)} />
                ))}
              </div>
            </motion.div>
            
            {/* Court Visualization */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50"
            >
              <div className="flex items-center gap-2 mb-3">
                <Crosshair className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-white">Shot Patterns</span>
              </div>
              <SimpleCourtViz />
            </motion.div>
          </div>

          {/* CENTER COLUMN: Score + Metrics */}
          <div className="lg:col-span-1 space-y-4">
            {/* Overall Score */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-5 border border-cyan-500/20 text-center"
            >
              <div className="flex items-center justify-center gap-4">
                <ScoreGrade score={overallScore} />
                <div className="text-left">
                  <h2 className="text-lg font-bold text-white mb-1">Performance</h2>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(video?.uploadedAt ?? Date.now()).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
            </motion.div>

            {/* Key Metrics */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-white">Key Metrics</span>
              </div>
              <MetricCard icon={Target} label="Shot Accuracy" rawScore={technicalScores.accuracy} color="cyan" />
              <MetricCard icon={Gauge} label="Technique" rawScore={technicalScores.technique} color="emerald" />
              <MetricCard icon={Move} label="Footwork" rawScore={technicalScores.footwork} color="amber" />
              <MetricCard icon={Shield} label="Positioning" rawScore={technicalScores.positioning} color="purple" />
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Coach Insights */}
          <div className="lg:col-span-1 space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-slate-700/50"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Coach Kai's Insights</h3>
                  <p className="text-[10px] text-slate-400">Personalized feedback</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <InsightPill type="strength" text={strengths?.[0] ?? 'Great dink placement and touch at the kitchen.'} />
                <InsightPill type="improve" text={improvements?.[0] ?? 'Third shot drops could be lower and softer.'} />
                <InsightPill type="tip" text={recommendations?.[0] ?? 'Split-step before your opponent makes contact.'} />
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-2"
            >
              <Button asChild size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-xs h-9">
                <Link href="/train/video"><Zap className="w-3 h-3 mr-1" /> New Analysis</Link>
              </Button>
              <Button variant="outline" asChild size="sm" className="border-slate-600 text-slate-300 text-xs h-9">
                <Link href="/train/drills"><Dumbbell className="w-3 h-3 mr-1" /> Drills</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Coach Kai Chat */}
      <CoachKaiChat analysisId={videoId} />

      {/* Video Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <VideoModal 
            videoUrl={video?.videoUrl ?? ''} 
            keyMoments={keyMoments} 
            onClose={() => setShowVideoModal(false)} 
          />
        )}
      </AnimatePresence>

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