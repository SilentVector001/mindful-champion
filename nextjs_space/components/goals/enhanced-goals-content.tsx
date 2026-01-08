// @ts-nocheck
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Target, Trophy, TrendingUp, Calendar, Sparkles, Bell, Mail, MessageSquare,
  ChevronDown, ChevronRight, Plus, Settings, Flame, Award, Clock, Star,
  CheckCircle2, Circle, BarChart3, Zap
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import EnhancedGoalCard from "./enhanced-goal-card"
import CreateGoalDialog from "./create-goal-dialog"
import MilestoneCalendar from "./milestone-calendar"
import GoalNotificationPrefs from "./goal-notification-prefs"
import AvatarCoach from "@/components/avatar/avatar-coach"

interface Goal {
  id: string
  title: string
  description?: string
  category: string
  status: string
  progress: number
  targetDate?: string
  createdAt: string
  completedAt?: string
  color?: string
  parentGoalId?: string
  milestones: any[]
  SubGoals?: Goal[]
}

interface GoalsContentProps {
  user: any
}

function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    const step = value / (duration / 16)
    const timer = setInterval(() => {
      countRef.current += step
      if (countRef.current >= value) {
        countRef.current = value
        clearInterval(timer)
      }
      if (mounted.current) {
        setCount(Math.floor(countRef.current))
      }
    }, 16)
    return () => {
      mounted.current = false
      clearInterval(timer)
    }
  }, [value, duration])

  return <span>{count}</span>
}

export default function EnhancedGoalsContent({ user }: GoalsContentProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active')
  const [showCalendar, setShowCalendar] = useState(true) // Open by default
  const [showNotifPrefs, setShowNotifPrefs] = useState(false)

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals?includeSubGoals=true')
      if (response.ok) {
        const data = await response.json()
        setGoals(data)
      }
    } catch (error) {
      console.error("Error fetching goals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateGoal = async (goalId: string, data: any) => {
    fetchGoals()
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return
    try {
      const response = await fetch(`/api/goals/${goalId}`, { method: 'DELETE' })
      if (response.ok) fetchGoals()
    } catch (error) {
      console.error("Error deleting goal:", error)
    }
  }

  // Filter to only parent goals (not sub-goals)
  const parentGoals = goals?.filter(g => !g?.parentGoalId) ?? []
  const activeGoals = parentGoals?.filter(g => g?.status === 'ACTIVE') ?? []
  const completedGoals = parentGoals?.filter(g => g?.status === 'COMPLETED') ?? []
  
  // Calculate stats
  const averageProgress = parentGoals?.length > 0
    ? (parentGoals?.reduce((sum, g) => sum + (g?.progress ?? 0), 0) ?? 0) / parentGoals.length
    : 0
  
  const totalMilestones = goals?.reduce((sum, g) => sum + (g?.milestones?.length ?? 0), 0) ?? 0
  const completedMilestones = goals?.reduce((sum, g) => 
    sum + (g?.milestones?.filter((m: any) => m?.status === 'COMPLETED')?.length ?? 0), 0
  ) ?? 0
  
  // Calculate streak (consecutive days with activity)
  const calculateStreak = () => {
    const recentCompletions = goals?.flatMap(g => 
      g?.milestones?.filter((m: any) => m?.completedAt)?.map((m: any) => new Date(m.completedAt)) ?? []
    ) ?? []
    if (recentCompletions.length === 0) return 0
    recentCompletions.sort((a, b) => b.getTime() - a.getTime())
    let streak = 1
    for (let i = 1; i < Math.min(recentCompletions.length, 30); i++) {
      const diff = Math.abs(recentCompletions[i-1].getTime() - recentCompletions[i].getTime())
      if (diff <= 86400000 * 2) streak++
      else break
    }
    return streak
  }
  const streak = calculateStreak()

  const displayGoals = activeTab === 'active' 
    ? activeGoals 
    : activeTab === 'completed' 
    ? completedGoals 
    : parentGoals

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Goals & Milestones 🎯
              </h1>
              <p className="text-slate-400 text-lg">
                Your roadmap to pickleball mastery, {user?.firstName ?? 'Champion'}!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotifPrefs(!showNotifPrefs)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCalendar(!showCalendar)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
              <CreateGoalDialog onGoalCreated={fetchGoals} />
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {[
              { icon: Target, label: "Active Goals", value: activeGoals?.length ?? 0, color: "from-teal-500 to-emerald-500", border: "border-teal-500/30" },
              { icon: Trophy, label: "Completed", value: completedGoals?.length ?? 0, color: "from-amber-500 to-orange-500", border: "border-amber-500/30" },
              { icon: TrendingUp, label: "Avg Progress", value: Math.round(averageProgress), suffix: "%", color: "from-blue-500 to-cyan-500", border: "border-blue-500/30" },
              { icon: Flame, label: "Day Streak", value: streak, color: "from-red-500 to-orange-500", border: "border-red-500/30" },
              { icon: Star, label: "Milestones Done", value: completedMilestones, color: "from-purple-500 to-pink-500", border: "border-purple-500/30" },
              { icon: Award, label: "Total Milestones", value: totalMilestones, color: "from-emerald-500 to-teal-500", border: "border-emerald-500/30" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`bg-slate-800/60 backdrop-blur-sm border ${stat.border} shadow-lg hover:shadow-xl transition-all`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <stat.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">
                          <AnimatedCounter value={stat.value} />{stat.suffix ?? ''}
                        </div>
                        <div className="text-xs text-slate-400">{stat.label}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Notification Preferences Panel */}
        <AnimatePresence>
          {showNotifPrefs && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <GoalNotificationPrefs userId={user?.id} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Milestone Calendar */}
        <AnimatePresence>
          {showCalendar && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <MilestoneCalendar goals={goals} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goals List */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-8">
          <TabsList className="bg-slate-800/60 border border-slate-700 p-1">
            <TabsTrigger value="active" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
              Active ({activeGoals?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
              Completed ({completedGoals?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
              All ({parentGoals?.length ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 rounded-full border-4 border-solid border-teal-500 border-r-transparent animate-spin"></div>
                <p className="mt-4 text-slate-400">Loading goals...</p>
              </div>
            ) : (displayGoals?.length ?? 0) > 0 ? (
              <div className="space-y-6">
                <AnimatePresence>
                  {displayGoals?.map((goal) => (
                    <EnhancedGoalCard
                      key={goal?.id}
                      goal={goal}
                      allGoals={goals}
                      onUpdate={handleUpdateGoal}
                      onDelete={handleDeleteGoal}
                      onRefresh={fetchGoals}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="bg-gradient-to-br from-slate-800/80 to-emerald-900/30 border-slate-700">
                  <CardContent className="py-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20">
                      <Sparkles className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {activeTab === 'active' ? 'No Active Goals Yet' : 
                       activeTab === 'completed' ? 'No Completed Goals Yet' : 
                       'No Goals Yet'}
                    </h3>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">
                      Start your journey by creating your first goal. Break it down into milestones and sub-goals!
                    </p>
                    <CreateGoalDialog onGoalCreated={fetchGoals} />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AvatarCoach 
        userName={user?.firstName ?? user?.name?.split(' ')?.[0] ?? 'Champion'} 
        context="goals" 
      />
    </div>
  )
}
