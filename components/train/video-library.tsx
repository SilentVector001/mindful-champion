
"use client"

/**
 * Video Analysis Library - Enhanced with Coach Kai Branding
 * Professional video analysis library with advanced UI/UX
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Video, Search, Filter, Calendar, Trophy, Target, Activity, 
  Trash2, Eye, Download, Share2, TrendingUp, Clock, Star, AlertCircle,
  ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Brain, Sparkles,
  PlayCircle, BarChart3, Zap, Award, Crown, Home, Library, 
  ChevronDown, RotateCcw, Gauge, Grid3X3, Film, FileText, 
  User, Timer, CheckCircle2, Upload, Loader2, ExternalLink, X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { format } from "date-fns"
import Image from "next/image"

interface VideoAnalysisItem {
  id: string;
  fileName: string;
  videoUrl: string;
  title: string;
  overallScore: number | null;
  technicalScores: any;
  movementMetrics: any;
  strengths: any;
  areasForImprovement: any;
  uploadedAt: string;
  analysisStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  analyzedAt: string | null;
}

export default function VideoLibrary() {
  const [analyses, setAnalyses] = useState<VideoAnalysisItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date')
  const [selectedAnalysis, setSelectedAnalysis] = useState<VideoAnalysisItem | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const analysesPerPage = 12

  useEffect(() => {
    loadAnalyses()
  }, [])

  // Separate effect for auto-refresh that checks current analyses
  useEffect(() => {
    const hasPendingAnalyses = analyses.some(
      a => a.analysisStatus === 'PENDING' || a.analysisStatus === 'PROCESSING'
    )
    
    if (!hasPendingAnalyses) {
      return
    }

    // Auto-refresh every 10 seconds if there are pending/processing videos
    const intervalId = setInterval(() => {
      loadAnalyses()
    }, 10000)
    
    return () => clearInterval(intervalId)
  }, [analyses])

  const loadAnalyses = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/video-analysis/library')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to load analyses: ${response.status}`)
      }
      
      const data = await response.json()
      setAnalyses(data.analyses || [])
    } catch (error: any) {
      console.error('Failed to load analyses:', error)
      setError(error.message || 'Failed to load video analyses. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const deleteAnalysis = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis? This action cannot be undone.')) return

    try {
      await fetch(`/api/video-analysis/library?id=${id}`, { method: 'DELETE' })
      setAnalyses(prev => prev.filter(a => a.id !== id))
      
      // Success feedback
      const successElement = document.createElement('div')
      successElement.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg'
      successElement.textContent = '✅ Analysis deleted successfully'
      document.body.appendChild(successElement)
      setTimeout(() => document.body.removeChild(successElement), 3000)
    } catch (error) {
      console.error('Failed to delete:', error)
      
      // Error feedback
      const errorElement = document.createElement('div')
      errorElement.className = 'fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg'
      errorElement.textContent = '❌ Failed to delete analysis'
      document.body.appendChild(errorElement)
      setTimeout(() => document.body.removeChild(errorElement), 3000)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30'
    if (score >= 70) return 'text-cyan-400 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30'
    if (score >= 60) return 'text-amber-400 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30'
    return 'text-red-400 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30'
  }

  const getScoreGradient = (score: number) => {
    if (score >= 85) return 'from-emerald-500 to-green-500'
    if (score >= 70) return 'from-cyan-500 to-blue-500'
    if (score >= 60) return 'from-amber-500 to-yellow-500'
    return 'from-red-500 to-pink-500'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { 
          color: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 border border-emerald-500/30', 
          label: '✅ Analyzed',
          icon: CheckCircle2
        }
      case 'PROCESSING':
        return { 
          color: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30', 
          label: '🔄 Analyzing...',
          icon: Loader2
        }
      case 'PENDING':
        return { 
          color: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border border-amber-500/30', 
          label: '⏳ Pending',
          icon: Clock
        }
      case 'FAILED':
        return { 
          color: 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 border border-red-500/30', 
          label: '❌ Failed',
          icon: AlertCircle
        }
      default:
        return { 
          color: 'bg-gradient-to-r from-slate-500/20 to-gray-500/20 text-slate-400 border border-slate-500/30', 
          label: status,
          icon: AlertCircle
        }
    }
  }

  const filteredAnalyses = analyses
    .filter(a => 
      a.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(a.strengths) && a.strengths.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (Array.isArray(a.areasForImprovement) && a.areasForImprovement.some((w: string) => w.toLowerCase().includes(searchQuery.toLowerCase())))
    )
    .sort((a, b) => {
      if (sortBy === 'score') {
        return (b.overallScore || 0) - (a.overallScore || 0)
      }
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    })

  const paginatedAnalyses = filteredAnalyses.slice(
    currentPage * analysesPerPage,
    (currentPage + 1) * analysesPerPage
  )

  const totalPages = Math.ceil(filteredAnalyses.length / analysesPerPage)

  const getCurrentAnalysisIndex = (analysisId: string) => {
    return filteredAnalyses.findIndex(a => a.id === analysisId)
  }

  const getAdjacentAnalysis = (analysisId: string, direction: 'prev' | 'next') => {
    const currentIndex = getCurrentAnalysisIndex(analysisId)
    if (currentIndex === -1) return null
    
    const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1
    return filteredAnalyses[targetIndex] || null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      {/* Top Navigation Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 backdrop-blur-lg bg-slate-900/80 border-b border-slate-700/50"
      >
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Breadcrumbs & Coach Kai Avatar */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                    <Home className="w-4 h-4" />
                  </Link>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                  <Link href="/train" className="text-slate-400 hover:text-white transition-colors">
                    Train
                  </Link>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                  <span className="text-cyan-400 font-medium flex items-center gap-1">
                    <Library className="w-4 h-4" />
                    Analysis Library
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadAnalyses()}
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button asChild className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/train/video">
                  <Upload className="w-4 h-4 mr-2" />
                  New Analysis
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto max-w-7xl px-4 py-8 relative z-10">
        {/* Enhanced Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              Coach Kai Analysis Library
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Your Game{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 relative">
                Evolution
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-lg blur-lg"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Review your progress, track improvements, and discover insights from every analyzed game.
            </p>
          </div>

          {/* Enhanced Search & Filter Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-xl blur-xl"></div>
            <Card className="relative bg-slate-800/50 backdrop-blur border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Search Bar */}
                  <div className="flex-1 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                      <Input
                        placeholder="🔍 Search by filename, strengths, or areas to improve..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 pr-4 py-3 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Sort Controls */}
                  <div className="flex gap-3">
                    <Button
                      variant={sortBy === 'date' ? 'default' : 'outline'}
                      onClick={() => setSortBy('date')}
                      className={cn(
                        "min-w-[120px] transition-all duration-300",
                        sortBy === 'date' 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 shadow-lg'
                          : 'border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-cyan-500/50'
                      )}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Date
                    </Button>
                    <Button
                      variant={sortBy === 'score' ? 'default' : 'outline'}
                      onClick={() => setSortBy('score')}
                      className={cn(
                        "min-w-[120px] transition-all duration-300",
                        sortBy === 'score' 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 shadow-lg'
                          : 'border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-cyan-500/50'
                      )}
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Score
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-cyan-500/50 transition-all duration-300"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                      <ChevronDown className={cn("w-3 h-3 ml-1 transition-transform", showFilters && "rotate-180")} />
                    </Button>
                  </div>
                </div>

                {/* Filter Results Info */}
                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-slate-700/50"
                  >
                    <p className="text-sm text-slate-400">
                      {filteredAnalyses.length === 0 
                        ? `No analyses found for "${searchQuery}"`
                        : `Found ${filteredAnalyses.length} ${filteredAnalyses.length === 1 ? 'analysis' : 'analyses'} for "${searchQuery}"`
                      }
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Enhanced Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-6"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                <Brain className="absolute w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Loading Your Analysis Library</h3>
              <p className="text-slate-400">Coach Kai is gathering your video analyses...</p>
            </div>
          </motion.div>
        )}

        {/* Enhanced Error State */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 rounded-xl blur-xl"></div>
              <Card className="relative bg-slate-800/50 backdrop-blur border-red-500/30 shadow-2xl">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 flex items-center justify-center mb-6"
                  >
                    <AlertCircle className="w-10 h-10 text-red-400" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-3 text-white">
                    Unable to Load Analyses
                  </h3>
                  <p className="text-slate-400 mb-6 max-w-md leading-relaxed">
                    {error}
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => loadAnalyses()} 
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                    <Button 
                      variant="outline" 
                      asChild
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <Link href="/train/video">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload New Video
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Enhanced Empty State */}
        {!loading && !error && filteredAnalyses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-xl blur-xl"></div>
              <Card className="relative bg-slate-800/50 backdrop-blur border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 shadow-2xl">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-8 relative overflow-hidden"
                  >
                    {searchQuery ? (
                      <Search className="w-16 h-16 text-cyan-400" />
                    ) : (
                      <Video className="w-16 h-16 text-cyan-400" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 -translate-x-full animate-pulse"></div>
                  </motion.div>
                  
                  <div className="mb-8">
                    <h3 className="text-3xl font-bold text-white mb-4">
                      {searchQuery ? `No Results for "${searchQuery}"` : '🎬 Start Your Analysis Journey'}
                    </h3>
                    <p className="text-slate-400 max-w-lg leading-relaxed text-lg">
                      {searchQuery 
                        ? 'Try adjusting your search terms or browse all analyses to find what you\'re looking for.'
                        : 'Upload your first game footage and let Coach Kai analyze your technique, strategy, and movement patterns!'}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    {searchQuery ? (
                      <>
                        <Button 
                          onClick={() => setSearchQuery('')}
                          className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Clear Search
                        </Button>
                        <Button asChild className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                          <Link href="/train/video">
                            <Video className="w-4 h-4 mr-2" />
                            Analyze New Video
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <Button asChild className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-4">
                        <Link href="/train/video">
                          <Brain className="w-5 h-5 mr-3" />
                          Start Your First Analysis
                          <ArrowRight className="w-5 h-5 ml-3" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Enhanced Analysis Grid with Navigation */}
        {!loading && !error && filteredAnalyses.length > 0 && (
          <>
            {/* Pagination Navigation */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center items-center gap-4 mb-8"
              >
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-cyan-500/50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i}
                      size="sm"
                      variant={currentPage === i ? "default" : "ghost"}
                      onClick={() => setCurrentPage(i)}
                      className={cn(
                        "w-8 h-8",
                        currentPage === i
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      )}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-cyan-500/50 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {paginatedAnalyses.map((analysis, index) => {
                const statusBadge = getStatusBadge(analysis.analysisStatus)
                const StatusIcon = statusBadge.icon
                const prevAnalysis = getAdjacentAnalysis(analysis.id, 'prev')
                const nextAnalysis = getAdjacentAnalysis(analysis.id, 'next')

                return (
                  <motion.div
                    key={analysis.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="relative group"
                  >
                    {/* Background Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-xl blur-xl group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-500"></div>
                    
                    <Card className="relative bg-slate-800/50 backdrop-blur border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden shadow-2xl hover:shadow-cyan-500/20">
                      {/* Video Thumbnail */}
                      <div className="aspect-video relative rounded-t-lg overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
                        <video
                          src={analysis.videoUrl}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          muted
                          preload="metadata"
                        />
                        
                        {/* Overlay Gradients */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/20 via-transparent to-slate-900/20"></div>

                        {/* Play Button Overlay */}
                        <AnimatePresence>
                          {analysis.analysisStatus === 'COMPLETED' && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 0, scale: 1 }}
                              whileHover={{ opacity: 1, scale: 1.1 }}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <Link href={`/train/analysis/${analysis.id}`}>
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500/90 to-blue-500/90 backdrop-blur flex items-center justify-center shadow-2xl"
                                >
                                  <PlayCircle className="w-10 h-10 text-white" />
                                </motion.div>
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <Badge className={cn("backdrop-blur border-0 shadow-lg text-sm font-medium", statusBadge.color)}>
                            <StatusIcon className={cn(
                              "w-3 h-3 mr-1",
                              analysis.analysisStatus === 'PROCESSING' && "animate-spin",
                              analysis.analysisStatus === 'PENDING' && "animate-pulse"
                            )} />
                            {statusBadge.label}
                          </Badge>
                        </div>

                        {/* Score Badge */}
                        {analysis.analysisStatus === 'COMPLETED' && analysis.overallScore && (
                          <div className="absolute top-3 left-3">
                            <div className={cn("px-4 py-2 rounded-full backdrop-blur text-sm font-bold shadow-lg", getScoreColor(analysis.overallScore))}>
                              🎯 {Math.round(analysis.overallScore)}/100
                            </div>
                          </div>
                        )}

                        {/* Coach Kai Icon */}
                        <div className="absolute bottom-3 left-3">
                          <div className="w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur flex items-center justify-center">
                            <Brain className="w-4 h-4 text-cyan-400" />
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Title & Date */}
                          <div>
                            <h3 className="font-bold text-white mb-2 truncate group-hover:text-cyan-400 transition-colors text-lg">
                              {analysis.title || analysis.fileName}
                            </h3>
                            <p className="text-sm text-slate-400 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {format(new Date(analysis.uploadedAt), 'MMM d, yyyy • h:mm a')}
                              {analysis.analyzedAt && (
                                <>
                                  <span>•</span>
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  Analyzed
                                </>
                              )}
                            </p>
                          </div>

                          {/* Enhanced Score Metrics */}
                          {analysis.analysisStatus === 'COMPLETED' && (
                            <div className="grid grid-cols-2 gap-3">
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="bg-slate-900/50 rounded-lg p-3 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <Gauge className="w-4 h-4 text-cyan-400" />
                                  <span className="text-xs text-slate-400 font-medium">Technical</span>
                                </div>
                                <div className="text-lg font-bold text-white">
                                  {analysis.technicalScores && typeof analysis.technicalScores === 'object' && 'overall' in analysis.technicalScores
                                    ? Math.round((analysis.technicalScores as any).overall)
                                    : '0'}%
                                </div>
                              </motion.div>
                              
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="bg-slate-900/50 rounded-lg p-3 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <Activity className="w-4 h-4 text-blue-400" />
                                  <span className="text-xs text-slate-400 font-medium">Movement</span>
                                </div>
                                <div className="text-lg font-bold text-white">
                                  {analysis.movementMetrics && typeof analysis.movementMetrics === 'object' && 'efficiency' in analysis.movementMetrics
                                    ? Math.round((analysis.movementMetrics as any).efficiency)
                                    : '0'}%
                                </div>
                              </motion.div>
                            </div>
                          )}

                          {/* Key Strength Preview */}
                          {Array.isArray(analysis.strengths) && analysis.strengths.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="bg-green-500/10 border border-green-500/20 rounded-lg p-3"
                            >
                              <div className="flex items-start gap-2">
                                <Star className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs text-green-400 font-medium mb-1">Key Strength</p>
                                  <p className="text-sm text-slate-300 line-clamp-2">
                                    {analysis.strengths[0]}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {/* Enhanced Action Buttons with Navigation */}
                          <div className="space-y-3 pt-2 border-t border-slate-700/50">
                            {/* Primary Actions */}
                            <div className="flex gap-2">
                              {analysis.analysisStatus === 'COMPLETED' ? (
                                <Button 
                                  className="flex-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 text-cyan-400 hover:from-cyan-500/30 hover:to-blue-500/30 hover:text-white transition-all duration-300"
                                  asChild
                                >
                                  <Link href={`/train/analysis/${analysis.id}`}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Analysis
                                  </Link>
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  className="flex-1 border-slate-600 cursor-not-allowed"
                                  disabled
                                >
                                  <StatusIcon className={cn(
                                    "w-4 h-4 mr-2",
                                    analysis.analysisStatus === 'PROCESSING' && "animate-spin",
                                    analysis.analysisStatus === 'PENDING' && "animate-pulse"
                                  )} />
                                  {analysis.analysisStatus === 'PROCESSING' ? 'Analyzing...' :
                                   analysis.analysisStatus === 'PENDING' ? 'Queued' : 'Failed'}
                                </Button>
                              )}

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteAnalysis(analysis.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/30 hover:border-red-500/50 transition-all duration-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Navigation Controls */}
                            {analysis.analysisStatus === 'COMPLETED' && (prevAnalysis || nextAnalysis) && (
                              <div className="flex justify-between items-center gap-2">
                                {prevAnalysis ? (
                                  <Button 
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300"
                                  >
                                    <Link href={`/train/analysis/${prevAnalysis.id}`}>
                                      <ArrowLeft className="w-4 h-4 mr-1" />
                                      Previous
                                    </Link>
                                  </Button>
                                ) : <div></div>}

                                {nextAnalysis && (
                                  <Button 
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300"
                                  >
                                    <Link href={`/train/analysis/${nextAnalysis.id}`}>
                                      Next
                                      <ArrowRight className="w-4 h-4 ml-1" />
                                    </Link>
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Bottom Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center items-center gap-4 mt-8"
              >
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-cyan-500/50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <span className="text-slate-400 text-sm">
                  Page {currentPage + 1} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-cyan-500/50 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </>
        )}

        {/* Enhanced Statistics Dashboard */}
        {!loading && !error && analyses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl blur-xl"></div>
              <Card className="relative bg-slate-800/50 backdrop-blur border-slate-700/50 hover:border-purple-500/30 transition-all duration-300 shadow-2xl">
                <CardHeader className="text-center pb-6">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
                  >
                    <BarChart3 className="w-8 h-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-3">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                    Your Analysis Journey with Coach Kai
                  </CardTitle>
                  <p className="text-slate-400 mt-2">Track your improvement and celebrate your progress</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      {
                        value: analyses.filter(a => a.analysisStatus === 'COMPLETED').length,
                        label: "Analyses Completed",
                        icon: CheckCircle2,
                        gradient: "from-cyan-500 to-blue-500",
                        bg: "from-cyan-500/20 to-blue-500/20",
                        border: "border-cyan-500/30"
                      },
                      {
                        value: (() => {
                          const completed = analyses.filter(a => a.analysisStatus === 'COMPLETED' && a.overallScore)
                          return completed.length > 0 
                            ? Math.round(completed.reduce((sum, a) => sum + (a.overallScore || 0), 0) / completed.length)
                            : 0
                        })(),
                        label: "Average Score",
                        icon: Target,
                        gradient: "from-green-500 to-emerald-500",
                        bg: "from-green-500/20 to-emerald-500/20",
                        border: "border-green-500/30",
                        suffix: "%"
                      },
                      {
                        value: Math.max(...analyses.filter(a => a.analysisStatus === 'COMPLETED').map(a => a.overallScore || 0), 0),
                        label: "Personal Best",
                        icon: Crown,
                        gradient: "from-amber-500 to-yellow-500",
                        bg: "from-amber-500/20 to-yellow-500/20",
                        border: "border-amber-500/30",
                        suffix: "%"
                      },
                      {
                        value: analyses.filter(a => a.analysisStatus === 'COMPLETED' && (a.overallScore || 0) >= 85).length,
                        label: "Excellent Games",
                        icon: Award,
                        gradient: "from-purple-500 to-pink-500",
                        bg: "from-purple-500/20 to-pink-500/20",
                        border: "border-purple-500/30"
                      }
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{ y: -4, scale: 1.05 }}
                        className={cn(
                          "relative p-6 rounded-xl bg-gradient-to-br border backdrop-blur group hover:shadow-2xl transition-all duration-300",
                          stat.bg,
                          stat.border
                        )}
                      >
                        {/* Animated Background Glow */}
                        <div className={cn(
                          "absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm",
                          stat.gradient
                        )}></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className={cn(
                              "w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300",
                              stat.gradient
                            )}>
                              <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <motion.div
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                            >
                              <Sparkles className="w-5 h-5 text-slate-400" />
                            </motion.div>
                          </div>
                          
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                            className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300"
                          >
                            {Math.round(stat.value)}{stat.suffix || ''}
                          </motion.div>
                          
                          <p className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors font-medium">
                            {stat.label}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Progress Encouragement */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="mt-8 p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl text-center"
                  >
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Brain className="w-5 h-5 text-cyan-400" />
                      <h4 className="text-lg font-semibold text-white">Coach Kai's Insight</h4>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {analyses.filter(a => a.analysisStatus === 'COMPLETED').length === 0
                        ? "Ready to start your analysis journey? Upload your first video and see what Coach Kai discovers about your game!"
                        : analyses.filter(a => a.analysisStatus === 'COMPLETED').length < 3
                        ? "Great start! Upload more videos to see patterns in your gameplay and track your improvement over time."
                        : "Excellent progress! Your consistent analysis is helping build a complete picture of your pickleball development."}
                    </p>
                  </motion.div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
