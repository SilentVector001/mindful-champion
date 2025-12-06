import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== POPULATING PROGRAM VIDEOS ===\n');
  
  // Get programs
  const programs = await prisma.trainingProgram.findMany({
    where: { isActive: true },
    orderBy: { durationDays: 'asc' }
  });
  
  // Get all training videos
  const videos = await prisma.trainingVideo.findMany({
    orderBy: { title: 'asc' }
  });
  
  console.log(`Found ${programs.length} programs and ${videos.length} videos`);
  
  // Distribute videos across programs
  const videosPerProgram = Math.floor(videos.length / programs.length);
  
  for (let i = 0; i < programs.length; i++) {
    const program = programs[i];
    const startIdx = i * videosPerProgram;
    const endIdx = i === programs.length - 1 ? videos.length : startIdx + videosPerProgram;
    const programVideos = videos.slice(startIdx, endIdx);
    
    console.log(`\nProgram: ${program.name} (${program.durationDays} days)`);
    console.log(`Assigning ${programVideos.length} videos`);
    
    // Distribute videos across days
    const videosPerDay = Math.ceil(programVideos.length / program.durationDays);
    
    let videoIdx = 0;
    for (let day = 1; day <= program.durationDays && videoIdx < programVideos.length; day++) {
      const dayVideos = programVideos.slice(videoIdx, Math.min(videoIdx + videosPerDay, programVideos.length));
      
      for (let order = 0; order < dayVideos.length; order++) {
        const video = dayVideos[order];
        
        try {
          await prisma.programVideo.create({
            data: {
              programId: program.id,
              videoId: video.id,
              day: day,
              order: order
            }
          });
        } catch (error: any) {
          if (!error.message.includes('Unique constraint')) {
            console.error(`Error adding video: ${error.message}`);
          }
        }
      }
      
      videoIdx += dayVideos.length;
      console.log(`  Day ${day}: ${dayVideos.length} videos`);
    }
  }
  
  // Verify
  const totalLinks = await prisma.programVideo.count();
  console.log(`\n✅ Total program-video links created: ${totalLinks}`);
  
  // Show summary
  for (const program of programs) {
    const count = await prisma.programVideo.count({
      where: { programId: program.id }
    });
    console.log(`${program.name}: ${count} videos`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
