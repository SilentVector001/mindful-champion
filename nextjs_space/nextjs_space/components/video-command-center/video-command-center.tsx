
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import {
  Video,
  Podcast,
  TrendingUp,
  BookOpen,
  PlayCircle,
  ListMusic,
  Trophy,
} from 'lucide-react';
import TrainingLibrary from './training-library';
import PodcastStudio from './podcast-studio';
import LivePickleballFeed from './live-pickleball-feed';
import MyMediaLibrary from './my-media-library';
import LiveTournamentScoreboard from './live-tournament-scoreboard';

export default function VideoCommandCenter() {
  const [activeTab, setActiveTab] = useState('training');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-green-500 shadow-lg">
              <PlayCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Pickleball Media Center
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Your complete hub for training videos, podcasts, news, and more
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <Card className="p-2 mb-6 shadow-lg">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2">
              <TabsTrigger
                value="training"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
              >
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">Training Library</span>
                <span className="sm:hidden">Training</span>
              </TabsTrigger>
              <TabsTrigger
                value="podcasts"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <Podcast className="h-4 w-4" />
                <span className="hidden sm:inline">Podcast Studio</span>
                <span className="sm:hidden">Podcasts</span>
              </TabsTrigger>
              <TabsTrigger
                value="live"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Live Feed</span>
                <span className="sm:hidden">Live</span>
              </TabsTrigger>
              <TabsTrigger
                value="tournaments"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
              >
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Live Scores</span>
                <span className="sm:hidden">Scores</span>
              </TabsTrigger>
              <TabsTrigger
                value="library"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">My Library</span>
                <span className="sm:hidden">Library</span>
              </TabsTrigger>
            </TabsList>
          </Card>

          {/* Tab Content */}
          <TabsContent value="training" className="mt-0">
            <TrainingLibrary />
          </TabsContent>

          <TabsContent value="podcasts" className="mt-0">
            <PodcastStudio />
          </TabsContent>

          <TabsContent value="live" className="mt-0">
            <LivePickleballFeed />
          </TabsContent>

          <TabsContent value="tournaments" className="mt-0">
            <LiveTournamentScoreboard />
          </TabsContent>

          <TabsContent value="library" className="mt-0">
            <MyMediaLibrary />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
