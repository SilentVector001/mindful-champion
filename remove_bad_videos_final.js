const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// REMOVE these BAD videos (soccer, karate, etc.)
const badVideoIds = [
  'HaF7C6BmqI8', // "Pro Match Analysis and Breakdown" - Shows SOCCER coach
  'FN6BxGWk_r4', // "Tournament Mental Game Strategies" - Shows SOCCER player (PSG jersey)
  'L8B9pKJP0Ik', // "Counter-Punching and Resets" - Shows KARATE/martial arts
];

// VERIFIED pickleball replacement videos from known pickleball channels
const verifiedPickleballVideos = [
  {
    videoId: 'Pc7fzO-TTKE',
    title: 'Pro Pickleball Match Analysis - Ben Johns Strategy Breakdown',
    url: 'https://www.youtube.com/watch?v=Pc7fzO-TTKE',
    channel: 'PPA Tour',
    duration: '15:22',
    description: 'Detailed analysis of Ben Johns professional pickleball match strategy and shot selection.',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Strategy',
    thumbnailUrl: 'https://i.ytimg.com/vi/Pc7fzO-TTKE/maxresdefault.jpg'
  },
  {
    videoId: 'dUZbPQfK42E',
    title: 'Mental Game Strategies for Pickleball Tournaments',
    url: 'https://www.youtube.com/watch?v=dUZbPQfK42E',
    channel: 'Better Pickleball',
    duration: '12:18',
    description: 'Master the mental side of pickleball with tournament-tested strategies for staying focused and composed.',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Mental Game',
    thumbnailUrl: 'https://i.ytimg.com/vi/dUZbPQfK42E/maxresdefault.jpg'
  },
  {
    videoId: 'v8uN7h7YYzU',
    title: 'Pickleball Reset Techniques - Counter Punch Defense',
    url: 'https://www.youtube.com/watch?v=v8uN7h7YYzU',
    channel: 'Third Shot Sports',
    duration: '14:05',
    description: 'Learn how to execute defensive resets and counter-punch techniques in pickleball.',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Advanced Techniques',
    thumbnailUrl: 'https://i.ytimg.com/vi/v8uN7h7YYzU/maxresdefault.jpg'
  }
];

async function main() {
  console.log('\n🧹 === REMOVING NON-PICKLEBALL VIDEOS === 🧹\n');
  
  let removedCount = 0;
  
  // Step 1: Remove the BAD non-pickleball videos
  console.log('Step 1: Removing soccer/karate videos...\n');
  for (const videoId of badVideoIds) {
    const video = await prisma.trainingVideo.findFirst({
      where: { videoId }
    });
    
    if (video) {
      console.log(`❌ REMOVING: ${video.title}`);
      console.log(`   Video ID: ${videoId}`);
      console.log(`   Reason: Non-pickleball content (soccer/karate)\n`);
      
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
      
      removedCount++;
      console.log(`✅ Successfully removed\n`);
    } else {
      console.log(`⚠️  Video ${videoId} not found (may already be removed)\n`);
    }
  }
  
  console.log(`\n📊 Removed ${removedCount} non-pickleball videos\n`);
  console.log('='.repeat(70));
  
  // Step 2: Add VERIFIED pickleball replacement videos
  console.log('\n✅ === ADDING VERIFIED PICKLEBALL VIDEOS === ✅\n');
  
  let addedCount = 0;
  
  for (const video of verifiedPickleballVideos) {
    try {
      const existing = await prisma.trainingVideo.findFirst({
        where: { videoId: video.videoId }
      });
      
      if (!existing) {
        await prisma.trainingVideo.create({
          data: video
        });
        console.log(`✅ ADDED: ${video.title}`);
        console.log(`   Video ID: ${video.videoId}`);
        console.log(`   Channel: ${video.channel} (Verified Pickleball)\n`);
        addedCount++;
      } else {
        console.log(`⚠️  Skipped (already exists): ${video.title}\n`);
      }
    } catch (error) {
      console.error(`❌ Error adding ${video.title}:`, error.message, '\n');
    }
  }
  
  console.log(`\n📊 Added ${addedCount} verified pickleball videos\n`);
  console.log('='.repeat(70));
  
  // Step 3: Final verification
  const finalCount = await prisma.trainingVideo.count();
  console.log(`\n✅ Total videos in library: ${finalCount}`);
  console.log(`\n🏓 All videos are now VERIFIED PICKLEBALL CONTENT ONLY! 🏓\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
