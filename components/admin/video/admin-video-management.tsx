
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Video,
  Search,
  Filter,
  MoreHorizontal,
  Flag,
  Edit3,
  Trash2,
  Eye,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileText,
  Shield,
  ChevronLeft,
  ChevronRight,
  RefreshCw
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
  uploadedAt: string;
  analysisStatus: string;
  adminUpload: boolean;
  adminNotes?: string;
  adminNotesUpdatedAt?: string;
  flaggedForReview: boolean;
  flaggedReason?: string;
  reviewStatus: string;
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

interface AdminVideoManagementProps {
  userId?: string;
  onVideoSelect?: (video: VideoAnalysis) => void;
  onUserClick?: (userId: string, userName: string) => void;
}

export function AdminVideoManagement({ userId, onVideoSelect, onUserClick }: AdminVideoManagementProps) {
  const [videos, setVideos] = useState<VideoAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAdminUploads: 0,
    flaggedVideos: 0,
    pendingReviews: 0
  });

  // Filters and pagination
  const [filters, setFilters] = useState({
    search: '',
    adminUpload: '',
    reviewStatus: 'all',
    flaggedOnly: false,
    priority: 'all',
    sortBy: 'uploadedAt',
    sortOrder: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('all');

  // Load videos
  const loadVideos = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      if (userId) params.append('userId', userId);
      if (filters.search) params.append('search', filters.search);
      if (filters.adminUpload) params.append('adminUpload', filters.adminUpload);
      if (filters.reviewStatus && filters.reviewStatus !== 'all') params.append('reviewStatus', filters.reviewStatus);
      if (filters.flaggedOnly) params.append('flaggedOnly', 'true');
      if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);

      // Apply tab filter
      if (activeTab === 'admin-uploads') {
        params.set('adminUpload', 'true');
      } else if (activeTab === 'flagged') {
        params.set('flaggedOnly', 'true');
      } else if (activeTab === 'pending-review') {
        params.set('reviewStatus', 'PENDING');
        params.set('adminUpload', 'true');
      }

      const response = await fetch(`/api/admin/videos/list?${params}`);
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setStats(data.stats);
      } else {
        toast.error('Failed to load videos');
      }
    } catch (error) {
      console.error('Failed to load videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos(1);
  }, [filters, activeTab, userId]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Handle video actions
  const handleVideoAction = async (videoId: string, action: string, data?: any) => {
    try {
      if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
          return;
        }
        
        const response = await fetch(`/api/admin/videos/${videoId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          toast.success('Video deleted successfully');
          loadVideos(currentPage);
        } else {
          toast.error('Failed to delete video');
        }
      } else if (action === 'flag' || action === 'unflag') {
        const response = await fetch(`/api/admin/videos/${videoId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flaggedForReview: action === 'flag',
            flaggedReason: data?.reason || undefined
          })
        });
        
        if (response.ok) {
          toast.success(`Video ${action}ged successfully`);
          loadVideos(currentPage);
        } else {
          toast.error(`Failed to ${action} video`);
        }
      } else if (action === 'review') {
        const response = await fetch(`/api/admin/videos/${videoId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reviewStatus: data.status,
            reviewComments: data.comments
          })
        });
        
        if (response.ok) {
          toast.success('Review status updated');
          loadVideos(currentPage);
        } else {
          toast.error('Failed to update review status');
        }
      }
    } catch (error) {
      console.error('Action failed:', error);
      toast.error('Action failed');
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

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAdminUploads}</p>
                <p className="text-sm text-gray-600">Admin Uploads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Flag className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.flaggedVideos}</p>
                <p className="text-sm text-gray-600">Flagged Videos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReviews}</p>
                <p className="text-sm text-gray-600">Pending Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Tabs */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <CardTitle className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-600" />
              Video Management
            </CardTitle>
            <Button
              onClick={() => loadVideos(currentPage)}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search videos..."
                value={filters.search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.reviewStatus}
              onValueChange={(value: string) => handleFilterChange('reviewStatus', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Review Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="FLAGGED">Flagged</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority}
              onValueChange={(value: string) => handleFilterChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy}
              onValueChange={(value: string) => handleFilterChange('sortBy', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uploadedAt">Upload Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="reviewStatus">Review Status</SelectItem>
                <SelectItem value="adminPriority">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full lg:w-auto">
              <TabsTrigger value="all">All Videos</TabsTrigger>
              <TabsTrigger value="admin-uploads">Admin Uploads</TabsTrigger>
              <TabsTrigger value="flagged">Flagged</TabsTrigger>
              <TabsTrigger value="pending-review">Pending Review</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : videos.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
                  <p className="text-gray-600">No videos match your current filters.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {videos.map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Video className="w-6 h-6 text-blue-600" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 
                                      className="text-lg font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600"
                                      onClick={() => onVideoSelect?.(video)}
                                    >
                                      {video.title}
                                    </h3>
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
                                  
                                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center gap-1">
                                      <User className="w-4 h-4" />
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onUserClick?.(video.user.id, formatUserName(video.user));
                                        }}
                                        className="hover:text-blue-600 hover:underline font-medium transition-colors"
                                        title={`View all videos by ${formatUserName(video.user)}`}
                                      >
                                        {formatUserName(video.user)}
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {format(new Date(video.uploadedAt), 'MMM dd, yyyy')}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <FileText className="w-4 h-4" />
                                      {formatFileSize(video.fileSize)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      Status: {video.analysisStatus}
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
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
                                    <Badge variant="outline">
                                      {video.user.skillLevel}
                                    </Badge>
                                  </div>

                                  {video.adminNotes && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-700">
                                        <span className="font-medium">Admin Notes: </span>
                                        {video.adminNotes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onVideoSelect?.(video)}
                                title="Watch Video & View Details"
                                className="hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                <span className="text-xs hidden sm:inline">Watch</span>
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleVideoAction(
                                  video.id, 
                                  video.flaggedForReview ? 'unflag' : 'flag'
                                )}
                              >
                                <Flag className={cn(
                                  "w-4 h-4",
                                  video.flaggedForReview ? "text-red-600" : "text-gray-400"
                                )} />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleVideoAction(video.id, 'delete')}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
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
                      loadVideos(newPage);
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
                      loadVideos(newPage);
                    }}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
