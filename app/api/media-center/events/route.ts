
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { EventsService } from '@/lib/media-center/events-service';
import { SubscriptionUtils } from '@/lib/media-center/subscription-utils';
import { ExternalEventType } from '@/lib/prisma-types';

export const dynamic = "force-dynamic";

// Sample events for fallback
const SAMPLE_EVENTS = [
  {
    id: 'sample_1',
    title: 'PPA World Championships 2025',
    description: 'The pinnacle of professional pickleball competition featuring the world\'s best players.',
    eventType: 'PPA_TOURNAMENT',
    startDate: '2025-11-03',
    endDate: '2025-11-09',
    location: 'Farmers Branch, Texas',
    city: 'Farmers Branch',
    state: 'Texas',
    venueName: 'Farmers Branch Historical Park',
    organizerName: 'Professional Pickleball Association',
    websiteUrl: 'https://ppatour.com',
    registrationUrl: 'https://ppatour.com/register',
    prizeMoney: '$300,000',
    skillLevel: 'PRO',
    format: 'DOUBLES',
    status: 'UPCOMING'
  },
  {
    id: 'sample_2',
    title: 'USA Pickleball National Championships 2025',
    description: 'The largest amateur pickleball tournament in the world.',
    eventType: 'USA_PICKLEBALL_TOURNAMENT',
    startDate: '2025-11-15',
    endDate: '2025-11-23',
    location: 'San Diego, California',
    city: 'San Diego',
    state: 'California',
    venueName: 'Barnes Tennis Center',
    organizerName: 'USA Pickleball',
    websiteUrl: 'https://usapickleball.org/nationals',
    registrationUrl: 'https://usapickleball.org/register',
    skillLevel: 'INTERMEDIATE',
    format: 'DOUBLES',
    status: 'REGISTRATION_OPEN'
  },
  {
    id: 'sample_3',
    title: 'MLP Miami Slam 2025',
    description: 'Major League Pickleball returns to Miami for an exciting team competition.',
    eventType: 'MLP_TOURNAMENT',
    startDate: '2025-12-15',
    endDate: '2025-12-17',
    location: 'Miami, Florida',
    city: 'Miami',
    state: 'Florida',
    venueName: 'Hard Rock Stadium',
    organizerName: 'Major League Pickleball',
    websiteUrl: 'https://majorleaguepickleball.net',
    prizeMoney: '$100,000',
    skillLevel: 'PRO',
    format: 'MIXED_DOUBLES',
    status: 'UPCOMING'
  },
  {
    id: 'sample_4',
    title: 'APP Mesa Open - Golden Ticket Event',
    description: 'Win your way to the APP Championships in this Golden Ticket tournament.',
    eventType: 'GOLDEN_TICKET_EVENT',
    startDate: '2025-12-05',
    endDate: '2025-12-09',
    location: 'Mesa, Arizona',
    city: 'Mesa',
    state: 'Arizona',
    venueName: 'Mesa Convention Center',
    organizerName: 'Association of Pickleball Professionals',
    websiteUrl: 'https://appickleball.com',
    prizeMoney: '$75,000',
    skillLevel: 'ADVANCED',
    format: 'DOUBLES',
    status: 'REGISTRATION_OPEN'
  }
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Get user's tier access
    const tierAccess = await SubscriptionUtils.getUserTierAccess(userId);
    
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType') as ExternalEventType;
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');

    let events;
    
    try {
      if (search) {
        events = await EventsService.searchEvents(search, limit);
      } else if (eventType) {
        events = await EventsService.getEventsByType(eventType, limit);
      } else {
        events = await EventsService.getUpcomingEvents(limit);
      }
      
      // If no events found, use sample events
      if (!events || events.length === 0) {
        events = SAMPLE_EVENTS;
      }
    } catch (err) {
      console.error('Error fetching events from database:', err);
      events = SAMPLE_EVENTS;
    }

    // For free users, limit the number of events shown
    if (!tierAccess.canAccessAdvancedFeatures && events.length > 10) {
      events = events.slice(0, 10);
    }

    return NextResponse.json({
      success: true,
      events,
      tierAccess,
      showUpgradePrompt: tierAccess.showUpgradePrompts && events.length >= 10
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({
      success: true,
      events: SAMPLE_EVENTS,
      message: 'Showing sample events'
    });
  }
}

// Sync events from external APIs
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admins to trigger sync
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: 'Admin access required'
      }, { status: 403 });
    }

    await EventsService.syncUpcomingEvents();
    
    return NextResponse.json({
      success: true,
      message: 'Events sync completed'
    });

  } catch (error) {
    console.error('Error syncing events:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to sync events'
    }, { status: 500 });
  }
}
