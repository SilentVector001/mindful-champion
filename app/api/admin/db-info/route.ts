import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Diagnostic endpoint to check database connection and tournament count
 * Use this to verify which database is connected in production
 */
export async function GET() {
  try {
    const tournamentCount = await prisma.tournament.count();
    const dbUrl = process.env.DATABASE_URL || '';
    
    // Extract host without exposing credentials
    const dbHost = dbUrl.split('@')[1]?.split('/')[0] || 'Unknown';
    const dbName = dbUrl.split('/').pop()?.split('?')[0] || 'Unknown';
    
    // Get sample tournaments
    const sampleTournaments = await prisma.tournament.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        status: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      database: {
        host: dbHost,
        name: dbName,
      },
      tournaments: {
        total: tournamentCount,
        samples: sampleTournaments,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database info error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch database info',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
