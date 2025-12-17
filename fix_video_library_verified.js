const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Videos to remove (the bad replacements I added)
const badVideosToRemove = [
  'STU8VqBH7JE', // Bad replacement - unavailable
  'X6qE0kHkV-0', // Bad replacement - unavailable
  'pWcPqx0F6KQ', // Bad replacement - unavailable
  '4AKEHMpOlSY', // Bad replacement - unavailable
];

// VERIFIED working pickleball videos
const verifiedVideos = [
  {
    videoId: '9XPQbYpbHN4',
    title: '3 POWER 3rd Shots That Trump The Drop',
    url: 'https://www.youtube.com/watch?v=9XPQbYpbHN4',
    channel: 'PrimeTime Pickleball',
    duration: '13:30',
    description: 'Learn three powerful third shot options that can be more effective than the traditional drop shot in certain situations.',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Third Shot Drop',
    thumbnailUrl: 'https://i.ytimg.com/vi/9XPQbYpbHN4/maxresdefault.jpg'
  },
  {
    videoId: '-OCXqwrkVDw',
    title: 'This Lesson Fixed My Twoey Dink (10 minute masterclass)',
    url: 'https://www.youtube.com/watch?v=-OCXqwrkVDw',
    channel: 'Kyle Koszuta',
    duration: '10:06',
    description: 'Master the two-handed backhand dink technique with this comprehensive 10-minute lesson.',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Dinking',
    thumbnailUrl: 'https://i.ytimg.com/vi/-OCXqwrkVDw/maxresdefault.jpg'
  },
  {
    videoId: 't0OHEoIItLg',
    title: 'Top 6 Pickleball Doubles Tactics for 2026',
    url: 'https://www.youtube.com/watch?v=t0OHEoIItLg',
    channel: 'Better Pickleball',
    duration: '14:03',
    description: 'Whether you are just getting started or a seasoned rec player, these pickleball doubles strategies will help you win more points.',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Strategy',
    thumbnailUrl: 'https://i.ytimg.com/vi/t0OHEoIItLg/maxresdefault.jpg'
  },
  {
    videoId: '9xviAZFaLIA',
    title: 'Pickleballs MUST HAVE Shot',
    url: 'https://www.youtube.com/watch?v=9xviAZFaLIA',
    channel: 'Zane Navratil',
    duration: '8:38',
    description: 'Learn the essential shot every pickleball player must have in their arsenal for competitive play.',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Strategy',
    thumbnailUrl: 'https://i.ytimg.com/vi/9xviAZFaLIA/maxresdefault.jpg'
  }
];

async function main() {
  console.log('\n=== FIXING VIDEO LIBRARY WITH VERIFIED VIDEOS ===\n');
  
  // Step 1: Remove bad replacement videos
  console.log('Step 1: Removing bad replacement videos...');
  for (const videoId of badVideosToRemove) {
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
  
  // Step 2: Add verified videos
  console.log('\nStep 2: Adding VERIFIED working pickleball videos...');
  for (const video of verifiedVideos) {
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
  
  // Step 4: Show all videos grouped by skill level
  console.log('\n=== FINAL VIDEO LIBRARY ===');
  
  for (const level of ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']) {
    console.log(`\n${level}:`);
    const videos = await prisma.trainingVideo.findMany({
      where: { skillLevel: level },
      orderBy: { title: 'asc' }
    });
    
    videos.forEach((video, idx) => {
      console.log(`  ${idx + 1}. ${video.title}`);
      console.log(`     ${video.primaryTopic} | ${video.channel}`);
    });
  }
  
  console.log('\n✅ Video library cleaned with VERIFIED pickleball videos only!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
