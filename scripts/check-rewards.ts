import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function checkRewards() {
  try {
    console.log('🎁 Checking Rewards System...\n')
    
    // Get all users with their reward points
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        rewardPoints: true
      },
      orderBy: {
        rewardPoints: 'desc'
      }
    })
    
    console.log(`📊 Total Users: ${users.length}\n`)
    console.log('User Reward Points:')
    console.log('='.repeat(80))
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName || 'Unknown'} ${user.lastName || ''} (${user.email})`)
      console.log(`   Reward Points: ${user.rewardPoints}`)
    })
    
    // Get reward redemptions
    const redemptions = await prisma.rewardRedemption.count()
    console.log(`\n\n💰 Total Reward Redemptions: ${redemptions}`)
    
    // Check if reward tiers exist
    const tiers = await prisma.rewardTier.findMany()
    console.log(`\n🎯 Reward Tiers: ${tiers.length}`)
    if (tiers.length > 0) {
      tiers.forEach(tier => {
        console.log(`  - ${tier.name}: ${tier.pointsRequired} points (${tier.discount}% discount)`)
      })
    }
    
    // Check if tiered rewards exist
    const tieredRewards = await prisma.tieredReward.count()
    console.log(`\n🏆 Tiered Rewards: ${tieredRewards}`)
    
  } catch (error) {
    console.error('❌ Error checking rewards:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRewards()
