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
  CheckCircle2,
  ExternalLink
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

// Current tournaments December 2025 - May 2026
const CURRENT_TOURNAMENTS: Tournament[] = [
  {
    id: 'app-fort-lauderdale-2025',
    name: 'APP Fort Lauderdale Open',
    description: 'Major APP Tour event featuring top professional players competing for $150,000 in prize money.',
    organizerName: 'APP Tour',
    organizerEmail: 'info@theapp.global',
    organizerPhone: null,
    status: 'REGISTRATION_OPEN',
    venueName: 'Xtreme Action Park',
    address: '5300 Powerline Rd',
    city: 'Fort Lauderdale',
    state: 'FL',
    zipCode: '33309',
    startDate: '2025-12-18',
    endDate: '2025-12-22',
    registrationStart: '2025-11-01',
    registrationEnd: '2025-12-15',
    format: ['Singles', 'Doubles', 'Mixed Doubles'],
    skillLevels: ['PRO', 'ADVANCED'],
    maxParticipants: 512,
    currentRegistrations: 387,
    entryFee: 150,
    prizePool: 150000,
    websiteUrl: 'https://www.theapp.global/',
    registrationUrl: 'https://www.theapp.global/tournaments',
    imageUrl: '/tournament.jpg',
    distance: null,
    isRegistered: false,
    registrationStatus: null,
    spotsAvailable: 125
  },
  {
    id: 'ppa-championship-finals-2025',
    name: 'PPA Tour Championship Finals',
    description: 'Season-ending championship featuring the top 32 ranked players battling for the largest prize pool of the year.',
    organizerName: 'PPA Tour',
    organizerEmail: 'info@ppatour.com',
    organizerPhone: null,
    status: 'REGISTRATION_OPEN',
    venueName: 'Kay Bailey Hutchison Convention Center',
    address: '650 S Griffin St',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75202',
    startDate: '2025-12-15',
    endDate: '2025-12-17',
    registrationStart: '2025-10-01',
    registrationEnd: '2025-12-10',
    format: ['Singles', 'Doubles', 'Mixed Doubles'],
    skillLevels: ['PRO'],
    maxParticipants: 128,
    currentRegistrations: 112,
    entryFee: 200,
    prizePool: 250000,
    websiteUrl: 'https://www.ppatour.com/',
    registrationUrl: 'https://www.ppatour.com/tournaments',
    imageUrl: '/tournament.jpg',
    distance: null,
    isRegistered: false,
    registrationStatus: null,
    spotsAvailable: 16
  },
  {
    id: 'mlp-miami-slam-2026',
    name: 'MLP Miami Slam',
    description: 'Major League Pickleball team event at the iconic Hard Rock Stadium.',
    organizerName: 'Major League Pickleball',
    organizerEmail: 'info@majorleaguepickleball.net',
    organizerPhone: null,
    status: 'UPCOMING',
    venueName: 'Hard Rock Stadium',
    address: '347 Don Shula Dr',
    city: 'Miami Gardens',
    state: 'FL',
    zipCode: '33056',
    startDate: '2026-01-10',
    endDate: '2026-01-12',
    registrationStart: '2025-12-01',
    registrationEnd: '2026-01-05',
    format: ['Team Event'],
    skillLevels: ['PRO'],
    maxParticipants: 96,
    currentRegistrations: 64,
    entryFee: 0,
    prizePool: 500000,
    websiteUrl: 'https://www.majorleaguepickleball.net/',
    registrationUrl: 'https://www.majorleaguepickleball.net/events',
    imageUrl: '/tournament.jpg',
    distance: null,
    isRegistered: false,
    registrationStatus: null,
    spotsAvailable: 32
  },
  {
    id: 'app-mesa-open-2026',
    name: 'APP Mesa Arizona Open',
    description: 'Kick off the 2026 season in sunny Arizona with top competition.',
    organizerName: 'APP Tour',
    organizerEmail: 'info@theapp.global',
    organizerPhone: null,
    status: 'UPCOMING',
    venueName: 'Bell Bank Park',
    address: '7171 E Sonoran Arroyo Mall',
    city: 'Mesa',
    state: 'AZ',
    zipCode: '85212',
    startDate: '2026-01-16',
    endDate: '2026-01-19',
    registrationStart: '2025-12-01',
    registrationEnd: '2026-01-10',
    format: ['Singles', 'Doubles', 'Mixed Doubles'],
    skillLevels: ['PRO', 'ADVANCED', 'INTERMEDIATE'],
    maxParticipants: 640,
    currentRegistrations: 298,
    entryFee: 125,
    prizePool: 125000,
    websiteUrl: 'https://www.theapp.global/',
    registrationUrl: 'https://www.theapp.global/tournaments',
    imageUrl: '/tournament.jpg',
    distance: null,
    isRegistered: false,
    registrationStatus: null,
    spotsAvailable: 342
  },
  {
    id: 'ppa-texas-open-2026',
    name: 'PPA Texas Open',
    description: 'Major PPA Tour stop in Austin with great weather and fierce competition.',
    organizerName: 'PPA Tour',
    organizerEmail: 'info@ppatour.com',
    organizerPhone: null,
    status: 'UPCOMING',
    venueName: 'Dreamland Dripping Springs',
    address: '2770 Hwy 290 W',
    city: 'Dripping Springs',
    state: 'TX',
    zipCode: '78620',
    startDate: '2026-02-06',
    endDate: '2026-02-09',
    registrationStart: '2025-12-15',
    registrationEnd: '2026-02-01',
    format: ['Singles', 'Doubles', 'Mixed Doubles'],
    skillLevels: ['PRO', 'ADVANCED'],
    maxParticipants: 384,
    currentRegistrations: 156,
    entryFee: 175,
    prizePool: 175000,
    websiteUrl: 'https://www.ppatour.com/',
    registrationUrl: 'https://www.ppatour.com/tournaments',
    imageUrl: '/tournament.jpg',
    distance: null,
    isRegistered: false,
    registrationStatus: null,
    spotsAvailable: 228
  },
  {
    id: 'us-open-2026',
    name: 'US Open Pickleball Championships',
    description: 'The largest pickleball event in the world returns to Naples, Florida.',
    organizerName: 'US Open Pickleball',
    organizerEmail: 'info@usopenpickleball.com',
    organizerPhone: null,
    status: 'UPCOMING',
    venueName: 'East Naples Community Park',
    address: '3500 Thomasson Dr',
    city: 'Naples',
    state: 'FL',
    zipCode: '34112',
    startDate: '2026-04-19',
    endDate: '2026-04-26',
    registrationStart: '2026-01-15',
    registrationEnd: '2026-04-10',
    format: ['Singles', 'Doubles', 'Mixed Doubles'],
    skillLevels: ['PRO', 'ADVANCED', 'INTERMEDIATE', 'BEGINNER'],
    maxParticipants: 3000,
    currentRegistrations: 892,
    entryFee: 95,
    prizePool: 200000,
    websiteUrl: 'https://www.usopenpickleball.com/',
    registrationUrl: 'https://www.usopenpickleball.com/register',
    imageUrl: '/tournament.jpg',
    distance: null,
    isRegistered: false,
    registrationStatus: null,
    spotsAvailable: 2108
  },
  {
    id: 'nationals-indian-wells-2026',
    name: 'USA Pickleball National Championships',
    description: 'The official USA Pickleball national championship tournament.',
    organizerName: 'USA Pickleball',
    organizerEmail: 'info@usapickleball.org',
    organizerPhone: null,
    status: 'UPCOMING',
    venueName: 'Indian Wells Tennis Garden',
    address: '78200 Miles Ave',
    city: 'Indian Wells',
    state: 'CA',
    zipCode: '92210',
    startDate: '2026-05-02',
    endDate: '2026-05-10',
    registrationStart: '2026-02-01',
    registrationEnd: '2026-04-25',
    format: ['Singles', 'Doubles', 'Mixed Doubles'],
    skillLevels: ['PRO', 'ADVANCED', 'INTERMEDIATE', 'BEGINNER'],
    maxParticipants: 2500,
    currentRegistrations: 412,
    entryFee: 85,
    prizePool: 150000,
    websiteUrl: 'https://www.usapickleball.org/',
    registrationUrl: 'https://www.usapickleball.org/events',
    imageUrl: '/tournament.jpg',
    distance: null,
    isRegistered: false,
    registrationStatus: null,
    spotsAvailable: 2088
  },
  {
    id: 'beer-city-open-2026',
    name: 'Beer City Open',
    description: 'One of the largest amateur tournaments in the Midwest.',
    organizerName: 'Beer City Open',
    organizerEmail: 'info@beercityopen.com',
    organizerPhone: null,
    status: 'UPCOMING',
    venueName: 'DeVos Place Convention Center',
    address: '303 Monroe Ave NW',
    city: 'Grand Rapids',
    state: 'MI',
    zipCode: '49503',
    startDate: '2026-03-20',
    endDate: '2026-03-22',
    registrationStart: '2026-01-10',
    registrationEnd: '2026-03-15',
    format: ['Singles', 'Doubles', 'Mixed Doubles'],
    skillLevels: ['ADVANCED', 'INTERMEDIATE', 'BEGINNER'],
    maxParticipants: 1800,
    currentRegistrations: 625,
    entryFee: 65,
    prizePool: 25000,
    websiteUrl: 'https://www.beercityopen.com/',
    registrationUrl: 'https://www.beercityopen.com/register',
    imageUrl: '/tournament.jpg',
    distance: null,
    isRegistered: false,
    registrationStatus: null,
    spotsAvailable: 1175
  },
  {
    id: 'ppa-atlanta-open-2026',
    name: 'PPA Atlanta Open',
    description: 'PPA Tour returns to Atlanta for an exciting spring event.',
    organizerName: 'PPA Tour',
    organizerEmail: 'info@ppatour.com',
    organizerPhone: null,
    status: 'UPCOMING',
    venueName: 'Life Time Athletic',
    address: '3050 Peachtree Rd NW',
    city: 'Atlanta',
    state: 'GA',
    zipCode: '30305',
    startDate: '2026-03-05',
    endDate: '2026-03-08',
    registrationStart: '2026-01-05',
    registrationEnd: '2026-02-28',
    format: ['Singles', 'Doubles', 'Mixed Doubles'],
    skillLevels: ['PRO', 'ADVANCED'],
    maxParticipants: 320,
    currentRegistrations: 178,
    entryFee: 175,
    prizePool: 165000,
    websiteUrl: 'https://www.ppatour.com/',
    registrationUrl: 'https://www.ppatour.com/tournaments',
    imageUrl: '/tournament.jpg',
    distance: null,
    isRegistered: false,
    registrationStatus: null,
    spotsAvailable: 142
  },
  {
    id: 'app-carolina-open-2026',
    name: 'APP Carolina Open',
    description: 'APP Tour comes to beautiful Charlotte, North Carolina.',
    organizerName: 'APP Tour',
    organizerEmail: 'info@theapp.global',
    organizerPhone: null,
    status: 'UPCOMING',
    venueName: 'Freedom Park',
    address: '2435 Cumberland Ave',
    city: 'Charlotte',
    state: 'NC',
    zipCode: '28203',
    startDate: '2026-02-20',
    endDate: '2026-02-23',
    registrationStart: '2026-01-01',
    registrationEnd: '2026-02-15',
    format: ['Singles', 'Doubles', 'Mixed Doubles'],
    skillLevels: ['PRO', 'ADVANCED', 'INTERMEDIATE'],
    maxParticipants: 512,
    currentRegistrations: 234,
    entryFee: 125,
    prizePool: 120000,
    websiteUrl: 'https://www.theapp.global/',
    registrationUrl: 'https://www.theapp.global/tournaments',
    imageUrl: '/tournament.jpg',
    distance: null,
    isRegistered: false,
    registrationStatus: null,
    spotsAvailable: 278
  },
  {
    id: 'vegas-pickleball-open-2026',
    name: 'Las Vegas Pickleball Open',
    description: 'Play in the entertainment capital of the world!',
    organizerName: 'Las Vegas Pickleball',
    organizerEmail: 'info@lvpickleball.com',
    organizerPhone: null,
    status: 'UPCOMING',
    venueName: 'Darling Tennis Center',
    address: '7901 W Washington Ave',
    city: 'Las Vegas',
    state: 'NV',
    zipCode: '89128',
    startDate: '2026-03-12',
    endDate: '2026-03-15',
    registrationStart: '2026-01-15',
    registrationEnd: '2026-03-05',
    format: ['Singles', 'Doubles', 'Mixed Doubles'],
    skillLevels: ['ADVANCED', 'INTERMEDIATE', 'BEGINNER'],
    maxParticipants: 1024,
    currentRegistrations: 456,
    entryFee: 75,
    prizePool: 50000,
    websiteUrl: 'https://www.lvpickleball.com/',
    registrationUrl: 'https://www.lvpickleball.com/register',
    imageUrl: '/tournament.jpg',
    distance: null,
    isRegistered: false,
    registrationStatus: null,
    spotsAvailable: 568
  },
  {
    id: 'midwest-championships-2026',
    name: 'Midwest Regional Championships',
    description: 'Premier regional tournament featuring players from across the Midwest.',
    organizerName: 'USA Pickleball Midwest',
    organizerEmail: 'midwest@usapickleball.org',
    organizerPhone: null,
    status: 'UPCOMING',
    venueName: 'Lifetime Chicago',
    address: '1800 N Clybourn Ave',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60614',
    startDate: '2026-04-03',
    endDate: '2026-04-06',
    registrationStart: '2026-02-01',
    registrationEnd: '2026-03-28',
    format: ['Singles', 'Doubles', 'Mixed Doubles'],
    skillLevels: ['ADVANCED', 'INTERMEDIATE', 'BEGINNER'],
    maxParticipants: 800,
    currentRegistrations: 267,
    entryFee: 70,
    prizePool: 35000,
    websiteUrl: 'https://www.usapickleball.org/',
    registrationUrl: 'https://www.usapickleball.org/events',
    imageUrl: '/tournament.jpg',
    distance: null,
    isRegistered: false,
    registrationStatus: null,
    spotsAvailable: 533
  },
  {
    id: 'pacific-northwest-open-2026',
    name: 'Pacific Northwest Open',
    description: 'Celebrate pickleball in the beautiful Pacific Northwest.',
    organizerName: 'PNW Pickleball',
    organizerEmail: 'info@pnwpickleball.com',
    organizerPhone: null,
    status: 'UPCOMING',
    venueName: 'Seattle Center',
    address: '305 Harrison St',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98109',
    startDate: '2026-05-15',
    endDate: '2026-05-18',
    registrationStart: '2026-03-01',
    registrationEnd: '2026-05-08',
    format: ['Singles', 'Doubles', 'Mixed Doubles'],
    skillLevels: ['ADVANCED', 'INTERMEDIATE', 'BEGINNER'],
    maxParticipants: 600,
    currentRegistrations: 145,
    entryFee: 80,
    prizePool: 40000,
    websiteUrl: 'https://www.pnwpickleball.com/',
    registrationUrl: 'https://www.pnwpickleball.com/register',
    imageUrl: '/tournament.jpg',
    distance: null,
    isRegistered: false,
    registrationStatus: null,
    spotsAvailable: 455
  },
  {
    id: 'arizona-senior-games-2026',
    name: 'Arizona Senior Games Pickleball',
    description: 'Age-bracket tournament for players 50 and over.',
    organizerName: 'Arizona Senior Olympics',
    organizerEmail: 'info@azseniorolympics.org',
    organizerPhone: null,
    status: 'UPCOMING',
    venueName: 'Surprise Tennis & Racquet Complex',
    address: '14469 W Paradise Ln',
    city: 'Surprise',
    state: 'AZ',
    zipCode: '85374',
    startDate: '2026-02-27',
    endDate: '2026-03-01',
    registrationStart: '2026-01-01',
    registrationEnd: '2026-02-20',
    format: ['Singles', 'Doubles', 'Mixed Doubles'],
    skillLevels: ['ADVANCED', 'INTERMEDIATE', 'BEGINNER'],
    maxParticipants: 500,
    currentRegistrations: 312,
    entryFee: 55,
    prizePool: 10000,
    websiteUrl: 'https://www.azseniorolympics.org/',
    registrationUrl: 'https://www.azseniorolympics.org/events',
    imageUrl: '/tournament.jpg',
    distance: null,
    isRegistered: false,
    registrationStatus: null,
    spotsAvailable: 188
  },
  {
    id: 'new-york-open-2026',
    name: 'New York Pickleball Open',
    description: 'The Big Apple hosts its premier pickleball event.',
    organizerName: 'NYC Pickleball',
    organizerEmail: 'info@nycpickleball.com',
    organizerPhone: null,
    status: 'UPCOMING',
    venueName: 'USTA Billie Jean King National Tennis Center',
    address: 'Flushing Meadows Corona Park',
    city: 'Flushing',
    state: 'NY',
    zipCode: '11368',
    startDate: '2026-05-22',
    endDate: '2026-05-25',
    registrationStart: '2026-03-15',
    registrationEnd: '2026-05-15',
    format: ['Singles', 'Doubles', 'Mixed Doubles'],
    skillLevels: ['PRO', 'ADVANCED', 'INTERMEDIATE'],
    maxParticipants: 720,
    currentRegistrations: 198,
    entryFee: 95,
    prizePool: 100000,
    websiteUrl: 'https://www.nycpickleball.com/',
    registrationUrl: 'https://www.nycpickleball.com/register',
    imageUrl: '/tournament.jpg',
    distance: null,
    isRegistered: false,
    registrationStatus: null,
    spotsAvailable: 522
  }
]

