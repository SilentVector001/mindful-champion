import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Map JSON categories to Prisma enum values
const categoryMap: Record<string, string> = {
  'Warm-up & Conditioning': 'WARMUP_CONDITIONING',
  'Footwork & Movement': 'FOOTWORK_MOVEMENT',
  'Dinking Drills': 'DINKING',
  'Serving & Return Drills': 'SERVING_RETURN',
  'Volley Drills': 'VOLLEY',
  'Third Shot Drops': 'THIRD_SHOT_DROP',
  'Overhead & Lob Drills': 'OVERHEAD_LOB',
  'Strategy & Positioning': 'STRATEGY_POSITIONING',
  'Partner/Team Drills': 'PARTNER_TEAM',
  'Solo Practice Drills': 'SOLO_PRACTICE',
  'Cool-down & Recovery': 'COOLDOWN_RECOVERY',
}

const difficultyMap: Record<string, string> = {
  'beginner': 'BEGINNER',
  'intermediate': 'INTERMEDIATE',
  'advanced': 'ADVANCED',
  'pro': 'PRO',
}

async function main() {
  console.log('🏓 Starting drill database seeding...')

  // Read the JSON file
  const jsonPath = path.join(process.cwd(), 'data', 'pickleball_drills.json')
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

  console.log(`📊 Found ${jsonData?.length ?? 0} drills in JSON file`)

  // Clear existing drills (optional - comment out if you want to keep existing)
  console.log('🗑️  Clearing existing drills...')
  await prisma.userDrillProgress.deleteMany({})
  await prisma.customDrillPlanDrill.deleteMany({})
  await prisma.customDrillPlan.deleteMany({})
  await prisma.favoriteDrill.deleteMany({})
  await prisma.drill.deleteMany({})
  console.log('✅ Existing drills cleared')

  // Insert all drills
  let successCount = 0
  let errorCount = 0

  for (const drill of jsonData ?? []) {
    try {
      const categoryEnum = categoryMap?.[drill?.category ?? ''] ?? 'DINKING'
      const difficultyEnum = difficultyMap?.[drill?.difficulty?.toLowerCase() ?? 'beginner'] ?? 'BEGINNER'

      await prisma.drill.create({
        data: {
          legacyId: drill?.id ?? 0,
          title: drill?.title ?? 'Untitled Drill',
          tagline: drill?.tagline ?? '',
          description: drill?.description ?? '',
          category: categoryEnum as any,
          difficulty: difficultyEnum as any,
          ageGroups: drill?.ageGroups ?? ['All Ages'],
          gender: drill?.gender ?? 'All',
          skillLevelRange: drill?.skillLevelRange ?? '1.0-5.0+',
          duration: drill?.duration ?? 10,
          playersRequired: String(drill?.playersRequired ?? '1'),
          equipment: drill?.equipment ?? ['None'],
          focusAreas: drill?.focusAreas ?? [],
          instructions: drill?.instructions ?? [],
          proTips: drill?.proTips ?? [],
          commonMistakes: drill?.commonMistakes ?? [],
          successMetrics: drill?.successMetrics ?? 'Complete the drill successfully',
          videos: drill?.videos ?? [],
          benefits: [],
          relatedDrillIds: [],
          popularityScore: Math.floor(Math.random() * 10) + 1, // Random popularity 1-10
          effectivenessRating: 4.5 + Math.random() * 0.5, // Random rating 4.5-5.0
          featured: false,
          active: true,
        },
      })

      successCount++
      if (successCount % 10 === 0) {
        console.log(`✅ Inserted ${successCount} drills...`)
      }
    } catch (error) {
      errorCount++
      console.error(`❌ Error inserting drill ${drill?.title ?? 'unknown'}:`, error)
    }
  }

  console.log('\n📈 Seeding Summary:')
  console.log(`   ✅ Successfully inserted: ${successCount} drills`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log(`   📊 Total: ${(jsonData?.length ?? 0)} drills`)

  // Set some random drills as featured
  const allDrills = await prisma.drill.findMany()
  const featuredDrillIds = allDrills
    ?.slice(0, 8)
    ?.map(d => d?.id ?? '')
    ?.filter(Boolean) ?? []

  for (const drillId of featuredDrillIds) {
    await prisma.drill.update({
      where: { id: drillId },
      data: { featured: true },
    })
  }

  console.log(`\n⭐ Marked ${featuredDrillIds?.length ?? 0} drills as featured`)
  console.log('\n🎉 Drill database seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
