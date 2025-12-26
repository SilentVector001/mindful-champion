const { PrismaClient } = require('/home/ubuntu/mindful_champion/nextjs_space/node_modules/.prisma/client');

async function checkData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('\n=== TRAINING PROGRAMS ===');
    const programs = await prisma.trainingProgram.findMany({
      include: {
        _count: {
          select: { programVideos: true }
        }
      }
    });
    console.log(JSON.stringify(programs, null, 2));
    
    console.log('\n=== PROGRAM VIDEOS (by day) ===');
    const programVideos = await prisma.programVideo.findMany({
      include: {
        video: {
          select: { title: true }
        }
      },
      orderBy: [
        { programId: 'asc' },
        { day: 'asc' },
        { order: 'asc' }
      ]
    });
    console.log(`Total program videos: ${programVideos.length}`);
    
    // Group by program and day
    const byProgram = {};
    programVideos.forEach(pv => {
      if (!byProgram[pv.programId]) byProgram[pv.programId] = {};
      if (!byProgram[pv.programId][pv.day]) byProgram[pv.programId][pv.day] = [];
      byProgram[pv.programId][pv.day].push(pv.video.title);
    });
    
    console.log('\nVideos by Program and Day:');
    console.log(JSON.stringify(byProgram, null, 2));
    
    console.log('\n=== TRAINING VIDEOS ===');
    const videos = await prisma.trainingVideo.count();
    console.log(`Total training videos: ${videos}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
