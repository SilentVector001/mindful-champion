import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/training/current-enrollment
 * 
 * Fetches the user's current active training program enrollment
 * Returns the most recent IN_PROGRESS enrollment with program details
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find the most recent active enrollment
    const enrollment = await prisma.userProgram.findFirst({
      where: {
        userId: session.user.id,
        status: 'IN_PROGRESS'
      },
      include: {
        program: {
          select: {
            id: true,
            programId: true,
            name: true,
            description: true,
            skillLevel: true,
            durationDays: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    if (!enrollment) {
      return NextResponse.json({
        enrollment: null,
        message: 'No active training program'
      })
    }

    // Calculate streak (consecutive days trained)
    const completedDaysArray = Array.isArray(enrollment.completedDays) 
      ? enrollment.completedDays 
      : []
    
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Check consecutive days from today backwards
    for (let i = 0; i < completedDaysArray.length; i++) {
      const dayAgo = new Date(today)
      dayAgo.setDate(dayAgo.getDate() - i)
      
      const hasTrainedOnDay = completedDaysArray.some((completedDay: any) => {
        const completedDate = new Date(completedDay)
        completedDate.setHours(0, 0, 0, 0)
        return completedDate.getTime() === dayAgo.getTime()
      })
      
      if (hasTrainedOnDay) {
        streak++
      } else {
        break
      }
    }

    // Calculate completion percentage
    const totalDays = enrollment.program.durationDays
    const completedCount = completedDaysArray.length
    const completionPercentage = Math.round((completedCount / totalDays) * 100)

    // Prepare response
    const response = {
      enrollment: {
        id: enrollment.id,
        programId: enrollment.program.programId || enrollment.programId,
        currentDay: enrollment.currentDay,
        completedDays: completedCount,
        totalDays: totalDays,
        status: enrollment.status,
        streak: streak,
        lastTrainedAt: enrollment.lastTrainedAt,
        startDate: enrollment.startDate,
        completionPercentage,
        program: {
          id: enrollment.program.id,
          name: enrollment.program.name,
          description: enrollment.program.description,
          skillLevel: enrollment.program.skillLevel,
          durationDays: enrollment.program.durationDays
        }
      }
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error fetching current enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enrollment data' },
      { status: 500 }
    )
  }
}
