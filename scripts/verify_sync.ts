import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from parent directory
const envPath = path.join(process.cwd(), '..', '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const prisma = new PrismaClient();

async function verify() {
  console.log('\n📊 VERIFICATION REPORT\n');
  console.log('=' .repeat(80));
  
  // Check live streams
  const liveStreams = await prisma.liveStream.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 5,
  });
  console.log('\n🎥 LIVE STREAMS:');
  console.log(`Total: ${liveStreams.length}`);
  liveStreams.forEach(stream => {
    console.log(`  - ${stream.title} [${stream.status}]`);
    console.log(`    Platform: ${stream.platform}, Viewers: ${stream.viewerCount}`);
  });

  // Check podcast shows and episodes
  const podcastShows = await prisma.podcastShow.findMany({
    include: { episodes: { take: 2, orderBy: { publishDate: 'desc' } } },
  });
  console.log('\n🎙️ PODCASTS:');
  console.log(`Total Shows: ${podcastShows.length}`);
  podcastShows.forEach(show => {
    console.log(`  - ${show.title} (${show.episodes.length} recent episodes)`);
    show.episodes.forEach(ep => {
      console.log(`    • ${ep.title}`);
    });
  });

  // Check events
  const events = await prisma.externalEvent.findMany({
    where: { startDate: { gte: new Date() } },
    orderBy: { startDate: 'asc' },
    take: 5,
  });
  console.log('\n📅 UPCOMING EVENTS:');
  console.log(`Total: ${events.length}`);
  events.forEach(event => {
    console.log(`  - ${event.title}`);
    console.log(`    ${event.location} | ${event.startDate.toLocaleDateString()}`);
    console.log(`    Prize: ${event.prizeMoney}`);
  });

  // Check live scores cache
  const liveScores = await prisma.apiCache.findMany({
    where: { cacheKey: { startsWith: 'live_score_' } },
  });
  console.log('\n🏆 LIVE SCORES CACHED:');
  console.log(`Total: ${liveScores.length}`);
  liveScores.forEach(score => {
    const data = score.data as any;
    console.log(`  - ${data.player1} vs ${data.player2}`);
    console.log(`    ${data.tournament} | ${data.status}`);
    console.log(`    Score: ${data.score}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('✅ Verification complete\n');

  await prisma.$disconnect();
}

verify().catch(console.error);
