
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar,
  Sparkles,
  Zap,
  Play,
  Video,
  Users,
  ChevronRight,
  Flame,
  Heart,
  Brain,
  Battery,
  Moon,
  Activity,
  Shield,
  Lightbulb,
  Award,
  Star,
  ArrowRight
} from "lucide-react"
import MainNavigation from "@/components/navigation/main-navigation"
import AvatarCoach from "@/components/avatar/avatar-coach"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface PremiumHomeDashboardProps {
  user: any
  isTrialExpired?: boolean
}

// User profiling system
const getUserProfile = (user: any) => {
  const totalMatches = user?.totalMatches || 0
  const winRate = totalMatches ? ((user?.totalWins || 0) / totalMatches * 100) : 0
  const skillLevel = user?.skillLevel || 'BEGINNER'
  const streak = user?.currentStreak || 0
  
  // Competitive player profile
  if (winRate >= 70 && totalMatches >= 10 && skillLevel !== 'BEGINNER') {
    return {
      type: 'COMPETITIVE',
      priorities: ['win-rate', 'tournaments', 'advanced-drills', 'analytics'],
      greeting: 'Ready to dominate the court',
      focusAreas: ['Performance Optimization', 'Tournament Preparation', 'Advanced Strategy']
    }
  }
  
  // Recovery-focused profile
  if (user?.primaryGoals?.includes?.('injury-prevention') || user?.ageRange === '50+') {
    return {
      type: 'RECOVERY_FOCUSED',
      priorities: ['mobility', 'gradual-progression', 'form-correction', 'recovery-metrics'],
      greeting: 'Let\'s train smart and stay healthy',
      focusAreas: ['Form & Technique', 'Injury Prevention', 'Progressive Training']
    }
  }
  
  // Default casual player
  return {
    type: 'CASUAL',
    priorities: ['streak', 'fundamentals', 'social-play', 'enjoyment'],
    greeting: 'Time to have fun and improve',
    focusAreas: ['Skill Building', 'Consistent Practice', 'Social Connections']
  }
}

// Mock wearables data generator
const generateWearablesData = (user: any) => {
  const profile = getUserProfile(user)
  const baseRecovery = profile.type === 'RECOVERY_FOCUSED' ? 75 : 
                      profile.type === 'COMPETITIVE' ? 85 : 80
  
  return {
    recoveryScore: Math.max(60, Math.min(95, baseRecovery + Math.floor(Math.random() * 15) - 7)),
    hrv: Math.floor(35 + Math.random() * 25), // 35-60 range
    sleepScore: Math.floor(75 + Math.random() * 20), // 75-95 range
    strain: Math.floor(8 + Math.random() * 7), // 8-15 range
    readinessScore: Math.floor(70 + Math.random() * 25), // 70-95 range
    lastSync: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  }
}

// AI-powered insights generator
const generateSmartInsights = (user: any, wearables: any) => {
  const profile = getUserProfile(user)
  const insights = []
  
  if (wearables.recoveryScore >= 85) {
    insights.push({
      type: 'positive',
      icon: Lightbulb,
      message: 'High recovery score detected - perfect day for intensive drill work!',
      action: 'Start Advanced Training',
      actionUrl: '/train/drills'
    })
  }
  
  if (user?.currentStreak >= 7) {
    insights.push({
      type: 'achievement',
      icon: Award,
      message: `Amazing ${user.currentStreak}-day streak! You're in the top 10% of players.`,
      action: 'View Leaderboard',
      actionUrl: '/progress/achievements'
    })
  }
  
  if (profile.type === 'COMPETITIVE' && wearables.strain < 10) {
    insights.push({
      type: 'suggestion',
      icon: Target,
      message: 'Your body is ready for high-intensity training. Push your limits today!',
      action: 'Competitive Drills',
      actionUrl: '/train/quick'
    })
  }
  
  return insights.slice(0, 2) // Limit to 2 insights
}

