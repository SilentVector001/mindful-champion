
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import MainNavigation from "@/components/navigation/main-navigation"
import { AchievementToast, useAchievementNotifications } from "@/components/rewards/achievement-toast"

// Import new dashboard components
import NewsTicker from "@/components/dashboard/news-ticker"
import StatsOverview from "@/components/dashboard/stats-overview"
import MediaCenterAlerts from "@/components/dashboard/media-center-alerts"
import ProgressCharts from "@/components/dashboard/progress-charts"
import GettingStartedGuide from "@/components/dashboard/getting-started-guide"

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
  Heart,
  Award,
  Activity,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lightbulb,
  Brain,
  Zap,
  MessageCircle,
  BarChart3,
  Timer,
  Crown,
  Medal,
  Globe,
  Coffee,
  Sunrise,
  Sun,
  Moon,
  Eye,
  Headphones,
  Dumbbell
} from "lucide-react"

interface RedesignedHomeDashboardProps {
  user: any
  userPrograms: any[]
  recentActivity: any[]
  recommendations: any[]
  achievements: any[]
  upcomingContent: any[]
}

// Time-based greeting with enhanced personalization
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours()
  
  if (hour >= 5 && hour < 12) {
    return {
      timeOfDay: 'Morning',
      icon: Sunrise,
      emoji: '🌅',
      greeting: 'Good morning',
      subtitle: 'Ready to start strong today?',
      color: 'from-orange-400 to-yellow-500',
      bgColor: 'from-orange-50 to-yellow-50'
    }
  } else if (hour >= 12 && hour < 17) {
    return {
      timeOfDay: 'Afternoon',
      icon: Sun,
      emoji: '☀️',
      greeting: 'Good afternoon',
      subtitle: 'Perfect time for peak performance',
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50'
    }
  } else {
    return {
      timeOfDay: 'Evening',
      icon: Moon,
      emoji: '🌙',
      greeting: 'Good evening',
      subtitle: 'Time to reflect and plan ahead',
      color: 'from-purple-400 to-indigo-500',
      bgColor: 'from-purple-50 to-indigo-50'
    }
  }
}

