import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getBucketConfig, createS3Client } from '@/lib/aws-config'

export const dynamic = "force-dynamic"
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes max for upload

/**
 * Server-side upload proxy - bypasses CORS entirely
 * Browser uploads to this API, API uploads to S3
 * This is a workaround for CORS configuration issues
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 1. Session validation
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('[UploadProxy] ❌ Unauthorized: No session')
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 })
    }

    console.log('[UploadProxy] 📤 Starting server-side upload for user:', session.user.id)

    // 2. Parse multipart form data
    let formData: FormData
    try {
      formData = await request.formData()
    } catch (parseError) {
      console.error('[UploadProxy] ❌ Failed to parse form data:', parseError)
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const file = formData.get('file') as File
    const fileName = (formData.get('fileName') as string) || (file ? file.name : '')
    
    if (!file) {
      console.log('[UploadProxy] ❌ No file in request')
      return NextResponse.json({ error: 'No file provided in request' }, { status: 400 })
    }

    // 3. Validate file
    const fileSize = file.size
    const fileType = file.type
    
    console.log('[UploadProxy] File details:', {
      fileName,
      size: `${(fileSize / (1024 * 1024)).toFixed(2)} MB`,
      type: fileType
    })

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024
    if (fileSize > maxSize) {
      console.log('[UploadProxy] ❌ File too large:', `${(fileSize / (1024 * 1024)).toFixed(2)} MB`)
      return NextResponse.json(
        { error: 'File too large. Maximum size is 500MB.' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
    if (!validTypes.includes(fileType)) {
      console.log('[UploadProxy] ❌ Invalid file type:', fileType)
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a video file (MP4, MOV, AVI, or WebM).' },
        { status: 400 }
      )
    }

    // 4. Get S3 configuration
    const { bucketName, folderPrefix, region } = getBucketConfig()
    
    if (!bucketName) {
      console.error('[UploadProxy] ❌ FATAL: AWS_BUCKET_NAME not configured')
      return NextResponse.json(
        { error: 'S3 bucket not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // 5. Generate unique filename and key
    const timestamp = Date.now()
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uniqueFileName = `${timestamp}-${safeFileName}`
    const key = `${folderPrefix}public/uploads/${uniqueFileName}`

    console.log('[UploadProxy] Target S3:', {
      bucket: bucketName,
      key,
      region
    })

    // 6. Convert file to buffer (stream the file data)
    console.log('[UploadProxy] Buffering file data...')
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    console.log('[UploadProxy] File buffered, uploading to S3...')

    // 7. Create S3 client and upload
    const s3Client = createS3Client()
    
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: fileType,
      Metadata: {
        'uploaded-by': session.user.id,
        'original-filename': fileName,
        'upload-timestamp': new Date().toISOString(),
        'upload-method': 'server-proxy'
      }
    })

    const uploadStartTime = Date.now()
    
    try {
      await s3Client.send(uploadCommand)
    } catch (s3Error) {
      console.error('[UploadProxy] ❌ S3 upload failed:', s3Error)
      return NextResponse.json(
        { 
          error: 'Failed to upload to storage',
          details: s3Error instanceof Error ? s3Error.message : 'Unknown S3 error'
        },
        { status: 500 }
      )
    }
    
    const uploadTime = Date.now() - uploadStartTime

    console.log(`[UploadProxy] ✅ S3 upload complete in ${uploadTime}ms`)

    // 8. Generate video URL
    const videoUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`

    const totalTime = Date.now() - startTime
    console.log(`[UploadProxy] ✅ Total processing time: ${totalTime}ms`)

    return NextResponse.json({
      success: true,
      key,
      url: videoUrl,
      bucket: bucketName,
      uploadTime,
      totalTime,
      method: 'server-proxy'
    })

  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error(`[UploadProxy] ❌ FATAL ERROR after ${totalTime}ms:`, error)
    console.error('[UploadProxy] Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
