
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Target, Trophy, TrendingUp, Calendar, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GoalCard from "./goal-card"
import CreateGoalDialog from "./create-goal-dialog"
import AvatarCoach from "@/components/avatar/avatar-coach"
import CompactNotificationCenter from "@/components/notifications/compact-notification-center"

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
  milestones: any[]
}

interface GoalsContentProps {
  user: any
}

export default function GoalsContent({ user }: GoalsContentProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active')

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals')
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
    // Refresh goals after update
    fetchGoals()
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchGoals()
      }
    } catch (error) {
      console.error("Error deleting goal:", error)
    }
  }

  const activeGoals = goals.filter(g => g.status === 'ACTIVE')
  const completedGoals = goals.filter(g => g.status === 'COMPLETED')
  const averageProgress = goals.length > 0
    ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length
    : 0

  const displayGoals = activeTab === 'active' 
    ? activeGoals 
    : activeTab === 'completed' 
    ? completedGoals 
    : goals

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Goals & Milestones 🎯
              </h1>
              <p className="text-slate-600">
                Your roadmap to pickleball mastery, {user?.firstName || 'Champion'}!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <CompactNotificationCenter position="relative" />
              <CreateGoalDialog onGoalCreated={fetchGoals} />
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{activeGoals.length}</div>
                    <div className="text-xs text-slate-600">Active Goals</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{completedGoals.length}</div>
                    <div className="text-xs text-slate-600">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      {Math.round(averageProgress)}%
                    </div>
                    <div className="text-xs text-slate-600">Avg Progress</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      {user?.onboardingCompletedAt 
                        ? Math.ceil((Date.now() - new Date(user.onboardingCompletedAt).getTime()) / (1000 * 60 * 60 * 24))
                        : 0}
                    </div>
                    <div className="text-xs text-slate-600">Days Training</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Goals List */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="active">Active ({activeGoals.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedGoals.length})</TabsTrigger>
            <TabsTrigger value="all">All ({goals.length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
                <p className="mt-4 text-slate-600">Loading goals...</p>
              </div>
            ) : displayGoals.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {displayGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onUpdate={handleUpdateGoal}
                      onDelete={handleDeleteGoal}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card className="border-0 shadow-sm bg-gradient-to-br from-teal-50 to-orange-50">
                  <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {activeTab === 'active' ? 'No Active Goals Yet' : 
                       activeTab === 'completed' ? 'No Completed Goals Yet' : 
                       'No Goals Yet'}
                    </h3>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                      {activeTab === 'active' 
                        ? "Start your journey by creating your first goal. Break it down into milestones and watch your progress grow!"
                        : activeTab === 'completed'
                        ? "Complete your first goal and it will appear here as a badge of honor!"
                        : "Set your first improvement goal and start tracking your journey to mastery!"}
                    </p>
                    <CreateGoalDialog onGoalCreated={fetchGoals} />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>

        {/* Suggested Goals (if no goals exist) */}
        {goals.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-teal-600" />
                  Suggested Goals Based on Your Profile
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      title: "Master the Third Shot Drop",
                      category: "SKILL_IMPROVEMENT",
                      description: "Develop consistency and control in your third shot drops",
                      color: "from-blue-500 to-cyan-500"
                    },
                    {
                      title: "Win 10 Practice Matches",
                      category: "TOURNAMENT",
                      description: "Build match experience and competitive confidence",
                      color: "from-purple-500 to-pink-500"
                    },
                    {
                      title: "Improve Mental Toughness",
                      category: "MENTAL_GAME",
                      description: "Stay focused and calm under pressure",
                      color: "from-orange-500 to-red-500"
                    },
                    {
                      title: "Increase DUPR Rating to 3.0",
                      category: "SKILL_IMPROVEMENT",
                      description: "Level up your overall game and rating",
                      color: "from-green-500 to-emerald-500"
                    },
                    {
                      title: "Find 3 Practice Partners",
                      category: "SOCIAL",
                      description: "Build your pickleball community",
                      color: "from-teal-500 to-blue-500"
                    },
                    {
                      title: "Complete 20 Training Sessions",
                      category: "SKILL_IMPROVEMENT",
                      description: "Build consistent practice habits",
                      color: "from-slate-500 to-gray-600"
                    }
                  ].map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ y: -4 }}
                      className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className={`w-10 h-10 bg-gradient-to-r ${suggestion.color} rounded-lg flex items-center justify-center mb-3`}>
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-1">{suggestion.title}</h4>
                      <p className="text-sm text-slate-600">{suggestion.description}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Avatar Coach */}
      <AvatarCoach 
        userName={user?.firstName || user?.name?.split(' ')[0] || 'Champion'} 
        context="goals" 
      />
    </div>
  )
}
