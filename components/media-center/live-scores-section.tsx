'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Trophy, 
  Users, 
  Clock, 
  MapPin, 
  Zap, 
  Crown, 
  Loader2,
  Radio,
  ChevronRight,
  Sparkles,
  Activity,
  Timer,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Match {
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
  round?: string;
}

interface LiveScoresSectionProps {
  tierAccess?: {
    canAccessLiveStreams: boolean;
    canAccessAdvancedFeatures: boolean;
    showUpgradePrompts: boolean;
  };
}

// Sample match data for demo - real pickleball tournaments
const SAMPLE_MATCHES: Match[] = [
  {
    id: 'live_1',
    tournament: 'PPA Mesa Arizona Grand Slam 2025',
    players: {
      team1: ['Ben Johns', 'Collin Johns'],
      team2: ['Riley Newman', 'Matt Wright']
    },
    score: {
      sets: [{ team1: 11, team2: 9 }, { team1: 8, team2: 11 }],
      currentSet: { team1: 9, team2: 7 }
    },
    status: 'live',
    format: 'doubles',
    startTime: new Date().toISOString(),
    court: 'Championship Court',
    round: 'Semifinal'
  },
  {
    id: 'live_2',
    tournament: 'PPA Mesa Arizona Grand Slam 2025',
    players: {
      team1: ['Anna Leigh Waters'],
      team2: ['Catherine Parenteau']
    },
    score: {
      sets: [{ team1: 11, team2: 6 }],
      currentSet: { team1: 5, team2: 3 }
    },
    status: 'live',
    format: 'singles',
    startTime: new Date().toISOString(),
    court: 'Court 2',
    round: 'Quarterfinal'
  },
  {
    id: 'upcoming_1',
    tournament: 'MLP Dallas Season Finals',
    players: {
      team1: ['Tyson McGuffin', 'Jay Devilliers'],
      team2: ['Federico Staksrud', 'Pablo Tellez']
    },
    score: { sets: [] },
    status: 'upcoming',
    format: 'doubles',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    court: 'Main Arena',
    round: 'Final'
  }
];

