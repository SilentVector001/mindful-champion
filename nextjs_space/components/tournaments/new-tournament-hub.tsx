"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
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
  Play,
  Clock,
  Award,
  Zap,
  Target,
  Globe,
  ArrowRight,
  ExternalLink,
  Radio,
  TrendingUp,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatPrizeMoney } from "@/lib/utils/currency"

const US_STATES = [
  { abbr: "AL", name: "Alabama", events: 12 },
  { abbr: "AK", name: "Alaska", events: 3 },
  { abbr: "AZ", name: "Arizona", events: 45 },
  { abbr: "AR", name: "Arkansas", events: 8 },
  { abbr: "CA", name: "California", events: 128 },
  { abbr: "CO", name: "Colorado", events: 34 },
  { abbr: "CT", name: "Connecticut", events: 15 },
  { abbr: "DE", name: "Delaware", events: 5 },
  { abbr: "FL", name: "Florida", events: 156 },
  { abbr: "GA", name: "Georgia", events: 28 },
  { abbr: "HI", name: "Hawaii", events: 8 },
  { abbr: "ID", name: "Idaho", events: 11 },
  { abbr: "IL", name: "Illinois", events: 22 },
  { abbr: "IN", name: "Indiana", events: 14 },
  { abbr: "IA", name: "Iowa", events: 9 },
  { abbr: "KS", name: "Kansas", events: 7 },
  { abbr: "KY", name: "Kentucky", events: 10 },
  { abbr: "LA", name: "Louisiana", events: 11 },
  { abbr: "ME", name: "Maine", events: 6 },
  { abbr: "MD", name: "Maryland", events: 18 },
  { abbr: "MA", name: "Massachusetts", events: 21 },
  { abbr: "MI", name: "Michigan", events: 19 },
  { abbr: "MN", name: "Minnesota", events: 16 },
  { abbr: "MS", name: "Mississippi", events: 6 },
  { abbr: "MO", name: "Missouri", events: 12 },
  { abbr: "MT", name: "Montana", events: 5 },
  { abbr: "NE", name: "Nebraska", events: 7 },
  { abbr: "NV", name: "Nevada", events: 22 },
  { abbr: "NH", name: "New Hampshire", events: 8 },
  { abbr: "NJ", name: "New Jersey", events: 24 },
  { abbr: "NM", name: "New Mexico", events: 9 },
  { abbr: "NY", name: "New York", events: 35 },
  { abbr: "NC", name: "North Carolina", events: 26 },
  { abbr: "ND", name: "North Dakota", events: 4 },
  { abbr: "OH", name: "Ohio", events: 23 },
  { abbr: "OK", name: "Oklahoma", events: 10 },
  { abbr: "OR", name: "Oregon", events: 18 },
  { abbr: "PA", name: "Pennsylvania", events: 27 },
  { abbr: "RI", name: "Rhode Island", events: 5 },
  { abbr: "SC", name: "South Carolina", events: 19 },
  { abbr: "SD", name: "South Dakota", events: 4 },
  { abbr: "TN", name: "Tennessee", events: 17 },
  { abbr: "TX", name: "Texas", events: 89 },
  { abbr: "UT", name: "Utah", events: 21 },
  { abbr: "VT", name: "Vermont", events: 5 },
  { abbr: "VA", name: "Virginia", events: 22 },
  { abbr: "WA", name: "Washington", events: 28 },
  { abbr: "WV", name: "West Virginia", events: 5 },
  { abbr: "WI", name: "Wisconsin", events: 14 },
  { abbr: "WY", name: "Wyoming", events: 3 },
]

