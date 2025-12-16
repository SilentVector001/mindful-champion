import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDB() {
  try {
    console.log('🔍 Checking database connection...\n');
    
    // Check database URL
    const dbUrl = process.env.DATABASE_URL || '';
    const dbHost = dbUrl.split('@')[1]?.split('/')[0] || 'Unknown';
    console.log('📍 Database Host:', dbHost);
    console.log('📊 Full DATABASE_URL:', dbUrl.replace(/:[^:]*@/, ':****@'), '\n');
    
    // Check tournament count
    const tournamentCount = await prisma.tournament.count();
    console.log('🏆 Current tournament count:', tournamentCount);
    
    if (tournamentCount > 0) {
      const tournaments = await prisma.tournament.findMany({
        take: 3,
        select: {
          id: true,
          name: true,
          status: true,
          city: true,
          state: true,
        }
      });
      console.log('\n📋 Sample tournaments:');
      tournaments.forEach(t => {
        console.log(`  - ${t.name} (${t.city}, ${t.state}) - ${t.status}`);
      });
    }
    
    await prisma.$disconnect();
    console.log('\n✅ Database check complete');
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkDB();
