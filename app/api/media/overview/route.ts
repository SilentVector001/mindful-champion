
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic'

function getUserTier(session: any): 'FREE' | 'TRIAL' | 'PREMIUM' | 'PRO' {
  return session ? 'TRIAL' : 'FREE'; 
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userTier = getUserTier(session);
    
    // Get quick stats
    const [streamingPlatformsCount, tournamentOrgsCount] = await Promise.all([
      prisma.streamingPlatform.count({ where: { isActive: true } }),
      prisma.tournamentOrganization.count({ where: { isActive: true } })
    ]);
    
    // Get featured streaming platforms (free ones first)
    const featuredPlatforms = await prisma.streamingPlatform.findMany({
      where: { 
        isActive: true,
        OR: [
          { type: 'FREE' },
          { hasFreeAccess: true }
        ]
      },
      orderBy: [
        { type: 'asc' },
        { viewCount: 'desc' }
      ],
      take: 6
    });
    
    // Mock data for featured content (since we don't have these models yet)
    const featuredPodcasts = [
      {
        id: "picklepod",
        name: "PicklePod",
        hosts: ["Zane Navratil", "Thomas Shields"],
        rating: 4.6,
        description: "The top pickleball podcast covering tournament recaps and strategies"
      },
      {
        id: "it-feels-right", 
        name: "It Feels Right",
        hosts: ["Rob Nunnery", "Adam Stone"],
        rating: 4.9,
        description: "Pro game insights and amateur improvement tips"
      },
      {
        id: "pickleball-studio",
        name: "Pickleball Studio",
        hosts: ["Chris Olson", "Will Chaing"],
        rating: 4.8,
        description: "Unbiased paddle reviews and educational content"
      }
    ];
    
    const upcomingEvents = [
      {
        id: "pickleball-slam-3",
        name: "Pickleball Slam 3",
        date: "February 16, 2025",
        daysUntil: Math.ceil((new Date('2025-02-16').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        organization: "ESPN",
        broadcast: "ESPN"
      },
      {
        id: "us-open-2025",
        name: "2025 US Open",
        date: "April 26 - May 3, 2025",
        daysUntil: Math.ceil((new Date('2025-04-26').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        location: "Naples, FL",
        broadcast: "CBS Sports Network"
      },
      {
        id: "ppa-worlds-2025",
        name: "PPA World Championships",
        date: "November 3-9, 2025",
        daysUntil: Math.ceil((new Date('2025-11-03').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        location: "Dallas, TX",
        broadcast: "ESPN2"
      }
    ].filter(event => event.daysUntil > 0).slice(0, 3);
    
    // Live indicators (mock data for demonstration)
    const liveIndicators = {
      liveStreams: 2,
      activeScores: 8,
      upcomingEvents: upcomingEvents.length
    };
    
    // User's tier access information
    const tierInfo = {
      currentTier: userTier,
      trialDaysLeft: userTier === 'TRIAL' ? 12 : null, // Mock trial days
      features: {
        FREE: ['Basic podcast access', 'Event schedules', 'Free streaming platforms', 'Live scores'],
        TRIAL: ['All FREE features', 'Premium podcasts', 'All streaming platforms', 'Event reminders', 'Bookmarking'],
        PREMIUM: ['All TRIAL features', 'Download content', 'Advanced analytics', 'Priority support'],
        PRO: ['All PREMIUM features', 'Exclusive content', 'Early access', 'Personal coaching integration']
      }[userTier]
    };
    
    return NextResponse.json({
      success: true,
      overview: {
        stats: {
          podcasts: 18, // Static count from research data
          streamingPlatforms: streamingPlatformsCount,
          tournamentOrganizations: tournamentOrgsCount,
          upcomingEvents: 6 // Static count from research data
        },
        featuredContent: {
          podcasts: featuredPodcasts,
          streamingPlatforms: featuredPlatforms,
          upcomingEvents
        },
        liveIndicators,
        tierInfo,
        userTier
      }
    });
    
  } catch (error) {
    console.error('Error fetching media overview:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch overview' },
      { status: 500 }
    );
  }
}
