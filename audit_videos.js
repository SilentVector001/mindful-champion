const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Videos to manually review based on common issues
const suspectVideos = [
  'rTh6XQ9YZu8', // Advanced Footwork - The Pickleball Studio  
  'x3FfY6nBg5M', // Tournament Strategy - Enhance Pickleball
  'mJ8YnVkp1Qg', // Volley Technique - Pickleburner
  'nLK8bYLH8vQ', // Pro Volley Techniques - Pickleburner
];

async function main() {
  try {
    console.log('\n=== AUDITING TRAINING VIDEOS ===\n');
    
    const videos = await prisma.trainingVideo.findMany({
      orderBy: { title: 'asc' }
    });
    
    console.log(`Total videos to audit: ${videos.length}\n`);
    console.log('Video URLs to manually check:');
    console.log('=' .repeat(80));
    
    for (const video of videos) {
      const isSuspect = suspectVideos.includes(video.videoId);
      const marker = isSuspect ? '⚠️  SUSPICIOUS' : '✓';
      
      console.log(`\n${marker} ${video.title}`);
      console.log(`   Channel: ${video.channel}`);
      console.log(`   Level: ${video.skillLevel}, Topic: ${video.primaryTopic}`);
      console.log(`   URL: ${video.url}`);
      console.log(`   Thumbnail: ${video.thumbnailUrl || 'N/A'}`);
      
      if (isSuspect) {
        console.log(`   🔍 REVIEW THIS VIDEO - May show tennis equipment!`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\nNext Steps:');
    console.log('1. Manually check each video URL above');
    console.log('2. Verify equipment shown: Pickleball paddles (not tennis rackets)');
    console.log('3. Note any videos showing tennis content');
    console.log('4. We will remove incorrect videos from database');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
