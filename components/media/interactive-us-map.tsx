'use client';

import { useState, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Trophy, Calendar, Target, X, Radio, Video, Users, Play, MapPinned, TrendingUp, Zap, Eye, BarChart3, Building, Globe, Activity, Flame } from 'lucide-react';
import { mediaDesignTokens } from '@/lib/media-design-system';

// US States GeoJSON topology URL
const US_STATES_TOPO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

interface TournamentEvent {
  id: string;
  name: string;
  state: string;
  city: string;
  venue: string;
  date: Date;
  isLive: boolean;
  status: 'live' | 'upcoming' | 'today' | 'completed';
  streamUrl?: string;
  websiteUrl?: string;
  organization: string;
  description?: string;
  viewerCount?: number;
}

interface CourtActivity {
  courtNumber: string;
  courtName: string;
  venue: string;
  currentMatch: string;
  nextMatch?: string;
  isLive: boolean;
  streamUrl?: string;
  platform: string;
}

interface StateInfo {
  name: string;
  abbr: string;
  eventCount: number;
  liveCount: number;
  streamingCount: number;
  upcomingCount: number;
  events: TournamentEvent[];
  courts: CourtActivity[];
}

interface InteractiveUSMapProps {
  tournaments: TournamentEvent[];
  courts?: CourtActivity[];
  venues?: Array<{ state: string; courtsCount: number; upcomingCount: number }>;
  onStateClick?: (stateAbbr: string) => void;
}

// State abbreviations to full names mapping
const STATE_NAMES: { [key: string]: string } = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
  'DC': 'District of Columbia'
};

