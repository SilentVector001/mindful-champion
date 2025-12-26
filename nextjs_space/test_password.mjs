import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function testPassword() {
  try {
    const user = await prisma.user.findFirst({
      where: { 
        email: {
          equals: 'deansnow59@gmail.com',
          mode: 'insensitive'
        }
      }
    });
    
    if (!user || !user.password) {
      console.log('User not found or no password');
      return;
    }
    
    console.log('Testing password comparison...');
    console.log('Password hash from DB:', user.password.substring(0, 20) + '...');
    
    // Test with common passwords
    const testPasswords = ['test123', 'Test123', 'password', 'Password123', 'admin123'];
    
    for (const pwd of testPasswords) {
      const isValid = await bcrypt.compare(pwd, user.password);
      console.log(`Password "${pwd}": ${isValid ? 'MATCH ✓' : 'NO MATCH ✗'}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPassword();
