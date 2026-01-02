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

    const [goals, achievements, skillProgress] = await Promise.all([
      prisma.goal.findMany({
        include: {
          User: true,
          Milestone: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.achievement.findMany({
        include: {
          UserAchievement: {
            include: { User: true }
          }
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.skillProgress.findMany({
        include: { User: true },
        orderBy: { updatedAt: 'desc' },
        take: 100,
      })
    ])

    return NextResponse.json({ goals, achievements, skillProgress })
  } catch (error) {
    console.error("Admin goals fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch goals data" }, { status: 500 })
  }
}
