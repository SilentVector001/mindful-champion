import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

// GET: Fetch live tournament scores and highlights
export async function GET() {
  try {
    // In a real implementation, this would fetch from a live scores API
    // For now, we return empty arrays so the component uses mock data
    
    return NextResponse.json({ 
      matches: [],
      highlights: []
    });
  } catch (error) {
    console.error('Error fetching live scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live scores' },
      { status: 500 }
    );
  }
}
