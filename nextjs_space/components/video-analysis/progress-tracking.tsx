
"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart
} from 'recharts'
import {
  Calendar, TrendingUp, Award, Trophy, Star, Sparkles, Target,
  ArrowUp, CheckCircle2, Zap, Crown, Medal, ChevronRight, Play,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface ProgressTrackingProps {
  userId: string
  currentAnalysis: any
  className?: string
}

export default function ProgressTracking({ userId, currentAnalysis, className }: ProgressTrackingProps) {
  const [selectedMetric, setSelectedMetric] = useState('overall')
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  // Historical progress data
  const progressData = [
    { date: 'Week 1', overall: 65, technical: 62, movement: 68, strategy: 63 },
    { date: 'Week 2', overall: 70, technical: 68, movement: 72, strategy: 68 },
    { date: 'Week 3', overall: 73, technical: 71, movement: 75, strategy: 72 },
    { date: 'Week 4', overall: 78, technical: 76, movement: 80, strategy: 76 },
    { date: 'Week 5', overall: 82, technical: 85, movement: 78, strategy: 82 }
  ]

  // Milestone achievements
  const achievements = [
    {
      id: 1,
      title: 'First Analysis Complete',
      description: 'Started your improvement journey',
      icon: Star,
      date: '4 weeks ago',
      unlocked: true,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 2,
      title: 'Score Milestone: 70+',
      description: 'Reached intermediate level',
      icon: Target,
      date: '3 weeks ago',
      unlocked: true,
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 3,
      title: 'Score Milestone: 80+',
      description: 'Advanced player status achieved',
      icon: Trophy,
      date: 'Just now',
      unlocked: true,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 4,
      title: 'Consistency Master',
      description: 'Maintained 80+ score for 3 videos',
      icon: CheckCircle2,
      date: 'Locked',
      unlocked: false,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 5,
      title: 'Pro Player',
      description: 'Achieve a score of 90+',
      icon: Crown,
      date: 'Locked',
      unlocked: false,
      color: 'from-amber-500 to-orange-600'
    },
    {
      id: 6,
      title: 'Perfect Form',
      description: 'Get 95+ in all categories',
      icon: Sparkles,
      date: 'Locked',
      unlocked: false,
      color: 'from-pink-500 to-rose-600'
    }
  ]

  // Video timeline
  const videoTimeline = [
    {
      id: 1,
      title: 'Baseline Assessment',
      date: '4 weeks ago',
      score: 65,
      thumbnail: '/placeholder-video1.jpg',
      improvements: ['Grip technique', 'Body positioning']
    },
    {
      id: 2,
      title: 'Practice Session 1',
      date: '3 weeks ago',
      score: 70,
      thumbnail: '/placeholder-video2.jpg',
      improvements: ['Weight transfer', 'Follow through']
    },
    {
      id: 3,
      title: 'Tournament Match',
      date: '2 weeks ago',
      score: 73,
      thumbnail: '/placeholder-video3.jpg',
      improvements: ['Shot selection', 'Court awareness']
    },
    {
      id: 4,
      title: 'Practice Session 2',
      date: '1 week ago',
      score: 78,
      thumbnail: '/placeholder-video4.jpg',
      improvements: ['Movement efficiency', 'Timing']
    },
    {
      id: 5,
      title: 'Latest Analysis',
      date: 'Today',
      score: 82,
      thumbnail: '/placeholder-video5.jpg',
      improvements: ['All-around improvement'],
      current: true
    }
  ]

  // Metric improvements
  const metricImprovements = [
    { name: 'Overall Score', before: 65, after: 82, improvement: 17, unit: 'pts' },
    { name: 'Technical', before: 62, after: 85, improvement: 23, unit: 'pts' },
    { name: 'Movement', before: 68, after: 78, improvement: 10, unit: 'pts' },
    { name: 'Strategy', before: 63, after: 82, improvement: 19, unit: 'pts' },
    { name: 'Consistency', before: 70, after: 88, improvement: 18, unit: 'pts' },
    { name: 'Shot Accuracy', before: 45, after: 85, improvement: 40, unit: '%' }
  ]

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400'
    if (score >= 75) return 'text-cyan-400'
    if (score >= 65) return 'text-blue-400'
    return 'text-slate-400'
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    if (score >= 75) return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    if (score >= 65) return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Progress Tracking</h2>
            <p className="text-slate-400">Your improvement journey over time</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={selectedPeriod === 'week' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('week')}
            className={cn(selectedPeriod === 'week' && 'bg-purple-500 hover:bg-purple-600')}
          >
            Week
          </Button>
          <Button
            size="sm"
            variant={selectedPeriod === 'month' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('month')}
            className={cn(selectedPeriod === 'month' && 'bg-purple-500 hover:bg-purple-600')}
          >
            Month
          </Button>
          <Button
            size="sm"
            variant={selectedPeriod === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('all')}
            className={cn(selectedPeriod === 'all' && 'bg-purple-500 hover:bg-purple-600')}
          >
            All Time
          </Button>
        </div>
      </div>

      {/* Progress Graph */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Score Progression
          </CardTitle>
          <CardDescription>
            You've improved by <span className="text-emerald-400 font-semibold">17 points</span> in the last 4 weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={progressData}>
              <defs>
                <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="overall"
                stroke="#a855f7"
                fillOpacity={1}
                fill="url(#colorOverall)"
                strokeWidth={3}
              />
              <Line type="monotone" dataKey="technical" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="movement" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="strategy" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Video Timeline */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Video History Timeline
          </CardTitle>
          <CardDescription>
            Track your performance across all analyzed videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-6">
            {/* Timeline line */}
            <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-purple-500 via-cyan-500 to-emerald-500" />
            
            {videoTimeline.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex gap-4"
              >
                {/* Timeline dot */}
                <div className={cn(
                  "relative z-10 w-14 h-14 rounded-full border-4 flex items-center justify-center flex-shrink-0",
                  video.current
                    ? "bg-gradient-to-br from-purple-500 to-pink-600 border-purple-400"
                    : "bg-slate-800 border-slate-600"
                )}>
                  {video.current ? (
                    <Sparkles className="w-6 h-6 text-white" />
                  ) : (
                    <span className="text-lg font-bold text-white">{video.id}</span>
                  )}
                </div>
                
                {/* Video card */}
                <Card className={cn(
                  "flex-1",
                  video.current
                    ? "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-purple-500/50"
                    : "bg-slate-900/50 border-slate-700"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{video.title}</h4>
                        <p className="text-sm text-slate-400">{video.date}</p>
                      </div>
                      <Badge className={cn("ml-4", getScoreBadgeColor(video.score))}>
                        {video.score}/100
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {video.improvements.map((improvement, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {improvement}
                        </Badge>
                      ))}
                    </div>
                    
                    {video.current && (
                      <Button size="sm" className="w-full bg-purple-500 hover:bg-purple-600">
                        <Play className="w-4 h-4 mr-2" />
                        View Analysis
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metric Improvements */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Before vs After: Key Metrics
          </CardTitle>
          <CardDescription>
            Compare your first analysis with your latest performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {metricImprovements.map((metric, index) => (
              <motion.div
                key={metric.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-900/50 rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{metric.name}</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    +{metric.improvement}{metric.unit}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {/* Before */}
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-400">Before (Week 1)</span>
                      <span className="text-slate-300 font-medium">{metric.before}{metric.unit}</span>
                    </div>
                    <Progress value={metric.before} className="h-2 [&>div]:bg-slate-500" />
                  </div>
                  
                  {/* After */}
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-400">After (Latest)</span>
                      <span className="text-emerald-400 font-medium">{metric.after}{metric.unit}</span>
                    </div>
                    <Progress value={metric.after} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-emerald-500" />
                  </div>
                </div>
                
                {/* Improvement percentage */}
                <div className="text-center pt-2 border-t border-slate-700">
                  <span className="text-2xl font-bold text-emerald-400">
                    {Math.round((metric.improvement / metric.before) * 100)}%
                  </span>
                  <span className="text-xs text-slate-400 ml-1">improvement</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Badges */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            Achievements & Milestones
          </CardTitle>
          <CardDescription>
            Unlock badges as you improve your skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon
              
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "relative rounded-lg p-6 border-2 transition-all",
                    achievement.unlocked
                      ? "bg-slate-900/50 border-slate-600 hover:border-purple-500/50"
                      : "bg-slate-900/30 border-slate-700/50 opacity-60"
                  )}
                >
                  {achievement.unlocked && (
                    <div className="absolute inset-0 bg-gradient-to-br opacity-5 rounded-lg"
                      style={{
                        backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`
                      }}
                    />
                  )}
                  
                  <div className="relative space-y-3">
                    <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center mx-auto",
                      achievement.unlocked
                        ? `bg-gradient-to-br ${achievement.color}`
                        : "bg-slate-800"
                    )}>
                      <Icon className={cn(
                        "w-8 h-8",
                        achievement.unlocked ? "text-white" : "text-slate-600"
                      )} />
                    </div>
                    
                    <div className="text-center space-y-1">
                      <h4 className={cn(
                        "font-semibold",
                        achievement.unlocked ? "text-white" : "text-slate-500"
                      )}>
                        {achievement.title}
                      </h4>
                      <p className="text-xs text-slate-400">{achievement.description}</p>
                      <p className="text-xs text-slate-500 pt-2">{achievement.date}</p>
                    </div>
                    
                    {achievement.unlocked && (
                      <Badge className="w-full justify-center bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Unlocked
                      </Badge>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
