'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Trophy, Zap, Target, Video, CheckCircle, Flame,
  Award, Crown, Medal, Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserProfileModalProps {
  open: boolean
  onClose: () => void
  userData: any
}

export function UserProfileModal({ open, onClose, userData }: UserProfileModalProps) {
  if (!userData) return null

  const { user, xp, badges, ranks, stats } = userData

  const rankCards = [
    { label: 'Total XP', rank: ranks?.xpAll, icon: Trophy, color: 'from-yellow-500 to-amber-600' },
    { label: 'Weekly XP', rank: ranks?.xpWeekly, icon: Zap, color: 'from-cyan-500 to-blue-600' },
    { label: 'Monthly XP', rank: ranks?.xpMonthly, icon: Zap, color: 'from-purple-500 to-pink-600' },
    { label: 'Streak', rank: ranks?.streak, icon: Flame, color: 'from-orange-500 to-red-600' },
    { label: 'Training', rank: ranks?.training, icon: Target, color: 'from-green-500 to-emerald-600' },
    { label: 'Videos', rank: ranks?.videos, icon: Video, color: 'from-indigo-500 to-violet-600' },
    { label: 'Goals', rank: ranks?.goals, icon: CheckCircle, color: 'from-teal-500 to-cyan-600' },
  ]

  const statCards = [
    { label: 'Total XP', value: stats?.totalXP?.toLocaleString() || '0', icon: Zap, color: 'text-cyan-400' },
    { label: 'Level', value: stats?.level || 1, icon: Star, color: 'text-purple-400' },
    { label: 'Current Streak', value: `${stats?.streak || 0} days`, icon: Flame, color: 'text-orange-400' },
    { label: 'Drills Completed', value: stats?.drillsCompleted || 0, icon: Target, color: 'text-green-400' },
    { label: 'Videos Analyzed', value: stats?.videosAnalyzed || 0, icon: Video, color: 'text-indigo-400' },
    { label: 'Goals Completed', value: stats?.goalsCompleted || 0, icon: CheckCircle, color: 'text-teal-400' },
  ]

  const getBadgeColor = (color: string) => {
    switch (color) {
      case 'gold': return 'from-yellow-400 to-amber-600'
      case 'purple': return 'from-purple-400 to-pink-600'
      case 'cyan': return 'from-cyan-400 to-blue-600'
      default: return 'from-slate-400 to-slate-600'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-950">
        <DialogHeader>
          <DialogTitle className="sr-only">Player Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="relative inline-block mb-4">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-cyan-500/50 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-bold text-5xl ring-4 ring-cyan-500/50 shadow-lg">
                  {user?.name?.[0] || '?'}
                </div>
              )}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-4 py-1 text-sm">
                  Level {stats?.level || 1}
                </Badge>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{user?.name}</h2>
            {user?.fullName && user.fullName !== user.name && (
              <p className="text-slate-400 mb-2">({user.fullName})</p>
            )}
            <div className="flex items-center justify-center gap-2">
              {user?.skillLevel && (
                <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                  {user.skillLevel}
                </Badge>
              )}
              {user?.rating && (
                <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                  {user.rating}
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Rank Cards */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Leaderboard Rankings
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {rankCards.map((card, index) => {
                const Icon = card.icon
                return (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-3 text-center">
                        <div className={cn(
                          'w-8 h-8 rounded-lg bg-gradient-to-br mx-auto mb-2 flex items-center justify-center',
                          card.color
                        )}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">#{card.rank || '—'}</div>
                        <div className="text-xs text-slate-400">{card.label}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Stats */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-400" />
              Stats Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {statCards.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <Icon className={cn('w-5 h-5 shrink-0', stat.color)} />
                          <div className="flex-1 min-w-0">
                            <div className="text-xl font-bold text-white">{stat.value}</div>
                            <div className="text-xs text-slate-400">{stat.label}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Badges */}
          {badges && badges.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Badges ({badges.length})
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {badges.slice(0, 10).map((badge: any, index: number) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="text-center"
                  >
                    <div className={cn(
                      'w-16 h-16 rounded-full bg-gradient-to-br mx-auto mb-2 flex items-center justify-center text-2xl shadow-lg',
                      getBadgeColor(badge.badgeColor)
                    )}>
                      {badge.badgeIcon || '🏆'}
                    </div>
                    <div className="text-xs text-slate-300 font-medium line-clamp-2">
                      {badge.badgeName}
                    </div>
                  </motion.div>
                ))}
              </div>
              {badges.length > 10 && (
                <p className="text-center text-sm text-slate-400 mt-3">
                  +{badges.length - 10} more badges
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
