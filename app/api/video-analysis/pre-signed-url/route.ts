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
  const startTime = Date.now();
  
  try {
    // 1. Session validation
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.log('[PreSignedURL] ❌ Unauthorized: No session found')
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 })
    }

    // Validate session has user ID
    if (!session.user.id) {
      console.error('[PreSignedURL] ❌ User ID is undefined in session')
      return NextResponse.json({ 
        error: 'Invalid session. Please log out and log in again.',
        code: 'INVALID_SESSION'
      }, { status: 401 })
    }

    // 2. Parse and validate request body
    let fileName: string, fileType: string, fileSize: number;
    try {
      const body = await request.json()
      fileName = body.fileName;
      fileType = body.fileType;
      fileSize = body.fileSize;
    } catch (parseError) {
      console.error('[PreSignedURL] ❌ Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Validate inputs
    if (!fileName || !fileType) {
      console.log('[PreSignedURL] ❌ Missing required fields:', { fileName: !!fileName, fileType: !!fileType })
      return NextResponse.json(
        { error: 'fileName and fileType are required' },
        { status: 400 }
      )
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (fileSize && fileSize > maxSize) {
      console.log('[PreSignedURL] ❌ File too large:', `${(fileSize / (1024 * 1024)).toFixed(2)} MB`)
      return NextResponse.json(
        { error: 'File too large. Maximum size is 500MB.' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
    if (!validTypes.includes(fileType)) {
      console.log('[PreSignedURL] ❌ Invalid file type:', fileType)
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a video file (MP4, MOV, AVI, or WebM).' },
        { status: 400 }
      )
    }

    // 3. Get S3 configuration
    const { bucketName, folderPrefix } = getBucketConfig()

    if (!bucketName) {
      console.error('[PreSignedURL] ❌ FATAL: AWS_BUCKET_NAME not configured')
      return NextResponse.json(
        { error: 'S3 bucket not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // 4. Generate unique filename
    const timestamp = Date.now()
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uniqueFileName = `${timestamp}-${safeFileName}`

    // Generate S3 key (make it public to avoid signed URL 403 errors)
    const key = `${folderPrefix}public/uploads/${uniqueFileName}`

    console.log('[PreSignedURL] 📤 Generating pre-signed URL:', {
      userId: session.user.id,
      fileName,
      key,
      fileSize: fileSize ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB` : 'unknown'
    })

    // 5. Create S3 client (with retry logic)
    let s3Client;
    try {
      s3Client = createS3Client()
    } catch (s3Error) {
      console.error('[PreSignedURL] ❌ Failed to create S3 client:', s3Error)
      return NextResponse.json(
        { 
          error: 'Failed to initialize S3 client',
          details: s3Error instanceof Error ? s3Error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

    // 6. Create command for PUT operation
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
      // Add metadata for tracking
      Metadata: {
        'uploaded-by': session.user.id,
        'original-filename': fileName,
        'upload-timestamp': new Date().toISOString()
      }
    })

    // 7. Generate pre-signed URL (valid for 1 hour) with retry
    let uploadUrl: string;
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        uploadUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600 // 1 hour
        })
        break; // Success, exit retry loop
      } catch (signError) {
        retryCount++;
        console.error(`[PreSignedURL] ❌ Attempt ${retryCount}/${maxRetries + 1} failed to generate signed URL:`, signError)
        
        if (retryCount > maxRetries) {
          // All retries exhausted
          throw new Error(`Failed to generate signed URL after ${maxRetries + 1} attempts: ${signError instanceof Error ? signError.message : 'Unknown error'}`)
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
      }
    }

    const elapsedTime = Date.now() - startTime;
    console.log(`[PreSignedURL] ✅ Pre-signed URL generated successfully in ${elapsedTime}ms`)

    return NextResponse.json({
      uploadUrl,
      key,
      bucket: bucketName
    })
  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    console.error(`[PreSignedURL] ❌ FATAL ERROR after ${elapsedTime}ms:`, error)
    console.error('[PreSignedURL] Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        error: 'Failed to generate upload URL',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
