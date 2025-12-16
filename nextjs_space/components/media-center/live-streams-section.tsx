
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  Play, 
  Clock, 
  Users, 
  ExternalLink,
  Crown,
  Zap,
  Calendar,
  Globe,
  Youtube,
  Tv,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import { mediaDesignTokens, getCardClasses, getBadgeClasses } from '@/lib/media-design-system';
import { YouTubeEmbed } from '@/components/media/youtube-embed';

interface LiveStream {
  id: string;
  title: string;
  description?: string;
  platform: 'YOUTUBE' | 'PICKLEBALLTV' | 'TWITCH' | 'FACEBOOK' | 'CUSTOM';
  streamUrl: string;
  thumbnailUrl?: string;
  embedCode?: string;
  status: 'UPCOMING' | 'LIVE' | 'ENDED';
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  viewerCount?: number;
  isSubscriberOnly: boolean;
  eventType?: string;
}

interface StreamHealth {
  streamId: string;
  status: 'live' | 'offline' | 'checking' | 'error';
  lastChecked: Date;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  errorMessage?: string;
}

interface StreamingPlatform {
  name: string;
  url: string;
  subscriptionRequired: boolean;
  price: string;
}

interface LiveStreamsSectionProps {
  tierAccess?: {
    canAccessLiveStreams: boolean;
    showUpgradePrompts: boolean;
  };
}

