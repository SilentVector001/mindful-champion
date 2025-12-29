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

// TOURNAMENT ACTION/ENVIRONMENT images from Unsplash
const TOURNAMENT_IMAGES = [
  "https://images.unsplash.com/photo-1761644658016-324918bc373c?w=800&q=80", // Indoor tournament setting with players competing
  "https://images.unsplash.com/photo-1749578291886-44a514bd12a6?w=800&q=80", // Outdoor court action shot
  "https://images.unsplash.com/photo-1686721135036-22ac6cbb8ce8?w=800&q=80", // Indoor competition scene
  "https://images.unsplash.com/photo-1618551763300-dc7eb8ce3560?w=800&q=80", // Outdoor court with players
]

// Featured championship events - REAL PPA/APP Tour events
const FEATURED_CHAMPIONSHIPS = [
  {
    id: "ppa-carvana-masters-2026",
    name: "The Carvana Masters Powered by Invited",
    location: "Rancho Mirage, CA",
    startDate: "2026-01-12",
    endDate: "2026-01-18",
    prizePool: 200000,
    points: 2000,
    type: "grand-slam",
    registrationUrl: "https://ppatour.com/schedule/",
    image: "https://images.unsplash.com/photo-1761644658016-324918bc373c?w=800&q=80"
  },
  {
    id: "app-nyc-open-2025",
    name: "Zimmer Biomet APP New York City Open",
    location: "New York, NY",
    startDate: "2025-05-20",
    endDate: "2025-05-25",
    prizePool: 175000,
    type: "grand-slam",
    registrationUrl: "https://www.theapp.global/tour",
    image: "https://images.unsplash.com/photo-1686721135036-22ac6cbb8ce8?w=800&q=80"
  },
  {
    id: "app-tour-championships-2025",
    name: "GEICO APP Tour Championships",
    location: "Fort Lauderdale, FL",
    startDate: "2025-12-09",
    endDate: "2025-12-14",
    prizePool: 250000,
    type: "grand-slam",
    registrationUrl: "https://www.theapp.global/tour-schedule/2025-app-tour-championships",
    image: "https://images.unsplash.com/photo-1749578291886-44a514bd12a6?w=800&q=80"
  }
]

// Regional Championships - Real PPA Challenger & APP events
const REGIONAL_CHAMPIONSHIPS = [
  {
    id: "ppa-atlanta-2026",
    name: "Atlanta Pickleball Championships",
    location: "Peachtree Corners, GA",
    startDate: "2026-04-27",
    endDate: "2026-05-03",
    prizePool: 150000,
    points: 2000,
    registrationUrl: "https://ppatour.com/schedule/",
    image: "https://images.unsplash.com/photo-1618551763300-dc7eb8ce3560?w=800&q=80"
  },
  {
    id: "app-great-lakes-2025",
    name: "APP Great Lakes Open",
    location: "Midland, MI",
    startDate: "2025-08-13",
    endDate: "2025-08-17",
    prizePool: 75000,
    registrationUrl: "https://www.theapp.global/tour",
    image: "https://images.unsplash.com/photo-1761644658016-324918bc373c?w=800&q=80"
  },
  {
    id: "ppa-mesa-cup-2026",
    name: "Carvana Mesa Cup",
    location: "Mesa, AZ",
    startDate: "2026-02-16",
    endDate: "2026-02-22",
    prizePool: 120000,
    points: 1500,
    registrationUrl: "https://ppatour.com/schedule/",
    image: "https://images.unsplash.com/photo-1686721135036-22ac6cbb8ce8?w=800&q=80"
  },
  {
    id: "ppa-newport-beach-2026",
    name: "Newport Beach Open",
    location: "Newport Beach, CA",
    startDate: "2026-03-02",
    endDate: "2026-03-08",
    prizePool: 100000,
    points: 1000,
    registrationUrl: "https://ppatour.com/schedule/",
    image: "https://images.unsplash.com/photo-1749578291886-44a514bd12a6?w=800&q=80"
  }
]

