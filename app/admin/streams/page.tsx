'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Video,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Youtube,
  Tv,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Save
} from 'lucide-react';

interface CustomStream {
  id: string;
  title: string;
  streamUrl: string;
  thumbnail?: string;
  platform: string;
  description?: string;
  isActive: boolean;
  priority: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminStreamsPage() {
  const { data: session, status } = useSession();
  const [streams, setStreams] = useState<CustomStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStream, setSelectedStream] = useState<CustomStream | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    streamUrl: '',
    thumbnail: '',
    platform: 'YOUTUBE',
    description: '',
    isActive: true,
    priority: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin?callbackUrl=/admin/streams');
    }
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      redirect('/');
    }
    if (status === 'authenticated') {
      fetchStreams();
    }
  }, [status, session]);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/custom-streams');
      const data = await response.json();
      
      if (data.success) {
        setStreams(data.streams);
        setError(null);
      } else {
        setError(data.error || 'Failed to load streams');
      }
    } catch (error) {
      console.error('Error fetching streams:', error);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStream = () => {
    setSelectedStream(null);
    setFormData({
      title: '',
      streamUrl: '',
      thumbnail: '',
      platform: 'YOUTUBE',
      description: '',
      isActive: true,
      priority: 0,
    });
    setEditDialogOpen(true);
  };

  const handleEditStream = (stream: CustomStream) => {
    setSelectedStream(stream);
    setFormData({
      title: stream.title,
      streamUrl: stream.streamUrl,
      thumbnail: stream.thumbnail || '',
      platform: stream.platform,
      description: stream.description || '',
      isActive: stream.isActive,
      priority: stream.priority,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteStream = (stream: CustomStream) => {
    setSelectedStream(stream);
    setDeleteDialogOpen(true);
  };

  const handleSaveStream = async () => {
    try {
      setSaving(true);
      
      const method = selectedStream ? 'PUT' : 'POST';
      const body = selectedStream 
        ? { ...formData, id: selectedStream.id }
        : formData;

      const response = await fetch('/api/admin/custom-streams', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchStreams();
        setEditDialogOpen(false);
        setError(null);
      } else {
        setError(data.error || 'Failed to save stream');
      }
    } catch (error) {
      console.error('Error saving stream:', error);
      setError('Failed to save stream');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedStream) return;

    try {
      setSaving(true);
      
      const response = await fetch(`/api/admin/custom-streams?id=${selectedStream.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchStreams();
        setDeleteDialogOpen(false);
        setError(null);
      } else {
        setError(data.error || 'Failed to delete stream');
      }
    } catch (error) {
      console.error('Error deleting stream:', error);
      setError('Failed to delete stream');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (stream: CustomStream) => {
    try {
      const response = await fetch('/api/admin/custom-streams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: stream.id,
          isActive: !stream.isActive,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchStreams();
      }
    } catch (error) {
      console.error('Error toggling stream:', error);
    }
  };

  const handleChangePriority = async (stream: CustomStream, direction: 'up' | 'down') => {
    const newPriority = direction === 'up' ? stream.priority + 1 : stream.priority - 1;
    
    try {
      const response = await fetch('/api/admin/custom-streams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: stream.id,
          priority: newPriority,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchStreams();
      }
    } catch (error) {
      console.error('Error changing priority:', error);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toUpperCase()) {
      case 'YOUTUBE': return <Youtube className="w-4 h-4 text-red-500" />;
      case 'PICKLEBALLTV': return <Tv className="w-4 h-4 text-blue-500" />;
      default: return <Video className="w-4 h-4" />;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Custom Streams Management
                <Badge variant="outline">{streams.length} Streams</Badge>
              </CardTitle>
              
              <Button onClick={handleCreateStream}>
                <Plus className="w-4 h-4 mr-2" />
                Add Stream
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <AnimatePresence>
                {streams.map((stream) => (
                  <motion.div
                    key={stream.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    {/* Thumbnail */}
                    <div className="w-24 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {stream.thumbnail ? (
                        <img 
                          src={stream.thumbnail} 
                          alt={stream.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Stream Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{stream.title}</h4>
                        {getPlatformIcon(stream.platform)}
                        <Badge variant={stream.isActive ? 'default' : 'secondary'} className="text-xs">
                          {stream.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Priority: {stream.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {stream.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <a 
                          href={stream.streamUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                        >
                          View Stream <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleChangePriority(stream, 'up')}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleChangePriority(stream, 'down')}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleActive(stream)}
                        className="h-8 w-8 p-0"
                      >
                        {stream.isActive ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditStream(stream)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteStream(stream)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {streams.length === 0 && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                  <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No custom streams yet</p>
                  <Button onClick={handleCreateStream} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Stream
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit/Create Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedStream ? 'Edit Stream' : 'Create New Stream'}
              </DialogTitle>
              <DialogDescription>
                {selectedStream ? 'Update the stream details below' : 'Add a new custom stream to the media center'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Stream title"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Stream URL *</label>
                <Input
                  value={formData.streamUrl}
                  onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Thumbnail URL</label>
                <Input
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://upload.wikimedia.org/wikipedia/commons/5/55/Special-IPContributions_input_form.png"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Platform *</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="YOUTUBE">YouTube</option>
                  <option value="PICKLEBALLTV">PickleballTV</option>
                  <option value="TWITCH">Twitch</option>
                  <option value="FACEBOOK">Facebook</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Stream description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Priority</label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveStream} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the stream "{selectedStream?.title}".
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </div>
  );
}