export function LiveStreamsSection({ tierAccess }: LiveStreamsSectionProps) {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [schedule, setSchedule] = useState<LiveStream[]>([]);
  const [platforms, setPlatforms] = useState<StreamingPlatform[]>([]);
  const [streamHealth, setStreamHealth] = useState<Map<string, StreamHealth>>(new Map());
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('live');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLiveStreams();
    
    // Auto-refresh every 2 minutes for live streams
    const interval = setInterval(() => {
      if (activeTab === 'live') {
        fetchLiveStreams();
        fetchStreamHealth();
      }
    }, 120000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch stream health after streams are loaded
  useEffect(() => {
    if (streams.length > 0) {
      fetchStreamHealth();
    }
  }, [streams]);

  useEffect(() => {
    if (activeTab === 'schedule') {
      fetchSchedule();
    }
  }, [activeTab]);

  const fetchLiveStreams = async () => {
    try {
      const response = await fetch('/api/media-center/live-streams');
      const data = await response.json();
      
      if (data.success) {
        setStreams(data.streams || []);
        setPlatforms(data.streamingPlatforms || []);
        setError(null);
      } else if (data.upgradeRequired) {
        setError('Live streams require a premium subscription');
        setPlatforms(data.streamingPlatforms || []);
      } else {
        setError(data.message || 'Failed to load streams');
      }
    } catch (error) {
      console.error('Error fetching live streams:', error);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await fetch('/api/media-center/live-streams?action=schedule&days=7');
      const data = await response.json();
      
      if (data.success) {
        setSchedule(data.streams || []);
      }
    } catch (error) {
      console.error('Error fetching stream schedule:', error);
    }
  };

  const fetchStreamHealth = async () => {
    if (streams.length === 0) return;
    
    setHealthLoading(true);
    try {
      const streamIds = streams.map(s => s.id).join(',');
      const response = await fetch(`/api/media-center/feed-status?streamIds=${streamIds}`);
      const data = await response.json();
      
      if (data.success) {
        const healthMap = new Map<string, StreamHealth>();
        data.streams.forEach((stream: any) => {
          healthMap.set(stream.streamId, {
            streamId: stream.streamId,
            status: stream.status,
            lastChecked: new Date(stream.lastChecked),
            connectionQuality: stream.connectionQuality,
            errorMessage: stream.errorMessage
          });
        });
        setStreamHealth(healthMap);
      }
    } catch (error) {
      console.error('Error fetching stream health:', error);
    } finally {
      setHealthLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'YOUTUBE': return <Youtube className="w-4 h-4" />;
      case 'PICKLEBALLTV': return <Tv className="w-4 h-4" />;
      default: return <Video className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'YOUTUBE': return 'bg-red-500';
      case 'PICKLEBALLTV': return 'bg-blue-500';
      case 'TWITCH': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LIVE':
        return (
          <Badge className="bg-red-500 text-white animate-pulse">
            <Zap className="w-3 h-3 mr-1" />
            LIVE
          </Badge>
        );
      case 'UPCOMING':
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Upcoming
          </Badge>
        );
      case 'ENDED':
        return (
          <Badge variant="secondary">
            Ended
          </Badge>
        );
      default:
        return null;
    }
  };

  const getHealthIndicator = (health?: StreamHealth) => {
    // Don't show health indicator if no health data or if checking
    if (!health || health.status === 'checking') {
      return null;
    }

    // Only show indicator for actual errors with error messages
    if (health.status === 'error' && health.errorMessage) {
      return (
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-red-500">{health.errorMessage}</span>
        </div>
      );
    }

    // For live streams, show active indicator
    if (health.status === 'live') {
      return (
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-600">Feed Active</span>
        </div>
      );
    }

    // Don't show anything for offline status - it's normal for ended/upcoming streams
    return null;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openStream = (streamUrl: string) => {
    window.open(streamUrl, '_blank', 'noopener,noreferrer');
  };

  // Removed paywall - all tournament videos are free YouTube content!

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          Live Streams
          {streams.filter(s => s.status === 'LIVE').length > 0 && (
            <Badge className="bg-red-500 text-white animate-pulse ml-2">
              {streams.filter(s => s.status === 'LIVE').length} LIVE
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="live">Live Now</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-32 h-20 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchLiveStreams} disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {streams.map((stream) => (
                    <motion.div
                      key={stream.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {stream.thumbnailUrl ? (
                          <Image
                            src={stream.thumbnailUrl}
                            alt={stream.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        
                        {stream.status === 'LIVE' && (
                          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                            <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                              LIVE
                            </div>
                          </div>
                        )}

                        <div className="absolute top-2 left-2">
                          <Badge className={`${getPlatformColor(stream.platform)} text-white text-xs`}>
                            {getPlatformIcon(stream.platform)}
                            <span className="ml-1">{stream.platform}</span>
                          </Badge>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium line-clamp-2 text-sm">
                            {stream.title}
                          </h4>
                          {getStatusBadge(stream.status)}
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {stream.description}
                        </p>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDateTime(stream.scheduledAt)}
                              </div>
                              {stream.viewerCount && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {stream.viewerCount.toLocaleString()} viewers
                                </div>
                              )}
                              {stream.isSubscriberOnly && (
                                <Badge variant="outline" className="text-xs">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Premium
                                </Badge>
                              )}
                            </div>
                            
                            <Button
                              size="sm"
                              onClick={() => openStream(stream.streamUrl)}
                              className="flex items-center gap-1"
                            >
                              <Play className="w-3 h-3" />
                              Watch
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          {/* Stream Health Indicator */}
                          {getHealthIndicator(streamHealth.get(stream.id))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {streams.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No live streams right now</p>
                    <p className="text-sm">Check back later or view the schedule</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div className="space-y-3">
              {schedule.map((stream) => (
                <div
                  key={stream.id}
                  className="flex items-center gap-4 p-3 border rounded-lg"
                >
                  <div className="text-center min-w-[60px]">
                    <div className="text-sm font-medium">
                      {new Date(stream.scheduledAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(stream.scheduledAt).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{stream.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${getPlatformColor(stream.platform)} text-white text-xs`}>
                        {getPlatformIcon(stream.platform)}
                        <span className="ml-1">{stream.platform}</span>
                      </Badge>
                      {stream.isSubscriberOnly && (
                        <Badge variant="outline" className="text-xs">
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openStream(stream.streamUrl)}
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    Remind Me
                  </Button>
                </div>
              ))}

              {schedule.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No scheduled streams</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="platforms" className="space-y-4">
            <div className="grid gap-4">
              {platforms.map((platform) => (
                <div
                  key={platform.name}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{platform.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {platform.subscriptionRequired ? (
                        <span className="flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          {platform.price}
                        </span>
                      ) : (
                        'Free with ads'
                      )}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => openStream(platform.url)}
                  >
                    Visit
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              ))}

              {platforms.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No streaming platforms available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
