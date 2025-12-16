import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function checkSyncResults() {
  const liveStreams = await prisma.liveStream.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 5
  });
  
  const podcasts = await prisma.podcastShow.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 5
  });
  
  const events = await prisma.externalEvent.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 5
  });

  console.log('\n📊 Database Sync Verification:');
  console.log('═'.repeat(60));
  console.log(`\n🎥 Live Streams (${liveStreams.length} recent):`);
  liveStreams.forEach(stream => {
    console.log(`  - ${stream.title} (${stream.platform}, ${stream.status})`);
  });
  
  console.log(`\n🎙️ Podcast Shows (${podcasts.length} recent):`);
  podcasts.forEach(podcast => {
    console.log(`  - ${podcast.title} by ${podcast.author}`);
  });
  
  console.log(`\n🏆 Events (${events.length} recent):`);
  events.forEach(event => {
    console.log(`  - ${event.title} (${event.location})`);
  });
  
  console.log('\n═'.repeat(60));
  
  await prisma.$disconnect();
}

checkSyncResults().catch(console.error);
