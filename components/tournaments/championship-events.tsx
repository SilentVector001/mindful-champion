"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const GRAND_SLAM_EVENTS = [
  {
    id: "gs1",
    name: "Miami Open Championship",
    location: "Miami, FL",
    date: "Jan 15-19, 2025",
    prizePool: "$250,000",
    participants: 512,
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800",
    status: "registration",
    skillLevels: ["Pro", "5.0+"],
    description: "The crown jewel of the Championship Circuit, featuring the world's top players.",
  },
  {
    id: "gs2",
    name: "Las Vegas Masters",
    location: "Las Vegas, NV",
    date: "Feb 20-24, 2025",
    prizePool: "$200,000",
    participants: 384,
    image: "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=800",
    status: "upcoming",
    skillLevels: ["Pro", "5.0+"],
    description: "High-stakes competition under the Vegas lights.",
  },
  {
    id: "gs3",
    name: "California Classic",
    location: "San Diego, CA",
    date: "Mar 10-14, 2025",
    prizePool: "$175,000",
    participants: 448,
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800",
    status: "upcoming",
    skillLevels: ["Pro", "5.0+"],
    description: "West Coast's premier championship event.",
  },
]

const REGIONAL_CHAMPIONSHIPS = [
  {
    id: "rc1",
    name: "Southwest Regional Championship",
    location: "Phoenix, AZ",
    date: "Jan 22-24, 2025",
    prizePool: "$75,000",
    region: "Southwest",
    skillLevels: ["4.0+", "4.5+", "5.0+"],
  },
  {
    id: "rc2",
    name: "Northeast Regional Championship",
    location: "Boston, MA",
    date: "Feb 5-7, 2025",
    prizePool: "$75,000",
    region: "Northeast",
    skillLevels: ["4.0+", "4.5+", "5.0+"],
  },
  {
    id: "rc3",
    name: "Southeast Regional Championship",
    location: "Atlanta, GA",
    date: "Feb 12-14, 2025",
    prizePool: "$75,000",
    region: "Southeast",
    skillLevels: ["4.0+", "4.5+", "5.0+"],
  },
  {
    id: "rc4",
    name: "Midwest Regional Championship",
    location: "Chicago, IL",
    date: "Feb 19-21, 2025",
    prizePool: "$75,000",
    region: "Midwest",
    skillLevels: ["4.0+", "4.5+", "5.0+"],
  },
]

const STATE_CHAMPIONSHIPS = [
  { state: "California", date: "Mar 1-3", location: "Los Angeles", prizePool: "$50,000" },
  { state: "Florida", date: "Mar 8-10", location: "Orlando", prizePool: "$50,000" },
  { state: "Texas", date: "Mar 15-17", location: "Austin", prizePool: "$50,000" },
  { state: "Arizona", date: "Mar 22-24", location: "Scottsdale", prizePool: "$45,000" },
  { state: "Colorado", date: "Mar 29-31", location: "Denver", prizePool: "$40,000" },
  { state: "New York", date: "Apr 5-7", location: "NYC", prizePool: "$45,000" },
]

export function ChampionshipEvents() {
  const [activeTab, setActiveTab] = useState("grand-slam")

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
              Grand Slam Series
            </TabsTrigger>
            <TabsTrigger value="regional" className="data-[state=active]:bg-champion-green">
              <Medal className="w-4 h-4 mr-2" />
              Regional Championships
            </TabsTrigger>
            <TabsTrigger value="state" className="data-[state=active]:bg-champion-green">
              <Target className="w-4 h-4 mr-2" />
              State Finals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grand-slam">
            <div className="grid gap-6">
              {GRAND_SLAM_EVENTS.map((event, index) => (
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
                            <p className="text-gray-400 text-sm mb-3">{event.description}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {event.skillLevels.map(level => (
                                <Badge key={level} variant="outline" className="border-yellow-500/30 text-yellow-400">
                                  {level}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-yellow-400">{event.prizePool}</div>
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
                            {event.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.participants} Players
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
                  <Card className="bg-white/5 border-white/10 hover:border-orange-500/30 transition-all">
                    <CardContent className="p-6">
                      <Badge className="mb-3 bg-orange-500/20 text-orange-400 border-orange-500/30">
                        {event.region} Region
                      </Badge>
                      <h3 className="text-lg font-bold text-white mb-2">{event.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {event.date}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {event.skillLevels.map(level => (
                          <Badge key={level} variant="outline" className="border-white/20 text-gray-300 text-xs">
                            {level}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-orange-400">{event.prizePool}</div>
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
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
              {STATE_CHAMPIONSHIPS.map((event, index) => (
                <motion.div
                  key={event.state}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-white/5 border-white/10 hover:border-champion-green/30 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{event.state} State Finals</h3>
                        <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                          {event.prizePool}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {event.date}
                        </span>
                      </div>
                      <Button size="sm" className="w-full bg-champion-green hover:bg-champion-green/90">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
