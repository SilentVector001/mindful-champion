/**
 * Migration script to update existing videos to use public URLs
 * 
 * This script:
 * 1. Finds all videos with cloud_storage_path
 * 2. Generates public URLs for them
 * 3. Updates videoUrl and isPublic fields
 * 
 * Run with: npx ts-node --project tsconfig.json scripts/migrate-videos-to-public.ts
 */

import { PrismaClient } from '@prisma/client'
import { getBucketConfig } from '../lib/aws-config'

const prisma = new PrismaClient()

async function migrateVideosToPublic() {
  console.log('🚀 Starting video migration to public URLs...\n')
  
  try {
    // Get AWS config
    const { bucketName, region } = getBucketConfig()
    
    if (!bucketName || !region) {
      throw new Error('AWS_BUCKET_NAME or AWS_REGION not configured')
    }
    
    console.log(`✅ AWS Config: bucket=${bucketName}, region=${region}\n`)
    
    // Find all videos with cloud_storage_path
    const videos = await prisma.videoAnalysis.findMany({
      where: {
        cloud_storage_path: {
          not: null
        }
      },
      select: {
        id: true,
        videoUrl: true,
        cloud_storage_path: true,
        isPublic: true,
        title: true
      }
    })
    
    console.log(`📹 Found ${videos.length} videos with cloud storage paths\n`)
    
    if (videos.length === 0) {
      console.log('✨ No videos to migrate. All done!')
      return
    }
    
    // Filter videos that need migration (videoUrl doesn't start with http)
    const videosToMigrate = videos.filter(video => 
      !video.videoUrl?.startsWith('http') && video.cloud_storage_path
    )
    
    console.log(`🔧 ${videosToMigrate.length} videos need migration\n`)
    
    if (videosToMigrate.length === 0) {
      console.log('✨ All videos already have public URLs. All done!')
      return
    }
    
    // Migrate each video
    let successCount = 0
    let errorCount = 0
    
    for (const video of videosToMigrate) {
      try {
        // Generate public URL
        const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${video.cloud_storage_path}`
        
        // Update video record
        await prisma.videoAnalysis.update({
          where: { id: video.id },
          data: {
            videoUrl: publicUrl,
            isPublic: true
          }
        })
        
        console.log(`✅ Migrated: ${video.title || video.id}`)
        console.log(`   Old: ${video.videoUrl}`)
        console.log(`   New: ${publicUrl}\n`)
        
        successCount++
      } catch (error) {
        console.error(`❌ Failed to migrate video ${video.id}:`, error)
        errorCount++
      }
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 Migration Summary')
    console.log('='.repeat(60))
    console.log(`✅ Successfully migrated: ${successCount}`)
    console.log(`❌ Failed: ${errorCount}`)
    console.log(`📹 Total videos: ${videos.length}`)
    console.log('='.repeat(60))
    
    if (successCount > 0) {
      console.log('\n🎉 Migration completed successfully!')
      console.log('💡 All videos now use public URLs for direct playback.')
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migrateVideosToPublic()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
