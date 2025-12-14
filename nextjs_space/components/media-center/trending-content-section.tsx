'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Play, 
  Eye, 
  Clock, 
  Heart,
  MessageCircle,
  Share2,
  Flame,
  Zap,
  ArrowUpRight,
  ChevronRight,
  Trophy,
  Video,
  Headphones
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface TrendingItem {
  id: string;
  type: 'video' | 'podcast' | 'article' | 'highlight';
  title: string;
  thumbnail: string;
  creator: string;
  creatorAvatar?: string;
  views: number;
  duration?: string;
  publishedAt: string;
  trendingScore: number;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  tags: string[];
  url: string;
}

const TRENDING_CONTENT: TrendingItem[] = [
  {
    id: '1',
    type: 'video',
    title: 'INSANE Rally! Ben Johns vs Tyson McGuffin - 52 Shot Point at PPA Finals',
    thumbnail: 'https://images.unsplash.com/photo-1761644658016-324918bc373c?w=400&h=225&fit=crop',
    creator: 'PPA Tour',
    views: 3250000,
    duration: '5:47',
    publishedAt: '1 day ago',
    trendingScore: 99,
    engagement: { likes: 187000, comments: 12400, shares: 28600 },
    tags: ['Rally', 'Pro Singles', 'PPA Tour'],
    url: 'https://www.youtube.com/@PPATour'
  },
  {
    id: '2',
    type: 'highlight',
    title: 'Anna Leigh Waters INCREDIBLE Around-The-Post Winner - Crowd Goes Wild!',
    thumbnail: 'https://plus.unsplash.com/premium_photo-1709932755918-463c3bd03818?w=400&h=225&fit=crop',
    creator: 'Major League Pickleball',
    views: 2180000,
    duration: '0:58',
    publishedAt: '2 days ago',
    trendingScore: 97,
    engagement: { likes: 142000, comments: 8200, shares: 34000 },
    tags: ['ATP Shot', 'Womens', 'MLP'],
    url: 'https://www.youtube.com/@MajorLeaguePickleball'
  },
  {
    id: '3',
    type: 'video',
    title: 'Why the ERNE Shot Will Change Your Game Forever - Step by Step Guide',
    thumbnail: 'https://plus.unsplash.com/premium_photo-1749494938493-5b6b72b34236?w=400&h=225&fit=crop',
    creator: 'Selkirk TV',
    views: 1560000,
    duration: '14:32',
    publishedAt: '3 days ago',
    trendingScore: 94,
    engagement: { likes: 89000, comments: 4200, shares: 21000 },
    tags: ['Tutorial', 'Erne', 'Advanced'],
    url: 'https://www.youtube.com/@SelkirkTV'
  },
  {
    id: '4',
    type: 'podcast',
    title: 'The Dink Ep. 245 - Ben Johns Reveals His Training Secrets',
    thumbnail: 'https://images.unsplash.com/photo-1642104798671-01a4129f4fdc?w=400&h=225&fit=crop',
    creator: 'The Dink Pickleball',
    views: 425000,
    duration: '1:12:00',
    publishedAt: '4 days ago',
    trendingScore: 91,
    engagement: { likes: 32000, comments: 1800, shares: 8900 },
    tags: ['Podcast', 'Interview', 'Pro Tips'],
    url: 'https://www.youtube.com/@TheDinkPickleball'
  },
  {
    id: '5',
    type: 'highlight',
    title: 'Top 10 Impossible Shots from Vegas Cup 2025 - You Won\'t Believe #1!',
    thumbnail: 'https://plus.unsplash.com/premium_photo-1749494938040-63c4f922ca1b?w=400&h=225&fit=crop',
    creator: 'Pickler',
    views: 1890000,
    duration: '11:45',
    publishedAt: '5 days ago',
    trendingScore: 88,
    engagement: { likes: 78000, comments: 5600, shares: 19000 },
    tags: ['Top 10', 'Best Shots', 'Tournament'],
    url: 'https://www.youtube.com/@Pickler'
  },
  {
    id: '6',
    type: 'video',
    title: 'JOOLA vs Selkirk vs Engage: Ultimate Paddle Comparison 2025',
    thumbnail: 'https://images.unsplash.com/photo-1761644789725-98e84ef4b8c8?w=400&h=225&fit=crop',
    creator: 'Pickleball Kitchen',
    views: 678000,
    duration: '18:22',
    publishedAt: '1 week ago',
    trendingScore: 85,
    engagement: { likes: 45000, comments: 3200, shares: 12000 },
    tags: ['Paddle Review', 'Equipment', 'Comparison'],
    url: 'https://www.youtube.com/@PickleballKitchen'
  }
];

