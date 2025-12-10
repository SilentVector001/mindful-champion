'use client';

/**
 * Enhanced US Map Component
 * 
 * Features:
 * - Clear state outlines (not just dots)
 * - Color-coded states based on tournament activity
 * - Hover effects with state information
 * - Click to filter tournaments by state
 * - Legend for easy understanding
 * - Responsive design
 * - Accessible for all ages
 */

import { useState, useEffect, useMemo } from 'react';
// @ts-ignore - Marker is exported but types may be outdated
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Trophy, 
  Calendar, 
  X, 
  Radio, 
  Users, 
  Play,
  ChevronRight,
  Info,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

// US States GeoJSON
const US_STATES_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

// State name mappings
const STATE_NAMES: Record<string, string> = {
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

// State FIPS codes to abbreviations
const FIPS_TO_STATE: Record<string, string> = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO', '09': 'CT',
  '10': 'DE', '11': 'DC', '12': 'FL', '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL',
  '18': 'IN', '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME', '24': 'MD',
  '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE',
  '32': 'NV', '33': 'NH', '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
  '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI', '45': 'SC', '46': 'SD',
  '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV',
  '55': 'WI', '56': 'WY'
};

// State coordinates for markers
const STATE_COORDS: Record<string, [number, number]> = {
  'AL': [-86.9023, 32.3182], 'AK': [-153.4937, 64.2008], 'AZ': [-111.0937, 34.0489],
  'AR': [-92.3731, 34.9697], 'CA': [-119.4179, 36.7783], 'CO': [-105.3111, 39.0598],
  'CT': [-72.7554, 41.6032], 'DE': [-75.5277, 38.9108], 'FL': [-81.5158, 27.6648],
  'GA': [-83.6431, 32.1656], 'HI': [-155.5828, 19.8968], 'ID': [-114.7420, 44.0682],
  'IL': [-89.3985, 40.6331], 'IN': [-86.1349, 40.2672], 'IA': [-93.0977, 41.8780],
  'KS': [-98.4842, 39.0119], 'KY': [-84.2700, 37.8393], 'LA': [-91.9623, 30.9843],
  'ME': [-69.4455, 45.2538], 'MD': [-76.6413, 39.0458], 'MA': [-71.3824, 42.4072],
  'MI': [-84.5361, 44.3148], 'MN': [-94.6859, 46.7296], 'MS': [-89.3985, 32.3547],
  'MO': [-91.8318, 37.9643], 'MT': [-110.3626, 46.8797], 'NE': [-99.9018, 41.4925],
  'NV': [-116.4194, 38.8026], 'NH': [-71.5724, 43.1939], 'NJ': [-74.4057, 40.0583],
  'NM': [-105.8701, 34.5199], 'NY': [-75.4999, 43.2994], 'NC': [-79.0193, 35.7596],
  'ND': [-101.0020, 47.5515], 'OH': [-82.9071, 40.4173], 'OK': [-97.0929, 35.0078],
  'OR': [-120.5542, 43.8041], 'PA': [-77.1945, 41.2033], 'RI': [-71.4774, 41.5801],
  'SC': [-81.1637, 33.8361], 'SD': [-99.9018, 43.9695], 'TN': [-86.5804, 35.5175],
  'TX': [-99.9018, 31.9686], 'UT': [-111.0937, 39.3210], 'VT': [-72.5778, 44.5588],
  'VA': [-78.6569, 37.4316], 'WA': [-120.7401, 47.7511], 'WV': [-80.4549, 38.5976],
  'WI': [-89.6165, 43.7844], 'WY': [-107.2903, 43.0760], 'DC': [-77.0369, 38.9072]
};

interface Tournament {
  id: string;
  name: string;
  state: string;
  city: string;
  venue: string;
  date: Date;
  isLive: boolean;
  status: 'live' | 'upcoming' | 'today' | 'completed';
  streamUrl?: string;
  organization: string;
  viewerCount?: number;
}

