"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, Clock, Target, Users, Play, CheckCircle2, 
  Filter, Zap, Award, TrendingUp, Info, X, Plus,
  Dumbbell, Brain, Lightbulb, AlertCircle, ArrowLeft, Home,
  Heart, Star, Save, Loader2, BookOpen, Video, Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast"

type DrillCategory = 
  | "WARMUP_CONDITIONING"
  | "FOOTWORK_MOVEMENT"
  | "DINKING"
  | "SERVING_RETURN"
  | "VOLLEY"
  | "THIRD_SHOT_DROP"
  | "OVERHEAD_LOB"
  | "STRATEGY_POSITIONING"
  | "PARTNER_TEAM"
  | "SOLO_PRACTICE"
  | "COOLDOWN_RECOVERY"

type DrillDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "PRO"

interface Drill {
  id: string
  title: string
  tagline: string
  description: string
  category: DrillCategory
  difficulty: DrillDifficulty
  ageGroups: string[]
  gender: string
  skillLevelRange: string
  duration: number
  playersRequired: string
  equipment: string[]
  focusAreas: string[]
  instructions: string[]
  proTips: string[]
  commonMistakes: string[]
  successMetrics: string
  videos: Array<{
    url: string
    title: string
    description?: string
  }>
  featured: boolean
  popularityScore: number
  isFavorite?: boolean
  userProgress?: {
    completedCount: number
    lastCompletedAt: string | null
    totalTimeSpent: number
  } | null
}

const categoryLabels: Record<DrillCategory, string> = {
  WARMUP_CONDITIONING: "Warm-up & Conditioning",
  FOOTWORK_MOVEMENT: "Footwork & Movement",
  DINKING: "Dinking",
  SERVING_RETURN: "Serving & Return",
  VOLLEY: "Volley",
  THIRD_SHOT_DROP: "Third Shot Drop",
  OVERHEAD_LOB: "Overhead & Lob",
  STRATEGY_POSITIONING: "Strategy & Positioning",
  PARTNER_TEAM: "Partner/Team",
  SOLO_PRACTICE: "Solo Practice",
  COOLDOWN_RECOVERY: "Cool-down & Recovery",
}

