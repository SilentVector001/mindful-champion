'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Play,
  PlayCircle,
  Pause,
  MapPin,
  Clock,
  Trophy,
  Radio,
  Calendar,
  ExternalLink,
  Youtube,
  Building,
  Tv,
  Globe,
  Users,
  Award,
  Zap,
  Eye,
  Video,
  ChevronRight,
  Mic,
  Headphones,
  SkipBack,
  SkipForward,
  Volume2,
  Star,
  Sparkles,
  Timer,
  RefreshCw,
  Bell,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { InteractiveUSMap } from '@/components/media/interactive-us-map';
import { cn } from '@/lib/utils';

// ============ TYPES ============
interface TournamentEvent {
  id: string;
  name: string;
  organization: string;
  venue: string;
  city: string;
  state: string;
  date: Date;
  endDate?: Date;
  isLive: boolean;
  status: 'live' | 'upcoming' | 'today' | 'completed';
  platform: string;
  streamUrl?: string;
  websiteUrl?: string;
  viewerCount?: number;
  description?: string;
}

interface Podcast {
  id: string;
  title: string;
  host: string;
  description: string;
  imageUrl: string;
  duration: string;
  platform: string;
  playUrl: string;
  episodeCount: number;
  rating: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  type: 'tournament' | 'training' | 'community' | 'special';
  date: Date;
  endDate?: Date;
  location: string;
  description: string;
  registrationUrl?: string;
  prizePool?: string;
  organization?: string;
}

// ============ MOCK DATA ============
const PODCASTS: Podcast[] = [
  {
    id: 'kitchen',
    title: 'The Pickleball Kitchen',
    host: 'John Davis',
    description: 'Strategy tips, pro player interviews, and the latest tournament coverage',
    imageUrl: '/images/podcast-kitchen.jpg',
    duration: '45 min',
    platform: 'Spotify',
    playUrl: 'https://open.spotify.com/show/pickleball-kitchen',
    episodeCount: 156,
    rating: 4.8,
  },
  {
    id: 'dink',
    title: 'The Dink Show',
    host: 'Zane Navratil',
    description: 'Pro insights from a top-ranked player and coach',
    imageUrl: '/images/podcast-dink.jpg',
    duration: '60 min',
    platform: 'Apple Podcasts',
    playUrl: 'https://podcasts.apple.com/us/podcast/the-dink-show',
    episodeCount: 89,
    rating: 4.9,
  },
  {
    id: 'pickleball-central',
    title: 'Pickleball Central Radio',
    host: 'Steve Kennedy',
    description: 'News, gear reviews, and community spotlights',
    imageUrl: '/images/podcast-central.jpg',
    duration: '30 min',
    platform: 'YouTube',
    playUrl: 'https://www.youtube.com/@pickleballcentral',
    episodeCount: 234,
    rating: 4.6,
  },
  {
    id: 'third-shot',
    title: 'Third Shot Drop',
    host: 'Mark Renneson',
    description: 'Technical breakdowns and training methodologies',
    imageUrl: '/images/podcast-third.jpg',
    duration: '35 min',
    platform: 'Google Podcasts',
    playUrl: 'https://podcasts.google.com/third-shot-drop',
    episodeCount: 112,
    rating: 4.7,
  },
];

const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'PPA Tour - Mesa Open',
    type: 'tournament',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    location: 'Mesa, AZ',
    description: 'Major PPA Tour stop with top pros',
    registrationUrl: 'https://ppatour.com',
    prizePool: '$200,000',
    organization: 'PPA Tour',
  },
  {
    id: '2',
    title: 'MLP Championship Finals',
    type: 'tournament',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    location: 'Las Vegas, NV',
    description: 'Season-ending team championship',
    prizePool: '$500,000',
    organization: 'MLP',
  },
  {
    id: '3',
    title: 'Free Pro Skills Clinic',
    type: 'training',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    location: 'Online / Virtual',
    description: 'Learn advanced techniques from touring pros',
  },
  {
    id: '4',
    title: 'Community Mixer Tournament',
    type: 'community',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    location: 'Austin, TX',
    description: 'All skill levels welcome - meet local players',
  },
  {
    id: '5',
    title: 'APP Tour - Newport Beach',
    type: 'tournament',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    location: 'Newport Beach, CA',
    description: 'West coast APP Tour event',
    prizePool: '$150,000',
    organization: 'APP Tour',
  },
  {
    id: '6',
    title: 'National Championships Qualifier',
    type: 'special',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    location: 'Multiple Locations',
    description: 'Earn your spot at nationals',
    organization: 'USA Pickleball',
  },
];

