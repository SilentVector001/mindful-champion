
"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import {
  TrendingUp,
  Target,
  BarChart3,
  Activity,
  Users,
  Trophy,
  Star
} from 'lucide-react'

interface ProgressChartsProps {
  userStats: any
  className?: string
}

export default function ProgressCharts({ userStats, className }: ProgressChartsProps) {
  const [activeChart, setActiveChart] = useState<'progress' | 'skills' | 'comparison'>('progress')

  // Mock data for charts - in production this would come from actual user data
  const progressData = [
    { week: 'Week 1', overall: 65, technique: 60, movement: 70, strategy: 55 },
    { week: 'Week 2', overall: 68, technique: 65, movement: 72, strategy: 58 },
    { week: 'Week 3', overall: 72, technique: 70, movement: 75, strategy: 62 },
    { week: 'Week 4', overall: 75, technique: 73, movement: 78, strategy: 68 },
    { week: 'Week 5', overall: 78, technique: 76, movement: 80, strategy: 72 },
    { week: 'Week 6', overall: 82, technique: 80, movement: 83, strategy: 75 }
  ]

  const skillsRadarData = [
    { skill: 'Serving', user: 75, community: 65 },
    { skill: 'Dinking', user: 82, community: 70 },
    { skill: 'Third Shot', user: 68, community: 72 },
    { skill: 'Volleys', user: 85, community: 68 },
    { skill: 'Movement', user: 78, community: 75 },
    { skill: 'Strategy', user: 72, community: 70 }
  ]

  const comparisonData = [
    { metric: 'Training Sessions', user: userStats?.trainingSessions?.count || 12, community: 8 },
    { metric: 'Video Hours', user: Math.floor(userStats?.totalWatchTime || 45), community: 32 },
    { metric: 'Achievements', user: userStats?.achievements?.count || 8, community: 5 },
    { metric: 'Win Rate %', user: userStats?.winRate || 68, community: 55 },
    { metric: 'Streak Days', user: userStats?.dayStreak?.count || 5, community: 3 }
  ]

  const chartTabs = [
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'skills', label: 'Skills', icon: Target },
    { id: 'comparison', label: 'vs Community', icon: Users }
  ]

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress Overview */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-champion-blue" />
              Performance Analytics
            </CardTitle>
            <Badge className="bg-green-100 text-green-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              +15% this month
            </Badge>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 mt-4 p-1 bg-gray-100 rounded-lg">
            {chartTabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveChart(tab.id as any)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all",
                    activeChart === tab.id
                      ? "bg-white text-champion-blue shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </CardHeader>

        <CardContent>
          {/* Progress Over Time */}
          {activeChart === 'progress' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressData}>
                    <defs>
                      <linearGradient id="overallGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="techniqueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="week" 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="overall"
                      stroke="#0ea5e9"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#overallGradient)"
                      name="Overall Score"
                    />
                    <Line
                      type="monotone"
                      dataKey="technique"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      name="Technique"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Skills Radar */}
          {activeChart === 'skills' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={skillsRadarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      className="font-medium"
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                    />
                    <Radar
                      name="Your Skills"
                      dataKey="user"
                      stroke="#0ea5e9"
                      fill="#0ea5e9"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Community Average"
                      dataKey="community"
                      stroke="#94a3b8"
                      fill="#94a3b8"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                    <Legend />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Community Comparison */}
          {activeChart === 'comparison' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="metric" 
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="user" 
                      fill="#0ea5e9" 
                      name="You"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="community" 
                      fill="#94a3b8" 
                      name="Community Average"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8 text-yellow-600" />
              <Badge className="bg-yellow-100 text-yellow-700">
                {userStats?.achievementBreakdown?.gold || 0} Gold
              </Badge>
            </div>
            <div className="text-2xl font-bold text-yellow-700 mb-1">
              {userStats?.achievementBreakdown?.totalPoints || 0}
            </div>
            <div className="text-sm text-yellow-600">Total Points Earned</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-700">
                Active
              </Badge>
            </div>
            <div className="text-2xl font-bold text-blue-700 mb-1">
              {userStats?.completedSessions || 0}
            </div>
            <div className="text-sm text-blue-600">Training Sessions</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Star className="w-8 h-8 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-700">
                Top {((userStats?.userRank?.percentile || 50))}%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-purple-700 mb-1">
              #{userStats?.userRank?.position || '--'}
            </div>
            <div className="text-sm text-purple-600">Community Rank</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
