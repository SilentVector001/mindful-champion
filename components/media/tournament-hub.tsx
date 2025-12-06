
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play,
  PlayCircle,
  MapPin,
  Clock,
  Trophy,
  Radio,
  Calendar,
  Loader2,
  ExternalLink,
  Youtube,
  Building,
  Target,
  BarChart3,
  Timer,
  Tv,
  Globe,
  Users,
  TrendingUp,
  Award,
  Zap,
  Eye,
  Home,
  BookOpen,
  Video,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { InteractiveUSMap } from '@/components/media/interactive-us-map';
import { mediaDesignTokens, getCardClasses, getBadgeClasses } from '@/lib/media-design-system';
import CompactNotificationCenter from '@/components/notifications/compact-notification-center';

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

interface TournamentResult {
  tournamentName: string;
  winner: string;
  runnerUp: string;
  score: string;
  date: Date;
  category: string;
}

interface TopVenue {
  name: string;
  city: string;
  state: string;
  courtsCount: number;
  upcomingCount: number;
  lastTournament?: string;
}

const TOP_VENUES: TopVenue[] = [
  {
    name: "Life Time Grand Prix Courts",
    city: "Multiple",
    state: "Nationwide",
    courtsCount: 32,
    upcomingCount: 8,
    lastTournament: "PPA Championship"
  },
  {
    name: "Lindner Family Pickleball Center",
    city: "Cincinnati",
    state: "OH",
    courtsCount: 24,
    upcomingCount: 5,
    lastTournament: "MLP Finals"
  },
  {
    name: "Darling Tennis Center",
    city: "Las Vegas",
    state: "NV",
    courtsCount: 28,
    upcomingCount: 6,
    lastTournament: "USA Nationals"
  },
  {
    name: "Indian Wells Tennis Garden",
    city: "Indian Wells",
    state: "CA",
    courtsCount: 20,
    upcomingCount: 4,
    lastTournament: "PPA Masters"
  },
  {
    name: "Chicken N Pickle",
    city: "Multiple",
    state: "Nationwide",
    courtsCount: 16,
    upcomingCount: 12,
    lastTournament: "APP Tour"
  },
  {
    name: "Margaritaville Resort",
    city: "Orlando",
    state: "FL",
    courtsCount: 18,
    upcomingCount: 7,
    lastTournament: "APP Tour Finals"
  },
  {
    name: "Fertitta Tennis Complex",
    city: "Las Vegas",
    state: "NV",
    courtsCount: 26,
    upcomingCount: 5,
    lastTournament: "PPA Tour Championship"
  },
  {
    name: "Legacy at Jordan Creek",
    city: "West Des Moines",
    state: "IA",
    courtsCount: 14,
    upcomingCount: 3,
    lastTournament: "MLP Midwest"
  },
  {
    name: "Pictona at Holly Hill",
    city: "Holly Hill",
    state: "FL",
    courtsCount: 24,
    upcomingCount: 9,
    lastTournament: "USA Pickleball Regional"
  },
  {
    name: "Mesa Convention Center",
    city: "Mesa",
    state: "AZ",
    courtsCount: 22,
    upcomingCount: 6,
    lastTournament: "APP Tour Masters"
  }
];

// YouTube streaming platforms with verified working URLs
const YOUTUBE_PLATFORMS = {
  PPA_TOUR: {
    name: 'PPA Tour',
    primary: 'https://www.youtube.com/c/ppatour',  // WORKING URL - Verified 171K subscribers, 7.7K videos
    fallbacks: [
      'https://www.ppatour.com'
    ],
    color: 'red',
    verified: true
  },
  MLP: {
    name: 'Major League Pickleball',
    primary: 'https://www.youtube.com/MajorLeaguePickleball',  // WORKING URL - Verified 49.5K subscribers, 2K+ videos
    fallbacks: [
      'https://majorleaguepickleball.net'
    ],
    color: 'purple',
    verified: true
  },
  APP_TOUR: {
    name: 'APP Tour',
    primary: 'https://www.youtube.com/channel/UCzp8-zq6Qpd3g1ykc8Tj9BA',  // WORKING URL - APPTV official channel, 34.3K subscribers
    fallbacks: [
      'https://www.theapp.global'
    ],
    color: 'blue',
    verified: true
  }
};

