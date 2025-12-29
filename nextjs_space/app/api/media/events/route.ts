
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Sample major events for 2025 from research data
const MAJOR_EVENTS_2025 = [
  {
    id: "usa-nationals-2025",
    name: "2025 USA Pickleball National Championships",
    organization: "USA Pickleball",
    dates: "November 15-23, 2025",
    startDate: "2025-11-15",
    endDate: "2025-11-23",
    location: "San Diego, CA",
    venue: "Barnes Tennis Center",
    website: "https://usapickleballnationals.com/",
    description: "The longest-standing and only National Championships in Pickleball",
    broadcast: "QVC+",
    expectedAttendance: "2,600+ players, 55,000+ spectators",
    ticketInfo: "Free admission to most courts, lottery for Championship Court",
    qualification: "Golden Ticket tournaments",
    economicImpact: "$3.6M+ estimated",
    type: "USA_PICKLEBALL",
    prizeAmount: 0,
    isActive: true,
    tier_requirement: "FREE"
  },
  {
    id: "us-open-2025",
    name: "2025 Minto US Open Pickleball Championships",
    organization: "Spirit Promotions LLC",
    dates: "April 26 - May 3, 2025",
    startDate: "2025-04-26",
    endDate: "2025-05-03",
    location: "Naples, FL",
    venue: "East Naples Community Park",
    website: "https://www.usopenpickleball.com/",
    description: "The Biggest Pickleball Party in the World",
    broadcast: "CBS Sports Network, Pickleball Channel",
    expectedAttendance: "55,000+ spectators, 3,500+ players",
    sponsors: ["Minto Communities", "Margaritaville", "Franklin Sports", "Skechers"],
    divisions: ["Professional", "Amateur", "Junior", "Senior", "Wheelchair"],
    prizeAmount: 163400,
    economicImpact: "$14M estimated",
    type: "MAJOR_TOURNAMENT",
    features: ["Largest Junior Championship", "Progressive draw format", "Live music", "Vendor village"],
    tier_requirement: "FREE"
  },
  {
    id: "ppa-worlds-2025",
    name: "PPA World Championships 2025",
    organization: "PPA Tour",
    dates: "November 3-9, 2025",
    startDate: "2025-11-03",
    endDate: "2025-11-09",
    location: "Dallas, TX",
    venue: "Brookhaven Country Club",
    website: "https://ppatour.com/",
    broadcast: "ESPN2 (Finals), Pickleball TV",
    finalsInfo: "November 9, 6-8 PM ET on ESPN2",
    streaming: "Fubo (free trial available)",
    type: "PPA_TOUR",
    prizeAmount: 0,
    tier_requirement: "FREE"
  },
  {
    id: "pickleball-slam-3",
    name: "Pickleball Slam 3",
    organization: "ESPN",
    dates: "February 16, 2025",
    startDate: "2025-02-16",
    endDate: "2025-02-16",
    broadcast: "ESPN",
    time: "4:00 PM ET",
    description: "Celebrity tennis icons playing pickleball",
    participants: ["Andre Agassi", "Steffi Graf", "Andy Roddick", "Eugenie Bouchard"],
    reair: "ESPNEWS, February 17, 5:00 PM ET",
    type: "CELEBRITY_EVENT",
    prizeAmount: 0,
    tier_requirement: "FREE"
  },
  {
    id: "app-championships-2025",
    name: "APP Tour Championships 2025",
    organization: "APP Tour",
    dates: "December 9-14, 2025",
    startDate: "2025-12-09",
    endDate: "2025-12-14",
    location: "Fort Lauderdale, FL",
    venue: "The Fort",
    website: "https://www.theapp.global/",
    description: "Major championship featuring Humana Cup and APP Passport winners",
    type: "APP_TOUR",
    prizeAmount: 0,
    tier_requirement: "PREMIUM"
  },
  {
    id: "mlp-cup-2025",
    name: "MLP Cup 2025",
    organization: "Major League Pickleball",
    dates: "October 31 - November 2, 2025",
    startDate: "2025-10-31",
    endDate: "2025-11-02",
    website: "https://majorleaguepickleball.co/",
    prizeAmount: 50000,
    description: "Season-ending championship for team-based competition",
    format: "Team competition with DreamBreaker tiebreaker",
    type: "MLP",
    tier_requirement: "PREMIUM"
  }
];

