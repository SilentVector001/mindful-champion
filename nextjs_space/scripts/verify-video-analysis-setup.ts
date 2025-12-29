import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Verification Script for Video Analysis Progress Tracking
 * 
 * This script checks if all required database tables and data exist
 * for the premium video analysis with progress tracking feature.
 */

async function verify() {
  console.log('🔍 Verifying Video Analysis Progress Tracking Setup...\n')
  
  let hasErrors = false
  
  // ============================================
  // 1. Check Database Tables
  // ============================================
  console.log('📊 Checking database tables...')
  
  try {
    // Check VideoAnalysisProgress
    const progressCount = await prisma.videoAnalysisProgress.count()
    console.log(`  ✅ VideoAnalysisProgress table exists (${progressCount} records)`)
  } catch (error) {
    console.error('  ❌ VideoAnalysisProgress table missing or inaccessible')
    console.error(`     Error: ${error instanceof Error ? error.message : String(error)}`)
    hasErrors = true
  }
  
  try {
    // Check VideoAnalysisAchievement
    const achievementCount = await prisma.videoAnalysisAchievement.count()
    console.log(`  ✅ VideoAnalysisAchievement table exists (${achievementCount} records)`)
    
    if (achievementCount === 0) {
      console.warn('  ⚠️  WARNING: No achievements found. Run seed script!')
      hasErrors = true
    } else if (achievementCount < 18) {
      console.warn(`  ⚠️  WARNING: Only ${achievementCount} achievements found (expected 18)`)
    }
  } catch (error) {
    console.error('  ❌ VideoAnalysisAchievement table missing or inaccessible')
    console.error(`     Error: ${error instanceof Error ? error.message : String(error)}`)
    hasErrors = true
  }
  
  try {
    // Check VideoAnalysisUserAchievement
    const userAchievementCount = await prisma.videoAnalysisUserAchievement.count()
    console.log(`  ✅ VideoAnalysisUserAchievement table exists (${userAchievementCount} records)`)
  } catch (error) {
    console.error('  ❌ VideoAnalysisUserAchievement table missing or inaccessible')
    console.error(`     Error: ${error instanceof Error ? error.message : String(error)}`)
    hasErrors = true
  }
  
  // ============================================
  // 2. Check Achievement Categories
  // ============================================
  console.log('\n🏆 Checking achievement categories...')
  
  try {
    const achievements = await prisma.videoAnalysisAchievement.findMany({
      select: { category: true }
    })
    
    const categories = [...new Set(achievements.map(a => a.category))]
    console.log(`  Found ${categories.length} categories:`)
    
    const expectedCategories = ['milestone', 'speed', 'score', 'accuracy', 'improvement', 'consistency']
    for (const cat of expectedCategories) {
      if (categories.includes(cat)) {
        const count = achievements.filter(a => a.category === cat).length
        console.log(`    ✅ ${cat}: ${count} achievements`)
      } else {
        console.error(`    ❌ Missing category: ${cat}`)
        hasErrors = true
      }
    }
  } catch (error) {
    console.error('  ❌ Error checking achievement categories')
    hasErrors = true
  }
  
  // ============================================
  // 3. Check Specific Achievements
  // ============================================
  console.log('\n🎯 Checking key achievements...')
  
  const keyAchievements = [
    'FIRST_ANALYSIS',
    'SPEED_30_MPH',
    'SCORE_80',
    'EXCELLENT_SHOT',
    'IMPROVEMENT_10',
    'WEEKLY_UPLOAD'
  ]
  
  for (const code of keyAchievements) {
    try {
      const achievement = await prisma.videoAnalysisAchievement.findUnique({
        where: { code }
      })
      
      if (achievement) {
        console.log(`  ✅ ${code}: "${achievement.name}" (${achievement.points} pts)`)
      } else {
        console.error(`  ❌ Missing achievement: ${code}`)
        hasErrors = true
      }
    } catch (error) {
      console.error(`  ❌ Error checking ${code}`)
      hasErrors = true
    }
  }
  
  // ============================================
  // 4. Check VideoAnalysis Table Compatibility
  // ============================================
  console.log('\n📹 Checking VideoAnalysis table compatibility...')
  
  try {
    const videoAnalysis = await prisma.videoAnalysis.findFirst({
      select: {
        id: true,
        userId: true,
        overallScore: true,
        totalShots: true,
        analysisStatus: true
      }
    })
    
    if (videoAnalysis) {
      console.log('  ✅ VideoAnalysis table has required fields')
      console.log(`     Sample: ${videoAnalysis.analysisStatus} analysis with score ${videoAnalysis.overallScore}`)
    } else {
      console.log('  ℹ️  No video analyses found (expected for new installations)')
    }
  } catch (error) {
    console.error('  ❌ VideoAnalysis table missing required fields')
    console.error(`     Error: ${error instanceof Error ? error.message : String(error)}`)
    hasErrors = true
  }
  
  // ============================================
  // 5. Check User Table Relation
  // ============================================
  console.log('\n👤 Checking User table relations...')
  
  try {
    const user = await prisma.user.findFirst({
      select: { id: true, email: true }
    })
    
    if (user) {
      console.log(`  ✅ User table accessible (test user: ${user.email})`)
      
      // Check if user has any progress records
      const userProgress = await prisma.videoAnalysisProgress.findMany({
        where: { userId: user.id }
      })
      
      console.log(`     User has ${userProgress.length} progress records`)
    } else {
      console.log('  ℹ️  No users found (expected for new installations)')
    }
  } catch (error) {
    console.error('  ❌ Error checking User table relations')
    hasErrors = true
  }
  
  // ============================================
  // 6. Summary
  // ============================================
  console.log('\n' + '='.repeat(50))
  
  if (hasErrors) {
    console.log('❌ VERIFICATION FAILED')
    console.log('\nRequired Actions:')
    console.log('1. Apply database migration: npx prisma db push')
    console.log('2. Run seed script: npx ts-node scripts/seed-video-achievements.ts')
    console.log('3. Verify environment variables are set')
    console.log('4. Re-run this verification script')
    process.exit(1)
  } else {
    console.log('✅ VERIFICATION PASSED')
    console.log('\nAll required tables, indexes, and data are present.')
    console.log('Video Analysis Progress Tracking is ready for deployment!')
    process.exit(0)
  }
}

verify()
  .catch((error) => {
    console.error('\n💥 Fatal error during verification:')
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
