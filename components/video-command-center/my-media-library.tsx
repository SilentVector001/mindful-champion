
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  ListMusic,
  Bookmark,
  Clock,
  Plus,
  Trash,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';

interface Playlist {
  id: string;
  name: string;
  description?: string;
  videoCount: number;
  createdAt: string;
}

export default function MyMediaLibrary() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await fetch('/api/video-library/playlists');
      const data = await response.json();
      setPlaylists(data.playlists || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast.error('Failed to load your library');
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async () => {
    const name = prompt('Enter playlist name:');
    if (!name) return;

    try {
      const response = await fetch('/api/video-library/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        toast.success('Playlist created!');
        fetchPlaylists();
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast.error('Failed to create playlist');
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    if (!confirm('Delete this playlist?')) return;

    try {
      const response = await fetch(
        `/api/video-library/playlists?playlistId=${playlistId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        toast.success('Playlist deleted');
        fetchPlaylists();
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast.error('Failed to delete playlist');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <BookOpen className="h-8 w-8" />
            My Media Library
          </CardTitle>
          <p className="text-green-100">
            Your playlists, bookmarks, and watch history
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="playlists">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="playlists" className="gap-2">
            <ListMusic className="h-4 w-4" />
            Playlists
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="h-4 w-4" />
            Watch History
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Bookmarks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="playlists" className="mt-6">
          <div className="mb-6">
            <Button onClick={createPlaylist} className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Playlist
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 space-y-3">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : playlists.length === 0 ? (
            <Card className="p-12 text-center">
              <ListMusic className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Playlists Yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Create your first playlist to organize your favorite videos
              </p>
              <Button onClick={createPlaylist} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Playlist
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.map((playlist) => (
                <Card
                  key={playlist.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg mb-1">
                          {playlist.name}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {playlist.videoCount} video{playlist.videoCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePlaylist(playlist.id)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    {playlist.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        {playlist.description}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button className="flex-1 gap-2" size="sm">
                        <Play className="h-4 w-4" />
                        Play All
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="p-12 text-center">
            <Clock className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Watch History</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Your recently watched videos will appear here
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="bookmarks" className="mt-6">
          <Card className="p-12 text-center">
            <Bookmark className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Video Bookmarks</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Your bookmarked moments will appear here
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
