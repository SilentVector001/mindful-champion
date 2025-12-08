const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function importDatabase() {
  try {
    console.log('📥 Importing database to new Vercel Postgres...\n');
    await prisma.$connect();
    
    const data = JSON.parse(fs.readFileSync('/home/ubuntu/database_export.json', 'utf8'));
    
    console.log('📊 Data to import:');
    console.log(`   - ${data.users.length} users`);
    console.log(`   - ${data.tournaments.length} tournaments`);
    console.log(`   - ${data.matches.length} matches`);
    console.log(`   - ${data.registrations.length} registrations\n`);
    
    // Import users
    console.log('👥 Importing users...');
    let userCount = 0;
    for (const user of data.users) {
      try {
        await prisma.user.upsert({
          where: { id: user.id },
          update: user,
          create: user
        });
        userCount++;
        process.stdout.write(`\r   Progress: ${userCount}/${data.users.length}`);
      } catch (error) {
        console.error(`\n   ⚠️  Error importing user ${user.email}:`, error.message);
      }
    }
    console.log(`\n✅ Imported ${userCount} users`);
    
    // Import tournaments
    console.log('\n🏆 Importing tournaments...');
    let tournamentCount = 0;
    for (const tournament of data.tournaments) {
      try {
        await prisma.tournament.upsert({
          where: { id: tournament.id },
          update: tournament,
          create: tournament
        });
        tournamentCount++;
        process.stdout.write(`\r   Progress: ${tournamentCount}/${data.tournaments.length}`);
      } catch (error) {
        console.error(`\n   ⚠️  Error importing tournament ${tournament.name}:`, error.message);
      }
    }
    console.log(`\n✅ Imported ${tournamentCount} tournaments`);
    
    // Import matches if any
    if (data.matches.length > 0) {
      console.log('\n🎾 Importing matches...');
      let matchCount = 0;
      for (const match of data.matches) {
        try {
          await prisma.match.upsert({
            where: { id: match.id },
            update: match,
            create: match
          });
          matchCount++;
          process.stdout.write(`\r   Progress: ${matchCount}/${data.matches.length}`);
        } catch (error) {
          console.error(`\n   ⚠️  Error importing match:`, error.message);
        }
      }
      console.log(`\n✅ Imported ${matchCount} matches`);
    }
    
    // Import registrations if any
    if (data.registrations.length > 0) {
      console.log('\n📝 Importing registrations...');
      let regCount = 0;
      for (const reg of data.registrations) {
        try {
          await prisma.tournamentRegistration.upsert({
            where: { id: reg.id },
            update: reg,
            create: reg
          });
          regCount++;
          process.stdout.write(`\r   Progress: ${regCount}/${data.registrations.length}`);
        } catch (error) {
          console.error(`\n   ⚠️  Error importing registration:`, error.message);
        }
      }
      console.log(`\n✅ Imported ${regCount} registrations`);
    }
    
    console.log('\n✅ ✅ ✅ IMPORT COMPLETE! ✅ ✅ ✅');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${userCount}/${data.users.length}`);
    console.log(`   - Tournaments: ${tournamentCount}/${data.tournaments.length}`);
    console.log(`   - Matches: ${data.matches.length}`);
    console.log(`   - Registrations: ${data.registrations.length}`);
    
    console.log('\n🔐 Admin credentials:');
    console.log('   Email: deansnow59@gmail.com');
    console.log('   Password: MindfulChampion2025!');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    await prisma.$disconnect();
    process.exit(1);
  }
}

importDatabase();
