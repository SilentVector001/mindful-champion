import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Get live stream status and mock data
export async function GET(request: Request) {
  try {
    // Mock live stream data
    // In production, this would fetch from actual live stream APIs
    const mockStreams = [
      {
        id: 'live-1',
        title: 'PPA Tour Championship - Championship Court',
        tournament: 'PPA Tour Championship Finals',
        court: 'Championship Court',
        match: 'Ben Johns vs Tyson McGuffin',
        score: '11-9, 8-11, 7-5',
        status: 'Game 3 - Live',
        viewers: Math.floor(Math.random() * 5000) + 10000,
        thumbnail: 'https://ppatour.com/wp-content/uploads/2023/12/TX-Open-DJI-Watermarked-scaled-1.webp',
        streamUrl: 'https://www.ppatour.com/watch',
        isLive: true
      },
      {
        id: 'live-2',
        title: 'MLP Miami - Center Court',
        tournament: 'Major League Pickleball Miami Slam',
        court: 'Center Court',
        match: 'Anna Leigh Waters vs Catherine Parenteau',
        score: '11-7, 9-11, 5-3',
        status: 'Game 3 - Live',
        viewers: Math.floor(Math.random() * 3000) + 8000,
        thumbnail: 'https://ppatour.com/wp-content/uploads/2024/07/PPA-Grows-Internationally.webp',
        streamUrl: 'https://www.majorleaguepickleball.net',
        isLive: true
      }
    ];

    return NextResponse.json({
      success: true,
      streams: mockStreams,
      totalLive: mockStreams?.length || 0,
      lastUpdated: new Date()?.toISOString()
    });
  } catch (error) {
    console.error('Error fetching live streams:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live streams' },
      { status: 500 }
    );
  }
}
