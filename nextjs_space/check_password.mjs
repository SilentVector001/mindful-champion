import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'jay@aol.com' },
    select: {
      email: true,
      name: true,
      password: true,
      onboardingCompleted: true,
    }
  });
  console.log('User details:');
  console.log(JSON.stringify(user, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
