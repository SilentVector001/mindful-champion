import { PrismaClient, UserRole } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as readline from 'readline'

// Load environment variables
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve))
}

async function cleanupDatabase() {
  console.log('\n🚀 MINDFUL CHAMPION - DATABASE CLEANUP FOR FRESH LAUNCH')
  console.log('=' .repeat(70))
  console.log('⚠️  WARNING: This will DELETE all non-admin user data!')
  console.log('=' .repeat(70))
  console.log('\n')

  try {
    // Step 1: Identify admin users
    console.log('📊 Step 1: Identifying admin accounts...\n')
    
    const adminUsers = await prisma.user.findMany({
      where: {
        role: UserRole.ADMIN
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    })

    if (adminUsers.length === 0) {
      console.error('❌ ERROR: No admin users found! Cannot proceed without admins.')
      process.exit(1)
    }

    console.log(`✅ Found ${adminUsers.length} admin account(s) that will be PRESERVED:\n`)
    adminUsers.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.email} (${admin.firstName} ${admin.lastName})`)
      console.log(`      ID: ${admin.id}`)
      console.log(`      Created: ${admin.createdAt.toLocaleDateString()}\n`)
    })

    // Step 2: Count what will be deleted
    console.log('📊 Step 2: Analyzing data to be deleted...\n')
    
    const adminIds = adminUsers.map(u => u.id)
    
    const totalUsers = await prisma.user.count()
    const nonAdminUsers = await prisma.user.count({
      where: { role: { not: UserRole.ADMIN } }
    })

    const videoAnalyses = await prisma.VideoAnalysis.count({
      where: { userId: { notIn: adminIds } }
    })

    const sponsorApplications = await prisma.sponsorApplication.count()
    
    const subscriptions = await prisma.subscription.count({
      where: { userId: { notIn: adminIds } }
    })

    const achievements = await prisma.userAchievement.count({
      where: { userId: { notIn: adminIds } }
    })

    const matches = await prisma.match.count({
      where: {
        OR: [
          { userId: { notIn: adminIds } },
          { opponentId: { notIn: adminIds } }
        ]
      }
    })

    const trainingPlans = await prisma.trainingPlan.count({
      where: { userId: { notIn: adminIds } }
    })

    const userPrograms = await prisma.userProgram.count({
      where: { userId: { notIn: adminIds } }
    })

    console.log('📈 DELETION SUMMARY:')
    console.log(`   • Total Users: ${totalUsers}`)
    console.log(`   • Admin Users (KEEP): ${adminUsers.length}`)
    console.log(`   • Non-Admin Users (DELETE): ${nonAdminUsers}`)
    console.log(`   • Video Analyses (DELETE): ${videoAnalyses}`)
    console.log(`   • Sponsor Applications (DELETE): ${sponsorApplications}`)
    console.log(`   • Subscriptions (DELETE): ${subscriptions}`)
    console.log(`   • User Achievements (DELETE): ${achievements}`)
    console.log(`   • Matches (DELETE): ${matches}`)
    console.log(`   • Training Plans (DELETE): ${trainingPlans}`)
    console.log(`   • User Programs (DELETE): ${userPrograms}`)
    console.log('\n')

    // Step 3: Confirmation
    console.log('⚠️  FINAL CONFIRMATION REQUIRED')
    console.log('=' .repeat(70))
    const confirm1 = await question('Type "DELETE" to proceed with cleanup: ')
    
    if (confirm1.toUpperCase() !== 'DELETE') {
      console.log('\n❌ Cleanup cancelled by user.')
      rl.close()
      process.exit(0)
    }

    const confirm2 = await question('Type "CONFIRM" to double-confirm: ')
    
    if (confirm2.toUpperCase() !== 'CONFIRM') {
      console.log('\n❌ Cleanup cancelled by user.')
      rl.close()
      process.exit(0)
    }

    console.log('\n🔄 Starting cleanup process...\n')

    // Step 4: Execute deletion in correct order (respecting foreign keys)
    let deletionReport = {
      videoAnalyses: 0,
      sponsorApplications: 0,
      sponsorProfiles: 0,
      subscriptions: 0,
      subscriptionHistory: 0,
      achievements: 0,
      achievementProgress: 0,
      activities: 0,
      matches: 0,
      trainingPlans: 0,
      userPrograms: 0,
      drillCompletions: 0,
      userVideoProgress: 0,
      userAchievementStats: 0,
      skillProgress: 0,
      communityStats: 0,
      betaTesters: 0,
      offerRedemptions: 0,
      userWatchHistory: 0,
      userContentRecommendations: 0,
      promoCodes: 0,
      tierUnlocks: 0,
      users: 0
    }

    // Start transaction
    console.log('💾 Executing deletions in transaction...')
    
    await prisma.$transaction(async (tx) => {
      // Delete related data first (child tables)
      
      // Video related
      deletionReport.videoAnalyses = (await tx.videoAnalysis.deleteMany({
        where: { userId: { notIn: adminIds } }
      })).count

      deletionReport.userVideoProgress = (await tx.userVideoProgress.deleteMany({
        where: { userId: { notIn: adminIds } }
      })).count

      // Sponsor related
      deletionReport.sponsorApplications = (await tx.sponsorApplication.deleteMany()).count
      
      deletionReport.sponsorProfiles = (await tx.sponsorProfile.deleteMany({
        where: { userId: { notIn: adminIds } }
      })).count

      deletionReport.offerRedemptions = (await tx.offerRedemption.deleteMany({
        where: { userId: { notIn: adminIds } }
      })).count

      // Subscription related
      deletionReport.subscriptions = (await tx.subscription.deleteMany({
        where: { userId: { notIn: adminIds } }
      })).count

      deletionReport.subscriptionHistory = (await tx.subscriptionHistory.deleteMany({
        where: { userId: { notIn: adminIds } }
      })).count

      // Achievement related
      deletionReport.achievements = (await tx.userAchievement.deleteMany({
        where: { userId: { notIn: adminIds } }
      })).count

      deletionReport.achievementProgress = (await tx.achievementProgress.deleteMany({
        where: { userId: { notIn: adminIds } }
      })).count

      deletionReport.userAchievementStats = (await tx.userAchievementStats.deleteMany({
        where: { userId: { notIn: adminIds } }
      })).count

      // Activity tracking
      deletionReport.activities = (await tx.activity.deleteMany({
        where: { userId: { notIn: adminIds } }
      })).count

      // Matches
      deletionReport.matches = (await tx.match.deleteMany({
        where: {
          OR: [
            { userId: { notIn: adminIds } },
            { opponentId: { notIn: adminIds } }
          ]
        }
      })).count

      // Training related
      deletionReport.trainingPlans = (await tx.trainingPlan.deleteMany({
        where: { userId: { notIn: adminIds } }
      })).count

      deletionReport.userPrograms = (await tx.userProgram.deleteMany({
        where: { userId: { notIn: adminIds } }
      })).count

      deletionReport.drillCompletions = (await tx.drillCompletion.deleteMany({
        where: { userId: { notIn: adminIds } }
      })).count

      // Progress tracking
      deletionReport.skillProgress = (await tx.skillProgress.deleteMany({
        where: { userId: { notIn: adminIds } }
      })).count

      deletionReport.communityStats = (await tx.communityStats.deleteMany({
        where: { userId: { notIn: adminIds } }
      })).count

      // Beta testing
      deletionReport.betaTesters = (await tx.betaTester.deleteMany({
        where: { userId: { notIn: adminIds } }
      })).count

      // Media center
      deletionReport.userWatchHistory = (await tx.userWatchHistory.deleteMany({
        where: { userId: { notIn: adminIds } }
      })).count

      deletionReport.userContentRecommendations = (await tx.userContentRecommendation.deleteMany({
        where: { userId: { notIn: adminIds } }
      })).count

      // Promo codes (reset redemptions)
      deletionReport.promoCodes = (await tx.promoCode.updateMany({
        where: { redeemedBy: { hasSome: { notIn: adminIds } } },
        data: {
          timesRedeemed: 0,
          redeemedBy: [],
          status: 'ACTIVE'
        }
      })).count

      // Tier unlocks
      deletionReport.tierUnlocks = (await tx.tierUnlock.deleteMany({
        where: { userId: { notIn: adminIds } }
      })).count

      // Finally, delete non-admin users
      deletionReport.users = (await tx.user.deleteMany({
        where: { role: { not: UserRole.ADMIN } }
      })).count

    }, {
      timeout: 60000 // 60 second timeout
    })

    console.log('\n✅ Cleanup completed successfully!\n')

    // Step 5: Verification
    console.log('🔍 Step 5: Verifying cleanup...\n')

    const remainingUsers = await prisma.user.count()
    const remainingAdmins = await prisma.user.count({
      where: { role: UserRole.ADMIN }
    })
    const remainingNonAdmins = await prisma.user.count({
      where: { role: { not: UserRole.ADMIN } }
    })

    console.log('✅ VERIFICATION RESULTS:')
    console.log(`   • Remaining Users: ${remainingUsers}`)
    console.log(`   • Remaining Admins: ${remainingAdmins}`)
    console.log(`   • Remaining Non-Admins: ${remainingNonAdmins}`)
    console.log('\n')

    // Step 6: Final Report
    console.log('📊 DETAILED DELETION REPORT')
    console.log('=' .repeat(70))
    console.log(`✅ Users Deleted: ${deletionReport.users}`)
    console.log(`✅ Video Analyses Deleted: ${deletionReport.videoAnalyses}`)
    console.log(`✅ Sponsor Applications Deleted: ${deletionReport.sponsorApplications}`)
    console.log(`✅ Sponsor Profiles Deleted: ${deletionReport.sponsorProfiles}`)
    console.log(`✅ Subscriptions Deleted: ${deletionReport.subscriptions}`)
    console.log(`✅ Subscription History Deleted: ${deletionReport.subscriptionHistory}`)
    console.log(`✅ User Achievements Deleted: ${deletionReport.achievements}`)
    console.log(`✅ Achievement Progress Deleted: ${deletionReport.achievementProgress}`)
    console.log(`✅ User Achievement Stats Deleted: ${deletionReport.userAchievementStats}`)
    console.log(`✅ Activities Deleted: ${deletionReport.activities}`)
    console.log(`✅ Matches Deleted: ${deletionReport.matches}`)
    console.log(`✅ Training Plans Deleted: ${deletionReport.trainingPlans}`)
    console.log(`✅ User Programs Deleted: ${deletionReport.userPrograms}`)
    console.log(`✅ Drill Completions Deleted: ${deletionReport.drillCompletions}`)
    console.log(`✅ User Video Progress Deleted: ${deletionReport.userVideoProgress}`)
    console.log(`✅ Skill Progress Deleted: ${deletionReport.skillProgress}`)
    console.log(`✅ Community Stats Deleted: ${deletionReport.communityStats}`)
    console.log(`✅ Beta Testers Deleted: ${deletionReport.betaTesters}`)
    console.log(`✅ Offer Redemptions Deleted: ${deletionReport.offerRedemptions}`)
    console.log(`✅ Watch History Deleted: ${deletionReport.userWatchHistory}`)
    console.log(`✅ Content Recommendations Deleted: ${deletionReport.userContentRecommendations}`)
    console.log(`✅ Promo Codes Reset: ${deletionReport.promoCodes}`)
    console.log(`✅ Tier Unlocks Deleted: ${deletionReport.tierUnlocks}`)
    console.log('=' .repeat(70))

    const totalDeleted = Object.values(deletionReport).reduce((sum, val) => sum + val, 0)
    console.log(`\n🎯 TOTAL RECORDS DELETED: ${totalDeleted}`)
    console.log(`\n🛡️  ADMIN ACCOUNTS PRESERVED: ${adminUsers.length}`)
    
    adminUsers.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.email}`)
    })

    console.log('\n✅ DATABASE IS NOW READY FOR FRESH DECEMBER 1 LAUNCH! 🚀\n')

  } catch (error) {
    console.error('\n❌ ERROR during cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
    rl.close()
  }
}

// Run the cleanup
cleanupDatabase()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
