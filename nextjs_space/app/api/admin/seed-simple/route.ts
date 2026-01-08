// @ts-nocheck
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Simple training programs data
const programs = [
  { id: 'p1', programId: 'beginner-fundamentals', name: 'Pickleball Fundamentals', tagline: 'Master the basics', description: 'Perfect for newcomers! 14-day program covering grip, stance, basic shots.', durationDays: 14, skillLevel: 'BEGINNER' as const, estimatedTimePerDay: '20-30 min', keyOutcomes: ['Proper grip', 'Basic serve', 'Court positioning'], dailyStructure: { warmup: '5 min', drills: '15-20 min', cooldown: '5 min' } },
  { id: 'p2', programId: 'beginner-serve', name: 'Serve Mastery', tagline: 'Reliable serves', description: 'Build a dependable serve with proper technique.', durationDays: 7, skillLevel: 'BEGINNER' as const, estimatedTimePerDay: '15-20 min', keyOutcomes: ['Consistent serve', 'Placement'], dailyStructure: { warmup: '3 min', technique: '10 min', practice: '5 min' } },
  { id: 'p3', programId: 'intermediate-dinking', name: 'Dink Game Domination', tagline: 'Control the kitchen', description: 'Elevate your soft game with advanced dinking techniques.', durationDays: 21, skillLevel: 'INTERMEDIATE' as const, estimatedTimePerDay: '25-35 min', keyOutcomes: ['Cross-court dinks', 'Reset shots', 'Patience'], dailyStructure: { warmup: '5 min', technique: '15 min', drills: '15 min' } },
  { id: 'p4', programId: 'intermediate-volleys', name: 'Volley Excellence', tagline: 'Dominate the net', description: 'Master punch volleys and transition volleys.', durationDays: 14, skillLevel: 'INTERMEDIATE' as const, estimatedTimePerDay: '25-30 min', keyOutcomes: ['Quick hands', 'Net positioning'], dailyStructure: { warmup: '5 min', drills: '20 min', cooldown: '5 min' } },
  { id: 'p5', programId: 'advanced-strategy', name: 'Advanced Strategy', tagline: 'Think ahead', description: 'Advanced tactical concepts and shot selection.', durationDays: 30, skillLevel: 'ADVANCED' as const, estimatedTimePerDay: '30-45 min', keyOutcomes: ['Pattern play', 'Mental game'], dailyStructure: { analysis: '10 min', technique: '15 min', tactical: '20 min' } },
  { id: 'p6', programId: 'advanced-power', name: 'Power Shot Arsenal', tagline: 'Add weapons', description: 'Devastating drives, speed-ups, and overheads.', durationDays: 21, skillLevel: 'ADVANCED' as const, estimatedTimePerDay: '30-40 min', keyOutcomes: ['Power with control', 'Attack timing'], dailyStructure: { warmup: '5 min', power: '20 min', control: '15 min' } },
  { id: 'p7', programId: 'elite-tournament', name: 'Tournament Ready', tagline: 'Compete at highest level', description: 'Comprehensive tournament preparation.', durationDays: 28, skillLevel: 'ELITE' as const, estimatedTimePerDay: '45-60 min', keyOutcomes: ['Match prep', 'Competition mindset'], dailyStructure: { mental: '10 min', physical: '20 min', tactical: '30 min' } }
];

export async function POST() {
  try {
    const results = [];
    for (const p of programs) {
      const result = await prisma.trainingProgram.upsert({
        where: { programId: p.programId },
        update: { name: p.name, tagline: p.tagline, description: p.description, durationDays: p.durationDays, skillLevel: p.skillLevel, estimatedTimePerDay: p.estimatedTimePerDay, keyOutcomes: p.keyOutcomes, dailyStructure: p.dailyStructure, isActive: true, updatedAt: new Date() },
        create: { id: p.id, programId: p.programId, name: p.name, tagline: p.tagline, description: p.description, durationDays: p.durationDays, skillLevel: p.skillLevel, estimatedTimePerDay: p.estimatedTimePerDay, keyOutcomes: p.keyOutcomes, dailyStructure: p.dailyStructure, isActive: true, updatedAt: new Date() }
      });
      results.push(result.name);
    }
    return NextResponse.json({ success: true, count: results.length, programs: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const count = await prisma.trainingProgram.count();
    const programs = await prisma.trainingProgram.findMany({ select: { name: true, skillLevel: true } });
    return NextResponse.json({ count, programs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
