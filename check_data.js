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
    
    console.log('\n=== TRAINING VIDEOS ===');
    const videos = await prisma.trainingVideo.count();
    console.log(`Total training videos: ${videos}`);
    
    if (programs.length > 0) {
      console.log('\n=== PROGRAM VIDEOS FOR FIRST PROGRAM ===');
      const programVideos = await prisma.programVideo.findMany({
        where: { programId: programs[0].id },
        include: {
          video: {
            select: { title: true }
          }
        },
        orderBy: [
          { day: 'asc' },
          { order: 'asc' }
        ]
      });
      
      const byDay = {};
      programVideos.forEach(pv => {
        if (!byDay[pv.day]) byDay[pv.day] = [];
        byDay[pv.day].push(pv.video.title);
      });
      
      console.log('Videos by day:', JSON.stringify(byDay, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