export default function RedesignedHomeDashboard({
  user,
  userPrograms = [],
  recentActivity = [],
  recommendations = [],
  achievements = [],
  upcomingContent = []
}: RedesignedHomeDashboardProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [aiRecommendations, setAiRecommendations] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeGreeting, setTimeGreeting] = useState<ReturnType<typeof getTimeBasedGreeting>>()
  const { achievements: newAchievements, isShowing, dismissAchievements, checkForAchievements } = useAchievementNotifications()

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
    setTimeGreeting(getTimeBasedGreeting())
  }, [])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, recommendationsResponse] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/recommendations')
        ])

        const [statsData, recData] = await Promise.all([
          statsResponse.json(),
          recommendationsResponse.json()
        ])

        if (statsData.success) {
          setDashboardStats(statsData.stats)
        }

        if (recData.success) {
          setAiRecommendations(recData)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (mounted) {
      fetchDashboardData()
      // Check for achievements on dashboard load
      setTimeout(() => {
        checkForAchievements('all')
      }, 2000)
    }
  }, [mounted])

  // Loading state
  if (!mounted || isLoading || !dashboardStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <MainNavigation user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
          <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-pulse">
            {/* Header skeleton */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-2">
                <div className="w-48 sm:w-64 md:w-96 h-6 sm:h-8 bg-gray-200 rounded" />
                <div className="w-32 sm:w-48 md:w-64 h-4 sm:h-5 bg-gray-200 rounded" />
              </div>
              <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3 lg:gap-4">
                <div className="w-full sm:w-20 md:w-24 h-14 sm:h-16 bg-gray-200 rounded" />
                <div className="w-full sm:w-20 md:w-24 h-14 sm:h-16 bg-gray-200 rounded" />
                <div className="w-full sm:w-20 md:w-24 h-14 sm:h-16 bg-gray-200 rounded" />
              </div>
            </div>
            {/* News ticker skeleton */}
            <div className="w-full h-16 sm:h-20 bg-gray-200 rounded-xl" />
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-full h-28 sm:h-32 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const activeProgram = userPrograms?.find(up => up.status === 'IN_PROGRESS')
  const completedPrograms = userPrograms?.filter(up => up.status === 'COMPLETED')?.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <MainNavigation user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        {/* Enhanced Personalized Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-xl bg-gradient-to-r from-white via-white to-gray-50 overflow-hidden relative">
            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-champion-blue/5 to-champion-green/5" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-champion-blue/10 to-transparent rounded-full transform translate-x-32 -translate-y-32" />
            
            <CardContent className="p-4 sm:p-6 md:p-8 relative">
              {/* Mobile/Tablet: Stack vertically, Desktop: Side by side */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Time-based greeting - Always full width on mobile */}
                <div className="flex items-center gap-4 flex-1">
                  <div className={cn(
                    "w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg flex-shrink-0",
                    timeGreeting?.color || "from-blue-400 to-cyan-500"
                  )}>
                    {timeGreeting?.icon && (
                      <timeGreeting.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                      {timeGreeting?.greeting}, {user?.firstName || user?.name?.split(' ')[0] || 'Champion'}!
                    </h1>
                    <p className="text-sm sm:text-lg lg:text-xl text-gray-600 mt-1">{timeGreeting?.subtitle}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Your personal training hub • Track progress • View stats • Get personalized recommendations
                    </p>
                  </div>
                </div>

                {/* Quick Stats with Trends - Stack on mobile, grid on tablet, flex on desktop */}
                <div className="grid grid-cols-3 sm:flex sm:flex-wrap lg:flex-nowrap gap-2 sm:gap-3 justify-center items-center">
                  {[
                    {
                      label: 'Streak',
                      value: dashboardStats?.dayStreak?.count || 0,
                      trend: dashboardStats?.dayStreak?.trend || 0,
                      color: 'text-orange-600',
                      bgColor: 'bg-orange-50',
                      borderColor: 'border-orange-200',
                      icon: Flame
                    },
                    {
                      label: 'Points',
                      value: dashboardStats?.rewardPoints?.count || 0,
                      trend: dashboardStats?.rewardPoints?.trend || 0,
                      color: 'text-champion-gold',
                      bgColor: 'bg-yellow-50',
                      borderColor: 'border-yellow-200',
                      icon: Star
                    },
                    {
                      label: 'Achievements',
                      value: dashboardStats?.achievements?.count || 0,
                      trend: dashboardStats?.achievements?.trend || 0,
                      color: 'text-purple-600',
                      bgColor: 'bg-purple-50',
                      borderColor: 'border-purple-200',
                      icon: Trophy
                    }
                  ].map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "flex flex-col items-center justify-between p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl border-2 shadow-md",
                          "min-w-[80px] sm:min-w-[100px] lg:min-w-[110px]",
                          "flex-1 sm:flex-initial",
                          stat.bgColor,
                          stat.borderColor
                        )}
                      >
                        {/* Icon at top - Smaller on mobile */}
                        <div className={cn(
                          "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3", 
                          stat.bgColor, 
                          "ring-2 ring-white shadow-md"
                        )}>
                          <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6", stat.color)} />
                        </div>
                        
                        {/* Value and trend in center - Responsive sizing */}
                        <div className="flex flex-col items-center gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                          <div className={cn("text-xl sm:text-2xl md:text-3xl font-bold leading-none text-center", stat.color)}>
                            {stat.value.toLocaleString()}
                          </div>
                          {/* Only show trend if value > 0 and trend !== 0 */}
                          {stat.value > 0 && stat.trend !== 0 && (
                            <div className={cn(
                              "text-xs flex items-center gap-0.5 leading-none",
                              stat.trend > 0 ? "text-green-600" : "text-red-500"
                            )}>
                              <TrendingUp className={cn("w-2.5 h-2.5 sm:w-3 sm:h-3", stat.trend < 0 && "rotate-180")} />
                              <span className="text-[10px] sm:text-xs">{Math.abs(stat.trend)}%</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Label at bottom - Smaller on mobile */}
                        <div className="text-[9px] sm:text-xs text-gray-600 font-semibold uppercase tracking-wide text-center leading-tight">
                          {stat.label}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* News Ticker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <NewsTicker />
        </motion.div>

        {/* Live Tournaments Cross-Link Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.11 }}
          className="mb-8"
        >
          <Link href="/media">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-red-600 via-red-700 to-orange-600 overflow-hidden relative group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-400/20 to-transparent rounded-full blur-3xl" />
              
              {/* Animated pulse effect */}
              <motion.div
                className="absolute top-6 right-6 text-white/30"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Globe className="w-8 h-8" />
              </motion.div>
              
              <CardContent className="p-6 sm:p-8 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  {/* Left: Tournament Message */}
                  <div className="flex-1 text-center md:text-left space-y-3 w-full">
                    {/* Tournament Icon */}
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <motion.div
                        className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl"
                        animate={{ 
                          scale: [1, 1.05, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Trophy className="w-8 h-8 text-red-600" />
                      </motion.div>
                      <Badge className="bg-white/20 text-white text-xs uppercase tracking-wide animate-pulse">
                        LIVE NOW
                      </Badge>
                    </div>
                    
                    {/* Headline */}
                    <div>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                        Explore Live Tournaments
                      </h2>
                      <p className="text-base sm:text-lg text-red-100">
                        Watch live matches, discover local tournaments, and follow the action on our interactive map
                      </p>
                    </div>
                    
                    {/* Features List */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                      {[
                        { icon: Play, text: 'Watch Live Streams' },
                        { icon: Globe, text: 'Tournament Map' },
                        { icon: Calendar, text: 'Upcoming Events' }
                      ].map((feature, index) => {
                        const Icon = feature.icon
                        return (
                          <div
                            key={feature.text}
                            className="flex items-center gap-2 text-white/90"
                          >
                            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium">{feature.text}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* Right: CTA Button */}
                  <div className="flex flex-col items-center gap-4">
                    <Button
                      size="lg"
                      className="bg-white text-red-600 hover:bg-gray-100 text-lg font-bold px-8 py-6 rounded-2xl shadow-2xl group-hover:scale-110 transition-transform"
                    >
                      View Tournaments
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Getting Started Guide - Show for new users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mb-8"
        >
          <GettingStartedGuide userName={user?.firstName || user?.name?.split(' ')[0]} />
        </motion.div>

        {/* Coach Kai Call-to-Action Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-xl bg-gradient-to-br from-champion-blue via-blue-600 to-cyan-600 overflow-hidden relative group cursor-pointer hover:shadow-2xl transition-all duration-300"
            onClick={() => router.push('/train/coach')}
          >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-400/20 to-transparent rounded-full blur-3xl" />
            {/* Grid pattern removed - using pure gradients instead */}
            
            {/* Animated sparkles */}
            <motion.div
              className="absolute top-6 right-6 text-white/30"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>
            <motion.div
              className="absolute bottom-6 left-6 text-white/20"
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [360, 180, 0],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
            
            <CardContent className="p-4 sm:p-6 md:p-8 lg:p-12 relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 md:gap-8">
                {/* Left: Coach Kai Message */}
                <div className="flex-1 text-center md:text-left space-y-3 sm:space-y-4 w-full">
                  {/* Coach Kai Avatar */}
                  <motion.div
                    className="w-20 h-20 mx-auto md:mx-0 bg-white rounded-full flex items-center justify-center shadow-2xl"
                    animate={{ 
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        "0 10px 30px rgba(255,255,255,0.3)",
                        "0 15px 40px rgba(255,255,255,0.5)",
                        "0 10px 30px rgba(255,255,255,0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <MessageCircle className="w-10 h-10 text-champion-blue" />
                  </motion.div>
                  
                  {/* Headline */}
                  <div>
                    <motion.h2
                      className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Start Your Day with Coach Kai
                    </motion.h2>
                    <motion.p
                      className="text-base sm:text-lg md:text-xl text-blue-100"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Get personalized pickleball insights, motivation, and expert guidance tailored just for you
                    </motion.p>
                  </div>
                  
                  {/* Features List - 2 cols on mobile, 4 cols on larger screens */}
                  <motion.div
                    className="grid grid-cols-2 md:grid-cols-2 gap-2 sm:gap-3 mt-4 sm:mt-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {[
                      { icon: Brain, text: 'AI-Powered Coaching' },
                      { icon: Lightbulb, text: 'Daily Tips & Insights' },
                      { icon: Target, text: 'Personalized Training' },
                      { icon: TrendingUp, text: 'Track Your Progress' }
                    ].map((feature, index) => {
                      const Icon = feature.icon
                      return (
                        <motion.div
                          key={feature.text}
                          className="flex items-center gap-2 text-white/90"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        >
                          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">{feature.text}</span>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                  
                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="pt-2 sm:pt-4"
                  >
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-white text-champion-blue hover:bg-blue-50 font-bold text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-200 group"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push('/train/coach')
                      }}
                    >
                      <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                      <span className="hidden sm:inline">Chat with Coach Kai Now</span>
                      <span className="sm:hidden">Chat Now</span>
                      <motion.div
                        className="ml-2"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </motion.div>
                    </Button>
                  </motion.div>
                  
                  <p className="text-[10px] sm:text-xs text-blue-200 italic">
                    💬 Available 24/7 • Push-to-talk voice feature • Text & voice interaction
                  </p>
                </div>

                {/* Right: Visual Element */}
                <motion.div
                  className="hidden lg:flex flex-col items-center gap-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="relative">
                    {/* Coach Kai illustration/icon */}
                    <motion.div
                      className="w-48 h-48 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border-4 border-white/20 shadow-2xl"
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 2, 0, -2, 0]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <MessageCircle className="w-24 h-24 text-white" strokeWidth={1.5} />
                    </motion.div>
                    
                    {/* Floating bubbles */}
                    <motion.div
                      className="absolute -top-4 -right-4 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl"
                      animate={{ 
                        y: [0, -15, 0],
                        rotate: [0, 10, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    >
                      <Sparkles className="w-8 h-8 text-white" />
                    </motion.div>
                    <motion.div
                      className="absolute -bottom-4 -left-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-xl"
                      animate={{ 
                        y: [0, 15, 0],
                        rotate: [0, -10, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    >
                      <Brain className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>
                  
                  <div className="text-center">
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
                      <Zap className="w-4 h-4 mr-1" />
                      Instant AI Responses
                    </Badge>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <StatsOverview stats={dashboardStats} />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personalized Recommendations */}
            {aiRecommendations?.recommendations && aiRecommendations.recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 overflow-hidden relative">
                  {/* Decorative background */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-champion-blue/5 to-transparent rounded-full blur-3xl pointer-events-none" />
                  
                  <CardHeader className="relative z-10">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-12 h-12 bg-gradient-to-br from-champion-blue to-cyan-600 rounded-xl flex items-center justify-center shadow-lg"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Brain className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <CardTitle className="bg-gradient-to-r from-champion-blue to-cyan-600 bg-clip-text text-transparent">
                          Personalized for You
                        </CardTitle>
                        <p className="text-xs text-gray-500">AI-powered recommendations</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 relative z-10">
                    {aiRecommendations.recommendations.slice(0, 3).map((rec: any, index: number) => {
                      const handleClick = () => {
                        console.log('Recommendation clicked:', rec)
                        if (rec.action?.path) {
                          console.log('Navigating to:', rec.action.path)
                          router.push(rec.action.path)
                        } else {
                          console.warn('No action path found for recommendation:', rec)
                        }
                      }

                      return (
                        <motion.div
                          key={rec.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="relative group"
                        >
                          <div
                            className={cn(
                              "flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-gray-100",
                              "hover:shadow-xl hover:border-champion-blue/30 transition-all duration-300 cursor-pointer",
                              "hover:-translate-y-1"
                            )}
                            onClick={handleClick}
                          >
                            {/* Gradient glow on hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-champion-blue/0 via-champion-blue/5 to-champion-blue/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                            
                            <motion.div
                              className={cn(
                                "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-xl relative z-10",
                                rec.priority === 'high' ? "from-champion-blue via-cyan-500 to-cyan-600" :
                                rec.priority === 'medium' ? "from-champion-green via-emerald-500 to-emerald-600" :
                                "from-gray-400 via-gray-500 to-gray-600"
                              )}
                              whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                              transition={{ duration: 0.3 }}
                            >
                              {rec.type === 'training' && <Target className="w-8 h-8 text-white drop-shadow-lg" />}
                              {rec.type === 'video' && <Video className="w-8 h-8 text-white drop-shadow-lg" />}
                              {rec.type === 'social' && <Users className="w-8 h-8 text-white drop-shadow-lg" />}
                              {rec.type === 'analysis' && <BarChart3 className="w-8 h-8 text-white drop-shadow-lg" />}
                              {rec.type === 'motivation' && <Flame className="w-8 h-8 text-white drop-shadow-lg" />}
                            </motion.div>
                            
                            <div className="flex-1 relative z-10">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-lg group-hover:text-champion-blue transition-colors leading-tight">
                                  {rec.title}
                                </h3>
                                {rec.priority === 'high' && (
                                  <Badge className="bg-red-500 text-white text-xs">
                                    Priority
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm mb-2">{rec.description}</p>
                              {rec.metadata?.progress !== undefined && (
                                <div className="mt-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-500">Progress</span>
                                    <span className="text-xs font-semibold text-champion-blue">
                                      {rec.metadata.progress}%
                                    </span>
                                  </div>
                                  <Progress value={rec.metadata.progress} className="h-2" />
                                  {rec.metadata.daysLeft && (
                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {rec.metadata.daysLeft} days remaining
                                    </div>
                                  )}
                                </div>
                              )}
                              {rec.action?.buttonText && (
                                <Button
                                  size="sm"
                                  className="mt-3 bg-gradient-to-r from-champion-blue to-cyan-600 hover:shadow-lg"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleClick()
                                  }}
                                >
                                  {rec.action.buttonText}
                                  <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                              )}
                            </div>
                            
                            <motion.div
                              className="text-gray-400 group-hover:text-champion-blue transition-colors relative z-10"
                              whileHover={{ x: 5 }}
                            >
                              <ChevronRight className="w-6 h-6" />
                            </motion.div>
                          </div>
                        </motion.div>
                      )
                    })}

                    {/* Daily Tip from Coach Kai */}
                    {aiRecommendations.dailyTip && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Card className="bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 border-2 border-teal-200 shadow-lg overflow-hidden relative">
                          {/* Sparkle effect */}
                          <motion.div
                            className="absolute top-4 right-4 text-teal-300"
                            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            <Sparkles className="w-6 h-6" />
                          </motion.div>
                          
                          <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                              <motion.div
                                className="w-14 h-14 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <Lightbulb className="w-7 h-7 text-white" />
                              </motion.div>
                              <div className="flex-1">
                                <h4 className="font-bold text-teal-900 mb-2 flex items-center gap-2">
                                  Coach Kai's Daily Tip
                                  <Badge className="bg-teal-200 text-teal-800 text-xs">
                                    {aiRecommendations.dailyTip.category}
                                  </Badge>
                                </h4>
                                <p className="text-sm text-teal-800 leading-relaxed">{aiRecommendations.dailyTip.tip}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Active Program or Program Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-champion-green" />
                    Training Journey
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeProgram ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-champion-green/10 to-emerald-50 rounded-xl border border-champion-green/20">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-champion-green to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{activeProgram.program.name}</h3>
                            <p className="text-gray-600">Day {activeProgram.currentDay} of {activeProgram.program.durationDays}</p>
                          </div>
                        </div>
                        <Button 
                          className="bg-gradient-to-r from-champion-green to-emerald-600"
                          onClick={() => router.push(`/train/program/${activeProgram.programId}`)}
                        >
                          Continue <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Overall Progress</span>
                          <span className="font-semibold">{Math.round(activeProgram.completionPercentage)}%</span>
                        </div>
                        <Progress value={activeProgram.completionPercentage} className="h-3" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-champion-blue to-cyan-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Target className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-xl mb-2">Ready to Start Your Journey?</h3>
                      <p className="text-gray-600 mb-4">Choose from our expertly designed training programs</p>
                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-champion-blue to-cyan-600"
                        onClick={() => router.push('/train/programs')}
                      >
                        Browse Programs <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Progress Charts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <ProgressCharts userStats={dashboardStats} />
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Media Center Alerts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <MediaCenterAlerts />
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-champion-gold" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { name: 'Train', icon: Dumbbell, path: '/train', color: 'bg-champion-blue', description: 'Start training' },
                    { name: 'Videos', icon: Video, path: '/train/library', color: 'bg-champion-green', description: 'Watch videos' },
                    { name: 'Analyze', icon: BarChart3, path: '/train/video', color: 'bg-purple-500', description: 'Upload video' },
                    { name: 'Connect', icon: Users, path: '/connect', color: 'bg-champion-gold', description: 'Find partners' },
                    { name: 'Media', icon: Headphones, path: '/media', color: 'bg-pink-500', description: 'Browse content' },
                    { name: 'Progress', icon: TrendingUp, path: '/progress', color: 'bg-cyan-500', description: 'View stats' }
                  ].map((action, index) => {
                    const Icon = action.icon
                    return (
                      <motion.div
                        key={action.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <Button
                          variant="outline"
                          className="h-auto p-4 flex flex-col gap-3 hover:shadow-lg hover:border-champion-blue/30 transition-all group w-full"
                          onClick={() => router.push(action.path)}
                        >
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform", action.color)}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-sm">{action.name}</div>
                            <div className="text-xs text-gray-500">{action.description}</div>
                          </div>
                        </Button>
                      </motion.div>
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
                transition={{ delay: 0.5 }}
              >
                <Card className="border-0 shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-champion-gold" />
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {achievements.slice(0, 3).map((achievement, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200/50"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-gray-900">
                            {achievement.achievement?.name || achievement.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {achievement.achievement?.description || achievement.description}
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                          New
                        </Badge>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Motivational Quote */}
            {aiRecommendations?.motivationalQuote && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
                  <CardContent className="p-6">
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full mx-auto flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <blockquote className="text-sm italic text-gray-700">
                        "{aiRecommendations.motivationalQuote.text}"
                      </blockquote>
                      <div className="text-xs text-gray-600 font-medium">
                        - {aiRecommendations.motivationalQuote.author}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Achievement Toast */}
      {isShowing && (
        <AchievementToast
          achievements={newAchievements}
          onDismiss={dismissAchievements}
        />
      )}
    </div>
  )
}
