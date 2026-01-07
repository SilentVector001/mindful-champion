"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  Search, Filter, Calendar, TrendingUp, TrendingDown, Play,
  ChevronRight, Eye, Clock, Target, Award, BarChart3, Grid,
  List, SlidersHorizontal, X, CheckCircle2, Layers, ArrowUpRight,
  ArrowDownRight, Minus, Video, Sparkles, Trophy, Flame
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart, CartesianGrid } from 'recharts'

interface VideoAnalysisSummary {
  id: string
  title: string
  thumbnailUrl?: string
  duration: number
  uploadedAt: string
  analyzedAt: string
  analysisStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  overallScore: number | null
  shotTypes?: { type: string; count: number }[]
  techniqueType?: string
}

interface VideoHistoryComparisonProps {
  videos: VideoAnalysisSummary[]
  onSelectVideo: (videoId: string) => void
  onCompareVideos?: (videoIds: string[]) => void
}

const TECHNIQUE_TYPES = [
  { value: 'all', label: 'All Techniques' },
  { value: 'serve', label: 'Serve' },
  { value: 'dink', label: 'Dink' },
  { value: 'drive', label: 'Drive' },
  { value: 'third-shot', label: 'Third Shot Drop' },
  { value: 'volley', label: 'Volley' },
  { value: 'overhead', label: 'Overhead' },
]

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function ScoreTrend({ current, previous }: { current: number; previous?: number }) {
  if (!previous) return null
  
  const diff = current - previous
  const isPositive = diff > 0
  const isNeutral = diff === 0

  return (
    <div className={cn(
      "flex items-center gap-1 text-xs font-medium",
      isPositive ? "text-emerald-400" : isNeutral ? "text-slate-400" : "text-red-400"
    )}>
      {isPositive ? (
        <ArrowUpRight className="w-3 h-3" />
      ) : isNeutral ? (
        <Minus className="w-3 h-3" />
      ) : (
        <ArrowDownRight className="w-3 h-3" />
      )}
      {isNeutral ? 'No change' : `${isPositive ? '+' : ''}${diff}`}
    </div>
  )
}

