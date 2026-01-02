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
    const period = searchParams.get('period') || 'all' // all, weekly, monthly
    const limit = parseInt(searchParams.get('limit') || '100')
    const userId = session?.user?.id

    let orderBy: any = { totalXP: 'desc' }
    if (period === 'weekly') {
      orderBy = { weeklyXP: 'desc' }
    } else if (period === 'monthly') {
      orderBy = { monthlyXP: 'desc' }
    }

    // Get top players
    const topPlayers = await prisma.userXP.findMany({
      take: limit,
      orderBy
    })

    // Get user details
    const userIds = topPlayers.map(p => p.userId)
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
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

    // Format leaderboard with ranks
    const leaderboard = topPlayers
      .filter(entry => userMap[entry.userId])
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
        totalXP: entry.totalXP,
        weeklyXP: entry.weeklyXP,
        monthlyXP: entry.monthlyXP,
        level: entry.level,
        score: period === 'weekly' ? entry.weeklyXP : period === 'monthly' ? entry.monthlyXP : entry.totalXP
      }))

    // Find user's position if logged in
    let userPosition = null
    let nearbyPlayers = []
    
    if (userId) {
      const userXP = await prisma.userXP.findUnique({
        where: { userId }
      })

      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          nickname: true,
          image: true,
          skillLevel: true,
          playerRating: true
        }
      })

      if (userXP) {
        // Calculate user's rank
        let rankField = 'totalXP'
        let userScore = userXP.totalXP
        if (period === 'weekly') {
          rankField = 'weeklyXP'
          userScore = userXP.weeklyXP
        } else if (period === 'monthly') {
          rankField = 'monthlyXP'
          userScore = userXP.monthlyXP
        }

        const playersAbove = await prisma.userXP.count({
          where: {
            [rankField]: { gt: userScore }
          }
        })

        const userRank = playersAbove + 1

        userPosition = {
          rank: userRank,
          userId: userXP.userId,
          user: {
            name: currentUser?.nickname || currentUser?.name || 'You',
            fullName: currentUser?.name,
            image: currentUser?.image,
            skillLevel: currentUser?.skillLevel,
            rating: currentUser?.playerRating
          },
          totalXP: userXP.totalXP,
          weeklyXP: userXP.weeklyXP,
          monthlyXP: userXP.monthlyXP,
          level: userXP.level,
          score: userScore
        }

        // Get nearby players (5 above, 5 below)
        if (userRank > 3) {
          const playersNearby = await prisma.userXP.findMany({
            take: 11,
            skip: Math.max(0, userRank - 6),
            orderBy
          })

          const nearbyUserIds = playersNearby.map(p => p.userId)
          const nearbyUsers = await prisma.user.findMany({
            where: {
              id: { in: nearbyUserIds }
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

          const nearbyUserMap = nearbyUsers.reduce((acc, user) => {
            acc[user.id] = user
            return acc
          }, {})

          nearbyPlayers = playersNearby
            .filter(entry => nearbyUserMap[entry.userId])
            .map((entry, index) => ({
              rank: Math.max(0, userRank - 6) + index + 1,
              userId: entry.userId,
              user: {
                name: nearbyUserMap[entry.userId]?.nickname || nearbyUserMap[entry.userId]?.name || 'Unknown Player',
                fullName: nearbyUserMap[entry.userId]?.name,
                image: nearbyUserMap[entry.userId]?.image,
                skillLevel: nearbyUserMap[entry.userId]?.skillLevel,
                rating: nearbyUserMap[entry.userId]?.playerRating
              },
              totalXP: entry.totalXP,
              weeklyXP: entry.weeklyXP,
              monthlyXP: entry.monthlyXP,
              level: entry.level,
              score: period === 'weekly' ? entry.weeklyXP : period === 'monthly' ? entry.monthlyXP : entry.totalXP
            }))
        }
      }
    }

    return NextResponse.json({
      leaderboard,
      userPosition,
      nearbyPlayers,
      period,
      total: leaderboard.length
    })
  } catch (error) {
    console.error('Error fetching XP leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
