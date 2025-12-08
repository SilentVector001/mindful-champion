import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getBucketConfig, createS3Client } from '@/lib/aws-config'

export const dynamic = "force-dynamic"

/**
 * Generate a pre-signed URL for direct S3 upload
 * This bypasses the API route entirely, avoiding the 413 Payload Too Large error
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate session has user ID
    if (!session.user.id) {
      console.error('[PreSignedURL] User ID is undefined in session')
      return NextResponse.json({ 
        error: 'Invalid session. Please log out and log in again.',
        code: 'INVALID_SESSION'
      }, { status: 401 })
    }

    const { fileName, fileType, fileSize } = await request.json()

    // Validate inputs
    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'fileName and fileType are required' },
        { status: 400 }
      )
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (fileSize && fileSize > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 500MB.' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
    if (!validTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a video file (MP4, MOV, AVI, or WebM).' },
        { status: 400 }
      )
    }

    const { bucketName, folderPrefix } = getBucketConfig()

    if (!bucketName) {
      console.error('[PreSignedURL] AWS_BUCKET_NAME not configured')
      return NextResponse.json(
        { error: 'S3 bucket not configured' },
        { status: 500 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uniqueFileName = `${timestamp}-${safeFileName}`

    // Generate S3 key (make it public to avoid signed URL 403 errors)
    const key = `${folderPrefix}public/uploads/${uniqueFileName}`

    console.log('[PreSignedURL] Generating pre-signed URL:', {
      userId: session.user.id,
      fileName,
      key,
      fileSize: fileSize ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB` : 'unknown'
    })

    // Create S3 client
    const s3Client = createS3Client()

    // Create command for PUT operation
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
      // Add metadata for tracking
      Metadata: {
        'uploaded-by': session.user.id,
        'original-filename': fileName
      }
    })

    // Generate pre-signed URL (valid for 1 hour)
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600 // 1 hour
    })

    console.log('[PreSignedURL] Pre-signed URL generated successfully')

    return NextResponse.json({
      uploadUrl,
      key,
      bucket: bucketName
    })
  } catch (error) {
    console.error('[PreSignedURL] Error generating pre-signed URL:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate upload URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
