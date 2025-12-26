
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = "force-dynamic";
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'

import { prisma } from '@/lib/db'


// Check for incomplete videos and return reminders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)

    // Find videos that were started but not completed
    const incompleteVideos = await prisma.userVideoProgress.findMany({
      where: {
        userId: session.user.id,
        watched: false,
        startedAt: {
          not: null
        },
        OR: [
          // Never sent a reminder
          { reminderSentAt: null },
          // Last reminder was more than 2 hours ago
          { reminderSentAt: { lt: twoHoursAgo } }
        ]
      },
      include: {
        video: {
          select: {
            videoId: true,
            title: true,
            duration: true,
            thumbnailUrl: true
          }
        }
      },
      orderBy: {
        startedAt: 'desc'
      },
      take: 5
    })

    // Update reminder sent timestamp
    if (incompleteVideos.length > 0) {
      await prisma.userVideoProgress.updateMany({
        where: {
          id: {
            in: incompleteVideos.map(v => v.id)
          }
        },
        data: {
          reminderSentAt: now,
          reminderCount: {
            increment: 1
          }
        }
      })
    }

    return NextResponse.json({
      reminders: incompleteVideos.map(v => ({
        videoId: v.videoId,
        title: v.video.title,
        lastPosition: v.lastPosition || 0,
        watchPercentage: v.watchPercentage,
        startedAt: v.startedAt,
        thumbnailUrl: v.video.thumbnailUrl
      })),
      count: incompleteVideos.length
    })
  } catch (error) {
    console.error('Error checking reminders:', error)
    return NextResponse.json(
      { error: 'Failed to check reminders' },
      { status: 500 }
    )
  }
}
