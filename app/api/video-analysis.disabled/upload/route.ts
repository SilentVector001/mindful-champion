
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logActivity } from '@/lib/activity-tracker'
import { checkAndAwardSimpleAchievements } from '@/lib/achievements/check-simple-achievements'
import { uploadFile, getFileUrl } from '@/lib/s3'

export const dynamic = "force-dynamic"
export const maxDuration = 60

// Note: Next.js App Router handles FormData natively and doesn't have the same
// body size limitations as the Pages Router. The bodyParser config is not needed here.

/**
 * Trigger shot detection in the background
 * This is a simple trigger that updates the status and lets the client know to start polling
 */
async function triggerShotDetection(videoId: string, videoUrl: string): Promise<void> {
  try {
    console.log('[TriggerShotDetection] Preparing video for shot detection:', videoId);
    
    // Just update the status to indicate detection should start
    // The actual detection will be triggered by the client or a separate worker
    await prisma.videoAnalysis.update({
      where: { id: videoId },
      data: {
        analysisStatus: 'PENDING',
        shotDetectionProgress: {
          stage: 'extracting',
          currentFrame: 0,
          totalFrames: 0,
          currentBatch: 0,
          totalBatches: 0,
          shotsDetected: 0,
          message: 'Waiting to start shot detection...',
        } as any,
      },
    });
    
    console.log('[TriggerShotDetection] Video marked as ready for detection');
  } catch (error) {
    console.error('[TriggerShotDetection] Error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate session has user ID
    if (!session.user.id) {
      console.error('[Upload] User ID is undefined in session:', {
        email: session.user.email,
        name: session.user.name
      })
      return NextResponse.json({ 
        error: 'Invalid session. Please log out and log in again.',
        code: 'INVALID_SESSION'
      }, { status: 401 })
    }

    // Verify user exists in database
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id }
    })
    
    if (!userExists) {
      console.error('[Upload] User ID not found in database:', session.user.id)
      return NextResponse.json({ 
        error: 'User account not found. Please log out and log in again.',
        code: 'USER_NOT_FOUND',
        userId: session.user.id
      }, { status: 401 })
    }

    console.log('[Upload] User validated:', {
      userId: session.user.id,
      email: userExists.email
    })

    // Parse form data with error handling for large files
    let formData;
    try {
      formData = await request.formData()
    } catch (error) {
      console.error('[Upload] Failed to parse form data:', error);
      return NextResponse.json(
        { 
          error: 'Failed to parse upload data. File may be too large or corrupted.',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 400 }
      )
    }
    
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('[Upload] File received:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
    });

    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a video file (MP4, MOV, AVI, or WebM).' },
        { status: 400 }
      )
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024 // 500MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 500MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}-${safeFileName}`

    console.log('[Upload] Converting file to buffer...');
    
    // Convert file to buffer with error handling
    let buffer;
    try {
      const bytes = await file.arrayBuffer()
      buffer = Buffer.from(bytes)
      console.log('[Upload] Buffer created successfully, size:', buffer.length);
    } catch (error) {
      console.error('[Upload] Failed to convert file to buffer:', error);
      return NextResponse.json(
        { 
          error: 'Failed to process video file. Please try again.',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

    // Upload to S3 as public (to avoid signed URL 403 errors)
    const isPublic = true
    const cloud_storage_path = await uploadFile(buffer, fileName, isPublic, file.type)
    
    console.log(`Video uploaded to S3: ${cloud_storage_path}`)
    
    // Generate signed URL for the uploaded video
    const videoUrl = await getFileUrl(cloud_storage_path, isPublic)
    console.log(`Generated S3 signed URL: ${videoUrl}`)
    
    // Create video analysis record
    console.log('[Upload] Creating database record...', {
      userId: session.user.id,
      fileName: file.name,
      videoUrl
    })
    
    const videoAnalysis = await prisma.videoAnalysis.create({
      data: {
        userId: session.user.id!,
        videoUrl,
        cloud_storage_path,
        isPublic,
        fileName: file.name,
        fileSize: file.size,
        duration: 0, // Will be updated after processing
        title: file.name.replace(/\.[^/.]+$/, ''),
        analysisStatus: 'PENDING'
      }
    })

    console.log('[Upload] Database record created successfully:', videoAnalysis.id)

    // Log activity
    await logActivity({
      userId: session.user.id!,
      type: 'VIDEO_UPLOAD',
      title: 'Video Uploaded',
      description: `Uploaded video: ${file.name}`,
      category: 'video',
      metadata: {
        videoId: videoAnalysis.id,
        fileName: file.name,
        fileSize: file.size,
        cloud_storage_path
      }
    });

    // Check for achievements (don't wait - run async)
    checkAndAwardSimpleAchievements(session.user.id!, 'video').catch(console.error);

    // Trigger shot detection in the background (don't wait)
    triggerShotDetection(videoAnalysis.id, videoUrl).catch((error) => {
      console.error('[Upload] Failed to trigger shot detection:', error);
    });

    return NextResponse.json({
      success: true,
      videoId: videoAnalysis.id,
      videoUrl,
      message: 'Video uploaded successfully. Shot detection will begin shortly.'
    })
  } catch (error) {
    console.error('[Upload] Video upload error:', error)
    
    // Provide more specific error information
    if (error instanceof Error) {
      console.error('[Upload] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      
      // Check for specific Prisma errors
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { 
            error: 'User account validation failed. Please log out and log in again.',
            code: 'FOREIGN_KEY_ERROR',
            details: error.message
          },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to upload video',
        details: error instanceof Error ? error.message : 'Unknown error',
        code: 'UPLOAD_ERROR'
      },
      { status: 500 }
    )
  }
}
