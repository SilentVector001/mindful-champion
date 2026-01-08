// @ts-nocheck
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateTournamentStats, ALL_TOURNAMENTS } from '@/lib/tournaments-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get aggregate statistics from database
    const aggregateStats = await prisma.tournament.aggregate({
      _sum: {
        prizePool: true,
        currentRegistrations: true,
        maxParticipants: true,
      },
      _count: true,
    })

    // Get unique states count from database
    const statesCount = await prisma.tournament.groupBy({
      by: ['state'],
      _count: true,
    })

    const dbTotalTournaments = aggregateStats._count || 0

    // If database has no tournaments, use real static data stats
    if (dbTotalTournaments === 0) {
      const staticStats = calculateTournamentStats()
      return NextResponse.json({
        totalPrizeMoney: staticStats.totalPrize,
        totalPrize: staticStats.totalPrize,
        totalTournaments: staticStats.totalTournaments,
        statesCovered: staticStats.statesCovered,
        totalRegistrations: 0,
        averagePrizePool: staticStats.totalPrize / staticStats.totalTournaments,
        ppaTourEvents: staticStats.ppaTourEvents,
        appTourEvents: staticStats.appTourEvents,
        majorEvents: staticStats.majorEvents,
      })
    }

    const totalPrizeMoney = aggregateStats._sum?.prizePool || 0
    const totalTournaments = dbTotalTournaments
    const statesCovered = statesCount.length
    const totalRegistrations = aggregateStats._sum?.currentRegistrations || 0

    // Get count by status
    const statusCounts = await prisma.tournament.groupBy({
      by: ['status'],
      _count: true,
    })

    return NextResponse.json({
      totalPrizeMoney,
      totalPrize: totalPrizeMoney,
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
    // Fallback to static data on error
    const staticStats = calculateTournamentStats()
    return NextResponse.json({
      totalPrizeMoney: staticStats.totalPrize,
      totalPrize: staticStats.totalPrize,
      totalTournaments: staticStats.totalTournaments,
      statesCovered: staticStats.statesCovered,
      totalRegistrations: 0,
      averagePrizePool: staticStats.totalPrize / staticStats.totalTournaments,
    })
  }
}
