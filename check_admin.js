const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdmins() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

    console.log('Admin users found:', admins.length);
    console.log(JSON.stringify(admins, null, 2));

    // Also check total users
    const totalUsers = await prisma.user.count();
    console.log('\nTotal users in database:', totalUsers);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmins();
