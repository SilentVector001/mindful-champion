import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSyncResults() {
  const liveStreams = await prisma.liveStream.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  const podcasts = await prisma.podcastShow.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  const events = await prisma.externalEvent.findMany({
    orderBy: { createdAt: 'desc' },
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
