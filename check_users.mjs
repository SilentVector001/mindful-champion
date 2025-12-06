import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('Checking for users in database...\n');
    
    // Get all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        password: true,
        createdAt: true
      }
    });
    
    console.log('All users in database:');
    console.log(JSON.stringify(allUsers, null, 2));
    console.log('\nTotal users:', allUsers.length);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
