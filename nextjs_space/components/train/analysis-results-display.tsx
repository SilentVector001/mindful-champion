"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  Play, Pause, SkipBack, SkipForward, Rewind, FastForward,
  Volume2, VolumeX, Maximize2, Minimize2, Clock, Target,
  TrendingUp, AlertTriangle, CheckCircle2, Sparkles, Brain,
  MessageCircle, Download, Share2, Bookmark, ChevronRight,
  BarChart3, Zap, Award, Eye, Activity, Gauge, ArrowRight,
  ChevronDown, ChevronUp, ExternalLink, Dumbbell, Star
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart, RadialBarChart, RadialBar, Cell, Legend, PieChart, Pie } from 'recharts'

interface Shot {
  id: string
  timestamp: number
  type: string
  quality: 'excellent' | 'good' | 'needs-improvement'
  score: number
  speed?: number
  accuracy?: number
  feedback: string
  whatWentWell?: string
  whatToImprove?: string
}

interface CategoryScore {
  name: string
  score: number
  maxScore: number
  feedback: string
  tips: string[]
}

interface AnalysisData {
  id: string
  videoUrl: string
  thumbnailUrl?: string
  title: string
  duration: number
  analyzedAt: string
  overallScore: number
  shots: Shot[]
  categories: {
    stance: CategoryScore
    grip: CategoryScore
    swing: CategoryScore
    footwork: CategoryScore
  }
  strengths: string[]
  improvements: string[]
  recommendations: string[]
  proComparison?: {
    proName: string
    proVideoId: string
    similarityScore: number
  }
}

interface AnalysisResultsDisplayProps {
  analysis: AnalysisData
  onAskKai?: (context: string) => void
  onDownloadReport?: () => void
  onShare?: () => void
}

