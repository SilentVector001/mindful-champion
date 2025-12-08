import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const newPassword = 'MindfulChampion2025!';
    console.log('Resetting password for deansnow59@gmail.com...');
    console.log('New password will be:', newPassword);
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('Generated hash:', hashedPassword.substring(0, 20) + '...');
    
    const user = await prisma.user.update({
      where: { 
        email: 'deansnow59@gmail.com'
      },
      data: { 
        password: hashedPassword,
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        accountLocked: false
      }
    });
    
    console.log('✅ Password reset successfully!');
    console.log('User can now sign in with:');
    console.log('  Email:', user.email);
    console.log('  Password:', newPassword);
    
    // Verify the password works
    const isValid = await bcrypt.compare(newPassword, hashedPassword);
    console.log('Password verification:', isValid ? '✓ VALID' : '✗ INVALID');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
