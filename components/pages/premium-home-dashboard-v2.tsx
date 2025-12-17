"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Sparkles,
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
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
  Star,
  Gift,
  TrendingDown,
  Calendar,
  BarChart3,
  Wifi,
  RefreshCw,
  ExternalLink,
  Link as LinkIcon
} from "lucide-react"
import MainNavigation from "@/components/navigation/main-navigation"
import AvatarCoach from "@/components/avatar/avatar-coach"
import PartnerRequestNotification from "@/components/dashboard/partner-request-notification"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface PremiumHomeDashboardProps {
  user: any
  isTrialExpired?: boolean
  pendingPartnerRequests?: Array<{
    id: string
    senderId: string
    senderName: string
    skillLevel?: string
    rating?: number
    location?: string
    message?: string | null
    createdAt: string
  }>
}

// Wearable devices configuration
const WEARABLE_DEVICES = [
  {
    id: 'apple-health',
    name: 'Apple Health',
    description: 'iPhone & Apple Watch',
    image: '/wearables/apple-watch.jpg',
    icon: Activity,
    color: 'from-gray-800 to-gray-600',
    metrics: ['Heart Rate', 'HRV', 'Sleep', 'Activity', 'Recovery'],
    syncFrequency: 'Real-time'
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    description: 'All Fitbit Devices',
    image: '/wearables/fitbit.jpg',
    icon: Heart,
    color: 'from-teal-500 to-cyan-500',
    metrics: ['Steps', 'Heart Rate', 'Sleep', 'Readiness'],
    syncFrequency: 'Every 15 min'
  },
  {
    id: 'garmin',
    name: 'Garmin',
    description: 'Connect & Sports Watches',
    image: '/wearables/garmin.png',
    icon: Activity,
    color: 'from-blue-600 to-cyan-500',
    metrics: ['Training Load', 'VO2 Max', 'Recovery Time', 'Body Battery'],
    syncFrequency: 'Every hour'
  },
  {
    id: 'whoop',
    name: 'Whoop',
    description: 'Whoop Strap 4.0',
    image: '/wearables/whoop.png',
    icon: Zap,
    color: 'from-black to-gray-700',
    metrics: ['Strain', 'Recovery', 'HRV', 'Sleep Performance'],
    syncFrequency: 'Real-time'
  }
]

// Recent achievements and milestones
const ACHIEVEMENT_TEMPLATES = [
  { 
    id: 'first-win', 
    title: 'First Victory', 
    description: 'Won your first match',
    icon: Trophy,
    color: 'gold',
    points: 50
  },
  { 
    id: '7-day-streak', 
    title: 'Week Warrior', 
    description: '7 days training streak',
    icon: Flame,
    color: 'orange',
    points: 100
  },
  { 
    id: '50-percent-win', 
    title: 'Balanced Player', 
    description: 'Achieved 50% win rate',
    icon: Target,
    color: 'blue',
    points: 75
  },
  { 
    id: 'video-master', 
    title: 'Video Analyst', 
    description: 'Analyzed 5 videos',
    icon: Video,
    color: 'purple',
    points: 60
  }
]

// Sponsors configuration
const SPONSOR_TIERS = [
  {
    tier: 'national',
    title: 'National Partners',
    description: 'Premium equipment and nationwide offers',
    benefits: ['Exclusive discounts', 'Product testing', 'Pro player meet & greets'],
    examples: ['Selkirk', 'Paddletek', 'Onix']
  },
  {
    tier: 'local',
    title: 'Local Partners',
    description: 'Your community courts and clubs',
    benefits: ['Court time discounts', 'Free clinic access', 'Member perks'],
    examples: ['Community centers', 'Private clubs', 'Recreation departments']
  },
  {
    tier: 'online',
    title: 'Online Partners',
    description: 'Digital services and coaching',
    benefits: ['Training resources', 'Nutrition plans', 'Mental coaching'],
    examples: ['PickleballCentral', 'PB Kitchen', 'MindGym']
  }
]

