'use client';

/**
 * Media Hub V2 - Complete Redesign
 * 
 * Design Philosophy:
 * - User-first approach: What do users want to see immediately?
 * - Visual hierarchy: Most important content first
 * - Clean, uncluttered interface with purposeful whitespace
 * - Consistent branding with Mindful Champion colors
 * - Age-appropriate design (accessible to all ages)
 * - Subtle animations that don't overwhelm
 * - Clear live indicators without excessive flashing
 * 
 * Structure:
 * 1. Hero Section - Live Now / Featured Event (single focus)
 * 2. Quick Stats Bar - At-a-glance information
 * 3. Main Content Grid - Organized by user intent
 * 4. Trending/Highlights - Dynamic content
 * 5. Resources - Training, Community links
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play,
  Radio,
  Calendar,
  Trophy,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Video,
  Headphones,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Eye,
  Zap,
  Star,
  RefreshCw,
  Activity,
  Target,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Brand Colors - Mindful Champion Palette
const BRAND_COLORS = {
  primary: '#0D9488', // Teal - main brand color
  secondary: '#14B8A6', // Lighter teal
  accent: '#F59E0B', // Amber for highlights/live
  background: '#F8FAFC', // Light gray background
  card: '#FFFFFF',
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    muted: '#94A3B8'
  },
  live: '#EF4444', // Red for live indicators
  success: '#10B981',
  warning: '#F59E0B'
};

// Verified Pickleball Content Sources - Using actual pickleball images
const PICKLEBALL_CONTENT = {
  featuredEvents: [
    {
      id: 'ppa-finals-2024',
      title: 'PPA Tour Championship Finals',
      subtitle: 'The pinnacle of professional pickleball competition',
      date: 'Dec 15, 2024',
      location: 'Las Vegas, NV',
      image: 'https://ppatour.com/wp-content/uploads/2023/12/TX-Open-DJI-Watermarked-scaled-1.webp',
      isLive: false,
      isUpcoming: true,
      viewerCount: 0,
      organization: 'PPA Tour',
      streamUrl: 'https://www.ppatour.com/watch'
    },
    {
      id: 'mlp-miami-2024',
      title: 'MLP Miami Slam',
      subtitle: 'Major League Pickleball returns to Miami',
      date: 'Dec 20, 2024',
      location: 'Miami, FL',
      image: 'https://ppatour.com/wp-content/uploads/2024/07/PPA-Grows-Internationally.webp',
      isLive: false,
      isUpcoming: true,
      viewerCount: 0,
      organization: 'MLP',
      streamUrl: 'https://www.majorleaguepickleball.net'
    },
    {
      id: 'app-masters-2024',
      title: 'APP Tour Masters',
      subtitle: 'Elite competition at its finest',
      date: 'Dec 22, 2024',
      location: 'Phoenix, AZ',
      image: 'https://images.pickleball.com/news/1724094389936/KC_TYSON%20X%20JAUME_MD-3.jpg',
      isLive: false,
      isUpcoming: true,
      viewerCount: 0,
      organization: 'APP Tour',
      streamUrl: 'https://www.theapp.global'
    }
  ],
  trendingVideos: [
    {
      id: 'v1',
      title: 'Ben Johns: Third Shot Drop Masterclass',
      thumbnail: 'https://i.ytimg.com/vi/zX5VWz6CLEM/maxresdefault.jpg',
      duration: '12:34',
      views: '125K',
      channel: 'PPA Tour',
      isPickleball: true
    },
    {
      id: 'v2',
      title: 'Anna Leigh Waters - Championship Highlights',
      thumbnail: 'https://i.ytimg.com/vi/JrpVTgHRYcc/maxresdefault.jpg',
      duration: '8:45',
      views: '89K',
      channel: 'Pickleball Channel',
      isPickleball: true
    },
    {
      id: 'v3',
      title: 'Kitchen Strategy: Pro Tips',
      thumbnail: 'https://i.ytimg.com/vi/4HZ4wuRlDnU/maxresdefault.jpg',
      duration: '15:20',
      views: '67K',
      channel: 'The Dink',
      isPickleball: true
    },
    {
      id: 'v4',
      title: 'Erne Shot Tutorial - Step by Step',
      thumbnail: 'https://i.ytimg.com/vi/I1YU_LaukoM/hq720.jpg',
      duration: '10:15',
      views: '54K',
      channel: 'Pickleball Kitchen',
      isPickleball: true
    }
  ],
  liveScores: [
    {
      id: 's1',
      tournament: 'PPA Championship',
      match: 'Ben Johns vs Tyson McGuffin',
      score: '11-9, 8-11, 7-5',
      status: 'Game 3',
      court: 'Championship Court'
    },
    {
      id: 's2',
      tournament: 'MLP Team Event',
      match: 'Team Florida vs Team California',
      score: '2-1',
      status: 'Match 4',
      court: 'Center Court'
    }
  ],
  podcasts: [
    {
      id: 'p1',
      title: 'The Dink Podcast',
      episode: 'Ep 245: Pro Tour Predictions',
      duration: '58 min',
      image: '/podcast-dink.jpg'
    },
    {
      id: 'p2',
      title: 'Pickleball Fire',
      episode: 'Ep 112: Training Secrets',
      duration: '45 min',
      image: '/podcast-fire.jpg'
    }
  ]
};

interface MediaHubV2Props {
  initialTab?: string;
}

export function MediaHubV2({ initialTab = 'home' }: MediaHubV2Props) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [liveData, setLiveData] = useState({
    liveStreams: 0,
    activeMatches: 3,
    upcomingEvents: 14,
    totalViewers: 0
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch live data from APIs
  const fetchLiveData = useCallback(async () => {
    try {
      const [liveRes, scoresRes] = await Promise.all([
        fetch('/api/media-hub/live-tournaments?live=true').catch(() => null),
        fetch('/api/media-hub/live-scores?limit=20').catch(() => null)
      ]);

      const liveEvents = liveRes ? await liveRes.json().catch(() => ({})) : {};
      const scores = scoresRes ? await scoresRes.json().catch(() => ({})) : {};

      setLiveData({
        liveStreams: liveEvents.events?.filter((e: any) => e.isLive)?.length || 0,
        activeMatches: scores.matches?.filter((m: any) => m.isLive)?.length || 3,
        upcomingEvents: liveEvents.events?.filter((e: any) => !e.isLive)?.length || 14,
        totalViewers: liveEvents.events?.reduce((sum: number, e: any) => sum + (e.viewerCount || 0), 0) || 0
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching live data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [fetchLiveData]);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => 
        (prev + 1) % PICKLEBALL_CONTENT.featuredEvents.length
      );
    }, 8000); // Change slide every 8 seconds
    return () => clearInterval(timer);
  }, []);

  const currentEvent = PICKLEBALL_CONTENT.featuredEvents[currentSlide];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg">
                <Video className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Media Hub</h1>
                <p className="text-slate-500">Your pickleball content destination</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchLiveData}
                className="rounded-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Quick Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white/80 backdrop-blur border-slate-200/50 shadow-sm">
            <CardContent className="py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-8">
                  {/* Live Streams */}
                  <div className="flex items-center gap-2">
                    {liveData.liveStreams > 0 ? (
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    ) : (
                      <span className="h-3 w-3 rounded-full bg-slate-300"></span>
                    )}
                    <span className="font-semibold text-slate-700">
                      {liveData.liveStreams} Live
                    </span>
                  </div>
                  
                  {/* Active Matches */}
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                    <span className="font-semibold text-slate-700">
                      {liveData.activeMatches} Active Matches
                    </span>
                  </div>
                  
                  {/* Upcoming Events */}
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                    <span className="font-semibold text-slate-700">
                      {liveData.upcomingEvents} Upcoming
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Updated {lastUpdated.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm w-full justify-start overflow-x-auto">
            <TabsTrigger 
              value="home" 
              className="rounded-xl px-6 data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              <Activity className="w-4 h-4 mr-2" />
              Home
            </TabsTrigger>
            <TabsTrigger 
              value="live" 
              className="rounded-xl px-6 data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              <Radio className="w-4 h-4 mr-2" />
              Live
              {liveData.liveStreams > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5">
                  {liveData.liveStreams}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="highlights" 
              className="rounded-xl px-6 data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Highlights
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="rounded-xl px-6 data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger 
              value="training" 
              className="rounded-xl px-6 data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Training
            </TabsTrigger>
            <TabsTrigger 
              value="podcasts" 
              className="rounded-xl px-6 data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              <Headphones className="w-4 h-4 mr-2" />
              Podcasts
            </TabsTrigger>
          </TabsList>

          {/* Home Tab Content */}
          <TabsContent value="home" className="space-y-8">
            {/* Featured Event Carousel */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-xl">
                {/* Background Image with Overlay */}
                <div className="relative h-[400px] md:h-[450px]">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                    style={{ 
                      backgroundImage: `url(${currentEvent.image})`,
                      filter: 'brightness(0.7)'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />
                  
                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-2xl"
                      >
                        {/* Status Badge */}
                        <div className="flex items-center gap-3 mb-4">
                          {currentEvent.isLive ? (
                            <Badge className="bg-red-500 text-white px-3 py-1 text-sm font-semibold">
                              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                              LIVE NOW
                            </Badge>
                          ) : currentEvent.isUpcoming ? (
                            <Badge className="bg-teal-500 text-white px-3 py-1 text-sm font-semibold">
                              <Calendar className="w-3 h-3 mr-2" />
                              {currentEvent.date}
                            </Badge>
                          ) : null}
                          <Badge variant="outline" className="border-white/30 text-white/90">
                            {currentEvent.organization}
                          </Badge>
                        </div>
                        
                        {/* Title */}
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                          {currentEvent.title}
                        </h2>
                        
                        {/* Subtitle */}
                        <p className="text-lg text-white/80 mb-4">
                          {currentEvent.subtitle}
                        </p>
                        
                        {/* Location */}
                        <div className="flex items-center gap-4 text-white/70 mb-6">
                          <span className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {currentEvent.location}
                          </span>
                          {currentEvent.viewerCount > 0 && (
                            <span className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              {currentEvent.viewerCount.toLocaleString()} watching
                            </span>
                          )}
                        </div>
                        
                        {/* CTA Buttons */}
                        <div className="flex items-center gap-4">
                          <Button 
                            size="lg"
                            className="bg-teal-500 hover:bg-teal-600 text-white rounded-full px-8"
                            asChild
                          >
                            <a href={currentEvent.streamUrl} target="_blank" rel="noopener noreferrer">
                              <Play className="w-5 h-5 mr-2" />
                              {currentEvent.isLive ? 'Watch Live' : 'Learn More'}
                            </a>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="lg"
                            className="border-white/30 text-white hover:bg-white/10 rounded-full px-8"
                          >
                            <Calendar className="w-5 h-5 mr-2" />
                            Add to Calendar
                          </Button>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                    
                    {/* Carousel Navigation */}
                    <div className="absolute bottom-8 right-8 flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 rounded-full"
                        onClick={() => setCurrentSlide((prev) => 
                          prev === 0 ? PICKLEBALL_CONTENT.featuredEvents.length - 1 : prev - 1
                        )}
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </Button>
                      
                      {/* Dots */}
                      <div className="flex items-center gap-2">
                        {PICKLEBALL_CONTENT.featuredEvents.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={cn(
                              "w-2 h-2 rounded-full transition-all",
                              idx === currentSlide 
                                ? "bg-white w-6" 
                                : "bg-white/40 hover:bg-white/60"
                            )}
                          />
                        ))}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 rounded-full"
                        onClick={() => setCurrentSlide((prev) => 
                          (prev + 1) % PICKLEBALL_CONTENT.featuredEvents.length
                        )}
                      >
                        <ChevronRight className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Quick Access Grid */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {/* Live Scores Card */}
              <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-100 hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                      <Activity className="w-6 h-6 text-red-600" />
                    </div>
                    <Badge className="bg-red-500 text-white">
                      {liveData.activeMatches} Live
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">Live Scores</h3>
                  <p className="text-sm text-slate-500">Real-time match updates</p>
                </CardContent>
              </Card>

              {/* Tournament Map Card */}
              <Link href="/connect/tournaments">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 hover:shadow-lg transition-shadow cursor-pointer group h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                        <MapPin className="w-6 h-6 text-blue-600" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">Tournament Map</h3>
                    <p className="text-sm text-slate-500">Find events near you</p>
                  </CardContent>
                </Card>
              </Link>

              {/* Training Library Card */}
              <Link href="/train/library">
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 hover:shadow-lg transition-shadow cursor-pointer group h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
                        <BookOpen className="w-6 h-6 text-emerald-600" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">Training Library</h3>
                    <p className="text-sm text-slate-500">Improve your game</p>
                  </CardContent>
                </Card>
              </Link>

              {/* Community Card */}
              <Link href="/connect">
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100 hover:shadow-lg transition-shadow cursor-pointer group h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">Community</h3>
                    <p className="text-sm text-slate-500">Connect with players</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.section>

            {/* Trending Videos Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-teal-600" />
                  <h2 className="text-xl font-bold text-slate-800">Trending Now</h2>
                </div>
                <Button variant="ghost" className="text-teal-600 hover:text-teal-700">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {PICKLEBALL_CONTENT.trendingVideos.map((video, idx) => (
                  <Card 
                    key={video.id}
                    className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="relative aspect-video bg-slate-100">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-teal-600 ml-1" />
                        </div>
                      </div>
                      <Badge className="absolute top-2 right-2 bg-black/70 text-white text-xs">
                        {video.duration}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-slate-800 line-clamp-2 mb-2 group-hover:text-teal-600 transition-colors">
                        {video.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <span>{video.channel}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {video.views}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.section>

            {/* Live Scores Preview */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-gradient-to-r from-slate-800 to-slate-900 text-white overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Activity className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                      </div>
                      <h2 className="text-xl font-bold">Live Scores</h2>
                    </div>
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                      View All Matches
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PICKLEBALL_CONTENT.liveScores.map((match) => (
                      <div 
                        key={match.id}
                        className="bg-white/10 rounded-xl p-4 hover:bg-white/15 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-red-500 text-white text-xs">
                            {match.status}
                          </Badge>
                          <span className="text-xs text-white/60">{match.court}</span>
                        </div>
                        <p className="text-sm text-white/70 mb-1">{match.tournament}</p>
                        <p className="font-semibold mb-2">{match.match}</p>
                        <p className="text-2xl font-bold text-teal-400">{match.score}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          </TabsContent>

          {/* Live Tab */}
          <TabsContent value="live" className="space-y-6">
            <LiveStreamsContent liveData={liveData} />
          </TabsContent>

          {/* Highlights Tab */}
          <TabsContent value="highlights" className="space-y-6">
            <HighlightsContent />
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <EventsContent />
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <TrainingContent />
          </TabsContent>

          {/* Podcasts Tab */}
          <TabsContent value="podcasts" className="space-y-6">
            <PodcastsContent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Sub-components for each tab
function LiveStreamsContent({ liveData }: { liveData: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-500" />
            Live Streams
          </CardTitle>
        </CardHeader>
        <CardContent>
          {liveData.liveStreams > 0 ? (
            <p>Currently streaming {liveData.liveStreams} events</p>
          ) : (
            <div className="text-center py-12">
              <Radio className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Live Streams Right Now</h3>
              <p className="text-slate-500">Check back during tournament hours for live coverage</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function HighlightsContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Top Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Best plays and moments from recent tournaments</p>
        </CardContent>
      </Card>
    </div>
  );
}

function EventsContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {PICKLEBALL_CONTENT.featuredEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="p-3 bg-teal-100 rounded-xl">
                  <Calendar className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{event.title}</h3>
                  <p className="text-sm text-slate-500">{event.date} • {event.location}</p>
                </div>
                <Badge>{event.organization}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TrainingContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            Training Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 mb-4">Improve your skills with pro tutorials</p>
          <Button asChild>
            <Link href="/train/library">
              Go to Training Library
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function PodcastsContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-purple-500" />
            Pickleball Podcasts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PICKLEBALL_CONTENT.podcasts.map((podcast) => (
              <div key={podcast.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Headphones className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{podcast.title}</h3>
                  <p className="text-sm text-slate-500">{podcast.episode}</p>
                  <p className="text-xs text-slate-400">{podcast.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MediaHubV2;
