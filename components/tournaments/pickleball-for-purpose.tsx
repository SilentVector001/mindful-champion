"use client"

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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const CHARITY_EVENTS = [
  {
    id: "c1",
    name: "Pickleball for Cancer Research",
    location: "Los Angeles, CA",
    date: "Jan 5, 2025",
    cause: "Cancer Research",
    raised: "$45,000",
    goal: "$75,000",
    spotsLeft: 120,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
  },
  {
    id: "c2",
    name: "Veterans Support Tournament",
    location: "Dallas, TX",
    date: "Jan 12, 2025",
    cause: "Veterans Support",
    raised: "$28,000",
    goal: "$50,000",
    spotsLeft: 64,
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400",
  },
  {
    id: "c3",
    name: "Youth Sports Foundation Classic",
    location: "Chicago, IL",
    date: "Jan 26, 2025",
    cause: "Youth Sports",
    raised: "$15,000",
    goal: "$40,000",
    spotsLeft: 96,
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
  },
  {
    id: "c4",
    name: "Mental Health Awareness Play",
    location: "Seattle, WA",
    date: "Feb 8, 2025",
    cause: "Mental Health",
    raised: "$8,500",
    goal: "$30,000",
    spotsLeft: 80,
    image: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=400",
  },
]

const IMPACT_STATS = [
  { label: "Raised This Year", value: "$2.1M+" },
  { label: "Charity Events", value: "67" },
  { label: "Causes Supported", value: "24" },
  { label: "Volunteers", value: "3,500+" },
]

export function PickleballForPurpose() {
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
          {IMPACT_STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 rounded-xl border border-white/10 p-4 text-center"
            >
              <div className="text-2xl font-bold text-pink-400">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Charity Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Upcoming Charity Events</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {CHARITY_EVENTS.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10 hover:border-pink-500/30 transition-all overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="relative w-full md:w-40 h-32 md:h-auto flex-shrink-0">
                    <img src={event.image} alt={event.cause} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50" />
                  </div>
                  <CardContent className="flex-1 p-4">
                    <Badge className="mb-2 bg-pink-500/20 text-pink-400 border-pink-500/30">
                      <Heart className="w-3 h-3 mr-1" /> {event.cause}
                    </Badge>
                    <h3 className="font-semibold text-white mb-2">{event.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {event.date}
                      </span>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Raised</span>
                        <span className="text-pink-400 font-medium">{event.raised} / {event.goal}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-full"
                          style={{ width: `${(parseFloat(event.raised.replace(/[^0-9.]/g, '')) / parseFloat(event.goal.replace(/[^0-9.]/g, ''))) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-500/20 text-green-400">
                        {event.spotsLeft} spots left
                      </Badge>
                      <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                        Join Event
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
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
