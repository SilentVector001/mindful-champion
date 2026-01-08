// @ts-nocheck
// Real tournament data from official sources: PPA Tour and APP Tour
// Last updated: December 2024

export interface Tournament {
  id: string
  name: string
  location: string
  venue?: string
  startDate: string
  endDate?: string
  prizePool?: number
  points?: number
  type: 'ppa-open' | 'ppa-challenger' | 'app-major' | 'app-tour' | 'app-nextgen' | 'usap' | 'amateur' | 'community'
  tier: 'major' | 'open' | 'challenger' | 'amateur' | 'community'
  registrationUrl: string
  featured?: boolean
  image?: string
  description?: string
  skillLevels?: string[]
}

// PPA Tour 2025 Events (from ppatour.com)
export const PPA_TOUR_2025: Tournament[] = [
  {
    id: "ppa-daytona-2025",
    name: "Florida Dairy Farmers Daytona Beach Open",
    location: "Daytona Beach, FL",
    venue: "Daytona Beach",
    startDate: "2025-11-18",
    endDate: "2025-11-23",
    type: "ppa-open",
    tier: "open",
    registrationUrl: "https://ppatour.com/schedule/",
    featured: true,
    description: "Final stop of the 2025 PPA Tour season"
  },
  {
    id: "ppa-wisconsin-2025",
    name: "Wisconsin PPA Challenger",
    location: "Eau Claire, WI",
    venue: "Lake Hallie Pickleball @ Gower Park",
    startDate: "2025-07-24",
    endDate: "2025-07-27",
    type: "ppa-challenger",
    tier: "challenger",
    registrationUrl: "https://ppatour.com/tournament/2025/2025-eau-claire-wi/",
    skillLevels: ["3.0", "3.5", "4.0", "4.5", "5.0", "Pro"]
  },
  {
    id: "ppa-citrus-2025",
    name: "Citrus Classic PPA Challenger",
    location: "Kissimmee, FL",
    venue: "IHG Orange Lake Resort",
    startDate: "2025-09-05",
    endDate: "2025-09-07",
    type: "ppa-challenger",
    tier: "challenger",
    registrationUrl: "https://ppatour.com/tournament/2025/2025-orlando-fl/",
    skillLevels: ["3.0", "3.5", "4.0", "4.5", "5.0", "Pro"]
  },
  {
    id: "ppa-flower-city-2025",
    name: "PPA Flower City Challenger",
    location: "Fairport, NY",
    venue: "Fairport Pickleball Club",
    startDate: "2025-06-27",
    endDate: "2025-06-29",
    type: "ppa-challenger",
    tier: "challenger",
    registrationUrl: "https://ppatour.com/tournament/2025/2025-fairport-ny/",
    skillLevels: ["3.0", "3.5", "4.0", "4.5", "5.0", "Pro"]
  }
]