// ============ TAB ITEMS ============
const TAB_ITEMS = [
  { id: 'tournaments', label: 'Live Tournaments', icon: Trophy, color: 'from-red-500 to-orange-500' },
  { id: 'podcasts', label: 'Podcasts', icon: Mic, color: 'from-emerald-500 to-teal-500' },
  { id: 'events', label: 'Events', icon: Calendar, color: 'from-blue-500 to-cyan-500' },
];

// ============ MAIN COMPONENT ============
export function UnifiedMediaHub() {
  const [activeTab, setActiveTab] = useState('tournaments');
  const [loading, setLoading] = useState(true);
  const [liveTournaments, setLiveTournaments] = useState<TournamentEvent[]>([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState<TournamentEvent[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedStateFilter, setSelectedStateFilter] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    fetchTournamentData();
    const interval = setInterval(fetchTournamentData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      
      const previousLiveCount = liveTournaments.filter(t => t.isLive).length;
      
      // Fetch LIVE tournaments
      const liveResponse = await fetch('/api/media-hub/live-tournaments?live=true');
      if (liveResponse.ok) {
        const liveData = await liveResponse.json();
        if (liveData.success && liveData.events) {
          const transformedLive = liveData.events.map((event: any) => ({
            id: event.id,
            name: event.name,
            organization: event.organizationName,
            venue: event.venue || 'TBD',
            city: event.city || event.location,
            state: event.state || '',
            date: new Date(event.eventDate),
            endDate: event.endDate ? new Date(event.endDate) : undefined,
            isLive: event.isLive,
            status: event.isLive ? 'live' as const : 'upcoming' as const,
            platform: event.broadcastPlatform || 'YouTube',
            streamUrl: event.streamUrl,
            websiteUrl: event.websiteUrl,
            viewerCount: event.viewerCount,
            description: event.description || event.shortName
          }));
          
          // Check for new live tournaments
          const newLiveCount = transformedLive.filter((t: any) => t.isLive).length;
          if (newLiveCount > previousLiveCount && previousLiveCount > 0) {
            const newTournaments = transformedLive.filter((t: any) => 
              t.isLive && !liveTournaments.some(lt => lt.id === t.id && lt.isLive)
            );
            newTournaments.forEach((tournament: any) => {
              setNotifications(prev => [
                `🎾 ${tournament.name} is now LIVE!`,
                ...prev
              ]);
            });
          }
          
          setLiveTournaments(transformedLive);
        }
      }

      // Fetch UPCOMING tournaments
      const upcomingResponse = await fetch('/api/media-hub/live-tournaments?upcoming=true&limit=10');
      if (upcomingResponse.ok) {
        const upcomingData = await upcomingResponse.json();
        if (upcomingData.success && upcomingData.events) {
          const transformedUpcoming = upcomingData.events.map((event: any) => ({
            id: event.id,
            name: event.name,
            organization: event.organizationName,
            venue: event.venue || 'TBD',
            city: event.city || event.location,
            state: event.state || '',
            date: new Date(event.eventDate),
            endDate: event.endDate ? new Date(event.endDate) : undefined,
            isLive: false,
            status: 'upcoming' as const,
            platform: event.broadcastPlatform || 'YouTube',
            streamUrl: event.streamUrl,
            websiteUrl: event.websiteUrl,
            viewerCount: event.viewerCount,
            description: event.description || event.shortName
          }));
          setUpcomingTournaments(transformedUpcoming);
        }
      }
    } catch (error) {
      console.error('Error fetching tournament data:', error);
      toast.error('Update Failed', {
        description: 'Could not fetch latest data. Will retry in 5 minutes.',
        duration: 4000,
      });
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff < 7) return `In ${diff} days`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleExternalLink = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Opening', { description: `Loading ${name}...`, duration: 2000 });
  };

  const allTournaments = [...liveTournaments, ...upcomingTournaments];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-cyan-600/15 to-blue-600/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-emerald-600/15 to-teal-600/15 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Hero Section with Map */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="p-4 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl shadow-2xl shadow-purple-500/30"
              >
                <Tv className="w-10 h-10 text-white drop-shadow-lg" />
              </motion.div>
              
              <div>
                <h1 className="text-4xl font-black flex items-center gap-3">
                  <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                    Media Hub
                  </span>
                  {liveTournaments.filter(t => t.isLive).length > 0 && (
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse shadow-lg shadow-red-500/50 px-3 py-1">
                      <Radio className="w-4 h-4 mr-1" />
                      LIVE
                    </Badge>
                  )}
                </h1>
                <p className="text-slate-400 text-lg font-medium mt-1">
                  🎾 Your ultimate pickleball content destination
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Notifications Dropdown */}
              <div className="relative">
                <Button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg relative"
                  size="icon"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Button>
                
                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h3 className="text-white font-bold flex items-center gap-2">
                          <Bell className="w-4 h-4" />
                          Notifications
                        </h3>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6 text-slate-400 hover:text-white"
                          onClick={() => setShowNotifications(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-400">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No new notifications</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-white/10">
                            {notifications.map((notification, index) => (
                              <div key={index} className="p-4 hover:bg-white/5 transition-colors">
                                <p className="text-white text-sm">{notification}</p>
                                <p className="text-slate-400 text-xs mt-1">Just now</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="p-3 border-t border-white/10">
                          <Button 
                            variant="ghost" 
                            className="w-full text-xs text-slate-400 hover:text-white"
                            onClick={() => setNotifications([])}
                          >
                            Clear all
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Refresh Button */}
              <Button 
                onClick={fetchTournamentData}
                className="rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Interactive US Map */}
          <div className="relative">
            <InteractiveUSMap
              tournaments={allTournaments}
              onStateClick={(state) => setSelectedStateFilter(state)}
            />
          </div>
        </motion.div>

        {/* Animated Tab Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-2 border border-white/10 shadow-2xl">
            <div className="flex gap-2 overflow-x-auto">
              {TAB_ITEMS.map((tab, index) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "relative flex-1 min-w-[140px] flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-sm font-bold transition-all duration-300",
                      isActive 
                        ? "text-white" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {/* Active Tab Glow Background */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className={cn(
                          "absolute inset-0 rounded-xl bg-gradient-to-r",
                          tab.color
                        )}
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    {/* Tab Glow Effect */}
                    {isActive && (
                      <motion.div
                        className={cn(
                          "absolute inset-0 rounded-xl bg-gradient-to-r opacity-50 blur-xl",
                          tab.color
                        )}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                      />
                    )}
                    
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </span>
                    
                    {/* Live indicator for tournaments tab */}
                    {tab.id === 'tournaments' && liveTournaments.filter(t => t.isLive).length > 0 && (
                      <span className="relative z-10 ml-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Tab Content with Smooth Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'tournaments' && (
              <TournamentsTab 
                liveTournaments={liveTournaments}
                upcomingTournaments={upcomingTournaments}
                loading={loading}
                formatDate={formatDate}
                handleExternalLink={handleExternalLink}
              />
            )}
            
            {activeTab === 'podcasts' && (
              <PodcastsTab 
                podcasts={PODCASTS}
                handleExternalLink={handleExternalLink}
              />
            )}
            
            {activeTab === 'events' && (
              <EventsTab 
                events={MOCK_CALENDAR_EVENTS}
                formatDate={formatDate}
                handleExternalLink={handleExternalLink}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============ TOURNAMENTS TAB ============
function TournamentsTab({ 
  liveTournaments, 
  upcomingTournaments, 
  loading, 
  formatDate, 
  handleExternalLink 
}: {
  liveTournaments: TournamentEvent[];
  upcomingTournaments: TournamentEvent[];
  loading: boolean;
  formatDate: (date: Date) => string;
  handleExternalLink: (url: string, name: string) => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 bg-slate-800/50 rounded-2xl" />
        ))}
      </div>
    );
  }

  const allTournaments = [...liveTournaments, ...upcomingTournaments];

  return (
    <div className="space-y-8">
      {/* Live Now Section */}
      {liveTournaments.filter(t => t.isLive).length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Live Now
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveTournaments.filter(t => t.isLive).map((tournament, index) => (
              <TournamentCard 
                key={tournament.id}
                tournament={tournament}
                index={index}
                formatDate={formatDate}
                handleExternalLink={handleExternalLink}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-400" />
          Upcoming Tournaments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(liveTournaments.filter(t => !t.isLive).length > 0 || upcomingTournaments.length > 0) ? (
            [...liveTournaments.filter(t => !t.isLive), ...upcomingTournaments].slice(0, 9).map((tournament, index) => (
              <TournamentCard 
                key={tournament.id}
                tournament={tournament}
                index={index}
                formatDate={formatDate}
                handleExternalLink={handleExternalLink}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-slate-400">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming tournaments at this time</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TournamentCard({ 
  tournament, 
  index, 
  formatDate, 
  handleExternalLink 
}: {
  tournament: TournamentEvent;
  index: number;
  formatDate: (date: Date) => string;
  handleExternalLink: (url: string, name: string) => void;
}) {
  const isLive = tournament.isLive;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group"
    >
      <Card className={cn(
        "relative overflow-hidden h-full",
        "bg-slate-900/60 backdrop-blur-xl border-white/10",
        "hover:border-white/30 hover:shadow-2xl transition-all duration-500",
        isLive && "border-red-500/50 hover:border-red-500"
      )}>
        {/* Glow effect on hover */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          isLive 
            ? "bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10"
            : "bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10"
        )} />
        
        {/* Live indicator stripe */}
        {isLive && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />
        )}
        
        <CardContent className="p-5 relative z-10">
          {/* Organization Badge & Status */}
          <div className="flex items-center justify-between mb-3">
            <Badge className={cn(
              "text-xs font-bold",
              tournament.organization?.includes('PPA') && "bg-red-500/20 text-red-300 border-red-500/30",
              tournament.organization?.includes('MLP') && "bg-purple-500/20 text-purple-300 border-purple-500/30",
              tournament.organization?.includes('APP') && "bg-blue-500/20 text-blue-300 border-blue-500/30",
              !tournament.organization && "bg-slate-500/20 text-slate-300"
            )}>
              {tournament.organization || 'Tournament'}
            </Badge>
            
            {isLive ? (
              <Badge className="bg-red-500 text-white animate-pulse">
                <Radio className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
            ) : (
              <Badge variant="outline" className="text-slate-300 border-slate-600">
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(tournament.date)}
              </Badge>
            )}
          </div>
          
          {/* Tournament Name */}
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-200 transition-colors">
            {tournament.name}
          </h3>
          
          {/* Location */}
          <div className="flex items-center text-slate-400 text-sm mb-3">
            <MapPin className="w-4 h-4 mr-1 text-teal-400" />
            <span>{tournament.city}{tournament.state && `, ${tournament.state}`}</span>
          </div>
          
          {/* Venue */}
          {tournament.venue && tournament.venue !== 'TBD' && (
            <div className="flex items-center text-slate-400 text-sm mb-4">
              <Building className="w-4 h-4 mr-1 text-blue-400" />
              <span className="truncate">{tournament.venue}</span>
            </div>
          )}
          
          {/* Viewer Count */}
          {isLive && tournament.viewerCount && (
            <div className="flex items-center text-emerald-400 text-sm mb-4">
              <Eye className="w-4 h-4 mr-1" />
              <span>{tournament.viewerCount.toLocaleString()} watching</span>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            {tournament.streamUrl && (
              <Button
                onClick={() => handleExternalLink(tournament.streamUrl!, tournament.name)}
                className={cn(
                  "flex-1 rounded-lg font-semibold transition-all",
                  isLive 
                    ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                )}
              >
                <Play className="w-4 h-4 mr-1" />
                {isLive ? 'Watch Live' : 'Watch'}
              </Button>
            )}
            
            {tournament.websiteUrl && (
              <Button
                onClick={() => handleExternalLink(tournament.websiteUrl!, tournament.name)}
                variant="outline"
                className="rounded-lg border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}



// ============ PODCASTS TAB ============
function PodcastsTab({ 
  podcasts, 
  handleExternalLink 
}: {
  podcasts: Podcast[];
  handleExternalLink: (url: string, name: string) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Pickleball Podcasts</h2>
        <p className="text-slate-400">Listen to the latest discussions, interviews, and strategy breakdowns</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {podcasts.map((podcast, index) => (
          <motion.div
            key={podcast.id}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group"
          >
            <Card className={cn(
              "relative overflow-hidden h-full",
              "bg-slate-900/60 backdrop-blur-xl border-white/10",
              "hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500"
            )}>
              {/* Glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
              
              <CardContent className="p-5 relative z-10">
                <div className="flex gap-4">
                  {/* Podcast artwork placeholder */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all">
                      <Mic className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                        {podcast.platform}
                      </Badge>
                      <div className="flex items-center text-yellow-400">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs ml-1">{podcast.rating}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-emerald-200 transition-colors">
                      {podcast.title}
                    </h3>
                    
                    <p className="text-slate-400 text-sm mb-2">Hosted by {podcast.host}</p>
                    
                    <p className="text-slate-300 text-sm line-clamp-2 mb-3">
                      {podcast.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-slate-400 text-xs">
                      <span className="flex items-center gap-1">
                        <Headphones className="w-3 h-3" />
                        {podcast.episodeCount} episodes
                      </span>
                      <span className="flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        ~{podcast.duration}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => handleExternalLink(podcast.playUrl, podcast.title)}
                  className="w-full mt-4 rounded-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Listen Now
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============ EVENTS TAB ============
function EventsTab({ 
  events, 
  formatDate, 
  handleExternalLink 
}: {
  events: CalendarEvent[];
  formatDate: (date: Date) => string;
  handleExternalLink: (url: string, name: string) => void;
}) {
  const getEventTypeStyles = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'tournament':
        return { gradient: 'from-red-500 to-orange-500', bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30' };
      case 'training':
        return { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' };
      case 'community':
        return { gradient: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' };
      case 'special':
        return { gradient: 'from-amber-500 to-yellow-500', bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' };
      default:
        return { gradient: 'from-slate-500 to-slate-600', bg: 'bg-slate-500/20', text: 'text-slate-300', border: 'border-slate-500/30' };
    }
  };

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Upcoming Events</h2>
        <p className="text-slate-400">Tournaments, training sessions, and community gatherings</p>
      </div>
      
      {/* Calendar-style list */}
      <div className="space-y-4">
        {sortedEvents.map((event, index) => {
          const styles = getEventTypeStyles(event.type);
          const eventDate = new Date(event.date);
          const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
          const day = eventDate.getDate();
          
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 8 }}
              className="group"
            >
              <Card className={cn(
                "relative overflow-hidden",
                "bg-slate-900/60 backdrop-blur-xl border-white/10",
                "hover:border-white/30 hover:shadow-xl transition-all duration-300"
              )}>
                {/* Left accent bar */}
                <div className={cn("absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b", styles.gradient)} />
                
                <CardContent className="p-4 pl-5 flex items-center gap-4">
                  {/* Date block */}
                  <div className={cn(
                    "flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center bg-gradient-to-br",
                    styles.gradient
                  )}>
                    <span className="text-white/80 text-xs font-medium uppercase">{month}</span>
                    <span className="text-white text-2xl font-bold">{day}</span>
                  </div>
                  
                  {/* Event info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn("text-xs", styles.bg, styles.text, styles.border)}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </Badge>
                      {event.organization && (
                        <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
                          {event.organization}
                        </Badge>
                      )}
                      {event.prizePool && (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                          {event.prizePool}
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-white truncate group-hover:text-purple-200 transition-colors">
                      {event.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-slate-400 text-sm mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                      {event.endDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.ceil((event.endDate.getTime() - event.date.getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Action */}
                  {event.registrationUrl && (
                    <Button
                      onClick={() => handleExternalLink(event.registrationUrl!, event.title)}
                      className={cn(
                        "flex-shrink-0 rounded-lg font-semibold bg-gradient-to-r",
                        styles.gradient,
                        "hover:opacity-90"
                      )}
                    >
                      Register
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default UnifiedMediaHub;