function VideoCard({ 
  video, 
  previousScore,
  isSelected,
  onSelect,
  onView,
  compareMode
}: { 
  video: VideoAnalysisSummary
  previousScore?: number
  isSelected: boolean
  onSelect: () => void
  onView: () => void
  compareMode: boolean
}) {
  const score = video.overallScore
  const isCompleted = video.analysisStatus === 'COMPLETED'

  const getScoreColor = (s: number | null) => {
    if (s === null) return 'text-slate-400'
    if (s >= 80) return 'text-emerald-400'
    if (s >= 60) return 'text-cyan-400'
    if (s >= 40) return 'text-amber-400'
    return 'text-red-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        "rounded-xl border bg-slate-800/50 overflow-hidden transition-all cursor-pointer group",
        isSelected 
          ? "border-cyan-500 ring-2 ring-cyan-500/30" 
          : "border-slate-700 hover:border-slate-600"
      )}
      onClick={compareMode ? onSelect : onView}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-900">
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Video className="w-12 h-12 text-slate-600" />
          </div>
        )}

        {/* Status Overlay */}
        {video.analysisStatus !== 'COMPLETED' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge className={cn(
              video.analysisStatus === 'PROCESSING' 
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                : video.analysisStatus === 'FAILED'
                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                  : "bg-slate-500/20 text-slate-400 border-slate-500/30"
            )}>
              {video.analysisStatus === 'PROCESSING' ? 'Analyzing...' :
               video.analysisStatus === 'FAILED' ? 'Failed' : 'Pending'}
            </Badge>
          </div>
        )}

        {/* Duration Badge */}
        <Badge className="absolute bottom-2 right-2 bg-black/70 text-white text-xs">
          {formatDuration(video.duration)}
        </Badge>

        {/* Play Overlay */}
        {isCompleted && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-6 h-6 text-white ml-1" />
            </div>
          </div>
        )}

        {/* Selection Checkbox */}
        {compareMode && (
          <div className={cn(
            "absolute top-2 left-2 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors",
            isSelected 
              ? "bg-cyan-500 border-cyan-500" 
              : "bg-black/50 border-white/50 group-hover:border-white"
          )}>
            {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <h4 className="text-sm font-medium text-white line-clamp-1">{video.title}</h4>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">{formatDate(video.analyzedAt || video.uploadedAt)}</span>
          {isCompleted && score !== null && (
            <div className="flex items-center gap-2">
              <span className={cn("text-lg font-bold", getScoreColor(score))}>{score}</span>
              <ScoreTrend current={score} previous={previousScore} />
            </div>
          )}
        </div>

        {/* Shot Type Tags */}
        {video.shotTypes && video.shotTypes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {video.shotTypes.slice(0, 3).map((shot) => (
              <Badge 
                key={shot.type} 
                variant="outline" 
                className="text-[10px] py-0 px-1 border-slate-600 text-slate-400"
              >
                {shot.type}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function ProgressChart({ videos }: { videos: VideoAnalysisSummary[] }) {
  const completedVideos = videos
    .filter(v => v.analysisStatus === 'COMPLETED' && v.overallScore !== null)
    .sort((a, b) => new Date(a.analyzedAt).getTime() - new Date(b.analyzedAt).getTime())
    .map((v, i) => ({
      name: formatDate(v.analyzedAt),
      score: v.overallScore,
      index: i + 1
    }))

  if (completedVideos.length < 2) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
        Need at least 2 analyzed videos to show progress
      </div>
    )
  }

  const avgScore = Math.round(
    completedVideos.reduce((sum, v) => sum + (v.score ?? 0), 0) / completedVideos.length
  )
  const latestScore = completedVideos[completedVideos.length - 1]?.score ?? 0
  const firstScore = completedVideos[0]?.score ?? 0
  const improvement = latestScore - firstScore

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-slate-800/50 p-3 text-center">
          <div className="text-2xl font-bold text-white">{avgScore}</div>
          <div className="text-xs text-slate-400">Avg Score</div>
        </div>
        <div className="rounded-lg bg-slate-800/50 p-3 text-center">
          <div className="text-2xl font-bold text-cyan-400">{latestScore}</div>
          <div className="text-xs text-slate-400">Latest</div>
        </div>
        <div className="rounded-lg bg-slate-800/50 p-3 text-center">
          <div className={cn(
            "text-2xl font-bold",
            improvement > 0 ? "text-emerald-400" : improvement < 0 ? "text-red-400" : "text-slate-400"
          )}>
            {improvement > 0 ? '+' : ''}{improvement}
          </div>
          <div className="text-xs text-slate-400">Change</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={completedVideos}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              domain={[0, 100]} 
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{ 
                background: '#1e293b', 
                border: '1px solid #334155', 
                borderRadius: '8px',
                fontSize: 12
              }}
              labelStyle={{ color: '#fff' }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#22d3ee"
              strokeWidth={2}
              fill="url(#scoreGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function VideoComparison({ 
  videos, 
  selectedIds,
  onClose
}: { 
  videos: VideoAnalysisSummary[]
  selectedIds: string[]
  onClose: () => void
}) {
  const selectedVideos = selectedIds
    .map(id => videos.find(v => v.id === id))
    .filter(Boolean) as VideoAnalysisSummary[]

  if (selectedVideos.length < 2) return null

  const [video1, video2] = selectedVideos

  const scoreDiff = (video2.overallScore ?? 0) - (video1.overallScore ?? 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-slate-900 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Video Comparison</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Videos Side by Side */}
          <div className="grid grid-cols-2 gap-4">
            {selectedVideos.map((video, index) => (
              <div key={video.id} className="space-y-2">
                <div className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden">
                  {video.thumbnailUrl ? (
                    <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="w-12 h-12 text-slate-600" />
                    </div>
                  )}
                  <Badge className="absolute top-2 left-2 bg-black/70">
                    {index === 0 ? 'Before' : 'After'}
                  </Badge>
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-medium text-white truncate">{video.title}</h4>
                  <p className="text-xs text-slate-400">{formatDate(video.analyzedAt || video.uploadedAt)}</p>
                  <div className={cn(
                    "text-2xl font-bold mt-2",
                    (video.overallScore ?? 0) >= 70 ? "text-emerald-400" : 
                    (video.overallScore ?? 0) >= 50 ? "text-cyan-400" : "text-amber-400"
                  )}>
                    {video.overallScore ?? 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Improvement Summary */}
          <div className="rounded-xl bg-slate-800/50 p-4 text-center">
            <h4 className="text-sm text-slate-400 mb-2">Score Change</h4>
            <div className={cn(
              "text-4xl font-bold",
              scoreDiff > 0 ? "text-emerald-400" : scoreDiff < 0 ? "text-red-400" : "text-slate-400"
            )}>
              {scoreDiff > 0 ? '+' : ''}{scoreDiff} points
            </div>
            {scoreDiff > 0 && (
              <p className="text-sm text-emerald-400 mt-2 flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Great improvement!
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function VideoHistoryComparison({
  videos,
  onSelectVideo,
  onCompareVideos
}: VideoHistoryComparisonProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [techniqueFilter, setTechniqueFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  // Filter videos
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTechnique = techniqueFilter === 'all' || 
      video.techniqueType?.toLowerCase() === techniqueFilter
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'analyzed' && video.analysisStatus === 'COMPLETED') ||
      (activeTab === 'pending' && video.analysisStatus !== 'COMPLETED')
    return matchesSearch && matchesTechnique && matchesTab
  })

  // Sort by date, newest first
  const sortedVideos = [...filteredVideos].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  )

  // Get previous scores for trend
  const getPreviousScore = (index: number): number | undefined => {
    const completedVideos = sortedVideos.filter(v => v.analysisStatus === 'COMPLETED')
    const currentVideo = sortedVideos[index]
    if (!currentVideo || currentVideo.analysisStatus !== 'COMPLETED') return undefined
    
    const currentIdx = completedVideos.findIndex(v => v.id === currentVideo.id)
    if (currentIdx < completedVideos.length - 1) {
      return completedVideos[currentIdx + 1]?.overallScore ?? undefined
    }
    return undefined
  }

  const toggleCompareSelection = (videoId: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(videoId)) {
        return prev.filter(id => id !== videoId)
      }
      if (prev.length < 2) {
        return [...prev, videoId]
      }
      return [prev[1], videoId] // Replace oldest selection
    })
  }

  const startComparison = () => {
    if (selectedForCompare.length === 2) {
      setShowComparison(true)
      onCompareVideos?.(selectedForCompare)
    }
  }

  const completedCount = videos.filter(v => v.analysisStatus === 'COMPLETED').length
  const pendingCount = videos.filter(v => v.analysisStatus !== 'COMPLETED').length

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Video className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{videos.length}</div>
              <div className="text-xs text-slate-400">Total Videos</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl bg-slate-800/50 border border-slate-700 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">{completedCount}</div>
              <div className="text-xs text-slate-400">Analyzed</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-slate-800/50 border border-slate-700 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">{pendingCount}</div>
              <div className="text-xs text-slate-400">Pending</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl bg-slate-800/50 border border-slate-700 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {completedCount > 0 
                  ? Math.round(videos.filter(v => v.overallScore).reduce((sum, v) => sum + (v.overallScore ?? 0), 0) / completedCount)
                  : 0}
              </div>
              <div className="text-xs text-slate-400">Avg Score</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Chart */}
      {completedCount >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-slate-700 bg-slate-800/50 p-4"
        >
          <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Progress Over Time
          </h3>
          <ProgressChart videos={videos} />
        </motion.div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <Select value={techniqueFilter} onValueChange={setTechniqueFilter}>
          <SelectTrigger className="w-full md:w-48 bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Filter by technique" />
          </SelectTrigger>
          <SelectContent>
            {TECHNIQUE_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className="border-slate-700"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
            className="border-slate-700"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={compareMode ? 'default' : 'outline'}
            onClick={() => {
              setCompareMode(!compareMode)
              if (compareMode) setSelectedForCompare([])
            }}
            className={cn(
              "border-slate-700",
              compareMode && "bg-cyan-500 hover:bg-cyan-600"
            )}
          >
            <Layers className="w-4 h-4 mr-2" />
            Compare
          </Button>
        </div>
      </div>

      {/* Compare Bar */}
      <AnimatePresence>
        {compareMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl bg-cyan-500/10 border border-cyan-500/30 p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-white">
                {selectedForCompare.length === 0 
                  ? 'Select 2 videos to compare' 
                  : `${selectedForCompare.length}/2 videos selected`}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedForCompare([])}
                className="border-slate-600"
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={startComparison}
                disabled={selectedForCompare.length !== 2}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                Compare Now
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="all">All ({videos.length})</TabsTrigger>
          <TabsTrigger value="analyzed">Analyzed ({completedCount})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Video Grid */}
      {sortedVideos.length === 0 ? (
        <div className="text-center py-12">
          <Video className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No videos found</h3>
          <p className="text-sm text-slate-400">
            {searchQuery ? 'Try a different search term' : 'Upload your first video to get started'}
          </p>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-3"
        )}>
          {sortedVideos.map((video, index) => (
            <VideoCard
              key={video.id}
              video={video}
              previousScore={getPreviousScore(index)}
              isSelected={selectedForCompare.includes(video.id)}
              onSelect={() => toggleCompareSelection(video.id)}
              onView={() => onSelectVideo(video.id)}
              compareMode={compareMode}
            />
          ))}
        </div>
      )}

      {/* Comparison Modal */}
      <AnimatePresence>
        {showComparison && (
          <VideoComparison
            videos={videos}
            selectedIds={selectedForCompare}
            onClose={() => {
              setShowComparison(false)
              setSelectedForCompare([])
              setCompareMode(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
