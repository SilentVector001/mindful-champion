import { PrismaClient, TournamentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function testAPI() {
  try {
    console.log('🔍 Testing tournaments API logic...\n');
    
    // Simulate the API endpoint logic
    const where: any = {
      status: TournamentStatus.UPCOMING,
    };
    
    const tournaments = await prisma.tournament.findMany({
      where,
      orderBy: { startDate: 'asc' },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });
    
    console.log('📊 API Query Results:');
    console.log(`   Total tournaments found: ${tournaments.length}`);
    console.log(`   Status filter: ${TournamentStatus.UPCOMING}\n`);
    
    if (tournaments.length > 0) {
      console.log('📋 First 5 tournaments:');
      tournaments.slice(0, 5).forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.name}`);
        console.log(`      Location: ${t.city}, ${t.state}`);
        console.log(`      Status: ${t.status}`);
        console.log(`      Start Date: ${t.startDate}`);
        console.log(`      Registrations: ${t._count.registrations}\n`);
      });
    } else {
      console.log('⚠️  No tournaments found with status UPCOMING');
      
      // Check all tournaments regardless of status
      const allTournaments = await prisma.tournament.findMany({
        take: 5,
        select: {
          name: true,
          status: true,
          city: true,
          state: true,
        }
      });
      
      console.log('\n📋 All tournaments (any status):');
      allTournaments.forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.name} - ${t.status} (${t.city}, ${t.state})`);
      });
    }
    
    // Get unique states
    const states = await prisma.tournament.findMany({
      select: { state: true },
      distinct: ['state'],
    });
    
    console.log('\n📍 Unique states:', states.map(s => s.state).join(', '));
    
    await prisma.$disconnect();
    console.log('\n✅ API test complete');
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testAPI();