// User profiling system - determines what to show each user
const getUserProfile = (user: any) => {
  const totalMatches = user?.totalMatches || 0
  const winRate = totalMatches ? ((user?.totalWins || 0) / totalMatches * 100) : 0
  const skillLevel = user?.skillLevel || 'BEGINNER'
  
  // Competitive player
  if (winRate >= 70 && totalMatches >= 10 && skillLevel !== 'BEGINNER') {
    return {
      type: 'COMPETITIVE',
      priorities: ['win-rate', 'tournaments', 'advanced-drills'],
      greeting: 'Ready to dominate',
      mainAction: { label: 'Tournament Prep', url: '/connect/tournaments', icon: Trophy }
    }
  }
  
  // Recovery-focused
  if (user?.primaryGoals?.includes?.('injury-prevention') || user?.ageRange === '50+') {
    return {
      type: 'RECOVERY',
      priorities: ['mobility', 'form-correction', 'recovery-metrics'],
      greeting: 'Train smart, stay healthy',
      mainAction: { label: 'Form Analysis', url: '/train/video', icon: Video }
    }
  }
  
  // Casual player (default)
  return {
    type: 'CASUAL',
    priorities: ['streak', 'fundamentals', 'social-play'],
    greeting: 'Time to improve',
    mainAction: { label: 'Start Training', url: '/train/quick', icon: Target }
  }
}

// Generate wearables data
const generateWearablesData = (userProfile: any) => {
  const baseRecovery = userProfile.type === 'RECOVERY' ? 75 : userProfile.type === 'COMPETITIVE' ? 85 : 80
  
  return {
    recoveryScore: Math.max(60, Math.min(95, baseRecovery + Math.floor(Math.random() * 15) - 7)),
    hrv: Math.floor(35 + Math.random() * 25),
    sleepScore: Math.floor(75 + Math.random() * 20),
    strain: Math.floor(8 + Math.random() * 7),
    readinessScore: Math.floor(70 + Math.random() * 25),
    lastSync: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  }
}

// AI-powered smart insights
const generateSmartInsights = (user: any, wearables: any, userProfile: any) => {
  const insights = []
  
  // High recovery = intensive training
  if (wearables.recoveryScore >= 85 && userProfile.type === 'COMPETITIVE') {
    insights.push({
      icon: Lightbulb,
      title: 'Peak Performance Day',
      message: 'Your recovery is excellent - perfect for pushing your limits today!',
      action: 'Advanced Drills',
      url: '/train/drills',
      color: 'emerald'
    })
  }
  
  // Long streak recognition
  if (user?.currentStreak >= 7) {
    insights.push({
      icon: Flame,
      title: `${user.currentStreak}-Day Streak!`,
      message: 'You\'re in the top 10% of consistent players. Keep it going!',
      action: 'View Progress',
      url: '/progress',
      color: 'orange'
    })
  }
  
  // Recovery focused insight
  if (wearables.recoveryScore < 70 && userProfile.type !== 'RECOVERY') {
    insights.push({
      icon: Heart,
      title: 'Recovery Recommended',
      message: 'Your body needs rest. Try light technique work or mobility drills today.',
      action: 'Mobility Drills',
      url: '/train/drills',
      color: 'blue'
    })
  }
  
  return insights.slice(0, 1) // Show only 1 key insight for cleaner UI
}

// Generate user achievements based on their activity
const generateUserAchievements = (user: any) => {
  const achievements = []
  
  if (user?.totalWins && user.totalWins > 0) {
    achievements.push({ ...ACHIEVEMENT_TEMPLATES[0], earnedAt: new Date() })
  }
  
  if (user?.currentStreak && user.currentStreak >= 7) {
    achievements.push({ ...ACHIEVEMENT_TEMPLATES[1], earnedAt: new Date() })
  }
  
  const winRate = user?.totalMatches ? ((user?.totalWins || 0) / user.totalMatches * 100) : 0
  if (winRate >= 50) {
    achievements.push({ ...ACHIEVEMENT_TEMPLATES[2], earnedAt: new Date() })
  }
  
  // Video analysis achievement (mock for now)
  if (Math.random() > 0.5) {
    achievements.push({ ...ACHIEVEMENT_TEMPLATES[3], earnedAt: new Date() })
  }
  
  return achievements.slice(0, 3) // Show max 3 recent
}

