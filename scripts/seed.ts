import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const achievements = [
  // Bronze Tier - Beginner Achievements
  {
    achievementId: "first_serve",
    name: "First Serve",
    description: "Complete your first training session",
    type: "TRAINING_COMPLETION",
    tier: "BRONZE",
    category: "GENERAL",
    points: 10,
    icon: "🏓",
    requirement: { count: 1, type: "training_sessions" },
    rarity: "common",
    order: 1,
  },
  {
    achievementId: "serve_starter",
    name: "Serve Starter",
    description: "Practice serving techniques for the first time",
    type: "SKILL_MASTERY",
    tier: "BRONZE",
    category: "SERVING",
    points: 15,
    icon: "⚡",
    requirement: { count: 1, type: "serve_practice" },
    rarity: "common",
    order: 2,
  },
  {
    achievementId: "dink_beginner",
    name: "Dink Beginner",
    description: "Master the basics of dinking",
    type: "SKILL_MASTERY",
    tier: "BRONZE",
    category: "DINKING",
    points: 15,
    icon: "🏓",
    requirement: { count: 5, type: "dink_drills" },
    rarity: "common",
    order: 3,
  },
  {
    achievementId: "video_rookie",
    name: "Video Upload Rookie",
    description: "Upload your first video for analysis",
    type: "MILESTONE",
    tier: "BRONZE",
    category: "GENERAL",
    points: 20,
    icon: "📹",
    requirement: { count: 1, type: "video_uploads" },
    rarity: "common",
    order: 4,
  },
  {
    achievementId: "early_bird",
    name: "Early Bird",
    description: "Train for 3 consecutive days",
    type: "STREAK",
    tier: "BRONZE",
    category: "GENERAL",
    points: 25,
    icon: "🌅",
    requirement: { count: 3, type: "consecutive_days" },
    rarity: "common",
    order: 5,
  },

  // Silver Tier - Intermediate Achievements
  {
    achievementId: "serve_specialist",
    name: "Serve Specialist",
    description: "Complete 20 serving drills",
    type: "SKILL_MASTERY",
    tier: "SILVER",
    category: "SERVING",
    points: 50,
    icon: "🎯",
    requirement: { count: 20, type: "serve_drills" },
    rarity: "uncommon",
    order: 6,
  },
  {
    achievementId: "dink_master",
    name: "Dink Master",
    description: "Execute 100 successful dinks",
    type: "SKILL_MASTERY",
    tier: "SILVER",
    category: "DINKING",
    points: 75,
    icon: "✨",
    requirement: { count: 100, type: "successful_dinks" },
    rarity: "uncommon",
    order: 7,
  },
  {
    achievementId: "third_shot_specialist",
    name: "Third Shot Specialist",
    description: "Master the third shot drop",
    type: "SKILL_MASTERY",
    tier: "SILVER",
    category: "THIRD_SHOT",
    points: 75,
    icon: "🎪",
    requirement: { count: 50, type: "third_shot_drops" },
    rarity: "uncommon",
    order: 8,
  },
  {
    achievementId: "video_analyst",
    name: "Video Analyst",
    description: "Upload and analyze 5 videos",
    type: "MILESTONE",
    tier: "SILVER",
    category: "GENERAL",
    points: 75,
    icon: "🎬",
    requirement: { count: 5, type: "video_uploads" },
    rarity: "uncommon",
    order: 9,
  },
  {
    achievementId: "consistent_player",
    name: "Consistent Player",
    description: "Train for 7 consecutive days",
    type: "STREAK",
    tier: "SILVER",
    category: "GENERAL",
    points: 50,
    icon: "📅",
    requirement: { count: 7, type: "consecutive_days" },
    rarity: "uncommon",
    order: 10,
  },
  {
    achievementId: "footwork_fundamentals",
    name: "Footwork Fundamentals",
    description: "Complete 25 footwork drills",
    type: "SKILL_MASTERY",
    tier: "SILVER",
    category: "FOOTWORK",
    points: 60,
    icon: "👟",
    requirement: { count: 25, type: "footwork_drills" },
    rarity: "uncommon",
    order: 11,
  },

  // Gold Tier - Advanced Achievements
  {
    achievementId: "serve_expert",
    name: "Serve Expert",
    description: "Complete 100 serving drills with 85%+ accuracy",
    type: "SKILL_MASTERY",
    tier: "GOLD",
    category: "SERVING",
    points: 200,
    icon: "🌟",
    requirement: { count: 100, type: "serve_drills", accuracy: 85 },
    rarity: "rare",
    order: 12,
  },
  {
    achievementId: "volley_virtuoso",
    name: "Volley Virtuoso",
    description: "Master volleys with exceptional control",
    type: "SKILL_MASTERY",
    tier: "GOLD",
    category: "VOLLEY",
    points: 250,
    icon: "⚔️",
    requirement: { count: 100, type: "successful_volleys" },
    rarity: "rare",
    order: 13,
  },
  {
    achievementId: "strategy_master",
    name: "Strategy Master",
    description: "Win 20 matches with strategic play",
    type: "MATCH_VICTORY",
    tier: "GOLD",
    category: "STRATEGY",
    points: 300,
    icon: "🧠",
    requirement: { count: 20, type: "strategic_wins" },
    rarity: "rare",
    order: 14,
  },
  {
    achievementId: "mental_champion",
    name: "Mental Champion",
    description: "Maintain focus and composure in 50 matches",
    type: "SKILL_MASTERY",
    tier: "GOLD",
    category: "MENTAL_GAME",
    points: 350,
    icon: "🧘",
    requirement: { count: 50, type: "mental_game_wins" },
    rarity: "rare",
    order: 15,
  },
  {
    achievementId: "video_pro",
    name: "Video Pro",
    description: "Upload and analyze 20 videos",
    type: "MILESTONE",
    tier: "GOLD",
    category: "GENERAL",
    points: 250,
    icon: "🎥",
    requirement: { count: 20, type: "video_uploads" },
    rarity: "rare",
    order: 16,
  },
  {
    achievementId: "dedicated_athlete",
    name: "Dedicated Athlete",
    description: "Train for 30 consecutive days",
    type: "STREAK",
    tier: "GOLD",
    category: "GENERAL",
    points: 200,
    icon: "🔥",
    requirement: { count: 30, type: "consecutive_days" },
    rarity: "rare",
    order: 17,
  },

  // Badge Tier - Special Recognition
  {
    achievementId: "community_champion",
    name: "Community Champion",
    description: "Actively engage with the Mindful Champion community",
    type: "COMMUNITY",
    tier: "BADGE",
    category: "GENERAL",
    points: 100,
    icon: "👥",
    requirement: { count: 50, type: "community_interactions" },
    rarity: "special",
    order: 18,
  },
  {
    achievementId: "advanced_techniques",
    name: "Advanced Techniques",
    description: "Master advanced pickleball techniques",
    type: "SKILL_MASTERY",
    tier: "BADGE",
    category: "ADVANCED_TECHNIQUES",
    points: 400,
    icon: "🎭",
    requirement: { count: 10, type: "advanced_skills" },
    rarity: "special",
    order: 19,
  },
  {
    achievementId: "skill_level_pro",
    name: "Skill Level Pro",
    description: "Achieve professional skill level rating",
    type: "MILESTONE",
    tier: "BADGE",
    category: "SKILL_LEVEL",
    points: 500,
    icon: "🏅",
    requirement: { count: 1, type: "skill_level", level: 4.5 },
    rarity: "epic",
    order: 20,
  },

  // Crown Tier - Ultimate Mastery
  {
    achievementId: "mindful_champion",
    name: "Mindful Champion",
    description: "The ultimate achievement - Master all aspects of pickleball",
    type: "SPECIAL",
    tier: "CROWN",
    category: "ULTIMATE",
    points: 2000,
    icon: "👑",
    requirement: { count: 1, type: "all_achievements", percentage: 90 },
    rarity: "legendary",
    order: 21,
  },
  {
    achievementId: "year_of_excellence",
    name: "Year of Excellence",
    description: "Train for 365 consecutive days",
    type: "STREAK",
    tier: "CROWN",
    category: "GENERAL",
    points: 2500,
    icon: "🌈",
    requirement: { count: 365, type: "consecutive_days" },
    rarity: "legendary",
    order: 22,
  },
  {
    achievementId: "multi_section_master",
    name: "Multi-Section Master",
    description: "Achieve mastery in all skill categories",
    type: "MILESTONE",
    tier: "CROWN",
    category: "MULTI_SECTION",
    points: 3000,
    icon: "💎",
    requirement: { count: 5, type: "category_mastery" },
    rarity: "legendary",
    order: 23,
  },
  {
    achievementId: "legend_status",
    name: "Legend Status",
    description: "Accumulate 10,000 achievement points",
    type: "MILESTONE",
    tier: "CROWN",
    category: "GENERAL",
    points: 1000,
    icon: "🎖️",
    requirement: { count: 10000, type: "total_points" },
    rarity: "legendary",
    order: 24,
  },
]

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing achievements
  console.log('Clearing existing achievements...')
  await prisma.achievement.deleteMany({})

  // Seed achievements
  console.log('Seeding achievements...')
  for (const achievement of achievements) {
    await prisma.achievement.create({
      data: achievement,
    })
  }

  console.log(`✅ Seeded ${achievements.length} achievements`)
  
  // Show summary by tier
  const summary = await prisma.achievement.groupBy({
    by: ['tier'],
    _count: true,
  })
  
  console.log('\n📊 Achievement Summary:')
  summary.forEach(({ tier, _count }) => {
    console.log(`   ${tier}: ${_count} achievements`)
  })

  console.log('\n✨ Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
