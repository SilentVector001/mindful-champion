
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  PlayCircle,
  Mic,
  Calendar,
  Monitor,
  TrendingUp,
  Users,
  ExternalLink,
  Crown,
  Zap,
  Clock,
  Star,
  Trophy,
  ArrowRight,
  Activity,
  Radio,
  Sparkles,
  ChevronRight,
  MapPin,
  Tv
} from 'lucide-react';

interface MediaOverview {
  stats: {
    podcasts: number;
    streamingPlatforms: number;
    tournamentOrganizations: number;
    upcomingEvents: number;
  };
  featuredContent: {
    podcasts: Array<{
      id: string;
      name: string;
      hosts: string[];
      rating: number;
      description: string;
    }>;
    streamingPlatforms: Array<{
      id: string;
      name: string;
      type: string;
      description: string;
      hasFreeAccess: boolean;
    }>;
    upcomingEvents: Array<{
      id: string;
      name: string;
      date: string;
      daysUntil: number;
      organization?: string;
      location?: string;
      broadcast?: string;
    }>;
  };
  liveIndicators: {
    liveStreams: number;
    activeScores: number;
    upcomingEvents: number;
  };
  tierInfo: {
    currentTier: string;
    trialDaysLeft: number | null;
    features: string[];
  };
}

export function MediaHub() {
  const [overview, setOverview] = useState<MediaOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const response = await fetch('/api/media/overview');
      const data = await response.json();
      
      if (data.success) {
        setOverview(data.overview);
      }
    } catch (error) {
      console.error('Error fetching media overview:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prevent hydration mismatch by only rendering after mount
  if (!mounted || loading) {
    return <MediaHubSkeleton />;
  }

  if (!overview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champion-green/5 via-white to-champion-blue/5">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Failed to load media content</h1>
            <Button onClick={fetchOverview}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champion-green/5 via-white to-champion-blue/5">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Hero Section - Simplified and Modern */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-champion-green/20 rounded-full blur-xl"></div>
                <PlayCircle className="relative w-14 h-14 text-champion-green" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-champion-green via-champion-blue to-champion-gold bg-clip-text text-transparent">
                Media Hub
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stream live tournaments, discover top podcasts, and never miss an event
            </p>
            
            {/* Trial Status - Compact */}
            {overview.tierInfo.trialDaysLeft && (
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-champion-gold/10 to-champion-blue/10 rounded-full border border-champion-gold/20"
              >
                <Crown className="w-4 h-4 text-champion-gold" />
                <span className="text-sm font-medium text-gray-700">
                  {overview.tierInfo.trialDaysLeft} days of trial remaining
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Live Indicators - Compact and Modern */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-6 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                {overview.liveIndicators.liveStreams} Live
              </span>
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-champion-green" />
              <span className="text-sm font-medium text-gray-700">
                {overview.liveIndicators.activeScores} Scores
              </span>
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-champion-blue" />
              <span className="text-sm font-medium text-gray-700">
                {overview.liveIndicators.upcomingEvents} Upcoming
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main Stats - Modern Cards with Hover Effects */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
        >
          <Link href="/media/podcasts">
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-champion-green/10 to-champion-green/5 p-6 border-2 border-transparent hover:border-champion-green/30 transition-all shadow-sm hover:shadow-lg"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-champion-green/5 rounded-full blur-3xl transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform"></div>
              <Mic className="w-10 h-10 text-champion-green mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{overview.stats.podcasts}</div>
              <div className="text-sm text-gray-600 font-medium">Podcasts</div>
              <ChevronRight className="absolute bottom-4 right-4 w-5 h-5 text-champion-green opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          </Link>

          <Link href="/media/streaming">
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-champion-blue/10 to-champion-blue/5 p-6 border-2 border-transparent hover:border-champion-blue/30 transition-all shadow-sm hover:shadow-lg"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-champion-blue/5 rounded-full blur-3xl transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform"></div>
              <Monitor className="w-10 h-10 text-champion-blue mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{overview.stats.streamingPlatforms}</div>
              <div className="text-sm text-gray-600 font-medium">Streaming</div>
              <ChevronRight className="absolute bottom-4 right-4 w-5 h-5 text-champion-blue opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          </Link>

          <Link href="/media/events">
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-champion-gold/10 to-champion-gold/5 p-6 border-2 border-transparent hover:border-champion-gold/30 transition-all shadow-sm hover:shadow-lg"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-champion-gold/5 rounded-full blur-3xl transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform"></div>
              <Trophy className="w-10 h-10 text-champion-gold mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{overview.stats.upcomingEvents}</div>
              <div className="text-sm text-gray-600 font-medium">Major Events</div>
              <ChevronRight className="absolute bottom-4 right-4 w-5 h-5 text-champion-gold opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          </Link>

          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 p-6 border-2 border-dashed border-gray-300 transition-all shadow-sm hover:shadow-lg"
          >
            <Users className="w-10 h-10 text-gray-400 mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-3xl font-bold text-gray-900 mb-1">{overview.stats.tournamentOrganizations}</div>
            <div className="text-sm text-gray-600 font-medium">Organizations</div>
          </motion.div>
        </motion.div>

        {/* Featured Content - Modern 3-Column Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* Featured Podcasts - Redesigned */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full shadow-md hover:shadow-xl transition-shadow border-2 border-gray-100">
              <CardHeader className="border-b bg-gradient-to-r from-champion-green/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 bg-champion-green/10 rounded-lg">
                    <Mic className="w-5 h-5 text-champion-green" />
                  </div>
                  <span>Top Podcasts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {overview.featuredContent.podcasts.map((podcast, index) => (
                  <motion.div 
                    key={podcast.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="group p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-champion-green/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 line-clamp-2 text-sm group-hover:text-champion-green transition-colors">
                        {podcast.name}
                      </h4>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2 bg-yellow-50 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-medium text-yellow-700">{podcast.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <Radio className="w-3 h-3" />
                      {podcast.hosts.join(' & ')}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">{podcast.description}</p>
                  </motion.div>
                ))}
                <Link href="/media/podcasts">
                  <Button className="w-full mt-4 bg-gradient-to-r from-champion-green to-champion-blue hover:shadow-lg group">
                    Explore All Podcasts
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Events - Redesigned */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full shadow-md hover:shadow-xl transition-shadow border-2 border-gray-100">
              <CardHeader className="border-b bg-gradient-to-r from-champion-gold/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 bg-champion-gold/10 rounded-lg">
                    <Calendar className="w-5 h-5 text-champion-gold" />
                  </div>
                  <span>Upcoming Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {overview.featuredContent.upcomingEvents.map((event, index) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="group p-4 rounded-xl bg-gradient-to-br from-champion-gold/5 to-champion-blue/5 hover:shadow-md transition-all cursor-pointer border border-champion-gold/10 hover:border-champion-gold/30"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 line-clamp-2 text-sm group-hover:text-champion-gold transition-colors">
                        {event.name}
                      </h4>
                      <Badge className="text-xs flex-shrink-0 ml-2 bg-champion-gold/10 text-champion-gold border-champion-gold/20">
                        {event.daysUntil}d
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.date}
                      </p>
                      {event.organization && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          {event.organization}
                        </p>
                      )}
                      {event.location && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </p>
                      )}
                      {event.broadcast && (
                        <p className="text-xs text-champion-blue font-medium flex items-center gap-1">
                          <Tv className="w-3 h-3" />
                          {event.broadcast}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
                <Link href="/media/events">
                  <Button className="w-full mt-4 bg-gradient-to-r from-champion-gold to-champion-green hover:shadow-lg group">
                    View Event Calendar
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Streaming Platforms - Redesigned */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="h-full shadow-md hover:shadow-xl transition-shadow border-2 border-gray-100">
              <CardHeader className="border-b bg-gradient-to-r from-champion-blue/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 bg-champion-blue/10 rounded-lg">
                    <Monitor className="w-5 h-5 text-champion-blue" />
                  </div>
                  <span>Streaming Platforms</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {overview.featuredContent.streamingPlatforms.map((platform, index) => (
                  <motion.div 
                    key={platform.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="group p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-champion-blue/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 group-hover:text-champion-blue transition-colors">
                        {platform.name}
                      </h4>
                      {platform.hasFreeAccess && (
                        <Badge className="text-xs bg-green-50 text-green-700 border-green-200">
                          <Zap className="w-3 h-3 mr-1" />
                          Free
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{platform.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 capitalize flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {platform.type.toLowerCase()}
                      </span>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-champion-blue transition-colors" />
                    </div>
                  </motion.div>
                ))}
                <Link href="/media/streaming">
                  <Button className="w-full mt-4 bg-gradient-to-r from-champion-blue to-champion-green hover:shadow-lg group">
                    Browse All Platforms
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions - Modern and Engaging */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-gradient-to-r from-champion-green/5 via-champion-blue/5 to-champion-gold/5 border-0 shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-champion-blue" />
                Quick Access
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/media/podcasts?audience=beginners">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="p-4 bg-white rounded-xl hover:shadow-md transition-all border border-gray-100 hover:border-champion-green/30 group cursor-pointer"
                  >
                    <Radio className="w-6 h-6 text-champion-green mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-900 block">Beginner Podcasts</span>
                    <span className="text-xs text-gray-500">Start learning</span>
                  </motion.div>
                </Link>
                
                <Link href="/media/events?upcoming=true">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="p-4 bg-white rounded-xl hover:shadow-md transition-all border border-gray-100 hover:border-champion-blue/30 group cursor-pointer"
                  >
                    <Clock className="w-6 h-6 text-champion-blue mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-900 block">This Month</span>
                    <span className="text-xs text-gray-500">See what's coming</span>
                  </motion.div>
                </Link>
                
                <Link href="/media/streaming?type=free">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="p-4 bg-white rounded-xl hover:shadow-md transition-all border border-gray-100 hover:border-champion-gold/30 group cursor-pointer"
                  >
                    <Zap className="w-6 h-6 text-champion-gold mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-900 block">Free Streams</span>
                    <span className="text-xs text-gray-500">Watch now</span>
                  </motion.div>
                </Link>
                
                <Link href="/media-center">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="p-4 bg-white rounded-xl hover:shadow-md transition-all border border-gray-100 hover:border-gray-300 group cursor-pointer"
                  >
                    <TrendingUp className="w-6 h-6 text-gray-700 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-900 block">Full Center</span>
                    <span className="text-xs text-gray-500">Explore all</span>
                  </motion.div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function MediaHubSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-champion-green/5 via-white to-champion-blue/5">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <Skeleton className="h-14 w-14 mx-auto mb-4 rounded-full" />
          <Skeleton className="h-12 w-80 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-24 rounded-xl" />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
