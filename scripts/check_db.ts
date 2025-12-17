import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';

// Load environment variables
config({ path: resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function checkData() {
  console.log('\n📊 Database Verification\n');
  console.log('═'.repeat(50));
  
  // Check Live Streams
  const streams = await prisma.liveStream.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(`\n🎥 Live Streams: ${streams.length} records`);
  streams.forEach(s => {
    console.log(`  - ${s.title} (${s.platform}, ${s.status})`);
  });
  
  // Check Podcasts
  const podcasts = await prisma.podcastShow.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(`\n🎙️ Podcast Shows: ${podcasts.length} records`);
  podcasts.forEach(p => {
    console.log(`  - ${p.title} by ${p.author}`);
  });
  
  // Check Events
  const events = await prisma.externalEvent.findMany({
    orderBy: { startDate: 'desc' },
    take: 5
  });
  console.log(`\n🏆 Events: ${events.length} records`);
  events.forEach(e => {
    console.log(`  - ${e.title} (${e.location}, ${e.startDate.toLocaleDateString()})`);
  });
  
  console.log('\n' + '═'.repeat(50));
  console.log('✅ Database verification complete\n');
  
  await prisma.$disconnect();
}

checkData().catch(console.error);
