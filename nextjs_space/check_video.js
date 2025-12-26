const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVideo() {
  try {
    const video = await prisma.videoAnalysis.findUnique({
      where: { id: 'cmilu3br80013q508wx513smx' }
    });
    
    console.log('\n=== VIDEO DATABASE RECORD ===');
    if (!video) {
      console.log('❌ Video not found!');
    } else {
      console.log(`ID: ${video.id}`);
      console.log(`Video URL: ${video.videoUrl}`);
      console.log(`Cloud Storage Path: ${video.cloud_storage_path || 'NULL'}`);
      console.log(`File Name: ${video.fileName}`);
      console.log(`Analysis Status: ${video.analysisStatus}`);
      console.log(`Is Public: ${video.isPublic}`);
      console.log(`Created: ${video.createdAt}`);
      
      console.log('\n=== ANALYSIS ===');
      if (!video.videoUrl || video.videoUrl === '') {
        console.log('⚠️  WARNING: videoUrl is empty or NULL!');
      } else if (video.videoUrl.startsWith('http')) {
        console.log('✅ Video URL is a direct HTTP/HTTPS URL');
      } else {
        console.log('📁 Video URL appears to be an S3 key - needs signed URL');
      }
      
      if (video.cloud_storage_path) {
        console.log(`📦 S3 Key: ${video.cloud_storage_path}`);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkVideo();
