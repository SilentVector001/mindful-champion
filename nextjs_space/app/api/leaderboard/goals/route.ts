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

    // Get completed goals counts
    const goalsCompleted = await prisma.goal.groupBy({
      by: ['userId'],
      _count: {
        id: true
      },
      where: {
        status: 'COMPLETED'
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: limit
    })

    // Get user details
    const userIds = goalsCompleted.map(g => g.userId)
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        email: { not: null }
      },
      select: {
        id: true,
        name: true,
        nickname: true,
        image: true,
        skillLevel: true,
        playerRating: true
      }
    })

    const userMap = users.reduce((acc, user) => {
      acc[user.id] = user
      return acc
    }, {})

    const leaderboard = goalsCompleted
      .filter(g => userMap[g.userId])
      .map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        user: {
          name: userMap[entry.userId]?.nickname || userMap[entry.userId]?.name || 'Unknown Player',
          fullName: userMap[entry.userId]?.name,
          image: userMap[entry.userId]?.image,
          skillLevel: userMap[entry.userId]?.skillLevel,
          rating: userMap[entry.userId]?.playerRating
        },
        score: entry._count.id,
        goalsCompleted: entry._count.id
      }))

    // Find user's position
    let userPosition = null

    if (userId) {
      const userGoalCount = await prisma.goal.count({
        where: {
          userId,
          status: 'COMPLETED'
        }
      })

      if (userGoalCount > 0) {
        const usersAbove = await prisma.goal.groupBy({
          by: ['userId'],
          _count: { id: true },
          where: {
            status: 'COMPLETED'
          },
          having: {
            id: {
              _count: { gt: userGoalCount }
            }
          }
        })

        const userRank = usersAbove.length + 1
        const user = users.find(u => u.id === userId)

        if (user) {
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
            score: userGoalCount,
            goalsCompleted: userGoalCount
          }
        }
      }
    }

    return NextResponse.json({
      leaderboard,
      userPosition,
      total: leaderboard.length
    })
  } catch (error) {
    console.error('Error fetching goals leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
