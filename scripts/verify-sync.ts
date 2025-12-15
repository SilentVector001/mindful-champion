import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function verifySyncData() {
  try {
    const liveStreams = await prisma.liveStream.count();
    const podcasts = await prisma.podcastShow.count();
    const events = await prisma.externalEvent.count();
    
    console.log('Database Verification:');
    console.log('═'.repeat(40));
    console.log(`Live Streams: ${liveStreams}`);
    console.log(`Podcast Shows: ${podcasts}`);
    console.log(`External Events: ${events}`);
    console.log('═'.repeat(40));
    
    // Show recent live streams
    const recentStreams = await prisma.liveStream.findMany({
      take: 3,
      orderBy: { updatedAt: 'desc' },
      select: { title: true, platform: true, status: true }
    });
    
    console.log('\nRecent Live Streams:');
    recentStreams.forEach(s => console.log(`  - ${s.title} (${s.platform}, ${s.status})`));
    
    // Show recent podcasts
    const recentPodcasts = await prisma.podcastShow.findMany({
      take: 3,
      orderBy: { updatedAt: 'desc' },
      select: { title: true, author: true }
    });
    
    console.log('\nRecent Podcasts:');
    recentPodcasts.forEach(p => console.log(`  - ${p.title} by ${p.author}`));
    
    // Show recent events
    const recentEvents = await prisma.externalEvent.findMany({
      take: 3,
      orderBy: { startDate: 'asc' },
      select: { title: true, location: true, startDate: true }
    });
    
    console.log('\nUpcoming Events:');
    recentEvents.forEach(e => console.log(`  - ${e.title} in ${e.location} (${e.startDate.toLocaleDateString()})`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySyncData();
