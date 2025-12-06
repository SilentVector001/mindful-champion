
"use client"

/**
 * Intelligent Home Dashboard
 * 
 * Anticipates user needs and provides personalized content based on:
 * - User goals and preferences
 * - Activity history and patterns
 * - Skill level and progress
 * - Time of day and usage patterns
 * - Current training status
 */

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Trophy,
  Target,
  Play,
  Calendar,
  Clock,
  TrendingUp,
  Flame,
  Star,
  ChevronRight,
  BookOpen,
  Users,
  Video,
  Headphones,
  Zap,
  Brain,
  Heart,
  Award,
  Activity,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lightbulb,
  Shield,
  BarChart3,
  MessageCircle,
  Bell
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import MainNavigation from "@/components/navigation/main-navigation"
import FeatureShowcase from "@/components/features/feature-showcase"

interface IntelligentHomeDashboardProps {
  user: any
  userPrograms: any[]
  recentActivity: any[]
  recommendations: any[]
  achievements: any[]
  upcomingContent: any[]
}

// User profiling system for personalization
const getUserPersona = (user: any) => {
  const goals = user?.primaryGoals || []
  const challenges = user?.biggestChallenges || []
  const skillLevel = user?.skillLevel || 'BEGINNER'
  const playingFrequency = user?.playingFrequency || 'getting-started'
  const coachingStyle = user?.coachingStylePreference || 'BALANCED'

  // Competitive Player
  if (goals.includes('win-matches') || goals.includes('master-strategy')) {
    return {
      type: 'COMPETITIVE',
      primaryColor: 'from-red-500 to-pink-600',
      greeting: 'Ready to dominate the court?',
      focusAreas: ['Tournament Prep', 'Advanced Strategy', 'Performance Analytics'],
      quickActions: ['tournament-hub', 'video-analysis', 'match-tracking'],
      personalizedTips: [
        'Your serve accuracy has improved 15% this week!',
        'Practice your third shot drop - it\'s key for competitive play',
        'Check out the new tournament registration opening tomorrow'
      ]
    }
  }

  // Social Player
  if (goals.includes('find-partners') || goals.includes('have-fun')) {
    return {
      type: 'SOCIAL',
      primaryColor: 'from-champion-green to-emerald-600',
      greeting: 'Ready to connect and play?',
      focusAreas: ['Partner Matching', 'Community Events', 'Social Games'],
      quickActions: ['find-partners', 'community', 'group-training'],
      personalizedTips: [
        '3 new players in your area are looking for partners!',
        'Join the community discussion about local courts',
        'Your consistency is improving - perfect for doubles play!'
      ]
    }
  }

  // Skill Builder (Default)
  return {
    type: 'SKILL_BUILDER',
    primaryColor: 'from-champion-blue to-cyan-600',
    greeting: 'Ready to level up your skills?',
    focusAreas: ['Skill Development', 'Consistent Practice', 'Gradual Improvement'],
    quickActions: ['continue-training', 'watch-videos', 'practice-drills'],
    personalizedTips: [
      'You\'re on a 3-day training streak - keep it going!',
      'Your dinking control is ready for the next level',
      'Coach Kai has new insights based on your recent practice'
    ]
  }
}

// Time-based content recommendations
const getTimeBasedRecommendations = () => {
  const hour = new Date().getHours()
  
  if (hour >= 6 && hour < 10) {
    return {
      timeOfDay: 'Morning',
      icon: '🌅',
      recommendations: [
        'Perfect time for focused skill practice',
        'Start with mobility and warm-up routines',
        'Review yesterday\'s training notes'
      ],
      suggestedDuration: '20-30 minutes'
    }
  } else if (hour >= 10 && hour < 17) {
    return {
      timeOfDay: 'Midday',
      icon: '☀️',
      recommendations: [
        'Great time for longer training sessions',
        'Work on challenging techniques',
        'Connect with playing partners'
      ],
      suggestedDuration: '45-60 minutes'
    }
  } else {
    return {
      timeOfDay: 'Evening',
      icon: '🌙',
      recommendations: [
        'Ideal for video analysis and learning',
        'Reflect on today\'s improvements',
        'Plan tomorrow\'s practice'
      ],
      suggestedDuration: '15-30 minutes'
    }
  }
}

