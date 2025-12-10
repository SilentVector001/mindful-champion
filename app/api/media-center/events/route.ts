
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { EventsService } from '@/lib/media-center/events-service';
import { SubscriptionUtils } from '@/lib/media-center/subscription-utils';
import { ExternalEventType } from '@/lib/prisma-types';

export const dynamic = "force-dynamic";

// Sample events for fallback - Real 2025 Pickleball Events
const SAMPLE_EVENTS = [
  {
    id: 'ppa_mesa_2025',
    title: 'PPA Mesa Arizona Grand Slam 2025',
    description: 'One of the premier stops on the PPA Tour featuring $200,000 in prize money and the top pros in the world.',
    eventType: 'PPA_TOURNAMENT',
    startDate: '2025-01-15',
    endDate: '2025-01-19',
    location: 'Mesa, Arizona',
    city: 'Mesa',
    state: 'Arizona',
    venueName: 'Legacy Sports USA',
    organizerName: 'Professional Pickleball Association',
    websiteUrl: 'https://ppatour.com',
    registrationUrl: 'https://ppatour.com/register',
    prizeMoney: '$200,000',
    skillLevel: 'PRO',
    format: 'ALL',
    status: 'UPCOMING'
  },
  {
    id: 'mlp_orlando_2025',
    title: 'MLP Orlando Cup 2025',
    description: 'Major League Pickleball team competition featuring 24 franchises battling for supremacy.',
    eventType: 'MLP_TOURNAMENT',
    startDate: '2025-02-07',
    endDate: '2025-02-09',
    location: 'Orlando, Florida',
    city: 'Orlando',
    state: 'Florida',
    venueName: 'Orange County Convention Center',
    organizerName: 'Major League Pickleball',
    websiteUrl: 'https://majorleaguepickleball.net',
    prizeMoney: '$500,000',
    skillLevel: 'PRO',
    format: 'TEAM',
    status: 'UPCOMING'
  },
  {
    id: 'ppa_austin_2025',
    title: 'PPA Austin Showdown 2025',
    description: 'Texas-sized pickleball action at one of the most popular stops on the PPA Tour.',
    eventType: 'PPA_TOURNAMENT',
    startDate: '2025-02-26',
    endDate: '2025-03-02',
    location: 'Austin, Texas',
    city: 'Austin',
    state: 'Texas',
    venueName: 'Austin Sports Center',
    organizerName: 'Professional Pickleball Association',
    websiteUrl: 'https://ppatour.com',
    prizeMoney: '$150,000',
    skillLevel: 'PRO',
    format: 'DOUBLES',
    status: 'REGISTRATION_OPEN'
  },
  {
    id: 'app_newport_2025',
    title: 'APP Newport Beach Open',
    description: 'APP Tour stop in beautiful Newport Beach with ocean views and competitive play.',
    eventType: 'APP_TOURNAMENT',
    startDate: '2025-03-14',
    endDate: '2025-03-16',
    location: 'Newport Beach, California',
    city: 'Newport Beach',
    state: 'California',
    venueName: 'Newport Beach Tennis Club',
    organizerName: 'Association of Pickleball Professionals',
    websiteUrl: 'https://appickleball.com',
    prizeMoney: '$100,000',
    skillLevel: 'ADVANCED',
    format: 'DOUBLES',
    status: 'REGISTRATION_OPEN'
  },
  {
    id: 'usap_indian_wells_2025',
    title: 'USA Pickleball Indian Wells Open',
    description: 'Premier pickleball tournament at the prestigious Indian Wells Tennis Garden venue.',
    eventType: 'USA_PICKLEBALL_TOURNAMENT',
    startDate: '2025-04-04',
    endDate: '2025-04-06',
    location: 'Indian Wells, California',
    city: 'Indian Wells',
    state: 'California',
    venueName: 'Indian Wells Tennis Garden',
    organizerName: 'USA Pickleball',
    websiteUrl: 'https://usapickleball.org',
    skillLevel: 'INTERMEDIATE',
    format: 'ALL',
    status: 'REGISTRATION_OPEN'
  },
  {
    id: 'mlp_dallas_2025',
    title: 'MLP Dallas Championship 2025',
    description: 'The richest team pickleball event of the season with $750,000 in prize money.',
    eventType: 'MLP_TOURNAMENT',
    startDate: '2025-05-16',
    endDate: '2025-05-18',
    location: 'Dallas, Texas',
    city: 'Dallas',
    state: 'Texas',
    venueName: 'American Airlines Center',
    organizerName: 'Major League Pickleball',
    websiteUrl: 'https://majorleaguepickleball.net',
    prizeMoney: '$750,000',
    skillLevel: 'PRO',
    format: 'TEAM',
    status: 'UPCOMING'
  },
  {
    id: 'golden_ticket_denver_2025',
    title: 'Golden Ticket - Denver Regional',
    description: 'Win your ticket to the USA Pickleball National Championships at this regional qualifier.',
    eventType: 'GOLDEN_TICKET_EVENT',
    startDate: '2025-06-20',
    endDate: '2025-06-22',
    location: 'Denver, Colorado',
    city: 'Denver',
    state: 'Colorado',
    venueName: 'Gates Tennis Center',
    organizerName: 'USA Pickleball',
    websiteUrl: 'https://usapickleball.org/golden-ticket',
    skillLevel: 'INTERMEDIATE',
    format: 'DOUBLES',
    status: 'UPCOMING'
  },
  {
    id: 'usap_nationals_2025',
    title: 'USA Pickleball National Championships 2025',
    description: 'The largest amateur pickleball tournament in the world with over 3,000 players competing.',
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
    skillLevel: 'ALL',
    format: 'ALL',
    status: 'REGISTRATION_OPEN'
  },
  {
    id: 'ppa_world_champs_2025',
    title: 'PPA World Championships 2025',
    description: 'The pinnacle of professional pickleball - crown the world champions across all divisions.',
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
    prizeMoney: '$500,000',
    skillLevel: 'PRO',
    format: 'ALL',
    status: 'UPCOMING'
  },
  {
    id: 'mlp_vegas_finals_2025',
    title: 'MLP Vegas Season Finals 2025',
    description: 'The top 8 MLP teams compete for the championship in Las Vegas.',
    eventType: 'MLP_TOURNAMENT',
    startDate: '2025-12-12',
    endDate: '2025-12-14',
    location: 'Las Vegas, Nevada',
    city: 'Las Vegas',
    state: 'Nevada',
    venueName: 'Mandalay Bay Events Center',
    organizerName: 'Major League Pickleball',
    websiteUrl: 'https://majorleaguepickleball.net',
    prizeMoney: '$1,000,000',
    skillLevel: 'PRO',
    format: 'TEAM',
    status: 'UPCOMING'
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
