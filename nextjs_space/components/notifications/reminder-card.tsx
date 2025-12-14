'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Bell,
  Clock,
  Edit2,
  Trash2,
  User,
  Bot,
  Shield,
  Calendar,
  PlayCircle,
  PauseCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { EditReminderModal } from './edit-reminder-modal';

interface ReminderCardProps {
  reminder: any;
  onUpdate: () => void;
}

export function ReminderCard({ reminder, onUpdate }: ReminderCardProps) {
  const [isActive, setIsActive] = useState(reminder.status === 'PENDING' || reminder.isActive);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const source = reminder.source || 'USER';
  const category = reminder.category || 'GOALS';
  
  // Determine next trigger time
  const nextTrigger = reminder.scheduledFor || reminder.nextTriggerAt;
  const nextTriggerText = nextTrigger
    ? formatDistanceToNow(new Date(nextTrigger), { addSuffix: true })
    : 'Not scheduled';

  // Get source badge
  const getSourceBadge = () => {
    switch (source) {
      case 'USER':
        return (
          <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700">
            <User className="h-3 w-3 mr-1" />
            User Created
          </Badge>
        );
      case 'COACH_KAI':
        return (
          <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-700">
            <Bot className="h-3 w-3 mr-1" />
            Coach Kai
          </Badge>
        );
      case 'SYSTEM':
        return (
          <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-700">
            <Shield className="h-3 w-3 mr-1" />
            System
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get category icon
  const getCategoryIcon = () => {
    const iconProps = { className: "h-5 w-5" };
    switch (category) {
      case 'GOALS':
        return <Calendar {...iconProps} className="h-5 w-5 text-teal-600" />;
      case 'VIDEO_ANALYSIS':
        return <PlayCircle {...iconProps} className="h-5 w-5 text-cyan-600" />;
      default:
        return <Bell {...iconProps} className="h-5 w-5 text-blue-600" />;
    }
  };

  const handleToggle = async () => {
    setLoading(true);
    try {
      const newStatus = !isActive;
      const res = await fetch('/api/notifications/reminders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reminder.id,
          status: newStatus ? 'PENDING' : 'CANCELLED',
          isActive: newStatus,
        }),
      });

      if (res.ok) {
        setIsActive(newStatus);
        toast.success(newStatus ? 'Reminder enabled' : 'Reminder paused');
        onUpdate();
      } else {
        toast.error('Failed to update reminder');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/notifications/reminders?id=${reminder.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Reminder deleted');
        onUpdate();
      } else {
        toast.error('Failed to delete reminder');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <Card className={`shadow-md hover:shadow-lg transition-all ${
          isActive ? 'border-teal-200' : 'border-gray-200 opacity-60'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              {/* Left: Icon & Content */}
              <div className="flex gap-4 flex-1">
                <div className="flex-shrink-0">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-teal-100' : 'bg-gray-100'
                  }`}>
                    {getCategoryIcon()}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Title & Source */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {reminder.title || reminder.message || 'Reminder'}
                    </h3>
                    {getSourceBadge()}
                  </div>

                  {/* Message */}
                  {reminder.message && reminder.title && (
                    <p className="text-gray-600 text-sm mb-3">{reminder.message}</p>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{nextTriggerText}</span>
                    </div>
                    {reminder.data?.frequency && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span className="capitalize">{reminder.data.frequency}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="mt-3">
                    {isActive ? (
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-700 border-gray-300">
                        Paused
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Enabled</span>
                  <Switch
                    checked={isActive}
                    onCheckedChange={handleToggle}
                    disabled={loading}
                  />
                </div>

                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowEdit(true)}
                    disabled={loading}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDelete}
                    disabled={loading}
                    className="text-red-600 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <EditReminderModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        reminder={reminder}
        onSuccess={() => {
          setShowEdit(false);
          onUpdate();
        }}
      />
    </>
  );
}
