import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySync() {
  console.log('📊 Verifying Media Center Content Sync\n');
  
  // Check live streams
  const liveStreams = await prisma.liveStream.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 5
  });
  console.log(`🎥 Live Streams: ${liveStreams.length} recent entries`);
  liveStreams.forEach(stream => {
    console.log(`   - ${stream.title} (${stream.status})`);
  });
  
  // Check podcasts
  const podcasts = await prisma.podcastEpisode.findMany({
    orderBy: { publishDate: 'desc' },
    take: 5,
    include: { show: true }
  });
  console.log(`\n🎙️ Podcast Episodes: ${podcasts.length} recent entries`);
  podcasts.forEach(ep => {
    console.log(`   - ${ep.title} (${ep.show.name})`);
  });
  
  // Check events
  const events = await prisma.externalEvent.findMany({
    orderBy: { startDate: 'asc' },
    take: 5
  });
  console.log(`\n📅 Events: ${events.length} upcoming entries`);
  events.forEach(event => {
    console.log(`   - ${event.name} (${event.startDate.toISOString().split('T')[0]})`);
  });
  
  await prisma.$disconnect();
}

verifySync().catch(console.error);
