'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, Clock, Target, TrendingUp, Flame, Trophy, 
  BookOpen, Zap, ArrowRight, Play, Star
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import XPDisplay from './xp-display'
import StreakDisplay from './streak-display'
import BadgesDisplay from './badges-display'

interface TrainingDashboardProps {
  userId: string
}

export default function TrainingDashboard({ userId }: TrainingDashboardProps) {
  const [progressData, setProgressData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/training/progress')
      if (res.ok) {
        const data = await res.json()
        setProgressData(data)
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-slate-800/50 rounded-2xl h-40" />
        ))}
      </div>
    )
  }

  const { programs = [], stats = {}, xp = {}, streak = {}, badges = [] } = progressData || {}
  const activePrograms = programs?.filter((p: any) => p?.status === 'IN_PROGRESS') ?? []
  const nextRecommendedDrill = 'Serve Consistency' // Could be dynamic based on progress

  // Get current week data for calendar
  const today = new Date()
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - today.getDay() + i)
    return {
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
      date: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
      trained: Math.random() > 0.5 // Replace with actual data
    }
  })

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <XPDisplay compact />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StreakDisplay compact />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <BadgesDisplay compact />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">{stats?.totalDrillsCompleted ?? 0}</span>
            </div>
            <div className="text-xs text-emerald-400">Drills Done</div>
          </div>
        </motion.div>
      </div>

      {/* Weekly Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-slate-800/60 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, i) => (
                <div
                  key={i}
                  className={cn(
                    "text-center p-2 rounded-lg transition-all",
                    day.isToday
                      ? "bg-cyan-500/20 border border-cyan-500/50"
                      : day.trained
                        ? "bg-emerald-500/20"
                        : "bg-slate-700/30"
                  )}
                >
                  <div className="text-xs text-slate-400 mb-1">{day.day}</div>
                  <div className={cn(
                    "text-sm font-semibold",
                    day.isToday ? "text-cyan-400" : day.trained ? "text-emerald-400" : "text-slate-500"
                  )}>
                    {day.date}
                  </div>
                  {day.trained && (
                    <div className="text-xs mt-1">🔥</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Programs */}
      {activePrograms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            Continue Training
          </h3>
          <div className="space-y-3">
            {activePrograms.map((program: any, index: number) => (
              <Link 
                key={program?.id || index} 
                href={`/train/program/${program?.TrainingProgram?.programId || program?.programId}`}
              >
                <Card className="bg-slate-800/60 border-slate-700/50 hover:border-cyan-500/30 transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">
                          {program?.TrainingProgram?.name || 'Training Program'}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>Day {program?.currentDay || 1}</span>
                          <span>•</span>
                          <span>{Math.round(program?.completionPercentage ?? 0)}% complete</span>
                        </div>
                        <Progress 
                          value={program?.completionPercentage ?? 0} 
                          className="h-1.5 mt-2" 
                        />
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommended Next */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 border-cyan-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Star className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mb-1">
                  Recommended
                </Badge>
                <h4 className="font-semibold text-white">{nextRecommendedDrill}</h4>
                <p className="text-sm text-slate-400">Based on your progress and goals</p>
              </div>
              <Link href="/train/drills">
                <Button className="bg-gradient-to-r from-cyan-500 to-emerald-600">
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Full Stats Panels */}
      <div className="grid md:grid-cols-2 gap-6">
        <XPDisplay />
        <StreakDisplay />
      </div>

      <BadgesDisplay showAll />
    </div>
  )
}
