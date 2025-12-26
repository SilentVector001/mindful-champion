import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const videoAchievements = [
  // Milestone achievements
  { code: 'FIRST_ANALYSIS', name: 'First Steps', description: 'Complete your first video analysis', icon: 'Video', category: 'milestone', threshold: 1, thresholdType: 'count', points: 25 },
  { code: 'FIVE_ANALYSES', name: 'Getting Serious', description: 'Complete 5 video analyses', icon: 'TrendingUp', category: 'milestone', threshold: 5, thresholdType: 'count', points: 50 },
  { code: 'TEN_ANALYSES', name: 'Dedicated Player', description: 'Complete 10 video analyses', icon: 'Trophy', category: 'milestone', threshold: 10, thresholdType: 'count', points: 100 },
  { code: 'TWENTY_FIVE_ANALYSES', name: 'Analysis Pro', description: 'Complete 25 video analyses', icon: 'Crown', category: 'milestone', threshold: 25, thresholdType: 'count', points: 250 },
  
  // Speed achievements
  { code: 'SPEED_30_MPH', name: 'Speed Demon', description: 'Hit a shot over 30 MPH', icon: 'Zap', category: 'speed', threshold: 30, thresholdType: 'speed', points: 30 },
  { code: 'SPEED_40_MPH', name: 'Power Player', description: 'Hit a shot over 40 MPH', icon: 'Zap', category: 'speed', threshold: 40, thresholdType: 'speed', points: 50 },
  { code: 'SPEED_50_MPH', name: 'Cannon Arm', description: 'Hit a shot over 50 MPH', icon: 'Zap', category: 'speed', threshold: 50, thresholdType: 'speed', points: 100 },
  
  // Score achievements
  { code: 'SCORE_80', name: 'Solid Technique', description: 'Achieve an overall score of 80+', icon: 'Target', category: 'score', threshold: 80, thresholdType: 'score', points: 40 },
  { code: 'SCORE_90', name: 'Elite Form', description: 'Achieve an overall score of 90+', icon: 'Target', category: 'score', threshold: 90, thresholdType: 'score', points: 75 },
  { code: 'SCORE_95', name: 'Pro Level', description: 'Achieve an overall score of 95+', icon: 'Target', category: 'score', threshold: 95, thresholdType: 'score', points: 150 },
  
  // Accuracy achievements
  { code: 'EXCELLENT_SHOT', name: 'Perfect Shot', description: 'Score "Excellent" on any shot', icon: 'Star', category: 'accuracy', threshold: 1, thresholdType: 'count', points: 15 },
  { code: 'FIVE_EXCELLENT_SHOTS', name: 'Hot Streak', description: 'Score "Excellent" on 5 shots in one video', icon: 'Star', category: 'accuracy', threshold: 5, thresholdType: 'count', points: 50 },
  { code: 'ALL_EXCELLENT', name: 'Flawless Performance', description: 'Score "Excellent" on every shot in a video', icon: 'Medal', category: 'accuracy', threshold: 100, thresholdType: 'percentage', points: 200 },
  
  // Improvement achievements
  { code: 'IMPROVEMENT_10', name: 'Getting Better', description: '10% improvement from your first analysis', icon: 'TrendingUp', category: 'improvement', threshold: 10, thresholdType: 'percentage', points: 40 },
  { code: 'IMPROVEMENT_25', name: 'Major Progress', description: '25% improvement from your first analysis', icon: 'TrendingUp', category: 'improvement', threshold: 25, thresholdType: 'percentage', points: 100 },
  { code: 'IMPROVEMENT_50', name: 'Transformation', description: '50% improvement from your first analysis', icon: 'TrendingUp', category: 'improvement', threshold: 50, thresholdType: 'percentage', points: 250 },
  
  // Consistency achievements
  { code: 'WEEKLY_UPLOAD', name: 'Weekly Warrior', description: 'Upload videos 3 weeks in a row', icon: 'Calendar', category: 'consistency', threshold: 3, thresholdType: 'count', points: 60 },
  { code: 'MONTHLY_UPLOAD', name: 'Monthly Dedication', description: 'Upload at least 4 videos in a month', icon: 'Calendar', category: 'consistency', threshold: 4, thresholdType: 'count', points: 80 },
]

async function seed() {
  console.log('🎯 Seeding video analysis achievements...')
  
  for (const achievement of videoAchievements) {
    await prisma.videoAnalysisAchievement.upsert({
      where: { code: achievement.code },
      update: achievement,
      create: achievement
    })
    console.log(`  ✓ ${achievement.name}`)
  }
  
  console.log('✅ Video analysis achievements seeded!')
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