export default function PremiumHomeDashboard({ user, isTrialExpired }: PremiumHomeDashboardProps) {
  const router = useRouter()
  const [currentGoal, setCurrentGoal] = useState("")
  const [goalProgress, setGoalProgress] = useState(65)
  const [mounted, setMounted] = useState(false)
  const [wearablesData, setWearablesData] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Champion'

  // Initialize personalization and wearables data
  useEffect(() => {
    setMounted(true)
    
    const profile = getUserProfile(user)
    setUserProfile(profile)
    
    // Set personalized goal based on user profile
    const goals = {
      COMPETITIVE: "Dominate cross-court dinking patterns",
      RECOVERY_FOCUSED: "Perfect your form with 15 gentle serves", 
      CASUAL: "Master 10 third-shot drops in a row"
    }
    setCurrentGoal(goals[profile.type as keyof typeof goals] || goals.CASUAL)
    
    // Generate wearables data
    setWearablesData(generateWearablesData(user))
  }, [user])

  // Calculate stats safely after mount
  const winRate = mounted && user?.totalMatches ? ((user.totalWins || 0) / user.totalMatches * 100) : 0
  const recentMatches = user?.matches?.slice(0, 3) || []
  const currentStreak = user?.currentStreak || 0

  // Time-based greeting
  const [greeting, setGreeting] = useState("Hello")
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon") 
    else setGreeting("Good evening")
  }, [])

  // Smart insights
  const smartInsights = mounted && wearablesData ? generateSmartInsights(user, wearablesData) : []

  // Adaptive quick actions based on user profile
  const getAdaptiveActions = () => {
    const baseActions = [
      {
        title: "Upload Match Video",
        description: "Get AI-powered technique analysis",
        icon: Video,
        gradient: "from-emerald-500 to-teal-500",
        url: "/train/video",
        priority: userProfile?.priorities?.includes('analytics') ? 1 : 3
      },
      {
        title: "Find Practice Partner", 
        description: "AI-matched players at your level",
        icon: Users,
        gradient: "from-blue-500 to-indigo-500",
        url: "/connect/partners",
        priority: userProfile?.priorities?.includes('social-play') ? 1 : 2
      },
      {
        title: "Start Training",
        description: "Personalized drills for your goals",
        icon: Target,
        gradient: "from-orange-500 to-red-500", 
        url: "/train/quick",
        priority: 1
      }
    ]

    return baseActions.sort((a, b) => a.priority - b.priority)
  }

  const adaptiveActions = getAdaptiveActions()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-cyan-50/30">
      <MainNavigation user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Premium Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16"
        >
          <div className="flex items-center justify-between flex-wrap gap-6 mb-8">
            <div className="space-y-3">
              <h1 className="text-5xl font-light text-gray-900 mb-3">
                {greeting}, <span className="font-semibold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">{firstName}</span>
              </h1>
              <p className="text-xl text-gray-600 font-light">
                {userProfile?.greeting || 'Ready to elevate your game today?'}
              </p>
            </div>

            {/* Streak Badge - Premium Glass Design */}
            {currentStreak > 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <div className="backdrop-blur-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-200/20 rounded-2xl px-6 py-3 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full">
                      <Flame className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Streak</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        {currentStreak} Days
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Today's Focus - Premium Glass Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-white/80 to-cyan-50/30">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-emerald-500/5 to-blue-500/5" />
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
              
              <CardContent className="relative p-10">
                <div className="flex items-center gap-8">
                  {/* Premium Avatar */}
                  <motion.div 
                    className="flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-cyan-400 via-emerald-400 to-blue-400 flex items-center justify-center text-6xl shadow-2xl">
                      🏓
                    </div>
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-semibold text-gray-900">Today's Focus</h2>
                    </div>
                    
                    <p className="text-xl text-gray-700 font-light leading-relaxed">
                      Based on your profile and recent progress: <span className="font-semibold text-cyan-700">{currentGoal}</span>
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Progress to Goal</span>
                        <span className="text-lg font-bold text-cyan-600">{goalProgress}%</span>
                      </div>
                      <div className="relative">
                        <Progress value={goalProgress} className="h-3 bg-gray-200/50" />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500" 
                             style={{ width: `${goalProgress}%` }} />
                      </div>
                    </div>

                    <Button 
                      size="lg"
                      onClick={() => router.push('/train')}
                      className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                    >
                      <Play className="w-5 h-5 mr-3" />
                      Start Smart Training
                      <ArrowRight className="w-5 h-5 ml-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Performance Dashboard - Adaptive Layout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16"
        >
          {/* Performance Metrics - Prioritized by User Profile */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Win Rate - Priority for competitive players */}
              <Card className={cn(
                "relative overflow-hidden border-0 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl hover:scale-105",
                userProfile?.priorities?.includes('win-rate') 
                  ? "bg-gradient-to-br from-emerald-50/80 to-teal-50/80 ring-1 ring-emerald-200/50" 
                  : "bg-white/70"
              )}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Win Rate</CardTitle>
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-light text-gray-900 mb-2">
                    {winRate.toFixed(1)}<span className="text-2xl">%</span>
                  </div>
                  <p className="text-sm text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {winRate > 50 ? "Above average!" : "Growing strong"}
                  </p>
                </CardContent>
              </Card>

              {/* Streak Counter */}
              <Card className="relative overflow-hidden border-0 shadow-xl backdrop-blur-sm bg-white/70 hover:shadow-2xl hover:scale-105 transition-all">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Current Streak</CardTitle>
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                      <Flame className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-light text-gray-900 mb-2">
                    {currentStreak}<span className="text-2xl"> days</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Keep the momentum going!
                  </p>
                </CardContent>
              </Card>

              {/* Next Milestone */}
              <Card className="relative overflow-hidden border-0 shadow-xl backdrop-blur-sm bg-white/70 hover:shadow-2xl hover:scale-105 transition-all">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Next Goal</CardTitle>
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-light text-gray-900 mb-2">
                    3<span className="text-2xl"> days</span>
                  </div>
                  <p className="text-sm text-blue-600">
                    Advanced Serve Mastery
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Smart Insights Section */}
            {smartInsights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="border-0 shadow-xl backdrop-blur-sm bg-gradient-to-br from-indigo-50/80 to-purple-50/80">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <CardTitle className="text-xl font-semibold">Smart Insights</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {smartInsights.map((insight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm"
                      >
                        <div className={cn(
                          "p-2 rounded-xl",
                          insight.type === 'positive' ? "bg-emerald-100 text-emerald-600" :
                          insight.type === 'achievement' ? "bg-orange-100 text-orange-600" :
                          "bg-blue-100 text-blue-600"
                        )}>
                          <insight.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">{insight.message}</p>
                        </div>
                        <Button
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(insight.actionUrl)}
                          className="bg-white/80 hover:bg-white"
                        >
                          {insight.action}
                        </Button>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Wearables Integration - Performance Sync */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Card className="border-0 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-slate-50/80 to-gray-50/80">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-slate-600 to-gray-600 rounded-xl">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold">Performance Sync</CardTitle>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      {wearablesData?.lastSync || 'Syncing...'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {wearablesData && (
                    <>
                      {/* Readiness Score - Main Metric */}
                      <div className="text-center p-6 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl">
                        <div className="text-4xl font-light text-gray-900 mb-2">
                          {wearablesData.readinessScore}
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-3">Readiness Score</p>
                        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${wearablesData.readinessScore}%` }}
                            transition={{ duration: 1.5, delay: 0.8 }}
                            className={cn(
                              "h-full rounded-full",
                              wearablesData.readinessScore >= 85 ? "bg-gradient-to-r from-green-500 to-emerald-500" :
                              wearablesData.readinessScore >= 70 ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
                              "bg-gradient-to-r from-red-500 to-rose-500"
                            )}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {wearablesData.readinessScore >= 85 ? "Optimal for high intensity" :
                           wearablesData.readinessScore >= 70 ? "Ready for moderate training" :
                           "Consider recovery focus"}
                        </p>
                      </div>

                      {/* Detailed Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-white/60 rounded-xl">
                          <div className="flex items-center justify-center mb-2">
                            <Heart className="w-4 h-4 text-red-500" />
                          </div>
                          <div className="text-2xl font-semibold text-gray-900">
                            {wearablesData.hrv}
                          </div>
                          <div className="text-xs text-gray-600">HRV Score</div>
                        </div>

                        <div className="text-center p-4 bg-white/60 rounded-xl">
                          <div className="flex items-center justify-center mb-2">
                            <Moon className="w-4 h-4 text-indigo-500" />
                          </div>
                          <div className="text-2xl font-semibold text-gray-900">
                            {wearablesData.sleepScore}%
                          </div>
                          <div className="text-xs text-gray-600">Sleep Quality</div>
                        </div>

                        <div className="text-center p-4 bg-white/60 rounded-xl">
                          <div className="flex items-center justify-center mb-2">
                            <Battery className="w-4 h-4 text-green-500" />
                          </div>
                          <div className="text-2xl font-semibold text-gray-900">
                            {wearablesData.recoveryScore}%
                          </div>
                          <div className="text-xs text-gray-600">Recovery</div>
                        </div>

                        <div className="text-center p-4 bg-white/60 rounded-xl">
                          <div className="flex items-center justify-center mb-2">
                            <Zap className="w-4 h-4 text-orange-500" />
                          </div>
                          <div className="text-2xl font-semibold text-gray-900">
                            {wearablesData.strain}
                          </div>
                          <div className="text-xs text-gray-600">Daily Strain</div>
                        </div>
                      </div>

                      {/* Connect Wearables CTA */}
                      <Button 
                        variant="outline" 
                        className="w-full bg-white/80 hover:bg-white"
                        onClick={() => router.push('/settings')}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Connect More Devices
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Actions - Adaptive & Prioritized */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-light text-gray-900">Quick Actions</h2>
            <p className="text-gray-600">Personalized for your goals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {adaptiveActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5 }}
              >
                <Card 
                  className="relative overflow-hidden border-0 shadow-xl cursor-pointer transition-all hover:shadow-2xl group bg-white/80 backdrop-blur-sm"
                  onClick={() => router.push(action.url)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${action.gradient}`} />
                  
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 bg-gradient-to-br ${action.gradient} rounded-2xl group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity - Streamlined */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Card className="border-0 shadow-xl backdrop-blur-sm bg-white/80">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push('/progress')}>
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentMatches.length > 0 ? (
                <div className="space-y-4">
                  {recentMatches.map((match: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-gray-50/80 to-slate-50/80 hover:from-gray-100/80 hover:to-slate-100/80 transition-all"
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        match.result === 'WIN' 
                          ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
                          : "bg-gradient-to-br from-gray-300 to-slate-300 text-white"
                      )}>
                        <Trophy className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {match.result === 'WIN' ? 'Victory' : 'Match'} vs {match.opponentName || 'Opponent'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(match.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <Badge variant={match.result === 'WIN' ? 'default' : 'secondary'}>
                        {match.result}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-6">No matches recorded yet</p>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/connect/matches')}
                    className="bg-white/80 hover:bg-white"
                  >
                    Log Your First Match
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Trial Expiry Warning */}
        {isTrialExpired && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 }}
            className="mt-12"
          >
            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50/80 to-yellow-50/80 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Your trial has ended</h3>
                    <p className="text-gray-700 text-lg">
                      Unlock premium features and continue your coaching journey with personalized training!
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => router.push('/pricing')}
                    className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-xl"
                  >
                    View Plans
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      {/* Persistent Avatar Coach */}
      <AvatarCoach userName={firstName} context="home" />
    </div>
  )
}
