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
  Award,
  Mic
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
  // Mock live stream data - 2 live tournament streams
  const liveStreams = [
    {
      id: 'live-1',
      title: 'PPA Tour Championship - Championship Court',
      tournament: 'PPA Tour Championship Finals',
      court: 'Championship Court',
      match: 'Ben Johns vs Tyson McGuffin',
      score: '11-9, 8-11, 7-5',
      status: 'Game 3 - Live',
      viewers: 12453,
      thumbnail: 'https://ppatour.com/wp-content/uploads/2023/12/TX-Open-DJI-Watermarked-scaled-1.webp',
      streamUrl: 'https://www.ppatour.com/watch',
      isLive: true
    },
    {
      id: 'live-2',
      title: 'MLP Miami - Court 2',
      tournament: 'Major League Pickleball Miami Slam',
      court: 'Center Court',
      match: 'Anna Leigh Waters vs Catherine Parenteau',
      score: '11-7, 9-11, 5-3',
      status: 'Game 3 - Live',
      viewers: 8721,
      thumbnail: 'https://ppatour.com/wp-content/uploads/2024/07/PPA-Grows-Internationally.webp',
      streamUrl: 'https://www.majorleaguepickleball.net',
      isLive: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-xl">
            <Radio className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Live Streams</h2>
            <p className="text-slate-500">Watch professional matches in real-time</p>
          </div>
        </div>
        <Badge className="bg-red-500 text-white px-4 py-2">
          <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse inline-block"></span>
          {liveStreams.length} LIVE
        </Badge>
      </motion.div>

      {/* Live Stream Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {liveStreams.map((stream, idx) => (
          <motion.div
            key={stream.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group"
          >
            <Card className="overflow-hidden border-2 border-red-500/20 hover:border-red-500 transition-all shadow-lg hover:shadow-2xl hover:shadow-red-500/20">
              {/* Live Indicator Bar */}
              <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse"></div>
              
              {/* Thumbnail */}
              <div className="relative aspect-video bg-slate-900">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ 
                    backgroundImage: `url(${stream.thumbnail})`,
                    filter: 'brightness(0.7)'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                
                {/* Live Badge */}
                <Badge className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 shadow-lg">
                  <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse inline-block"></span>
                  LIVE
                </Badge>
                
                {/* Viewer Count */}
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {stream.viewers.toLocaleString()}
                </div>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-10 h-10 text-red-600 ml-1" />
                  </div>
                </div>
              </div>
              
              <CardContent className="p-5">
                {/* Tournament Name */}
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-medium text-teal-600">{stream.tournament}</span>
                </div>
                
                {/* Stream Title */}
                <h3 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-teal-600 transition-colors">
                  {stream.title}
                </h3>
                
                {/* Match Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">{stream.match}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-slate-800">{stream.score}</span>
                    <Badge className="bg-emerald-500 text-white">
                      {stream.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="w-4 h-4" />
                    {stream.court}
                  </div>
                </div>
                
                {/* Watch Button */}
                <Button 
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = stream.streamUrl;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Live Stream
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* No Live Streams State (shown when liveStreams array is empty) */}
      {liveStreams.length === 0 && (
        <Card className="bg-gradient-to-br from-slate-50 to-white">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Radio className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Live Streams Right Now</h3>
            <p className="text-slate-500 mb-6">Check back during tournament hours for live coverage</p>
            <Button variant="outline" className="rounded-full">
              <Calendar className="w-4 h-4 mr-2" />
              View Upcoming Events
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function HighlightsContent() {
  // Real YouTube pickleball highlight videos
  const highlightVideos = [
    {
      videoId: 'mIzddYkHV6Q',
      title: 'World #1 Ben Johns Teaches SECRET to Pickleball\'s 3rd and 5th Shots!',
      thumbnail: 'https://i.ytimg.com/vi/mIzddYkHV6Q/maxresdefault.jpg',
      duration: '8:45',
      views: '125K',
      channel: 'Josh J Pickleball',
      type: 'Tutorial'
    },
    {
      videoId: 'yCl5bnm1tes',
      title: 'The Masters - Ben Johns vs. Zane Navratil - Round of 16 Match Highlights',
      thumbnail: 'https://i.ytimg.com/vi/yCl5bnm1tes/maxresdefault.jpg',
      duration: '10:30',
      views: '89K',
      channel: 'Pickleball Highlights',
      type: 'Match Highlight'
    },
    {
      videoId: '053RBKEHn0k',
      title: 'Ben Johns 2022 Arizona Grand Slam - Full Championship Sunday Highlights',
      thumbnail: 'https://i.ytimg.com/vi/053RBKEHn0k/maxresdefault.jpg',
      duration: '15:20',
      views: '210K',
      channel: 'Ben Johns',
      type: 'Championship'
    },
    {
      videoId: 'eN2i2Ub0eWw',
      title: 'Johns/Johns v Duong/Klinger at the Lapiplasty Pickleball World Championships',
      thumbnail: 'https://i.ytimg.com/vi/eN2i2Ub0eWw/sddefault.jpg',
      duration: '10:30',
      views: '156K',
      channel: 'PPA Tour',
      type: 'Match Highlight'
    },
    {
      videoId: '7ZMCHKi5m3I',
      title: 'MIXED PRO GOLD 2024 US Open Pickleball Championships',
      thumbnail: 'https://i.ytimg.com/vi/7ZMCHKi5m3I/maxresdefault.jpg',
      duration: '10:30',
      views: '98K',
      channel: 'Pickleball Channel',
      type: 'US Open'
    },
    {
      videoId: 'pthJ1IQPqGE',
      title: 'MEN\'S PRO GOLD 2024 US Open Pickleball Championships',
      thumbnail: 'https://i.ytimg.com/vi/pthJ1IQPqGE/maxresdefault.jpg',
      duration: '10:30',
      views: '134K',
      channel: 'Pickleball Channel',
      type: 'US Open'
    },
    {
      videoId: 'brXy4jmw-Ys',
      title: 'WOMEN\'S PRO SEMI 2024 US Open Pickleball Championships',
      thumbnail: 'https://i.ytimg.com/vi/brXy4jmw-Ys/maxresdefault.jpg',
      duration: '10:30',
      views: '87K',
      channel: 'Pickleball Channel',
      type: 'US Open'
    },
    {
      videoId: 'I1gtR70ZZ9Y',
      title: 'WOMEN\'S PRO GOLD 2024 US Open Pickleball Championships',
      thumbnail: 'https://i.ytimg.com/vi/I1gtR70ZZ9Y/maxresdefault.jpg',
      duration: '10:30',
      views: '112K',
      channel: 'Pickleball Channel',
      type: 'US Open'
    }
  ];

  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Top Highlights</h2>
            <p className="text-slate-500">Best plays and moments from professional tournaments</p>
          </div>
        </div>
        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2">
          <Star className="w-4 h-4 mr-2" />
          {highlightVideos.length} Videos
        </Badge>
      </motion.div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {highlightVideos.map((video, idx) => (
          <motion.div
            key={video.videoId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group cursor-pointer"
            onClick={() => {
              const url = `https://www.youtube.com/watch?v=${video.videoId}`;
              const link = document.createElement('a');
              link.href = url;
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <Card className="overflow-hidden border-slate-200 hover:border-teal-500 hover:shadow-2xl hover:shadow-teal-500/10 transition-all">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-slate-900">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105 duration-300"
                  style={{ 
                    backgroundImage: `url(${video.thumbnail})`
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Duration Badge */}
                <Badge className="absolute top-2 right-2 bg-black/80 text-white text-xs">
                  {video.duration}
                </Badge>
                
                {/* Type Badge */}
                <Badge className="absolute top-2 left-2 bg-teal-500 text-white text-xs">
                  {video.type}
                </Badge>
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                {/* Title */}
                <h3 className="font-semibold text-slate-800 line-clamp-2 mb-2 group-hover:text-teal-600 transition-colors">
                  {video.title}
                </h3>
                
                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    {video.channel}
                  </span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {video.views}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Want to see your highlights here?</h3>
          <p className="text-slate-600 mb-4">Upload your match videos and get featured in our community highlights</p>
          <Button className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-full">
            <Video className="w-4 h-4 mr-2" />
            Upload Your Video
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function EventsContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Upcoming Events</h2>
            <p className="text-slate-500">Major tournaments and competitions</p>
          </div>
        </div>
        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2">
          <Trophy className="w-4 h-4 mr-2" />
          {PICKLEBALL_CONTENT.featuredEvents.length} Events
        </Badge>
      </motion.div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {PICKLEBALL_CONTENT.featuredEvents.map((event, idx) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group"
          >
            <Card className="overflow-hidden border-slate-200 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer">
              {/* Event Image */}
              <div className="relative h-48 bg-slate-900">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105 duration-300"
                  style={{ 
                    backgroundImage: `url(${event.image})`,
                    filter: 'brightness(0.7)'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                
                {/* Organization Badge */}
                <Badge className="absolute top-3 left-3 bg-teal-500 text-white">
                  {event.organization}
                </Badge>
                
                {/* Status Badge */}
                {event.isUpcoming && (
                  <Badge className="absolute top-3 right-3 bg-blue-500 text-white">
                    <Clock className="w-3 h-3 mr-1" />
                    Upcoming
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-5">
                {/* Title */}
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {event.title}
                </h3>
                
                {/* Subtitle */}
                <p className="text-slate-600 mb-4">{event.subtitle}</p>
                
                {/* Event Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span>{event.location}</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = event.streamUrl;
                      link.target = '_blank';
                      link.rel = 'noopener noreferrer';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    <Calendar className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* All Tournaments Link */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">View All Tournaments</h3>
              <p className="text-slate-600">Explore our complete tournament calendar and find events near you</p>
            </div>
            <Button 
              asChild
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-full"
            >
              <Link href="/connect/tournaments">
                <MapPin className="w-4 h-4 mr-2" />
                Tournament Map
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TrainingContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Training Library</h2>
            <p className="text-slate-500">Improve your skills with pro tutorials</p>
          </div>
        </div>
      </motion.div>

      {/* Training Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { 
            title: 'Video Analysis', 
            description: 'AI-powered video analysis', 
            icon: Video, 
            color: 'from-purple-500 to-pink-500',
            link: '/train/video'
          },
          { 
            title: 'Training Programs', 
            description: '7-day structured programs', 
            icon: Target, 
            color: 'from-emerald-500 to-teal-500',
            link: '/train'
          },
          { 
            title: 'Practice Drills', 
            description: 'Skill-building exercises', 
            icon: Activity, 
            color: 'from-blue-500 to-indigo-500',
            link: '/train/drills'
          }
        ].map((category, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <Link href={category.link}>
              <Card className="overflow-hidden border-slate-200 hover:shadow-2xl hover:shadow-teal-500/10 transition-all cursor-pointer group h-full">
                <CardContent className="p-6">
                  <div className={cn(
                    "w-14 h-14 bg-gradient-to-br rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform",
                    category.color
                  )}>
                    <category.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-teal-600 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-slate-600 mb-4">{category.description}</p>
                  <div className="flex items-center text-teal-600 font-semibold group-hover:gap-3 transition-all">
                    <span>Explore</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Coach Kai CTA */}
      <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100 overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-semibold text-teal-600">AI COACHING</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Train with Coach Kai</h3>
              <p className="text-slate-600 mb-4">
                Get personalized coaching powered by AI. Real-time feedback, custom drills, and voice-guided training.
              </p>
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-full"
              >
                <Link href="/train/coach">
                  <Zap className="w-5 h-5 mr-2" />
                  Start AI Coaching
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-3xl shadow-2xl shadow-teal-500/30"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PodcastsContent() {
  // Enhanced podcast data
  const enhancedPodcasts = [
    {
      id: 'p1',
      title: 'The Dink Podcast',
      host: 'Thomas Shields & Zane Navratil',
      episode: 'Episode 245: 2024 Championship Predictions',
      description: 'Deep dive into the upcoming championship season with expert analysis and pro player insights',
      duration: '58 min',
      image: '/podcast-dink.jpg',
      rating: 4.9,
      subscribers: '45K',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'p2',
      title: 'Pickleball Fire',
      host: 'Mark Renneson',
      episode: 'Episode 112: Pro Training Secrets Revealed',
      description: 'Learn the training methods and mental strategies used by professional players',
      duration: '45 min',
      image: '/podcast-fire.jpg',
      rating: 4.7,
      subscribers: '32K',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 'p3',
      title: 'Pickleball Kitchen Podcast',
      host: 'Barrett Kincheloe',
      episode: 'Episode 189: Kitchen Strategy Masterclass',
      description: 'Expert tips on dominating at the net and mastering the non-volley zone',
      duration: '52 min',
      image: '/podcast-kitchen.jpg',
      rating: 4.8,
      subscribers: '38K',
      gradient: 'from-emerald-500 to-teal-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Pickleball Podcasts</h2>
            <p className="text-slate-500">Listen to expert analysis and pro player interviews</p>
          </div>
        </div>
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2">
          <Headphones className="w-4 h-4 mr-2" />
          {enhancedPodcasts.length} Shows
        </Badge>
      </motion.div>

      {/* Podcasts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enhancedPodcasts.map((podcast, idx) => (
          <motion.div
            key={podcast.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group"
          >
            <Card className="overflow-hidden border-slate-200 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/10 transition-all cursor-pointer h-full">
              <CardContent className="p-6">
                {/* Podcast Icon */}
                <div className={cn(
                  "w-20 h-20 bg-gradient-to-br rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform",
                  podcast.gradient
                )}>
                  <Headphones className="w-10 h-10 text-white" />
                </div>
                
                {/* Rating & Subscribers */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-semibold">{podcast.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{podcast.subscribers}</span>
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">
                  {podcast.title}
                </h3>
                
                {/* Host */}
                <p className="text-sm text-slate-600 mb-3 flex items-center gap-1">
                  <Mic className="w-3 h-3" />
                  Hosted by {podcast.host}
                </p>
                
                {/* Latest Episode */}
                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-teal-600 mb-1">LATEST EPISODE</p>
                  <p className="text-sm font-medium text-slate-800 mb-1">{podcast.episode}</p>
                  <p className="text-xs text-slate-500 line-clamp-2">{podcast.description}</p>
                </div>
                
                {/* Duration */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>{podcast.duration}</span>
                </div>
                
                {/* Listen Button */}
                <Button 
                  className={cn(
                    "w-full bg-gradient-to-r text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all",
                    podcast.gradient,
                    "hover:opacity-90"
                  )}
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

      {/* Subscribe CTA */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Never miss an episode</h3>
          <p className="text-slate-600 mb-4">Subscribe to get notified about new podcast episodes</p>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full">
            <Headphones className="w-4 h-4 mr-2" />
            Subscribe to Podcasts
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default MediaHubV2;
