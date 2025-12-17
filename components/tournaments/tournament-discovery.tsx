"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  MapPin, 
  Calendar, 
  Trophy, 
  Users, 
  Filter,
  X,
  ExternalLink,
  Star,
  TrendingUp,
  Award,
  Clock,
  DollarSign,
  Loader2,
  ChevronDown,
  Sparkles,
  Info,
  CheckCircle2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Skill level options
const SKILL_LEVELS = [
  { value: "BEGINNER", label: "2.5", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { value: "INTERMEDIATE", label: "3.0-3.5", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "ADVANCED", label: "4.0-4.5", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { value: "PRO", label: "5.0+", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
]

// Format options
const FORMATS = [
  { value: "SINGLES", label: "Singles", icon: "👤" },
  { value: "DOUBLES", label: "Doubles", icon: "👥" },
  { value: "MIXED_DOUBLES", label: "Mixed", icon: "👫" },
]

// US States
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
]

interface Tournament {
  id: string
  name: string
  description: string | null
  venueName: string
  city: string
  state: string
  startDate: string
  endDate: string
  format: string[]
  skillLevels: string[]
  prizePool: number | null
  entryFee: number | null
  registrationUrl: string | null
  websiteUrl: string | null
  status: string
  currentRegistrations: number
  maxParticipants: number | null
  imageUrl: string | null
}

export function TournamentDiscovery() {
  const router = useRouter()
  
  // State
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedState, setSelectedState] = useState<string>("all")
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string>("all")
  const [selectedFormat, setSelectedFormat] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Fetch tournaments
  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tournaments')
      if (!response.ok) throw new Error('Failed to fetch tournaments')
      const data = await response.json()
      setTournaments(data.tournaments || [])
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      toast.error('Failed to load tournaments')
    } finally {
      setLoading(false)
    }
  }

  // Filter tournaments
  const filteredTournaments = useMemo(() => {
    return tournaments.filter(tournament => {
      const matchesSearch = searchQuery === "" || 
        tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tournament.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tournament.state.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesState = selectedState === "all" || tournament.state === selectedState
      const matchesSkill = selectedSkillLevel === "all" || tournament.skillLevels.includes(selectedSkillLevel)
      const matchesFormat = selectedFormat === "all" || tournament.format.includes(selectedFormat)

      return matchesSearch && matchesState && matchesSkill && matchesFormat
    }).sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        case "prize":
          return (b.prizePool || 0) - (a.prizePool || 0)
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })
  }, [tournaments, searchQuery, selectedState, selectedSkillLevel, selectedFormat, sortBy])

  // Featured tournaments (top 3 by prize pool)
  const featuredTournaments = useMemo(() => {
    return [...tournaments]
      .sort((a, b) => (b.prizePool || 0) - (a.prizePool || 0))
      .slice(0, 3)
  }, [tournaments])

  const formatDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const formatter = new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
    
    if (start.toDateString() === end.toDateString()) {
      return formatter.format(start)
    }
    
    return `${formatter.format(start)} - ${end.getDate()}`
  }

  const formatPrize = (amount: number | null) => {
    if (!amount) return "Prize TBA"
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(amount)
  }

  const activeFilterCount = [
    selectedState !== "all",
    selectedSkillLevel !== "all",
    selectedFormat !== "all",
  ].filter(Boolean).length

  const handleViewDetails = (tournament: Tournament) => {
    setSelectedTournament(tournament)
    setShowDetailsModal(true)
  }

  const handleRegister = (tournament: Tournament) => {
    if (tournament.registrationUrl) {
      window.open(tournament.registrationUrl, '_blank')
      toast.success(`Opening registration for ${tournament.name}`)
    } else {
      toast.info("Registration link coming soon!")
    }
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-emerald-950">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-600/10 to-emerald-600/10 rounded-full blur-3xl" />
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border border-blue-500/30 backdrop-blur-sm mb-6"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Discover Your Next Competition</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-blue-100 to-emerald-100 bg-clip-text text-transparent">
                Find Your Next
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Tournament
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Compete at your level. Connect with players. Elevate your game.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
              <div className="relative flex items-center bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-2 shadow-2xl">
                <Search className="w-6 h-6 text-gray-400 ml-4" />
                <Input
                  placeholder="Search by tournament name, location, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-0 text-white placeholder:text-gray-400 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 h-12 rounded-xl relative"
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-wrap justify-center gap-6 text-center"
          >
            <div className="px-6 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="text-3xl font-bold text-white">{tournaments.length}</div>
              <div className="text-sm text-gray-400">Tournaments</div>
            </div>
            <div className="px-6 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="text-3xl font-bold text-white">{new Set(tournaments.map(t => t.state)).size}</div>
              <div className="text-sm text-gray-400">States</div>
            </div>
            <div className="px-6 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="text-3xl font-bold text-emerald-400">
                {formatPrize(tournaments.reduce((sum, t) => sum + (t.prizePool || 0), 0))}
              </div>
              <div className="text-sm text-gray-400">Total Prizes</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters Section - Collapsible */}
      <AnimatePresence>
        {showFilters && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900/50 border-y border-white/10 backdrop-blur-sm"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-400" />
                  Smart Filters
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedState("all")
                    setSelectedSkillLevel("all")
                    setSelectedFormat("all")
                    toast.success("Filters cleared")
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  Reset All
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Location Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    Location
                  </label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      {US_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Skill Level Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Skill Level
                  </label>
                  <Select value={selectedSkillLevel} onValueChange={setSelectedSkillLevel}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {SKILL_LEVELS.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Format Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    Format
                  </label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Formats</SelectItem>
                      {FORMATS.map(format => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.icon} {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Featured Tournaments */}
        {featuredTournaments.length > 0 && (
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-8"
            >
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              <h2 className="text-3xl font-bold text-white">Featured Tournaments</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredTournaments.map((tournament, index) => (
                <motion.div
                  key={tournament.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 h-full cursor-pointer"
                    onClick={() => handleViewDetails(tournament)}
                  >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Featured Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-yellow-500 text-slate-900 font-bold">
                        <Star className="w-3 h-3 mr-1" />
                        FEATURED
                      </Badge>
                    </div>

                    <CardContent className="p-6 relative">
                      <Trophy className="w-10 h-10 text-yellow-400 mb-4" />
                      
                      <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                        {tournament.name}
                      </h3>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span className="text-sm">{tournament.city}, {tournament.state}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span className="text-sm">{formatDate(tournament.startDate, tournament.endDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                          <span className="text-lg font-bold text-yellow-400">
                            {formatPrize(tournament.prizePool)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {tournament.skillLevels.slice(0, 3).map(level => {
                          const skillConfig = SKILL_LEVELS.find(s => s.value === level)
                          return (
                            <Badge key={level} className={skillConfig?.color || "bg-gray-500/20 text-gray-400"}>
                              {skillConfig?.label || level}
                            </Badge>
                          )
                        })}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewDetails(tournament)
                          }}
                          variant="outline"
                          className="flex-1 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                        >
                          <Info className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRegister(tournament)
                          }}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
                        >
                          Register
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">
              {filteredTournaments.length === tournaments.length ? 
                "All Tournaments" : 
                `${filteredTournaments.length} Tournament${filteredTournaments.length !== 1 ? 's' : ''} Found`}
            </h2>
            {activeFilterCount > 0 && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
              </Badge>
            )}
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="prize">Sort by Prize Pool</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tournament Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-400">Loading tournaments...</p>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Trophy className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">No tournaments found</h3>
            <p className="text-gray-400 mb-8">Try adjusting your filters or search terms</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedState("all")
                setSelectedSkillLevel("all")
                setSelectedFormat("all")
              }}
              className="bg-blue-600 hover:bg-blue-500"
            >
              Clear All Filters
            </Button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament, index) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.3) }}
              >
                <Card className="group relative overflow-hidden bg-slate-900/50 border-white/10 hover:border-blue-500/50 transition-all duration-300 h-full backdrop-blur-sm cursor-pointer"
                  onClick={() => handleViewDetails(tournament)}
                >
                  {/* Hover Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-emerald-500/0 group-hover:from-blue-500/10 group-hover:to-emerald-500/10 transition-all duration-300" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    {tournament.status === "REGISTRATION_OPEN" ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 backdrop-blur-sm">
                        <Clock className="w-3 h-3 mr-1 animate-pulse" />
                        Open
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 backdrop-blur-sm">
                        Upcoming
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-6 relative">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                        {tournament.name}
                      </h3>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span className="text-sm truncate">{tournament.city}, {tournament.state}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-sm">{formatDate(tournament.startDate, tournament.endDate)}</span>
                      </div>
                      {tournament.prizePool && (
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                          <span className="text-sm font-semibold text-yellow-400">
                            {formatPrize(tournament.prizePool)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Skill Levels */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {tournament.skillLevels.map(level => {
                        const skillConfig = SKILL_LEVELS.find(s => s.value === level)
                        return (
                          <Badge 
                            key={level} 
                            className={`text-xs ${skillConfig?.color || "bg-gray-500/20 text-gray-400"}`}
                          >
                            {skillConfig?.label || level}
                          </Badge>
                        )
                      })}
                    </div>

                    {/* Formats */}
                    <div className="flex gap-2 mb-6 text-xs text-gray-400">
                      {tournament.format.map(fmt => {
                        const formatConfig = FORMATS.find(f => f.value === fmt)
                        return (
                          <span key={fmt} className="flex items-center gap-1">
                            <span>{formatConfig?.icon}</span>
                            <span>{formatConfig?.label}</span>
                          </span>
                        )
                      })}
                    </div>

                    {/* Capacity */}
                    {tournament.maxParticipants && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                          <span>Registration</span>
                          <span>{tournament.currentRegistrations} / {tournament.maxParticipants}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                            style={{ width: `${Math.min((tournament.currentRegistrations / tournament.maxParticipants) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewDetails(tournament)
                        }}
                        variant="outline"
                        className="flex-1 border-slate-600 hover:border-blue-500/50 hover:bg-blue-500/10"
                      >
                        <Info className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRegister(tournament)
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
                        disabled={tournament.status !== "REGISTRATION_OPEN" && tournament.status !== "UPCOMING"}
                      >
                        {tournament.status === "REGISTRATION_OPEN" ? "Register" : "View"}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Tournament Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white">
          {selectedTournament && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  {selectedTournament.name}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Tournament Details & Registration
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Description */}
                {selectedTournament.description && (
                  <p className="text-gray-300 leading-relaxed">
                    {selectedTournament.description}
                  </p>
                )}

                {/* Key Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">Location</span>
                    </div>
                    <p className="text-white font-semibold">{selectedTournament.venueName}</p>
                    <p className="text-gray-400 text-sm">{selectedTournament.city}, {selectedTournament.state}</p>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Dates</span>
                    </div>
                    <p className="text-white font-semibold">
                      {formatDate(selectedTournament.startDate, selectedTournament.endDate)}
                    </p>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                      <Award className="w-4 h-4" />
                      <span className="text-sm font-medium">Prize Pool</span>
                    </div>
                    <p className="text-white font-semibold text-xl">
                      {formatPrize(selectedTournament.prizePool)}
                    </p>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-2 text-purple-400 mb-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-medium">Entry Fee</span>
                    </div>
                    <p className="text-white font-semibold">
                      {selectedTournament.entryFee ? `$${selectedTournament.entryFee}` : 'TBA'}
                    </p>
                  </div>
                </div>

                {/* Skill Levels & Formats */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Skill Levels</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTournament.skillLevels.map(level => {
                        const skillConfig = SKILL_LEVELS.find(s => s.value === level)
                        return (
                          <Badge key={level} className={skillConfig?.color || "bg-gray-500/20 text-gray-400"}>
                            {skillConfig?.label || level}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Formats Available</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTournament.format.map(fmt => {
                        const formatConfig = FORMATS.find(f => f.value === fmt)
                        return (
                          <Badge key={fmt} variant="outline" className="border-slate-600">
                            {formatConfig?.icon} {formatConfig?.label || fmt}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Registration Progress */}
                {selectedTournament.maxParticipants && (
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Registration Progress</span>
                      <span className="text-sm font-medium text-white">
                        {selectedTournament.currentRegistrations} / {selectedTournament.maxParticipants} spots filled
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                        style={{ width: `${Math.min((selectedTournament.currentRegistrations / selectedTournament.maxParticipants) * 100, 100)}%` }}
                      />
                    </div>
                    {selectedTournament.currentRegistrations >= selectedTournament.maxParticipants * 0.9 && (
                      <p className="text-amber-400 text-xs mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Almost full! Register soon to secure your spot.
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-700">
                  {selectedTournament.websiteUrl && (
                    <Button
                      variant="outline"
                      className="flex-1 border-slate-600 hover:border-blue-500/50"
                      onClick={() => window.open(selectedTournament.websiteUrl!, '_blank')}
                    >
                      Visit Website
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500"
                    onClick={() => {
                      handleRegister(selectedTournament)
                      setShowDetailsModal(false)
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Register Now
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
