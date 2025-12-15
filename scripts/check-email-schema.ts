import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEmailSchema() {
  try {
    console.log('Checking EmailNotification schema...\n');
    
    // Try to query with sponsorApplicationId
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'EmailNotification'
      AND column_name = 'sponsorApplicationId';
    `;
    
    console.log('sponsorApplicationId column info:', result);
    
    // Get all columns
    const allColumns = await prisma.$queryRaw`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'EmailNotification'
      ORDER BY ordinal_position;
    `;
    
    console.log('\nAll EmailNotification columns:');
    console.log(allColumns);
    
    // Try to fetch one email notification to see what fields are available
    const sampleEmail = await prisma.emailNotification.findFirst();
    if (sampleEmail) {
      console.log('\nSample email record fields:', Object.keys(sampleEmail));
    } else {
      console.log('\nNo email notifications found in database');
    }
    
  } catch (error: any) {
    console.error('Error checking schema:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmailSchema();
