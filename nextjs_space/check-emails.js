require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEmails() {
  try {
    // Check email notifications
    const emailNotifications = await prisma.emailNotification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        recipientEmail: true,
        subject: true,
        type: true,
        status: true,
        sentAt: true,
        error: true,
        createdAt: true
      }
    });
    
    console.log('Recent email notifications:', JSON.stringify(emailNotifications, null, 2));
    
    const totalEmails = await prisma.emailNotification.count();
    const sentEmails = await prisma.emailNotification.count({
      where: { status: 'SENT' }
    });
    const failedEmails = await prisma.emailNotification.count({
      where: { status: 'FAILED' }
    });
    
    console.log('\nEmail Statistics:');
    console.log('Total emails:', totalEmails);
    console.log('Sent emails:', sentEmails);
    console.log('Failed emails:', failedEmails);
    console.log('Pending emails:', totalEmails - sentEmails - failedEmails);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
  }
}

checkEmails();
