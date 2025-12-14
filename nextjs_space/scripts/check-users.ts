import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function checkUsers() {
  console.log('👥 Checking User Table...\n');
  
  try {
    // Get total user count
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}\n`);
    
    if (userCount === 0) {
      console.log('❌ NO USERS FOUND IN DATABASE!');
      console.log('\n💡 This is the problem!');
      console.log('   When a user tries to upload a video:');
      console.log('   1. They have a session with a userId');
      console.log('   2. Video uploads to S3 successfully');
      console.log('   3. Database record creation fails because userId doesnt exist');
      console.log('   4. User sees "Video Loading Error"\n');
      console.log('🔧 Solution:');
      console.log('   The user needs to sign up/log in again to create a User record');
      console.log('   Or the database was reset and users need to be recreated\n');
      return;
    }
    
    // List all users
    console.log('👥 Users in database:\n');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            videoAnalyses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.firstName || ''} ${user.lastName || ''}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`);
      console.log(`   Videos: ${user._count.videoAnalyses}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log();
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
