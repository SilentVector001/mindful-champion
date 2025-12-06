const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up failed video analyses...\n');
  
  const failedVideos = await prisma.videoAnalysis.findMany({
    where: { analysisStatus: 'FAILED' },
    select: {
      id: true,
      fileName: true,
    }
  });
  
  console.log(`Found ${failedVideos.length} failed video(s) to clean up:`);
  failedVideos.forEach((v, idx) => {
    console.log(`  ${idx + 1}. ${v.fileName} (${v.id})`);
  });
  
  if (failedVideos.length > 0) {
    const result = await prisma.videoAnalysis.deleteMany({
      where: { analysisStatus: 'FAILED' }
    });
    
    console.log(`\n✅ Deleted ${result.count} failed video(s) from database`);
  } else {
    console.log('\nNo failed videos to clean up');
  }
  
  const remaining = await prisma.videoAnalysis.count();
  console.log(`\nRemaining videos in database: ${remaining}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
