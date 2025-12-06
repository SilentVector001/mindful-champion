
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import SubscriptionStatus from '@/components/subscription/subscription-status';
import { 
  Settings, 
  User, 
  Trophy,
  Target, 
  AlertTriangle, 
  Brain, 
  Calendar, 
  Bell,
  ArrowLeft,
  Save,
  MapPin,
  Sparkles,
  Crown,
  ChevronRight
} from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PRO';
  ageRange: string | null;
  gender: string | null;
  location: string | null;
  playingFrequency: string | null;
  primaryGoals: any;
  biggestChallenges: any;
  coachingStylePreference: string | null;
  preferredDays: any;
  preferredTime: string | null;
  notificationPreferences: any;
  onboardingCompleted: boolean;
  onboardingCompletedAt: Date | null;
  subscriptionTier: string;
  isTrialActive: boolean;
  trialEndDate: Date | null;
}

interface OnboardingData {
  ageRange: string;
  gender: string;
  location: string;
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PRO';
  playingFrequency: string;
  primaryGoals: string[];
  biggestChallenges: string[];
  coachingStylePreference: string;
  preferredDays: string[];
  preferredTime: string;
  notificationPreferences: string[];
}

const primaryGoalsOptions = [
  'Improve shot accuracy',
  'Build consistency', 
  'Master strategy',
  'Increase speed',
  'Develop mental toughness',
  'Win more matches',
  'Find playing partners',
  'Learn fundamentals',
  'Recover from injury',
  'Just have fun'
];

const biggestChallengesOptions = [
  'Serve consistency',
  'Third shot drop',
  'Dinking control',
  'Reaction time',
  'Court positioning',
  'Pressure/nerves',
  'Mental focus',
  'Injury concerns',
  'Limited practice time',
  'Shot placement'
];

const notificationOptions = [
  'Daily tips',
  'Training reminders',
  'Match insights',
  'Community updates'
];

