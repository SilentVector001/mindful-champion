
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = "force-dynamic";
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'

import { prisma } from '@/lib/db'


// Download video for offline viewing (Pro feature)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is Pro subscriber
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true }
    })

    if (user?.subscriptionTier !== 'PRO') {
      return NextResponse.json({
        error: 'Pro subscription required for offline downloads',
        upgradeRequired: true
      }, { status: 403 })
    }

    const { videoId } = await request.json()

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 })
    }

    // Get video details
    const video = await prisma.trainingVideo.findUnique({
      where: { id: videoId }
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // In a production environment, this would:
    // 1. Download the video from YouTube using a service
    // 2. Upload to S3 for the user
    // 3. Store the S3 path in downloadPath
    
    // For now, we'll mark it as downloadable and return the YouTube URL
    // The actual download would happen client-side for YouTube videos
    await prisma.userVideoProgress.upsert({
      where: {
        userId_videoId: {
          userId: session.user.id,
          videoId: videoId
        }
      },
      update: {
        downloadedOffline: true,
        downloadPath: video.url, // In production, this would be S3 path
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        videoId: videoId,
        downloadedOffline: true,
        downloadPath: video.url, // In production, this would be S3 path
        startedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Video marked for offline access',
      videoUrl: video.url,
      downloadPath: video.url
    })
  } catch (error) {
    console.error('Error downloading video:', error)
    return NextResponse.json(
      { error: 'Failed to download video' },
      { status: 500 }
    )
  }
}

// Get list of downloaded videos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const downloadedVideos = await prisma.userVideoProgress.findMany({
      where: {
        userId: session.user.id,
        downloadedOffline: true
      },
      include: {
        video: {
          select: {
            videoId: true,
            title: true,
            url: true,
            duration: true,
            thumbnailUrl: true
          }
        }
      }
    })

    return NextResponse.json({
      downloads: downloadedVideos,
      count: downloadedVideos.length
    })
  } catch (error) {
    console.error('Error fetching downloaded videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch downloads' },
      { status: 500 }
    )
  }
}
