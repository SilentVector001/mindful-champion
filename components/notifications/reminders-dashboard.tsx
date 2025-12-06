'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Plus,
  Settings,
  Sparkles,
  Loader2,
  Calendar,
  History,
  Target,
} from 'lucide-react';
import { ReminderCard } from './reminder-card';
import { UpcomingNotifications } from './upcoming-notifications';
import { NotificationHistory } from './notification-history';
import { QuickSetupModal } from './quick-setup-modal';
import { CreateReminderForm } from './create-reminder-form';
import { toast } from 'sonner';
import Link from 'next/link';

interface RemindersDashboardProps {
  userId: string;
}

export function RemindersDashboard({ userId }: RemindersDashboardProps) {
  const [activeTab, setActiveTab] = useState('active');
  const [reminders, setReminders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalActive: 0,
    nextNotification: null as Date | null,
    notificationsThisWeek: 0,
    openRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showQuickSetup, setShowQuickSetup] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchReminders();
    fetchStats();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await fetch('/api/notifications/reminders');
      const data = await res.json();
      setReminders([...data.reminders, ...data.coachKaiReminders]);
    } catch (error) {
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [scheduledRes, historyRes] = await Promise.all([
        fetch('/api/notifications/scheduled?days=7'),
        fetch('/api/notifications/history?dateRange=7'),
      ]);
      
      const scheduled = await scheduledRes.json();
      const history = await historyRes.json();

      setStats({
        totalActive: scheduled.total || 0,
        nextNotification: scheduled.scheduled[0]?.scheduledFor || null,
        notificationsThisWeek: history.analytics?.totalSent || 0,
        openRate: history.analytics?.openRate || 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleReminderUpdate = () => {
    fetchReminders();
    fetchStats();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Reminders & Notifications
            </h1>
            <p className="text-gray-600">Manage your personalized reminders and track notification activity</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Reminder
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-teal-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Reminders</p>
                  <p className="text-3xl font-bold text-teal-600">{stats.totalActive}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-cyan-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Next Notification</p>
                  <p className="text-lg font-bold text-cyan-600">
                    {stats.nextNotification
                      ? new Date(stats.nextNotification).toLocaleString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })
                      : 'None scheduled'}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">This Week</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.notificationsThisWeek}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Open Rate</p>
                  <p className="text-3xl font-bold text-green-600">{stats.openRate}%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => setShowQuickSetup(true)}
                variant="outline"
                className="h-auto py-4 border-teal-300 hover:bg-teal-100"
              >
                <div className="text-left w-full">
                  <Target className="h-5 w-5 text-teal-600 mb-2" />
                  <p className="font-semibold text-teal-900">Set Goal Reminder</p>
                  <p className="text-xs text-gray-600 mt-1">Morning motivation or evening reflection</p>
                </div>
              </Button>

              <Button
                onClick={() => setShowCreateForm(true)}
                variant="outline"
                className="h-auto py-4 border-cyan-300 hover:bg-cyan-100"
              >
                <div className="text-left w-full">
                  <Plus className="h-5 w-5 text-cyan-600 mb-2" />
                  <p className="font-semibold text-cyan-900">Custom Reminder</p>
                  <p className="text-xs text-gray-600 mt-1">Create your own schedule</p>
                </div>
              </Button>

              <Link href="/settings/notifications">
                <Button
                  variant="outline"
                  className="h-auto py-4 w-full border-blue-300 hover:bg-blue-100"
                >
                  <div className="text-left w-full">
                    <Settings className="h-5 w-5 text-blue-600 mb-2" />
                    <p className="font-semibold text-blue-900">Manage Preferences</p>
                    <p className="text-xs text-gray-600 mt-1">Configure notification settings</p>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Active
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {reminders.length > 0 ? (
              reminders.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onUpdate={handleReminderUpdate}
                />
              ))
            ) : (
              <Card className="p-12 text-center">
                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Reminders</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first reminder</p>
                <Button
                  onClick={() => setShowQuickSetup(true)}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Reminder
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            <UpcomingNotifications />
          </TabsContent>

          <TabsContent value="history">
            <NotificationHistory />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Modals */}
      <QuickSetupModal
        open={showQuickSetup}
        onClose={() => setShowQuickSetup(false)}
        onSuccess={handleReminderUpdate}
      />

      <CreateReminderForm
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={handleReminderUpdate}
      />
    </div>
  );
}
