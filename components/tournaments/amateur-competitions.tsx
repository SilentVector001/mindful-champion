"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  ChevronLeft,
  Target,
  Filter,
  Search,
  ArrowRight,
  Loader2,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatPrizeMoney } from "@/lib/utils/currency"

const SKILL_LEVELS = ["2.5", "3.0", "3.5", "4.0", "4.5", "5.0"]

// Real APP Next Gen & PPA Amateur events
const SAMPLE_TOURNAMENTS = [
  {
    id: "app-next-san-antonio-2025",
    name: "APP Next San Antonio",
    location: "San Antonio, TX",
    startDate: "2025-02-13",
    endDate: "2025-02-16",
    prizePool: 10000,
    entryFee: 75,
    skillLevel: "3.0-5.0",
    maxParticipants: 100,
    registrationUrl: "https://www.theapp.global/tour",
  },
  {
    id: "app-collegiate-2025",
    name: "APP U.S. Collegiate Championships",
    location: "Cape Coral, FL",
    startDate: "2025-03-28",
    endDate: "2025-03-30",
    prizePool: 15000,
    entryFee: 50,
    skillLevel: "College",
    maxParticipants: 128,
    registrationUrl: "https://www.theapp.global/tour-schedule/2025-app-us-collegiate-championships",
  },
  {
    id: "app-next-st-louis-2025",
    name: "APP Next St. Louis",
    location: "St. Louis, MO",
    startDate: "2025-06-19",
    endDate: "2025-06-22",
    prizePool: 10000,
    entryFee: 75,
    skillLevel: "3.0-5.0",
    maxParticipants: 100,
    registrationUrl: "https://www.theapp.global/tour",
  },
  {
    id: "app-next-kansas-city-2025",
    name: "APP Next Kansas City",
    location: "Overland Park, KS",
    startDate: "2025-07-17",
    endDate: "2025-07-20",
    prizePool: 10000,
    entryFee: 75,
    skillLevel: "3.0-5.0",
    maxParticipants: 100,
    registrationUrl: "https://www.theapp.global/tour",
  },
  {
    id: "ppa-wisconsin-2025",
    name: "Wisconsin PPA Challenger",
    location: "Eau Claire, WI",
    startDate: "2025-07-24",
    endDate: "2025-07-27",
    prizePool: 25000,
    entryFee: 85,
    skillLevel: "3.0-5.0+",
    maxParticipants: 200,
    registrationUrl: "https://ppatour.com/tournament/2025/2025-eau-claire-wi/",
  },
  {
    id: "app-next-dallas-2025",
    name: "APP Next Dallas",
    location: "Grapevine, TX",
    startDate: "2025-10-30",
    endDate: "2025-11-02",
    prizePool: 10000,
    entryFee: 75,
    skillLevel: "3.0-5.0",
    maxParticipants: 100,
    registrationUrl: "https://www.theapp.global/tour",
  },
  {
    id: "app-next-ft-lauderdale-2025",
    name: "APP Next Fort Lauderdale",
    location: "Fort Lauderdale, FL",
    startDate: "2025-12-05",
    endDate: "2025-12-07",
    prizePool: 10000,
    entryFee: 75,
    skillLevel: "3.0-5.0",
    maxParticipants: 100,
    registrationUrl: "https://www.theapp.global/tour",
  },
  {
    id: "ppa-citrus-classic-2025",
    name: "Citrus Classic PPA Challenger",
    location: "Kissimmee, FL",
    startDate: "2025-09-05",
    endDate: "2025-09-07",
    prizePool: 25000,
    entryFee: 85,
    skillLevel: "3.0-5.0+",
    maxParticipants: 200,
    registrationUrl: "https://ppatour.com/tournament/2025/2025-orlando-fl/",
  },
  {
    id: "ppa-flower-city-2025",
    name: "PPA Flower City Challenger",
    location: "Fairport, NY",
    startDate: "2025-06-27",
    endDate: "2025-06-29",
    prizePool: 25000,
    entryFee: 85,
    skillLevel: "3.0-5.0+",
    maxParticipants: 200,
    registrationUrl: "https://ppatour.com/tournament/2025/2025-fairport-ny/",
  },
  {
    id: "ppa-daytona-2025",
    name: "Florida Dairy Farmers Daytona Beach Open",
    location: "Daytona Beach, FL",
    startDate: "2025-11-18",
    endDate: "2025-11-23",
    prizePool: 100000,
    entryFee: 100,
    skillLevel: "3.0-Pro",
    maxParticipants: 500,
    registrationUrl: "https://ppatour.com/schedule/",
  },
]

interface Tournament {
  id: string
  name: string
  location: string
  startDate: string
  endDate?: string
  prizePool?: number
  entryFee?: number
  skillLevel?: string
  maxParticipants?: number
  registrationUrl?: string
  type?: string
}

