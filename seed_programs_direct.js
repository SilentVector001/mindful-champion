const { PrismaClient, SkillLevel } = require('@prisma/client');

const prisma = new PrismaClient();

const TRAINING_PROGRAMS = [
  {
    programId: 'beginner-fundamentals',
    name: 'Beginner Fundamentals',
    tagline: 'Master the basics and build a solid foundation',
    description: 'Perfect for players new to pickleball. Learn proper grip, stance, basic strokes, and court positioning through structured daily lessons.',
    durationDays: 30,
    skillLevel: SkillLevel.BEGINNER,
    estimatedTimePerDay: '20-30 minutes',
    keyOutcomes: [
      'Proper grip and ready position',
      'Consistent forehand and backhand',
      'Basic serve technique',
      'Understanding of court positioning',
      'Dinking fundamentals'
    ],
    dailyStructure: {
      warmup: '5 min',
      technique: '10 min',
      drills: '10 min',
      cooldown: '5 min'
    }
  },
  {
    programId: 'intermediate-skills',
    name: 'Intermediate Skills Development',
    tagline: 'Elevate your game with advanced techniques',
    description: 'For players with basic skills looking to compete. Focus on spin, power, strategy, and transitioning from baseline to kitchen.',
    durationDays: 45,
    skillLevel: SkillLevel.INTERMEDIATE,
    estimatedTimePerDay: '30-45 minutes',
    keyOutcomes: [
      'Topspin and slice techniques',
      'Third shot drop mastery',
      'Effective transition game',
      'Advanced dinking patterns',
      'Offensive and defensive strategies'
    ],
    dailyStructure: {
      warmup: '5 min',
      technique: '15 min',
      drills: '20 min',
      cooldown: '5 min'
    }
  },
  {
    programId: 'advanced-tournament-prep',
    name: 'Advanced Tournament Prep',
    tagline: 'Compete at the highest level',
    description: 'Intensive training for competitive players. Advanced shot selection, partner communication, match strategy, and mental toughness.',
    durationDays: 60,
    skillLevel: SkillLevel.ADVANCED,
    estimatedTimePerDay: '45-60 minutes',
    keyOutcomes: [
      'Tournament-level shot execution',
      'Advanced partner communication',
      'Match strategy and adaptation',
      'Mental game mastery',
      'Pressure situation handling'
    ],
    dailyStructure: {
      warmup: '10 min',
      technique: '15 min',
      drills: '25 min',
      matchPlay: '10 min'
    }
  },
  {
    programId: 'pro-performance',
    name: 'Pro Performance Mastery',
    tagline: 'Train like the pros',
    description: 'Elite-level training program for serious competitors. Focus on consistency, power, precision, and professional-level strategies.',
    durationDays: 90,
    skillLevel: SkillLevel.PRO,
    estimatedTimePerDay: '60-90 minutes',
    keyOutcomes: [
      'Pro-level consistency',
      'Maximum power with control',
      'Advanced court coverage',
      'Elite mental conditioning',
      'Tournament preparation protocols'
    ],
    dailyStructure: {
      warmup: '15 min',
      technique: '20 min',
      drills: '30 min',
      matchPlay: '15 min',
      analysis: '10 min'
    }
  },
  {
    programId: 'dinking-mastery',
    name: 'Dinking Mastery',
    tagline: 'Dominate the kitchen game',
    description: 'Specialized program focused entirely on dinking techniques, patterns, and strategies to control the net game.',
    durationDays: 21,
    skillLevel: SkillLevel.INTERMEDIATE,
    estimatedTimePerDay: '25-35 minutes',
    keyOutcomes: [
      'Soft hands and touch',
      'Cross-court and straight dinking',
      'Dink patterns and setups',
      'Attacking from the kitchen',
      'Defensive dinking strategies'
    ],
    dailyStructure: {
      warmup: '5 min',
      technique: '10 min',
      drills: '15 min',
      cooldown: '5 min'
    }
  },
  {
    programId: 'serve-return-excellence',
    name: 'Serve & Return Excellence',
    tagline: 'Win points before the rally starts',
    description: 'Master the most important shots in pickleball. Develop powerful, consistent serves and aggressive, strategic returns.',
    durationDays: 21,
    skillLevel: SkillLevel.INTERMEDIATE,
    estimatedTimePerDay: '25-35 minutes',
    keyOutcomes: [
      'Consistent deep serves',
      'Serve placement strategies',
      'Aggressive return positioning',
      'Return of serve tactics',
      'Third shot preparation'
    ],
    dailyStructure: {
      warmup: '5 min',
      serveDrills: '10 min',
      returnDrills: '10 min',
      cooldown: '5 min'
    }
  },
  {
    programId: 'mental-game-champion',
    name: 'Mental Game Champion',
    tagline: 'Master your mind, master the game',
    description: 'Develop unshakeable mental toughness, focus, and confidence. Learn visualization, breathing techniques, and pressure management.',
    durationDays: 30,
    skillLevel: SkillLevel.INTERMEDIATE,
    estimatedTimePerDay: '15-20 minutes',
    keyOutcomes: [
      'Pre-match mental preparation',
      'Focus and concentration techniques',
      'Pressure management strategies',
      'Confidence building exercises',
      'Post-match reflection protocols'
    ],
    dailyStructure: {
      meditation: '5 min',
      visualization: '5 min',
      mentalDrills: '5 min',
      reflection: '5 min'
    }
  }
];

async function seedPrograms() {
  try {
    console.log('🚀 Starting training programs seeding...');
    
    // Check existing programs
    const existing = await prisma.trainingProgram.findMany();
    console.log(`Found ${existing.length} existing programs`);
    
    if (existing.length > 0) {
      console.log('Programs already exist:');
      existing.forEach(p => console.log(`  - ${p.name} (${p.skillLevel})`));
      console.log('\n✅ Seeding not needed - programs already exist');
      return;
    }
    
    // Seed programs
    console.log('\nSeeding 7 training programs...');
    const created = [];
    
    for (const program of TRAINING_PROGRAMS) {
      const result = await prisma.trainingProgram.create({
        data: program
      });
      created.push(result);
      console.log(`  ✓ Created: ${result.name}`);
    }
    
    console.log(`\n✅ Successfully seeded ${created.length} training programs!`);
    console.log('\nPrograms created:');
    created.forEach(p => {
      console.log(`  - ${p.name} (${p.skillLevel}, ${p.durationDays} days)`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding programs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedPrograms();
