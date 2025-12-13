import { prisma } from './lib/db';

async function main() {
  console.log('🔍 Checking for fake data in database...\n');
  
  // Check LiveStream table
  const liveStreams = await prisma.liveStream.findMany({
    where: {
      OR: [
        { title: { contains: 'Utah', mode: 'insensitive' } },
        { title: { contains: 'Black Diamonds', mode: 'insensitive' } },
        { title: { contains: 'Sliders', mode: 'insensitive' } },
        { description: { contains: 'Utah', mode: 'insensitive' } },
        { description: { contains: 'Black Diamonds', mode: 'insensitive' } },
        { description: { contains: 'Sliders', mode: 'insensitive' } }
      ]
    }
  });
  
  console.log(`📺 LiveStream records with fake data: ${liveStreams.length}`);
  liveStreams.forEach(stream => {
    console.log(`  - ID: ${stream.id}`);
    console.log(`    Title: ${stream.title}`);
    console.log(`    Status: ${stream.status}`);
    console.log(`    Created: ${stream.createdAt}`);
    console.log('');
  });
  
  // Check PickleballEvent table
  const events = await prisma.pickleballEvent.findMany({
    where: {
      OR: [
        { name: { contains: 'Utah', mode: 'insensitive' } },
        { name: { contains: 'Black Diamonds', mode: 'insensitive' } },
        { name: { contains: 'Sliders', mode: 'insensitive' } },
        { organizationName: { contains: 'Utah', mode: 'insensitive' } },
        { organizationName: { contains: 'Black Diamonds', mode: 'insensitive' } },
        { organizationName: { contains: 'Sliders', mode: 'insensitive' } }
      ]
    },
    include: {
      matches: true
    }
  });
  
  console.log(`🏆 PickleballEvent records with fake data: ${events.length}`);
  events.forEach(event => {
    console.log(`  - ID: ${event.id}`);
    console.log(`    Name: ${event.name}`);
    console.log(`    Organization: ${event.organizationName}`);
    console.log(`    Matches: ${event.matches.length}`);
    console.log('');
  });
  
  // Check TournamentMatch table
  const matches = await prisma.tournamentMatch.findMany({
    where: {
      OR: [
        { team1Player1: { contains: 'Utah', mode: 'insensitive' } },
        { team1Player1: { contains: 'Black Diamonds', mode: 'insensitive' } },
        { team1Player1: { contains: 'Sliders', mode: 'insensitive' } },
        { team2Player1: { contains: 'Utah', mode: 'insensitive' } },
        { team2Player1: { contains: 'Black Diamonds', mode: 'insensitive' } },
        { team2Player1: { contains: 'Sliders', mode: 'insensitive' } }
      ]
    }
  });
  
  console.log(`⚔️ TournamentMatch records with fake data: ${matches.length}`);
  matches.forEach(match => {
    console.log(`  - ID: ${match.id}`);
    console.log(`    Team 1: ${match.team1Player1}${match.team1Player2 ? ' / ' + match.team1Player2 : ''}`);
    console.log(`    Team 2: ${match.team2Player1}${match.team2Player2 ? ' / ' + match.team2Player2 : ''}`);
    console.log('');
  });
  
  console.log('\n✅ Database check complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
