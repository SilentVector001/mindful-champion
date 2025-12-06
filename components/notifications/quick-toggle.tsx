'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, Settings } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface QuickToggleProps {
  category: 'GOALS' | 'VIDEO_ANALYSIS' | 'TOURNAMENTS' | 'MEDIA' | 'ACCOUNT' | 'ACHIEVEMENTS' | 'COACH_KAI';
  title: string;
  description: string;
}

export default function QuickToggle({ category, title, description }: QuickToggleProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPreference();
  }, [category]);

  const fetchPreference = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        const categoryPref = data.preferences?.find((p: any) => p.category === category);
        if (categoryPref) {
          setIsEnabled(
            categoryPref.emailEnabled || 
            categoryPref.pushEnabled || 
            categoryPref.inAppEnabled
          );
        }
      }
    } catch (error) {
      console.error('Failed to fetch notification preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    try {
      setIsEnabled(checked);
      
      // Fetch all preferences first
      const getResponse = await fetch('/api/notifications/preferences');
      const data = await getResponse.json();
      
      // Update the specific category
      const updatedPreferences = data.preferences.map((pref: any) => {
        if (pref.category === category) {
          return {
            ...pref,
            emailEnabled: checked,
            pushEnabled: checked,
            inAppEnabled: checked
          };
        }
        return pref;
      });

      // Save the updated preferences
      const putResponse = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: updatedPreferences })
      });

      if (putResponse.ok) {
        toast.success(`${title} notifications ${checked ? 'enabled' : 'disabled'}`);
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      // Revert on error
      setIsEnabled(!checked);
      toast.error('Failed to update notification settings');
    }
  };

  if (isLoading) return null;

  return (
    <Card className="p-4 border-2 border-dashed border-gray-300 bg-gray-50/50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 rounded-lg bg-teal-100">
            <Bell className="h-4 w-4 text-teal-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-gray-900">{title}</h4>
            <p className="text-xs text-gray-600 mt-1">{description}</p>
            <Link href="/settings/notifications">
              <Button variant="link" className="h-auto p-0 text-xs text-teal-600 mt-2">
                <Settings className="h-3 w-3 mr-1" />
                Customize preferences
              </Button>
            </Link>
          </div>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-teal-600"
        />
      </div>
    </Card>
  );
}
