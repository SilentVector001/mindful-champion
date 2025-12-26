
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart, ComposedChart
} from 'recharts'
import {
  Activity, TrendingUp, Target, Zap, Award, BarChart3, Gauge,
  Trophy, Star, ArrowUp, ArrowDown, Minus, Eye, Brain, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface InteractiveDashboardProps {
  analysisData: any
  className?: string
}

export default function InteractiveDashboard({ analysisData, className }: InteractiveDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState('overall')
  const [comparisonLevel, setComparisonLevel] = useState('intermediate')

  // Shot Accuracy Over Time Data
  const shotAccuracyData = [
    { time: '0:00', accuracy: 45, power: 60 },
    { time: '0:15', accuracy: 52, power: 65 },
    { time: '0:30', accuracy: 58, power: 70 },
    { time: '0:45', accuracy: 65, power: 72 },
    { time: '1:00', accuracy: 72, power: 75 },
    { time: '1:15', accuracy: 78, power: 78 },
    { time: '1:30', accuracy: 82, power: 80 },
    { time: '1:45', accuracy: 85, power: 82 },
    { time: '2:00', accuracy: 82, power: 85 }
  ]

  // Power Distribution by Shot Type (Radar)
  const powerDistribution = [
    { shot: 'Serve', you: 85, pro: 92, average: 75 },
    { shot: 'Forehand', you: 78, pro: 90, average: 72 },
    { shot: 'Backhand', you: 72, pro: 85, average: 68 },
    { shot: 'Volley', you: 68, pro: 88, average: 65 },
    { shot: 'Dink', you: 82, pro: 95, average: 78 },
    { shot: 'Lob', you: 75, pro: 88, average: 70 }
  ]

  // Court Coverage Heatmap Data
  const courtCoverageData = [
    { zone: 'Front Left', coverage: 85, quality: 78 },
    { zone: 'Front Center', coverage: 92, quality: 88 },
    { zone: 'Front Right', coverage: 80, quality: 75 },
    { zone: 'Mid Left', coverage: 78, quality: 82 },
    { zone: 'Mid Center', coverage: 95, quality: 92 },
    { zone: 'Mid Right', coverage: 75, quality: 78 },
    { zone: 'Back Left', coverage: 68, quality: 72 },
    { zone: 'Back Center', coverage: 72, quality: 75 },
    { zone: 'Back Right', coverage: 65, quality: 68 }
  ]

  // Movement Efficiency
  const movementEfficiency = [
    { metric: 'Agility', score: 82, benchmark: 75 },
    { metric: 'Speed', score: 78, benchmark: 80 },
    { metric: 'Recovery', score: 85, benchmark: 78 },
    { metric: 'Positioning', score: 88, benchmark: 82 },
    { metric: 'Footwork', score: 75, benchmark: 78 }
  ]

  // Technical Scores
  const technicalScores = [
    { name: 'Grip Technique', score: 88, max: 100, trend: 'up', change: '+5%' },
    { name: 'Body Positioning', score: 82, max: 100, trend: 'up', change: '+3%' },
    { name: 'Weight Transfer', score: 75, max: 100, trend: 'down', change: '-2%' },
    { name: 'Follow Through', score: 90, max: 100, trend: 'up', change: '+8%' },
    { name: 'Court Awareness', score: 85, max: 100, trend: 'same', change: '0%' },
    { name: 'Shot Selection', score: 78, max: 100, trend: 'up', change: '+4%' }
  ]

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <ArrowUp className="w-3 h-3 text-emerald-400" />
    if (trend === 'down') return <ArrowDown className="w-3 h-3 text-red-400" />
    return <Minus className="w-3 h-3 text-slate-400" />
  }

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-emerald-400'
    if (trend === 'down') return 'text-red-400'
    return 'text-slate-400'
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Interactive Analytics Dashboard</h2>
            <p className="text-slate-400">Deep dive into your performance metrics</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-2">
            <Eye className="w-4 h-4" />
            3D View
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <Brain className="w-4 h-4" />
            AI Insights
          </Button>
        </div>
      </div>

      {/* Overall Score Card with Breakdown */}
      <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-6">
            {/* Overall Score */}
            <div className="col-span-1 flex flex-col items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-slate-700"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(82 / 100) * 351.86} 351.86`}
                    className="text-cyan-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">82</span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
              </div>
              <p className="mt-4 text-sm font-medium text-white">Overall Score</p>
              <Badge className="mt-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                +5 from last analysis
              </Badge>
            </div>
            
            {/* Score Breakdown */}
            <div className="col-span-3 space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Score Breakdown</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Technical</span>
                    <span className="text-cyan-400 font-medium">85/100</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Movement</span>
                    <span className="text-blue-400 font-medium">78/100</span>
                  </div>
                  <Progress value={78} className="h-2 [&>div]:bg-blue-500" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Strategy</span>
                    <span className="text-purple-400 font-medium">82/100</span>
                  </div>
                  <Progress value={82} className="h-2 [&>div]:bg-purple-500" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Consistency</span>
                    <span className="text-emerald-400 font-medium">88/100</span>
                  </div>
                  <Progress value={88} className="h-2 [&>div]:bg-emerald-500" />
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-3 pt-4 border-t border-slate-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">156</div>
                  <div className="text-xs text-slate-400">Total Shots</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">78%</div>
                  <div className="text-xs text-slate-400">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">12</div>
                  <div className="text-xs text-slate-400">Key Moments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">3:24</div>
                  <div className="text-xs text-slate-400">Duration</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Shot Accuracy Over Time */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Shot Accuracy Over Time
            </CardTitle>
            <CardDescription>
              Your accuracy improved by 37 points during the match
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={shotAccuracyData}>
                <defs>
                  <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px'
                  }}
                />
                <Area type="monotone" dataKey="accuracy" stroke="#06b6d4" fillOpacity={1} fill="url(#colorAccuracy)" />
                <Area type="monotone" dataKey="power" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPower)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Power Distribution Radar */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Shot Type Analysis
            </CardTitle>
            <CardDescription>
              Compare your performance across different shot types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={powerDistribution}>
                <PolarGrid stroke="#475569" />
                <PolarAngleAxis dataKey="shot" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" style={{ fontSize: '10px' }} />
                <Radar name="You" dataKey="you" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.5} />
                <Radar name="Pro Average" dataKey="pro" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Court Coverage Heatmap */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Court Coverage Heatmap
            </CardTitle>
            <CardDescription>
              Your positioning and movement across the court
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {courtCoverageData.map((zone, index) => {
                const getHeatColor = (coverage: number) => {
                  if (coverage >= 85) return 'bg-emerald-500'
                  if (coverage >= 70) return 'bg-cyan-500'
                  if (coverage >= 55) return 'bg-amber-500'
                  return 'bg-red-500'
                }
                
                return (
                  <motion.div
                    key={zone.zone}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "aspect-square rounded-lg p-3 border border-slate-600 relative overflow-hidden",
                      getHeatColor(zone.coverage)
                    )}
                    style={{ opacity: zone.coverage / 100 }}
                  >
                    <div className="relative z-10">
                      <div className="text-xs font-medium text-white mb-1">{zone.zone}</div>
                      <div className="text-2xl font-bold text-white">{zone.coverage}%</div>
                      <div className="text-xs text-white/80">Quality: {zone.quality}%</div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Movement Efficiency */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Movement Efficiency
            </CardTitle>
            <CardDescription>
              How well you move compared to skill level benchmark
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={movementEfficiency} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis dataKey="metric" type="category" stroke="#94a3b8" style={{ fontSize: '12px' }} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="score" fill="#06b6d4" radius={[0, 8, 8, 0]} />
                <Bar dataKey="benchmark" fill="#475569" radius={[0, 4, 4, 0]} opacity={0.5} />
                <Legend />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Technical Scores Grid */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Gauge className="w-5 h-5 text-cyan-400" />
            Technical Scores
          </CardTitle>
          <CardDescription>
            Detailed breakdown of technique components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicalScores.map((score, index) => (
              <motion.div
                key={score.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-900/50 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{score.name}</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(score.trend)}
                    <span className={cn("text-xs font-medium", getTrendColor(score.trend))}>
                      {score.change}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-bold text-white">{score.score}</span>
                    <span className="text-sm text-slate-400">/ {score.max}</span>
                  </div>
                  <Progress value={score.score} className="h-2" />
                </div>
                
                {score.score >= 85 && (
                  <Badge className="w-full justify-center bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <Star className="w-3 h-3 mr-1" />
                    Excellent
                  </Badge>
                )}
                {score.score >= 70 && score.score < 85 && (
                  <Badge className="w-full justify-center bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                    Good
                  </Badge>
                )}
                {score.score < 70 && (
                  <Badge className="w-full justify-center bg-amber-500/20 text-amber-400 border-amber-500/30">
                    Needs Improvement
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
