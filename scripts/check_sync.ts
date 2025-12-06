import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSyncResults() {
  const liveStreams = await prisma.liveStream.findMany({
    select: {
      title: true,
      platform: true,
      status: true,
      updatedAt: true
    },
    orderBy: { updatedAt: 'desc' },
    take: 5
  });

  const podcasts = await prisma.podcastShow.findMany({
    select: {
      title: true,
      author: true,
      updatedAt: true
    },
    orderBy: { updatedAt: 'desc' },
    take: 5
  });

  const events = await prisma.externalEvent.findMany({
    select: {
      title: true,
      eventType: true,
      startDate: true,
      location: true,
      updatedAt: true
    },
    orderBy: { updatedAt: 'desc' },
    take: 5
  });

  console.log('\n📊 Database Sync Verification:\n');
  console.log('Live Streams:', liveStreams.length);
  liveStreams.forEach(s => console.log(`  - ${s.title} (${s.platform}, ${s.status})`));
  
  console.log('\nPodcast Shows:', podcasts.length);
  podcasts.forEach(p => console.log(`  - ${p.title} by ${p.author}`));
  
  console.log('\nExternal Events:', events.length);
  events.forEach(e => console.log(`  - ${e.title} (${e.location})`));

  await prisma.$disconnect();
}

checkSyncResults().catch(console.error);
