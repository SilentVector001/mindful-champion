const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = 'deansnow59@gmail.com';
    const newPassword = 'MindfulChampion2025!';
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log('New password hash:', hashedPassword);
    
    // Update the user's password
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
    
    console.log('Password updated successfully for:', user.email);
    console.log('User ID:', user.id);
    
    // Verify the password works
    const isValid = await bcrypt.compare(newPassword, hashedPassword);
    console.log('Password verification:', isValid ? 'SUCCESS' : 'FAILED');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
