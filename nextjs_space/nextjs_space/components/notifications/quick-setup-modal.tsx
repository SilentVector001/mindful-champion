'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Sun, 
  Moon, 
  Clock,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface QuickSetupModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_REMINDERS = [
  {
    id: 'morning_motivation',
    title: 'Morning Motivation',
    icon: Sun,
    description: 'Start your day with your goals',
    time: '08:00',
    category: 'GOALS',
    message: '🌅 Good morning! Ready to make today count? Review your goals and set your intentions.',
    color: 'from-amber-400 to-orange-500',
  },
  {
    id: 'evening_reflection',
    title: 'Evening Reflection',
    icon: Moon,
    description: 'Reflect on your daily progress',
    time: '20:00',
    category: 'GOALS',
    message: '🌙 Time to reflect! How did today go? Update your progress and plan for tomorrow.',
    color: 'from-indigo-400 to-purple-500',
  },
  {
    id: 'midday_check',
    title: 'Midday Check-in',
    icon: Clock,
    description: 'Quick progress check at noon',
    time: '12:00',
    category: 'GOALS',
    message: '☀️ Midday check-in! Take a moment to review your progress and stay on track.',
    color: 'from-cyan-400 to-teal-500',
  },
];

export function QuickSetupModal({ open, onClose, onSuccess }: QuickSetupModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!selectedPreset) return;

    const preset = PRESET_REMINDERS.find((p) => p.id === selectedPreset);
    if (!preset) return;

    setLoading(true);
    try {
      const now = new Date();
      const [hours, minutes] = preset.time.split(':').map(Number);
      const scheduledDate = new Date(now);
      scheduledDate.setHours(hours, minutes, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (scheduledDate < now) {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      }

      const res = await fetch('/api/notifications/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: preset.category,
          title: preset.title,
          message: preset.message,
          scheduledFor: scheduledDate.toISOString(),
          frequency: 'DAILY',
          deliveryMethod: 'IN_APP',
          customTimes: [preset.time],
        }),
      });

      if (res.ok) {
        toast.success('Reminder created successfully!');
        onSuccess();
        onClose();
      } else {
        toast.error('Failed to create reminder');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-teal-600" />
            Quick Setup - Goal Reminder
          </DialogTitle>
          <p className="text-gray-600 text-sm mt-2">
            Choose a preset reminder to help you stay on track with your goals
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {PRESET_REMINDERS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = selectedPreset === preset.id;

            return (
              <motion.div
                key={preset.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal-500 border-2 shadow-lg'
                      : 'border-gray-200 hover:border-teal-300'
                  }`}
                  onClick={() => setSelectedPreset(preset.id)}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${preset.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{preset.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {preset.time}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{preset.description}</p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg italic">
                          {preset.message}
                        </p>
                      </div>

                      {/* Selection Indicator */}
                      <div className="flex-shrink-0">
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-6 w-6 rounded-full bg-teal-600 flex items-center justify-center"
                          >
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!selectedPreset || loading}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Creating...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Create Reminder
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
