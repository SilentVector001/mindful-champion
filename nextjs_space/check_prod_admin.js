const { PrismaClient } = require('@prisma/client');

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://role_e62f243fc:f1ClIxhRs7QbEHP6YHurTT4YuJQ0Cuit@db-e62f243fc.db003.hosteddb.reai.io:5432/e62f243fc?connect_timeout=15"
    }
  }
});

async function checkProductionAdmins() {
  try {
    console.log('Connecting to PRODUCTION database...\n');
    
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    console.log('=== PRODUCTION DATABASE ===');
    console.log('Admin users found:', admins.length);
    if (admins.length > 0) {
      console.log('\nAdmin users:');
      admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. ${admin.firstName} ${admin.lastName}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Created: ${admin.createdAt}`);
      });
    } else {
      console.log('\n⚠️  NO ADMIN USERS FOUND IN PRODUCTION DATABASE!');
    }

    // Also check total users
    const totalUsers = await prisma.user.count();
    console.log('\n---');
    console.log('Total users in production database:', totalUsers);

    // Check for any users at all
    if (totalUsers > 0) {
      const sampleUsers = await prisma.user.findMany({
        take: 5,
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
        },
      });
      console.log('\nSample users (first 5):');
      sampleUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - Role: ${user.role}`);
      });
    }

  } catch (error) {
    console.error('Error connecting to production database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductionAdmins();
