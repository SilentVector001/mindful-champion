"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Star,
  Calendar,
  MapPin,
  Users,
  ChevronLeft,
  Award,
  GraduationCap,
  ArrowRight,
  Trophy,
  Sparkles,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrizeMoney } from "@/lib/utils/currency"

interface Tournament {
  id: string
  name: string
  location: string
  startDate: string
  endDate?: string
  prizePool?: number
  type?: string
  featured?: boolean
}

const PATHWAY_STAGES = [
  {
    stage: "Starter",
    ages: "6-10",
    description: "Introduction to pickleball fundamentals",
    color: "from-green-500 to-emerald-600",
  },
  {
    stage: "Developer",
    ages: "10-14",
    description: "Building competitive skills and strategy",
    color: "from-blue-500 to-cyan-600",
  },
  {
    stage: "Competitor",
    ages: "14-18",
    description: "Tournament experience and ranking",
    color: "from-purple-500 to-pink-600",
  },
  {
    stage: "Elite",
    ages: "16-18",
    description: "College scholarships and pro pathway",
    color: "from-yellow-500 to-orange-600",
  },
]

export function RisingStars() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJuniorEvents()
  }, [])

  const fetchJuniorEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch junior/youth tournaments
      const res = await fetch('/api/tournaments')
      if (!res?.ok) throw new Error('Failed to fetch tournaments')
      const data = await res?.json()
      
      // For now, show all tournaments (can be filtered by type='junior' if field exists)
      setTournaments(data?.tournaments || [])
    } catch (err) {
      console.error('Error fetching junior events:', err)
      setError(err?.message || 'Failed to load Rising Stars programs')
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

  return (
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <Link href="/tournaments" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Tournament Hub
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Star className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Rising Stars Program</h1>
              <p className="text-gray-400">Nurturing the next generation of pickleball champions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Development Pathway */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Champion Development Pathway</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {PATHWAY_STAGES?.map?.((stage, index) => (
            <motion.div
              key={stage?.stage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10 h-full">
                <CardContent className="p-5">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stage?.color} flex items-center justify-center mb-4`}>
                    <span className="text-xl font-bold text-white">{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{stage?.stage}</h3>
                  <Badge variant="outline" className="border-white/20 text-gray-400 mb-2">
                    Ages {stage?.ages}
                  </Badge>
                  <p className="text-sm text-gray-400">{stage?.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          )) || []}
        </div>
      </section>

      {/* Junior Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Upcoming Junior Events</h2>
        
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-champion-green mx-auto animate-spin" />
            <p className="text-gray-400 mt-4">Loading junior events...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={fetchJuniorEvents} className="bg-champion-green hover:bg-champion-green/90">
              Retry
            </Button>
          </div>
        ) : tournaments?.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No junior events available at this time. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments?.slice?.(0, 6)?.map?.((event, index) => (
              <motion.div
                key={event?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`bg-white/5 border-white/10 h-full ${
                  event?.featured ? "ring-2 ring-purple-500/50" : ""
                }`}>
                  <CardContent className="p-6">
                    {event?.featured && (
                      <Badge className="mb-3 bg-purple-500/20 text-purple-400 border-purple-500/30">
                        <Sparkles className="w-3 h-3 mr-1" /> Featured Event
                      </Badge>
                    )}
                    <h3 className="text-lg font-semibold text-white mb-3">{event?.name || 'Junior Tournament'}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
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
                      <Badge className="mb-4 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        <GraduationCap className="w-3 h-3 mr-1" /> {formatPrizeMoney(event?.prizePool)}
                      </Badge>
                    )}
                    <Button className="w-full bg-purple-500 hover:bg-purple-600">
                      Register <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )) || []}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-white/10 p-8 text-center">
          <GraduationCap className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Scholarship Opportunities</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-6">
            Top junior players can earn college scholarships through our Rising Stars program. Start your champion journey today.
          </p>
          <Button className="bg-purple-500 hover:bg-purple-600">
            Learn About Scholarships
          </Button>
        </div>
      </section>
    </div>
  )
}