// PPA Challenger events
const STATE_FINALS = [
  { id: "ppa-punta-gorda-2026", name: "Punta Gorda PPA Challenger", location: "Punta Gorda, FL", startDate: "2026-01-09", endDate: "2026-01-11", prizePool: 25000, registrationUrl: "https://ppatour.com/schedule/" },
  { id: "ppa-tucson-2026", name: "Tucson PPA Challenger", location: "Tucson, AZ", startDate: "2026-01-23", endDate: "2026-01-25", prizePool: 25000, registrationUrl: "https://ppatour.com/schedule/" },
  { id: "ppa-houston-2026", name: "Houston PPA Challenger", location: "Atascocita, TX", startDate: "2026-02-20", endDate: "2026-02-22", prizePool: 25000, registrationUrl: "https://ppatour.com/schedule/" },
  { id: "ppa-harbour-island-2026", name: "Harbour Island PPA Challenger", location: "Tampa, FL", startDate: "2026-03-06", endDate: "2026-03-08", prizePool: 25000, registrationUrl: "https://ppatour.com/schedule/" },
  { id: "ppa-wilson-2026", name: "Wilson PPA Challenger", location: "Wilson, NC", startDate: "2026-05-22", endDate: "2026-05-24", prizePool: 25000, registrationUrl: "https://ppatour.com/schedule/" },
  { id: "ppa-boise-2026", name: "Boise PPA Challenger", location: "Meridian, ID", startDate: "2026-06-12", endDate: "2026-06-14", prizePool: 25000, registrationUrl: "https://ppatour.com/schedule/" },
]

interface Tournament {
  id: string
  name: string
  location: string
  startDate: string
  endDate?: string
  prizePool?: number
  type?: string
  registrationUrl?: string
  image?: string
}

export function ChampionshipEvents() {
  const [activeTab, setActiveTab] = useState("grand-slam")

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

  const openRegistration = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1 mb-8">
            <TabsTrigger value="grand-slam" className="data-[state=active]:bg-champion-green">
              <Trophy className="w-4 h-4 mr-2" />
              Grand Slam Series ({FEATURED_CHAMPIONSHIPS.length})
            </TabsTrigger>
            <TabsTrigger value="regional" className="data-[state=active]:bg-champion-green">
              <Medal className="w-4 h-4 mr-2" />
              Regional Championships ({REGIONAL_CHAMPIONSHIPS.length})
            </TabsTrigger>
            <TabsTrigger value="state" className="data-[state=active]:bg-champion-green">
              <Target className="w-4 h-4 mr-2" />
              State Finals ({STATE_FINALS.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grand-slam">
            <div className="grid gap-6">
              {FEATURED_CHAMPIONSHIPS.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/5 border-white/10 overflow-hidden hover:border-yellow-500/30 transition-all">
                    <div className="flex flex-col md:flex-row">
                      <div className="relative w-full md:w-80 h-48 md:h-auto flex-shrink-0">
                        <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50" />
                        <Badge className="absolute top-4 left-4 bg-yellow-500 text-black">
                          <Crown className="w-3 h-3 mr-1" /> Grand Slam
                        </Badge>
                      </div>
                      <CardContent className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
                            <p className="text-gray-400 text-sm mb-3">Elite-level championship competition</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-yellow-400">{formatPrizeMoney(event.prizePool)}</div>
                            <div className="text-sm text-gray-400">Prize Pool</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(event.startDate, event.endDate)}
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            className="bg-yellow-500 hover:bg-yellow-600 text-black"
                            onClick={() => openRegistration(event.registrationUrl)}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Register Now
                          </Button>
                          <Button 
                            variant="outline" 
                            className="border-white/20 text-white hover:bg-white/10"
                            onClick={() => openRegistration(event.registrationUrl)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="regional">
            <div className="grid md:grid-cols-2 gap-6">
              {REGIONAL_CHAMPIONSHIPS.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/5 border-white/10 hover:border-orange-500/30 transition-all overflow-hidden">
                    <div className="relative h-32">
                      <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <Badge className="absolute top-3 left-3 bg-orange-500/20 text-orange-400 border-orange-500/30">
                        Regional Championship
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-white mb-2">{event.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(event.startDate, event.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-orange-400">{formatPrizeMoney(event.prizePool)}</div>
                        <Button 
                          size="sm" 
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={() => openRegistration(event.registrationUrl)}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Register
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="state">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STATE_FINALS.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-white/5 border-white/10 hover:border-champion-green/30 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{event.name}</h3>
                        <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                          {formatPrizeMoney(event.prizePool)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(event.startDate)}
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full bg-champion-green hover:bg-champion-green/90"
                        onClick={() => openRegistration(event.registrationUrl)}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Find Tournament
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* External Links */}
        <div className="mt-12 bg-white/5 rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Find More Championship Events</h3>
          <div className="flex flex-wrap gap-3">
            <a href="https://ppatour.com/schedule/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                <ExternalLink className="w-4 h-4 mr-2" /> PPA Tour Schedule
              </Button>
            </a>
            <a href="https://www.theapp.global/tour" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10">
                <ExternalLink className="w-4 h-4 mr-2" /> APP Tour Schedule
              </Button>
            </a>
            <a href="https://usapickleball.org/events/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                <ExternalLink className="w-4 h-4 mr-2" /> USA Pickleball Events
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
