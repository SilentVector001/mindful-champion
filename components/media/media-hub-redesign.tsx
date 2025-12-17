
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TournamentHub } from '@/components/media/tournament-hub';
import {
  PlayCircle,
  Calendar,
  Trophy,
  Clock,
  MapPin,
  Tv,
  Activity,
  Radio,
  Users,
  Star,
  Sparkles,
  TrendingUp,
  ChevronRight,
  ExternalLink,
  Eye,
  Globe
} from 'lucide-react';

interface QuickLinkItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  isExternal: boolean;
  category: string;
  featured: boolean;
}

interface MediaStats {
  liveStreams: number;
  upcomingEvents: number;
  totalViewers: number;
  activeMatches: number;
}

export function MediaHubRedesign() {
  const [stats, setStats] = useState<MediaStats>({
    liveStreams: 0,
    upcomingEvents: 0,
    totalViewers: 0,
    activeMatches: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch real-time stats from our live tournament APIs
      const [liveRes, scoresRes] = await Promise.all([
        fetch('/api/media-hub/live-tournaments?live=true'),
        fetch('/api/media-hub/live-scores?limit=50')
      ]);

      const [liveData, scoresData] = await Promise.all([
        liveRes.json(),
        scoresRes.json()
      ]);

      setStats({
        liveStreams: liveData.success ? liveData.events?.length || 0 : 0,
        upcomingEvents: 6, // Mock for now
        totalViewers: liveData.success 
          ? (liveData.events?.reduce((total: number, event: any) => total + (event.viewerCount || 0), 0) || 0)
          : 0,
        activeMatches: scoresData.success 
          ? (scoresData.matches?.filter((m: any) => m.isLive).length || 0)
          : 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickLinks: QuickLinkItem[] = [
    {
      id: 'pickleballtv',
      title: 'PickleballTV',
      description: 'Premium live tournament coverage',
      icon: <Tv className="w-6 h-6" />,
      href: '/media-hub/pickleballtv',
      isExternal: false,
      category: 'Streaming',
      featured: true
    },
    {
      id: 'ppa-tour',
      title: 'PPA Tour',
      description: 'Professional Pickleball Association',
      icon: <Trophy className="w-6 h-6" />,
      href: '/media-hub/ppa',
      isExternal: false,
      category: 'Organizations',
      featured: true
    },
    {
      id: 'mlp',
      title: 'Major League Pickleball',
      description: 'Team-based professional league',
      icon: <Users className="w-6 h-6" />,
      href: '/media-hub/mlp',
      isExternal: false,
      category: 'Organizations',
      featured: true
    },
    {
      id: 'usa-pickleball',
      title: 'USA Pickleball',
      description: 'Official governing body',
      icon: <Star className="w-6 h-6" />,
      href: '/media-hub/usa-pickleball',
      isExternal: false,
      category: 'Organizations',
      featured: false
    }
  ];

  const formatViewerCount = (count: number) => {
    if (count < 1000) return count.toString();
    if (count < 10000) return `${(count / 1000).toFixed(1)}K`;
    return `${Math.floor(count / 1000)}K`;
  };

  if (loading) {
    return <MediaHubSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section - Live Indicator */}
      <div className="bg-gradient-to-r from-champion-green via-champion-blue to-champion-gold p-1">
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <PlayCircle className="w-8 h-8 text-champion-green" />
                  <h1 className="text-3xl font-bold text-gray-900">Live Tournament Hub</h1>
                </div>
                <p className="text-gray-600">
                  Watch live pro tournaments with embedded players, real-time scores, and comprehensive coverage
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-center bg-red-50 px-4 py-3 rounded-xl border border-red-200"
                >
                  <div className="text-xl font-bold text-red-600">{stats.liveStreams}</div>
                  <div className="text-xs text-gray-600">Live Streams</div>
                </motion.div>
                
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-center bg-blue-50 px-4 py-3 rounded-xl border border-blue-200"
                >
                  <div className="text-xl font-bold text-blue-600">{stats.activeMatches}</div>
                  <div className="text-xs text-gray-600">Live Matches</div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="streaming" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="streaming" className="flex items-center gap-2">
              <Tv className="w-4 h-4" />
              Live Streaming
            </TabsTrigger>
            <TabsTrigger value="hub" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Media Hub
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Radio className="w-4 h-4" />
              Resources
            </TabsTrigger>
          </TabsList>

          {/* Live Streaming Tab - Main Feature */}
          <TabsContent value="streaming">
            <TournamentHub />
          </TabsContent>

          {/* Media Hub Tab - Quick Links and Organizations */}
          <TabsContent value="hub" className="space-y-8">
            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <Card className="text-center p-4">
                <Eye className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {formatViewerCount(stats.totalViewers)}
                </div>
                <div className="text-sm text-gray-600">Total Viewers</div>
              </Card>
              
              <Card className="text-center p-4">
                <Activity className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600 mb-1">{stats.liveStreams}</div>
                <div className="text-sm text-gray-600">Live Streams</div>
              </Card>
              
              <Card className="text-center p-4">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.activeMatches}</div>
                <div className="text-sm text-gray-600">Active Matches</div>
              </Card>
              
              <Card className="text-center p-4">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600 mb-1">{stats.upcomingEvents}</div>
                <div className="text-sm text-gray-600">This Month</div>
              </Card>
            </motion.div>

            {/* Quick Access Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-champion-gold" />
                    Featured Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickLinks.filter(link => link.featured).map((link) => (
                      <motion.div
                        key={link.id}
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="group"
                      >
                        <Card className="h-full cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-champion-green/30">
                          <CardContent className="p-6 text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-champion-green/10 rounded-xl mx-auto mb-4 group-hover:bg-champion-green/20 transition-colors">
                              {link.icon}
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-champion-green transition-colors">
                              {link.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">{link.description}</p>
                            <Badge variant="outline" className="text-xs">
                              {link.category}
                            </Badge>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="text-center mt-6">
                    <Button variant="outline" className="gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Explore All Platforms
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tournament Organizations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-champion-blue" />
                    Tournament Organizations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-blue-900 mb-2">PPA Tour</h3>
                      <p className="text-sm text-blue-700">Professional singles & doubles tournaments worldwide</p>
                    </div>
                    
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="font-bold text-green-900 mb-2">Major League Pickleball</h3>
                      <p className="text-sm text-green-700">Team-based professional league format</p>
                    </div>
                    
                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="font-bold text-purple-900 mb-2">USA Pickleball</h3>
                      <p className="text-sm text-purple-700">Official governing body and amateur tournaments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Resources Tab - Podcasts and Additional Content */}
          <TabsContent value="resources" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Radio className="w-6 h-6 text-champion-green" />
                    Additional Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Podcasts & Media</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Radio className="w-5 h-5 text-champion-green" />
                          <div>
                            <div className="font-medium">PicklePod</div>
                            <div className="text-sm text-gray-600">Pro insights & tournament coverage</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Radio className="w-5 h-5 text-champion-green" />
                          <div>
                            <div className="font-medium">It Feels Right</div>
                            <div className="text-sm text-gray-600">Strategy & improvement tips</div>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View All Podcasts
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Events & Tournaments</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Calendar className="w-5 h-5 text-champion-blue" />
                          <div>
                            <div className="font-medium">Tournament Calendar</div>
                            <div className="text-sm text-gray-600">Upcoming events & registration</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Trophy className="w-5 h-5 text-champion-gold" />
                          <div>
                            <div className="font-medium">Results & Rankings</div>
                            <div className="text-sm text-gray-600">Player standings & match history</div>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Event Calendar
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function MediaHubSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-gradient-to-r from-champion-green via-champion-blue to-champion-gold p-1">
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-8 w-80 mb-2" />
                <Skeleton className="h-5 w-96" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 w-20" />
                <Skeleton className="h-16 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-12 w-full mb-8" />
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
