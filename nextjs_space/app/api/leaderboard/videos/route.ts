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

    // Get video analysis counts
    const videoAnalysis = await prisma.VideoAnalysis.groupBy({
      by: ['userId'],
      _count: {
        id: true
      },
      where: {
        analysisStatus: { in: ['ANALYZED', 'COMPLETED'] }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: limit
    })

    // Get user details
    const userIds = videoAnalysis.map(v => v.userId)
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

    const leaderboard = videoAnalysis
      .filter(v => userMap[v.userId])
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
        videosAnalyzed: entry._count.id
      }))

    // Find user's position
    let userPosition = null

    if (userId) {
      const userVideoCount = await prisma.VideoAnalysis.count({
        where: {
          userId,
          analysisStatus: { in: ['ANALYZED', 'COMPLETED'] }
        }
      })

      if (userVideoCount > 0) {
        const usersAbove = await prisma.VideoAnalysis.groupBy({
          by: ['userId'],
          _count: { id: true },
          where: {
            analysisStatus: { in: ['ANALYZED', 'COMPLETED'] }
          },
          having: {
            id: {
              _count: { gt: userVideoCount }
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
            score: userVideoCount,
            videosAnalyzed: userVideoCount
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
    console.error('Error fetching video leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
