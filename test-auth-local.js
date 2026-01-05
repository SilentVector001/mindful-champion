const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function testAuth() {
  try {
    console.log('[TEST] Starting authentication test...');
    console.log('[TEST] DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    // Test 1: Database connection
    console.log('\n[TEST] Test 1: Checking database connection...');
    const userCount = await prisma.user.count();
    console.log('[TEST] Total users in database:', userCount);
    
    // Test 2: Find test user
    console.log('\n[TEST] Test 2: Looking up test user...');
    const testEmail = 'deansnow59@gmail.com';
    const normalizedEmail = testEmail.toLowerCase().trim();
    console.log('[TEST] Searching for email:', normalizedEmail);
    
    const user = await prisma.user.findFirst({
      where: { 
        email: {
          equals: normalizedEmail,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        password: true,
        role: true,
        subscriptionTier: true,
        isTrialActive: true,
        onboardingCompleted: true,
      }
    });

    if (!user) {
      console.log('[TEST] ❌ FAIL: User not found');
      return;
    }
    
    console.log('[TEST] ✓ User found!');
    console.log('[TEST] User ID:', user.id);
    console.log('[TEST] Email:', user.email);
    console.log('[TEST] Name:', user.name);
    console.log('[TEST] Has password:', !!user.password);
    console.log('[TEST] Password length:', user.password?.length || 0);
    console.log('[TEST] Password hash prefix:', user.password?.substring(0, 20) + '...');
    
    if (!user.password) {
      console.log('[TEST] ❌ FAIL: User has no password');
      return;
    }

    // Test 3: Password verification
    console.log('\n[TEST] Test 3: Verifying password...');
    const testPassword = 'MindfulChampion2025!';
    console.log('[TEST] Test password:', testPassword);
    console.log('[TEST] Test password length:', testPassword.length);
    
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    console.log('[TEST] Password valid:', isPasswordValid);
    
    if (isPasswordValid) {
      console.log('\n[TEST] ✅ SUCCESS: Authentication would succeed!');
      console.log('[TEST] User would be logged in as:', user.email);
    } else {
      console.log('\n[TEST] ❌ FAIL: Password does not match');
      console.log('[TEST] This explains why login is failing');
      
      // Try to generate a new hash for comparison
      console.log('\n[TEST] Generating new hash for comparison...');
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('[TEST] New hash:', newHash);
      console.log('[TEST] Current hash:', user.password);
      
      // Test if the new hash works
      const newHashWorks = await bcrypt.compare(testPassword, newHash);
      console.log('[TEST] New hash verification:', newHashWorks);
    }
    
  } catch (error) {
    console.error('[TEST] ERROR:', error.message);
    console.error('[TEST] Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
