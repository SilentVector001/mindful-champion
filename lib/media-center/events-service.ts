
import { ApiCache } from './api-cache';
import { prisma } from '@/lib/db';
import { ExternalEventType, TournamentFormat, TournamentStatus, SkillLevel } from '@/lib/prisma-types';

export interface AllPickleballTournamentsEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location: string;
  city: string;
  state: string;
  country: string;
  venue_name?: string;
  organizer_name?: string;
  website_url?: string;
  registration_url?: string;
  prize_money?: string;
  skill_levels: string[];
  formats: string[];
  event_type: string;
}

export class EventsService {
  private static readonly ALL_PICKLEBALL_API_KEY = process.env.ALL_PICKLEBALL_API_KEY || 'demo_key';
  private static readonly BASE_URL = 'https://www.allpickleballtournaments.com/api/v1';

  static async syncUpcomingEvents(): Promise<void> {
    console.log('Starting events sync...');
    
    try {
      // Get events from external APIs
      const allPickleballEvents = await this.fetchAllPickleballEvents();
      
      // Sync events to database
      for (const event of allPickleballEvents) {
        await this.syncEvent(event);
      }

      // Add our curated events (PPA World Championships, USA Pickleball Nationals, etc.)
      await this.addCuratedEvents();
      
      console.log('Events sync completed');
    } catch (error) {
      console.error('Error syncing events:', error);
    }
  }

  private static async fetchAllPickleballEvents(): Promise<AllPickleballTournamentsEvent[]> {
    const cacheKey = 'all_pickleball_events';
    
    // Try cache first (4 hour cache for events)
    const cached = await ApiCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${this.BASE_URL}/events`, {
        headers: {
          'Authorization': `Bearer ${this.ALL_PICKLEBALL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`AllPickleballTournaments API failed: ${response.status}`);
      }

      const data = await response.json();
      const events = data.events || [];
      
