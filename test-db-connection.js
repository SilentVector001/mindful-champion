const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔍 Testing database connection and user lookup...\n');
  
  try {
    // Test 1: Database connectivity
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');
    
    // Test 2: User lookup by email
    console.log('2️⃣ Looking up user: deansnow59@gmail.com');
    const user = await prisma.user.findUnique({
      where: { email: 'deansnow59@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      console.log('❌ User not found in database!\n');
      return;
    }
    
    console.log('✅ User found!');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    console.log('   Password Hash Length:', user.password ? user.password.length : 'NULL');
    console.log('   Created:', user.createdAt);
    console.log('   Updated:', user.updatedAt);
    console.log('');
    
    // Test 3: Password verification
    if (user.password) {
      console.log('3️⃣ Testing password verification...');
      const testPassword = 'MindfulChampion2025!';
      const isValid = await bcrypt.compare(testPassword, user.password);
      
      if (isValid) {
        console.log('✅ Password verification successful!');
        console.log('   The password "MindfulChampion2025!" matches the stored hash.\n');
      } else {
        console.log('❌ Password verification failed!');
        console.log('   The stored hash does not match "MindfulChampion2025!".\n');
      }
    } else {
      console.log('⚠️  User has no password hash stored!\n');
    }
    
    // Test 4: Count total users
    console.log('4️⃣ Counting total users in database...');
    const totalUsers = await prisma.user.count();
    console.log('✅ Total users:', totalUsers);
    console.log('');
    
    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
