const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== CURRENT VIDEO LIBRARY ===\n');
  
  const videos = await prisma.trainingVideo.findMany({
    orderBy: { title: 'asc' }
  });
  
  console.log(`Total videos: ${videos.length}\n`);
  
  videos.forEach((video, idx) => {
    console.log(`${idx + 1}. ${video.title}`);
    console.log(`   ID: ${video.videoId}`);
    console.log(`   Channel: ${video.channel}`);
    console.log(`   Level: ${video.skillLevel} | Topic: ${video.primaryTopic}`);
    console.log(`   URL: ${video.url}`);
    console.log('');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
