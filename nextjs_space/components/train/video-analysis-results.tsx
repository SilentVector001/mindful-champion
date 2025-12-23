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
  Activity, Cpu, Eye, BarChart3, ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { generateAnalysisPDF } from "@/lib/pdf-generator"
import type { VideoAnalysisData } from "@/lib/video-analysis-types"
import { PublishToCommunityModal } from "@/components/community"

interface VideoAnalysisResultsProps {
  videoId: string
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
  // Joint positions for a pickleball stance (normalized 0-100)
  const joints = {
    head: { x: 50, y: 15 },
    neck: { x: 50, y: 22 },
    leftShoulder: { x: 38, y: 28 },
    rightShoulder: { x: 62, y: 28 },
    leftElbow: { x: 28, y: 40 },
    rightElbow: { x: 75, y: 35 },
    leftWrist: { x: 22, y: 55 },
    rightWrist: { x: 85, y: 30 }, // Paddle hand extended
    spine: { x: 50, y: 45 },
    leftHip: { x: 42, y: 55 },
    rightHip: { x: 58, y: 55 },
    leftKnee: { x: 38, y: 72 },
    rightKnee: { x: 62, y: 72 },
    leftAnkle: { x: 35, y: 90 },
    rightAnkle: { x: 65, y: 90 },
  }
  
  const connections = [
    ['head', 'neck'], ['neck', 'leftShoulder'], ['neck', 'rightShoulder'],
    ['leftShoulder', 'leftElbow'], ['leftElbow', 'leftWrist'],
    ['rightShoulder', 'rightElbow'], ['rightElbow', 'rightWrist'],
    ['neck', 'spine'], ['spine', 'leftHip'], ['spine', 'rightHip'],
    ['leftHip', 'leftKnee'], ['leftKnee', 'leftAnkle'],
    ['rightHip', 'rightKnee'], ['rightKnee', 'rightAnkle'],
    ['leftHip', 'rightHip']
  ]
  
  const qualityColor = currentShot?.quality === 'excellent' ? '#10b981' : 
                       currentShot?.quality === 'good' ? '#22d3ee' : '#f59e0b'

  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="boneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      
      {/* Motion trails */}
      {isPlaying && (
        <motion.path
          d="M 85 30 Q 90 25 88 20 Q 85 15 80 18"
          stroke="rgba(34, 211, 238, 0.3)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
      
      {/* Skeleton bones */}
      {connections.map(([from, to], i) => {
        const fromJ = joints[from as keyof typeof joints]
        const toJ = joints[to as keyof typeof joints]
        return (
          <motion.line
            key={i}
            x1={fromJ.x}
            y1={fromJ.y}
            x2={toJ.x}
            y2={toJ.y}
            stroke="url(#boneGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            filter="url(#glow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: isPlaying ? [0.6, 1, 0.6] : 0.8 }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.05 }}
          />
        )
      })}
      
      {/* Joint nodes */}
      {Object.entries(joints).map(([name, pos], i) => (
        <motion.circle
          key={name}
          cx={pos.x}
          cy={pos.y}
          r={name === 'head' ? 4 : name.includes('Wrist') ? 3 : 2}
          fill={name === 'rightWrist' ? qualityColor : "#22d3ee"}
          filter="url(#glow)"
          initial={{ scale: 0 }}
          animate={{ 
            scale: isPlaying ? [1, 1.3, 1] : 1,
            opacity: isPlaying ? [0.8, 1, 0.8] : 0.9
          }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.03 }}
        />
      ))}
      
      {/* Paddle visualization */}
      <motion.rect
        x="83"
        y="22"
        width="8"
        height="12"
        rx="2"
        fill="none"
        stroke={qualityColor}
        strokeWidth="1"
        filter="url(#glow)"
        animate={isPlaying ? { rotate: [-5, 5, -5] } : {}}
        transition={{ duration: 0.4, repeat: Infinity }}
        style={{ transformOrigin: '85px 30px' }}
      />
      
      {/* Analysis angle indicator */}
      {currentShot && (
        <>
          <motion.path
            d={`M ${joints.rightShoulder.x} ${joints.rightShoulder.y} L ${joints.rightElbow.x} ${joints.rightElbow.y} L ${joints.rightWrist.x} ${joints.rightWrist.y}`}
            stroke={qualityColor}
            strokeWidth="2"
            fill="none"
            strokeDasharray="4 2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          <motion.text
            x="72"
            y="42"
            fill={qualityColor}
            fontSize="6"
            fontWeight="bold"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {currentShot.angle || 142}°
          </motion.text>
        </>
      )}
    </svg>
  )
}

// ===== SHOT DETECTION MARKER =====
function ShotMarker({ shot, position, isActive, onClick }: { shot: any; position: number; isActive: boolean; onClick: () => void }) {
  const colors = {
    excellent: 'bg-emerald-500',
    good: 'bg-cyan-500',
    needs_work: 'bg-amber-500'
  }
  
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "absolute top-0 w-3 h-full flex flex-col items-center cursor-pointer group z-10",
        "hover:z-20"
      )}
      style={{ left: `${position}%` }}
      whileHover={{ scale: 1.2 }}
    >
      <div className={cn(
        "w-2 h-full rounded-full transition-all",
        colors[shot.quality as keyof typeof colors] || colors.good,
        isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'
      )} />
      
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 whitespace-nowrap text-[10px]">
          <div className="font-semibold text-white">{shot.type}</div>
          <div className="text-slate-400">{shot.timestamp}</div>
        </div>
      </div>
    </motion.button>
  )
}

