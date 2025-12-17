
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { programId } = await params

    // Get program details
    const program = await prisma.trainingProgram.findFirst({
      where: { programId }
    })

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }

    // Get user's enrollment status
    const userProgram = await prisma.userProgram.findFirst({
      where: {
        userId: session.user.id,
        programId: program.id
      }
    })

    // Get all video IDs from the program structure
    // Handle both array format and object with days property
    let dailyStructure: any[] = []
    if (Array.isArray(program.dailyStructure)) {
      dailyStructure = program.dailyStructure
    } else if (program.dailyStructure && typeof program.dailyStructure === 'object' && 'days' in program.dailyStructure) {
      dailyStructure = (program.dailyStructure as any).days || []
    }
    
    const allVideoIds = new Set<string>()
    
    dailyStructure?.forEach((day: any) => {
      if (day.videos) {
        day.videos.forEach((videoId: string) => allVideoIds.add(videoId))
      }
    })

    // Get video details
    const videos = await prisma.trainingVideo.findMany({
      where: {
        videoId: { in: Array.from(allVideoIds) }
      },
      select: {
        id: true,
        videoId: true,
        title: true,
        duration: true,
        thumbnailUrl: true,
        skillLevel: true,
        primaryTopic: true
      }
    })

    // Get user's video progress
    const videoProgress = await prisma.userVideoProgress.findMany({
      where: {
        userId: session.user.id,
        videoId: { in: videos.map(v => v.id) }
      }
    })

    // Create progress map
    const progressMap = videoProgress.reduce((map, progress) => {
      const video = videos.find(v => v.id === progress.videoId)
      if (video) {
        map[video.videoId] = {
          watched: progress.watched,
          rating: progress.rating,
          notes: progress.notes
        }
      }
      return map
    }, {} as Record<string, any>)

    // Add progress info to videos
    const videosWithProgress = videos.map(video => ({
      ...video,
      watched: progressMap[video.videoId]?.watched || false,
      rating: progressMap[video.videoId]?.rating,
      notes: progressMap[video.videoId]?.notes
    }))

    return NextResponse.json({
      program: {
        ...program,
        dailyStructure
      },
      userProgram,
      videos: videosWithProgress
    })
  } catch (error) {
    console.error("Error fetching program details:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { programId } = await params
    const { action, day } = await request.json()

    // Get program
    const program = await prisma.trainingProgram.findFirst({
      where: { programId }
    })

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }

    // Get user program
    const userProgram = await prisma.userProgram.findFirst({
      where: {
        userId: session.user.id,
        programId: program.id
      }
    })

    if (!userProgram) {
      return NextResponse.json({ error: "User not enrolled in program" }, { status: 404 })
    }

    let updatedUserProgram

    switch (action) {
      case 'pause':
        updatedUserProgram = await prisma.userProgram.update({
          where: { id: userProgram.id },
          data: { status: 'PAUSED' }
        })
        break

      case 'resume':
        updatedUserProgram = await prisma.userProgram.update({
          where: { id: userProgram.id },
          data: { status: 'IN_PROGRESS' }
        })
        break

      case 'complete_day':
        if (!day || day !== userProgram.currentDay) {
          return NextResponse.json({ error: "Invalid day" }, { status: 400 })
        }

        const newDay = day + 1
        const newProgress = (day / program.durationDays) * 100
        const isCompleted = newDay > program.durationDays

        updatedUserProgram = await prisma.userProgram.update({
          where: { id: userProgram.id },
          data: {
            currentDay: isCompleted ? program.durationDays : newDay,
            completionPercentage: isCompleted ? 100 : newProgress,
            status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
            completedAt: isCompleted ? new Date() : null
          }
        })

        // Check for program completion achievement
        if (isCompleted) {
          await checkProgramCompletionAchievement(session.user.id)
        }
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ userProgram: updatedUserProgram })
  } catch (error) {
    console.error("Error updating program:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to check program completion achievement
async function checkProgramCompletionAchievement(userId: string) {
  try {
    const completedPrograms = await prisma.userProgram.count({
      where: {
        userId: userId,
        status: 'COMPLETED'
      }
    })

    if (completedPrograms >= 1) {
      const existingAchievement = await prisma.userAchievement.findFirst({
        where: {
          userId: userId,
          achievement: {
            name: 'Program Graduate'
          }
        }
      })

      if (!existingAchievement) {
        const achievementRecord = await prisma.achievement.findFirst({
          where: { name: 'Program Graduate' }
        })

        if (achievementRecord) {
          await prisma.userAchievement.create({
            data: {
              userId: userId,
              achievementId: achievementRecord.id,
              unlockedAt: new Date()
            }
          })
        }
      }
    }
  } catch (error) {
    console.error("Error checking program completion achievement:", error)
  }
}
