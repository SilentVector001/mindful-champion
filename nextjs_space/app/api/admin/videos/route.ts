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

    const clips = await prisma.videoClip.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ clips })
  } catch (error) {
    console.error("Admin videos fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch video clips" }, { status: 500 })
  }
}
