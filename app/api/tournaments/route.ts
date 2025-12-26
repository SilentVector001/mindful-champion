import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { TournamentStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

// Map state abbreviations to full names
const STATE_ABBR_TO_NAME: Record<string, string> = {
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const stateParam = searchParams.get('state')
    const limit = searchParams.get('limit')
    const type = searchParams.get('type') // championship, amateur, etc.

    const where: any = {}

    if (status) {
      where.status = status as TournamentStatus
    }

    // Support both abbreviation (FL) and full name (Florida)
    if (stateParam) {
      const stateName = STATE_ABBR_TO_NAME[stateParam.toUpperCase()] || stateParam
      where.state = stateName
    }

    // Fetch tournaments
    const tournaments = await prisma.tournament.findMany({
      where,
      orderBy: {
        startDate: 'asc',
      },
      take: limit ? parseInt(limit) : undefined,
    })

    // Calculate statistics
    const stats = await prisma.tournament.aggregate({
      _sum: {
        prizePool: true,
        currentRegistrations: true,
      },
      _count: true,
    })

    // Get unique states count
    const statesCount = await prisma.tournament.groupBy({
      by: ['state'],
      _count: true,
    })

    return NextResponse.json({
      tournaments,
      stats: {
        totalTournaments: stats._count || 0,
        totalPrizeMoney: stats._sum?.prizePool || 0,
        totalParticipants: stats._sum?.currentRegistrations || 0,
        statesCovered: statesCount.length,
      },
    })
  } catch (error) {
    console.error('Error fetching tournaments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournaments', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
