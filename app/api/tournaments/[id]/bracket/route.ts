import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateRounds, getRoundName } from '@/lib/bracket-generator'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get tournament with matches
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        matches: {
          orderBy: [
            { roundNumber: 'asc' },
            { matchNumber: 'asc' }
          ]
        },
        registrations: {
          where: {
            status: 'CONFIRMED'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                skillLevel: true
              }
            }
          }
        }
      }
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Organize matches by round
    const matchesByRound: { [key: number]: any[] } = {}
    tournament.matches?.forEach((match) => {
      if (!matchesByRound[match.roundNumber]) {
        matchesByRound[match.roundNumber] = []
      }
      matchesByRound[match.roundNumber].push(match)
    })

    // Calculate tournament statistics
    const totalMatches = tournament.matches?.length ?? 0
    const completedMatches = tournament.matches?.filter((m) => m.status === 'COMPLETED').length ?? 0
    const liveMatches = tournament.matches?.filter((m) => m.isLive).length ?? 0
    const progress = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0

    // Get round names
    const totalRounds = tournament.matches && tournament.matches.length > 0
      ? Math.max(...tournament.matches.map(m => m.roundNumber))
      : 0

    const rounds = Object.keys(matchesByRound).map((roundNum) => {
      const roundNumber = parseInt(roundNum)
      const matches = matchesByRound[roundNumber]
      const isWinnerBracket = matches?.[0]?.isWinnerBracket ?? true

      return {
        roundNumber,
        roundName: getRoundName(roundNumber, totalRounds, isWinnerBracket),
        isWinnerBracket,
        matches: matches ?? [],
        completedMatches: matches?.filter((m) => m.status === 'COMPLETED').length ?? 0,
        totalMatches: matches?.length ?? 0
      }
    })

    return NextResponse.json({
      tournament: {
        id: tournament.id,
        name: tournament.name,
        description: tournament.description,
        bracketFormat: tournament.bracketFormat,
        status: tournament.status,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        venueName: tournament.venueName,
        city: tournament.city,
        state: tournament.state,
        currentRegistrations: tournament.currentRegistrations,
        maxParticipants: tournament.maxParticipants,
        prizePool: tournament.prizePool,
        bracketGenerated: tournament.bracketGenerated,
        winnerId: tournament.winnerId,
        runnerUpId: tournament.runnerUpId,
      },
      bracket: {
        rounds,
        totalRounds,
        totalMatches,
        completedMatches,
        liveMatches,
        progress,
      },
      players: tournament.registrations?.map((reg) => ({
        id: reg.userId,
        name: reg.user?.name ?? 'Player',
        skillLevel: reg.user?.skillLevel,
        format: reg.format,
        registeredAt: reg.registeredAt,
      })) ?? [],
    })
  } catch (error) {
    console.error('Error fetching bracket:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bracket', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
