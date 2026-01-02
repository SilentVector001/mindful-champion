'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Lock, Trophy, Flame, Target, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface BadgesDisplayProps {
  compact?: boolean
  showAll?: boolean
}

const BADGE_ICONS: Record<string, any> = {
  '🔥': Flame,
  '🏆': Trophy,
  '🎯': Target,
  '⭐': Star,
}

const BADGE_COLORS: Record<string, string> = {
  gold: 'from-yellow-500 to-amber-600',
  purple: 'from-purple-500 to-pink-600',
  cyan: 'from-cyan-500 to-blue-600',
  emerald: 'from-emerald-500 to-green-600',
  orange: 'from-orange-500 to-red-600',
  yellow: 'from-yellow-400 to-orange-500',
  blue: 'from-blue-500 to-indigo-600',
  teal: 'from-teal-500 to-cyan-600',
}

export default function BadgesDisplay({ compact = false, showAll = false }: BadgesDisplayProps) {
  const [badgesData, setBadgesData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedBadge, setSelectedBadge] = useState<any>(null)

  useEffect(() => {
    fetchBadges()
  }, [])

  const fetchBadges = async () => {
    try {
      const res = await fetch('/api/training/badges')
      if (res.ok) {
        const data = await res.json()
        setBadgesData(data)
      }
    } catch (error) {
      console.error('Error fetching badges:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-slate-800/50 rounded-xl h-32" />
  }

  const { earned = [], all = [], totalEarned = 0, totalAvailable = 0 } = badgesData || {}

  if (compact) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <Award className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">{totalEarned}</span>
            <span className="text-slate-400 text-sm">/ {totalAvailable}</span>
          </div>
          <div className="text-xs text-purple-400">Badges Earned</div>
        </div>
      </div>
    )
  }

  const displayBadges = showAll ? all : earned.slice(0, 6)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-purple-500/20 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Badges</h3>
            <p className="text-slate-400 text-sm">{totalEarned} of {totalAvailable} earned</p>
          </div>
        </div>
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
          {Math.round((totalEarned / totalAvailable) * 100)}%
        </Badge>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
        {displayBadges.map((badge: any, index: number) => {
          const isEarned = badge?.earned !== false
          const colorClass = BADGE_COLORS[badge?.color] || BADGE_COLORS.cyan

          return (
            <motion.button
              key={badge?.id || index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedBadge(badge)}
              className={cn(
                "relative aspect-square rounded-xl flex items-center justify-center text-2xl transition-all",
                isEarned
                  ? `bg-gradient-to-br ${colorClass} shadow-lg`
                  : "bg-slate-700/50 opacity-50"
              )}
            >
              {isEarned ? (
                <span>{badge?.icon || '🏆'}</span>
              ) : (
                <Lock className="w-5 h-5 text-slate-500" />
              )}
              {isEarned && (
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-xl"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {!showAll && earned.length > 6 && (
        <p className="text-center text-slate-400 text-sm mt-4">
          +{earned.length - 6} more badges
        </p>
      )}

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className={cn(
                "bg-gradient-to-br rounded-2xl p-8 text-center max-w-sm",
                selectedBadge?.earned !== false
                  ? BADGE_COLORS[selectedBadge?.color] || BADGE_COLORS.cyan
                  : "from-slate-700 to-slate-800"
              )}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-6xl mb-4">
                {selectedBadge?.earned !== false ? (selectedBadge?.icon || '🏆') : '🔒'}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{selectedBadge?.name}</h3>
              <p className="text-white/80 mb-4">{selectedBadge?.requirement}</p>
              {selectedBadge?.earnedAt && (
                <p className="text-white/60 text-sm">
                  Earned {new Date(selectedBadge.earnedAt).toLocaleDateString()}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
