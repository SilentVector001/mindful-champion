// @ts-nocheck
"use client"

import { useState, useCallback, useEffect } from "react"
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
  FileVideo, Lightbulb, ChevronRight, X, MoreVertical, Calendar
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
  duration?: number
  fileSize?: number
}

interface LibraryStats {
  totalVideos: number
  totalAnalyzed: number
  avgScore: number
}

export default function VideoAnalysisHub() {
  const { data: session } = useSession() || {}
  const router = useRouter()
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

  const userTier = (session?.user as any)?.subscriptionTier || 'FREE'
  const isPro = userTier === 'PRO'
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
        
        // Calculate stats
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

  // File selection handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setVideoPreview(URL.createObjectURL(file))
      setErrorMessage('')
    }
  }

  // Upload and analyze
  const handleUpload = async () => {
    if (!selectedFile) return
    
    setUploading(true)
    setAnalysisStatus('uploading')
    setUploadProgress(0)
    setErrorMessage('')

    try {
      // Get presigned URL
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

      // Upload to S3
      setUploadProgress(20)
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: { 'Content-Type': selectedFile.type }
      })

      if (!uploadRes.ok) throw new Error('Upload failed')
      setUploadProgress(60)

      // Confirm upload
      await fetch('/api/video-analysis/confirm-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, cloud_storage_path })
      })

      setUploadProgress(80)
      setAnalysisStatus('analyzing')

      // Start analysis
      await fetch('/api/video-analysis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId })
      })

      setUploadProgress(100)
      setAnalysisStatus('complete')
      
      // Reset and refresh
      setTimeout(() => {
        setSelectedFile(null)
        setVideoPreview(null)
        setAnalysisStatus('idle')
        setUploadProgress(0)
        setActiveTab('library')
        fetchVideoLibrary()
      }, 1500)

    } catch (error) {
      console.error('Upload error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed')
      setAnalysisStatus('error')
    } finally {
      setUploading(false)
    }
  }

  // Delete video
  const handleDelete = async (videoId: string) => {
    if (!confirm('Delete this video analysis?')) return
    try {
      await fetch(`/api/video-analysis/${videoId}`, { method: 'DELETE' })
      fetchVideoLibrary()
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  // View analysis
  const handleViewAnalysis = (videoId: string) => {
    router.push(`/train/analysis/${videoId}`)
  }

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Format file size
  const formatSize = (bytes?: number) => {
    if (!bytes) return ''
    const mb = bytes / (1024 * 1024)
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`
  }

  // Get score color
  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400'
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-cyan-400'
    if (score >= 40) return 'text-amber-400'
    return 'text-red-400'
  }

  const getScoreBg = (score?: number) => {
    if (!score) return 'bg-slate-700'
    if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/30'
    if (score >= 60) return 'bg-cyan-500/20 border-cyan-500/30'
    if (score >= 40) return 'bg-amber-500/20 border-amber-500/30'
    return 'bg-red-500/20 border-red-500/30'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <MainNavigation user={session?.user} />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Video className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Video Analysis Lab</h1>
              <p className="text-gray-400">AI-powered technique analysis with Coach Kai</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {[
            { label: 'Videos', value: libraryStats.totalVideos, icon: Film, color: 'from-cyan-500 to-blue-500' },
            { label: 'Analyzed', value: libraryStats.totalAnalyzed, icon: Brain, color: 'from-emerald-500 to-teal-500' },
            { label: 'Avg Score', value: libraryStats.avgScore || '-', icon: Target, color: 'from-amber-500 to-orange-500' },
          ].map((stat, i) => (
            <div key={stat.label} className="bg-slate-900/60 backdrop-blur rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700/50 p-1 rounded-xl">
            <TabsTrigger value="upload" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-lg px-6">
              <Upload className="w-4 h-4 mr-2" /> Upload
            </TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-lg px-6">
              <Film className="w-4 h-4 mr-2" /> Library ({libraryStats.totalVideos})
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Upload Area */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur overflow-hidden">
                  <CardContent className="p-6">
                    {!selectedFile ? (
                      <label className="block cursor-pointer">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <div className="border-2 border-dashed border-slate-600 hover:border-cyan-500/50 rounded-2xl p-12 text-center transition-all group">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Upload className="w-10 h-10 text-cyan-400" />
                          </div>
                          <h3 className="text-xl font-semibold text-white mb-2">Drop your video here</h3>
                          <p className="text-gray-400 mb-4">or click to browse files</p>
                          <p className="text-xs text-gray-500">MP4, MOV, AVI up to 500MB</p>
                        </div>
                      </label>
                    ) : (
                      <div className="space-y-4">
                        {/* Video Preview */}
                        <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                          {videoPreview && (
                            <video src={videoPreview} className="w-full h-full object-contain" controls />
                          )}
                          <button
                            onClick={() => { setSelectedFile(null); setVideoPreview(null) }}
                            className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        
                        {/* File Info */}
                        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileVideo className="w-5 h-5 text-cyan-400" />
                            <div>
                              <div className="text-white font-medium truncate max-w-[200px]">{selectedFile.name}</div>
                              <div className="text-xs text-gray-400">{formatSize(selectedFile.size)}</div>
                            </div>
                          </div>
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            Ready
                          </Badge>
                        </div>

                        {/* Progress */}
                        {analysisStatus !== 'idle' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">
                                {analysisStatus === 'uploading' ? 'Uploading...' : 
                                 analysisStatus === 'analyzing' ? 'AI Analyzing...' : 
                                 analysisStatus === 'complete' ? 'Complete!' : 'Error'}
                              </span>
                              <span className="text-cyan-400">{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-2" />
                          </div>
                        )}

                        {/* Error */}
                        {errorMessage && (
                          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {errorMessage}
                          </div>
                        )}

                        {/* Upload Button */}
                        <Button
                          onClick={handleUpload}
                          disabled={uploading || analysisStatus === 'complete'}
                          className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold py-6 text-lg shadow-lg"
                        >
                          {uploading ? (
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                          ) : analysisStatus === 'complete' ? (
                            <><CheckCircle2 className="w-5 h-5 mr-2" /> Analysis Complete!</>
                          ) : (
                            <><Brain className="w-5 h-5 mr-2" /> Analyze with AI</>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Tips Panel */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 border-slate-700/50 backdrop-blur h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <Lightbulb className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Pro Recording Tips</h3>
                        <p className="text-sm text-gray-400">For best AI analysis results</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { icon: '🎥', title: 'Side-On View', desc: 'Film from baseline, perpendicular to court' },
                        { icon: '☀️', title: 'Good Lighting', desc: 'Natural daylight works best for AI tracking' },
                        { icon: '📱', title: 'Stable Camera', desc: 'Use tripod or steady surface, 10-15ft away' },
                        { icon: '⏱️', title: 'Short Clips', desc: '10-30 seconds showing 1-3 shots per video' },
                        { icon: '🎯', title: '1080p Quality', desc: 'Higher resolution = better pose detection' },
                      ].map((tip, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                          <span className="text-2xl">{tip.icon}</span>
                          <div>
                            <div className="text-white font-medium">{tip.title}</div>
                            <div className="text-sm text-gray-400">{tip.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            ) : videoLibrary.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <Film className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No videos yet</h3>
                <p className="text-gray-400 mb-6">Upload your first video to get started</p>
                <Button onClick={() => setActiveTab('upload')} className="bg-cyan-500 hover:bg-cyan-600">
                  <Upload className="w-4 h-4 mr-2" /> Upload Video
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videoLibrary.map((video, i) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur overflow-hidden group hover:border-cyan-500/30 transition-all">
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-slate-800">
                        {video.thumbnailUrl ? (
                          <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                            <Video className="w-12 h-12 text-slate-600" />
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 left-3">
                          {video.analysisStatus === 'COMPLETED' ? (
                            <Badge className="bg-emerald-500/90 text-white border-0">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Analyzed
                            </Badge>
                          ) : video.analysisStatus === 'PROCESSING' ? (
                            <Badge className="bg-amber-500/90 text-white border-0 animate-pulse">
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing
                            </Badge>
                          ) : video.analysisStatus === 'FAILED' ? (
                            <Badge className="bg-red-500/90 text-white border-0">
                              <AlertCircle className="w-3 h-3 mr-1" /> Failed
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-600/90 text-white border-0">
                              <Clock className="w-3 h-3 mr-1" /> Pending
                            </Badge>
                          )}
                        </div>

                        {/* Score Badge */}
                        {video.analysisStatus === 'COMPLETED' && video.overallScore && (
                          <div className="absolute top-3 right-3">
                            <div className={cn("px-3 py-1 rounded-lg border font-bold text-lg", getScoreBg(video.overallScore), getScoreColor(video.overallScore))}>
                              {video.overallScore}
                            </div>
                          </div>
                        )}

                        {/* Hover Overlay */}
                        {video.analysisStatus === 'COMPLETED' && (
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              onClick={() => handleViewAnalysis(video.id)}
                              className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white"
                            >
                              <Eye className="w-4 h-4 mr-2" /> View Analysis
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <CardContent className="p-4">
                        <h3 className="text-white font-medium truncate mb-2">
                          {video.title || video.fileName || 'Untitled Video'}
                        </h3>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(video.uploadedAt)}
                          </span>
                          <button
                            onClick={() => handleDelete(video.id)}
                            className="text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
