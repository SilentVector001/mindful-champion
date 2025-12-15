'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Trophy, Map, Calendar as CalendarIcon, List, Loader2 } from 'lucide-react';
import MainNavigation from '@/components/navigation/main-navigation';
import { TournamentCard } from '@/components/tournaments/tournament-card';
import { TournamentFilters, FilterState } from '@/components/tournaments/tournament-filters';
import { TournamentMap } from '@/components/tournaments/tournament-map';
import { CalendarView } from '@/components/tournaments/calendar-view';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface Tournament {
  id: string;
  name: string;
  description?: string;
  city: string;
  state: string;
  venueName: string;
  startDate: string;
  endDate: string;
  skillLevels: string[];
  format: string[];
  currentRegistrations?: number;
  maxParticipants?: number;
  entryFee?: number;
  prizePool?: number;
  imageUrl?: string;
  status: string;
  latitude?: number;
  longitude?: number;
}

export default function TournamentsPage() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  const [user, setUser] = useState<any>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    state: '',
    skillLevel: '',
    format: '',
    startDate: '',
    endDate: '',
    sortBy: 'startDate',
  });
  const [activeTab, setActiveTab] = useState('list');

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/user/profile');
          if (response?.ok) {
            const data = await response.json();
            setUser(data?.user ?? session?.user);
          } else {
            setUser(session?.user);
          }
        } catch (error) {
          setUser(session?.user);
        }
      }
    };
    
    if (status === 'authenticated') {
      fetchUser();
    }
  }, [session, status]);

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    fetchTournaments(filters);
  }, [filters]);

  const fetchTournaments = async (currentFilters?: FilterState) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (currentFilters) {
        Object.entries(currentFilters).forEach(([key, value]) => {
          if (value) {
            params.append(key, value);
          }
        });
      }

      const response = await fetch(`/api/tournaments?${params.toString()}`);
      if (!response?.ok) throw new Error('Failed to fetch tournaments');
      
      const data = await response.json();
      setTournaments(data?.tournaments ?? []);
      setFilteredTournaments(data?.tournaments ?? []);
      setStates(data?.meta?.states ?? []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      setTournaments([]);
      setFilteredTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleTournamentClick = (tournamentId: string) => {
    router.push(`/tournaments/${tournamentId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50">
      <MainNavigation user={user ?? session?.user} />
      
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-teal-600 p-3 rounded-xl">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Pickleball <span className="text-teal-600">Tournaments</span>
              </h1>
              <p className="text-gray-600 mt-1">
                Find and register for pickleball tournaments across the United States
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <Card className="border-2">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-teal-600">
                  {loading ? '-' : (tournaments ?? []).length}
                </div>
                <div className="text-sm text-gray-600">Total Tournaments</div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {loading ? '-' : (states ?? []).length}
                </div>
                <div className="text-sm text-gray-600">States</div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {loading
                    ? '-'
                    : (tournaments ?? []).reduce((sum, t) => sum + (t?.currentRegistrations ?? 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Registered Players</div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  $
                  {loading
                    ? '-'
                    : ((tournaments ?? []).reduce((sum, t) => sum + (t?.prizePool ?? 0), 0) / 1000).toFixed(0)}k
                </div>
                <div className="text-sm text-gray-600">Total Prize Money</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <TournamentFilters onFilterChange={handleFilterChange} states={states} />
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 h-12">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">List View</span>
                  <span className="sm:hidden">List</span>
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <Map className="w-4 h-4" />
                  <span className="hidden sm:inline">Map View</span>
                  <span className="sm:hidden">Map</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Calendar</span>
                  <span className="sm:hidden">Cal</span>
                </TabsTrigger>
              </TabsList>

              {/* List View */}
              <TabsContent value="list" className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                  </div>
                ) : (filteredTournaments ?? []).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {(filteredTournaments ?? []).map((tournament, index) => (
                      <TournamentCard
                        key={tournament?.id ?? index}
                        tournament={tournament}
                        index={index}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="border-2 border-dashed">
                    <CardContent className="py-12 text-center">
                      <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No tournaments found
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Try adjusting your filters to see more results.
                      </p>
                      <Button onClick={() => handleFilterChange({
                        search: '',
                        state: '',
                        skillLevel: '',
                        format: '',
                        startDate: '',
                        endDate: '',
                        sortBy: 'startDate',
                      })}>
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Map View */}
              <TabsContent value="map">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                  </div>
                ) : (
                  <TournamentMap
                    tournaments={filteredTournaments}
                    onTournamentClick={handleTournamentClick}
                  />
                )}
              </TabsContent>

              {/* Calendar View */}
              <TabsContent value="calendar">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                  </div>
                ) : (
                  <CalendarView
                    tournaments={filteredTournaments}
                    onTournamentClick={handleTournamentClick}
                  />
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
