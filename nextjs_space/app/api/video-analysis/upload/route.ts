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
    const { bucketName, folderPrefix } = getBucketConfig()
    console.log('[Video Upload] Bucket:', bucketName, 'Prefix:', folderPrefix)
    
    if (!bucketName) {
      console.error('[Video Upload] AWS_BUCKET_NAME not configured')
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 })
    }

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
      const s3Key = `${folderPrefix}videos/${user.id}/${timestamp}-${sanitizedName}`

      // Create presigned URL
      const s3Client = createS3Client()
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        ContentType: fileContentType || 'video/mp4'
      })

      console.log('[Video Upload] Creating presigned URL for key:', s3Key)
      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
      const videoUrl = `https://${bucketName}.s3.us-west-2.amazonaws.com/${s3Key}`
      console.log('[Video Upload] Presigned URL created successfully')

      // Create pending video record
      const videoId = `vid_${timestamp}_${Math.random().toString(36).substr(2, 9)}`
      await prisma.VideoAnalysis.create({
        data: {
          id: videoId,
          userId: user.id,
          title: fileName,
          fileName: fileName,
          cloudStoragePath: s3Key,
          videoUrl: videoUrl,
          analysisStatus: 'PENDING',
          overallScore: 0,
          fileSize: fileSize || 0,
          duration: 0
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

    const timestamp2 = Date.now()
    const sanitizedName2 = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const s3Key2 = `${folderPrefix}videos/${user.id}/${timestamp2}-${sanitizedName2}`

    const s3Client = createS3Client()
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key2,
      Body: buffer,
      ContentType: file.type || 'video/mp4'
    }))

    const videoUrl2 = `https://${bucketName}.s3.us-west-2.amazonaws.com/${s3Key2}`
    const videoId2 = `vid_${timestamp2}_${Math.random().toString(36).substr(2, 9)}`

    await prisma.VideoAnalysis.create({
      data: {
        id: videoId2,
        userId: user.id,
        title: title,
        fileName: file.name,
        cloudStoragePath: s3Key2,
        videoUrl: videoUrl2,
        analysisStatus: 'PENDING',
        overallScore: 0,
        fileSize: file.size,
        duration: 0
      }
    })

    console.log('[Video Upload] Direct upload complete:', videoId2)
    return NextResponse.json({ success: true, videoId: videoId2, videoUrl: videoUrl2, cloud_storage_path: s3Key2 })

  } catch (error: any) {
    console.error('[Video Upload] Error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}
