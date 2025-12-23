"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload, Video, Loader2, CheckCircle2, AlertCircle, Play, FileVideo,
  Crown, Lock, Sparkles, TrendingUp, Target, Zap, Clock, Eye, Activity,
  BarChart3, Lightbulb, Trophy, Film, LineChart, Brain, Cpu, Gauge,
  Timer, Award, Users, Star, Download, Share2, ArrowRight, VideoIcon,
  HardDrive, ChevronRight, MoreVertical, Trash2, FileText, ExternalLink,
  Home, Library, HelpCircle, Bookmark, MessageCircle, RotateCcw, Globe,
  Shield, Wifi, Mic, ChevronDown, X, Menu, BookOpen, Settings, Filter,
  SortDesc, Tag, Calendar, CircleAlert, Crosshair, Move, Waves, ScanLine,
  Radar, Scan, Focus, Clapperboard
} from "lucide-react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { generateAnalysisPDF } from "@/lib/pdf-generator"
import type { VideoAnalysisData, VideoLibraryStats } from "@/lib/video-analysis-types"
import MainNavigation from "@/components/navigation/main-navigation"
import { AchievementToast, useAchievementNotifications } from "@/components/rewards/achievement-toast"
import { parseScore, formatScore, getSafeScore } from "@/lib/video-analysis/score-utils"
import { upload } from '@vercel/blob/client'
import { celebrateDayComplete, showAchievementToast } from "@/lib/celebrations"

