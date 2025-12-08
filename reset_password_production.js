const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetPassword() {
  try {
    console.log('🔍 Connecting to production database...');
    await prisma.$connect();
    console.log('✅ Connected to database!');
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: 'deansnow59@gmail.com' }
    });
    
    if (!user) {
      console.log('❌ User not found in database!');
      await prisma.$disconnect();
      return;
    }
    
    console.log('\n📋 User found:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Role:', user.role);
    console.log('  Has password:', !!user.password);
    console.log('  Failed login attempts:', user.failedLoginAttempts);
    console.log('  Account locked until:', user.accountLockedUntil);
    
    // Test existing passwords
    console.log('\n🔐 Testing existing passwords...');
    const testPasswords = [
      'MindfulChampion2025!',
      'AdminChampion2024!',
      'MindChampion2025!'
    ];
    
    for (const pwd of testPasswords) {
      const match = await bcrypt.compare(pwd, user.password);
      console.log(`  ${pwd}: ${match ? '✅ MATCHES!' : '❌ No match'}`);
    }
    
    // Set new password
    console.log('\n🔧 Setting new password: MindfulChampion2025!');
    const hashedPassword = await bcrypt.hash('MindfulChampion2025!', 10);
    
    await prisma.user.update({
      where: { email: 'deansnow59@gmail.com' },
      data: {
        password: hashedPassword,
        failedLoginAttempts: 0,
        accountLockedUntil: null
      }
    });
    
    console.log('✅ Password updated successfully!');
    
    // Verify the new password
    const updatedUser = await prisma.user.findUnique({
      where: { email: 'deansnow59@gmail.com' }
    });
    
    const newMatch = await bcrypt.compare('MindfulChampion2025!', updatedUser.password);
    console.log('\n✅ Verification:', newMatch ? '✅ Password works!' : '❌ Password mismatch!');
    
    console.log('\n🎉 Password reset complete!');
    console.log('📧 Email: deansnow59@gmail.com');
    console.log('🔑 Password: MindfulChampion2025!');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    await prisma.$disconnect();
    process.exit(1);
  }
}

resetPassword();
