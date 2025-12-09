require('dotenv').config({ path: '/home/ubuntu/mindful_champion/nextjs_space/.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAPIs() {
  try {
    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: 'deansnow59@gmail.com' },
      select: { 
        id: true, 
        email: true, 
        name: true,
        rewardPoints: true,
        achievementStats: {
          select: {
            totalPoints: true,
            totalAchievements: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('\n' + '='.repeat(60));
    console.log('DATABASE DIRECT QUERY');
    console.log('='.repeat(60));
    console.log('User ID:', user.id);
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('🔍 User.rewardPoints (from database):', user.rewardPoints);
    
    if (user.achievementStats) {
      console.log('🔍 AchievementStats.totalPoints (from database):', user.achievementStats.totalPoints);
      console.log('🔍 AchievementStats.totalAchievements (from database):', user.achievementStats.totalAchievements);
    } else {
      console.log('⚠️  No achievementStats record found for this user');
    }

    console.log('\n' + '='.repeat(60));
    console.log('SIMULATING API RESPONSES (Based on Code Analysis)');
    console.log('='.repeat(60));
    
    // Simulate /api/rewards/user-stats
    console.log('\n📡 /api/rewards/user-stats would return:');
    console.log(JSON.stringify({
      stats: {
        rewardPoints: user.rewardPoints,
        achievements: user.achievementStats?.totalAchievements || 0,
      },
      points: user.rewardPoints,
      achievements: user.achievementStats?.totalAchievements || 0,
    }, null, 2));

    // Simulate /api/user/profile
    console.log('\n📡 /api/user/profile would return:');
    console.log(JSON.stringify({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        rewardPoints: user.rewardPoints
      }
    }, null, 2));

    // Simulate /api/rewards/current-tier
    console.log('\n📡 /api/rewards/current-tier would use:');
    console.log(`  userPoints: ${user.rewardPoints}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAPIs();
