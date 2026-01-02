//@ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const userId = session?.user?.id

    // Get top streaks
    const topPlayers = await prisma.user.findMany({
      take: limit,
      orderBy: { currentStreak: 'desc' },
      where: {
        currentStreak: { gt: 0 },
        email: { not: null }
      },
      select: {
        id: true,
        name: true,
        nickname: true,
        image: true,
        skillLevel: true,
        playerRating: true,
        currentStreak: true,
        lastActiveDate: true
      }
    })

    const leaderboard = topPlayers.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      user: {
        name: user.nickname || user.name || 'Unknown Player',
        fullName: user.name,
        image: user.image,
        skillLevel: user.skillLevel,
        rating: user.playerRating
      },
      score: user.currentStreak,
      streak: user.currentStreak,
      lastActive: user.lastActiveDate
    }))

    // Find user's position
    let userPosition = null
    let nearbyPlayers = []

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          nickname: true,
          image: true,
          skillLevel: true,
          playerRating: true,
          currentStreak: true,
          lastActiveDate: true
        }
      })

      if (user) {
        const usersAbove = await prisma.user.count({
          where: {
            currentStreak: { gt: user.currentStreak }
          }
        })

        const userRank = usersAbove + 1

        userPosition = {
          rank: userRank,
          userId: user.id,
          user: {
            name: user.nickname || user.name || 'You',
            fullName: user.name,
            image: user.image,
            skillLevel: user.skillLevel,
            rating: user.playerRating
          },
          score: user.currentStreak,
          streak: user.currentStreak,
          lastActive: user.lastActiveDate
        }
      }
    }

    return NextResponse.json({
      leaderboard,
      userPosition,
      nearbyPlayers,
      total: leaderboard.length
    })
  } catch (error) {
    console.error('Error fetching streak leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
