import { prisma } from './lib/db';

async function checkStreams() {
  const streams = await prisma.liveStream.findMany();
  console.log('Live Streams in DB:', JSON.stringify(streams, null, 2));
  console.log('\nTotal streams:', streams.length);
  await prisma.$disconnect();
}

checkStreams();
