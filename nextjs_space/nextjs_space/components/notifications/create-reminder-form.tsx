'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, CheckCircle2, Bell } from 'lucide-react';
import { toast } from 'sonner';

interface CreateReminderFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateReminderForm({ open, onClose, onSuccess }: CreateReminderFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    category: 'GOALS',
    frequency: 'ONCE',
    deliveryMethod: 'IN_APP',
    date: '',
    time: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const scheduledDate = new Date(`${formData.date}T${formData.time}`);

      const res = await fetch('/api/notifications/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formData.category,
          title: formData.title,
          message: formData.message,
          scheduledFor: scheduledDate.toISOString(),
          frequency: formData.frequency,
          deliveryMethod: formData.deliveryMethod,
          customTimes: [formData.time],
        }),
      });

      if (res.ok) {
        toast.success('Reminder created successfully!');
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          title: '',
          message: '',
          category: 'GOALS',
          frequency: 'ONCE',
          deliveryMethod: 'IN_APP',
          date: '',
          time: '',
        });
      } else {
        toast.error('Failed to create reminder');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Bell className="h-6 w-6 text-teal-600" />
            Create Custom Reminder
          </DialogTitle>
          <p className="text-gray-600 text-sm mt-2">
            Set up a personalized reminder for your mindfulness journey
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Morning Meditation Reminder"
              className="border-gray-300"
              required
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-semibold">
              Message
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="Optional message to include in the reminder"
              rows={3}
              className="border-gray-300 resize-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
              <SelectTrigger className="border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GOALS">Goals</SelectItem>
                <SelectItem value="VIDEO_ANALYSIS">Video Analysis</SelectItem>
                <SelectItem value="TOURNAMENTS">Tournaments</SelectItem>
                <SelectItem value="MEDIA">Media</SelectItem>
                <SelectItem value="ACHIEVEMENTS">Achievements</SelectItem>
                <SelectItem value="COACH_KAI">Coach Kai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-semibold">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="border-gray-300"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-semibold">
                Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className="border-gray-300"
                required
              />
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Frequency</Label>
            <Select value={formData.frequency} onValueChange={(value) => handleChange('frequency', value)}>
              <SelectTrigger className="border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ONCE">Once</SelectItem>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="CUSTOM">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Delivery Method */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Delivery Method</Label>
            <Select value={formData.deliveryMethod} onValueChange={(value) => handleChange('deliveryMethod', value)}>
              <SelectTrigger className="border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN_APP">In-App</SelectItem>
                <SelectItem value="EMAIL">Email</SelectItem>
                <SelectItem value="BOTH">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
