
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = "force-dynamic";
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'

import { prisma } from '@/lib/db'
import { existsSync } from 'fs'
import path from 'path'


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { videoId } = await params
    const video = await prisma.videoAnalysis.findUnique({
      where: {
        id: videoId,
        userId: session.user.id!
      }
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Check if video is stored locally or in S3
    let fileExists = true
    let warning: string | undefined = undefined
    
    // Only check file existence for local files (not S3 URLs)
    if (video.videoUrl.startsWith('/') && !video.cloud_storage_path) {
      // This is a local file path
      const relativePath = video.videoUrl.substring(1) // Remove leading slash
      const videoPath = path.join(process.cwd(), 'public', relativePath)
      fileExists = existsSync(videoPath)
      
      console.log('Checking local video file:', {
        videoUrl: video.videoUrl,
        relativePath,
        videoPath,
        fileExists
      })
      
      if (!fileExists) {
        warning = 'Video file not found on server. The file may have been deleted or moved. Please re-upload the video.'
      }
    } else if (video.cloud_storage_path) {
      // Video is stored in S3 - file existence will be verified when generating signed URL
      console.log('Video stored in S3:', {
        cloud_storage_path: video.cloud_storage_path,
        isPublic: video.isPublic
      })
      fileExists = true // Assume exists, signed URL generation will fail if not
    } else if (video.videoUrl.startsWith('http')) {
      // Direct HTTP/HTTPS URL (could be S3 or other external source)
      console.log('Video URL is external:', video.videoUrl)
      fileExists = true // Can't verify external URLs easily
    }

    return NextResponse.json({
      success: true,
      video,
      fileExists,
      warning
    })
  } catch (error) {
    console.error('Error fetching video:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { videoId } = await params
    await prisma.videoAnalysis.delete({
      where: {
        id: videoId,
        userId: session.user.id!
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    )
  }
}