const formatViews = (views: number): string => {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
  return views.toString();
};

export function TrendingContentSection() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [content] = useState<TrendingItem[]>(TRENDING_CONTENT);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'podcast': return Headphones;
      case 'highlight': return Trophy;
      default: return Play;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'from-blue-500 to-cyan-500';
      case 'podcast': return 'from-purple-500 to-pink-500';
      case 'highlight': return 'from-amber-500 to-orange-500';
      default: return 'from-teal-500 to-emerald-500';
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 overflow-hidden">
      <CardHeader className="pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-lg">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Trending Now</h3>
              <p className="text-sm text-slate-500 font-normal">What the community is watching</p>
            </div>
          </CardTitle>
          
          <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
            See All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="space-y-3">
          {content.map((item, index) => {
            const TypeIcon = getTypeIcon(item.type);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className="group cursor-pointer"
                onClick={() => window.open(item.url, '_blank')}
              >
                <div className={cn(
                  "flex gap-4 p-3 rounded-2xl transition-all duration-300",
                  "hover:bg-gradient-to-r hover:from-slate-50 hover:to-white",
                  "border border-transparent hover:border-slate-200 hover:shadow-md"
                )}>
                  {/* Ranking Number */}
                  <div className="flex-shrink-0 w-8 flex items-center justify-center">
                    <span className={cn(
                      "text-2xl font-bold",
                      index < 3 
                        ? "text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-red-500" 
                        : "text-slate-300"
                    )}>
                      {index + 1}
                    </span>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0 w-32 h-20 rounded-xl overflow-hidden">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    
                    {/* Play Overlay */}
                    <div className={cn(
                      "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
                      hoveredItem === item.id ? "opacity-100" : "opacity-0"
                    )}>
                      <div className="absolute inset-0 bg-black/40" />
                      <div className={cn(
                        "relative z-10 w-10 h-10 rounded-full flex items-center justify-center",
                        "bg-gradient-to-br", getTypeColor(item.type)
                      )}>
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    {item.duration && (
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/75 rounded text-[10px] text-white font-medium">
                        {item.duration}
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className={cn(
                      "absolute top-1 left-1 p-1 rounded-md",
                      "bg-gradient-to-br", getTypeColor(item.type)
                    )}>
                      <TypeIcon className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-slate-800 line-clamp-2 group-hover:text-teal-700 transition-colors">
                      {item.title}
                    </h4>
                    
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-slate-500">{item.creator}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatViews(item.views)}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-400">{item.publishedAt}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {item.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-5 bg-slate-100 text-slate-600 hover:bg-slate-200"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Trending Score & Engagement */}
                  <div className="flex-shrink-0 flex flex-col items-end justify-center gap-1">
                    {/* Trending Score */}
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
                      item.trendingScore >= 90 
                        ? "bg-gradient-to-r from-orange-100 to-red-100 text-red-600"
                        : item.trendingScore >= 80
                        ? "bg-amber-100 text-amber-600"
                        : "bg-slate-100 text-slate-600"
                    )}>
                      {item.trendingScore >= 90 && <Zap className="w-3 h-3" />}
                      <TrendingUp className="w-3 h-3" />
                      {item.trendingScore}
                    </div>

                    {/* Engagement */}
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <Heart className="w-3 h-3" />
                        {formatViews(item.engagement.likes)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MessageCircle className="w-3 h-3" />
                        {formatViews(item.engagement.comments)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Action */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <Button 
            variant="outline" 
            className="w-full rounded-xl border-dashed border-slate-300 hover:border-teal-400 hover:bg-teal-50/50 text-slate-600 hover:text-teal-700"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Load More Trending Content
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
