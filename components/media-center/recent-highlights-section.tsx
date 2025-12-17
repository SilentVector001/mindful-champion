'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Video, 
  Play, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MapPin,
  Trophy,
  Star,
  ExternalLink,
  Filter
} from 'lucide-react';
import Image from 'next/image';

interface Highlight {
  id: string;
  title: string;
  videoUrl: string;
  thumbnail?: string;
  date: string;
  tournament: string;
  location?: string;
  description: string;
  channel: string;
  category: string;
  featured: boolean;
  viewCount: number;
}

interface RecentHighlightsSectionProps {
  limit?: number;
}

export function RecentHighlightsSection({ limit = 12 }: RecentHighlightsSectionProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHighlights();
  }, [selectedCategory, limit]);

  const fetchHighlights = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
      });
      
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/media-center/recent-highlights?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setHighlights(data.highlights || []);
        setCategories(data.categories || []);
        setError(null);
      } else {
        setError(data.message || 'Failed to load highlights');
      }
    } catch (error) {
      console.error('Error fetching highlights:', error);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -400,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 400,
        behavior: 'smooth'
      });
    }
  };

  const openVideo = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Recent Highlights
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="text-sm border rounded-md px-2 py-1"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Carousel Controls */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={scrollLeft}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={scrollRight}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[300px] space-y-2">
                <Skeleton className="w-full h-48 rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : (
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          >
            <AnimatePresence mode="popLayout">
              {highlights.map((highlight) => (
                <motion.div
                  key={highlight.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="min-w-[300px] max-w-[300px] group cursor-pointer"
                  onClick={() => openVideo(highlight.videoUrl)}
                >
                  <div className="relative h-48 rounded-lg overflow-hidden bg-gray-100 mb-3">
                    {highlight.thumbnail ? (
                      <Image
                        src={highlight.thumbnail}
                        alt={highlight.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white rounded-full p-3">
                        <Play className="w-6 h-6 text-black fill-black" />
                      </div>
                    </div>

                    {/* Featured Badge */}
                    {highlight.featured && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-yellow-500 text-white">
                          <Star className="w-3 h-3 mr-1 fill-white" />
                          Featured
                        </Badge>
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        {highlight.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {highlight.title}
                    </h4>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Trophy className="w-3 h-3" />
                        <span className="truncate">{highlight.tournament}</span>
                      </div>
                      
                      {highlight.location && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{highlight.location}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(highlight.date)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {highlight.description}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        {highlight.channel}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          openVideo(highlight.videoUrl);
                        }}
                      >
                        Watch
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {highlights.length === 0 && !loading && (
              <div className="w-full text-center py-8 text-muted-foreground">
                <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No highlights available</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
