import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file from project root
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import { prisma } from '../lib/db';

async function checkDatabase() {
  try {
    console.log('\n🔍 Checking database connection...\n');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@'));
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful\n');
    
    // Check for tables by trying to count records
    const userCount = await prisma.user.count();
    const emailCount = await prisma.emailNotification.count();
    
    console.log('📊 Database Statistics:');
    console.log('=======================\n');
    console.log(`Total Users: ${userCount}`);
    console.log(`Total Email Notifications: ${emailCount}\n`);
    
    if (userCount === 0) {
      console.log('⚠️ No users found in database.');
      console.log('This could mean:');
      console.log('  1. This is a new/empty database');
      console.log('  2. Users are signing up but data is being stored elsewhere');
      console.log('  3. The production database is different from this one\n');
    }
    
    // Check for any data at all
    const modelNames = ['User', 'EmailNotification', 'PromoCode', 'BetaTester'];
    for (const model of modelNames) {
      try {
        const count = await (prisma as any)[model.charAt(0).toLowerCase() + model.slice(1)].count();
        console.log(`${model}: ${count} records`);
      } catch (e) {
        console.log(`${model}: Unable to count (${e.message})`);
      }
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkDatabase();
