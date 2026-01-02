/**
 * Fix Training Program Skill Levels
 * 
 * This script corrects the skill level assignments for all 7 training programs
 * to ensure they display correctly in the UI.
 */

import { PrismaClient, SkillLevel } from '@prisma/client'

const prisma = new PrismaClient()

const programCorrections = [
  // Beginner Programs
  { programId: 'beginner-serve-return', name: 'Serve & Return Mastery', skillLevel: 'BEGINNER' as SkillLevel },
  { programId: 'beginner-fundamentals', name: 'Pickleball Fundamentals', skillLevel: 'BEGINNER' as SkillLevel },
  
  // Intermediate Programs  
  { programId: 'intermediate-third-shot', name: 'Third Shot Excellence', skillLevel: 'INTERMEDIATE' as SkillLevel },
  { programId: 'intermediate-dinking-strategy', name: 'Advanced Dinking & Kitchen Play', skillLevel: 'INTERMEDIATE' as SkillLevel },
  
  // Advanced Programs
  { programId: 'advanced-spin-control', name: 'Spin & Power Mechanics', skillLevel: 'ADVANCED' as SkillLevel },
  { programId: 'advanced-tournament-prep', name: 'Tournament Preparation', skillLevel: 'ADVANCED' as SkillLevel },
  
  // Pro/Elite Program - THIS IS THE CRITICAL FIX
  { programId: 'pro-elite-mastery', name: 'Elite Mastery Program', skillLevel: 'PRO' as SkillLevel }
]

async function main() {
  console.log('🔧 Fixing Training Program Skill Levels...\n')

  for (const correction of programCorrections) {
    try {
      const result = await prisma.trainingProgram.updateMany({
        where: { programId: correction.programId },
        data: { skillLevel: correction.skillLevel }
      })

      if (result.count > 0) {
        console.log(`✅ ${correction.name}: Updated to ${correction.skillLevel}`)
      } else {
        // Try by name if programId doesn't match
        const byName = await prisma.trainingProgram.updateMany({
          where: { name: correction.name },
          data: { skillLevel: correction.skillLevel }
        })
        
        if (byName.count > 0) {
          console.log(`✅ ${correction.name}: Updated to ${correction.skillLevel} (matched by name)`)
        } else {
          console.log(`⚠️  ${correction.name}: No matching program found`)
        }
      }
    } catch (error) {
      console.error(`❌ Error updating ${correction.name}:`, error)
    }
  }

  // Verify the changes
  console.log('\n📋 Verification - Current Program Skill Levels:')
  const programs = await prisma.trainingProgram.findMany({
    select: { name: true, skillLevel: true, durationDays: true },
    orderBy: { durationDays: 'asc' }
  })

  programs.forEach(p => {
    console.log(`   ${p.name} (${p.durationDays} days): ${p.skillLevel}`)
  })

  console.log('\n✨ Done!')
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
