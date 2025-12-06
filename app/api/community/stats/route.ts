
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [totalPosts, totalMembers, communityStats] = await Promise.all([
      prisma.communityPost.count(),
      prisma.communityStats.count(),
      prisma.communityStats.findMany({
        where: {
          lastActiveAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ])

    return NextResponse.json({
      stats: {
        totalPosts,
        totalMembers,
        activeToday: communityStats.length
      }
    })
  } catch (error) {
    console.error('Error fetching community stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
