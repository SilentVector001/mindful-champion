import { NextResponse } from 'next/server'

export const dynamic = "force-dynamic";
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'

import { prisma } from '@/lib/db'
import { logActivity } from '@/lib/tracking-utils'


export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.error('Mark day complete: No user session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { programId, day, userId } = body

    // Validate required fields
    if (!programId || !day || !userId) {
      console.error('Mark day complete: Missing required fields', { programId, day, userId })
      return NextResponse.json({ error: 'Missing required fields: programId, day, and userId are required' }, { status: 400 })
    }

    // Verify user matches session
    if (userId !== session.user.id) {
      console.error('Mark day complete: User ID mismatch', { sessionUserId: session.user.id, requestUserId: userId })
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Find or create user program
    let userProgram = await prisma.userProgram.findUnique({
      where: {
        userId_programId: {
          userId: session.user.id,
          programId: programId
        }
      }
    })

    console.log('Mark day complete: Found user program', { userProgram: userProgram?.id, currentDay: userProgram?.currentDay })

    if (!userProgram) {
      // Create new user program
      console.log('Mark day complete: Creating new user program', { userId: session.user.id, programId })
      userProgram = await prisma.userProgram.create({
        data: {
          userId: session.user.id,
          programId: programId,
          status: 'IN_PROGRESS',
          currentDay: 1,
          startDate: new Date()
        }
      })
      console.log('Mark day complete: Created user program', { userProgramId: userProgram.id })
    }

    // Update current day and progress
    const program = await prisma.trainingProgram.findUnique({
      where: { id: programId }
    })

    if (!program) {
      console.error('Mark day complete: Program not found', { programId })
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    console.log('Mark day complete: Found program', { programId, programName: program.name, durationDays: program.durationDays })

    // Get current completed days array and convert JsonValue to Date[]
    const completedDaysRaw = userProgram.completedDays as any[]
    const completedDaysArray: Date[] = Array.isArray(completedDaysRaw) 
      ? completedDaysRaw.map((date: any) => new Date(date))
      : []
    
    // Add current day to completed days if not already there
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const alreadyCompletedToday = completedDaysArray.some((completedDate: Date) => {
      const checkDate = new Date(completedDate)
      checkDate.setHours(0, 0, 0, 0)
      return checkDate.getTime() === today.getTime()
    })
    
    const updatedCompletedDays: Date[] = [...completedDaysArray]
    if (!alreadyCompletedToday) {
      updatedCompletedDays.push(today)
    }

    const newCurrentDay = Math.min(day + 1, program.durationDays + 1)
    const completionPercentage = (updatedCompletedDays.length / program.durationDays) * 100

    // Check if program is completed
    const isCompleted = updatedCompletedDays.length >= program.durationDays

    // Calculate streak
    let streak = 0
    const sortedDays = updatedCompletedDays
      .map((d: Date) => {
        const date = new Date(d)
        date.setHours(0, 0, 0, 0)
        return date
      })
      .sort((a: Date, b: Date) => b.getTime() - a.getTime())
    
    for (let i = 0; i < sortedDays.length; i++) {
      const dayAgo = new Date(today)
      dayAgo.setDate(dayAgo.getDate() - i)
      
      const hasDay = sortedDays.some((d: Date) => d.getTime() === dayAgo.getTime())
      if (hasDay) {
        streak++
      } else {
        break
      }
    }
    
    console.log('Mark day complete: Updating user program', {
      newCurrentDay,
      completionPercentage,
      completedDaysCount: updatedCompletedDays.length,
      isCompleted,
      streak
    })

    const updatedProgram = await prisma.userProgram.update({
      where: {
        userId_programId: {
          userId: session.user.id,
          programId: programId
        }
      },
      data: {
        currentDay: newCurrentDay,
        completionPercentage: completionPercentage,
        completedDays: updatedCompletedDays,
        lastTrainedAt: new Date(),
        status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: isCompleted ? new Date() : undefined
      }
    })

    console.log('Mark day complete: Successfully updated', { userProgramId: updatedProgram.id })

    // Log activity
    await logActivity(session.user.id, 'drill_completion', {
      drillName: `${program.name} - Day ${day}`,
      drillCategory: 'Training Program',
      skillLevel: 'INTERMEDIATE',
      status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
      timeSpent: null,
      performanceScore: completionPercentage
    }).catch(err => console.error('Failed to log training activity:', err))

    return NextResponse.json({ 
      success: true, 
      userProgram: updatedProgram,
      isCompleted,
      streak 
    })
  } catch (error) {
    console.error('Error marking day complete:', error)
    // Log the full error details
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
    return NextResponse.json(
      { error: 'Internal server error. Please try again or contact support if the issue persists.' }, 
      { status: 500 }
    )
  }
}