// PPA Tour 2026 Events (from ppatour.com)
export const PPA_TOUR_2026: Tournament[] = [
  {
    id: "ppa-punta-gorda-2026",
    name: "Punta Gorda PPA Challenger",
    location: "Punta Gorda, FL",
    venue: "PicklePlex",
    startDate: "2026-01-09",
    endDate: "2026-01-11",
    type: "ppa-challenger",
    tier: "challenger",
    registrationUrl: "https://ppatour.com/schedule/",
    featured: true
  },
  {
    id: "ppa-carvana-masters-2026",
    name: "The Carvana Masters Powered by Invited",
    location: "Rancho Mirage, CA",
    venue: "Mission Hills Country Club",
    startDate: "2026-01-12",
    endDate: "2026-01-18",
    points: 2000,
    type: "ppa-open",
    tier: "major",
    registrationUrl: "https://ppatour.com/schedule/",
    featured: true,
    description: "Premier 2,000 point event"
  },
  {
    id: "ppa-indoor-nationals-2026",
    name: "Indoor National Championships",
    location: "Lakeville, MN",
    venue: "Life Time Lakeville Minnesota",
    startDate: "2026-01-19",
    endDate: "2026-01-25",
    points: 1000,
    type: "ppa-open",
    tier: "open",
    registrationUrl: "https://ppatour.com/schedule/",
    featured: true
  },
  {
    id: "ppa-tucson-2026",
    name: "Tucson PPA Challenger",
    location: "Tucson, AZ",
    venue: "South Kino Sports Complex",
    startDate: "2026-01-23",
    endDate: "2026-01-25",
    type: "ppa-challenger",
    tier: "challenger",
    registrationUrl: "https://ppatour.com/schedule/"
  },
  {
    id: "ppa-cape-coral-2026",
    name: "Cape Coral Open",
    location: "Cape Coral, FL",
    venue: "Cape Coral Pickleball Center",
    startDate: "2026-02-09",
    endDate: "2026-02-15",
    points: 1000,
    type: "ppa-open",
    tier: "open",
    registrationUrl: "https://ppatour.com/schedule/"
  },
  {
    id: "ppa-mesa-cup-2026",
    name: "Carvana Mesa Cup",
    location: "Mesa, AZ",
    venue: "Arizona Athletic Grounds",
    startDate: "2026-02-16",
    endDate: "2026-02-22",
    points: 1500,
    type: "ppa-open",
    tier: "major",
    registrationUrl: "https://ppatour.com/schedule/"
  },
  {
    id: "ppa-houston-2026",
    name: "Houston PPA Challenger",
    location: "Atascocita, TX",
    venue: "Life Time Kingwood Pickleball",
    startDate: "2026-02-20",
    endDate: "2026-02-22",
    type: "ppa-challenger",
    tier: "challenger",
    registrationUrl: "https://ppatour.com/schedule/"
  },
  {
    id: "ppa-newport-beach-2026",
    name: "Newport Beach Open",
    location: "Newport Beach, CA",
    venue: "Tennis Club at Newport Beach",
    startDate: "2026-03-02",
    endDate: "2026-03-08",
    points: 1000,
    type: "ppa-open",
    tier: "open",
    registrationUrl: "https://ppatour.com/schedule/"
  },
  {
    id: "ppa-texas-open-2026",
    name: "Veolia Texas Open",
    location: "McKinney, TX",
    venue: "The Courts of McKinney",
    startDate: "2026-03-09",
    endDate: "2026-03-15",
    points: 1000,
    type: "ppa-open",
    tier: "open",
    registrationUrl: "https://ppatour.com/schedule/"
  },
  {
    id: "ppa-greater-zion-2026",
    name: "Greater Zion Cup at Black Desert Resort",
    location: "Ivins, UT",
    venue: "Black Desert Resort",
    startDate: "2026-03-23",
    endDate: "2026-03-29",
    points: 1500,
    type: "ppa-open",
    tier: "major",
    registrationUrl: "https://ppatour.com/schedule/"
  },
  {
    id: "ppa-sacramento-2026",
    name: "Sacramento Open",
    location: "Sacramento, CA",
    venue: "Life Time Arden",
    startDate: "2026-04-13",
    endDate: "2026-04-19",
    points: 1000,
    type: "ppa-open",
    tier: "open",
    registrationUrl: "https://ppatour.com/schedule/"
  },
  {
    id: "ppa-atlanta-2026",
    name: "Atlanta Pickleball Championships",
    location: "Peachtree Corners, GA",
    venue: "Life Time Peachtree Corners",
    startDate: "2026-04-27",
    endDate: "2026-05-03",
    points: 2000,
    type: "ppa-open",
    tier: "major",
    registrationUrl: "https://ppatour.com/schedule/"
  },
  {
    id: "ppa-finals-2026",
    name: "PPA Finals",
    location: "San Clemente, CA",
    venue: "Life Time Rancho San Clemente",
    startDate: "2026-05-04",
    endDate: "2026-05-10",
    points: 2000,
    type: "ppa-open",
    tier: "major",
    registrationUrl: "https://ppatour.com/schedule/",
    featured: true,
    description: "Season-ending championship event"
  }
]