export function InteractiveUSMap({ tournaments, courts, venues, onStateClick }: InteractiveUSMapProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [stateData, setStateData] = useState<Map<string, StateInfo>>(new Map());

  useEffect(() => {
    // Aggregate tournament data by state
    const dataMap = new Map<string, StateInfo>();
    
    tournaments.forEach(tournament => {
      const state = tournament.state?.toUpperCase();
      if (!state || state === '' || state === 'NATIONWIDE') return;
      
      if (!dataMap.has(state)) {
        dataMap.set(state, {
          name: STATE_NAMES[state] || state,
          abbr: state,
          eventCount: 0,
          liveCount: 0,
          streamingCount: 0,
          upcomingCount: 0,
          events: [],
          courts: []
        });
      }
      
      const info = dataMap.get(state)!;
      info.eventCount++;
      if (tournament.isLive) info.liveCount++;
      if (tournament.streamUrl) info.streamingCount++;
      if (tournament.status === 'upcoming') info.upcomingCount++;
      info.events.push(tournament);
    });

    // Add court/score data by extracting state from venue names
    courts?.forEach(court => {
      // Try to match venue to state from existing venues data
      const matchingVenue = venues?.find(v => court.venue.includes(v.state));
      const state = matchingVenue?.state?.toUpperCase();
      
      if (state && dataMap.has(state)) {
        const info = dataMap.get(state)!;
        info.courts.push(court);
      }
    });

    // Add venue data
    venues?.forEach(venue => {
      const state = venue.state?.toUpperCase();
      if (!state || state === '' || state === 'NATIONWIDE') return;
      
      if (dataMap.has(state)) {
        const info = dataMap.get(state)!;
        info.upcomingCount += venue.upcomingCount;
      }
    });

    setStateData(dataMap);
  }, [tournaments, courts, venues]);

  const getStateColor = (stateAbbr: string) => {
    const info = stateData.get(stateAbbr);
    
    if (!info || info.eventCount === 0) {
      return '#E5E7EB'; // Gray for no events
    }
    
    // Enhanced color coding based on event types
    const hasLive = info.liveCount > 0;
    const hasStreaming = info.streamingCount > 0;
    const hasUpcoming = info.upcomingCount > 0;
    const hasCourts = info.courts.length > 0;
    
    // Multiple event types - use gradient/brighter color
    const typeCount = [hasLive, hasStreaming, hasUpcoming, hasCourts].filter(Boolean).length;
    
    if (typeCount >= 3) {
      return '#8B5CF6'; // Purple for multiple active types
    }
    
    if (hasLive) {
      return '#EF4444'; // Red for live tournaments
    }
    
    if (hasStreaming && hasUpcoming) {
      return '#EC4899'; // Pink for streaming + upcoming
    }
    
    if (hasStreaming) {
      return '#A855F7'; // Purple for streaming events
    }
    
    if (hasUpcoming) {
      return '#F59E0B'; // Orange for upcoming tournaments
    }
    
    return '#3B82F6'; // Blue for general events
  };

  const handleStateClick = (stateAbbr: string) => {
    const info = stateData.get(stateAbbr);
    if (info && info.eventCount > 0) {
      setSelectedState(stateAbbr);
      onStateClick?.(stateAbbr);
    }
  };

  const selectedInfo = selectedState ? stateData.get(selectedState) : null;
  const hoveredInfo = hoveredState ? stateData.get(hoveredState) : null;

  // Get live tournaments for quick view
  const liveTournaments = Array.from(stateData.values())
    .filter(state => state.liveCount > 0 || state.streamingCount > 0)
    .sort((a, b) => b.liveCount - a.liveCount)
    .slice(0, 8); // Show top 8 live states

  // Calculate state activity summary
  const stateActivitySummary = useMemo(() => {
    const activeStates = Array.from(stateData.values()).filter(s => s.eventCount > 0);
    const totalEvents = activeStates.reduce((sum, s) => sum + s.eventCount, 0);
    const totalLive = activeStates.reduce((sum, s) => sum + s.liveCount, 0);
    const totalStreaming = activeStates.reduce((sum, s) => sum + s.streamingCount, 0);
    const totalUpcoming = activeStates.reduce((sum, s) => sum + s.upcomingCount, 0);
    
    // Top 5 most active states
    const topStates = activeStates
      .sort((a, b) => (b.eventCount + b.liveCount * 3) - (a.eventCount + a.liveCount * 3))
      .slice(0, 5);
    
    return { activeStates: activeStates.length, totalEvents, totalLive, totalStreaming, totalUpcoming, topStates };
  }, [stateData]);

  return (
    <div className="space-y-4">
      {/* Main Grid Layout - Map with Side Panels */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* LEFT PANEL: Live Events Panel */}
        <div className="col-span-12 lg:col-span-3">
          <Card className="h-full overflow-hidden border-2 border-red-500/30 bg-gradient-to-br from-slate-800/90 to-red-950/30 shadow-xl shadow-red-500/10">
            <CardHeader className="bg-gradient-to-r from-red-600 to-rose-600 py-3 px-4">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Radio className="w-5 h-5 animate-pulse" />
                </motion.div>
                <span className="font-bold">Live Events</span>
                <Badge className="bg-white/20 text-white ml-auto">
                  {stateActivitySummary.totalLive}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
              {liveTournaments.length > 0 ? (
                liveTournaments.map((state, idx) => (
                  <motion.div
                    key={state.abbr}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02] ${
                      state.liveCount > 0 
                        ? 'bg-gradient-to-r from-red-900/50 to-rose-900/50 border border-red-500/50 hover:border-red-400' 
                        : 'bg-slate-800/50 border border-slate-700 hover:border-teal-500/50'
                    }`}
                    onClick={() => handleStateClick(state.abbr)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${state.liveCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`} />
                        <span className="font-bold text-white text-sm">{state.abbr}</span>
                        <span className="text-xs text-slate-400">{state.name}</span>
                      </div>
                      {state.liveCount > 0 && (
                        <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5">LIVE</Badge>
                      )}
                    </div>
                    
                    {/* Event previews */}
                    {state.events.slice(0, 2).map((event, i) => (
                      <div key={event.id} className="text-xs text-slate-300 pl-4 py-1 border-l-2 border-slate-700 mb-1">
                        <div className="font-medium text-white truncate">{event.name}</div>
                        <div className="text-slate-400">{event.venue}</div>
                      </div>
                    ))}
                    
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {state.eventCount} events
                      </span>
                      {state.streamingCount > 0 && (
                        <span className="text-purple-400 flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          {state.streamingCount} streaming
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Radio className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No live events</p>
                  <p className="text-xs text-slate-500">Check back soon!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CENTER: Tournament Map */}
        <div className="col-span-12 lg:col-span-6">
          <Card className="overflow-hidden border-2 border-slate-700 shadow-lg h-full">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 py-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Globe className="w-5 h-5 text-teal-400" />
                  <span className="text-lg font-bold">Tournament Map</span>
                </CardTitle>
                
                {/* Enhanced Legend - Updated colors */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="font-medium text-slate-300">Live</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#8B5CF6' }} />
                    <span className="font-medium text-slate-300">Multiple</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#A855F7' }} />
                    <span className="font-medium text-slate-300">Streaming</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="font-medium text-slate-300">Upcoming</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                    <span className="font-medium text-slate-300">None</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-3 bg-gradient-to-br from-slate-900/50 to-indigo-950/50">
              {/* Map container */}
              <div className="relative w-full" style={{ paddingBottom: '65%' }}>
                <div className="absolute inset-0">
                  <ComposableMap
                    projection="geoAlbersUsa"
                    projectionConfig={{
                      scale: 500,
                    }}
                    width={800}
                    height={500}
                  >
                    <Geographies geography={US_STATES_TOPO_URL}>
                      {({ geographies }) =>
                        geographies.map((geo) => {
                          const stateId = geo.id;
                          const stateName = geo.properties?.name || '';
                          // Find state abbreviation
                          const stateAbbr = Object.keys(STATE_NAMES).find(
                            (abbr) => STATE_NAMES[abbr] === stateName
                          );
                          
                          const fillColor = stateAbbr ? getStateColor(stateAbbr) : '#E5E7EB';
                          const isHovered = hoveredState === stateAbbr;
                          const isSelected = selectedState === stateAbbr;
                          
                          return (
                            <Geography
                              key={stateId}
                              geography={geo}
                              fill={fillColor}
                              stroke="#FFFFFF"
                              strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 0.75}
                              style={{
                                default: {
                                  outline: 'none',
                                  transition: 'all 0.2s ease-in-out',
                                },
                                hover: {
                                  fill: fillColor,
                                  outline: 'none',
                                  stroke: '#14B8A6',
                                  strokeWidth: 2,
                                  cursor: stateAbbr && stateData.get(stateAbbr)?.eventCount ? 'pointer' : 'default',
                                },
                                pressed: {
                                  fill: fillColor,
                                  outline: 'none',
                                },
                              }}
                              onMouseEnter={() => stateAbbr && setHoveredState(stateAbbr)}
                              onMouseLeave={() => setHoveredState(null)}
                              onClick={() => stateAbbr && handleStateClick(stateAbbr)}
                            />
                          );
                        })
                      }
                    </Geographies>
                  </ComposableMap>

                  {/* Hover Tooltip */}
                  <AnimatePresence>
                    {hoveredInfo && hoveredState && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-4 left-4 pointer-events-none z-20"
                      >
                        <Card className="bg-slate-800/95 backdrop-blur-md shadow-xl border-2 border-teal-500/50">
                          <CardContent className="p-3 space-y-1">
                            <div className="font-bold text-white">{hoveredInfo.name}</div>
                            <div className="flex items-center gap-4 text-sm">
                              <Badge className="bg-teal-500/30 text-teal-300 border-teal-500/50">
                                {hoveredInfo.eventCount} Events
                              </Badge>
                              {hoveredInfo.liveCount > 0 && (
                                <Badge className="bg-red-500/30 text-red-300 border-red-500/50 animate-pulse">
                                  {hoveredInfo.liveCount} Live
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL: State Activity Summary */}
        <div className="col-span-12 lg:col-span-3">
          <Card className="h-full overflow-hidden border-2 border-teal-500/30 bg-gradient-to-br from-slate-800/90 to-teal-950/30 shadow-xl shadow-teal-500/10">
            <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 py-3 px-4">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <BarChart3 className="w-5 h-5" />
                <span className="font-bold">Activity Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-2">
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  className="p-3 rounded-xl bg-gradient-to-br from-red-900/40 to-rose-900/40 border border-red-500/30"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                    <span className="text-xs text-red-300 font-medium">Live Now</span>
                  </div>
                  <div className="text-2xl font-black text-white">{stateActivitySummary.totalLive}</div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  className="p-3 rounded-xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Video className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-purple-300 font-medium">Streaming</span>
                  </div>
                  <div className="text-2xl font-black text-white">{stateActivitySummary.totalStreaming}</div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  className="p-3 rounded-xl bg-gradient-to-br from-orange-900/40 to-amber-900/40 border border-orange-500/30"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    <span className="text-xs text-orange-300 font-medium">Upcoming</span>
                  </div>
                  <div className="text-2xl font-black text-white">{stateActivitySummary.totalUpcoming}</div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  className="p-3 rounded-xl bg-gradient-to-br from-teal-900/40 to-cyan-900/40 border border-teal-500/30"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-teal-400" />
                    <span className="text-xs text-teal-300 font-medium">States</span>
                  </div>
                  <div className="text-2xl font-black text-white">{stateActivitySummary.activeStates}</div>
                </motion.div>
              </div>
              
              {/* Top Active States */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-bold text-white">Hottest States</span>
                </div>
                <div className="space-y-2">
                  {stateActivitySummary.topStates.map((state, idx) => (
                    <motion.div
                      key={state.abbr}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 cursor-pointer transition-all"
                      onClick={() => handleStateClick(state.abbr)}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-yellow-900' :
                        idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800' :
                        idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-amber-100' :
                        'bg-slate-600 text-slate-300'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{state.abbr}</span>
                          <span className="text-xs text-slate-400 truncate">{state.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-teal-400">{state.eventCount} events</span>
                          {state.liveCount > 0 && (
                            <span className="text-red-400 flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                              {state.liveCount} live
                            </span>
                          )}
                        </div>
                      </div>
                      <Activity className="w-4 h-4 text-teal-400" />
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Total Events Banner */}
              <motion.div 
                className="mt-4 p-4 rounded-xl bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border border-teal-500/30"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-center">
                  <div className="text-xs text-teal-300 font-medium mb-1">Total Events Nationwide</div>
                  <div className="text-3xl font-black text-white">{stateActivitySummary.totalEvents}</div>
                  <div className="text-xs text-slate-400 mt-1">across {stateActivitySummary.activeStates} states</div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comprehensive State Details - Organized by Category */}
      <AnimatePresence>
        {selectedInfo && selectedState && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-2 border-teal-500/50 shadow-xl bg-slate-800/90">
              <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 py-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-teal-400" />
                    <CardTitle className="text-lg text-white">{selectedInfo.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Badge className="bg-teal-500/30 text-teal-300 border-teal-500/50 text-xs">
                        {selectedInfo.eventCount} Events
                      </Badge>
                      {selectedInfo.liveCount > 0 && (
                        <Badge className="bg-red-500/30 text-red-300 border-red-500/50 text-xs animate-pulse">
                          {selectedInfo.liveCount} LIVE
                        </Badge>
                      )}
                      {selectedInfo.streamingCount > 0 && (
                        <Badge className="bg-purple-500/30 text-purple-300 border-purple-500/50 text-xs">
                          {selectedInfo.streamingCount} Streaming
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedState(null)}
                    className="rounded-full h-7 w-7 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-6">
                
                {/* Current Tournaments Section */}
                {selectedInfo.events.filter(e => e.status === 'live' || e.status === 'today').length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b-2 border-teal-200">
                      <Trophy className="w-5 h-5 text-red-600" />
                      <h3 className="font-bold text-gray-900">Current Tournaments</h3>
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-300">
                        {selectedInfo.events.filter(e => e.status === 'live' || e.status === 'today').length} Active
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedInfo.events
                        .filter(e => e.status === 'live' || e.status === 'today')
                        .map((event) => (
                        <Card key={event.id} className="border-2 border-red-200 bg-red-50/30 hover:border-red-400 transition-all hover:shadow-lg">
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight">{event.name}</h4>
                              {event.isLive && (
                                <Badge className="bg-red-600 text-white text-xs animate-pulse shrink-0 shadow-lg">
                                  LIVE
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-1 text-xs text-gray-700">
                              <div className="flex items-center gap-1.5">
                                <MapPinned className="w-3 h-3 text-red-600 shrink-0" />
                                <span className="line-clamp-1 font-medium">{event.venue}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-red-600 shrink-0" />
                                <span>{event.city}, {event.state}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 text-red-600 shrink-0" />
                                <span>{new Date(event.date).toLocaleDateString()}</span>
                              </div>
                              {event.organization && (
                                <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">
                                  {event.organization}
                                </Badge>
                              )}
                            </div>
                            {event.viewerCount && (
                              <div className="flex items-center gap-1 text-xs text-gray-600 bg-white/70 rounded px-2 py-1">
                                <Users className="w-3 h-3 text-red-600" />
                                <span className="font-semibold">{event.viewerCount.toLocaleString()} watching</span>
                              </div>
                            )}
                            {/* Stream Button - Direct and Prominent */}
                            {event.streamUrl && event.streamUrl.trim() !== '' && event.streamUrl.startsWith('http') ? (
                              <Button
                                size="sm"
                                className="w-full text-xs h-8 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(event.streamUrl, '_blank');
                                }}
                              >
                                <Radio className="w-3 h-3 mr-1 animate-pulse" />
                                Watch Live Stream
                              </Button>
                            ) : event.websiteUrl && event.websiteUrl.trim() !== '' && event.websiteUrl.startsWith('http') ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-xs h-7 bg-white hover:bg-red-50 border-red-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(event.websiteUrl, '_blank');
                                }}
                              >
                                <Trophy className="w-3 h-3 mr-1" />
                                View Details
                              </Button>
                            ) : null}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming Tournaments Section */}
                {selectedInfo.events.filter(e => e.status === 'upcoming').length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b-2 border-orange-200">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      <h3 className="font-bold text-gray-900">Upcoming Tournaments</h3>
                      <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">
                        {selectedInfo.events.filter(e => e.status === 'upcoming').length} Scheduled
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedInfo.events
                        .filter(e => e.status === 'upcoming')
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((event) => {
                          const daysUntil = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          return (
                            <Card key={event.id} className="border-2 border-orange-200 bg-orange-50/30 hover:border-orange-400 transition-all hover:shadow-lg">
                              <CardContent className="p-3 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight">{event.name}</h4>
                                  {daysUntil <= 7 && (
                                    <Badge className="bg-orange-600 text-white text-xs shrink-0">
                                      {daysUntil}d
                                    </Badge>
                                  )}
                                </div>
                                <div className="space-y-1 text-xs text-gray-700">
                                  <div className="flex items-center gap-1.5">
                                    <MapPinned className="w-3 h-3 text-orange-600 shrink-0" />
                                    <span className="line-clamp-1 font-medium">{event.venue}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3 text-orange-600 shrink-0" />
                                    <span>{event.city}, {event.state}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3 text-orange-600 shrink-0" />
                                    <span className="font-medium">{new Date(event.date).toLocaleDateString()}</span>
                                  </div>
                                  {daysUntil > 0 && (
                                    <div className="flex items-center gap-1.5 text-orange-700">
                                      <Trophy className="w-3 h-3" />
                                      <span className="font-semibold">
                                        {daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                                      </span>
                                    </div>
                                  )}
                                  {event.organization && (
                                    <Badge className="bg-orange-500/30 text-orange-300 border-orange-500/50 text-xs">
                                      {event.organization}
                                    </Badge>
                                  )}
                                </div>
                                {event.websiteUrl && event.websiteUrl.trim() !== '' && event.websiteUrl.startsWith('http') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full text-xs h-7 bg-white hover:bg-orange-50 border-orange-300"
                                    onClick={() => window.open(event.websiteUrl, '_blank')}
                                  >
                                    <Trophy className="w-3 h-3 mr-1" />
                                    View Details
                                  </Button>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Live Streams Section - Enhanced with Functional Buttons & Proper Video Thumbnails */}
                {selectedInfo.events.filter(e => e.streamUrl && e.streamUrl.trim() !== '' && e.streamUrl.startsWith('http')).length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b-2 border-purple-200">
                      <Video className="w-5 h-5 text-purple-600" />
                      <h3 className="font-bold text-gray-900">Live Streams Available</h3>
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
                        {selectedInfo.events.filter(e => e.streamUrl && e.streamUrl.trim() !== '' && e.streamUrl.startsWith('http')).length} Streams
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedInfo.events
                        .filter(e => e.streamUrl && e.streamUrl.trim() !== '' && e.streamUrl.startsWith('http'))
                        .map((event) => (
                        <Card key={event.id} className="border-2 border-purple-200 bg-purple-50/30 hover:border-purple-400 transition-all hover:shadow-lg overflow-hidden">
                          <CardContent className="p-0">
                            {/* Stream Thumbnail - Larger and Fully Visible */}
                            <div 
                              className="relative w-full h-40 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center group cursor-pointer overflow-hidden"
                              onClick={() => {
                                if (event.streamUrl && event.streamUrl.trim() !== '' && event.streamUrl.startsWith('http')) {
                                  window.open(event.streamUrl, '_blank');
                                }
                              }}
                            >
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all" />
                              <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-purple-600 group-hover:bg-purple-700 flex items-center justify-center shadow-xl transition-all group-hover:scale-110">
                                  <Play className="w-8 h-8 text-white ml-0.5" />
                                </div>
                                <Badge className="bg-red-600 text-white text-sm animate-pulse shadow-lg">
                                  WATCH LIVE
                                </Badge>
                              </div>
                              {event.viewerCount && (
                                <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                                  <Users className="w-3 h-3" />
                                  <span className="font-semibold">{event.viewerCount.toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Stream Details */}
                            <div className="p-3 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight">{event.name}</h4>
                                {event.isLive && (
                                  <Badge className="bg-red-600 text-white text-xs animate-pulse shrink-0">
                                    LIVE
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1 text-xs text-gray-700">
                                <div className="flex items-center gap-1.5">
                                  <MapPinned className="w-3 h-3 text-purple-600 shrink-0" />
                                  <span className="line-clamp-1">{event.venue}</span>
                                </div>
                                {event.organization && (
                                  <Badge className="bg-purple-500/30 text-purple-300 border-purple-500/50 text-xs">
                                    {event.organization}
                                  </Badge>
                                )}
                              </div>
                              {event.streamUrl && event.streamUrl.trim() !== '' && event.streamUrl.startsWith('http') && (
                                <Button
                                  size="sm"
                                  className="w-full text-xs h-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (event.streamUrl && event.streamUrl.trim() !== '' && event.streamUrl.startsWith('http')) {
                                      window.open(event.streamUrl, '_blank');
                                    }
                                  }}
                                >
                                  <Play className="w-3 h-3 mr-1" />
                                  Watch Stream
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Scores Section */}
                {selectedInfo.courts.filter(c => c.isLive).length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b-2 border-green-200">
                      <Radio className="w-5 h-5 text-green-600 animate-pulse" />
                      <h3 className="font-bold text-gray-900">Live Scores</h3>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                        {selectedInfo.courts.filter(c => c.isLive).length} Active Matches
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedInfo.courts
                        .filter(c => c.isLive)
                        .map((court, idx) => (
                        <Card key={idx} className="border-2 border-green-200 bg-green-50/30 hover:border-green-400 transition-all hover:shadow-lg">
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="font-bold text-sm text-gray-900">{court.courtNumber}</div>
                                <Badge className="bg-green-600 text-white text-xs animate-pulse shadow-lg">
                                  LIVE
                                </Badge>
                              </div>
                              <Badge variant="outline" className="text-xs bg-white">
                                {court.platform}
                              </Badge>
                            </div>
                            
                            <div className="text-xs space-y-2">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-green-600 shrink-0" />
                                <span className="font-semibold text-gray-800">{court.courtName || 'Court ' + court.courtNumber}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPinned className="w-3 h-3 text-green-600 shrink-0" />
                                <span className="text-gray-600">{court.venue}</span>
                              </div>
                              
                              {/* Match Score Display */}
                              <div className="bg-white rounded-lg p-2 border border-green-200 space-y-1">
                                <div className="flex items-center gap-2 text-xs">
                                  <Users className="w-3 h-3 text-green-600" />
                                  <span className="font-semibold text-gray-900">{court.currentMatch}</span>
                                </div>
                                <div className="text-xs text-green-700 font-medium">
                                  Match in Progress
                                </div>
                              </div>
                              
                              {court.nextMatch && (
                                <div className="text-gray-500 text-xs bg-gray-50 rounded px-2 py-1">
                                  <span className="font-medium">Up Next:</span> {court.nextMatch}
                                </div>
                              )}
                            </div>
                            
                            {court.streamUrl && court.streamUrl.trim() !== '' && court.streamUrl.startsWith('http') && (
                              <Button
                                size="sm"
                                className="w-full text-xs h-7 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
                                onClick={() => window.open(court.streamUrl!, '_blank')}
                              >
                                <Video className="w-3 h-3 mr-1" />
                                Watch This Court
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Court Activity Section - Non-Live Courts */}
                {selectedInfo.courts.filter(c => !c.isLive).length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b-2 border-gray-200">
                      <Trophy className="w-5 h-5 text-gray-600" />
                      <h3 className="font-bold text-gray-900">Court Schedule</h3>
                      <Badge variant="outline" className="text-xs">
                        {selectedInfo.courts.filter(c => !c.isLive).length} Courts
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedInfo.courts
                        .filter(c => !c.isLive)
                        .map((court, idx) => (
                        <Card key={idx} className="border hover:border-teal-300 transition-all hover:shadow-md">
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-sm text-gray-900">{court.courtNumber}</div>
                              <Badge variant="outline" className="text-xs">
                                {court.platform}
                              </Badge>
                            </div>
                            <div className="text-xs space-y-1">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                                <span className="font-medium text-gray-700">{court.venue}</span>
                              </div>
                              {court.currentMatch && (
                                <div className="text-gray-600">
                                  <span className="font-medium">Current:</span> {court.currentMatch}
                                </div>
                              )}
                              {court.nextMatch && (
                                <div className="text-gray-500">
                                  <span className="font-medium">Next:</span> {court.nextMatch}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Data Message */}
                {selectedInfo.events.length === 0 && selectedInfo.courts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No active events in {selectedInfo.name}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
