
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Video,
  MessageSquare,
  Plus,
  Calendar,
  User,
  Flag,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SecurityEvent {
  id: string;
  eventType: string;
  severity: string;
  description: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  metadata?: {
    videoId?: string;
    videoTitle?: string;
    fileName?: string;
    adminId?: string;
    customMessage?: string;
  };
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    name?: string;
  };
}

interface AdminVideoSecurityProps {
  userId?: string;
  videoId?: string;
}

export function AdminVideoSecurity({ userId, videoId }: AdminVideoSecurityProps) {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Create event form
  const [newEvent, setNewEvent] = useState({
    eventType: '',
    severity: 'MEDIUM',
    description: '',
    customMessage: ''
  });

  // Load security events
  const loadSecurityEvents = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (userId) params.append('userId', userId);
      if (videoId) params.append('videoId', videoId);

      const response = await fetch(`/api/admin/videos/security-events?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
      } else {
        toast.error('Failed to load security events');
      }
    } catch (error) {
      console.error('Failed to load security events:', error);
      toast.error('Failed to load security events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityEvents(1);
  }, [userId, videoId]);

  // Create new security event
  const createSecurityEvent = async () => {
    if (!newEvent.eventType || !newEvent.description || !userId || !videoId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/admin/videos/security-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          userId,
          eventType: newEvent.eventType,
          severity: newEvent.severity,
          description: newEvent.description,
          customMessage: newEvent.customMessage
        })
      });

      if (response.ok) {
        toast.success('Security event created successfully');
        setShowCreateDialog(false);
        setNewEvent({
          eventType: '',
          severity: 'MEDIUM',
          description: '',
          customMessage: ''
        });
        loadSecurityEvents(currentPage);
      } else {
        toast.error('Failed to create security event');
      }
    } catch (error) {
      console.error('Failed to create security event:', error);
      toast.error('Failed to create security event');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'ADMIN_VIDEO_UPLOADED': return <Video className="w-4 h-4" />;
      case 'ADMIN_VIDEO_FLAGGED': return <Flag className="w-4 h-4" />;
      case 'ADMIN_VIDEO_DELETED': return <AlertTriangle className="w-4 h-4" />;
      case 'ADMIN_VIDEO_REVIEWED': return <CheckCircle2 className="w-4 h-4" />;
      case 'ADMIN_VIDEO_NOTES_UPDATED': return <MessageSquare className="w-4 h-4" />;
      case 'SUSPICIOUS_ACTIVITY': return <AlertTriangle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const formatUserName = (user: SecurityEvent['user']) => {
    if (!user) return 'Unknown User';
    return user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.name || user.email;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Video Security Events</h2>
          <p className="text-gray-600">Monitor and manage video-related security events</p>
        </div>

        {userId && videoId && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Security Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Event Type</label>
                  <Select
                    value={newEvent.eventType}
                    onValueChange={(value: string) => setNewEvent(prev => ({ ...prev, eventType: value }))}
                  >
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
                  <label className="text-sm font-medium mb-2 block">Severity</label>
                  <Select
                    value={newEvent.severity}
                    onValueChange={(value: string) => setNewEvent(prev => ({ ...prev, severity: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    placeholder="Describe the security event..."
                    value={newEvent.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Custom Message (Optional)</label>
                  <Textarea
                    placeholder="Additional details..."
                    value={newEvent.customMessage}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewEvent(prev => ({ ...prev, customMessage: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={createSecurityEvent}>
                    Create Event
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Events List */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No security events</h3>
              <p className="text-gray-600">No video-related security events found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            {getEventTypeIcon(event.eventType)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {event.eventType.replace('ADMIN_VIDEO_', '').replace('_', ' ')}
                              </h3>
                              <Badge 
                                variant="outline"
                                className={getSeverityColor(event.severity)}
                              >
                                {event.severity}
                              </Badge>
                              {event.resolved && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Resolved
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-gray-700 mb-3">{event.description}</p>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                              {event.user && (
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {formatUserName(event.user)}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm')}
                              </div>
                              {event.metadata?.videoTitle && (
                                <div className="flex items-center gap-1">
                                  <Video className="w-4 h-4" />
                                  {event.metadata.videoTitle}
                                </div>
                              )}
                              {event.metadata?.fileName && (
                                <div className="flex items-center gap-1 truncate">
                                  <FileText className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">{event.metadata.fileName}</span>
                                </div>
                              )}
                            </div>

                            {event.metadata?.customMessage && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Additional Details: </span>
                                  {event.metadata.customMessage}
                                </p>
                              </div>
                            )}

                            {event.resolved && event.resolvedAt && (
                              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                <p className="text-sm text-green-700">
                                  <span className="font-medium">Resolved: </span>
                                  {format(new Date(event.resolvedAt), 'MMM dd, yyyy HH:mm')}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {event.metadata?.videoId && (
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement resolve/unresolve functionality
                            }}
                          >
                            {event.resolved ? (
                              <Clock className="w-4 h-4 text-orange-600" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  const newPage = currentPage - 1;
                  setCurrentPage(newPage);
                  loadSecurityEvents(newPage);
                }}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => {
                  const newPage = currentPage + 1;
                  setCurrentPage(newPage);
                  loadSecurityEvents(newPage);
                }}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
