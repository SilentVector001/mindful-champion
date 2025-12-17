import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function verifyPassword() {
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
    
    console.log('Verifying new password...');
    const testPassword = 'MindfulChampion2025!';
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log(`Password "${testPassword}": ${isValid ? '✅ MATCH' : '❌ NO MATCH'}`);
    
    if (isValid) {
      console.log('\n✅ SUCCESS! The password has been reset.');
      console.log('User can now sign in with:');
      console.log('  Email: deansnow59@gmail.com');
      console.log('  Password: MindfulChampion2025!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPassword();
