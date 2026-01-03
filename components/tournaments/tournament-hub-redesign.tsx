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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatPrizeMoney } from "@/lib/utils/currency"

// SWR fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json())

// State type
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

interface TournamentStats {
  totalTournaments: number
  totalPrize: number
  statesCovered: number
  majorEvents?: number
}

// US States for the map
const US_STATES: { abbr: string; name: string }[] = [
  { abbr: 'AL', name: 'Alabama' }, { abbr: 'AK', name: 'Alaska' }, { abbr: 'AZ', name: 'Arizona' },
  { abbr: 'AR', name: 'Arkansas' }, { abbr: 'CA', name: 'California' }, { abbr: 'CO', name: 'Colorado' },
  { abbr: 'CT', name: 'Connecticut' }, { abbr: 'DE', name: 'Delaware' }, { abbr: 'FL', name: 'Florida' },
  { abbr: 'GA', name: 'Georgia' }, { abbr: 'HI', name: 'Hawaii' }, { abbr: 'ID', name: 'Idaho' },
  { abbr: 'IL', name: 'Illinois' }, { abbr: 'IN', name: 'Indiana' }, { abbr: 'IA', name: 'Iowa' },
  { abbr: 'KS', name: 'Kansas' }, { abbr: 'KY', name: 'Kentucky' }, { abbr: 'LA', name: 'Louisiana' },
  { abbr: 'ME', name: 'Maine' }, { abbr: 'MD', name: 'Maryland' }, { abbr: 'MA', name: 'Massachusetts' },
  { abbr: 'MI', name: 'Michigan' }, { abbr: 'MN', name: 'Minnesota' }, { abbr: 'MS', name: 'Mississippi' },
  { abbr: 'MO', name: 'Missouri' }, { abbr: 'MT', name: 'Montana' }, { abbr: 'NE', name: 'Nebraska' },
  { abbr: 'NV', name: 'Nevada' }, { abbr: 'NH', name: 'New Hampshire' }, { abbr: 'NJ', name: 'New Jersey' },
  { abbr: 'NM', name: 'New Mexico' }, { abbr: 'NY', name: 'New York' }, { abbr: 'NC', name: 'North Carolina' },
  { abbr: 'ND', name: 'North Dakota' }, { abbr: 'OH', name: 'Ohio' }, { abbr: 'OK', name: 'Oklahoma' },
  { abbr: 'OR', name: 'Oregon' }, { abbr: 'PA', name: 'Pennsylvania' }, { abbr: 'RI', name: 'Rhode Island' },
  { abbr: 'SC', name: 'South Carolina' }, { abbr: 'SD', name: 'South Dakota' }, { abbr: 'TN', name: 'Tennessee' },
  { abbr: 'TX', name: 'Texas' }, { abbr: 'UT', name: 'Utah' }, { abbr: 'VT', name: 'Vermont' },
  { abbr: 'VA', name: 'Virginia' }, { abbr: 'WA', name: 'Washington' }, { abbr: 'WV', name: 'West Virginia' },
  { abbr: 'WI', name: 'Wisconsin' }, { abbr: 'WY', name: 'Wyoming' }
]

// Helper for registration URLs
const getRegistrationUrl = (tournament?: Tournament) => {
  if (tournament?.registrationUrl) return tournament.registrationUrl
  if (tournament?.type?.startsWith('app')) return "https://www.theapp.global/tour"
  return "https://ppatour.com/schedule/"
}

// Format date nicely
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

