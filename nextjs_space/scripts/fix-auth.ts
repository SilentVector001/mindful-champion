import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixAuth() {
  try {
    console.log('🔍 Checking for user: Jay@aol.com...\n');
    
    // Check if user exists (case-insensitive search)
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: 'Jay@aol.com',
          mode: 'insensitive'
        }
      }
    });

    if (!user) {
      console.log('❌ User not found with email: Jay@aol.com');
      console.log('\n📝 Creating new user...');
      
      const hashedPassword = await bcrypt.hash('MindfulChampion2025!', 10);
      
      const newUser = await prisma.user.create({
        data: {
          email: 'Jay@aol.com',
          name: 'Jay',
          password: hashedPassword,
          role: 'USER',
          skillLevel: 'BEGINNER',
          playerRating: '2.0'
        }
      });
      
      console.log('✅ User created successfully!');
      console.log(`   ID: ${newUser.id}`);
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Name: ${newUser.name}`);
    } else {
      console.log('✅ User found!');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Current password hash: ${user.password?.substring(0, 20)}...`);
      
      console.log('\n🔄 Resetting password to: MindfulChampion2025!');
      
      const hashedPassword = await bcrypt.hash('MindfulChampion2025!', 10);
      
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      
      console.log('✅ Password reset successfully!');
      console.log(`   New hash: ${updatedUser.password?.substring(0, 20)}...`);
    }
    
    // Test the password
    console.log('\n🧪 Testing password verification...');
    const testUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: 'Jay@aol.com',
          mode: 'insensitive'
        }
      }
    });
    
    if (testUser && testUser.password) {
      const isValid = await bcrypt.compare('MindfulChampion2025!', testUser.password);
      if (isValid) {
        console.log('✅ Password verification SUCCESSFUL!');
      } else {
        console.log('❌ Password verification FAILED!');
      }
    }
    
    console.log('\n✨ Auth fix completed!');
    console.log('\n📋 Login Credentials:');
    console.log('   Email: Jay@aol.com');
    console.log('   Password: MindfulChampion2025!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAuth();
