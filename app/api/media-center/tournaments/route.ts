import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { TournamentStatus, SkillLevel, TournamentFormat } from '@/lib/prisma-types';

// Force dynamic rendering - this route uses request.url
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters for filtering
    const state = searchParams.get('state');
    const status = searchParams.get('status');
    const skillLevel = searchParams.get('skillLevel');
    const format = searchParams.get('format');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    
    // Build the where clause dynamically
    const where: any = {};
    
    // Filter by state
    if (state) {
      where.state = state;
    }
    
    // Filter by status
    if (status && Object.values(TournamentStatus).includes(status as TournamentStatus)) {
      where.status = status as TournamentStatus;
    }
    
    // Filter by skill level
    if (skillLevel && Object.values(SkillLevel).includes(skillLevel as SkillLevel)) {
      where.skillLevels = {
        has: skillLevel as SkillLevel
      };
    }
    
    // Filter by format
    if (format && Object.values(TournamentFormat).includes(format as TournamentFormat)) {
      where.format = {
        has: format as TournamentFormat
      };
    }
    
    // Filter by date range
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) {
        where.startDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.startDate.lte = new Date(endDate);
      }
    }
    
    // Search by name, city, or description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Fetch tournaments from the database
    const tournaments = await prisma.tournament.findMany({
      where,
      orderBy: {
        startDate: 'asc'
      },
      select: {
        id: true,
        name: true,
        description: true,
        organizerName: true,
        status: true,
        venueName: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        latitude: true,
        longitude: true,
        startDate: true,
        endDate: true,
        registrationStart: true,
        registrationEnd: true,
        format: true,
        skillLevels: true,
        maxParticipants: true,
        currentRegistrations: true,
        entryFee: true,
        prizePool: true,
        websiteUrl: true,
        registrationUrl: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    // Get tournament count by state for the map visualization
    const tournamentsByState = await prisma.tournament.groupBy({
      by: ['state'],
      where: status ? { status: status as TournamentStatus } : {},
      _count: {
        id: true
      }
    });
    
    const stateCount = tournamentsByState.reduce((acc, item) => {
      acc[item.state] = item._count.id;
      return acc;
    }, {} as Record<string, number>);
    
    return NextResponse.json({
      success: true,
      count: tournaments.length,
      tournaments,
      stateCount
    });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tournaments' },
      { status: 500 }
    );
  }
}
