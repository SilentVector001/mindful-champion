
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Target,
  Trophy,
  Zap,
  Heart,
  Brain,
  Users,
  Star,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Award,
  TrendingUp,
  Activity,
  Shield,
  Lightbulb,
  Flame,
  BookOpen
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { WelcomeVideoCarousel } from "./welcome-video-carousel"

interface GoalOption {
  id: string
  title: string
  description: string
  icon: any
  category: 'skill' | 'mental' | 'social' | 'competitive'
  recommendedFor: string[]
}

const goalOptions: GoalOption[] = [
  {
    id: 'improve-accuracy',
    title: 'Improve Shot Accuracy',
    description: 'Develop precision and control in shot placement',
    icon: Target,
    category: 'skill',
    recommendedFor: ['BEGINNER', 'INTERMEDIATE']
  },
  {
    id: 'build-consistency',
    title: 'Build Consistency',
    description: 'Develop reliable, repeatable technique and performance',
    icon: TrendingUp,
    category: 'skill',
    recommendedFor: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
  },
  {
    id: 'master-strategy',
    title: 'Master Game Strategy',
    description: 'Learn advanced tactics and court positioning',
    icon: Brain,
    category: 'skill',
    recommendedFor: ['INTERMEDIATE', 'ADVANCED']
  },
  {
    id: 'increase-speed',
    title: 'Increase Power & Speed',
    description: 'Build athletic performance and shot power',
    icon: Zap,
    category: 'skill',
    recommendedFor: ['INTERMEDIATE', 'ADVANCED']
  },
  {
    id: 'mental-toughness',
    title: 'Develop Mental Toughness',
    description: 'Build focus, confidence, and pressure handling',
    icon: Shield,
    category: 'mental',
    recommendedFor: ['INTERMEDIATE', 'ADVANCED']
  },
  {
    id: 'win-matches',
    title: 'Win More Matches',
    description: 'Focus on competitive performance and match play',
    icon: Trophy,
    category: 'competitive',
    recommendedFor: ['INTERMEDIATE', 'ADVANCED']
  },
  {
    id: 'find-partners',
    title: 'Find Playing Partners',
    description: 'Connect with players and build a practice community',
    icon: Users,
    category: 'social',
    recommendedFor: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
  },
  {
    id: 'learn-fundamentals',
    title: 'Master Fundamentals',
    description: 'Build a solid foundation of basic skills and rules',
    icon: BookOpen,
    category: 'skill',
    recommendedFor: ['BEGINNER']
  },
  {
    id: 'stay-active',
    title: 'Stay Active & Healthy',
    description: 'Focus on fitness, injury prevention, and longevity',
    icon: Heart,
    category: 'mental',
    recommendedFor: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
  },
  {
    id: 'have-fun',
    title: 'Simply Have Fun!',
    description: 'Enjoy the game and social aspects of pickleball',
    icon: Star,
    category: 'social',
    recommendedFor: ['BEGINNER', 'INTERMEDIATE']
  }
]

const challengeOptions = [
  { id: 'serve-consistency', label: 'Serve Consistency', icon: Activity },
  { id: 'third-shot-drop', label: 'Third Shot Drop', icon: Target },
  { id: 'dinking-control', label: 'Dinking Control', icon: Flame },
  { id: 'reaction-time', label: 'Reaction Time', icon: Zap },
  { id: 'court-positioning', label: 'Court Positioning', icon: Trophy },
  { id: 'pressure-nerves', label: 'Pressure/Nerves', icon: Shield },
  { id: 'mental-focus', label: 'Mental Focus', icon: Brain },
  { id: 'shot-placement', label: 'Shot Placement', icon: Target }
]

