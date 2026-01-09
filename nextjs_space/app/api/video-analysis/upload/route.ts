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

    const contentType = request.headers.get('content-type') || ''

    // Handle JSON request for presigned URL
    if (contentType.includes('application/json')) {
      const body = await request.json()
      const { fileName, contentType: fileContentType, fileSize } = body

      if (!fileName) {
        return NextResponse.json({ error: 'fileName required' }, { status: 400 })
      }

      const timestamp = Date.now()
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
      const { bucketName, folderPrefix } = getBucketConfig()
      const s3Key = `${folderPrefix}videos/${user.id}/${timestamp}-${sanitizedName}`

      // Create presigned URL
      const s3Client = createS3Client()
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        ContentType: fileContentType || 'video/mp4'
      })

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
      const videoUrl = `https://${bucketName}.s3.amazonaws.com/${s3Key}`

      // Create pending video record
      const videoId = `vid_${timestamp}_${Math.random().toString(36).substr(2, 9)}`
      await prisma.videoAnalysis.create({
        data: {
          id: videoId,
          userId: user.id,
          title: fileName,
          fileName: fileName,
          cloudStoragePath: s3Key,
          videoUrl: videoUrl,
          analysisStatus: 'PENDING',
          overallScore: 0
        }
      })

      console.log('[Video Upload] Created presigned URL for:', fileName)
      return NextResponse.json({ uploadUrl, cloud_storage_path: s3Key, videoId, videoUrl })
    }

    // Handle FormData direct upload
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string || file?.name || 'Untitled Video'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('[Video Upload] Direct upload:', file.name, 'Size:', file.size)

    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const { bucketName, folderPrefix } = getBucketConfig()
    const s3Key = `${folderPrefix}videos/${user.id}/${timestamp}-${sanitizedName}`

    const s3Client = createS3Client()
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type || 'video/mp4'
    }))

    const videoUrl = `https://${bucketName}.s3.amazonaws.com/${s3Key}`
    const videoId = `vid_${timestamp}_${Math.random().toString(36).substr(2, 9)}`

    await prisma.videoAnalysis.create({
      data: {
        id: videoId,
        userId: user.id,
        title: title,
        fileName: file.name,
        cloudStoragePath: s3Key,
        videoUrl: videoUrl,
        analysisStatus: 'PENDING',
        overallScore: 0
      }
    })

    console.log('[Video Upload] Direct upload complete:', videoId)
    return NextResponse.json({ success: true, videoId, videoUrl, cloud_storage_path: s3Key })

  } catch (error: any) {
    console.error('[Video Upload] Error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}
