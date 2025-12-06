
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, Clock, Target, Users, Play, CheckCircle2, 
  Filter, Zap, Award, TrendingUp, Info, X, Plus,
  Dumbbell, Brain, Lightbulb, AlertCircle, ArrowLeft, Home
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  drillsDatabase,
  type Drill,
  type DrillCategory,
  type DrillDifficulty,
  type DrillContext,
  getDrillById,
  searchDrills,
  getPopularDrills
} from "@/lib/drills-data"
import VideoPlayer from "@/components/train/video-player"

export default function DrillsLibrary() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<DrillCategory | "all">("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<DrillDifficulty | "all">("all")
  const [selectedContext, setSelectedContext] = useState<DrillContext | "all">("all")
  const [expandedDrill, setExpandedDrill] = useState<string | null>(null)
  const [completedDrills, setCompletedDrills] = useState<Set<string>>(new Set())
  const [customSession, setCustomSession] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Filter drills based on all criteria
  const filteredDrills = useMemo(() => {
    let drills = searchQuery ? searchDrills(searchQuery) : drillsDatabase

    if (selectedCategory !== "all") {
      drills = drills.filter(d => d.category === selectedCategory)
    }
    if (selectedDifficulty !== "all") {
      drills = drills.filter(d => d.difficulty === selectedDifficulty)
    }
    if (selectedContext !== "all") {
      drills = drills.filter(d => d.context.includes(selectedContext))
    }
    if (selectedDuration) {
      drills = drills.filter(d => d.duration <= selectedDuration)
    }

    return drills
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedContext, selectedDuration])

  const popularDrills = useMemo(() => getPopularDrills(5), [])
  const customSessionDuration = useMemo(() => 
    customSession.reduce((total, id) => {
      const drill = getDrillById(id)
      return total + (drill?.duration || 0)
    }, 0),
    [customSession]
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400"
      case "intermediate": return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
      case "advanced": return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400"
      case "pro": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400"
      default: return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      serving: Target,
      dinking: Zap,
      "third-shot": TrendingUp,
      volley: Dumbbell,
      footwork: TrendingUp,
      strategy: Brain,
      mental: Lightbulb,
      warmup: Zap,
      overhead: Award
    }
    return icons[category] || Target
  }

  const toggleDrillCompletion = (id: string) => {
    setCompletedDrills(prev => {
      const updated = new Set(prev)
      if (updated.has(id)) {
        updated.delete(id)
      } else {
        updated.add(id)
      }
      return updated
    })
  }

  const toggleDrillInSession = (id: string) => {
    setCustomSession(prev =>
      prev.includes(id) ? prev.filter(drillId => drillId !== id) : [...prev, id]
    )
  }

  const clearFilters = () => {
    setSelectedCategory("all")
    setSelectedDifficulty("all")
    setSelectedContext("all")
    setSelectedDuration(null)
    setSearchQuery("")
  }

  const activeFilterCount = [
    selectedCategory !== "all",
    selectedDifficulty !== "all",
    selectedContext !== "all",
    selectedDuration !== null,
    searchQuery !== ""
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-teal-950">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Navigation Bar */}
        <div className="mb-6 flex items-center gap-4">
          <Link href="/train">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Training
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Header - Enhanced with visual interest and reduced spacing */}
        <div className="relative mb-6 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50/80 via-emerald-50/60 to-cyan-50/80 dark:from-teal-950/30 dark:via-emerald-950/20 dark:to-cyan-950/30 rounded-3xl"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-teal-200/20 to-emerald-200/20 dark:from-teal-800/10 dark:to-emerald-800/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-gradient-to-tr from-cyan-200/20 to-teal-200/20 dark:from-cyan-800/10 dark:to-teal-800/10 rounded-full blur-2xl"></div>
          
          <div className="relative p-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 hover:scale-105">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent dark:from-teal-400 dark:via-emerald-400 dark:to-cyan-400">
                  Practice Drill Library
                </h1>
                <p className="text-lg text-slate-700 dark:text-gray-300 mt-1">
                  <span className="font-semibold text-teal-600 dark:text-teal-400">{drillsDatabase.length}</span> actionable drills ready for on-court practice
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Buttons - Enhanced with modern pill styling */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full"></span>
            Quick Access
          </h3>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearFilters()
                setSelectedContext("pre-match")
              }}
              className="bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 shadow-md shadow-slate-200/50 dark:shadow-gray-900/20 hover:shadow-lg hover:shadow-teal-500/20 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 dark:hover:from-teal-950/50 dark:hover:to-emerald-950/50 border-slate-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 rounded-full px-4 py-2"
            >
              <Zap className="w-4 h-4 mr-2 text-amber-500" />
              Pre-Match Warmup
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearFilters()
                setSelectedContext("solo")
              }}
              className="bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 shadow-md shadow-slate-200/50 dark:shadow-gray-900/20 hover:shadow-lg hover:shadow-blue-500/20 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950/50 dark:hover:to-cyan-950/50 border-slate-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 rounded-full px-4 py-2"
            >
              <Users className="w-4 h-4 mr-2 text-blue-500" />
              Solo Drills
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearFilters()
                setSelectedDuration(10)
              }}
              className="bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 shadow-md shadow-slate-200/50 dark:shadow-gray-900/20 hover:shadow-lg hover:shadow-green-500/20 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950/50 dark:hover:to-emerald-950/50 border-slate-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 rounded-full px-4 py-2"
            >
              <Clock className="w-4 h-4 mr-2 text-green-500" />
              10 Minutes or Less
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearFilters()
                setSearchQuery("serve")
              }}
              className="bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 shadow-md shadow-slate-200/50 dark:shadow-gray-900/20 hover:shadow-lg hover:shadow-purple-500/20 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950/50 dark:hover:to-pink-950/50 border-slate-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 rounded-full px-4 py-2"
            >
              <Target className="w-4 h-4 mr-2 text-purple-500" />
              Serving Focus
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearFilters()
                setSearchQuery("dink")
              }}
              className="bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 shadow-md shadow-slate-200/50 dark:shadow-gray-900/20 hover:shadow-lg hover:shadow-orange-500/20 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 dark:hover:from-orange-950/50 dark:hover:to-red-950/50 border-slate-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 rounded-full px-4 py-2"
            >
              <Dumbbell className="w-4 h-4 mr-2 text-orange-500" />
              Dinking Practice
            </Button>
          </div>
        </div>

        {/* Search and Smart Filters - Enhanced styling */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4 transition-colors group-focus-within:text-teal-500" />
              <Input
                placeholder='Search by skill, technique, or focus area...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-slate-200/60 dark:border-gray-700/60 hover:border-teal-300/60 dark:hover:border-teal-600/60 focus:border-teal-400/80 dark:focus:border-teal-500/80 transition-all duration-300 hover:shadow-md hover:bg-white dark:hover:bg-gray-800 rounded-xl"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-white dark:hover:bg-gray-800 rounded-xl border-slate-200/60 dark:border-gray-700/60 hover:border-teal-300/60 dark:hover:border-teal-600/60",
                showFilters && "bg-teal-50 dark:bg-teal-950/30 border-teal-300 dark:border-teal-600"
              )}
            >
              <Filter className="w-4 h-4 mr-2 transition-colors" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-sm animate-pulse">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 hover:scale-105 rounded-xl"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <Card className="p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-slate-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2 block">
                    Duration
                  </label>
                  <div className="space-y-2">
                    {[5, 10, 15, 20, 30].map(mins => (
                      <Button
                        key={mins}
                        variant={selectedDuration === mins ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDuration(selectedDuration === mins ? null : mins)}
                        className="w-full justify-start"
                      >
                        ≤ {mins} min
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2 block">
                    Skill Level
                  </label>
                  <div className="space-y-2">
                    {["all", "beginner", "intermediate", "advanced", "pro"].map(diff => (
                      <Button
                        key={diff}
                        variant={selectedDifficulty === diff ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDifficulty(diff as any)}
                        className="w-full justify-start capitalize"
                      >
                        {diff}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2 block">
                    Category
                  </label>
                  <div className="space-y-2">
                    {["all", "serving", "dinking", "third-shot", "volley", "footwork", "warmup", "strategy"].map(cat => (
                      <Button
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(cat as any)}
                        className="w-full justify-start capitalize"
                      >
                        {cat.replace("-", " ")}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2 block">
                    Context
                  </label>
                  <div className="space-y-2">
                    {["all", "solo", "with-partner", "pre-match", "tournament-prep", "skill-specific"].map(ctx => (
                      <Button
                        key={ctx}
                        variant={selectedContext === ctx ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedContext(ctx as any)}
                        className="w-full justify-start capitalize"
                      >
                        {ctx.replace("-", " ")}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Custom Session Builder */}
        {customSession.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Custom Practice Session</span>
                <Badge className="bg-purple-600 text-white">
                  {customSessionDuration} min total
                </Badge>
              </CardTitle>
              <CardDescription>
                {customSession.length} drills selected - Ready to practice!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {customSession.map(id => {
                  const drill = getDrillById(id)
                  if (!drill) return null
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="py-2 px-3 flex items-center gap-2"
                    >
                      {drill.name} ({drill.duration}m)
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => toggleDrillInSession(id)}
                      />
                    </Badge>
                  )
                })}
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Session
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCustomSession([])}
                >
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-600 dark:text-gray-400">
            Showing <span className="font-semibold text-slate-900 dark:text-white">{filteredDrills.length}</span> drills
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>{completedDrills.size} completed today</span>
          </div>
        </div>

        {/* Drills Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDrills.map(drill => {
            const Icon = getCategoryIcon(drill.category)
            const isCompleted = completedDrills.has(drill.id)
            const isExpanded = expandedDrill === drill.id
            const isInSession = customSession.includes(drill.id)

            return (
              <Card 
                key={drill.id}
                className={cn(
                  // Base card styling with floating effect
                  "relative group cursor-pointer bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm",
                  "border border-slate-200/60 dark:border-gray-700/60 rounded-2xl overflow-hidden",
                  
                  // Shadow and elevation effects
                  "shadow-lg shadow-slate-200/40 dark:shadow-gray-900/30",
                  "hover:shadow-2xl hover:shadow-slate-300/60 dark:hover:shadow-gray-900/50",
                  
                  // Transform and transition effects
                  "transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-1",
                  
                  // Glow effects on hover
                  "hover:bg-white dark:hover:bg-gray-800",
                  "hover:border-teal-200/80 dark:hover:border-teal-600/60",
                  
                  // Conditional states
                  isCompleted && "bg-gradient-to-br from-green-50/90 to-emerald-50/90 dark:from-green-950/40 dark:to-emerald-950/40 border-green-200/80 dark:border-green-800/60 hover:shadow-green-200/50",
                  isInSession && "ring-2 ring-purple-400/60 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 shadow-purple-200/30 dark:shadow-purple-900/20"
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      {isCompleted && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      {drill.videoDemos && drill.videoDemos.length > 0 && (
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 text-xs px-1.5 py-0.5">
                          <Play className="h-2.5 w-2.5 mr-1" />
                          {drill.videoDemos.length} video{drill.videoDemos.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    <Badge className={cn("text-xs capitalize", getDifficultyColor(drill.difficulty))}>
                      {drill.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">{drill.name}</CardTitle>
                  <p className="text-sm font-medium text-teal-600 dark:text-teal-400 italic">
                    {drill.tagline}
                  </p>
                  <CardDescription className="line-clamp-2">
                    {drill.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Quick Info */}
                    <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {drill.duration} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {drill.playerCount}
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {drill.category.replace("-", " ")}
                      </Badge>
                    </div>

                    {/* Focus Areas */}
                    {!isExpanded && (
                      <div className="flex flex-wrap gap-1">
                        {drill.focusAreas.slice(0, 2).map((focus, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {focus}
                          </Badge>
                        ))}
                        {drill.focusAreas.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{drill.focusAreas.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="space-y-4 border-t pt-4">
                        {/* Setup */}
                        <div>
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Info className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                            Setup
                          </h4>
                          <ul className="space-y-1 text-sm text-slate-600 dark:text-gray-400">
                            {drill.setup.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-teal-600 dark:text-teal-400">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Steps */}
                        <div>
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Play className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                            Steps
                          </h4>
                          <ol className="space-y-1.5 text-sm text-slate-600 dark:text-gray-400">
                            {drill.steps.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-teal-600 dark:text-teal-400 font-semibold min-w-[20px]">
                                  {idx + 1}.
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Tips */}
                        {drill.tips && drill.tips.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-amber-600" />
                              Pro Tips
                            </h4>
                            <ul className="space-y-1 text-sm text-slate-600 dark:text-gray-400">
                              {drill.tips.map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-amber-600">💡</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Common Mistakes */}
                        {drill.commonMistakes && drill.commonMistakes.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                              Common Mistakes to Avoid
                            </h4>
                            <ul className="space-y-1 text-sm text-slate-600 dark:text-gray-400">
                              {drill.commonMistakes.map((mistake, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-red-600">✗</span>
                                  {mistake}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Success Metric */}
                        <div className="bg-teal-50 dark:bg-teal-950/30 p-3 rounded-lg">
                          <h4 className="font-semibold text-sm mb-1 flex items-center gap-2 text-teal-900 dark:text-teal-100">
                            <Award className="h-4 w-4" />
                            Success Metric
                          </h4>
                          <p className="text-sm text-teal-700 dark:text-teal-300">
                            {drill.successMetric}
                          </p>
                        </div>

                        {/* Video Demonstrations */}
                        {drill.videoDemos && drill.videoDemos.length > 0 && (
                          <VideoPlayer videos={drill.videoDemos} drillName={drill.name} />
                        )}
                      </div>
                    )}

                    {/* Action Buttons - Enhanced with hover effects */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 hover:bg-slate-50 dark:hover:bg-gray-700 hover:border-slate-300 dark:hover:border-gray-600 transition-all duration-200 hover:scale-105 hover:shadow-md"
                        onClick={() => setExpandedDrill(isExpanded ? null : drill.id)}
                      >
                        {isExpanded ? "Hide" : "View"} Details
                      </Button>
                      <Button
                        size="sm"
                        className={cn(
                          "flex-1 transition-all duration-300 hover:scale-105 hover:shadow-lg",
                          isCompleted
                            ? "bg-green-600 hover:bg-green-700 text-white hover:shadow-green-500/30"
                            : "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white hover:shadow-teal-500/30"
                        )}
                        onClick={() => toggleDrillCompletion(drill.id)}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                            Done
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                            Start
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant={isInSession ? "secondary" : "outline"}
                        className={cn(
                          "transition-all duration-300 hover:scale-110 hover:shadow-md",
                          isInSession 
                            ? "hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:shadow-purple-500/20" 
                            : "hover:bg-slate-50 dark:hover:bg-gray-700 hover:border-slate-300 dark:hover:border-gray-600"
                        )}
                        onClick={() => toggleDrillInSession(drill.id)}
                        title={isInSession ? "Remove from session" : "Add to session"}
                      >
                        <Plus className={cn("h-4 w-4 transition-all duration-300", isInSession && "rotate-45")} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredDrills.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No drills found</h3>
            <p className="text-slate-600 dark:text-gray-400 mb-4">
              Try adjusting your search or filters to find the perfect drill
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-8 bg-slate-50 dark:bg-gray-800/50 border-slate-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-slate-600 dark:text-gray-400 text-sm">
              <Info className="h-4 w-4" />
              <span>Click "View Details" for full instructions • Mark drills complete to track progress • Build custom sessions with the + button</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
