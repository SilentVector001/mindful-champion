
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Video, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  Upload,
  Eye,
  BarChart3,
  Calendar,
  User,
  FileVideo,
  Loader2,
  Activity,
  Target,
  Zap,
  Award,
  Users,
  Flag
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

interface VideoStats {
  totalVideos: number;
  completedAnalysis: number;
  pendingAnalysis: number;
  failedAnalysis: number;
  totalStorageUsed: number;
  averageAnalysisTime: number;
  averageScore: number;
  uploadTrend: {
    date: string;
    count: number;
  }[];
  statusBreakdown: {
    PENDING: number;
    PROCESSING: number;
    COMPLETED: number;
    FAILED: number;
  };
  recentVideos: {
    id: string;
    title: string;
    uploadedAt: string;
    analysisStatus: string;
    overallScore: number;
  }[];
  flaggedVideos: number;
  adminNotes: number;
  securityEvents: number;
  avgFileSize: number;
  mostCommonIssues: {
    issue: string;
    count: number;
  }[];
}

interface AdminVideoAnalyticsProps {
  userId?: string;
}

export function AdminVideoAnalytics({ userId }: AdminVideoAnalyticsProps) {
  const [stats, setStats] = useState<VideoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    loadStats();
  }, [userId, timeRange]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      params.append('timeRange', timeRange);

      const response = await fetch(`/api/admin/videos/analytics?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load analytics');
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load video analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Analytics Data
        </h3>
        <p className="text-gray-600">
          Unable to load video analytics at this time.
        </p>
      </div>
    );
  }

  const completionRate = stats.totalVideos > 0 
    ? Math.round((stats.completedAnalysis / stats.totalVideos) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {userId ? 'User Video Analytics' : 'Platform Video Analytics'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Comprehensive insights and statistics
          </p>
        </div>
        
        <div className="flex gap-2">
          {['7', '30', '90', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range === 'all' ? 'All Time' : `${range} Days`}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Videos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Total
                </Badge>
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">{stats.totalVideos}</p>
                <p className="text-sm text-gray-600 mt-1">Videos Uploaded</p>
              </div>
              {stats.uploadTrend.length > 1 && (
                <div className="mt-3 flex items-center text-xs">
                  <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">
                    {stats.uploadTrend[stats.uploadTrend.length - 1].count} this week
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Completed Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-600" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {completionRate}%
                </Badge>
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">{stats.completedAnalysis}</p>
                <p className="text-sm text-gray-600 mt-1">Completed</p>
              </div>
              <Progress value={completionRate} className="mt-3 h-2" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Average Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-600" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Average
                </Badge>
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">{stats.averageScore.toFixed(1)}</p>
                <p className="text-sm text-gray-600 mt-1">Avg Score</p>
              </div>
              <div className="mt-3 flex items-center text-xs text-gray-600">
                <Target className="w-3 h-3 mr-1" />
                <span>Out of 100</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Storage Used */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-600" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <FileVideo className="w-6 h-6 text-white" />
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Storage
                </Badge>
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">
                  {(stats.totalStorageUsed / 1024 / 1024).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600 mt-1">GB Used</p>
              </div>
              <div className="mt-3 flex items-center text-xs text-gray-600">
                <Activity className="w-3 h-3 mr-1" />
                <span>Avg: {(stats.avgFileSize / 1024 / 1024).toFixed(1)} MB/video</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Status Breakdown and Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analysis Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Analysis Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.statusBreakdown).map(([status, count]) => {
              const total = stats.totalVideos;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
                COMPLETED: { color: 'green', icon: CheckCircle2, label: 'Completed' },
                PROCESSING: { color: 'blue', icon: Activity, label: 'Processing' },
                PENDING: { color: 'yellow', icon: Clock, label: 'Pending' },
                FAILED: { color: 'red', icon: AlertTriangle, label: 'Failed' }
              };

              const config = statusConfig[status] || { color: 'gray', icon: Video, label: status };
              const Icon = config.icon;

              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 text-${config.color}-600`} />
                      <span className="text-sm font-medium text-gray-700">{config.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                      <Badge variant="outline" className="text-xs">
                        {percentage.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Upload Activity Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Upload Activity Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.uploadTrend.slice(-7).reverse().map((day) => {
                const maxCount = Math.max(...stats.uploadTrend.map(d => d.count), 1);
                const percentage = (day.count / maxCount) * 100;
                
                return (
                  <div key={day.date} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">
                        {format(new Date(day.date), 'MMM d, yyyy')}
                      </span>
                      <span className="font-medium text-gray-900">{day.count} videos</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Flag className="w-6 h-6 text-red-600" />
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
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileVideo className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.adminNotes}</p>
                <p className="text-sm text-gray-600">Admin Notes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.securityEvents}</p>
                <p className="text-sm text-gray-600">Security Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Videos */}
      {stats.recentVideos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Recent Video Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentVideos.slice(0, 5).map((video) => (
                <div 
                  key={video.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{video.title || 'Untitled Video'}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {format(new Date(video.uploadedAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {video.overallScore > 0 && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {video.overallScore}/100
                      </Badge>
                    )}
                    <Badge 
                      variant="outline"
                      className={
                        video.analysisStatus === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                        video.analysisStatus === 'PROCESSING' ? 'bg-blue-50 text-blue-700' :
                        video.analysisStatus === 'PENDING' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-red-50 text-red-700'
                      }
                    >
                      {video.analysisStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Common Issues */}
      {stats.mostCommonIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Most Common Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.mostCommonIssues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{issue.issue}</span>
                  <Badge variant="outline">{issue.count} occurrences</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