export function LiveScoresSection({ tierAccess }: LiveScoresSectionProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLiveScores();
    
    // Set up auto-refresh for live scores
    const interval = setInterval(fetchLiveScores, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [selectedTournament]);

  const fetchLiveScores = async () => {
    try {
      const params = selectedTournament ? `?tournamentId=${selectedTournament}` : '';
      const response = await fetch(`/api/media-center/live-scores${params}`);
      const data = await response.json();
      
      if (data.success) {
        setMatches(data.matches || []);
        setError(null);
      } else if (data.upgradeRequired) {
        setError('Live scores require a premium subscription');
      } else {
        setError(data.message || 'Failed to load live scores');
      }
    } catch (error) {
      console.error('Error fetching live scores:', error);
      setError('Connection error - showing sample data');
      // Show sample data on error
      setMatches(SAMPLE_MATCHES);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    try {
      return new Date(timeString).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return 'TBD';
    }
  };

  const liveMatches = matches.filter(m => m.status === 'live');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');

  if (loading) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Live Scores</h3>
              <p className="text-sm text-slate-500 font-normal">Loading matches...</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              {liveMatches.length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Live Scores</h3>
              <p className="text-sm text-slate-500 font-normal">Pro tournament action</p>
            </div>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {liveMatches.length > 0 && (
              <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white animate-pulse shadow-md">
                <Radio className="w-3 h-3 mr-1" />
                {liveMatches.length} LIVE
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchLiveScores}
              disabled={loading}
              className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {error && matches.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 mb-4">{error}</p>
            <Button onClick={fetchLiveScores} variant="outline" className="rounded-full">
              <Loader2 className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {/* Live Matches */}
              {liveMatches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className={cn(
                    "relative p-4 rounded-2xl transition-all duration-300",
                    "bg-gradient-to-r from-red-50 via-white to-rose-50",
                    "border-2 border-red-200 hover:border-red-300",
                    "hover:shadow-lg hover:shadow-red-500/10"
                  )}>
                    {/* Live Indicator */}
                    <div className="absolute -top-2 left-4">
                      <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg animate-pulse">
                        <span className="relative flex h-2 w-2 mr-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        LIVE
                      </Badge>
                    </div>

                    {/* Tournament Info */}
                    <div className="flex items-center justify-between mb-3 pt-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs bg-white/80">
                          {match.format === 'doubles' ? <Users className="w-3 h-3 mr-1" /> : <Target className="w-3 h-3 mr-1" />}
                          {match.format}
                        </Badge>
                        {match.round && (
                          <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                            <Crown className="w-3 h-3 mr-1" />
                            {match.round}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3" />
                        {match.court}
                      </div>
                    </div>

                    <p className="text-xs font-medium text-slate-600 mb-3">{match.tournament}</p>

                    {/* Match Score */}
                    <div className="space-y-3">
                      {/* Team 1 */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/80 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                            {match.players.team1[0].charAt(0)}
                          </div>
                          <span className="font-semibold text-sm text-slate-800">
                            {match.players.team1.join(' / ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {match.score.sets.map((set, idx) => (
                            <div 
                              key={idx} 
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                                set.team1 > set.team2 
                                  ? "bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-sm"
                                  : "bg-slate-100 text-slate-600"
                              )}
                            >
                              {set.team1}
                            </div>
                          ))}
                          {match.score.currentSet && (
                            <div className="w-10 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-gradient-to-br from-red-500 to-rose-500 text-white animate-pulse shadow-md">
                              {match.score.currentSet.team1}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Team 2 */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/80 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                            {match.players.team2[0].charAt(0)}
                          </div>
                          <span className="font-semibold text-sm text-slate-800">
                            {match.players.team2.join(' / ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {match.score.sets.map((set, idx) => (
                            <div 
                              key={idx} 
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                                set.team2 > set.team1 
                                  ? "bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-sm"
                                  : "bg-slate-100 text-slate-600"
                              )}
                            >
                              {set.team2}
                            </div>
                          ))}
                          {match.score.currentSet && (
                            <div className="w-10 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-gradient-to-br from-red-500 to-rose-500 text-white animate-pulse shadow-md">
                              {match.score.currentSet.team2}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Upcoming Matches */}
              {upcomingMatches.slice(0, 2).map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: (liveMatches.length + index) * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className={cn(
                    "relative p-4 rounded-2xl transition-all duration-300",
                    "bg-gradient-to-r from-blue-50/50 via-white to-cyan-50/50",
                    "border border-slate-200 hover:border-blue-200",
                    "hover:shadow-md"
                  )}>
                    {/* Upcoming Badge */}
                    <div className="absolute -top-2 left-4">
                      <Badge variant="outline" className="bg-white shadow-sm">
                        <Timer className="w-3 h-3 mr-1 text-blue-500" />
                        {formatTime(match.startTime)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between mb-2 pt-2">
                      <Badge variant="outline" className="text-xs">
                        {match.format === 'doubles' ? <Users className="w-3 h-3 mr-1" /> : <Target className="w-3 h-3 mr-1" />}
                        {match.format}
                      </Badge>
                      {match.round && (
                        <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                          {match.round}
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mb-2">{match.tournament}</p>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-slate-800">{match.players.team1.join(' / ')}</p>
                        <p className="text-xs text-slate-400">vs</p>
                        <p className="font-medium text-sm text-slate-800">{match.players.team2.join(' / ')}</p>
                      </div>
                      <div className="text-right text-xs text-slate-400">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {match.court}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {matches.length === 0 && !loading && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500">No matches right now</p>
                <p className="text-xs text-slate-400 mt-1">Check back during tournament hours</p>
              </div>
            )}
          </div>
        )}

        {/* View All Button */}
        {matches.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Button 
              variant="ghost" 
              className="w-full text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl"
            >
              View All Scores
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {error && matches.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-700 flex items-center gap-2">
              <Activity className="w-3 h-3" />
              {error} - Showing demo data
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
