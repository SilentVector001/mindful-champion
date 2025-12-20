"use client"

import { useState, useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
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
  SortDesc, Tag, Calendar, CircleAlert
} from "lucide-react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { generateAnalysisPDF } from "@/lib/pdf-generator"
import type { VideoAnalysisData, VideoLibraryStats } from "@/lib/video-analysis-types"
import MainNavigation from "@/components/navigation/main-navigation"
import CompactNotificationCenter from "@/components/notifications/compact-notification-center"
import { AchievementToast, useAchievementNotifications } from "@/components/rewards/achievement-toast"
import { parseScore, formatScore, getSafeScore } from "@/lib/video-analysis/score-utils"
import { upload } from '@vercel/blob/client'

// Onboarding Walkthrough Component
function OnboardingWalkthrough({ 
  onComplete, 
  step 
}: { 
  onComplete: () => void
  step: number 
}) {
  const steps = [
    {
      title: "Upload your game footage",
      description: "Drop your video here or click to browse. We support MP4, MOV, and AVI files up to 500MB.",
      target: "upload-area",
      icon: Upload,
      position: "bottom"
    },
    {
      title: "AI analyzes every shot",
      description: "Coach Kai's neural networks analyze technique, movement patterns, shot selection, and strategic positioning.",
      target: "how-it-works",
      icon: Brain,
      position: "top"
    },
    {
      title: "Your videos live here",
      description: "View your library with AI scores, insights, and track your improvement over time.",
      target: "library-tab",
      icon: Library,
      position: "bottom"
    }
  ]

  const currentStep = steps[step - 1]
  if (!currentStep) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] pointer-events-none"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 pointer-events-auto" onClick={onComplete} />
      
      {/* Tooltip */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "absolute z-[101] pointer-events-auto",
          step === 1 && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          step === 2 && "bottom-32 left-1/2 -translate-x-1/2",
          step === 3 && "top-48 left-1/2 -translate-x-1/2"
        )}
      >
        <Card className="bg-slate-900 border-2 border-kai-primary shadow-2xl shadow-kai-primary/30 max-w-md mx-4">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-kai-primary to-kai-secondary flex items-center justify-center flex-shrink-0">
                <currentStep.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-kai-primary/20 text-kai-primary border-kai-primary/30">
                    Step {step} of 3
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{currentStep.title}</h3>
                <p className="text-slate-300 text-sm mb-4">{currentStep.description}</p>
                <div className="flex items-center justify-between">
                  <Link href="/help" className="text-kai-primary text-sm hover:underline flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    Need more help? Visit Help Center
                  </Link>
                  <Button
                    onClick={onComplete}
                    size="sm"
                    className="bg-gradient-to-r from-kai-primary to-kai-secondary"
                  >
                    {step === 3 ? "Got it!" : "Next"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-4">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    s === step ? "bg-kai-primary" : "bg-slate-600"
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// Video Card Component - Redesigned
function VideoCard({ 
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
  const statusConfig = {
    COMPLETED: { color: "bg-green-500", icon: CheckCircle2, label: "Complete", textColor: "text-green-400" },
    PROCESSING: { color: "bg-yellow-500", icon: Loader2, label: "Processing", textColor: "text-yellow-400", animate: true },
    PENDING: { color: "bg-slate-500", icon: Clock, label: "Pending", textColor: "text-slate-400" },
    FAILED: { color: "bg-red-500", icon: CircleAlert, label: "Failed", textColor: "text-red-400" }
  }
  
  const status = statusConfig[video.analysisStatus as keyof typeof statusConfig] || statusConfig.PENDING
  const StatusIcon = status.icon

  // Extract tags from video data
  const tags = video.shotTypes?.slice(0, 2).map(s => s.type) || []
  const extraTags = (video.shotTypes?.length || 0) - 2

  return (
    <motion.div
      initial={isNew ? { scale: 1.02, boxShadow: "0 0 30px rgba(0, 200, 255, 0.4)" } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, scale: 1, boxShadow: "none" }}
      transition={{ duration: isNew ? 1.5 : 0.3 }}
      whileHover={{ y: -6 }}
      className="relative group"
    >
      {isNew && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute -inset-1 rounded-xl bg-gradient-to-r from-kai-primary/50 to-kai-secondary/50 blur-md z-0"
        />
      )}
      
      <Card className="relative bg-card/40 backdrop-blur border-border/50 hover:border-kai-primary/50 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl z-10">
        {/* Thumbnail with Play Overlay */}
        <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
          {video.videoUrl ? (
            <video
              src={video.videoUrl}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              muted
              preload="metadata"
            />
          ) : video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <VideoIcon className="w-12 h-12 text-slate-600" />
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
          
          {/* Play overlay - always visible but subtle */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>

          {/* Status Badge - Top Right */}
          <div className="absolute top-3 right-3">
            <Badge className={cn(
              "backdrop-blur border-0 shadow-lg flex items-center gap-1.5 px-2.5 py-1",
              status.color + "/90 text-white"
            )}>
              <StatusIcon className={cn("w-3 h-3", status.animate && "animate-spin")} />
              {status.label}
            </Badge>
          </div>

          {/* AI Score - Bottom Left (if completed) */}
          {video.analysisStatus === 'COMPLETED' && video.overallScore && (
            <div className="absolute bottom-3 left-3">
              <div className="bg-black/80 backdrop-blur rounded-xl px-4 py-2 border border-kai-primary/30">
                <div className="text-2xl font-black text-kai-primary">
                  {Math.round(video.overallScore)}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  AI Score
                </div>
              </div>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          {/* Title */}
          <h4 className="font-semibold text-foreground mb-2 truncate group-hover:text-kai-primary transition-colors text-sm">
            {video.title}
          </h4>
          
          {/* Duration + Date */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            {video.duration && video.duration > 0 && (
              <>
                <span>{Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}</span>
                <span>•</span>
              </>
            )}
            <span>Uploaded {new Date(video.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex items-center gap-1.5 mb-4">
              {tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-[10px] px-2 py-0.5 bg-card/50 border-border/50">
                  {tag}
                </Badge>
              ))}
              {extraTags > 0 && (
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-card/50 border-border/50">
                  +{extraTags} more
                </Badge>
              )}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2">
            {video.analysisStatus === 'COMPLETED' ? (
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-kai-primary/20 to-kai-secondary/20 border border-kai-primary/40 text-kai-primary hover:from-kai-primary hover:to-kai-secondary hover:text-white text-xs h-8"
                asChild
              >
                <Link href={`/train/analysis/${video.id}`}>
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  View Results
                </Link>
              </Button>
            ) : video.analysisStatus === 'PENDING' || video.analysisStatus === 'FAILED' ? (
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 text-yellow-400 hover:from-yellow-500 hover:to-orange-500 hover:text-white text-xs h-8"
                onClick={() => onAnalyze(video.id, video.videoUrl)}
                disabled={analyzing}
              >
                {analyzing ? (
                  <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Analyzing...</>
                ) : (
                  <><Zap className="w-3.5 h-3.5 mr-1.5" />Analyze Now</>
                )}
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="flex-1 text-xs h-8" disabled>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Processing...
              </Button>
            )}
            
            {video.analysisStatus === 'COMPLETED' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownloadPDF(video)}
                className="border-border/50 hover:bg-card h-8 w-8 p-0"
              >
                <FileText className="w-3.5 h-3.5" />
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(video.id)}
              className="text-red-400 hover:text-white hover:bg-red-500 border-red-500/30 h-8 w-8 p-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Post-Upload Modal
function PostUploadModal({ 
  videoId, 
  onClose, 
  onViewVideo 
}: { 
  videoId: string
  onClose: () => void
  onViewVideo: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-kai-primary/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-kai-primary to-kai-secondary flex items-center justify-center"
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-2">Your video is being analyzed</h3>
          <p className="text-slate-400 text-sm mb-6">
            Coach Kai is analyzing your technique, movement, and strategy. This usually takes 2-5 minutes.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={onViewVideo}
              className="flex-1 bg-gradient-to-r from-kai-primary to-kai-secondary hover:opacity-90"
            >
              View Video
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function VideoAnalysisHub() {
  const { data: session } = useSession() || {}
  const { achievements, isShowing, dismissAchievements, checkForAchievements } = useAchievementNotifications()
  
  const UPLOAD_METHOD: 'client' | 'proxy' = 'client'
  
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

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(1)
  
  // Filter & Sort state
  const [showFilterSort, setShowFilterSort] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'status'>('date')
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'processing'>('all')
  
  // Post-upload modal
  const [showPostUploadModal, setShowPostUploadModal] = useState(false)
  const [newVideoId, setNewVideoId] = useState<string | null>(null)
  
  // How it works section
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  const userTier = (session?.user as any)?.subscriptionTier || 'FREE'

  // Check for first visit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeenOnboarding = localStorage.getItem('mc_video_onboarding_complete')
      if (!hasSeenOnboarding) {
        setShowOnboarding(true)
      }
    }
  }, [])

  const handleOnboardingComplete = () => {
    if (onboardingStep < 3) {
      setOnboardingStep(prev => prev + 1)
    } else {
      setShowOnboarding(false)
      localStorage.setItem('mc_video_onboarding_complete', 'true')
    }
  }

  // Load video library
  useEffect(() => {
    if (session?.user) {
      fetchVideoLibrary()
      fetchLibraryStats()
    }
  }, [session])

  // Auto-trigger analysis for stuck PENDING videos
  useEffect(() => {
    if (!session?.user || videoLibrary.length === 0) return
    
    const pendingVideos = videoLibrary.filter(v => v.analysisStatus === 'PENDING')
    
    if (pendingVideos.length > 0) {
      const recentPending = pendingVideos.filter(v => {
        const uploadTime = new Date(v.uploadedAt).getTime()
        const minutesAgo = (Date.now() - uploadTime) / (1000 * 60)
        return minutesAgo <= 10
      })
      
      if (recentPending.length > 0) {
        const video = recentPending[0]
        setTimeout(() => {
          handleManualAnalysis(video.id, video.videoUrl)
        }, 2000)
      }
    }
  }, [videoLibrary.length])

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
      
      // Clear file selection
      setSelectedFile(null)
      setVideoPreview(null)
      
      // Store new video ID for highlighting
      setNewVideoId(videoId || null)
      
      // Show post-upload modal (light, non-blocking)
      setShowPostUploadModal(true)
      
      // Switch to library tab to show the new video
      setActiveTab('library')
      
      // Refresh library immediately
      await fetchVideoLibrary()
      await fetchLibraryStats()
      
      // Check for achievements
      setTimeout(() => checkForAchievements('video'), 1000)
      
      // Start analysis in background
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

  return (
    <>
      <MainNavigation user={session?.user} />
      
      {/* Onboarding Walkthrough */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingWalkthrough
            step={onboardingStep}
            onComplete={handleOnboardingComplete}
          />
        )}
      </AnimatePresence>

      {/* Post-Upload Modal */}
      <AnimatePresence>
        {showPostUploadModal && (
          <PostUploadModal
            videoId={newVideoId || ''}
            onClose={() => setShowPostUploadModal(false)}
            onViewVideo={() => {
              setShowPostUploadModal(false)
              if (newVideoId) {
                // Scroll to library
              }
            }}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
        {/* Compact Header */}
        <div className="sticky top-0 z-40 backdrop-blur-lg bg-background/80 border-b border-border">
          <div className="container mx-auto max-w-6xl px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-kai-primary to-kai-secondary p-0.5">
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                    <Brain className="w-5 h-5 text-kai-primary" />
                  </div>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Video Analysis Lab</h1>
                  <p className="text-xs text-muted-foreground">AI-powered game analysis by Coach Kai</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CompactNotificationCenter position="relative" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOnboarding(true)}
                  className="text-muted-foreground"
                >
                  <HelpCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-card/50 border border-border">
                <TabsTrigger 
                  value="upload" 
                  className="data-[state=active]:bg-kai-primary/20 data-[state=active]:text-kai-primary"
                  id="upload-area"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </TabsTrigger>
                <TabsTrigger 
                  value="library" 
                  className="data-[state=active]:bg-kai-primary/20 data-[state=active]:text-kai-primary"
                  id="library-tab"
                >
                  <Library className="w-4 h-4 mr-2" />
                  My Library
                  {libraryStats.totalVideos > 0 && (
                    <Badge className="ml-2 bg-kai-primary/20 text-kai-primary border-0 text-xs">
                      {libraryStats.totalVideos}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Filter & Sort Button (Library tab only) */}
              {activeTab === 'library' && videoLibrary.length > 0 && (
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilterSort(!showFilterSort)}
                    className="border-border/50"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filter & Sort
                    <ChevronDown className={cn("w-3 h-3 ml-2 transition-transform", showFilterSort && "rotate-180")} />
                  </Button>
                  
                  <AnimatePresence>
                    {showFilterSort && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-xl p-4 z-50"
                      >
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sort By</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {[
                                { value: 'date', label: 'Date' },
                                { value: 'score', label: 'AI Score' },
                                { value: 'status', label: 'Status' }
                              ].map((opt) => (
                                <Button
                                  key={opt.value}
                                  size="sm"
                                  variant={sortBy === opt.value ? "default" : "outline"}
                                  onClick={() => setSortBy(opt.value as any)}
                                  className={cn("text-xs h-7", sortBy === opt.value && "bg-kai-primary")}
                                >
                                  {opt.label}
                                </Button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Filter</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {[
                                { value: 'all', label: 'All' },
                                { value: 'complete', label: 'Complete' },
                                { value: 'processing', label: 'Processing' }
                              ].map((opt) => (
                                <Button
                                  key={opt.value}
                                  size="sm"
                                  variant={filterStatus === opt.value ? "default" : "outline"}
                                  onClick={() => setFilterStatus(opt.value as any)}
                                  className={cn("text-xs h-7", filterStatus === opt.value && "bg-kai-primary")}
                                >
                                  {opt.label}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-6">
              <Card className="bg-card/40 backdrop-blur border-border/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-kai-primary to-kai-secondary flex items-center justify-center">
                        <VideoIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Upload Your Game Footage</CardTitle>
                        <CardDescription>MP4, MOV, AVI • Up to 500MB</CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Coach Kai Ready
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {!selectedFile ? (
                    <div
                      {...getRootProps()}
                      className={cn(
                        "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300",
                        isDragActive 
                          ? "border-kai-primary bg-kai-primary/10" 
                          : "border-border/50 hover:border-kai-primary/50 hover:bg-card/30"
                      )}
                    >
                      <input {...getInputProps()} />
                      <motion.div
                        animate={isDragActive ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.5, repeat: isDragActive ? Infinity : 0 }}
                      >
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-kai-primary to-kai-secondary flex items-center justify-center">
                          <Upload className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {isDragActive ? "Drop your video here!" : "📹 Drag & drop your video here"}
                        </h3>
                        <p className="text-muted-foreground mb-4">or click to browse your files</p>
                        <Button className="bg-gradient-to-r from-kai-primary to-kai-secondary">
                          <VideoIcon className="w-4 h-4 mr-2" />
                          Select Video File
                        </Button>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {videoPreview && (
                        <div className="aspect-video relative rounded-xl overflow-hidden bg-black">
                          <video src={videoPreview} controls className="w-full h-full" />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-kai-primary to-kai-secondary flex items-center justify-center">
                            <FileVideo className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground truncate max-w-[200px]">{selectedFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => { setSelectedFile(null); setVideoPreview(null); }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>

                      {uploading && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Uploading...
                            </span>
                            <span className="text-foreground font-medium">{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} className="h-2" />
                        </div>
                      )}

                      {analyzing && (
                        <Alert className="bg-kai-primary/10 border-kai-primary/30">
                          <Brain className="w-4 h-4 text-kai-primary animate-pulse" />
                          <AlertDescription className="text-foreground">
                            Coach Kai is analyzing your video... This may take a few minutes.
                          </AlertDescription>
                        </Alert>
                      )}

                      {!uploading && !analyzing && (
                        <Button
                          onClick={handleUploadAndAnalyze}
                          className="w-full bg-gradient-to-r from-kai-primary to-kai-secondary h-12 text-lg font-semibold"
                          size="lg"
                        >
                          <Brain className="w-5 h-5 mr-2" />
                          Analyze with Coach Kai
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Collapsible How It Works Section */}
              <div id="how-it-works">
                <Button
                  variant="ghost"
                  onClick={() => setShowHowItWorks(!showHowItWorks)}
                  className="w-full justify-between text-muted-foreground hover:text-foreground py-3"
                >
                  <span className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    How Mindful Champion analyzes your game
                  </span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", showHowItWorks && "rotate-180")} />
                </Button>
                
                <AnimatePresence>
                  {showHowItWorks && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid md:grid-cols-4 gap-4 pt-4">
                        {[
                          { icon: Target, label: "Shot Detection", desc: "Identifies all shot types", color: "from-cyan-500 to-blue-500" },
                          { icon: Activity, label: "Movement Tracking", desc: "Analyzes footwork & positioning", color: "from-green-500 to-emerald-500" },
                          { icon: Gauge, label: "Technique Scoring", desc: "Scores form & execution", color: "from-amber-500 to-yellow-500" },
                          { icon: TrendingUp, label: "Progress Insights", desc: "Tracks improvement over time", color: "from-purple-500 to-pink-500" }
                        ].map((feature, idx) => (
                          <Card key={idx} className="bg-card/30 border-border/50">
                            <CardContent className="p-4 text-center">
                              <div className={cn("w-12 h-12 mx-auto rounded-lg bg-gradient-to-br flex items-center justify-center mb-3", feature.color)}>
                                <feature.icon className="w-6 h-6 text-white" />
                              </div>
                              <h4 className="font-semibold text-foreground text-sm mb-1">{feature.label}</h4>
                              <p className="text-xs text-muted-foreground">{feature.desc}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>

            {/* Library Tab */}
            <TabsContent value="library" className="space-y-6">
              {videoLibrary.length === 0 ? (
                <Card className="bg-card/30 border-border/50">
                  <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 flex items-center justify-center">
                      <Film className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No videos yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      Upload your first game footage and let Coach Kai analyze your technique!
                    </p>
                    <Button 
                      onClick={() => setActiveTab('upload')} 
                      className="bg-gradient-to-r from-kai-primary to-kai-secondary"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Your First Video
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredVideos.map((video, idx) => (
                    <VideoCard
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
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Floating Coach Kai Button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
          className="fixed bottom-4 right-4 z-40"
        >
          <Link href="/coach">
            <Button className="w-14 h-14 rounded-full bg-gradient-to-r from-kai-primary to-kai-secondary shadow-lg hover:shadow-xl">
              <Brain className="w-7 h-7 text-white" />
            </Button>
          </Link>
        </motion.div>
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
