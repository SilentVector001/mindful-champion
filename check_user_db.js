const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserRecord() {
  try {
    // Get all users to see what we have
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        onboardingCompleted: true,
        onboardingCompletedAt: true,
        createdAt: true,
      },
    });

    console.log('=== ALL USERS IN DATABASE ===');
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Onboarding Completed: ${user.onboardingCompleted}`);
      console.log(`  Onboarding Completed At: ${user.onboardingCompletedAt}`);
      console.log(`  Created At: ${user.createdAt}`);
    });

    console.log(`\n=== TOTAL USERS: ${users.length} ===\n`);
  } catch (error) {
    console.error('Error checking user records:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRecord();
