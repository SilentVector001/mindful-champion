import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file from project root
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import { prisma } from '../lib/db';
import { MediaCenterEmailService } from '../lib/media-center/email-service';

async function sendMissingWelcomeEmails() {
  console.log('\n📧 Finding users who did not receive welcome emails...\n');
  console.log('=' .repeat(60));
  
  try {
    // Find users who didn't receive welcome emails
    const usersWithoutWelcomeEmail = await prisma.user.findMany({
      where: {
        OR: [
          { welcomeEmailSent: false },
          { welcomeEmailSent: null }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        welcomeEmailSent: true
      },
      orderBy: { createdAt: 'asc' }
    });
    
    if (usersWithoutWelcomeEmail.length === 0) {
      console.log('\n✅ All users have received welcome emails!');
      console.log('Nothing to do.\n');
      return;
    }
    
    console.log(`\n📊 Found ${usersWithoutWelcomeEmail.length} users without welcome emails:\n`);
    
    usersWithoutWelcomeEmail.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || user.email}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Signed up: ${user.createdAt.toISOString()}`);
      console.log('');
    });
    
    // Ask for confirmation (auto-confirm in script)
    console.log('🚀 Attempting to send welcome emails...\n');
    
    let successCount = 0;
    let failureCount = 0;
    const results: { email: string; success: boolean; error?: string }[] = [];
    
    for (const user of usersWithoutWelcomeEmail) {
      try {
        console.log(`📤 Sending welcome email to ${user.email}...`);
        
        const emailSent = await MediaCenterEmailService.sendWelcomeEmail(user.id);
        
        if (emailSent) {
          // Update user record
          await prisma.user.update({
            where: { id: user.id },
            data: {
              welcomeEmailSent: true,
              welcomeEmailSentAt: new Date()
            }
          });
          
          console.log(`   ✅ Success!\n`);
          successCount++;
          results.push({ email: user.email, success: true });
        } else {
          console.log(`   ❌ Failed to send\n`);
          failureCount++;
          results.push({ email: user.email, success: false, error: 'Email send returned false' });
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error: any) {
        console.log(`   ❌ Error: ${error.message}\n`);
        failureCount++;
        results.push({ email: user.email, success: false, error: error.message });
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Summary:\n');
    console.log(`Total users processed: ${usersWithoutWelcomeEmail.length}`);
    console.log(`✅ Successfully sent: ${successCount}`);
    console.log(`❌ Failed to send: ${failureCount}`);
    
    if (failureCount > 0) {
      console.log('\n❌ Failed emails:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`   - ${r.email}: ${r.error}`);
      });
      
      console.log('\n💡 Tip: Make sure the Resend domain is verified');
      console.log('   Visit: https://resend.com/domains');
    }
    
    if (successCount > 0) {
      console.log('\n✅ Success! Welcome emails have been sent.');
      console.log('   Users will receive emails at their registered addresses.');
    }
    
    console.log('\n');
    
    await prisma.$disconnect();
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error);
    console.error('Error details:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

sendMissingWelcomeEmails();
