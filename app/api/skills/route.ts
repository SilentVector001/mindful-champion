
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET user skill progress
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const skills = await prisma.skillProgress.findMany({
      where: { userId: session.user.id },
      orderBy: { proficiency: 'desc' }
    })

    return NextResponse.json(skills)
  } catch (error) {
    console.error("Error fetching skills:", error)
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 })
  }
}

// POST update skill progress
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { skillName, proficiencyIncrease } = body

    const skill = await prisma.skillProgress.upsert({
      where: {
        userId_skillName: {
          userId: session.user.id,
          skillName
        }
      },
      update: {
        proficiency: {
          increment: proficiencyIncrease
        },
        lastPracticed: new Date(),
        totalSessions: {
          increment: 1
        }
      },
      create: {
        userId: session.user.id,
        skillName,
        proficiency: proficiencyIncrease,
        lastPracticed: new Date(),
        totalSessions: 1
      }
    })

    return NextResponse.json(skill)
  } catch (error) {
    console.error("Error updating skill:", error)
    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 })
  }
}
