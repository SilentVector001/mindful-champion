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
  Shield, Wifi, Mic, ChevronDown, X, Menu, BookOpen, Settings, FolderOpen
} from "lucide-react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { generateAnalysisPDF } from "@/lib/pdf-generator"
import type { VideoAnalysisData, VideoLibraryStats } from "@/lib/video-analysis-types"
import MainNavigation from "@/components/navigation/main-navigation"

export default function VideoAnalysisHub() {
  const { data: session } = useSession() || {}
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

  const [showCoachKaiChat, setShowCoachKaiChat] = useState(false)
  const [showTipsDropdown, setShowTipsDropdown] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [coachTipOfDay, setCoachTipOfDay] = useState("")

  const userTier = (session?.user as any)?.subscriptionTier || 'FREE'
  const isPro = userTier === 'PRO'

  const coachKaiTips = [
    "Film 10-30 sec clips from baseline, side-on view 📹",
    "Shoot in daylight - natural light = better analysis ☀️", 
    "Keep camera steady on tripod or stable surface 🎯",
    "Capture 1-3 shots per clip, not full rallies 🧠",
    "Use 1080p, position camera 10-15 ft from court ⚡"
  ]

  useEffect(() => {
    if (!coachTipOfDay) {
      const randomTip = coachKaiTips[Math.floor(Math.random() * coachKaiTips.length)]
      setCoachTipOfDay(randomTip)
    }
  }, [])

  useEffect(() => {
    if (session?.user) {
      fetchVideoLibrary()
      fetchLibraryStats()
    }
  }, [session])

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
    if (!selectedFile) return
    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const xhr = new XMLHttpRequest()
      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100
            setUploadProgress(Math.round(percentComplete))
          }
        })
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText)
              resolve(data)
            } catch (e) {
              reject(new Error('Invalid response from server'))
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })
        xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))
        xhr.open('POST', '/api/video-analysis/upload')
        xhr.send(formData)
      })

      const data = await uploadPromise
      setUploadProgress(100)
      setUploading(false)
      alert('✅ Upload complete! Starting AI analysis...')
      setAnalyzing(true)
      await analyzeVideo(data.videoId, data.videoUrl)
    } catch (error) {
      console.error('Upload error:', error)
      setUploading(false)
      setUploadProgress(0)
      alert('❌ Upload failed. Please try again.')
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
        alert(`✅ Analysis Complete!\n\n🎯 Your Overall Score: ${Math.round(data.overallScore)}/100\n\n📊 Check "My Analyzed Videos" tab to view detailed results!`)
        await fetchVideoLibrary()
        await fetchLibraryStats()
        setActiveTab('library')
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
      alert(`❌ Analysis Failed\n\n${errorMessage}\n\nPlease try uploading your video again.`)
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return
    try {
      const res = await fetch(`/api/video-analysis/${videoId}`, { method: 'DELETE' })
      if (res.ok) {
        setVideoLibrary(prev => prev.filter(v => v.id !== videoId))
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
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(pdfHTML)
      printWindow.document.close()
    }
  }

  return (
    <>
      <MainNavigation user={session?.user} />
      
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative">
        {/* Subtle background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Header with Breadcrumb */}
        <div className="sticky top-0 z-50 backdrop-blur-lg bg-slate-900/80 border-b border-slate-700">
          <div className="container mx-auto max-w-7xl px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">Home</Link>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                  <Link href="/train" className="text-slate-400 hover:text-white transition-colors">Train</Link>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                  <span className="text-cyan-400 font-medium">Video Analysis</span>
                  <Badge className="ml-2 bg-purple-600/80 text-white text-[10px] px-1.5 py-0.5">Beta</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowHowItWorks(true)} className="text-slate-400 hover:text-white">
                  <HelpCircle className="w-4 h-4 mr-1" /> Help
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Page Title & Tab Navigation - THE KEY REDESIGN */}
        <div className="container mx-auto max-w-7xl px-4 pt-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-cyan-400" />
                  AI Video Analysis
                </h1>
                <p className="text-slate-400 mt-1">Coach Kai analyzes your technique, movement & strategy</p>
              </div>
            </div>

            {/* PROMINENT TAB NAVIGATION */}
            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
              <TabsList className="w-full max-w-lg grid grid-cols-2 h-14 bg-slate-800/80 border border-slate-700 p-1 rounded-xl">
                <TabsTrigger 
                  value="upload" 
                  className="h-full rounded-lg text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=inactive]:text-slate-400 transition-all"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload & Analyze
                </TabsTrigger>
                <TabsTrigger 
                  value="library" 
                  className="h-full rounded-lg text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=inactive]:text-slate-400 transition-all relative"
                >
                  <FolderOpen className="w-5 h-5 mr-2" />
                  My Analyzed Videos
                  {libraryStats.totalVideos > 0 && (
                    <Badge className="ml-2 bg-white/20 text-white border-0 text-xs">
                      {libraryStats.totalVideos}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* UPLOAD TAB - Streamlined with upload at top */}
              <TabsContent value="upload" className="mt-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Upload Section - IMMEDIATELY VISIBLE */}
                  <div className="lg:col-span-2">
                    <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-white flex items-center gap-2">
                          <VideoIcon className="w-5 h-5 text-cyan-400" />
                          Upload Your Game Footage
                        </CardTitle>
                        <CardDescription className="text-slate-300">
                          MP4, MOV, AVI • Up to 500MB • Best: 10-30 second clips
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {!selectedFile ? (
                          <div
                            {...getRootProps()}
                            className={cn(
                              "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all",
                              isDragActive 
                                ? "border-cyan-400 bg-cyan-500/10" 
                                : "border-slate-600 hover:border-cyan-500/50 hover:bg-slate-700/30"
                            )}
                          >
                            <input {...getInputProps()} />
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                              <Upload className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                              {isDragActive ? "Drop your video here!" : "Drag & drop your video"}
                            </h3>
                            <p className="text-slate-400 mb-4">or click to browse</p>
                            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400">
                              <VideoIcon className="w-4 h-4 mr-2" /> Select Video
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {videoPreview && (
                              <div className="aspect-video relative rounded-xl overflow-hidden bg-black">
                                <video src={videoPreview} controls className="w-full h-full" />
                              </div>
                            )}
                            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileVideo className="w-8 h-8 text-cyan-400" />
                                <div>
                                  <p className="font-medium text-white">{selectedFile.name}</p>
                                  <p className="text-sm text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedFile(null); setVideoPreview(null); }}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>

                            {uploading && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-300"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Uploading...</span>
                                  <span className="text-white font-medium">{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress} className="h-2" />
                              </div>
                            )}

                            {analyzing && (
                              <Alert className="bg-cyan-500/10 border-cyan-500/50">
                                <Brain className="w-4 h-4 text-cyan-400" />
                                <AlertDescription className="text-cyan-100">
                                  Coach Kai is analyzing your video... This may take a few minutes.
                                </AlertDescription>
                              </Alert>
                            )}

                            {!uploading && !analyzing && (
                              <Button onClick={handleUploadAndAnalyze} className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-lg font-semibold">
                                <Brain className="w-5 h-5 mr-2" /> Analyze with Coach Kai
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar - Tips & 4 Easy Steps */}
                  <div className="space-y-4">
                    {/* Coach Kai Tip */}
                    <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <Brain className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-sm mb-1">💡 Pro Tip</h4>
                            <p className="text-cyan-100 text-sm">{coachTipOfDay}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 4 Easy Steps */}
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white text-base">4 Easy Steps</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          { step: "1", title: "Record", desc: "10-30 sec clip", color: "from-green-500 to-emerald-500", image: "https://cdn.abacus.ai/images/e2b1aa1b-d6f2-4341-9296-324156f05f0e.png" },
                          { step: "2", title: "Upload", desc: "Drop file here", color: "from-blue-500 to-cyan-500", image: "https://cdn.abacus.ai/images/2470ac2a-c810-4c3b-982f-f95bd2b187b6.png" },
                          { step: "3", title: "Analyze", desc: "AI does the work", color: "from-purple-500 to-pink-500", image: "https://cdn.abacus.ai/images/bbe20fff-0d44-4a08-90af-f116a554a05a.png" },
                          { step: "4", title: "Improve", desc: "Review insights", color: "from-orange-500 to-yellow-500", image: "https://cdn.abacus.ai/images/cd3440d7-0eab-48a5-b4c6-97da95c330e9.png" }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                              <Image src={item.image} alt={item.title} fill className="object-cover" />
                              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", item.color)}></div>
                              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">{item.step}</span>
                            </div>
                            <div>
                              <p className="font-medium text-white text-sm">{item.title}</p>
                              <p className="text-xs text-slate-400">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* LIBRARY TAB - Main destination, prominent */}
              <TabsContent value="library" className="mt-6">
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: Film, label: "Total Videos", value: libraryStats.totalVideos, color: "text-cyan-400" },
                    { icon: CheckCircle2, label: "Analyzed", value: libraryStats.totalAnalyzed, color: "text-green-400" },
                    { icon: HardDrive, label: "Storage", value: `${(libraryStats.storageUsed / 1024).toFixed(1)}GB`, color: "text-purple-400" },
                    { icon: TrendingUp, label: "Avg Improvement", value: `+${libraryStats.avgImprovement}%`, color: "text-orange-400" }
                  ].map((stat, idx) => (
                    <Card key={idx} className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-4 flex items-center gap-3">
                        <stat.icon className={cn("w-8 h-8", stat.color)} />
                        <div>
                          <p className="text-2xl font-bold text-white">{stat.value}</p>
                          <p className="text-xs text-slate-400">{stat.label}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Video Grid */}
                {videoLibrary.length === 0 ? (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-12 text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-700 flex items-center justify-center">
                        <Film className="w-10 h-10 text-slate-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No videos yet</h3>
                      <p className="text-slate-400 mb-6">Upload your first video to get AI-powered analysis!</p>
                      <Button onClick={() => setActiveTab('upload')} className="bg-gradient-to-r from-cyan-500 to-blue-500">
                        <Upload className="w-4 h-4 mr-2" /> Upload Your First Video
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videoLibrary.map((video, idx) => (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className="bg-slate-800/50 border-slate-700 overflow-hidden hover:border-cyan-500/50 transition-all group">
                          <div className="aspect-video relative bg-slate-900">
                            {video.thumbnailUrl ? (
                              <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <VideoIcon className="w-12 h-12 text-slate-600" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              <Badge className={cn(
                                "text-xs",
                                video.analysisStatus === 'COMPLETED' ? "bg-green-500/90" :
                                video.analysisStatus === 'PROCESSING' ? "bg-yellow-500/90 animate-pulse" : "bg-slate-500/90"
                              )}>
                                {video.analysisStatus === 'COMPLETED' ? '✅ Analyzed' : 
                                 video.analysisStatus === 'PROCESSING' ? '🔄 Processing' : '⏳ Pending'}
                              </Badge>
                            </div>
                            {video.analysisStatus === 'COMPLETED' && video.overallScore && (
                              <div className="absolute bottom-2 left-2 bg-black/80 px-3 py-1 rounded-full">
                                <span className="text-cyan-400 font-bold text-sm">🎯 {video.overallScore}/100</span>
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-white truncate mb-1">{video.title}</h4>
                            <p className="text-xs text-slate-400 mb-3 flex items-center gap-2">
                              <Clock className="w-3 h-3" /> {new Date(video.uploadedAt).toLocaleDateString()}
                            </p>
                            <div className="flex gap-2">
                              {video.analysisStatus === 'COMPLETED' ? (
                                <Button size="sm" className="flex-1 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30" asChild>
                                  <Link href={`/train/analysis/${video.id}`}>
                                    <Eye className="w-4 h-4 mr-1" /> View
                                  </Link>
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" className="flex-1" disabled>
                                  {video.analysisStatus === 'PROCESSING' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                                </Button>
                              )}
                              {video.analysisStatus === 'COMPLETED' && (
                                <Button size="sm" variant="outline" onClick={() => downloadPDF(video)} className="border-slate-600">
                                  <FileText className="w-4 h-4" />
                                </Button>
                              )}
                              <Button size="sm" variant="outline" onClick={() => handleDeleteVideo(video.id)} className="text-red-400 border-red-500/30 hover:bg-red-500/10">
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
          </motion.div>
        </div>

        {/* Floating Coach Kai Button */}
        {!showCoachKaiChat && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className="fixed bottom-4 right-4 z-40">
            <Button onClick={() => setShowCoachKaiChat(true)} className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-xl">
              <Brain className="w-7 h-7 text-white" />
            </Button>
          </motion.div>
        )}

        {/* Coach Kai Chat Panel */}
        <AnimatePresence>
          {showCoachKaiChat && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-4 right-4 z-50 w-80"
            >
              <Card className="bg-slate-800 border-cyan-500/50 shadow-2xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-white text-base">Coach Kai</CardTitle>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setShowCoachKaiChat(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-300">Need help? Upload a video and I'll analyze your technique!</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setActiveTab('upload')} className="flex-1 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400">
                      <Upload className="w-4 h-4 mr-1" /> Upload
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowHowItWorks(true)} className="border-slate-600">
                      <HelpCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How It Works Modal */}
        <AnimatePresence>
          {showHowItWorks && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur z-50 flex items-center justify-center p-4"
              onClick={() => setShowHowItWorks(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-lg w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Brain className="w-6 h-6 text-cyan-400" /> How It Works
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowHowItWorks(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {[
                    { step: "1", title: "Record", desc: "Film 10-30 sec clips, side-on from baseline, 10-15 ft away", icon: VideoIcon, color: "from-green-500 to-emerald-500" },
                    { step: "2", title: "Upload", desc: "Drag & drop your video file (MP4, MOV, AVI up to 500MB)", icon: Upload, color: "from-blue-500 to-cyan-500" },
                    { step: "3", title: "AI Analysis", desc: "Coach Kai analyzes technique, movement & strategy", icon: Brain, color: "from-purple-500 to-pink-500" },
                    { step: "4", title: "Improve", desc: "Review insights, track progress, download reports", icon: TrendingUp, color: "from-orange-500 to-yellow-500" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className={cn("w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0", item.color)}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Step {item.step}: {item.title}</h4>
                        <p className="text-sm text-slate-300">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={() => { setShowHowItWorks(false); setActiveTab('upload'); }} className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-500">
                  <Upload className="w-4 h-4 mr-2" /> Start Analyzing
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
