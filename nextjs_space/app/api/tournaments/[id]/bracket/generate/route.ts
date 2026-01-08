// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  generateSingleEliminationBracket,
  generateDoubleEliminationBracket,
  Player,
} from '@/lib/bracket-generator'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Get tournament with registrations
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        registrations: {
          where: {
            status: 'CONFIRMED'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        matches: true
      }
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Check if bracket already generated
    if (tournament.bracketGenerated && tournament.matches && tournament.matches.length > 0) {
      return NextResponse.json(
        { error: 'Bracket already generated' },
        { status: 400 }
      )
    }

    // Check if there are enough players
    if (!tournament.registrations || tournament.registrations.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 players to generate bracket' },
        { status: 400 }
      )
    }

    // Prepare players list
    const players: Player[] = tournament.registrations.map((reg, index) => ({
      id: reg.userId,
      name: reg.user?.name ?? 'Player ' + (index + 1),
      seed: index + 1 // Simple seeding by registration order
    }))

    // Generate bracket based on format
    let bracketMatches
    if (tournament.bracketFormat === 'DOUBLE_ELIMINATION') {
      bracketMatches = generateDoubleEliminationBracket(players)
    } else {
      bracketMatches = generateSingleEliminationBracket(players)
    }

    // Create matches in database
    const createdMatches = await prisma.$transaction(
      bracketMatches.map((match) =>
        prisma.bracketMatch.create({
          data: {
            tournamentId: id,
            roundNumber: match.roundNumber,
            matchNumber: match.matchNumber,
            bracketPosition: match.bracketPosition,
            isWinnerBracket: match.isWinnerBracket,
            player1Id: match.player1Id,
            player1Name: match.player1Name,
            player2Id: match.player2Id,
            player2Name: match.player2Name,
            status: match.player1Id && match.player2Id ? 'SCHEDULED' : 'SCHEDULED',
          },
        })
      )
    )

    // Update tournament status
    await prisma.tournament.update({
      where: { id },
      data: {
        bracketGenerated: true,
        status: 'IN_PROGRESS'
      }
    })

    return NextResponse.json({
      success: true,
      matchesCreated: createdMatches.length,
      matches: createdMatches,
    })
  } catch (error) {
    console.error('Error generating bracket:', error)
    return NextResponse.json(
      { error: 'Failed to generate bracket', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
