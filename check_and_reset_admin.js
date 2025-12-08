const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function checkAndResetAdmin() {
  try {
    console.log('🔍 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected!\n');
    
    // Check if user exists
    console.log('🔍 Looking for user: deansnow59@gmail.com');
    const user = await prisma.user.findUnique({
      where: { email: 'deansnow59@gmail.com' }
    });
    
    if (!user) {
      console.log('❌ User not found!');
      console.log('\n📊 Checking all users in database...');
      const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true }
      });
      console.log('Total users:', allUsers.length);
      allUsers.forEach(u => console.log(`  - ${u.email} (${u.role})`));
      await prisma.$disconnect();
      return;
    }
    
    console.log('✅ User found!');
    console.log('📋 Current user details:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      failedLoginAttempts: user.failedLoginAttempts,
      accountLockedUntil: user.accountLockedUntil,
      createdAt: user.createdAt
    });
    
    // Hash new password
    console.log('\n🔐 Hashing new password...');
    const newPassword = 'MindfulChampion2025!';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('✅ Password hashed');
    
    // Update user
    console.log('💾 Updating user password and unlocking account...');
    await prisma.user.update({
      where: { email: 'deansnow59@gmail.com' },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
        failedLoginAttempts: 0,
        accountLockedUntil: null
      }
    });
    
    console.log('\n✅ ✅ ✅ PASSWORD RESET SUCCESSFUL! ✅ ✅ ✅');
    console.log('\n📧 New credentials:');
    console.log('   Email: deansnow59@gmail.com');
    console.log('   Password: MindfulChampion2025!');
    console.log('\n🔓 Account unlocked and ready to use!');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkAndResetAdmin();
