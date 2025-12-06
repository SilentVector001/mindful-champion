
"use client"

/**
 * Comprehensive Video Analysis Dashboard
 * World-class video analysis with sophisticated AI and simple UX
 */

import { useState, useCallback, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Upload, Video, Loader2, CheckCircle2, AlertCircle, Play, Pause,
  FastForward, Rewind, SkipForward, SkipBack, Maximize2, Volume2, VolumeX,
  Download, Share2, Eye, Activity, BarChart3, Lightbulb, Trophy,
  Target, Zap, TrendingUp, Brain, Sparkles, Award, Film, LineChart,
  Gauge, Clock, Users, Star, ChevronRight, X, Info, ChevronLeft,
  PlayCircle, PauseCircle, RotateCcw
} from "lucide-react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface AnalysisData {
  analysisId: string;
  videoId: string;
  timestamp: string;
  overallScore: number;
  
  // Key metrics
  technicalMetrics: {
    overall: number;
    paddleAngle: number;
    followThrough: number;
    bodyRotation: number;
    readyPosition: number;
    gripTechnique: number;
    contactPoint: number;
    weightTransfer: number;
    headStability: number;
  };
  
  movementMetrics: {
    courtCoverage: number;
    avgSpeed: number;
    maxSpeed: number;
    efficiency: number;
    positioning: number;
    anticipation: number;
    footwork: number;
    balance: number;
    readyPosition: number;
    splitStep: number;
  };
  
  // Shot analysis
  shotStatistics: {
    total: number;
    byType: Record<string, {
      count: number;
      successRate: number;
      avgQuality: number;
      avgSpeed: number;
    }>;
  };
  
  // Key moments
  keyMoments: Array<{
    timestamp: number;
    type: 'strength' | 'improvement' | 'critical' | 'highlight';
    category: string;
    title: string;
    description: string;
    recommendation: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  
  // Insights
  strengths: string[];
  weaknesses: string[];
  prioritizedImprovements: Array<{
    title: string;
    description: string;
    priority: number;
    difficulty: string;
    estimatedTimeframe: string;
    drillSuggestions: string[];
  }>;
  
  // Coach commentary
  coachCommentary: {
    opening: string;
    keyObservations: string[];
    encouragement: string;
    nextSteps: string[];
  };
}

