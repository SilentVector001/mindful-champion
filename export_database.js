const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function exportDatabase() {
  try {
    console.log('📦 Exporting database...\n');
    await prisma.$connect();
    
    const data = {
      users: await prisma.user.findMany(),
      tournaments: await prisma.tournament.findMany(),
      matches: await prisma.match.findMany(),
      registrations: await prisma.tournamentRegistration.findMany(),
      // Add other tables as needed
    };
    
    console.log('✅ Exported:');
    console.log(`   - ${data.users.length} users`);
    console.log(`   - ${data.tournaments.length} tournaments`);
    console.log(`   - ${data.matches.length} matches`);
    console.log(`   - ${data.registrations.length} registrations`);
    
    fs.writeFileSync('/home/ubuntu/database_export.json', JSON.stringify(data, null, 2));
    console.log('\n✅ Export saved to /home/ubuntu/database_export.json');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
  }
}

exportDatabase();
