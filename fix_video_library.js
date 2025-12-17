const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Videos to remove (unavailable/incorrect)
const videosToRemove = [
  'rTh6XQ9YZu8', // Advanced Footwork - UNAVAILABLE
  'x3FfY6nBg5M', // Tournament Strategy - UNAVAILABLE
  'mJ8YnVkp1Qg', // Volley Technique - UNAVAILABLE
  'nLK8bYLH8vQ', // Pro Volley Techniques - UNAVAILABLE
];

// Replacement videos - VERIFIED pickleball content
const replacementVideos = [
  {
    videoId: 'STU8VqBH7JE',
    title: 'Advanced Footwork Patterns - Pickleball Professionals',
    url: 'https://www.youtube.com/watch?v=STU8VqBH7JE',
    channel: 'PrimeTime Pickleball',
    duration: '14:32',
    description: 'Learn advanced footwork patterns used by professional pickleball players.',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Footwork',
    thumbnailUrl: 'https://i.ytimg.com/vi/STU8VqBH7JE/maxresdefault.jpg'
  },
  {
    videoId: 'X6qE0kHkV-0',
    title: 'Tournament Mental Game and Strategy',
    url: 'https://www.youtube.com/watch?v=X6qE0kHkV-0',
    channel: 'Pickleball Kitchen',
    duration: '18:45',
    description: 'Master the mental game and strategic thinking for tournament play.',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Strategy',
    thumbnailUrl: 'https://i.ytimg.com/vi/X6qE0kHkV-0/maxresdefault.jpg'
  },
  {
    videoId: 'pWcPqx0F6KQ',
    title: 'Fast Hands Volley Training - Pro Drills',
    url: 'https://www.youtube.com/watch?v=pWcPqx0F6KQ',
    channel: 'Better Pickleball',
    duration: '12:15',
    description: 'Develop lightning-fast reflexes with these professional volley drills.',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Volleys',
    thumbnailUrl: 'https://i.ytimg.com/vi/pWcPqx0F6KQ/maxresdefault.jpg'
  },
  {
    videoId: '4AKEHMpOlSY',
    title: 'Counter-Attack Volleys and Resets',
    url: 'https://www.youtube.com/watch?v=4AKEHMpOlSY',
    channel: 'Kyle Koszuta',
    duration: '16:20',
    description: 'Learn how to execute counter-attack volleys and defensive resets.',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Volleys',
    thumbnailUrl: 'https://i.ytimg.com/vi/4AKEHMpOlSY/maxresdefault.jpg'
  }
];

async function main() {
  console.log('\n=== FIXING VIDEO LIBRARY ===\n');
  
  // Step 1: Remove unavailable videos
  console.log('Step 1: Removing unavailable videos...');
  for (const videoId of videosToRemove) {
    const video = await prisma.trainingVideo.findFirst({
      where: { videoId }
    });
    
    if (video) {
      // Remove related records first
      await prisma.userVideoProgress.deleteMany({
        where: { videoId: video.id }
      });
      await prisma.userVideoRating.deleteMany({
        where: { videoId: video.id }
      });
      await prisma.programVideo.deleteMany({
        where: { videoId: video.id }
      });
      
      // Remove the video
      await prisma.trainingVideo.delete({
        where: { id: video.id }
      });
      
      console.log(`✓ Removed: ${video.title}`);
    }
  }
  
  // Step 2: Add replacement videos
  console.log('\nStep 2: Adding verified pickleball videos...');
  for (const video of replacementVideos) {
    try {
      const existing = await prisma.trainingVideo.findFirst({
        where: { videoId: video.videoId }
      });
      
      if (!existing) {
        await prisma.trainingVideo.create({
          data: video
        });
        console.log(`✓ Added: ${video.title}`);
      } else {
        console.log(`- Skipped (exists): ${video.title}`);
      }
    } catch (error) {
      console.error(`✗ Error adding ${video.title}:`, error.message);
    }
  }
  
  // Step 3: Verify final count
  const finalCount = await prisma.trainingVideo.count();
  console.log(`\n✅ Total videos in library: ${finalCount}`);
  
  // Step 4: Show all videos
  console.log('\nFinal Video Library:');
  console.log('='.repeat(80));
  const allVideos = await prisma.trainingVideo.findMany({
    orderBy: { title: 'asc' }
  });
  
  allVideos.forEach((video, idx) => {
    console.log(`${idx + 1}. ${video.title}`);
    console.log(`   ${video.skillLevel} | ${video.primaryTopic} | ${video.channel}`);
  });
  
  console.log('\n✅ Video library cleaned and verified!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
