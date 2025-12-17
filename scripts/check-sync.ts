import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSyncedData() {
  console.log('\n📊 Checking synced data...\n');
  
  const streams = await prisma.liveStream.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(`✅ Live Streams: ${streams.length} records`);
  streams.forEach(s => console.log(`   - ${s.title} (${s.platform})`));
  
  const podcasts = await prisma.podcastShow.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(`\n✅ Podcast Shows: ${podcasts.length} records`);
  podcasts.forEach(p => console.log(`   - ${p.title}`));
  
  const events = await prisma.externalEvent.findMany({
    orderBy: { startDate: 'desc' },
    take: 5
  });
  console.log(`\n✅ Events: ${events.length} records`);
  events.forEach(e => console.log(`   - ${e.title} (${e.location})`));
  
  await prisma.$disconnect();
}

checkSyncedData().catch(console.error);
