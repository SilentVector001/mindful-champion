const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const videos = await prisma.tournamentVideo.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  
  console.log('Tournament Videos:');
  videos.forEach(video => {
    console.log('\n---');
    console.log('Title:', video.title);
    console.log('Video URL:', video.videoUrl);
    console.log('Thumbnail:', video.thumbnailUrl);
    console.log('Organization:', video.organization);
    console.log('---');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
