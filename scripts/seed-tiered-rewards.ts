import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTieredRewards() {
  console.log('🎁 Seeding Tiered Rewards...');

  // Get all tiers
  const tiers = await prisma.rewardTier.findMany({
    orderBy: { tierLevel: 'asc' }
  });

  if (tiers?.length === 0) {
    console.log('⚠️ No tiers found. Run seed-reward-tiers.ts first.');
    return;
  }

  const bronzeTier = tiers?.find?.(t => t?.name === 'BRONZE');
  const silverTier = tiers?.find?.(t => t?.name === 'SILVER');
  const goldTier = tiers?.find?.(t => t?.name === 'GOLD');

  // Sample rewards for each tier
  const rewards = [
    // BRONZE TIER REWARDS
    {
      tierId: bronzeTier?.id ?? '',
      name: 'Beginner Paddle Discount',
      description: 'Get 15% off on beginner-friendly paddles from our partner brands',
      pointsCost: 250,
      retailValue: 25,
      category: 'Equipment',
      isActive: true,
      isFeatured: true,
      unlimitedStock: true,
    },
    {
      tierId: bronzeTier?.id ?? '',
      name: 'Training Video Bundle',
      description: 'Access to exclusive beginner training video series',
      pointsCost: 150,
      retailValue: 15,
      category: 'Training',
      isActive: true,
      unlimitedStock: true,
    },
    {
      tierId: bronzeTier?.id ?? '',
      name: 'Pickleball Grip Tape',
      description: 'Premium grip tape for better paddle control',
      pointsCost: 100,
      retailValue: 10,
      category: 'Accessories',
      isActive: true,
      stockQuantity: 50,
      unlimitedStock: false,
    },

    // SILVER TIER REWARDS
    {
      tierId: silverTier?.id ?? '',
      name: 'Advanced Paddle (50% off)',
      description: 'Premium carbon fiber paddle with power and control - 50% off retail',
      pointsCost: 1500,
      retailValue: 150,
      category: 'Equipment',
      isActive: true,
      isFeatured: true,
      stockQuantity: 20,
      unlimitedStock: false,
    },
    {
      tierId: silverTier?.id ?? '',
      name: 'Free Tournament Entry',
      description: 'One free entry to any local tournament (value up to $50)',
      pointsCost: 1000,
      retailValue: 50,
      category: 'Events',
      isActive: true,
      unlimitedStock: true,
    },
    {
      tierId: silverTier?.id ?? '',
      name: 'Coaching Session Voucher',
      description: '1-hour private coaching session with certified instructor',
      pointsCost: 2000,
      retailValue: 75,
      category: 'Coaching',
      isActive: true,
      isFeatured: true,
      stockQuantity: 10,
      unlimitedStock: false,
    },
    {
      tierId: silverTier?.id ?? '',
      name: 'Performance Apparel Set',
      description: 'Moisture-wicking shirt and shorts from top brands',
      pointsCost: 1200,
      retailValue: 60,
      category: 'Apparel',
      isActive: true,
      stockQuantity: 30,
      unlimitedStock: false,
    },

    // GOLD TIER REWARDS
    {
      tierId: goldTier?.id ?? '',
      name: 'Professional Paddle Package',
      description: 'Top-of-the-line professional paddle with carrying case',
      pointsCost: 5000,
      retailValue: 250,
      category: 'Equipment',
      isActive: true,
      isFeatured: true,
      stockQuantity: 5,
      unlimitedStock: false,
    },
    {
      tierId: goldTier?.id ?? '',
      name: 'VIP Tournament Experience',
      description: 'VIP access to major tournament with meet & greet with pros',
      pointsCost: 8000,
      retailValue: 500,
      category: 'Events',
      isActive: true,
      isFeatured: true,
      stockQuantity: 3,
      unlimitedStock: false,
    },
    {
      tierId: goldTier?.id ?? '',
      name: 'Monthly Coaching Package',
      description: '4 private coaching sessions per month for 3 months',
      pointsCost: 7000,
      retailValue: 600,
      category: 'Coaching',
      isActive: true,
      isFeatured: true,
      stockQuantity: 5,
      unlimitedStock: false,
    },
    {
      tierId: goldTier?.id ?? '',
      name: 'Complete Equipment Upgrade',
      description: 'Full equipment package: paddle, bag, shoes, and apparel',
      pointsCost: 10000,
      retailValue: 800,
      category: 'Equipment',
      isActive: true,
      isFeatured: true,
      stockQuantity: 2,
      unlimitedStock: false,
    },
  ];

  for (const reward of rewards) {
    if (!reward.tierId) {
      console.log(`⚠️ Skipping reward (tier not found): ${reward.name}`);
      continue;
    }

    try {
      await prisma.tieredReward.create({
        data: reward
      });
      console.log(`✨ Created reward: ${reward.name}`);
    } catch (error: any) {
      console.log(`⚠️ Reward already exists or error: ${reward.name}`);
    }
  }

  console.log('✅ Tiered rewards seeded successfully!');
}

seedTieredRewards()
  .catch((e) => {
    console.error('❌ Error seeding tiered rewards:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
