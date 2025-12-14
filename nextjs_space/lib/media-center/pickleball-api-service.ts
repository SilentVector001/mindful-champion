
import { ApiCache } from './api-cache';

export interface PickleballTournament {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  venueName?: string;
  registrationUrl?: string;
  prizeMoney?: string;
  skillLevels: string[];
  formats: string[];
  status: 'upcoming' | 'registration_open' | 'in_progress' | 'completed';
  organizerName?: string;
  websiteUrl?: string;
}

export interface LiveScore {
  matchId: string;
  tournament: string;
  player1: string;
  player2: string;
  player3?: string;
  player4?: string;
  format: 'singles' | 'doubles' | 'mixed_doubles';
  score: {
    set1: { team1: number; team2: number };
    set2?: { team1: number; team2: number };
    set3?: { team1: number; team2: number };
  };
  status: 'upcoming' | 'live' | 'completed';
  startTime?: string;
  courtNumber?: number;
}

export interface InstructionalVideo {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  duration: number;
  instructor: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  category: string;
  tags: string[];
}

export class PickleballApiService {
  private static readonly BASE_URL = 'https://api.pickleball.com';
  private static readonly API_TOKEN = process.env.PICKLEBALL_API_TOKEN || '';

  private static async makeRequest(endpoint: string, cacheMinutes = 30): Promise<any> {
    const cacheKey = `pickleball_api:${endpoint}`;
    
    // Try cache first
    const cached = await ApiCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${this.API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      await ApiCache.set(cacheKey, data, cacheMinutes);
      return data;
    } catch (error) {
      console.error(`Pickleball API error for ${endpoint}:`, error);
      
      // Return sample data for development if API fails
      return this.getSampleData(endpoint);
    }
  }

  static async getTournaments(limit = 20): Promise<PickleballTournament[]> {
    const data = await this.makeRequest(`/v1/tournaments?limit=${limit}`, 60);
    return data?.tournaments || this.getSampleTournaments();
  }

  static async getLiveScores(limit = 10): Promise<LiveScore[]> {
    const data = await this.makeRequest(`/v1/live-scores?limit=${limit}`, 2); // Short cache for live data
    return data?.matches || this.getSampleLiveScores();
  }

  static async getInstructionalVideos(skillLevel?: string, category?: string): Promise<InstructionalVideo[]> {
    let endpoint = '/v1/instructional-videos';
    const params = new URLSearchParams();
    
    if (skillLevel) params.append('skill_level', skillLevel);
    if (category) params.append('category', category);
    if (params.toString()) endpoint += `?${params.toString()}`;

    const data = await this.makeRequest(endpoint, 120);
    return data?.videos || this.getSampleInstructionalVideos();
  }

  // Sample data for development/fallback
  private static getSampleData(endpoint: string): any {
    if (endpoint.includes('tournaments')) {
      return { tournaments: this.getSampleTournaments() };
    }
    if (endpoint.includes('live-scores')) {
      return { matches: this.getSampleLiveScores() };
    }
    if (endpoint.includes('instructional-videos')) {
      return { videos: this.getSampleInstructionalVideos() };
    }
    return {};
  }

  private static getSampleTournaments(): PickleballTournament[] {
    return [
      {
        id: '1',
        name: 'PPA World Championships 2025',
        description: 'The pinnacle of professional pickleball competition',
        startDate: '2025-11-03',
        endDate: '2025-11-09',
        location: 'Farmers Branch, Texas',
        venueName: 'Farmers Branch Historical Park',
        prizeMoney: '$300,000',
        skillLevels: ['pro', 'advanced'],
        formats: ['singles', 'doubles', 'mixed_doubles'],
        status: 'upcoming',
        organizerName: 'Professional Pickleball Association',
        registrationUrl: 'https://ppatour.com/tournaments/world-championships',
        websiteUrl: 'https://ppatour.com'
      },
      {
        id: '2',
        name: 'USA Pickleball National Championships 2025',
        description: 'The largest amateur pickleball tournament in the world',
        startDate: '2025-11-15',
        endDate: '2025-11-23',
        location: 'San Diego, CA',
        venueName: 'Indian Wells Tennis Garden',
        skillLevels: ['beginner', 'intermediate', 'advanced'],
        formats: ['singles', 'doubles', 'mixed_doubles'],
        status: 'registration_open',
        organizerName: 'USA Pickleball',
        registrationUrl: 'https://usapickleball.org/tournaments/nationals',
        websiteUrl: 'https://usapickleball.org'
      },
      {
        id: '3',
        name: 'APP Mesa Open 2025',
        description: 'Golden Ticket Tournament - Win your way to APP Championships',
        startDate: '2025-11-05',
        endDate: '2025-11-09',
        location: 'Mesa, Arizona',
        venueName: 'Mesa Convention Center',
        prizeMoney: '$75,000',
        skillLevels: ['intermediate', 'advanced', 'pro'],
        formats: ['doubles', 'mixed_doubles'],
        status: 'registration_open',
        organizerName: 'Association of Pickleball Professionals',
        websiteUrl: 'https://appickleball.com'
      }
    ];
  }

  private static getSampleLiveScores(): LiveScore[] {
    return [
      {
        matchId: '1',
        tournament: 'PPA Mesa Masters',
        player1: 'Ben Johns',
        player2: 'Collin Johns',
        player3: 'Anna Leigh Waters',
        player4: 'Catherine Parenteau',
        format: 'doubles',
        score: {
          set1: { team1: 11, team2: 9 },
          set2: { team1: 8, team2: 11 },
          set3: { team1: 6, team2: 4 }
        },
        status: 'live',
        courtNumber: 1
      },
      {
        matchId: '2',
        tournament: 'APP Phoenix Open',
        player1: 'Tyson McGuffin',
        player2: 'Federico Staksrud',
        format: 'singles',
        score: {
          set1: { team1: 11, team2: 7 },
          set2: { team1: 11, team2: 5 }
        },
        status: 'completed',
        courtNumber: 2
      }
    ];
  }

  private static getSampleInstructionalVideos(): InstructionalVideo[] {
    return [
      {
        id: '1',
        title: 'Mastering the Third Shot Drop',
        description: 'Learn the most important shot in pickleball with detailed breakdowns and practice drills',
        url: 'https://youtube.com/watch?v=sample1',
        thumbnailUrl: 'https://i.ytimg.com/vi/tcNUc7tNC9g/mqdefault.jpg',
        duration: 480, // 8 minutes
        instructor: 'Simone Jardim',
        skillLevel: 'intermediate',
        category: 'technique',
        tags: ['third shot drop', 'strategy', 'fundamentals']
      },
      {
        id: '2',
        title: 'Advanced Dinking Strategies',
        description: 'Take your net game to the next level with advanced dinking techniques and positioning',
        url: 'https://youtube.com/watch?v=sample2',
        thumbnailUrl: 'https://i.ytimg.com/vi/2xta-_iMrGY/maxresdefault.jpg',
        duration: 720, // 12 minutes
        instructor: 'Ben Johns',
        skillLevel: 'advanced',
        category: 'strategy',
        tags: ['dinking', 'net play', 'positioning']
      }
    ];
  }
}
