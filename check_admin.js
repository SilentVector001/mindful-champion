const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log('\n=== ADMIN USERS ===');
    console.log(JSON.stringify(adminUsers, null, 2));
    
    // Also check jay@aol.com
    const jayUser = await prisma.user.findUnique({
      where: { email: 'jay@aol.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    
    console.log('\n=== JAY@AOL.COM USER ===');
    console.log(JSON.stringify(jayUser, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
