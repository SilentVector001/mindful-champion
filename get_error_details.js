const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Checking failed videos for error details...\n');
  
  const failedVideos = await prisma.videoAnalysis.findMany({
    where: { analysisStatus: 'FAILED' },
    orderBy: { uploadedAt: 'desc' },
    select: {
      id: true,
      fileName: true,
      videoUrl: true,
      analysisStatus: true,
      uploadedAt: true,
      user: {
        select: {
          email: true,
          id: true
        }
      }
    }
  });
  
  console.log(`Found ${failedVideos.length} failed video(s):\n`);
  
  failedVideos.forEach((video, idx) => {
    console.log(`${idx + 1}. ${video.fileName}`);
    console.log(`   ID: ${video.id}`);
    console.log(`   User: ${video.user.email}`);
    console.log(`   User ID: ${video.user.id}`);
    console.log(`   Video URL: ${video.videoUrl}`);
    console.log(`   Uploaded: ${video.uploadedAt}`);
    console.log('');
  });
  
  // Check if there are any completed analyses
  const completed = await prisma.videoAnalysis.count({
    where: { analysisStatus: 'COMPLETED' }
  });
  
  const pending = await prisma.videoAnalysis.count({
    where: { analysisStatus: 'PENDING' }
  });
  
  console.log(`\nStatus Summary:`);
  console.log(`  FAILED: ${failedVideos.length}`);
  console.log(`  COMPLETED: ${completed}`);
  console.log(`  PENDING: ${pending}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
