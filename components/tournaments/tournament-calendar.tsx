"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  List,
  Grid,
  Trophy,
  Star,
  Heart,
  Users,
  Globe,
  Loader2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatPrizeMoney } from "@/lib/utils/currency"

const MONTHS = ["January", "February", "March", "April", "May", "June"]
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// All US states for the filter dropdown
const US_STATES = [
  { abbr: "AL", name: "Alabama" }, { abbr: "AK", name: "Alaska" }, { abbr: "AZ", name: "Arizona" },
  { abbr: "AR", name: "Arkansas" }, { abbr: "CA", name: "California" }, { abbr: "CO", name: "Colorado" },
  { abbr: "CT", name: "Connecticut" }, { abbr: "DE", name: "Delaware" }, { abbr: "FL", name: "Florida" },
  { abbr: "GA", name: "Georgia" }, { abbr: "HI", name: "Hawaii" }, { abbr: "ID", name: "Idaho" },
  { abbr: "IL", name: "Illinois" }, { abbr: "IN", name: "Indiana" }, { abbr: "IA", name: "Iowa" },
  { abbr: "KS", name: "Kansas" }, { abbr: "KY", name: "Kentucky" }, { abbr: "LA", name: "Louisiana" },
  { abbr: "ME", name: "Maine" }, { abbr: "MD", name: "Maryland" }, { abbr: "MA", name: "Massachusetts" },
  { abbr: "MI", name: "Michigan" }, { abbr: "MN", name: "Minnesota" }, { abbr: "MS", name: "Mississippi" },
  { abbr: "MO", name: "Missouri" }, { abbr: "MT", name: "Montana" }, { abbr: "NE", name: "Nebraska" },
  { abbr: "NV", name: "Nevada" }, { abbr: "NH", name: "New Hampshire" }, { abbr: "NJ", name: "New Jersey" },
  { abbr: "NM", name: "New Mexico" }, { abbr: "NY", name: "New York" }, { abbr: "NC", name: "North Carolina" },
  { abbr: "ND", name: "North Dakota" }, { abbr: "OH", name: "Ohio" }, { abbr: "OK", name: "Oklahoma" },
  { abbr: "OR", name: "Oregon" }, { abbr: "PA", name: "Pennsylvania" }, { abbr: "RI", name: "Rhode Island" },
  { abbr: "SC", name: "South Carolina" }, { abbr: "SD", name: "South Dakota" }, { abbr: "TN", name: "Tennessee" },
  { abbr: "TX", name: "Texas" }, { abbr: "UT", name: "Utah" }, { abbr: "VT", name: "Vermont" },
  { abbr: "VA", name: "Virginia" }, { abbr: "WA", name: "Washington" }, { abbr: "WV", name: "West Virginia" },
  { abbr: "WI", name: "Wisconsin" }, { abbr: "WY", name: "Wyoming" },
]

interface Tournament {
  id: string
  name: string
  location: string
  startDate: string
  endDate?: string
  prizePool?: number
  type?: string
}

interface TournamentCalendarProps {
  initialState?: string | null
  initialType?: string | null
  initialQuery?: string | null
}

const TYPE_CONFIG: Record<string, { icon: typeof Trophy; color: string; label: string }> = {
  championship: { icon: Trophy, color: "text-yellow-400 bg-yellow-500/20", label: "Championship" },
  amateur: { icon: Trophy, color: "text-blue-400 bg-blue-500/20", label: "Amateur" },
  junior: { icon: Star, color: "text-purple-400 bg-purple-500/20", label: "Rising Stars" },
  league: { icon: Users, color: "text-green-400 bg-green-500/20", label: "League" },
  charity: { icon: Heart, color: "text-pink-400 bg-pink-500/20", label: "Charity" },
}

