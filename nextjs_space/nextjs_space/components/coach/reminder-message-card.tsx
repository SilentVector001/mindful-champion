/**
 * Reminder Message Card Component
 * Displays reminder confirmation in Coach Kai chat
 */

'use client';

import { motion } from 'framer-motion';
import { Bell, Calendar, Clock, Check, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useState } from 'react';

export interface ReminderData {
  id: string;
  title: string;
  scheduledFor: Date;
  frequency: 'CUSTOM' | 'DAILY' | 'WEEKLY' | 'MULTIPLE';
  category: string;
  status: 'created' | 'updated' | 'deleted';
}

interface ReminderMessageCardProps {
  reminder: ReminderData;
  onEdit?: (reminderId: string) => void;
  onDelete?: (reminderId: string) => void;
}

const categoryColors: Record<string, string> = {
  GOALS: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  VIDEO_ANALYSIS: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  TOURNAMENTS: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  MENTAL_TRAINING: 'bg-green-500/10 text-green-600 border-green-500/20',
  TRAINING_REMINDER: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  MATCH_REMINDER: 'bg-red-500/10 text-red-600 border-red-500/20',
  GENERAL: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

const categoryEmojis: Record<string, string> = {
  GOALS: '🎯',
  VIDEO_ANALYSIS: '📹',
  TOURNAMENTS: '🏆',
  MENTAL_TRAINING: '🧠',
  TRAINING_REMINDER: '🏋️',
  MATCH_REMINDER: '🏓',
  GENERAL: '🔔',
};

const frequencyLabels: Record<string, string> = {
  CUSTOM: 'One-time',
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MULTIPLE: 'Multiple times',
};

export default function ReminderMessageCard({
  reminder,
  onEdit,
  onDelete,
}: ReminderMessageCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(reminder.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const reminderDate = new Date(date);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (reminderDate.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (reminderDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      const daysDiff = Math.ceil((reminderDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 7) {
        return reminderDate.toLocaleDateString('en-US', { weekday: 'long' });
      } else {
        return reminderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
  };

  const formatTime = (date: Date) => {
    const reminderDate = new Date(date);
    return reminderDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const categoryClass = categoryColors[reminder.category] || categoryColors.GENERAL;
  const categoryEmoji = categoryEmojis[reminder.category] || categoryEmojis.GENERAL;
  const frequencyLabel = frequencyLabels[reminder.frequency] || 'One-time';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full"
    >
      <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
        {/* Status indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500" />

        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Bell className="w-5 h-5" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={categoryClass}>
                    <span className="mr-1">{categoryEmoji}</span>
                    {reminder.category.replace(/_/g, ' ')}
                  </Badge>
                  
                  {reminder.status === 'created' && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                      <Check className="w-3 h-3 mr-1" />
                      Created
                    </Badge>
                  )}
                  
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                    {frequencyLabel}
                  </Badge>
                </div>

                <h4 className="font-semibold text-foreground leading-tight">
                  {reminder.title}
                </h4>
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground pl-11">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(reminder.scheduledFor)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatTime(reminder.scheduledFor)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pl-11">
            <Link href="/settings/notifications">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                View in Settings
              </Button>
            </Link>

            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(reminder.id)}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/**
 * Compact version for inline display in chat
 */
export function ReminderMessageInline({
  reminder,
}: {
  reminder: ReminderData;
}) {
  const categoryEmoji = categoryEmojis[reminder.category] || categoryEmojis.GENERAL;
  
  const formatDateTime = (date: Date) => {
    const reminderDate = new Date(date);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (reminderDate.toDateString() === now.toDateString()) {
      return `today at ${reminderDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else if (reminderDate.toDateString() === tomorrow.toDateString()) {
      return `tomorrow at ${reminderDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else {
      return reminderDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20"
    >
      <Bell className="w-4 h-4 text-primary" />
      <span className="text-sm">
        <span className="mr-1">{categoryEmoji}</span>
        <span className="font-medium">{reminder.title}</span>
        <span className="text-muted-foreground ml-1">· {formatDateTime(reminder.scheduledFor)}</span>
      </span>
    </motion.div>
  );
}
