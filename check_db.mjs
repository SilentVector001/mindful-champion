import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('=== CHECKING DATABASE ===\n');
    
    // Count all records
    const userCount = await prisma.user.count();
    const conversationCount = await prisma.conversation.count();
    const messageCount = await prisma.message.count();
    const subscriptionCount = await prisma.subscription.count();
    const paymentCount = await prisma.payment.count();
    const matchCount = await prisma.match.count();
    const videoCount = await prisma.video.count();
    
    console.log('📊 DATABASE COUNTS:');
    console.log(`   Total Users: ${userCount}`);
    console.log(`   Total Conversations: ${conversationCount}`);
    console.log(`   Total Messages: ${messageCount}`);
    console.log(`   Total Subscriptions: ${subscriptionCount}`);
    console.log(`   Total Payments: ${paymentCount}`);
    console.log(`   Total Matches: ${matchCount}`);
    console.log(`   Total Videos: ${videoCount}`);
    
    // Get all users with their conversation counts
    console.log('\n👥 USER DETAILS:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            conversations: true,
            messages: true,
            videos: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.role})`);
      console.log(`      - ${user._count.conversations} conversations`);
      console.log(`      - ${user._count.messages} messages`);
      console.log(`      - ${user._count.videos} videos`);
      console.log(`      - Created: ${user.createdAt.toLocaleDateString()}`);
    });
    
    // Get recent users (last 7 days) - this is what admin dashboard shows
    console.log('\n🆕 RECENT USERS (Last 7 days):');
    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log(`   Found ${recentUsers.length} recent users`);
    recentUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} - ${user.createdAt.toLocaleDateString()}`);
    });
    
    // Check active subscriptions
    console.log('\n💳 ACTIVE SUBSCRIPTIONS:');
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: { user: true }
    });
    
    console.log(`   Found ${activeSubscriptions.length} active subscriptions`);
    activeSubscriptions.forEach((sub, index) => {
      console.log(`   ${index + 1}. ${sub.user.email} - ${sub.tier} (${sub.billingCycle})`);
    });
    
    // Check payments
    console.log('\n💰 RECENT PAYMENTS:');
    const payments = await prisma.payment.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log(`   Found ${payments.length} payments (showing last 10)`);
    payments.forEach((payment, index) => {
      console.log(`   ${index + 1}. ${payment.user.email} - $${(payment.amount / 100).toFixed(2)} on ${payment.createdAt.toLocaleDateString()}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