export default function SettingsPage({ user }: { user: User }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    ageRange: user.ageRange || '',
    gender: user.gender || '',
    location: user.location || '',
    skillLevel: user.skillLevel,
    playingFrequency: user.playingFrequency || '',
    primaryGoals: Array.isArray(user.primaryGoals) ? user.primaryGoals : [],
    biggestChallenges: Array.isArray(user.biggestChallenges) ? user.biggestChallenges : [],
    coachingStylePreference: user.coachingStylePreference || '',
    preferredDays: Array.isArray(user.preferredDays) ? user.preferredDays : [],
    preferredTime: user.preferredTime || '',
    notificationPreferences: Array.isArray(user.notificationPreferences) ? user.notificationPreferences : [],
  });

  const updateFormData = (updates: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const toggleArrayItem = (array: string[], item: string, maxItems = 10) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    } else if (array.length < maxItems) {
      return [...array, item];
    }
    return array;
  };

  const handleUpdateOnboarding = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/onboarding', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Age Range</Label>
                    <Select value={formData.ageRange} onValueChange={(value) => updateFormData({ ageRange: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select age range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="18-24">18-24</SelectItem>
                        <SelectItem value="25-34">25-34</SelectItem>
                        <SelectItem value="35-44">35-44</SelectItem>
                        <SelectItem value="45-54">45-54</SelectItem>
                        <SelectItem value="55-64">55-64</SelectItem>
                        <SelectItem value="65+">65+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => updateFormData({ gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input 
                        value={formData.location}
                        onChange={(e) => updateFormData({ location: e.target.value })}
                        placeholder="e.g., Miami, FL"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Skill Level</Label>
                    <Select value={formData.skillLevel} onValueChange={(value) => updateFormData({ skillLevel: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Beginner (0-2.5)</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate (3.0-3.5)</SelectItem>
                        <SelectItem value="ADVANCED">Advanced (4.0-4.5)</SelectItem>
                        <SelectItem value="PRO">Pro (5.0+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Playing Frequency</Label>
                    <Select value={formData.playingFrequency} onValueChange={(value) => updateFormData({ playingFrequency: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2x/week">1-2 times per week</SelectItem>
                        <SelectItem value="3-4x/week">3-4 times per week</SelectItem>
                        <SelectItem value="5+x/week">5+ times per week</SelectItem>
                        <SelectItem value="getting-started">Just getting started</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Goals & Challenges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Primary Goals</Label>
                  <p className="text-sm text-gray-600 mb-3">Select the goals you want to focus on</p>
                  <div className="grid grid-cols-2 gap-2">
                    {primaryGoalsOptions.map((goal) => (
                      <div 
                        key={goal}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          formData.primaryGoals.includes(goal)
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateFormData({ 
                          primaryGoals: toggleArrayItem(formData.primaryGoals, goal, 10) 
                        })}
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            checked={formData.primaryGoals.includes(goal)}
                            onChange={() => {}}
                            className="pointer-events-none"
                          />
                          <span className="text-sm font-medium">{goal}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-medium">Biggest Challenges</Label>
                  <p className="text-sm text-gray-600 mb-3">Areas where you need the most improvement</p>
                  <div className="grid grid-cols-2 gap-2">
                    {biggestChallengesOptions.map((challenge) => (
                      <div 
                        key={challenge}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          formData.biggestChallenges.includes(challenge)
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateFormData({ 
                          biggestChallenges: toggleArrayItem(formData.biggestChallenges, challenge, 10) 
                        })}
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            checked={formData.biggestChallenges.includes(challenge)}
                            onChange={() => {}}
                            className="pointer-events-none"
                          />
                          <span className="text-sm font-medium">{challenge}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            {/* Pro Avatar Feature Card */}
            {user.subscriptionTier === 'PRO' && (
              <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-yellow-600" />
                      <span>AI Coach Avatar</span>
                      <Badge className="ml-2 bg-yellow-600">PRO</Badge>
                    </div>
                    <Crown className="w-6 h-6 text-yellow-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">Customize Your AI Coach</p>
                      <p className="text-sm text-gray-600">
                        Choose from professional coaches or upload your own photo
                      </p>
                    </div>
                    <Button 
                      onClick={() => router.push('/settings/avatar')}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      Setup Avatar
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Coaching Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Coaching Style Preference</Label>
                  <Select value={formData.coachingStylePreference} onValueChange={(value) => updateFormData({ coachingStylePreference: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select coaching style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MOTIVATIONAL">Motivational - Encouraging, positive reinforcement</SelectItem>
                      <SelectItem value="ANALYTICAL">Analytical - Data-driven, technical insights</SelectItem>
                      <SelectItem value="DIRECT">Direct - Straightforward, clear feedback</SelectItem>
                      <SelectItem value="SUPPORTIVE">Supportive - Patient, understanding approach</SelectItem>
                      <SelectItem value="BALANCED">Balanced - Mix of all approaches</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Preferred Training Days</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <Badge
                        key={day}
                        variant={formData.preferredDays.includes(day) ? "default" : "outline"}
                        className="cursor-pointer px-3 py-1"
                        onClick={() => updateFormData({ 
                          preferredDays: toggleArrayItem(formData.preferredDays, day, 7) 
                        })}
                      >
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Time</Label>
                  <Select value={formData.preferredTime} onValueChange={(value) => updateFormData({ preferredTime: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preferred time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (6AM - 12PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12PM - 6PM)</SelectItem>
                      <SelectItem value="evening">Evening (6PM - 10PM)</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label className="text-base font-medium">What would you like to be notified about?</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {notificationOptions.map((option) => (
                      <div 
                        key={option}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          formData.notificationPreferences.includes(option)
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateFormData({ 
                          notificationPreferences: toggleArrayItem(formData.notificationPreferences, option, 4) 
                        })}
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            checked={formData.notificationPreferences.includes(option)}
                            onChange={() => {}}
                            className="pointer-events-none"
                          />
                          <span className="text-sm font-medium">{option}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <SubscriptionStatus />
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleUpdateOnboarding}
            disabled={isUpdating}
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
            <Save className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