// Fake live activity data for demo
const generateLiveActivity = () => {
  const names = ['Sarah M.', 'Mike T.', 'Alex K.', 'Jordan P.', 'Casey R.', 'Taylor S.', 'Morgan L.', 'Jamie W.']
  const actions = [
    { icon: UserPlus, text: 'just registered for', color: 'text-green-500' },
    { icon: Trophy, text: 'won their match at', color: 'text-yellow-500' },
    { icon: Star, text: 'is watching', color: 'text-blue-500' },
    { icon: CheckCircle2, text: 'completed registration for', color: 'text-teal-500' },
  ]
  const tournaments = ['APP Fort Lauderdale Open', 'PPA Championship Finals', 'MLP Miami Slam', 'US Open Pickleball', 'Beer City Open']
  
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

      let tournamentsData: Tournament[] = []
      
      try {
        const response = await fetch(`/api/tournaments?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          tournamentsData = data.tournaments || []
        }
      } catch (apiError) {
        console.log('API unavailable, using fallback data')
      }

      // Use fallback data if API returns empty or fails
      if (tournamentsData.length === 0) {
        tournamentsData = [...CURRENT_TOURNAMENTS]
        
        // Apply filters to fallback data
        if (selectedState !== 'all') {
          tournamentsData = tournamentsData.filter(t => t.state.toUpperCase() === selectedState.toUpperCase())
        }
        if (selectedSkillLevel !== 'all') {
          tournamentsData = tournamentsData.filter(t => t.skillLevels.includes(selectedSkillLevel))
        }
        if (selectedStatus === 'open') {
          tournamentsData = tournamentsData.filter(t => t.status === 'REGISTRATION_OPEN')
        } else if (selectedStatus !== 'all') {
          tournamentsData = tournamentsData.filter(t => t.status === selectedStatus)
        }
        if (selectedFormat !== 'all') {
          tournamentsData = tournamentsData.filter(t => t.format.includes(selectedFormat))
        }
      }
      
      setTournaments(tournamentsData)
      setFilteredTournaments(tournamentsData)
      setAllTournaments(CURRENT_TOURNAMENTS)
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      // Use fallback data on error
      setTournaments(CURRENT_TOURNAMENTS)
      setFilteredTournaments(CURRENT_TOURNAMENTS)
      setAllTournaments(CURRENT_TOURNAMENTS)
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
        <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => router.push('/connect')}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Connect
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/media-center')}
              className="border-2 border-teal-500 text-teal-700 hover:bg-teal-50"
            >
              <Radio className="w-4 h-4 mr-2" />
              Media Center
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="border-2 border-slate-300 hover:bg-slate-50"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
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

            {/* Tournament Map - Full Width at Top */}
            <Card className="border-2 border-teal-200 shadow-lg bg-gradient-to-br from-teal-50 to-white">
              <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 py-4">
                <CardTitle className="flex items-center gap-2 text-white text-xl">
                  <Map className="w-6 h-6" />
                  Tournament Map
                  <Badge className="bg-white/20 text-white border-0 ml-2">
                    <Globe className="w-3 h-3 mr-1" />
                    {Object.keys(tournaments.reduce((acc, t) => {
                      acc[t.state] = true
                      return acc
                    }, {} as Record<string, boolean>)).length} States
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6 pt-4">
                <div className="space-y-4">
                  {/* State Grid - Showing all states with tournaments */}
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {Object.entries(
                      tournaments.reduce((acc, t) => {
                        acc[t.state] = (acc[t.state] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                    )
                    .sort((a, b) => b[1] - a[1])
                    .map(([state, count]) => {
                      const isSelected = selectedMapState === state
                      return (
                        <motion.div
                          key={state}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`p-3 bg-gradient-to-br rounded-lg transition-all cursor-pointer ${
                            isSelected 
                              ? 'from-teal-500 to-cyan-500 border-2 border-teal-700 shadow-lg' 
                              : 'from-teal-100 to-white border-2 border-teal-200 hover:border-teal-400 hover:shadow-md'
                          }`}
                          onClick={() => {
                            setSelectedState(state)
                            const stateName = US_STATES.find(s => s.abbr === state)?.name
                            if (stateName) setSelectedMapState(isSelected ? null : state)
                          }}
                        >
                          <div className="flex flex-col items-center justify-center">
                            <span className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                              {state}
                            </span>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs mt-1 ${
                                isSelected 
                                  ? 'bg-white/30 text-white' 
                                  : 'bg-teal-100 text-teal-700'
                              }`}
                            >
                              {count} {count === 1 ? 'event' : 'events'}
                            </Badge>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                  
                  {/* View Full Map Button */}
                  <div className="flex items-center justify-center pt-2">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full md:w-auto px-8 bg-white hover:bg-teal-50 border-2 border-teal-300 hover:border-teal-500 transition-all"
                      onClick={() => {
                        // Open USA Pickleball tournament finder in new tab
                        window.open('https://usapickleball.org/play/tournament-calendar/', '_blank', 'noopener,noreferrer');
                      }}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      View Full Map
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
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

          {/* Right Column - Stats & Activity Feed (Clean, Non-Overlapping) */}
          <div className="lg:col-span-1">
            <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
              {/* Quick Stats - Always at Top */}
              <div className="grid grid-cols-2 gap-4">
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

              {/* Quick Navigation - Top States */}
              <Card className="border-slate-200 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5 text-teal-600" />
                    Top Locations
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-2">
                    {Object.entries(
                      tournaments.reduce((acc, t) => {
                        acc[t.state] = (acc[t.state] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                    )
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([state, count], idx) => (
                      <div
                        key={state}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedState(state)
                          const stateName = US_STATES.find(s => s.abbr === state)?.name
                          if (stateName) setSelectedMapState(state)
                          // Scroll to tournament grid
                          document.querySelector('.lg\\:col-span-2')?.scrollIntoView({ behavior: 'smooth' })
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            idx === 0 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {idx + 1}
                          </div>
                          <span className="font-semibold text-slate-900 text-sm">{state}</span>
                        </div>
                        <Badge variant="secondary" className="bg-teal-100 text-teal-700 text-xs">
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

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
                  <ScrollArea className="h-[280px]">
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
                <CardContent className="p-4 space-y-3">
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
