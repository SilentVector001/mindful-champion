
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { sendGoalConfirmation, setupDailyGoalReminders } from "@/lib/notifications/goal-notifications"

// GET all goals for user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const goals = await prisma.goal.findMany({
      where: { userId: session.user.id },
      include: {
        milestones: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(goals)
  } catch (error) {
    console.error("Error fetching goals:", error)
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 })
  }
}

// POST create new goal
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, category, targetDate, milestones, notificationPreferences } = body

    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        title,
        description,
        category,
        targetDate: targetDate ? new Date(targetDate) : null,
        milestones: {
          create: milestones?.map((m: any, index: number) => ({
            title: m.title,
            description: m.description,
            targetValue: m.targetValue,
            unit: m.unit,
            order: index
          })) || []
        }
      },
      include: {
        milestones: true
      }
    })

    // Send immediate goal confirmation email
    const confirmationResult = await sendGoalConfirmation(session.user.id, {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      category: goal.category,
      targetDate: goal.targetDate,
      userId: session.user.id,
      progress: goal.progress,
      createdAt: goal.createdAt
    })

    // Setup daily reminders if requested
    if (notificationPreferences?.enableDailyReminders !== false) {
      await setupDailyGoalReminders(
        session.user.id,
        {
          id: goal.id,
          title: goal.title,
          description: goal.description,
          category: goal.category,
          targetDate: goal.targetDate,
          userId: session.user.id,
          progress: goal.progress,
          createdAt: goal.createdAt
        },
        notificationPreferences
      )
    }

    console.log(`Goal created and notifications sent for user ${session.user.id}`)

    return NextResponse.json(goal)
  } catch (error) {
    console.error("Error creating goal:", error)
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 })
  }
}
