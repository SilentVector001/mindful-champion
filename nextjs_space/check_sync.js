const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSyncResults() {
  console.log('\n📊 Checking synchronized data...\n');
  
  // Check live streams
  const streams = await prisma.liveStream.findMany({
    select: { title: true, platform: true, status: true, eventType: true }
  });
  console.log(`✅ Live Streams (${streams.length}):`);
  streams.forEach(s => console.log(`   - ${s.title} (${s.platform}, ${s.status})`));
  
  // Check podcasts
  const podcasts = await prisma.podcastShow.findMany({
    select: { title: true, author: true, isActive: true }
  });
  console.log(`\n✅ Podcast Shows (${podcasts.length}):`);
  podcasts.forEach(p => console.log(`   - ${p.title} by ${p.author}`));
  
  // Check events
  const events = await prisma.externalEvent.findMany({
    select: { title: true, eventType: true, startDate: true, location: true }
  });
  console.log(`\n✅ Events (${events.length}):`);
  events.forEach(e => console.log(`   - ${e.title} (${e.location}, ${e.startDate.toLocaleDateString()})`));
  
  await prisma.$disconnect();
}

checkSyncResults().catch(console.error);
