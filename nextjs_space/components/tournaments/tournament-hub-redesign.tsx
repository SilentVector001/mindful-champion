// @ts-nocheck
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import useSWR from "swr"
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Star,
  Heart,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  Clock,
  Award,
  Zap,
  Target,
  Globe,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Loader2,
  Map,
  CalendarDays,
  X,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatPrizeMoney } from "@/lib/utils/currency"
import { ALL_TOURNAMENTS, calculateTournamentStats } from "@/lib/tournaments-data"

// SWR fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json())

interface StateData {
  abbr: string
  name: string
  events: number
}

interface Tournament {
  id: string
  name: string
  location: string
  city?: string
  state?: string
  venue?: string
  startDate: string
  endDate?: string
  prizePool?: number
  points?: number
  type?: string
  tier?: string
  featured?: boolean
  registrationOpen?: boolean
  registrationUrl?: string
  description?: string
  skillLevels?: string[]
}

// US States for the map
const US_STATES_MAP: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
}

// Tour colors for branding
const TOUR_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string; name: string }> = {
  'ppa': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40', gradient: 'from-orange-500 to-amber-500', name: 'PPA Tour' },
  'app': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/40', gradient: 'from-cyan-500 to-blue-500', name: 'APP Tour' },
  'mlp': { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/40', gradient: 'from-purple-500 to-pink-500', name: 'MLP' },
  'usap': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40', gradient: 'from-red-500 to-rose-500', name: 'USA Pickleball' },
}

// Get tour info from type
const getTourInfo = (type?: string) => {
  if (!type) return { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/40', gradient: 'from-slate-500 to-gray-500', name: 'Event' }
  const tour = type.split('-')[0].toLowerCase()
  return TOUR_COLORS[tour] || { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/40', gradient: 'from-slate-500 to-gray-500', name: 'Event' }
}

// Get tier badge
const getTierBadge = (tier?: string, type?: string) => {
  if (tier === 'major' || type?.includes('major')) {
    return { bg: 'bg-yellow-500/30', text: 'text-yellow-300', border: 'border-yellow-400/50', label: '🏆 Major', glow: 'shadow-yellow-500/30' }
  }
  if (tier === 'open' || type?.includes('open')) {
    return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', label: 'Open', glow: '' }
  }
  if (tier === 'challenger' || type?.includes('challenger')) {
    return { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/40', label: 'Challenger', glow: '' }
  }
  if (type?.includes('nextgen')) {
    return { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/40', label: 'Next Gen', glow: '' }
  }
  return { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/40', label: 'Event', glow: '' }
}

// Helper to extract state from location
const extractState = (location?: string) => {
  if (!location) return null
  const match = location.match(/,\s*([A-Z]{2})(?:\s|$)/)
  return match ? match[1] : null
}

// Format date
const formatDate = (startDate: string, endDate?: string) => {
  if (!startDate) return 'Date TBA'
  const start = new Date(startDate)
  const month = start.toLocaleDateString('en-US', { month: 'short' })
  const day = start.getDate()
  const year = start.getFullYear()
  
  if (endDate) {
    const end = new Date(endDate)
    if (end.getMonth() === start.getMonth()) {
      return `${month} ${day}-${end.getDate()}, ${year}`
    }
    return `${month} ${day} - ${end.toLocaleDateString('en-US', { month: 'short' })} ${end.getDate()}, ${year}`
  }
  return `${month} ${day}, ${year}`
}

// Registration URL helper
const getRegistrationUrl = (tournament?: Tournament) => {
  if (tournament?.registrationUrl) return tournament.registrationUrl
  if (tournament?.type?.startsWith('app')) return "https://www.theapp.global/tour"
  return "https://ppatour.com/schedule/"
}

export function TournamentHubRedesign() {
  const eventsRef = useRef<HTMLDivElement>(null)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAllStates, setShowAllStates] = useState(false)

  // Use static data for states (more reliable)
  const computeStateData = useCallback(() => {
    const stateCounts: Record<string, number> = {}
    ALL_TOURNAMENTS.forEach(t => {
      const state = extractState(t.location)
      if (state && US_STATES_MAP[state]) {
        stateCounts[state] = (stateCounts[state] || 0) + 1
      }
    })
    return Object.entries(stateCounts)
      .map(([abbr, count]) => ({ abbr, name: US_STATES_MAP[abbr], events: count }))
      .filter(s => s.events > 0)
      .sort((a, b) => b.events - a.events)
  }, [])

  const stateData = computeStateData()
  const tournaments = ALL_TOURNAMENTS
  const stats = calculateTournamentStats()

  // Display states
  const displayStates = showAllStates ? stateData : stateData.slice(0, 12)

  // Gradient based on event count
  const maxEvents = stateData.length > 0 ? Math.max(...stateData.map(s => s.events)) : 1
  const minEvents = stateData.length > 0 ? Math.min(...stateData.map(s => s.events)) : 1

  const getStateGradient = useCallback((eventCount: number) => {
    const normalized = maxEvents > minEvents ? (eventCount - minEvents) / (maxEvents - minEvents) : 0.5
    
    if (normalized < 0.25) {
      return { from: "from-indigo-600", to: "to-blue-500", ring: "ring-indigo-500/40" }
    } else if (normalized < 0.5) {
      return { from: "from-cyan-500", to: "to-teal-500", ring: "ring-cyan-500/40" }
    } else if (normalized < 0.75) {
      return { from: "from-emerald-500", to: "to-green-400", ring: "ring-emerald-500/50" }
    } else {
      return { from: "from-amber-400", to: "to-orange-500", ring: "ring-orange-500/60" }
    }
  }, [minEvents, maxEvents])

  // Filter tournaments
  const filteredTournaments = tournaments.filter(t => {
    // State filter
    if (selectedState) {
      const tournamentState = extractState(t.location)
      if (tournamentState !== selectedState) return false
    }
    // Type filter
    if (selectedType !== 'all') {
      if (selectedType === 'ppa' && !t.type?.startsWith('ppa')) return false
      if (selectedType === 'app' && !t.type?.startsWith('app')) return false
      if (selectedType === 'major' && t.tier !== 'major') return false
    }
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return t.name?.toLowerCase().includes(query) || 
             t.location?.toLowerCase().includes(query) ||
             t.venue?.toLowerCase().includes(query)
    }
    return true
  }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  const handleStateClick = (abbr: string) => {
    setSelectedState(abbr === selectedState ? null : abbr)
    setTimeout(() => {
      eventsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-orange-500/15 to-amber-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-12">
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3 mb-4"
            >
              <Badge className="bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-400 border-cyan-500/30 px-4 py-1.5">
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                {stats.totalTournaments} Events Nationwide
              </Badge>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-3">
              Tournament{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent animate-gradient">
                Hub
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Discover professional and amateur pickleball tournaments across the nation
            </p>
          </div>

          {/* Stats Row - Enhanced */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { 
                label: "Total Events", 
                value: stats.totalTournaments, 
                icon: Calendar, 
                gradient: "from-cyan-500 to-blue-600",
                glow: "shadow-cyan-500/30"
              },
              { 
                label: "States", 
                value: stateData.length, 
                icon: Globe, 
                gradient: "from-emerald-500 to-teal-600",
                glow: "shadow-emerald-500/30"
              },
              { 
                label: "Prize Pool", 
                value: "$2.5M+", 
                icon: DollarSign, 
                gradient: "from-amber-400 to-orange-500",
                glow: "shadow-amber-500/30",
                blink: true
              },
              { 
                label: "Major Events", 
                value: stats.majorEvents, 
                icon: Trophy, 
                gradient: "from-yellow-400 to-amber-500",
                glow: "shadow-yellow-500/30",
                blink: true
              },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative group`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity ${stat.blink ? 'animate-pulse' : ''}`} />
                <div className={`relative bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all shadow-lg ${stat.glow}`}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
                  {stat.blink && (
                    <div className="absolute top-3 right-3">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Interactive State Map */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                Browse by State
              </h2>
              {selectedState && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedState(null)}
                  className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear: {selectedState}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {displayStates.map((state, i) => {
                const gradient = getStateGradient(state.events)
                const isSelected = selectedState === state.abbr
                const isHotspot = state.events >= maxEvents * 0.7
                return (
                  <motion.button
                    key={state.abbr}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => handleStateClick(state.abbr)}
                    whileHover={{ scale: 1.08, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative p-4 rounded-xl border-2 transition-all shadow-lg ${
                      isSelected
                        ? "bg-gradient-to-br from-cyan-500 to-emerald-500 border-white/50 ring-4 ring-cyan-500/30 shadow-cyan-500/40"
                        : `bg-gradient-to-br ${gradient.from} ${gradient.to} border-white/20 hover:border-white/40 ${gradient.ring} hover:ring-2 hover:shadow-xl`
                    }`}
                  >
                    <div className="text-xl font-black text-white drop-shadow-md">
                      {state.abbr}
                    </div>
                    <div className="text-xs font-semibold text-white/80">
                      {state.events} event{state.events !== 1 ? 's' : ''}
                    </div>
                    {isHotspot && !isSelected && (
                      <div className="absolute -top-1.5 -right-1.5">
                        <span className="relative flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg"></span>
                        </span>
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>

            {stateData.length > 12 && (
              <div className="mt-6 text-center">
                <Button
                  variant="ghost"
                  onClick={() => setShowAllStates(!showAllStates)}
                  className="text-gray-300 hover:text-white bg-white/5 hover:bg-white/10"
                >
                  {showAllStates ? 'Show Less' : `Show All ${stateData.length} States`}
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showAllStates ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            )}

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <span className="flex items-center gap-2 text-gray-400">
                <div className="w-4 h-4 rounded-md bg-gradient-to-r from-indigo-600 to-blue-500" />
                1-2 Events
              </span>
              <span className="flex items-center gap-2 text-gray-400">
                <div className="w-4 h-4 rounded-md bg-gradient-to-r from-emerald-500 to-green-400" />
                3-5 Events
              </span>
              <span className="flex items-center gap-2 text-gray-400">
                <div className="w-4 h-4 rounded-md bg-gradient-to-r from-amber-400 to-orange-500" />
                <Sparkles className="w-3 h-3 text-amber-400" />
                Hotspot
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Tournaments Section */}
      <section ref={eventsRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-10 scroll-mt-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black text-white mb-2">
              {selectedState ? `${US_STATES_MAP[selectedState]} Events` : 'All Tournaments'}
            </h2>
            <p className="text-gray-400">
              {filteredTournaments.length} events {selectedState ? `in ${selectedState}` : 'nationwide'}
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search tournaments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-900/60 border-white/20 text-white placeholder:text-gray-500 h-11 rounded-xl"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-40 bg-slate-900/60 border-white/20 text-white h-11 rounded-xl">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/20">
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="ppa">PPA Tour</SelectItem>
                <SelectItem value="app">APP Tour</SelectItem>
                <SelectItem value="major">Majors Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredTournaments.map((tournament, i) => {
              const tourInfo = getTourInfo(tournament.type)
              const tierInfo = getTierBadge(tournament.tier, tournament.type)
              const isMajor = tournament.tier === 'major'
              
              return (
                <motion.div
                  key={tournament.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.03 }}
                  className="group"
                >
                  <Card className={`relative overflow-hidden bg-slate-900/70 backdrop-blur border-white/10 hover:border-white/25 transition-all duration-300 hover:shadow-2xl ${
                    isMajor ? 'ring-2 ring-yellow-500/30 shadow-yellow-500/10' : ''
                  }`}>
                    {/* Tour color accent bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${tourInfo.gradient}`} />
                    
                    {/* Major badge pulse */}
                    {isMajor && (
                      <div className="absolute top-4 right-4">
                        <span className="relative flex">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-50"></span>
                          <span className="relative inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                            <Trophy className="w-3 h-3" />
                            MAJOR
                          </span>
                        </span>
                      </div>
                    )}
                    
                    <CardContent className="p-5">
                      {/* Tour Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={`${tourInfo.bg} ${tourInfo.text} border ${tourInfo.border} font-semibold text-xs`}>
                          {tourInfo.name}
                        </Badge>
                        {!isMajor && tournament.tier && (
                          <Badge className={`${tierInfo.bg} ${tierInfo.text} border ${tierInfo.border} text-xs`}>
                            {tierInfo.label}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Tournament Name */}
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                        {tournament.name}
                      </h3>
                      
                      {/* Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span className="truncate">{tournament.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Calendar className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                          <span>{formatDate(tournament.startDate, tournament.endDate)}</span>
                        </div>
                        {tournament.venue && (
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Target className="w-4 h-4 text-violet-400 flex-shrink-0" />
                            <span className="truncate">{tournament.venue}</span>
                          </div>
                        )}
                        {/* Prize Pool */}
                        {(tournament.prizePool || tournament.points) && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            <span className="text-amber-400 font-bold text-sm">
                              {tournament.prizePool 
                                ? `$${(tournament.prizePool / 1000).toFixed(0)}K Prize Pool` 
                                : tournament.points 
                                  ? `${tournament.points} PPA Points`
                                  : ''}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <a 
                          href={getRegistrationUrl(tournament)}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button 
                            className={`w-full bg-gradient-to-r ${tourInfo.gradient} hover:opacity-90 text-white font-semibold shadow-lg transition-all`}
                            size="sm"
                          >
                            View Details
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {filteredTournaments.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No tournaments found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </section>
    </div>
  )
}
