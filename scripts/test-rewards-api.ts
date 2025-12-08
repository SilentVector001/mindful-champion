import { prisma } from '../lib/db'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testRewardsAPI() {
  console.log('🧪 Testing Rewards API Logic...\n')
  
  try {
    // Simulate the API behavior for a test user
    const testEmail = 'deansnow59@gmail.com'
    
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
      select: {
        rewardPoints: true,
        achievementStats: {
          select: {
            totalAchievements: true,
          },
        },
      },
    })
    
    if (!user) {
      console.error(`❌ User not found: ${testEmail}`)
      return
    }
    
    console.log(`✅ User found: ${testEmail}`)
    console.log(`   Reward Points: ${user.rewardPoints}`)
    console.log(`   Total Achievements: ${user.achievementStats?.totalAchievements || 0}`)
    
    const response = {
      stats: {
        rewardPoints: user.rewardPoints,
        achievements: user.achievementStats?.totalAchievements || 0,
      },
      points: user.rewardPoints,
      achievements: user.achievementStats?.totalAchievements || 0,
    }
    
    console.log('\n📤 API Response:')
    console.log(JSON.stringify(response, null, 2))
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRewardsAPI()
