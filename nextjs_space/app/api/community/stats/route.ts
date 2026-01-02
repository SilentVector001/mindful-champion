//@ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const totalPosts = await prisma.communityPost.count({
      where: { isPublished: true }
    })

    const totalMembers = await prisma.user.count({
      where: { email: { not: null } }
    })

    // Active today (users who logged in within last 24 hours)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const activeToday = await prisma.user.count({
      where: {
        lastActiveDate: { gte: yesterday }
      }
    })

    return NextResponse.json({
      totalPosts,
      totalMembers,
      activeToday
    })
  } catch (error) {
    console.error('Error fetching community stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
