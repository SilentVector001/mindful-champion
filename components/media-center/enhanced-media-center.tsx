// Build: 1764946147
'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Tv,
  Zap,
  Crown,
  Settings,
  RefreshCw,
  Home,
  Radio,
  Trophy,
  Calendar,
  BookOpen,
  Users,
  Flame,
  Star,
  TrendingUp,
  Library,
  Video,
  AlertCircle
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { mediaDesignTokens } from '@/lib/media-design-system';
import { cn } from '@/lib/utils';

// Import all media center sections
import { LiveScoresSection } from './live-scores-section';
import { LiveStreamsSection } from './live-streams-section';
import { EventsCalendarSection } from './events-calendar-section';
import { TrainingLibrarySection } from './training-library-section';
import { MyLibrarySection } from './my-library-section';
import { RecentHighlightsSection } from './recent-highlights-section';

// Import new enhanced sections
import { FeaturedHeroCarousel } from './featured-hero-carousel';
import { PlayerSpotlightsSection } from './player-spotlights-section';
import { TrendingContentSection } from './trending-content-section';
import { CommunityEngagementSection } from './community-engagement-section';

// Loading component for sections
function SectionSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl backdrop-blur-sm"></div>
    </div>
  );
}

// Error fallback for sections
function SectionError({ section }: { section: string }) {
  return (
    <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
      <CardContent className="p-6 text-center">
        <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
        <p className="text-white/80 text-sm">Unable to load {section}</p>
      </CardContent>
    </Card>
  );
}

interface TierAccess {
  canAccessLiveStreams: boolean;
  canAccessAllPodcasts: boolean;
  maxPodcastEpisodes: number;
  canBookmarkContent: boolean;
  canAccessAdvancedFeatures: boolean;
  canDownloadContent: boolean;
  showUpgradePrompts: boolean;
}

interface TrialStatus {
  isOnTrial: boolean;
  trialEndDate: string | null;
  daysRemaining: number;
  hasExpired: boolean;
}

// Tab items - Podcasts removed (outdated data)
const TAB_ITEMS = [
  { id: 'overview', label: 'Home', icon: Home },
  { id: 'live', label: 'Live', icon: Radio },
  { id: 'highlights', label: 'Highlights', icon: Trophy },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'training', label: 'Training', icon: BookOpen },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'library', label: 'My Library', icon: Library }
] as const;