// APP Tour 2025 Events (from theapp.global)
export const APP_TOUR_2025: Tournament[] = [
  {
    id: "app-next-san-antonio-2025",
    name: "APP Next San Antonio",
    location: "San Antonio, TX",
    venue: "Chicken N Pickle San Antonio",
    startDate: "2025-02-13",
    endDate: "2025-02-16",
    type: "app-nextgen",
    tier: "amateur",
    registrationUrl: "https://www.theapp.global/tour",
    description: "For aspiring pros aged 23 and under"
  },
  {
    id: "app-collegiate-2025",
    name: "APP U.S. Collegiate Championships",
    location: "Cape Coral, FL",
    venue: "Cape Coral",
    startDate: "2025-03-28",
    endDate: "2025-03-30",
    type: "app-tour",
    tier: "open",
    registrationUrl: "https://www.theapp.global/tour-schedule/2025-app-us-collegiate-championships",
    description: "32 teams from regional qualifiers compete"
  },
  {
    id: "app-fort-lauderdale-2025",
    name: "APP Fort Lauderdale Open",
    location: "Fort Lauderdale, FL",
    venue: "The Fort - APP Global Headquarters",
    startDate: "2025-04-02",
    endDate: "2025-04-06",
    type: "app-major",
    tier: "major",
    registrationUrl: "https://www.theapp.global/tour-schedule/2025-app-fort-lauderdale-open",
    featured: true,
    description: "First Major of the year at The Fort"
  },
  {
    id: "app-vlasic-cincinnati-2025",
    name: "APP Vlasic Classic - Cincinnati",
    location: "Cincinnati, OH",
    startDate: "2025-05-07",
    endDate: "2025-05-11",
    type: "app-tour",
    tier: "open",
    registrationUrl: "https://www.theapp.global/tour"
  },
  {
    id: "app-nyc-open-2025",
    name: "Zimmer Biomet APP New York City Open",
    location: "New York, NY",
    venue: "Billie Jean King National Tennis Center",
    startDate: "2025-05-20",
    endDate: "2025-05-25",
    type: "app-major",
    tier: "major",
    registrationUrl: "https://www.theapp.global/tour",
    featured: true,
    description: "Major tournament at iconic NYC venue"
  },
  {
    id: "app-next-st-louis-2025",
    name: "APP Next St. Louis",
    location: "St. Louis, MO",
    venue: "Chicken N Pickle St. Louis",
    startDate: "2025-06-19",
    endDate: "2025-06-22",
    type: "app-nextgen",
    tier: "amateur",
    registrationUrl: "https://www.theapp.global/tour"
  },
  {
    id: "app-newport-beach-2025",
    name: "Zimmer Biomet APP Newport Beach Open",
    location: "Newport Beach, CA",
    startDate: "2025-07-02",
    endDate: "2025-07-06",
    type: "app-major",
    tier: "major",
    registrationUrl: "https://www.theapp.global/tour",
    featured: true
  },
  {
    id: "app-next-kansas-city-2025",
    name: "APP Next Kansas City",
    location: "Overland Park, KS",
    venue: "Chicken N Pickle Overland Park",
    startDate: "2025-07-17",
    endDate: "2025-07-20",
    type: "app-nextgen",
    tier: "amateur",
    registrationUrl: "https://www.theapp.global/tour"
  },
  {
    id: "app-great-lakes-2025",
    name: "APP Great Lakes Open",
    location: "Midland, MI",
    venue: "Greater Midland Tennis Center",
    startDate: "2025-08-13",
    endDate: "2025-08-17",
    type: "app-tour",
    tier: "open",
    registrationUrl: "https://www.theapp.global/tour"
  },
  {
    id: "app-chicago-2025",
    name: "APP Chicago Open",
    location: "Chicago, IL",
    venue: "Danny Cunniff Park and Club Pickle and Padel",
    startDate: "2025-08-27",
    endDate: "2025-08-31",
    type: "app-tour",
    tier: "open",
    registrationUrl: "https://www.theapp.global/tour-schedule/2025-app-chicago-open",
    description: "Returns to APP headquarters city"
  },
  {
    id: "app-womens-open-2025",
    name: "APP Women's Open",
    location: "TBA",
    venue: "Pickle & Chill",
    startDate: "2025-10-03",
    endDate: "2025-10-05",
    type: "app-tour",
    tier: "open",
    registrationUrl: "https://www.theapp.global/tour"
  },
  {
    id: "app-aarp-open-2025",
    name: "AARP Open",
    location: "Fort Lauderdale, FL",
    venue: "The Fort",
    startDate: "2025-10-08",
    endDate: "2025-10-12",
    type: "app-tour",
    tier: "open",
    registrationUrl: "https://www.theapp.global/tour"
  },
  {
    id: "app-next-dallas-2025",
    name: "APP Next Dallas",
    location: "Grapevine, TX",
    venue: "Chicken N Pickle Grapevine",
    startDate: "2025-10-30",
    endDate: "2025-11-02",
    type: "app-nextgen",
    tier: "amateur",
    registrationUrl: "https://www.theapp.global/tour"
  },
  {
    id: "app-mesa-2025",
    name: "APP Mesa Open",
    location: "Mesa, AZ",
    venue: "Arizona Athletic Grounds",
    startDate: "2025-11-05",
    endDate: "2025-11-09",
    type: "app-tour",
    tier: "open",
    registrationUrl: "https://www.theapp.global/tour"
  },
  {
    id: "app-next-fort-lauderdale-2025",
    name: "APP Next Fort Lauderdale",
    location: "Fort Lauderdale, FL",
    venue: "The Fort",
    startDate: "2025-12-05",
    endDate: "2025-12-07",
    type: "app-nextgen",
    tier: "amateur",
    registrationUrl: "https://www.theapp.global/tour"
  },
  {
    id: "app-tour-championships-2025",
    name: "GEICO APP Tour Championships",
    location: "Fort Lauderdale, FL",
    venue: "The Fort - APP Global Headquarters",
    startDate: "2025-12-09",
    endDate: "2025-12-14",
    type: "app-major",
    tier: "major",
    registrationUrl: "https://www.theapp.global/tour-schedule/2025-app-tour-championships",
    featured: true,
    description: "Season-ending Major championship"
  }
]

