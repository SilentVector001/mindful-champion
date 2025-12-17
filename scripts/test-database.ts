import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

const prisma = new PrismaClient()

async function testDatabase() {
  console.log('🔍 Testing Database Connection...\n')
  
  try {
    // Test 1: Basic connection
    console.log('✅ Test 1: Database Connection')
    await prisma.$connect()
    console.log('   ✓ Successfully connected to database\n')
    
    // Test 2: Count users
    console.log('✅ Test 2: User Model')
    const userCount = await prisma.user.count()
    console.log(`   ✓ Total users: ${userCount}`)
    
    // Check for users with reward points
    const usersWithPoints = await prisma.user.count({
      where: {
        rewardPoints: {
          gt: 0
        }
      }
    })
    console.log(`   ✓ Users with reward points: ${usersWithPoints}\n`)
    
    // Test 3: RewardTier model
    console.log('✅ Test 3: RewardTier Model')
    const tierCount = await prisma.rewardTier.count()
    console.log(`   ✓ Total reward tiers: ${tierCount}`)
    
    const tiers = await prisma.rewardTier.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        minPoints: true,
        _count: {
          select: {
            unlocks: true
          }
        }
      }
    })
    
    if (tiers.length > 0) {
      console.log('   ✓ Reward Tiers:')
      tiers.forEach(tier => {
        console.log(`      - ${tier.displayName} (${tier.name}): ${tier.minPoints} pts, ${tier._count.unlocks} unlocks`)
      })
    } else {
      console.log('   ⚠️  No reward tiers found in database')
    }
    console.log('')
    
    // Test 4: Achievement model
    console.log('✅ Test 4: Achievement Model')
    const achievementCount = await prisma.achievement.count()
    console.log(`   ✓ Total achievements: ${achievementCount}`)
    
    const achievementsByTier = await prisma.achievement.groupBy({
      by: ['tier'],
      _count: true
    })
    
    if (achievementsByTier.length > 0) {
      console.log('   ✓ Achievements by tier:')
      achievementsByTier.forEach(group => {
        console.log(`      - ${group.tier}: ${group._count} achievements`)
      })
    }
    console.log('')
    
    // Test 5: TierUnlock model
    console.log('✅ Test 5: TierUnlock Model')
    const unlockCount = await prisma.tierUnlock.count()
    console.log(`   ✓ Total tier unlocks: ${unlockCount}`)
    
    if (unlockCount > 0) {
      const recentUnlocks = await prisma.tierUnlock.findMany({
        take: 5,
        orderBy: {
          unlockedAt: 'desc'
        },
        include: {
          tier: {
            select: {
              displayName: true
            }
          },
          user: {
            select: {
              email: true,
              rewardPoints: true
            }
          }
        }
      })
      
      console.log('   ✓ Recent tier unlocks:')
      recentUnlocks.forEach(unlock => {
        console.log(`      - ${unlock.user.email}: ${unlock.tier.displayName} (${unlock.pointsAtUnlock} pts)`)
      })
    } else {
      console.log('   ℹ️  No tier unlocks yet')
    }
    console.log('')
    
    // Test 6: UserAchievement model
    console.log('✅ Test 6: UserAchievement Model')
    const userAchievementCount = await prisma.userAchievement.count()
    console.log(`   ✓ Total user achievements unlocked: ${userAchievementCount}\n`)
    
    // Test 7: Check sample user rewards data
    console.log('✅ Test 7: Sample User Rewards Data')
    const sampleUser = await prisma.user.findFirst({
      where: {
        rewardPoints: {
          gt: 0
        }
      }
    })
    
    if (sampleUser) {
      console.log(`   ✓ Sample user: ${sampleUser.email}`)
      console.log(`   ✓ Reward points: ${sampleUser.rewardPoints}`)
      
      // Count achievements for this user
      const userAchievements = await prisma.userAchievement.count({
        where: { userId: sampleUser.id }
      })
      console.log(`   ✓ Achievements unlocked: ${userAchievements}`)
      
      // Count tier unlocks for this user
      const tierUnlocks = await prisma.tierUnlock.count({
        where: { userId: sampleUser.id }
      })
      console.log(`   ✓ Tiers unlocked: ${tierUnlocks}`)
    } else {
      console.log('   ℹ️  No users with reward points found')
    }
    console.log('')
    
    console.log('=' .repeat(60))
    console.log('✅ ALL DATABASE TESTS PASSED!')
    console.log('=' .repeat(60))
    console.log('\nSummary:')
    console.log(`- Users: ${userCount}`)
    console.log(`- Users with points: ${usersWithPoints}`)
    console.log(`- Reward Tiers: ${tierCount}`)
    console.log(`- Achievements: ${achievementCount}`)
    console.log(`- Tier Unlocks: ${unlockCount}`)
    console.log(`- User Achievements: ${userAchievementCount}`)
    
  } catch (error) {
    console.error('\n❌ Database Test Failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
