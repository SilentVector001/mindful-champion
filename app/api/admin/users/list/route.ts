export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    
    const search = searchParams.get('search') || ''
    const tier = searchParams.get('tier')
    const skillLevel = searchParams.get('skillLevel')
    const status = searchParams.get('status')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (tier && tier !== 'all') {
      where.subscriptionTier = tier
    }
    
    if (skillLevel && skillLevel !== 'all') {
      where.skillLevel = skillLevel
    }
    
    if (status) {
      if (status === 'trial') {
        where.isTrialActive = true
      } else if (status === 'locked') {
        where.accountLocked = true
      } else if (status === 'active') {
        where.accountLocked = false
      }
    }

    // Get users with pagination
    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          email: true,
          firstName: true,
          lastName: true,
          skillLevel: true,
          playerRating: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          isTrialActive: true,
          trialEndDate: true,
          accountLocked: true,
          createdAt: true,
          lastActiveDate: true,
          loginCount: true,
          stripeCustomerId: true,
          // Aggregated data
          _count: {
            select: {
              matches: true,
              goals: true,
              userAchievements: true,
              payments: true,
              securityLogs: true,
            }
          }
        },
      }),
      prisma.user.count({ where })
    ])

    // Get stats for filters
    const stats = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isTrialActive: true } }),
      prisma.user.count({ where: { onboardingCompleted: true } }),
      prisma.user.count({ where: { accountLocked: true } }),
    ])

    const pagination = {
      page,
      limit,
      totalCount: totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      hasMore: page * limit < totalUsers,
    }

    return NextResponse.json({
      users,
      pagination,
      stats: {
        totalUsers: stats[0],
        activeTrials: stats[1],
        onboardingCompleted: stats[2],
        lockedAccounts: stats[3],
      }
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
