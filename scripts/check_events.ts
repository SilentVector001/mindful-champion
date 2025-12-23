import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const envPath = path.join(process.cwd(), '..', '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const prisma = new PrismaClient();

async function checkEvents() {
  const allEvents = await prisma.externalEvent.findMany({
    orderBy: { startDate: 'desc' },
  });
  
  console.log('\n📅 ALL EVENTS IN DATABASE:');
  console.log(`Total: ${allEvents.length}\n`);
  
  allEvents.forEach(event => {
    console.log(`- ${event.title}`);
    console.log(`  Location: ${event.location}`);
    console.log(`  Dates: ${event.startDate.toLocaleDateString()} - ${event.endDate?.toLocaleDateString() || 'N/A'}`);
    console.log(`  Prize: ${event.prizeMoney}`);
    console.log(`  Type: ${event.eventType}`);
    console.log(`  Last Synced: ${event.lastSyncedAt?.toLocaleString() || 'Never'}`);
    console.log('');
  });

  await prisma.$disconnect();
}

checkEvents().catch(console.error);
