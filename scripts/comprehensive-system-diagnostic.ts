import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables FIRST
config({ path: path.join(__dirname, '../.env.local') });

import { PrismaClient } from '@prisma/client';

// Create Prisma instance after env is loaded
const prisma = new PrismaClient();

async function runComprehensiveDiagnostic() {
  console.log('🔍 MINDFUL CHAMPION - COMPREHENSIVE SYSTEM DIAGNOSTIC');
  console.log('=' .repeat(60));
  
  const report: any = {
    timestamp: new Date().toISOString(),
    database: {},
    users: {},
    subscriptions: {},
    videos: {},
    activities: {},
    achievements: {},
    emails: {},
    sponsors: {},
    issues: [] as string[],
    recommendations: [] as string[]
  };
  
  try {
    // 1. DATABASE CONNECTION
    console.log('\n📊 Checking Database Connection...');
    try {
      await prisma.$connect();
      report.database.status = 'CONNECTED';
      report.database.url = process.env.DATABASE_URL?.split('@')[1] || 'Unknown';
      console.log('✅ Database connected');
    } catch (error: any) {
      report.database.status = 'FAILED';
      report.database.error = error.message;
      report.issues.push('Database connection failed');
      console.log('❌ Database connection failed:', error.message);
    }
    
    // 2. USER DATA
    console.log('\n👥 Checking User Data...');
    const totalUsers = await prisma.user.count();
    const allUsersWithSubs = await prisma.user.findMany({
      include: {
        subscriptions: true
      }
    });
    const usersWithSubscriptions = allUsersWithSubs.filter(u => u.subscriptions.length > 0).length;
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, createdAt: true, subscriptionTier: true }
    });
    
    report.users = {
      total: totalUsers,
      withSubscriptions: usersWithSubscriptions,
      recent: recentUsers
    };
    
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   With Subscriptions: ${usersWithSubscriptions}`);
    
    if (totalUsers === 0) {
      report.issues.push('NO USERS FOUND - Database may be empty or wrong database');
    }
    
    // 3. CHECK SPECIFIC USER: lee@onesoulpickleball.com
    console.log('\n🎯 Checking Specific User: lee@onesoulpickleball.com');
    const leeUser = await prisma.user.findUnique({
      where: { email: 'lee@onesoulpickleball.com' },
      include: { 
        subscriptions: true,
        _count: {
          select: {
            videoAnalyses: true,
            userAchievements: true,
            practiceLogs: true
          }
        }
      }
    });
    
    if (leeUser) {
      console.log(`   ✅ User found: ${leeUser.name} (${leeUser.email})`);
      console.log(`   Current Tier: ${leeUser.subscriptionTier}`);
      console.log(`   Subscription Records: ${leeUser.subscriptions.length}`);
      if (leeUser.subscriptions.length > 0) {
        console.log(`   Latest Subscription: ${leeUser.subscriptions[0].tier} (${leeUser.subscriptions[0].status})`);
      }
      console.log(`   Video Analyses: ${leeUser._count.videoAnalyses}`);
      console.log(`   Practice Logs: ${leeUser._count.practiceLogs}`);
      console.log(`   Achievements: ${leeUser._count.userAchievements}`);
      
      const latestSub = leeUser.subscriptions[0];
      report.subscriptions.leeRosenthal = {
        found: true,
        userId: leeUser.id,
        tier: leeUser.subscriptionTier,
        subscriptionExists: leeUser.subscriptions.length > 0,
        subscriptionCount: leeUser.subscriptions.length,
        subscriptionTier: latestSub?.tier || 'NONE',
        subscriptionStatus: latestSub?.status || 'NONE',
        videoCount: leeUser._count.videoAnalyses,
        practiceLogCount: leeUser._count.practiceLogs,
        achievementCount: leeUser._count.userAchievements,
        expected: 'PRO or PREMIUM'
      };
      
      if (leeUser.subscriptionTier === 'FREE') {
        report.issues.push('🚨 CRITICAL: Lee Rosenthal downgraded from PRO/PREMIUM to FREE');
        console.log('   ❌ ISSUE: User tier is FREE (should be PRO/PREMIUM)');
      }
      
      if (leeUser.subscriptions.length === 0) {
        report.issues.push('🚨 CRITICAL: Lee Rosenthal has no subscription records');
        console.log('   ❌ ISSUE: No subscription records found');
      }
      
      if (leeUser._count.videoAnalyses === 0) {
        report.issues.push('Lee Rosenthal has NO video analyses');
        console.log('   ❌ ISSUE: No video analyses recorded');
      }
    } else {
      console.log('   ❌ User NOT found');
      report.subscriptions.leeRosenthal = {
        found: false
      };
      report.issues.push('Lee Rosenthal user account not found');
    }
    
    // 4. SUBSCRIPTIONS
    console.log('\n💳 Checking All Subscriptions...');
    const subscriptions = await prisma.subscription.findMany({
      include: { 
        user: { 
          select: { 
            email: true, 
            name: true, 
            subscriptionTier: true 
          } 
        } 
      }
    });
    
    const subscriptionsByTier = {
      FREE: subscriptions.filter(s => s.tier === 'FREE').length,
      TRIAL: subscriptions.filter(s => s.tier === 'TRIAL').length,
      BASIC: subscriptions.filter(s => s.tier === 'BASIC').length,
      PRO: subscriptions.filter(s => s.tier === 'PRO').length,
      PREMIUM: subscriptions.filter(s => s.tier === 'PREMIUM').length
    };
    
    report.subscriptions = {
      ...report.subscriptions,
      total: subscriptions.length,
      byTier: subscriptionsByTier,
      active: subscriptions.filter(s => s.status === 'ACTIVE').length,
      details: subscriptions.map(s => ({
        user: s.user.email,
        userTier: s.user.subscriptionTier,
        subscriptionTier: s.tier,
        status: s.status,
        match: s.user.subscriptionTier === s.tier ? 'MATCH' : '❌ MISMATCH'
      }))
    };
    
    console.log(`   Total Subscription Records: ${subscriptions.length}`);
    console.log(`   Active Subscriptions: ${subscriptions.filter(s => s.status === 'ACTIVE').length}`);
    console.log(`   By Tier:`, subscriptionsByTier);
    
    // Check for mismatches
    const mismatches = subscriptions.filter(s => s.user.subscriptionTier !== s.tier);
    if (mismatches.length > 0) {
      report.issues.push(`${mismatches.length} users have mismatched subscription tiers`);
      console.log(`   ❌ ISSUE: ${mismatches.length} tier mismatches found`);
      mismatches.forEach(m => {
        console.log(`      ${m.user.email}: User=${m.user.subscriptionTier}, Sub=${m.tier}`);
      });
    }
    
    // 5. VIDEO ANALYSES
    console.log('\n🎥 Checking Video Analyses...');
    const videos = await prisma.VideoAnalysis.findMany({
      orderBy: { uploadedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        fileName: true,
        videoUrl: true,
        cloud_storage_path: true,
        analysisStatus: true,
        uploadedAt: true,
        user: {
          select: {
            email: true
          }
        }
      }
    });
    
    const totalVideos = await prisma.VideoAnalysis.count();
    const allVideos = await prisma.VideoAnalysis.findMany({
      select: {
        cloud_storage_path: true,
        videoUrl: true
      }
    });
    const videosWithS3 = allVideos.filter(v => v.cloud_storage_path !== null).length;
    const videosWithUrl = allVideos.filter(v => v.videoUrl !== null).length;
    
    report.videos = {
      total: totalVideos,
      withS3Path: videosWithS3,
      withUrl: videosWithUrl,
      recent: videos.map(v => ({
        id: v.id,
        user: v.user.email,
        fileName: v.fileName,
        hasS3Path: !!v.cloud_storage_path,
        hasUrl: !!v.videoUrl,
        status: v.analysisStatus,
        uploadedAt: v.uploadedAt
      }))
    };
    
    console.log(`   Total Videos: ${totalVideos}`);
    console.log(`   With S3 Path: ${videosWithS3}`);
    console.log(`   With URL: ${videosWithUrl}`);
    
    if (totalVideos === 0) {
      report.issues.push('NO VIDEO ANALYSES FOUND');
    }
    
    if (videosWithS3 === 0 && totalVideos > 0) {
      report.issues.push('Videos exist but NONE have S3 cloud storage paths');
    }
    
    // 6. ACTIVITY LOGS
    console.log('\n📈 Checking Activity Logs...');
    try {
      const totalActivities = await prisma.activityLog.count();
      const activities = await prisma.activityLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 20
      });
      
      report.activities = {
        total: totalActivities,
        recent: activities.slice(0, 10).map(a => ({
          userId: a.userId,
          action: a.action,
          details: a.details,
          timestamp: a.timestamp
        }))
      };
      
      console.log(`   Total Activity Logs: ${totalActivities}`);
      
      if (totalActivities === 0) {
        report.issues.push('NO ACTIVITY LOGS FOUND - Activity tracking may not be working');
      }
    } catch (error: any) {
      console.log('   ⚠️ Could not query activity logs:', error.message);
      report.activities = {
        error: error.message
      };
    }
    
    // 7. ACHIEVEMENTS
    console.log('\n🏆 Checking Achievements...');
    const totalAchievements = await prisma.userAchievement.count();
    const recentAchievements = await prisma.userAchievement.findMany({
      take: 10,
      orderBy: { unlockedAt: 'desc' },
      include: {
        user: { select: { email: true } },
        achievement: { select: { name: true, tier: true } }
      }
    });
    
    report.achievements = {
      total: totalAchievements,
      recent: recentAchievements.map(a => ({
        user: a.user.email,
        achievement: a.achievement.name,
        tier: a.achievement.tier,
        unlockedAt: a.unlockedAt
      }))
    };
    
    console.log(`   Total Achievements Unlocked: ${totalAchievements}`);
    
    if (totalAchievements === 0) {
      report.issues.push('NO ACHIEVEMENTS RECORDED - Achievement system not working');
    }
    
    // 8. EMAIL NOTIFICATIONS
    console.log('\n📧 Checking Email System...');
    const totalEmails = await prisma.emailNotification.count();
    const emails = await prisma.emailNotification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    
    const emailStats = {
      sent: emails.filter(e => e.status === 'SENT').length,
      failed: emails.filter(e => e.status === 'FAILED').length,
      pending: emails.filter(e => e.status === 'PENDING').length
    };
    
    report.emails = {
      total: totalEmails,
      ...emailStats,
      recent: emails.slice(0, 5).map(e => ({
        to: e.recipientEmail,
        type: e.type,
        status: e.status,
        createdAt: e.createdAt,
        sentAt: e.sentAt
      })),
      resendConfigured: !!process.env.RESEND_API_KEY
    };
    
    console.log(`   Total Emails: ${totalEmails}`);
    console.log(`   Sent: ${emailStats.sent}, Failed: ${emailStats.failed}, Pending: ${emailStats.pending}`);
    console.log(`   Resend API Key: ${process.env.RESEND_API_KEY ? 'CONFIGURED' : 'MISSING'}`);
    
    if (!process.env.RESEND_API_KEY) {
      report.issues.push('RESEND_API_KEY not configured - Emails cannot be sent');
    }
    
    // 9. SPONSOR APPLICATIONS
    console.log('\n🤝 Checking Sponsor System...');
    const totalSponsors = await prisma.sponsorApplication.count();
    const sponsors = await prisma.sponsorApplication.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    report.sponsors = {
      total: totalSponsors,
      pending: sponsors.filter(s => s.status === 'PENDING').length,
      approved: sponsors.filter(s => s.status === 'APPROVED').length,
      recent: sponsors.slice(0, 5).map(s => ({
        company: s.companyName,
        status: s.status,
        createdAt: s.createdAt
      }))
    };
    
    console.log(`   Total Applications: ${totalSponsors}`);
    
    // 10. GENERATE RECOMMENDATIONS
    console.log('\n💡 Generating Recommendations...');
    
    if (report.issues.length === 0) {
      report.recommendations.push('✅ All systems appear to be functioning normally');
    } else {
      // Prioritize issues
      if (report.issues.includes('NO USERS FOUND - Database may be empty or wrong database')) {
        report.recommendations.push('🚨 CRITICAL: Check database connection - may be connected to wrong database');
      }
      
      if (report.issues.some((i: string) => i.includes('Lee Rosenthal downgraded'))) {
        report.recommendations.push('🚨 CRITICAL: Restore Lee Rosenthal subscription to PRO/PREMIUM tier immediately');
        report.recommendations.push('   - Run: UPDATE "User" SET "subscriptionTier" = \'PRO\' WHERE email = \'lee@onesoulpickleball.com\'');
      }
      
      if (report.issues.some((i: string) => i.includes('no subscription record'))) {
        report.recommendations.push('🚨 CRITICAL: Create subscription record for Lee Rosenthal');
        report.recommendations.push('   - Subscription table may be missing or corrupted');
      }
      
      if (report.issues.includes('NO USER ACTIVITIES FOUND - Activity tracking not working')) {
        report.recommendations.push('🔧 Fix activity tracking system in lib/activity-tracker.ts');
        report.recommendations.push('   - Check if activity creation is being called correctly');
      }
      
      if (report.issues.includes('NO ACHIEVEMENTS RECORDED - Achievement system not working')) {
        report.recommendations.push('🔧 Fix achievement system in lib/achievements/achievement-engine.ts');
        report.recommendations.push('   - Check if achievement checks are being triggered');
      }
      
      if (report.issues.includes('RESEND_API_KEY not configured - Emails cannot be sent')) {
        report.recommendations.push('⚙️ Configure RESEND_API_KEY in .env.local');
      }
      
      if (report.issues.some((i: string) => i.includes('S3 cloud storage'))) {
        report.recommendations.push('🔧 Check AWS S3 configuration for video storage');
        report.recommendations.push('   - Verify AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION');
      }
      
      if (report.issues.some((i: string) => i.includes('tier mismatches'))) {
        report.recommendations.push('🔧 Fix subscription tier mismatches');
        report.recommendations.push('   - User.subscriptionTier should match Subscription.tier');
      }
    }
    
    // 11. PRINT REPORT
    console.log('\n' + '='.repeat(60));
    console.log('📋 DIAGNOSTIC REPORT SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\n✅ Database: ${report.database.status}`);
    console.log(`👥 Users: ${report.users.total}`);
    console.log(`💳 Subscriptions: ${report.subscriptions.total}`);
    console.log(`🎥 Videos: ${report.videos.total}`);
    console.log(`📈 Activities: ${report.activities.total}`);
    console.log(`🏆 Achievements: ${report.achievements.total}`);
    console.log(`📧 Emails: ${report.emails.total}`);
    console.log(`🤝 Sponsors: ${report.sponsors.total}`);
    
    console.log(`\n🚨 Issues Found: ${report.issues.length}`);
    report.issues.forEach((issue: string) => console.log(`   - ${issue}`));
    
    console.log(`\n💡 Recommendations: ${report.recommendations.length}`);
    report.recommendations.forEach((rec: string) => console.log(`   ${rec}`));
    
    // Save report to file
    const reportPath = '/home/ubuntu/mindful_champion/SYSTEM_DIAGNOSTIC_REPORT.json';
    fs.writeFileSync(
      reportPath,
      JSON.stringify(report, null, 2)
    );
    
    console.log(`\n📄 Full report saved to: ${reportPath}`);
    console.log('='.repeat(60));
    
    return report;
    
  } catch (error: any) {
    console.error('❌ Diagnostic failed:', error);
    report.issues.push(`Diagnostic script error: ${error.message}`);
    return report;
  } finally {
    await prisma.$disconnect();
  }
}

runComprehensiveDiagnostic()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Diagnostic failed:', error);
    process.exit(1);
  });
