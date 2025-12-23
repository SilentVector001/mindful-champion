import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SkillLevel } from '@prisma/client'

// Import ALL program content
import { pickleballFundamentalsProgram } from '@/lib/training-content/pickleball-fundamentals'
import { serveReturnMasteryProgram } from '@/lib/training-content/serve-return-mastery'
import { thirdShotExcellenceProgram } from '@/lib/training-content/third-shot-excellence'
import { advancedDinkingProgram } from '@/lib/training-content/advanced-dinking-kitchen'
import { spinPowerProgram } from '@/lib/training-content/spin-power-mechanics'
import { tournamentPrepProgram } from '@/lib/training-content/tournament-preparation'
import { eliteMasteryProgram } from '@/lib/training-content/elite-mastery'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('🚀 Seeding ALL training programs with COMPLETE content...')

    // Delete existing programs to avoid duplicates
    await prisma.trainingProgram.deleteMany({})
    console.log('✅ Cleared existing programs')

    const programs = [
      // BEGINNER 1: Pickleball Fundamentals (14 days)
      {
        programId: pickleballFundamentalsProgram.programId,
        name: pickleballFundamentalsProgram.name,
        tagline: pickleballFundamentalsProgram.tagline,
        description: pickleballFundamentalsProgram.description,
        skillLevel: SkillLevel.BEGINNER,
        durationDays: pickleballFundamentalsProgram.durationDays,
        estimatedTimePerDay: pickleballFundamentalsProgram.estimatedTimePerDay,
        keyOutcomes: pickleballFundamentalsProgram.keyOutcomes,
        dailyStructure: pickleballFundamentalsProgram.dailyStructure,
        isActive: true
      },
      // BEGINNER 2: Serve & Return Mastery (7 days)
      {
        programId: serveReturnMasteryProgram.programId,
        name: serveReturnMasteryProgram.name,
        tagline: serveReturnMasteryProgram.tagline,
        description: serveReturnMasteryProgram.description,
        skillLevel: SkillLevel.BEGINNER,
        durationDays: serveReturnMasteryProgram.durationDays,
        estimatedTimePerDay: serveReturnMasteryProgram.estimatedTimePerDay,
        keyOutcomes: serveReturnMasteryProgram.keyOutcomes,
        dailyStructure: serveReturnMasteryProgram.dailyStructure,
        isActive: true
      },
      // INTERMEDIATE 1: Third Shot Excellence (10 days)
      {
        programId: thirdShotExcellenceProgram.programId,
        name: thirdShotExcellenceProgram.name,
        tagline: thirdShotExcellenceProgram.tagline,
        description: thirdShotExcellenceProgram.description,
        skillLevel: SkillLevel.INTERMEDIATE,
        durationDays: thirdShotExcellenceProgram.durationDays,
        estimatedTimePerDay: thirdShotExcellenceProgram.estimatedTimePerDay,
        keyOutcomes: thirdShotExcellenceProgram.keyOutcomes,
        dailyStructure: thirdShotExcellenceProgram.dailyStructure,
        isActive: true
      },
      // INTERMEDIATE 2: Advanced Dinking & Kitchen Play (12 days)
      {
        programId: advancedDinkingProgram.programId,
        name: advancedDinkingProgram.name,
        tagline: advancedDinkingProgram.tagline,
        description: advancedDinkingProgram.description,
        skillLevel: SkillLevel.INTERMEDIATE,
        durationDays: advancedDinkingProgram.durationDays,
        estimatedTimePerDay: advancedDinkingProgram.estimatedTimePerDay,
        keyOutcomes: advancedDinkingProgram.keyOutcomes,
        dailyStructure: advancedDinkingProgram.dailyStructure,
        isActive: true
      },
      // ADVANCED 1: Spin & Power Mechanics (14 days)
      {
        programId: spinPowerProgram.programId,
        name: spinPowerProgram.name,
        tagline: spinPowerProgram.tagline,
        description: spinPowerProgram.description,
        skillLevel: SkillLevel.ADVANCED,
        durationDays: spinPowerProgram.durationDays,
        estimatedTimePerDay: spinPowerProgram.estimatedTimePerDay,
        keyOutcomes: spinPowerProgram.keyOutcomes,
        dailyStructure: spinPowerProgram.dailyStructure,
        isActive: true
      },
      // ADVANCED 2: Tournament Preparation (21 days)
      {
        programId: tournamentPrepProgram.programId,
        name: tournamentPrepProgram.name,
        tagline: tournamentPrepProgram.tagline,
        description: tournamentPrepProgram.description,
        skillLevel: SkillLevel.ADVANCED,
        durationDays: tournamentPrepProgram.durationDays,
        estimatedTimePerDay: tournamentPrepProgram.estimatedTimePerDay,
        keyOutcomes: tournamentPrepProgram.keyOutcomes,
        dailyStructure: tournamentPrepProgram.dailyStructure,
        isActive: true
      },
      // PRO: Elite Mastery Program (30 days)
      {
        programId: eliteMasteryProgram.programId,
        name: eliteMasteryProgram.name,
        tagline: eliteMasteryProgram.tagline,
        description: eliteMasteryProgram.description,
        skillLevel: SkillLevel.PRO,
        durationDays: eliteMasteryProgram.durationDays,
        estimatedTimePerDay: eliteMasteryProgram.estimatedTimePerDay,
        keyOutcomes: eliteMasteryProgram.keyOutcomes,
        dailyStructure: eliteMasteryProgram.dailyStructure,
        isActive: true
      }
    ]

    for (const program of programs) {
      await prisma.trainingProgram.create({ data: program })
      const dayCount = program.dailyStructure?.days?.length || 0
      console.log(`✅ Created: ${program.name} (${dayCount} days of content)`)
    }

    const programCount = await prisma.trainingProgram.count()

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${programs.length} training programs with FULL content`,
      totalPrograms: programCount,
      programs: programs.map(p => ({ 
        name: p.name, 
        level: p.skillLevel, 
        days: p.durationDays,
        contentDays: p.dailyStructure?.days?.length || 0 
      }))
    })

  } catch (error) {
    console.error('❌ Error seeding programs:', error)
    return NextResponse.json(
      { error: 'Failed to seed programs', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
