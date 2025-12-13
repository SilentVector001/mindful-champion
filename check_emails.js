const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEmails() {
  try {
    // Get email stats
    const stats = {
      total: await prisma.emailNotification.count(),
      pending: await prisma.emailNotification.count({ where: { status: 'PENDING' } }),
      sent: await prisma.emailNotification.count({ where: { status: 'SENT' } }),
      failed: await prisma.emailNotification.count({ where: { status: 'FAILED' } }),
      delivered: await prisma.emailNotification.count({ where: { status: 'DELIVERED' } }),
    };
    
    console.log('\n📧 EMAIL STATISTICS:');
    console.log('=====================');
    console.log(`Total Emails: ${stats.total}`);
    console.log(`Pending: ${stats.pending}`);
    console.log(`Sent: ${stats.sent}`);
    console.log(`Failed: ${stats.failed}`);
    console.log(`Delivered: ${stats.delivered}`);
    
    // Get recent emails
    const recentEmails = await prisma.emailNotification.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        recipientEmail: true,
        subject: true,
        status: true,
        error: true,
        createdAt: true,
        sentAt: true,
        failedAt: true,
      }
    });
    
    console.log('\n📬 RECENT EMAILS (Last 10):');
    console.log('============================');
    recentEmails.forEach((email, index) => {
      console.log(`\n${index + 1}. ${email.type} - ${email.status}`);
      console.log(`   To: ${email.recipientEmail}`);
      console.log(`   Subject: ${email.subject}`);
      console.log(`   Created: ${email.createdAt.toLocaleString()}`);
      if (email.error) {
        console.log(`   Error: ${email.error.substring(0, 100)}...`);
      }
    });
    
    // Check email settings
    const settings = await prisma.emailSettings.findFirst();
    console.log('\n⚙️  EMAIL SETTINGS:');
    console.log('===================');
    if (settings) {
      console.log(`Notifications Enabled: ${settings.emailNotificationsEnabled}`);
      console.log(`Video Analysis Emails: ${settings.videoAnalysisEmailsEnabled}`);
      console.log(`Welcome Emails: ${settings.welcomeEmailsEnabled}`);
      console.log(`From Email: ${settings.fromEmail}`);
      console.log(`From Name: ${settings.fromName}`);
      console.log(`Reply To: ${settings.replyToEmail}`);
    } else {
      console.log('⚠️  No email settings found in database');
    }
    
  } catch (error) {
    console.error('Error checking emails:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmails();
