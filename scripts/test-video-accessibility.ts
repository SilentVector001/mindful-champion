import { PrismaClient } from '@prisma/client';
import { getFileUrl } from '../lib/s3';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();

async function testVideoAccessibility() {
  try {
    console.log('🔍 Testing Video Accessibility...\n');
    
    // Get recent videos with different storage types
    const s3Videos = await prisma.VideoAnalysis.findMany({
      where: { cloud_storage_path: { not: null } },
      take: 3,
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        videoUrl: true,
        cloud_storage_path: true,
        isPublic: true,
        fileName: true,
      }
    });
    
    const localVideos = await prisma.VideoAnalysis.findMany({
      where: { cloud_storage_path: null },
      take: 3,
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        videoUrl: true,
        cloud_storage_path: true,
        fileName: true,
      }
    });
    
    console.log('📊 Testing S3-stored videos:');
    console.log('=' .repeat(60));
    
    for (const video of s3Videos) {
      console.log(`\nVideo ID: ${video.id}`);
      console.log(`File: ${video.fileName}`);
      console.log(`S3 Key: ${video.cloud_storage_path}`);
      console.log(`Is Public: ${video.isPublic}`);
      
      try {
        const signedUrl = await getFileUrl(video.cloud_storage_path!, video.isPublic);
        console.log(`✅ Signed URL generated successfully`);
        console.log(`   URL preview: ${signedUrl.substring(0, 80)}...`);
        
        // Try to fetch headers to verify accessibility
        const response = await fetch(signedUrl, { method: 'HEAD' });
        if (response.ok) {
          const contentLength = response.headers.get('content-length');
          console.log(`✅ Video accessible in S3 (${Math.round(parseInt(contentLength || '0') / 1024 / 1024)} MB)`);
        } else {
          console.log(`❌ Video not accessible: ${response.status} ${response.statusText}`);
        }
      } catch (error: any) {
        console.log(`❌ Error accessing video: ${error.message}`);
      }
    }
    
    console.log('\n\n📊 Testing locally-stored videos:');
    console.log('=' .repeat(60));
    
    for (const video of localVideos) {
      console.log(`\nVideo ID: ${video.id}`);
      console.log(`File: ${video.fileName}`);
      console.log(`Video URL: ${video.videoUrl}`);
      
      const localPath = path.join(process.cwd(), 'public', video.videoUrl);
      console.log(`Local path: ${localPath}`);
      
      if (fs.existsSync(localPath)) {
        const stats = fs.statSync(localPath);
        console.log(`✅ Video file exists (${Math.round(stats.size / 1024 / 1024)} MB)`);
      } else {
        console.log(`❌ Video file MISSING from local storage`);
      }
    }
    
    // Summary
    console.log('\n\n📈 Storage Summary:');
    console.log('=' .repeat(60));
    
    const totalS3 = await prisma.VideoAnalysis.count({
      where: { cloud_storage_path: { not: null } }
    });
    
    const totalLocal = await prisma.VideoAnalysis.count({
      where: { cloud_storage_path: null }
    });
    
    console.log(`Total S3-stored videos: ${totalS3}`);
    console.log(`Total locally-stored videos: ${totalLocal}`);
    console.log(`\nRecommendation: ${totalS3 > 0 ? '✅ S3 storage is working correctly for new uploads' : '⚠️  S3 storage may not be working'}`);
    console.log(`Note: ${totalLocal} older videos still reference local storage`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testVideoAccessibility();
