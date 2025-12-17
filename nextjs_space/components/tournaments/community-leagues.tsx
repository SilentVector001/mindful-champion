"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Users,
  Calendar,
  MapPin,
  ChevronLeft,
  Trophy,
  UserPlus,
  ArrowRight,
  Shield,
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

export function CommunityLeagues() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeagueEvents()
  }, [])

  const fetchLeagueEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch league tournaments
      const res = await fetch('/api/tournaments')
      if (!res?.ok) throw new Error('Failed to fetch tournaments')
      const data = await res?.json()
      
      // For now, show all tournaments (can be filtered by type='league' if field exists)
      setTournaments(data?.tournaments || [])
    } catch (err) {
      console.error('Error fetching league events:', err)
      setError(err?.message || 'Failed to load community leagues')
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
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <Link href="/tournaments" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Tournament Hub
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Community League Network</h1>
              <p className="text-gray-400">Grassroots team competitions across the nation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Looking for a Team?</h3>
                <p className="text-sm text-gray-400">Find players in your area</p>
              </div>
              <Button size="sm" className="bg-green-500 hover:bg-green-600">
                Find Players
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Start a League</h3>
                <p className="text-sm text-gray-400">Organize in your community</p>
              </div>
              <Button size="sm" variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Leagues List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Active Leagues & Tournaments</h2>
        
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-champion-green mx-auto animate-spin" />
            <p className="text-gray-400 mt-4">Loading community leagues...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={fetchLeagueEvents} className="bg-champion-green hover:bg-champion-green/90">
              Retry
            </Button>
          </div>
        ) : tournaments?.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No community leagues available at this time. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {tournaments?.map?.((league, index) => (
              <motion.div
                key={league?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10 hover:border-green-500/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge className="bg-green-500/20 text-green-400">
                          Community League
                        </Badge>
                      </div>
                      {league?.prizePool && (
                        <Badge variant="outline" className="border-white/20 text-gray-300">
                          {formatPrizeMoney(league?.prizePool)}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{league?.name || 'Community League'}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {league?.location || 'TBA'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(league?.startDate, league?.endDate)}
                      </span>
                    </div>
                    <Button className="w-full bg-green-500 hover:bg-green-600">
                      Join League
                      <ArrowRight className="w-4 h-4 ml-1" />
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