export default function DrillsLibrary() {
  const { data: session } = useSession() || {}
  const [drills, setDrills] = useState<Drill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<DrillCategory | "all">("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<DrillDifficulty | "all">("all")
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("all")
  const [selectedGender, setSelectedGender] = useState<string>("all")
  const [selectedPlayers, setSelectedPlayers] = useState<string>("all")
  const [expandedDrill, setExpandedDrill] = useState<string | null>(null)
  const [customSession, setCustomSession] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"all" | "favorites" | "completed">("all")

  // Fetch drills from API
  useEffect(() => {
    fetchDrills()
  }, [selectedCategory, selectedDifficulty, selectedAgeGroup, selectedGender, selectedDuration, selectedPlayers, searchQuery])

  const fetchDrills = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (selectedCategory !== "all") params.append("category", selectedCategory)
      if (selectedDifficulty !== "all") params.append("difficulty", selectedDifficulty)
      if (selectedAgeGroup !== "all") params.append("ageGroup", selectedAgeGroup)
      if (selectedGender !== "all") params.append("gender", selectedGender)
      if (selectedDuration) params.append("duration", selectedDuration.toString())
      if (selectedPlayers !== "all") params.append("playersRequired", selectedPlayers)
      if (searchQuery) params.append("search", searchQuery)

      const response = await fetch(`/api/drills?${params.toString()}`)
      const data = await response.json()

      if (data?.success) {
        setDrills(data?.drills ?? [])
      }
    } catch (error) {
      console.error("Failed to fetch drills:", error)
      toast.error("Failed to load drills")
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (drillId: string) => {
    try {
      const response = await fetch("/api/drills/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drillId }),
      })

      const data = await response.json()
      if (data?.success) {
        toast.success(data?.message ?? "Favorite updated")
        // Update local state
        setDrills(prev =>
          prev?.map(d =>
            d?.id === drillId ? { ...d, isFavorite: data?.isFavorite } : d
          ) ?? []
        )
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error)
      toast.error("Failed to update favorite")
    }
  }

  const markAsCompleted = async (drillId: string, duration: number) => {
    try {
      const response = await fetch("/api/drills/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drillId, timeSpent: duration }),
      })

      const data = await response.json()
      if (data?.success) {
        toast.success("Drill completed! Great work! 🎉")
        fetchDrills() // Refresh to get updated progress
      }
    } catch (error) {
      console.error("Failed to mark as completed:", error)
      toast.error("Failed to update progress")
    }
  }

  const toggleDrillInSession = (id: string) => {
    setCustomSession(prev =>
      prev?.includes(id) ? prev?.filter(drillId => drillId !== id) ?? [] : [...(prev ?? []), id]
    )
  }

  const saveCustomSession = async () => {
    if (!customSession || customSession?.length === 0) {
      toast.error("Please add drills to your session first")
      return
    }

    try {
      const response = await fetch("/api/drills/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Practice Session - ${new Date().toLocaleDateString()}`,
          drillIds: customSession,
        }),
      })

      const data = await response.json()
      if (data?.success) {
        toast.success("Custom practice session saved!")
        setCustomSession([])
      }
    } catch (error) {
      console.error("Failed to save session:", error)
      toast.error("Failed to save session")
    }
  }

  const clearFilters = () => {
    setSelectedCategory("all")
    setSelectedDifficulty("all")
    setSelectedAgeGroup("all")
    setSelectedGender("all")
    setSelectedDuration(null)
    setSelectedPlayers("all")
    setSearchQuery("")
  }

  const activeFilterCount = [
    selectedCategory !== "all",
    selectedDifficulty !== "all",
    selectedAgeGroup !== "all",
    selectedGender !== "all",
    selectedDuration !== null,
    selectedPlayers !== "all",
    searchQuery !== ""
  ].filter(Boolean).length

  const customSessionDuration = customSession?.reduce((total, id) => {
    const drill = drills?.find(d => d?.id === id)
    return total + (drill?.duration ?? 0)
  }, 0) ?? 0

  const filteredByView = drills?.filter(drill => {
    if (viewMode === "favorites") return drill?.isFavorite
    if (viewMode === "completed") return (drill?.userProgress?.completedCount ?? 0) > 0
    return true
  }) ?? []

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "BEGINNER": return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400"
      case "INTERMEDIATE": return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
      case "ADVANCED": return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400"
      case "PRO": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400"
      default: return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const getCategoryIcon = (category: DrillCategory) => {
    const icons: Record<DrillCategory, any> = {
      SERVING_RETURN: Target,
      DINKING: Zap,
      THIRD_SHOT_DROP: TrendingUp,
      VOLLEY: Dumbbell,
      FOOTWORK_MOVEMENT: TrendingUp,
      STRATEGY_POSITIONING: Brain,
      WARMUP_CONDITIONING: Zap,
      OVERHEAD_LOB: Award,
      PARTNER_TEAM: Users,
      SOLO_PRACTICE: Target,
      COOLDOWN_RECOVERY: Sparkles,
    }
    return icons?.[category] ?? Target
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-teal-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-gray-400">Loading drills...</p>
        </div>
      </div>
    )
  }

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

        {/* Header */}
        <div className="relative mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50/80 via-emerald-50/60 to-cyan-50/80 dark:from-teal-950/30 dark:via-emerald-950/20 dark:to-cyan-950/30 rounded-3xl"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-teal-200/20 to-emerald-200/20 dark:from-teal-800/10 dark:to-emerald-800/10 rounded-full blur-3xl"></div>
          
          <div className="relative p-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/25">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent dark:from-teal-400 dark:via-emerald-400 dark:to-cyan-400">
                  Practice Drill Library
                </h1>
                <p className="text-lg text-slate-700 dark:text-gray-300 mt-1">
                  <span className="font-semibold text-teal-600 dark:text-teal-400">{drills?.length ?? 0}</span> comprehensive drills with video tutorials
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={viewMode === "all" ? "default" : "outline"}
            onClick={() => setViewMode("all")}
            className="gap-2"
          >
            <BookOpen className="w-4 h-4" />
            All Drills ({drills?.length ?? 0})
          </Button>
          <Button
            variant={viewMode === "favorites" ? "default" : "outline"}
            onClick={() => setViewMode("favorites")}
            className="gap-2"
          >
            <Heart className="w-4 h-4" />
            Favorites ({drills?.filter(d => d?.isFavorite)?.length ?? 0})
          </Button>
          <Button
            variant={viewMode === "completed" ? "default" : "outline"}
            onClick={() => setViewMode("completed")}
            className="gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Completed ({drills?.filter(d => (d?.userProgress?.completedCount ?? 0) > 0)?.length ?? 0})
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search by skill, technique, or focus area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value ?? "")}
                className="pl-10 bg-white/90 dark:bg-gray-800/90 rounded-xl"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "rounded-xl",
                showFilters && "bg-teal-50 dark:bg-teal-950/30 border-teal-300 dark:border-teal-600"
              )}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-teal-500">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="rounded-xl"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <Card className="p-4 rounded-2xl">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e?.target?.value as any)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="all">All Categories</option>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e?.target?.value as any)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="all">All Levels</option>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="PRO">Pro</option>
                  </select>
                </div>

                {/* Age Group Filter */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">Age Group</label>
                  <select
                    value={selectedAgeGroup}
                    onChange={(e) => setSelectedAgeGroup(e?.target?.value ?? "")}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="all">All Ages</option>
                    <option value="Kids 8-12">Kids (8-12)</option>
                    <option value="Teens 13-17">Teens (13-17)</option>
                    <option value="Adults 18-55">Adults (18-55)</option>
                    <option value="Seniors 55+">Seniors (55+)</option>
                  </select>
                </div>

                {/* Duration Filter */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">Duration</label>
                  <select
                    value={selectedDuration ?? ""}
                    onChange={(e) => setSelectedDuration(e?.target?.value ? parseInt(e?.target?.value) : null)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Any Duration</option>
                    <option value="10">≤ 10 min</option>
                    <option value="15">≤ 15 min</option>
                    <option value="20">≤ 20 min</option>
                    <option value="30">≤ 30 min</option>
                  </select>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Custom Session Builder */}
        {customSession?.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-purple-200 dark:border-purple-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Custom Practice Session</span>
                <Badge className="bg-purple-600 text-white">
                  {customSessionDuration} min total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {customSession?.map(id => {
                  const drill = drills?.find(d => d?.id === id)
                  if (!drill) return null
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="py-2 px-3 flex items-center gap-2"
                    >
                      {drill?.title ?? "Unknown"} ({drill?.duration ?? 0}m)
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
                  onClick={saveCustomSession}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Session
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
            Showing <span className="font-semibold">{filteredByView?.length ?? 0}</span> drills
          </p>
        </div>

        {/* Drills Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredByView?.map(drill => {
            const Icon = getCategoryIcon(drill?.category ?? "DINKING")
            const isExpanded = expandedDrill === drill?.id
            const isInSession = customSession?.includes(drill?.id ?? "")

            return (
              <Card 
                key={drill?.id ?? Math.random()}
                className={cn(
                  "relative group cursor-pointer bg-white/95 dark:bg-gray-800/95 rounded-2xl",
                  "shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1",
                  isInSession && "ring-2 ring-purple-400 ring-offset-2"
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      {drill?.featured && (
                        <Badge className="bg-amber-100 text-amber-700 text-xs">
                          <Star className="h-2.5 w-2.5 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {drill?.videos && drill?.videos?.length > 0 && (
                        <Badge className="bg-purple-100 text-purple-700 text-xs">
                          <Video className="h-2.5 w-2.5 mr-1" />
                          {drill?.videos?.length}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(drill?.id ?? "")}
                        className="h-8 w-8 p-0"
                      >
                        <Heart
                          className={cn(
                            "h-4 w-4",
                            drill?.isFavorite && "fill-red-500 text-red-500"
                          )}
                        />
                      </Button>
                      <Badge className={cn("text-xs capitalize", getDifficultyColor(drill?.difficulty ?? "BEGINNER"))}>
                        {drill?.difficulty?.toLowerCase() ?? "beginner"}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight">{drill?.title ?? "Untitled"}</CardTitle>
                  <p className="text-sm font-medium text-teal-600 dark:text-teal-400 italic">
                    {drill?.tagline ?? ""}
                  </p>
                  <CardDescription className="line-clamp-2">
                    {drill?.description ?? ""}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Quick Info */}
                    <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {drill?.duration ?? 0} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {drill?.playersRequired ?? "1"}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {categoryLabels?.[drill?.category ?? "DINKING"]}
                      </Badge>
                    </div>

                    {/* User Progress */}
                    {drill?.userProgress && (drill?.userProgress?.completedCount ?? 0) > 0 && (
                      <div className="bg-green-50 dark:bg-green-950/30 p-2 rounded-lg">
                        <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                          ✓ Completed {drill?.userProgress?.completedCount ?? 0} time{(drill?.userProgress?.completedCount ?? 0) > 1 ? 's' : ''} 
                          ({drill?.userProgress?.totalTimeSpent ?? 0} min total)
                        </p>
                      </div>
                    )}

                    {/* Focus Areas */}
                    {!isExpanded && (
                      <div className="flex flex-wrap gap-1">
                        {drill?.focusAreas?.slice(0, 2)?.map((focus, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {focus ?? ""}
                          </Badge>
                        )) ?? []}
                        {(drill?.focusAreas?.length ?? 0) > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(drill?.focusAreas?.length ?? 0) - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="space-y-4 border-t pt-4">
                        {/* Instructions */}
                        <div>
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Play className="h-4 w-4 text-teal-600" />
                            Instructions
                          </h4>
                          <ol className="space-y-1.5 text-sm text-slate-600 dark:text-gray-400">
                            {drill?.instructions?.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-teal-600 font-semibold min-w-[20px]">
                                  {idx + 1}.
                                </span>
                                {step ?? ""}
                              </li>
                            )) ?? []}
                          </ol>
                        </div>

                        {/* Pro Tips */}
                        {drill?.proTips && drill?.proTips?.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-amber-600" />
                              Pro Tips
                            </h4>
                            <ul className="space-y-1 text-sm text-slate-600 dark:text-gray-400">
                              {drill?.proTips?.map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-amber-600">💡</span>
                                  {tip ?? ""}
                                </li>
                              )) ?? []}
                            </ul>
                          </div>
                        )}

                        {/* Videos */}
                        {drill?.videos && drill?.videos?.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <Video className="h-4 w-4 text-purple-600" />
                              Video Tutorials
                            </h4>
                            <div className="space-y-2">
                              {drill?.videos?.map((video, idx) => (
                                <a
                                  key={idx}
                                  href={video?.url ?? "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors"
                                >
                                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                    {video?.title ?? "Video Tutorial"}
                                  </p>
                                  {video?.description && (
                                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                                      {video?.description ?? ""}
                                    </p>
                                  )}
                                </a>
                              )) ?? []}
                            </div>
                          </div>
                        )}

                        {/* Success Metric */}
                        <div className="bg-teal-50 dark:bg-teal-950/30 p-3 rounded-lg">
                          <h4 className="font-semibold text-sm mb-1 flex items-center gap-2 text-teal-900 dark:text-teal-100">
                            <Award className="h-4 w-4" />
                            Success Metric
                          </h4>
                          <p className="text-sm text-teal-700 dark:text-teal-300">
                            {drill?.successMetrics ?? ""}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setExpandedDrill(isExpanded ? null : drill?.id ?? null)}
                      >
                        {isExpanded ? "Hide" : "View"} Details
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                        onClick={() => markAsCompleted(drill?.id ?? "", drill?.duration ?? 0)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        variant={isInSession ? "secondary" : "outline"}
                        onClick={() => toggleDrillInSession(drill?.id ?? "")}
                      >
                        <Plus className={cn("h-4 w-4", isInSession && "rotate-45")} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          }) ?? []}
        </div>

        {/* Empty State */}
        {filteredByView?.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No drills found</h3>
            <p className="text-slate-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search query
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
