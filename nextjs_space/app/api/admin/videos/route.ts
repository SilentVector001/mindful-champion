// @ts-nocheck
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Try VideoAnalysis first, fall back to VideoClip
    let videos: any[] = []
    
    try {
      videos = await prisma.VideoAnalysis.findMany({
        include: { user: { select: { id: true, email: true, firstName: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
    } catch (e) {
      // Fall back to VideoClip
      const clips = await prisma.videoClip.findMany({
        include: { user: { select: { id: true, email: true, firstName: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
      videos = clips
    }

    return NextResponse.json({ videos })
  } catch (error) {
    console.error("Admin videos fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch videos", videos: [] }, { status: 500 })
  }
}
