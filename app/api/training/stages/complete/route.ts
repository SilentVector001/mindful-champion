
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma as db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { stageId, programId, userId, completionData } = await request.json()

    // Verify user can complete this stage
    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Find or create user program
    let userProgram = await db.userProgram.findFirst({
      where: {
        userId: session.user.id,
        programId: programId
      }
    })

    if (!userProgram) {
      // Auto-enroll if not already enrolled
      userProgram = await db.userProgram.create({
        data: {
          userId: session.user.id,
          programId: programId,
          status: 'IN_PROGRESS',
          startDate: new Date(),
          currentDay: 1,
          completionPercentage: 0
        }
      })
    }

    // Create or update stage completion record
    await db.trainingSessionActivity.create({
      data: {
        userId: session.user.id,
        sessionDate: new Date(),
        sessionType: 'STAGE_COMPLETION',
        skillLevel: 'BEGINNER', // Default skillLevel
        activities: {
          stageId: stageId,
          stageType: stageId.includes('learn') ? 'LEARN' : 
                    stageId.includes('practice') ? 'PRACTICE' :
                    stageId.includes('assess') ? 'ASSESS' :
                    stageId.includes('challenge') ? 'CHALLENGE' : 'REFLECT',
          completionData: completionData,
          completedAt: new Date()
        },
        totalDuration: completionData.duration || 0,
        videosWatched: completionData.videosWatched || 0,
        drillsCompleted: completionData.drillsCompleted || 0,
        programId: programId,
        notes: completionData.notes || ''
      }
    })

    // Update user program progress
    const currentDay = userProgram.currentDay
    const program = await db.trainingProgram.findFirst({
      where: { id: programId }
    })

    if (program) {
      const newProgress = Math.min(100, ((currentDay) / program.durationDays) * 100)
      
      await db.userProgram.update({
        where: { id: userProgram.id },
        data: {
          completionPercentage: newProgress,
          // Advance day if this was the last stage for the day
          currentDay: stageId.includes('reflect') || stageId.includes('challenge') ? 
            Math.min(currentDay + 1, program.durationDays) : currentDay
        }
      })
    }

    // Award achievement points
    const pointValues = {
      LEARN: 10,
      PRACTICE: 15,
      ASSESS: 25,
      CHALLENGE: 50,
      REFLECT: 20
    }
    
    const stageType = stageId.includes('learn') ? 'LEARN' : 
                     stageId.includes('practice') ? 'PRACTICE' :
                     stageId.includes('assess') ? 'ASSESS' :
                     stageId.includes('challenge') ? 'CHALLENGE' : 'REFLECT'
    
    const points = pointValues[stageType as keyof typeof pointValues] || 10

    // Update user reward points
    await db.user.update({
      where: { id: session.user.id },
      data: {
        rewardPoints: {
          increment: points
        }
      }
    })

    return NextResponse.json({
      success: true,
      points: points,
      message: 'Stage completed successfully'
    })

  } catch (error) {
    console.error('Error completing stage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
