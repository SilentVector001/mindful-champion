
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  User, 
  Trophy, 
  Calendar, 
  Target, 
  AlertTriangle, 
  Brain, 
  Settings, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Zap,
  Users,
  BarChart3,
  Clock,
  Heart,
  Award,
  MapPin,
  Activity
} from 'lucide-react';

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

const skillLevelOptions = [
  { 
    value: 'BEGINNER', 
    label: 'Beginner', 
    rating: '0-2.5', 
    description: 'New to pickleball, learning basics',
    icon: Activity
  },
  { 
    value: 'INTERMEDIATE', 
    label: 'Intermediate', 
    rating: '3.0-3.5', 
    description: 'Comfortable with fundamentals',
    icon: BarChart3
  },
  { 
    value: 'ADVANCED', 
    label: 'Advanced', 
    rating: '4.0-4.5', 
    description: 'Strong player, consistent execution',
    icon: Trophy
  },
  { 
    value: 'PRO', 
    label: 'Pro', 
    rating: '5.0+', 
    description: 'Tournament level, expert skills',
    icon: Award
  },
];

const coachingStyles = [
  { 
    value: 'MOTIVATIONAL', 
    label: 'Motivational', 
    description: 'Encouraging, positive reinforcement',
    icon: Heart,
    color: 'bg-pink-100 hover:bg-pink-200 border-pink-300'
  },
  { 
    value: 'ANALYTICAL', 
    label: 'Analytical', 
    description: 'Data-driven, technical insights',
    icon: BarChart3,
    color: 'bg-blue-100 hover:bg-blue-200 border-blue-300'
  },
  { 
    value: 'DIRECT', 
    label: 'Direct', 
    description: 'Straightforward, clear feedback',
    icon: Zap,
    color: 'bg-orange-100 hover:bg-orange-200 border-orange-300'
  },
  { 
    value: 'SUPPORTIVE', 
    label: 'Supportive', 
    description: 'Patient, understanding approach',
    icon: Users,
    color: 'bg-green-100 hover:bg-green-200 border-green-300'
  },
  { 
    value: 'BALANCED', 
    label: 'Balanced', 
    description: 'Mix of all approaches',
    icon: Target,
    color: 'bg-purple-100 hover:bg-purple-200 border-purple-300'
  },
];

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

