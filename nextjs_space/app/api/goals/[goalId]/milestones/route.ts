import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { sendMilestoneAchievedEmail } from "@/lib/notifications/goal-notifications"

interface RouteContext {
  params: Promise<{
    goalId: string
  }>
}

// GET all milestones for a goal
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await params in Next.js 15+
    const { goalId } = await params

    const milestones = await prisma.milestone.findMany({
      where: {
        goalId: goalId,
        goal: { userId: session.user.id }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(milestones)
  } catch (error) {
    console.error("Error fetching milestones:", error)
    return NextResponse.json({ error: "Failed to fetch milestones" }, { status: 500 })
  }
}

// POST create new milestone
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await params in Next.js 15+
    const { goalId } = await params

    // Verify goal ownership
    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: session.user.id
      }
    })

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    const body = await req.json()
    const { title, description, targetValue, unit } = body

    const milestone = await prisma.milestone.create({
      data: {
        goalId: goalId,
        title,
        description,
        targetValue,
        unit
      }
    })

    return NextResponse.json(milestone)
  } catch (error) {
    console.error("Error creating milestone:", error)
    return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 })
  }
}
