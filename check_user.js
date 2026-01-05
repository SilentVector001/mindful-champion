const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkUser() {
  try {
    console.log('Connecting to database...');
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: 'deansnow59@gmail.com' }
    });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('\n✅ User found:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('First Name:', user.firstName);
    console.log('Last Name:', user.lastName);
    console.log('Onboarding Completed:', user.onboardingCompleted);
    console.log('Created At:', user.createdAt);
    console.log('Password Hash (first 50 chars):', user.password?.substring(0, 50) + '...');
    console.log('Password Hash Length:', user.password?.length);
    
    // Test the password
    const testPassword = 'MindfulChampion2025!';
    console.log('\n🔐 Testing password:', testPassword);
    
    if (user.password) {
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log('Password match result:', isValid ? '✅ VALID' : '❌ INVALID');
      
      if (!isValid) {
        console.log('\n⚠️  Password does not match! Let me check the hash format...');
        console.log('Hash starts with:', user.password.substring(0, 7));
        console.log('Expected bcrypt format: $2a$10$ or $2b$10$');
        
        // Try to generate a new hash and compare
        console.log('\n🔧 Generating new hash for comparison...');
        const newHash = await bcrypt.hash(testPassword, 10);
        console.log('New hash (first 50 chars):', newHash.substring(0, 50) + '...');
        console.log('New hash length:', newHash.length);
        
        // Test the new hash
        const newHashValid = await bcrypt.compare(testPassword, newHash);
        console.log('New hash validation:', newHashValid ? '✅ VALID' : '❌ INVALID');
      }
    } else {
      console.log('❌ No password hash found in database!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
