
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Library,
  Bookmark,
  Clock,
  Play,
  ExternalLink,
  Trash2,
  Calendar,
  Video,
  Mic,
  Trophy,
  BookOpen,
  Crown,
  User,
  Tag,
  Loader2,
  Star
} from 'lucide-react';
import Image from 'next/image';

interface BookmarkItem {
  id: string;
  contentType: string;
  contentId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  url?: string;
  bookmarkedAt: string;
  metadata?: any;
}

interface PodcastBookmark {
  id: string;
  episodeId: string;
  bookmarkedAt: string;
  notes?: string;
  episode: {
    id: string;
    title: string;
    description?: string;
    duration: number;
    publishDate: string;
    imageUrl?: string;
    show: {
      title: string;
      author: string;
    };
  };
}

interface WatchHistoryItem {
  id: string;
  contentType: string;
  contentId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  url?: string;
  watchedAt: string;
  watchedDuration: number;
  totalDuration?: number;
  completed: boolean;
  lastPosition: number;
}

interface MyLibrarySectionProps {
  tierAccess?: {
    canBookmarkContent: boolean;
    showUpgradePrompts: boolean;
  };
}

export function MyLibrarySection({ tierAccess }: MyLibrarySectionProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [podcastBookmarks, setPodcastBookmarks] = useState<PodcastBookmark[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookmarks');
  const [deletingItems, setDeletingItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (tierAccess?.canBookmarkContent) {
      fetchMyLibrary();
    } else {
      setLoading(false);
    }
  }, [tierAccess]);

  const fetchMyLibrary = async () => {
    try {
      setLoading(true);
      
      // Fetch bookmarks
      const bookmarksResponse = await fetch('/api/media-center/bookmarks');
      const bookmarksData = await bookmarksResponse.json();
      
      if (bookmarksData.success) {
        setBookmarks(bookmarksData.contentBookmarks || []);
        setPodcastBookmarks(bookmarksData.podcastBookmarks || []);
      }
      
      // Fetch watch history
      const historyResponse = await fetch('/api/media-center/watch-history?limit=50');
      const historyData = await historyResponse.json();
      
      if (historyData.success) {
        setWatchHistory(historyData.watchHistory || []);
      }
    } catch (error) {
      console.error('Error fetching library:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBookmark = async (bookmarkId: string, type: 'content' | 'podcast', episodeId?: string) => {
    setDeletingItems(prev => ({ ...prev, [bookmarkId]: true }));
    
    try {
      const params = type === 'podcast' && episodeId 
        ? `?episodeId=${episodeId}` 
        : `?id=${bookmarkId}`;
        
      await fetch(`/api/media-center/bookmarks${params}`, {
        method: 'DELETE'
      });
      
      if (type === 'content') {
        setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
      } else {
        setPodcastBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    } finally {
      setDeletingItems(prev => ({ ...prev, [bookmarkId]: false }));
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'VIDEO':
      case 'TRAINING_DRILL':
        return <Video className="w-4 h-4" />;
      case 'PODCAST_EPISODE':
        return <Mic className="w-4 h-4" />;
      case 'LIVE_STREAM':
        return <Play className="w-4 h-4" />;
      case 'TOURNAMENT':
        return <Trophy className="w-4 h-4" />;
      case 'TECHNIQUE_GUIDE':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <Bookmark className="w-4 h-4" />;
    }
  };

  const getContentTypeColor = (contentType: string) => {
    switch (contentType) {
      case 'VIDEO':
      case 'TRAINING_DRILL':
        return 'bg-blue-500';
      case 'PODCAST_EPISODE':
        return 'bg-purple-500';
      case 'LIVE_STREAM':
        return 'bg-red-500';
      case 'TOURNAMENT':
        return 'bg-yellow-500';
      case 'TECHNIQUE_GUIDE':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getWatchProgress = (watched: number, total?: number) => {
    if (!total) return 0;
    return Math.min((watched / total) * 100, 100);
  };

  const openContent = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!tierAccess?.canBookmarkContent && tierAccess?.showUpgradePrompts) {
    return (
      <Card className="border-2 border-dashed border-indigo-300 bg-indigo-50/30">
        <CardContent className="p-6 text-center">
          <Crown className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">My Personal Library</h3>
          <p className="text-muted-foreground mb-4">
            Save your favorite content, track watch history, and never lose great training materials
          </p>
          <div className="space-y-2 mb-4 text-sm text-left max-w-sm mx-auto">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-indigo-500" />
              <span>Bookmark videos and podcasts</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Track watch progress</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-indigo-500" />
              <span>Personal recommendations</span>
            </div>
          </div>
          <Button className="bg-indigo-500 hover:bg-indigo-600">
            Upgrade for My Library
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Library className="w-5 h-5" />
          My Library
          <Badge variant="outline" className="ml-2">
            {bookmarks.length + podcastBookmarks.length} saved
          </Badge>
        </CardTitle>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookmarks">
              Bookmarks ({bookmarks.length + podcastBookmarks.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              History ({watchHistory.length})
            </TabsTrigger>
            <TabsTrigger value="continue">
              Continue Watching
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-20 h-16 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <TabsContent value="bookmarks" className="space-y-4">
              {/* Content Bookmarks */}
              {bookmarks.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">Content Bookmarks</h4>
                  <AnimatePresence>
                    {bookmarks.map((bookmark) => (
                      <motion.div
                        key={bookmark.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex gap-4 p-3 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {bookmark.thumbnailUrl ? (
                            <Image
                              src={bookmark.thumbnailUrl}
                              alt={bookmark.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {getContentTypeIcon(bookmark.contentType)}
                            </div>
                          )}
                          
                          <div className="absolute top-1 left-1">
                            <Badge className={`${getContentTypeColor(bookmark.contentType)} text-white text-xs`}>
                              {getContentTypeIcon(bookmark.contentType)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium line-clamp-2 text-sm">
                              {bookmark.title}
                            </h4>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => deleteBookmark(bookmark.id, 'content')}
                                disabled={deletingItems[bookmark.id]}
                              >
                                {deletingItems[bookmark.id] ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          {bookmark.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {bookmark.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>Saved {formatDate(bookmark.bookmarkedAt)}</span>
                            </div>
                            
                            {bookmark.url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openContent(bookmark.url)}
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Open
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
              
              {/* Podcast Bookmarks */}
              {podcastBookmarks.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">Podcast Bookmarks</h4>
                  <AnimatePresence>
                    {podcastBookmarks.map((bookmark) => (
                      <motion.div
                        key={bookmark.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex gap-4 p-3 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {bookmark.episode.imageUrl ? (
                            <Image
                              src={bookmark.episode.imageUrl}
                              alt={bookmark.episode.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Mic className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          
                          <div className="absolute top-1 left-1">
                            <Badge className="bg-purple-500 text-white text-xs">
                              <Mic className="w-3 h-3" />
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-medium line-clamp-1 text-sm">
                                {bookmark.episode.title}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {bookmark.episode.show.title} • {bookmark.episode.show.author}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => deleteBookmark(bookmark.id, 'podcast', bookmark.episodeId)}
                              disabled={deletingItems[bookmark.id]}
                            >
                              {deletingItems[bookmark.id] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-red-500" />
                              )}
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{Math.round(bookmark.episode.duration / 60)} min</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Saved {formatDate(bookmark.bookmarkedAt)}</span>
                              </div>
                            </div>
                            
                            <Button size="sm" variant="outline">
                              <Play className="w-3 h-3 mr-1" />
                              Listen
                            </Button>
                          </div>
                          
                          {bookmark.notes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                              <span className="font-medium">Note: </span>
                              {bookmark.notes}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
              
              {bookmarks.length === 0 && podcastBookmarks.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Bookmark className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No bookmarks yet</p>
                  <p className="text-sm">Start saving your favorite content to build your personal library</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              <AnimatePresence>
                {watchHistory.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex gap-4 p-3 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.thumbnailUrl ? (
                        <Image
                          src={item.thumbnailUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {getContentTypeIcon(item.contentType)}
                        </div>
                      )}
                      
                      {item.totalDuration && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
                          <div 
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${getWatchProgress(item.watchedDuration, item.totalDuration)}%` }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium line-clamp-2 text-sm">
                        {item.title}
                      </h4>
                      
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Watched {formatDate(item.watchedAt)}</span>
                        </div>
                        
                        {item.totalDuration && (
                          <div className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            <span>
                              {formatDuration(item.watchedDuration)} / {formatDuration(item.totalDuration)}
                            </span>
                          </div>
                        )}
                        
                        {item.completed && (
                          <Badge variant="outline" className="text-xs text-green-600">
                            Completed
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-end mt-2">
                        {item.url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openContent(item.url)}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            {item.completed ? 'Rewatch' : 'Continue'}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {watchHistory.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No watch history yet</p>
                  <p className="text-sm">Start watching content to see your history here</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="continue" className="space-y-4">
              {watchHistory
                .filter(item => !item.completed && item.watchedDuration > 0)
                .map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 p-3 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.thumbnailUrl ? (
                        <Image
                          src={item.thumbnailUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {getContentTypeIcon(item.contentType)}
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                      
                      {item.totalDuration && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
                          <div 
                            className="h-full bg-blue-500"
                            style={{ width: `${getWatchProgress(item.watchedDuration, item.totalDuration)}%` }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium line-clamp-2 text-sm">
                        {item.title}
                      </h4>
                      
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {item.totalDuration && (
                          <>
                            <span>
                              {Math.round(getWatchProgress(item.watchedDuration, item.totalDuration))}% watched
                            </span>
                            <span>
                              {formatDuration(item.totalDuration - item.watchedDuration)} remaining
                            </span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-end mt-2">
                        {item.url && (
                          <Button
                            size="sm"
                            onClick={() => openContent(item.url)}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Continue Watching
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              
              {watchHistory.filter(item => !item.completed && item.watchedDuration > 0).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Nothing to continue watching</p>
                  <p className="text-sm">Start watching some content to see it here</p>
                </div>
              )}
            </TabsContent>
          </>
        )}
      </CardContent>
    </Card>
  );
}
