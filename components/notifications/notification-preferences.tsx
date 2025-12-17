'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { Bell, Check, X, Loader2, Save, RotateCcw } from 'lucide-react';
import CategoryPreference from './category-preferences';
import { toast } from 'sonner';

const CATEGORIES = [
  {
    id: 'GOALS',
    name: 'Goals & Training',
    description: 'Progress updates, milestones, training reminders',
    icon: '🎯',
    gradient: 'bg-gradient-to-r from-green-500 to-emerald-600'
  },
  {
    id: 'VIDEO_ANALYSIS',
    name: 'Video Analysis',
    description: 'Analysis complete, insights ready, improvement suggestions',
    icon: '🎥',
    gradient: 'bg-gradient-to-r from-purple-500 to-indigo-600'
  },
  {
    id: 'TOURNAMENTS',
    name: 'Tournament Hub',
    description: 'Live matches, tournament updates, bracket changes',
    icon: '🏆',
    gradient: 'bg-gradient-to-r from-amber-500 to-orange-600'
  },
  {
    id: 'MEDIA',
    name: 'Media Center',
    description: 'New content, live streams, podcast episodes',
    icon: '📺',
    gradient: 'bg-gradient-to-r from-blue-500 to-cyan-600'
  },
  {
    id: 'ACCOUNT',
    name: 'Account & Subscription',
    description: 'Billing, trial status, account updates',
    icon: '💳',
    gradient: 'bg-gradient-to-r from-pink-500 to-rose-600'
  },
  {
    id: 'ACHIEVEMENTS',
    name: 'Achievements',
    description: 'New badges, tier unlocks, milestones reached',
    icon: '🏅',
    gradient: 'bg-gradient-to-r from-yellow-500 to-amber-600'
  },
  {
    id: 'COACH_KAI',
    name: 'Coach Kai Reminders',
    description: 'Training tips, practice reminders, coaching insights',
    icon: '🤖',
    gradient: 'bg-gradient-to-r from-teal-500 to-cyan-600'
  }
];

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/notifications/preferences');
      
      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }

      const data = await response.json();
      setPreferences(data.preferences || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
      toast.error('Failed to load notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (category: string, newPreferences: any) => {
    setPreferences(prev => {
      const updated = prev.map(pref => 
        pref.category === category ? { ...pref, ...newPreferences } : pref
      );
      setHasChanges(true);
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ preferences })
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      setHasChanges(false);
      setSuccessMessage('Notification preferences saved successfully!');
      toast.success('Preferences saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    fetchPreferences();
    setHasChanges(false);
    toast.info('Changes discarded');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 shadow-lg">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
            <p className="text-gray-600 text-sm">
              Customize when and how you receive notifications
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Categories */}
      <div className="space-y-4">
        {CATEGORIES.map(category => {
          const categoryPrefs = preferences.find(p => p.category === category.id);
          
          if (!categoryPrefs) return null;

          return (
            <CategoryPreference
              key={category.id}
              category={category}
              preferences={categoryPrefs}
              onChange={(newPrefs) => handlePreferenceChange(category.id, newPrefs)}
            />
          );
        })}
      </div>

      {/* Action Buttons */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {hasChanges ? (
              <span className="text-amber-600 font-medium">
                You have unsaved changes
              </span>
            ) : (
              <span className="text-green-600 font-medium">
                All changes saved
              </span>
            )}
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={!hasChanges || isSaving}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
