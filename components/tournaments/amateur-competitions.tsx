"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const SKILL_LEVELS = ["2.5", "3.0", "3.5", "4.0", "4.5", "5.0"]

const AMATEUR_EVENTS = [
  {
    id: "a1",
    name: "Community Open - Seattle",
    location: "Seattle, WA",
    date: "Dec 28-29, 2024",
    skillLevels: ["3.0", "3.5", "4.0"],
    entryFee: "$75",
    spotsLeft: 48,
    format: "Round Robin",
  },
  {
    id: "a2",
    name: "Weekend Warriors Classic",
    location: "Denver, CO",
    date: "Jan 4-5, 2025",
    skillLevels: ["3.5", "4.0", "4.5"],
    entryFee: "$85",
    spotsLeft: 32,
    format: "Double Elimination",
  },
  {
    id: "a3",
    name: "New Year Smash",
    location: "Phoenix, AZ",
    date: "Jan 11-12, 2025",
    skillLevels: ["2.5", "3.0", "3.5"],
    entryFee: "$65",
    spotsLeft: 64,
    format: "Round Robin",
  },
  {
    id: "a4",
    name: "Winter Warm-Up Tournament",
    location: "Austin, TX",
    date: "Jan 18-19, 2025",
    skillLevels: ["3.0", "3.5", "4.0", "4.5"],
    entryFee: "$80",
    spotsLeft: 24,
    format: "Double Elimination",
  },
  {
    id: "a5",
    name: "Coastal Classic",
    location: "San Diego, CA",
    date: "Jan 25-26, 2025",
    skillLevels: ["3.5", "4.0"],
    entryFee: "$90",
    spotsLeft: 16,
    format: "Pool Play",
  },
  {
    id: "a6",
    name: "Beginner Bash",
    location: "Tampa, FL",
    date: "Feb 1-2, 2025",
    skillLevels: ["2.5", "3.0"],
    entryFee: "$55",
    spotsLeft: 80,
    format: "Round Robin",
  },
]

export function AmateurCompetitions() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")

  const filteredEvents = AMATEUR_EVENTS.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = selectedLevel === "all" || event.skillLevels.includes(selectedLevel)
    return matchesSearch && matchesLevel
  })

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
              {SKILL_LEVELS.map(level => (
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
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search events or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Skill Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {SKILL_LEVELS.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10 hover:border-blue-500/30 transition-all h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {event.format}
                    </Badge>
                    <span className="text-lg font-bold text-white">{event.entryFee}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{event.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {event.date}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {event.skillLevels.map(level => (
                      <Badge key={level} variant="outline" className="border-white/20 text-gray-300 text-xs">
                        {level}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={`${
                      event.spotsLeft > 30 ? "bg-green-500/20 text-green-400" :
                      event.spotsLeft > 10 ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {event.spotsLeft} spots left
                    </Badge>
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                      Register <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No events found</h3>
            <p className="text-gray-400">Try adjusting your filters or search terms</p>
          </div>
        )}
      </section>
    </div>
  )
}
