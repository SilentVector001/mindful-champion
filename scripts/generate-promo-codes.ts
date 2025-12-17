
import { PrismaClient, PromoCodeType, PromoCodeStatus } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

// Helper function to generate a unique promo code
function generatePromoCode(prefix: string, number: number): string {
  // Format: BETA-2024-XXXX where XXXX is the number padded to 4 digits
  return `${prefix}-2024-${String(number).padStart(4, '0')}`;
}

// Define the beta testing tasks that users must complete
const betaTasks = [
  {
    id: 'upload_video',
    title: 'Upload Your First Video',
    description: 'Upload a pickleball video for AI analysis',
    category: 'video_analysis',
    required: true,
    orderIndex: 1
  },
  {
    id: 'start_training_program',
    title: 'Start a Training Program',
    description: 'Enroll in and start any training program',
    category: 'training',
    required: true,
    orderIndex: 2
  },
  {
    id: 'complete_drill',
    title: 'Complete a Practice Drill',
    description: 'Complete at least one drill from the drills library',
    category: 'practice',
    required: true,
    orderIndex: 3
  },
  {
    id: 'ask_coach_kai',
    title: 'Ask Coach Kai a Question',
    description: 'Use the AI coach to get personalized advice',
    category: 'ai_coach',
    required: true,
    orderIndex: 4
  },
  {
    id: 'find_partner',
    title: 'Browse Partner Matching',
    description: 'Explore the partner matching feature',
    category: 'community',
    required: true,
    orderIndex: 5
  },
  {
    id: 'view_tournaments',
    title: 'Check Tournament Hub',
    description: 'Visit the tournament hub to see live events',
    category: 'media',
    required: true,
    orderIndex: 6
  },
  {
    id: 'explore_features',
    title: 'Explore Additional Features',
    description: 'Browse and interact with at least 3 other platform features',
    category: 'exploration',
    required: true,
    orderIndex: 7
  }
];

async function main() {
  console.log('🎟️  Starting Promo Code Generation...\n');

  // Delete existing promo codes (for clean slate in development)
  const deleteResult = await prisma.promoCode.deleteMany({});
  console.log(`✅ Cleaned up ${deleteResult.count} existing promo codes\n`);

  const promoCodes = [];

  // Generate 50 codes for Lee
  console.log('📝 Generating 50 promo codes for Lee...');
  for (let i = 1; i <= 50; i++) {
    const code = generatePromoCode('BETA', i);
    promoCodes.push({
      code,
      type: PromoCodeType.BETA_TESTER,
      status: PromoCodeStatus.ACTIVE,
      description: 'Beta Tester Access - 30 Days Premium + $25 Reward',
      durationDays: 30,
      maxRedemptions: 1,
      timesRedeemed: 0,
      assignedTo: 'Lee',
      assignedBy: 'System',
      isBetaTester: true,
      betaTasks: betaTasks,
      rewardAmount: 25,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      createdBy: 'System'
    });
  }

  // Generate 50 codes for Owner
  console.log('📝 Generating 50 promo codes for Owner...\n');
  for (let i = 51; i <= 100; i++) {
    const code = generatePromoCode('BETA', i);
    promoCodes.push({
      code,
      type: PromoCodeType.BETA_TESTER,
      status: PromoCodeStatus.ACTIVE,
      description: 'Beta Tester Access - 30 Days Premium + $25 Reward',
      durationDays: 30,
      maxRedemptions: 1,
      timesRedeemed: 0,
      assignedTo: 'Owner',
      assignedBy: 'System',
      isBetaTester: true,
      betaTasks: betaTasks,
      rewardAmount: 25,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      createdBy: 'System'
    });
  }

  // Insert all promo codes in batches
  console.log('💾 Inserting promo codes into database...');
  const batchSize = 25;
  for (let i = 0; i < promoCodes.length; i += batchSize) {
    const batch = promoCodes.slice(i, i + batchSize);
    await prisma.promoCode.createMany({
      data: batch
    });
    console.log(`   ✓ Inserted batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(promoCodes.length / batchSize)}`);
  }

  console.log('\n✅ Successfully generated 100 promo codes!\n');
  console.log('📊 Summary:');
  console.log(`   • 50 codes assigned to Lee (BETA-2024-0001 to BETA-2024-0050)`);
  console.log(`   • 50 codes assigned to Owner (BETA-2024-0051 to BETA-2024-0100)`);
  console.log(`   • Each code provides: 30 days PRO access + $25 reward`);
  console.log(`   • Code format: BETA-2024-XXXX`);
  console.log(`   • Expiration: 90 days from now`);
  console.log(`   • Beta tasks: ${betaTasks.length} required tasks\n`);

  // Display sample codes
  console.log('📋 Sample Codes:');
  console.log(`   Lee's First Code: BETA-2024-0001`);
  console.log(`   Lee's Last Code: BETA-2024-0050`);
  console.log(`   Owner's First Code: BETA-2024-0051`);
  console.log(`   Owner's Last Code: BETA-2024-0100\n`);

  console.log('🎉 Promo codes are ready for distribution!');
}

main()
  .catch((e) => {
    console.error('❌ Error generating promo codes:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
