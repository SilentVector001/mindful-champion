
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
  Shield, Wifi, Mic, ChevronDown, X, Menu, BookOpen, Settings
} from "lucide-react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { generateAnalysisPDF } from "@/lib/pdf-generator"
import type { VideoAnalysisData, VideoLibraryStats } from "@/lib/video-analysis-types"
import MainNavigation from "@/components/navigation/main-navigation"
import CompactNotificationCenter from "@/components/notifications/compact-notification-center"
import { AchievementToast, useAchievementNotifications } from "@/components/rewards/achievement-toast"
import { upload } from '@vercel/blob/client'

export default function VideoAnalysisHub() {
  const { data: session } = useSession() || {}
  const { achievements, isShowing, dismissAchievements, checkForAchievements } = useAchievementNotifications()
  
  // Upload method: 'client' = direct to Blob (bypasses 4.5MB limit), 'proxy' = server proxy
  const UPLOAD_METHOD: 'client' | 'proxy' = 'client' // Use client-side direct upload
  
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
    storageLimit: 5000, // 5GB
    recentlyAnalyzed: 0,
    avgImprovement: 0
  })

  // New interactive states
  const [showCoachKaiChat, setShowCoachKaiChat] = useState(false)
  const [showTipsDropdown, setShowTipsDropdown] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [showRecentAnalyses, setShowRecentAnalyses] = useState(false)
  const [coachTipOfDay, setCoachTipOfDay] = useState("")

  const userTier = (session?.user as any)?.subscriptionTier || 'FREE'
  const isPro = userTier === 'PRO'

  // Coach Kai tips for the day
  const coachKaiTips = [
    "Film 10-30 sec clips from baseline, side-on view 📹",
    "Shoot in daylight - natural light = better analysis ☀️", 
    "Keep camera steady on tripod or stable surface 🎯",
    "Capture 1-3 shots per clip, not full rallies 🧠",
    "Use 1080p, position camera 10-15 ft from court ⚡"
  ]

  // Initialize tip of the day
  useEffect(() => {
    if (!coachTipOfDay) {
      const randomTip = coachKaiTips[Math.floor(Math.random() * coachKaiTips.length)]
      setCoachTipOfDay(randomTip)
    }
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
    
    // Poll every 5 seconds if there are processing videos
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
        // API returns 'analyses', not 'videos'
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
    maxSize: 500 * 1024 * 1024, // 500MB
    multiple: false
  })

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      alert('❌ Please select a video file first.')
      return
    }

    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
    if (!validTypes.includes(selectedFile.type)) {
      alert('❌ Invalid file type. Please upload a video file (MP4, MOV, AVI, or WebM).')
      return
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (selectedFile.size > maxSize) {
      alert('❌ File too large. Maximum size is 500MB.')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      console.log('='.repeat(80))
      console.log('[Upload] 🎬 Starting video upload process')
      console.log('[Upload] Method:', UPLOAD_METHOD === 'client' ? 'Client Direct Upload (bypasses 4.5MB limit)' : 'Server Proxy')
      console.log('[Upload] File:', selectedFile.name)
      console.log('[Upload] Size:', `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`)
      console.log('[Upload] Type:', selectedFile.type)
      console.log('='.repeat(80))

      let key: string
      let videoUrl: string | undefined
      let videoId: string | undefined

      if (UPLOAD_METHOD === 'client') {
        // ============================================
        // CLIENT-SIDE DIRECT UPLOAD (Bypasses 4.5MB limit)
        // Uploads directly to Vercel Blob storage
        // ============================================
        console.log('[Upload] Using client-side direct upload to Vercel Blob')
        
        try {
          // Upload directly to Vercel Blob using client SDK
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
              if (percentComplete % 10 === 0) {
                console.log(`[Upload] 📤 Progress: ${percentComplete}%`)
              }
            }
          })

          console.log('[Upload] ✅ Client direct upload successful:', blob.url)
          key = blob.url
          videoUrl = blob.url

          // Save video record to database
          console.log('[Upload] 💾 Saving video record to database...')
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
          console.log('[Upload] ✅ Video record saved:', videoId)

        } catch (uploadError: any) {
          console.error('[Upload] ❌ Client upload failed:', uploadError)
          throw new Error(uploadError.message || 'Upload failed. Please try again.')
        }

      } else {
        // ============================================
        // SERVER PROXY UPLOAD (Legacy - has 4.5MB limit on Vercel)
        // ============================================
        console.log('[Upload] Using server-side proxy upload')
        
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('fileName', selectedFile.name)

        const xhr = new XMLHttpRequest()
        
        const uploadPromise = new Promise<{key: string, url: string, videoId: string}>((resolve, reject) => {
          let lastReportedProgress = 0
          let uploadComplete = false
          
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = (e.loaded / e.total) * 100
              const rounded = Math.round(percentComplete)
              setUploadProgress(rounded)
              
              if (rounded >= lastReportedProgress + 10 || rounded === 100) {
                console.log(`[Upload] 📤 Upload progress: ${rounded}%`)
                lastReportedProgress = rounded
              }
              
              if (rounded === 100 && !uploadComplete) {
                uploadComplete = true
                console.log('[Upload] 📤 Upload complete, waiting for server processing...')
              }
            }
          })

          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              try {
                const response = JSON.parse(xhr.responseText)
                console.log('[Upload] ✅ Server proxy upload successful')
                resolve({ key: response.key, url: response.url, videoId: response.videoId })
              } catch (parseError) {
                reject(new Error('Invalid server response. Please try again.'))
              }
            } else {
              let errorMessage = `Upload failed with status ${xhr.status}`
              try {
                const errorData = JSON.parse(xhr.responseText || '{}')
                errorMessage = errorData.error || errorData.details || errorMessage
              } catch (e) {}
              reject(new Error(errorMessage))
            }
          })

          xhr.addEventListener('error', () => reject(new Error('Network error. Please check your connection.')))
          xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))
          xhr.addEventListener('timeout', () => reject(new Error('Upload timed out. Try a smaller file.')))

          xhr.open('POST', '/api/video-analysis/upload-proxy')
          xhr.timeout = 300000
          xhr.send(formData)
        })

        const result = await uploadPromise
        key = result.key
        videoUrl = result.url
        videoId = result.videoId
      }

      setUploadProgress(100)
      console.log('[Upload] ✅ Upload complete!')

      // Only confirm upload for legacy proxy method (client upload handles this)
      if (UPLOAD_METHOD === 'proxy' && !videoId) {
        console.log('[Upload] Saving video record to database...')
        const confirmRes = await fetch('/api/video-analysis/confirm-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key,
            title: selectedFile.name, // Add title field
            fileName: selectedFile.name,
            fileSize: selectedFile.size
          })
        })

        if (!confirmRes.ok) {
          const errorData = await confirmRes.json().catch(() => ({ error: 'Unknown error', code: 'UNKNOWN' }))
          const errorCode = errorData.code
          
          console.error('[Upload] ❌ Failed to confirm upload')
          console.error('[Upload] Error code:', errorCode)
          console.error('[Upload] Error details:', errorData)
          
          // Provide user-friendly error messages
          if (errorCode === 'USER_NOT_FOUND' || errorCode === 'INVALID_SESSION') {
            throw new Error('Your session has expired. Please refresh the page and log in again.')
          } else if (errorCode === 'FOREIGN_KEY_ERROR') {
            throw new Error('Account validation failed. Please refresh the page and try again.')
          } else {
            throw new Error(errorData.error || 'Failed to save video record. Please try again.')
          }
        }

        const data = await confirmRes.json()
        videoId = data.videoId
        console.log('[Upload] ✅ Database record saved')
        console.log('[Upload] Video ID:', videoId)
      } else {
        console.log('[Upload] ✅ Database record already created by proxy upload')
        console.log('[Upload] Video ID:', videoId)
      }

      const data = { videoId, videoUrl }
      console.log('='.repeat(80))
      console.log('[Upload] 🎉 UPLOAD SUCCESSFUL!')
      console.log('='.repeat(80))
      
      setUploadProgress(100)
      setUploading(false)
      
      // Check for achievements after upload
      setTimeout(() => {
        checkForAchievements('video')
      }, 1000)
      
      // Show success message
      alert('✅ Upload complete! Starting AI analysis...\n\nThis may take a few minutes. Check the "My Library" tab for results.')
      
      // Start analysis
      setAnalyzing(true)
      await analyzeVideo(data.videoId, videoUrl || data.videoUrl)
    } catch (error) {
      console.error('='.repeat(80))
      console.error('[Upload] ❌ UPLOAD FAILED')
      console.error('[Upload] Error:', error)
      if (error instanceof Error) {
        console.error('[Upload] Error message:', error.message)
        console.error('[Upload] Error stack:', error.stack)
      }
      console.error('='.repeat(80))
      
      setUploading(false)
      setUploadProgress(0)
      
      // Show specific error message with troubleshooting hints
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.'
      const troubleshootingMsg = '\n\n💡 Troubleshooting:\n' +
        '• Check your internet connection\n' +
        '• Try a smaller video file (max 500MB)\n' +
        '• Ensure file is in MP4, MOV, AVI, or WebM format\n' +
        '• If problem persists, refresh the page and try again'
      
      alert(`❌ Upload Failed\n\n${errorMessage}${troubleshootingMsg}`)
    }
  }

  const analyzeVideo = async (videoId: string, videoUrl: string) => {
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
        
        // Show success message with clear next steps
        alert(`✅ Analysis Complete!\n\n🎯 Your Overall Score: ${Math.round(data.overallScore)}/100\n\n📊 Your video has been analyzed! Switch to the "My Library" tab to view detailed results and insights.`)
        
        // Refresh library and switch to library tab
        await fetchVideoLibrary()
        await fetchLibraryStats()
        setActiveTab('library')
        
        // Clear selected file
        setSelectedFile(null)
        setVideoPreview(null)
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Analysis failed' }))
        throw new Error(errorData.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      setAnalyzing(false)
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed'
      alert(`❌ Analysis Failed\n\n${errorMessage}\n\nPlease try uploading your video again. If the problem persists, contact support.`)
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return
    }

    try {
      const res = await fetch(`/api/video-analysis/${videoId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        // Remove from local state
        setVideoLibrary(prev => prev.filter(v => v.id !== videoId))
        // Refresh stats
        await fetchLibraryStats()
        alert('✅ Video deleted successfully')
      } else {
        throw new Error('Failed to delete video')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('❌ Failed to delete video. Please try again.')
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

    // Open in new window for print/save
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(pdfHTML)
      printWindow.document.close()
    }
  }

  return (
    <>
      {/* Main Navigation Header with Hamburger Menu */}
      <MainNavigation user={session?.user} />
      
    <div className="min-h-screen bg-gradient-to-b from-background via-muted to-background relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-kai-primary/10 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-kai-secondary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Top Navigation Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border shadow-lg"
      >
        <div className="container mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Breadcrumbs & Coach Kai Avatar */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-kai-primary to-kai-secondary p-0.5 shadow-lg shadow-kai-primary/50">
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                    <Brain className="w-5 h-5 text-kai-primary animate-breathing" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                    Home
                  </Link>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                  <Link href="/train" className="text-muted-foreground hover:text-foreground transition-colors">
                    Train
                  </Link>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                  <span className="text-kai-primary font-medium">Video Analysis</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <CompactNotificationCenter position="relative" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRecentAnalyses(!showRecentAnalyses)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Library className="w-4 h-4 mr-2" />
                Library
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHowItWorks(!showHowItWorks)}
                className="text-muted-foreground hover:text-foreground"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTipsDropdown(!showTipsDropdown)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Pro Tips
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
                <AnimatePresence>
                  {showTipsDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border-2 border-kai-primary/50 rounded-lg shadow-2xl p-4 z-50"
                    >
                      <h4 className="font-bold text-foreground mb-3 flex items-center gap-2 text-lg">
                        <Brain className="w-5 h-5 text-kai-primary" />
                        Coach Kai's Pro Tips
                      </h4>
                      <div className="space-y-2">
                        {coachKaiTips.map((tip, idx) => (
                          <div key={idx} className="text-sm text-foreground font-medium p-3 bg-slate-800 rounded border-l-4 border-kai-primary shadow-md">
                            {tip}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hero Section with Coach Kai Integration */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-kai-primary/10 to-kai-secondary/10" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-gradient-to-r from-kai-primary to-kai-secondary text-white border-0 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              Powered by Coach Kai AI
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6 drop-shadow-2xl">
              See What You Can't{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 relative drop-shadow-2xl">
                See
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-cyan-400/30 to-blue-400/30 rounded-lg blur-xl"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </span>
            </h1>
            <p className="text-xl text-foreground font-medium max-w-3xl mx-auto mb-8 drop-shadow-lg">
              Coach Kai's advanced AI analyzes every shot, movement, and decision—giving you insights that transform your game.
            </p>

            {/* Coach Kai Welcome Message - Enhanced for better readability */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur border-4 border-kai-primary/70 rounded-3xl p-8 max-w-3xl mx-auto mb-8 shadow-2xl shadow-kai-primary/30 hover:shadow-kai-primary/50 transition-all duration-300"
            >
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-kai-primary to-kai-secondary flex items-center justify-center flex-shrink-0 shadow-lg ring-4 ring-kai-primary/30">
                  <Brain className="w-10 h-10 text-white drop-shadow-lg" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-black text-white mb-3 text-3xl drop-shadow-lg tracking-tight">💡 Today's Pro Tip from Coach Kai</h3>
                  <p className="text-white text-2xl font-bold leading-relaxed drop-shadow-md">{coachTipOfDay}</p>
                </div>
              </div>
            </motion.div>



            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <Button
                onClick={() => setShowHowItWorks(!showHowItWorks)}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 border-2 border-cyan-400/50 text-white font-bold hover:from-cyan-500 hover:to-blue-500 shadow-xl shadow-cyan-500/30"
              >
                <Play className="w-4 h-4 mr-2" />
                Quick Start Guide
              </Button>
              <Button
                className="border-2 border-white bg-transparent text-white font-bold hover:bg-white hover:text-slate-900 shadow-xl"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Examples
              </Button>
              <Button
                onClick={() => setShowCoachKaiChat(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400/50 text-white font-bold hover:from-purple-500 hover:to-pink-500 shadow-xl shadow-purple-500/30"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask Coach Kai
              </Button>
            </div>
          </motion.div>

          {/* Enhanced Floating Feature Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {[
              {
                image: "https://cdn.abacus.ai/images/e2b1aa1b-d6f2-4341-9296-324156f05f0e.png",
                step: "1",
                title: "Record Your Game",
                desc: "Any device • All formats • Up to 500MB",
                color: "from-green-500 to-emerald-500",
                delay: 0.1
              },
              {
                image: "https://cdn.abacus.ai/images/2470ac2a-c810-4c3b-982f-f95bd2b187b6.png",
                step: "2",
                title: "AI Analyzes Every Shot",
                desc: "Shot tracking • Movement analysis • Technique scoring",
                color: "from-blue-500 to-cyan-500",
                delay: 0.2
              },
              {
                image: "https://cdn.abacus.ai/images/bbe20fff-0d44-4a08-90af-f116a554a05a.png",
                step: "3",
                title: "Review Detailed Insights",
                desc: "Pro-level metrics • Visual heatmaps • Key moments",
                color: "from-purple-500 to-pink-500",
                delay: 0.3
              },
              {
                image: "https://cdn.abacus.ai/images/cd3440d7-0eab-48a5-b4c6-97da95c330e9.png",
                step: "4",
                title: "Track Your Improvement",
                desc: "Before/after • Progress trends • Printable reports",
                color: "from-orange-500 to-yellow-500",
                delay: 0.4
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: item.delay }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-kai-primary/10 to-kai-secondary/10 rounded-xl blur-xl group-hover:from-cyan-500/20 group-hover:to-blue-500/20 transition-all duration-500"></div>
                <Card className="relative bg-card/50 backdrop-blur border-border/50 hover:border-kai-primary/50 transition-all duration-300 overflow-hidden shadow-2xl hover:shadow-kai-primary/20">
                  <div className="aspect-video relative rounded-t-lg overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                    <div className="absolute top-3 left-3">
                      <div className={cn("w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shadow-2xl border-2 border-white/20", item.color)}>
                        {item.step}
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-kai-primary" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-kai-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-foreground font-medium mb-4 leading-relaxed">{item.desc}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-kai-primary hover:text-white hover:bg-cyan-500/10 w-full font-semibold"
                    >
                      Learn More
                      <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Features Grid */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-4 gap-4 mb-12"
          >
            {[
              { icon: Brain, label: "AI-Powered Analysis", color: "from-purple-500 to-pink-500", description: "Advanced neural networks" },
              { icon: Zap, label: "Results in Minutes", color: "from-yellow-500 to-orange-500", description: "Lightning-fast processing" },
              { icon: TrendingUp, label: "Pro-Level Insights", color: "from-green-500 to-emerald-500", description: "Professional-grade metrics" },
              { icon: Users, label: "10,000+ Players", color: "from-blue-500 to-cyan-500", description: "Trusted worldwide" }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4, scale: 1.05 }}
                className="bg-card/30 backdrop-blur border border-border/50 rounded-xl p-6 text-center group hover:border-kai-primary/30 transition-all duration-300 shadow-lg hover:shadow-2xl"
              >
                <div className={cn("w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300", feature.color)}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-lg font-semibold text-foreground mb-1 group-hover:text-kai-primary transition-colors">
                  {feature.label}
                </div>
                <div className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  {feature.description}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto max-w-7xl px-4 pb-20">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-card/50 border border-border">
              <TabsTrigger value="upload" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-kai-primary">
                <Upload className="w-4 h-4" />
                Upload Video
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-kai-primary">
                <Film className="w-4 h-4" />
                My Library
                {libraryStats.totalVideos > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-cyan-500/20 text-kai-primary border-kai-primary/30">
                    {libraryStats.totalVideos}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Enhanced Upload Tab */}
            <TabsContent value="upload">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-kai-primary/5 to-kai-secondary/5 rounded-xl blur-xl"></div>
                <Card className="relative bg-card/30 backdrop-blur border-border/50 hover:border-kai-primary/30 transition-all duration-300 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-kai-primary to-kai-secondary flex items-center justify-center">
                        <VideoIcon className="w-4 h-4 text-white" />
                      </div>
                      Upload Your Game Footage
                      <Badge className="ml-auto bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                        Coach Kai Ready
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      🎯 Record with any device • Supports MP4, MOV, AVI formats • Up to 500MB
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!selectedFile ? (
                      <div
                        {...getRootProps()}
                        className={cn(
                          "relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300",
                          isDragActive 
                            ? "border-kai-primary bg-cyan-500/10 shadow-lg shadow-cyan-500/20" 
                            : "border-muted hover:border-kai-primary/50 hover:bg-card/30",
                          "bg-card/30 backdrop-blur group"
                        )}
                      >
                        <input {...getInputProps()} />
                        <div className="absolute inset-0 bg-gradient-to-br from-kai-primary/5 to-kai-secondary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <motion.div
                          animate={isDragActive ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.5, repeat: isDragActive ? Infinity : 0 }}
                          className="relative z-10"
                        >
                          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-kai-primary to-kai-secondary flex items-center justify-center shadow-2xl">
                            <Upload className="w-12 h-12 text-white" />
                          </div>
                          <h3 className="text-2xl font-semibold text-foreground mb-2">
                            {isDragActive ? "🎯 Drop your video here!" : "📹 Drag & drop your video here"}
                          </h3>
                          <p className="text-muted-foreground mb-6">or click to browse your files</p>
                          <Button className="bg-gradient-to-r from-kai-primary to-kai-secondary hover:from-kai-primary/90 hover:to-kai-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300">
                            <VideoIcon className="w-4 h-4 mr-2" />
                            Select Video File
                          </Button>
                        </motion.div>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                      >
                        {videoPreview && (
                          <div className="aspect-video relative rounded-xl overflow-hidden bg-black shadow-2xl">
                            <video src={videoPreview} controls className="w-full h-full" />
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-green-500/90 text-white">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Ready for Analysis
                              </Badge>
                            </div>
                          </div>
                        )}
                        
                        <Card className="bg-card/50 border-border">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-kai-primary to-kai-secondary flex items-center justify-center">
                                  <FileVideo className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground">{selectedFile.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for Coach Kai
                                  </p>
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => { setSelectedFile(null); setVideoPreview(null); }}
                                className="border-muted hover:bg-slate-800"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        {uploading && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                          >
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading to Coach Kai...
                              </span>
                              <span className="text-foreground font-medium">{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-3 bg-slate-700">
                              <div className="h-full bg-gradient-to-r from-kai-primary to-kai-secondary transition-all duration-300 rounded-full" />
                            </Progress>
                          </motion.div>
                        )}

                        {analyzing && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <Alert className="bg-gradient-to-r from-kai-primary/10 to-kai-secondary/10 border-kai-primary/50 shadow-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-kai-primary to-kai-secondary flex items-center justify-center">
                                  <Brain className="w-5 h-5 text-white animate-pulse" />
                                </div>
                                <div>
                                  <AlertDescription className="text-foreground font-medium">
                                    🧠 Coach Kai is analyzing your video...
                                  </AlertDescription>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    This may take a few minutes. Analyzing technique, movement, and strategy.
                                  </p>
                                </div>
                              </div>
                            </Alert>
                          </motion.div>
                        )}

                        {!uploading && !analyzing && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <Button
                              onClick={handleUploadAndAnalyze}
                              className="w-full bg-gradient-to-r from-kai-primary to-kai-secondary hover:from-kai-primary/90 hover:to-kai-secondary/90 h-14 text-lg font-semibold shadow-2xl hover:shadow-kai-primary/20 transition-all duration-300"
                              size="lg"
                            >
                              <Brain className="w-6 h-6 mr-3" />
                              Analyze with Coach Kai AI
                              <ArrowRight className="w-6 h-6 ml-3" />
                            </Button>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Enhanced Library Tab */}
            <TabsContent value="library" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Enhanced Stats Dashboard */}
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    {
                      icon: Film,
                      label: "Total Videos",
                      value: libraryStats.totalVideos,
                      gradient: "from-kai-primary/20 to-kai-secondary/20",
                      border: "border-kai-primary/30",
                      iconColor: "text-kai-primary",
                      delay: 0.1
                    },
                    {
                      icon: CheckCircle2,
                      label: "Analyzed",
                      value: libraryStats.totalAnalyzed,
                      gradient: "from-green-500/20 to-emerald-500/20",
                      border: "border-green-500/30",
                      iconColor: "text-green-400",
                      delay: 0.2
                    },
                    {
                      icon: HardDrive,
                      label: "Storage Used",
                      value: `${(libraryStats.storageUsed / 1024).toFixed(1)}GB`,
                      gradient: "from-purple-500/20 to-pink-500/20",
                      border: "border-purple-500/30",
                      iconColor: "text-purple-400",
                      delay: 0.3,
                      extra: (
                        <div className="mt-2">
                          <Progress 
                            value={(libraryStats.storageUsed / libraryStats.storageLimit) * 100} 
                            className="h-2 bg-slate-700"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            of {(libraryStats.storageLimit / 1024).toFixed(0)}GB limit
                          </p>
                        </div>
                      )
                    },
                    {
                      icon: TrendingUp,
                      label: "Avg Improvement",
                      value: `+${libraryStats.avgImprovement}%`,
                      gradient: "from-orange-500/20 to-yellow-500/20",
                      border: "border-orange-500/30",
                      iconColor: "text-orange-400",
                      delay: 0.4
                    }
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: stat.delay }}
                      whileHover={{ y: -4, scale: 1.02 }}
                    >
                      <Card className={cn("bg-gradient-to-br backdrop-blur group hover:shadow-2xl transition-all duration-300", stat.gradient, stat.border)}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className={cn("w-12 h-12 rounded-lg bg-card/50 flex items-center justify-center shadow-lg", stat.iconColor)}>
                              <stat.icon className="w-6 h-6" />
                            </div>
                            <Badge className="bg-card/50 text-foreground border-border">
                              {typeof stat.value === 'number' ? stat.value : stat.value}
                            </Badge>
                          </div>
                          <p className="text-2xl font-bold text-foreground mb-1 group-hover:scale-105 transition-transform">
                            {stat.value}
                          </p>
                          <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            {stat.label}
                          </p>
                          {stat.extra}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Enhanced Video Grid */}
                {videoLibrary.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card className="bg-card/30 backdrop-blur border-border/50 hover:border-kai-primary/30 transition-all duration-300 shadow-xl">
                      <CardContent className="p-12 text-center">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                          className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 flex items-center justify-center shadow-2xl"
                        >
                          <Film className="w-12 h-12 text-muted-foreground" />
                        </motion.div>
                        <h3 className="text-2xl font-semibold text-foreground mb-3">🎬 No videos yet</h3>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                          Upload your first game footage and let Coach Kai analyze your technique, movement, and strategy!
                        </p>
                        <Button 
                          onClick={() => setActiveTab('upload')} 
                          className="bg-gradient-to-r from-kai-primary to-kai-secondary hover:from-kai-primary/90 hover:to-kai-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300"
                          size="lg"
                        >
                          <Upload className="w-5 h-5 mr-2" />
                          Upload Your First Video
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videoLibrary.map((video, idx) => (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + idx * 0.1 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className="relative group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-kai-primary/5 to-kai-secondary/5 rounded-xl blur-xl group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-500"></div>
                        <Card className="relative bg-card/30 backdrop-blur border-border/50 hover:border-kai-primary/50 transition-all duration-300 overflow-hidden shadow-2xl hover:shadow-kai-primary/20">
                          <div className="aspect-video relative rounded-t-lg overflow-hidden bg-slate-900">
                            {video.thumbnailUrl ? (
                              <Image
                                src={video.thumbnailUrl}
                                alt={video.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                                <VideoIcon className="w-16 h-16 text-slate-600" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                            
                            <div className="absolute top-3 right-3">
                              <Badge className={cn(
                                "backdrop-blur border-0 shadow-lg",
                                video.analysisStatus === 'COMPLETED' ? "bg-green-500/90 text-white" :
                                video.analysisStatus === 'PROCESSING' ? "bg-yellow-500/90 text-white animate-pulse" :
                                "bg-slate-500/90 text-white"
                              )}>
                                {video.analysisStatus === 'COMPLETED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                {video.analysisStatus === 'PROCESSING' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                {video.analysisStatus === 'COMPLETED' ? '✅ Analyzed' : 
                                 video.analysisStatus === 'PROCESSING' ? '🔄 Analyzing...' : '⏳ Pending'}
                              </Badge>
                            </div>
                            
                            {video.analysisStatus === 'COMPLETED' && video.overallScore && (
                              <div className="absolute bottom-3 left-3">
                                <div className="bg-black/80 backdrop-blur px-4 py-2 rounded-full border border-kai-primary/30">
                                  <span className="text-kai-primary font-bold text-sm">
                                    🎯 {video.overallScore}/100
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="absolute top-3 left-3">
                              <div className="w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur flex items-center justify-center">
                                <Brain className="w-4 h-4 text-kai-primary" />
                              </div>
                            </div>
                          </div>
                          
                          <CardContent className="p-6">
                            <h4 className="font-bold text-foreground mb-2 truncate group-hover:text-kai-primary transition-colors">
                              {video.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {new Date(video.uploadedAt).toLocaleDateString()}
                              {video.duration && video.duration > 0 && (
                                <>
                                  <span>•</span>
                                  <Timer className="w-3 h-3" />
                                  {Math.floor(video.duration / 60)}min
                                </>
                              )}
                            </p>
                            
                            <div className="flex gap-2">
                              {video.analysisStatus === 'COMPLETED' ? (
                                <Button
                                  size="sm"
                                  className="flex-1 bg-gradient-to-r from-kai-primary/20 to-kai-secondary/20 border border-kai-primary/50 text-kai-primary hover:from-kai-primary/30 hover:to-kai-secondary/30 hover:text-white"
                                  asChild
                                >
                                  <Link href={`/train/analysis/${video.id}`}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Analysis
                                  </Link>
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 border-muted"
                                  disabled
                                >
                                  {video.analysisStatus === 'PROCESSING' ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-4 h-4 mr-2" />
                                      Pending
                                    </>
                                  )}
                                </Button>
                              )}
                              
                              {video.analysisStatus === 'COMPLETED' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => downloadPDF(video)}
                                  className="border-muted hover:bg-slate-800 text-muted-foreground hover:text-foreground"
                                >
                                  <FileText className="w-4 h-4" />
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteVideo(video.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/30"
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
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </section>

      {/* Floating Coach Kai Chat Panel */}
      <AnimatePresence>
        {showCoachKaiChat && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]"
          >
            <Card className="bg-slate-800/95 backdrop-blur border-kai-primary/50 shadow-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-kai-primary to-kai-secondary flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-foreground text-lg">Coach Kai</CardTitle>
                      <p className="text-xs text-muted-foreground">Your AI Pickleball Coach</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowCoachKaiChat(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-card/50 rounded-lg p-4 border-l-4 border-kai-primary">
                  <p className="text-sm text-foreground mb-2">
                    👋 Hi there! I'm Coach Kai, your AI pickleball analyst.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Upload a video and I'll analyze your technique, movement patterns, and strategy to help you improve your game!
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setActiveTab('upload')}
                    className="flex-1 bg-gradient-to-r from-kai-primary/20 to-kai-secondary/20 border border-kai-primary/50 text-kai-primary hover:from-kai-primary/30 hover:to-kai-secondary/30"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Video
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowHowItWorks(true)}
                    className="border-muted text-muted-foreground hover:bg-slate-700"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Coach Kai Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        className="fixed bottom-4 right-4 z-40"
      >
        {!showCoachKaiChat && (
          <Button
            onClick={() => setShowCoachKaiChat(true)}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-kai-primary to-kai-secondary hover:from-kai-primary/90 hover:to-kai-secondary/90 shadow-2xl hover:shadow-kai-primary/25 group"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Brain className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
            </motion.div>
          </Button>
        )}
      </motion.div>

      {/* How It Works Modal */}
      <AnimatePresence>
        {showHowItWorks && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4"
            onClick={() => setShowHowItWorks(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-border rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-kai-primary to-kai-secondary flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  How Coach Kai Works
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHowItWorks(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-6">
                {[
                  {
                    step: "1",
                    title: "Upload Your Game",
                    description: "Film 10-30 second clips showing 1-3 shots. Position camera at baseline, side-on, 10-15 ft away. Use daylight and keep steady.",
                    icon: VideoIcon,
                    color: "from-green-500 to-emerald-500"
                  },
                  {
                    step: "2", 
                    title: "AI Analysis",
                    description: "Advanced computer vision analyzes your technique, movement patterns, shot selection, and strategic positioning.",
                    icon: Brain,
                    color: "from-blue-500 to-cyan-500"
                  },
                  {
                    step: "3",
                    title: "Detailed Insights",
                    description: "Get professional-grade analysis with technique scores, movement heatmaps, and specific improvement recommendations.",
                    icon: BarChart3,
                    color: "from-purple-500 to-pink-500"
                  },
                  {
                    step: "4",
                    title: "Track Progress",
                    description: "Monitor your improvement over time with before/after comparisons and personalized training suggestions.",
                    icon: TrendingUp,
                    color: "from-orange-500 to-yellow-500"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-card/30 rounded-xl border border-border">
                    <div className={cn("w-16 h-16 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-lg", item.color)}>
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-2">
                        Step {item.step}: {item.title}
                      </h4>
                      <p className="text-foreground text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3 mt-8">
                <Button
                  onClick={() => {
                    setShowHowItWorks(false)
                    setActiveTab('upload')
                  }}
                  className="flex-1 bg-gradient-to-r from-kai-primary to-kai-secondary hover:from-kai-primary/90 hover:to-kai-secondary/90"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Start Analyzing
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowHowItWorks(false)}
                  className="border-muted text-muted-foreground"
                >
                  Got It!
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Toast */}
      {isShowing && (
        <AchievementToast
          achievements={achievements}
          onDismiss={dismissAchievements}
        />
      )}
    </div>
    </>
  )
}