export default function IntelligentHomeDashboard({
  user,
  userPrograms = [],
  recentActivity = [],
  recommendations = [],
  achievements = [],
  upcomingContent = []
}: IntelligentHomeDashboardProps) {
  const router = useRouter()
  const [persona, setPersona] = useState(getUserPersona(user))
  const [timeRec, setTimeRec] = useState<ReturnType<typeof getTimeBasedRecommendations> | null>(null)
  const [mounted, setMounted] = useState(false)

  // Fix hydration error: Only set time-based recommendations on client side
  useEffect(() => {
    setMounted(true)
    setTimeRec(getTimeBasedRecommendations())
  }, [])

  // Active program tracking
  const activeProgram = userPrograms.find(up => up.status === 'IN_PROGRESS')
  const completedPrograms = userPrograms.filter(up => up.status === 'COMPLETED').length
  const currentStreak = user?.currentStreak || 0

  // Smart recommendations based on user behavior
  const getSmartRecommendations = () => {
    const recs = []
    
    // Based on current activity
    if (activeProgram) {
      recs.push({
        id: 'continue-program',
        title: 'Continue Your Training Journey',
        description: `Day ${activeProgram.currentDay} of ${activeProgram.program.name}`,
        action: () => router.push(`/train/program/${activeProgram.programId}`),
        priority: 'high',
        icon: Play,
        color: persona.primaryColor
      })
    } else {
      // No active program - suggest starting one
      recs.push({
        id: 'start-program',
        title: 'Start a Training Program',
        description: 'Choose from our expertly designed programs',
        action: () => router.push('/train/programs'),
        priority: 'high',
        icon: Target,
        color: persona.primaryColor
      })
    }

    // Based on goals
    if (user?.primaryGoals?.includes('find-partners')) {
      recs.push({
        id: 'partner-matching',
        title: 'Find Playing Partners',
        description: 'Connect with players at your skill level',
        action: () => router.push('/connect/partners'),
        priority: 'medium',
        icon: Users,
        color: 'from-green-500 to-emerald-600'
      })
    }

    // Based on challenges
    if (user?.biggestChallenges?.includes('mental-focus')) {
      recs.push({
        id: 'mental-training',
        title: 'Mental Training Session',
        description: 'Improve focus and confidence with Coach Kai',
        action: () => router.push('/train/coach'),
        priority: 'medium',
        icon: Brain,
        color: 'from-purple-500 to-indigo-600'
      })
    }

    // Time-sensitive
    if (timeRec && timeRec.timeOfDay === 'Morning' && currentStreak > 0) {
      recs.push({
        id: 'maintain-streak',
        title: 'Maintain Your Streak',
        description: `Keep your ${currentStreak}-day training streak alive!`,
        action: () => router.push('/train'),
        priority: 'high',
        icon: Flame,
        color: 'from-orange-500 to-red-500'
      })
    }

    return recs.sort((a, b) => a.priority === 'high' ? -1 : 1)
  }

  const smartRecommendations = getSmartRecommendations()

  return (
    <div className="min-h-screen bg-gradient-to-br from-champion-green/5 via-white to-champion-blue/5">
      <MainNavigation user={user} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Personalized Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {mounted && timeRec ? (
                  <>
                    {timeRec.icon} Good {timeRec.timeOfDay}, {user?.firstName || user?.name || 'Champion'}!
                  </>
                ) : (
                  <>
                    👋 Hello, {user?.firstName || user?.name || 'Champion'}!
                  </>
                )}
              </h1>
              <p className="text-xl text-gray-600">{persona.greeting}</p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-champion-green">{currentStreak}</div>
                <div className="text-sm text-gray-500">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-champion-blue">{completedPrograms}</div>
                <div className="text-sm text-gray-500">Programs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-champion-gold">{user?.rewardPoints || 0}</div>
                <div className="text-sm text-gray-500">Points</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Performance Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {/* Training Status */}
          <Card className="border-champion-green/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-champion-green" />
                <Badge variant="outline" className="text-champion-green border-champion-green">Active</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-champion-green">{recentActivity.length}</div>
                <div className="text-sm text-gray-600">Training Sessions</div>
                <div className="text-xs text-gray-500 mt-2">Last 30 days</div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="border-champion-gold/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-5 h-5 text-champion-gold" />
                <Badge variant="outline" className="text-champion-gold border-champion-gold">Earned</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-champion-gold">{achievements.length}</div>
                <div className="text-sm text-gray-600">Achievements</div>
                <div className="text-xs text-gray-500 mt-2">Keep it up! 🏆</div>
              </div>
            </CardContent>
          </Card>

          {/* Skill Progress */}
          <Card className="border-champion-blue/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-champion-blue" />
                <Badge variant="outline" className="text-champion-blue border-champion-blue">Level {user?.skillLevel || 'N/A'}</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-champion-blue">{user?.rewardPoints || 0}</div>
                <div className="text-sm text-gray-600">Reward Points</div>
                <div className="text-xs text-gray-500 mt-2">Redeem in store</div>
              </div>
            </CardContent>
          </Card>

          {/* Streak */}
          <Card className="border-orange-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <Badge variant="outline" className="text-orange-500 border-orange-500">
                  {currentStreak > 0 ? 'On Fire!' : 'Start Now'}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-orange-500">{currentStreak}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
                <div className="text-xs text-gray-500 mt-2">Keep training daily!</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Wearables & Video Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          {/* Wearable Devices */}
          <Card className="border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-purple-500" />
                Connected Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user?.connectedDevices && user.connectedDevices.length > 0 ? (
                <div className="space-y-3">
                  {user.connectedDevices.map((device: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Activity className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{device.name}</div>
                          <div className="text-xs text-gray-500">Last sync: {device.lastSync}</div>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Connected</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto flex items-center justify-center">
                    <Heart className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">No devices connected</p>
                    <p className="text-xs text-gray-500">Connect Apple Watch, Fitbit, or Garmin to track your fitness metrics</p>
                  </div>
                  <Link href="/settings/devices">
                    <Button variant="outline" size="sm" className="border-purple-500 text-purple-500 hover:bg-purple-50">
                      Connect Device
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Video Progress */}
          <Card className="border-cyan-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-cyan-500" />
                Video Training Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-cyan-50 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-600">{recentActivity.length}</div>
                      <div className="text-xs text-gray-600 mt-1">Videos Watched</div>
                    </div>
                    <div className="text-center p-3 bg-cyan-50 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-600">
                        {Math.round(recentActivity.length * 15)}m
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Training Time</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="font-semibold text-cyan-600">
                        {Math.round((recentActivity.length / Math.max(recentActivity.length, 10)) * 100)}%
                      </span>
                    </div>
                    <Progress value={(recentActivity.length / Math.max(recentActivity.length, 10)) * 100} className="h-2" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="w-16 h-16 bg-cyan-100 rounded-full mx-auto flex items-center justify-center">
                    <Video className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">No training videos yet</p>
                    <p className="text-xs text-gray-500">Start watching videos to track your progress</p>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-500" onClick={() => router.push('/train/library')}>
                    Browse Videos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Smart Recommendations */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-champion-gold" />
                Recommended for You
              </h2>
              
              <div className="grid gap-4">
                {smartRecommendations.slice(0, 3).map((rec, index) => {
                  const Icon = rec.icon
                  return (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group" onClick={rec.action}>
                        <div className={cn("h-1 bg-gradient-to-r", rec.color)} />
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <div className={cn("w-14 h-14 rounded-xl bg-gradient-to-r flex items-center justify-center", rec.color)}>
                              <Icon className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-1">{rec.title}</h3>
                              <p className="text-gray-600">{rec.description}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </motion.section>

            {/* Active Training Section */}
            {activeProgram && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-500" />
                  Continue Your Journey
                </h2>
                
                <Card className="overflow-hidden border-2 border-champion-green/20">
                  <div className="h-1 bg-gradient-to-r from-champion-green to-emerald-600" />
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-xl mb-2">{activeProgram.program.name}</h3>
                        <p className="text-gray-600 mb-3">Day {activeProgram.currentDay} of {activeProgram.program.durationDays}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-semibold">{Math.round(activeProgram.completionPercentage)}%</span>
                          </div>
                          <Progress value={activeProgram.completionPercentage} className="h-2" />
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => router.push(`/train/program/${activeProgram.programId}`)}
                        className="bg-gradient-to-r from-champion-green to-emerald-600"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Continue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}

            {/* Program Management Section */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Target className="w-6 h-6 text-champion-blue" />
                Training Programs
              </h2>
              
              <div className="grid gap-4">
                {activeProgram ? (
                  <Card className="border-champion-blue/20">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <Badge className="mb-2 bg-champion-blue">Active Program</Badge>
                          <h3 className="font-bold text-lg mb-1">{activeProgram.program.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{activeProgram.program.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Day {activeProgram.currentDay}/{activeProgram.program.durationDays}
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {Math.round(activeProgram.completionPercentage)}% Complete
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => router.push(`/train/program/${activeProgram.programId}`)}
                          className="flex-1 bg-gradient-to-r from-champion-blue to-cyan-600"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Continue Training
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => router.push('/train/programs')}
                          className="border-champion-blue text-champion-blue hover:bg-champion-blue/10"
                        >
                          Change Program
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-dashed border-2 border-gray-300 hover:border-champion-blue transition-colors cursor-pointer" onClick={() => router.push('/train/programs')}>
                    <CardContent className="p-6">
                      <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-gradient-to-r from-champion-blue to-cyan-600 rounded-full mx-auto flex items-center justify-center">
                          <Target className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-1">No Active Program</h3>
                          <p className="text-sm text-gray-600">Start a structured training program to reach your goals faster</p>
                        </div>
                        <Button className="bg-gradient-to-r from-champion-blue to-cyan-600">
                          Browse Programs
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {completedPrograms > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 px-2">
                    <Award className="w-4 h-4 text-champion-gold" />
                    <span>You've completed {completedPrograms} program{completedPrograms !== 1 ? 's' : ''}! 🎉</span>
                  </div>
                )}
              </div>
            </motion.section>

            {/* Time-based Insights */}
            {mounted && timeRec && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <Lightbulb className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{timeRec.timeOfDay} Training Tips</h3>
                        <ul className="space-y-1">
                          {timeRec.recommendations.map((tip, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                              <CheckCircle2 className="w-3 h-3 text-indigo-500" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 text-sm text-indigo-600 font-medium">
                          Suggested Duration: {timeRec.suggestedDuration}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Coach Kai Integration - REMOVED: Global floating button from layout.tsx is used instead */}
            {/* This prevents duplicate floating buttons overlapping in the bottom right corner */}

            {/* Personal Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="w-5 h-5" />
                    Personal Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {persona.personalizedTips.map((tip, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{tip}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Training', icon: BookOpen, path: '/train', color: 'bg-champion-blue' },
                    { name: 'Videos', icon: Video, path: '/media-center', color: 'bg-champion-green' },
                    { name: 'Partners', icon: Users, path: '/connect/partners', color: 'bg-champion-gold' },
                    { name: 'Progress', icon: BarChart3, path: '/progress', color: 'bg-purple-500' }
                  ].map((action) => {
                    const Icon = action.icon
                    return (
                      <Button
                        key={action.name}
                        variant="outline"
                        className="h-auto p-3 flex flex-col gap-2 hover:shadow-md transition-all"
                        onClick={() => router.push(action.path)}
                      >
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", action.color)}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-medium">{action.name}</span>
                      </Button>
                    )
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Achievements */}
            {achievements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Trophy className="w-5 h-5" />
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {achievements.slice(0, 3).map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-champion-green/5">
                        <Award className="w-5 h-5 text-champion-gold" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{achievement.name}</div>
                          <div className="text-xs text-gray-500">{achievement.description}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