const QUALITY_COLORS = {
  'excellent': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'good': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  'needs-improvement': { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' }
}

function ScoreGauge({ score, size = 'lg' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: { container: 'w-16 h-16', text: 'text-lg', label: 'text-[8px]' },
    md: { container: 'w-24 h-24', text: 'text-2xl', label: 'text-xs' },
    lg: { container: 'w-32 h-32', text: 'text-4xl', label: 'text-sm' }
  }

  const getScoreColor = (s: number) => {
    if (s >= 80) return '#10b981'
    if (s >= 60) return '#22d3ee'
    if (s >= 40) return '#f59e0b'
    return '#ef4444'
  }

  const data = [{ name: 'Score', value: score, fill: getScoreColor(score) }]

  return (
    <div className={cn("relative", sizeClasses[size].container)}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={size === 'lg' ? 12 : size === 'md' ? 8 : 6}
          data={data}
          startAngle={180}
          endAngle={-180}
        >
          <RadialBar
            background={{ fill: '#1e293b' }}
            dataKey="value"
            cornerRadius={10}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold text-white", sizeClasses[size].text)}>{score}</span>
        <span className={cn("text-slate-400", sizeClasses[size].label)}>/ 100</span>
      </div>
    </div>
  )
}

function VideoPlayer({ 
  videoUrl, 
  shots,
  onTimestampClick 
}: { 
  videoUrl: string
  shots: Shot[]
  onTimestampClick?: (timestamp: number) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [selectedShot, setSelectedShot] = useState<Shot | null>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const changePlaybackRate = () => {
    const rates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]
    const currentIndex = rates.indexOf(playbackRate)
    const nextRate = rates[(currentIndex + 1) % rates.length]
    setPlaybackRate(nextRate)
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate
    }
  }

  const skipFrames = (frames: number) => {
    if (videoRef.current) {
      // Assuming 30fps
      videoRef.current.currentTime += frames / 30
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => setCurrentTime(video.currentTime)
    const handleLoadedMetadata = () => setDuration(video.duration)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [])

  // Find shot near current time
  useEffect(() => {
    const nearbyShot = shots?.find(s => Math.abs(s.timestamp - currentTime) < 0.5)
    if (nearbyShot && nearbyShot.id !== selectedShot?.id) {
      setSelectedShot(nearbyShot)
    }
  }, [currentTime, shots, selectedShot?.id])

  return (
    <div className="relative rounded-xl overflow-hidden bg-black group">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full aspect-video"
        muted={isMuted}
        playsInline
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => !isPlaying && setShowControls(true)}
      />

      {/* Shot Markers on Timeline */}
      <div className="absolute bottom-16 left-0 right-0 h-1 bg-slate-800/50">
        {shots?.map(shot => (
          <motion.button
            key={shot.id}
            className={cn(
              "absolute w-2 h-2 -top-0.5 rounded-full transform -translate-x-1/2 cursor-pointer",
              shot.quality === 'excellent' ? 'bg-emerald-400' :
              shot.quality === 'good' ? 'bg-cyan-400' : 'bg-amber-400'
            )}
            style={{ left: `${(shot.timestamp / duration) * 100}%` }}
            onClick={() => seekTo(shot.timestamp)}
            whileHover={{ scale: 1.5 }}
            title={`${shot.type} at ${formatTime(shot.timestamp)}`}
          />
        ))}
      </div>

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
              <Badge className="bg-slate-900/80 text-white border-slate-700">
                <Activity className="w-3 h-3 mr-1 text-emerald-400" />
                AI Analysis Active
              </Badge>
              {selectedShot && (
                <Badge className={cn(
                  QUALITY_COLORS[selectedShot.quality].bg,
                  QUALITY_COLORS[selectedShot.quality].text,
                  QUALITY_COLORS[selectedShot.quality].border
                )}>
                  {selectedShot.type} - Score: {selectedShot.score}
                </Badge>
              )}
            </div>

            {/* Center Play Button */}
            <button
              onClick={togglePlay}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </button>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
              {/* Progress Bar */}
              <div 
                className="relative h-1 bg-slate-700 rounded-full cursor-pointer group/progress"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const percent = (e.clientX - rect.left) / rect.width
                  seekTo(percent * duration)
                }}
              >
                <div 
                  className="absolute h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
                <div 
                  className="absolute w-3 h-3 bg-white rounded-full -top-1 transform -translate-x-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity"
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={togglePlay} className="text-white hover:bg-white/20 h-8 w-8 p-0">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => skipFrames(-10)} className="text-white hover:bg-white/20 h-8 w-8 p-0">
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => skipFrames(10)} className="text-white hover:bg-white/20 h-8 w-8 p-0">
                    <SkipForward className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-white/80 font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={changePlaybackRate}
                    className="text-white hover:bg-white/20 h-8 px-2 text-xs font-mono"
                  >
                    {playbackRate}x
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsMuted(!isMuted)} className="text-white hover:bg-white/20 h-8 w-8 p-0">
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shot Info Popup */}
      <AnimatePresence>
        {selectedShot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-4 right-4 w-64 bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-700 p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">{selectedShot.type}</span>
              <ScoreGauge score={selectedShot.score} size="sm" />
            </div>
            <p className="text-xs text-slate-400 mb-2">{selectedShot.feedback}</p>
            {selectedShot.whatWentWell && (
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5" />
                <span className="text-emerald-400">{selectedShot.whatWentWell}</span>
              </div>
            )}
            {selectedShot.whatToImprove && (
              <div className="flex items-start gap-2 text-xs mt-1">
                <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5" />
                <span className="text-amber-400">{selectedShot.whatToImprove}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CategoryBreakdown({ categories }: { categories: AnalysisData['categories'] }) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const categoryData = Object.entries(categories ?? {}).map(([key, value]) => ({
    id: key,
    ...value
  }))

  const getScoreColor = (score: number, max: number) => {
    const percent = (score / max) * 100
    if (percent >= 80) return 'text-emerald-400'
    if (percent >= 60) return 'text-cyan-400'
    if (percent >= 40) return 'text-amber-400'
    return 'text-red-400'
  }

  const getProgressColor = (score: number, max: number) => {
    const percent = (score / max) * 100
    if (percent >= 80) return 'bg-emerald-500'
    if (percent >= 60) return 'bg-cyan-500'
    if (percent >= 40) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-3">
      {categoryData.map((category) => (
        <motion.div
          key={category.id}
          className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden"
        >
          <button
            onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-800/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                {category.id === 'stance' && <Target className="w-5 h-5 text-cyan-400" />}
                {category.id === 'grip' && <Zap className="w-5 h-5 text-emerald-400" />}
                {category.id === 'swing' && <Activity className="w-5 h-5 text-amber-400" />}
                {category.id === 'footwork' && <TrendingUp className="w-5 h-5 text-purple-400" />}
              </div>
              <div className="text-left">
                <h4 className="text-sm font-medium text-white capitalize">{category.name || category.id}</h4>
                <p className="text-xs text-slate-400 line-clamp-1">{category.feedback}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn("text-lg font-bold", getScoreColor(category.score, category.maxScore))}>
                {category.score}/{category.maxScore}
              </span>
              <motion.div
                animate={{ rotate: expandedCategory === category.id ? 180 : 0 }}
              >
                <ChevronDown className="w-5 h-5 text-slate-400" />
              </motion.div>
            </div>
          </button>

          <AnimatePresence>
            {expandedCategory === category.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-slate-700"
              >
                <div className="p-4 space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Score Progress</span>
                      <span className={getScoreColor(category.score, category.maxScore)}>
                        {Math.round((category.score / category.maxScore) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(category.score / category.maxScore) * 100}%` }}
                        className={cn("h-full rounded-full", getProgressColor(category.score, category.maxScore))}
                      />
                    </div>
                  </div>

                  {/* Tips */}
                  {category.tips && category.tips.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-medium text-slate-300 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        Improvement Tips
                      </h5>
                      <ul className="space-y-1">
                        {category.tips.map((tip, i) => (
                          <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}

export default function AnalysisResultsDisplay({
  analysis,
  onAskKai,
  onDownloadReport,
  onShare
}: AnalysisResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Pie chart data for shot distribution
  const shotDistribution = analysis?.shots?.reduce((acc, shot) => {
    acc[shot.type] = (acc[shot.type] || 0) + 1
    return acc
  }, {} as Record<string, number>) ?? {}

  const pieData = Object.entries(shotDistribution).map(([name, value], i) => ({
    name,
    value,
    fill: ['#10b981', '#22d3ee', '#f59e0b', '#8b5cf6', '#ec4899'][i % 5]
  }))

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Overall Score */}
          <div className="flex flex-col items-center">
            <ScoreGauge score={analysis?.overallScore ?? 0} size="lg" />
            <span className="text-sm text-slate-400 mt-2">Overall Score</span>
          </div>

          {/* Summary */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-bold text-white mb-2">{analysis?.title || 'Video Analysis'}</h2>
            <p className="text-sm text-slate-400 mb-4">
              Analyzed on {analysis?.analyzedAt ? new Date(analysis.analyzedAt).toLocaleDateString() : 'N/A'} • {analysis?.shots?.length ?? 0} shots detected
            </p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {analysis?.strengths?.length ?? 0} Strengths
              </Badge>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {analysis?.improvements?.length ?? 0} Areas to Improve
              </Badge>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                {analysis?.recommendations?.length ?? 0} Recommendations
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => onAskKai?.(`Explain my video analysis results: Overall score ${analysis?.overallScore}, main areas to improve: ${analysis?.improvements?.slice(0, 2).join(', ')}`)}
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Ask Kai About This
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onDownloadReport} className="flex-1 border-slate-600">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onShare} className="flex-1 border-slate-600">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Video Player */}
      {analysis?.videoUrl && (
        <VideoPlayer 
          videoUrl={analysis.videoUrl} 
          shots={analysis.shots ?? []}
        />
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800 border border-slate-700 p-1 w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">Overview</TabsTrigger>
          <TabsTrigger value="shots" className="data-[state=active]:bg-slate-700">Shots</TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-slate-700">Categories</TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-slate-700">Drills</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4"
            >
              <h3 className="text-sm font-medium text-emerald-400 flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {analysis?.strengths?.map((strength, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    {strength}
                  </li>
                )) ?? <li className="text-sm text-slate-400">No strengths recorded</li>}
              </ul>
            </motion.div>

            {/* Areas to Improve */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4"
            >
              <h3 className="text-sm font-medium text-amber-400 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4" />
                Areas to Improve
              </h3>
              <ul className="space-y-2">
                {analysis?.improvements?.map((item, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                )) ?? <li className="text-sm text-slate-400">No improvements recorded</li>}
              </ul>
            </motion.div>
          </div>

          {/* Shot Distribution Chart */}
          {pieData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-slate-700 bg-slate-800/50 p-4"
            >
              <h3 className="text-sm font-medium text-slate-300 mb-4">Shot Distribution</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </TabsContent>

        {/* Shots Tab */}
        <TabsContent value="shots" className="space-y-3">
          {analysis?.shots?.map((shot, index) => (
            <motion.div
              key={shot.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "rounded-xl border p-4 flex items-center gap-4",
                QUALITY_COLORS[shot.quality].bg,
                QUALITY_COLORS[shot.quality].border
              )}
            >
              <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
                <span className={cn("text-lg font-bold", QUALITY_COLORS[shot.quality].text)}>
                  {shot.score}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{shot.type}</span>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {Math.floor(shot.timestamp / 60)}:{String(Math.floor(shot.timestamp % 60)).padStart(2, '0')}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">{shot.feedback}</p>
              </div>
              <div className="hidden md:flex items-center gap-4 text-xs">
                {shot.speed && (
                  <div className="text-center">
                    <div className="text-cyan-400 font-bold">{shot.speed} mph</div>
                    <div className="text-slate-500">Speed</div>
                  </div>
                )}
                {shot.accuracy && (
                  <div className="text-center">
                    <div className="text-emerald-400 font-bold">{shot.accuracy}%</div>
                    <div className="text-slate-500">Accuracy</div>
                  </div>
                )}
              </div>
            </motion.div>
          )) ?? <p className="text-slate-400 text-center py-8">No shots detected</p>}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <CategoryBreakdown categories={analysis?.categories ?? { stance: { name: 'Stance', score: 0, maxScore: 100, feedback: '', tips: [] }, grip: { name: 'Grip', score: 0, maxScore: 100, feedback: '', tips: [] }, swing: { name: 'Swing', score: 0, maxScore: 100, feedback: '', tips: [] }, footwork: { name: 'Footwork', score: 0, maxScore: 100, feedback: '', tips: [] } }} />
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-3">
          {analysis?.recommendations?.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 flex items-center gap-4 hover:bg-slate-800 transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">{rec}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </motion.div>
          )) ?? <p className="text-slate-400 text-center py-8">No recommendations available</p>}

          <Button className="w-full mt-4 bg-slate-800 hover:bg-slate-700 border border-slate-700" asChild>
            <Link href="/train/drills">
              <Sparkles className="w-4 h-4 mr-2" />
              Browse All Drills
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
