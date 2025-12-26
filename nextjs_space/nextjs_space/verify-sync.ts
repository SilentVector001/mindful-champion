import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySyncResults() {
  console.log('\n📊 Verifying Media Sync Results...\n');

  // Check Live Streams
  const liveStreams = await prisma.liveStream.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 5,
  });
  console.log(`🎥 Live Streams: ${liveStreams.length} records found`);
  liveStreams.forEach(stream => {
    console.log(`   - ${stream.title} (${stream.status})`);
  });

  // Check Podcast Shows
  const podcastShows = await prisma.podcastShow.findMany();
  console.log(`\n🎙️ Podcast Shows: ${podcastShows.length} shows found`);
  podcastShows.forEach(show => {
    console.log(`   - ${show.title}`);
  });

  // Check Podcast Episodes
  const podcastEpisodes = await prisma.podcastEpisode.findMany({
    orderBy: { publishDate: 'desc' },
    take: 5,
  });
  console.log(`\n🎙️ Podcast Episodes: ${podcastEpisodes.length} episodes found`);
  podcastEpisodes.forEach(episode => {
    console.log(`   - ${episode.title}`);
  });

  // Check Events
  const events = await prisma.externalEvent.findMany({
    orderBy: { startDate: 'asc' },
  });
  console.log(`\n📅 Events: ${events.length} events found`);
  events.forEach(event => {
    console.log(`   - ${event.title} (${event.location})`);
  });

  // Check Live Scores Cache
  const liveScores = await prisma.apiCache.findMany({
    where: {
      cacheKey: { startsWith: 'live_score_' },
    },
  });
  console.log(`\n🏆 Live Scores: ${liveScores.length} cached scores found`);
  liveScores.forEach(score => {
    console.log(`   - ${score.cacheKey}`);
  });

  await prisma.$disconnect();
  console.log('\n✅ Verification complete!\n');
}

verifySyncResults();
