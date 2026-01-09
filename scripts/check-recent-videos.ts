import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function checkRecentVideos() {
  try {
    console.log('\n🔍 Checking Recent Video Uploads...\n')

    // Get the 10 most recent video uploads
    const recentVideos = await prisma.VideoAnalysis.findMany({
      take: 10,
      orderBy: {
        uploadedAt: 'desc'
      },
      select: {
        id: true,
        userId: true,
        videoUrl: true,
        cloud_storage_path: true,
        isPublic: true,
        analysisStatus: true,
        uploadedAt: true,
        user: {
          select: {
            email: true,
            firstName: true
          }
        }
      }
    })

    if (recentVideos.length === 0) {
      console.log('❌ No videos found in database')
      return
    }

    console.log(`✅ Found ${recentVideos.length} recent videos:\n`)

    recentVideos.forEach((video, index) => {
      console.log(`📹 Video #${index + 1}:`)
      console.log(`   ID: ${video.id}`)
      console.log(`   User: ${video.user?.firstName} (${video.user?.email})`)
      console.log(`   Uploaded: ${video.uploadedAt.toISOString()}`)
      console.log(`   Status: ${video.analysisStatus}`)
      console.log(`   Video URL: ${video.videoUrl || 'NULL'}`)
      console.log(`   Cloud Storage Path: ${video.cloud_storage_path || 'NULL'}`)
      console.log(`   Is Public: ${video.isPublic}`)
      console.log(`   🔑 Has S3 Path: ${video.cloud_storage_path ? '✅ YES' : '❌ NO'}`)
      console.log('')
    })

    // Check for videos uploaded in the last hour (likely after fixes)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const veryRecentVideos = recentVideos.filter(v => v.uploadedAt > oneHourAgo)
    
    console.log(`\n📊 Analysis:`)
    console.log(`   Total recent videos: ${recentVideos.length}`)
    console.log(`   Videos uploaded in last hour: ${veryRecentVideos.length}`)
    console.log(`   Videos with S3 path: ${recentVideos.filter(v => v.cloud_storage_path).length}`)
    console.log(`   Videos without S3 path: ${recentVideos.filter(v => !v.cloud_storage_path).length}`)

    if (veryRecentVideos.length > 0) {
      console.log(`\n⚠️  Recently uploaded videos (last hour):`)
      veryRecentVideos.forEach(v => {
        console.log(`   - ${v.id} (${v.cloud_storage_path ? 'HAS' : 'MISSING'} S3 path)`)
      })
    }

  } catch (error) {
    console.error('❌ Error checking videos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRecentVideos()