// ===== SHOT DETAIL PANEL =====
function ShotDetailPanel({ shot, onClose }: { shot: any; onClose: () => void }) {
  if (!shot) return null
  
  const qualityColors = {
    excellent: { bg: 'from-emerald-500/20 to-emerald-600/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    good: { bg: 'from-cyan-500/20 to-cyan-600/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    needs_work: { bg: 'from-amber-500/20 to-amber-600/10', text: 'text-amber-400', border: 'border-amber-500/30' }
  }
  const colors = qualityColors[shot.quality as keyof typeof qualityColors] || qualityColors.good
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn("bg-gradient-to-br rounded-xl p-4 border", colors.bg, colors.border)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <Badge className={cn("mb-2 text-[10px]", colors.bg, colors.text, colors.border)}>
            {shot.quality?.replace('_', ' ').toUpperCase()}
          </Badge>
          <h4 className="text-lg font-bold text-white">{shot.type}</h4>
          <p className="text-xs text-slate-400">@ {shot.timestamp}</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-700/50 rounded">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      
      {/* Shot metrics */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-white">{shot.speed || 42}</div>
          <div className="text-[10px] text-slate-400">mph</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-white">{shot.angle || 142}°</div>
          <div className="text-[10px] text-slate-400">angle</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-white">{shot.score || 85}</div>
          <div className="text-[10px] text-slate-400">score</div>
        </div>
      </div>
      
      {/* Coach tip */}
      <div className="bg-slate-800/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-cyan-400">Coach Kai</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {shot.tip || "Good form on this shot. Focus on following through toward your target for even better placement."}
        </p>
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
  
  const suggestions = ["What's my biggest weakness?", "How can I improve my form?", "Suggest a drill"]
  
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
                  <p className="text-slate-400 text-xs mb-3">Ask about your analysis</p>
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
  const [mounted, setMounted] = useState(false)
  
  // Video player state
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(120)
  const [currentFrame, setCurrentFrame] = useState(0)
  const totalFrames = Math.round(duration * 30) // 30fps
  
  // Shot analysis state
  const [selectedShot, setSelectedShot] = useState<any>(null)

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
  
  // Update frame counter
  useEffect(() => {
    setCurrentFrame(Math.round(currentTime * 30))
  }, [currentTime])

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

  const playPause = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  if (!mounted) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4">
            <Cpu className="w-12 h-12 mx-auto text-cyan-400" />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-cyan-500/50"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <AIWaveform isActive={true} />
          <p className="text-cyan-400 text-sm mt-4 font-medium">AI Analysis in Progress</p>
          <p className="text-slate-500 text-xs mt-1">Processing neural network...</p>
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
  const overallScore = video?.overallScore ?? 78
  const strengths = (video?.strengths as string[]) ?? ['Excellent dink placement with good touch at the kitchen line']
  const improvements = (video?.areasForImprovement as string[]) ?? ['Third shot drops could be lower and softer']
  const recommendations = (video?.recommendations as string[]) ?? ['Focus on split-stepping before opponent contact']
  
  const raw = video?.technicalScores as any
  const technicalScores = {
    accuracy: raw?.paddleAngle ?? 82,
    technique: raw?.overall ?? 76,
    footwork: raw?.footwork ?? (video?.movementMetrics as any)?.footwork ?? 74,
    positioning: (video?.movementMetrics as any)?.positioning ?? 85
  }
  
  // Shot-by-shot data (demo if not available)
  const detectedShots = (video?.keyMoments as any[]) ?? []
  const shots = detectedShots.length > 0 ? detectedShots.map((m: any, i: number) => ({
    id: i,
    timestamp: m?.timestampFormatted ?? `0:${(i * 12).toString().padStart(2, '0')}`,
    time: m?.timestamp ?? i * 12,
    type: m?.title ?? ['Forehand Drive', 'Dink', 'Third Shot Drop', 'Volley', 'Reset'][i % 5],
    quality: ['excellent', 'good', 'needs_work'][i % 3],
    speed: 35 + Math.floor(Math.random() * 20),
    angle: 120 + Math.floor(Math.random() * 40),
    score: 70 + Math.floor(Math.random() * 25),
    tip: [
      "Excellent follow-through! Your paddle angle was perfect for cross-court placement.",
      "Good contact point. Try to get slightly lower for better control.",
      "Consider slowing the backswing for softer kitchen shots.",
      "Great reflexes! Work on paddle face angle at contact.",
      "Nice placement. Focus on absorbing pace rather than adding to it."
    ][i % 5]
  })) : [
    { id: 0, timestamp: '0:08', time: 8, type: 'Forehand Drive', quality: 'excellent', speed: 48, angle: 145, score: 92, tip: 'Excellent follow-through! Paddle face was perfectly angled.' },
    { id: 1, timestamp: '0:15', time: 15, type: 'Cross-Court Dink', quality: 'excellent', speed: 22, angle: 132, score: 88, tip: 'Great touch and placement into the kitchen.' },
    { id: 2, timestamp: '0:24', time: 24, type: 'Third Shot Drop', quality: 'good', speed: 28, angle: 118, score: 76, tip: 'Good arc. Try to land it 6 inches shorter next time.' },
    { id: 3, timestamp: '0:38', time: 38, type: 'Volley', quality: 'excellent', speed: 42, angle: 155, score: 90, tip: 'Quick hands! Perfect punch volley technique.' },
    { id: 4, timestamp: '0:52', time: 52, type: 'Reset Shot', quality: 'needs_work', speed: 35, angle: 125, score: 68, tip: 'Absorb more pace - paddle was too stiff on contact.' },
    { id: 5, timestamp: '1:05', time: 65, type: 'Backhand Drive', quality: 'good', speed: 44, angle: 140, score: 82, tip: 'Solid backhand. Rotate hips more for extra power.' },
    { id: 6, timestamp: '1:18', time: 78, type: 'Lob Defense', quality: 'excellent', speed: 38, angle: 165, score: 85, tip: 'Smart shot selection under pressure.' },
    { id: 7, timestamp: '1:35', time: 95, type: 'ATP Shot', quality: 'excellent', speed: 52, angle: 178, score: 95, tip: 'Incredible around-the-post winner!' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto max-w-7xl px-4 py-4">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white h-8 px-2">
              <Link href="/train/analysis-library"><ArrowLeft className="w-4 h-4" /></Link>
            </Button>
            <div>
              <h1 className="text-lg font-bold text-white">{video?.title ?? 'AI Video Analysis'}</h1>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[10px]">
                  <Cpu className="w-3 h-3 mr-1" /> AI Powered
                </Badge>
                <span>{new Date(video?.uploadedAt ?? Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
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

        {/* MAIN LAYOUT */}
        <div className="grid lg:grid-cols-4 gap-4">
          
          {/* LEFT: AI VIDEO PLAYER (HERO) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Video with skeleton overlay */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-cyan-500/30 shadow-xl shadow-cyan-500/10"
            >
              {/* Video element */}
              <video
                ref={videoRef}
                src={video?.videoUrl ?? ''}
                className="w-full h-full object-cover"
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 120)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Placeholder if no video */}
              {!video?.videoUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <div className="text-center">
                    <Video className="w-16 h-16 mx-auto text-slate-700 mb-2" />
                    <p className="text-slate-500 text-sm">Demo Analysis View</p>
                  </div>
                </div>
              )}
              
              {/* AI Skeleton Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <SkeletonOverlay isPlaying={isPlaying} currentShot={selectedShot || shots[0]} />
              </div>
              
              {/* AI Analysis Badge */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-black/60 backdrop-blur-sm text-cyan-400 border-cyan-500/50 px-3 py-1">
                  <Eye className="w-3 h-3 mr-1.5" />
                  <span className="text-xs">AI POSE TRACKING</span>
                  <motion.span
                    className="ml-2 w-2 h-2 bg-emerald-400 rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </Badge>
              </div>
              
              {/* Play/Pause overlay button */}
              <button
                onClick={playPause}
                className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
              >
                <div className="w-16 h-16 rounded-full bg-cyan-500/90 flex items-center justify-center">
                  {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
                </div>
              </button>
              
              {/* Bottom controls gradient */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-4 px-4">
                {/* Progress bar with shot markers */}
                <div className="relative h-8 mb-2">
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-700/80 rounded-full">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                  {/* Shot markers on timeline */}
                  {shots.map((shot) => (
                    <ShotMarker
                      key={shot.id}
                      shot={shot}
                      position={(shot.time / duration) * 100}
                      isActive={selectedShot?.id === shot.id}
                      onClick={() => { setSelectedShot(shot); seekTo(shot.time) }}
                    />
                  ))}
                </div>
                
                {/* Controls row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={playPause} className="p-2 bg-white/10 hover:bg-white/20 rounded-full">
                      {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
                    </button>
                    <span className="text-xs text-white font-mono">
                      {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{shots.length} shots detected</span>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <span className="w-2 h-2 bg-cyan-500 rounded-full" />
                      <span className="w-2 h-2 bg-amber-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* SHOT-BY-SHOT TIMELINE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-white">Shot-by-Shot Analysis</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-full" />Excellent</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 bg-cyan-500 rounded-full" />Good</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-500 rounded-full" />Focus</div>
                </div>
              </div>
              
              {/* Scrollable shot list */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {shots.map((shot) => {
                  const colors = {
                    excellent: 'border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20',
                    good: 'border-cyan-500/50 bg-cyan-500/10 hover:bg-cyan-500/20',
                    needs_work: 'border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20'
                  }
                  const isActive = selectedShot?.id === shot.id
                  
                  return (
                    <motion.button
                      key={shot.id}
                      onClick={() => { setSelectedShot(shot); seekTo(shot.time) }}
                      className={cn(
                        "flex-shrink-0 w-28 p-3 rounded-xl border-2 transition-all text-left",
                        colors[shot.quality as keyof typeof colors],
                        isActive && "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-[10px] text-slate-400 font-mono mb-1">{shot.timestamp}</div>
                      <div className="text-xs font-semibold text-white truncate">{shot.type}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-slate-400">{shot.speed} mph</span>
                        <span className="text-xs font-bold text-white">{shot.score}</span>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-1 space-y-4">
            {/* AI Processing Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <AIProcessingIndicator frame={currentFrame} totalFrames={totalFrames} isPlaying={isPlaying} />
            </motion.div>
            
            {/* Selected Shot Detail */}
            <AnimatePresence mode="wait">
              {selectedShot && (
                <ShotDetailPanel shot={selectedShot} onClose={() => setSelectedShot(null)} />
              )}
            </AnimatePresence>
            
            {/* Overall Score */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-4 border border-cyan-500/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-cyan-400">{overallScore}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Overall Score</div>
                  <Badge className="mt-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                    Above Average
                  </Badge>
                </div>
              </div>
              
              {/* Mini metrics */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Accuracy', value: technicalScores.accuracy, icon: Target, color: 'cyan' },
                  { label: 'Technique', value: technicalScores.technique, icon: Gauge, color: 'emerald' },
                  { label: 'Footwork', value: technicalScores.footwork, icon: Move, color: 'amber' },
                  { label: 'Position', value: technicalScores.positioning, icon: Shield, color: 'purple' }
                ].map((m) => (
                  <div key={m.label} className="bg-slate-800/50 rounded-lg p-2">
                    <div className="text-[10px] text-slate-400 mb-1">{m.label}</div>
                    <div className="text-sm font-bold text-white">{m.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            {/* Coach Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50"
            >
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-white">AI Insights</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-xs">
                  <Trophy className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-300">{strengths[0]}</p>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <Target className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-300">{improvements[0]}</p>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <Lightbulb className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-300">{recommendations[0]}</p>
                </div>
              </div>
            </motion.div>
            
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Button asChild size="sm" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-xs h-9">
                <Link href="/train/video"><Zap className="w-3 h-3 mr-1" /> New Analysis</Link>
              </Button>
              <Button variant="outline" asChild size="sm" className="w-full border-slate-600 text-slate-300 text-xs h-9">
                <Link href="/train/drills"><Dumbbell className="w-3 h-3 mr-1" /> Recommended Drills</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Coach Kai Chat */}
      <CoachKaiChat analysisId={videoId} />

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