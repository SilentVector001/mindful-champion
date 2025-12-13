'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Headphones,
  Play,
  ExternalLink,
  Clock,
  Calendar,
  Mic
} from 'lucide-react';

interface Podcast {
  id: string;
  name: string;
  description: string;
  host: string;
  episodes: Episode[];
  image: string;
  spotifyUrl?: string;
  appleUrl?: string;
  category: string;
}

interface Episode {
  id: string;
  title: string;
  description: string;
  duration: string;
  date: string;
  spotifyUrl: string;
}

const PODCASTS: Podcast[] = [
  {
    id: 'dink',
    name: 'The Dink Podcast',
    description: 'The leading pickleball podcast covering professional tours, player interviews, and industry news.',
    host: 'Thomas Shields',
    image: 'https://ppatour.com/wp-content/uploads/2023/12/TX-Open-DJI-Watermarked-scaled-1.webp',
    spotifyUrl: 'https://open.spotify.com/show/3RjQXRJfXIqsJcU5c1KJ2F',
    appleUrl: 'https://podcasts.apple.com/us/podcast/the-dink-pickleball-podcast',
    category: 'Professional',
    episodes: [
      {
        id: 'e1',
        title: 'PPA Tour Finals Recap & 2026 Predictions',
        description: 'Breaking down the biggest moments from the PPA Tour Championships and what to expect in 2026.',
        duration: '58 min',
        date: 'Dec 12, 2025',
        spotifyUrl: 'https://open.spotify.com/episode/example1'
      },
      {
        id: 'e2',
        title: 'Ben Johns Interview: The Mindset of a Champion',
        description: 'An exclusive conversation with the world\'s #1 ranked player about training, competition, and the future of pickleball.',
        duration: '45 min',
        date: 'Dec 8, 2025',
        spotifyUrl: 'https://open.spotify.com/episode/example2'
      },
      {
        id: 'e3',
        title: 'MLP Expansion & Team Dynamics',
        description: 'Exploring Major League Pickleball\'s growth and the unique challenges of team-based competition.',
        duration: '52 min',
        date: 'Dec 5, 2025',
        spotifyUrl: 'https://open.spotify.com/episode/example3'
      }
    ]
  },
  {
    id: 'fire',
    name: 'Pickleball Fire',
    description: 'High-energy discussions about competitive pickleball, training techniques, and player development.',
    host: 'Multiple Hosts',
    image: 'https://ppatour.com/wp-content/uploads/2024/07/PPA-Grows-Internationally.webp',
    spotifyUrl: 'https://open.spotify.com/show/example',
    appleUrl: 'https://podcasts.apple.com/us/podcast/pickleball-fire',
    category: 'Training',
    episodes: [
      {
        id: 'e4',
        title: 'Advanced Dinking Strategies with Top Pros',
        description: 'Professional players share their secrets to winning dink rallies and controlling the kitchen.',
        duration: '42 min',
        date: 'Dec 10, 2025',
        spotifyUrl: 'https://open.spotify.com/episode/example4'
      },
      {
        id: 'e5',
        title: 'Mental Game: Handling Pressure in Tournaments',
        description: 'Sports psychologists and pro players discuss managing nerves and staying focused under pressure.',
        duration: '48 min',
        date: 'Dec 6, 2025',
        spotifyUrl: 'https://open.spotify.com/episode/example5'
      }
    ]
  },
  {
    id: 'kitchen',
    name: 'In the Kitchen',
    description: 'A community-focused podcast covering recreational pickleball, local tournaments, and grassroots growth.',
    host: 'Sarah Williams',
    image: 'https://images.pickleball.com/news/1724094389936/KC_TYSON%20X%20JAUME_MD-3.jpg',
    spotifyUrl: 'https://open.spotify.com/show/example',
    category: 'Community',
    episodes: [
      {
        id: 'e6',
        title: 'Building Your Local Pickleball Community',
        description: 'Tips and strategies for organizing leagues, clinics, and social events in your area.',
        duration: '35 min',
        date: 'Dec 9, 2025',
        spotifyUrl: 'https://open.spotify.com/episode/example6'
      }
    ]
  }
];

export function PodcastPlayer() {
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(PODCASTS[0]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg">
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Podcasts</h1>
                <p className="text-slate-500">Listen to the best pickleball podcasts</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2">
              <Mic className="w-4 h-4 mr-2" />
              {PODCASTS?.length || 0} Shows
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Podcast List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Popular Shows</h2>
            {PODCASTS?.map((podcast, idx) => (
              <motion.div
                key={podcast?.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    selectedPodcast?.id === podcast?.id
                      ? 'border-2 border-indigo-500 shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedPodcast(podcast)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 bg-slate-200 rounded-lg flex-shrink-0 overflow-hidden">
                        <Headphones className="w-8 h-8 text-slate-400 absolute inset-0 m-auto" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 line-clamp-1">{podcast?.name}</h3>
                        <p className="text-sm text-slate-500">{podcast?.host}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {podcast?.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Selected Podcast Details */}
          <div className="lg:col-span-2">
            {selectedPodcast && (
              <motion.div
                key={selectedPodcast?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Podcast Header */}
                <Card className="overflow-hidden">
                  <div className="relative h-48 bg-gradient-to-br from-indigo-900 to-purple-900">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <Badge className="bg-indigo-500 text-white mb-2">{selectedPodcast?.category}</Badge>
                      <h2 className="text-3xl font-bold text-white mb-2">{selectedPodcast?.name}</h2>
                      <p className="text-white/80 text-sm">Hosted by {selectedPodcast?.host}</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-slate-600 mb-4">{selectedPodcast?.description}</p>
                    <div className="flex gap-3">
                      {selectedPodcast?.spotifyUrl && (
                        <Button
                          className="bg-[#1DB954] hover:bg-[#1ed760] text-white"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = selectedPodcast?.spotifyUrl || '#';
                            link.target = '_blank';
                            link.rel = 'noopener noreferrer';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          Listen on Spotify
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                      {selectedPodcast?.appleUrl && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = selectedPodcast?.appleUrl || '#';
                            link.target = '_blank';
                            link.rel = 'noopener noreferrer';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          Apple Podcasts
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Episodes */}
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Recent Episodes</h3>
                  <div className="space-y-4">
                    {selectedPodcast?.episodes?.map((episode, idx) => (
                      <motion.div
                        key={episode?.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-800 mb-2">{episode?.title}</h4>
                                <p className="text-sm text-slate-600 mb-3">{episode?.description}</p>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {episode?.date}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {episode?.duration}
                                  </span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full flex-shrink-0"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = episode?.spotifyUrl || selectedPodcast?.spotifyUrl || '#';
                                  link.target = '_blank';
                                  link.rel = 'noopener noreferrer';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Listen
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