function getUserTier(session: any): 'FREE' | 'TRIAL' | 'PREMIUM' | 'PRO' {
  return session ? 'TRIAL' : 'FREE'; 
}

function getDaysUntilEvent(dateString: string): number {
  const eventDate = new Date(dateString);
  const today = new Date();
  const diffTime = eventDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const upcoming = searchParams.get('upcoming') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const userTier = getUserTier(session);
    
    let filteredEvents = MAJOR_EVENTS_2025.filter(event => {
      // Tier-based filtering
      if (userTier === 'FREE' && event.tier_requirement === 'PREMIUM') {
        return false;
      }
      return true;
    });
    
    // Apply type filter
    if (type && type !== 'all') {
      filteredEvents = filteredEvents.filter(event => 
        event.type.toLowerCase().includes(type.toLowerCase())
      );
    }
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEvents = filteredEvents.filter(event =>
        event.name.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower) ||
        event.organization.toLowerCase().includes(searchLower) ||
        event.location?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply upcoming filter
    if (upcoming) {
      const today = new Date();
      filteredEvents = filteredEvents.filter(event => 
        new Date(event.startDate) >= today
      );
    }
    
    // Sort by start date
    filteredEvents.sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    
    // Add calculated fields
    const eventsWithCalculations = filteredEvents.slice(0, limit).map(event => ({
      ...event,
      daysUntil: getDaysUntilEvent(event.startDate),
      status: getDaysUntilEvent(event.startDate) < 0 ? 'past' as const : 
               getDaysUntilEvent(event.startDate) === 0 ? 'today' as const : 'upcoming' as const,
      isHighlighted: ['usa-nationals-2025', 'us-open-2025', 'ppa-worlds-2025'].includes(event.id)
    }));
    
    // Get statistics
    const stats = {
      total: filteredEvents.length,
      upcoming: filteredEvents.filter(e => getDaysUntilEvent(e.startDate) >= 0).length,
      thisMonth: filteredEvents.filter(e => {
        const eventDate = new Date(e.startDate);
        const today = new Date();
        return eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear();
      }).length,
      majorEvents: eventsWithCalculations.filter(e => e.isHighlighted).length
    };
    
    return NextResponse.json({
      success: true,
      events: eventsWithCalculations,
      totalCount: filteredEvents.length,
      userTier,
      stats,
      availableTypes: [
        { id: 'ppa_tour', name: 'PPA Tour' },
        { id: 'app_tour', name: 'APP Tour' },
        { id: 'mlp', name: 'Major League Pickleball' },
        { id: 'usa_pickleball', name: 'USA Pickleball' },
        { id: 'celebrity', name: 'Celebrity Events' }
      ],
      availableOrganizations: [
        'PPA Tour', 'APP Tour', 'Major League Pickleball', 'USA Pickleball', 'ESPN'
      ]
    });
    
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { action, eventId } = await request.json();
    
    switch (action) {
      case 'remind':
        // In a real app, this would create a reminder in the database
        // For now, we'll just return success
        return NextResponse.json({ 
          success: true, 
          message: 'Reminder set! You\'ll be notified before the event.' 
        });
        
      case 'addToCalendar':
        // Generate calendar data for the event
        const event = MAJOR_EVENTS_2025.find(e => e.id === eventId);
        if (!event) {
          return NextResponse.json(
            { success: false, error: 'Event not found' },
            { status: 404 }
          );
        }
        
        const calendarData = {
          title: event.name,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location ? `${event.location}${event.venue ? `, ${event.venue}` : ''}` : event.venue,
          url: event.website
        };
        
        return NextResponse.json({ 
          success: true, 
          calendarData,
          message: 'Event details prepared for calendar.' 
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Error handling event action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
