
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all achievements with their user achievements
    const achievements = await prisma.achievement.findMany({
      include: {
        userAchievements: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                skillLevel: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    // Group achievements by tier
    const achievementsByTier: Record<string, any[]> = {}
    achievements.forEach((achievement: any) => {
      const tier = achievement.tier || 'NONE'
      if (!achievementsByTier[tier]) {
        achievementsByTier[tier] = []
      }
      achievementsByTier[tier].push({
        ...achievement,
        unlockedCount: achievement.userAchievements.length
      })
    })

    // Calculate statistics
    const stats = {
      totalAchievements: achievements.length,
      totalUnlocked: achievements.reduce((sum: number, a: any) => sum + a.userAchievements.length, 0),
      byTier: Object.entries(achievementsByTier).map(([tier, items]) => ({
        tier,
        count: items.length,
        unlocked: items.reduce((sum: number, item: any) => sum + item.unlockedCount, 0)
      })),
      mostUnlocked: achievements
        .map((a: any) => ({
          id: a.id,
          name: a.name,
          description: a.description,
          tier: a.tier,
          count: a.userAchievements.length
        }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 10),
      recentUnlocks: achievements
        .flatMap((a: any) => a.userAchievements.map((ua: any) => ({
          achievementName: a.name,
          achievementTier: a.tier,
          userId: ua.userId,
          userName: `${ua.user.firstName || ''} ${ua.user.lastName || ''}`.trim() || ua.user.email,
          unlockedAt: ua.unlockedAt,
        })))
        .sort((a: any, b: any) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
        .slice(0, 20),
    }

    // User achievement progress
    const userAchievementProgress = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        skillLevel: true,
        userAchievements: {
          select: {
            id: true,
            achievement: {
              select: {
                name: true,
                tier: true
              }
            },
            unlockedAt: true
          }
        }
      },
      orderBy: {
        userAchievements: {
          _count: 'desc'
        }
      },
      take: 50
    })

    const userProgress = userAchievementProgress.map((user: any) => ({
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      email: user.email,
      skillLevel: user.skillLevel,
      achievementsCount: user.userAchievements.length,
      achievementsByTier: user.userAchievements.reduce((acc: Record<string, number>, ua: any) => {
        const tier = ua.achievement.tier || 'NONE'
        acc[tier] = (acc[tier] || 0) + 1
        return acc
      }, {}),
      latestAchievement: user.userAchievements[0] ? {
        name: user.userAchievements[0].achievement.name,
        unlockedAt: user.userAchievements[0].unlockedAt
      } : null
    }))

    return NextResponse.json({
      achievements: achievementsByTier,
      stats,
      userProgress
    })
  } catch (error) {
    console.error("Admin achievements fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch achievements data" }, { status: 500 })
  }
}
