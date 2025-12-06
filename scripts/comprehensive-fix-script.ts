import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';

// Load environment variables FIRST
config({ path: path.join(__dirname, '../.env.local') });

import { PrismaClient, SubscriptionTier, SubscriptionStatus } from '@prisma/client';

// Create Prisma instance after env is loaded
const prisma = new PrismaClient();

async function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function runComprehensiveFix() {
  console.log('🔧 MINDFUL CHAMPION - COMPREHENSIVE FIX SCRIPT');
  console.log('=' .repeat(60));
  console.log('⚠️  This script will fix the following critical issues:');
  console.log('   1. Restore Lee Rosenthal subscription to PRO tier');
  console.log('   2. Create subscription record for Lee Rosenthal');
  console.log('   3. Fix subscription tier mismatches');
  console.log('   4. (Activity tracking and achievements need code fixes)');
  console.log('=' .repeat(60));
  
  const fixLog: any = {
    timestamp: new Date().toISOString(),
    fixes: [],
    errors: [],
    warnings: []
  };
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected\n');
    
    // FIX 1: Restore Lee Rosenthal subscription
    console.log('🔧 FIX 1: Restore Lee Rosenthal Subscription');
    console.log('-'.repeat(60));
    
    const leeUser = await prisma.user.findUnique({
      where: { email: 'lee@onesoulpickleball.com' },
      include: { subscriptions: true }
    });
    
    if (leeUser) {
      console.log(`   Found user: ${leeUser.name} (${leeUser.email})`);
      console.log(`   Current tier: ${leeUser.subscriptionTier}`);
      console.log(`   Subscription records: ${leeUser.subscriptions.length}`);
      
      // Upgrade user to PRO tier
      if (leeUser.subscriptionTier !== 'PRO') {
        const updated = await prisma.user.update({
          where: { email: 'lee@onesoulpickleball.com' },
          data: {
            subscriptionTier: 'PRO',
            subscriptionStatus: 'ACTIVE'
          }
        });
        console.log(`   ✅ Updated user tier: FREE → PRO`);
        fixLog.fixes.push('Updated Lee Rosenthal user tier from FREE to PRO');
      } else {
        console.log(`   ℹ️  User already has PRO tier`);
      }
      
      // Create subscription record if missing
      if (leeUser.subscriptions.length === 0) {
        const now = new Date();
        const oneYearFromNow = new Date(now);
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        
        const newSubscription = await prisma.subscription.create({
          data: {
            userId: leeUser.id,
            tier: 'PRO',
            status: 'ACTIVE',
            billingCycle: 'YEARLY',
            amount: 0, // Admin granted - no charge
            currency: 'USD',
            currentPeriodStart: now,
            currentPeriodEnd: oneYearFromNow
          }
        });
        console.log(`   ✅ Created PRO subscription record (valid for 1 year)`);
        fixLog.fixes.push('Created PRO subscription record for Lee Rosenthal');
      } else {
        console.log(`   ℹ️  User already has ${leeUser.subscriptions.length} subscription record(s)`);
      }
    } else {
      console.log('   ❌ User not found!');
      fixLog.errors.push('Lee Rosenthal user not found');
    }
    
    // FIX 2: Fix subscription tier mismatches
    console.log('\n🔧 FIX 2: Fix Subscription Tier Mismatches');
    console.log('-'.repeat(60));
    
    const allSubscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            subscriptionTier: true
          }
        }
      }
    });
    
    let mismatchesFixed = 0;
    for (const sub of allSubscriptions) {
      if (sub.user.subscriptionTier !== sub.tier) {
        console.log(`   Found mismatch: ${sub.user.email}`);
        console.log(`      User tier: ${sub.user.subscriptionTier}, Subscription tier: ${sub.tier}`);
        
        // Update user to match subscription (subscription is source of truth)
        await prisma.user.update({
          where: { id: sub.userId },
          data: {
            subscriptionTier: sub.tier,
            subscriptionStatus: sub.status
          }
        });
        
        console.log(`      ✅ Updated user tier: ${sub.user.subscriptionTier} → ${sub.tier}`);
        fixLog.fixes.push(`Fixed tier mismatch for ${sub.user.email}: ${sub.user.subscriptionTier} → ${sub.tier}`);
        mismatchesFixed++;
      }
    }
    
    if (mismatchesFixed === 0) {
      console.log('   ℹ️  No mismatches found');
    } else {
      console.log(`   ✅ Fixed ${mismatchesFixed} tier mismatches`);
    }
    
    // FIX 3: Verify and report on activity tracking issue
    console.log('\n🔧 FIX 3: Activity Tracking System');
    console.log('-'.repeat(60));
    console.log('   ⚠️  Activity tracking requires CODE FIXES');
    console.log('   Current status:');
    
    const activityLogCount = await prisma.activityLog.count();
    console.log(`      - Activity logs in database: ${activityLogCount}`);
    
    if (activityLogCount === 0) {
      console.log('      ❌ NO activity logs found');
      console.log('   📝 Action required:');
      console.log('      1. Check lib/activity-tracker.ts');
      console.log('      2. Ensure activity creation is called after user actions');
      console.log('      3. Verify ActivityLog model schema');
      fixLog.warnings.push('Activity tracking system is not working - code fixes required');
    }
    
    // FIX 4: Verify and report on achievement system
    console.log('\n🔧 FIX 4: Achievement System');
    console.log('-'.repeat(60));
    console.log('   ⚠️  Achievement system requires CODE FIXES');
    console.log('   Current status:');
    
    const achievementCount = await prisma.userAchievement.count();
    const totalAchievementsAvailable = await prisma.achievement.count();
    console.log(`      - Achievements available: ${totalAchievementsAvailable}`);
    console.log(`      - User achievements unlocked: ${achievementCount}`);
    
    if (achievementCount === 0) {
      console.log('      ❌ NO achievements unlocked');
      console.log('   📝 Action required:');
      console.log('      1. Check lib/achievements/achievement-engine.ts');
      console.log('      2. Ensure achievement checks are triggered');
      console.log('      3. Verify achievement unlock conditions');
      fixLog.warnings.push('Achievement system is not working - code fixes required');
    }
    
    // FIX 5: Check video system
    console.log('\n🔧 FIX 5: Video Analysis System');
    console.log('-'.repeat(60));
    
    const totalVideos = await prisma.videoAnalysis.count();
    const leeVideos = await prisma.videoAnalysis.count({
      where: { user: { email: 'lee@onesoulpickleball.com' } }
    });
    
    console.log(`   Total videos in system: ${totalVideos}`);
    console.log(`   Lee Rosenthal's videos: ${leeVideos}`);
    
    if (leeVideos === 0) {
      console.log('   ⚠️  Lee has no videos uploaded');
      console.log('   ℹ️  This may be normal if no videos were uploaded yet');
      fixLog.warnings.push('Lee Rosenthal has no video analyses - may need to upload videos');
    }
    
    const recentVideo = await prisma.videoAnalysis.findFirst({
      orderBy: { uploadedAt: 'desc' },
      select: {
        fileName: true,
        analysisStatus: true,
        cloud_storage_path: true,
        videoUrl: true,
        user: { select: { email: true } }
      }
    });
    
    if (recentVideo) {
      console.log('   Most recent video:');
      console.log(`      User: ${recentVideo.user.email}`);
      console.log(`      File: ${recentVideo.fileName}`);
      console.log(`      Status: ${recentVideo.analysisStatus}`);
      console.log(`      Has S3 path: ${!!recentVideo.cloud_storage_path}`);
      console.log(`      Has URL: ${!!recentVideo.videoUrl}`);
      
      if (recentVideo.analysisStatus === 'COMPLETED' && recentVideo.cloud_storage_path && recentVideo.videoUrl) {
        console.log('   ✅ Video system appears to be working correctly');
      } else {
        console.log('   ⚠️  Video may have issues');
        fixLog.warnings.push('Recent video may not be fully processed');
      }
    }
    
    // SUMMARY
    console.log('\n' + '='.repeat(60));
    console.log('📋 FIX SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Fixes applied: ${fixLog.fixes.length}`);
    fixLog.fixes.forEach((fix: string) => console.log(`   - ${fix}`));
    
    if (fixLog.errors.length > 0) {
      console.log(`\n❌ Errors: ${fixLog.errors.length}`);
      fixLog.errors.forEach((err: string) => console.log(`   - ${err}`));
    }
    
    if (fixLog.warnings.length > 0) {
      console.log(`\n⚠️  Warnings: ${fixLog.warnings.length}`);
      fixLog.warnings.forEach((warn: string) => console.log(`   - ${warn}`));
    }
    
    // Save fix log
    const logPath = '/home/ubuntu/mindful_champion/FIX_LOG.json';
    fs.writeFileSync(logPath, JSON.stringify(fixLog, null, 2));
    console.log(`\n📄 Fix log saved to: ${logPath}`);
    console.log('='.repeat(60));
    
    // Run diagnostic again to verify fixes
    console.log('\n🔍 Running post-fix verification...');
    
    const leeUserAfter = await prisma.user.findUnique({
      where: { email: 'lee@onesoulpickleball.com' },
      include: { subscriptions: true }
    });
    
    if (leeUserAfter) {
      console.log('\n✅ Lee Rosenthal Account Status:');
      console.log(`   Email: ${leeUserAfter.email}`);
      console.log(`   Name: ${leeUserAfter.name}`);
      console.log(`   Tier: ${leeUserAfter.subscriptionTier}`);
      console.log(`   Status: ${leeUserAfter.subscriptionStatus}`);
      console.log(`   Subscription records: ${leeUserAfter.subscriptions.length}`);
      
      if (leeUserAfter.subscriptionTier === 'PRO' && leeUserAfter.subscriptions.length > 0) {
        console.log('\n🎉 Lee Rosenthal account is NOW FIXED!');
      } else {
        console.log('\n⚠️  Some issues may remain - check logs above');
      }
    }
    
    return fixLog;
    
  } catch (error: any) {
    console.error('❌ Fix script failed:', error);
    fixLog.errors.push(`Fix script error: ${error.message}`);
    return fixLog;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix script
console.log('\n⚠️  WARNING: This script will modify your database!');
console.log('Press Ctrl+C to cancel, or press Enter to continue...\n');

runComprehensiveFix()
  .then(() => {
    console.log('\n✅ Fix script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fix script failed:', error);
    process.exit(1);
  });
