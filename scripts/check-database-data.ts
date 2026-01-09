import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function checkDatabaseData() {
  try {
    console.log('🔍 DATABASE CONNECTION CHECK\n');
    console.log('Database URL:', process.env.DATABASE_URL?.split('@')[1]?.split('?')[0] || 'N/A');
    console.log('='.repeat(80));

    // 1. Count total users
    const totalUsers = await prisma.user.count();
    console.log(`\n📊 TOTAL USERS: ${totalUsers}`);

    // 2. Get recent users
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        subscriptionTier: true,
        createdAt: true,
        lastActiveDate: true,
      }
    });

    console.log('\n👥 RECENT USERS (Last 10):');
    recentUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.firstName} ${user.lastName || ''}`);
      console.log(`   Tier: ${user.subscriptionTier}, Created: ${user.createdAt.toISOString()}`);
      console.log(`   Last Active: ${user.lastActiveDate?.toISOString() || 'Never'}`);
    });

    // 3. Count video analyses
    const totalVideos = await prisma.VideoAnalysis.count();
    console.log(`\n🎥 TOTAL VIDEO ANALYSES: ${totalVideos}`);

    // 4. Get recent video analyses
    const recentVideos = await prisma.VideoAnalysis.findMany({
      take: 10,
      orderBy: { uploadedAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
          }
        }
      }
    });

    console.log('\n📹 RECENT VIDEO ANALYSES (Last 10):');
    recentVideos.forEach((video, index) => {
      console.log(`${index + 1}. User: ${video.user.email} (${video.user.firstName})`);
      console.log(`   Status: ${video.analysisStatus}, Uploaded: ${video.uploadedAt.toISOString()}`);
      console.log(`   File: ${video.fileName || 'N/A'}`);
    });

    // 5. Count subscriptions
    const totalSubscriptions = await prisma.subscription.count();
    console.log(`\n💳 TOTAL SUBSCRIPTIONS: ${totalSubscriptions}`);

    // 6. Get users with subscriptions
    const usersWithSubs = await prisma.user.findMany({
      where: {
        subscriptionTier: {
          in: ['PRO', 'PREMIUM', 'TRIAL']
        }
      },
      select: {
        email: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        trialEndDate: true,
      }
    });

    console.log(`\n🎫 USERS WITH ACTIVE SUBSCRIPTIONS/TRIALS: ${usersWithSubs.length}`);
    usersWithSubs.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Tier: ${user.subscriptionTier}, Status: ${user.subscriptionStatus || 'N/A'}`);
      console.log(`   Trial End: ${user.trialEndDate?.toISOString() || 'N/A'}`);
    });

    // 7. Check for user achievements
    const totalAchievements = await prisma.userAchievement.count();
    console.log(`\n🏆 TOTAL USER ACHIEVEMENTS: ${totalAchievements}`);

    // 8. Check for training programs
    const totalUserPrograms = await prisma.userProgram.count();
    console.log(`\n📚 TOTAL USER TRAINING PROGRAMS: ${totalUserPrograms}`);

    // 9. Check video analysis status distribution
    const videoStatusCounts = await prisma.VideoAnalysis.groupBy({
      by: ['analysisStatus'],
      _count: true,
    });

    console.log('\n📊 VIDEO ANALYSIS STATUS DISTRIBUTION:');
    videoStatusCounts.forEach(status => {
      console.log(`   ${status.analysisStatus}: ${status._count}`);
    });

    // 10. Check for match history
    const totalMatches = await prisma.match.count();
    console.log(`\n🏓 TOTAL MATCHES: ${totalMatches}`);

    // 11. Check database creation timestamps
    const oldestUser = await prisma.user.findFirst({
      orderBy: { createdAt: 'asc' }
    });
    const newestUser = await prisma.user.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    console.log('\n⏰ DATABASE TIMELINE:');
    console.log(`   Oldest user created: ${oldestUser?.createdAt.toISOString() || 'N/A'}`);
    console.log(`   Newest user created: ${newestUser?.createdAt.toISOString() || 'N/A'}`);

    // 12. Check for recent activity (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentActivity = await prisma.user.count({
      where: {
        lastActiveDate: {
          gte: oneDayAgo
        }
      }
    });

    console.log(`\n🔥 USERS ACTIVE IN LAST 24 HOURS: ${recentActivity}`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ Database check complete!');

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseData();
