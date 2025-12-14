import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { TournamentStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get featured tournaments (upcoming or in progress, ordered by prize pool)
    const featuredTournaments = await prisma.tournament.findMany({
      where: {
        OR: [
          { status: TournamentStatus.REGISTRATION_OPEN },
          { status: TournamentStatus.IN_PROGRESS },
          { status: TournamentStatus.UPCOMING },
        ],
      },
      orderBy: [
        { prizePool: 'desc' },
        { startDate: 'asc' },
      ],
      take: 6, // Top 6 featured
    })

    return NextResponse.json({ tournaments: featuredTournaments })
  } catch (error) {
    console.error('Error fetching featured tournaments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured tournaments', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
