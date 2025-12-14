
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Newspaper, Trophy, Star, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface NewsItem {
  id: string;
  title: string;
  description?: string;
  sourceUrl: string;
  imageUrl?: string;
  source: string;
  category: string;
  publishDate: string;
}

export default function LivePickleballFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');

  useEffect(() => {
    fetchNews();
  }, [category]);

  const fetchNews = async () => {
    try {
      const response = await fetch(`/api/news/feed?category=${category}`);
      const data = await response.json();
      setNews(data.news || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Failed to load news feed');
    } finally {
      setLoading(false);
    }
  };

  const categoryIcons: any = {
    TOURNAMENT: Trophy,
    PLAYER_SPOTLIGHT: Star,
    GENERAL: Newspaper,
  };

  const getCategoryIcon = (cat: string) => {
    const Icon = categoryIcons[cat] || Newspaper;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <TrendingUp className="h-8 w-8" />
            Live Pickleball Feed
          </CardTitle>
          <p className="text-red-100">
            Latest tournament highlights, news, and player spotlights
          </p>
        </CardHeader>
      </Card>

      {/* Category Tabs */}
      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ALL">All News</TabsTrigger>
          <TabsTrigger value="TOURNAMENT">Tournaments</TabsTrigger>
          <TabsTrigger value="PLAYER_SPOTLIGHT">Players</TabsTrigger>
          <TabsTrigger value="TECHNIQUE">Technique</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* News Feed */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-32 h-32 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : news.length === 0 ? (
        <Card className="p-12 text-center">
          <Newspaper className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No News Available Yet</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            We're working on bringing you the latest pickleball news!
          </p>
          <Button>Check Back Soon</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Image */}
                  <div className="flex-shrink-0 w-48 h-32 relative bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        {getCategoryIcon(item.category)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">
                            {getCategoryIcon(item.category)}
                            <span className="ml-1">{item.category.replace('_', ' ')}</span>
                          </Badge>
                          <span className="text-sm text-slate-500">{item.source}</span>
                        </div>
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                          {item.description || 'Click to read more...'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">
                        {new Date(item.publishDate).toLocaleDateString()}
                      </span>
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Read More
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
