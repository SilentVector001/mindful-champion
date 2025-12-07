import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';

config({ path: resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function verifySyncData() {
  try {
    const liveStreams = await prisma.liveStream.findMany();
    const podcasts = await prisma.podcastShow.findMany();
    const events = await prisma.externalEvent.findMany();

    console.log('\n📊 Database Verification:');
    console.log('═'.repeat(50));
    console.log(`Live Streams: ${liveStreams.length} records`);
    console.log(`Podcast Shows: ${podcasts.length} records`);
    console.log(`External Events: ${events.length} records`);
    console.log('═'.repeat(50));

    if (liveStreams.length > 0) {
      console.log('\n🎥 Sample Live Stream:');
      console.log(`  - ${liveStreams[0].title}`);
      console.log(`  - Platform: ${liveStreams[0].platform}`);
      console.log(`  - Status: ${liveStreams[0].status}`);
    }

    if (podcasts.length > 0) {
      console.log('\n🎙️ Sample Podcast:');
      console.log(`  - ${podcasts[0].title}`);
      console.log(`  - Author: ${podcasts[0].author}`);
    }

    if (events.length > 0) {
      console.log('\n🏆 Sample Event:');
      console.log(`  - ${events[0].title}`);
      console.log(`  - Location: ${events[0].location}`);
      console.log(`  - Date: ${events[0].startDate.toLocaleDateString()}`);
    }

    console.log('\n✅ Verification complete!\n');
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySyncData();
