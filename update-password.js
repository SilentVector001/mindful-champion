const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const originalHash = '$2a$10$4UbL44boN48njfjVbDzKcOSBKuu0yM9Ryze58YcMvP.vz3MRE/0l.';
  
  const result = await prisma.user.update({
    where: { email: 'deansnow59@gmail.com' },
    data: { password: originalHash }
  });
  
  console.log('Updated user:', result.email);
  console.log('New hash:', result.password.substring(0, 30));
}

main().catch(console.error).finally(() => prisma.$disconnect());
