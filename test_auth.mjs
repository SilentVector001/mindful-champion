import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAuth() {
  const email = 'deansnow59@gmail.com';
  const password = 'MindfulChampion2025!';
  
  console.log('Testing authentication flow...');
  console.log('Email:', email);
  console.log('Password:', password);
  
  // Step 1: Find user
  const user = await prisma.user.findFirst({
    where: { 
      email: {
        equals: email,
        mode: 'insensitive'
      }
    }
  });
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }
  
  console.log('✅ User found:', user.email);
  
  // Step 2: Check password
  if (!user.password) {
    console.log('❌ User has no password');
    return;
  }
  
  console.log('✅ User has password');
  
  // Step 3: Compare password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  console.log('Password comparison result:', isPasswordValid ? '✅ VALID' : '❌ INVALID');
  
  if (!isPasswordValid) {
    console.log('❌ Password does not match');
    return;
  }
  
  console.log('✅ Password matches!');
  
  // Step 4: Check account lock
  const now = new Date();
  const isLocked = user.accountLockedUntil && new Date(user.accountLockedUntil) > now;
  console.log('Account locked:', isLocked ? '❌ YES' : '✅ NO');
  
  if (isLocked) {
    console.log('❌ Account is locked until:', user.accountLockedUntil);
    return;
  }
  
  console.log('\n✅ ALL CHECKS PASSED - Authentication should work!');
  console.log('User details:', {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    subscriptionTier: user.subscriptionTier,
    onboardingCompleted: user.onboardingCompleted
  });
  
  await prisma.$disconnect();
}

testAuth().catch(console.error);