const CATEGORIES = [
  {
    id: "championship",
    title: "Championship Events",
    description: "Pro & Elite tournaments featuring Grand Slam Series",
    icon: Trophy,
    href: "/tournaments/championship",
    color: "from-yellow-500 to-orange-600",
    count: 48,
  },
  {
    id: "amateur",
    title: "Amateur Competitions",
    description: "Open to all skill levels - find your perfect match",
    icon: Target,
    href: "/tournaments/amateur",
    color: "from-blue-500 to-cyan-600",
    count: 234,
  },
  {
    id: "rising-stars",
    title: "Rising Stars Program",
    description: "Junior development - nurturing future champions",
    icon: Star,
    href: "/tournaments/rising-stars",
    color: "from-purple-500 to-pink-600",
    count: 56,
  },
  {
    id: "community-leagues",
    title: "Community League Network",
    description: "Grassroots team competitions across the nation",
    icon: Users,
    href: "/tournaments/community-leagues",
    color: "from-green-500 to-emerald-600",
    count: 189,
  },
  {
    id: "charity",
    title: "Pickleball for Purpose",
    description: "Charity events - play with purpose, make a difference",
    icon: Heart,
    href: "/tournaments/pickleball-for-purpose",
    color: "from-red-500 to-pink-600",
    count: 67,
  },
  {
    id: "calendar",
    title: "Event Calendar",
    description: "Interactive map & calendar - plan your journey",
    icon: Calendar,
    href: "/tournaments/calendar",
    color: "from-indigo-500 to-violet-600",
    count: 594,
  },
]

interface Tournament {
  id: string
  name: string
  location: string
  startDate: string
  endDate?: string
  prizePool?: number
  type?: string
  featured?: boolean
  registrationOpen?: boolean
}

interface TournamentStats {
  totalTournaments: number
  totalPrize: number
  statesCovered: number
  dateRange?: string
}

