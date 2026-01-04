const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Use production Neon DATABASE_URL directly
const NEON_URL = process.env.NEON_DATABASE_URL;

if (!NEON_URL) {
  console.error('❌ Please provide NEON_DATABASE_URL environment variable');
  console.log('Usage: NEON_DATABASE_URL="postgresql://..." node reset_neon_password.js');
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: { db: { url: NEON_URL } }
});

async function resetPassword() {
  try {
    console.log('🔗 Connecting to Neon production database...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'deansnow59@gmail.com' },
      select: { id: true, email: true, name: true }
    });
    
    if (!user) {
      console.log('❌ User deansnow59@gmail.com not found in Neon database');
      return;
    }
    
    console.log('✅ Found user:', user.email);
    
    const newPassword = 'MindfulChampion2025!';
    const hash = await bcrypt.hash(newPassword, 12);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash }
    });
    
    console.log('✅ Password reset successfully!');
    console.log('📧 Email: deansnow59@gmail.com');
    console.log('🔑 Password: MindfulChampion2025!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
