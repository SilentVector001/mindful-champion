import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function checkVideos() {
  try {
    const videos = await prisma.videoAnalysis.findMany({
      orderBy: { uploadedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        userId: true,
        videoUrl: true,
        cloud_storage_path: true,
        isPublic: true,
        analysisStatus: true,
        title: true,
        fileName: true,
        uploadedAt: true,
      }
    })
    
    console.log('\n📹 Recent Video Submissions:')
    console.log('='.repeat(80))
    
    if (videos.length === 0) {
      console.log('❌ No video submissions found in database')
    } else {
      console.log(`✅ Found ${videos.length} video submissions\n`)
      videos.forEach((video, i) => {
        console.log(`${i + 1}. ${video.title || video.fileName}`)
        console.log(`   ID: ${video.id}`)
        console.log(`   User: ${video.userId}`)
        console.log(`   Status: ${video.analysisStatus}`)
        console.log(`   Is Public: ${video.isPublic ? 'Yes' : 'No'}`)
        console.log(`   S3 Path: ${video.cloud_storage_path || '❌ NOT SET'}`)
        console.log(`   Video URL: ${video.videoUrl ? video.videoUrl.substring(0, 60) + '...' : '❌ NOT SET'}`)
        console.log(`   Uploaded: ${video.uploadedAt}`)
        console.log()
      })
    }
    
    console.log('='.repeat(80) + '\n')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkVideos()
