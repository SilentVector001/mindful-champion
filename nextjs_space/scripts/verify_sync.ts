import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('\n=== VERIFICATION REPORT ===\n');
  
  // Check live streams
  const streams = await prisma.liveStream.findMany();
  console.log(`✅ Live Streams: ${streams.length} records`);
  streams.forEach(s => console.log(`   - ${s.title} (${s.status})`));
  
  // Check podcast shows
  const shows = await prisma.podcastShow.findMany({
    include: { episodes: true }
  });
  console.log(`\n✅ Podcast Shows: ${shows.length} shows`);
  shows.forEach(s => console.log(`   - ${s.title}: ${s.episodes.length} episodes`));
  
  // Check events
  const events = await prisma.externalEvent.findMany();
  console.log(`\n✅ Events: ${events.length} records`);
  events.forEach(e => console.log(`   - ${e.title} (${e.startDate.toISOString().split('T')[0]})`));
  
  // Check live scores cache
  const scores = await prisma.apiCache.findMany({
    where: { cacheKey: { startsWith: 'live_score_' } }
  });
  console.log(`\n✅ Live Scores (cached): ${scores.length} records`);
  
  await prisma.$disconnect();
}

verify();
