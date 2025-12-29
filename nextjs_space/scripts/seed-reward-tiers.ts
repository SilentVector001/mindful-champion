import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRewardTiers() {
  console.log('🎯 Seeding Reward Tiers...');

  const tiers = [
    {
      name: 'BRONZE',
      displayName: 'Bronze Champion',
      minPoints: 0,
      maxPoints: 999,
      tierLevel: 1,
      icon: '🥉',
      colorPrimary: '#CD7F32',
      colorSecondary: '#B87333',
      description: 'Start your journey with Bronze tier rewards and exclusive offers.',
      benefits: [
        'Access to Bronze tier sponsor offers',
        'Exclusive beginner equipment discounts',
        'Monthly training tips',
        'Community support access'
      ],
      sponsorSlot: 1
    },
    {
      name: 'SILVER',
      displayName: 'Silver Warrior',
      minPoints: 1000,
      maxPoints: 4999,
      tierLevel: 2,
      icon: '🥈',
      colorPrimary: '#C0C0C0',
      colorSecondary: '#A8A8A8',
      description: 'Unlock premium rewards and advanced coaching opportunities.',
      benefits: [
        'All Bronze benefits',
        'Access to Silver tier exclusive offers',
        'Premium equipment discounts (up to 30% off)',
        'Free tournament entry vouchers',
        'Priority customer support',
        'Quarterly sponsor gifts'
      ],
      sponsorSlot: 2
    },
    {
      name: 'GOLD',
      displayName: 'Gold Master',
      minPoints: 5000,
      maxPoints: null, // No upper limit
      tierLevel: 3,
      icon: '🥇',
      colorPrimary: '#FFD700',
      colorSecondary: '#FFC700',
      description: 'Elite status with the best rewards and VIP sponsor partnerships.',
      benefits: [
        'All Bronze & Silver benefits',
        'Access to exclusive Gold tier offers',
        'Premium equipment discounts (up to 50% off)',
        'VIP tournament access',
        'Free coaching session vouchers',
        'Personalized sponsor partnerships',
        'Early access to new products',
        'White glove customer service'
      ],
      sponsorSlot: 3
    }
  ];

  for (const tier of tiers) {
    const existing = await prisma.rewardTier.findUnique({
      where: { name: tier.name }
    });

    if (existing) {
      console.log(`✅ ${tier.displayName} tier already exists, updating...`);
      await prisma.rewardTier.update({
        where: { name: tier.name },
        data: tier
      });
    } else {
      console.log(`✨ Creating ${tier.displayName} tier...`);
      await prisma.rewardTier.create({
        data: tier
      });
    }
  }

  console.log('✅ Reward tiers seeded successfully!');
}

seedRewardTiers()
  .catch((e) => {
    console.error('❌ Error seeding reward tiers:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
