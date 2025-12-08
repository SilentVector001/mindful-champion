import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findFirst({
      where: { 
        email: {
          equals: 'deansnow59@gmail.com',
          mode: 'insensitive'
        }
      }
    });
    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('User details:', JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0,
        subscriptionTier: user.subscriptionTier,
        isTrialActive: user.isTrialActive,
        onboardingCompleted: user.onboardingCompleted,
        createdAt: user.createdAt,
        lastActiveDate: user.lastActiveDate
      }, null, 2));
    } else {
      console.log('User NOT found in database!');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
