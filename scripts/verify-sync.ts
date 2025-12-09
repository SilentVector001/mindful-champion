#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySyncResults() {
  try {
    const liveStreams = await prisma.liveStream.count();
    const podcastShows = await prisma.podcastShow.count();
    const externalEvents = await prisma.externalEvent.count();

    console.log('\n📊 Database Verification:');
    console.log('═'.repeat(50));
    console.log(`Live Streams: ${liveStreams} records`);
    console.log(`Podcast Shows: ${podcastShows} records`);
    console.log(`External Events: ${externalEvents} records`);
    console.log('═'.repeat(50));

    // Show some sample data
    console.log('\n🎥 Sample Live Streams:');
    const streams = await prisma.liveStream.findMany({ take: 3 });
    streams.forEach(s => console.log(`  - ${s.title} (${s.platform})`));

    console.log('\n🎙️ Sample Podcasts:');
    const podcasts = await prisma.podcastShow.findMany({ take: 3 });
    podcasts.forEach(p => console.log(`  - ${p.title} by ${p.author}`));

    console.log('\n🏆 Sample Events:');
    const events = await prisma.externalEvent.findMany({ take: 3 });
    events.forEach(e => console.log(`  - ${e.title} (${e.location})`));

    console.log('\n✅ Verification complete!\n');
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySyncResults();
