
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Mic, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Clock,
  Users,
  Star,
  Crown,
  Bookmark,
  BookmarkCheck,
  Loader2
} from 'lucide-react';
import Image from 'next/image';

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  publishDate: string;
  imageUrl?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  userProgress?: {
    lastPosition: number;
    completed: boolean;
    isFavorite: boolean;
  };
}

interface PodcastShow {
  id: string;
  title: string;
  description: string;
  author: string;
  imageUrl: string;
  websiteUrl?: string;
  totalEpisodes: number;
  episodes: PodcastEpisode[];
}

interface PodcastStudioSectionProps {
  tierAccess?: {
    canAccessAllPodcasts: boolean;
    maxPodcastEpisodes: number;
    canBookmarkContent: boolean;
    showUpgradePrompts: boolean;
  };
}

export function PodcastStudioSection({ tierAccess }: PodcastStudioSectionProps) {
  const [shows, setShows] = useState<PodcastShow[]>([]);
  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookmarkingStates, setBookmarkingStates] = useState<Record<string, boolean>>({});
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchPodcasts();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEpisodeEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEpisodeEnd);
    };
  }, [currentEpisode]);

  const fetchPodcasts = async () => {
    try {
      const response = await fetch('/api/media-center/podcasts?action=shows');
      const data = await response.json();
      
      if (data.success) {
        setShows(data.shows || []);
        if (data.shows?.length > 0) {
          setSelectedShow(data.shows[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching podcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const playEpisode = (episode: PodcastEpisode) => {
    if (currentEpisode?.id === episode.id) {
      togglePlayPause();
      return;
    }

    setCurrentEpisode(episode);
    setCurrentTime(episode.userProgress?.lastPosition || 0);
    
    const audio = audioRef.current;
    if (audio) {
      audio.src = episode.audioUrl;
      audio.currentTime = episode.userProgress?.lastPosition || 0;
      audio.play();
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (newTime: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = newTime[0];
    audio.currentTime = time;
    setCurrentTime(time);
    
    // Update progress on server
    if (currentEpisode) {
      updateProgress(currentEpisode.id, time);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const vol = newVolume[0];
    audio.volume = vol;
    setVolume(vol);
  };

  const handleEpisodeEnd = () => {
    setIsPlaying(false);
    if (currentEpisode) {
      updateProgress(currentEpisode.id, duration, true);
    }
  };

  const updateProgress = async (episodeId: string, position: number, completed = false) => {
    try {
      await fetch('/api/media-center/podcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episodeId,
          lastPosition: position,
          completed
        })
      });
    } catch (error) {
      console.error('Error updating podcast progress:', error);
    }
  };

  const toggleBookmark = async (episodeId: string) => {
    if (!tierAccess?.canBookmarkContent) {
      return;
    }

    setBookmarkingStates(prev => ({ ...prev, [episodeId]: true }));

    try {
      const episode = shows
        .find(show => show.episodes.some(ep => ep.id === episodeId))
        ?.episodes.find(ep => ep.id === episodeId);

      if (!episode) return;

      const isBookmarked = episode.userProgress?.isFavorite;

      if (isBookmarked) {
        // Remove bookmark
        await fetch(`/api/media-center/bookmarks?episodeId=${episodeId}`, {
          method: 'DELETE'
        });
      } else {
        // Add bookmark
        await fetch('/api/media-center/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            episodeId,
            notes: null
          })
        });
      }

      // Update local state
      setShows(prevShows => 
        prevShows.map(show => ({
          ...show,
          episodes: show.episodes.map(ep => 
            ep.id === episodeId 
              ? {
                  ...ep,
                  userProgress: {
                    ...ep.userProgress,
                    isFavorite: !isBookmarked,
                    lastPosition: ep.userProgress?.lastPosition || 0,
                    completed: ep.userProgress?.completed || false
                  }
                }
              : ep
          )
        }))
      );
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setBookmarkingStates(prev => ({ ...prev, [episodeId]: false }));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!tierAccess?.canAccessAllPodcasts && tierAccess?.showUpgradePrompts) {
    return (
      <Card className="border-2 border-dashed border-purple-300 bg-purple-50/30">
        <CardContent className="p-6 text-center">
          <Crown className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Complete Podcast Library</h3>
          <p className="text-muted-foreground mb-4">
            Access all episodes from top pickleball podcasts
          </p>
          <Button className="bg-purple-500 hover:bg-purple-600">
            Upgrade for Full Access
          </Button>
        </CardContent>
      </Card>
    );
  }

  const selectedShowData = shows.find(show => show.id === selectedShow);
  const episodes = selectedShowData?.episodes || [];
  const limitedEpisodes = tierAccess?.canAccessAllPodcasts 
    ? episodes 
    : episodes.slice(0, tierAccess?.maxPodcastEpisodes || 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          Podcast Studio
          {!tierAccess?.canAccessAllPodcasts && (
            <Badge variant="outline" className="ml-2">
              Limited ({tierAccess?.maxPodcastEpisodes || 3} episodes each)
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Show Selection */}
            <div className="flex flex-wrap gap-2 mb-6">
              {shows.map((show) => (
                <Button
                  key={show.id}
                  variant={selectedShow === show.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedShow(show.id)}
                  className="h-auto p-2 flex-col items-start text-left"
                >
                  <span className="font-medium text-xs">{show.title}</span>
                  <span className="text-xs opacity-75">{show.author}</span>
                </Button>
              ))}
            </div>

            {/* Current Player */}
            {currentEpisode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6 border"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                    {currentEpisode.imageUrl ? (
                      <Image
                        src={currentEpisode.imageUrl}
                        alt={currentEpisode.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Mic className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{currentEpisode.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedShowData?.author}
                    </p>
                  </div>
                </div>

                {/* Player Controls */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button size="sm" variant="outline">
                      <SkipBack className="w-4 h-4" />
                    </Button>
                    <Button onClick={togglePlayPause}>
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="outline">
                      <SkipForward className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-2 flex-1">
                      <Volume2 className="w-4 h-4" />
                      <Slider
                        value={[volume]}
                        onValueChange={handleVolumeChange}
                        max={1}
                        step={0.1}
                        className="w-20"
                      />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Slider
                      value={[currentTime]}
                      onValueChange={handleSeek}
                      max={duration || 100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>

                <audio ref={audioRef} />
              </motion.div>
            )}

            {/* Episodes List */}
            <div className="space-y-3">
              <AnimatePresence>
                {limitedEpisodes.map((episode) => (
                  <motion.div
                    key={episode.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                    onClick={() => playEpisode(episode)}
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {episode.imageUrl || selectedShowData?.imageUrl ? (
                        <Image
                          src={episode.imageUrl || selectedShowData?.imageUrl || ''}
                          alt={episode.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Mic className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      {currentEpisode?.id === episode.id && (
                        <div className="absolute inset-0 bg-purple-500/80 flex items-center justify-center">
                          {isPlaying ? (
                            <Pause className="w-4 h-4 text-white" />
                          ) : (
                            <Play className="w-4 h-4 text-white" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium line-clamp-2 text-sm">
                          {episode.title}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {tierAccess?.canBookmarkContent && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBookmark(episode.id);
                              }}
                              disabled={bookmarkingStates[episode.id]}
                            >
                              {bookmarkingStates[episode.id] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : episode.userProgress?.isFavorite ? (
                                <BookmarkCheck className="w-4 h-4 text-purple-500" />
                              ) : (
                                <Bookmark className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {episode.description}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.round(episode.duration / 60)} min
                        </div>
                        <span>{formatDate(episode.publishDate)}</span>
                        {episode.episodeNumber && (
                          <span>Ep. {episode.episodeNumber}</span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {episode.userProgress?.lastPosition ? (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-purple-500 h-1 rounded-full transition-all"
                              style={{ 
                                width: `${(episode.userProgress.lastPosition / episode.duration) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Upgrade Prompt for Limited Access */}
              {!tierAccess?.canAccessAllPodcasts && episodes.length > limitedEpisodes.length && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center"
                >
                  <Crown className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm font-medium mb-2">
                    {episodes.length - limitedEpisodes.length} more episodes available
                  </p>
                  <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                    Upgrade for Full Access
                  </Button>
                </motion.div>
              )}

              {limitedEpisodes.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  <Mic className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No podcast episodes available</p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
