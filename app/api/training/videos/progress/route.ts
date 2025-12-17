
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
    const { videoId, watched, rating, notes, programId } = body

    // Upsert video progress
    const progress = await prisma.userVideoProgress.upsert({
      where: {
        userId_videoId: {
          userId: session.user.id,
          videoId
        }
      },
      update: {
        watched: watched !== undefined ? watched : undefined,
        watchDate: watched ? new Date() : undefined,
        rating: rating !== undefined ? rating : undefined,
        notes: notes !== undefined ? notes : undefined
      },
      create: {
        userId: session.user.id,
        videoId,
        watched: watched || false,
        watchDate: watched ? new Date() : null,
        rating: rating || null,
        notes: notes || null
      }
    })

    // Update program progress if programId provided
    if (programId && watched) {
      const program = await prisma.trainingProgram.findUnique({
        where: { id: programId },
        include: {
          programVideos: true
        }
      })

      if (program) {
        const totalVideos = program.programVideos.length
        const watchedVideos = await prisma.userVideoProgress.count({
          where: {
            userId: session.user.id,
            videoId: {
              in: program.programVideos.map(pv => pv.videoId)
            },
            watched: true
          }
        })

        const completionPercentage = (watchedVideos / totalVideos) * 100

        await prisma.userProgram.updateMany({
          where: {
            userId: session.user.id,
            programId: program.id
          },
          data: {
            completionPercentage,
            status: completionPercentage === 100 ? 'COMPLETED' : 'IN_PROGRESS',
            completedAt: completionPercentage === 100 ? new Date() : null
          }
        })
      }
    }

    return NextResponse.json({ 
      success: true,
      progress 
    })

  } catch (error) {
    console.error('Error updating video progress:', error)
    return NextResponse.json(
      { error: 'Failed to update video progress' },
      { status: 500 }
    )
  }
}