export default function ComprehensiveVideoAnalysis() {
  const { data: session } = useSession() || {}
  const router = useRouter()
  
  // Upload & processing state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  // Analysis results
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  
  // Video player state
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showOverlays, setShowOverlays] = useState(true)
  const [selectedMoment, setSelectedMoment] = useState<any>(null)

  // Dropzone for video upload
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      setVideoPreview(URL.createObjectURL(file))
      setError(null)
      setAnalysisData(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'] },
    maxSize: 500 * 1024 * 1024, // 500MB
    multiple: false
  })

  // Handle video analysis
  const handleAnalyze = async () => {
    if (!selectedFile) return

    setError(null)
    setUploading(true)
    setUploadProgress(0)
    
    // Show initial toast
    toast.loading('Starting video upload...', { id: 'video-upload' })

    try {
      // Step 1: Upload video with real progress tracking
      const formData = new FormData()
      formData.append('file', selectedFile)

      const uploadData = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100
            setUploadProgress(Math.round(percentComplete))
            toast.loading(`Uploading video... ${Math.round(percentComplete)}%`, { id: 'video-upload' })
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

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'))
        })

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'))
        })

        xhr.open('POST', '/api/video-analysis/upload')
        xhr.send(formData)
      })

      setUploadProgress(100)
      toast.success('✅ Upload complete! Starting AI analysis...', { id: 'video-upload', duration: 3000 })
      
      // Small delay to show completion
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Step 2: Analyze video
      setUploading(false)
      setAnalyzing(true)
      setAnalysisProgress(0)
      toast.loading('🧠 AI is analyzing your video... This may take 30-60 seconds', { id: 'video-analysis' })

      // Simulate analysis progress (since backend doesn't provide real-time updates)
      const analysisInterval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 90) return prev
          return Math.min(prev + Math.random() * 15, 90)
        })
      }, 1000)

      const analysisResponse = await fetch('/api/video-analysis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: uploadData.videoId,
          videoUrl: uploadData.videoUrl,
          userId: session?.user?.id,
        }),
      })

      clearInterval(analysisInterval)
      setAnalysisProgress(100)

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json().catch(() => ({}))
        throw new Error(errorData.error || 'Analysis failed')
      }

      const analysisResult = await analysisResponse.json()
      
      // Show success toast
      toast.success('✅ Analysis complete! Your video is ready.', { 
        id: 'video-analysis',
        duration: 5000,
        action: {
          label: 'View in Library',
          onClick: () => router.push('/train/analysis-library')
        }
      })
      
      // Small delay to show completion
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setAnalysisData(analysisResult)
      setAnalyzing(false)

    } catch (err: any) {
      console.error('Analysis error:', err)
      const errorMessage = err.message || 'Something went wrong. Please try again.'
      setError(errorMessage)
      setUploading(false)
      setAnalyzing(false)
      setUploadProgress(0)
      setAnalysisProgress(0)
      
      // Show error toast with retry option
      toast.error(`❌ ${errorMessage}`, { 
        id: uploading ? 'video-upload' : 'video-analysis',
        duration: 7000,
        action: {
          label: 'Retry',
          onClick: () => {
            if (selectedFile) {
              setError(null)
              handleAnalyze()
            }
          }
        }
      })
    }
  }

  // Video player controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const jumpToMoment = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp
      setCurrentTime(timestamp)
      setSelectedMoment(analysisData?.keyMoments.find(m => m.timestamp === timestamp))
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-500'
    if (score >= 70) return 'text-blue-500'
    if (score >= 60) return 'text-amber-500'
    return 'text-red-500'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    if (score >= 70) return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    if (score >= 60) return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    return 'bg-red-500/10 text-red-500 border-red-500/20'
  }

  // If no video selected, show upload interface
  if (!selectedFile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Video Analysis Lab
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload your pickleball match video and get AI-powered technique analysis, 
              shot breakdowns, and personalized coaching insights
            </p>
          </motion.div>

          {/* Upload Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-dashed">
              <CardContent className="pt-6">
                <div
                  {...getRootProps()}
                  className={cn(
                    "relative rounded-xl border-2 border-dashed p-12 transition-all cursor-pointer",
                    isDragActive
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                      : "border-muted-foreground/25 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/10"
                  )}
                >
                  <input {...getInputProps()} />
                  
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Upload className="w-10 h-10 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {isDragActive ? 'Drop video here' : 'Upload Your Match Video'}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Drag and drop or click to select a video file
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supports MP4, MOV, AVI, MKV, WEBM • Max 500MB
                      </p>
                    </div>

                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      <Upload className="w-4 h-4 mr-2" />
                      Select Video
                    </Button>
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Technique Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        AI-powered pose detection and form evaluation
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Shot Tracking</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatic detection and categorization of every shot
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Actionable Insights</h4>
                      <p className="text-sm text-muted-foreground">
                        Personalized recommendations and drill suggestions
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // If uploading or analyzing, show progress
  if (uploading || analyzing) {
    const currentProgress = uploading ? uploadProgress : analysisProgress
    const isComplete = currentProgress === 100
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-6 text-center py-8">
              <div className="relative">
                <div className={cn(
                  "w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center",
                  isComplete && !analyzing ? "animate-bounce" : "animate-pulse"
                )}>
                  {isComplete && !analyzing ? (
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  ) : (
                    <Brain className="w-12 h-12 text-white" />
                  )}
                </div>
                {!isComplete && (
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                )}
              </div>

              <div className="space-y-2 w-full">
                <h3 className="text-2xl font-bold">
                  {uploading ? (
                    currentProgress === 100 ? '✓ Upload Complete!' : 'Uploading Video...'
                  ) : (
                    currentProgress === 100 ? '✓ Analysis Complete!' : 'Analyzing Your Game...'
                  )}
                </h3>
                <p className="text-muted-foreground">
                  {uploading ? (
                    currentProgress === 100 
                      ? 'Video uploaded successfully. Starting analysis...'
                      : `Uploading ${selectedFile?.name} to secure cloud storage...`
                  ) : (
                    currentProgress === 100
                      ? 'Finalizing your personalized insights...'
                      : 'AI is analyzing your technique, shots, and movement patterns'
                  )}
                </p>
              </div>

              <div className="w-full space-y-2">
                <Progress value={currentProgress} className="h-3" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {uploading ? 'Uploading' : 'Analyzing'}
                  </span>
                  <span className={cn(
                    "font-semibold",
                    isComplete ? "text-emerald-600" : "text-blue-600"
                  )}>
                    {currentProgress}%
                  </span>
                </div>
              </div>

              {uploading && currentProgress < 100 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Upload className="w-4 h-4 animate-bounce" />
                  <span>
                    {(selectedFile && selectedFile.size) 
                      ? `${((selectedFile.size * currentProgress / 100) / (1024 * 1024)).toFixed(1)} / ${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
                      : 'Uploading...'}
                  </span>
                </div>
              )}

              {analyzing && (
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="border-blue-500/20 bg-blue-500/10">
                    <Activity className="w-3 h-3 mr-1" />
                    Detecting poses
                  </Badge>
                  <Badge variant="outline" className="border-indigo-500/20 bg-indigo-500/10">
                    <Target className="w-3 h-3 mr-1" />
                    Tracking shots
                  </Badge>
                  <Badge variant="outline" className="border-purple-500/20 bg-purple-500/10">
                    <Brain className="w-3 h-3 mr-1" />
                    Generating insights
                  </Badge>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {uploading ? 'This may take a few moments depending on video size...' : 'Analysis typically takes 30-60 seconds...'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If video selected but not yet analyzing, show preview with analyze button
  if (selectedFile && !uploading && !analyzing && !analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ready to Analyze</CardTitle>
                    <CardDescription>Review your video and start AI analysis</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedFile(null)
                      setVideoPreview(null)
                      setError(null)
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Video Preview */}
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={videoPreview || ''}
                    controls
                    className="w-full h-full"
                  />
                </div>

                {/* File Info */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Film className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{selectedFile.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span>{error}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setError(null)
                            handleAnalyze()
                          }}
                          className="ml-4"
                        >
                          Retry
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Analyze Button */}
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={handleAnalyze}
                  >
                    <Brain className="w-5 h-5 mr-2" />
                    Analyze Video with AI
                  </Button>
                </div>

                {/* What to Expect */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t">
                  <div className="text-center p-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
                      <Upload className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium mb-1">Step 1</p>
                    <p className="text-xs text-muted-foreground">Upload to secure cloud</p>
                  </div>
                  <div className="text-center p-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mx-auto mb-2">
                      <Activity className="w-5 h-5 text-indigo-600" />
                    </div>
                    <p className="text-sm font-medium mb-1">Step 2</p>
                    <p className="text-xs text-muted-foreground">AI analyzes technique</p>
                  </div>
                  <div className="text-center p-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mx-auto mb-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium mb-1">Step 3</p>
                    <p className="text-xs text-muted-foreground">Get personalized insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // If analysis complete, show comprehensive dashboard
  if (analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with overall score */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null)
                    setVideoPreview(null)
                    setAnalysisData(null)
                  }}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  New Analysis
                </Button>
                <div className="h-6 w-px bg-border"></div>
                <h1 className="text-2xl font-bold">Video Analysis Results</h1>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Overall Score Card */}
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-muted"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - analysisData.overallScore / 100)}`}
                          className={getScoreColor(analysisData.overallScore)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={cn("text-3xl font-bold", getScoreColor(analysisData.overallScore))}>
                          {analysisData.overallScore.toFixed(0)}
                        </span>
                        <span className="text-xs text-muted-foreground">Overall</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{analysisData.coachCommentary.opening}</h2>
                    <p className="text-muted-foreground mb-4">{analysisData.coachCommentary.encouragement}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getScoreBadge(analysisData.technicalMetrics.overall)}>
                        <Target className="w-3 h-3 mr-1" />
                        Technical: {analysisData.technicalMetrics.overall.toFixed(0)}%
                      </Badge>
                      <Badge className={getScoreBadge(analysisData.movementMetrics.efficiency)}>
                        <Activity className="w-3 h-3 mr-1" />
                        Movement: {analysisData.movementMetrics.efficiency.toFixed(0)}%
                      </Badge>
                      <Badge className={getScoreBadge(analysisData.movementMetrics.footwork)}>
                        <Zap className="w-3 h-3 mr-1" />
                        Footwork: {analysisData.movementMetrics.footwork.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Video Player with Analysis Overlay */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    src={videoPreview || ''}
                    className="w-full h-full"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                  />

                  {/* Overlay for key moments */}
                  {showOverlays && selectedMoment && (
                    <div className="absolute top-4 right-4 max-w-sm">
                      <Card className="bg-black/90 border-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Badge className={
                              selectedMoment.type === 'strength' ? 'bg-emerald-500' :
                              selectedMoment.type === 'improvement' ? 'bg-amber-500' :
                              'bg-red-500'
                            }>
                              {selectedMoment.type}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => setSelectedMoment(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <h4 className="text-white font-semibold mb-1">{selectedMoment.title}</h4>
                          <p className="text-gray-300 text-sm mb-2">{selectedMoment.description}</p>
                          <p className="text-blue-400 text-sm">
                            💡 {selectedMoment.recommendation}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Play button overlay */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Button
                        size="lg"
                        className="w-20 h-20 rounded-full bg-white/90 hover:bg-white"
                        onClick={togglePlay}
                      >
                        <Play className="w-10 h-10 text-black" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Video Controls */}
                <div className="p-4 space-y-4">
                  {/* Timeline */}
                  <div className="space-y-2">
                    <Slider
                      value={[currentTime]}
                      max={duration}
                      step={0.1}
                      onValueChange={handleSeek}
                      className="cursor-pointer"
                    />
                    
                    {/* Key moments markers */}
                    {showOverlays && analysisData.keyMoments.length > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <Info className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Key moments:</span>
                        {analysisData.keyMoments.slice(0, 5).map((moment, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => jumpToMoment(moment.timestamp)}
                          >
                            {formatTime(moment.timestamp)}
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Control buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={togglePlay}>
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = Math.max(0, currentTime - 5)
                          }
                        }}
                      >
                        <SkipBack className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = Math.min(duration, currentTime + 5)
                          }
                        }}
                      >
                        <SkipForward className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = 0
                          }
                        }}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowOverlays(!showOverlays)}
                      >
                        <Eye className={cn("w-4 h-4", !showOverlays && "opacity-50")} />
                      </Button>
                      <select
                        value={playbackRate}
                        onChange={(e) => {
                          const rate = parseFloat(e.target.value)
                          setPlaybackRate(rate)
                          if (videoRef.current) {
                            videoRef.current.playbackRate = rate
                          }
                        }}
                        className="h-9 px-3 rounded-md border bg-background text-sm"
                      >
                        <option value="0.25">0.25x</option>
                        <option value="0.5">0.5x</option>
                        <option value="1">1x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Analysis Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
                <TabsTrigger value="overview">
                  <Trophy className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="technique">
                  <Target className="w-4 h-4 mr-2" />
                  Technique
                </TabsTrigger>
                <TabsTrigger value="shots">
                  <Activity className="w-4 h-4 mr-2" />
                  Shots
                </TabsTrigger>
                <TabsTrigger value="movement">
                  <Zap className="w-4 h-4 mr-2" />
                  Movement
                </TabsTrigger>
                <TabsTrigger value="improvements">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Improve
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-emerald-600" />
                        </div>
                        Your Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysisData.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Weaknesses */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <Target className="w-4 h-4 text-amber-600" />
                        </div>
                        Areas to Improve
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysisData.weaknesses.map((weakness, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Key Observations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Coach Kai's Observations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {analysisData.coachCommentary.keyObservations.map((obs, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-blue-600">{i + 1}</span>
                          </div>
                          <span className="text-sm">{obs}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Next Steps */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChevronRight className="w-5 h-5" />
                      Next Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisData.coachCommentary.nextSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-semibold text-white">{i + 1}</span>
                          </div>
                          <span className="text-sm">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Technique Tab */}
              <TabsContent value="technique" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(analysisData.technicalMetrics)
                    .filter(([key]) => key !== 'overall')
                    .map(([key, value]) => (
                      <Card key={key}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            <Badge className={getScoreBadge(value)}>
                              {value.toFixed(0)}%
                            </Badge>
                          </div>
                          <Progress value={value} className="h-2" />
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              {/* Shots Tab */}
              <TabsContent value="shots" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Shot Breakdown ({analysisData.shotStatistics.total} total shots)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analysisData.shotStatistics.byType).map(([type, stats]) => (
                        <div key={type} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium capitalize">{type}</span>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">{stats.count} shots</span>
                              <Badge className={getScoreBadge(stats.successRate)}>
                                {stats.successRate.toFixed(0)}% success
                              </Badge>
                            </div>
                          </div>
                          <Progress value={stats.successRate} className="h-2" />
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Quality: {stats.avgQuality.toFixed(0)}%</span>
                            <span>Avg Speed: {stats.avgSpeed.toFixed(1)} mph</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Movement Tab */}
              <TabsContent value="movement" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(analysisData.movementMetrics)
                    .filter(([key]) => !['avgSpeed', 'maxSpeed'].includes(key))
                    .map(([key, value]) => (
                      <Card key={key}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            <Badge className={getScoreBadge(value)}>
                              {value.toFixed(0)}%
                            </Badge>
                          </div>
                          <Progress value={value} className="h-2" />
                        </CardContent>
                      </Card>
                    ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Speed Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {analysisData.movementMetrics.avgSpeed.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Speed (mph)</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <div className="text-3xl font-bold text-indigo-600 mb-1">
                          {analysisData.movementMetrics.maxSpeed.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">Max Speed (mph)</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Improvements Tab */}
              <TabsContent value="improvements" className="space-y-4 mt-4">
                {analysisData.prioritizedImprovements.map((improvement, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-blue-600">#{improvement.priority}</span>
                          </div>
                          <div>
                            <CardTitle className="text-lg">{improvement.title}</CardTitle>
                            <CardDescription>{improvement.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline">{improvement.difficulty}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {improvement.estimatedTimeframe}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            Recommended Drills
                          </h4>
                          <ul className="space-y-1.5">
                            {improvement.drillSuggestions.map((drill, j) => (
                              <li key={j} className="flex items-start gap-2 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                                <span>{drill}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    )
  }

  return null
}
