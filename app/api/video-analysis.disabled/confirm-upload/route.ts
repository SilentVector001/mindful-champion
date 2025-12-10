import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logActivity } from '@/lib/activity-tracker'
import { checkAndAwardSimpleAchievements } from '@/lib/achievements/check-simple-achievements'
import { getFileUrl } from '@/lib/s3'

export const dynamic = "force-dynamic"

/**
 * Trigger shot detection in the background
 */
async function triggerShotDetection(videoId: string, videoUrl: string): Promise<void> {
  try {
    console.log('[TriggerShotDetection] Preparing video for shot detection:', videoId);
    
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

/**
 * Confirm that upload to S3 was successful and create database record
 * This is called after the client has uploaded directly to S3 using a pre-signed URL
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate session has user ID
    if (!session.user.id) {
      console.error('[ConfirmUpload] User ID is undefined in session')
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
      console.error('[ConfirmUpload] User ID not found in database:', session.user.id)
      return NextResponse.json({ 
        error: 'User account not found. Please log out and log in again.',
        code: 'USER_NOT_FOUND',
        userId: session.user.id
      }, { status: 401 })
    }

    const { key, fileName, fileSize } = await request.json()

    // Validate inputs
    if (!key || !fileName) {
      return NextResponse.json(
        { error: 'key and fileName are required' },
        { status: 400 }
      )
    }

    console.log('[ConfirmUpload] User validated:', {
      userId: session.user.id,
      email: userExists.email,
      fileName,
      key
    })

    // Generate signed URL for the uploaded video
    const isPublic = true // Videos uploaded to public folder
    const videoUrl = await getFileUrl(key, isPublic)
    console.log(`[ConfirmUpload] Generated S3 signed URL: ${videoUrl}`)
    
    // Create video analysis record
    console.log('[ConfirmUpload] Creating database record...', {
      userId: session.user.id,
      fileName,
      videoUrl
    })
    
    const videoAnalysis = await prisma.videoAnalysis.create({
      data: {
        userId: session.user.id!,
        videoUrl,
        cloud_storage_path: key,
        isPublic,
        fileName: fileName,
        fileSize: fileSize || 0,
        duration: 0, // Will be updated after processing
        title: fileName.replace(/\.[^/.]+$/, ''),
        analysisStatus: 'PENDING'
      }
    })

    console.log('[ConfirmUpload] Database record created successfully:', videoAnalysis.id)

    // Log activity
    await logActivity({
      userId: session.user.id!,
      type: 'VIDEO_UPLOAD',
      title: 'Video Uploaded',
      description: `Uploaded video: ${fileName}`,
      category: 'video',
      metadata: {
        videoId: videoAnalysis.id,
        fileName: fileName,
        fileSize: fileSize || 0,
        cloud_storage_path: key
      }
    });

    // Check for achievements (don't wait - run async)
    checkAndAwardSimpleAchievements(session.user.id!, 'video').catch(console.error);

    // Trigger shot detection in the background (don't wait)
    triggerShotDetection(videoAnalysis.id, videoUrl).catch((error) => {
      console.error('[ConfirmUpload] Failed to trigger shot detection:', error);
    });

    return NextResponse.json({
      success: true,
      videoId: videoAnalysis.id,
      videoUrl,
      message: 'Video uploaded successfully. Shot detection will begin shortly.'
    })
  } catch (error) {
    console.error('[ConfirmUpload] Error confirming upload:', error)
    
    // Provide more specific error information
    if (error instanceof Error) {
      console.error('[ConfirmUpload] Error details:', {
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
        error: 'Failed to confirm video upload',
        details: error instanceof Error ? error.message : 'Unknown error',
        code: 'CONFIRM_ERROR'
      },
      { status: 500 }
    )
  }
}
