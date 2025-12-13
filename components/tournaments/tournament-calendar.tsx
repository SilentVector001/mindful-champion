"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const MONTHS = ["January", "February", "March", "April", "May", "June"]
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const CALENDAR_EVENTS = [
  { date: 15, type: "championship", name: "Miami Open", location: "FL" },
  { date: 22, type: "amateur", name: "Community Open", location: "WA" },
  { date: 28, type: "charity", name: "Cancer Research", location: "CA" },
  { date: 5, type: "junior", name: "Rising Stars", location: "TX" },
  { date: 12, type: "league", name: "League Finals", location: "MA" },
]

const ALL_EVENTS = [
  {
    id: "e1",
    name: "Grand Slam - Miami Open",
    location: "Miami, FL",
    date: "Jan 15-19, 2025",
    type: "championship",
    state: "FL",
  },
  {
    id: "e2",
    name: "Community Open - Seattle",
    location: "Seattle, WA",
    date: "Dec 28-29, 2024",
    type: "amateur",
    state: "WA",
  },
  {
    id: "e3",
    name: "Pickleball for Cancer Research",
    location: "Los Angeles, CA",
    date: "Jan 5, 2025",
    type: "charity",
    state: "CA",
  },
  {
    id: "e4",
    name: "Rising Stars Junior National",
    location: "Dallas, TX",
    date: "Feb 1-3, 2025",
    type: "junior",
    state: "TX",
  },
  {
    id: "e5",
    name: "Northeast League Finals",
    location: "Boston, MA",
    date: "Jan 8, 2025",
    type: "league",
    state: "MA",
  },
  {
    id: "e6",
    name: "Southwest Regional Championship",
    location: "Phoenix, AZ",
    date: "Jan 22-24, 2025",
    type: "championship",
    state: "AZ",
  },
  {
    id: "e7",
    name: "Winter Warm-Up Tournament",
    location: "Austin, TX",
    date: "Jan 18-19, 2025",
    type: "amateur",
    state: "TX",
  },
  {
    id: "e8",
    name: "Veterans Support Tournament",
    location: "Dallas, TX",
    date: "Jan 12, 2025",
    type: "charity",
    state: "TX",
  },
]

const TYPE_CONFIG: Record<string, { icon: typeof Trophy; color: string; label: string }> = {
  championship: { icon: Trophy, color: "text-yellow-400 bg-yellow-500/20", label: "Championship" },
  amateur: { icon: Trophy, color: "text-blue-400 bg-blue-500/20", label: "Amateur" },
  junior: { icon: Star, color: "text-purple-400 bg-purple-500/20", label: "Rising Stars" },
  league: { icon: Users, color: "text-green-400 bg-green-500/20", label: "League" },
  charity: { icon: Heart, color: "text-pink-400 bg-pink-500/20", label: "Charity" },
}

export function TournamentCalendar() {
  const [currentMonth, setCurrentMonth] = useState(0)
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedState, setSelectedState] = useState("all")

  const filteredEvents = ALL_EVENTS.filter(event => {
    const matchesType = selectedType === "all" || event.type === selectedType
    const matchesState = selectedState === "all" || event.state === selectedState
    return matchesType && matchesState
  })

  const getDaysInMonth = () => {
    const days = []
    for (let i = 1; i <= 31; i++) {
      const eventsOnDay = CALENDAR_EVENTS.filter(e => e.date === i)
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

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Select value={selectedType} onValueChange={setSelectedType}>
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
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="CA">California</SelectItem>
                <SelectItem value="FL">Florida</SelectItem>
                <SelectItem value="TX">Texas</SelectItem>
                <SelectItem value="AZ">Arizona</SelectItem>
                <SelectItem value="WA">Washington</SelectItem>
                <SelectItem value="MA">Massachusetts</SelectItem>
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
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        {viewMode === "list" ? (
          <div className="space-y-4">
            {filteredEvents.map((event, index) => {
              const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.amateur
              const Icon = config.icon
              return (
                <motion.div
                  key={event.id}
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
                      <h3 className="font-semibold text-white">{event.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {event.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={config.color}>{config.label}</Badge>
                    <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600">
                      View Details
                    </Button>
                  </div>
                </motion.div>
              )
            })}
            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No events found</h3>
                <p className="text-gray-400">Try adjusting your filters</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={() => setCurrentMonth(Math.max(0, currentMonth - 1))} className="text-white">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-bold text-white">{MONTHS[currentMonth]} 2025</h2>
              <Button variant="ghost" onClick={() => setCurrentMonth(Math.min(5, currentMonth + 1))} className="text-white">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth().map(({ day, events }) => (
                <div
                  key={day}
                  className={`min-h-[80px] rounded-lg p-2 border ${
                    events.length > 0
                      ? "border-indigo-500/30 bg-indigo-500/10"
                      : "border-white/5 bg-white/5"
                  }`}
                >
                  <span className="text-sm text-gray-400">{day}</span>
                  {events.map((event, i) => {
                    const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.amateur
                    return (
                      <div
                        key={i}
                        className={`mt-1 text-xs px-1 py-0.5 rounded truncate ${config.color}`}
                        title={event.name}
                      >
                        {event.name}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-white/10">
              {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${config.color}`} />
                  <span className="text-sm text-gray-400">{config.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