export function TournamentCalendar({ initialState, initialType, initialQuery }: TournamentCalendarProps) {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(0)
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list")
  const [selectedType, setSelectedType] = useState(initialType || "all")
  const [selectedState, setSelectedState] = useState(initialState || "all")
  const [searchQuery, setSearchQuery] = useState(initialQuery || "")
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllTournaments()
  }, [])

  const fetchAllTournaments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch('/api/tournaments')
      if (!res?.ok) throw new Error('Failed to fetch tournaments')
      const data = await res?.json()
      
      setTournaments(data?.tournaments || [])
    } catch (err) {
      console.error('Error fetching tournaments:', err)
      setError(err?.message || 'Failed to load tournament calendar')
    } finally {
      setLoading(false)
    }
  }

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

  const filteredEvents = tournaments?.filter?.(event => {
    const matchesType = selectedType === "all" || event?.type === selectedType
    // State filtering - check if location contains state abbreviation or full name
    const matchesState = selectedState === "all" || 
      event?.location?.includes?.(selectedState) || 
      event?.location?.includes?.(US_STATES.find(s => s.abbr === selectedState)?.name || '')
    // Search query matching
    const matchesSearch = !searchQuery || 
      event?.name?.toLowerCase?.()?.includes?.(searchQuery?.toLowerCase?.()) ||
      event?.location?.toLowerCase?.()?.includes?.(searchQuery?.toLowerCase?.())
    return matchesType && matchesState && matchesSearch
  }) || []

  // Get the state name for display
  const selectedStateName = selectedState !== "all" 
    ? US_STATES.find(s => s.abbr === selectedState)?.name || selectedState 
    : null

  // Update URL when filters change
  const updateFilters = (newState: string, newType: string) => {
    const params = new URLSearchParams()
    if (newState !== "all") params.set("state", newState)
    if (newType !== "all") params.set("type", newType)
    if (searchQuery) params.set("q", searchQuery)
    const queryString = params.toString()
    router.push(`/tournaments/calendar${queryString ? `?${queryString}` : ''}`, { scroll: false })
  }

  const clearFilters = () => {
    setSelectedState("all")
    setSelectedType("all")
    setSearchQuery("")
    router.push('/tournaments/calendar', { scroll: false })
  }

  const getDaysInMonth = () => {
    const days = []
    for (let i = 1; i <= 31; i++) {
      // Match tournaments to calendar days
      const eventsOnDay = tournaments?.filter?.(t => {
        const date = new Date(t?.startDate)
        return date?.getDate?.() === i && date?.getMonth?.() === currentMonth
      }) || []
      days.push({ day: i, events: eventsOnDay })
    }
    return days
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <Link href="/tournaments" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Tournament Hub
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Event Calendar</h1>
              <p className="text-gray-400">Browse all tournaments across the nation</p>
            </div>
          </div>

          {/* Active Filter Badge */}
          {(selectedState !== "all" || selectedType !== "all" || searchQuery) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-2 flex-wrap"
            >
              <span className="text-sm text-gray-400">Active filters:</span>
              {selectedStateName && (
                <Badge className="bg-champion-green/20 text-champion-green border-champion-green/30 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedStateName}
                  <button onClick={() => { setSelectedState("all"); updateFilters("all", selectedType); }} className="ml-1 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedType !== "all" && (
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 flex items-center gap-1">
                  {TYPE_CONFIG[selectedType]?.label || selectedType}
                  <button onClick={() => { setSelectedType("all"); updateFilters(selectedState, "all"); }} className="ml-1 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 flex items-center gap-1">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              <Button size="sm" variant="ghost" onClick={clearFilters} className="text-gray-400 hover:text-white text-xs">
                Clear all
              </Button>
            </motion.div>
          )}

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 md:flex-none md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search tournaments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value || '')}
                className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <Select value={selectedType} onValueChange={(val) => { setSelectedType(val); updateFilters(selectedState, val); }}>
              <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="championship">Championship</SelectItem>
                <SelectItem value="amateur">Amateur</SelectItem>
                <SelectItem value="junior">Rising Stars</SelectItem>
                <SelectItem value="league">Community League</SelectItem>
                <SelectItem value="charity">Charity</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedState} onValueChange={(val) => { setSelectedState(val); updateFilters(val, selectedType); }}>
              <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                <SelectItem value="all">All States</SelectItem>
                {US_STATES?.map?.((state) => (
                  <SelectItem key={state?.abbr} value={state?.abbr}>{state?.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 ml-auto">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-champion-green" : "border-white/20 text-white"}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("calendar")}
                className={viewMode === "calendar" ? "bg-champion-green" : "border-white/20 text-white"}
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-400 mb-4">
            Showing {filteredEvents?.length || 0} tournament{filteredEvents?.length !== 1 ? 's' : ''}
            {selectedStateName && ` in ${selectedStateName}`}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-champion-green mx-auto animate-spin" />
            <p className="text-gray-400 mt-4">Loading tournament calendar...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={fetchAllTournaments} className="bg-champion-green hover:bg-champion-green/90">
              Retry
            </Button>
          </div>
        ) : viewMode === "list" ? (
          <div className="space-y-4">
            {filteredEvents?.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No events found</h3>
                <p className="text-gray-400">Try adjusting your filters</p>
              </div>
            ) : (
              filteredEvents?.map?.((event, index) => {
                const config = TYPE_CONFIG[event?.type || 'amateur'] || TYPE_CONFIG.amateur
                const Icon = config.icon
                return (
                  <motion.div
                    key={event?.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-500/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{event?.name || 'Untitled Tournament'}</h3>
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
                    <div className="flex items-center gap-3">
                      <Badge className={config.color}>{config.label}</Badge>
                      {event?.prizePool && (
                        <span className="text-sm font-semibold text-indigo-400">
                          {formatPrizeMoney(event?.prizePool)}
                        </span>
                      )}
                      <Link href={`/tournaments/${event?.id}`}>
                        <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                )
              }) || []
            )}
          </div>
        ) : (
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={() => setCurrentMonth(Math.max(0, currentMonth - 1))} className="text-white">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-bold text-white">{MONTHS[currentMonth] || 'January'} 2025</h2>
              <Button variant="ghost" onClick={() => setCurrentMonth(Math.min(5, currentMonth + 1))} className="text-white">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS?.map?.(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                  {day}
                </div>
              )) || []}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth()?.map?.(({ day, events }) => (
                <div
                  key={day}
                  className={`min-h-[80px] rounded-lg p-2 border ${
                    events?.length > 0
                      ? "border-indigo-500/30 bg-indigo-500/10"
                      : "border-white/5 bg-white/5"
                  }`}
                >
                  <span className="text-sm text-gray-400">{day}</span>
                  {events?.slice?.(0, 2)?.map?.((event, i) => {
                    const config = TYPE_CONFIG[event?.type || 'amateur'] || TYPE_CONFIG.amateur
                    return (
                      <div
                        key={i}
                        className={`mt-1 text-xs px-1 py-0.5 rounded truncate ${config.color}`}
                        title={event?.name}
                      >
                        {event?.name}
                      </div>
                    )
                  }) || []}
                </div>
              )) || []}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-white/10">
              {Object.entries(TYPE_CONFIG)?.map?.(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${config.color}`} />
                  <span className="text-sm text-gray-400">{config.label}</span>
                </div>
              )) || []}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
