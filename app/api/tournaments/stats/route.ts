import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Map full state names to abbreviations
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

export async function GET() {
  try {
    // Get aggregate statistics
    const aggregateStats = await prisma.tournament.aggregate({
      _sum: {
        prizePool: true,
        currentRegistrations: true,
        maxParticipants: true,
      },
      _count: true,
    })

    // Get unique states count with tournament counts per state
    const statesCount = await prisma.tournament.groupBy({
      by: ['state'],
      _count: true,
    })

    // Get count by status
    const statusCounts = await prisma.tournament.groupBy({
      by: ['status'],
      _count: true,
    })

    const totalPrizeMoney = aggregateStats._sum?.prizePool || 0
    const totalTournaments = aggregateStats._count || 0
    const statesCovered = statesCount.length
    const totalRegistrations = aggregateStats._sum?.currentRegistrations || 0

    // Build state counts map with abbreviations as keys
    const stateCounts: Record<string, number> = {}
    statesCount.forEach((item: any) => {
      const abbr = STATE_NAME_TO_ABBR[item.state] || item.state
      stateCounts[abbr] = item._count
    })

    // Format the response
    return NextResponse.json({
      totalPrizeMoney,
      totalTournaments,
      statesCovered,
      totalRegistrations,
      totalPrize: totalPrizeMoney, // Alias for frontend compatibility
      averagePrizePool: totalTournaments > 0 ? totalPrizeMoney / totalTournaments : 0,
      statusBreakdown: statusCounts.reduce((acc: any, item: any) => {
        acc[item.status] = item._count
        return acc
      }, {}),
      stateCounts, // Per-state tournament counts with abbreviations as keys
    })
  } catch (error) {
    console.error('Error fetching tournament stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournament stats', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
