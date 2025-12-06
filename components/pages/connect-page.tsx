
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Filter,
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
  BarChart3,
  ChevronRight,
  Plus,
  Link as LinkIcon,
  CheckCircle2,
  CircleDot,
  Minus
} from "lucide-react"
import Image from "next/image"
import MainNavigation from "@/components/navigation/main-navigation"
import AvatarCoach from "@/components/avatar/avatar-coach"
import { Progress } from "@/components/ui/progress"

interface ConnectPageProps {
  user: any
  practicePartners: any[]
}

export default function ConnectPage({ user, practicePartners }: ConnectPageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all')
  const [filteredPartners, setFilteredPartners] = useState(practicePartners)
  const [activeTab, setActiveTab] = useState('matches')
  const [matches, setMatches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<any>(null)

  const skillLevels = ['all', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO']

  // Load matches on mount
  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/matches')
      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches || [])
      }
    } catch (error) {
      console.error('Failed to load matches:', error)
    }
    setIsLoading(false)
  }

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

  // Calculate match statistics
  const matchStats = {
    totalMatches: matches.length,
    wins: matches.filter(m => m.result === 'WIN').length,
    losses: matches.filter(m => m.result === 'LOSS').length,
    winRate: matches.length > 0 ? Math.round((matches.filter(m => m.result === 'WIN').length / matches.length) * 100) : 0,
    currentStreak: user.currentStreak || 0,
    duprRating: user.duprRating || null,
    ratingChange: matches.length > 0 && matches?.[0]?.duprRatingChange ? matches[0].duprRatingChange : 0
  }

  const communityStats = {
    totalPlayers: 2847,
    activeToday: 156,
    matchesPlayed: 1234,
    newMembers: 23
  }

  const connectDUPR = async () => {
    try {
      const duprId = prompt('Enter your DUPR ID:')
      if (!duprId) return

      const response = await fetch('/api/dupr/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duprId })
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to connect DUPR:', error)
    }
  }

  const syncDUPR = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/dupr/sync', { method: 'POST' })
      if (response.ok) {
        await loadMatches()
      }
    } catch (error) {
      console.error('Failed to sync DUPR:', error)
    }
    setIsLoading(false)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-champion-green/5 dark:from-champion-charcoal dark:via-gray-900 dark:to-champion-green/5">
      <MainNavigation user={user} />
      
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
          <p className="text-slate-600 mb-6">
            Track matches, connect with DUPR, and find opponents
          </p>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
              <TabsTrigger value="matches" className="gap-2">
                <Trophy className="h-4 w-4" />
                My Matches
              </TabsTrigger>
              <TabsTrigger value="partners" className="gap-2">
                <Users className="h-4 w-4" />
                Find Partners
              </TabsTrigger>
              <TabsTrigger value="community" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Community
              </TabsTrigger>
            </TabsList>

            {/* MY MATCHES TAB */}
            <TabsContent value="matches" className="space-y-6">
              {/* DUPR Connection Banner */}
              {!user.duprConnected && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                          <LinkIcon className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold">Connect with DUPR</h3>
                      </div>
                      <p className="text-white/90 mb-3">
                        Link your DUPR account to automatically track your matches and rating
                      </p>
                      <ul className="space-y-1 text-sm text-white/80">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Auto-sync match history
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Track rating changes
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Find opponents at your level
                        </li>
                      </ul>
                    </div>
                    <Button 
                      onClick={connectDUPR}
                      size="lg"
                      className="bg-white text-purple-600 hover:bg-white/90 font-semibold shadow-lg"
                    >
                      <LinkIcon className="h-5 w-5 mr-2" />
                      Connect DUPR Account
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Match Stats Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {/* Total Matches */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                        <Trophy className="h-6 w-6 text-blue-600" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Total
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                      {matchStats.totalMatches}
                    </div>
                    <div className="text-sm text-slate-600">Matches Played</div>
                  </CardContent>
                </Card>

                {/* Win Rate */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                        <Target className="h-6 w-6 text-green-600" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Win Rate
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                      {matchStats.winRate}%
                    </div>
                    <div className="text-sm text-slate-600">
                      {matchStats.wins}W - {matchStats.losses}L
                    </div>
                    <Progress value={matchStats.winRate} className="mt-2 h-2" />
                  </CardContent>
                </Card>

                {/* Current Streak */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                        <Activity className="h-6 w-6 text-orange-600" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Streak
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                      {matchStats.currentStreak}
                    </div>
                    <div className="text-sm text-slate-600">Game Streak</div>
                  </CardContent>
                </Card>

                {/* DUPR Rating */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Award className="h-6 w-6" />
                      </div>
                      {matchStats.ratingChange !== 0 && (
                        <Badge className="bg-white/20 text-white border-0 text-xs">
                          {matchStats.ratingChange > 0 ? '+' : ''}{matchStats.ratingChange?.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {matchStats.duprRating ? matchStats.duprRating.toFixed(2) : '--'}
                    </div>
                    <div className="text-sm text-white/80">
                      {user.duprConnected ? 'DUPR Rating' : 'Not Connected'}
                    </div>
                    {user.duprConnected && (
                      <Button
                        onClick={syncDUPR}
                        disabled={isLoading}
                        size="sm"
                        variant="secondary"
                        className="w-full mt-3 text-xs"
                      >
                        {isLoading ? 'Syncing...' : 'Sync Now'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Match History */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Match History</h2>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Plus className="h-5 w-5 mr-2" />
                    Log Match
                  </Button>
                </div>

                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-slate-600 mt-4">Loading matches...</p>
                  </div>
                ) : matches.length > 0 ? (
                  <div className="space-y-4">
                    {matches.map((match, index) => (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card 
                          className="border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer bg-white overflow-hidden group"
                          onClick={() => setSelectedMatch(match)}
                        >
                          <CardContent className="p-0">
                            <div className="flex items-center">
                              {/* Result Indicator */}
                              <div className={`w-2 h-full ${match.result === 'WIN' ? 'bg-gradient-to-b from-green-500 to-emerald-600' : 'bg-gradient-to-b from-red-500 to-rose-600'}`} />
                              
                              <div className="flex-1 p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-4">
                                    {/* Opponent Avatar */}
                                    <div className="relative">
                                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                        {match.opponent?.[0] || 'P'}
                                      </div>
                                      <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-full ${match.result === 'WIN' ? 'bg-green-500' : 'bg-red-500'} shadow-lg`}>
                                        {match.result === 'WIN' ? (
                                          <Trophy className="h-3 w-3 text-white" />
                                        ) : (
                                          <Minus className="h-3 w-3 text-white" />
                                        )}
                                      </div>
                                    </div>

                                    {/* Match Info */}
                                    <div>
                                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                                        vs {match.opponent}
                                      </h3>
                                      <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-4 w-4" />
                                          {new Date(match.date).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric',
                                            year: 'numeric'
                                          })}
                                        </div>
                                        {match.location && (
                                          <>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                              <MapPin className="h-4 w-4" />
                                              {match.location}
                                            </div>
                                          </>
                                        )}
                                        {match.duration && (
                                          <>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                              <Clock className="h-4 w-4" />
                                              {match.duration} min
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Score & Rating */}
                                  <div className="text-right">
                                    <div className={`text-3xl font-bold mb-2 ${match.result === 'WIN' ? 'text-green-600' : 'text-red-600'}`}>
                                      {match.playerScore} - {match.opponentScore}
                                    </div>
                                    {match.duprRatingChange && (
                                      <Badge 
                                        className={`${
                                          match.duprRatingChange > 0 
                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                            : 'bg-red-50 text-red-700 border-red-200'
                                        } gap-1 font-semibold`}
                                      >
                                        {match.duprRatingChange > 0 ? (
                                          <TrendingUp className="h-3 w-3" />
                                        ) : (
                                          <TrendingDown className="h-3 w-3" />
                                        )}
                                        {match.duprRatingChange > 0 ? '+' : ''}{match.duprRatingChange.toFixed(2)}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {/* Match Details */}
                                <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 mt-4">
                                  <div className="grid grid-cols-3 gap-6 flex-1">
                                    {match.score && (
                                      <div>
                                        <div className="text-xs text-slate-600 mb-1">Game Scores</div>
                                        <div className="text-sm font-semibold text-slate-900">{match.score}</div>
                                      </div>
                                    )}
                                    {match.rallies && (
                                      <div>
                                        <div className="text-xs text-slate-600 mb-1">Total Rallies</div>
                                        <div className="text-sm font-semibold text-slate-900">{match.rallies}</div>
                                      </div>
                                    )}
                                    {match.duprSynced && (
                                      <div>
                                        <div className="text-xs text-slate-600 mb-1">DUPR Status</div>
                                        <Badge variant="outline" className="text-xs gap-1">
                                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                                          Synced
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
                                </div>

                                {match.notes && (
                                  <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                                    <div className="text-xs text-amber-800 font-semibold mb-1">Notes</div>
                                    <div className="text-sm text-amber-900">{match.notes}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 shadow-lg bg-white">
                    <CardContent className="p-12 text-center">
                      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                        <Trophy className="h-10 w-10 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">No matches yet</h3>
                      <p className="text-slate-600 mb-6 max-w-md mx-auto">
                        Start tracking your pickleball matches to see your progress and improve your game
                      </p>
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        <Plus className="h-5 w-5 mr-2" />
                        Log Your First Match
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>

            {/* FIND PARTNERS TAB */}
            <TabsContent value="partners" className="space-y-6">
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
            </TabsContent>

            {/* COMMUNITY TAB */}
            <TabsContent value="community" className="space-y-6">
              {/* Community Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-700">{communityStats.totalPlayers.toLocaleString()}</div>
                    <div className="text-sm text-purple-600">Total Players</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-700">{communityStats.activeToday}</div>
                    <div className="text-sm text-green-600">Active Today</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-cyan-50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700">{communityStats.matchesPlayed}</div>
                    <div className="text-sm text-blue-600">Matches This Week</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-red-50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-700">+{communityStats.newMembers}</div>
                    <div className="text-sm text-orange-600">New This Week</div>
                  </CardContent>
                </Card>
              </div>

              {/* Community Features */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-purple-600" />
                      Upcoming Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                      <div className="font-semibold text-purple-900 mb-1">Weekend Tournament</div>
                      <div className="text-sm text-purple-700">Join 64 players this Saturday</div>
                      <Button size="sm" className="mt-3 bg-gradient-to-r from-purple-600 to-pink-600">
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      Groups & Communities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <div className="font-semibold text-green-900 mb-1">Beginner's Circle</div>
                      <div className="text-sm text-green-700">Perfect for new players</div>
                      <Button size="sm" className="mt-3 bg-gradient-to-r from-green-600 to-emerald-600">
                        Join Group
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Avatar Coach */}
      <AvatarCoach userName={user?.firstName || user?.name?.split(' ')[0] || 'Champion'} context="connect" />
    </div>
  )
}
