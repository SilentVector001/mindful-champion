
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Mic,
  Star,
  ExternalLink,
  Search,
  Filter,
  Clock,
  Users,
  Crown,
  Play,
  Headphones,
  BookmarkPlus,
  Share2,
  Volume2,
  Calendar
} from 'lucide-react';

interface Podcast {
  id: string;
  name: string;
  description: string;
  hosts: string[];
  platforms: {
    website?: string;
    apple_podcasts?: string;
    spotify?: string;
    youtube?: string;
  };
  episode_frequency: string;
  average_episode_length: string;
  format: string;
  apple_rating?: number;
  target_audience: string[];
  social_media?: {
    instagram?: string;
    instagram_followers?: string;
  };
  focus_areas: string[];
  tier_requirement: string;
  sponsor?: string;
  region?: string;
  content_warning?: string;
}

interface PodcastsResponse {
  success: boolean;
  podcasts: Podcast[];
  totalCount: number;
  userTier: string;
  availableAudiences: string[];
  availableFocusAreas: string[];
}

export function PodcastsPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [filteredPodcasts, setFilteredPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('all');
  const [selectedSort, setSelectedSort] = useState('rating');
  const [userTier, setUserTier] = useState<string>('FREE');
  const [availableAudiences, setAvailableAudiences] = useState<string[]>([]);

  useEffect(() => {
    fetchPodcasts();
  }, [selectedAudience, selectedSort]);

  useEffect(() => {
    filterPodcasts();
  }, [podcasts, searchTerm]);

  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedAudience !== 'all') params.append('audience', selectedAudience);
      params.append('sort', selectedSort);

      const response = await fetch(`/api/media/podcasts?${params}`);
      const data: PodcastsResponse = await response.json();
      
      if (data.success) {
        setPodcasts(data.podcasts);
        setFilteredPodcasts(data.podcasts);
        setUserTier(data.userTier);
        setAvailableAudiences(data.availableAudiences);
      }
    } catch (error) {
      console.error('Error fetching podcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPodcasts = () => {
    if (!searchTerm) {
      setFilteredPodcasts(podcasts);
      return;
    }

    const filtered = podcasts.filter(podcast =>
      podcast.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      podcast.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      podcast.hosts.some(host => host.toLowerCase().includes(searchTerm.toLowerCase())) ||
      podcast.focus_areas.some(area => area.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPodcasts(filtered);
  };

  const handleBookmark = async (podcastId: string) => {
    // Placeholder for bookmark functionality
    console.log('Bookmarking podcast:', podcastId);
  };

  const handleShare = async (podcast: Podcast) => {
    if (navigator.share) {
      await navigator.share({
        title: podcast.name,
        text: podcast.description,
        url: podcast.platforms.website || window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(podcast.platforms.website || window.location.href);
    }
  };

  if (loading) {
    return <PodcastsPageSkeleton />;
  }

  return (
    <div className="relative">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-champion-green to-champion-blue rounded-2xl blur-3xl opacity-20"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
              <Mic className="w-16 h-16 mx-auto mb-4 text-champion-green" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-champion-green to-champion-blue bg-clip-text text-transparent mb-4">
                Pickleball Podcasts
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover the best pickleball podcasts from top players, coaches, and industry experts
              </p>
              
              <div className="flex items-center justify-center gap-4 mt-6">
                <Badge variant="outline" className="text-sm">
                  {filteredPodcasts.length} Podcasts Available
                </Badge>
                {userTier === 'TRIAL' && (
                  <Badge className="text-sm bg-gradient-to-r from-champion-gold/20 to-champion-blue/20 text-champion-blue border-champion-blue/20">
                    <Crown className="w-4 h-4 mr-2" />
                    Full Access
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search podcasts, hosts, or topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Audiences</SelectItem>
                  {availableAudiences.map(audience => (
                    <SelectItem key={audience} value={audience.toLowerCase()}>
                      {audience}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="frequency">Frequency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </motion.div>

        {/* Podcasts Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredPodcasts.map((podcast, index) => (
            <motion.div
              key={podcast.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-lg transition-all border-2 hover:border-champion-green/20 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-champion-green transition-colors">
                        {podcast.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {podcast.hosts.join(' & ')}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      {podcast.apple_rating && (
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-medium">{podcast.apple_rating}</span>
                        </div>
                      )}
                      
                      {podcast.tier_requirement === 'PREMIUM' && userTier === 'FREE' && (
                        <Badge variant="outline" className="text-xs text-champion-gold border-champion-gold">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-3">{podcast.description}</p>
                  
                  {/* Episode Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {podcast.episode_frequency}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {podcast.average_episode_length}
                    </div>
                  </div>
                  
                  {/* Target Audience Tags */}
                  <div className="flex flex-wrap gap-1">
                    {podcast.target_audience.slice(0, 3).map(audience => (
                      <Badge key={audience} variant="secondary" className="text-xs">
                        {audience}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Focus Areas */}
                  <div className="flex flex-wrap gap-1">
                    {podcast.focus_areas.slice(0, 2).map(area => (
                      <Badge key={area} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                    {podcast.focus_areas.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{podcast.focus_areas.length - 2} more
                      </Badge>
                    )}
                  </div>

                  {/* Special Indicators */}
                  <div className="flex items-center gap-2">
                    {podcast.sponsor && (
                      <Badge className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200">
                        Sponsored by {podcast.sponsor}
                      </Badge>
                    )}
                    {podcast.content_warning && (
                      <Badge variant="destructive" className="text-xs">
                        Explicit
                      </Badge>
                    )}
                    {podcast.region && (
                      <Badge variant="outline" className="text-xs">
                        {podcast.region}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Platform Links */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      {podcast.platforms.spotify && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          onClick={() => window.open(podcast.platforms.spotify, '_blank')}
                        >
                          <Volume2 className="w-3 h-3" />
                        </Button>
                      )}
                      
                      {podcast.platforms.apple_podcasts && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          onClick={() => window.open(podcast.platforms.apple_podcasts, '_blank')}
                        >
                          <Headphones className="w-3 h-3" />
                        </Button>
                      )}
                      
                      {podcast.platforms.youtube && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          onClick={() => window.open(podcast.platforms.youtube, '_blank')}
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      )}
                      
                      {podcast.platforms.website && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          onClick={() => window.open(podcast.platforms.website, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleBookmark(podcast.id)}
                      >
                        <BookmarkPlus className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleShare(podcast)}
                      >
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredPodcasts.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Mic className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No podcasts found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search terms or filters</p>
            <Button onClick={() => { setSearchTerm(''); setSelectedAudience('all'); }}>
              Clear Filters
            </Button>
          </motion.div>
        )}

        {/* Upgrade Prompt for Free Users */}
        {userTier === 'FREE' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <Card className="bg-gradient-to-r from-champion-gold/10 to-champion-blue/10 border-champion-gold/20">
              <CardContent className="p-8 text-center">
                <Crown className="w-12 h-12 mx-auto mb-4 text-champion-gold" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Unlock Premium Podcasts</h3>
                <p className="text-gray-600 mb-6">
                  Access exclusive content from pro players, advanced strategy discussions, and industry insights
                </p>
                <Button className="bg-gradient-to-r from-champion-gold to-champion-green hover:shadow-lg">
                  Start Free Trial
                  <Crown className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function PodcastsPageSkeleton() {
  return (
    <div className="relative">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <Skeleton className="h-16 w-16 mx-auto mb-4 rounded-full" />
          <Skeleton className="h-12 w-80 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-48" />
          </div>
        </Card>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-96">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="flex justify-between pt-4">
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                  <div className="flex gap-1">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}