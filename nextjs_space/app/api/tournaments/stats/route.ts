import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

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

    // Get unique states count
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

    // Format the response
    return NextResponse.json({
      totalPrizeMoney,
      totalTournaments,
      statesCovered,
      totalRegistrations,
      averagePrizePool: totalTournaments > 0 ? totalPrizeMoney / totalTournaments : 0,
      statusBreakdown: statusCounts.reduce((acc: any, item: any) => {
        acc[item.status] = item._count
        return acc
      }, {}),
    })
  } catch (error) {
    console.error('Error fetching tournament stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournament stats', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
