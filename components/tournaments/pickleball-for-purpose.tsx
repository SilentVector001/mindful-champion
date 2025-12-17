"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Heart,
  Calendar,
  MapPin,
  ChevronLeft,
  DollarSign,
  Users,
  ArrowRight,
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
}

interface TournamentStats {
  totalTournaments: number
  totalPrize: number
}

export function PickleballForPurpose() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [stats, setStats] = useState<TournamentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCharityEvents()
  }, [])

  const fetchCharityEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch charity tournaments
      const res = await fetch('/api/tournaments')
      if (!res?.ok) throw new Error('Failed to fetch tournaments')
      const data = await res?.json()
      
      // For now, show all tournaments (can be filtered by type='charity' if field exists)
      setTournaments(data?.tournaments || [])
      
      // Fetch stats
      const statsRes = await fetch('/api/tournaments/stats')
      if (statsRes?.ok) {
        const statsData = await statsRes?.json()
        setStats(statsData || null)
      }
    } catch (err) {
      console.error('Error fetching charity events:', err)
      setError(err?.message || 'Failed to load Pickleball for Purpose events')
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

  const IMPACT_STATS = [
    { label: "Raised This Year", value: stats?.totalPrize ? formatPrizeMoney(stats?.totalPrize) : "$0" },
    { label: "Charity Events", value: tournaments?.length?.toString?.() || "0" },
    { label: "Causes Supported", value: "24" },
    { label: "Volunteers", value: "3,500+" },
  ]

  return (
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-pink-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <Link href="/tournaments" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Tournament Hub
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Pickleball for Purpose</h1>
              <p className="text-gray-400">Play with purpose, make a difference</p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <Loader2 className="w-8 h-8 text-champion-green mx-auto animate-spin" />
            </div>
          ) : (
            IMPACT_STATS?.map?.((stat, index) => (
              <motion.div
                key={stat?.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 rounded-xl border border-white/10 p-4 text-center"
              >
                <div className="text-2xl font-bold text-pink-400">{stat?.value}</div>
                <div className="text-sm text-gray-400">{stat?.label}</div>
              </motion.div>
            )) || []
          )}
        </div>
      </section>

      {/* Charity Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Upcoming Charity Events</h2>
        
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-champion-green mx-auto animate-spin" />
            <p className="text-gray-400 mt-4">Loading charity events...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={fetchCharityEvents} className="bg-champion-green hover:bg-champion-green/90">
              Retry
            </Button>
          </div>
        ) : tournaments?.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No charity events available at this time. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {tournaments?.slice?.(0, 6)?.map?.((event, index) => (
              <motion.div
                key={event?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10 hover:border-pink-500/30 transition-all overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative w-full md:w-40 h-32 md:h-auto flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400" alt="Charity Event" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50" />
                    </div>
                    <CardContent className="flex-1 p-4">
                      <Badge className="mb-2 bg-pink-500/20 text-pink-400 border-pink-500/30">
                        <Heart className="w-3 h-3 mr-1" /> Charity Event
                      </Badge>
                      <h3 className="font-semibold text-white mb-2">{event?.name || 'Charity Tournament'}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event?.location || 'TBA'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(event?.startDate, event?.endDate)}
                        </span>
                      </div>
                      {event?.prizePool && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Prize Pool</span>
                            <span className="text-pink-400 font-medium">{formatPrizeMoney(event?.prizePool)}</span>
                          </div>
                        </div>
                      )}
                      <Button size="sm" className="w-full bg-pink-500 hover:bg-pink-600">
                        Join Event
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            )) || []}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-2xl border border-white/10 p-8 text-center">
          <Sparkles className="w-12 h-12 text-pink-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Host a Charity Event</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-6">
            Partner with Mindful Champion to organize a charity tournament for your cause.
          </p>
          <Button className="bg-pink-500 hover:bg-pink-600">
            Contact Us <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </section>
    </div>
  )
}
