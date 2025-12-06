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

    const matches = await prisma.match.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const duprStats = await prisma.user.aggregate({
      where: { duprConnected: true },
      _count: true,
    })

    return NextResponse.json({ matches, duprStats })
  } catch (error) {
    console.error("Admin matches fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch matches data" }, { status: 500 })
  }
}
