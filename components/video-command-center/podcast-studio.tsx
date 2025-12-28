'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Podcast, Play, Pause, Heart, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface PodcastShow {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  totalEpisodes: number;
  episodes: PodcastEpisode[];
}

interface PodcastEpisode {
  id: string;
  title: string;
  description?: string;
  audioUrl: string;
  duration?: number;
  publishDate: string;
  imageUrl?: string;
  show: PodcastShow;
}

export default function PodcastStudio() {
  const [shows, setShows] = useState<PodcastShow[]>([]);
  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShows();
  }, []);

  useEffect(() => {
    if (selectedShow) {
      fetchEpisodes(selectedShow);
    }
  }, [selectedShow]);

  const fetchShows = async () => {
    try {
      const response = await fetch('/api/podcasts/shows');
      const data = await response.json();
      setShows(data.shows || []);
      if (data.shows && data.shows.length > 0) {
        setSelectedShow(data.shows[0].id);
      }
    } catch (error) {
      console.error('Error fetching podcast shows:', error);
      toast.error('Failed to load podcasts');
    } finally {
      setLoading(false);
    }
  };

  const fetchEpisodes = async (showId: string) => {
    try {
      const response = await fetch(`/api/podcasts/episodes?showId=${showId}`);
      const data = await response.json();
      setEpisodes(data.episodes || []);
    } catch (error) {
      console.error('Error fetching episodes:', error);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Podcast className="h-8 w-8" />
            Pickleball Podcast Studio
          </CardTitle>
          <p className="text-purple-100">
            Top pickleball podcasts featuring pros, strategies, and mental game insights
          </p>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading podcasts...</p>
        </div>
      ) : shows.length === 0 ? (
        <Card className="p-12 text-center">
          <Podcast className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Podcasts Available Yet</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            We're curating the best pickleball podcasts for you!
          </p>
          <Button>Check Back Soon</Button>
        </Card>
      ) : (
        <>
          {/* Show Selector */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {shows.map((show) => (
              <Button
                key={show.id}
                variant={selectedShow === show.id ? 'default' : 'outline'}
                onClick={() => setSelectedShow(show.id)}
                className="whitespace-nowrap"
              >
                {show.title} ({show.totalEpisodes})
              </Button>
            ))}
          </div>

          {/* Episodes List */}
          <div className="space-y-4">
            {episodes.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-slate-600 dark:text-slate-400">No episodes available yet</p>
              </Card>
            ) : (
              episodes.map((episode) => (
                <Card key={episode.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Artwork */}
                      <div className="flex-shrink-0 w-24 h-24 relative bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden">
                        {episode.imageUrl ? (
                          <Image
                            src={episode.imageUrl}
                            alt={episode.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Podcast className="h-8 w-8 text-slate-400" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-lg mb-2 line-clamp-2">
                          {episode.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                          {episode.description || 'No description available'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <Badge variant="secondary">
                            {formatDuration(episode.duration)}
                          </Badge>
                          <span>{new Date(episode.publishDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <a
                          href={episode.audioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button className="gap-2">
                            <Play className="h-4 w-4" />
                            Listen
                          </Button>
                        </a>
                        <Button variant="outline" size="icon">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {/* External Links */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Listen on Your Favorite Platform
          </h4>
          <div className="flex flex-wrap gap-3">
            {['Spotify', 'Apple Podcasts', 'Google Podcasts'].map((platform) => (
              <Button key={platform} variant="outline" size="sm">
                {platform}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
