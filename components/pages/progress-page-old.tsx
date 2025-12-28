
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  Calendar,
  Award,
  Zap,
  BarChart3
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import SimplifiedNav from "@/components/layout/simplified-nav"
import PersistentAvatar from "@/components/avatar/persistent-avatar"

interface ProgressPageProps {
  user: any
}

export default function ProgressPage({ user }: ProgressPageProps) {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month')

  // Calculate key metrics
  const winRate = user?.totalMatches ? ((user.totalWins || 0) / user.totalMatches * 100) : 0
  const recentMatches = user?.matches?.slice(0, 5) || []
  const recentWinRate = recentMatches.length > 0 
    ? (recentMatches.filter((m: any) => m.result === 'win').length / recentMatches.length * 100)
    : 0

  // Mock performance data - in real app would come from user's actual matches
  const performanceData = [
    { date: 'Week 1', winRate: 45, rating: 2.0 },
    { date: 'Week 2', winRate: 52, rating: 2.1 },
    { date: 'Week 3', winRate: 58, rating: 2.2 },
    { date: 'Week 4', winRate: 65, rating: 2.3 },
    { date: 'Week 5', winRate: winRate, rating: parseFloat(user?.playerRating || '2.0') },
  ]

  // Skill breakdown data
  const skillData = [
    { name: 'Serving', value: 75, color: '#10b981' },
    { name: 'Dinking', value: 68, color: '#3b82f6' },
    { name: 'Volleys', value: 82, color: '#8b5cf6' },
    { name: 'Third Shot', value: 45, color: '#f59e0b' },
  ]

  const statCards = [
    {
      title: "Overall Win Rate",
      value: `${winRate.toFixed(1)}%`,
      change: recentWinRate > winRate ? `+${(recentWinRate - winRate).toFixed(1)}%` : `${(recentWinRate - winRate).toFixed(1)}%`,
      isPositive: recentWinRate >= winRate,
      icon: Trophy,
      gradient: "from-teal-500 to-orange-500"
    },
    {
      title: "Player Rating",
      value: user?.playerRating || "2.0",
      change: "+0.3",
      isPositive: true,
      icon: Target,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Current Streak",
      value: `${user?.currentStreak || 0} days`,
      change: "Active",
      isPositive: true,
      icon: Zap,
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "Total Matches",
      value: user?.totalMatches || 0,
      change: recentMatches.length > 0 ? `+${recentMatches.length} recent` : "No recent",
      isPositive: recentMatches.length > 0,
      icon: Calendar,
      gradient: "from-purple-500 to-pink-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <SimplifiedNav />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Progress Analytics 📊
          </h1>
          <p className="text-slate-600 mb-4">
            Track your improvement journey and celebrate your wins, {user?.firstName || 'Champion'}!
          </p>
          
          {/* Timeframe Selection */}
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(period)}
                className={timeframe === period ? "bg-gradient-to-r from-blue-500 to-cyan-500" : ""}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="border-0 bg-white shadow-sm hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      stat.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {stat.change}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600">
                    {stat.title}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 bg-white shadow-sm h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Trend
                  </CardTitle>
                  <Badge variant="outline">Last 5 weeks</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="winRate" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 7, fill: '#10b981' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Skill Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 bg-white shadow-sm h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Skill Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={skillData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {skillData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {skillData.map((skill, index) => (
                    <div key={skill.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: skill.color }}
                        />
                        <span className="text-slate-700">{skill.name}</span>
                      </div>
                      <span className="font-medium">{skill.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Matches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Recent Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentMatches.length > 0 ? (
                <div className="space-y-4">
                  {recentMatches.map((match: any, index: number) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${
                          match.result === 'win' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <div className="font-medium text-slate-900">
                            vs {match.opponent}
                          </div>
                          <div className="text-sm text-slate-600">
                            {new Date(match.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-bold">
                          {match.playerScore} - {match.opponentScore}
                        </div>
                        <Badge 
                          variant={match.result === 'win' ? "default" : "destructive"}
                          className={match.result === 'win' ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          {match.result === 'win' ? 'W' : 'L'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Trophy className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>No matches recorded yet</p>
                  <p className="text-sm">Start logging your games to see your progress!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Improvement Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="border-0 bg-gradient-to-r from-teal-50 to-orange-50 border-teal-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">AI Insights</h3>
                  <p className="text-slate-700 mb-3">
                    Your win rate has improved by {Math.abs(recentWinRate - winRate).toFixed(1)}% in recent matches! 
                    Focus on your third shot drop (45% proficiency) to reach the next level. 
                    Your serving and volleys are already strong foundations.
                  </p>
                  <Button size="sm" className="bg-gradient-to-r from-teal-600 to-orange-600 hover:from-teal-700 hover:to-orange-700">
                    Get Detailed Analysis
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Persistent Avatar */}
      <PersistentAvatar currentPage="progress" />
    </div>
  )
}
