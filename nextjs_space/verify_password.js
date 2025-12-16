const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function verifyPassword() {
  try {
    console.log('🔍 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected!\n');
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: 'deansnow59@gmail.com' }
    });
    
    if (!user) {
      console.log('❌ User not found!');
      await prisma.$disconnect();
      return;
    }
    
    console.log('✅ User found:', user.email);
    console.log('Password hash (first 50 chars):', user.password.substring(0, 50) + '...');
    console.log('Hash length:', user.password.length);
    console.log('');
    
    // Test password
    const testPassword = 'MindfulChampion2025!';
    console.log('🔐 Testing password:', testPassword);
    
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log('Password valid:', isValid ? '✅ YES' : '❌ NO');
    
    if (!isValid) {
      console.log('\n⚠️  Password does not match! Let me reset it again...');
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('New hash (first 50 chars):', newHash.substring(0, 50) + '...');
      
      await prisma.user.update({
        where: { email: 'deansnow59@gmail.com' },
        data: { password: newHash }
      });
      
      console.log('✅ Password updated!');
      
      // Verify again
      const user2 = await prisma.user.findUnique({
        where: { email: 'deansnow59@gmail.com' }
      });
      const isValid2 = await bcrypt.compare(testPassword, user2.password);
      console.log('Password valid after update:', isValid2 ? '✅ YES' : '❌ NO');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
  }
}

verifyPassword();
