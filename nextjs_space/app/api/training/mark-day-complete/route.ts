import { NextResponse } from 'next/server'

export const dynamic = "force-dynamic";
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'

import { prisma } from '@/lib/db'


export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { programId, day, userId } = await request.json()

    // Verify user matches session
    if (userId !== session.user.id) {
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

    if (!userProgram) {
      // Create new user program
      userProgram = await prisma.userProgram.create({
        data: {
          userId: session.user.id,
          programId: programId,
          status: 'IN_PROGRESS',
          currentDay: 1,
          startDate: new Date()
        }
      })
    }

    // Update current day and progress
    const program = await prisma.trainingProgram.findUnique({
      where: { id: programId }
    })

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    // Get current completed days array
    const completedDaysArray = Array.isArray(userProgram.completedDays) 
      ? userProgram.completedDays 
      : []
    
    // Add current day to completed days if not already there
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const alreadyCompletedToday = completedDaysArray.some((date: any) => {
      const completedDate = new Date(date)
      completedDate.setHours(0, 0, 0, 0)
      return completedDate.getTime() === today.getTime()
    })
    
    let updatedCompletedDays = [...completedDaysArray]
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
      .map((d: any) => {
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

    return NextResponse.json({ 
      success: true, 
      userProgram: updatedProgram,
      isCompleted,
      streak 
    })
  } catch (error) {
    console.error('Error marking day complete:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
