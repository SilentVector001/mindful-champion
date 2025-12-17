import { PrismaClient, SubscriptionTier } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function mergeLeeAccounts() {
  console.log('🔄 Merging Lee Rosenthal accounts...\n');
  
  try {
    // Primary account: lee@onesoulpickleball.com
    const primaryAccount = await prisma.user.findUnique({
      where: { email: 'lee@onesoulpickleball.com' },
      include: { 
        subscriptions: true,
        videoAnalyses: true,
        achievementProgress: true,
        practiceLogs: true
      }
    });
    
    // Duplicate account: onesoulpickleball@gmail.com
    const duplicateAccount = await prisma.user.findUnique({
      where: { email: 'onesoulpickleball@gmail.com' },
      include: { 
        subscriptions: true,
        videoAnalyses: true,
        achievementProgress: true,
        practiceLogs: true
      }
    });
    
    if (!primaryAccount || !duplicateAccount) {
      console.log('❌ One or both accounts not found');
      if (!primaryAccount) console.log('   - Primary account (lee@onesoulpickleball.com) not found');
      if (!duplicateAccount) console.log('   - Duplicate account (onesoulpickleball@gmail.com) not found');
      return;
    }
    
    console.log('✅ Found both accounts');
    console.log(`Primary: ${primaryAccount.email} (${primaryAccount.id})`);
    console.log(`   - Tier: ${primaryAccount.subscriptionTier}`);
    console.log(`   - Subscriptions: ${primaryAccount.subscriptions.length}`);
    console.log(`   - Video analyses: ${primaryAccount.videoAnalyses.length}`);
    console.log(`   - Practice logs: ${primaryAccount.practiceLogs.length}`);
    console.log(`   - Achievement progress: ${primaryAccount.achievementProgress.length}\n`);
    
    console.log(`Duplicate: ${duplicateAccount.email} (${duplicateAccount.id})`);
    console.log(`   - Tier: ${duplicateAccount.subscriptionTier}`);
    console.log(`   - Subscriptions: ${duplicateAccount.subscriptions.length}`);
    console.log(`   - Video analyses: ${duplicateAccount.videoAnalyses.length}`);
    console.log(`   - Practice logs: ${duplicateAccount.practiceLogs.length}`);
    console.log(`   - Achievement progress: ${duplicateAccount.achievementProgress.length}\n`);
    
    console.log('🔄 Starting merge process...\n');
    
    // 1. Transfer video analyses
    if (duplicateAccount.videoAnalyses.length > 0) {
      const videoCount = await prisma.videoAnalysis.updateMany({
        where: { userId: duplicateAccount.id },
        data: { userId: primaryAccount.id }
      });
      console.log(`✅ Transferred ${videoCount.count} video analyses`);
    } else {
      console.log(`ℹ️  No video analyses to transfer`);
    }
    
    // 2. Transfer practice logs
    if (duplicateAccount.practiceLogs.length > 0) {
      const practiceCount = await prisma.practiceLog.updateMany({
        where: { userId: duplicateAccount.id },
        data: { userId: primaryAccount.id }
      });
      console.log(`✅ Transferred ${practiceCount.count} practice logs`);
    } else {
      console.log(`ℹ️  No practice logs to transfer`);
    }
    
    // 3. Transfer achievement progress
    if (duplicateAccount.achievementProgress.length > 0) {
      const achievementCount = await prisma.achievementProgress.updateMany({
        where: { userId: duplicateAccount.id },
        data: { userId: primaryAccount.id }
      });
      console.log(`✅ Transferred ${achievementCount.count} achievement progress records`);
    } else {
      console.log(`ℹ️  No achievement progress to transfer`);
    }
    
    // 4. Transfer activity logs (no relation, so query directly)
    const activityLogs = await prisma.activityLog.count({
      where: { userId: duplicateAccount.id }
    });
    if (activityLogs > 0) {
      const activityCount = await prisma.activityLog.updateMany({
        where: { userId: duplicateAccount.id },
        data: { userId: primaryAccount.id }
      });
      console.log(`✅ Transferred ${activityCount.count} activity logs`);
    } else {
      console.log(`ℹ️  No activity logs to transfer`);
    }
    
    // 5. Handle subscriptions - keep the better one (PRO > PREMIUM > BASIC > FREE)
    console.log('\n🔄 Processing subscriptions...');
    
    const primaryTierValue = getTierValue(primaryAccount.subscriptionTier);
    const duplicateTierValue = getTierValue(duplicateAccount.subscriptionTier);
    
    if (duplicateTierValue > primaryTierValue) {
      console.log(`   Duplicate has better tier (${duplicateAccount.subscriptionTier} > ${primaryAccount.subscriptionTier})`);
      
      // Update primary user to have the better tier
      await prisma.user.update({
        where: { id: primaryAccount.id },
        data: { subscriptionTier: duplicateAccount.subscriptionTier }
      });
      console.log(`   ✅ Updated primary account tier: ${primaryAccount.subscriptionTier} → ${duplicateAccount.subscriptionTier}`);
      
      // Transfer subscription records from duplicate to primary
      if (duplicateAccount.subscriptions.length > 0) {
        const subCount = await prisma.subscription.updateMany({
          where: { userId: duplicateAccount.id },
          data: { userId: primaryAccount.id }
        });
        console.log(`   ✅ Transferred ${subCount.count} subscription records`);
      }
      
      // Delete primary's old subscriptions if they're lower tier
      if (primaryAccount.subscriptions.length > 0) {
        for (const sub of primaryAccount.subscriptions) {
          await prisma.subscription.delete({
            where: { id: sub.id }
          });
        }
        console.log(`   ✅ Deleted ${primaryAccount.subscriptions.length} old subscription records from primary`);
      }
    } else {
      console.log(`   Primary has equal or better tier (${primaryAccount.subscriptionTier} >= ${duplicateAccount.subscriptionTier})`);
      console.log(`   ✅ Keeping primary account subscription`);
      
      // Delete duplicate's subscriptions
      if (duplicateAccount.subscriptions.length > 0) {
        for (const sub of duplicateAccount.subscriptions) {
          await prisma.subscription.delete({
            where: { id: sub.id }
          });
        }
        console.log(`   ✅ Deleted ${duplicateAccount.subscriptions.length} subscription records from duplicate`);
      }
    }
    
    // 6. Delete duplicate account
    console.log('\n🗑️  Deleting duplicate account...');
    await prisma.user.delete({
      where: { id: duplicateAccount.id }
    });
    console.log(`✅ Deleted duplicate account: ${duplicateAccount.email}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ACCOUNTS MERGED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`\n✅ Primary account: ${primaryAccount.email}`);
    console.log(`   ID: ${primaryAccount.id}`);
    console.log(`   Tier: ${primaryAccount.subscriptionTier} → ${duplicateTierValue > primaryTierValue ? duplicateAccount.subscriptionTier : primaryAccount.subscriptionTier}`);
    console.log(`\n✅ All data has been merged into the primary account`);
    console.log(`✅ Duplicate account (${duplicateAccount.email}) has been removed\n`);
    
  } catch (error) {
    console.error('❌ Error merging accounts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function getTierValue(tier: SubscriptionTier): number {
  const values: Record<SubscriptionTier, number> = { 
    FREE: 0, 
    TRIAL: 1,
    BASIC: 2, 
    PREMIUM: 3, 
    PRO: 4 
  };
  return values[tier] || 0;
}

// Run the merge
mergeLeeAccounts()
  .then(() => {
    console.log('✅ Merge completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Merge failed:', error);
    process.exit(1);
  });
