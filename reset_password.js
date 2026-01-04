const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  const prisma = new PrismaClient();
  
  try {
    const hashedPassword = await bcrypt.hash('MindfulChampion2025!', 12);
    
    const user = await prisma.user.update({
      where: { email: 'deansnow59@gmail.com' },
      data: { 
        password: hashedPassword,
        onboardingCompleted: true
      }
    });
    
    console.log('✅ Password reset successfully for:', user.email);
    console.log('New password: MindfulChampion2025!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