export default function PremiumHomeDashboard({ user, isTrialExpired, pendingPartnerRequests = [] }: PremiumHomeDashboardProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [wearablesData, setWearablesData] = useState<any>(null)
  const [showPartnerRequests, setShowPartnerRequests] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [smartInsights, setSmartInsights] = useState<any[]>([])
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null)
  const [showWearableModal, setShowWearableModal] = useState(false)
  const [recentAchievements, setRecentAchievements] = useState<any[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Champion'

  // Initialize on mount
  useEffect(() => {
    try {
      setMounted(true)
      const profile = getUserProfile(user)
      setUserProfile(profile)
      const wearables = generateWearablesData(profile)
      setWearablesData(wearables)
      setSmartInsights(generateSmartInsights(user, wearables, profile))
      
      // Check for connected device (from localStorage)
      if (typeof window !== 'undefined') {
        const savedDevice = localStorage.getItem('connected_wearable')
        if (savedDevice) setConnectedDevice(savedDevice)
      }
      
      // Generate achievements based on user data
      const achievements = generateUserAchievements(user)
      setRecentAchievements(achievements)
      setTotalPoints(achievements.reduce((sum, a) => sum + (a?.points || 0), 0))
      
      // Show partner requests notification after everything is loaded
      if (pendingPartnerRequests && pendingPartnerRequests.length > 0) {
        setShowPartnerRequests(true)
      }
    } catch (error) {
      console.error('Error initializing dashboard:', error)
      // Set minimal state to prevent crash
      setMounted(true)
    }
  }, [user, pendingPartnerRequests])

  // Calculate stats
  const winRate = mounted && user?.totalMatches ? ((user.totalWins || 0) / user.totalMatches * 100) : 0
  const currentStreak = user?.currentStreak || 0
  const goalProgress = 65 // Mock for now
  const totalWins = user?.totalWins || 0
  const totalMatches = user?.totalMatches || 0
  const totalLosses = totalMatches - totalWins

  // Time-based greeting
  const [greeting, setGreeting] = useState("Hello")
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon") 
    else setGreeting("Good evening")
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-white">
      <MainNavigation user={user} />

      {/* Partner Request Notification */}
      {showPartnerRequests && pendingPartnerRequests.length > 0 && (
        <PartnerRequestNotification 
          requests={pendingPartnerRequests} 
          onClose={() => setShowPartnerRequests(false)}
        />
      )}

      {/* Spacious Container - LOTS of whitespace */}
      <main className="max-w-[1400px] mx-auto px-8 sm:px-12 py-16 space-y-20">
        
        {/* HERO SECTION - Clean & Minimal */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          {/* Greeting */}
          <div>
            <h1 className="text-6xl font-light text-gray-900 mb-4">
              {greeting}, <span className="font-medium">{firstName}</span>
            </h1>
            <p className="text-2xl text-gray-500 font-light">
              {userProfile?.greeting || 'Ready to elevate your game'}
            </p>
          </div>

          {/* TODAY'S FOCUS - Large, Clean Card */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow bg-gradient-to-br from-cyan-50 to-white overflow-hidden">
            <CardContent className="p-12">
              <div className="grid lg:grid-cols-[1fr,auto] gap-12 items-center">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-cyan-600/10 rounded-full">
                    <Sparkles className="w-5 h-5 text-cyan-600" />
                    <span className="text-sm font-medium text-cyan-900">AI Recommendation</span>
                  </div>
                  
                  <div>
                    <h2 className="text-4xl font-light text-gray-900 mb-4">Today's Focus</h2>
                    <p className="text-xl text-gray-700 leading-relaxed">
                      Based on your recent performance: <span className="font-medium">Master 10 cross-court dinks with perfect form</span>
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Your Progress</span>
                      <span className="font-semibold text-cyan-600">{goalProgress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${goalProgress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                      />
                    </div>
                  </div>

                  <Button 
                    size="lg"
                    onClick={() => router.push(userProfile?.mainAction?.url || '/train')}
                    className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white font-medium px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {userProfile?.mainAction?.label || 'Start Training'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>

                {/* Streak Badge */}
                {currentStreak > 0 && (
                  <div className="lg:block hidden">
                    <div className="p-8 bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl text-center min-w-[200px]">
                      <Flame className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                      <div className="text-5xl font-light text-gray-900 mb-2">{currentStreak}</div>
                      <div className="text-sm font-medium text-gray-600">Day Streak</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Smart Insight - Single, Prominent */}
          {smartInsights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {smartInsights.map((insight, idx) => (
                <Card 
                  key={idx}
                  className={cn(
                    "border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow",
                    insight.color === 'emerald' ? "bg-gradient-to-r from-emerald-50 to-teal-50" :
                    insight.color === 'orange' ? "bg-gradient-to-r from-orange-50 to-red-50" :
                    "bg-gradient-to-r from-blue-50 to-indigo-50"
                  )}
                  onClick={() => router.push(insight.url)}
                >
                  <CardContent className="p-8">
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "p-4 rounded-2xl",
                        insight.color === 'emerald' ? "bg-emerald-200 text-emerald-700" :
                        insight.color === 'orange' ? "bg-orange-200 text-orange-700" :
                        "bg-blue-200 text-blue-700"
                      )}>
                        <insight.icon className="w-7 h-7" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-medium text-gray-900 mb-1">{insight.title}</h3>
                        <p className="text-gray-700">{insight.message}</p>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </motion.section>

        {/* PERFORMANCE & WEARABLES - Side by Side */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid lg:grid-cols-2 gap-12"
        >
          {/* ENHANCED PERFORMANCE METRICS */}
          <div className="space-y-8">
            <h2 className="text-3xl font-light text-gray-900">Performance</h2>
            
            <div className="grid gap-6">
              {/* Win Rate */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600 font-medium">Win Rate</span>
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <Trophy className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                  <div className="text-5xl font-light text-gray-900 mb-2">
                    {winRate.toFixed(0)}<span className="text-3xl text-gray-500">%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-4">
                    <div className="flex items-center gap-1 text-emerald-600">
                      {winRate > 50 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {winRate > 50 ? 'Above average' : 'Improving'}
                    </div>
                    <span className="text-gray-500">{totalWins}W - {totalLosses}L</span>
                  </div>
                  {/* Mini progress bar */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-4">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                      style={{ width: `${winRate}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Matches Played */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600 font-medium">Total Matches</span>
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="text-5xl font-light text-gray-900 mb-2">
                    {totalMatches}<span className="text-3xl text-gray-500"> games</span>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <div>
                      <p className="text-xs text-gray-500">This Month</p>
                      <p className="text-sm font-semibold text-gray-900">{Math.min(totalMatches, 8)}</p>
                    </div>
                    <div className="border-l border-gray-200 pl-4">
                      <p className="text-xs text-gray-500">Best Streak</p>
                      <p className="text-sm font-semibold text-gray-900">{Math.max(currentStreak, 3)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Milestone */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-700 font-medium">Next Milestone</span>
                    <div className="p-2 bg-blue-500 rounded-xl">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl font-light text-gray-900 mb-2">
                    Advanced Serve Mastery
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">3 training sessions away</span>
                  </div>
                  <div className="h-2 bg-blue-200 rounded-full overflow-hidden mt-4">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '70%' }} />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Wins */}
              {totalWins > 0 && (
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span className="text-gray-700 font-medium">Recent Victories</span>
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((_, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">vs. Player {idx + 1}</p>
                              <p className="text-xs text-gray-600">{11 + idx}-{8 - idx}</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                            Win
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full mt-4"
                      onClick={() => router.push('/progress/matches')}
                    >
                      View All Matches
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* ENHANCED WEARABLES SYNC */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-light text-gray-900">Readiness</h2>
              {connectedDevice && (
                <Badge className="bg-green-100 text-green-700 border-0 px-3 py-1 flex items-center gap-1.5">
                  <Wifi className="w-3 h-3" />
                  Connected • {wearablesData?.lastSync}
                </Badge>
              )}
            </div>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-slate-50 to-gray-50">
              <CardContent className="p-8 space-y-8">
                {connectedDevice ? (
                  <>
                    {/* Main Readiness Score */}
                    <div className="text-center p-8 bg-white rounded-2xl shadow-md">
                      <div className="text-6xl font-light text-gray-900 mb-2">
                        {wearablesData?.readinessScore || 85}
                      </div>
                      <p className="text-lg text-gray-600 mb-4">Readiness Score</p>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${wearablesData?.readinessScore || 85}%` }}
                          transition={{ duration: 1.2, delay: 0.6 }}
                          className={cn(
                            "h-full",
                            (wearablesData?.readinessScore || 85) >= 85 ? "bg-gradient-to-r from-green-500 to-emerald-500" :
                            (wearablesData?.readinessScore || 85) >= 70 ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
                            "bg-gradient-to-r from-red-500 to-rose-500"
                          )}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-3">
                        {(wearablesData?.readinessScore || 85) >= 85 ? "🔥 Optimal for high intensity training" :
                         (wearablesData?.readinessScore || 85) >= 70 ? "⚡ Ready for moderate training" :
                         "💤 Consider recovery focus today"}
                      </p>
                    </div>

                    {/* Detailed Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <Heart className="w-5 h-5 text-red-500 mx-auto mb-2" />
                        <div className="text-3xl font-light text-gray-900 mb-1">
                          {wearablesData?.hrv || 45}
                        </div>
                        <div className="text-xs text-gray-600">HRV Score</div>
                      </div>

                      <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <Moon className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
                        <div className="text-3xl font-light text-gray-900 mb-1">
                          {wearablesData?.sleepScore || 85}%
                        </div>
                        <div className="text-xs text-gray-600">Sleep Quality</div>
                      </div>

                      <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <Battery className="w-5 h-5 text-green-500 mx-auto mb-2" />
                        <div className="text-3xl font-light text-gray-900 mb-1">
                          {wearablesData?.recoveryScore || 88}%
                        </div>
                        <div className="text-xs text-gray-600">Recovery</div>
                      </div>

                      <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <Activity className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                        <div className="text-3xl font-light text-gray-900 mb-1">
                          {wearablesData?.strain || 12}
                        </div>
                        <div className="text-xs text-gray-600">Daily Strain</div>
                      </div>
                    </div>

                    {/* Sync Info */}
                    <div className="flex items-center justify-between p-4 bg-cyan-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-4 h-4 text-cyan-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Auto-sync enabled</p>
                          <p className="text-xs text-gray-600">Updates 4x daily • Last: {wearablesData?.lastSync}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setConnectedDevice(null)}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Connect Wearable CTA */}
                    <div className="text-center py-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-medium text-gray-900 mb-2">Connect Your Wearable</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Sync your fitness data automatically. Updates 4x daily for optimal training recommendations.
                      </p>
                    </div>

                    {/* Wearable Device Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {WEARABLE_DEVICES.map((device) => (
                        <Card
                          key={device.id}
                          className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
                          onClick={() => {
                            // Simulate OAuth connection
                            setConnectedDevice(device.id)
                            localStorage.setItem('connected_wearable', device.id)
                          }}
                        >
                          <CardContent className="p-0">
                            {/* Device Image */}
                            <div className="relative aspect-square bg-gray-100">
                              <Image
                                src={device.image}
                                alt={device.name}
                                fill
                                className="object-contain p-6 group-hover:scale-110 transition-transform"
                              />
                            </div>
                            {/* Device Info */}
                            <div className="p-4">
                              <h4 className="font-semibold text-gray-900 mb-1">{device.name}</h4>
                              <p className="text-xs text-gray-600 mb-3">{device.description}</p>
                              <div className="flex items-center gap-1.5 text-xs text-cyan-600">
                                <LinkIcon className="w-3 h-3" />
                                <span>Connect via OAuth</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Benefits */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h4 className="font-medium text-gray-900 mb-3">Why Connect?</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>Personalized training intensity recommendations</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>Recovery tracking for injury prevention</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>Automated sync (4x daily) - set it and forget it</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* REWARDS & ACHIEVEMENTS */}
        {recentAchievements.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-light text-gray-900">Rewards & Achievements</h2>
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-4 py-1.5 flex items-center gap-2">
                <Star className="w-4 h-4" />
                {totalPoints} Points
              </Badge>
            </div>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-3 gap-6">
                  {recentAchievements.map((achievement, idx) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * idx }}
                      className="text-center p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow"
                    >
                      {/* Achievement Icon */}
                      <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                        achievement.color === 'gold' ? "bg-gradient-to-br from-yellow-400 to-orange-400" :
                        achievement.color === 'orange' ? "bg-gradient-to-br from-orange-500 to-red-500" :
                        achievement.color === 'blue' ? "bg-gradient-to-br from-blue-500 to-cyan-500" :
                        "bg-gradient-to-br from-purple-500 to-pink-500"
                      )}>
                        <achievement.icon className="w-8 h-8 text-white" />
                      </div>
                      
                      {/* Achievement Details */}
                      <h3 className="font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                      
                      {/* Points Badge */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full">
                        <Gift className="w-3 h-3 text-orange-600" />
                        <span className="text-xs font-semibold text-orange-900">+{achievement.points} pts</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* View All Button */}
                <div className="mt-6 text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/progress/achievements')}
                    className="border-2 border-orange-200 hover:bg-orange-50"
                  >
                    View All Achievements
                    <Trophy className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* SPONSORS & PARTNERSHIPS */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-light text-gray-900">Partner Benefits</h2>
            <Badge className="bg-cyan-100 text-cyan-700 border-0 px-3 py-1">
              Exclusive Offers
            </Badge>
          </div>

          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="relative h-48 bg-gradient-to-r from-cyan-600 via-emerald-600 to-teal-600">
              <div className="absolute inset-0">
                <Image
                  src="/sponsors/partnership.jpg"
                  alt="Partner Benefits"
                  fill
                  className="object-cover opacity-20"
                />
              </div>
              <div className="relative h-full flex items-center justify-center text-center px-6">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">Unlock Exclusive Rewards</h3>
                  <p className="text-white/90 text-lg">Earn points, get discounts, and access premium perks from our partners</p>
                </div>
              </div>
            </div>

            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6">
                {SPONSOR_TIERS.map((tier, idx) => (
                  <div 
                    key={tier.tier}
                    className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{tier.title}</h4>
                        <p className="text-xs text-gray-600">{tier.description}</p>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-2 mb-4">
                      {tier.benefits.map((benefit, bidx) => (
                        <div key={bidx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {/* Examples */}
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Featured Partners:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {tier.examples.map((example, eidx) => (
                          <Badge key={eidx} className="bg-gray-100 text-gray-700 border-0 text-xs">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA for Sponsors */}
              <div className="mt-8 p-6 bg-gradient-to-r from-cyan-50 to-emerald-50 rounded-xl border border-cyan-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Become a Partner</h4>
                    <p className="text-sm text-gray-600">
                      Join our network and reach passionate pickleball players nationwide
                    </p>
                  </div>
                  <Button 
                    onClick={() => window.open('mailto:partners@mindfulchampion.com', '_blank')}
                    className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Partner With Us
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* QUICK ACTIONS - Large, Clean Buttons */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-8"
        >
          <h2 className="text-3xl font-light text-gray-900">Quick Actions</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card 
              className="border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer group bg-white"
              onClick={() => router.push('/train/quick')}
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-md">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Quick Drills</h3>
                  <p className="text-gray-600 text-sm">Context-aware practice sessions</p>
                </div>
                <div className="flex items-center justify-center text-cyan-600 text-sm font-medium">
                  <span>Start Training</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer group bg-white"
              onClick={() => router.push('/train/programs')}
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-md">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Training Programs</h3>
                  <p className="text-gray-600 text-sm">Structured path to mastery</p>
                </div>
                <div className="flex items-center justify-center text-purple-600 text-sm font-medium">
                  <span>Browse Programs</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer group bg-white"
              onClick={() => router.push('/train/video')}
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-md">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Video Analysis</h3>
                  <p className="text-gray-600 text-sm">Upload match footage for insights</p>
                </div>
                <div className="flex items-center justify-center text-emerald-600 text-sm font-medium">
                  <span>Analyze Video</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Trial Expiry (if applicable) */}
        {isTrialExpired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-medium text-gray-900 mb-2">Your trial has ended</h3>
                    <p className="text-gray-700 text-lg">Continue your journey with premium features</p>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => router.push('/pricing')}
                    className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white px-8 py-6 rounded-xl"
                  >
                    View Plans
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      {/* Avatar Coach */}
      <AvatarCoach userName={firstName} context="home" />
    </div>
  )
}
