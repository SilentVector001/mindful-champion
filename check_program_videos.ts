import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== CHECKING TRAINING PROGRAMS AND VIDEOS ===\n');
  
  // Get all programs
  const programs = await prisma.trainingProgram.findMany({
    where: { isActive: true },
    select: {
      id: true,
      programId: true,
      name: true,
      durationDays: true,
      _count: {
        select: {
          programVideos: true
        }
      }
    }
  });
  
  console.log('Active Programs:');
  programs.forEach(p => {
    console.log(`- ${p.name} (${p.programId})`);
    console.log(`  Duration: ${p.durationDays} days`);
    console.log(`  Videos: ${p._count.programVideos}`);
  });
  
  // Check videos
  const totalVideos = await prisma.trainingVideo.count();
  console.log(`\nTotal Training Videos in database: ${totalVideos}`);
  
  // Check program videos
  const totalProgramVideos = await prisma.programVideo.count();
  console.log(`Total ProgramVideo links: ${totalProgramVideos}`);
  
  const programVideos = await prisma.programVideo.findMany({
    select: {
      id: true,
      programId: true,
      videoId: true,
      day: true,
      order: true,
      video: {
        select: {
          title: true
        }
      },
      program: {
        select: {
          name: true
        }
      }
    },
    take: 10
  });
  
  if (programVideos.length > 0) {
    console.log('\nSample program-video links:');
    programVideos.forEach(pv => {
      console.log(`- ${pv.program.name} / Day ${pv.day}: ${pv.video.title}`);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
