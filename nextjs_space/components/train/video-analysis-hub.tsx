// @ts-nocheck
"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload, Video, Loader2, CheckCircle2, AlertCircle, Play,
  Sparkles, TrendingUp, Target, Zap, Clock, Eye, Activity,
  Brain, Gauge, Trophy, Film, HardDrive, Trash2, ArrowRight,
  FileVideo, Lightbulb, ChevronRight, X, MoreVertical, Calendar,
  Scan, Crosshair, Radar, Cpu, Waves, BarChart3, Camera, MonitorPlay
} from "lucide-react"
import { cn } from "@/lib/utils"
import MainNavigation from "@/components/navigation/main-navigation"

interface VideoItem {
  id: string
  title: string
  fileName?: string
  uploadedAt: string
  analysisStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  overallScore?: number
  thumbnailUrl?: string
  videoUrl?: string
  duration?: number
  fileSize?: number
}

interface LibraryStats {
  totalVideos: number
  totalAnalyzed: number
  avgScore: number
}

// Floating Particle System
function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-cyan-400/30"
          initial={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{
            y: [null, '-20%'],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 4
          }}
        />
      ))}
    </div>
  )
}

// Scanning Animation Overlay
function ScanningOverlay({ isActive }: { isActive: boolean }) {
  if (!isActive) return null
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      <motion.div
        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/50"
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(34,211,238,0.03)_50%,transparent_100%)]" />
    </div>
  )
}