// Combined and sorted tournaments
export const ALL_TOURNAMENTS: Tournament[] = [
  ...PPA_TOUR_2025,
  ...PPA_TOUR_2026,
  ...APP_TOUR_2025
].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

// Featured tournaments (for homepage display)
export const FEATURED_TOURNAMENTS: Tournament[] = ALL_TOURNAMENTS.filter(t => t.featured)

// Get tournaments by type
export function getTournamentsByType(type: Tournament['type']): Tournament[] {
  return ALL_TOURNAMENTS.filter(t => t.type === type)
}

// Get tournaments by tier
export function getTournamentsByTier(tier: Tournament['tier']): Tournament[] {
  return ALL_TOURNAMENTS.filter(t => t.tier === tier)
}

// Get upcoming tournaments (from today)
export function getUpcomingTournaments(limit?: number): Tournament[] {
  const today = new Date()
  const upcoming = ALL_TOURNAMENTS.filter(t => new Date(t.startDate) >= today)
  return limit ? upcoming.slice(0, limit) : upcoming
}

// Calculate real stats from tournament data
export function calculateTournamentStats() {
  const uniqueStates = new Set<string>()
  let totalPrize = 0
  
  ALL_TOURNAMENTS.forEach(t => {
    // Extract state from location
    const match = t.location?.match(/,\s*([A-Z]{2})$/)
    if (match) uniqueStates.add(match[1])
    if (t.prizePool) totalPrize += t.prizePool
    if (t.points) totalPrize += t.points * 100 // Estimate prize from points
  })
  
  return {
    totalTournaments: ALL_TOURNAMENTS.length,
    statesCovered: uniqueStates.size,
    totalPrize,
    majorEvents: ALL_TOURNAMENTS.filter(t => t.tier === 'major').length,
    ppaTourEvents: ALL_TOURNAMENTS.filter(t => t.type?.startsWith('ppa')).length,
    appTourEvents: ALL_TOURNAMENTS.filter(t => t.type?.startsWith('app')).length
  }
}

// External search URLs for when tournaments aren't found
export const EXTERNAL_SEARCH_URLS = {
  ppa: 'https://ppatour.com/schedule/',
  app: 'https://www.theapp.global/tour',
  usap: 'https://usapickleball.org/events/',
  google: (query: string) => `https://www.google.com/search?q=${encodeURIComponent(query + ' pickleball tournament')}`
}
