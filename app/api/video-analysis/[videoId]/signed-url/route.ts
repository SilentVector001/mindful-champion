
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getFileUrl } from '@/lib/s3'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { videoId } = await params;

    // Fetch video analysis
    const video = await prisma.videoAnalysis.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        userId: true,
        cloud_storage_path: true,
        isPublic: true,
        videoUrl: true,
        adminUpload: true,
        uploadedByAdminId: true
      }
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Check permissions
    const isOwner = video.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'
    const isAdminUploader = video.adminUpload && video.uploadedByAdminId === session.user.id
    
    if (!isOwner && !isAdmin && !isAdminUploader) {
      return NextResponse.json(
        { error: 'You do not have permission to access this video' },
        { status: 403 }
      )
    }

    // Check if video has cloud storage path
    if (!video.cloud_storage_path) {
      // Handle legacy videos that only have videoUrl
      // Check if it's a local path
      if (video.videoUrl?.startsWith('/uploads/')) {
        return NextResponse.json({
          error: 'Video file not available',
          message: 'This video was uploaded locally and is no longer accessible in production. Please re-upload the video to cloud storage.',
          needsReupload: true,
          videoId: video.id
        }, { status: 410 }) // 410 Gone - resource no longer available
      }
      
      return NextResponse.json(
        { error: 'Video storage path not found' },
        { status: 404 }
      )
    }

    // Generate signed URL
    console.log('[SignedURL] Generating URL for:', {
      videoId: video.id,
      cloud_storage_path: video.cloud_storage_path,
      isPublic: video.isPublic
    })
    
    const signedUrl = await getFileUrl(video.cloud_storage_path, video.isPublic ?? false)
    
    console.log('[SignedURL] Successfully generated URL for video:', video.id)

    return NextResponse.json({
      success: true,
      videoUrl: signedUrl,
      expiresIn: 3600, // 1 hour
      isPublic: video.isPublic
    })
  } catch (error) {
    console.error('[SignedURL] Error generating signed URL:', error)
    console.error('[SignedURL] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        error: 'Failed to generate video URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
