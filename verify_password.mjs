import pkg from '@prisma/client';
import bcrypt from 'bcryptjs';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function verifyPassword() {
  try {
    const email = 'deansnow59@gmail.com';
    const testPassword = 'AdminChampion2024!';
    
    // Get the user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      accountLocked: user.accountLocked,
      failedLoginAttempts: user.failedLoginAttempts
    });
    
    // Test the password
    if (user.password) {
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log('\nPassword verification result:', isValid ? '✅ CORRECT' : '❌ INCORRECT');
      console.log('Testing password:', testPassword);
    } else {
      console.log('❌ No password set for this user');
    }
    
    // Test case-insensitive lookup
    console.log('\n--- Testing Case-Insensitive Lookup ---');
    const userCaseInsensitive = await prisma.user.findFirst({
      where: {
        email: {
          equals: 'Deansnow59@gmail.com', // Capital D
          mode: 'insensitive'
        }
      }
    });
    
    if (userCaseInsensitive) {
      console.log('✅ Case-insensitive lookup works! Found user:', userCaseInsensitive.email);
    } else {
      console.log('❌ Case-insensitive lookup failed');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPassword();
