require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserPoints() {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: 'deansnow59@gmail.com' },
      include: {
        achievementStats: true
      }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('\n=== USER DATA ===');
    console.log('User ID:', user.id);
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    
    console.log('\n=== REWARD POINTS ===');
    if ('rewardPoints' in user) {
      console.log('User.rewardPoints:', user.rewardPoints);
    } else {
      console.log('User.rewardPoints: Field does not exist on User model');
    }

    console.log('\n=== USER ACHIEVEMENT STATS ===');
    if (user.achievementStats) {
      console.log('Total Points:', user.achievementStats.totalPoints);
      console.log('Total Achievements:', user.achievementStats.totalAchievements);
      console.log('Bronze Medals:', user.achievementStats.bronzeMedals);
      console.log('Silver Medals:', user.achievementStats.silverMedals);
      console.log('Gold Medals:', user.achievementStats.goldMedals);
    } else {
      console.log('No UserAchievementStats record found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserPoints();
