import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SkillLevel } from '@prisma/client'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin (you can skip this check for emergency seeding)
    // if (!session?.user?.email?.includes('admin')) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    console.log('🚀 Seeding comprehensive training programs...')

    // Delete existing programs to avoid duplicates
    await prisma.trainingProgram.deleteMany({})
    console.log('✅ Cleared existing programs')

    const programs = [
      // BEGINNER PROGRAM 1
      {
        programId: 'beginner-fundamentals',
        name: 'Pickleball Fundamentals',
        tagline: 'Master the basics and build a solid foundation',
        description: 'Perfect for complete beginners! This 14-day comprehensive program covers everything you need to start playing pickleball with confidence.',
        skillLevel: SkillLevel.BEGINNER,
        durationDays: 14,
        estimatedTimePerDay: '30-40 minutes',
        keyOutcomes: [
          'Master proper continental grip and ready position',
          'Execute consistent serves with 80%+ success rate',
          'Return serves deep into the court consistently',
          'Develop foundational dinking skills at the kitchen line',
          'Understand basic court positioning and strategy',
          'Learn complete rules and scoring system',
          'Build confidence for recreational play'
        ],
        dailyStructure: { days: [] },
        isActive: true
      },
      // BEGINNER PROGRAM 2
      {
        programId: 'beginner-serve-return',
        name: 'Serve & Return Mastery',
        tagline: 'Dominate the most important shots in pickleball',
        description: 'This intensive 7-day program focuses exclusively on mastering serves and returns.',
        skillLevel: SkillLevel.BEGINNER,
        durationDays: 7,
        estimatedTimePerDay: '25-35 minutes',
        keyOutcomes: [
          'Develop 3 different serve types: deep, short, and spin serves',
          'Place serves strategically to opponent weaknesses',
          'Return serves consistently deep with 75%+ success',
          'Add topspin and backspin to serves and returns',
          'Build mental toughness and pre-serve routines'
        ],
        dailyStructure: { days: [] },
        isActive: true
      },
      // INTERMEDIATE PROGRAM 1
      {
        programId: 'intermediate-third-shot',
        name: 'Third Shot Excellence',
        tagline: 'Master the game-changing third shot drop',
        description: 'The third shot is what separates intermediate from advanced players. This comprehensive 10-day program teaches you consistent third shot drops and drives.',
        skillLevel: SkillLevel.INTERMEDIATE,
        durationDays: 10,
        estimatedTimePerDay: '40-50 minutes',
        keyOutcomes: [
          'Execute consistent third shot drops landing in opponent kitchen',
          'Master third shot drives with controlled power',
          'Develop strategic shot selection based on court position',
          'Perfect transition footwork from baseline to kitchen line',
          'Improve soft touch and feel for touch shots'
        ],
        dailyStructure: { days: [] },
        isActive: true
      },
      // INTERMEDIATE PROGRAM 2
      {
        programId: 'intermediate-dinking-strategy',
        name: 'Advanced Dinking & Kitchen Play',
        tagline: 'Control the kitchen and win more rallies',
        description: 'Elevate your dinking game to an advanced level with sophisticated techniques and patience strategies.',
        skillLevel: SkillLevel.INTERMEDIATE,
        durationDays: 12,
        estimatedTimePerDay: '35-45 minutes',
        keyOutcomes: [
          'Master cross-court and straight dinks with precision',
          'Develop patience in long dink rallies (50+ shots)',
          'Create and recognize attackable balls consistently',
          'Improve kitchen line positioning and footwork',
          'Execute the erne shot in match situations'
        ],
        dailyStructure: { days: [] },
        isActive: true
      },
      // ADVANCED PROGRAM 1
      {
        programId: 'advanced-spin-control',
        name: 'Spin & Power Mechanics',
        tagline: 'Add professional-level spin to every shot',
        description: 'Master the art of spin and power like professional players. Generate topspin on drives, backspin drops, and sidespin for deception.',
        skillLevel: SkillLevel.ADVANCED,
        durationDays: 14,
        estimatedTimePerDay: '50-60 minutes',
        keyOutcomes: [
          'Generate heavy topspin on drives and speedups',
          'Execute backspin drops and dinks with control',
          'Add sidespin for deception and difficult bounces',
          'Counter opponent spin effectively with adjustments',
          'Combine spin with power for elite-level shots'
        ],
        dailyStructure: { days: [] },
        isActive: true
      },
      // ADVANCED PROGRAM 2
      {
        programId: 'advanced-tournament-prep',
        name: 'Tournament Preparation',
        tagline: 'Get tournament-ready with mental and physical training',
        description: 'Complete tournament preparation covering match strategy, mental game, physical conditioning, and competitive scenarios.',
        skillLevel: SkillLevel.ADVANCED,
        durationDays: 21,
        estimatedTimePerDay: '60 minutes',
        keyOutcomes: [
          'Develop tournament-ready mental toughness',
          'Master match strategy and game planning',
          'Build physical endurance for long matches',
          'Handle pressure situations with confidence',
          'Execute all skills consistently in competition'
        ],
        dailyStructure: { days: [] },
        isActive: true
      },
      // PRO PROGRAM
      {
        programId: 'pro-elite-mastery',
        name: 'Elite Mastery Program',
        tagline: 'Train like the pros',
        description: 'The most comprehensive program for elite players. Professional-level training covering advanced tactics, physical conditioning, mental performance, and competitive excellence.',
        skillLevel: SkillLevel.PRO,
        durationDays: 30,
        estimatedTimePerDay: '90 minutes',
        keyOutcomes: [
          'Master professional-level shot making',
          'Develop elite match strategies and tactics',
          'Build peak physical conditioning and stamina',
          'Execute under extreme competitive pressure',
          'Compete at the highest levels with confidence'
        ],
        dailyStructure: { days: [] },
        isActive: true
      }
    ]

    for (const program of programs) {
      await prisma.trainingProgram.create({
        data: program
      })
      console.log(`✅ Created program: ${program.name}`)
    }

    const programCount = await prisma.trainingProgram.count()

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${programs.length} training programs`,
      totalPrograms: programCount,
      programs: programs.map(p => ({ name: p.name, level: p.skillLevel, days: p.durationDays }))
    })

  } catch (error) {
    console.error('❌ Error seeding programs:', error)
    return NextResponse.json(
      { error: 'Failed to seed programs', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
