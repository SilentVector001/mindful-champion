'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame, Calendar, Award, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreakDisplayProps {
  compact?: boolean
}

export default function StreakDisplay({ compact = false }: StreakDisplayProps) {
  const [streak, setStreak] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStreak()
  }, [])

  const fetchStreak = async () => {
    try {
      const res = await fetch('/api/training/streak')
      if (res.ok) {
        const data = await res.json()
        setStreak(data)
      }
    } catch (error) {
      console.error('Error fetching streak:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-slate-800/50 rounded-xl h-16" />
  }

  const { currentStreak = 0, longestStreak = 0, totalDaysTrained = 0 } = streak || {}

  const getStreakColor = (days: number) => {
    if (days >= 30) return 'from-yellow-500 to-orange-600'
    if (days >= 14) return 'from-orange-500 to-red-600'
    if (days >= 7) return 'from-orange-400 to-yellow-500'
    return 'from-yellow-400 to-orange-500'
  }

  const getStreakEmoji = (days: number) => {
    if (days >= 30) return '🔥'
    if (days >= 14) return '🔥'
    if (days >= 7) return '✨'
    if (days >= 3) return '💪'
    return '🎯'
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-xl border border-orange-500/20">
        <motion.div 
          className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center", getStreakColor(currentStreak))}
          animate={currentStreak > 0 ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Flame className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">{currentStreak}</span>
            <span className="text-slate-400 text-sm">day{currentStreak !== 1 ? 's' : ''}</span>
          </div>
          <div className="text-xs text-orange-400">Current Streak</div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-orange-500/20 backdrop-blur-sm"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div 
            className={cn("w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg shadow-orange-500/30", getStreakColor(currentStreak))}
            animate={currentStreak > 0 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Flame className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-white">Training Streak</h3>
            <p className="text-slate-400 text-sm">Keep the fire burning!</p>
          </div>
        </div>
        <span className="text-3xl">{getStreakEmoji(currentStreak)}</span>
      </div>

      <div className="text-center mb-6">
        <motion.div
          key={currentStreak}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500"
        >
          {currentStreak}
        </motion.div>
        <p className="text-slate-400 mt-1">day{currentStreak !== 1 ? 's' : ''} in a row</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-700/50 rounded-xl p-4 text-center">
          <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{longestStreak}</div>
          <div className="text-xs text-slate-400">Best Streak</div>
        </div>
        <div className="bg-slate-700/50 rounded-xl p-4 text-center">
          <Calendar className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{totalDaysTrained}</div>
          <div className="text-xs text-slate-400">Total Days</div>
        </div>
      </div>

      {currentStreak > 0 && currentStreak < 7 && (
        <div className="mt-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <p className="text-sm text-orange-300">
            💪 {7 - currentStreak} more day{7 - currentStreak !== 1 ? 's' : ''} to reach a 7-day streak!
          </p>
        </div>
      )}
    </motion.div>
  )
}
