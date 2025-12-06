const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const totalCount = await prisma.trainingVideo.count();
    console.log(`Total training videos: ${totalCount}`);
    
    if (totalCount > 0) {
      const videos = await prisma.trainingVideo.findMany({
        take: 5,
        select: {
          id: true,
          videoId: true,
          title: true,
          skillLevel: true,
          primaryTopic: true,
          url: true
        }
      });
      console.log('\nSample videos:');
      videos.forEach((v, i) => {
        console.log(`${i+1}. ${v.title} (${v.skillLevel}) - ${v.primaryTopic}`);
        console.log(`   VideoID: ${v.videoId}`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
