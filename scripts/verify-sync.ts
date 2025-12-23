import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const envPath = path.join(process.cwd(), '..', '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const prisma = new PrismaClient();

async function main() {
  console.log('\n📊 Verifying Media Sync Data...\n');
  
  const liveStreams = await prisma.liveStream.count();
  console.log(`✅ Live Streams: ${liveStreams}`);
  
  const podcasts = await prisma.podcastShow.count();
  console.log(`✅ Podcast Shows: ${podcasts}`);
  
  const episodes = await prisma.podcastEpisode.count();
  console.log(`✅ Podcast Episodes: ${episodes}`);
  
  const events = await prisma.externalEvent.count();
  console.log(`✅ External Events: ${events}`);
  
  const cache = await prisma.apiCache.count();
  console.log(`✅ API Cache Entries: ${cache}`);
  
  console.log('\n✨ Verification complete!\n');
  
  await prisma.$disconnect();
}

main();
