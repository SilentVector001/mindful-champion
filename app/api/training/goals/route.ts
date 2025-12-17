
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { goalText, targetDate } = await request.json()

    if (!goalText?.trim()) {
      return NextResponse.json({ error: "Goal text is required" }, { status: 400 })
    }

    const goal = await prisma.userGoal.create({
      data: {
        userId: session.user.id,
        goalText: goalText.trim(),
        targetDate: targetDate ? new Date(targetDate) : null,
        status: 'ACTIVE',
        progressPercentage: 0
      }
    })

    return NextResponse.json({ goal })
  } catch (error) {
    console.error("Error creating goal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const goals = await prisma.userGoal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ goals })
  } catch (error) {
    console.error("Error fetching goals:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
