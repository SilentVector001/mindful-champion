
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { TournamentCard } from './tournament-card'
import { TournamentDetail } from './tournament-detail'
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
  Sparkles
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

export function TournamentHub() {
  const router = useRouter()
  const { data: session } = useSession() || {}
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([])
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([]) // For featured tournaments
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

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

  // Extract unique values for filters
  const cities = Array.from(new Set(tournaments.map(t => t.city))).sort()
  const states = Array.from(new Set(tournaments.map(t => t.state))).sort()

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
      
      if (!response.ok) {
        throw new Error('Failed to fetch tournaments')
      }

      const data = await response.json()
      setTournaments(data.tournaments || [])
      setFilteredTournaments(data.tournaments || [])

      // Also fetch all tournaments for featured section (no filters)
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

    // Search filter - now includes ZIP code
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

    // City filter
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 overflow-x-hidden">
      <div className="container mx-auto py-8 px-4 max-w-7xl relative">
        {/* Navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/connect')}
            className="mb-4 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Connect
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-teal-700 bg-clip-text text-transparent">
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

        {/* Search and Filters */}
        <Card className="mb-6 border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search by tournament name, city, ZIP code, or venue..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base"
                  />
                </div>
                <Button
                  variant={useLocation ? "default" : "outline"}
                  size="lg"
                  onClick={handleGetLocation}
                  className="h-12 px-6"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  {useLocation ? 'Using Location' : 'Use My Location'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-12 px-6"
                >
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* State Filter */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">State</label>
                      <Select value={selectedState} onValueChange={setSelectedState}>
                        <SelectTrigger>
                          <SelectValue placeholder="All States" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All States</SelectItem>
                          {states.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* City Filter */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">City</label>
                      <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Cities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Cities</SelectItem>
                          {cities.map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Skill Level Filter */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Skill Level</label>
                      <Select value={selectedSkillLevel} onValueChange={setSelectedSkillLevel}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="BEGINNER">Beginner</SelectItem>
                          <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                          <SelectItem value="ADVANCED">Advanced</SelectItem>
                          <SelectItem value="PRO">Pro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Format Filter */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Format</label>
                      <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Formats" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Formats</SelectItem>
                          <SelectItem value="SINGLES">Singles</SelectItem>
                          <SelectItem value="DOUBLES">Doubles</SelectItem>
                          <SelectItem value="MIXED_DOUBLES">Mixed Doubles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Registration Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Tournaments</SelectItem>
                          <SelectItem value="open">Registration Open</SelectItem>
                          <SelectItem value="UPCOMING">Upcoming</SelectItem>
                          <SelectItem value="REGISTRATION_CLOSED">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Distance Slider (only when using location) */}
                  {useLocation && (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-medium text-slate-700">
                          Maximum Distance
                        </label>
                        <Badge variant="secondary" className="font-mono">
                          {maxDistance[0]} miles
                        </Badge>
                      </div>
                      <Slider
                        value={maxDistance}
                        onValueChange={setMaxDistance}
                        min={10}
                        max={500}
                        step={10}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Results Count */}
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div>
                  Showing <span className="font-semibold text-slate-900">{filteredTournaments.length}</span> tournaments
                </div>
                {useLocation && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span>Sorted by distance</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tournament Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="space-y-6">
            {/* No Results Message */}
            <Card className="border-slate-200 bg-gradient-to-br from-white to-slate-50">
              <CardContent className="py-12 text-center">
                <div className="mb-6">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-teal-500" />
                  <h3 className="text-2xl font-bold mb-2 text-slate-900">No tournaments found in your area</h3>
                  <p className="text-slate-600 mb-4 max-w-md mx-auto">
                    We couldn't find any tournaments matching your search criteria. Try adjusting your filters or check out featured tournaments below.
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCity('all')
                      setSelectedState('all')
                      setSelectedSkillLevel('all')
                      setSelectedFormat('all')
                      setSelectedStatus('open')
                      setUseLocation(false)
                    }}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tournament Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-slate-200 bg-gradient-to-br from-teal-50 to-white">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-teal-100 rounded-xl">
                      <Trophy className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{allTournaments.length}</div>
                      <div className="text-sm text-slate-600">Total Tournaments</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">
                        {allTournaments.reduce((acc, t) => acc + t.currentRegistrations, 0)}
                      </div>
                      <div className="text-sm text-slate-600">Total Registrations</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-gradient-to-br from-amber-50 to-white">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-100 rounded-xl">
                      <DollarSign className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">
                        ${allTournaments.reduce((acc, t) => acc + (t.prizePool || 0), 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-600">Total Prize Money</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Featured & Upcoming Tournaments */}
            {allTournaments.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  <h2 className="text-2xl font-bold text-slate-900">Featured Upcoming Tournaments</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allTournaments
                    .filter(t => t.status === 'REGISTRATION_OPEN' || t.status === 'UPCOMING')
                    .slice(0, 6)
                    .map((tournament) => (
                      <TournamentCard
                        key={tournament.id}
                        tournament={tournament}
                        onClick={() => setSelectedTournament(tournament)}
                      />
                    ))}
                </div>

                {/* Tournament Tips */}
                <Card className="mt-6 border-slate-200 bg-gradient-to-br from-purple-50 via-white to-teal-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-purple-600" />
                      Tournament Tips & Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2">🎯 How to Find Your Perfect Tournament</h3>
                        <ul className="text-sm text-slate-600 space-y-1">
                          <li>• Use the location button to find tournaments near you</li>
                          <li>• Filter by your skill level for the best competition</li>
                          <li>• Check registration deadlines - spots fill up fast!</li>
                          <li>• Look for tournaments with formats you enjoy</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2">📅 Tournament Season Highlights</h3>
                        <ul className="text-sm text-slate-600 space-y-1">
                          <li>• Spring & Fall: Peak tournament season</li>
                          <li>• Summer: Regional championships and major events</li>
                          <li>• Winter: Indoor tournaments in colder regions</li>
                          <li>• Year-round: Check back regularly for new listings</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2">💡 First-Time Tournament Tips</h3>
                        <ul className="text-sm text-slate-600 space-y-1">
                          <li>• Arrive early to warm up and check in</li>
                          <li>• Bring extra paddles and comfortable shoes</li>
                          <li>• Stay hydrated and pack snacks</li>
                          <li>• Review the format and rules beforehand</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2">🏆 What to Expect</h3>
                        <ul className="text-sm text-slate-600 space-y-1">
                          <li>• Most tournaments offer multiple skill brackets</li>
                          <li>• Formats include singles, doubles, and mixed</li>
                          <li>• Entry fees typically cover venue and prizes</li>
                          <li>• Great opportunity to meet other players!</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                onClick={() => setSelectedTournament(tournament)}
              />
            ))}
          </div>
        )}

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
