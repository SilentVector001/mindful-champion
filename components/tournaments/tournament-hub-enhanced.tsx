'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TournamentCard } from './tournament-card'
import { TournamentDetail } from './tournament-detail'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Search, 
  MapPin, 
  Filter, 
  Calendar,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  ArrowLeft,
  TrendingUp,
  Users,
  DollarSign,
  Star,
  Sparkles,
  Zap,
  Globe,
  Activity,
  Clock,
  ChevronRight,
  Flame,
  Target,
  Award,
  Map,
  Radio,
  Bell,
  UserPlus,
  CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'
import CompactNotificationCenter from '@/components/notifications/compact-notification-center'

interface Tournament {
  id: string
  name: string
  description: string | null
  organizerName: string
  organizerEmail: string | null
  organizerPhone: string | null
  status: string
  venueName: string
  address: string
  city: string
  state: string
  zipCode: string
  startDate: string
  endDate: string
  registrationStart: string
  registrationEnd: string
  format: string[]
  skillLevels: string[]
  maxParticipants: number | null
  currentRegistrations: number
  entryFee: number | null
  prizePool: number | null
  websiteUrl: string | null
  registrationUrl: string | null
  imageUrl: string | null
  distance: number | null
  isRegistered: boolean
  registrationStatus: string | null
  spotsAvailable: number | null
}

// Fake live activity data for demo
const generateLiveActivity = () => {
  const names = ['Sarah M.', 'Mike T.', 'Alex K.', 'Jordan P.', 'Casey R.', 'Taylor S.', 'Morgan L.', 'Jamie W.']
  const actions = [
    { icon: UserPlus, text: 'just registered for', color: 'text-green-500' },
    { icon: Trophy, text: 'won their match at', color: 'text-yellow-500' },
    { icon: Star, text: 'is watching', color: 'text-blue-500' },
    { icon: CheckCircle2, text: 'completed registration for', color: 'text-teal-500' },
  ]
  const tournaments = ['Texas State Championships', 'Florida Open', 'California Classic', 'Arizona Cup', 'Nevada Nationals']
  
  return {
    id: Math.random().toString(),
    name: names[Math.floor(Math.random() * names.length)],
    action: actions[Math.floor(Math.random() * actions.length)],
    tournament: tournaments[Math.floor(Math.random() * tournaments.length)],
    time: 'Just now'
  }
}

