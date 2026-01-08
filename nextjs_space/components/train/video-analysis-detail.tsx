// @ts-nocheck

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
  ChevronRight, ChevronLeft, Star, Award, Gauge, Zap, Brain, AlertCircle, ThumbsUp, Library, Loader2, Users
} from "lucide-react"
import { cn } from "@/lib/utils"
import { generateAnalysisPDF } from "@/lib/pdf-generator"
import type { VideoAnalysisData } from "@/lib/video-analysis-types"
import AIVideoPlayer from "@/components/video-analysis/ai-video-player"
import SideBySideComparison from "@/components/video-analysis/side-by-side-comparison"
import KeyMetricsDashboard from "@/components/video-analysis/key-metrics-dashboard"
import ProgressTracking from "@/components/video-analysis/progress-tracking"
import ShotByBreakdown from "@/components/video-analysis/shot-by-shot-breakdown"
import ShotDetectionProgress from "@/components/video-analysis/shot-detection-progress"
import ShotClipsViewer from "@/components/video-analysis/shot-clips-viewer"
import { PublishToCommunityModal } from "@/components/community"

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
  const [showShareModal, setShowShareModal] = useState(false)

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

  // Convert shotTypes from object to array if needed with proper null checks
  const rawShotTypes = video.shotTypes as any
  const shotTypes = Array.isArray(rawShotTypes) 
    ? rawShotTypes 
    : rawShotTypes && typeof rawShotTypes === 'object'
      ? Object.entries(rawShotTypes).map(([type, data]: [string, any]) => ({
          type,
          count: data?.count ?? 0,
          accuracy: data?.accuracy ?? 0,
          successRate: data?.successRate ?? 0,
          powerRating: data?.powerRating ?? 0,
          avgSpeed: data?.avgSpeed ?? 0
        }))
      : []
  
  // Movement metrics with proper null checks and fallback values
  const rawMovementMetrics = video.movementMetrics as any
  const movementMetrics = rawMovementMetrics ? {
    courtCoverage: rawMovementMetrics.courtCoverage ?? 0,
    efficiency: rawMovementMetrics.efficiency ?? 0,
    positioning: rawMovementMetrics.positioning ?? 0,
    anticipation: rawMovementMetrics.anticipation ?? 0,
    footwork: rawMovementMetrics.footwork ?? 0,
    avgSpeed: rawMovementMetrics.avgSpeed ?? 0
  } : null
  
  // Technical scores with proper null checks and fallback values
  const rawTechnicalScores = video.technicalScores as any
  const technicalScores = rawTechnicalScores ? {
    paddleAngle: rawTechnicalScores.paddleAngle ?? 0,
    followThrough: rawTechnicalScores.followThrough ?? 0,
    bodyRotation: rawTechnicalScores.bodyRotation ?? 0,
    readyPosition: rawTechnicalScores.readyPosition ?? 0,
    gripTechnique: rawTechnicalScores.gripTechnique ?? 0,
    overall: rawTechnicalScores.overall ?? 0
  } : null
  
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
                onClick={() => setShowShareModal(true)}
                className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-500 shadow-lg hover:shadow-teal-500/20 transition-all duration-300"
              >
                <Users className="w-4 h-4 mr-2" />
                Share to Community
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Share to Community Modal */}
        {showShareModal && video && (
          <PublishToCommunityModal
            videoAnalysisId={videoId}
            videoTitle={video.title}
            onClose={() => setShowShareModal(false)}
          />
        )}

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

        {/* COMMUNITY SHARE CTA - PROMINENT BANNER */}
        {!isProcessing && !isPending && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="relative group cursor-pointer" onClick={() => setShowShareModal(true)}>
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-75 group-hover:opacity-100" />
              
              {/* Main banner card */}
              <div className="relative bg-gradient-to-br from-teal-500/10 via-cyan-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-teal-500/30 group-hover:border-teal-400/50 shadow-2xl shadow-teal-500/20 transition-all duration-300 group-hover:scale-[1.02]">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Icon section */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                      <div className="relative p-6 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl shadow-lg">
                        <Users className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Content section */}
                  <div className="flex-1 text-center md:text-left space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
                        Share Your Progress with the Community!
                      </h3>
                      <Badge className="bg-teal-500/20 text-teal-300 border-teal-400/50 text-sm font-semibold px-3 py-1 w-fit mx-auto md:mx-0">
                        ✨ New Feature
                      </Badge>
                    </div>
                    <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
                      Get feedback from fellow players, inspire others with your improvement journey, and learn from the community's collective wisdom. 
                      Your analysis could help hundreds of players improve their game!
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2 justify-center md:justify-start">
                      <div className="flex items-center gap-2 text-teal-400">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-medium">Expert Feedback</span>
                      </div>
                      <div className="flex items-center gap-2 text-cyan-400">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-medium">Inspire Others</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-400">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-medium">Earn Recognition</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <div className="flex-shrink-0">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold px-8 py-6 text-lg rounded-xl shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-400/40 transition-all duration-300 group-hover:scale-105 border-2 border-teal-400/30"
                    >
                      <Users className="w-6 h-6 mr-3" />
                      Share Now
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* MODULE 1: AI Visual Analysis - Video Player at TOP */}
        <motion.div 
          className="mb-8 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            {/* Decorative background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-xl blur-2xl -z-10" />
            
            <div className="bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/50">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    AI Visual Analysis
                  </h2>
                  <p className="text-slate-300 text-base">Real-time pose detection, angle measurements, and trajectory prediction powered by Coach Kai</p>
                </div>
                <Button 
                  variant="outline" 
                  asChild
                  className="border-cyan-500/50 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all duration-300"
                >
                  <Link href="/train/analysis-library">
                    <Library className="w-4 h-4 mr-2" />
                    Video Library
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Import and render the AI Video Player */}
          {(() => {
            try {
              return (
                <AIVideoPlayer 
                  videoUrl={video.videoUrl || ''}
                  videoId={video.id}
                  analysisData={video}
                  keyMoments={keyMoments || []}
                />
              )
            } catch (error) {
              console.error('Error rendering AI Video Player:', error)
              return (
                <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                  <p className="text-red-400">Failed to load video player</p>
                </div>
              )
            }
          })()}

          {/* Import and render Side-by-Side Comparison */}
          {(() => {
            try {
              return (
                <SideBySideComparison 
                  userVideoUrl={video.videoUrl || ''}
                  userVideoId={video.id}
                  analysisData={video}
                />
              )
            } catch (error) {
              console.error('Error rendering Side-by-Side Comparison:', error)
              return null
            }
          })()}
        </motion.div>

        {/* MODULE 2: Key Performance Metrics - 4 Top Distinctions */}
        {(() => {
          try {
            return <KeyMetricsDashboard analysisData={video} />
          } catch (error) {
            console.error('Error rendering Key Metrics Dashboard:', error)
            return (
              <div className="mb-8 p-6 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center">
                <p className="text-amber-400">Unable to load metrics dashboard</p>
              </div>
            )
          }
        })()}

        {/* MODULE 3: Shot Detection & Individual Shot Clips - HIGHLIGHTED AS KEY FEATURE */}
        <motion.div 
          className="mb-8 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Premium Border and Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur-lg opacity-30 animate-pulse" />
          
          {/* Feature Badge */}
          <div className="absolute -top-4 left-8 z-10">
            <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 px-4 py-2 text-sm font-bold shadow-lg shadow-cyan-500/50">
              ⚡ KEY FEATURE: AI Shot Detection
            </Badge>
          </div>

          {/* Content Container */}
          <div className="relative bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 backdrop-blur-md rounded-xl border-2 border-cyan-500/30 shadow-2xl p-6">
            {/* Feature Header */}
            <div className="mb-6 pb-4 border-b border-cyan-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/50">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Intelligent Shot Detection
                  </h2>
                  <p className="text-slate-300 text-sm mt-1">
                    AI-powered analysis identifies and categorizes every shot with precision timing and quality assessment
                  </p>
                </div>
                <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs px-3 py-1">
                  🧠 Powered by Coach Kai AI
                </Badge>
              </div>
            </div>

            {/* Shot Detection Content */}
            {(() => {
              try {
                if (!video.detectedShots || !Array.isArray(video.detectedShots) || video.detectedShots.length === 0) {
                  return (
                    <ShotDetectionProgress 
                      videoId={videoId} 
                      onComplete={() => fetchVideoAnalysis()}
                    />
                  )
                }
                
                return (
                  <div className="space-y-6">
                    {/* Individual Shot Clips Viewer - Using Real Detected Shots from Database */}
                    {(() => {
                      try {
                        return (
                          <ShotClipsViewer 
                            videoUrl={video.videoUrl || ''}
                            shots={video.detectedShots}
                          />
                        )
                      } catch (error) {
                        console.error('Error rendering Shot Clips Viewer:', error)
                        return null
                      }
                    })()}
                    
                    {/* Detailed Shot-by-Shot Breakdown */}
                    {(() => {
                      try {
                        return <ShotByBreakdown videoUrl={video.videoUrl || ''} analysisData={video} />
                      } catch (error) {
                        console.error('Error rendering Shot-by-Shot Breakdown:', error)
                        return null
                      }
                    })()}
                  </div>
                )
              } catch (error) {
                console.error('Error in Shot Detection section:', error)
                return (
                  <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center">
                    <p className="text-amber-400">Unable to load shot detection</p>
                  </div>
                )
              }
            })()}
          </div>
        </motion.div>

        {/* MODULE 4: Before/After Progress Tracking - Achievement Milestones & History */}
        {(() => {
          try {
            return <ProgressTracking userId={session?.user?.id || ''} currentAnalysis={video} />
          } catch (error) {
            console.error('Error rendering Progress Tracking:', error)
            return null
          }
        })()}

        {/* Simplified Insights Section - Removed Redundant Metrics */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xl font-semibold text-white">Coach Kai's AI Insights</h3>
            </div>
            <p className="text-sm text-slate-400">
              Personalized feedback and recommendations based on your performance
            </p>
          </CardHeader>
        </Card>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-slate-800/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500">
              <Lightbulb className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="moments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500">
              <Star className="w-4 h-4 mr-2" />
              Key Moments
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - AI Insights */}
          <TabsContent value="overview" className="space-y-6">
            {strengths.length === 0 && improvements.length === 0 && recommendations.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <Brain className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Analysis In Progress</h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    Coach Kai is analyzing your video. Detailed insights, strengths, and personalized recommendations will appear here once the analysis is complete.
                  </p>
                </CardContent>
              </Card>
            ) : (
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
                    {strengths.length > 0 ? (
                      strengths.map((strength, idx) => (
                        <div key={idx} className="flex gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-slate-300">{strength}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 italic">No strengths identified yet</p>
                    )}
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
                    {improvements.length > 0 ? (
                      improvements.map((improvement, idx) => (
                        <div key={idx} className="flex gap-2">
                          <ChevronRight className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-slate-300">{improvement}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 italic">No improvements suggested yet</p>
                    )}
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
                    {recommendations.length > 0 ? (
                      recommendations.map((rec, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-slate-300">{rec}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 italic">No recommendations yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
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
                {keyMoments.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/10 flex items-center justify-center">
                      <Star className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Key Moments Yet</h3>
                    <p className="text-slate-400 max-w-md mx-auto mb-6">
                      Key moments highlight critical points in your gameplay—both strengths to celebrate and areas to improve. These will be automatically identified during the AI analysis.
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <CheckCircle2 className="w-6 h-6 text-green-400 mb-2" />
                        <h4 className="text-sm font-semibold text-green-400 mb-1">Strength Moments</h4>
                        <p className="text-xs text-slate-400">Exceptional plays and techniques</p>
                      </div>
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <Target className="w-6 h-6 text-yellow-400 mb-2" />
                        <h4 className="text-sm font-semibold text-yellow-400 mb-1">Improvement Areas</h4>
                        <p className="text-xs text-slate-400">Opportunities for growth</p>
                      </div>
                      <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <Lightbulb className="w-6 h-6 text-purple-400 mb-2" />
                        <h4 className="text-sm font-semibold text-purple-400 mb-1">Learning Moments</h4>
                        <p className="text-xs text-slate-400">Teaching opportunities</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  keyMoments.map((moment: any, idx: number) => (
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
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
