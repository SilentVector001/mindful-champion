#!/usr/bin/env node
/**
 * Test script to verify the email history endpoint works correctly
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testEmailHistoryQuery() {
  console.log('🧪 Testing email history query...\n');
  
  try {
    // Simulate what the endpoint does - fetch emails with user relation
    console.log('1. Fetching emails with user relation...');
    const emails = await prisma.emailNotification.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5, // Limit to 5 for testing
    });
    
    console.log(`✅ Successfully fetched ${emails.length} emails\n`);
    
    if (emails.length > 0) {
      console.log('Sample email:', {
        id: emails[0].id,
        recipientEmail: emails[0].recipientEmail,
        subject: emails[0].subject,
        status: emails[0].status,
        type: emails[0].type,
        hasUser: !!emails[0].user,
        hasSponsorApplicationId: !!emails[0].sponsorApplicationId,
        hasVideoAnalysisId: !!emails[0].videoAnalysisId,
        createdAt: emails[0].createdAt,
      });
    } else {
      console.log('ℹ️  No email notifications found in database');
    }
    
    // Test with sponsorApplicationId filter (simulate getEmailsByApplication)
    console.log('\n2. Testing query with sponsorApplicationId filter...');
    const sponsorEmails = await prisma.emailNotification.findMany({
      where: { 
        sponsorApplicationId: { not: null } 
      },
      take: 5,
    });
    
    console.log(`✅ Successfully queried by sponsorApplicationId: found ${sponsorEmails.length} emails\n`);
    
    // Test statistics query (from the endpoint)
    console.log('3. Testing statistics groupBy query...');
    const stats = await prisma.emailNotification.groupBy({
      by: ['status'],
      _count: true,
    });
    
    console.log('✅ Statistics query successful:');
    stats.forEach(stat => {
      console.log(`   - ${stat.status}: ${stat._count} emails`);
    });
    
    console.log('\n✨ All tests passed!');
    console.log('📧 The /api/admin/emails/history endpoint should work correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nFull error:', error);
    console.error('\nThis indicates a problem with the database schema or Prisma client.');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testEmailHistoryQuery()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
