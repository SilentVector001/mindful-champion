const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_ot6vpw5FUenm@ep-autumn-block-a4jw6pd9-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
    }
  }
});

async function resetPassword() {
  const email = 'deansnow59@gmail.com';
  const newPassword = 'MindfulChampion2025!';
  
  try {
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('❌ User not found:', email);
      return;
    }
    console.log('✅ Found user:', user.id, user.email);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    console.log('✅ Password hashed');
    
    // Update password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
    console.log('✅ Password updated successfully!');
    
    // Verify
    const updated = await prisma.user.findUnique({ where: { email } });
    const valid = await bcrypt.compare(newPassword, updated.password);
    console.log('✅ Verification:', valid ? 'Password works!' : 'FAILED');
    
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
