"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import MainNavigation from "@/components/navigation/main-navigation"
import {
  Trophy,
  Target,
  TrendingUp,
  Flame,
  Star,
  ChevronRight,
  Users,
  Video,
  Award,
  ArrowRight,
  Sparkles,
  Brain,
  Zap,
  MessageCircle,
  BarChart3,
  Gift,
  Dumbbell,
  Calendar,
  Mic
} from "lucide-react"

interface RedesignedHomeDashboardProps {
  user: any
  userPrograms?: any[]
  recentActivity?: any[]
  recommendations?: any[]
  achievements?: any[]
  upcomingContent?: any[]
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        const data = await response.json()
        if (data?.success) {
          setDashboardStats(data.stats)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    if (mounted) fetchDashboardData()
  }, [mounted])

  const firstName = user?.firstName || user?.name?.split(' ')?.[0] || 'Champion'

  // Quick nav items with enhanced gradients
  const quickNavItems = [
    { name: 'Train', icon: Dumbbell, path: '/train', color: 'from-blue-500 to-cyan-400', bgGlow: 'shadow-blue-500/40', description: 'Drills & Programs' },
    { name: 'Analyze', icon: Video, path: '/train/video', color: 'from-purple-500 to-pink-400', bgGlow: 'shadow-purple-500/40', description: 'Video Analysis' },
    { name: 'Tournaments', icon: Trophy, path: '/tournaments', color: 'from-amber-500 to-orange-400', bgGlow: 'shadow-amber-500/40', description: 'Find Events' },
    { name: 'Progress', icon: BarChart3, path: '/progress', color: 'from-emerald-500 to-teal-400', bgGlow: 'shadow-emerald-500/40', description: 'View Stats' },
    { name: 'Connect', icon: Users, path: '/connect', color: 'from-indigo-500 to-purple-400', bgGlow: 'shadow-indigo-500/40', description: 'Find Partners' },
    { name: 'Rewards', icon: Gift, path: '/marketplace', color: 'from-yellow-500 to-amber-400', bgGlow: 'shadow-yellow-500/40', description: 'Earn Points' },
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <MainNavigation user={user} />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <MainNavigation user={user} />
      
      {/* Single Screen Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ===== HEADER SECTION ===== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6"
        >
          {/* Greeting */}
          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/40"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Zap className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Welcome back, <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">{firstName}</span>!
              </h1>
              <p className="text-slate-300 text-sm">Ready to elevate your game today?</p>
            </div>
          </div>

          {/* Compact Stats Row - Enhanced */}
          <div className="flex gap-3">
            {[
              { label: 'Streak', value: dashboardStats?.dayStreak?.count || 0, icon: Flame, color: 'text-orange-400', bg: 'bg-gradient-to-br from-orange-500/30 to-red-500/20', shadow: 'shadow-lg shadow-orange-500/20' },
              { label: 'Points', value: dashboardStats?.rewardPoints?.count || 0, icon: Star, color: 'text-yellow-400', bg: 'bg-gradient-to-br from-yellow-500/30 to-amber-500/20', shadow: 'shadow-lg shadow-yellow-500/20' },
              { label: 'Level', value: dashboardStats?.skillLevel || '3.0', icon: Award, color: 'text-purple-400', bg: 'bg-gradient-to-br from-purple-500/30 to-pink-500/20', shadow: 'shadow-lg shadow-purple-500/20' },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20",
                    stat.bg, stat.shadow
                  )}
                >
                  <Icon className={cn("w-5 h-5", stat.color)} />
                  <div className="text-center">
                    <div className={cn("text-lg font-bold", stat.color)}>
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </div>
                    <div className="text-[10px] text-slate-300 uppercase tracking-wide">{stat.label}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* ===== MAIN CONTENT GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN - Coach Kai Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            {/* Coach Kai Card - Primary CTA */}
            <div
              onClick={() => router.push('/train/coach')}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-6 sm:p-8 cursor-pointer group shadow-2xl shadow-emerald-600/40 hover:shadow-emerald-500/50 transition-all duration-300"
            >
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <motion.div
                className="absolute bottom-4 right-4 text-white/20"
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 8, repeat: Infinity }}
              >
                <Sparkles className="w-24 h-24" />
              </motion.div>

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar */}
                <motion.div
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-black/30 flex-shrink-0"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600" />
                </motion.div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-white/25 rounded-full text-xs font-semibold text-white shadow-sm">AI Coach</span>
                    <motion.div
                      className="flex items-center gap-1 px-2 py-1 bg-green-400/40 rounded-full"
                      animate={{ opacity: [1, 0.7, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 bg-green-300 rounded-full shadow-sm shadow-green-400" />
                      <span className="text-xs text-white font-medium">Online</span>
                    </motion.div>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-md">
                    Chat with Coach Kai
                  </h2>
                  <p className="text-white/90 text-sm sm:text-base mb-4">
                    Get instant AI-powered coaching, personalized tips, and strategy guidance
                  </p>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    {[
                      { icon: MessageCircle, text: 'Text Chat' },
                      { icon: Mic, text: 'Voice Input' },
                      { icon: Target, text: 'Custom Drills' },
                    ].map((feat, i) => {
                      const Icon = feat.icon
                      return (
                        <div key={i} className="flex items-center gap-1.5 text-white text-sm">
                          <Icon className="w-4 h-4" />
                          <span>{feat.text}</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-6 py-3 rounded-xl shadow-xl shadow-black/20 hover:shadow-2xl hover:scale-105 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MessageCircle className="w-5 h-5" />
                    Start Coaching Session
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Active Training - Compact with enhanced depth */}
            {userPrograms?.find(up => up?.status === 'IN_PROGRESS') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-emerald-500/30 shadow-xl shadow-emerald-500/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{userPrograms.find(up => up?.status === 'IN_PROGRESS')?.program?.name || 'Active Training'}</p>
                      <p className="text-xs text-slate-400">Continue where you left off</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const activeProgram = userPrograms.find(up => up?.status === 'IN_PROGRESS')
                      if (activeProgram?.programId) router.push(`/train/program/${activeProgram.programId}`)
                    }}
                    className="px-4 py-2 bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 shadow-md"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* RIGHT COLUMN - Quick Stats & Recent */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Today's Tip - Enhanced */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 shadow-xl shadow-amber-500/10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-amber-300 text-xs font-semibold uppercase tracking-wide mb-1">Daily Tip</p>
                  <p className="text-slate-200 text-sm leading-relaxed">
                    Focus on your ready position today - paddle up, knees bent, weight forward!
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Achievement - Enhanced */}
            {achievements?.length > 0 && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 shadow-xl shadow-purple-500/10">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Trophy className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide">Latest Achievement</p>
                    <p className="text-white font-medium">{achievements[0]?.achievement?.name || achievements[0]?.name || 'New Badge!'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats Card - Enhanced */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/15 shadow-xl">
              <p className="text-slate-300 text-xs font-semibold uppercase tracking-wide mb-3">This Week</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Sessions', value: dashboardStats?.weeklyStats?.sessions || 0, icon: Calendar },
                  { label: 'Minutes', value: dashboardStats?.weeklyStats?.minutes || 0, icon: TrendingUp },
                ].map((stat, i) => {
                  const Icon = stat.icon
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-white font-bold">{stat.value}</p>
                        <p className="text-slate-400 text-xs">{stat.label}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ===== QUICK NAVIGATION GRID - Enhanced ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Quick Access</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickNavItems.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.button
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(item.path)}
                  className={cn(
                    "group relative p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/15 hover:border-white/30 transition-all duration-300 text-left shadow-xl",
                    `hover:${item.bgGlow}`
                  )}
                >
                  {/* Gradient Glow on Hover */}
                  <div className={cn(
                    "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity blur-xl",
                    `bg-gradient-to-br ${item.color}`
                  )} />
                  
                  <div className="relative z-10">
                    <div className={cn(
                      "w-12 h-12 rounded-xl bg-gradient-to-br mb-3 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg",
                      item.color, item.bgGlow
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-white mb-0.5">{item.name}</h3>
                    <p className="text-xs text-slate-400">{item.description}</p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* ===== BOTTOM ROW - Secondary Info - Enhanced ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {/* Upcoming - Placeholder */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 shadow-lg">
            <div className="flex items-center gap-2 text-slate-300 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Upcoming</span>
            </div>
            <p className="text-slate-400 text-sm">No scheduled sessions</p>
            <button
              onClick={() => router.push('/tournaments')}
              className="mt-2 text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors"
            >
              Browse tournaments →
            </button>
          </div>

          {/* Community Activity */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 shadow-lg">
            <div className="flex items-center gap-2 text-slate-300 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Community</span>
            </div>
            <p className="text-slate-400 text-sm">Connect with local players</p>
            <button
              onClick={() => router.push('/connect')}
              className="mt-2 text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors"
            >
              Find partners →
            </button>
          </div>

          {/* Rewards Summary */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 shadow-lg">
            <div className="flex items-center gap-2 text-slate-300 mb-2">
              <Gift className="w-4 h-4" />
              <span className="text-sm font-medium">Rewards</span>
            </div>
            <p className="text-slate-400 text-sm">
              {(dashboardStats?.rewardPoints?.count || 0).toLocaleString()} points available
            </p>
            <button
              onClick={() => router.push('/marketplace')}
              className="mt-2 text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors"
            >
              View rewards →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