const coachingStyles = [
  {
    id: 'MOTIVATIONAL',
    name: 'Motivational',
    description: 'Encouraging, positive reinforcement approach',
    icon: Heart,
    color: 'bg-pink-100 border-pink-300'
  },
  {
    id: 'ANALYTICAL',
    name: 'Data-Driven',
    description: 'Technical insights and performance analysis',
    icon: TrendingUp,
    color: 'bg-blue-100 border-blue-300'
  },
  {
    id: 'DIRECT',
    name: 'Direct & Clear',
    description: 'Straightforward, no-nonsense feedback',
    icon: Zap,
    color: 'bg-orange-100 border-orange-300'
  },
  {
    id: 'SUPPORTIVE',
    name: 'Patient & Supportive',
    description: 'Understanding, gradual progression focus',
    icon: Users,
    color: 'bg-green-100 border-green-300'
  }
]

interface GoalOrientedOnboardingProps {
  user: any
  onComplete?: (data: any) => void
  isUpdating?: boolean
}

export default function GoalOrientedOnboarding({ user, onComplete, isUpdating = false }: GoalOrientedOnboardingProps) {
  const router = useRouter()
  const { update: updateSession } = useSession()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([])
  const [selectedCoachingStyle, setSelectedCoachingStyle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 4
  const progress = (currentStep / (totalSteps - 1)) * 100

  // Filter goals based on user's skill level
  const relevantGoals = goalOptions.filter(goal => 
    goal.recommendedFor.includes(user?.skillLevel || 'BEGINNER')
  )

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : prev.length < 3 ? [...prev, goalId] : prev
    )
  }

  const handleChallengeToggle = (challengeId: string) => {
    setSelectedChallenges(prev => 
      prev.includes(challengeId) 
        ? prev.filter(id => id !== challengeId)
        : prev.length < 3 ? [...prev, challengeId] : prev
    )
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/onboarding/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goals: selectedGoals,
          challenges: selectedChallenges,
          preferences: {
            coachingStyle: selectedCoachingStyle
          },
          skillLevel: user?.skillLevel || 'BEGINNER'
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        if (isUpdating) {
          toast.success('🎯 Goals updated successfully!')
          // Update session and redirect for updates
          await updateSession()
          router.push('/dashboard')
        } else {
          toast.success('🎯 Onboarding complete! Welcome to Mindful Champion!')
          
          console.log('[Onboarding] Updating session to refresh JWT token...')
          
          // CRITICAL FIX: Force NextAuth session update to trigger JWT refresh
          // This ensures the JWT token's onboardingCompleted flag is updated
          // before we redirect, preventing the middleware redirect loop
          try {
            await updateSession()
            console.log('[Onboarding] Session updated successfully')
          } catch (refreshError) {
            console.error('[Onboarding] Session update failed:', refreshError)
          }
          
          // Wait a bit longer to ensure JWT has been refreshed
          console.log('[Onboarding] Waiting for JWT refresh to propagate...')
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          console.log('[Onboarding] Redirecting to dashboard...')
          // Use window.location.href for a hard redirect to clear all cache
          window.location.href = '/dashboard'
        }
        
        onComplete?.(data)
      } else {
        toast.error('Failed to save goals. Please try again.')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('[Onboarding] Error:', error)
      toast.error('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
    // Don't set isSubmitting to false here for successful completion
    // This prevents double-submission during redirect
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true // Welcome
      case 1: return selectedGoals.length > 0 // Goals
      case 2: return selectedChallenges.length > 0 // Challenges  
      case 3: return selectedCoachingStyle !== '' // Coaching style
      default: return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <div className="w-20 h-20 bg-gradient-to-r from-champion-green to-emerald-600 rounded-full mx-auto flex items-center justify-center">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Let's Set Your Goals!
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Great choice joining Mindful Champion! Let's personalize your training experience 
                by understanding what you want to achieve in pickleball.
              </p>
            </div>
            <Button 
              onClick={handleNext} 
              size="lg" 
              className="bg-gradient-to-r from-champion-green to-emerald-600 hover:from-champion-green/90 hover:to-emerald-600/90"
            >
              Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        )

      case 1: // Goals Selection
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <Target className="w-8 h-8 text-champion-green mx-auto" />
              <h2 className="text-2xl font-bold">What do you want to achieve?</h2>
              <p className="text-gray-600">Select up to 3 primary goals (we recommend starting with 1-2)</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relevantGoals.map((goal) => {
                const Icon = goal.icon
                const isSelected = selectedGoals.includes(goal.id)
                
                return (
                  <Card
                    key={goal.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      isSelected ? "ring-2 ring-champion-green bg-champion-green/5" : "hover:border-champion-green/50"
                    )}
                    onClick={() => handleGoalToggle(goal.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          isSelected 
                            ? "bg-champion-green text-white" 
                            : "bg-champion-green/10 text-champion-green"
                        )}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{goal.title}</h3>
                          <p className="text-sm text-gray-600">{goal.description}</p>
                          <Badge 
                            variant="outline" 
                            className="mt-2 text-xs"
                          >
                            {goal.category}
                          </Badge>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-champion-green" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Selected: {selectedGoals.length}/3
              </p>
            </div>
          </motion.div>
        )

      case 2: // Challenges
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <Shield className="w-8 h-8 text-champion-gold mx-auto" />
              <h2 className="text-2xl font-bold">What are your biggest challenges?</h2>
              <p className="text-gray-600">Select up to 3 areas where you'd like the most help</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {challengeOptions.map((challenge) => {
                const Icon = challenge.icon
                const isSelected = selectedChallenges.includes(challenge.id)
                
                return (
                  <div
                    key={challenge.id}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-all",
                      isSelected 
                        ? "border-champion-gold bg-champion-gold/5" 
                        : "border-gray-200 hover:border-champion-gold/50"
                    )}
                    onClick={() => handleChallengeToggle(challenge.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn(
                        "w-5 h-5",
                        isSelected ? "text-champion-gold" : "text-gray-500"
                      )} />
                      <span className="font-medium">{challenge.label}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-champion-gold ml-auto" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Selected: {selectedChallenges.length}/3
              </p>
            </div>
          </motion.div>
        )

      case 3: // Coaching Style
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <Brain className="w-8 h-8 text-champion-blue mx-auto" />
              <h2 className="text-2xl font-bold">What coaching style works best for you?</h2>
              <p className="text-gray-600">This helps Coach Kai adapt to your learning preferences</p>
            </div>
            
            <RadioGroup
              value={selectedCoachingStyle}
              onValueChange={setSelectedCoachingStyle}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {coachingStyles.map((style) => {
                const Icon = style.icon
                
                return (
                  <div key={style.id}>
                    <RadioGroupItem
                      value={style.id}
                      id={style.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={style.id}
                      className={cn(
                        "flex flex-col items-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all peer-data-[state=checked]:border-champion-blue peer-data-[state=checked]:bg-champion-blue/5",
                        style.color
                      )}
                    >
                      <Icon className="w-8 h-8 text-champion-blue" />
                      <div className="text-center">
                        <div className="font-semibold text-lg">{style.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{style.description}</div>
                      </div>
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Welcome Video Carousel */}
        {currentStep === 0 && (
          <WelcomeVideoCarousel />
        )}
        
        {/* Progress Bar */}
        {currentStep > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500">
                Step {currentStep} of {totalSteps - 1}
              </span>
              <span className="text-sm font-medium text-champion-green">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
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
        {currentStep > 0 && (
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back
            </Button>

            <Button
              onClick={currentStep === totalSteps - 1 ? handleComplete : handleNext}
              disabled={!canProceed() || isSubmitting}
              className="bg-gradient-to-r from-champion-green to-emerald-600 hover:from-champion-green/90 hover:to-emerald-600/90"
            >
              {isSubmitting ? (
                isUpdating ? 'Updating goals...' : 'Setting up your experience...'
              ) : currentStep === totalSteps - 1 ? (
                <>
                  {isUpdating ? 'Update Goals' : 'Complete Setup'}
                  <CheckCircle2 className="ml-2 w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
