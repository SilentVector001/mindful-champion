import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables FIRST
config({ path: resolve(__dirname, '../.env.local') });

import { PrismaClient } from '@prisma/client';

// Create Prisma instance after env is loaded
const prisma = new PrismaClient();

interface SimpleAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: string;
}

const simpleAchievements: SimpleAchievement[] = [
  {
    id: 'FIRST_VIDEO',
    name: 'First Video Upload',
    description: 'Upload your first video for analysis',
    icon: '🎥',
    points: 10,
    category: 'VIDEO'
  },
  {
    id: 'VIDEO_MASTER_5',
    name: 'Video Master',
    description: 'Upload 5 videos for analysis',
    icon: '🎬',
    points: 50,
    category: 'VIDEO'
  },
  {
    id: 'VIDEO_MASTER_10',
    name: 'Video Expert',
    description: 'Upload 10 videos for analysis',
    icon: '🏆',
    points: 100,
    category: 'VIDEO'
  },
  {
    id: 'FIRST_PRACTICE',
    name: 'First Practice Session',
    description: 'Log your first practice session',
    icon: '📝',
    points: 10,
    category: 'PRACTICE'
  },
  {
    id: 'PRACTICE_WARRIOR_5',
    name: 'Practice Warrior',
    description: 'Log 5 practice sessions',
    icon: '💪',
    points: 50,
    category: 'PRACTICE'
  },
  {
    id: 'PRACTICE_WARRIOR_10',
    name: 'Practice Champion',
    description: 'Log 10 practice sessions',
    icon: '🥇',
    points: 100,
    category: 'PRACTICE'
  },
  {
    id: 'PRO_SUBSCRIBER',
    name: 'Pro Champion',
    description: 'Upgrade to PRO subscription',
    icon: '⭐',
    points: 200,
    category: 'SUBSCRIPTION'
  }
];

async function initializeAndCheckAchievements() {
  console.log('🚀 Initializing Achievement System...\n');
  
  try {
    // 1. Initialize achievement definitions in database
    console.log('📝 Step 1: Creating achievement definitions...');
    for (const achievement of simpleAchievements) {
      await prisma.achievement.upsert({
        where: { achievementId: achievement.id },
        update: {
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          points: achievement.points,
          category: achievement.category,
          tier: achievement.points >= 100 ? 'GOLD' : achievement.points >= 50 ? 'SILVER' : 'BRONZE',
          isActive: true
        },
        create: {
          achievementId: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          points: achievement.points,
          category: achievement.category,
          tier: achievement.points >= 100 ? 'GOLD' : achievement.points >= 50 ? 'SILVER' : 'BRONZE',
          requirement: {},
          isActive: true
        }
      });
    }
    console.log('✅ Achievement definitions created\n');
    
    // 2. Check achievements for all users with data
    console.log('📝 Step 2: Checking achievements for all users...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionTier: true
      }
    });
    
    console.log(`Found ${users.length} users\n`);
    
    let totalAchievementsAwarded = 0;
    let totalPointsAwarded = 0;
    
    for (const user of users) {
      console.log(`Checking user: ${user.email || user.name || user.id}`);
      
      const result = await checkAndAwardSimpleAchievements(user.id, 'all');
      
      if (result.newAchievements.length > 0) {
        console.log(`  ✅ Awarded ${result.newAchievements.length} achievements (${result.totalPointsEarned} points)`);
        result.newAchievements.forEach(a => {
          console.log(`     - ${a.icon} ${a.name}: ${a.description}`);
        });
        totalAchievementsAwarded += result.newAchievements.length;
        totalPointsAwarded += result.totalPointsEarned;
      } else {
        console.log(`  ℹ️  No new achievements to award`);
      }
      console.log('');
    }
    
    console.log('=' .repeat(60));
    console.log('🎉 ACHIEVEMENT INITIALIZATION COMPLETE!');
    console.log('='.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   - Users checked: ${users.length}`);
    console.log(`   - Total achievements awarded: ${totalAchievementsAwarded}`);
    console.log(`   - Total points awarded: ${totalPointsAwarded}\n`);
    
    // 3. Show current achievement statistics
    const achievementCount = await prisma.achievement.count();
    const progressCount = await prisma.achievementProgress.count({
      where: { percentage: 100 }
    });
    
    console.log('📈 Current System State:');
    console.log(`   - Achievement definitions: ${achievementCount}`);
    console.log(`   - Achievements unlocked: ${progressCount}\n`);
    
  } catch (error) {
    console.error('❌ Error initializing achievements:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization
initializeAndCheckAchievements()
  .then(() => {
    console.log('✅ Initialization completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  });
