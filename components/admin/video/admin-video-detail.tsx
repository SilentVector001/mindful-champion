
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Video,
  Edit3,
  Save,
  X,
  Flag,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  FileText,
  Shield,
  MessageSquare,
  Eye,
  ExternalLink,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface VideoAnalysis {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  duration: number;
  videoUrl: string;
  uploadedAt: string;
  analysisStatus: string;
  adminUpload: boolean;
  adminNotes?: string;
  adminNotesUpdatedAt?: string;
  adminNotesUpdatedBy?: string;
  flaggedForReview: boolean;
  flaggedReason?: string;
  flaggedAt?: string;
  reviewStatus: string;
  reviewedAt?: string;
  reviewComments?: string;
  adminPriority: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    skillLevel: string;
  };
  uploadedByAdmin?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    name?: string;
  };
}

interface AdminVideoDetailProps {
  videoId: string;
  onBack?: () => void;
  onVideoUpdate?: (video: VideoAnalysis) => void;
}

export function AdminVideoDetail({ videoId, onBack, onVideoUpdate }: AdminVideoDetailProps) {
  const [video, setVideo] = useState<VideoAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Edit states
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [editedPriority, setEditedPriority] = useState('NORMAL');
  const [flagReason, setFlagReason] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewComments, setReviewComments] = useState('');
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);
  const [securityEventType, setSecurityEventType] = useState('');
  const [securityMessage, setSecurityMessage] = useState('');

  // Load video details
  const loadVideoDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/videos/${videoId}`);
      if (response.ok) {
        const data = await response.json();
        setVideo(data.video);
        setEditedNotes(data.video.adminNotes || '');
        setEditedPriority(data.video.adminPriority || 'NORMAL');
        setReviewStatus(data.video.reviewStatus || '');
        setReviewComments(data.video.reviewComments || '');
      } else {
        toast.error('Failed to load video details');
      }
    } catch (error) {
      console.error('Failed to load video:', error);
      toast.error('Failed to load video details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (videoId) {
      loadVideoDetails();
    }
  }, [videoId]);

  // Save notes and settings
  const saveChanges = async () => {
    if (!video) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminNotes: editedNotes,
          adminPriority: editedPriority
        })
      });

      if (response.ok) {
        const result = await response.json();
        setVideo(result.video);
        setIsEditingNotes(false);
        toast.success('Changes saved successfully');
        onVideoUpdate?.(result.video);
      } else {
        toast.error('Failed to save changes');
      }
    } catch (error) {
      console.error('Failed to save changes:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Flag/unflag video
  const toggleFlag = async () => {
    if (!video) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flaggedForReview: !video.flaggedForReview,
          flaggedReason: !video.flaggedForReview ? flagReason : undefined
        })
      });

      if (response.ok) {
        const result = await response.json();
        setVideo(result.video);
        setFlagReason('');
        toast.success(`Video ${video.flaggedForReview ? 'unflagged' : 'flagged'} successfully`);
        onVideoUpdate?.(result.video);
      } else {
        toast.error('Failed to update flag status');
      }
    } catch (error) {
      console.error('Failed to toggle flag:', error);
      toast.error('Failed to update flag status');
    } finally {
      setSaving(false);
    }
  };

  // Update review status
  const updateReviewStatus = async () => {
    if (!video || !reviewStatus) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewStatus,
          reviewComments
        })
      });

      if (response.ok) {
        const result = await response.json();
        setVideo(result.video);
        toast.success('Review status updated successfully');
        onVideoUpdate?.(result.video);
      } else {
        toast.error('Failed to update review status');
      }
    } catch (error) {
      console.error('Failed to update review:', error);
      toast.error('Failed to update review status');
    } finally {
      setSaving(false);
    }
  };

  // Create security event
  const createSecurityEvent = async () => {
    if (!video || !securityEventType || !securityMessage) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/videos/security-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.id,
          userId: video.user.id,
          eventType: securityEventType,
          severity: securityEventType.includes('FLAGGED') ? 'HIGH' : 'MEDIUM',
          description: `Admin security event for video "${video.title}": ${securityMessage}`,
          customMessage: securityMessage
        })
      });

      if (response.ok) {
        toast.success('Security event created successfully');
        setShowSecurityDialog(false);
        setSecurityEventType('');
        setSecurityMessage('');
      } else {
        toast.error('Failed to create security event');
      }
    } catch (error) {
      console.error('Failed to create security event:', error);
      toast.error('Failed to create security event');
    } finally {
      setSaving(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'NORMAL': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOW': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReviewStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'FLAGGED': return 'bg-red-100 text-red-800 border-red-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PENDING': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUserName = (user: VideoAnalysis['user']) => {
    return user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.name || user.email;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!video) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Video not found or you don't have permission to view it.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{video.title}</h1>
            <p className="text-gray-600">Video Analysis Details</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={showSecurityDialog} onOpenChange={setShowSecurityDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Security Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Security Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Event Type</label>
                  <Select value={securityEventType} onValueChange={setSecurityEventType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUSPICIOUS_ACTIVITY">Suspicious Activity</SelectItem>
                      <SelectItem value="ADMIN_VIDEO_FLAGGED">Flagged Content</SelectItem>
                      <SelectItem value="ADMIN_VIDEO_REVIEWED">Content Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    placeholder="Describe the security concern..."
                    value={securityMessage}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSecurityMessage(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowSecurityDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createSecurityEvent}
                    disabled={!securityEventType || !securityMessage || saving}
                  >
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Event
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant={video.flaggedForReview ? "destructive" : "outline"}
            onClick={toggleFlag}
            disabled={saving}
          >
            <Flag className="w-4 h-4 mr-2" />
            {video.flaggedForReview ? 'Unflag' : 'Flag'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          {video.videoUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Video Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <video 
                    controls 
                    className="w-full h-full"
                    controlsList="nodownload"
                    preload="metadata"
                  >
                    <source src={video.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Duration: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                  </span>
                  <a 
                    href={video.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in New Tab
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Video Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Video Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">File Name</label>
                  <p className="text-gray-900">{video.fileName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">File Size</label>
                  <p className="text-gray-900">{formatFileSize(video.fileSize)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Upload Date</label>
                  <p className="text-gray-900">
                    {format(new Date(video.uploadedAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Analysis Status</label>
                  <Badge variant="outline">{video.analysisStatus}</Badge>
                </div>
              </div>

              {video.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900 mt-1">{video.description}</p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Badge 
                  variant="outline"
                  className={getPriorityColor(video.adminPriority)}
                >
                  {video.adminPriority} Priority
                </Badge>
                <Badge 
                  variant="outline"
                  className={getReviewStatusColor(video.reviewStatus)}
                >
                  {video.reviewStatus.replace('_', ' ')}
                </Badge>
                {video.adminUpload && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Admin Upload
                  </Badge>
                )}
                {video.flaggedForReview && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <Flag className="w-3 h-3 mr-1" />
                    Flagged
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-900">{formatUserName(video.user)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{video.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Skill Level</label>
                  <Badge variant="outline">{video.user.skillLevel}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">User ID</label>
                  <p className="text-gray-900 font-mono text-sm">{video.user.id}</p>
                </div>
              </div>

              {video.uploadedByAdmin && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Uploaded by Admin:</span>{' '}
                    {formatUserName(video.uploadedByAdmin as any)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Flagged Info */}
          {video.flaggedForReview && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <Flag className="w-5 h-5" />
                  Flagged for Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {video.flaggedReason && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Reason</label>
                      <p className="text-gray-900">{video.flaggedReason}</p>
                    </div>
                  )}
                  {video.flaggedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Flagged At</label>
                      <p className="text-gray-900">
                        {format(new Date(video.flaggedAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <Textarea
                    placeholder="Add reason for flagging..."
                    value={flagReason}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFlagReason(e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Eye className="w-4 h-4 mr-2" />
                View in User's Library
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Analysis Results
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message User
              </Button>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Admin Notes</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingNotes(!isEditingNotes)}
              >
                {isEditingNotes ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              {isEditingNotes ? (
                <div className="space-y-4">
                  <Textarea
                    value={editedNotes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditedNotes(e.target.value)}
                    placeholder="Add admin notes..."
                    rows={4}
                  />
                  <div>
                    <label className="text-sm font-medium mb-2 block">Priority Level</label>
                    <Select value={editedPriority} onValueChange={setEditedPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low Priority</SelectItem>
                        <SelectItem value="NORMAL">Normal Priority</SelectItem>
                        <SelectItem value="HIGH">High Priority</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveChanges} disabled={saving} size="sm">
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingNotes(false);
                        setEditedNotes(video.adminNotes || '');
                        setEditedPriority(video.adminPriority || 'NORMAL');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  {video.adminNotes ? (
                    <div className="space-y-2">
                      <p className="text-gray-900">{video.adminNotes}</p>
                      {video.adminNotesUpdatedAt && (
                        <p className="text-xs text-gray-500">
                          Last updated: {format(new Date(video.adminNotesUpdatedAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No admin notes yet.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Status */}
          <Card>
            <CardHeader>
              <CardTitle>Review Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={reviewStatus} onValueChange={setReviewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="FLAGGED">Flagged</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Comments</label>
                <Textarea
                  value={reviewComments}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewComments(e.target.value)}
                  placeholder="Add review comments..."
                  rows={3}
                />
              </div>

              <Button onClick={updateReviewStatus} disabled={saving} className="w-full">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Review
              </Button>

              {video.reviewedAt && (
                <div className="text-xs text-gray-500 mt-2">
                  Last reviewed: {format(new Date(video.reviewedAt), 'MMM dd, yyyy HH:mm')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
