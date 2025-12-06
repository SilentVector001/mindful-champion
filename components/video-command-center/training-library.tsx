'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Star,
  Clock,
  PlayCircle,
  Bookmark,
  Plus,
  ThumbsUp,
  Eye,
  CheckCircle2,
  TrendingUp,
  Award,
  Users,
  Sparkles,
  Video,
  Grid3x3,
  List,
  X,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Video {
  id: string;
  videoId: string;
  title: string;
  url: string;
  channel: string;
  duration: string;
  description: string;
  skillLevel: string;
  primaryTopic: string;
  thumbnailUrl?: string;
  avgRating: number;
  ratingCount: number;
  userVideoProgress?: any[];
  ratings?: any[];
  verified?: boolean;
}

export default function TrainingLibrary() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skillLevel, setSkillLevel] = useState('ALL');
  const [topic, setTopic] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredCount, setFilteredCount] = useState(0);

  useEffect(() => {
    fetchVideos();
  }, [skillLevel, topic, search]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (skillLevel !== 'ALL') params.append('skillLevel', skillLevel);
      if (topic !== 'ALL') params.append('topic', topic);
      if (search) params.append('search', search);

      const response = await fetch(`/api/video-library/videos?${params}`);
      const data = await response.json();
      setVideos(data.videos || []);
      setFilteredCount(data.filtered || 0);
      
      if (data.filtered > 0) {
        console.log(`✅ Filtered out ${data.filtered} non-pickleball video(s)`);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async (videoId: string) => {
    // Open playlist selector dialog
    toast.info('Playlist feature coming soon!');
  };

  const sortedVideos = [...videos].sort((a, b) => {
    if (sortBy === 'rating') return b.avgRating - a.avgRating;
    if (sortBy === 'popular') return b.ratingCount - a.ratingCount;
    return 0; // newest by default
  });

  const topics = [
    'ALL',
    'Serves',
    'Dinking',
    'Third Shot Drop',
    'Volleys',
    'Strategy',
    'Footwork',
    'Drills',
    'Return of Serve',
    'Advanced Techniques',
    'Mental Game',
    'Fitness',
    'Positioning',
    'Rules',
    'Drives',
  ];

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'INTERMEDIATE':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'ADVANCED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-900 dark:via-cyan-900 dark:to-teal-900 text-white py-16 px-6 mb-8 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-6 border-2 border-white/30">
                  <Video className="w-16 h-16" />
                </div>
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl font-bold text-center mb-4"
            >
              🏓 Pickleball Video Library
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-center text-white/90 max-w-3xl mx-auto mb-6"
            >
              Your curated collection of world-class pickleball training from top coaches
            </motion.p>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-8 mt-8"
            >
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <CheckCircle2 className="w-5 h-5 text-green-300" />
                <span className="font-semibold">{sortedVideos.length} Verified Videos</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <Award className="w-5 h-5 text-yellow-300" />
                <span className="font-semibold">100% Pickleball Content</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <TrendingUp className="w-5 h-5 text-cyan-300" />
                <span className="font-semibold">Pro-Level Instruction</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-6 pb-12">
          {/* Filters & Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-xl border-2 dark:bg-slate-900/50 dark:border-slate-700 backdrop-blur-sm mb-8">
              <CardContent className="p-6">
                {/* Search & View Toggle */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                    <Input
                      placeholder="🔍 Search for techniques, coaches, topics..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-12 pr-4 py-6 text-lg border-2 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="lg"
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        "transition-all",
                        viewMode === 'grid' && "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                      )}
                    >
                      <Grid3x3 className="w-5 h-5" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="lg"
                      onClick={() => setViewMode('list')}
                      className={cn(
                        "transition-all",
                        viewMode === 'list' && "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                      )}
                    >
                      <List className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                      Skill Level
                    </label>
                    <Select value={skillLevel} onValueChange={setSkillLevel}>
                      <SelectTrigger className="border-2 dark:border-slate-700 h-12">
                        <SelectValue placeholder="Skill Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Levels</SelectItem>
                        <SelectItem value="BEGINNER">🟢 Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">🔵 Intermediate</SelectItem>
                        <SelectItem value="ADVANCED">🟣 Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                      Topic
                    </label>
                    <Select value={topic} onValueChange={setTopic}>
                      <SelectTrigger className="border-2 dark:border-slate-700 h-12">
                        <SelectValue placeholder="Topic" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {topics.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t === 'ALL' ? '📚 All Topics' : t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                      Sort By
                    </label>
                    <div className="flex gap-2">
                      {[
                        { value: 'newest', label: 'Newest', icon: Clock },
                        { value: 'rating', label: 'Top Rated', icon: Star },
                        { value: 'popular', label: 'Popular', icon: TrendingUp },
                      ].map((sort) => (
                        <Button
                          key={sort.value}
                          variant={sortBy === sort.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSortBy(sort.value)}
                          className={cn(
                            "flex-1 transition-all h-12",
                            sortBy === sort.value && "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                          )}
                        >
                          <sort.icon className="w-4 h-4 mr-2" />
                          {sort.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(skillLevel !== 'ALL' || topic !== 'ALL' || search) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex flex-wrap items-center gap-2 pt-4 border-t dark:border-slate-700"
                  >
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Filters:</span>
                    {skillLevel !== 'ALL' && (
                      <Badge variant="secondary" className="gap-2">
                        {skillLevel}
                        <button onClick={() => setSkillLevel('ALL')} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {topic !== 'ALL' && (
                      <Badge variant="secondary" className="gap-2">
                        {topic}
                        <button onClick={() => setTopic('ALL')} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {search && (
                      <Badge variant="secondary" className="gap-2">
                        Search: "{search}"
                        <button onClick={() => setSearch('')} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSkillLevel('ALL');
                        setTopic('ALL');
                        setSearch('');
                      }}
                      className="ml-auto text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      Clear All
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {sortedVideos.length} Video{sortedVideos.length !== 1 ? 's' : ''}
              </h2>
              {sortedVideos.length > 0 && (
                <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  All Pickleball
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse dark:bg-slate-900/50">
                  <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-t-lg" />
                  <CardContent className="p-6 space-y-3">
                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Video Grid/List */}
          {!loading && sortedVideos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "grid gap-6",
                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              )}
            >
              <AnimatePresence mode="popLayout">
                {sortedVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <Card
                      className={cn(
                        "group hover:shadow-2xl dark:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-2 dark:bg-slate-900/50 dark:border-slate-700 overflow-hidden",
                        viewMode === 'list' && "flex flex-row"
                      )}
                    >
                      {/* Thumbnail */}
                      <div className={cn(
                        "relative bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 overflow-hidden",
                        viewMode === 'grid' ? "aspect-video" : "w-80 aspect-video"
                      )}>
                        {video.thumbnailUrl ? (
                          <Image
                            src={video.thumbnailUrl}
                            alt={video.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <PlayCircle className="w-20 h-20 text-blue-300 dark:text-blue-600" />
                          </div>
                        )}
                        
                        {/* Overlay on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <motion.a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-2xl">
                              <PlayCircle className="w-5 h-5" />
                              Watch Now
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </motion.a>
                        </div>

                        {/* Duration Badge */}
                        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {video.duration}
                        </div>

                        {/* Verified Badge */}
                        {video.verified && (
                          <div className="absolute top-3 left-3 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            VERIFIED
                          </div>
                        )}
                      </div>

                      <CardContent className={cn("p-6", viewMode === 'list' && "flex-1")}>
                        <div className="space-y-4">
                          {/* Title */}
                          <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {video.title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                              {video.description}
                            </p>
                          </div>

                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={cn("font-semibold", getSkillLevelColor(video.skillLevel))}>
                              {video.skillLevel === 'BEGINNER' && '🟢'}
                              {video.skillLevel === 'INTERMEDIATE' && '🔵'}
                              {video.skillLevel === 'ADVANCED' && '🟣'}
                              {' '}{video.skillLevel}
                            </Badge>
                            <Badge variant="outline" className="dark:border-slate-600">
                              📚 {video.primaryTopic}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                              <Users className="w-3 h-3" />
                              {video.channel}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "w-4 h-4",
                                      i < Math.round(video.avgRating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {video.avgRating.toFixed(1)}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                ({video.ratingCount} {video.ratingCount === 1 ? 'rating' : 'ratings'})
                              </span>
                            </div>
                            
                            {video?.userVideoProgress && video.userVideoProgress.length > 0 && (
                              <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
                                <Eye className="w-3 h-3 mr-1" />
                                Watched
                              </Badge>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2 border-t dark:border-slate-700">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddToPlaylist(video.id)}
                              className="flex-1 gap-2 dark:border-slate-600 dark:hover:bg-slate-800"
                            >
                              <Plus className="w-4 h-4" />
                              Playlist
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="dark:hover:bg-slate-800"
                            >
                              <Bookmark className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="dark:hover:bg-slate-800"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                            <Button
                              asChild
                              variant="ghost"
                              size="sm"
                              className="dark:hover:bg-slate-800"
                            >
                              <a href={video.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && sortedVideos.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-16 text-center dark:bg-slate-900/50 dark:border-slate-700">
                <div className="flex flex-col items-center gap-6">
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-500/30 rounded-full blur-2xl"></div>
                    <div className="relative p-8 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                      <Search className="w-16 h-16 text-blue-500 dark:text-blue-400" />
                    </div>
                  </motion.div>
                  
                  <div className="space-y-3">
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">No Videos Found</h3>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md">
                      {search || skillLevel !== 'ALL' || topic !== 'ALL'
                        ? "Try adjusting your filters or search terms to find more videos"
                        : "No videos available at the moment"}
                    </p>
                  </div>

                  {(search || skillLevel !== 'ALL' || topic !== 'ALL') && (
                    <Button
                      size="lg"
                      onClick={() => {
                        setSearch('');
                        setSkillLevel('ALL');
                        setTopic('ALL');
                      }}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
