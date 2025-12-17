"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  Award,
  Zap,
  ExternalLink,
  Radio,
  Crown,
  Medal,
  Target,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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

export function ChampionshipEvents() {
  const [activeTab, setActiveTab] = useState("grand-slam")
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchChampionshipData()
  }, [])

  const fetchChampionshipData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch all tournaments and filter for championships (prize pool > $50k)
      const res = await fetch('/api/tournaments')
      if (!res?.ok) throw new Error('Failed to fetch tournaments')
      const data = await res?.json()
      
      // Filter for championship level tournaments
      const championships = data?.tournaments?.filter?.((t: Tournament) => 
        t?.prizePool && t?.prizePool >= 50000
      ) || []
      
      setTournaments(championships)
    } catch (err) {
      console.error('Error fetching championship data:', err)
      setError(err?.message || 'Failed to load championship data')
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

  // Categorize tournaments
  const grandSlam = tournaments?.filter?.(t => (t?.prizePool || 0) >= 150000) || []
  const regional = tournaments?.filter?.(t => (t?.prizePool || 0) >= 50000 && (t?.prizePool || 0) < 150000) || []
  const state = tournaments?.filter?.(t => (t?.prizePool || 0) >= 30000 && (t?.prizePool || 0) < 50000) || []

  return (
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-orange-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <Link href="/tournaments" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Tournament Hub
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Championship Events</h1>
              <p className="text-gray-400">Elite tournaments for professional and advanced players</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-champion-green mx-auto animate-spin" />
            <p className="text-gray-400 mt-4">Loading championship events...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={fetchChampionshipData} className="bg-champion-green hover:bg-champion-green/90">
              Retry
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white/5 border border-white/10 p-1 mb-8">
              <TabsTrigger value="grand-slam" className="data-[state=active]:bg-champion-green">
                <Trophy className="w-4 h-4 mr-2" />
                Grand Slam Series ({grandSlam?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="regional" className="data-[state=active]:bg-champion-green">
                <Medal className="w-4 h-4 mr-2" />
                Regional Championships ({regional?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="state" className="data-[state=active]:bg-champion-green">
                <Target className="w-4 h-4 mr-2" />
                State Finals ({state?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="grand-slam">
              <div className="grid gap-6">
                {grandSlam?.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No Grand Slam events available at this time</p>
                  </div>
                ) : (
                  grandSlam?.map?.((event, index) => (
                    <motion.div
                      key={event?.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-white/5 border-white/10 overflow-hidden hover:border-yellow-500/30 transition-all">
                        <div className="flex flex-col md:flex-row">
                          <div className="relative w-full md:w-80 h-48 md:h-auto flex-shrink-0">
                            <img src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" alt={event?.name || 'Tournament'} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50" />
                            <Badge className="absolute top-4 left-4 bg-yellow-500 text-black">
                              <Crown className="w-3 h-3 mr-1" /> Grand Slam
                            </Badge>
                          </div>
                          <CardContent className="flex-1 p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-bold text-white mb-2">{event?.name || 'Untitled Tournament'}</h3>
                                <p className="text-gray-400 text-sm mb-3">Elite-level championship competition</p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-yellow-400">{formatPrizeMoney(event?.prizePool || 0)}</div>
                                <div className="text-sm text-gray-400">Prize Pool</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {event?.location || 'TBA'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(event?.startDate, event?.endDate)}
                              </span>
                            </div>
                            <div className="flex gap-3">
                              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                                Register Now
                              </Button>
                              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </motion.div>
                  )) || []
                )}
              </div>
            </TabsContent>

            <TabsContent value="regional">
              <div className="grid md:grid-cols-2 gap-6">
                {regional?.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Medal className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No regional championships available at this time</p>
                  </div>
                ) : (
                  regional?.map?.((event, index) => (
                    <motion.div
                      key={event?.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-white/5 border-white/10 hover:border-orange-500/30 transition-all">
                        <CardContent className="p-6">
                          <Badge className="mb-3 bg-orange-500/20 text-orange-400 border-orange-500/30">
                            Regional Championship
                          </Badge>
                          <h3 className="text-lg font-bold text-white mb-2">{event?.name || 'Untitled Tournament'}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event?.location || 'TBA'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(event?.startDate, event?.endDate)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold text-orange-400">{formatPrizeMoney(event?.prizePool || 0)}</div>
                            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                              Register
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )) || []
                )}
              </div>
            </TabsContent>

            <TabsContent value="state">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state?.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No state finals available at this time</p>
                  </div>
                ) : (
                  state?.map?.((event, index) => (
                    <motion.div
                      key={event?.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="bg-white/5 border-white/10 hover:border-champion-green/30 transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-white">{event?.name || 'State Finals'}</h3>
                            <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                              {formatPrizeMoney(event?.prizePool || 0)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event?.location || 'TBA'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(event?.startDate, event?.endDate)}
                            </span>
                          </div>
                          <Button size="sm" className="w-full bg-champion-green hover:bg-champion-green/90">
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )) || []
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </section>
    </div>
  )
}
