'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Bell, TrendingUp } from 'lucide-react';
import { format, startOfDay, isToday, isTomorrow } from 'date-fns';
import { toast } from 'sonner';

export function UpcomingNotifications() {
  const [scheduled, setScheduled] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheduled();
    const interval = setInterval(fetchScheduled, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchScheduled = async () => {
    try {
      const res = await fetch('/api/notifications/scheduled?days=7');
      const data = await res.json();
      setScheduled(data.groupedByDate || {});
    } catch (error) {
      toast.error('Failed to load upcoming notifications');
    } finally {
      setLoading(false);
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMM d');
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const dates = Object.keys(scheduled).sort();

  if (dates.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Upcoming Notifications</h3>
        <p className="text-gray-600">You don't have any notifications scheduled for the next 7 days</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            Next 7 Days Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-sm">
            Showing {Object.values(scheduled).flat().length} upcoming notifications
          </p>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-6">
        {dates.map((dateStr, dateIndex) => {
          const notifications = scheduled[dateStr];
          return (
            <motion.div
              key={dateStr}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: dateIndex * 0.1 }}
            >
              <Card className="overflow-hidden">
                {/* Date Header */}
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4">
                  <div className="flex items-center gap-3 text-white">
                    <Calendar className="h-5 w-5" />
                    <div>
                      <h3 className="font-semibold text-lg">{getDateLabel(dateStr)}</h3>
                      <p className="text-sm text-teal-100">
                        {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    {notifications.map((notification: any, idx: number) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all"
                      >
                        {/* Time Badge */}
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-teal-600" />
                          </div>
                          <p className="text-xs text-center mt-1 font-medium text-teal-700">
                            {format(new Date(notification.scheduledFor), 'h:mm a')}
                          </p>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                            <Badge className={getCategoryColor(notification.category)}>
                              {notification.category.replace('_', ' ')}
                            </Badge>
                          </div>
                          {notification.message && (
                            <p className="text-sm text-gray-600">{notification.message}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.deliveryMethod}
                            </Badge>
                            {notification.source && (
                              <Badge variant="outline" className="text-xs">
                                {notification.source}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Icon */}
                        <div className="flex-shrink-0">
                          <Bell className="h-5 w-5 text-gray-400" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
