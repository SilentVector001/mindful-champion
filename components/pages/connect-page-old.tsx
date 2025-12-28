
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  MapPin, 
  Star,
  Clock,
  Search,
  UserPlus,
  Trophy,
  Calendar,
  MessageSquare,
  Target,
  Filter
} from "lucide-react"
import Image from "next/image"
import SimplifiedNav from "@/components/layout/simplified-nav"
import PersistentAvatar from "@/components/avatar/persistent-avatar"

interface ConnectPageProps {
  user: any
  practicePartners: any[]
}

export default function ConnectPage({ user, practicePartners }: ConnectPageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all')
  const [filteredPartners, setFilteredPartners] = useState(practicePartners)

  const skillLevels = ['all', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO']

  const upcomingMatches = [
    {
      id: 1,
      opponent: "Sarah Chen",
      date: "Today, 3:00 PM",
      location: "Central Park Courts",
      type: "Practice",
      rating: "3.2"
    },
    {
      id: 2,
      opponent: "Mike Rodriguez",
      date: "Tomorrow, 10:00 AM", 
      location: "Riverside Pickleball Center",
      type: "Match",
      rating: "2.8"
    }
  ]

  const communityStats = {
    totalPlayers: 2847,
    activeToday: 156,
    matchesPlayed: 1234,
    newMembers: 23
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    filterPartners(term, selectedSkillLevel)
  }

  const handleSkillFilter = (level: string) => {
    setSelectedSkillLevel(level)
    filterPartners(searchTerm, level)
  }

  const filterPartners = (term: string, level: string) => {
    let filtered = practicePartners || []
    
    if (term) {
      filtered = filtered.filter(partner => 
        partner?.name?.toLowerCase().includes(term.toLowerCase()) ||
        partner?.location?.toLowerCase().includes(term.toLowerCase())
      )
    }
    
    if (level !== 'all') {
      filtered = filtered.filter(partner => partner?.skillLevel === level)
    }
    
    setFilteredPartners(filtered)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <SimplifiedNav />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Connect & Play 👥
          </h1>
          <p className="text-slate-600 mb-4">
            Find practice partners, join matches, and grow your pickleball community
          </p>
          
          {/* Community Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-purple-700">{communityStats.totalPlayers.toLocaleString()}</div>
              <div className="text-sm text-purple-600">Total Players</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-700">{communityStats.activeToday}</div>
              <div className="text-sm text-green-600">Active Today</div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-700">{communityStats.matchesPlayed}</div>
              <div className="text-sm text-blue-600">Matches This Week</div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-orange-700">+{communityStats.newMembers}</div>
              <div className="text-sm text-orange-600">New This Week</div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Search & Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <Card className="border-0 bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search by name, location..."
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    {skillLevels.map((level) => (
                      <Button
                        key={level}
                        variant={selectedSkillLevel === level ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSkillFilter(level)}
                        className={selectedSkillLevel === level ? "bg-gradient-to-r from-purple-500 to-pink-500" : ""}
                      >
                        {level === 'all' ? 'All Levels' : level}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Practice Partners */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Practice Partners</h2>
                <Badge variant="outline">
                  {filteredPartners.length} available
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {filteredPartners.length > 0 ? filteredPartners.slice(0, 8).map((partner, index) => (
                  <motion.div
                    key={partner.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -2 }}
                  >
                    <Card className="border-0 bg-white shadow-sm hover:shadow-lg transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                            {partner?.name?.[0] || 'P'}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900">
                              {partner?.name || 'Anonymous Player'}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Star className="h-3 w-3 text-yellow-500" />
                              {partner?.rating?.toFixed(1) || '2.0'}
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {partner?.skillLevel || 'BEGINNER'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Active</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                          <MapPin className="h-4 w-4" />
                          <span>{partner?.location || 'Location not set'}</span>
                          {partner?.distance && (
                            <>
                              <span>•</span>
                              <span>{partner.distance.toFixed(1)} km away</span>
                            </>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                            <UserPlus className="h-4 w-4 mr-1" />
                            Connect
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )) : (
                  <div className="col-span-2 text-center py-12">
                    <Users className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No partners found</h3>
                    <p className="text-slate-600 mb-4">Try adjusting your filters or search terms</p>
                    <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedSkillLevel('all'); setFilteredPartners(practicePartners) }}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upcoming Matches */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingMatches.map((match) => (
                    <div key={match.id} className="border-l-4 border-purple-500 pl-3">
                      <div className="font-medium text-slate-900">{match.opponent}</div>
                      <div className="text-sm text-slate-600">{match.date}</div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <MapPin className="h-3 w-3" />
                        {match.location}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant={match.type === 'Match' ? "default" : "secondary"}>
                          {match.type}
                        </Badge>
                        <span className="text-xs text-slate-500">Rating: {match.rating}</span>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full mt-4" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Match
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start gap-3" variant="outline">
                    <Trophy className="h-4 w-4" />
                    Join Tournament
                  </Button>
                  <Button className="w-full justify-start gap-3" variant="outline">
                    <Users className="h-4 w-4" />
                    Create Group
                  </Button>
                  <Button className="w-full justify-start gap-3" variant="outline">
                    <Target className="h-4 w-4" />
                    Find Coach
                  </Button>
                  <Button className="w-full justify-start gap-3" variant="outline">
                    <MessageSquare className="h-4 w-4" />
                    Join Discussion
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Community Highlights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg text-purple-800">Community Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Trophy className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-purple-800">Weekend Tournament</div>
                        <div className="text-xs text-purple-600">Join 64 players this Saturday</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-purple-800">Beginner's Group</div>
                        <div className="text-xs text-purple-600">Perfect for new players</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Persistent Avatar */}
      <PersistentAvatar currentPage="connect" />
    </div>
  )
}
