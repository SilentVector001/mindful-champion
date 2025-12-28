'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  User, 
  Trophy, 
  Target, 
  Brain, 
  CheckCircle,
  ArrowRight,
  Activity,
  BarChart3,
  Award,
  MapPin,
  Heart,
  Zap,
  Clock,
  Loader2,
  Play
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PremiumIntroVideo from '@/components/intro/premium-intro-video';

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
  { value: 'BEGINNER', label: 'Beginner', rating: '0-2.5', icon: Activity, gradient: 'from-green-500 to-emerald-500' },
  { value: 'INTERMEDIATE', label: 'Intermediate', rating: '3.0-3.5', icon: BarChart3, gradient: 'from-blue-500 to-cyan-500' },
  { value: 'ADVANCED', label: 'Advanced', rating: '4.0-4.5', icon: Trophy, gradient: 'from-purple-500 to-pink-500' },
  { value: 'PRO', label: 'Pro', rating: '5.0+', icon: Award, gradient: 'from-orange-500 to-red-500' },
];

const coachingStyles = [
  { value: 'MOTIVATIONAL', label: 'Motivational', description: 'Encouraging & positive', icon: Heart, color: 'from-pink-500 to-rose-500' },
  { value: 'ANALYTICAL', label: 'Analytical', description: 'Data-driven & technical', icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
  { value: 'DIRECT', label: 'Direct', description: 'Straightforward & clear', icon: Zap, color: 'from-orange-500 to-amber-500' },
  { value: 'SUPPORTIVE', label: 'Supportive', description: 'Patient & understanding', icon: Heart, color: 'from-green-500 to-emerald-500' },
  { value: 'BALANCED', label: 'Balanced', description: 'Mix of all approaches', icon: Target, color: 'from-purple-500 to-indigo-500' },
];

const goalsOptions = [
  'Improve shot accuracy', 'Build consistency', 'Master strategy',
  'Increase speed', 'Develop mental toughness', 'Win more matches',
  'Find playing partners', 'Learn fundamentals', 'Recover from injury', 'Just have fun'
];

const challengesOptions = [
  'Serve consistency', 'Third shot drop', 'Dinking control',
  'Reaction time', 'Court positioning', 'Pressure/nerves',
  'Mental focus', 'Injury concerns', 'Limited practice time', 'Shot placement'
];

export default function CondensedOnboarding() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
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
    notificationPreferences: ['Daily tips', 'Training reminders'],
  });

  const totalSteps = 4; // Welcome + 3 steps
  const progress = (currentStep / (totalSteps - 1)) * 100;

  const handleNext = () => {
    // Validate required fields before proceeding
    if (currentStep === 1) {
      if (!formData.ageRange || !formData.gender || !formData.skillLevel || !formData.playingFrequency) {
        toast({
          title: "Missing Information",
          description: "Please complete all fields before continuing.",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (currentStep === 2) {
      if (formData.primaryGoals.length === 0 || formData.biggestChallenges.length === 0) {
        toast({
          title: "Missing Information",
          description: "Please select at least one goal and one challenge.",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  const handleSubmit = async () => {
    // Validate coaching style is selected
    if (!formData.coachingStylePreference) {
      toast({
        title: "Missing Information",
        description: "Please select a coaching style before continuing.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('Submitting onboarding data:', formData);
      
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();
      console.log('Response status:', response.status, 'Response data:', responseData);

      if (response.ok) {
        toast({
          title: "Welcome to Mindful Champion! 🎉",
          description: "Your profile is all set. Let's start training!",
        });
        router.push('/dashboard');
      } else {
        // Show specific error message from API
        const errorMessage = responseData.error || 'Failed to save profile';
        console.error('API error:', errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Onboarding submission error:', error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
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
            className="space-y-8"
          >
            {/* Premium Intro Video */}
            <div className="mb-8">
              <PremiumIntroVideo 
                variant="full"
                autoPlay={true}
                onComplete={handleNext}
                className="rounded-2xl shadow-2xl"
              />
            </div>

            {/* Welcome Content Below Video */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              className="text-center space-y-6 py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-br from-teal-500 to-orange-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl"
              >
                <Rocket className="w-10 h-10 text-white" />
              </motion.div>
              <div className="space-y-4">
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
                  Let's Personalize Your Experience! 🏓
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Complete 3 quick steps to unlock your personalized AI coaching experience.
                  This helps Coach Kai provide better guidance tailored just for you.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={handleNext} 
                  size="lg" 
                  className="bg-gradient-to-r from-teal-500 to-orange-500 hover:from-teal-600 hover:to-orange-600 text-lg px-8 py-6 shadow-xl"
                >
                  Start Setup <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => window.location.href = '/dashboard'}
                  className="text-slate-500 hover:text-slate-700"
                >
                  Skip Setup (Continue to App)
                </Button>
              </div>
            </motion.div>
          </motion.div>
        );

      case 1: // Profile & Skill Level
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mx-auto flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">About You</h2>
              <p className="text-slate-600">Tell us about yourself and your skill level</p>
            </div>
            
            {/* Compact Profile Info */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-500" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Age Range</Label>
                  <Select value={formData.ageRange} onValueChange={(value) => updateFormData({ ageRange: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age" />
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
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Location (Optional)</Label>
                  <Input
                    placeholder="e.g., Austin, TX"
                    value={formData.location}
                    onChange={(e) => updateFormData({ location: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Skill Level Selection */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-orange-500" />
                  Your Skill Level
                </CardTitle>
                <CardDescription>Choose the level that best describes your current play</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {skillLevelOptions.map((level) => (
                  <motion.button
                    key={level.value}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateFormData({ skillLevel: level.value as any })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.skillLevel === level.value
                        ? `bg-gradient-to-br ${level.gradient} text-white border-transparent shadow-lg`
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <level.icon className={`w-8 h-8 mx-auto mb-2 ${formData.skillLevel === level.value ? 'text-white' : 'text-slate-600'}`} />
                    <div className="font-semibold">{level.label}</div>
                    <div className={`text-xs mt-1 ${formData.skillLevel === level.value ? 'text-white/90' : 'text-slate-500'}`}>
                      {level.rating}
                    </div>
                  </motion.button>
                ))}
              </CardContent>
            </Card>

            {/* Playing Frequency */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-500" />
                  How Often Do You Play?
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Daily', '3-4 times/week', '1-2 times/week', 'Occasionally'].map((freq) => (
                  <Button
                    key={freq}
                    variant={formData.playingFrequency === freq ? "default" : "outline"}
                    onClick={() => updateFormData({ playingFrequency: freq })}
                    className={formData.playingFrequency === freq ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
                  >
                    {freq}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Button onClick={handleNext} className="w-full bg-gradient-to-r from-teal-500 to-orange-500 hover:from-teal-600 hover:to-orange-600 py-6">
              Continue <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        );

      case 2: // Goals & Challenges
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mx-auto flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Your Goals</h2>
              <p className="text-slate-600">What do you want to achieve? (Select up to 3)</p>
            </div>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {goalsOptions.map((goal) => {
                    const isSelected = formData.primaryGoals.includes(goal);
                    return (
                      <motion.button
                        key={goal}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateFormData({ primaryGoals: toggleArrayItem(formData.primaryGoals, goal) })}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white border-transparent shadow-lg'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isSelected && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
                          <span className="text-sm font-medium">{goal}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                {formData.primaryGoals.length > 0 && (
                  <p className="text-xs text-slate-500 mt-4 text-center">
                    {formData.primaryGoals.length}/3 selected
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Biggest Challenges</h3>
              <p className="text-slate-600">What areas need the most work? (Select up to 3)</p>
            </div>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {challengesOptions.map((challenge) => {
                    const isSelected = formData.biggestChallenges.includes(challenge);
                    return (
                      <motion.button
                        key={challenge}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateFormData({ biggestChallenges: toggleArrayItem(formData.biggestChallenges, challenge) })}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white border-transparent shadow-lg'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isSelected && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
                          <span className="text-sm font-medium">{challenge}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                {formData.biggestChallenges.length > 0 && (
                  <p className="text-xs text-slate-500 mt-4 text-center">
                    {formData.biggestChallenges.length}/3 selected
                  </p>
                )}
              </CardContent>
            </Card>

            <Button onClick={handleNext} className="w-full bg-gradient-to-r from-teal-500 to-orange-500 hover:from-teal-600 hover:to-orange-600 py-6">
              Continue <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        );

      case 3: // Coaching Style & Finish
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Coaching Style</h2>
              <p className="text-slate-600">How should Coach Kai communicate with you?</p>
            </div>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coachingStyles.map((style) => {
                    const isSelected = formData.coachingStylePreference === style.value;
                    return (
                      <motion.button
                        key={style.value}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => updateFormData({ coachingStylePreference: style.value })}
                        className={`p-5 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? `bg-gradient-to-br ${style.color} text-white border-transparent shadow-xl`
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-white/20' : 'bg-slate-100'
                          }`}>
                            <style.icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-lg mb-1">{style.label}</div>
                            <div className={`text-sm ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                              {style.description}
                            </div>
                          </div>
                          {isSelected && <CheckCircle className="w-6 h-6" />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">🎉 You're All Set!</CardTitle>
                <CardDescription>
                  Your personalized coaching experience is ready. Coach Kai will adapt to your style and help you achieve your goals!
                </CardDescription>
              </CardHeader>
            </Card>

            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-teal-500 to-orange-500 hover:from-teal-600 hover:to-orange-600 py-6 text-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Setting up your profile...
                </>
              ) : (
                <>
                  Start Your Journey! <Trophy className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        {currentStep > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">
                Step {currentStep} of {totalSteps - 1}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                Skip for now
              </Button>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
