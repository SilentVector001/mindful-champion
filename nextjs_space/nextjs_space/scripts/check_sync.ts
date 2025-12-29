import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSync() {
  console.log('\n📊 Checking synced data...\n');
  
  // Check live streams
  const streams = await prisma.liveStream.findMany({
    take: 5,
    orderBy: { updatedAt: 'desc' }
  });
  console.log(`✅ Live Streams: ${streams.length} found`);
  streams.forEach(s => console.log(`   - ${s.title} (${s.status})`));
  
  // Check podcast shows and episodes
  const shows = await prisma.podcastShow.findMany();
  console.log(`\n✅ Podcast Shows: ${shows.length} found`);
  for (const show of shows) {
    const episodes = await prisma.podcastEpisode.count({ where: { showId: show.id } });
    console.log(`   - ${show.title}: ${episodes} episodes`);
  }
  
  // Check events
  const events = await prisma.externalEvent.findMany({
    take: 5,
    orderBy: { lastSyncedAt: 'desc' }
  });
  console.log(`\n✅ Events: ${events.length} found`);
  events.forEach(e => console.log(`   - ${e.title} (${e.location})`));
  
  // Check live scores cache
  const scores = await prisma.apiCache.findMany({
    where: { cacheKey: { startsWith: 'live_score_' } }
  });
  console.log(`\n✅ Live Scores Cached: ${scores.length} found`);
  
  await prisma.$disconnect();
}

checkSync();
