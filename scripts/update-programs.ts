import { PrismaClient, SkillLevel } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Updating training programs with enhanced data...\n')

  // Update existing programs with better content
  const existingProgramUpdates = [
    // Beginner Fundamentals -> Enhanced
    { 
      currentName: 'Beginner Fundamentals', 
      newName: 'Pickleball Fundamentals',
      skillLevel: 'BEGINNER' as SkillLevel,
      tagline: 'Master the basics and build a solid foundation',
      description: 'Perfect for complete beginners! This comprehensive program covers everything you need to start playing pickleball with confidence. From your first grip to your first game.',
      keyOutcomes: ['Master proper grip and ready position', 'Execute consistent serves (80%+)', 'Return serves deep', 'Develop foundational dinking', 'Understand court positioning'],
    },
    // Serve & Return Mastery -> Keep
    { 
      currentName: 'Serve & Return Mastery', 
      skillLevel: 'BEGINNER' as SkillLevel,
      tagline: 'Dominate the most important shots in pickleball',
      description: 'Master your serve and return — the two shots you have complete control over. Transform these critical shots from weaknesses into weapons.',
      keyOutcomes: ['Develop 3 different serve types', 'Place serves strategically', 'Return serves consistently deep', 'Add spin to serves and returns', 'Build mental toughness'],
    },
    // Intermediate Skills -> Enhanced to Third Shot focus
    { 
      currentName: 'Intermediate Skills', 
      newName: 'Third Shot Excellence',
      skillLevel: 'INTERMEDIATE' as SkillLevel,
      tagline: 'Master the game-changing third shot drop',
      description: 'The third shot is what separates intermediate from advanced players. Learn consistent third shot drops and drives — the shots that get you safely to the net.',
      keyOutcomes: ['Execute consistent third shot drops', 'Master third shot drives', 'Develop strategic shot selection', 'Perfect transition footwork', 'Improve soft touch'],
    },
    // Dinking Excellence -> Advanced Dinking
    { 
      currentName: 'Dinking Excellence', 
      newName: 'Advanced Dinking & Kitchen Play',
      skillLevel: 'INTERMEDIATE' as SkillLevel,
      tagline: 'Control the kitchen and win more rallies',
      description: 'Elevate your dinking game with sophisticated techniques. The kitchen line is where 80% of points are won or lost — master it.',
      keyOutcomes: ['Master cross-court and straight dinks', 'Develop patience (50+ shot rallies)', 'Create attackable balls', 'Improve kitchen footwork', 'Execute the erne shot'],
    },
    // Advanced Techniques -> Spin & Power
    { 
      currentName: 'Advanced Techniques', 
      newName: 'Spin & Power Mechanics',
      skillLevel: 'ADVANCED' as SkillLevel,
      tagline: 'Add professional-level spin to every shot',
      description: 'Master the art of spin and power like professional players. Generate topspin, backspin, and sidespin for deception and control.',
      keyOutcomes: ['Generate heavy topspin', 'Execute backspin drops', 'Add sidespin for deception', 'Counter opponent spin', 'Combine spin with power'],
    },
    // Competitive Edge -> Tournament Preparation
    { 
      currentName: 'Competitive Edge', 
      newName: 'Tournament Preparation',
      skillLevel: 'ADVANCED' as SkillLevel,
      tagline: 'Get tournament-ready with mental and physical training',
      description: 'Complete tournament preparation covering match strategy, mental game, physical conditioning, and competitive scenarios. Show up ready to compete.',
      keyOutcomes: ['Develop mental toughness', 'Master match strategy', 'Build physical endurance', 'Handle pressure situations', 'Execute consistently in competition'],
    },
    // Senior-Friendly -> Elite Mastery (transform one to elite)
    { 
      currentName: 'Senior-Friendly Program', 
      newName: 'Elite Mastery Program',
      skillLevel: 'PRO' as SkillLevel,  // CRITICAL: This must be PRO/Elite!
      tagline: 'Train like the pros — Transform into a tournament-ready competitor',
      description: 'The ultimate program for serious players ready to compete at the highest levels. Pro-level training combining advanced shot-making, tournament strategy, and championship mental performance.',
      keyOutcomes: ['Execute pro-level shots (Erne, ATP)', 'Develop tournament-winning strategies', 'Build elite conditioning', 'Master pressure situations', 'Compete in 4.0+ tournaments'],
    },
  ]

  for (const update of existingProgramUpdates) {
    const existing = await prisma.trainingProgram.findFirst({
      where: { name: update.currentName }
    })

    if (existing) {
      await prisma.trainingProgram.update({
        where: { id: existing.id },
        data: {
          name: update.newName || update.currentName,
          skillLevel: update.skillLevel,
          tagline: update.tagline,
          description: update.description,
          keyOutcomes: update.keyOutcomes,
        }
      })
      console.log(`✅ Updated: ${update.currentName} → ${update.newName || update.currentName} (${update.skillLevel})`)
    } else {
      console.log(`⚠️  Not found: ${update.currentName}`)
    }
  }

  // Verify
  console.log('\n📋 Final Program List:')
  const programs = await prisma.trainingProgram.findMany({
    select: { name: true, skillLevel: true, durationDays: true },
    orderBy: [{ skillLevel: 'asc' }, { durationDays: 'asc' }]
  })
  programs.forEach(p => console.log(`   ${p.name} (${p.durationDays} days): ${p.skillLevel}`))
}

main().finally(() => prisma.$disconnect())
