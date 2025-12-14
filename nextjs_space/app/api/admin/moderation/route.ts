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

    const suggestions = await prisma.videoSuggestion.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Admin moderation fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch moderation data" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { suggestionId, status, adminNotes } = await req.json()

    const updated = await prisma.videoSuggestion.update({
      where: { id: suggestionId },
      data: {
        status,
        adminNotes,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, suggestion: updated })
  } catch (error) {
    console.error("Admin moderation update error:", error)
    return NextResponse.json({ error: "Failed to update suggestion" }, { status: 500 })
  }
}
