'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Play, Clock, Calendar, MapPin, Users, Star, TrendingUp, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { format, isToday, isFuture, isPast } from 'date-fns';

interface TournamentMatch {
  id: string;
  tournamentName: string;
  round: string;
  court: string;
  player1: string;
  player2: string;
  player1Score: number | null;
  player2Score: number | null;
  status: 'LIVE' | 'UPCOMING' | 'COMPLETED';
  startTime: string;
  location: string;
}

interface TournamentHighlight {
  id: string;
  tournamentName: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'MATCH_POINT' | 'UPSET' | 'COMEBACK' | 'RECORD';
}

export default function LiveTournamentScoreboard() {
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [highlights, setHighlights] = useState<TournamentHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'live' | 'upcoming' | 'completed'>('live');

  useEffect(() => {
    fetchTournamentData();
    // Refresh every 30 seconds for live updates
    const interval = setInterval(fetchTournamentData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTournamentData = async () => {
    try {
      // Fetch live tournament data
      const response = await fetch('/api/tournaments/live-scores');
      const data = await response.json();
      setMatches(data.matches || getMockMatches());
      setHighlights(data.highlights || getMockHighlights());
    } catch (error) {
      console.error('Error fetching tournament data:', error);
      // Use mock data as fallback
      setMatches(getMockMatches());
      setHighlights(getMockHighlights());
    } finally {
      setLoading(false);
    }
  };

  const getMockMatches = (): TournamentMatch[] => {
    return [
      {
        id: '1',
        tournamentName: 'PPA Dallas Open',
        round: 'Semifinals',
        court: 'Stadium Court 1',
        player1: 'Ben Johns / Collin Johns',
        player2: 'Dylan Frazier / JW Johnson',
        player1Score: 11,
        player2Score: 8,
        status: 'LIVE',
        startTime: new Date().toISOString(),
        location: 'Dallas, TX',
      },
      {
        id: '2',
        tournamentName: 'PPA Dallas Open',
        round: 'Semifinals',
        court: 'Court 2',
        player1: 'Anna Leigh Waters / Catherine Parenteau',
        player2: 'Anna Bright / Jorja Johnson',
        player1Score: 7,
        player2Score: 9,
        status: 'LIVE',
        startTime: new Date().toISOString(),
        location: 'Dallas, TX',
      },
      {
        id: '3',
        tournamentName: 'MLP Premier Level',
        round: 'Quarterfinals',
        court: 'Court 3',
        player1: 'Tyson McGuffin / Riley Newman',
        player2: 'Federico Staksrud / Jay Devilliers',
        player1Score: null,
        player2Score: null,
        status: 'UPCOMING',
        startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        location: 'Columbus, OH',
      },
      {
        id: '4',
        tournamentName: 'PPA Dallas Open',
        round: 'Quarterfinals',
        court: 'Court 4',
        player1: 'Zane Navratil / Hayden Patriquin',
        player2: 'Matt Wright / Alex Newhook',
        player1Score: 11,
        player2Score: 6,
        status: 'COMPLETED',
        startTime: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        location: 'Dallas, TX',
      },
      {
        id: '5',
        tournamentName: 'MLP Premier Level',
        round: 'Round of 16',
        court: 'Court 5',
        player1: 'Jessie Irvine / Vivienne David',
        player2: 'Lea Jansen / Etta Wright',
        player1Score: 11,
        player2Score: 13,
        status: 'COMPLETED',
        startTime: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        location: 'Columbus, OH',
      },
      {
        id: '6',
        tournamentName: 'APP Miami Open',
        round: 'Finals',
        court: 'Championship Court',
        player1: 'Christian Alshon / Julian Arnold',
        player2: 'Connor Garnett / AJ Koller',
        player1Score: null,
        player2Score: null,
        status: 'UPCOMING',
        startTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
        location: 'Miami, FL',
      },
    ];
  };

  const getMockHighlights = (): TournamentHighlight[] => {
    return [
      {
        id: '1',
        tournamentName: 'PPA Dallas Open',
        title: 'MASSIVE UPSET! Underdog duo takes down #1 seeds',
        description: 'In a stunning turn of events, the unseeded pair defeated the tournament favorites in straight games.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        type: 'UPSET',
      },
      {
        id: '2',
        tournamentName: 'MLP Premier Level',
        title: 'Anna Leigh Waters hits 120mph drive winner',
        description: 'The 18-year-old phenom showcases incredible power with a record-breaking shot.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: 'RECORD',
      },
      {
        id: '3',
        tournamentName: 'PPA Dallas Open',
        title: 'Epic 5-game comeback in quarterfinals',
        description: 'Down 0-2, the Johns brothers storm back to win 3-2 in a thriller.',
        timestamp: new Date(Date.now() - 5400000).toISOString(),
        type: 'COMEBACK',
      },
    ];
  };

  const getMatchesByStatus = (status: string) => {
    return matches.filter(m => m.status.toLowerCase() === status);
  };

  const getHighlightIcon = (type: string) => {
    switch (type) {
      case 'UPSET': return '🔥';
      case 'RECORD': return '⚡';
      case 'COMEBACK': return '💪';
      default: return '🏓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'bg-red-500/10 text-red-700 border-red-300 animate-pulse';
      case 'UPCOMING': return 'bg-blue-500/10 text-blue-700 border-blue-300';
      case 'COMPLETED': return 'bg-slate-500/10 text-slate-700 border-slate-300';
      default: return 'bg-slate-500/10 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl mb-2">
                <Activity className="h-8 w-8 animate-pulse" />
                Live Tournament Scoreboard
              </CardTitle>
              <p className="text-white/90 text-sm">
                Real-time scores, highlights, and results from today's tournaments
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/80 mb-1">Last Updated</div>
              <div className="text-lg font-bold">{format(new Date(), 'h:mm a')}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <Play className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {getMatchesByStatus('live').length}
                </div>
                <div className="text-sm text-slate-600">Live Matches</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {getMatchesByStatus('upcoming').length}
                </div>
                <div className="text-sm text-slate-600">Upcoming</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {getMatchesByStatus('completed').length}
                </div>
                <div className="text-sm text-slate-600">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Highlights Feed */}
      {highlights.length > 0 && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Today's Highlights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {highlights.map((highlight) => (
              <div
                key={highlight.id}
                className="flex items-start gap-3 p-4 bg-white rounded-lg border border-purple-100 hover:shadow-md transition-shadow"
              >
                <div className="text-2xl">{getHighlightIcon(highlight.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {highlight.tournamentName}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {format(new Date(highlight.timestamp), 'h:mm a')}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1">
                    {highlight.title}
                  </h4>
                  <p className="text-sm text-slate-600">
                    {highlight.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Match View Tabs */}
      <Tabs value={activeView} onValueChange={(v: any) => setActiveView(v)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live" className="gap-2">
            <Play className="h-4 w-4" />
            Live ({getMatchesByStatus('live').length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="gap-2">
            <Clock className="h-4 w-4" />
            Upcoming ({getMatchesByStatus('upcoming').length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <Trophy className="h-4 w-4" />
            Results ({getMatchesByStatus('completed').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-6 space-y-4">
          {getMatchesByStatus('live').length === 0 ? (
            <Card className="p-12 text-center">
              <Play className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Live Matches</h3>
              <p className="text-slate-600">Check back soon for live tournament action!</p>
            </Card>
          ) : (
            getMatchesByStatus('live').map((match) => (
              <Card key={match.id} className="border-red-200 bg-gradient-to-br from-red-50 to-white hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Tournament Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(match.status)}>
                          <Activity className="h-3 w-3 mr-1" />
                          LIVE
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Trophy className="h-4 w-4" />
                          <span className="font-semibold">{match.tournamentName}</span>
                          <span>•</span>
                          <span>{match.round}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span>{match.location}</span>
                      </div>
                    </div>

                    {/* Court Info */}
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Users className="h-4 w-4" />
                      <span>{match.court}</span>
                    </div>

                    {/* Score Display */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-slate-200">
                        <div className="flex-1">
                          <div className="font-semibold text-lg text-slate-900">{match.player1}</div>
                        </div>
                        <div className="text-3xl font-bold text-red-600 min-w-[60px] text-right">
                          {match.player1Score ?? '-'}
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-slate-200">
                        <div className="flex-1">
                          <div className="font-semibold text-lg text-slate-900">{match.player2}</div>
                        </div>
                        <div className="text-3xl font-bold text-slate-600 min-w-[60px] text-right">
                          {match.player2Score ?? '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6 space-y-4">
          {getMatchesByStatus('upcoming').length === 0 ? (
            <Card className="p-12 text-center">
              <Clock className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Upcoming Matches</h3>
              <p className="text-slate-600">All scheduled matches for today have concluded.</p>
            </Card>
          ) : (
            getMatchesByStatus('upcoming').map((match) => (
              <Card key={match.id} className="border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(match.status)}>
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(match.startTime), 'h:mm a')}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Trophy className="h-4 w-4" />
                          <span className="font-semibold">{match.tournamentName}</span>
                          <span>•</span>
                          <span>{match.round}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span>{match.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Users className="h-4 w-4" />
                      <span>{match.court}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-4 bg-white rounded-lg border border-slate-200">
                        <div className="font-semibold text-slate-900">{match.player1}</div>
                      </div>
                      <div className="text-center text-sm text-slate-500 font-semibold">VS</div>
                      <div className="p-4 bg-white rounded-lg border border-slate-200">
                        <div className="font-semibold text-slate-900">{match.player2}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6 space-y-4">
          {getMatchesByStatus('completed').length === 0 ? (
            <Card className="p-12 text-center">
              <Trophy className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Results Yet</h3>
              <p className="text-slate-600">Completed match results will appear here.</p>
            </Card>
          ) : (
            getMatchesByStatus('completed').map((match) => (
              <Card key={match.id} className="border-slate-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(match.status)}>
                          <Trophy className="h-3 w-3 mr-1" />
                          Final
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Trophy className="h-4 w-4" />
                          <span className="font-semibold">{match.tournamentName}</span>
                          <span>•</span>
                          <span>{match.round}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span>{match.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Users className="h-4 w-4" />
                      <span>{match.court}</span>
                    </div>

                    <div className="space-y-3">
                      <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                        (match.player1Score ?? 0) > (match.player2Score ?? 0)
                          ? 'bg-green-50 border-green-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex-1 flex items-center gap-2">
                          {(match.player1Score ?? 0) > (match.player2Score ?? 0) && (
                            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                          )}
                          <div className="font-semibold text-slate-900">{match.player1}</div>
                        </div>
                        <div className={`text-2xl font-bold min-w-[50px] text-right ${
                          (match.player1Score ?? 0) > (match.player2Score ?? 0)
                            ? 'text-green-600'
                            : 'text-slate-600'
                        }`}>
                          {match.player1Score}
                        </div>
                      </div>
                      <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                        (match.player2Score ?? 0) > (match.player1Score ?? 0)
                          ? 'bg-green-50 border-green-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex-1 flex items-center gap-2">
                          {(match.player2Score ?? 0) > (match.player1Score ?? 0) && (
                            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                          )}
                          <div className="font-semibold text-slate-900">{match.player2}</div>
                        </div>
                        <div className={`text-2xl font-bold min-w-[50px] text-right ${
                          (match.player2Score ?? 0) > (match.player1Score ?? 0)
                            ? 'text-green-600'
                            : 'text-slate-600'
                        }`}>
                          {match.player2Score}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
