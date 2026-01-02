import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getNextMatchPosition, getLoserBracketPosition } from '@/lib/bracket-generator'

export const dynamic = 'force-dynamic'

// Get match details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; matchId: string } }
) {
  try {
    const { matchId } = params

    const match = await prisma.bracketMatch.findUnique({
      where: { id: matchId },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            bracketFormat: true,
            venueName: true
          }
        }
      }
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    return NextResponse.json({ match })
  } catch (error) {
    console.error('Error fetching match:', error)
    return NextResponse.json(
      { error: 'Failed to fetch match', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// Update match score
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; matchId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, matchId } = params
    const body = await request.json()
    const { player1Score, player2Score, status, courtNumber, courtLocation, scheduledTime, notes } = body

    // Get current match
    const match = await prisma.bracketMatch.findUnique({
      where: { id: matchId },
      include: {
        tournament: true
      }
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}

    if (player1Score !== undefined) updateData.player1Score = parseInt(player1Score)
    if (player2Score !== undefined) updateData.player2Score = parseInt(player2Score)
    if (status) updateData.status = status
    if (courtNumber) updateData.courtNumber = courtNumber
    if (courtLocation) updateData.courtLocation = courtLocation
    if (scheduledTime) updateData.scheduledTime = new Date(scheduledTime)
    if (notes !== undefined) updateData.notes = notes

    // If match is being completed, determine winner
    if (status === 'COMPLETED' && player1Score !== undefined && player2Score !== undefined) {
      const p1Score = parseInt(player1Score)
      const p2Score = parseInt(player2Score)

      if (p1Score > p2Score) {
        updateData.winnerId = match.player1Id
        updateData.winnerName = match.player1Name
      } else if (p2Score > p1Score) {
        updateData.winnerId = match.player2Id
        updateData.winnerName = match.player2Name
      }

      updateData.endTime = new Date()

      // Update next match with winner
      if (updateData.winnerId && updateData.winnerName) {
        await advanceWinnerToNextMatch(
          match,
          updateData.winnerId,
          updateData.winnerName,
          match.tournament?.bracketFormat ?? 'SINGLE_ELIMINATION'
        )
      }

      // For double elimination, handle loser bracket
      if (match.tournament?.bracketFormat === 'DOUBLE_ELIMINATION' && match.isWinnerBracket) {
        const loserId = p1Score > p2Score ? match.player2Id : match.player1Id
        const loserName = p1Score > p2Score ? match.player2Name : match.player1Name

        if (loserId && loserName) {
          await advanceLoserToLoserBracket(match, loserId, loserName)
        }
      }
    }

    // If match is starting
    if (status === 'IN_PROGRESS' && !match.startTime) {
      updateData.startTime = new Date()
      updateData.isLive = true
    }

    // Update match
    const updatedMatch = await prisma.bracketMatch.update({
      where: { id: matchId },
      data: updateData
    })

    // Check if tournament is complete (finals match completed)
    if (status === 'COMPLETED') {
      await checkTournamentCompletion(match.tournamentId)
    }

    return NextResponse.json({
      success: true,
      match: updatedMatch,
    })
  } catch (error) {
    console.error('Error updating match:', error)
    return NextResponse.json(
      { error: 'Failed to update match', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// Helper: Advance winner to next match
async function advanceWinnerToNextMatch(
  currentMatch: any,
  winnerId: string,
  winnerName: string,
  bracketFormat: string
) {
  const nextPosition = getNextMatchPosition(currentMatch, bracketFormat as any)

  if (!nextPosition) return // Finals - no next match

  // Find next match
  const nextMatch = await prisma.bracketMatch.findFirst({
    where: {
      tournamentId: currentMatch.tournamentId,
      bracketPosition: nextPosition
    }
  })

  if (nextMatch) {
    // Determine if winner goes to player1 or player2 slot
    const updateData: any = {}

    if (!nextMatch.player1Id) {
      updateData.player1Id = winnerId
      updateData.player1Name = winnerName
    } else if (!nextMatch.player2Id) {
      updateData.player2Id = winnerId
      updateData.player2Name = winnerName
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.bracketMatch.update({
        where: { id: nextMatch.id },
        data: updateData
      })
    }
  }
}

// Helper: Advance loser to loser bracket (double elimination)
async function advanceLoserToLoserBracket(
  currentMatch: any,
  loserId: string,
  loserName: string
) {
  const loserPosition = getLoserBracketPosition(currentMatch)

  if (!loserPosition) return

  // Find loser bracket match
  const loserMatch = await prisma.bracketMatch.findFirst({
    where: {
      tournamentId: currentMatch.tournamentId,
      bracketPosition: loserPosition
    }
  })

  if (loserMatch) {
    const updateData: any = {}

    if (!loserMatch.player1Id) {
      updateData.player1Id = loserId
      updateData.player1Name = loserName
    } else if (!loserMatch.player2Id) {
      updateData.player2Id = loserId
      updateData.player2Name = loserName
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.bracketMatch.update({
        where: { id: loserMatch.id },
        data: updateData
      })
    }
  }
}

// Helper: Check if tournament is complete
async function checkTournamentCompletion(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      matches: {
        orderBy: { roundNumber: 'desc' }
      }
    }
  })

  if (!tournament) return

  // Find the finals match (highest round number in winner bracket)
  const finalsMatch = tournament.matches?.find(
    (m) => m.isWinnerBracket && m.roundNumber === Math.max(...tournament.matches.map(m => m.isWinnerBracket ? m.roundNumber : 0))
  )

  if (finalsMatch?.status === 'COMPLETED' && finalsMatch.winnerId) {
    // Determine runner-up
    const runnerUpId = finalsMatch.winnerId === finalsMatch.player1Id
      ? finalsMatch.player2Id
      : finalsMatch.player1Id

    // Update tournament
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        status: 'COMPLETED',
        winnerId: finalsMatch.winnerId,
        runnerUpId: runnerUpId ?? undefined
      }
    })
  }
}