// AI Processing Visualization
function AIProcessingViz({ stage }: { stage: string }) {
  return (
    <motion.div 
      className="flex flex-col items-center gap-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Central Brain/Processor */}
      <div className="relative w-24 h-24">
        <motion.div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div 
          className="absolute inset-2 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
        />
        <div className="absolute inset-4 rounded-full bg-slate-900 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Brain className="w-8 h-8 text-cyan-400" />
          </motion.div>
        </div>
        
        {/* Orbiting Elements */}
        {['Posture', 'Motion', 'Form'].map((label, i) => (
          <motion.div
            key={label}
            className="absolute w-3 h-3 rounded-full bg-cyan-400 flex items-center justify-center"
            style={{ top: '50%', left: '50%' }}
            animate={{
              x: [0, Math.cos(i * 2.09) * 40, 0],
              y: [0, Math.sin(i * 2.09) * 40, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          >
            <div className="absolute -top-6 whitespace-nowrap text-[8px] text-cyan-400 font-medium">
              {label}
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="text-center">
        <p className="text-cyan-400 font-semibold text-sm">{stage}</p>
        <p className="text-slate-500 text-xs mt-1">AI Neural Processing</p>
      </div>
    </motion.div>
  )
}

// Animated Stats Card
function StatCard({ icon: Icon, value, label, gradient, delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative group"
    >
      <div className={cn(
        "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        gradient
      )} style={{ filter: 'blur(20px)' }} />
      <Card className="relative bg-slate-900/60 border-slate-700/50 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
        <CardContent className="p-4 flex items-center gap-3">
          <div className={cn("p-2.5 rounded-lg bg-gradient-to-br", gradient)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function VideoAnalysisHub() {
  const { data: session } = useSession() || {}
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('upload')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'complete' | 'error'>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [videoLibrary, setVideoLibrary] = useState<VideoItem[]>([])
  const [libraryStats, setLibraryStats] = useState<LibraryStats>({ totalVideos: 0, totalAnalyzed: 0, avgScore: 0 })
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null)

  const userTier = (session?.user as any)?.subscriptionTier || 'FREE'
  const isPro = userTier === 'PRO' || userTier === 'PREMIUM'
  const userName = (session?.user as any)?.firstName || session?.user?.name?.split(' ')[0] || 'Champion'

  // Fetch video library
  useEffect(() => {
    if (session?.user) {
      fetchVideoLibrary()
    }
  }, [session])

  const fetchVideoLibrary = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/video-analysis/library')
      if (res.ok) {
        const data = await res.json()
        const videos = data.analyses || data.videos || []
        setVideoLibrary(videos)
        
        const analyzed = videos.filter((v: any) => v.analysisStatus === 'COMPLETED')
        const avgScore = analyzed.length > 0 
          ? analyzed.reduce((sum: number, v: any) => sum + (v.overallScore || 0), 0) / analyzed.length 
          : 0
        setLibraryStats({
          totalVideos: videos.length,
          totalAnalyzed: analyzed.length,
          avgScore: Math.round(avgScore)
        })
      }
    } catch (error) {
      console.error('Error fetching video library:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-refresh for processing videos
  useEffect(() => {
    if (!session?.user) return
    const hasProcessing = videoLibrary.some(v => v.analysisStatus === 'PROCESSING' || v.analysisStatus === 'PENDING')
    if (!hasProcessing) return
    const interval = setInterval(fetchVideoLibrary, 5000)
    return () => clearInterval(interval)
  }, [session, videoLibrary])

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  
  const handleDragLeave = () => setIsDragging(false)
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file)
      setVideoPreview(URL.createObjectURL(file))
      setErrorMessage('')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setVideoPreview(URL.createObjectURL(file))
      setErrorMessage('')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    
    setUploading(true)
    setAnalysisStatus('uploading')
    setUploadProgress(0)
    setErrorMessage('')

    try {
      const presignRes = await fetch('/api/video-analysis/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedFile.name,
          contentType: selectedFile.type,
          fileSize: selectedFile.size
        })
      })

      if (!presignRes.ok) throw new Error('Failed to get upload URL')
      const { uploadUrl, cloud_storage_path, videoId } = await presignRes.json()

      // Simulated progress
      const progressInterval = setInterval(() => {
        setUploadProgress(p => Math.min(p + 5, 90))
      }, 200)

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: { 'Content-Type': selectedFile.type }
      })

      clearInterval(progressInterval)
      if (!uploadRes.ok) throw new Error('Upload failed')
      
      setUploadProgress(100)
      setAnalysisStatus('analyzing')

      // Confirm upload
      await fetch('/api/video-analysis/confirm-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, cloud_storage_path })
      })

      // Trigger analysis
      await fetch('/api/video-analysis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId })
      })

      setAnalysisStatus('complete')
      setTimeout(() => {
        router.push(`/train/analysis/${videoId}`)
      }, 1500)

    } catch (error: any) {
      setAnalysisStatus('error')
      setErrorMessage(error.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    try {
      await fetch(`/api/video-analysis/${videoId}`, { method: 'DELETE' })
      setVideoLibrary(prev => prev.filter(v => v.id !== videoId))
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <MainNavigation />
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
      </div>
      
      <div className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                style={{ filter: 'blur(8px)' }}
              />
              <div className="relative bg-slate-900 p-3 rounded-xl">
                <Scan className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-white">AI Video Analysis</h1>
              <p className="text-slate-400">Biomechanical breakdown powered by AI</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard icon={Film} value={libraryStats.totalVideos} label="Videos" gradient="from-cyan-500 to-blue-500" delay={0.1} />
          <StatCard icon={CheckCircle2} value={libraryStats.totalAnalyzed} label="Analyzed" gradient="from-emerald-500 to-teal-500" delay={0.2} />
          <StatCard icon={Target} value={libraryStats.avgScore || '—'} label="Avg Score" gradient="from-amber-500 to-orange-500" delay={0.3} />
        </div>

        {/* Tabs - Large & Prominent */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-6">
          <TabsList className="bg-slate-800 border-2 border-slate-600 p-2 gap-3 h-auto">
            <TabsTrigger 
              value="upload" 
              className="px-8 py-4 text-lg font-bold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:text-white transition-all"
            >
              <Upload className="w-5 h-5 mr-2" /> Upload New Video
            </TabsTrigger>
            <TabsTrigger 
              value="library" 
              className="px-8 py-4 text-lg font-bold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:text-white transition-all"
            >
              <MonitorPlay className="w-5 h-5 mr-2" /> My Videos ({libraryStats.totalVideos})
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="mt-0">
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Upload Zone - 3 columns */}
              <div className="lg:col-span-3">
                <motion.div
                  ref={dropZoneRef}
                  className={cn(
                    "relative rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden",
                    isDragging ? "border-cyan-400 bg-cyan-400/10" : "border-slate-700 hover:border-slate-600",
                    selectedFile ? "h-auto" : "h-[400px]"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <ParticleField />
                  <ScanningOverlay isActive={isDragging} />
                  
                  {!selectedFile ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                      {/* Animated Upload Icon */}
                      <motion.div
                        className="relative mb-6"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-xl opacity-40" />
                        <div className="relative bg-slate-900/80 p-6 rounded-full border border-slate-700">
                          <Upload className="w-12 h-12 text-cyan-400" />
                        </div>
                      </motion.div>
                      
                      <h3 className="text-xl font-semibold text-white mb-2">Drop your video here</h3>
                      <p className="text-slate-400 mb-4">or click to browse files</p>
                      <p className="text-slate-500 text-sm mb-6">MP4, MOV, AVI • Max 500MB</p>
                      
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                      >
                        <Camera className="w-4 h-4 mr-2" /> Select Video
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="p-6">
                      {/* Video Preview */}
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-black mb-4">
                        <video
                          src={videoPreview || undefined}
                          className="w-full h-full object-contain"
                          controls={analysisStatus === 'idle'}
                        />
                        {analysisStatus !== 'idle' && (
                          <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                            <AIProcessingViz stage={
                              analysisStatus === 'uploading' ? 'Uploading Video...' :
                              analysisStatus === 'analyzing' ? 'AI Analyzing Form...' :
                              analysisStatus === 'complete' ? 'Analysis Complete!' :
                              'Error'
                            } />
                          </div>
                        )}
                      </div>
                      
                      {/* Progress */}
                      {analysisStatus !== 'idle' && analysisStatus !== 'error' && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-400">
                              {analysisStatus === 'uploading' ? 'Uploading...' :
                               analysisStatus === 'analyzing' ? 'AI Processing...' :
                               'Complete!'}
                            </span>
                            <span className="text-cyan-400">{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} className="h-2 bg-slate-800" />
                        </div>
                      )}
                      
                      {/* File Info & Actions */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium truncate max-w-xs">{selectedFile.name}</p>
                          <p className="text-slate-500 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                        <div className="flex gap-2">
                          {analysisStatus === 'idle' && (
                            <>
                              <Button variant="ghost" onClick={() => {
                                setSelectedFile(null)
                                setVideoPreview(null)
                              }}>
                                <X className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={handleUpload}
                                className="bg-gradient-to-r from-cyan-500 to-emerald-500"
                              >
                                <Brain className="w-4 h-4 mr-2" /> Analyze with AI
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {errorMessage && (
                        <p className="text-red-400 text-sm mt-2">{errorMessage}</p>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Tips Panel - 2 columns */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-900/60 border-slate-700/50 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                        <Lightbulb className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Pro Recording Tips</h3>
                        <p className="text-slate-400 text-sm">For best AI analysis</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {[
                        { icon: '📐', title: 'Side-On View', desc: 'Film perpendicular to court' },
                        { icon: '☀️', title: 'Good Lighting', desc: 'Natural daylight is best' },
                        { icon: '📱', title: 'Stable Camera', desc: 'Use tripod, 10-15ft away' },
                        { icon: '⏱️', title: 'Short Clips', desc: '10-30 sec, 1-3 shots' },
                        { icon: '🎬', title: '1080p Quality', desc: 'Higher res = better tracking' }
                      ].map((tip, i) => (
                        <motion.div
                          key={tip.title}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                        >
                          <span className="text-xl">{tip.icon}</span>
                          <div>
                            <p className="font-medium text-white text-sm">{tip.title}</p>
                            <p className="text-slate-400 text-xs">{tip.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="mt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            ) : videoLibrary.length === 0 ? (
              <motion.div 
                className="text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="mb-4">
                  <Film className="w-16 h-16 text-slate-600 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No videos yet</h3>
                <p className="text-slate-400 mb-6">Upload your first video to get AI-powered analysis</p>
                <Button onClick={() => setActiveTab('upload')} className="bg-gradient-to-r from-cyan-500 to-purple-500">
                  <Upload className="w-4 h-4 mr-2" /> Upload Video
                </Button>
              </motion.div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videoLibrary.map((video, i) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onMouseEnter={() => setHoveredVideo(video.id)}
                    onMouseLeave={() => setHoveredVideo(null)}
                    className="group"
                  >
                    <Card className="bg-slate-900/60 border-slate-700/50 overflow-hidden hover:border-cyan-500/50 transition-all duration-300">
                      {/* Video Thumbnail - Always visible */}
                      <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900">
                        {/* Show video element with poster/thumbnail */}
                        {/* Video with thumbnail - uses first frame as poster */}
                        <video
                          src={video.videoUrl}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          poster={video.thumbnailUrl}
                          ref={(el) => {
                            if (el && hoveredVideo === video.id) el.play()
                            if (el && hoveredVideo !== video.id) el.pause()
                          }}
                        />
                        {/* Fallback gradient overlay if no video */}
                        {!video.videoUrl && (
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 flex flex-col items-center justify-center">
                            <Video className="w-12 h-12 text-slate-500 mb-2" />
                            <p className="text-slate-400 text-xs">{video.fileName || 'Video'}</p>
                          </div>
                        )}
                        
                        {/* Play indicator */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className={cn(
                            "w-12 h-12 rounded-full bg-black/50 flex items-center justify-center transition-opacity",
                            hoveredVideo === video.id ? "opacity-0" : "opacity-100"
                          )}>
                            <Play className="w-5 h-5 text-white ml-0.5" />
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                          <Badge className={cn(
                            "text-xs",
                            video.analysisStatus === 'COMPLETED' ? 'bg-emerald-500/90' :
                            video.analysisStatus === 'PROCESSING' ? 'bg-cyan-500/90 animate-pulse' :
                            video.analysisStatus === 'FAILED' ? 'bg-red-500/90' :
                            'bg-slate-600/90'
                          )}>
                            {video.analysisStatus === 'COMPLETED' ? 'Analyzed' :
                             video.analysisStatus === 'PROCESSING' ? 'Processing...' :
                             video.analysisStatus === 'FAILED' ? 'Failed' : 'Pending'}
                          </Badge>
                        </div>
                        
                        {/* Score Badge */}
                        {video.analysisStatus === 'COMPLETED' && video.overallScore && (
                          <div className="absolute bottom-2 left-2">
                            <div className="bg-slate-900/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1">
                              <Target className="w-3 h-3 text-cyan-400" />
                              <span className="text-white font-bold text-sm">{video.overallScore}</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Hover Overlay */}
                        <AnimatePresence>
                          {hoveredVideo === video.id && video.analysisStatus === 'COMPLETED' && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center"
                            >
                              <Link href={`/train/analysis/${video.id}`}>
                                <Button className="bg-gradient-to-r from-cyan-500 to-emerald-500">
                                  <Eye className="w-4 h-4 mr-2" /> View Analysis
                                </Button>
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      {/* Card Footer */}
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="text-white font-medium text-sm truncate">
                              {video.title || video.fileName || 'Video'}
                            </p>
                            <p className="text-slate-500 text-xs">{formatDate(video.uploadedAt)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVideo(video.id)}
                            className="text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