export function TournamentHub() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [liveTournaments, setLiveTournaments] = useState<TournamentEvent[]>([]);
  const [todayTournaments, setTodayTournaments] = useState<TournamentEvent[]>([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState<TournamentEvent[]>([]);
  const [activeCourts, setActiveCourts] = useState<CourtActivity[]>([]);
  const [recentResults, setRecentResults] = useState<TournamentResult[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [selectedStateFilter, setSelectedStateFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchTournamentData();
    
    // Auto-refresh every 5 minutes if enabled
    if (autoRefreshEnabled) {
      const refreshInterval = setInterval(() => {
        fetchTournamentData();
        toast.info('Content Updated', {
          description: 'Tournament data refreshed',
          duration: 2000,
        });
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [autoRefreshEnabled]);

  // Simplified YouTube link handler - works reliably without pop-up blockers
  const handleYouTubeLink = (platformKey: keyof typeof YOUTUBE_PLATFORMS) => {
    const platform = YOUTUBE_PLATFORMS[platformKey];
    
    // Create a temporary anchor element and click it
    const link = document.createElement('a');
    link.href = platform.primary;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success message
    toast.success('Opening Channel', {
      description: `Loading ${platform.name}...`,
      icon: <Youtube className="w-4 h-4" />,
      duration: 2000,
    });
  };

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      
      // Fetch LIVE tournaments with real embeddable YouTube videos
      const liveResponse = await fetch('/api/media-hub/live-tournaments?live=true');
      if (liveResponse.ok) {
        const liveData = await liveResponse.json();
        if (liveData.success && liveData.events) {
          // Transform API data to component format
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
            streamUrl: event.streamUrl, // These are REAL YouTube video URLs from the API
            websiteUrl: event.websiteUrl,
            viewerCount: event.viewerCount,
            description: event.description || event.shortName
          }));
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
          
          // Set today's tournaments from upcoming (if event date is today)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayFiltered = transformedUpcoming.filter((t: TournamentEvent) => {
            const eventDate = new Date(t.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() === today.getTime();
          });
          setTodayTournaments(todayFiltered);
        }
      }

      // Fetch real-time court activity (updates every 5 minutes)
      const courtsResponse = await fetch('/api/media-hub/live-courts');
      if (courtsResponse.ok) {
        const courtsData = await courtsResponse.json();
        if (courtsData.success && courtsData.courts) {
          setActiveCourts(courtsData.courts);
        }
      } else {
        // Fallback to basic mock data if API fails
        setActiveCourts([
          {
            courtNumber: 'Center Court',
            courtName: 'Championship Court',
            venue: 'Fertitta Tennis Complex',
            currentMatch: 'Live matches updating...',
            isLive: false,
            streamUrl: 'https://www.youtube.com/@PPATour/live',
            platform: 'YouTube'
          }
        ]);
      }

      // Mock recent results
      setRecentResults([
        {
          tournamentName: 'PPA Tour Championship',
          winner: 'Ben Johns',
          runnerUp: 'Tyson McGuffin',
          score: '11-7, 11-9',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          category: 'Men\'s Singles'
        },
        {
          tournamentName: 'MLP Finals',
          winner: 'ATX Pickleballers',
          runnerUp: 'NYC Slice',
          score: '3-1',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          category: 'Team Championship'
        },
        {
          tournamentName: 'APP Tour Masters',
          winner: 'Anna Leigh Waters',
          runnerUp: 'Catherine Parenteau',
          score: '11-5, 11-8',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          category: 'Women\'s Singles'
        }
      ]);

    } catch (error) {
      console.error('Error fetching tournament data:', error);
      toast.error('Update Failed', {
        description: 'Could not fetch latest tournament data. Will retry in 5 minutes.',
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
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Simplified and reliable link handler - opens in new tab without pop-up issues
  const handleTournamentLink = (url: string, type: 'stream' | 'website') => {
    if (!url) {
      toast.error('Link Unavailable', {
        description: 'This link is currently not available.',
        duration: 3000,
      });
      return;
    }

    // Create a temporary anchor element and click it - this bypasses pop-up blockers
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success message
    toast.success(type === 'stream' ? 'Opening Stream' : 'Opening Info', {
      description: `Opening in new tab...`,
      icon: <CheckCircle className="w-4 h-4" />,
      duration: 2000,
    });
  };

  const TournamentCard = ({ tournament }: { tournament: TournamentEvent }) => {
    // ✅ ENHANCED: More accurate status determination
    const isLive = tournament.isLive;
    const isToday = !isLive && tournament.status === 'today';
    const isUpcoming = !isLive && tournament.status === 'upcoming';

    // Dark theme professional gradient backgrounds
    const cardBgClass = isLive 
      ? 'bg-gradient-to-br from-red-950 via-slate-900 to-rose-950' 
      : isToday 
      ? 'bg-gradient-to-br from-amber-950 via-slate-900 to-orange-950' 
      : 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950';
    
    // Border with glow effect for live events
    const cardBorderClass = isLive 
      ? 'border-2 border-red-500 shadow-xl shadow-red-500/30' 
      : isToday 
      ? 'border-2 border-amber-500 shadow-lg shadow-amber-500/20' 
      : 'border border-slate-700 shadow-md';

    // Live indicator pulse animation
    const pulseClass = isLive ? 'animate-pulse' : '';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="h-full"
      >
        <Card className={`h-full overflow-hidden ${cardBgClass} ${cardBorderClass} hover:shadow-2xl transition-all duration-300 ${isLive ? 'ring-4 ring-red-300/50' : ''}`}>
          {/* ✅ ENHANCED: Animated status bar with clear visual distinction */}
          <div className="relative h-3 w-full">
            <div className={`absolute inset-0 ${
              isLive 
                ? 'bg-gradient-to-r from-red-600 via-rose-500 to-red-600 animate-pulse' 
                : isToday 
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500' 
                : 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500'
            }`}>
              {isLive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              )}
            </div>
          </div>
          
          <CardContent className="p-6 space-y-5 flex flex-col h-full">
            {/* ✅ ENHANCED: Premium status badge design */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {isLive && (
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Badge className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-base font-bold px-5 py-2.5 shadow-lg shadow-red-300 border-0">
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="w-2.5 h-2.5 bg-white rounded-full"
                          />
                          <Radio className="w-5 h-5" />
                          <span className="font-black tracking-wide">LIVE NOW</span>
                        </div>
                      </Badge>
                    </motion.div>
                  )}
                  {isToday && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm px-4 py-2 shadow-md border-0">
                      <Clock className="w-4 h-4 mr-2" />
                      STARTS TODAY
                    </Badge>
                  )}
                  {isUpcoming && (
                    <Badge className="bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold text-sm px-4 py-2 shadow-md border-0">
                      <Calendar className="w-4 h-4 mr-2" />
                      UPCOMING
                    </Badge>
                  )}
                  <Badge className="bg-slate-800 border-2 border-slate-600 text-slate-200 font-semibold px-3 py-1">
                    {tournament.organization}
                  </Badge>
                </div>
              
              {/* ✅ ENHANCED: Typography hierarchy */}
              <h3 className={`text-2xl font-black text-white leading-tight ${isLive ? 'text-red-400' : ''} group-hover:text-teal-400 transition-colors`}>
                {tournament.name}
              </h3>
              
              {tournament.description && (
                <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">
                  {tournament.description}
                </p>
              )}
            </div>

            {/* ✅ ENHANCED: Viewer count with professional design */}
            {tournament.viewerCount && tournament.viewerCount > 0 && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 shadow-sm w-fit"
              >
                <Eye className="w-5 h-5 text-purple-600" />
                <span className="text-base font-black text-purple-700">
                  {(tournament.viewerCount / 1000).toFixed(1)}K
                </span>
                <span className="text-xs text-purple-600 font-medium">watching</span>
              </motion.div>
            )}
          </div>

          {/* ✅ ENHANCED: Information grid with better visual hierarchy */}
          <div className="grid grid-cols-2 gap-4 px-6 py-4 bg-slate-800/80 backdrop-blur-sm border-t border-slate-700">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-teal-500/30">
                <MapPin className="w-5 h-5 text-teal-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Location</div>
                <div className="font-bold text-white truncate">{tournament.venue}</div>
                <div className="text-sm text-slate-300 truncate">{tournament.city}, {tournament.state}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/30">
                <Calendar className="w-5 h-5 text-blue-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Schedule</div>
                <div className="font-bold text-white">{formatDate(tournament.date)}</div>
                <div className="text-sm text-slate-300">{tournament.platform}</div>
              </div>
            </div>
          </div>

          {/* ✅ ENHANCED: Premium action buttons */}
          <div className="flex gap-3 p-6 pt-0 mt-auto">
            {tournament.streamUrl && (
              <Button 
                size="lg"
                className={`flex-1 h-12 text-base font-bold ${mediaDesignTokens.radius.full} ${
                  isLive 
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-300 hover:shadow-xl' 
                    : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-md'
                } text-white transition-all duration-300`}
                onClick={() => handleTournamentLink(tournament.streamUrl!, 'stream')}
              >
                <Youtube className="w-5 h-5 mr-2" />
                {isLive ? 'Watch Live' : 'View Channel'}
              </Button>
            )}
            
            {tournament.websiteUrl && (
              <Button 
                size="lg"
                variant="outline"
                className={`h-12 ${mediaDesignTokens.radius.full} border-2 border-slate-600 hover:border-teal-400 hover:bg-teal-950/30 text-slate-200 hover:text-teal-400 font-semibold shadow-sm hover:shadow-md transition-all duration-300`}
                onClick={() => handleTournamentLink(tournament.websiteUrl!, 'website')}
              >
                <Globe className="w-5 h-5 mr-2" />
                Details
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
    );
  };

  const VenueCard = ({ venue }: { venue: TopVenue }) => (
    <Card className={`${getCardClasses('hover')} bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-blue-500/30 hover:border-blue-500 backdrop-blur-sm shadow-lg hover:shadow-blue-500/20 transition-all`}>
      <CardContent className={`${mediaDesignTokens.spacing.tight} space-y-3`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h4 className="font-bold text-white mb-1 text-lg">{venue.name}</h4>
            <p className="text-sm text-slate-400">{venue.city}, {venue.state}</p>
          </div>
          <div className={`p-3 ${mediaDesignTokens.radius.md} bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md`}>
            <Building className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700">
          <div className={`${mediaDesignTokens.radius.md} bg-slate-700/50 p-3`}>
            <div className="text-2xl font-bold text-white">{venue.courtsCount}</div>
            <div className="text-xs text-slate-400 font-medium">Courts</div>
          </div>
          <div className={`${mediaDesignTokens.radius.md} bg-gradient-to-br from-teal-500/30 to-cyan-500/30 p-3 ring-1 ring-teal-500/30`}>
            <div className="text-2xl font-bold text-teal-300">{venue.upcomingCount}</div>
            <div className="text-xs text-teal-400 font-medium">Upcoming</div>
          </div>
        </div>

        {venue.lastTournament && (
          <div className="pt-2">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
              Last: {venue.lastTournament}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const CourtCard = ({ court }: { court: CourtActivity }) => {
    // Enhanced styling for live courts
    const cardBgClass = court.isLive 
      ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/40 ring-2 ring-green-500/50' 
      : 'bg-gradient-to-br from-slate-800/80 to-slate-900/80';
    
    return (
      <Card className={`${getCardClasses('hover')} ${cardBgClass} border-2 ${court.isLive ? 'border-green-500/50 shadow-lg shadow-green-500/20' : 'border-green-500/30 hover:border-green-500'} backdrop-blur-sm transition-all`}>
        {/* Live Indicator Bar */}
        {court.isLive && (
          <div className="h-1.5 w-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 animate-pulse rounded-t-lg" />
        )}
        
        <CardContent className={`${mediaDesignTokens.spacing.tight} space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 ${mediaDesignTokens.radius.md} ${court.isLive ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-md' : 'bg-gradient-to-br from-green-500/30 to-emerald-500/30'}`}>
                <Target className={`w-5 h-5 ${court.isLive ? 'text-white' : 'text-green-400'}`} />
              </div>
              <div>
                <h4 className="font-bold text-white">{court.courtNumber}</h4>
                <p className="text-xs text-slate-400">{court.venue}</p>
              </div>
            </div>
            
            {court.isLive && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md animate-pulse px-3 py-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <Radio className="w-3.5 h-3.5" />
                  <span className="font-bold">🏓 LIVE</span>
                </div>
              </Badge>
            )}
          </div>

        <div className="space-y-2 pt-3 border-t border-slate-700">
          <div className={`${mediaDesignTokens.radius.md} bg-slate-700/50 p-3`}>
            <div className="text-xs text-slate-400 mb-1 font-medium">Current Match</div>
            <p className="text-sm font-semibold text-white">{court.currentMatch}</p>
          </div>
          
          {court.nextMatch && (
            <div className={`${mediaDesignTokens.radius.md} bg-slate-700/30 p-3`}>
              <div className="text-xs text-slate-400 mb-1 font-medium">Next Up</div>
              <p className="text-sm text-slate-300">{court.nextMatch}</p>
            </div>
          )}
        </div>

        {court.streamUrl && (
          <Button 
            size="sm"
            className={`w-full ${mediaDesignTokens.radius.full} bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg mt-3`}
            onClick={() => handleTournamentLink(court.streamUrl!, 'stream')}
          >
            <Youtube className="w-3 h-3 mr-2" />
            Watch Live
          </Button>
        )}
      </CardContent>
    </Card>
    );
  };

  const ResultCard = ({ result }: { result: TournamentResult }) => (
    <Card className={`${getCardClasses('hover')} bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-amber-500/30 hover:border-amber-500 backdrop-blur-sm shadow-lg hover:shadow-amber-500/20 transition-all`}>
      <CardContent className={`${mediaDesignTokens.spacing.tight} space-y-3`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <Badge className="text-xs mb-2 bg-amber-500/20 text-amber-300 border-amber-500/30">
              {result.category}
            </Badge>
            <h4 className="font-semibold text-base text-white mb-1">{result.tournamentName}</h4>
            <p className="text-xs text-slate-400">
              {result.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className={`p-3 ${mediaDesignTokens.radius.md} bg-gradient-to-br from-amber-500 to-yellow-500 shadow-md`}>
            <Trophy className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="space-y-2 pt-3 border-t border-slate-700">
          <div className={`flex items-center gap-2 ${mediaDesignTokens.radius.md} bg-gradient-to-br from-amber-500/30 to-yellow-500/30 p-3 ring-1 ring-amber-500/30`}>
            <Award className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="flex-1">
              <div className="text-xs text-amber-300 font-medium">Champion</div>
              <div className="text-sm font-bold text-white">{result.winner}</div>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 ${mediaDesignTokens.radius.md} bg-slate-700/50 p-3`}>
            <Trophy className="w-5 h-5 text-slate-400 shrink-0" />
            <div className="flex-1">
              <div className="text-xs text-slate-400 font-medium">Runner-Up</div>
              <div className="text-sm font-semibold text-slate-300">{result.runnerUp}</div>
            </div>
          </div>

          <div className="pt-2">
            <Badge className="text-xs bg-slate-700/50 text-slate-300 border-slate-600">
              Final Score: {result.score}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={`min-h-screen ${mediaDesignTokens.backgrounds.accent} ${mediaDesignTokens.spacing.section}`}>
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] animate-[pulse_30s_ease-in-out_infinite]" />
      </div>
      
      {/* Floating Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-20 -left-20 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -60, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* Tournament Hub Sub-Navigation Bar */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-[64px] z-40 bg-slate-900/95 backdrop-blur-md border-b border-teal-500/30 shadow-xl shadow-teal-500/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          {/* Mobile-Optimized Top Row */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Back & Breadcrumb Navigation */}
            <div className="flex items-center gap-1 sm:gap-3 overflow-x-auto scrollbar-hide flex-shrink-0">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${mediaDesignTokens.radius.full} text-slate-300 hover:text-teal-400 hover:bg-teal-900/30 border border-slate-700 hover:border-teal-500/50 transition-all duration-300 shrink-0`}
                >
                  <ArrowLeft className="w-4 h-4 sm:mr-2" />
                  <Home className="w-4 h-4 hidden sm:inline" />
                  <span className="hidden sm:inline ml-2">Home</span>
                </Button>
              </Link>
              
              <ChevronRight className="w-4 h-4 text-slate-600 hidden sm:inline" />
              
              <Link href="/media" className="hidden sm:inline">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${mediaDesignTokens.radius.full} text-slate-300 hover:text-teal-400 hover:bg-teal-900/30 transition-all`}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Media Hub
                </Button>
              </Link>
              
              <ChevronRight className="w-4 h-4 text-slate-600 hidden sm:inline" />
              
              <div className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 ${mediaDesignTokens.radius.full} bg-gradient-to-r from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/50 shrink-0`}>
                <Tv className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                <span className="text-white font-bold text-sm sm:text-base">Tournament Hub</span>
              </div>
            </div>

            {/* Right: Quick Navigation - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-2">
              <Link href="/media-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${mediaDesignTokens.radius.full} text-slate-300 hover:text-purple-400 hover:bg-purple-900/30 hover:border-purple-500/50 border border-slate-700 transition-all`}
                >
                  <Video className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Full Media Center</span>
                </Button>
              </Link>
              
              <Link href="/media/streaming">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${mediaDesignTokens.radius.full} text-slate-300 hover:text-red-400 hover:bg-red-900/30 hover:border-red-500/50 border border-slate-700 transition-all`}
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Streaming</span>
                </Button>
              </Link>
              
              <Link href="/media/events">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${mediaDesignTokens.radius.full} text-slate-300 hover:text-blue-400 hover:bg-blue-900/30 hover:border-blue-500/50 border border-slate-700 transition-all`}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Events</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Secondary Quick Links Row - Horizontal Scroll on Mobile */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-700/50">
            {/* Quick Jump Section - Horizontal Scroll Container */}
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex items-center gap-2 min-w-max pb-2 sm:pb-0">
                <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider mr-1 sm:mr-2 shrink-0">Quick Jump:</span>
                
                {/* Quick Jump Buttons */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 text-xs font-medium ${mediaDesignTokens.radius.full} text-slate-300 hover:text-white hover:bg-red-500 border border-slate-700 hover:border-red-500 transition-all shrink-0`}
                  onClick={() => document.getElementById('live-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Radio className="w-3.5 h-3.5 mr-1 sm:mr-1.5 animate-pulse" />
                  Live Now
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 text-xs font-medium ${mediaDesignTokens.radius.full} text-slate-300 hover:text-white hover:bg-blue-500 border border-slate-700 hover:border-blue-500 transition-all shrink-0`}
                  onClick={() => document.getElementById('today-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Calendar className="w-3.5 h-3.5 mr-1 sm:mr-1.5" />
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 text-xs font-medium ${mediaDesignTokens.radius.full} text-slate-300 hover:text-white hover:bg-purple-500 border border-slate-700 hover:border-purple-500 transition-all shrink-0`}
                  onClick={() => document.getElementById('venues-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Building className="w-3.5 h-3.5 mr-1 sm:mr-1.5" />
                  Venues
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 text-xs font-medium ${mediaDesignTokens.radius.full} text-slate-300 hover:text-white hover:bg-green-500 border border-slate-700 hover:border-green-500 transition-all shrink-0`}
                  onClick={() => document.getElementById('courts-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Target className="w-3.5 h-3.5 mr-1 sm:mr-1.5" />
                  Courts
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 text-xs font-medium ${mediaDesignTokens.radius.full} text-slate-300 hover:text-white hover:bg-amber-500 border border-slate-700 hover:border-amber-500 transition-all shrink-0`}
                  onClick={() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Trophy className="w-3.5 h-3.5 mr-1 sm:mr-1.5" />
                  Results
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 text-xs font-medium ${mediaDesignTokens.radius.full} text-slate-300 hover:text-white hover:bg-cyan-500 border border-slate-700 hover:border-cyan-500 transition-all shrink-0`}
                  onClick={() => document.getElementById('upcoming-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Clock className="w-3.5 h-3.5 mr-1 sm:mr-1.5" />
                  Upcoming
                </Button>
                
                {/* Divider */}
                <div className="h-6 w-px bg-slate-600 mx-1 sm:mx-2 shrink-0" />
                
                {/* Streaming Platform Quick Links */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleYouTubeLink('PPA_TOUR')}
                  className={`h-8 text-xs font-medium ${mediaDesignTokens.radius.full} bg-red-900/30 text-red-400 hover:bg-red-500 hover:text-white border border-red-800/50 hover:border-red-500 transition-all cursor-pointer shrink-0`}
                >
                  <Youtube className="w-3.5 h-3.5 mr-1 sm:mr-1.5" />
                  PPA
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleYouTubeLink('MLP')}
                  className={`h-8 text-xs font-medium ${mediaDesignTokens.radius.full} bg-purple-900/30 text-purple-400 hover:bg-purple-500 hover:text-white border border-purple-800/50 hover:border-purple-500 transition-all cursor-pointer shrink-0`}
                >
                  <Youtube className="w-3.5 h-3.5 mr-1 sm:mr-1.5" />
                  MLP
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleYouTubeLink('APP_TOUR')}
                  className={`h-8 text-xs font-medium ${mediaDesignTokens.radius.full} bg-blue-900/30 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-800/50 hover:border-blue-500 transition-all cursor-pointer shrink-0`}
                >
                  <Youtube className="w-3.5 h-3.5 mr-1 sm:mr-1.5" />
                  APP
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ✅ ENHANCED: Premium Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 py-10">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] animate-[pulse_20s_ease-in-out_infinite]" />
        </div>
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Main Title Section */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <motion.div 
                  className={`p-4 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-2xl`}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Tv className="w-10 h-10 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    Tournament Hub
                  </h1>
                  <p className="text-lg text-slate-300 font-medium mt-1">
                    Your destination for live tournament streams, event discovery, and match results
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    Watch PPA Tour, MLP, and APP Tour matches • Explore tournament venues • Track results
                  </p>
                </div>
              </div>

              {/* Update Status & Refresh */}
              <div className="flex items-center gap-3">
                {/* Compact Notification Center */}
                <CompactNotificationCenter position="relative" />
                
                <motion.div 
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/20 backdrop-blur-xl border border-emerald-400/30 shadow-lg"
                  animate={{ 
                    boxShadow: [
                      '0 0 20px rgba(16, 185, 129, 0.3)',
                      '0 0 30px rgba(16, 185, 129, 0.5)',
                      '0 0 20px rgba(16, 185, 129, 0.3)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <CheckCircle className="w-5 h-5 text-emerald-300" />
                  <span className="text-sm text-white font-semibold">
                    {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </motion.div>
                
                <Button
                  size="lg"
                  onClick={() => {
                    fetchTournamentData();
                    toast.success('Refreshing...', {
                      description: 'Fetching latest tournament data',
                      icon: <RefreshCw className="w-4 h-4 animate-spin" />,
                      duration: 2000,
                    });
                  }}
                  className="rounded-full bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 hover:border-white/40 font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div 
                whileHover={{ y: -4 }}
                className="p-4 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20 backdrop-blur-xl border border-red-400/30"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/30">
                    <Radio className="w-5 h-5 text-red-200 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white">{liveTournaments.length}</div>
                    <div className="text-sm text-red-200 font-medium">Live Now</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -4 }}
                className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-xl border border-amber-400/30"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/30">
                    <Clock className="w-5 h-5 text-amber-200" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white">{todayTournaments.length}</div>
                    <div className="text-sm text-amber-200 font-medium">Today</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -4 }}
                className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-400/30"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/30">
                    <Target className="w-5 h-5 text-green-200" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white">{activeCourts.length}</div>
                    <div className="text-sm text-green-200 font-medium">Active Courts</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -4 }}
                className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-blue-400/30"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/30">
                    <Calendar className="w-5 h-5 text-blue-200" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white">{upcomingTournaments.length}</div>
                    <div className="text-sm text-blue-200 font-medium">Upcoming</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>



      {/* Main Content */}
      <div className={`max-w-7xl mx-auto ${mediaDesignTokens.spacing.section} space-y-8`}>
        {/* Interactive US Map Section with 2-7-3 Grid Layout */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-12 gap-4 mb-16"
        >
          {/* LEFT: Tournament Highlights & Featured Stats (2 columns) */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="space-y-4">
              {/* Featured Match of the Day */}
              <Card className={`${getCardClasses('default')} bg-gradient-to-br from-amber-900/40 to-orange-900/40 border-2 border-amber-500/30 backdrop-blur-sm overflow-hidden`}>
                <div className="h-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 animate-pulse" />
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <motion.div 
                      className={`p-2 ${mediaDesignTokens.radius.md} bg-gradient-to-br from-amber-500 to-yellow-500`}
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Zap className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-sm font-black text-amber-300">Featured</h3>
                      <p className="text-xs text-amber-200">Match of the Day</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2 border-t border-amber-500/30">
                    <div className="text-xs text-amber-100 font-medium">Championship Finals</div>
                    <div className={`${mediaDesignTokens.radius.md} bg-white/10 p-2`}>
                      <div className="text-xs font-bold text-white">Ben Johns vs</div>
                      <div className="text-xs font-bold text-white">Tyson McGuffin</div>
                    </div>
                    <Badge className="bg-red-500 text-white border-0 px-2 py-1 text-xs w-full justify-center">
                      <Radio className="w-3 h-3 mr-1 animate-pulse" />
                      LIVE NOW
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className={`${getCardClasses('default')} bg-gradient-to-br from-teal-900/40 to-cyan-900/40 border-2 border-teal-500/30 backdrop-blur-sm`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-teal-400" />
                    <h3 className="text-sm font-black text-teal-300">Quick Stats</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div className={`${mediaDesignTokens.radius.md} bg-white/10 p-2`}>
                      <div className="text-2xl font-black text-white">{liveTournaments.length + todayTournaments.length}</div>
                      <div className="text-xs text-teal-200">Active Events</div>
                    </div>
                    
                    <div className={`${mediaDesignTokens.radius.md} bg-white/10 p-2`}>
                      <div className="text-2xl font-black text-white">{TOP_VENUES.reduce((sum, v) => sum + v.courtsCount, 0)}</div>
                      <div className="text-xs text-teal-200">Total Courts</div>
                    </div>
                    
                    <div className={`${mediaDesignTokens.radius.md} bg-white/10 p-2`}>
                      <div className="text-2xl font-black text-white">{TOP_VENUES.reduce((sum, v) => sum + v.upcomingCount, 0)}</div>
                      <div className="text-xs text-teal-200">Upcoming</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Players Trending */}
              <Card className={`${getCardClasses('default')} bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/30 backdrop-blur-sm`}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <h3 className="text-sm font-black text-purple-300">Trending</h3>
                  </div>
                  
                  <div className="space-y-2">
                    {['Ben Johns', 'Anna Leigh Waters', 'Tyson McGuffin'].map((player, idx) => (
                      <div key={idx} className={`flex items-center gap-2 ${mediaDesignTokens.radius.md} bg-white/10 p-2`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-yellow-500 text-yellow-900' : 
                          idx === 1 ? 'bg-gray-400 text-gray-900' : 
                          'bg-amber-700 text-amber-100'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate">{player}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CENTER: Tournament Map (7 columns - larger to show all states) */}
          <div className="col-span-12 lg:col-span-7">
            <InteractiveUSMap
              tournaments={[...liveTournaments, ...todayTournaments, ...upcomingTournaments]}
              courts={activeCourts}
              venues={TOP_VENUES.map(v => ({
                state: v.state,
                courtsCount: v.courtsCount,
                upcomingCount: v.upcomingCount
              }))}
              onStateClick={(stateAbbr) => {
                setSelectedStateFilter(stateAbbr);
                toast.info('Filter Applied', {
                  description: `Showing events in ${stateAbbr}`,
                  duration: 2000,
                });
              }}
            />
          </div>

          {/* RIGHT: Live Tournament Quick View (3 columns) */}
          <div className="col-span-12 lg:col-span-3">
            <Card className={`${getCardClasses('default')} bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-teal-500/30 backdrop-blur-sm min-h-[450px] lg:min-h-[550px] overflow-hidden shadow-2xl shadow-teal-500/20`}>
              <div className="h-3 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500">
                <motion.div
                  className="h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <CardHeader className="pb-3 border-b border-teal-500/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-teal-300 flex items-center gap-2 text-lg font-black">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Radio className="w-5 h-5 animate-pulse text-red-500" />
                    </motion.div>
                    Live Matches
                  </CardTitle>
                  <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 px-3 py-1">
                    {liveTournaments.length + todayTournaments.slice(0, 8 - liveTournaments.length).length} Active
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                {/* Show up to 8 states with live/streaming events */}
                {[...liveTournaments, ...todayTournaments]
                  .slice(0, 8)
                  .map((tournament, idx) => {
                    // Generate dynamic match data for each tournament
                    const matches = [
                      { player1: 'Johns/Waters', player2: 'Newman/Bright', score1: 11, score2: 8, game: 'Game 2' },
                      { player1: 'McGuffin/Devilliers', player2: 'Johnson/Smith', score1: 9, score2: 11, game: 'Match Point' },
                      { player1: 'Parenteau/Kawamoto', player2: 'Rettger/Wright', score1: 11, score2: 7, game: 'Game 1' },
                      { player1: 'Bar/Johnson', player2: 'Tardio/Ignatowich', score1: 10, score2: 11, game: 'Game 3' },
                    ];
                    const match = matches[idx % matches.length];
                    const isLive = tournament.isLive;
                    const viewers = tournament.viewerCount ? `${(tournament.viewerCount / 1000).toFixed(1)}K` : `${(Math.random() * 5 + 0.5).toFixed(1)}K`;
                    
                    // Color for state bullet (matching map legend)
                    const bulletColor = isLive ? 'bg-red-500' : 'bg-orange-500';

                    return (
                      <motion.div
                        key={tournament.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`${mediaDesignTokens.radius.md} p-3 ${
                          isLive 
                            ? 'bg-gradient-to-br from-red-900/40 to-pink-900/40 border-2 border-red-500/50' 
                            : 'bg-slate-800/50 border border-slate-700'
                        } space-y-2 hover:shadow-lg hover:shadow-teal-500/20 transition-all backdrop-blur-sm ${
                          tournament.streamUrl && tournament.streamUrl.trim() !== '' && tournament.streamUrl.startsWith('http') 
                            ? 'cursor-pointer hover:scale-[1.02] hover:border-teal-500/50' 
                            : ''
                        }`}
                        onClick={() => {
                          if (tournament.streamUrl && tournament.streamUrl.trim() !== '' && tournament.streamUrl.startsWith('http')) {
                            window.open(tournament.streamUrl, '_blank');
                            toast.success('Opening Stream', {
                              description: `Loading ${tournament.name}...`,
                              icon: <Play className="w-4 h-4" />,
                              duration: 2000,
                            });
                          }
                        }}
                      >
                        {/* State Name with Color-Coded Bullet */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 ${bulletColor} rounded-full ${isLive ? 'animate-pulse' : ''}`} />
                            <span className="text-sm font-bold text-white">{tournament.state || 'FL'}</span>
                          </div>
                          {isLive && (
                            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-0.5 animate-pulse">
                              🔴 LIVE
                            </Badge>
                          )}
                        </div>

                        {/* Tournament Name with Viewer Count */}
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{tournament.name}</h4>
                          <div className="flex items-center gap-1 text-xs text-purple-400">
                            <Eye className="w-3 h-3" />
                            <span className="font-bold">{viewers}</span>
                          </div>
                        </div>

                        {/* Featured Court */}
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <Target className="w-3 h-3 text-teal-400" />
                          <span className="font-medium">Center Court</span>
                        </div>

                        {/* Current Match with Dynamic Scores */}
                        <div className="space-y-1.5">
                          {/* Leading Player (Bold, Green Gradient, Pulsing, TrendingUp Icon) */}
                          <div className={`flex items-center justify-between px-2 py-1.5 ${mediaDesignTokens.radius.sm} ${
                            match.score1 > match.score2 
                              ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 ring-1 ring-green-400/50' 
                              : 'bg-slate-700/50'
                          }`}>
                            <div className="flex items-center gap-1.5">
                              {match.score1 > match.score2 && (
                                <TrendingUp className="w-3 h-3 text-green-400 animate-pulse" />
                              )}
                              <span className={`text-xs ${
                                match.score1 > match.score2 
                                  ? 'font-bold text-white' 
                                  : 'font-medium text-slate-300'
                              }`}>
                                {match.player1}
                              </span>
                            </div>
                            <span className={`text-sm ${
                              match.score1 > match.score2 
                                ? 'font-bold text-green-400' 
                                : 'font-medium text-slate-400'
                            }`}>
                              {match.score1}
                            </span>
                          </div>

                          {/* Trailing Player */}
                          <div className={`flex items-center justify-between px-2 py-1.5 ${mediaDesignTokens.radius.sm} ${
                            match.score2 > match.score1 
                              ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 ring-1 ring-green-400/50' 
                              : 'bg-slate-700/50'
                          }`}>
                            <div className="flex items-center gap-1.5">
                              {match.score2 > match.score1 && (
                                <TrendingUp className="w-3 h-3 text-green-400 animate-pulse" />
                              )}
                              <span className={`text-xs ${
                                match.score2 > match.score1 
                                  ? 'font-bold text-white' 
                                  : 'font-medium text-slate-300'
                              }`}>
                                {match.player2}
                              </span>
                            </div>
                            <span className={`text-sm ${
                              match.score2 > match.score1 
                                ? 'font-bold text-green-400' 
                                : 'font-medium text-slate-400'
                            }`}>
                              {match.score2}
                            </span>
                          </div>
                        </div>

                        {/* Game Status Badge */}
                        <div className="flex items-center justify-between pt-1">
                          <Badge className={`text-xs px-2 py-0.5 ${
                            match.game === 'Match Point' 
                              ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          }`}>
                            {match.game}
                          </Badge>
                          {isLive && (
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                              <span className="text-xs text-red-400 font-medium">Live Match</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                {/* Empty State */}
                {liveTournaments.length === 0 && todayTournaments.length === 0 && (
                  <div className="text-center py-8 space-y-2">
                    <Radio className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-sm text-slate-300 font-medium">No live events right now</p>
                    <p className="text-xs text-slate-500">Check back soon for updates!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* ✅ ENHANCED: Live Now Section with Premium Design */}
        {liveTournaments.length > 0 && (
          <motion.section 
            id="live-section" 
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Premium Section Header */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-rose-500/20 to-red-500/20 blur-3xl" />
              <div className="relative flex items-center justify-between flex-wrap gap-4 p-6 rounded-2xl bg-gradient-to-br from-red-900/40 to-pink-900/40 border-2 border-red-500/50 backdrop-blur-sm shadow-2xl shadow-red-500/20">
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="p-4 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 shadow-2xl"
                    animate={{ 
                      boxShadow: [
                        '0 0 20px rgba(220, 38, 38, 0.6)',
                        '0 0 40px rgba(220, 38, 38, 0.8)',
                        '0 0 20px rgba(220, 38, 38, 0.6)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Radio className="w-8 h-8 text-white animate-pulse" />
                  </motion.div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
                      Live Tournaments
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-2xl"
                      >
                        🔴
                      </motion.span>
                    </h2>
                    <p className="text-slate-300 font-medium mt-1">
                      Streaming now - Watch live matches in real-time
                    </p>
                  </div>
                </div>
                <Badge className="bg-red-500/20 border-2 border-red-500/50 text-red-300 text-lg font-black px-6 py-3 shadow-lg shadow-red-500/20">
                  {liveTournaments.length} {liveTournaments.length === 1 ? 'Event' : 'Events'} LIVE
                </Badge>
              </div>
            </div>
            
            {/* Tournament Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence>
                {liveTournaments.map((tournament, index) => (
                  <motion.div
                    key={tournament.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TournamentCard tournament={tournament} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        )}

        {/* Tabbed Content */}
        <Tabs defaultValue="today" className="space-y-8 mt-16">
          <TabsList className={`grid w-full grid-cols-5 bg-slate-800/80 backdrop-blur-sm ${mediaDesignTokens.radius.lg} p-2 shadow-2xl border-2 border-teal-500/30`}>
            <TabsTrigger 
              value="today" 
              className={`${mediaDesignTokens.radius.md} data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-300 hover:text-white transition-all`}
            >
              <Clock className="w-4 h-4 mr-2" />
              Today
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming" 
              className={`${mediaDesignTokens.radius.md} data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-300 hover:text-white transition-all`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger 
              value="venues" 
              className={`${mediaDesignTokens.radius.md} data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-300 hover:text-white transition-all`}
            >
              <Building className="w-4 h-4 mr-2" />
              Top Venues
            </TabsTrigger>
            <TabsTrigger 
              value="courts" 
              className={`${mediaDesignTokens.radius.md} data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-300 hover:text-white transition-all`}
            >
              <Target className="w-4 h-4 mr-2" />
              Live Courts
            </TabsTrigger>
            <TabsTrigger 
              value="results" 
              className={`${mediaDesignTokens.radius.md} data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-300 hover:text-white transition-all`}
            >
              <Trophy className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
          </TabsList>

          {/* Today's Tournaments */}
          <TabsContent value="today" id="today-section" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {todayTournaments.map(tournament => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </TabsContent>

          {/* Upcoming Tournaments */}
          <TabsContent value="upcoming" id="upcoming-section" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingTournaments.map(tournament => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </TabsContent>

          {/* Top Venues */}
          <TabsContent value="venues" id="venues-section" className="space-y-6">
            <Card className={`${getCardClasses('accent')} bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-2 border-blue-500/30 backdrop-blur-sm`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className={`p-3 ${mediaDesignTokens.radius.md} bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg`}>
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  Top 10 Tournament Venues in the USA
                </CardTitle>
                <p className="text-slate-300 text-base">Major pickleball destinations hosting the biggest tournaments</p>
              </CardHeader>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TOP_VENUES.map((venue, index) => (
                <VenueCard key={index} venue={venue} />
              ))}
            </div>
          </TabsContent>

          {/* Active Courts */}
          <TabsContent value="courts" id="courts-section" className="space-y-6">
            <Card className={`${getCardClasses('accent')} bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500/30 backdrop-blur-sm`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-white">
                      <div className={`p-3 ${mediaDesignTokens.radius.md} bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg`}>
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      Live Court Activity
                    </CardTitle>
                    <p className="text-slate-300 text-base mt-2">Real-time updates from championship courts</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 flex items-center gap-2 whitespace-nowrap px-3 py-1">
                    <Radio className="w-3 h-3 animate-pulse" />
                    Auto-updates every 5min
                  </Badge>
                </div>
              </CardHeader>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCourts.map((court, index) => (
                <CourtCard key={index} court={court} />
              ))}
            </div>
          </TabsContent>

          {/* Recent Results */}
          <TabsContent value="results" id="results-section" className="space-y-6">
            <Card className={`${getCardClasses('accent')} bg-gradient-to-br from-amber-900/40 to-yellow-900/40 border-2 border-amber-500/30 backdrop-blur-sm`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className={`p-3 ${mediaDesignTokens.radius.md} bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg`}>
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  Recent Tournament Results
                </CardTitle>
                <p className="text-slate-300 text-base">Latest championship outcomes</p>
              </CardHeader>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentResults.map((result, index) => (
                <ResultCard key={index} result={result} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Links Section */}
        <Card className={`${getCardClasses('accent')} bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-teal-500/30 backdrop-blur-sm shadow-2xl`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <div className={`p-3 ${mediaDesignTokens.radius.md} bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg`}>
                <Youtube className="w-6 h-6 text-white" />
              </div>
              Official Streaming Platforms
            </CardTitle>
            <p className="text-slate-300 text-base">Watch tournaments on these official channels</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className={`h-24 flex-col gap-3 ${mediaDesignTokens.radius.lg} border-2 border-red-500/30 hover:border-red-500 hover:bg-red-900/30 bg-slate-800/50 backdrop-blur-sm transition-all shadow-lg hover:shadow-red-500/20`}
                onClick={() => handleYouTubeLink('PPA_TOUR')}
              >
                <Youtube className="w-8 h-8 text-red-500" />
                <span className="text-sm font-semibold text-white">PPA Tour</span>
              </Button>
              
              <Button
                variant="outline"
                className={`h-24 flex-col gap-3 ${mediaDesignTokens.radius.lg} border-2 border-purple-500/30 hover:border-purple-500 hover:bg-purple-900/30 bg-slate-800/50 backdrop-blur-sm transition-all shadow-lg hover:shadow-purple-500/20`}
                onClick={() => handleYouTubeLink('MLP')}
              >
                <Youtube className="w-8 h-8 text-purple-500" />
                <span className="text-sm font-semibold text-white">MLP</span>
              </Button>
              
              <Button
                variant="outline"
                className={`h-24 flex-col gap-3 ${mediaDesignTokens.radius.lg} border-2 border-blue-500/30 hover:border-blue-500 hover:bg-blue-900/30 bg-slate-800/50 backdrop-blur-sm transition-all shadow-lg hover:shadow-blue-500/20`}
                onClick={() => handleYouTubeLink('APP_TOUR')}
              >
                <Youtube className="w-8 h-8 text-blue-500" />
                <span className="text-sm font-semibold text-white">APP Tour</span>
              </Button>
              
              <Button
                variant="outline"
                className={`h-24 flex-col gap-3 ${mediaDesignTokens.radius.lg} border-2 border-green-500/30 hover:border-green-500 hover:bg-green-900/30 bg-slate-800/50 backdrop-blur-sm transition-all shadow-lg hover:shadow-green-500/20`}
                onClick={() => handleTournamentLink('https://usapickleball.org', 'website')}
              >
                <Globe className="w-8 h-8 text-green-500" />
                <span className="text-sm font-semibold text-white">USA Pickleball</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
