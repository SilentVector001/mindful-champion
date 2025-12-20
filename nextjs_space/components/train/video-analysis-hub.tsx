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
import { AchievementToast, useAchievementNotifications } from "@/components/rewards/achievement-toast"
import { parseScore, formatScore, getSafeScore } from "@/lib/video-analysis/score-utils"
import { upload } from '@vercel/blob/client'

// Onboarding Walkthrough Component - Spotlight Style
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
      target: "upload-dropzone",
      icon: Upload,
      position: "below" as const,
      arrowPosition: "top" as const
    },
    {
      title: "AI analyzes every shot",
      description: "Coach Kai's neural networks analyze technique, movement patterns, shot selection, and strategic positioning.",
      target: "how-it-works",
      icon: Brain,
      position: "above" as const,
      arrowPosition: "bottom" as const
    },
    {
      title: "Your videos live here",
      description: "View your library with AI scores, insights, and track your improvement over time.",
      target: "library-tab",
      icon: Library,
      position: "below" as const,
      arrowPosition: "top" as const
    }
  ]

  const currentStep = steps[step - 1]
  if (!currentStep) return null

  // Get target element position
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    const targetEl = document.getElementById(currentStep.target)
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect()
      const scrollY = window.scrollY
      
      // Spotlight around target element
      setSpotlightStyle({
        top: rect.top + scrollY - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      })
      
      // Position tooltip relative to element
      if (currentStep.position === 'below') {
        setTooltipStyle({
          top: rect.bottom + scrollY + 16,
          left: Math.max(16, Math.min(rect.left + rect.width / 2 - 200, window.innerWidth - 416)),
        })
      } else {
        setTooltipStyle({
          top: rect.top + scrollY - 220,
          left: Math.max(16, Math.min(rect.left + rect.width / 2 - 200, window.innerWidth - 416)),
        })
      }
    }
  }, [step, currentStep.target, currentStep.position])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100]"
    >
      {/* Very light overlay - content clearly visible */}
      <div 
        className="absolute inset-0 pointer-events-auto"
        onClick={onComplete}
        style={{
          background: 'rgba(255,255,255,0.15)',
        }}
      />
      
      {/* Animated spotlight ring around target */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          boxShadow: [
            "0 0 0 9999px rgba(255,255,255,0.15), 0 0 40px rgba(0,200,255,0.8), 0 0 80px rgba(0,200,255,0.4)",
            "0 0 0 9999px rgba(255,255,255,0.15), 0 0 50px rgba(0,200,255,1), 0 0 100px rgba(0,200,255,0.5)",
            "0 0 0 9999px rgba(255,255,255,0.15), 0 0 40px rgba(0,200,255,0.8), 0 0 80px rgba(0,200,255,0.4)"
          ]
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        className="absolute rounded-xl border-4 border-kai-primary pointer-events-none z-[101]"
        style={{
          ...spotlightStyle,
          background: 'rgba(255,255,255,0.02)',
        }}
      />
      
      {/* Tooltip with arrow */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute z-[102] pointer-events-auto"
        style={tooltipStyle}
      >
        {/* Arrow */}
        <div className={cn(
          "absolute w-4 h-4 bg-slate-900 border-kai-primary rotate-45 z-[103]",
          currentStep.arrowPosition === 'top' && "left-1/2 -translate-x-1/2 -top-2 border-l-2 border-t-2",
          currentStep.arrowPosition === 'bottom' && "left-1/2 -translate-x-1/2 -bottom-2 border-r-2 border-b-2"
        )} />
        
        <Card className="bg-slate-900 border-2 border-kai-primary shadow-2xl shadow-kai-primary/30 w-[400px] relative">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-r from-kai-primary to-kai-secondary flex items-center justify-center flex-shrink-0">
                <currentStep.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-kai-primary/20 text-kai-primary border-kai-primary/30 text-xs">
                    Step {step} of 3
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">{currentStep.title}</h3>
                <p className="text-slate-300 text-sm mb-3 leading-relaxed">{currentStep.description}</p>
                <div className="flex items-center justify-between">
                  <Link href="/help" className="text-kai-primary text-xs hover:underline flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    Need more help? Visit Help Center
                  </Link>
                  <Button
                    onClick={onComplete}
                    size="sm"
                    className="bg-gradient-to-r from-kai-primary to-kai-secondary text-sm px-4"
                  >
                    {step === 3 ? "Got it!" : "Next"}
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            </div>
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-3">
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
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : video.videoUrl ? (
            <video
              src={video.videoUrl}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              muted
              preload="metadata"
              poster=""
            />
          ) : null}
          
          {/* Attractive Placeholder - always show as fallback layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-kai-primary/20 via-slate-800 to-kai-secondary/20 flex flex-col items-center justify-center -z-10">
            {/* Pickleball pattern background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-8 h-8 rounded-full border-2 border-white/30" />
              <div className="absolute top-8 right-6 w-6 h-6 rounded-full border-2 border-white/20" />
              <div className="absolute bottom-6 left-8 w-5 h-5 rounded-full border-2 border-white/20" />
              <div className="absolute bottom-4 right-4 w-7 h-7 rounded-full border-2 border-white/30" />
            </div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-kai-primary/40 to-kai-secondary/40 flex items-center justify-center mb-3 backdrop-blur-sm border border-white/10">
              <VideoIcon className="w-7 h-7 text-white/70" />
            </div>
            <p className="text-white/60 text-xs font-medium max-w-[80%] text-center truncate px-2">
              {video.title}
            </p>
          </div>
          
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

// View Examples Modal
function ViewExamplesModal({ onClose }: { onClose: () => void }) {
  const exampleVideos = [
    {
      id: 1,
      title: "Pro Serve Analysis",
      videoUrl: "/videos/examples/IMG_0421.MOV",
      score: 85,
      tags: ["Serve", "Technique"],
      strengths: ["Strong topspin on serve", "Consistent ball toss placement", "Good leg drive and power generation"],
      improvements: ["Follow-through could be more complete", "Slight hesitation before contact"],
      keyMetrics: { power: 82, accuracy: 88, consistency: 85 }
    },
    {
      id: 2,
      title: "Dink Rally Breakdown",
      videoUrl: "/videos/examples/IMG_0422.MOV",
      score: 78,
      tags: ["Dink", "Footwork"],
      strengths: ["Excellent soft hands at the kitchen", "Good court positioning", "Patient shot selection"],
      improvements: ["Footwork could be quicker on lateral moves", "Paddle face angle inconsistent"],
      keyMetrics: { touch: 80, positioning: 82, patience: 75 }
    }
  ]

  const [selectedVideo, setSelectedVideo] = useState(exampleVideos[0])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-kai-primary/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-kai-primary to-kai-secondary flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Example Analyses</h3>
                <p className="text-sm text-slate-400">See what Coach Kai's analysis looks like</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Video Selector Tabs */}
          <div className="flex gap-2 mb-4">
            {exampleVideos.map((video) => (
              <Button
                key={video.id}
                variant={selectedVideo.id === video.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedVideo(video)}
                className={selectedVideo.id === video.id ? "bg-kai-primary" : "border-slate-600"}
              >
                {video.title}
              </Button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Video Preview */}
            <div>
              <div className="aspect-video rounded-xl overflow-hidden bg-black mb-4">
                <video
                  key={selectedVideo.videoUrl}
                  src={selectedVideo.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                  playsInline
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {selectedVideo.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs border-kai-primary/50 text-kai-primary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Analysis Results */}
            <div className="space-y-4">
              {/* Score */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-kai-primary to-kai-secondary flex items-center justify-center">
                    <span className="text-2xl font-black text-white">{selectedVideo.score}</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">AI Performance Score</p>
                    <p className="text-lg font-semibold text-white">{selectedVideo.title}</p>
                  </div>
                </div>
              </div>

              {/* Strengths */}
              <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Strengths
                </h4>
                <ul className="space-y-1 text-sm text-slate-300">
                  {selectedVideo.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas to Improve */}
              <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
                <h4 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Areas to Improve
                </h4>
                <ul className="space-y-1 text-sm text-slate-300">
                  {selectedVideo.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 mt-1">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Metrics */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <h4 className="text-sm font-semibold text-slate-300 mb-3">Key Metrics</h4>
                <div className="space-y-2">
                  {Object.entries(selectedVideo.keyMetrics).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-20 capitalize">{key}</span>
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-kai-primary to-kai-secondary rounded-full"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-white w-8">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Quick Start Guide Modal
function QuickStartModal({ onClose }: { onClose: () => void }) {
  const steps = [
    {
      step: 1,
      title: "Upload Your Video",
      description: "Record your pickleball game with any device - phone, GoPro, or camera. Upload the video file (MP4, MOV, or AVI up to 500MB).",
      icon: Upload,
      tip: "Tip: Side-angle recordings work best for technique analysis"
    },
    {
      step: 2,
      title: "AI Analysis Begins",
      description: "Coach Kai's neural networks analyze every frame - tracking your movements, shots, positioning, and technique.",
      icon: Brain,
      tip: "Analysis typically takes 2-5 minutes depending on video length"
    },
    {
      step: 3,
      title: "Review Your Results",
      description: "Get detailed insights including an AI score, strengths, areas to improve, shot breakdowns, and key moments.",
      icon: BarChart3,
      tip: "Click on any video in your library to see full analysis"
    },
    {
      step: 4,
      title: "Track Your Progress",
      description: "Upload multiple videos over time to track your improvement. Download PDF reports to share with coaches.",
      icon: TrendingUp,
      tip: "Compare scores across videos to measure your growth"
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-kai-primary/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-kai-primary to-kai-secondary flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Quick Start Guide</h3>
                <p className="text-sm text-slate-400">Get started with video analysis in 4 easy steps</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            {steps.map((item) => (
              <div key={item.step} className="flex gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-kai-primary to-kai-secondary flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-kai-primary/20 text-kai-primary border-0 text-xs">Step {item.step}</Badge>
                    <h4 className="font-semibold text-white">{item.title}</h4>
                  </div>
                  <p className="text-sm text-slate-300 mb-2">{item.description}</p>
                  <p className="text-xs text-kai-primary flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    {item.tip}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={onClose} className="flex-1 bg-gradient-to-r from-kai-primary to-kai-secondary">
              Got it, let's upload!
            </Button>
            <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
              Close
            </Button>
          </div>
        </div>
      </motion.div>
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
  
  // Modal states
  const [showViewExamples, setShowViewExamples] = useState(false)
  const [showQuickStart, setShowQuickStart] = useState(false)

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

      {/* View Examples Modal */}
      <AnimatePresence>
        {showViewExamples && (
          <ViewExamplesModal onClose={() => setShowViewExamples(false)} />
        )}
      </AnimatePresence>

      {/* Quick Start Guide Modal */}
      <AnimatePresence>
        {showQuickStart && (
          <QuickStartModal onClose={() => setShowQuickStart(false)} />
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
              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-3">
                <Button 
                  variant="default" 
                  className="bg-gradient-to-r from-kai-primary to-kai-secondary"
                  onClick={() => setShowQuickStart(true)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Quick Start Guide
                </Button>
                <Button 
                  variant="outline" 
                  className="border-border/50 hover:bg-card/50"
                  onClick={() => setShowViewExamples(true)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Examples
                </Button>
                <Button variant="outline" className="border-border/50 hover:bg-card/50" asChild>
                  <Link href="/train/coach">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Ask Coach Kai
                  </Link>
                </Button>
              </div>

              {/* 4-Step Visual Journey Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    step: 1,
                    title: "Record Your Game",
                    bullets: ["Any device", "All formats", "Up to 500MB"],
                    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop",
                    link: "#upload-dropzone"
                  },
                  {
                    step: 2,
                    title: "AI Analyzes Every Shot",
                    bullets: ["Shot tracking", "Movement analysis", "Technique scoring"],
                    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
                    link: "#"
                  },
                  {
                    step: 3,
                    title: "Review Detailed Insights",
                    bullets: ["Pro-level metrics", "Visual heatmaps", "Key moments"],
                    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
                    link: "#"
                  },
                  {
                    step: 4,
                    title: "Track Your Improvement",
                    bullets: ["Before/after", "Progress trends", "Printable reports"],
                    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop",
                    link: "#"
                  }
                ].map((card) => (
                  <motion.div
                    key={card.step}
                    whileHover={{ y: -4 }}
                    className="relative group"
                  >
                    <Card className="bg-card/40 backdrop-blur border-border/50 overflow-hidden hover:border-kai-primary/50 transition-all">
                      {/* Step Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-kai-primary to-kai-secondary flex items-center justify-center font-bold text-white shadow-lg">
                          {card.step}
                        </div>
                      </div>
                      {/* AI Icon */}
                      <div className="absolute top-3 right-3 z-10">
                        <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                          <Brain className="w-3.5 h-3.5 text-kai-primary" />
                        </div>
                      </div>
                      {/* Image */}
                      <div className="aspect-video relative overflow-hidden">
                        <Image
                          src={card.image}
                          alt={card.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-foreground mb-2">{card.title}</h4>
                        <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                          {card.bullets.map((bullet, idx) => (
                            <li key={idx} className="flex items-center gap-1.5">
                              <div className="w-1 h-1 rounded-full bg-kai-primary" />
                              {bullet}
                            </li>
                          ))}
                        </ul>
                        <Link 
                          href={card.link}
                          className="text-kai-primary text-xs font-medium hover:underline flex items-center gap-1 group/link"
                        >
                          Learn More
                          <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

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
                      id="upload-dropzone"
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

              {/* Collapsible How It Works Section - 3 Icon Cards Only */}
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
                      <div className="grid md:grid-cols-3 gap-4 pt-4">
                        {[
                          { icon: Cpu, label: "AI-Powered Analysis", desc: "Advanced neural networks", color: "from-cyan-500 to-blue-500" },
                          { icon: Zap, label: "Results in Minutes", desc: "Lightning-fast processing", color: "from-green-500 to-emerald-500" },
                          { icon: LineChart, label: "Pro-Level Insights", desc: "Professional-grade metrics", color: "from-purple-500 to-pink-500" }
                        ].map((feature, idx) => (
                          <Card key={idx} className="bg-card/30 border-border/50">
                            <CardContent className="p-6 text-center">
                              <div className={cn("w-14 h-14 mx-auto rounded-full bg-gradient-to-br flex items-center justify-center mb-4", feature.color)}>
                                <feature.icon className="w-7 h-7 text-white" />
                              </div>
                              <h4 className="font-semibold text-foreground mb-1">{feature.label}</h4>
                              <p className="text-sm text-muted-foreground">{feature.desc}</p>
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
              {/* Stats Summary Bar */}
              {videoLibrary.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card className="bg-gradient-to-br from-kai-primary/20 to-kai-secondary/20 border-kai-primary/30">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-kai-primary/30 flex items-center justify-center">
                        <Film className="w-5 h-5 text-kai-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{libraryStats.totalVideos}</p>
                        <p className="text-xs text-muted-foreground">Total Videos</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/30 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{libraryStats.totalAnalyzed}</p>
                        <p className="text-xs text-muted-foreground">Analyzed</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-amber-500/30">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/30 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {videoLibrary.filter(v => v.overallScore).length > 0 
                            ? Math.round(videoLibrary.filter(v => v.overallScore).reduce((sum, v) => sum + (v.overallScore || 0), 0) / videoLibrary.filter(v => v.overallScore).length)
                            : '--'}
                        </p>
                        <p className="text-xs text-muted-foreground">Avg Score</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {libraryStats.avgImprovement > 0 ? `+${libraryStats.avgImprovement}%` : '--'}
                        </p>
                        <p className="text-xs text-muted-foreground">Improvement</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

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
