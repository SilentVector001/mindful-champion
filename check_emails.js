const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEmails() {
  try {
    const count = await prisma.emailNotification.count();
    console.log(`Total emails in database: ${count}`);
    
    if (count > 0) {
      const recentEmails = await prisma.emailNotification.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          recipientEmail: true,
          subject: true,
          status: true,
          createdAt: true,
          sentAt: true,
        },
      });
      console.log('\nRecent emails:');
      console.log(JSON.stringify(recentEmails, null, 2));
    }
    
    // Check email settings
    const settings = await prisma.emailSettings.findFirst();
    console.log('\nEmail settings:');
    console.log(JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmails();
