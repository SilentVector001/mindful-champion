
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Play, 
  Clock, 
  User,
  Tag,
  Search,
  Filter,
  ExternalLink,
  Crown,
  Youtube,
  BookmarkPlus,
  Star,
  TrendingUp,
  Loader2
} from 'lucide-react';
import Image from 'next/image';

interface TrainingVideo {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  duration: number;
  instructor: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  category: string;
  tags: string[];
  channel?: string;
  rating?: number;
  viewCount?: number;
}

interface TrainingLibrarySectionProps {
  tierAccess?: {
    canAccessAdvancedFeatures: boolean;
    canBookmarkContent: boolean;
    showUpgradePrompts: boolean;
  };
}

export function TrainingLibrarySection({ tierAccess }: TrainingLibrarySectionProps) {
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<TrainingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [skillLevelFilter, setSkillLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [bookmarkingStates, setBookmarkingStates] = useState<Record<string, boolean>>({});

  const categories = [
    'serving',
    'return-of-serve',
    'third-shot-drop',
    'dinking',
    'volleys',
    'overheads',
    'footwork',
    'positioning',
    'strategy',
    'mental-game',
    'rules',
    'drills'
  ];

  const skillLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner (2.0-2.5)' },
    { value: 'intermediate', label: 'Intermediate (3.0-3.5)' },
    { value: 'advanced', label: 'Advanced (4.0-4.5)' },
    { value: 'pro', label: 'Pro (5.0+)' }
  ];

  useEffect(() => {
    fetchTrainingContent();
  }, [activeTab]);

  useEffect(() => {
    filterVideos();
  }, [videos, searchQuery, skillLevelFilter, categoryFilter]);

  const fetchTrainingContent = async () => {
    try {
      setLoading(true);
      
      let source = 'database';
      if (activeTab === 'youtube') source = 'youtube';
      if (activeTab === 'api') source = 'api';

      const params = new URLSearchParams({ source });
      if (skillLevelFilter !== 'all') params.append('skillLevel', skillLevelFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      const response = await fetch(`/api/media-center/training-library?${params}`);
      
      if (!response.ok) {
        console.error('Training library API error:', response.status);
        setVideos(getSampleTrainingVideos());
        return;
      }
      
      const data = await response.json();
      
      if (data && data.success && Array.isArray(data.videos)) {
        setVideos(data.videos);
      } else {
        // Fallback to sample data
        setVideos(getSampleTrainingVideos());
      }
    } catch (error) {
      console.error('Error fetching training content:', error);
      setVideos(getSampleTrainingVideos());
    } finally {
      setLoading(false);
    }
  };

  const filterVideos = () => {
    let filtered = [...videos];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(query) ||
        video.description?.toLowerCase().includes(query) ||
        video.instructor.toLowerCase().includes(query) ||
        video.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Skill level filter
    if (skillLevelFilter !== 'all') {
      filtered = filtered.filter(video => video.skillLevel === skillLevelFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(video => video.category === categoryFilter);
    }

    setFilteredVideos(filtered);
  };

  const getSampleTrainingVideos = (): TrainingVideo[] => [
    {
      id: 'sample_1',
      title: 'Mastering the Third Shot Drop',
      description: 'Learn the most important shot in pickleball with step-by-step instruction and practice drills',
      url: 'https://youtube.com/watch?v=sample1',
      thumbnailUrl: 'https://i.ytimg.com/vi/tcNUc7tNC9g/mqdefault.jpg',
      duration: 720,
      instructor: 'Simone Jardim',
      skillLevel: 'intermediate',
      category: 'third-shot-drop',
      tags: ['fundamentals', 'technique', 'strategy'],
      channel: 'Enhance Pickleball',
      rating: 4.8,
      viewCount: 125000
    },
    {
      id: 'sample_2',
      title: 'Advanced Dinking Patterns',
      description: 'Take your net game to the next level with these advanced dinking strategies',
      url: 'https://youtube.com/watch?v=sample2',
      thumbnailUrl: 'https://i.ytimg.com/vi/2xta-_iMrGY/maxresdefault.jpg',
      duration: 900,
      instructor: 'Ben Johns',
      skillLevel: 'advanced',
      category: 'dinking',
      tags: ['net play', 'advanced', 'positioning'],
      channel: 'PPA Tour',
      rating: 4.9,
      viewCount: 89000
    }
  ];

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-blue-500';
      case 'advanced': return 'bg-purple-500';
      case 'pro': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViewCount = (count?: number) => {
    if (!count) return '';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
    return `${count} views`;
  };

  const toggleBookmark = async (videoId: string, video: TrainingVideo) => {
    if (!tierAccess?.canBookmarkContent) return;

    setBookmarkingStates(prev => ({ ...prev, [videoId]: true }));

    try {
      await fetch('/api/media-center/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'TRAINING_DRILL',
          contentId: videoId,
          title: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnailUrl,
          url: video.url
        })
      });
    } catch (error) {
      console.error('Error bookmarking video:', error);
    } finally {
      setBookmarkingStates(prev => ({ ...prev, [videoId]: false }));
    }
  };

  const openVideo = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Training Library
          <Badge variant="outline" className="ml-2">
            {filteredVideos.length} videos
          </Badge>
        </CardTitle>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Videos</TabsTrigger>
            <TabsTrigger value="youtube">YouTube Channels</TabsTrigger>
            <TabsTrigger value="api">Pro Content</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search videos, instructors, techniques..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={skillLevelFilter} onValueChange={setSkillLevelFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {skillLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <Tag className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="w-full h-40 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <TabsContent value={activeTab} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredVideos.map((video) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="group border rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => openVideo(video.url)}
                  >
                    <div className="relative aspect-video bg-gray-100">
                      {video.thumbnailUrl ? (
                        <Image
                          src={video.thumbnailUrl}
                          alt={video.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <div className="bg-white/90 rounded-full p-3 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all">
                          <Play className="w-6 h-6 text-gray-800" />
                        </div>
                      </div>
                      
                      {/* Duration */}
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {formatDuration(video.duration)}
                      </div>
                      
                      {/* Platform indicator */}
                      {video.channel && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <Youtube className="w-3 h-3" />
                          YT
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium line-clamp-2 text-sm group-hover:text-blue-600 transition-colors">
                          {video.title}
                        </h4>
                        
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {tierAccess?.canBookmarkContent && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBookmark(video.id, video);
                              }}
                              disabled={bookmarkingStates[video.id]}
                            >
                              {bookmarkingStates[video.id] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <BookmarkPlus className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={`${getSkillLevelColor(video.skillLevel)} text-white text-xs`}>
                          {video.skillLevel}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {video.category.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <User className="w-3 h-3" />
                        <span>{video.instructor}</span>
                      </div>
                      
                      {video.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {video.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          {video.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span>{video.rating}</span>
                            </div>
                          )}
                          {video.viewCount && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>{formatViewCount(video.viewCount)}</span>
                            </div>
                          )}
                        </div>
                        
                        <ExternalLink className="w-3 h-3" />
                      </div>
                      
                      {/* Tags */}
                      {video.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {video.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                          {video.tags.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{video.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {filteredVideos.length === 0 && !loading && (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No training videos found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setSkillLevelFilter('all');
                    setCategoryFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
            
            {/* Upgrade prompt for limited access */}
            {!tierAccess?.canAccessAdvancedFeatures && tierAccess?.showUpgradePrompts && filteredVideos.length >= 20 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center mt-6"
              >
                <Crown className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <h4 className="font-medium mb-2">Unlock Complete Training Library</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Access thousands more videos, advanced filtering, and offline downloads
                </p>
                <Button className="bg-green-500 hover:bg-green-600">
                  Upgrade for Full Library
                </Button>
              </motion.div>
            )}
          </TabsContent>
        )}
      </CardContent>
    </Card>
  );
}
