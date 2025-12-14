import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      onboardingCompleted: true,
      onboardingCompletedAt: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  });

  console.log('\n=== Recent Users ===\n');
  users.forEach(user => {
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.firstName}`);
    console.log(`Onboarding Completed: ${user.onboardingCompleted}`);
    console.log(`Onboarding Date: ${user.onboardingCompletedAt}`);
    console.log(`Created: ${user.createdAt}`);
    console.log('---\n');
  });
}

checkUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
