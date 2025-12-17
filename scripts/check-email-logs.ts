import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkEmailLogs() {
  try {
    console.log('🔍 Checking EmailNotification table...\n');
    
    // Get total count
    const totalCount = await prisma.emailNotification.count();
    console.log(`📊 Total Email Records: ${totalCount}`);
    
    // Count by status
    const statusCounts = await prisma.emailNotification.groupBy({
      by: ['status'],
      _count: true,
    });
    
    console.log('\n📈 Breakdown by Status:');
    statusCounts.forEach((group: any) => {
      console.log(`  ${group.status}: ${group._count}`);
    });
    
    // Count by type
    const typeCounts = await prisma.emailNotification.groupBy({
      by: ['type'],
      _count: true,
    });
    
    console.log('\n📋 Breakdown by Type:');
    typeCounts.forEach((group: any) => {
      console.log(`  ${group.type}: ${group._count}`);
    });
    
    // Get recent emails (if any)
    const recentEmails = await prisma.emailNotification.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });
    
    if (recentEmails.length > 0) {
      console.log('\n📧 Recent Emails:');
      recentEmails.forEach((email) => {
        console.log(`\n  ID: ${email.id}`);
        console.log(`  Type: ${email.type}`);
        console.log(`  Status: ${email.status}`);
        console.log(`  To: ${email.recipientEmail}`);
        console.log(`  Subject: ${email.subject}`);
        console.log(`  Created: ${email.createdAt}`);
        console.log(`  Sent: ${email.sentAt || 'Not sent'}`);
      });
    } else {
      console.log('\n❌ No email records found in database');
    }
    
  } catch (error) {
    console.error('❌ Error checking email logs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmailLogs();