interface StateData {
  abbr: string;
  name: string;
  tournaments: Tournament[];
  liveCount: number;
  upcomingCount: number;
  totalCount: number;
}

interface EnhancedUSMapProps {
  tournaments: Tournament[];
  onStateSelect?: (state: string | null) => void;
  selectedState?: string | null;
  className?: string;
}

// Color scheme for states based on activity
const getStateColor = (data: StateData | undefined, isHovered: boolean, isSelected: boolean) => {
  if (!data || data.totalCount === 0) {
    return isHovered ? '#E2E8F0' : '#F1F5F9'; // Light gray for no events
  }
  
  if (isSelected) {
    return '#0D9488'; // Teal for selected
  }
  
  if (data.liveCount > 0) {
    return isHovered ? '#DC2626' : '#EF4444'; // Red for live events
  }
  
  if (data.upcomingCount >= 5) {
    return isHovered ? '#0D9488' : '#14B8A6'; // Teal for many upcoming
  }
  
  if (data.upcomingCount >= 2) {
    return isHovered ? '#0891B2' : '#06B6D4'; // Cyan for some upcoming
  }
  
  if (data.upcomingCount >= 1) {
    return isHovered ? '#3B82F6' : '#60A5FA'; // Blue for few upcoming
  }
  
  return isHovered ? '#94A3B8' : '#CBD5E1'; // Gray for past events only
};

