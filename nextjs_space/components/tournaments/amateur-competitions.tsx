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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatPrizeMoney } from "@/lib/utils/currency"

const SKILL_LEVELS = ["2.5", "3.0", "3.5", "4.0", "4.5", "5.0"]

interface Tournament {
  id: string
  name: string
  location: string
  startDate: string
  endDate?: string
  prizePool?: number
  entryFee?: number
  type?: string
}

export function AmateurCompetitions() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
      
      setTournaments(amateur)
    } catch (err) {
      console.error('Error fetching amateur events:', err)
      setError(err?.message || 'Failed to load amateur competitions')
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
    const matchesSearch = event?.name?.toLowerCase?.()?.includes?.(searchQuery?.toLowerCase?.() || '') ||
      event?.location?.toLowerCase?.()?.includes?.(searchQuery?.toLowerCase?.() || '')
    return matchesSearch
  }) || []

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

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search events or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value || '')}
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
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-champion-green mx-auto animate-spin" />
            <p className="text-gray-400 mt-4">Loading amateur competitions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={fetchAmateurEvents} className="bg-champion-green hover:bg-champion-green/90">
              Retry
            </Button>
          </div>
        ) : filteredEvents?.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No events found</h3>
            <p className="text-gray-400">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents?.map?.((event, index) => (
              <motion.div
                key={event?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10 hover:border-blue-500/30 transition-all h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        Amateur
                      </Badge>
                      <span className="text-lg font-bold text-white">
                        {event?.entryFee ? formatPrizeMoney(event?.entryFee) : 'Free'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{event?.name || 'Untitled Tournament'}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event?.location || 'TBA'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(event?.startDate, event?.endDate)}
                      </span>
                    </div>
                    {event?.prizePool && (
                      <div className="text-sm text-gray-400 mb-4">
                        Prize Pool: <span className="text-blue-400 font-semibold">{formatPrizeMoney(event?.prizePool)}</span>
                      </div>
                    )}
                    <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-600">
                      Register <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )) || []}
          </div>
        )}
      </section>
    </div>
  )
}