// US States with coordinates for the map
const US_STATES = [
  { abbr: 'WA', name: 'Washington', x: 12, y: 8 },
  { abbr: 'OR', name: 'Oregon', x: 10, y: 16 },
  { abbr: 'CA', name: 'California', x: 8, y: 32 },
  { abbr: 'NV', name: 'Nevada', x: 14, y: 28 },
  { abbr: 'ID', name: 'Idaho', x: 18, y: 14 },
  { abbr: 'MT', name: 'Montana', x: 26, y: 8 },
  { abbr: 'WY', name: 'Wyoming', x: 28, y: 18 },
  { abbr: 'UT', name: 'Utah', x: 20, y: 28 },
  { abbr: 'AZ', name: 'Arizona', x: 18, y: 40 },
  { abbr: 'CO', name: 'Colorado', x: 30, y: 30 },
  { abbr: 'NM', name: 'New Mexico', x: 28, y: 42 },
  { abbr: 'TX', name: 'Texas', x: 40, y: 48 },
  { abbr: 'OK', name: 'Oklahoma', x: 42, y: 38 },
  { abbr: 'KS', name: 'Kansas', x: 42, y: 30 },
  { abbr: 'NE', name: 'Nebraska', x: 40, y: 22 },
  { abbr: 'SD', name: 'South Dakota', x: 40, y: 14 },
  { abbr: 'ND', name: 'North Dakota', x: 40, y: 6 },
  { abbr: 'MN', name: 'Minnesota', x: 50, y: 10 },
  { abbr: 'IA', name: 'Iowa', x: 52, y: 22 },
  { abbr: 'MO', name: 'Missouri', x: 52, y: 32 },
  { abbr: 'AR', name: 'Arkansas', x: 52, y: 42 },
  { abbr: 'LA', name: 'Louisiana', x: 52, y: 52 },
  { abbr: 'WI', name: 'Wisconsin', x: 58, y: 14 },
  { abbr: 'IL', name: 'Illinois', x: 58, y: 26 },
  { abbr: 'MS', name: 'Mississippi', x: 58, y: 46 },
  { abbr: 'MI', name: 'Michigan', x: 66, y: 16 },
  { abbr: 'IN', name: 'Indiana', x: 64, y: 28 },
  { abbr: 'KY', name: 'Kentucky', x: 66, y: 34 },
  { abbr: 'TN', name: 'Tennessee', x: 66, y: 40 },
  { abbr: 'AL', name: 'Alabama', x: 64, y: 48 },
  { abbr: 'OH', name: 'Ohio', x: 72, y: 28 },
  { abbr: 'WV', name: 'West Virginia', x: 76, y: 32 },
  { abbr: 'VA', name: 'Virginia', x: 80, y: 36 },
  { abbr: 'NC', name: 'North Carolina', x: 80, y: 42 },
  { abbr: 'SC', name: 'South Carolina', x: 78, y: 48 },
  { abbr: 'GA', name: 'Georgia', x: 74, y: 50 },
  { abbr: 'FL', name: 'Florida', x: 78, y: 62 },
  { abbr: 'PA', name: 'Pennsylvania', x: 80, y: 24 },
  { abbr: 'NY', name: 'New York', x: 84, y: 18 },
  { abbr: 'VT', name: 'Vermont', x: 88, y: 10 },
  { abbr: 'NH', name: 'New Hampshire', x: 90, y: 12 },
  { abbr: 'ME', name: 'Maine', x: 94, y: 6 },
  { abbr: 'MA', name: 'Massachusetts', x: 92, y: 18 },
  { abbr: 'CT', name: 'Connecticut', x: 90, y: 22 },
  { abbr: 'RI', name: 'Rhode Island', x: 94, y: 20 },
  { abbr: 'NJ', name: 'New Jersey', x: 86, y: 26 },
  { abbr: 'DE', name: 'Delaware', x: 86, y: 30 },
  { abbr: 'MD', name: 'Maryland', x: 84, y: 32 },
]

