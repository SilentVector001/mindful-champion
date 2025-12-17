'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
  Trophy,
  Play,
  Eye,
  Video,
  Search,
  Star,
  Filter
} from 'lucide-react';

interface HighlightVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  channel: string;
  type: string;
}

const HIGHLIGHT_VIDEOS: HighlightVideo[] = [
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

export function HighlightsLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const types = ['All', 'Tutorial', 'Match Highlight', 'Championship', 'US Open'];

  const filteredVideos = HIGHLIGHT_VIDEOS?.filter(video => {
    const matchesSearch = video?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase() || '') ||
                         video?.channel?.toLowerCase()?.includes(searchQuery?.toLowerCase() || '');
    const matchesType = selectedType === 'All' || video?.type === selectedType;
    return matchesSearch && matchesType;
  }) || [];

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
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Highlights Library</h1>
                <p className="text-slate-500">Best plays and moments from professional tournaments</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              {HIGHLIGHT_VIDEOS?.length || 0} Videos
            </Badge>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value || '')}
                className="pl-10 h-12 rounded-xl border-slate-200 focus:border-teal-500"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Filter className="w-5 h-5 text-slate-400 flex-shrink-0" />
              {types?.map(type => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className={`rounded-full whitespace-nowrap ${
                    selectedType === type
                      ? 'bg-teal-500 hover:bg-teal-600 text-white'
                      : 'hover:border-teal-500'
                  }`}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos?.map((video, idx) => (
            <motion.div
              key={video?.videoId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group cursor-pointer"
              onClick={() => {
                const url = `https://www.youtube.com/watch?v=${video?.videoId}`;
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
                <div className="relative aspect-video bg-slate-900">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105 duration-300"
                    style={{ backgroundImage: `url(${video?.thumbnail})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Badge className="absolute top-2 right-2 bg-black/80 text-white text-xs">
                    {video?.duration}
                  </Badge>
                  <Badge className="absolute top-2 left-2 bg-teal-500 text-white text-xs">
                    {video?.type}
                  </Badge>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-800 line-clamp-2 mb-2 group-hover:text-teal-600 transition-colors">
                    {video?.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      {video?.channel}
                    </span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {video?.views}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredVideos?.length === 0 && (
          <Card className="bg-gradient-to-br from-slate-50 to-white mt-8">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No videos found</h3>
              <p className="text-slate-500 mb-6">Try adjusting your search or filters</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('All');
                }}
                className="rounded-full"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Upload CTA */}
        <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100 mt-12">
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
    </div>
  );
}
