const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetPassword(email, newPassword) {
  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user's password
    const user = await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword,
        failedLoginAttempts: 0,
        accountLocked: false,
      }
    });
    
    console.log('✅ Password reset successful!');
    console.log('----------------------------');
    console.log('Email:', user.email);
    console.log('New password:', newPassword);
    console.log('----------------------------');
    console.log('\nYou can now sign in with:');
    console.log('Email: ' + user.email);
    console.log('Password: ' + newPassword);
    
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Reset password for jay@aol.com
const email = 'jay@aol.com';
const newPassword = 'MindfulChampion2025!';

console.log('Resetting password for', email, '...');
resetPassword(email, newPassword);
