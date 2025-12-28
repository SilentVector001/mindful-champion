// Tournament Data Types

export interface TournamentData {
  id: string;
  name: string;
  description?: string;
  city: string;
  state: string;
  startDate: Date;
  endDate: Date;
  status: string;
  location?: string;
  prizePool?: number;
  points?: number;
  isFeatured?: boolean;
  tier?: string;
  registrationUrl?: string;
}

export const TOURNAMENT_CATEGORIES = [
  'PPA Tour',
  'APP Tour',
  'MLP',
  'Local'
];

export const US_STATES = [
  { name: 'Alabama', abbr: 'AL' },
  { name: 'Alaska', abbr: 'AK' },
  { name: 'Arizona', abbr: 'AZ' },
  { name: 'California', abbr: 'CA' },
  { name: 'Colorado', abbr: 'CO' },
  { name: 'Florida', abbr: 'FL' },
  { name: 'Georgia', abbr: 'GA' },
  { name: 'Texas', abbr: 'TX' },
];

export const FEATURED_TOURNAMENTS: TournamentData[] = [];
export const ALL_TOURNAMENTS: TournamentData[] = [];

export async function getUpcomingTournaments(): Promise<TournamentData[]> {
  return [];
}

export function calculateTournamentStats(tournaments?: TournamentData[]) {
  const data = tournaments || ALL_TOURNAMENTS;
  return {
    total: data.length,
    totalTournaments: data.length,
    upcoming: data.filter(t => t.status === 'UPCOMING').length,
    completed: data.filter(t => t.status === 'COMPLETED').length,
    totalPrize: data.reduce((sum, t) => sum + (t.prizePool || 0), 0),
    statesCovered: [...new Set(data.map(t => t.state))].length,
    ppaTourEvents: 0,
    appTourEvents: 0,
    majorEvents: 0,
  };
}
