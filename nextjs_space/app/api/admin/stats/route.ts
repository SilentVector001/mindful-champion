// @ts-nocheck

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user counts
    const totalUsers = await prisma.user.count()
    const trialUsers = await prisma.user.count({
      where: { OR: [{ subscriptionTier: 'TRIAL' }, { isTrialActive: true }] }
    })
    const proUsers = await prisma.user.count({ where: { subscriptionTier: 'PRO' } })
    const premiumUsers = await prisma.user.count({ where: { subscriptionTier: 'PREMIUM' } })

    // Get today's signups
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todaySignups = await prisma.user.count({
      where: { createdAt: { gte: today } }
    })

    // Get this week's signups
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekSignups = await prisma.user.count({
      where: { createdAt: { gte: weekAgo } }
    })

    // Get video count
    let videoCount = 0
    try {
      videoCount = await prisma.videoAnalysis.count()
    } catch (e) {}

    // Calculate estimated revenue
    const estimatedRevenue = (proUsers * 19.99) + (premiumUsers * 49.99)

    return NextResponse.json({
      totalUsers,
      trialUsers,
      proUsers,
      premiumUsers,
      todaySignups,
      weekSignups,
      videoCount,
      totalRevenue: estimatedRevenue,
      userTrend: `+${todaySignups} today`,
      revenueTrend: `$${estimatedRevenue.toFixed(0)}/mo est.`
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
