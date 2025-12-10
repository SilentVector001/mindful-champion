import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function verify() {
  const liveStreams = await prisma.liveStream.count();
  const podcasts = await prisma.podcastShow.count();
  const events = await prisma.externalEvent.count();
  
  console.log('Database Verification:');
  console.log('═'.repeat(40));
  console.log(`Live Streams: ${liveStreams} records`);
  console.log(`Podcast Shows: ${podcasts} records`);
  console.log(`External Events: ${events} records`);
  console.log('═'.repeat(40));
  
  // Show sample data
  const sampleStream = await prisma.liveStream.findFirst();
  const samplePodcast = await prisma.podcastShow.findFirst();
  const sampleEvent = await prisma.externalEvent.findFirst();
  
  if (sampleStream) {
    console.log('\nSample Live Stream:');
    console.log(`  Title: ${sampleStream.title}`);
    console.log(`  Platform: ${sampleStream.platform}`);
    console.log(`  Status: ${sampleStream.status}`);
  }
  
  if (samplePodcast) {
    console.log('\nSample Podcast:');
    console.log(`  Title: ${samplePodcast.title}`);
    console.log(`  Author: ${samplePodcast.author}`);
  }
  
  if (sampleEvent) {
    console.log('\nSample Event:');
    console.log(`  Title: ${sampleEvent.title}`);
    console.log(`  Location: ${sampleEvent.location}`);
    console.log(`  Start Date: ${sampleEvent.startDate.toLocaleDateString()}`);
  }
  
  await prisma.$disconnect();
}

verify().catch(console.error);