export function TournamentHubEnhanced() {
  const router = useRouter()
  const { data: session } = useSession() || {}
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([])
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([])
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [liveActivities, setLiveActivities] = useState<any[]>([])
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const [selectedMapState, setSelectedMapState] = useState<string | null>(null)

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState<string>('all')
  const [selectedState, setSelectedState] = useState<string>('all')
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('open')
  const [selectedFormat, setSelectedFormat] = useState<string>('all')
  const [maxDistance, setMaxDistance] = useState<number[]>([100])
  const [useLocation, setUseLocation] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)

  const cities = Array.from(new Set(tournaments.map(t => t.city))).sort()
  const states = Array.from(new Set(tournaments.map(t => t.state))).sort()

  // Generate tournament counts by state
  const tournamentsByState = allTournaments.reduce((acc, t) => {
    const state = t.state?.toUpperCase()
    if (state) {
      acc[state] = (acc[state] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  // Live activity simulation
  useEffect(() => {
    // Initial activities
    const initial = Array.from({ length: 5 }, generateLiveActivity)
    setLiveActivities(initial)

    // Add new activities periodically
    const interval = setInterval(() => {
      setLiveActivities(prev => {
        const newActivity = generateLiveActivity()
        return [newActivity, ...prev.slice(0, 9)]
      })
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchTournaments()
  }, [selectedState, selectedSkillLevel, selectedStatus, selectedFormat, userLocation, maxDistance])

  useEffect(() => {
    applyFilters()
  }, [tournaments, searchQuery, selectedCity])

  const fetchTournaments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (selectedState !== 'all') params.append('state', selectedState)
      if (selectedSkillLevel !== 'all') params.append('skillLevel', selectedSkillLevel)
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'open') {
          params.append('status', 'REGISTRATION_OPEN')
        } else {
          params.append('status', selectedStatus)
        }
      }
      if (selectedFormat !== 'all') params.append('format', selectedFormat)
      
      if (useLocation && userLocation) {
        params.append('lat', userLocation.lat.toString())
        params.append('lon', userLocation.lon.toString())
        params.append('maxDistance', maxDistance[0].toString())
      }

      const response = await fetch(`/api/tournaments?${params.toString()}`)
      
      if (!response.ok) throw new Error('Failed to fetch tournaments')

      const data = await response.json()
      setTournaments(data.tournaments || [])
      setFilteredTournaments(data.tournaments || [])

      const allResponse = await fetch('/api/tournaments')
      if (allResponse.ok) {
        const allData = await allResponse.json()
        setAllTournaments(allData.tournaments || [])
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      toast.error('Failed to load tournaments')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...tournaments]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.city.toLowerCase().includes(query) ||
        t.zipCode.toLowerCase().includes(query) ||
        t.venueName.toLowerCase().includes(query) ||
        t.organizerName.toLowerCase().includes(query) ||
        t.state.toLowerCase().includes(query)
      )
    }

    if (selectedCity !== 'all') {
      filtered = filtered.filter(t => t.city === selectedCity)
    }

    setFilteredTournaments(filtered)
  }

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
          setUseLocation(true)
          toast.success('Location updated')
        },
        (error) => {
          console.error('Error getting location:', error)
          toast.error('Could not get your location')
          setLoading(false)
        }
      )
    } else {
      toast.error('Geolocation is not supported by your browser')
    }
  }

  const handleRegistrationUpdate = (tournamentId: string, registered: boolean) => {
    setTournaments(prev => 
      prev.map(t => 
        t.id === tournamentId 
          ? { ...t, isRegistered: registered, currentRegistrations: registered ? t.currentRegistrations + 1 : t.currentRegistrations - 1 }
          : t
      )
    )
    if (selectedTournament?.id === tournamentId) {
      setSelectedTournament(prev => 
        prev ? { ...prev, isRegistered: registered } : null
      )
    }
  }

  const handleMapStateClick = (stateAbbr: string) => {
    const stateName = US_STATES.find(s => s.abbr === stateAbbr)?.name
    if (stateName) {
      setSelectedState(stateName)
      setSelectedMapState(stateAbbr)
    }
  }

  const getStateColor = (abbr: string) => {
    const count = tournamentsByState[abbr] || 0
    if (count === 0) return 'fill-slate-200'
    if (count >= 5) return 'fill-teal-600'
    if (count >= 3) return 'fill-teal-500'
    if (count >= 1) return 'fill-teal-400'
    return 'fill-slate-200'
  }

  const totalPrizePool = allTournaments.reduce((acc, t) => acc + (t.prizePool || 0), 0)
  const totalRegistrations = allTournaments.reduce((acc, t) => acc + t.currentRegistrations, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 overflow-x-hidden">
      <div className="container mx-auto py-6 px-4 max-w-[1600px] relative">
        {/* Navigation */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/connect')}
            className="hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Connect
          </Button>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-teal-700 bg-clip-text text-transparent">
                  Tournament Hub
                </h1>
                <p className="text-slate-600 text-sm">
                  Find and register for pickleball tournaments near you
                </p>
              </div>
            </div>
            {/* Compact Notification Center */}
            <CompactNotificationCenter position="relative" />
          </div>
        </div>

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tournament List */}
          <div className="lg:col-span-2 space-y-4">

            {/* Search and Filters Card */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search tournaments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10"
                      />
                    </div>
                    <Button
                      variant={useLocation ? "default" : "outline"}
                      size="default"
                      onClick={handleGetLocation}
                      className="h-10"
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      {useLocation ? 'Using Location' : 'Near Me'}
                    </Button>
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => setShowFilters(!showFilters)}
                      className="h-10"
                    >
                      <SlidersHorizontal className="w-4 h-4 mr-1" />
                      Filters
                    </Button>
                  </div>

                  {/* Filter Panel */}
                  <AnimatePresence>
                    {showFilters && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Select value={selectedState} onValueChange={setSelectedState}>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="State" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All States</SelectItem>
                                {states.map(state => (
                                  <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Select value={selectedSkillLevel} onValueChange={setSelectedSkillLevel}>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Skill Level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Levels</SelectItem>
                                <SelectItem value="BEGINNER">Beginner</SelectItem>
                                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                <SelectItem value="ADVANCED">Advanced</SelectItem>
                                <SelectItem value="PRO">Pro</SelectItem>
                              </SelectContent>
                            </Select>

                            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Format" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Formats</SelectItem>
                                <SelectItem value="SINGLES">Singles</SelectItem>
                                <SelectItem value="DOUBLES">Doubles</SelectItem>
                                <SelectItem value="MIXED_DOUBLES">Mixed</SelectItem>
                              </SelectContent>
                            </Select>

                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="UPCOMING">Upcoming</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Results Count */}
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>
                      Showing <strong>{filteredTournaments.length}</strong> tournaments
                      {selectedMapState && (
                        <Badge variant="secondary" className="ml-2">
                          {US_STATES.find(s => s.abbr === selectedMapState)?.name}
                          <button 
                            onClick={() => { setSelectedMapState(null); setSelectedState('all'); }}
                            className="ml-1 hover:text-red-500"
                          >×</button>
                        </Badge>
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tournament Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : filteredTournaments.length === 0 ? (
              <Card className="border-slate-200">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-xl font-bold mb-2">No tournaments found</h3>
                  <p className="text-slate-600 mb-4">Try adjusting your filters or search</p>
                  <Button 
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCity('all')
                      setSelectedState('all')
                      setSelectedSkillLevel('all')
                      setSelectedFormat('all')
                      setSelectedStatus('open')
                      setSelectedMapState(null)
                    }}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onClick={() => setSelectedTournament(tournament)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Interactive Map & Activity Feed */}
          <div className="lg:col-span-1 space-y-4">
            {/* Interactive US Map */}
            <Card className="border-2 border-teal-200 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 py-3">
                <CardTitle className="flex items-center gap-2 text-white text-lg">
                  <Globe className="w-5 h-5" />
                  Tournament Map
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-gradient-to-br from-slate-50 to-teal-50">
                {/* SVG US Map */}
                <div className="relative aspect-[4/3] bg-white rounded-lg border border-slate-200 p-4">
                  <svg viewBox="0 0 100 70" className="w-full h-full">
                    {/* Map background */}
                    <rect x="0" y="0" width="100" height="70" fill="#f8fafc" rx="2" />
                    
                    {/* State dots */}
                    {US_STATES.map((state) => {
                      const count = tournamentsByState[state.abbr] || 0
                      const isHovered = hoveredState === state.abbr
                      const isSelected = selectedMapState === state.abbr
                      
                      return (
                        <g key={state.abbr}>
                          {/* Pulse animation for states with tournaments */}
                          {count > 0 && (
                            <circle
                              cx={state.x}
                              cy={state.y}
                              r={isHovered || isSelected ? 6 : 4}
                              className={`${count >= 3 ? 'animate-pulse' : ''} transition-all duration-300`}
                              fill={count >= 5 ? '#0d9488' : count >= 3 ? '#14b8a6' : count >= 1 ? '#5eead4' : '#e2e8f0'}
                              opacity={0.3}
                            />
                          )}
                          {/* Main dot */}
                          <circle
                            cx={state.x}
                            cy={state.y}
                            r={isHovered || isSelected ? 4 : count > 0 ? 3 : 2}
                            className={`cursor-pointer transition-all duration-200 ${
                              isSelected ? 'fill-orange-500' :
                              isHovered ? 'fill-teal-600' :
                              count >= 5 ? 'fill-teal-600' :
                              count >= 3 ? 'fill-teal-500' :
                              count >= 1 ? 'fill-teal-400' :
                              'fill-slate-300'
                            }`}
                            stroke={isHovered || isSelected ? '#fff' : 'none'}
                            strokeWidth={1}
                            onMouseEnter={() => setHoveredState(state.abbr)}
                            onMouseLeave={() => setHoveredState(null)}
                            onClick={() => handleMapStateClick(state.abbr)}
                          />
                          {/* State label on hover */}
                          {(isHovered || isSelected) && (
                            <text
                              x={state.x}
                              y={state.y - 6}
                              textAnchor="middle"
                              className="text-[3px] font-bold fill-slate-700"
                            >
                              {state.abbr}
                            </text>
                          )}
                        </g>
                      )
                    })}
                  </svg>
                  
                  {/* Hover tooltip */}
                  <AnimatePresence>
                    {hoveredState && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-2 left-2 bg-white/95 backdrop-blur rounded-lg shadow-lg p-2 border border-teal-200"
                      >
                        <div className="font-bold text-slate-900 text-sm">
                          {US_STATES.find(s => s.abbr === hoveredState)?.name}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Trophy className="w-3 h-3 text-teal-600" />
                          {tournamentsByState[hoveredState] || 0} tournaments
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-teal-600" />
                    <span>5+</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-teal-400" />
                    <span>1-4</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                    <span>None</span>
                  </div>
                </div>

                {/* Click to filter hint */}
                <p className="text-center text-xs text-slate-500 mt-2">
                  Click a state to filter tournaments
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-slate-200 bg-gradient-to-br from-teal-50 to-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <Trophy className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{allTournaments.length}</div>
                      <div className="text-xs text-slate-600">Tournaments</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-gradient-to-br from-amber-50 to-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">${(totalPrizePool / 1000).toFixed(0)}k</div>
                      <div className="text-xs text-slate-600">Prize Pool</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Activity Feed */}
            <Card className="border-2 border-orange-200 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-pink-500 py-3">
                <CardTitle className="flex items-center gap-2 text-white text-lg">
                  <Activity className="w-5 h-5" />
                  Live Activity
                  <Badge className="bg-white/20 text-white border-0 ml-auto animate-pulse">
                    <Radio className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                  <div className="divide-y divide-slate-100">
                    {liveActivities.map((activity, idx) => (
                      <motion.div
                        key={activity.id}
                        initial={idx === 0 ? { opacity: 0, x: -20 } : false}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full bg-slate-100 ${activity.action.color}`}>
                            <activity.action.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">
                              <span className="font-semibold text-slate-900">{activity.name}</span>
                              <span className="text-slate-600"> {activity.action.text} </span>
                              <span className="font-medium text-teal-700">{activity.tournament}</span>
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Hot Tournaments */}
            <Card className="border-2 border-red-200 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 py-3">
                <CardTitle className="flex items-center gap-2 text-white text-lg">
                  <Flame className="w-5 h-5" />
                  Trending Now
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {allTournaments.slice(0, 3).map((t, idx) => (
                  <div 
                    key={t.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedTournament(t)}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : 'bg-amber-700'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.city}, {t.state}</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {t.currentRegistrations}/{t.maxParticipants || '∞'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tournament Detail Modal */}
        {selectedTournament && (
          <TournamentDetail
            tournament={selectedTournament}
            open={!!selectedTournament}
            onClose={() => setSelectedTournament(null)}
            onRegistrationUpdate={handleRegistrationUpdate}
          />
        )}
      </div>
    </div>
  )
}
