import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { TournamentStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

// Map full state names to abbreviations (database stores abbreviations)
const STATE_NAME_TO_ABBR: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
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
    // Database stores state abbreviations, so we need to convert full names to abbreviations
    if (stateParam) {
      // If it's already an abbreviation (2 characters), use it as-is
      // If it's a full name, convert to abbreviation
      const stateAbbr = stateParam.length === 2 
        ? stateParam.toUpperCase() 
        : STATE_NAME_TO_ABBR[stateParam] || stateParam
      where.state = stateAbbr
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