export function TournamentHub() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState("all")
  const [isClient, setIsClient] = useState(false)
  const [featuredTournaments, setFeaturedTournaments] = useState<Tournament[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Tournament[]>([])
  const [stats, setStats] = useState<TournamentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Calculate min and max event counts for gradient scaling
  const minEvents = Math.min(...US_STATES.map(s => s.events))
  const maxEvents = Math.max(...US_STATES.map(s => s.events))

  // Generate gradient color based on event count
  const getStateGradient = (eventCount: number) => {
    // Normalize the event count to 0-1 scale
    const normalized = (eventCount - minEvents) / (maxEvents - minEvents)
    
    // Define color stops for a cool-to-warm gradient
    // Low activity: Deep blue/purple (cool)
    // Medium-low: Cyan/teal
    // Medium: Green/emerald
    // Medium-high: Yellow/lime
    // High: Orange/amber
    // Very high: Red/rose (warm)
    
    if (normalized < 0.15) {
      // Very low: Deep blue to purple
      return {
        from: "from-blue-900/80",
        to: "to-purple-800/80",
        border: "border-blue-700/40",
        text: "text-blue-200",
        glow: "shadow-blue-500/20"
      }
    } else if (normalized < 0.3) {
      // Low: Purple to indigo
      return {
        from: "from-purple-800/80",
        to: "to-indigo-700/80",
        border: "border-purple-600/40",
        text: "text-purple-200",
        glow: "shadow-purple-500/20"
      }
    } else if (normalized < 0.45) {
      // Medium-low: Indigo to cyan
      return {
        from: "from-indigo-700/80",
        to: "to-cyan-600/80",
        border: "border-indigo-600/40",
        text: "text-cyan-200",
        glow: "shadow-cyan-500/20"
      }
    } else if (normalized < 0.6) {
      // Medium: Cyan to teal
      return {
        from: "from-cyan-600/80",
        to: "to-teal-600/80",
        border: "border-cyan-500/40",
        text: "text-cyan-100",
        glow: "shadow-teal-500/30"
      }
    } else if (normalized < 0.75) {
      // Medium-high: Teal to green
      return {
        from: "from-teal-600/80",
        to: "to-emerald-500/80",
        border: "border-emerald-500/40",
        text: "text-emerald-100",
        glow: "shadow-emerald-500/30"
      }
    } else if (normalized < 0.85) {
      // High: Green to yellow
      return {
        from: "from-emerald-500/80",
        to: "to-yellow-500/80",
        border: "border-yellow-500/40",
        text: "text-yellow-100",
        glow: "shadow-yellow-500/40"
      }
    } else if (normalized < 0.95) {
      // Very high: Yellow to orange
      return {
        from: "from-yellow-500/80",
        to: "to-orange-500/80",
        border: "border-orange-500/50",
        text: "text-orange-100",
        glow: "shadow-orange-500/50"
      }
    } else {
      // Extreme: Orange to red (hotspots)
      return {
        from: "from-orange-500/90",
        to: "to-red-500/90",
        border: "border-red-500/60",
        text: "text-red-100",
        glow: "shadow-red-500/60"
      }
    }
  }

  useEffect(() => {
    setIsClient(true)
    fetchTournamentData()
  }, [])

  const fetchTournamentData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch featured tournaments
      const featuredRes = await fetch('/api/tournaments/featured')
      if (!featuredRes?.ok) throw new Error('Failed to fetch featured tournaments')
      const featuredData = await featuredRes?.json()
      setFeaturedTournaments(featuredData?.tournaments || [])

      // Fetch stats
      const statsRes = await fetch('/api/tournaments/stats')
      if (!statsRes?.ok) throw new Error('Failed to fetch stats')
      const statsData = await statsRes?.json()
      setStats(statsData || null)

      // Fetch upcoming events (first 3 tournaments)
      const upcomingRes = await fetch('/api/tournaments?limit=3')
      if (!upcomingRes?.ok) throw new Error('Failed to fetch upcoming events')
      const upcomingData = await upcomingRes?.json()
      setUpcomingEvents(upcomingData?.tournaments || [])
    } catch (err) {
      console.error('Error fetching tournament data:', err)
      setError(err?.message || 'Failed to load tournament data')
    } finally {
      setLoading(false)
    }
  }

  const filteredStates = US_STATES?.filter?.(state =>
    state?.name?.toLowerCase?.()?.includes?.(searchQuery?.toLowerCase?.() || '') ||
    state?.abbr?.toLowerCase?.()?.includes?.(searchQuery?.toLowerCase?.() || '')
  ) || []

  const formatDate = (startDate: string, endDate?: string) => {
    if (!startDate) return 'Date TBA'
    const start = new Date(startDate)
    const month = start?.toLocaleDateString?.('en-US', { month: 'short' })
    const day = start?.getDate?.()
    const year = start?.getFullYear?.()
    
    if (endDate) {
      const end = new Date(endDate)
      const endDay = end?.getDate?.()
      return `${month} ${day}-${endDay}, ${year}`
    }
    return `${month} ${day}, ${year}`
  }

  const STATS_DISPLAY = [
    { label: "Total Events", value: stats?.totalTournaments?.toString?.() || "0", icon: Calendar },
    { label: "States Covered", value: stats?.statesCovered?.toString?.() || "0", icon: Globe },
    { label: "Active Players", value: "125K+", icon: Users },
    { label: "Prize Money", value: stats?.totalPrize ? formatPrizeMoney(stats?.totalPrize) : "$0", icon: Award },
  ]

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-champion-green/20 via-transparent to-champion-gold/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-champion-green/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-champion-gold/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-champion-green/20 text-champion-green border-champion-green/30">
              <Radio className="w-3 h-3 mr-1 animate-pulse" />
              Live Tournament Data
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Tournament <span className="bg-gradient-to-r from-champion-green to-champion-gold bg-clip-text text-transparent">Hub</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              Discover pickleball tournaments across the nation. From Championship Events to Community Leagues - your champion journey starts here.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            {loading ? (
              <div className="col-span-full text-center py-8">
                <Loader2 className="w-8 h-8 text-champion-green mx-auto animate-spin" />
                <p className="text-gray-400 mt-2">Loading tournament data...</p>
              </div>
            ) : (
              STATS_DISPLAY?.map?.((stat, index) => (
                <div
                  key={stat?.label}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center"
                >
                  <stat.icon className="w-5 h-5 text-champion-green mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat?.value}</div>
                  <div className="text-sm text-gray-400">{stat?.label}</div>
                </div>
              )) || []
            )}
          </motion.div>

          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search tournaments, locations, or events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value || '')}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white h-12">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="championship">Championship</SelectItem>
                <SelectItem value="amateur">Amateur</SelectItem>
                <SelectItem value="junior">Rising Stars</SelectItem>
                <SelectItem value="league">Community League</SelectItem>
                <SelectItem value="charity">Charity</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-champion-green hover:bg-champion-green/90 h-12">
              <Filter className="w-4 h-4 mr-2" />
              Find Events
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Featured Tournaments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Featured Tournaments</h2>
            <p className="text-gray-400">Don't miss these premier events</p>
          </div>
          <Link href="/tournaments/calendar">
            <Button variant="outline" className="border-champion-green/50 text-champion-green hover:bg-champion-green/10">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-champion-green mx-auto animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
            <Button onClick={fetchTournamentData} className="mt-4 bg-champion-green hover:bg-champion-green/90">
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {featuredTournaments?.slice?.(0, 3)?.map?.((tournament, index) => (
              <motion.div
                key={tournament?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10 overflow-hidden group hover:border-champion-green/50 transition-all">
                  <div className="relative h-48">
                    <img
                      src={[
                        "https://images.unsplash.com/photo-1693142517868-aa71e2df4b42?w=800&q=80",
                        "https://images.unsplash.com/photo-1693142518230-f049c9fc1ad2?w=800&q=80",
                        "https://images.unsplash.com/photo-1659318006095-4d44845f3a1b?w=800&q=80"
                      ][index % 3]}
                      alt={tournament?.name || 'Tournament'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    {tournament?.featured && (
                      <Badge className="absolute top-3 left-3 bg-champion-green text-white">
                        <Star className="w-3 h-3 mr-1" /> FEATURED
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-white mb-2 line-clamp-1">{tournament?.name || 'Untitled Tournament'}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {tournament?.location || 'TBA'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(tournament?.startDate, tournament?.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-champion-gold font-semibold">
                        {tournament?.prizePool ? formatPrizeMoney(tournament?.prizePool) : 'Prize TBA'}
                      </div>
                      <a href="https://pickleballtournaments.com/" target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="bg-champion-green hover:bg-champion-green/90">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Register
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )) || []}
          </div>
        )}
      </section>

      {/* Tournament Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Explore by Category</h2>
          <p className="text-gray-400">Find the perfect competition for your skill level and goals</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES?.map?.((category, index) => (
            <motion.div
              key={category?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={category?.href || '#'}>
                <Card className="bg-white/5 border-white/10 hover:border-white/30 transition-all group cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category?.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{category?.title}</h3>
                    <p className="text-sm text-gray-400 mb-4">{category?.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-white/20 text-gray-300">
                        {category?.count} events
                      </Badge>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-champion-green group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )) || []}
        </div>
      </section>

      {/* Interactive State Selector */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Find Events by State</h2>
              <p className="text-gray-400">Browse tournaments across all 50 states</p>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search states..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value || '')}
                className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {filteredStates?.slice?.(0, 24)?.map?.((state) => {
              const gradient = getStateGradient(state?.events || 0)
              return (
                <motion.button
                  key={state?.abbr}
                  onClick={() => setSelectedState(state?.abbr || null)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-lg border transition-all text-center relative overflow-hidden group ${
                    selectedState === state?.abbr
                      ? "bg-champion-green border-champion-green text-white shadow-lg shadow-champion-green/50"
                      : `bg-gradient-to-br ${gradient.from} ${gradient.to} ${gradient.border} ${gradient.glow} hover:scale-105 shadow-lg backdrop-blur-sm`
                  }`}
                >
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  
                  <div className={`text-lg font-bold relative z-10 ${selectedState === state?.abbr ? 'text-white' : gradient.text}`}>
                    {state?.abbr}
                  </div>
                  <div className={`text-xs relative z-10 ${selectedState === state?.abbr ? 'text-white/80' : 'text-white/70'}`}>
                    {state?.events} events
                  </div>
                </motion.button>
              )
            }) || []}
          </div>

          {/* Color Legend */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <TrendingUp className="w-4 h-4 text-champion-green" />
              <span className="font-medium text-gray-300">Tournament Activity:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-900 to-purple-800" />
                <span className="text-xs text-gray-400">Low</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-700 to-cyan-600" />
                <span className="text-xs text-gray-400">Medium</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500" />
                <span className="text-xs text-gray-400">High</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500" />
                <span className="text-xs text-gray-400">Very High</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500" />
                <span className="text-xs text-gray-400">Hotspot</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/tournaments/calendar">
              <Button variant="outline" className="border-champion-green/50 text-champion-green hover:bg-champion-green/10">
                <Globe className="w-4 h-4 mr-2" />
                View Interactive Map
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>
            <p className="text-gray-400">Registration open now</p>
          </div>
          <Link href="/tournaments/calendar">
            <Button variant="ghost" className="text-champion-green hover:text-champion-green/80">
              See All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-champion-green mx-auto animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents?.map?.((event, index) => (
              <motion.div
                key={event?.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-champion-green/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-500/20">
                    <Trophy className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{event?.name || 'Untitled Event'}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event?.location || 'TBA'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(event?.startDate, event?.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {event?.registrationOpen ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Open for Registration
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                      Registration Closed
                    </Badge>
                  )}
                  <a href="https://pickleballtournaments.com/" target="_blank" rel="noopener noreferrer">
                    <Button
                      size="sm"
                      className="bg-champion-green hover:bg-champion-green/90"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      {event?.registrationOpen ? "Register" : "View Details"}
                    </Button>
                  </a>
                </div>
              </motion.div>
            )) || []}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-gradient-to-r from-champion-green/20 to-champion-gold/20 rounded-2xl border border-white/10 p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Start Your Champion Journey?
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Join thousands of players competing in tournaments across the nation. Whether you're a beginner or a pro, there's a perfect competition waiting for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tournaments/calendar">
              <Button size="lg" className="bg-champion-green hover:bg-champion-green/90 w-full sm:w-auto">
                <Calendar className="w-5 h-5 mr-2" />
                Browse All Events
              </Button>
            </Link>
            <Link href="/tournaments/amateur">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                <Target className="w-5 h-5 mr-2" />
                Find My Level
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links to Tournament Finders */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">Find Tournaments on Official Sites</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="https://pickleballtournaments.com/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-champion-green/50 text-champion-green hover:bg-champion-green/10">
                <ExternalLink className="w-4 h-4 mr-2" /> PickleballTournaments.com
              </Button>
            </a>
            <a href="https://pickleballbrackets.com/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                <ExternalLink className="w-4 h-4 mr-2" /> PickleballBrackets.com
              </Button>
            </a>
            <a href="https://ppatour.com/schedule/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10">
                <ExternalLink className="w-4 h-4 mr-2" /> PPA Tour
              </Button>
            </a>
            <a href="https://www.theapp.global/schedule" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10">
                <ExternalLink className="w-4 h-4 mr-2" /> APP Tour
              </Button>
            </a>
            <a href="https://usapickleball.org/events/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                <ExternalLink className="w-4 h-4 mr-2" /> USA Pickleball
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Data Source Footer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="text-center text-sm text-gray-500">
          <p>Tournament data from official pickleball organizations</p>
          <p className="mt-1">Last updated: {new Date()?.toLocaleDateString?.()}</p>
        </div>
      </section>
    </div>
  )
}
