//@ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// XP thresholds for levels
const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000,
  5500, 7500, 10000, 13000, 17000, 22000, 28000, 35000, 45000, 60000
]

function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1
  }
  return 1
}

function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  return LEVEL_THRESHOLDS[currentLevel] || 100
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let userXP = await prisma.userXP.findUnique({
      where: { userId: session.user.id }
    })

    if (!userXP) {
      userXP = await prisma.userXP.create({
        data: { userId: session.user.id }
      })
    }

    const nextLevelXP = getXPForNextLevel(userXP.level)
    const prevLevelXP = userXP.level > 1 ? LEVEL_THRESHOLDS[userXP.level - 2] : 0
    const progressToNext = ((userXP.totalXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100

    // Get recent transactions
    const recentXP = await prisma.xPTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({
      ...userXP,
      nextLevelXP,
      progressToNext: Math.min(progressToNext, 100),
      recentTransactions: recentXP
    })
  } catch (error) {
    console.error('Error fetching XP:', error)
    return NextResponse.json({ error: 'Failed to fetch XP' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, source, sourceId, description } = await req.json()

    if (!amount || !source) {
      return NextResponse.json({ error: 'Amount and source required' }, { status: 400 })
    }

    // Record transaction
    await prisma.xPTransaction.create({
      data: {
        userId: session.user.id,
        amount,
        source,
        sourceId,
        description: description || `Earned ${amount} XP from ${source}`
      }
    })

    // Update user XP
    const userXP = await prisma.userXP.upsert({
      where: { userId: session.user.id },
      update: {
        totalXP: { increment: amount },
        weeklyXP: { increment: amount },
        monthlyXP: { increment: amount },
        lastXPEarned: new Date()
      },
      create: {
        userId: session.user.id,
        totalXP: amount,
        weeklyXP: amount,
        monthlyXP: amount,
        lastXPEarned: new Date()
      }
    })

    // Check for level up
    const newLevel = calculateLevel(userXP.totalXP)
    let leveledUp = false

    if (newLevel > userXP.level) {
      leveledUp = true
      await prisma.userXP.update({
        where: { userId: session.user.id },
        data: { level: newLevel }
      })

      // Award level badge
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: session.user.id, badgeId: `level-${newLevel}` } },
        create: {
          userId: session.user.id,
          badgeId: `level-${newLevel}`,
          badgeName: `Level ${newLevel}`,
          badgeIcon: '🏆',
          badgeColor: newLevel >= 10 ? 'gold' : newLevel >= 5 ? 'purple' : 'cyan',
          category: 'milestone'
        },
        update: {}
      })
    }

    return NextResponse.json({
      success: true,
      xpAdded: amount,
      totalXP: userXP.totalXP + amount,
      level: newLevel,
      leveledUp
    })
  } catch (error) {
    console.error('Error adding XP:', error)
    return NextResponse.json({ error: 'Failed to add XP' }, { status: 500 })
  }
}
