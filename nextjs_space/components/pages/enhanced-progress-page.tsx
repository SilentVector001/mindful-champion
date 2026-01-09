// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, Trophy, Target, Award, Zap, Calendar,
  CheckCircle2, Star, Medal, Crown, Gift, ChevronRight,
  Plus, Flag, Flame, BarChart3
} from "lucide-react"
import MainNavigation from "@/components/navigation/main-navigation"

interface EnhancedProgressPageProps {
  user: any
}

export default function EnhancedProgressPage({ user }: EnhancedProgressPageProps) {
  const [goals, setGoals] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'matches' | 'achievements' | 'rewards'>('overview')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [goalsRes, achievementsRes, matchesRes] = await Promise.all([
        fetch('/api/goals'),
        fetch('/api/achievements'),
        fetch('/api/matches')
      ])
      
      if (goalsRes.ok) setGoals(await goalsRes.json())
      if (achievementsRes.ok) {
        const data = await achievementsRes.json()
        setAchievements(data.achievements || [])
      }
      if (matchesRes.ok) setMatches(await matchesRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const totalPoints = user?.totalPoints || 0
  const winRate = user?.totalMatches > 0 ? ((user?.totalWins || 0) / user.totalMatches * 100) : 0
  const currentStreak = user?.currentStreak || 0
  const completedGoals = goals.filter(g => g.status === 'COMPLETED').length
  const unlockedAchievements = achievements.filter(a => a.unlocked).length

  // Rewards based on points
  const rewards = [
    { id: 1, name: 'Early Bird Badge', points: 100, icon: '🌅', unlocked: totalPoints >= 100 },
    { id: 2, name: 'Dedicated Player', points: 500, icon: '🎯', unlocked: totalPoints >= 500 },
    { id: 3, name: 'Rising Star', points: 1000, icon: '⭐', unlocked: totalPoints >= 1000 },
    { id: 4, name: 'Court Master', points: 2500, icon: '🏆', unlocked: totalPoints >= 2500 },
    { id: 5, name: 'Pickleball Pro', points: 5000, icon: '👑', unlocked: totalPoints >= 5000 },
    { id: 6, name: 'Legend Status', points: 10000, icon: '💎', unlocked: totalPoints >= 10000 },
  ]

  const nextReward = rewards.find(r => !r.unlocked) || rewards[rewards.length - 1]
  const progressToNextReward = nextReward ? Math.min((totalPoints / nextReward.points) * 100, 100) : 100

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <motion.div whileHover={{ y: -2 }} className="flex-1">
      <Card className={`bg-gradient-to-br ${color} border-0 shadow-lg`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-xs font-medium uppercase tracking-wide">{title}</p>
              <p className="text-2xl font-bold text-white mt-1">{value}</p>
              {subtext && <p className="text-white/60 text-xs mt-1">{subtext}</p>}
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-slate-900">
      <MainNavigation user={user} />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Your Progress</h1>
          <p className="text-slate-400">Track your pickleball journey and achievements</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'goals', label: 'Goals', icon: Target },
            { id: 'matches', label: 'Matches', icon: Trophy },
            { id: 'achievements', label: 'Achievements', icon: Award },
            { id: 'rewards', label: 'Rewards', icon: Gift }
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className={activeTab === tab.id 
                ? 'bg-cyan-500 hover:bg-cyan-600 text-white' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Total Points" 
            value={totalPoints.toLocaleString()} 
            icon={Star} 
            color="from-amber-500 to-orange-600"
          />
          <StatCard 
            title="Win Rate" 
            value={`${winRate.toFixed(0)}%`} 
            icon={TrendingUp} 
            color="from-emerald-500 to-green-600"
            subtext={`${user?.totalWins || 0} wins`}
          />
          <StatCard 
            title="Current Streak" 
            value={currentStreak} 
            icon={Flame} 
            color="from-red-500 to-rose-600"
            subtext="days active"
          />
          <StatCard 
            title="Achievements" 
            value={unlockedAchievements} 
            icon={Trophy} 
            color="from-purple-500 to-violet-600"
          />
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Next Reward Progress */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-cyan-400" />
                  Next Reward
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{nextReward?.icon}</div>
                  <div>
                    <p className="text-white font-semibold">{nextReward?.name}</p>
                    <p className="text-slate-400 text-sm">{nextReward?.points.toLocaleString()} points needed</p>
                  </div>
                </div>
                <Progress value={progressToNextReward} className="h-3 bg-slate-700" />
                <p className="text-slate-400 text-sm mt-2">
                  {totalPoints.toLocaleString()} / {nextReward?.points.toLocaleString()} points
                </p>
              </CardContent>
            </Card>

            {/* Recent Goals */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  Active Goals
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('goals')} className="text-cyan-400">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {goals.filter(g => g.status !== 'COMPLETED').slice(0, 3).map((goal: any) => (
                  <div key={goal.id} className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium text-sm">{goal.title}</p>
                      <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                        {goal.progress || 0}%
                      </Badge>
                    </div>
                    <Progress value={goal.progress || 0} className="h-2 bg-slate-600" />
                  </div>
                ))}
                {goals.filter(g => g.status !== 'COMPLETED').length === 0 && (
                  <div className="text-center py-4">
                    <Target className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No active goals</p>
                    <Button size="sm" className="mt-2 bg-cyan-500 hover:bg-cyan-600">
                      <Plus className="w-4 h-4 mr-1" /> Add Goal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  Recent Achievements
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('achievements')} className="text-cyan-400">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievements.filter(a => a.unlocked).slice(0, 3).map((achievement: any) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl">{achievement.icon || '🏆'}</div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{achievement.name}</p>
                      <p className="text-slate-400 text-xs">{achievement.points} points</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                ))}
                {achievements.filter(a => a.unlocked).length === 0 && (
                  <div className="text-center py-4">
                    <Award className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No achievements yet</p>
                    <p className="text-slate-500 text-xs">Complete training to earn badges!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Match Summary */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-blue-400" />
                  Match Summary
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('matches')} className="text-cyan-400">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-2xl font-bold text-white">{user?.totalMatches || 0}</p>
                    <p className="text-slate-400 text-xs">Total Played</p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                    <p className="text-2xl font-bold text-emerald-400">{user?.totalWins || 0}</p>
                    <p className="text-slate-400 text-xs">Wins</p>
                  </div>
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-300">{(user?.totalMatches || 0) - (user?.totalWins || 0)}</p>
                    <p className="text-slate-400 text-xs">Losses</p>
                  </div>
                </div>
                {matches.length === 0 && (
                  <div className="text-center mt-4">
                    <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600">
                      <Plus className="w-4 h-4 mr-1" /> Log Your First Match
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-white">Goals & Milestones</CardTitle>
              <Link href="/progress/goals">
                <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600">
                  <Plus className="w-4 h-4 mr-1" /> New Goal
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {goals.length > 0 ? goals.map((goal: any) => (
                <div key={goal.id} className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${goal.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-cyan-500/20'}`}>
                        {goal.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        ) : (
                          <Flag className="w-5 h-5 text-cyan-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{goal.title}</p>
                        <p className="text-slate-400 text-sm">{goal.description}</p>
                      </div>
                    </div>
                    <Badge className={goal.status === 'COMPLETED' 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-amber-500/20 text-amber-400'
                    }>
                      {goal.status === 'COMPLETED' ? 'Completed' : `${goal.progress || 0}%`}
                    </Badge>
                  </div>
                  {goal.status !== 'COMPLETED' && (
                    <Progress value={goal.progress || 0} className="h-2 bg-slate-600" />
                  )}
                  {goal.milestones?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {goal.milestones.map((m: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className={`w-4 h-4 ${m.completed ? 'text-emerald-400' : 'text-slate-600'}`} />
                          <span className={m.completed ? 'text-slate-300' : 'text-slate-500'}>{m.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-white font-medium mb-2">No goals yet</p>
                  <p className="text-slate-400 text-sm mb-4">Set your first goal to track your progress</p>
                  <Link href="/progress/goals">
                    <Button className="bg-cyan-500 hover:bg-cyan-600">
                      <Plus className="w-4 h-4 mr-1" /> Create Your First Goal
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-white">Match History</CardTitle>
              <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600">
                <Plus className="w-4 h-4 mr-1" /> Log Match
              </Button>
            </CardHeader>
            <CardContent>
              {user?.Match?.length > 0 ? (
                <div className="space-y-3">
                  {user.Match.map((match: any) => (
                    <div key={match.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${match.result === 'win' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                          {match.result === 'win' ? '✓' : '✗'}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {match.result === 'win' ? 'Victory' : 'Defeat'}
                          </p>
                          <p className="text-slate-400 text-sm">
                            {match.opponentName || 'Opponent'} • {match.score || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={match.result === 'win' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}>
                          {match.result?.toUpperCase()}
                        </Badge>
                        <p className="text-slate-500 text-xs mt-1">
                          {new Date(match.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-white font-medium mb-2">No matches logged</p>
                  <p className="text-slate-400 text-sm mb-4">Start tracking your games to see your progress</p>
                  <Button className="bg-cyan-500 hover:bg-cyan-600">
                    <Plus className="w-4 h-4 mr-1" /> Log Your First Match
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            {/* Header with Explanation */}
            <div className="bg-gradient-to-r from-purple-900/30 via-slate-800 to-amber-900/30 rounded-xl p-5 border border-purple-500/20">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="text-3xl">🏆</span> Achievement Gallery
                  </h2>
                  <p className="text-purple-300 mt-1">{unlockedAchievements} of {achievements.length} unlocked</p>
                  <p className="text-slate-400 text-sm mt-2 max-w-xl">
                    Achievements are badges you earn by completing specific milestones like uploading videos, 
                    winning matches, or maintaining streaks. Each achievement awards <span className="text-amber-400 font-semibold">Reward Points</span> you can 
                    spend in the <Link href="/rewards" className="text-cyan-400 hover:underline">Rewards Marketplace</Link>!
                  </p>
                </div>
                <Link href="/progress/achievements">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/30">
                    View Full Gallery →
                  </Button>
                </Link>
              </div>
            </div>

            {/* Achievement Grid - Enhanced with Colors */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.slice(0, 8).map((achievement: any, index: number) => {
                const tierGradients: Record<string, string> = {
                  BRONZE: 'from-orange-600/20 to-amber-700/20 border-orange-500/50',
                  SILVER: 'from-slate-400/20 to-gray-500/20 border-slate-400/50',
                  GOLD: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/50',
                  PLATINUM: 'from-cyan-400/20 to-purple-500/20 border-cyan-400/50',
                };
                const tier = achievement.tier || 'BRONZE';
                const gradient = tierGradients[tier] || tierGradients.BRONZE;
                
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className={`relative p-4 rounded-xl border-2 text-center transition-all ${
                      achievement.unlocked 
                        ? `bg-gradient-to-br ${gradient} shadow-lg` 
                        : 'bg-slate-800/30 border-slate-700/50 opacity-50'
                    }`}
                  >
                    {achievement.unlocked && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
                      >
                        <span className="text-white text-xs">✓</span>
                      </motion.div>
                    )}
                    <motion.div 
                      className="text-5xl mb-3"
                      animate={achievement.unlocked ? { rotate: [0, 5, -5, 0] } : {}}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      {achievement.icon || '🏆'}
                    </motion.div>
                    <p className={`font-semibold text-sm ${achievement.unlocked ? 'text-white' : 'text-slate-500'}`}>
                      {achievement.name}
                    </p>
                    <p className={`text-xs mt-1 font-bold ${achievement.unlocked ? 'text-amber-400' : 'text-slate-600'}`}>
                      +{achievement.points} pts
                    </p>
                    {achievement.tier && achievement.unlocked && (
                      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
                        tier === 'GOLD' ? 'bg-yellow-500/30 text-yellow-300' :
                        tier === 'SILVER' ? 'bg-slate-400/30 text-slate-200' :
                        tier === 'PLATINUM' ? 'bg-cyan-500/30 text-cyan-300' :
                        'bg-orange-500/30 text-orange-300'
                      }`}>
                        {tier}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            {/* Header with Explanation */}
            <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-orange-900/30 rounded-xl p-5 border border-amber-500/20">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="text-3xl">🎁</span> Rewards & Milestones
                  </h2>
                  <p className="text-amber-300 mt-1">Your Points: <span className="font-bold text-2xl">{totalPoints.toLocaleString()}</span></p>
                  <p className="text-slate-400 text-sm mt-2 max-w-xl">
                    Earn points by unlocking achievements, completing training, and logging matches. 
                    Redeem your points for exclusive pickleball gear and perks in the Marketplace!
                  </p>
                </div>
                <Link href="/rewards">
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/30">
                    Visit Rewards Hub →
                  </Button>
                </Link>
              </div>
            </div>

            {/* Progress to Next Milestone */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-medium">Progress to Next Milestone</p>
                  <p className="text-amber-400 font-bold">{progressToNextReward.toFixed(0)}%</p>
                </div>
                <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNextReward}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                  />
                </div>
                <p className="text-slate-400 text-sm mt-2">
                  Next: <span className="text-white">{nextReward?.name}</span> ({nextReward?.points.toLocaleString()} pts)
                </p>
              </CardContent>
            </Card>

            {/* Point Milestones */}
            <div className="space-y-3">
              {rewards.map((reward, i) => (
                <motion.div 
                  key={reward.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    reward.unlocked 
                      ? 'bg-gradient-to-r from-amber-500/15 to-orange-500/15 border-amber-500/50 shadow-lg shadow-amber-500/10' 
                      : 'bg-slate-800/30 border-slate-700/50'
                  }`}
                >
                  <motion.div 
                    className={`text-4xl ${!reward.unlocked && 'grayscale opacity-40'}`}
                    animate={reward.unlocked ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {reward.icon}
                  </motion.div>
                  <div className="flex-1">
                    <p className={`font-semibold ${reward.unlocked ? 'text-white' : 'text-slate-400'}`}>
                      {reward.name}
                    </p>
                    <p className={`text-sm ${reward.unlocked ? 'text-amber-400' : 'text-slate-500'}`}>
                      {reward.points.toLocaleString()} points
                    </p>
                  </div>
                  {reward.unlocked ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Unlocked
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-700/50 text-slate-300 px-3 py-1">
                      {(reward.points - totalPoints).toLocaleString()} to go
                    </Badge>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Link to Goals */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-cyan-400" />
                <div>
                  <p className="text-white font-medium">Want to track specific goals?</p>
                  <p className="text-slate-400 text-sm">Set custom goals in the Goals tab</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('goals')}
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              >
                Go to Goals →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
