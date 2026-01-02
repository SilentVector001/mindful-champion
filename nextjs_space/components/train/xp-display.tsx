'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, TrendingUp, Star, Trophy } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface XPDisplayProps {
  compact?: boolean
  showRecent?: boolean
}

export default function XPDisplay({ compact = false, showRecent = false }: XPDisplayProps) {
  const [xpData, setXpData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showLevelUp, setShowLevelUp] = useState(false)

  useEffect(() => {
    fetchXP()
  }, [])

  const fetchXP = async () => {
    try {
      const res = await fetch('/api/training/xp')
      if (res.ok) {
        const data = await res.json()
        setXpData(data)
      }
    } catch (error) {
      console.error('Error fetching XP:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse bg-slate-800/50 rounded-xl h-20" />
    )
  }

  if (!xpData) return null

  const { totalXP = 0, level = 1, weeklyXP = 0, progressToNext = 0, nextLevelXP = 100 } = xpData

  if (compact) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-xl border border-cyan-500/20">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">{totalXP?.toLocaleString()}</span>
            <span className="text-slate-400 text-sm">XP</span>
          </div>
          <div className="text-xs text-cyan-400">Level {level}</div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-cyan-500/20 backdrop-blur-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-cyan-500/30"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Zap className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-white">Your XP</h3>
            <p className="text-slate-400 text-sm">Keep training to level up!</p>
          </div>
        </div>
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-lg px-3 py-1">
          <Trophy className="w-4 h-4 mr-1" />
          Level {level}
        </Badge>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-3xl font-bold text-white">{totalXP?.toLocaleString()} <span className="text-lg text-slate-400">XP</span></span>
            <span className="text-sm text-slate-400">{nextLevelXP?.toLocaleString()} to Level {level + 1}</span>
          </div>
          <div className="relative">
            <Progress value={progressToNext} className="h-3 bg-slate-700" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-white/20 to-cyan-500/0 rounded-full"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-slate-400">This Week</span>
            </div>
            <span className="text-xl font-bold text-white">+{weeklyXP?.toLocaleString()}</span>
          </div>
          <div className="bg-slate-700/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-slate-400">Progress</span>
            </div>
            <span className="text-xl font-bold text-white">{Math.round(progressToNext)}%</span>
          </div>
        </div>
      </div>

      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setShowLevelUp(false)}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-gradient-to-br from-cyan-500 to-emerald-600 rounded-3xl p-8 text-center"
            >
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                <Trophy className="w-20 h-20 text-white mx-auto mb-4" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">Level Up!</h2>
              <p className="text-white/80">You reached Level {level}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
