'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TimePicker from './time-picker';

interface CategoryPreferenceProps {
  category: {
    id: string;
    name: string;
    description: string;
    icon: string;
    gradient: string;
  };
  preferences: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    inAppEnabled: boolean;
    frequency: string;
    customTimes: string[];
    timezone: string;
  };
  onChange: (preferences: any) => void;
}

const FREQUENCIES = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'MULTIPLE', label: 'Multiple times daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'CUSTOM', label: 'Custom times' }
];

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' }
];

export default function CategoryPreference({ category, preferences, onChange }: CategoryPreferenceProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEnabled, setIsEnabled] = useState(
    preferences.emailEnabled || preferences.pushEnabled || preferences.inAppEnabled
  );

  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    if (!checked) {
      onChange({
        ...preferences,
        emailEnabled: false,
        pushEnabled: false,
        inAppEnabled: false
      });
    }
  };

  const handleDeliveryChange = (method: 'emailEnabled' | 'pushEnabled' | 'inAppEnabled', checked: boolean) => {
    onChange({ ...preferences, [method]: checked });
  };

  const handleFrequencyChange = (frequency: string) => {
    onChange({ ...preferences, frequency });
  };

  const handleTimezoneChange = (timezone: string) => {
    onChange({ ...preferences, timezone });
  };

  const handleCustomTimesChange = (customTimes: string[]) => {
    onChange({ ...preferences, customTimes });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <CardHeader
          className={`cursor-pointer transition-all ${category.gradient} text-white`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{category.icon}</span>
              <div>
                <CardTitle className="text-white">{category.name}</CardTitle>
                <CardDescription className="text-white/80 text-sm">
                  {category.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggle}
                onClick={(e) => e.stopPropagation()}
                className="data-[state=checked]:bg-white data-[state=checked]:border-white"
              />
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="pt-6 space-y-6">
                {/* Delivery Methods */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">
                    Delivery Methods
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${category.id}-email`}
                        checked={preferences.emailEnabled}
                        onCheckedChange={(checked) => handleDeliveryChange('emailEnabled', checked as boolean)}
                        disabled={!isEnabled}
                      />
                      <label
                        htmlFor={`${category.id}-email`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        📧 Email Notifications
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${category.id}-push`}
                        checked={preferences.pushEnabled}
                        onCheckedChange={(checked) => handleDeliveryChange('pushEnabled', checked as boolean)}
                        disabled={!isEnabled}
                      />
                      <label
                        htmlFor={`${category.id}-push`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        📱 Push Notifications
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${category.id}-inapp`}
                        checked={preferences.inAppEnabled}
                        onCheckedChange={(checked) => handleDeliveryChange('inAppEnabled', checked as boolean)}
                        disabled={!isEnabled}
                      />
                      <label
                        htmlFor={`${category.id}-inapp`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        🔔 In-App Notifications
                      </label>
                    </div>
                  </div>
                </div>

                {/* Frequency */}
                <div className="space-y-2">
                  <Label htmlFor={`${category.id}-frequency`} className="text-sm font-semibold text-gray-700">
                    Notification Frequency
                  </Label>
                  <Select
                    value={preferences.frequency}
                    onValueChange={handleFrequencyChange}
                    disabled={!isEnabled}
                  >
                    <SelectTrigger id={`${category.id}-frequency`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map(freq => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Times */}
                {preferences.frequency === 'CUSTOM' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Custom Notification Times
                    </Label>
                    <TimePicker
                      times={preferences.customTimes || []}
                      onChange={handleCustomTimesChange}
                    />
                  </div>
                )}

                {/* Timezone */}
                <div className="space-y-2">
                  <Label htmlFor={`${category.id}-timezone`} className="text-sm font-semibold text-gray-700">
                    Timezone
                  </Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={handleTimezoneChange}
                    disabled={!isEnabled}
                  >
                    <SelectTrigger id={`${category.id}-timezone`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map(tz => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
