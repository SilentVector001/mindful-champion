import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { sendMilestoneAchievedEmail } from "@/lib/notifications/goal-notifications"

interface RouteContext {
  params: {
    goalId: string
    milestoneId: string
  }
}

// PATCH update milestone
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: params.milestoneId,
        goalId: params.goalId,
        goal: { userId: session.user.id }
      }
    })

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 })
    }

    const body = await req.json()
    const { status, currentValue, title, description } = body

    // Check if milestone is being marked as completed
    const wasNotCompleted = milestone.status !== 'COMPLETED'
    const isNowCompleted = status === 'COMPLETED'

    const updatedMilestone = await prisma.milestone.update({
      where: { id: params.milestoneId },
      data: {
        status,
        currentValue,
        title,
        description,
        completedAt: isNowCompleted ? new Date() : milestone.completedAt
      }
    })

    // Send achievement email if milestone just completed
    if (wasNotCompleted && isNowCompleted) {
      await sendMilestoneAchievedEmail(
        session.user.id,
        params.goalId,
        updatedMilestone.title
      )

      // Update goal progress
      const goal = await prisma.goal.findUnique({
        where: { id: params.goalId },
        include: { milestones: true }
      })

      if (goal) {
        const completedCount = goal.milestones.filter(m => m.status === 'COMPLETED').length
        const totalCount = goal.milestones.length
        const newProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

        await prisma.goal.update({
          where: { id: params.goalId },
          data: { progress: newProgress }
        })
      }
    }

    return NextResponse.json(updatedMilestone)
  } catch (error) {
    console.error("Error updating milestone:", error)
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 })
  }
}

// DELETE milestone
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: params.milestoneId,
        goalId: params.goalId,
        goal: { userId: session.user.id }
      }
    })

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 })
    }

    await prisma.milestone.delete({
      where: { id: params.milestoneId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting milestone:", error)
    return NextResponse.json({ error: "Failed to delete milestone" }, { status: 500 })
  }
}
