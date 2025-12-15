import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { SkillLevel, TournamentStatus, TournamentFormat } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract filter parameters
    const search = searchParams.get('search') || '';
    const state = searchParams.get('state') || '';
    const skillLevel = searchParams.get('skillLevel') || '';
    const format = searchParams.get('format') || '';
    const status = searchParams.get('status') || 'UPCOMING';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const sortBy = searchParams.get('sortBy') || 'startDate';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    // Build where clause
    const where: any = {};
    
    // Status filter
    if (status) {
      where.status = status as TournamentStatus;
    }
    
    // Search filter (name, city, or description)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // State filter
    if (state) {
      where.state = state;
    }
    
    // Skill level filter
    if (skillLevel) {
      where.skillLevels = {
        has: skillLevel as SkillLevel
      };
    }
    
    // Format filter
    if (format) {
      where.format = {
        has: format as TournamentFormat
      };
    }
    
    // Date range filter
    if (startDate || endDate) {
      where.AND = [];
      if (startDate) {
        where.AND.push({
          startDate: { gte: new Date(startDate) }
        });
      }
      if (endDate) {
        where.AND.push({
          endDate: { lte: new Date(endDate) }
        });
      }
    }
    
    // Execute query
    const tournaments = await prisma.tournament.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder
      },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });
    
    // Get unique states for filters
    const states = await prisma.tournament.findMany({
      select: { state: true },
      distinct: ['state'],
      orderBy: { state: 'asc' }
    });
    
    return NextResponse.json({
      tournaments,
      meta: {
        total: tournaments.length,
        states: states.map(s => s?.state ?? '').filter(Boolean)
      }
    });
    
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournaments' },
      { status: 500 }
    );
  }
}
