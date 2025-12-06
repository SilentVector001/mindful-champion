const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const achievements = await prisma.achievement.findMany({
    take: 5
  });
  
  const count = await prisma.achievement.count();
  
  console.log(`Total achievements in database: ${count}`);
  console.log('\nFirst 5 achievements:');
  achievements.forEach(a => {
    console.log(`- ${a.name} (${a.tier}) - ${a.points} points`);
  });
  
  await prisma.$disconnect();
}

main().catch(console.error);
