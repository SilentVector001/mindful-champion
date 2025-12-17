
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = "force-dynamic";
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'

import { prisma } from '@/lib/db'


// Update video progress (position, percentage, completion)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { videoId, position, percentage, completed } = await request.json()

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 })
    }

    // Create or update progress
    const progress = await prisma.userVideoProgress.upsert({
      where: {
        userId_videoId: {
          userId: session.user.id,
          videoId: videoId
        }
      },
      update: {
        lastPosition: position || 0,
        watchPercentage: percentage || 0,
        watched: completed || percentage >= 90, // Auto-mark as watched at 90%
        completedAt: completed || percentage >= 90 ? new Date() : undefined,
        totalWatchTime: {
          increment: 5 // Increment by 5 seconds each update
        },
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        videoId: videoId,
        lastPosition: position || 0,
        watchPercentage: percentage || 0,
        watched: completed || percentage >= 90,
        completedAt: completed || percentage >= 90 ? new Date() : undefined,
        startedAt: new Date(),
        totalWatchTime: 5
      }
    })

    return NextResponse.json({
      success: true,
      progress,
      autoCompleted: percentage >= 90
    })
  } catch (error) {
    console.error('Error updating video progress:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}

// Get video progress
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 })
    }

    const progress = await prisma.userVideoProgress.findUnique({
      where: {
        userId_videoId: {
          userId: session.user.id,
          videoId: videoId
        }
      }
    })

    return NextResponse.json({
      progress: progress || null,
      lastPosition: progress?.lastPosition || 0,
      watchPercentage: progress?.watchPercentage || 0,
      completed: progress?.watched || false
    })
  } catch (error) {
    console.error('Error fetching video progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}
