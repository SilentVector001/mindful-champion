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

    const { searchParams } = new URL(req.url)
    const tier = searchParams.get('tier')
    const skillLevel = searchParams.get('skillLevel')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (tier && tier !== 'all') {
      where.subscriptionTier = tier
    }
    
    if (skillLevel && skillLevel !== 'all') {
      where.skillLevel = skillLevel
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
        payments: { orderBy: { createdAt: 'desc' }, take: 5 },
        matches: { orderBy: { createdAt: 'desc' }, take: 5 },
        goals: true,
        userAchievements: { include: { achievement: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Admin users fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
