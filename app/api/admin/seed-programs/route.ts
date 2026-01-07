import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const trainingPrograms = [
  {
    id: 'prog_beginner_fundamentals',
    programId: 'beginner-fundamentals',
    name: 'Pickleball Fundamentals',
    tagline: 'Master the basics and build a solid foundation',
    description: 'Perfect for newcomers! Learn proper grip, stance, basic shots, and court positioning. This 14-day program covers everything you need to start playing with confidence.',
    durationDays: 14,
    skillLevel: 'BEGINNER' as const,
    estimatedTimePerDay: '20-30 minutes',
    keyOutcomes: ['Proper paddle grip and ready position', 'Consistent forehand and backhand groundstrokes', 'Basic serve technique', 'Understanding of court positioning', 'Kitchen (NVZ) rules mastery'],
    dailyStructure: { warmup: '5 minutes stretching', drills: '15-20 minutes skill work', cooldown: '5 minutes review' },
    isActive: true,
  },
  {
    id: 'prog_beginner_serve',
    programId: 'beginner-serve-mastery',
    name: 'Serve Mastery Basics',
    tagline: 'Develop a reliable and consistent serve',
    description: 'Focus specifically on building a dependable serve. Learn proper technique, placement strategies, and common mistakes to avoid.',
    durationDays: 7,
    skillLevel: 'BEGINNER' as const,
    estimatedTimePerDay: '15-20 minutes',
    keyOutcomes: ['Consistent underhand serve', 'Proper toss and contact point', 'Basic serve placement', 'Pre-serve routine development'],
    dailyStructure: { warmup: '3 minutes', technique: '10 minutes', practice: '5-7 minutes' },
    isActive: true,
  },
  {
    id: 'prog_intermediate_dinking',
    programId: 'intermediate-dink-game',
    name: 'Dink Game Domination',
    tagline: 'Control the kitchen and win more points',
    description: 'Elevate your soft game with advanced dinking techniques. Learn cross-court dinks, resets, and how to create offensive opportunities from the kitchen line.',
    durationDays: 21,
    skillLevel: 'INTERMEDIATE' as const,
    estimatedTimePerDay: '25-35 minutes',
    keyOutcomes: ['Consistent cross-court dinks', 'Effective reset shots', 'Reading opponent positioning', 'Creating attacking opportunities', 'Patience and point construction'],
    dailyStructure: { warmup: '5 minutes', technique: '15 minutes', drills: '10-15 minutes' },
    isActive: true,
  },
  {
    id: 'prog_intermediate_volleys',
    programId: 'intermediate-volley-skills',
    name: 'Volley Excellence',
    tagline: 'Dominate at the net with crisp volleys',
    description: 'Master punch volleys, block volleys, and transition volleys. Learn proper footwork and positioning to become a wall at the net.',
    durationDays: 14,
    skillLevel: 'INTERMEDIATE' as const,
    estimatedTimePerDay: '25-30 minutes',
    keyOutcomes: ['Quick hands at the net', 'Proper volley technique', 'Effective blocking', 'Transition game improvement', 'Net positioning mastery'],
    dailyStructure: { warmup: '5 minutes', drills: '20 minutes', cooldown: '5 minutes' },
    isActive: true,
  },
  {
    id: 'prog_advanced_strategy',
    programId: 'advanced-game-strategy',
    name: 'Advanced Game Strategy',
    tagline: 'Think three shots ahead',
    description: 'Take your game to the next level with advanced tactical concepts. Learn shot selection, pattern play, and how to exploit opponent weaknesses.',
    durationDays: 30,
    skillLevel: 'ADVANCED' as const,
    estimatedTimePerDay: '30-45 minutes',
    keyOutcomes: ['Advanced shot selection', 'Pattern recognition', 'Opponent analysis', 'Mental game mastery', 'Tournament preparation'],
    dailyStructure: { video_analysis: '10 minutes', technique: '15 minutes', tactical_drills: '15-20 minutes' },
    isActive: true,
  },
  {
    id: 'prog_advanced_power',
    programId: 'advanced-power-shots',
    name: 'Power Shot Arsenal',
    tagline: 'Add weapons to your game',
    description: 'Develop devastating drives, speed-ups, and overheads. Learn when and how to attack effectively at the highest levels.',
    durationDays: 21,
    skillLevel: 'ADVANCED' as const,
    estimatedTimePerDay: '30-40 minutes',
    keyOutcomes: ['Powerful drives with control', 'Effective speed-up shots', 'Overhead smash technique', 'Attack timing and selection', 'Pressure point creation'],
    dailyStructure: { warmup: '5 minutes', power_drills: '20 minutes', control_work: '10-15 minutes' },
    isActive: true,
  },
  {
    id: 'prog_elite_tournament',
    programId: 'elite-tournament-prep',
    name: 'Tournament Ready',
    tagline: 'Compete at the highest level',
    description: 'Comprehensive tournament preparation program. Covers match strategy, mental preparation, warm-up routines, and between-game recovery.',
    durationDays: 28,
    skillLevel: 'ELITE' as const,
    estimatedTimePerDay: '45-60 minutes',
    keyOutcomes: ['Tournament match preparation', 'Pressure situation handling', 'Between-game strategies', 'Peak performance timing', 'Competition mindset'],
    dailyStructure: { mental_prep: '10 minutes', physical_training: '20 minutes', tactical_work: '20-30 minutes' },
    isActive: true,
  }
];

export async function POST() {
  try {
    const results = [];
    
    for (const program of trainingPrograms) {
      const result = await prisma.trainingProgram.upsert({
        where: { programId: program.programId },
        update: {
          name: program.name,
          tagline: program.tagline,
          description: program.description,
          durationDays: program.durationDays,
          skillLevel: program.skillLevel,
          estimatedTimePerDay: program.estimatedTimePerDay,
          keyOutcomes: program.keyOutcomes,
          dailyStructure: program.dailyStructure,
          isActive: program.isActive,
          updatedAt: new Date()
        },
        create: {
          id: program.id,
          programId: program.programId,
          name: program.name,
          tagline: program.tagline,
          description: program.description,
          durationDays: program.durationDays,
          skillLevel: program.skillLevel,
          estimatedTimePerDay: program.estimatedTimePerDay,
          keyOutcomes: program.keyOutcomes,
          dailyStructure: program.dailyStructure,
          isActive: program.isActive,
          updatedAt: new Date()
        }
      });
      results.push(result.name);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Seeded ${results.length} training programs`,
      programs: results 
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const count = await prisma.trainingProgram.count();
    const programs = await prisma.trainingProgram.findMany({
      select: { name: true, skillLevel: true, isActive: true }
    });
    return NextResponse.json({ count, programs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
