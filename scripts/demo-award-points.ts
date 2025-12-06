import { PrismaClient } from '@prisma/client';
import { awardPoints } from '../lib/rewards/award-points';

const prisma = new PrismaClient();

async function demoAwardPoints() {
  console.log('🎯 Demo: Awarding Points to Test User...');

  // Find the test user (john@doe.com)
  const user = await prisma.user.findUnique({
    where: { email: 'john@doe.com' },
    select: { id: true, email: true, rewardPoints: true, firstName: true }
  });

  if (!user) {
    console.log('❌ Test user not found. Please ensure john@doe.com exists.');
    return;
  }

  console.log(`\n👤 User: ${user?.email ?? ''}`);
  console.log(`💰 Current Points: ${user?.rewardPoints?.toLocaleString?.() ?? 0}\n`);

  // Demo scenarios
  const scenarios = [
    {
      name: 'Scenario 1: New User (Bronze Tier)',
      points: 100,
      reason: 'Completed onboarding',
      expectedTier: 'Bronze Champion'
    },
    {
      name: 'Scenario 2: Unlock Silver Tier',
      points: 1000,
      reason: 'Completed 10 achievements',
      expectedTier: 'Silver Warrior'
    },
    {
      name: 'Scenario 3: Unlock Gold Tier',
      points: 5000,
      reason: 'Master level achievements',
      expectedTier: 'Gold Master'
    }
  ];

  console.log('🎯 Available Demo Scenarios:');
  scenarios.forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.name}`);
    console.log(`     - Award: ${s.points.toLocaleString()} points`);
    console.log(`     - Expected: ${s.expectedTier}`);
  });

  // Get command line argument for scenario
  const scenarioIndex = process.argv[2] ? parseInt(process.argv[2]) - 1 : 0;
  
  if (scenarioIndex < 0 || scenarioIndex >= scenarios.length) {
    console.log(`\n⚠️  Invalid scenario. Using scenario 1.`);
  }

  const scenario = scenarios[scenarioIndex] ?? scenarios[0];
  
  console.log(`\n🎉 Running: ${scenario?.name ?? ''}\n`);

  // Award points
  const result = await awardPoints(
    user.id,
    scenario?.points ?? 0,
    scenario?.reason ?? ''
  );

  if (result?.success) {
    console.log(`✅ Success!`);
    console.log(`💰 New Total: ${result?.newTotal?.toLocaleString?.() ?? 0} points`);
    console.log(`🏆 Check your email for tier unlock notifications!`);
    console.log(`\n🌐 Visit the Rewards Center: http://localhost:3000/rewards`);
  } else {
    console.log(`❌ Failed: ${result?.error ?? 'Unknown error'}`);
  }

  console.log(`\n💡 Tip: Run this script with scenario number:`);
  console.log(`   npx tsx --require dotenv/config scripts/demo-award-points.ts 1`);
  console.log(`   npx tsx --require dotenv/config scripts/demo-award-points.ts 2`);
  console.log(`   npx tsx --require dotenv/config scripts/demo-award-points.ts 3\n`);
}

demoAwardPoints()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
