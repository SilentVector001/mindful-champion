'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Radio,
  Play,
  Eye,
  MapPin,
  Trophy,
  Calendar,
  ExternalLink,
  RefreshCw,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface LiveStream {
  id: string;
  title: string;
  tournament: string;
  court: string;
  match: string;
  score: string;
  status: string;
  viewers: number;
  thumbnail: string;
  streamUrl: string;
  isLive: boolean;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organization: string;
}

export function LiveCoverageDashboard() {
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLiveData = async () => {
    try {
      setIsLoading(true);
      // Fetch live streams
      const streamsRes = await fetch('/api/media/live');
      if (streamsRes?.ok) {
        const data = await streamsRes.json();
        setLiveStreams(data?.streams || []);
      }
    } catch (error) {
      console.error('Error fetching live data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Mock data for now
  const mockLiveStreams: LiveStream[] = [
    {
      id: 'live-1',
      title: 'PPA Tour Championship - Championship Court',
      tournament: 'PPA Tour Championship Finals',
      court: 'Championship Court',
      match: 'Ben Johns vs Tyson McGuffin',
      score: '11-9, 8-11, 7-5',
      status: 'Game 3 - Live',
      viewers: 12453,
      thumbnail: 'https://ppatour.com/wp-content/uploads/2023/12/TX-Open-DJI-Watermarked-scaled-1.webp',
      streamUrl: 'https://www.ppatour.com/watch',
      isLive: true
    },
    {
      id: 'live-2',
      title: 'MLP Miami - Center Court',
      tournament: 'Major League Pickleball Miami Slam',
      court: 'Center Court',
      match: 'Anna Leigh Waters vs Catherine Parenteau',
      score: '11-7, 9-11, 5-3',
      status: 'Game 3 - Live',
      viewers: 8721,
      thumbnail: 'https://ppatour.com/wp-content/uploads/2024/07/PPA-Grows-Internationally.webp',
      streamUrl: 'https://www.majorleaguepickleball.net',
      isLive: true
    }
  ];

  const mockUpcomingEvents: UpcomingEvent[] = [
    {
      id: 'up-1',
      title: 'APP Fort Lauderdale Open',
      date: 'Dec 18, 2025',
      time: '10:00 AM EST',
      location: 'Fort Lauderdale, FL',
      organization: 'APP Tour'
    },
    {
      id: 'up-2',
      title: 'US Open Pickleball Championships',
      date: 'Jan 15, 2026',
      time: '9:00 AM EST',
      location: 'Naples, FL',
      organization: 'USA Pickleball'
    }
  ];

  const displayStreams = liveStreams?.length > 0 ? liveStreams : mockLiveStreams;
  const displayEvents = upcomingEvents?.length > 0 ? upcomingEvents : mockUpcomingEvents;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl shadow-lg">
                <Radio className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Live Coverage</h1>
                <p className="text-slate-500">Watch professional pickleball in real-time</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-red-500 text-white px-4 py-2">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse inline-block"></span>
                {displayStreams?.length || 0} LIVE
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLiveData}
                className="rounded-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Live Streams */}
        {displayStreams?.length > 0 ? (
          <div className="space-y-6 mb-12">
            <h2 className="text-xl font-bold text-slate-800">Live Now</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {displayStreams.map((stream, idx) => (
                <motion.div
                  key={stream?.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group"
                >
                  <Card className="overflow-hidden border-2 border-red-500/20 hover:border-red-500 transition-all shadow-lg hover:shadow-2xl hover:shadow-red-500/20">
                    <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse"></div>
                    <div className="relative aspect-video bg-slate-900">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${stream?.thumbnail})`,
                          filter: 'brightness(0.7)'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 shadow-lg">
                        <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse inline-block"></span>
                        LIVE
                      </Badge>
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        {stream?.viewers?.toLocaleString() || 0}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                          <Play className="w-10 h-10 text-red-600 ml-1" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-4 h-4 text-teal-600" />
                        <span className="text-sm font-medium text-teal-600">{stream?.tournament}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-teal-600 transition-colors">
                        {stream?.title}
                      </h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 font-medium">{stream?.match}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-slate-800">{stream?.score}</span>
                          <Badge className="bg-emerald-500 text-white">{stream?.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <MapPin className="w-4 h-4" />
                          {stream?.court}
                        </div>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = stream?.streamUrl || '#';
                          link.target = '_blank';
                          link.rel = 'noopener noreferrer';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Watch Live Stream
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <Card className="bg-gradient-to-br from-slate-50 to-white mb-12">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Radio className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No Live Streams Right Now</h3>
              <p className="text-slate-500 mb-6">Check back during tournament hours for live coverage</p>
              <Button variant="outline" className="rounded-full" asChild>
                <Link href="/connect/tournaments">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Tournament Schedule
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Live Events */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Upcoming Live Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayEvents?.map((event, idx) => (
              <motion.div
                key={event?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Badge className="bg-teal-500 text-white mb-3">{event?.organization}</Badge>
                    <h3 className="text-lg font-bold text-slate-800 mb-3">{event?.title}</h3>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {event?.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {event?.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {event?.location}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