export default function OnboardingWizard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    ageRange: '',
    gender: '',
    location: '',
    skillLevel: 'BEGINNER',
    playingFrequency: '',
    primaryGoals: [],
    biggestChallenges: [],
    coachingStylePreference: '',
    preferredDays: [],
    preferredTime: '',
    notificationPreferences: [],
  });

  const totalSteps = 9; // Welcome + 7 steps + Summary
  const progress = ((currentStep) / (totalSteps - 1)) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        console.error('Failed to save onboarding data');
      }
    } catch (error) {
      console.error('Error submitting onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (updates: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const toggleArrayItem = (array: string[], item: string, maxItems = 3) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    } else if (array.length < maxItems) {
      return [...array, item];
    }
    return array;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mx-auto flex items-center justify-center"
            >
              <Rocket className="w-12 h-12 text-white" />
            </motion.div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome to Mindful Champion!
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Let's personalize your pickleball coaching experience in just 2 minutes. 
                This will help us create the perfect training plan just for you.
              </p>
            </div>
            <Button 
              onClick={handleNext} 
              size="lg" 
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              Let's Go! <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        );

      case 1: // About You
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <User className="w-8 h-8 text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-bold">Tell us about yourself</h2>
              <p className="text-gray-600">Help us understand who you are</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="age">Age Range</Label>
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
                <Label htmlFor="gender">Gender</Label>
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
                <Label htmlFor="location">Location (City, State)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    id="location"
                    value={formData.location}
                    onChange={(e) => updateFormData({ location: e.target.value })}
                    placeholder="e.g., Miami, FL"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2: // Experience Level
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <Trophy className="w-8 h-8 text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-bold">What's your skill level?</h2>
              <p className="text-gray-600">This helps us customize your training</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillLevelOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card 
                    key={option.value}
                    className={`cursor-pointer transition-all ${
                      formData.skillLevel === option.value 
                        ? 'ring-2 ring-emerald-500 bg-emerald-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => updateFormData({ skillLevel: option.value as any })}
                  >
                    <CardContent className="p-6 text-center space-y-3">
                      <Icon className="w-8 h-8 text-emerald-500 mx-auto" />
                      <div>
                        <h3 className="font-semibold text-lg">{option.label}</h3>
                        <p className="text-sm font-medium text-emerald-600">{option.rating}</p>
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        );

      case 3: // Playing Frequency
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <Calendar className="w-8 h-8 text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-bold">How often do you play?</h2>
              <p className="text-gray-600">This helps us pace your training</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { value: '1-2x/week', label: '1-2 times per week', icon: Clock },
                { value: '3-4x/week', label: '3-4 times per week', icon: Calendar },
                { value: '5+x/week', label: '5+ times per week', icon: Activity },
                { value: 'getting-started', label: 'Just getting started', icon: Rocket },
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <Card 
                    key={option.value}
                    className={`cursor-pointer transition-all ${
                      formData.playingFrequency === option.value 
                        ? 'ring-2 ring-emerald-500 bg-emerald-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => updateFormData({ playingFrequency: option.value })}
                  >
                    <CardContent className="p-6 text-center space-y-3">
                      <Icon className="w-8 h-8 text-emerald-500 mx-auto" />
                      <p className="font-medium">{option.label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        );

      case 4: // Primary Goals
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <Target className="w-8 h-8 text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-bold">What are your primary goals?</h2>
              <p className="text-gray-600">Select up to 3 things you want to improve</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {primaryGoalsOptions.map((goal) => (
                <div 
                  key={goal}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.primaryGoals.includes(goal)
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateFormData({ 
                    primaryGoals: toggleArrayItem(formData.primaryGoals, goal, 3) 
                  })}
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={formData.primaryGoals.includes(goal)}
                      onChange={() => {}}
                      className="pointer-events-none"
                    />
                    <span className="font-medium">{goal}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Selected: {formData.primaryGoals.length}/3
              </p>
            </div>
          </motion.div>
        );

      case 5: // Biggest Challenges
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <AlertTriangle className="w-8 h-8 text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-bold">What are your biggest challenges?</h2>
              <p className="text-gray-600">Select up to 3 areas where you need the most help</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {biggestChallengesOptions.map((challenge) => (
                <div 
                  key={challenge}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.biggestChallenges.includes(challenge)
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateFormData({ 
                    biggestChallenges: toggleArrayItem(formData.biggestChallenges, challenge, 3) 
                  })}
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={formData.biggestChallenges.includes(challenge)}
                      onChange={() => {}}
                      className="pointer-events-none"
                    />
                    <span className="font-medium">{challenge}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Selected: {formData.biggestChallenges.length}/3
              </p>
            </div>
          </motion.div>
        );

      case 6: // Coaching Style
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <Brain className="w-8 h-8 text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-bold">What coaching style works best for you?</h2>
              <p className="text-gray-600">Help us match your learning preferences</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coachingStyles.map((style) => {
                const Icon = style.icon;
                return (
                  <Card 
                    key={style.value}
                    className={`cursor-pointer transition-all ${style.color} ${
                      formData.coachingStylePreference === style.value 
                        ? 'ring-2 ring-emerald-500 scale-105' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => updateFormData({ coachingStylePreference: style.value })}
                  >
                    <CardContent className="p-6 text-center space-y-3">
                      <Icon className="w-8 h-8 text-emerald-600 mx-auto" />
                      <div>
                        <h3 className="font-semibold text-lg">{style.label}</h3>
                        <p className="text-sm text-gray-600 mt-1">{style.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        );

      case 7: // Availability
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <Settings className="w-8 h-8 text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-bold">When do you prefer to train?</h2>
              <p className="text-gray-600">Set your availability and preferences</p>
            </div>
            
            <div className="space-y-6">
              {/* Preferred Days */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Preferred Training Days</Label>
                <div className="flex flex-wrap gap-2">
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

              {/* Preferred Time */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Preferred Time</Label>
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

              {/* Notification Preferences */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Notification Preferences</Label>
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
            </div>
          </motion.div>
        );

      case 8: // Summary
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mx-auto flex items-center justify-center"
              >
                <CheckCircle className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold">You're all set!</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Perfect! Here's your personalized profile. We'll use this to create the best coaching experience for you.
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-emerald-600">Skill Level:</strong> {formData.skillLevel.toLowerCase()}
                    </div>
                    <div>
                      <strong className="text-emerald-600">Playing Frequency:</strong> {formData.playingFrequency}
                    </div>
                    <div>
                      <strong className="text-emerald-600">Coaching Style:</strong> {formData.coachingStylePreference}
                    </div>
                    <div>
                      <strong className="text-emerald-600">Preferred Time:</strong> {formData.preferredTime}
                    </div>
                  </div>

                  <div>
                    <strong className="text-emerald-600">Primary Goals:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.primaryGoals.map((goal) => (
                        <Badge key={goal} variant="secondary" className="text-xs">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <strong className="text-emerald-600">Focus Areas:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.biggestChallenges.map((challenge) => (
                        <Badge key={challenge} variant="outline" className="text-xs">
                          {challenge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                size="lg" 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                {isSubmitting ? 'Setting up your dashboard...' : 'Enter Your Champion Dashboard'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true; // Welcome screen
      case 1: return formData.ageRange && formData.gender;
      case 2: return formData.skillLevel;
      case 3: return formData.playingFrequency;
      case 4: return formData.primaryGoals.length > 0;
      case 5: return formData.biggestChallenges.length > 0;
      case 6: return formData.coachingStylePreference;
      case 7: return formData.preferredTime;
      case 8: return true; // Summary screen
      default: return false;
    }
  };

  // Wait for session to load
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        {currentStep > 0 && currentStep < totalSteps - 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500">
                Step {currentStep} of {totalSteps - 2}
              </span>
              <span className="text-sm font-medium text-emerald-600">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </motion.div>
        )}

        {/* Main Content */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStep > 0 && currentStep < totalSteps - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mt-6"
          >
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back
            </Button>

            <div className="flex space-x-3">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700"
              >
                Skip for now
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                Next
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
