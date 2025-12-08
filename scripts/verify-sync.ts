import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function verifySyncResults() {
  try {
    const liveStreams = await prisma.liveStream.count();
    const podcasts = await prisma.podcastShow.count();
    const events = await prisma.externalEvent.count();
    
    console.log('\n📊 Database Verification:');
    console.log('═'.repeat(40));
    console.log(`Live Streams in DB: ${liveStreams}`);
    console.log(`Podcast Shows in DB: ${podcasts}`);
    console.log(`External Events in DB: ${events}`);
    console.log('═'.repeat(40));
    
    // Show latest entries
    const latestStreams = await prisma.liveStream.findMany({
      take: 3,
      orderBy: { updatedAt: 'desc' },
      select: { title: true, platform: true, status: true }
    });
    
    console.log('\n🎥 Latest Live Streams:');
    latestStreams.forEach(s => console.log(`  - ${s.title} (${s.platform}, ${s.status})`));
    
    const latestPodcasts = await prisma.podcastShow.findMany({
      take: 3,
      orderBy: { updatedAt: 'desc' },
      select: { title: true, author: true }
    });
    
    console.log('\n🎙️ Latest Podcasts:');
    latestPodcasts.forEach(p => console.log(`  - ${p.title} by ${p.author}`));
    
    const latestEvents = await prisma.externalEvent.findMany({
      take: 3,
      orderBy: { updatedAt: 'desc' },
      select: { title: true, location: true, startDate: true }
    });
    
    console.log('\n🏆 Latest Events:');
    latestEvents.forEach(e => console.log(`  - ${e.title} at ${e.location} (${e.startDate.toLocaleDateString()})`));
    
  } catch (error) {
    console.error('Error verifying sync:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySyncResults();
