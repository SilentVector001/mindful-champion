import { PrismaClient } from '@prisma/client';
import { sendSponsorApprovalEmail } from '@/lib/email/sponsor-approval-email';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function testEmailLogging() {
  try {
    console.log('🧪 Testing Email Logging System\n');
    console.log('================================\n');

    // Find a test user or create one
    let testUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { contains: 'test' } },
          { role: 'ADMIN' }
        ]
      }
    });

    if (!testUser) {
      console.log('❌ No test user found. Creating a test user...');
      testUser = await prisma.user.create({
        data: {
          email: 'test-sponsor@mindfulchampion.com',
          name: 'Test Sponsor',
          firstName: 'Test',
          lastName: 'Sponsor',
          role: 'USER',
          onboardingCompleted: true,
        }
      });
      console.log(`✅ Created test user: ${testUser.email}\n`);
    } else {
      console.log(`✅ Using existing user: ${testUser.email}\n`);
    }

    // Check current email count
    const beforeCount = await prisma.emailNotification.count();
    console.log(`📊 Current email records in database: ${beforeCount}\n`);

    // Send test email
    console.log('📧 Sending test sponsor approval email...');
    const result = await sendSponsorApprovalEmail({
      companyName: 'Test Company Inc.',
      contactPerson: 'John Doe',
      email: testUser.email,
      approvedTier: 'BRONZE',
      loginEmail: testUser.email,
      temporaryPassword: 'TempPass123!',
      portalUrl: 'https://mindfulchampion.com/sponsors/portal',
      isNewUser: true,
      userId: testUser.id,
    });

    if (result.success) {
      console.log(`✅ Email sent successfully (Email ID: ${result.emailId})\n`);
    } else {
      console.log(`❌ Email send failed: ${result.error}\n`);
    }

    // Wait a moment for database write
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if email was logged
    const afterCount = await prisma.emailNotification.count();
    console.log(`📊 Email records after sending: ${afterCount}`);
    
    if (afterCount > beforeCount) {
      console.log(`✅ SUCCESS! ${afterCount - beforeCount} new email record(s) added to database\n`);
      
      // Get the latest email record
      const latestEmail = await prisma.emailNotification.findFirst({
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              name: true,
            }
          }
        }
      });

      if (latestEmail) {
        console.log('📋 Latest Email Record Details:');
        console.log(`   ID: ${latestEmail.id}`);
        console.log(`   User: ${latestEmail.user.name} (${latestEmail.user.email})`);
        console.log(`   Type: ${latestEmail.type}`);
        console.log(`   To: ${latestEmail.recipientEmail}`);
        console.log(`   Subject: ${latestEmail.subject}`);
        console.log(`   Status: ${latestEmail.status}`);
        console.log(`   Sent At: ${latestEmail.sentAt}`);
        console.log(`   Resend Email ID: ${latestEmail.resendEmailId}`);
        console.log(`   Metadata: ${JSON.stringify(latestEmail.metadata, null, 2)}`);
      }
    } else {
      console.log('❌ FAILURE! Email was not logged to database\n');
    }

    console.log('\n================================');
    console.log('✅ Email Logging Test Complete');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEmailLogging();
