
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = "force-dynamic";
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'

import { prisma } from '@/lib/db'


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { programId } = body

    if (!programId) {
      return NextResponse.json({ error: 'Program ID required' }, { status: 400 })
    }

    // Check if program exists (try programId first, then id)
    let program = await prisma.trainingProgram.findFirst({
      where: {
        OR: [
          { programId },
          { id: programId }
        ]
      }
    })

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.userProgram.findUnique({
      where: {
        userId_programId: {
          userId: session.user.id,
          programId: program.id
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json({ 
        message: 'Already enrolled',
        userProgramId: existingEnrollment.id 
      })
    }

    // Create enrollment
    const userProgram = await prisma.userProgram.create({
      data: {
        userId: session.user.id,
        programId: program.id,
        status: 'IN_PROGRESS',
        startDate: new Date(),
        currentDay: 1,
        completionPercentage: 0
      }
    })

    return NextResponse.json({ 
      success: true,
      userProgramId: userProgram.id,
      message: 'Successfully enrolled in program'
    })

  } catch (error) {
    console.error('Error enrolling in program:', error)
    return NextResponse.json(
      { error: 'Failed to enroll in program' },
      { status: 500 }
    )
  }
}