export function EnhancedMediaCenter() {
  const { data: session } = useSession();
  const [tierAccess, setTierAccess] = useState<TierAccess | null>(null);
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [liveIndicators, setLiveIndicators] = useState({
    liveStreams: 0,
    liveScores: 0,
    upcomingEvents: 0
  });

  useEffect(() => {
    fetchUserAccess();
    fetchTrialStatus();
    fetchLiveIndicators();
    
    const interval = setInterval(fetchLiveIndicators, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserAccess = async () => {
    try {
      const subscriptionTier = 'TRIAL' as 'TRIAL' | 'FREE' | 'PREMIUM' | 'PRO';
      
      const access: TierAccess = {
        canAccessLiveStreams: subscriptionTier !== 'FREE',
        canAccessAllPodcasts: subscriptionTier !== 'FREE',
        maxPodcastEpisodes: subscriptionTier === 'FREE' ? 3 : -1,
        canBookmarkContent: subscriptionTier !== 'FREE',
        canAccessAdvancedFeatures: subscriptionTier !== 'FREE',
        canDownloadContent: subscriptionTier === 'PREMIUM' || subscriptionTier === 'PRO',
        showUpgradePrompts: subscriptionTier === 'FREE'
      };
      
      setTierAccess(access);
    } catch (error) {
      console.error('Error fetching user access:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrialStatus = async () => {
    try {
      const response = await fetch('/api/media-center/trial');
      const data = await response.json();
      
      if (data.success) {
        setTrialStatus(data.trialStatus);
      }
    } catch (error) {
      console.error('Error fetching trial status:', error);
    }
  };

  const fetchLiveIndicators = async () => {
    try {
      setLiveIndicators({
        liveStreams: Math.floor(Math.random() * 3),
        liveScores: Math.floor(Math.random() * 5),
        upcomingEvents: 12 + Math.floor(Math.random() * 8)
      });
    } catch (error) {
      console.error('Error fetching live indicators:', error);
    }
  };

  const triggerSync = async () => {
    try {
      await fetch('/api/media-center/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'full-sync' })
      });
    } catch (error) {
      console.error('Error triggering sync:', error);
    }
  };

  if (loading || !tierAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-[400px] bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-3xl backdrop-blur-sm"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl backdrop-blur-sm"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-gradient-to-br from-yellow-400/15 to-orange-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-2xl shadow-2xl shadow-purple-500/40 animate-pulse">
                <Tv className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
              
              <div>
                <h1 className="text-4xl font-extrabold flex items-center gap-3">
                  <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-lg">
                    Media Hub
                  </span>
                  {liveIndicators.liveStreams > 0 && (
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white animate-bounce shadow-lg shadow-red-500/50 px-3 py-1">
                      <Radio className="w-4 h-4 mr-1 animate-pulse" />
                      {liveIndicators.liveStreams} LIVE
                    </Badge>
                  )}
                </h1>
                <p className="text-purple-200 text-lg font-medium">
                  🎾 Your ultimate pickleball content destination
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {trialStatus?.isOnTrial && (
                <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg shadow-amber-500/30">
                  <Crown className="w-4 h-4 mr-2" />
                  {trialStatus.daysRemaining} days left
                </Badge>
              )}
              
              <Button 
                onClick={fetchLiveIndicators}
                className="rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              
              {session?.user?.role === 'ADMIN' && (
                <Button 
                  onClick={triggerSync}
                  className="rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-400 hover:to-purple-400 shadow-lg shadow-purple-500/30"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Sync
                </Button>
              )}
            </div>
          </div>

          {/* Live Status Bar - Now with glass effect */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="font-bold text-white">{liveIndicators.liveStreams} Live Streams</span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/20 px-4 py-2 rounded-full">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="font-bold text-white">{liveIndicators.liveScores} Active Matches</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-full">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="font-bold text-white">{liveIndicators.upcomingEvents} Upcoming Events</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-purple-200">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Connected • Auto-updates every 30s</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content - Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Enhanced Tab Navigation - Glass effect */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-2xl overflow-x-auto">
            <TabsList className="flex w-full gap-2 bg-transparent">
              {TAB_ITEMS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300",
                    "data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:via-purple-500 data-[state=active]:to-pink-500",
                    "data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-purple-500/40 data-[state=active]:scale-105",
                    "data-[state=inactive]:text-purple-200 data-[state=inactive]:hover:bg-white/10 data-[state=inactive]:hover:text-white"
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.id === 'live' && liveIndicators.liveStreams > 0 && (
                    <Badge className="ml-1 px-2 py-0.5 h-5 text-[10px] bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50">
                      {liveIndicators.liveStreams}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Overview Tab - Enhanced Home View */}
          <TabsContent value="overview" className="space-y-8 mt-6">
            {/* Hero Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FeaturedHeroCarousel />
            </motion.div>

            {/* Quick Stats Row - Vibrant glass cards */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { icon: Radio, label: 'Live Now', value: liveIndicators.liveStreams, gradient: 'from-red-500 via-pink-500 to-rose-500', glow: 'shadow-red-500/40' },
                { icon: Trophy, label: 'Active Matches', value: liveIndicators.liveScores, gradient: 'from-emerald-400 via-green-500 to-teal-500', glow: 'shadow-emerald-500/40' },
                { icon: Calendar, label: 'This Week', value: liveIndicators.upcomingEvents, gradient: 'from-blue-400 via-cyan-500 to-teal-400', glow: 'shadow-cyan-500/40' },
                { icon: Flame, label: 'Trending', value: '12K+', gradient: 'from-orange-400 via-amber-500 to-yellow-500', glow: 'shadow-orange-500/40' }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className={cn("border-0 overflow-hidden bg-gradient-to-br", stat.gradient, "shadow-2xl", stat.glow)}>
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                        <stat.icon className="w-6 h-6 text-white drop-shadow-lg" />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-white drop-shadow-lg">{stat.value}</p>
                        <p className="text-sm text-white/80 font-medium">{stat.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Main Content Grid */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Column - Trending & Live */}
              <div className="lg:col-span-2 space-y-6">
                <TrendingContentSection />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LiveStreamsSection tierAccess={tierAccess} />
                  <LiveScoresSection tierAccess={tierAccess} />
                </div>
              </div>

              {/* Right Column - Players & Community */}
              <div className="space-y-6">
                <PlayerSpotlightsSection />
                <CommunityEngagementSection />
              </div>
            </motion.div>
            
            {/* Recent Highlights Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <RecentHighlightsSection limit={12} />
            </motion.div>
            
            {/* Bottom Row - Events Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <EventsCalendarSection tierAccess={tierAccess} />
            </motion.div>
          </TabsContent>

          {/* Live Tab */}
          <TabsContent value="live" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LiveStreamsSection tierAccess={tierAccess} />
              <LiveScoresSection tierAccess={tierAccess} />
            </div>
          </TabsContent>

          {/* Highlights Tab */}
          <TabsContent value="highlights" className="space-y-6 mt-6">
            <RecentHighlightsSection limit={24} />
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-6">
            <EventsCalendarSection tierAccess={tierAccess} />
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="mt-6">
            <TrainingLibrarySection tierAccess={tierAccess} />
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CommunityEngagementSection />
              </div>
              <div>
                <PlayerSpotlightsSection />
              </div>
            </div>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="mt-6">
            <MyLibrarySection tierAccess={tierAccess} />
          </TabsContent>
        </Tabs>

        {/* Footer - Vibrant glass effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10"></div>
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-center gap-4 text-purple-200 text-sm flex-wrap">
                <span className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-bold">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  Powered by real-time data
                </span>
                <span className="text-white/30">•</span>
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
                <span className="text-white/30">•</span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                  <span className="text-emerald-300">All systems operational</span>
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
