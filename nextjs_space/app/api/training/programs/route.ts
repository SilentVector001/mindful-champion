// @ts-nocheck

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export const dynamic = "force-dynamic";
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all active training programs
    const programs = await prisma.trainingProgram.findMany({
      where: { isActive: true },
      include: {
        ProgramVideo: {
          include: {
            TrainingVideo: true
          }
        },
        UserProgram: {
          where: {
            userId: session.user.id
          }
        }
      },
      orderBy: [
        { skillLevel: 'asc' },
        { durationDays: 'asc' }
      ]
    })

    // Format programs with enrollment status and progress
    const formattedPrograms = programs.map(program => {
      const userProgram = program.UserProgram[0]
      
      return {
        id: program.id,
        programId: program.programId,
        name: program.name,
        tagline: program.tagline || '',
        description: program.description,
        durationDays: program.durationDays,
        skillLevel: program.skillLevel,
        estimatedTimePerDay: program.estimatedTimePerDay || '30-45 minutes',
        keyOutcomes: Array.isArray(program.keyOutcomes) ? program.keyOutcomes : [],
        videosCount: program.ProgramVideo.length,
        isEnrolled: !!userProgram,
        progress: userProgram?.completionPercentage || 0
      }
    })

    return NextResponse.json({ 
      programs: formattedPrograms,
      success: true 
    })

  } catch (error) {
    console.error('Error fetching training programs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch training programs' },
      { status: 500 }
    )
  }
}
