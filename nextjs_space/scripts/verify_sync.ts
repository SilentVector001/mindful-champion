import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySyncData() {
  try {
    const liveStreams = await prisma.liveStream.count();
    const podcasts = await prisma.podcastShow.count();
    const events = await prisma.externalEvent.count();
    
    console.log('Database Verification:');
    console.log('═'.repeat(40));
    console.log(`Live Streams: ${liveStreams} records`);
    console.log(`Podcast Shows: ${podcasts} records`);
    console.log(`External Events: ${events} records`);
    console.log('═'.repeat(40));
    
    // Show latest synced items
    const latestStreams = await prisma.liveStream.findMany({
      take: 3,
      orderBy: { updatedAt: 'desc' },
      select: { title: true, platform: true, status: true }
    });
    
    console.log('\nLatest Live Streams:');
    latestStreams.forEach(s => console.log(`  - ${s.title} (${s.platform}, ${s.status})`));
    
    const latestPodcasts = await prisma.podcastShow.findMany({
      take: 3,
      orderBy: { updatedAt: 'desc' },
      select: { title: true, author: true }
    });
    
    console.log('\nLatest Podcasts:');
    latestPodcasts.forEach(p => console.log(`  - ${p.title} by ${p.author}`));
    
    const latestEvents = await prisma.externalEvent.findMany({
      take: 2,
      orderBy: { updatedAt: 'desc' },
      select: { title: true, location: true, startDate: true }
    });
    
    console.log('\nUpcoming Events:');
    latestEvents.forEach(e => console.log(`  - ${e.title} at ${e.location} (${e.startDate.toLocaleDateString()})`));
    
  } catch (error) {
    console.error('Error verifying sync data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySyncData();
