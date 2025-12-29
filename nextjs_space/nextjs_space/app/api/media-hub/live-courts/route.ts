
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

interface CourtActivity {
  courtNumber: string;
  courtName: string;
  venue: string;
  currentMatch: string;
  nextMatch?: string;
  isLive: boolean;
  streamUrl?: string;
  platform: string;
  lastUpdated: Date;
}

export async function GET(request: NextRequest) {
  try {
    // Try to get real-time court data from database
    // In production, this would query live court status from your data source
    
    // For now, return simulated "real-time" data that changes based on current time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Simulate different matches throughout the day
    const timeSlot = Math.floor(currentHour / 6); // Divide day into 4 time slots
    
    const courts: CourtActivity[] = [
      {
        courtNumber: 'Center Court',
        courtName: 'Championship Court',
        venue: 'Fertitta Tennis Complex',
        currentMatch: getMatchForTimeSlot(timeSlot, 0),
        nextMatch: getMatchForTimeSlot(timeSlot, 1),
        isLive: currentHour >= 9 && currentHour < 21, // Live between 9am-9pm
        streamUrl: 'https://www.youtube.com/@PPATour/live',
        platform: 'YouTube',
        lastUpdated: now
      },
      {
        courtNumber: 'Court 1',
        courtName: 'Stadium Court',
        venue: 'Lindner Family Pickleball Center',
        currentMatch: getMatchForTimeSlot(timeSlot, 2),
        nextMatch: getMatchForTimeSlot(timeSlot, 3),
        isLive: currentHour >= 10 && currentHour < 20,
        streamUrl: 'https://www.youtube.com/@majorleaguepickleball/live',
        platform: 'YouTube',
        lastUpdated: now
      },
      {
        courtNumber: 'Court 3',
        courtName: 'Desert Court',
        venue: 'Mesa Convention Center',
        currentMatch: getMatchForTimeSlot(timeSlot, 4),
        nextMatch: currentHour < 18 ? getMatchForTimeSlot(timeSlot, 5) : undefined,
        isLive: currentHour >= 11 && currentHour < 19,
        streamUrl: 'https://www.youtube.com/@APPpickleball/live',
        platform: 'YouTube',
        lastUpdated: now
      }
    ];

    return NextResponse.json({
      success: true,
      courts,
      lastUpdated: now,
      nextUpdate: new Date(now.getTime() + 5 * 60 * 1000) // Next update in 5 minutes
    });

  } catch (error) {
    console.error('Error fetching court data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch court data' },
      { status: 500 }
    );
  }
}

// Helper function to generate different matches based on time slot
function getMatchForTimeSlot(timeSlot: number, variation: number): string {
  const matches = [
    // Time slot 0 (12am-6am) - Early matches / Replays
    [
      'Replay: Ben Johns/Collin Johns vs. Riley Newman/Matt Wright',
      'Replay: Anna Leigh Waters/Catherine Parenteau vs. Leigh Waters/Anna Bright',
      'Replay: ATX vs. NYC - Championship Game',
      'Replay: CAL vs. FLA - Semifinal',
      'Replay: Zane Navratil vs. JW Johnson - Finals',
      'Replay: Tyson McGuffin vs. Jay Devilliers'
    ],
    // Time slot 1 (6am-12pm) - Morning matches
    [
      'Mixed Doubles: Johns/Waters vs. Newman/Parenteau - Quarterfinals',
      'Men\'s Doubles: Johnson/Wright vs. McGuffin/Devilliers - Round of 16',
      'MLP: ATX Pickleballers vs. Miami Pickleball Club - Pool Play',
      'Women\'s Doubles: Waters/Bright vs. Smith/Irvine - Round of 16',
      'Men\'s Singles: Ben Johns vs. Federico Staksrud - Quarterfinals',
      'Women\'s Singles: Anna Leigh Waters vs. Salome Devidze'
    ],
    // Time slot 2 (12pm-6pm) - Afternoon prime time
    [
      'LIVE: Ben Johns/Collin Johns vs. Riley Newman/Matt Wright - Men\'s Doubles Final',
      'LIVE: Anna Leigh Waters/Catherine Parenteau vs. Leigh Waters/Anna Bright - Women\'s Doubles Semi',
      'LIVE: ATX vs. NYC - MLP Championship Game',
      'LIVE: CAL vs. FLA - Semifinal Match 2',
      'LIVE: Zane Navratil vs. JW Johnson - Men\'s Singles Semi',
      'LIVE: Anna Leigh Waters vs. Catherine Parenteau - Women\'s Singles Final'
    ],
    // Time slot 3 (6pm-12am) - Evening matches
    [
      'Championship Finals: Johns/Johns vs. Newman/Wright - Best of 5',
      'Bronze Medal Match: Waters/Bright vs. Smith/Irvine',
      'MLP Finals: ATX Pickleballers vs. NYC Slice - Game 5',
      'Consolation Final: Miami vs. Florida Smash',
      'Singles Championship: Ben Johns vs. Tyson McGuffin',
      'Mixed Doubles Final: Johnson/Waters vs. Wright/Parenteau'
    ]
  ];

  return matches[timeSlot][variation % matches[timeSlot].length];
}
