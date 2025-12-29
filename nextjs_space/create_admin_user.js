const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Hash a default password
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@mindfulchampion.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    });

    console.log('Admin user created successfully:');
    console.log(JSON.stringify(admin, null, 2));
    console.log('\nLogin credentials:');
    console.log('Email: admin@mindfulchampion.com');
    console.log('Password: Admin123!');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
