
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionType, duration, completed, rating } = await req.json()

    const mentalSession = await prisma.mentalSession.create({
      data: {
        userId: session.user.id,
        sessionType,
        duration,
        completed,
        rating,
      }
    })

    return NextResponse.json({ mentalSession })

  } catch (error) {
    console.error("Mental session logging error:", error)
    return NextResponse.json(
      { error: "Failed to log mental session" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const mentalSessions = await prisma.mentalSession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({ mentalSessions })

  } catch (error) {
    console.error("Mental session retrieval error:", error)
    return NextResponse.json(
      { error: "Failed to retrieve mental sessions" },
      { status: 500 }
    )
  }
}
