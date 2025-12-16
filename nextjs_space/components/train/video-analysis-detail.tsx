
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import {
  Video, Download, Share2, ArrowLeft, CheckCircle2, TrendingUp, Target,
  Activity, BarChart3, Lightbulb, Trophy, Clock, Eye, FileText, Play,
  ChevronRight, ChevronLeft, Star, Award, Gauge, Zap, Brain, AlertCircle, ThumbsUp, Library, Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { generateAnalysisPDF } from "@/lib/pdf-generator"
import type { VideoAnalysisData } from "@/lib/video-analysis-types"
import AIVideoPlayer from "@/components/video-analysis/ai-video-player"
import SideBySideComparison from "@/components/video-analysis/side-by-side-comparison"
import InteractiveDashboard from "@/components/video-analysis/interactive-dashboard"
import ProgressTracking from "@/components/video-analysis/progress-tracking"
import ShotByBreakdown from "@/components/video-analysis/shot-by-shot-breakdown"
import ShotDetectionProgress from "@/components/video-analysis/shot-detection-progress"

interface VideoAnalysisDetailProps {
  videoId: string
}

export default function VideoAnalysisDetail({ videoId }: VideoAnalysisDetailProps) {
  const { data: session } = useSession() || {}
  const [video, setVideo] = useState<VideoAnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [prevVideoId, setPrevVideoId] = useState<string | null>(null)
  const [nextVideoId, setNextVideoId] = useState<string | null>(null)
  const [fileWarning, setFileWarning] = useState<string | null>(null)

  useEffect(() => {
    fetchVideoAnalysis()
    fetchAdjacentVideos()
  }, [videoId])

  const fetchVideoAnalysis = async () => {
    try {
      const res = await fetch(`/api/video-analysis/${videoId}`)
      if (res.ok) {
        const data = await res.json()
        setVideo(data.video)
        if (data.warning) {
          setFileWarning(data.warning)
        }
      }
    } catch (error) {
      console.error('Error fetching video:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdjacentVideos = async () => {
    try {
      const res = await fetch('/api/video-analysis')
      if (res.ok) {
        const data = await res.json()
        const videos = data.videos || []
        const currentIndex = videos.findIndex((v: any) => v.id === videoId)
        
        if (currentIndex > 0) {
          setPrevVideoId(videos[currentIndex - 1].id)
        } else {
          setPrevVideoId(null)
        }
        
        if (currentIndex >= 0 && currentIndex < videos.length - 1) {
          setNextVideoId(videos[currentIndex + 1].id)
        } else {
          setNextVideoId(null)
        }
      }
    } catch (error) {
      console.error('Error fetching adjacent videos:', error)
    }
  }

  const downloadPDF = () => {
    if (!video) return

    const pdfHTML = generateAnalysisPDF({
      playerName: (session?.user as any)?.name || 'Player',
      videoTitle: video.title,
      analysisDate: new Date(video.uploadedAt).toLocaleDateString(),
      overallScore: video.overallScore || 0,
      strengths: video.strengths as string[] || [],
      improvements: video.areasForImprovement as string[] || [],
      recommendations: video.recommendations as string[] || [],
      shotAnalysis: video.shotTypes || [],
      movementMetrics: video.movementMetrics,
      technicalScores: video.technicalScores,
      keyMoments: video.keyMoments || []
    })

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(pdfHTML)
      printWindow.document.close()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin" />
          <p className="text-slate-400">Loading analysis...</p>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <h2 className="text-2xl font-bold text-white mb-2">Video Not Found</h2>
          <p className="text-slate-400 mb-6">This video analysis could not be loaded.</p>
          <Button asChild>
            <Link href="/train/video">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Video Analysis
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Convert shotTypes from object to array if needed
  const rawShotTypes = video.shotTypes as any
  const shotTypes = Array.isArray(rawShotTypes) 
    ? rawShotTypes 
    : rawShotTypes && typeof rawShotTypes === 'object'
      ? Object.entries(rawShotTypes).map(([type, data]: [string, any]) => ({
          type,
          count: data.count || 0,
          accuracy: data.accuracy || 0,
          successRate: data.successRate || 0,
          powerRating: data.powerRating || 0,
          avgSpeed: data.avgSpeed
        }))
      : []
  
  const movementMetrics = video.movementMetrics as any
  const technicalScores = video.technicalScores as any
  const keyMoments = (video.keyMoments as any[]) || []
  const strengths = (video.strengths as string[]) || []
  const improvements = (video.areasForImprovement as string[]) || []
  const recommendations = (video.recommendations as string[]) || []

  // Check if analysis has meaningful data
  const hasAnalysisData = strengths.length > 0 || improvements.length > 0 || recommendations.length > 0 || shotTypes.length > 0
  const hasMinimalData = (video.overallScore && video.overallScore > 0) || 
                         (movementMetrics && Object.keys(movementMetrics).length > 0) || 
                         (technicalScores && Object.keys(technicalScores).length > 0)
  const isProcessing = video.analysisStatus === 'PROCESSING'
  const isCompleted = video.analysisStatus === 'COMPLETED'
  const isPending = video.analysisStatus === 'PENDING'
  // Only show warning if TRULY no data exists - if either analysis data OR minimal data exists, don't show warning
  const showLimitedDataWarning = isCompleted && !hasAnalysisData && !hasMinimalData && !video.overallScore

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Enhanced Header with Coach Kai Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 p-0.5">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300">
                  <Link href="/dashboard">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Dashboard
                  </Link>
                </Button>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300">
                  <Link href="/train">
                    Train
                  </Link>
                </Button>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300">
                  <Link href="/train/analysis-library">
                    <Library className="w-4 h-4 mr-1" />
                    Analysis Library
                  </Link>
                </Button>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <span className="text-cyan-400 font-medium">Analysis Details</span>
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-2">
              {prevVideoId && (
                <Button 
                  variant="outline" 
                  asChild 
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-cyan-500/50 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
                >
                  <Link href={`/train/analysis/${prevVideoId}`}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Link>
                </Button>
              )}
              {nextVideoId && (
                <Button 
                  variant="outline" 
                  asChild
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-cyan-500/50 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
                >
                  <Link href={`/train/analysis/${nextVideoId}`}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={downloadPDF} 
                className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-cyan-500/50 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button 
                variant="outline" 
                className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-cyan-500/50 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </motion.div>

        {/* File Warning Banner */}
        {fileWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-300 mb-1">Video File Issue</h4>
              <p className="text-sm text-slate-300">{fileWarning}</p>
              <p className="text-xs text-slate-400 mt-2">
                The analysis data is available, but the video file cannot be played. Please re-upload your video or contact support.
              </p>
            </div>
          </motion.div>
        )}

        {/* Analysis Status Banner - Only show if truly no data */}
        {showLimitedDataWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-300 mb-1">Basic Analysis Only</h4>
              <p className="text-sm text-slate-300">
                This video has been processed with basic analysis. Detailed insights and recommendations are not yet available.
              </p>
              <p className="text-xs text-slate-400 mt-2">
                You can re-analyze this video to generate comprehensive AI-powered insights and personalized recommendations.
              </p>
            </div>
          </motion.div>
        )}

        {/* Processing Status Banner */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-start gap-3"
          >
            <Loader2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5 animate-spin" />
            <div className="flex-1">
              <h4 className="font-semibold text-cyan-300 mb-1">AI Analysis in Progress</h4>
              <p className="text-sm text-slate-300">
                Coach Kai is analyzing your video. This typically takes 2-5 minutes depending on video length and complexity.
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Refresh this page in a few minutes to see your personalized analysis and recommendations.
              </p>
            </div>
          </motion.div>
        )}

        {/* Pending Status Banner */}
        {isPending && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3"
          >
            <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-300 mb-1">Awaiting Analysis</h4>
              <p className="text-sm text-slate-300">
                Your video is queued for analysis. Analysis will begin shortly.
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Check back in a few minutes for your comprehensive analysis results.
              </p>
            </div>
          </motion.div>
        )}

        {/* MODULE 1: AI Visual Analysis with Frame Overlays */}
        <div className="mb-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Visual Analysis</h2>
              <p className="text-slate-400">Real-time pose detection, angle measurements, and trajectory prediction</p>
            </div>
          </div>

          {/* Import and render the AI Video Player */}
          <AIVideoPlayer 
            videoUrl={video.videoUrl}
            videoId={video.id}
            analysisData={video}
            keyMoments={keyMoments}
          />

          {/* Import and render Side-by-Side Comparison */}
          <SideBySideComparison 
            userVideoUrl={video.videoUrl}
            userVideoId={video.id}
            analysisData={video}
          />
        </div>

        {/* MODULE 2: Interactive Analytics Dashboard */}
        <InteractiveDashboard analysisData={video} />

        {/* MODULE 3: Before/After Progress Tracking */}
        <ProgressTracking userId={session?.user?.id || ''} currentAnalysis={video} />

        {/* MODULE 4: Shot-by-Shot Breakdown with Progress Tracking */}
        {!video.detectedShots || (Array.isArray(video.detectedShots) && video.detectedShots.length === 0) ? (
          <ShotDetectionProgress 
            videoId={videoId} 
            onComplete={() => fetchVideoAnalysis()}
          />
        ) : (
          <ShotByBreakdown videoUrl={video.videoUrl} analysisData={video} />
        )}

        {/* Analysis Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 bg-slate-800/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="shots">Shots</TabsTrigger>
            <TabsTrigger value="movement">Movement</TabsTrigger>
            <TabsTrigger value="technique">Technique</TabsTrigger>
            <TabsTrigger value="moments">Key Moments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Strengths */}
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <ThumbsUp className="w-5 h-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {strengths.map((strength, idx) => (
                    <div key={idx} className="flex gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300">{strength}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Areas for Improvement */}
              <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <Target className="w-5 h-5" />
                    Areas to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {improvements.map((improvement, idx) => (
                    <div key={idx} className="flex gap-2">
                      <ChevronRight className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300">{improvement}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-cyan-400">
                    <Lightbulb className="w-5 h-5" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300">{rec}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Shots Tab */}
          <TabsContent value="shots">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Trophy className="w-5 h-5 text-cyan-400" />
                  Shot Analysis Breakdown
                </CardTitle>
                <CardDescription>
                  Detailed analysis of {video.totalShots || 0} total shots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {shotTypes.map((shot: any, idx: number) => (
                    <Card key={idx} className="bg-slate-900/50 border-slate-700 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-white capitalize">{shot.type}</h4>
                          <Badge variant="secondary">{shot.count}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-400">Accuracy</span>
                              <span className="text-white font-medium">{Math.round(shot.accuracy)}%</span>
                            </div>
                            <Progress value={Math.round(shot.accuracy)} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-400">Success Rate</span>
                              <span className="text-white font-medium">{Math.round(shot.successRate)}%</span>
                            </div>
                            <Progress value={Math.round(shot.successRate)} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-400">Power</span>
                              <span className="text-white font-medium">{Math.round(shot.powerRating)}%</span>
                            </div>
                            <Progress value={Math.round(shot.powerRating)} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Movement Tab */}
          <TabsContent value="movement">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Movement & Positioning Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {movementMetrics && (
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      { label: 'Court Coverage', value: movementMetrics.courtCoverage, icon: Target },
                      { label: 'Movement Efficiency', value: movementMetrics.efficiency, icon: Gauge },
                      { label: 'Positioning Score', value: movementMetrics.positioning, icon: Eye },
                      { label: 'Anticipation', value: movementMetrics.anticipation, icon: Brain },
                      { label: 'Footwork Rating', value: movementMetrics.footwork, icon: Activity },
                      { label: 'Average Speed', value: movementMetrics.avgSpeed, icon: Zap, unit: ' m/s' }
                    ].map((metric, idx) => {
                      const roundedValue = metric.unit ? Math.round(metric.value * 10) / 10 : Math.round(metric.value)
                      return (
                        <Card key={idx} className="bg-slate-900/50 border-slate-700 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <metric.icon className="w-10 h-10 text-cyan-400" />
                            </div>
                            <p className="text-4xl font-bold text-white mb-2">
                              {roundedValue}{metric.unit || '%'}
                            </p>
                            <p className="text-sm text-slate-400 font-medium">{metric.label}</p>
                            {!metric.unit && <Progress value={roundedValue} className="h-3 mt-4" />}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technique Tab */}
          <TabsContent value="technique">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Award className="w-5 h-5 text-cyan-400" />
                  Technical Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {technicalScores && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { label: 'Paddle Angle', value: technicalScores.paddleAngle },
                      { label: 'Follow Through', value: technicalScores.followThrough },
                      { label: 'Body Rotation', value: technicalScores.bodyRotation },
                      { label: 'Ready Position', value: technicalScores.readyPosition },
                      { label: 'Grip Technique', value: technicalScores.gripTechnique },
                      { label: 'Overall Technique', value: technicalScores.overall }
                    ].map((score, idx) => {
                      const roundedScore = Math.round(score.value)
                      return (
                        <Card key={idx} className="bg-slate-900/50 border-slate-700 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-300">
                          <CardContent className="p-6">
                            <p className="text-sm text-slate-400 mb-3 font-medium">{score.label}</p>
                            <p className="text-4xl font-bold text-white mb-4">{roundedScore}%</p>
                            <Progress value={roundedScore} className="h-3" />
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Key Moments Tab */}
          <TabsContent value="moments">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Star className="w-5 h-5 text-cyan-400" />
                  Key Moments Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {keyMoments.map((moment: any, idx: number) => (
                  <Card
                    key={idx}
                    className={cn(
                      "border-l-4",
                      moment.type === 'strength' ? "border-green-500 bg-green-500/5" :
                      moment.type === 'improvement' ? "border-yellow-500 bg-yellow-500/5" :
                      "border-purple-500 bg-purple-500/5"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge
                            className={cn(
                              "mb-2",
                              moment.type === 'strength' ? "bg-green-500" :
                              moment.type === 'improvement' ? "bg-yellow-500" :
                              "bg-purple-500"
                            )}
                          >
                            {moment.timestampFormatted}
                          </Badge>
                          <h4 className="font-semibold text-white">{moment.title}</h4>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {moment.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-300">{moment.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
