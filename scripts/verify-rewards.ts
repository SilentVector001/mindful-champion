import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const tiers = await prisma.rewardTier.findMany({ orderBy: { tierLevel: 'asc' } })
  console.log('✅ Found', tiers.length, 'reward tiers:')
  tiers.forEach(tier => {
    console.log(`  - ${tier.displayName}: ${tier.minPoints}-${tier.maxPoints || '∞'} points`)
  })
  
  const rewards = await prisma.tieredReward.findMany()
  console.log('\n✅ Found', rewards.length, 'rewards')
}

main()
  .catch(e => console.error('Error:', e))
  .finally(() => prisma.$disconnect())
