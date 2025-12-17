import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { TournamentStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const state = searchParams.get('state')
    const limit = searchParams.get('limit')
    const type = searchParams.get('type') // championship, amateur, etc.

    const where: any = {}

    if (status) {
      where.status = status as TournamentStatus
    }

    if (state) {
      where.state = state
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
