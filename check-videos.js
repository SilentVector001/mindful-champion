require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVideos() {
  try {
    const videos = await prisma.videoAnalysis.findMany({
      select: {
        id: true,
        userId: true,
        title: true,
        videoUrl: true,
        cloud_storage_path: true,
        isPublic: true,
        analysisStatus: true,
        uploadedAt: true
      },
      orderBy: { uploadedAt: 'desc' },
      take: 5
    });
    
    console.log('Recent videos:', JSON.stringify(videos, null, 2));
    
    const totalVideos = await prisma.videoAnalysis.count();
    const videosWithS3 = await prisma.videoAnalysis.count({
      where: { cloud_storage_path: { not: null } }
    });
    
    console.log('\nVideo Statistics:');
    console.log('Total videos:', totalVideos);
    console.log('Videos with S3 path:', videosWithS3);
    console.log('Videos without S3 path:', totalVideos - videosWithS3);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
  }
}

checkVideos();
