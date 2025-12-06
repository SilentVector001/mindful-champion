'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  History, 
  CheckCircle2, 
  MousePointer, 
  TrendingUp,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function NotificationHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({
    category: 'all',
    dateRange: '30',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [filters, pagination.page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        dateRange: filters.dateRange,
        ...(filters.category !== 'all' && { category: filters.category }),
      });

      const res = await fetch(`/api/notifications/history?${params}`);
      const data = await res.json();

      setHistory(data.history || []);
      setAnalytics(data.analytics || {});
      setPagination((prev) => ({ ...prev, totalPages: data.pagination.totalPages }));
    } catch (error) {
      toast.error('Failed to load notification history');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      GOALS: 'bg-teal-100 text-teal-700 border-teal-300',
      VIDEO_ANALYSIS: 'bg-cyan-100 text-cyan-700 border-cyan-300',
      TOURNAMENTS: 'bg-purple-100 text-purple-700 border-purple-300',
      MEDIA: 'bg-blue-100 text-blue-700 border-blue-300',
      ACHIEVEMENTS: 'bg-amber-100 text-amber-700 border-amber-300',
      COACH_KAI: 'bg-pink-100 text-pink-700 border-pink-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  if (loading && pagination.page === 1) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-teal-200 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Sent</p>
                <p className="text-3xl font-bold text-teal-600">{analytics.totalSent || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-teal-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Open Rate</p>
                <p className="text-3xl font-bold text-green-600">{analytics.openRate || 0}%</p>
              </div>
              <Eye className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Click Rate</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.clickRate || 0}%</p>
              </div>
              <MousePointer className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Engagement</p>
                <p className="text-3xl font-bold text-purple-600">
                  {Math.round((analytics.openRate + analytics.clickRate) / 2) || 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-teal-600" />
              Filters
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ ...filters, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="GOALS">Goals</SelectItem>
                  <SelectItem value="VIDEO_ANALYSIS">Video Analysis</SelectItem>
                  <SelectItem value="TOURNAMENTS">Tournaments</SelectItem>
                  <SelectItem value="MEDIA">Media</SelectItem>
                  <SelectItem value="ACHIEVEMENTS">Achievements</SelectItem>
                  <SelectItem value="COACH_KAI">Coach Kai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-teal-600" />
            Notification History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <Badge className={getCategoryColor(item.category)}>
                          {item.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      {item.message && (
                        <p className="text-sm text-gray-600 mb-2">{item.message}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Sent: {format(new Date(item.sentAt), 'MMM d, h:mm a')}</span>
                        {item.opened && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Opened
                          </span>
                        )}
                        {item.clicked && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <MousePointer className="h-3 w-3" />
                            Clicked
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {item.opened ? (
                        <Eye className="h-5 w-5 text-green-600" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No History Found</h3>
              <p className="text-gray-600">No notifications sent in the selected time range</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.totalPages || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
