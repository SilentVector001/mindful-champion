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

    // Get drill completion counts
    const drillCompletions = await prisma.drillCompletion.groupBy({
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
    const userIds = drillCompletions.map(d => d.userId).filter(id => id)
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

    const leaderboard = drillCompletions
      .filter(d => d.userId && userMap[d.userId])
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
        drillsCompleted: entry._count.id
      }))

    // Find user's position
    let userPosition = null

    if (userId) {
      const userDrillCount = await prisma.drillCompletion.count({
        where: {
          userId,
          status: 'COMPLETED'
        }
      })

      if (userDrillCount > 0) {
        const usersAbove = await prisma.drillCompletion.groupBy({
          by: ['userId'],
          _count: { id: true },
          where: {
            status: 'COMPLETED'
          },
          having: {
            id: {
              _count: { gt: userDrillCount }
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
            score: userDrillCount,
            drillsCompleted: userDrillCount
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
    console.error('Error fetching training leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
