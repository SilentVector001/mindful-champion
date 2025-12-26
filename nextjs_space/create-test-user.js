const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Hash the password
  const hashedPassword = await bcrypt.hash('TestPass123!', 10);
  
  // Create or update test user
  const user = await prisma.user.upsert({
    where: { email: 'test@mindfulchampion.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'test@mindfulchampion.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      onboardingCompleted: true,
    },
  });
  
  console.log('Test user created/updated:', user.email);
  console.log('Email: test@mindfulchampion.com');
  console.log('Password: TestPass123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
