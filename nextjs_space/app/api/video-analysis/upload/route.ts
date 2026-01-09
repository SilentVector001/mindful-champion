// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function createS3Client() {
  return new S3Client({})
}

function getBucketConfig() {
  return {
    bucketName: process.env.AWS_BUCKET_NAME ?? '',
    folderPrefix: process.env.AWS_FOLDER_PREFIX ?? ''
  }
}

// POST - Upload video via presigned URL
export async function POST(request: NextRequest) {
  console.log('[Video Upload] Starting upload request')
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string || file?.name || 'Untitled Video'
    const description = formData.get('description') as string || ''

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('[Video Upload] File:', file.name, 'Size:', file.size)

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const { bucketName, folderPrefix } = getBucketConfig()
    const s3Key = `${folderPrefix}videos/${user.id}/${timestamp}-${sanitizedName}`

    // Upload to S3
    const s3Client = createS3Client()
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type || 'video/mp4'
    }))

    // Generate video URL from S3 key
    const videoUrl = `https://${bucketName}.s3.amazonaws.com/${s3Key}`

    // Create database record
    const videoAnalysis = await prisma.videoAnalysis.create({
      data: {
        id: `vid_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        title: title,
        description: description,
        videoUrl: videoUrl,
        fileName: sanitizedName,
        fileSize: file.size,
        duration: 0,
        analysisStatus: 'PENDING'
      }
    })

    console.log('[Video Upload] Success:', videoAnalysis.id)

    return NextResponse.json({
      success: true,
      videoId: videoAnalysis.id,
      message: 'Video uploaded successfully'
    })

  } catch (error) {
    console.error('[Video Upload] Error:', error)
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET - Get presigned upload URL for large files
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('fileName') || 'video.mp4'
    const contentType = searchParams.get('contentType') || 'video/mp4'

    const timestamp = Date.now()
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const { bucketName, folderPrefix } = getBucketConfig()
    const s3Key = `${folderPrefix}videos/${user.id}/${timestamp}-${sanitizedName}`

    const s3Client = createS3Client()
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      ContentType: contentType
    })

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    return NextResponse.json({
      uploadUrl,
      cloud_storage_path: s3Key,
      userId: user.id
    })

  } catch (error) {
    console.error('[Video Upload] Presigned URL error:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}
