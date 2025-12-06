const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  try {
    const videos = await prisma.trainingVideo.findMany({
      orderBy: { title: 'asc' }
    });
    
    console.log(`Total videos: ${videos.length}\n`);
    
    videos.forEach((video, idx) => {
      console.log(`${idx + 1}. ${video.title}`);
      console.log(`   Channel: ${video.channel}`);
      console.log(`   Level: ${video.skillLevel}, Topic: ${video.primaryTopic}`);
      console.log(`   URL: ${video.url}`);
      console.log(`   VideoID: ${video.videoId}\n`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
