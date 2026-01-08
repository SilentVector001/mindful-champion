// @ts-nocheck
'use client';

import { motion } from 'framer-motion';
import { MapPin, Navigation, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Tournament {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  skillLevels: string[];
  startDate: Date | string;
  currentRegistrations?: number;
  maxParticipants?: number;
}

interface TournamentMapProps {
  tournaments: Tournament[];
  onTournamentClick?: (tournamentId: string) => void;
}

// Group tournaments by state for the map view
function groupTournamentsByState(tournaments: Tournament[]) {
  const grouped: Record<string, Tournament[]> = {};
  (tournaments ?? []).forEach((tournament) => {
    const state = tournament?.state ?? 'Unknown';
    if (!grouped[state]) {
      grouped[state] = [];
    }
    grouped[state]?.push(tournament);
  });
  return grouped;
}

export function TournamentMap({ tournaments, onTournamentClick }: TournamentMapProps) {
  const groupedTournaments = groupTournamentsByState(tournaments ?? []);
  const stateEntries = Object.entries(groupedTournaments);

  return (
    <div className="space-y-6">
      {/* Map Header */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Navigation className="w-6 h-6 text-teal-600" />
              <CardTitle className="text-2xl">Tournament Locations</CardTitle>
            </div>
            <Badge variant="default" className="bg-teal-600">
              {(tournaments ?? []).length} tournaments in {stateEntries.length} states
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Explore pickleball tournaments across the United States. Click on any location to view tournament details.
          </p>
        </CardContent>
      </Card>

      {/* State Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stateEntries.map(([state, stateTournaments], index) => {
          const totalRegistrations = (stateTournaments ?? []).reduce(
            (sum, t) => sum + (t?.currentRegistrations ?? 0),
            0
          );
          const totalCapacity = (stateTournaments ?? []).reduce(
            (sum, t) => sum + (t?.maxParticipants ?? 0),
            0
          );
          const fillPercentage = totalCapacity > 0 ? (totalRegistrations / totalCapacity) * 100 : 0;

          return (
            <motion.div
              key={state}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 hover:border-teal-400 cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-teal-600" />
                      <h3 className="font-bold text-lg">{state}</h3>
                    </div>
                    <Badge variant="secondary">
                      {(stateTournaments ?? []).length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Registration Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Registrations</span>
                      <span className="font-medium">{Math.round(fillPercentage)}% full</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${fillPercentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`h-full rounded-full ${
                          fillPercentage > 80
                            ? 'bg-red-500'
                            : fillPercentage > 50
                            ? 'bg-yellow-500'
                            : 'bg-teal-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Tournament List */}
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {(stateTournaments ?? []).map((tournament) => {
                      const startDate = new Date(tournament?.startDate ?? new Date());
                      return (
                        <button
                          key={tournament?.id ?? ''}
                          onClick={() => onTournamentClick?.(tournament?.id ?? '')}
                          className="w-full text-left p-2 rounded-lg hover:bg-teal-50 transition-colors group/item"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate group-hover/item:text-teal-600">
                                {tournament?.city ?? 'Unknown City'}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {tournament?.name ?? 'Tournament'}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <Badge variant="outline" className="text-xs">
                                {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </Badge>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Stats */}
                  <div className="pt-2 border-t flex items-center justify-between text-xs text-gray-600">
                    <span>
                      {totalRegistrations} registered
                    </span>
                    <span>
                      {totalCapacity} capacity
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {stateEntries.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tournaments found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters to see more results.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