// Get tier badge color
const getTierBadge = (tier?: string, type?: string) => {
  if (tier === 'major' || type?.includes('major')) {
    return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Major' }
  }
  if (tier === 'open' || type?.includes('open')) {
    return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Open' }
  }
  if (tier === 'challenger' || type?.includes('challenger')) {
    return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Challenger' }
  }
  if (type?.includes('nextgen')) {
    return { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30', label: 'Next Gen' }
  }
  return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', label: 'Event' }
}

export function TournamentHubRedesign() {
  const eventsRef = useRef<HTMLDivElement>(null)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAllStates, setShowAllStates] = useState(false)

  // SWR for state data with refresh
  const { data: stateDataResponse, error: stateError, isLoading: statesLoading, mutate: refreshStates } = useSWR(
    '/api/tournaments/by-state',
    fetcher,
    { refreshInterval: 300000, revalidateOnFocus: true } // 5 min refresh
  )

  // SWR for tournaments with refresh
  const { data: tournamentsResponse, error: tournamentsError, isLoading: tournamentsLoading, mutate: refreshTournaments } = useSWR(
    '/api/tournaments/all-upcoming',
    fetcher,
    { refreshInterval: 300000, revalidateOnFocus: true }
  )

  // SWR for stats
  const { data: statsResponse } = useSWR('/api/tournaments/stats', fetcher, { refreshInterval: 600000 })

  const stateData: StateData[] = stateDataResponse?.states || []
  const tournaments: Tournament[] = tournamentsResponse?.tournaments || []
  const stats: TournamentStats = statsResponse || { totalTournaments: 0, totalPrize: 0, statesCovered: 0 }
  const lastUpdated = stateDataResponse?.lastUpdated || tournamentsResponse?.lastUpdated || new Date().toISOString()

  // Filter states with events only
  const activeStates = stateData.filter(s => s.events > 0).sort((a, b) => b.events - a.events)
  const displayStates = showAllStates ? activeStates : activeStates.slice(0, 12)

  // Gradient calculation
  const minEvents = activeStates.length > 0 ? Math.min(...activeStates.map(s => s.events)) : 1
  const maxEvents = activeStates.length > 0 ? Math.max(...activeStates.map(s => s.events)) : 1

  const getStateGradient = useCallback((eventCount: number) => {
    const normalized = maxEvents > minEvents ? (eventCount - minEvents) / (maxEvents - minEvents) : 0.5
    
    if (normalized < 0.25) {
      return { from: "from-indigo-600/80", to: "to-blue-500/80", ring: "ring-indigo-500/30" }
    } else if (normalized < 0.5) {
      return { from: "from-cyan-500/80", to: "to-teal-500/80", ring: "ring-cyan-500/30" }
    } else if (normalized < 0.75) {
      return { from: "from-emerald-500/80", to: "to-green-500/80", ring: "ring-emerald-500/40" }
    } else {
      return { from: "from-amber-500/90", to: "to-orange-500/90", ring: "ring-orange-500/50" }
    }
  }, [minEvents, maxEvents])

  // Helper to extract state from location
  const extractStateFromLocation = (location?: string) => {
    if (!location) return null
    const match = location.match(/,\s*([A-Z]{2})(?:\s|$)/)
    return match ? match[1] : null
  }

  // Filter tournaments
  const filteredTournaments = tournaments.filter(t => {
    // State filter - use state field or extract from location (same as API)
    if (selectedState) {
      const tournamentState = (t.state || extractStateFromLocation(t.location))?.toUpperCase()
      if (tournamentState !== selectedState) return false
    }
    // Type filter
    if (selectedType !== 'all') {
      if (selectedType === 'pro' && !['major', 'open'].includes(t.tier || '')) return false
      if (selectedType === 'amateur' && !['amateur', 'challenger'].includes(t.tier || '')) return false
      if (selectedType === 'junior' && !t.type?.includes('nextgen')) return false
    }
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return t.name?.toLowerCase().includes(query) || 
             t.location?.toLowerCase().includes(query) ||
             t.venue?.toLowerCase().includes(query)
    }
    return true
  })

  const handleStateClick = (abbr: string) => {
    setSelectedState(abbr === selectedState ? null : abbr)
    setTimeout(() => {
      eventsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleRefresh = () => {
    refreshStates()
    refreshTournaments()
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section with Map */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-champion-green/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-champion-gold/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-12">
          {/* Header with Last Updated */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <Badge className="bg-champion-green/20 text-champion-green border-champion-green/30">
                  <Map className="w-3 h-3 mr-1" />
                  Interactive Map
                </Badge>
                <Badge variant="outline" className="border-white/20 text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  Updated {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white">
                Tournament <span className="bg-gradient-to-r from-champion-green to-champion-gold bg-clip-text text-transparent">Hub</span>
              </h1>
              <p className="text-gray-400 mt-2">Click a state to explore upcoming tournaments</p>
            </div>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              className="border-white/20 text-gray-300 hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Events", value: stats.totalTournaments || tournaments.length, icon: Calendar },
              { label: "States", value: activeStates.length, icon: Globe },
              { label: "Prize Pool", value: stats.totalPrize ? formatPrizeMoney(stats.totalPrize) : "$2M+", icon: DollarSign },
              { label: "Majors", value: stats.majorEvents || tournaments.filter(t => t.tier === 'major').length, icon: Trophy },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10 text-center">
                <stat.icon className="w-4 h-4 text-champion-green mx-auto mb-1" />
                <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Interactive State Map - HERO */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-champion-green" />
                States with Upcoming Events
              </h2>
              {selectedState && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedState(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear: {selectedState}
                </Button>
              )}
            </div>

            {statesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-champion-green animate-spin" />
              </div>
            ) : activeStates.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming events found. Check back soon!</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {displayStates.map((state) => {
                    const gradient = getStateGradient(state.events)
                    const isSelected = selectedState === state.abbr
                    return (
                      <motion.button
                        key={state.abbr}
                        onClick={() => handleStateClick(state.abbr)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative p-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "bg-champion-green border-champion-green ring-2 ring-champion-green/50"
                            : `bg-gradient-to-br ${gradient.from} ${gradient.to} border-white/10 hover:border-white/30 ${gradient.ring} hover:ring-2`
                        }`}
                      >
                        <div className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-white'}`}>
                          {state.abbr}
                        </div>
                        <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-white/70'}`}>
                          {state.events} event{state.events !== 1 ? 's' : ''}
                        </div>
                        {state.events >= maxEvents * 0.8 && (
                          <div className="absolute -top-1 -right-1">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                            </span>
                          </div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>

                {activeStates.length > 12 && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllStates(!showAllStates)}
                      className="text-gray-400 hover:text-white"
                    >
                      {showAllStates ? 'Show Less' : `Show All ${activeStates.length} States`}
                      <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showAllStates ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>
                )}

                {/* Color Legend */}
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-600 to-blue-500" />
                    Few Events
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500" />
                    Many Events
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
                    Hotspot
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Tournaments Section */}
      <section ref={eventsRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-8 scroll-mt-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search tournaments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500 h-11"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full md:w-44 bg-white/5 border-white/20 text-white h-11">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="pro">Pro / Major</SelectItem>
              <SelectItem value="amateur">Amateur / Challenger</SelectItem>
              <SelectItem value="junior">Junior / Next Gen</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {selectedState 
                ? `Events in ${stateData.find(s => s.abbr === selectedState)?.name || selectedState}`
                : 'Upcoming Tournaments'
              }
            </h2>
            <p className="text-gray-400 text-sm">
              {filteredTournaments.length} event{filteredTournaments.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Tournament Cards */}
        {tournamentsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-champion-green animate-spin" />
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No tournaments found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or check official tour sites</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="https://ppatour.com/schedule/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10">
                  <ExternalLink className="w-4 h-4 mr-2" /> PPA Tour
                </Button>
              </a>
              <a href="https://www.theapp.global/tour" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10">
                  <ExternalLink className="w-4 h-4 mr-2" /> APP Tour
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTournaments.slice(0, 20).map((tournament, index) => {
              const tierBadge = getTierBadge(tournament.tier, tournament.type)
              const prize = tournament.prizePool || (tournament.points ? tournament.points * 100 : 0)
              
              return (
                <motion.div
                  key={tournament.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="bg-white/5 border-white/10 hover:border-champion-green/50 transition-all group overflow-hidden">
                    <CardContent className="p-4 md:p-5">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Main Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <Badge className={`${tierBadge.bg} ${tierBadge.text} ${tierBadge.border} text-xs`}>
                              {tierBadge.label}
                            </Badge>
                            {tournament.featured && (
                              <Badge className="bg-champion-gold/20 text-champion-gold border-champion-gold/30 text-xs">
                                <Star className="w-3 h-3 mr-1" /> Featured
                              </Badge>
                            )}
                            {tournament.type?.includes('ppa') && (
                              <span className="text-xs text-yellow-500/70">PPA</span>
                            )}
                            {tournament.type?.includes('app') && (
                              <span className="text-xs text-orange-500/70">APP</span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-1 truncate group-hover:text-champion-green transition-colors">
                            {tournament.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 shrink-0" />
                              {tournament.venue ? `${tournament.venue}, ${tournament.location}` : tournament.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-4 h-4 shrink-0" />
                              {formatDate(tournament.startDate, tournament.endDate)}
                            </span>
                          </div>
                          {tournament.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{tournament.description}</p>
                          )}
                        </div>

                        {/* Prize & Action */}
                        <div className="flex items-center gap-4 md:flex-col md:items-end">
                          {prize > 0 && (
                            <div className="text-right">
                              <div className="text-lg font-bold text-champion-gold flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {formatPrizeMoney(prize)}
                              </div>
                              <div className="text-xs text-gray-500">Prize Pool</div>
                            </div>
                          )}
                          <a href={getRegistrationUrl(tournament)} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="bg-champion-green hover:bg-champion-green/90 whitespace-nowrap">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Details
                            </Button>
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}

        {filteredTournaments.length > 20 && (
          <div className="mt-6 text-center">
            <p className="text-gray-500 mb-4">Showing 20 of {filteredTournaments.length} tournaments</p>
            <Link href="/tournaments/calendar">
              <Button variant="outline" className="border-champion-green/50 text-champion-green hover:bg-champion-green/10">
                View All Events <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Quick Category Links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h3 className="text-lg font-semibold text-white mb-4">Browse by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { title: "Championship", href: "/tournaments/championship", icon: Trophy, color: "from-yellow-500 to-orange-500" },
            { title: "Amateur", href: "/tournaments/amateur", icon: Target, color: "from-blue-500 to-cyan-500" },
            { title: "Junior", href: "/tournaments/rising-stars", icon: Star, color: "from-purple-500 to-pink-500" },
            { title: "Community", href: "/tournaments/community-leagues", icon: Users, color: "from-green-500 to-emerald-500" },
          ].map((cat) => (
            <Link key={cat.title} href={cat.href}>
              <Card className="bg-white/5 border-white/10 hover:border-white/30 transition-all group cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center shrink-0`}>
                    <cat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-white truncate">{cat.title}</h4>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-champion-green group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Official Tour Links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white/5 rounded-xl border border-white/10 p-5">
          <h3 className="text-sm font-medium text-gray-300 mb-3 text-center">Official Tour Sites</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="https://ppatour.com/schedule/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10">
                <ExternalLink className="w-3 h-3 mr-2" /> PPA Tour
              </Button>
            </a>
            <a href="https://www.theapp.global/tour" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-orange-500/40 text-orange-400 hover:bg-orange-500/10">
                <ExternalLink className="w-3 h-3 mr-2" /> APP Tour
              </Button>
            </a>
            <a href="https://usapickleball.org/events/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-purple-500/40 text-purple-400 hover:bg-purple-500/10">
                <ExternalLink className="w-3 h-3 mr-2" /> USA Pickleball
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <p className="text-center text-xs text-gray-600">
          Data from official pickleball organizations • Auto-refreshes every 5 minutes
        </p>
      </section>
    </div>
  )
}
