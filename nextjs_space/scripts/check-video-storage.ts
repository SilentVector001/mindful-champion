import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function checkVideoStorage() {
  console.log('\n🔍 Checking Video Analysis Records...\n')
  console.log('=' .repeat(60))

  try {
    // Get total count
    const totalCount = await prisma.videoAnalysis.count()
    console.log(`📊 Total VideoAnalysis records: ${totalCount}`)

    // Get recent videos (last 10)
    const recentVideos = await prisma.videoAnalysis.findMany({
      take: 10,
      orderBy: {
        uploadedAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        videoUrl: true,
        cloud_storage_path: true,
        isPublic: true,
        uploadedAt: true,
        analysisStatus: true,
        user: {
          select: {
            email: true,
            firstName: true
          }
        }
      }
    })

    console.log(`\n📹 Recent 10 videos:\n`)
    console.log('=' .repeat(60))

    if (recentVideos.length === 0) {
      console.log('   ❌ No videos found in database')
    } else {
      recentVideos.forEach((video, index) => {
        console.log(`\n${index + 1}. Video ID: ${video.id}`)
        console.log(`   Title: ${video.title || 'Untitled'}`)
        console.log(`   User: ${video.user?.firstName || 'Unknown'} (${video.user?.email})`)
        console.log(`   Uploaded: ${video.uploadedAt.toISOString()}`)
        console.log(`   Status: ${video.analysisStatus}`)
        console.log(`   videoUrl: ${video.videoUrl || 'NOT SET'}`)
        console.log(`   cloud_storage_path: ${video.cloud_storage_path || 'NOT SET'}`)
        console.log(`   isPublic: ${video.isPublic}`)
        
        // Check if this is an S3 video
        const hasCloudPath = !!video.cloud_storage_path
        const hasLocalPath = video.videoUrl && !video.videoUrl.startsWith('http')
        
        if (hasCloudPath) {
          console.log(`   ✅ HAS S3 PATH - File should be in cloud storage`)
        } else if (hasLocalPath) {
          console.log(`   ⚠️  LOCAL PATH - File is stored locally (will be lost on redeploy)`)
        } else {
          console.log(`   ❌ NO STORAGE PATH - Video has no file reference`)
        }
      })
    }

    // Count videos with cloud_storage_path
    const s3VideoCount = await prisma.videoAnalysis.count({
      where: {
        cloud_storage_path: {
          not: null
        }
      }
    })

    const nullStorageCount = await prisma.videoAnalysis.count({
      where: {
        cloud_storage_path: null
      }
    })
    
    const localVideoCount = nullStorageCount

    console.log('\n' + '=' .repeat(60))
    console.log('📊 Storage Summary:')
    console.log('=' .repeat(60))
    console.log(`   Total videos: ${totalCount}`)
    console.log(`   Videos with S3 path: ${s3VideoCount}`)
    console.log(`   Videos with local path only: ${localVideoCount}`)
    console.log(`   Videos with no path: ${totalCount - s3VideoCount - localVideoCount}`)

    // Check if AWS credentials are configured
    const awsConfigured = !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_BUCKET_NAME
    )

    console.log('\n' + '=' .repeat(60))
    console.log('⚙️  AWS Configuration Status:')
    console.log('=' .repeat(60))
    if (awsConfigured) {
      console.log('   ✅ AWS credentials ARE configured')
      console.log('   ✅ S3 upload should work for new videos')
    } else {
      console.log('   ❌ AWS credentials NOT configured')
      console.log('   ❌ S3 upload WILL FAIL for new videos')
      console.log('\n   This explains the "Video file not found" errors!')
    }

    console.log('\n' + '=' .repeat(60))
    console.log('💡 Diagnosis:')
    console.log('=' .repeat(60))
    
    if (!awsConfigured && s3VideoCount > 0) {
      console.log('   🔴 CRITICAL ISSUE IDENTIFIED:')
      console.log(`      - ${s3VideoCount} videos have S3 paths in database`)
      console.log('      - BUT AWS credentials are NOT configured')
      console.log('      - These videos CANNOT be retrieved or played')
      console.log('      - Code is trying to upload to S3 but failing silently')
    } else if (!awsConfigured && s3VideoCount === 0) {
      console.log('   ⚠️  AWS NOT CONFIGURED:')
      console.log('      - No S3-path videos yet, but uploads will fail')
      console.log('      - Need to configure AWS credentials to enable S3')
    } else if (awsConfigured && s3VideoCount > 0) {
      console.log('   ✅ SYSTEM CONFIGURED CORRECTLY:')
      console.log(`      - ${s3VideoCount} videos in S3`)
      console.log('      - AWS credentials configured')
      console.log('      - Video retrieval should work')
    }

    console.log('\n' + '='.repeat(60) + '\n')

  } catch (error: any) {
    console.error('❌ Error checking video storage:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkVideoStorage().catch(console.error)