export function EnhancedUSMap({ 
  tournaments, 
  onStateSelect, 
  selectedState,
  className 
}: EnhancedUSMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Aggregate tournament data by state
  const stateData = useMemo(() => {
    const dataMap = new Map<string, StateData>();
    
    tournaments.forEach(tournament => {
      const state = tournament.state?.toUpperCase();
      if (!state || state === 'NATIONWIDE' || !STATE_NAMES[state]) return;
      
      if (!dataMap.has(state)) {
        dataMap.set(state, {
          abbr: state,
          name: STATE_NAMES[state],
          tournaments: [],
          liveCount: 0,
          upcomingCount: 0,
          totalCount: 0
        });
      }
      
      const info = dataMap.get(state)!;
      info.tournaments.push(tournament);
      info.totalCount++;
      if (tournament.isLive) info.liveCount++;
      if (tournament.status === 'upcoming') info.upcomingCount++;
    });
    
    return dataMap;
  }, [tournaments]);

  // Get markers for states with live events
  const liveMarkers = useMemo(() => {
    const markers: Array<{ state: string; coords: [number, number]; count: number }> = [];
    
    stateData.forEach((data, state) => {
      if (data.liveCount > 0 && STATE_COORDS[state]) {
        markers.push({
          state,
          coords: STATE_COORDS[state],
          count: data.liveCount
        });
      }
    });
    
    return markers;
  }, [stateData]);

  const handleStateClick = (stateAbbr: string) => {
    if (onStateSelect) {
      onStateSelect(selectedState === stateAbbr ? null : stateAbbr);
    }
  };

  const currentStateData = hoveredState ? stateData.get(hoveredState) : null;
  const selectedStateData = selectedState ? stateData.get(selectedState) : null;

  return (
    <div className={cn("relative", className)}>
      {/* Map Container */}
      <Card className="overflow-hidden border-slate-200 shadow-lg">
        <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-teal-600" />
              Tournament Map
            </CardTitle>
            {selectedState && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onStateSelect?.(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-4 h-4 mr-1" />
                Clear Filter
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="relative bg-gradient-to-b from-blue-50/50 to-slate-50/50" style={{ width: '100%', height: 'auto' }}>
            <ComposableMap
              projection="geoAlbersUsa"
              projectionConfig={{
                scale: 1000
              }}
            >
              <Geographies geography={US_STATES_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const stateAbbr = FIPS_TO_STATE[geo.id];
                    const data = stateData.get(stateAbbr);
                    const isHovered = hoveredState === stateAbbr;
                    const isSelected = selectedState === stateAbbr;
                    
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={getStateColor(data, isHovered, isSelected)}
                        stroke="#FFFFFF"
                        strokeWidth={isHovered || isSelected ? 2 : 1}
                        style={{
                          default: {
                            outline: 'none',
                            transition: 'all 0.2s ease-in-out'
                          },
                          hover: {
                            outline: 'none',
                            cursor: data?.totalCount ? 'pointer' : 'default'
                          },
                          pressed: {
                            outline: 'none'
                          }
                        }}
                        onMouseEnter={() => {
                          setHoveredState(stateAbbr);
                        }}
                        onMouseLeave={() => setHoveredState(null)}
                        onClick={() => {
                          if (data?.totalCount) {
                            handleStateClick(stateAbbr);
                          }
                        }}
                      />
                    );
                  })
                }
              </Geographies>
              
              {/* Live Event Markers */}
              {liveMarkers.map((marker) => (
                <Marker key={marker.state} coordinates={marker.coords}>
                  <g>
                    {/* Pulsing ring */}
                    <circle
                      r={12}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth={2}
                      opacity={0.5}
                      className="animate-ping"
                    />
                    {/* Main dot */}
                    <circle
                      r={8}
                      fill="#EF4444"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      className="cursor-pointer"
                      onClick={() => handleStateClick(marker.state)}
                    />
                    {/* Count badge */}
                    {marker.count > 1 && (
                      <text
                        textAnchor="middle"
                        y={4}
                        style={{
                          fontFamily: 'system-ui',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          fill: '#FFFFFF'
                        }}
                      >
                        {marker.count}
                      </text>
                    )}
                  </g>
                </Marker>
              ))}
            </ComposableMap>
            
            {/* Hover Tooltip */}
            <AnimatePresence>
              {hoveredState && currentStateData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-10 pointer-events-none"
                  style={{
                    left: '50%',
                    bottom: '20px',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <Card className="shadow-xl border-slate-200 bg-white/95 backdrop-blur">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-slate-800">
                          {currentStateData.name}
                        </h3>
                        {currentStateData.liveCount > 0 && (
                          <Badge className="bg-red-500 text-white text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            {currentStateData.liveCount} Live
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          {currentStateData.totalCount} Events
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          {currentStateData.upcomingCount} Upcoming
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Legend */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-slate-600">Live Events</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-teal-500"></span>
                <span className="text-slate-600">5+ Upcoming</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
                <span className="text-slate-600">2-4 Upcoming</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                <span className="text-slate-600">1 Upcoming</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                <span className="text-slate-600">No Events</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Selected State Panel */}
      <AnimatePresence>
        {selectedState && selectedStateData && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-0 right-0 w-80 h-full"
          >
            <Card className="h-full shadow-xl border-slate-200 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {selectedStateData.name}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onStateSelect?.(null)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-teal-100">
                  <span>{selectedStateData.totalCount} Events</span>
                  {selectedStateData.liveCount > 0 && (
                    <Badge className="bg-red-500 text-white">
                      {selectedStateData.liveCount} Live
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-0 overflow-y-auto max-h-[400px]">
                {selectedStateData.tournaments.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {selectedStateData.tournaments.map((tournament) => (
                      <div 
                        key={tournament.id}
                        className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-slate-800 text-sm">
                            {tournament.name}
                          </h4>
                          {tournament.isLive && (
                            <Badge className="bg-red-500 text-white text-xs">
                              LIVE
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mb-2">
                          {tournament.city} • {tournament.venue}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">
                            {new Date(tournament.date).toLocaleDateString()}
                          </span>
                          {tournament.streamUrl && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-teal-600">
                              <Play className="w-3 h-3 mr-1" />
                              Watch
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No tournaments in this state</p>
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

export default EnhancedUSMap;
