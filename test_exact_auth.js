const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function testExactAuth() {
  try {
    console.log('🔍 Testing exact authentication flow...\n');
    await prisma.$connect();
    
    const email = 'deansnow59@gmail.com';
    const password = 'MindfulChampion2025!';
    
    // Step 1: Find user (case-insensitive)
    console.log('Step 1: Finding user with case-insensitive email...');
    const user = await prisma.user.findFirst({
      where: { 
        email: {
          equals: email,
          mode: 'insensitive'
        }
      }
    });
    
    if (!user) {
      console.log('❌ User not found!');
      await prisma.$disconnect();
      return;
    }
    
    console.log('✅ User found:', user.email);
    console.log('   ID:', user.id);
    console.log('   Role:', user.role);
    console.log('   Password hash length:', user.password.length);
    console.log('   Password hash prefix:', user.password.substring(0, 20));
    
    // Step 2: Check if password exists
    if (!user.password) {
      console.log('❌ User has no password!');
      await prisma.$disconnect();
      return;
    }
    
    console.log('✅ User has password\n');
    
    // Step 3: Check account lock status
    console.log('Step 2: Checking account lock status...');
    console.log('   Failed login attempts:', user.failedLoginAttempts);
    console.log('   Account locked until:', user.accountLockedUntil);
    
    if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) {
      console.log('❌ Account is locked until:', user.accountLockedUntil);
      await prisma.$disconnect();
      return;
    }
    
    console.log('✅ Account is not locked\n');
    
    // Step 4: Compare password
    console.log('Step 3: Comparing password...');
    console.log('   Input password:', password);
    console.log('   Input password length:', password.length);
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    console.log('   Password valid:', isPasswordValid ? '✅ YES' : '❌ NO');
    
    if (!isPasswordValid) {
      console.log('\n❌ PASSWORD COMPARISON FAILED!');
      console.log('\nTrying to debug...');
      
      // Try with different bcrypt versions
      const bcryptjs = require('bcryptjs');
      const isValid2 = await bcryptjs.compare(password, user.password);
      console.log('   bcryptjs compare:', isValid2 ? '✅ YES' : '❌ NO');
      
      // Check if hash is valid
      const hashInfo = user.password.match(/^\$2[aby]\$(\d+)\$/);
      if (hashInfo) {
        console.log('   Hash algorithm:', hashInfo[0]);
        console.log('   Hash rounds:', hashInfo[1]);
      }
      
      await prisma.$disconnect();
      return;
    }
    
    console.log('\n✅ ✅ ✅ AUTHENTICATION SUCCESSFUL! ✅ ✅ ✅');
    console.log('\nThe password is correct and authentication should work!');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    await prisma.$disconnect();
  }
}

testExactAuth();