      await ApiCache.set(cacheKey, events, 240); // 4 hour cache
      return events;
    } catch (error) {
      console.error('Error fetching AllPickleballTournaments events:', error);
      return this.getSampleEvents();
    }
  }

  private static async syncEvent(apiEvent: AllPickleballTournamentsEvent): Promise<void> {
    try {
      // Check if event already exists
      const existingEvent = await prisma.externalEvent.findUnique({
        where: { externalId: apiEvent.id }
      });

      if (existingEvent) {
        // Update existing event
        await prisma.externalEvent.update({
          where: { id: existingEvent.id },
          data: {
            title: apiEvent.title,
            description: apiEvent.description,
            startDate: new Date(apiEvent.start_date),
            endDate: new Date(apiEvent.end_date),
            location: `${apiEvent.city}, ${apiEvent.state}`,
            city: apiEvent.city,
            state: apiEvent.state,
            country: apiEvent.country,
            venueName: apiEvent.venue_name,
            organizerName: apiEvent.organizer_name,
            websiteUrl: apiEvent.website_url,
            registrationUrl: apiEvent.registration_url,
            prizeMoney: apiEvent.prize_money,
            skillLevel: this.parseSkillLevel(apiEvent.skill_levels),
            format: this.parseFormat(apiEvent.formats),
            eventType: this.parseEventType(apiEvent.event_type),
            lastSyncedAt: new Date(),
            metadata: JSON.parse(JSON.stringify({
              originalData: apiEvent
            }))
          }
        });
      } else {
        // Create new event
        await prisma.externalEvent.create({
          data: {
            title: apiEvent.title,
            description: apiEvent.description,
            eventType: this.parseEventType(apiEvent.event_type),
            startDate: new Date(apiEvent.start_date),
            endDate: new Date(apiEvent.end_date),
            location: `${apiEvent.city}, ${apiEvent.state}`,
            city: apiEvent.city,
            state: apiEvent.state,
            country: apiEvent.country,
            venueName: apiEvent.venue_name,
            organizerName: apiEvent.organizer_name,
            websiteUrl: apiEvent.website_url,
            registrationUrl: apiEvent.registration_url,
            prizeMoney: apiEvent.prize_money,
            skillLevel: this.parseSkillLevel(apiEvent.skill_levels),
            format: this.parseFormat(apiEvent.formats),
            status: this.parseStatus(apiEvent.start_date),
            externalId: apiEvent.id,
            apiSource: 'allpickleballtournaments',
            lastSyncedAt: new Date(),
            metadata: JSON.parse(JSON.stringify({
              originalData: apiEvent
            }))
          }
        });
      }
    } catch (error) {
      console.error(`Error syncing event ${apiEvent.id}:`, error);
    }
  }

  private static async addCuratedEvents(): Promise<void> {
    const curatedEvents = [
      {
        title: 'PPA World Championships 2025',
        description: 'The pinnacle of professional pickleball competition featuring the world\'s best players competing for the largest prize pool in the sport.',
        eventType: 'PPA_TOURNAMENT' as ExternalEventType,
        startDate: new Date('2025-11-03'),
        endDate: new Date('2025-11-09'),
        location: 'Farmers Branch, Texas',
        city: 'Farmers Branch',
        state: 'Texas',
        country: 'USA',
        venueName: 'Farmers Branch Historical Park',
        organizerName: 'Professional Pickleball Association',
        websiteUrl: 'https://ppatour.com/tournaments/world-championships',
        registrationUrl: 'https://ppatour.com/register/world-championships',
        prizeMoney: '$300,000',
        skillLevel: 'PRO' as SkillLevel,
        format: 'DOUBLES' as TournamentFormat,
        status: 'UPCOMING' as TournamentStatus,
        externalId: 'ppa_worlds_2025',
        apiSource: 'curated'
      },
      {
        title: 'USA Pickleball National Championships 2025',
        description: 'The largest amateur pickleball tournament in the world with over 3,000 players competing across all age and skill divisions.',
        eventType: 'USA_PICKLEBALL_TOURNAMENT' as ExternalEventType,
        startDate: new Date('2025-11-15'),
        endDate: new Date('2025-11-23'),
        location: 'San Diego, California',
        city: 'San Diego',
        state: 'California',
        country: 'USA',
        venueName: 'Balboa Park',
        organizerName: 'USA Pickleball',
        websiteUrl: 'https://usapickleball.org/tournaments/nationals',
        registrationUrl: 'https://usapickleball.org/register/nationals',
        skillLevel: 'INTERMEDIATE' as SkillLevel,
        format: 'DOUBLES' as TournamentFormat,
        status: 'REGISTRATION_OPEN' as TournamentStatus,
        externalId: 'usa_pb_nationals_2025',
        apiSource: 'curated'
      },
      {
        title: 'APP Mesa Open 2025 - Golden Ticket Event',
        description: 'Win your way to the APP Championships in this Golden Ticket tournament featuring top professional players.',
        eventType: 'GOLDEN_TICKET_EVENT' as ExternalEventType,
        startDate: new Date('2025-11-05'),
        endDate: new Date('2025-11-09'),
        location: 'Mesa, Arizona',
        city: 'Mesa',
        state: 'Arizona',
        country: 'USA',
        venueName: 'Mesa Convention Center',
        organizerName: 'Association of Pickleball Professionals',
        websiteUrl: 'https://appickleball.com/tournaments/mesa-open',
        registrationUrl: 'https://appickleball.com/register/mesa-open',
        prizeMoney: '$75,000',
        skillLevel: 'ADVANCED' as SkillLevel,
        format: 'DOUBLES' as TournamentFormat,
        status: 'REGISTRATION_OPEN' as TournamentStatus,
        externalId: 'app_mesa_2025',
        apiSource: 'curated'
      }
    ];

    for (const event of curatedEvents) {
      try {
        await prisma.externalEvent.upsert({
          where: { externalId: event.externalId },
          update: {
            ...event,
            lastSyncedAt: new Date()
          },
          create: {
            ...event,
            lastSyncedAt: new Date()
          }
        });
      } catch (error) {
        console.error(`Error adding curated event ${event.title}:`, error);
      }
    }
  }

  static async getUpcomingEvents(limit = 20): Promise<any[]> {
    try {
      const events = await prisma.externalEvent.findMany({
        where: {
          startDate: {
            gte: new Date()
          },
          isActive: true
        },
        orderBy: { startDate: 'asc' },
        take: limit
      });
      return events;
    } catch (error) {
      console.error('Error fetching upcoming events from database:', error);
      return []; // Return empty array on error
    }
  }

  static async getEventsByType(eventType: ExternalEventType, limit = 10): Promise<any[]> {
    try {
      const events = await prisma.externalEvent.findMany({
        where: {
          eventType,
          startDate: {
            gte: new Date()
          },
          isActive: true
        },
        orderBy: { startDate: 'asc' },
        take: limit
      });
      return events;
    } catch (error) {
      console.error('Error fetching events by type from database:', error);
      return []; // Return empty array on error
    }
  }

  static async searchEvents(query: string, limit = 20): Promise<any[]> {
    try {
      const events = await prisma.externalEvent.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } },
            { organizerName: { contains: query, mode: 'insensitive' } }
          ],
          startDate: {
            gte: new Date()
          },
          isActive: true
        },
        orderBy: { startDate: 'asc' },
        take: limit
      });
      return events;
    } catch (error) {
      console.error('Error searching events in database:', error);
      return []; // Return empty array on error
    }
  }

  // Helper methods for parsing API data
  private static parseEventType(eventType: string): ExternalEventType {
    const typeMap: Record<string, ExternalEventType> = {
      'ppa': 'PPA_TOURNAMENT',
      'mlp': 'MLP_TOURNAMENT',
      'app': 'APP_TOURNAMENT',
      'usa_pickleball': 'USA_PICKLEBALL_TOURNAMENT',
      'golden_ticket': 'GOLDEN_TICKET_EVENT',
      'local': 'LOCAL_TOURNAMENT',
      'professional': 'PROFESSIONAL_MATCH'
    };
    
    return typeMap[eventType?.toLowerCase()] || 'OTHER';
  }

  private static parseSkillLevel(skillLevels: string[]): SkillLevel {
    if (skillLevels?.some(level => level.toLowerCase().includes('pro'))) {
      return 'PRO';
    }
    if (skillLevels?.some(level => level.toLowerCase().includes('advanced'))) {
      return 'ADVANCED';
    }
    if (skillLevels?.some(level => level.toLowerCase().includes('intermediate'))) {
      return 'INTERMEDIATE';
    }
    return 'BEGINNER';
  }

  private static parseFormat(formats: string[]): TournamentFormat {
    if (formats?.some(format => format.toLowerCase().includes('mixed'))) {
      return 'MIXED_DOUBLES';
    }
    if (formats?.some(format => format.toLowerCase().includes('doubles'))) {
      return 'DOUBLES';
    }
    if (formats?.some(format => format.toLowerCase().includes('singles'))) {
      return 'SINGLES';
    }
    return 'DOUBLES';
  }

  private static parseStatus(startDate: string): TournamentStatus {
    const now = new Date();
    const eventStart = new Date(startDate);
    
    if (eventStart > now) {
      return 'UPCOMING';
    } else {
      return 'IN_PROGRESS';
    }
  }

  // Sample events for development
  private static getSampleEvents(): AllPickleballTournamentsEvent[] {
    return [
      {
        id: 'sample_1',
        title: 'Fall Championship Series',
        description: 'Regional championship tournament',
        start_date: '2025-11-20',
        end_date: '2025-11-22',
        location: 'Austin, TX',
        city: 'Austin',
        state: 'Texas',
        country: 'USA',
        venue_name: 'Austin Pickleball Complex',
        organizer_name: 'Texas Pickleball Association',
        website_url: 'https://texaspickleball.com',
        registration_url: 'https://texaspickleball.com/register',
        prize_money: '$15,000',
        skill_levels: ['intermediate', 'advanced'],
        formats: ['doubles', 'mixed_doubles'],
        event_type: 'local'
      }
    ];
  }
}
