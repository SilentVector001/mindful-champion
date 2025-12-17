
import { ApiCache } from './api-cache';

export interface BetsApiMatch {
  id: string;
  league: string;
  home: string;
  away: string;
  time: string;
  time_status: string;
  score: {
    home: string;
    away: string;
  };
  stats?: {
    home_sets?: number;
    away_sets?: number;
  };
}

export interface ProcessedMatch {
  id: string;
  tournament: string;
  players: {
    team1: string[];
    team2: string[];
  };
  score: {
    sets: Array<{ team1: number; team2: number }>;
    currentSet?: { team1: number; team2: number };
  };
  status: 'upcoming' | 'live' | 'completed';
  format: 'singles' | 'doubles';
  startTime: string;
  court?: string;
}

export class LiveScoresService {
  private static readonly BETS_API_KEY = process.env.BETS_API_KEY || 'demo_key';
  private static readonly SPORT_ID = 'pickleball'; // BetsAPI sport identifier

  static async getLiveScores(): Promise<ProcessedMatch[]> {
    const cacheKey = 'live_scores:current';
    
    // Try cache first (1 minute cache for live data)
    const cached = await ApiCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Get live matches from BetsAPI
      const liveMatches = await this.fetchBetsApiData('inplay');
      
      // Get upcoming matches
      const upcomingMatches = await this.fetchBetsApiData('upcoming');

      const allMatches = [...liveMatches, ...upcomingMatches];
      const processedMatches = allMatches.map(this.processMatch).filter((match): match is ProcessedMatch => match !== null);

      await ApiCache.set(cacheKey, processedMatches, 1); // 1 minute cache
      return processedMatches;
    } catch (error) {
      console.error('Error fetching live scores:', error);
      return this.getSampleLiveScores();
    }
  }

  static async getTournamentMatches(tournamentId: string): Promise<ProcessedMatch[]> {
    const cacheKey = `tournament_matches:${tournamentId}`;
    
    const cached = await ApiCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const matches = await this.fetchBetsApiData('upcoming', { league_id: tournamentId });
      const processedMatches = matches.map(this.processMatch).filter((match): match is ProcessedMatch => match !== null);
      
      await ApiCache.set(cacheKey, processedMatches, 10); // 10 minute cache
      return processedMatches;
    } catch (error) {
      console.error(`Error fetching tournament matches for ${tournamentId}:`, error);
      return [];
    }
  }

  private static async fetchBetsApiData(endpoint: string, params: Record<string, string> = {}): Promise<BetsApiMatch[]> {
    // Check if API key is configured (not demo_key)
    if (this.BETS_API_KEY === 'demo_key' || !this.BETS_API_KEY) {
      console.warn('[LiveScoresService] BetsAPI key not configured. Using sample data.');
      throw new Error('BetsAPI key not configured');
    }

    const url = new URL(`https://api.betsapi.com/v1/bet365/${endpoint}`);
    url.searchParams.set('sport_id', this.SPORT_ID);
    url.searchParams.set('token', this.BETS_API_KEY);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('[LiveScoresService] BetsAPI authentication failed (401). Check API key.');
        } else if (response.status === 403) {
          console.error('[LiveScoresService] BetsAPI access forbidden (403). Check API permissions.');
        } else {
          console.error(`[LiveScoresService] BetsAPI request failed: ${response.status} ${response.statusText}`);
        }
        throw new Error(`BetsAPI request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if API returned an error in the response body
      if (data.error) {
        console.error('[LiveScoresService] BetsAPI error:', data.error);
        throw new Error(`BetsAPI error: ${data.error}`);
      }
      
      return data?.results || [];
    } catch (error) {
      // Re-throw to be caught by the caller
      if (error instanceof Error) {
        console.error('[LiveScoresService] Fetch error:', error.message);
      }
      throw error;
    }
  }

  private static processMatch(match: BetsApiMatch): ProcessedMatch | null {
    try {
      // Parse player names (assuming format like "John/Jane vs Bob/Alice" for doubles)
      const [team1Str, team2Str] = match.home && match.away 
        ? [match.home, match.away]
        : match.id.split(' vs ');

      const team1Players = team1Str?.includes('/') 
        ? team1Str.split('/')
        : [team1Str];
      
      const team2Players = team2Str?.includes('/') 
        ? team2Str.split('/')
        : [team2Str];

      const format = team1Players.length > 1 ? 'doubles' : 'singles';

      // Parse score
      const sets: Array<{ team1: number; team2: number }> = [];
      if (match.score?.home && match.score?.away) {
        // Assuming score format like "11-9,6-11,8-4" for sets
        const scoreStr = `${match.score.home}-${match.score.away}`;
        const setParts = scoreStr.split(',');
        
        setParts.forEach(set => {
          const [t1, t2] = set.split('-').map(Number);
          if (!isNaN(t1) && !isNaN(t2)) {
            sets.push({ team1: t1, team2: t2 });
          }
        });
      }

      // Determine status
      let status: 'upcoming' | 'live' | 'completed' = 'upcoming';
      if (match.time_status === 'inplay') {
        status = 'live';
      } else if (match.time_status === 'ended') {
        status = 'completed';
      }

      return {
        id: match.id,
        tournament: match.league || 'Unknown Tournament',
        players: {
          team1: team1Players,
          team2: team2Players
        },
        score: {
          sets,
          currentSet: status === 'live' && sets.length > 0 
            ? sets[sets.length - 1] 
            : undefined
        },
        status,
        format,
        startTime: match.time,
        court: undefined // BetsAPI doesn't provide court info
      };
    } catch (error) {
      console.error('Error processing match:', error);
      return null;
    }
  }

  // Sample data for development/fallback
  static getSampleLiveScores(): ProcessedMatch[] {
    return [
      {
        id: 'sample_1',
        tournament: 'PPA Mesa Masters 2025',
        players: {
          team1: ['Ben Johns', 'Collin Johns'],
          team2: ['Riley Newman', 'Matt Wright']
        },
        score: {
          sets: [
            { team1: 11, team2: 9 },
            { team1: 8, team2: 11 }
          ],
          currentSet: { team1: 7, team2: 5 }
        },
        status: 'live',
        format: 'doubles',
        startTime: new Date().toISOString(),
        court: 'Court 1'
      },
      {
        id: 'sample_2',
        tournament: 'USA Pickleball Nationals 2025',
        players: {
          team1: ['Anna Leigh Waters'],
          team2: ['Catherine Parenteau']
        },
        score: {
          sets: [
            { team1: 11, team2: 7 },
            { team1: 11, team2: 9 }
          ]
        },
        status: 'completed',
        format: 'singles',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        court: 'Championship Court'
      },
      {
        id: 'sample_3',
        tournament: 'APP Phoenix Open 2025',
        players: {
          team1: ['Tyson McGuffin', 'Federico Staksrud'],
          team2: ['JW Johnson', 'Dylan Frazier']
        },
        score: {
          sets: []
        },
        status: 'upcoming',
        format: 'doubles',
        startTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
        court: 'Court 3'
      }
    ];
  }
}