export function AmateurCompetitions() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [tournaments, setTournaments] = useState<Tournament[]>(SAMPLE_TOURNAMENTS)
  const [displayedTournaments, setDisplayedTournaments] = useState<Tournament[]>(SAMPLE_TOURNAMENTS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Try to fetch from API but fallback to sample data
    fetchAmateurEvents()
  }, [])

  const fetchAmateurEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch all tournaments and filter for amateur level (prize pool < $50k)
      const res = await fetch('/api/tournaments')
      if (!res?.ok) throw new Error('Failed to fetch tournaments')
      const data = await res?.json()
      
      // Filter for amateur level tournaments
      const amateur = data?.tournaments?.filter?.((t: Tournament) => 
        !t?.prizePool || t?.prizePool < 50000
      ) || []
      
      // Use API data if available, otherwise use sample data
      if (amateur.length > 0) {
        setTournaments(amateur)
        setDisplayedTournaments(amateur)
      } else {
        // Keep sample data if no API data
        setTournaments(SAMPLE_TOURNAMENTS)
        setDisplayedTournaments(SAMPLE_TOURNAMENTS)
      }
    } catch (err) {
      console.error('Error fetching amateur events:', err)
      // Use sample data on error
      setTournaments(SAMPLE_TOURNAMENTS)
      setDisplayedTournaments(SAMPLE_TOURNAMENTS)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    const filtered = tournaments.filter(event => {
      const matchesSearch = event?.name?.toLowerCase?.()?.includes?.(searchQuery?.toLowerCase?.() || '') ||
        event?.location?.toLowerCase?.()?.includes?.(searchQuery?.toLowerCase?.() || '')
      const matchesLevel = selectedLevel === 'all' || event?.skillLevel?.includes?.(selectedLevel)
      return matchesSearch && matchesLevel
    })
    setDisplayedTournaments(filtered)
  }

  useEffect(() => {
    // Auto-filter on change
    handleSearch()
  }, [searchQuery, selectedLevel])

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

  return (
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <Link href="/tournaments" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Tournament Hub
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Amateur Competitions</h1>
              <p className="text-gray-400">Find tournaments perfect for your skill level</p>
            </div>
          </div>

          {/* Skill Level Guide */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-4 mb-8">
            <h3 className="text-sm font-medium text-white mb-3">Skill Level Guide</h3>
            <div className="flex flex-wrap gap-2">
              {SKILL_LEVELS?.map?.(level => (
                <Badge
                  key={level}
                  variant="outline"
                  className={`border-blue-500/30 ${
                    parseFloat(level) <= 3.0 ? "text-green-400" :
                    parseFloat(level) <= 4.0 ? "text-blue-400" : "text-purple-400"
                  }`}
                >
                  {level} - {
                    parseFloat(level) <= 3.0 ? "Beginner" :
                    parseFloat(level) <= 3.5 ? "Intermediate" :
                    parseFloat(level) <= 4.0 ? "Advanced" :
                    parseFloat(level) <= 4.5 ? "Competitive" : "Elite"
                  }
                </Badge>
              )) || []}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by location, event name, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value || '')}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Skill Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {SKILL_LEVELS?.map?.(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                )) || []}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleSearch}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-8"
            >
              <Search className="w-4 h-4 mr-2" />
              Find Events
            </Button>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {displayedTournaments.length} Amateur Tournament{displayedTournaments.length !== 1 ? 's' : ''} Available
          </h2>
          <p className="text-gray-400">Find tournaments discovered thousands of tournaments nationwide</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-champion-green mx-auto animate-spin" />
            <p className="text-gray-400 mt-4">Loading amateur competitions...</p>
          </div>
        ) : displayedTournaments?.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No events found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your filters or search terms</p>
            <Button onClick={() => {
              setSearchQuery('')
              setSelectedLevel('all')
              setDisplayedTournaments(tournaments)
            }} className="bg-blue-500 hover:bg-blue-600">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedTournaments?.map?.((event, index) => (
              <motion.div
                key={event?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10 hover:border-blue-500/30 transition-all h-full group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-2 flex-wrap">
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          Amateur
                        </Badge>
                        {event?.skillLevel && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            {event.skillLevel}
                          </Badge>
                        )}
                      </div>
                      <span className="text-lg font-bold text-white">
                        ${event?.entryFee || 0}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">
                      {event?.name || 'Untitled Tournament'}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{event?.location || 'TBA'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{formatDate(event?.startDate, event?.endDate)}</span>
                      </div>
                      {event?.maxParticipants && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Users className="w-4 h-4 flex-shrink-0" />
                          <span>Max {event.maxParticipants} players</span>
                        </div>
                      )}
                    </div>
                    
                    {event?.prizePool && (
                      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-3 mb-4 border border-blue-500/20">
                        <div className="text-xs text-gray-400 mb-1">Prize Pool</div>
                        <div className="text-lg font-bold text-blue-400">
                          {formatPrizeMoney(event?.prizePool)}
                        </div>
                      </div>
                    )}
                    
                    <a 
                      href={event?.registrationUrl || "https://ppatour.com/schedule/"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white">
                        Register Now 
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            )) || []}
          </div>
        )}

        {/* External Tournament Finders */}
        <div className="mt-12 bg-white/5 rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Find More Amateur Tournaments</h3>
          <p className="text-gray-400 text-sm mb-4">Discover tournaments on official tour sites:</p>
          <div className="flex flex-wrap gap-3">
            <a href="https://ppatour.com/schedule/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                PPA Tour Schedule
              </Button>
            </a>
            <a href="https://www.theapp.global/tour" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10">
                APP Tour Events
              </Button>
            </a>
            <a href="https://usapickleball.org/events/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                USA Pickleball Events
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
