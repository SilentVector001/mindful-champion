const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser() {
  const testPassword = 'MindfulChampion2025!';
  
  console.log('Checking users in database...\n');
  
  // Check both test accounts
  const emails = ['deansnow59@gmail.com', 'admin@mindfulchampion.com'];
  
  for (const email of emails) {
    console.log(`\n========== Checking ${email} ==========`);
    
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email.toLowerCase(),
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        onboardingCompleted: true,
        role: true
      }
    });
    
    if (!user) {
      console.log(`❌ User not found`);
      continue;
    }
    
    console.log(`✅ User found`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Onboarding: ${user.onboardingCompleted}`);
    console.log(`   Has password: ${!!user.password}`);
    
    if (user.password) {
      const passwordHash = user.password.substring(0, 20) + '...';
      console.log(`   Password hash (first 20): ${passwordHash}`);
      
      // Test password
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`   Password "${testPassword}" valid: ${isValid ? '✅ YES' : '❌ NO'}`);
      
      // Also test with the old password
      if (email === 'admin@mindfulchampion.com') {
        const oldPassword = 'Admin123!';
        const isOldValid = await bcrypt.compare(oldPassword, user.password);
        console.log(`   Password "${oldPassword}" valid: ${isOldValid ? '✅ YES' : '❌ NO'}`);
      }
    }
  }
  
  await prisma.$disconnect();
}

checkUser().catch(console.error);
