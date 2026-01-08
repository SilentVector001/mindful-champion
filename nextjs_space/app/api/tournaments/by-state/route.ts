// @ts-nocheck
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Full list of US states for mapping
const US_STATES_MAP: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
}

// Helper to extract state abbreviation from location string
function extractState(location?: string | null): string | null {
  if (!location) return null
  const match = location.match(/,\s*([A-Z]{2})(?:\s|$)/)
  return match ? match[1] : null
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch ALL upcoming tournaments to properly extract states
    const upcomingTournaments = await prisma.tournament.findMany({
      where: {
        startDate: {
          gte: new Date()
        }
      },
      select: {
        id: true,
        state: true,
        location: true,
      }
    })

    // Count tournaments by state (using extracted state from location if state field is null)
    const stateCounts: Record<string, number> = {}
    
    upcomingTournaments.forEach(tournament => {
      // Use state field if available, otherwise extract from location
      const state = (tournament.state || extractState(tournament.location))?.toUpperCase()
      if (state) {
        stateCounts[state] = (stateCounts[state] || 0) + 1
      }
    })

    // Build the states array with real counts
    const statesWithEvents = Object.entries(stateCounts)
      .map(([abbr, count]) => ({
        abbr,
        name: US_STATES_MAP[abbr] || abbr,
        events: count
      }))
      .filter(s => s.events > 0)
      .sort((a, b) => b.events - a.events)

    // Add states with 0 events (that have no tournaments)
    const statesWithEventsAbbrs = new Set(statesWithEvents?.map(s => s?.abbr))
    const allStates = [
      ...statesWithEvents,
      ...Object.entries(US_STATES_MAP)
        .filter(([abbr]) => !statesWithEventsAbbrs?.has(abbr))
        .map(([abbr, name]) => ({ abbr, name, events: 0 }))
    ]

    // Sort by event count descending
    allStates?.sort((a, b) => (b?.events ?? 0) - (a?.events ?? 0))

    // Calculate total stats
    const totalEvents = statesWithEvents?.reduce((sum, s) => sum + (s?.events ?? 0), 0) || 0
    const statesWithTournaments = statesWithEvents?.length || 0

    return NextResponse.json({
      states: allStates,
      totalEvents,
      statesWithTournaments
    })
  } catch (error) {
    console.error('Error fetching tournaments by state:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournament data by state' },
      { status: 500 }
    )
  }
}
