import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file from project root
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import { prisma } from '../lib/db';

async function checkEmailStatus() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        createdAt: true,
        welcomeEmailSent: true,
        welcomeEmailSentAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    
    console.log('\n📊 Recent Users:');
    console.log('================\n');
    users.forEach(user => {
      console.log(`User: ${user.name || user.email}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Created: ${user.createdAt.toISOString()}`);
      console.log(`  Welcome Email Sent: ${user.welcomeEmailSent ? 'YES' : 'NO'}`);
      if (user.welcomeEmailSentAt) {
        console.log(`  Welcome Email Sent At: ${user.welcomeEmailSentAt.toISOString()}`);
      }
      console.log('');
    });
    
    // Get email notifications
    const emailNotifications = await prisma.emailNotification.findMany({
      where: {
        type: 'WELCOME'
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    
    console.log('\n📧 Recent Welcome Email Notifications:');
    console.log('=====================================\n');
    if (emailNotifications.length === 0) {
      console.log('No welcome email notifications found.');
    } else {
      emailNotifications.forEach(email => {
        console.log(`To: ${email.recipientEmail}`);
        console.log(`  Status: ${email.status}`);
        console.log(`  Created: ${email.createdAt.toISOString()}`);
        console.log(`  Sent At: ${email.sentAt ? email.sentAt.toISOString() : 'N/A'}`);
        if (email.error) {
          console.log(`  Error: ${email.error}`);
        }
        console.log('');
      });
    }
    
    // Summary
    const usersWithoutWelcomeEmail = users.filter(u => !u.welcomeEmailSent);
    console.log('\n📊 Summary:');
    console.log('===========\n');
    console.log(`Total recent users: ${users.length}`);
    console.log(`Users who received welcome email: ${users.filter(u => u.welcomeEmailSent).length}`);
    console.log(`Users who did NOT receive welcome email: ${usersWithoutWelcomeEmail.length}`);
    
    if (usersWithoutWelcomeEmail.length > 0) {
      console.log('\n❌ Users who did NOT receive welcome emails:');
      usersWithoutWelcomeEmail.forEach(user => {
        console.log(`  - ${user.email} (${user.name || 'No name'}) - Created: ${user.createdAt.toISOString()}`);
      });
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkEmailStatus();
