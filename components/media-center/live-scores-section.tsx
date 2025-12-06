
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Users, Clock, MapPin, Zap, Crown, Loader2 } from 'lucide-react';

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
}

interface LiveScoresSectionProps {
  tierAccess?: {
    canAccessLiveStreams: boolean;
    canAccessAdvancedFeatures: boolean;
    showUpgradePrompts: boolean;
  };
}

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
      setMatches([
        {
          id: 'sample_1',
          tournament: 'PPA Mesa Masters 2025',
          players: {
            team1: ['Ben Johns', 'Collin Johns'],
            team2: ['Riley Newman', 'Matt Wright']
          },
          score: {
            sets: [{ team1: 11, team2: 9 }, { team1: 8, team2: 11 }],
            currentSet: { team1: 7, team2: 5 }
          },
          status: 'live',
          format: 'doubles',
          startTime: new Date().toISOString(),
          court: 'Court 1'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500 text-white animate-pulse';
      case 'completed': return 'bg-green-500 text-white';
      case 'upcoming': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return <Zap className="w-4 h-4" />;
      case 'completed': return <Trophy className="w-4 h-4" />;
      case 'upcoming': return <Clock className="w-4 h-4" />;
      default: return null;
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

  // Removed paywall - show live scores to all users (sample data for non-premium)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Live Scores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error && matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Live Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchLiveScores} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Live Scores
            <Badge variant="outline" className="ml-2">
              {matches.filter(m => m.status === 'live').length} Live
            </Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchLiveScores}
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AnimatePresence>
            {matches.map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getStatusColor(match.status)}>
                        {getStatusIcon(match.status)}
                        <span className="ml-1 capitalize">{match.status}</span>
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {match.format}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {match.tournament}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(match.startTime)}
                    </div>
                    {match.court && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {match.court}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Team 1 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {match.players.team1.join(' / ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {match.score.sets.map((set, idx) => (
                        <Badge 
                          key={idx} 
                          variant={set.team1 > set.team2 ? 'default' : 'outline'}
                          className="min-w-[2.5rem] justify-center"
                        >
                          {set.team1}
                        </Badge>
                      ))}
                      {match.score.currentSet && match.status === 'live' && (
                        <Badge 
                          variant="destructive" 
                          className="min-w-[2.5rem] justify-center animate-pulse"
                        >
                          {match.score.currentSet.team1}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Team 2 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {match.players.team2.join(' / ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {match.score.sets.map((set, idx) => (
                        <Badge 
                          key={idx} 
                          variant={set.team2 > set.team1 ? 'default' : 'outline'}
                          className="min-w-[2.5rem] justify-center"
                        >
                          {set.team2}
                        </Badge>
                      ))}
                      {match.score.currentSet && match.status === 'live' && (
                        <Badge 
                          variant="destructive" 
                          className="min-w-[2.5rem] justify-center animate-pulse"
                        >
                          {match.score.currentSet.team2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {match.status === 'live' && (
                  <div className="mt-3 pt-2 border-t">
                    <Badge variant="destructive" className="animate-pulse">
                      <Zap className="w-3 h-3 mr-1" />
                      LIVE NOW
                    </Badge>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {matches.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No matches available right now</p>
              <p className="text-sm">Check back later for live scores</p>
            </div>
          )}
        </div>

        {error && matches.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
