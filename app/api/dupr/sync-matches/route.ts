
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, duprId: true, duprConnected: true }
    })

    if (!user?.duprConnected || !user.duprId) {
      return NextResponse.json(
        { error: 'DUPR account not connected' },
        { status: 400 }
      )
    }

    // In production, fetch matches from DUPR API
    // For now, we'll create simulated match history
    const simulatedMatches = [
      {
        opponent: "John Smith",
        score: "11-9, 11-7",
        result: "WIN",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        location: "Riverside Courts",
        duprRatingChange: 0.08
      },
      {
        opponent: "Sarah Johnson",
        score: "8-11, 11-9, 9-11",
        result: "LOSS",
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        location: "City Park",
        duprRatingChange: -0.04
      },
      {
        opponent: "Mike Davis",
        score: "11-5, 11-6",
        result: "WIN",
        date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
        location: "Community Center",
        duprRatingChange: 0.12
      },
      {
        opponent: "Emily Chen",
        score: "11-9, 9-11, 11-8",
        result: "WIN",
        date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 28 days ago
        location: "Riverside Courts",
        duprRatingChange: 0.06
      },
      {
        opponent: "Tom Wilson",
        score: "7-11, 10-12",
        result: "LOSS",
        date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
        location: "Tennis Club",
        duprRatingChange: -0.03
      }
    ]

    // Create matches in database
    for (const matchData of simulatedMatches) {
      await prisma.match.create({
        data: {
          userId: user.id,
          opponent: matchData.opponent,
          score: matchData.score,
          result: matchData.result,
          date: matchData.date,
          location: matchData.location,
          duprRatingChange: matchData.duprRatingChange,
          duprSynced: true
        }
      })
    }

    // Update last synced timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { duprLastSynced: new Date() }
    })

    // Fetch all matches
    const matches = await prisma.match.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json({ success: true, matches })
  } catch (error: any) {
    console.error('Match sync error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync matches' },
      { status: 500 }
    )
  }
}