// =====================================================
// ANIMATED BACKGROUND PARTICLES
// =====================================================
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-emerald-500/30"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          }}
          animate={{
            y: [null, Math.random() * -500 - 100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
          style={{
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  )
}

// =====================================================
// GRID LINES BACKGROUND
// =====================================================
function TechGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* Animated scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"
        animate={{ y: [0, 800] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}

// =====================================================
// ANIMATED PROCESS TIMELINE
// =====================================================
function ProcessTimeline({ isUploading, isAnalyzing }: { isUploading: boolean; isAnalyzing: boolean }) {
  const steps = [
    { icon: Upload, label: "Upload", desc: "Your footage", active: isUploading },
    { icon: ScanLine, label: "Scan", desc: "Frame analysis", active: isAnalyzing },
    { icon: Brain, label: "Process", desc: "AI detection", active: isAnalyzing },
    { icon: BarChart3, label: "Results", desc: "Insights ready", active: false },
  ]

  return (
    <div className="relative flex items-center justify-between max-w-2xl mx-auto">
      {/* Connection line */}
      <div className="absolute top-6 left-12 right-12 h-0.5 bg-slate-700">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
          initial={{ width: "0%" }}
          animate={{ width: isAnalyzing ? "75%" : isUploading ? "25%" : "0%" }}
          transition={{ duration: 1 }}
        />
      </div>
      
      {steps.map((step, idx) => (
        <motion.div
          key={idx}
          className="relative z-10 flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <motion.div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
              step.active
                ? "bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/50"
                : "bg-slate-800 border border-slate-700"
            )}
            animate={step.active ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: step.active ? Infinity : 0 }}
          >
            <step.icon className={cn("w-5 h-5", step.active ? "text-white" : "text-slate-500")} />
          </motion.div>
          <p className={cn(
            "mt-2 text-sm font-medium",
            step.active ? "text-emerald-400" : "text-slate-500"
          )}>
            {step.label}
          </p>
          <p className="text-xs text-slate-600">{step.desc}</p>
        </motion.div>
      ))}
    </div>
  )
}

// =====================================================
// PREMIUM VIDEO CARD
// =====================================================
function PremiumVideoCard({
  video,
  onDelete,
  onAnalyze,
  onDownloadPDF,
  analyzing,
  isNew
}: {
  video: VideoAnalysisData
  onDelete: (id: string) => void
  onAnalyze: (id: string, url: string) => void
  onDownloadPDF: (video: VideoAnalysisData) => void
  analyzing: boolean
  isNew?: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)
  
  const statusConfig: Record<string, { color: string; gradient: string; icon: any; label: string }> = {
    COMPLETED: { color: "emerald", gradient: "from-emerald-500 to-green-500", icon: CheckCircle2, label: "Complete" },
    PROCESSING: { color: "amber", gradient: "from-amber-500 to-orange-500", icon: Loader2, label: "Processing" },
    PENDING: { color: "slate", gradient: "from-slate-500 to-slate-600", icon: Clock, label: "Pending" },
    FAILED: { color: "red", gradient: "from-red-500 to-rose-500", icon: CircleAlert, label: "Failed" }
  }
  
  const status = statusConfig[video.analysisStatus as keyof typeof statusConfig] || statusConfig.PENDING
  const StatusIcon = status.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Glow effect */}
      <motion.div
        className={cn(
          "absolute -inset-1 rounded-2xl bg-gradient-to-r opacity-0 blur-xl transition-opacity duration-500",
          status.gradient,
          isHovered && "opacity-40"
        )}
      />
      
      {/* New video highlight */}
      {isNew && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 3 }}
          className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-emerald-500/50 to-cyan-500/50 blur-xl"
        />
      )}
      
      <Card className="relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-500">
        {/* Thumbnail Section */}
        <div className="aspect-video relative overflow-hidden">
          {/* Video thumbnail or placeholder */}
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : video.videoUrl ? (
            <video
              src={video.videoUrl}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              muted
              preload="metadata"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-900/20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                <Film className="w-8 h-8 text-slate-600" />
              </div>
            </div>
          )}
          
          {/* Overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-cyan-500/0 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
          
          {/* Play button overlay */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
          >
            <motion.div
              className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-6 h-6 text-white ml-1" />
            </motion.div>
          </motion.div>
          
          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <motion.div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md",
                `bg-${status.color}-500/20 border border-${status.color}-500/40`
              )}
              animate={status.label === "Processing" ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1.5, repeat: status.label === "Processing" ? Infinity : 0 }}
            >
              <StatusIcon className={cn(
                "w-3.5 h-3.5",
                status.label === "Processing" && "animate-spin",
                `text-${status.color}-400`
              )} />
              <span className={`text-xs font-medium text-${status.color}-400`}>{status.label}</span>
            </motion.div>
          </div>
          
          {/* AI Score - Bottom Left */}
          {video.analysisStatus === 'COMPLETED' && video.overallScore && (
            <div className="absolute bottom-3 left-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-black/80 backdrop-blur-md rounded-xl px-4 py-2 border border-emerald-500/30"
              >
                <div className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  {Math.round(video.overallScore)}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest">AI Score</div>
              </motion.div>
            </div>
          )}
          
          {/* PRO badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0 shadow-lg">
              <Brain className="w-3 h-3 mr-1" />
              PRO Analysis
            </Badge>
          </div>
        </div>
        
        {/* Content Section */}
        <CardContent className="p-4 space-y-4">
          {/* Title & Date */}
          <div>
            <h3 className="font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
              {video.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              {video.duration && video.duration > 0 && (
                <>
                  <Timer className="w-3 h-3" />
                  <span>{Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}</span>
                  <span>•</span>
                </>
              )}
              <Calendar className="w-3 h-3" />
              <span>{new Date(video.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
          
          {/* Quick Metrics */}
          {video.analysisStatus === 'COMPLETED' && video.technicalScores && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Form", value: video.technicalScores?.readyPosition || 0 },
                { label: "Tech", value: video.technicalScores?.overall || 0 },
                { label: "Follow", value: video.technicalScores?.followThrough || 0 },
              ].map((metric, idx) => (
                <div key={idx} className="text-center p-2 rounded-lg bg-slate-800/50">
                  <div className="text-lg font-bold text-emerald-400">{metric.value}</div>
                  <div className="text-[10px] text-slate-500 uppercase">{metric.label}</div>
                </div>
              ))}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2">
            {video.analysisStatus === 'COMPLETED' ? (
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white border-0"
                asChild
              >
                <Link href={`/train/analysis/${video.id}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Results
                </Link>
              </Button>
            ) : video.analysisStatus === 'PENDING' || video.analysisStatus === 'FAILED' ? (
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                onClick={() => onAnalyze(video.id, video.videoUrl)}
                disabled={analyzing}
              >
                {analyzing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</>
                ) : (
                  <><Zap className="w-4 h-4 mr-2" />Analyze Now</>
                )}
              </Button>
            ) : (
              <Button size="sm" className="flex-1" disabled>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...
              </Button>
            )}
            
            {video.analysisStatus === 'COMPLETED' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownloadPDF(video)}
                className="border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/10"
              >
                <FileText className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(video.id)}
              className="border-slate-700 hover:border-red-500/50 hover:bg-red-500/10 text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// =====================================================
// MAIN COMPONENT
// =====================================================
export default function VideoAnalysisHub() {
  const { data: session } = useSession() || {}
  const { achievements, isShowing, dismissAchievements, checkForAchievements } = useAchievementNotifications()
  const dropzoneRef = useRef<HTMLDivElement>(null)
  
  const UPLOAD_METHOD: 'client' | 'proxy' = 'client'
  
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('upload')
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [currentAnalysis, setCurrentAnalysis] = useState<VideoAnalysisData | null>(null)
  const [videoLibrary, setVideoLibrary] = useState<VideoAnalysisData[]>([])
  const [libraryStats, setLibraryStats] = useState<VideoLibraryStats>({
    totalVideos: 0,
    totalAnalyzed: 0,
    storageUsed: 0,
    storageLimit: 5000,
    recentlyAnalyzed: 0,
    avgImprovement: 0
  })
  
  // Filter & Sort state
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'status'>('date')
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'processing'>('all')
  const [newVideoId, setNewVideoId] = useState<string | null>(null)

  const userTier = (session?.user as any)?.subscriptionTier || 'FREE'

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load video library
  useEffect(() => {
    if (session?.user) {
      fetchVideoLibrary()
      fetchLibraryStats()
    }
  }, [session])

  // Poll for processing videos
  useEffect(() => {
    if (!session?.user) return
    
    const hasProcessingVideos = videoLibrary.some(
      v => v.analysisStatus === 'PROCESSING' || v.analysisStatus === 'PENDING'
    )
    
    if (!hasProcessingVideos) return
    
    const interval = setInterval(() => {
      fetchVideoLibrary()
      fetchLibraryStats()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [session, videoLibrary])

  const fetchVideoLibrary = async () => {
    try {
      const res = await fetch('/api/video-analysis/library')
      if (res.ok) {
        const data = await res.json()
        setVideoLibrary(data.analyses || data.videos || [])
      }
    } catch (error) {
      console.error('Error fetching video library:', error)
    }
  }

  const fetchLibraryStats = async () => {
    try {
      const res = await fetch('/api/video-analysis/stats')
      if (res.ok) {
        const data = await res.json()
        setLibraryStats(data.stats || libraryStats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      setVideoPreview(URL.createObjectURL(file))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi'] },
    maxSize: 500 * 1024 * 1024,
    multiple: false
  })

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      alert('❌ Please select a video file first.')
      return
    }

    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
    if (!validTypes.includes(selectedFile.type)) {
      alert('❌ Invalid file type. Please upload MP4, MOV, AVI, or WebM.')
      return
    }

    const maxSize = 500 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      alert('❌ File too large. Maximum size is 500MB.')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      let videoUrl: string | undefined
      let videoId: string | undefined

      if (UPLOAD_METHOD === 'client') {
        const blob = await upload(selectedFile.name, selectedFile, {
          access: 'public',
          handleUploadUrl: '/api/video-analysis/upload-handler',
          clientPayload: JSON.stringify({
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            contentType: selectedFile.type
          }),
          onUploadProgress: (progressEvent) => {
            const percentComplete = Math.round((progressEvent.loaded / progressEvent.total) * 100)
            setUploadProgress(percentComplete)
          }
        })

        videoUrl = blob.url

        const saveRes = await fetch('/api/video-analysis/save-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: blob.url,
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            contentType: selectedFile.type
          })
        })

        if (!saveRes.ok) {
          const errorData = await saveRes.json()
          throw new Error(errorData.error || 'Failed to save video record')
        }

        const saveData = await saveRes.json()
        videoId = saveData.videoId
      }

      setUploadProgress(100)
      setUploading(false)
      
      setSelectedFile(null)
      setVideoPreview(null)
      setNewVideoId(videoId || null)
      setActiveTab('library')
      
      await fetchVideoLibrary()
      await fetchLibraryStats()
      
      setTimeout(() => checkForAchievements('video'), 1000)
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      setAnalyzing(true)
      await analyzeVideo(videoId!, videoUrl!)
      
    } catch (error) {
      setUploading(false)
      setUploadProgress(0)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.'
      alert(`❌ Upload Failed\n\n${errorMessage}`)
    }
  }

  const analyzeVideo = async (videoId: string, videoUrl?: string, retryCount = 0): Promise<boolean> => {
    const maxRetries = 3
    const retryDelay = (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000)

    try {
      const res = await fetch('/api/video-analysis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, videoUrl })
      })

      if (res.ok) {
        const data = await res.json()
        setCurrentAnalysis(data)
        setAnalyzing(false)
        
        celebrateDayComplete()
        showAchievementToast(
          'Video Analysis Complete! 🎥',
          'Your AI-powered insights are ready',
          '🎥'
        )
        
        await fetchVideoLibrary()
        await fetchLibraryStats()
        return true
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Analysis failed' }))
        throw new Error(errorData.error || 'Analysis failed')
      }
    } catch (error) {
      if (retryCount < maxRetries) {
        const delay = retryDelay(retryCount)
        await new Promise(resolve => setTimeout(resolve, delay))
        return analyzeVideo(videoId, videoUrl, retryCount + 1)
      }
      
      setAnalyzing(false)
      return false
    }
  }

  const handleManualAnalysis = async (videoId: string, videoUrl: string) => {
    setAnalyzing(true)
    await analyzeVideo(videoId, videoUrl)
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      const res = await fetch(`/api/video-analysis/${videoId}`, { method: 'DELETE' })
      if (res.ok) {
        setVideoLibrary(prev => prev.filter(v => v.id !== videoId))
        await fetchLibraryStats()
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      alert('❌ Failed to delete video.')
    }
  }

  const downloadPDF = (analysis: VideoAnalysisData) => {
    const pdfHTML = generateAnalysisPDF({
      playerName: (session?.user as any)?.name || 'Player',
      videoTitle: analysis.title,
      analysisDate: new Date(analysis.uploadedAt).toLocaleDateString(),
      overallScore: analysis.overallScore || 0,
      strengths: analysis.strengths || [],
      improvements: analysis.areasForImprovement || [],
      recommendations: analysis.recommendations || [],
      shotAnalysis: analysis.shotTypes || [],
      movementMetrics: analysis.movementMetrics,
      technicalScores: analysis.technicalScores,
      keyMoments: analysis.keyMoments || []
    })

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(pdfHTML)
      printWindow.document.close()
    }
  }

  // Filter and sort videos
  const filteredVideos = videoLibrary
    .filter(v => {
      if (filterStatus === 'complete') return v.analysisStatus === 'COMPLETED'
      if (filterStatus === 'processing') return v.analysisStatus === 'PROCESSING' || v.analysisStatus === 'PENDING'
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'score') return (b.overallScore || 0) - (a.overallScore || 0)
      if (sortBy === 'status') {
        const order = { COMPLETED: 0, PROCESSING: 1, PENDING: 2, FAILED: 3 }
        return (order[a.analysisStatus as keyof typeof order] || 4) - (order[b.analysisStatus as keyof typeof order] || 4)
      }
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    })

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent"
        />
      </div>
    )
  }

  return (
    <>
      <MainNavigation user={session?.user} />
      
      <div className="min-h-screen bg-slate-950 relative overflow-hidden">
        {/* Background Effects */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
          <TechGrid />
          <FloatingParticles />
          {/* Radial gradient overlays */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* ============================================= */}
          {/* HERO SECTION */}
          {/* ============================================= */}
          <section className="pt-8 pb-12">
            <div className="container mx-auto max-w-6xl px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                {/* Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-emerald-500"
                  />
                  <span className="text-emerald-400 text-sm font-medium">AI-Powered Analysis Engine</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0">PRO</Badge>
                </motion.div>
                
                {/* Main Title */}
                <h1 className="text-5xl md:text-7xl font-black mb-4">
                  <span className="text-white">Video </span>
                  <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                    Analysis Lab
                  </span>
                </h1>
                
                {/* Subtitle */}
                <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
                  Upload your game footage and let Coach Kai's neural networks
                  <span className="text-emerald-400 font-medium"> transform your technique</span>
                </p>
                
                {/* Quick Stats */}
                <div className="flex justify-center gap-8">
                  {[
                    { value: "<5min", label: "Analysis Time", icon: Timer },
                    { value: "50+", label: "Metrics Tracked", icon: Radar },
                    { value: "99%", label: "Accuracy", icon: Target },
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      className="text-center"
                    >
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <stat.icon className="w-4 h-4 text-emerald-500" />
                        <span className="text-2xl font-bold text-white">{stat.value}</span>
                      </div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              {/* Tab Navigation */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex p-1 rounded-2xl bg-slate-900/80 backdrop-blur border border-slate-700/50">
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab('upload')}
                    className={cn(
                      "px-8 py-3 rounded-xl font-medium transition-all",
                      activeTab === 'upload'
                        ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Video
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab('library')}
                    className={cn(
                      "px-8 py-3 rounded-xl font-medium transition-all",
                      activeTab === 'library'
                        ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Library className="w-5 h-5 mr-2" />
                    My Library
                    {libraryStats.totalVideos > 0 && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                        {libraryStats.totalVideos}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </section>
          
          {/* ============================================= */}
          {/* UPLOAD TAB */}
          {/* ============================================= */}
          <AnimatePresence mode="wait">
            {activeTab === 'upload' && (
              <motion.section
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="pb-20"
              >
                <div className="container mx-auto max-w-5xl px-4">
                  {/* Process Timeline */}
                  <div className="mb-12">
                    <ProcessTimeline isUploading={uploading} isAnalyzing={analyzing} />
                  </div>
                  
                  {/* Upload Zone */}
                  <motion.div
                    ref={dropzoneRef}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative"
                  >
                    {/* Outer glow */}
                    <motion.div
                      className={cn(
                        "absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-0 blur-xl transition-opacity duration-500",
                        isDragActive && "opacity-50"
                      )}
                    />
                    
                    <div
                      {...getRootProps()}
                      className={cn(
                        "relative rounded-3xl border-2 border-dashed p-12 cursor-pointer transition-all duration-500 backdrop-blur-xl",
                        isDragActive
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-slate-700 hover:border-emerald-500/50 bg-slate-900/50 hover:bg-slate-900/80"
                      )}
                    >
                      <input {...getInputProps()} />
                      
                      {!selectedFile ? (
                        <div className="text-center">
                          {/* Upload Icon Animation */}
                          <motion.div
                            animate={isDragActive ? { scale: [1, 1.1, 1], y: [0, -10, 0] } : {}}
                            transition={{ duration: 0.5, repeat: isDragActive ? Infinity : 0 }}
                            className="relative inline-block mb-6"
                          >
                            {/* Glowing rings */}
                            <motion.div
                              className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              style={{ width: 96, height: 96, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                            />
                            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                              <Upload className="w-10 h-10 text-white" />
                            </div>
                          </motion.div>
                          
                          <h3 className="text-2xl font-bold text-white mb-2">
                            {isDragActive ? "Drop your video here!" : "Drag & drop your game footage"}
                          </h3>
                          <p className="text-slate-400 mb-6">or click to browse • MP4, MOV, AVI up to 500MB</p>
                          
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-emerald-500/25"
                          >
                            <Clapperboard className="w-5 h-5 mr-2" />
                            Select Video File
                          </Button>
                          
                          {/* Feature Tags */}
                          <div className="flex flex-wrap justify-center gap-3 mt-8">
                            {[
                              { icon: Crosshair, label: "Shot Tracking" },
                              { icon: Move, label: "Movement Analysis" },
                              { icon: Brain, label: "Technique Scoring" },
                              { icon: Gauge, label: "Power Metrics" },
                            ].map((feature, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + idx * 0.1 }}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50"
                              >
                                <feature.icon className="w-4 h-4 text-emerald-500" />
                                <span className="text-sm text-slate-300">{feature.label}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Video Preview */}
                          {videoPreview && (
                            <div className="aspect-video relative rounded-2xl overflow-hidden bg-black border border-slate-700">
                              <video src={videoPreview} controls className="w-full h-full" />
                              {/* AI Overlay */}
                              <div className="absolute top-4 left-4">
                                <Badge className="bg-emerald-500/90 text-white border-0">
                                  <Brain className="w-3 h-3 mr-1" />
                                  Ready for AI Analysis
                                </Badge>
                              </div>
                            </div>
                          )}
                          
                          {/* File Info */}
                          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                <FileVideo className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-white truncate max-w-[250px]">{selectedFile.name}</p>
                                <p className="text-sm text-slate-500">
                                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setVideoPreview(null); }}
                              className="text-slate-400 hover:text-red-400"
                            >
                              <X className="w-5 h-5" />
                            </Button>
                          </div>
                          
                          {/* Progress */}
                          {uploading && (
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-emerald-400 flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Uploading to cloud...
                                </span>
                                <span className="text-white font-bold">{uploadProgress}%</span>
                              </div>
                              <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                                  initial={{ width: "0%" }}
                                  animate={{ width: `${uploadProgress}%` }}
                                  transition={{ duration: 0.3 }}
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* Analyzing State */}
                          {analyzing && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
                            >
                              <div className="flex items-center gap-4">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                  className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center"
                                >
                                  <Brain className="w-6 h-6 text-white" />
                                </motion.div>
                                <div>
                                  <p className="font-semibold text-emerald-400">Coach Kai is analyzing your footage...</p>
                                  <p className="text-sm text-slate-400">This usually takes 2-5 minutes</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          
                          {/* Upload Button */}
                          {!uploading && !analyzing && (
                            <Button
                              onClick={(e) => { e.stopPropagation(); handleUploadAndAnalyze(); }}
                              size="lg"
                              className="w-full h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-lg font-semibold shadow-2xl shadow-emerald-500/25"
                            >
                              <Brain className="w-6 h-6 mr-2" />
                              Analyze with Coach Kai
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                  
                  {/* What AI Analyzes */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-16"
                  >
                    <h3 className="text-center text-lg font-semibold text-slate-400 mb-8">What Coach Kai Analyzes</h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      {[
                        { icon: Crosshair, title: "Shot Detection", desc: "Every serve, dink, and drive tracked", color: "emerald" },
                        { icon: Move, title: "Movement Patterns", desc: "Court coverage and positioning", color: "cyan" },
                        { icon: Gauge, title: "Power Metrics", desc: "Swing speed and impact force", color: "violet" },
                        { icon: Target, title: "Accuracy Analysis", desc: "Shot placement and consistency", color: "amber" },
                      ].map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + idx * 0.1 }}
                          whileHover={{ y: -4, scale: 1.02 }}
                          className="group"
                        >
                          <Card className="h-full bg-slate-900/50 backdrop-blur border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden">
                            <CardContent className="p-6 text-center relative">
                              {/* Glow */}
                              <div className={`absolute inset-0 bg-${item.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                              <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-${item.color}-500/10 border border-${item.color}-500/30 flex items-center justify-center`}>
                                <item.icon className={`w-7 h-7 text-${item.color}-400`} />
                              </div>
                              <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                              <p className="text-sm text-slate-500">{item.desc}</p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.section>
            )}
            
            {/* ============================================= */}
            {/* LIBRARY TAB */}
            {/* ============================================= */}
            {activeTab === 'library' && (
              <motion.section
                key="library"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="pb-20"
              >
                <div className="container mx-auto max-w-6xl px-4">
                  {videoLibrary.length > 0 ? (
                    <>
                      {/* Stats Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                          { icon: Film, value: libraryStats.totalVideos, label: "Total Videos", gradient: "from-emerald-500 to-cyan-500" },
                          { icon: CheckCircle2, value: libraryStats.totalAnalyzed, label: "Analyzed", gradient: "from-green-500 to-emerald-500" },
                          { icon: BarChart3, value: videoLibrary.filter(v => v.overallScore).length > 0 ? Math.round(videoLibrary.filter(v => v.overallScore).reduce((sum, v) => sum + (v.overallScore || 0), 0) / videoLibrary.filter(v => v.overallScore).length) : '--', label: "Avg Score", gradient: "from-amber-500 to-orange-500" },
                          { icon: TrendingUp, value: libraryStats.avgImprovement > 0 ? `+${libraryStats.avgImprovement}%` : '--', label: "Improvement", gradient: "from-violet-500 to-purple-500" },
                        ].map((stat, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <Card className="bg-slate-900/50 backdrop-blur border-slate-700/50 overflow-hidden">
                              <CardContent className="p-4 flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                                  <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                                  <div className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Filters */}
                      <div className="flex flex-wrap gap-3 mb-8">
                        <div className="flex gap-2 p-1 rounded-xl bg-slate-900/50 border border-slate-700/50">
                          {[
                            { value: 'all', label: 'All' },
                            { value: 'complete', label: 'Complete' },
                            { value: 'processing', label: 'Processing' },
                          ].map((filter) => (
                            <Button
                              key={filter.value}
                              size="sm"
                              variant="ghost"
                              onClick={() => setFilterStatus(filter.value as any)}
                              className={cn(
                                "rounded-lg transition-all",
                                filterStatus === filter.value
                                  ? "bg-emerald-500 text-white"
                                  : "text-slate-400 hover:text-white"
                              )}
                            >
                              {filter.label}
                            </Button>
                          ))}
                        </div>
                        <div className="flex gap-2 p-1 rounded-xl bg-slate-900/50 border border-slate-700/50">
                          {[
                            { value: 'date', label: 'Date' },
                            { value: 'score', label: 'Score' },
                            { value: 'status', label: 'Status' },
                          ].map((sort) => (
                            <Button
                              key={sort.value}
                              size="sm"
                              variant="ghost"
                              onClick={() => setSortBy(sort.value as any)}
                              className={cn(
                                "rounded-lg transition-all",
                                sortBy === sort.value
                                  ? "bg-slate-700 text-white"
                                  : "text-slate-400 hover:text-white"
                              )}
                            >
                              {sort.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Video Grid */}
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVideos.map((video) => (
                          <PremiumVideoCard
                            key={video.id}
                            video={video}
                            onDelete={handleDeleteVideo}
                            onAnalyze={handleManualAnalysis}
                            onDownloadPDF={downloadPDF}
                            analyzing={analyzing}
                            isNew={video.id === newVideoId}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    /* Empty State */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-20"
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center"
                      >
                        <Film className="w-14 h-14 text-slate-600" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-3">Your Library Awaits</h3>
                      <p className="text-slate-400 mb-8 max-w-md mx-auto">
                        Upload your first game footage and unlock AI-powered insights to transform your game.
                      </p>
                      <Button
                        size="lg"
                        onClick={() => setActiveTab('upload')}
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-xl shadow-emerald-500/25"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Upload Your First Video
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Achievement Toast */}
      {isShowing && (
        <AchievementToast
          achievements={achievements}
                    onDismiss={dismissAchievements}
        />
      )}
    </>
  )
}
