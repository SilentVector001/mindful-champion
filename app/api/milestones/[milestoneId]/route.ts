
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// PUT update milestone
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ milestoneId: string }> }
) {
  try {
    const { milestoneId } = await params;
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { status, currentValue } = body

    // Verify ownership through goal
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { goal: true }
    })

    if (!milestone || milestone.goal.userId !== session.user.id) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 })
    }

    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status,
        currentValue,
        completedAt: status === 'COMPLETED' ? new Date() : null
      }
    })

    // Update goal progress based on milestone completion
    const allMilestones = await prisma.milestone.findMany({
      where: { goalId: milestone.goalId }
    })
    const completedCount = allMilestones.filter(m => m.status === 'COMPLETED').length
    const progress = (completedCount / allMilestones.length) * 100

    await prisma.goal.update({
      where: { id: milestone.goalId },
      data: { 
        progress,
        status: progress === 100 ? 'COMPLETED' : 'ACTIVE',
        completedAt: progress === 100 ? new Date() : null
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating milestone:", error)
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 })
  }
}
