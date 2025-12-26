#!/usr/bin/env node
/**
 * Migration script to add sponsorApplicationId column to EmailNotification table
 * This ensures the database schema matches the Prisma schema definition
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runMigration() {
  console.log('🔄 Starting database migration for EmailNotification table...\n');
  
  try {
    // Check if column exists
    console.log('1. Checking if sponsorApplicationId column exists...');
    const columnCheck = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'EmailNotification' 
      AND column_name = 'sponsorApplicationId';
    `;
    
    if (columnCheck && columnCheck.length > 0) {
      console.log('✅ sponsorApplicationId column already exists\n');
      console.log('2. Checking foreign key constraint...');
      
      const fkCheck = await prisma.$queryRaw`
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'EmailNotification_sponsorApplicationId_fkey';
      `;
      
      if (fkCheck && fkCheck.length > 0) {
        console.log('✅ Foreign key constraint already exists\n');
      } else {
        console.log('⚠️  Foreign key constraint missing, adding it...');
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "EmailNotification"
          ADD CONSTRAINT "EmailNotification_sponsorApplicationId_fkey"
          FOREIGN KEY ("sponsorApplicationId") 
          REFERENCES "SponsorApplication"(id) 
          ON DELETE CASCADE;
        `);
        console.log('✅ Foreign key constraint added\n');
      }
      
      console.log('3. Checking index...');
      const indexCheck = await prisma.$queryRaw`
        SELECT indexname 
        FROM pg_indexes 
        WHERE indexname = 'EmailNotification_sponsorApplicationId_idx';
      `;
      
      if (indexCheck && indexCheck.length > 0) {
        console.log('✅ Index already exists\n');
      } else {
        console.log('⚠️  Index missing, adding it...');
        await prisma.$executeRawUnsafe(`
          CREATE INDEX "EmailNotification_sponsorApplicationId_idx" 
          ON "EmailNotification"("sponsorApplicationId");
        `);
        console.log('✅ Index added\n');
      }
      
      console.log('✨ Database schema is up to date!');
      return;
    }
    
    console.log('⚠️  Column does not exist. Adding sponsorApplicationId column...\n');
    
    // Add the column
    console.log('2. Adding sponsorApplicationId column...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "EmailNotification" 
      ADD COLUMN "sponsorApplicationId" TEXT;
    `);
    console.log('✅ Column added\n');
    
    // Add foreign key constraint
    console.log('3. Adding foreign key constraint...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "EmailNotification"
      ADD CONSTRAINT "EmailNotification_sponsorApplicationId_fkey"
      FOREIGN KEY ("sponsorApplicationId") 
      REFERENCES "SponsorApplication"(id) 
      ON DELETE CASCADE;
    `);
    console.log('✅ Foreign key constraint added\n');
    
    // Add index
    console.log('4. Adding index on sponsorApplicationId...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX "EmailNotification_sponsorApplicationId_idx" 
      ON "EmailNotification"("sponsorApplicationId");
    `);
    console.log('✅ Index added\n');
    
    // Verify the migration
    console.log('5. Verifying migration...');
    const verification = await prisma.$queryRaw`
      SELECT 
        column_name, 
        data_type, 
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'EmailNotification'
      AND column_name = 'sponsorApplicationId';
    `;
    
    if (verification && verification.length > 0) {
      console.log('✅ Migration verified successfully!\n');
      console.log('Column details:', verification[0]);
    } else {
      console.log('⚠️  Warning: Could not verify migration');
    }
    
    console.log('\n✨ Migration completed successfully!');
    console.log('📧 The /api/admin/emails/history endpoint should now work correctly.');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
runMigration()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
