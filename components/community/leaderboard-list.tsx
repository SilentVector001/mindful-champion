'use client'

import { motion } from 'framer-motion'
import { Trophy, Medal, Award, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LeaderboardListProps {
  data: any
  type: string
  currentUserId?: string
  onUserClick: (userId: string) => void
}

export function LeaderboardList({ data, type, currentUserId, onUserClick }: LeaderboardListProps) {
  if (!data?.leaderboard || data.leaderboard.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-xl font-semibold mb-2">No rankings yet</h3>
        <p className="text-muted-foreground">Be the first to climb the leaderboard!</p>
      </div>
    )
  }

  const { leaderboard, userPosition } = data
  const topThree = leaderboard.slice(0, 3)
  const restOfLeaders = leaderboard.slice(3)

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 via-yellow-500 to-amber-600'
    if (rank === 2) return 'from-slate-300 via-slate-400 to-slate-500'
    if (rank === 3) return 'from-amber-600 via-orange-500 to-amber-700'
    return 'from-slate-600 to-slate-700'
  }

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-400" />
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />
    return null
  }

  const getScoreLabel = (type: string) => {
    if (type.includes('xp')) return 'XP'
    if (type === 'streaks') return 'Days'
    if (type === 'training') return 'Drills'
    if (type === 'videos') return 'Videos'
    if (type === 'goals') return 'Goals'
    return 'Score'
  }

  const scoreLabel = getScoreLabel(type)

  return (
    <div className="space-y-6">
      {/* Podium - Top 3 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* 2nd Place */}
        {topThree[1] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <div className={cn(
              'w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center mb-2 ring-4 ring-slate-700',
              getMedalColor(2)
            )}>
              {topThree[1].user?.image ? (
                <img
                  src={topThree[1].user.image}
                  alt={topThree[1].user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {topThree[1].user?.name?.[0] || '?'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mb-1">
              {getMedalIcon(2)}
              <span className="text-sm font-bold text-slate-400">#2</span>
            </div>
            <button
              onClick={() => onUserClick(topThree[1].userId)}
              className="text-sm font-semibold hover:text-cyan-400 transition-colors text-center line-clamp-1"
            >
              {topThree[1].user?.name}
            </button>
            <div className="text-lg font-bold text-cyan-400">
              {topThree[1].score?.toLocaleString()}
            </div>
            <span className="text-xs text-muted-foreground">{scoreLabel}</span>
          </motion.div>
        )}

        {/* 1st Place - Center, Larger */}
        {topThree[0] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-col items-center -mt-4"
          >
            <div className={cn(
              'w-28 h-28 rounded-full bg-gradient-to-br flex items-center justify-center mb-3 ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/50',
              getMedalColor(1)
            )}>
              {topThree[0].user?.image ? (
                <img
                  src={topThree[0].user.image}
                  alt={topThree[0].user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-white">
                  {topThree[0].user?.name?.[0] || '?'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              {getMedalIcon(1)}
              <span className="text-lg font-bold text-yellow-400">#1</span>
            </div>
            <button
              onClick={() => onUserClick(topThree[0].userId)}
              className="text-base font-bold hover:text-cyan-400 transition-colors text-center line-clamp-1 max-w-full"
            >
              {topThree[0].user?.name}
            </button>
            <div className="text-2xl font-bold text-yellow-400">
              {topThree[0].score?.toLocaleString()}
            </div>
            <span className="text-sm text-muted-foreground">{scoreLabel}</span>
          </motion.div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col items-center"
          >
            <div className={cn(
              'w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center mb-2 ring-4 ring-slate-700',
              getMedalColor(3)
            )}>
              {topThree[2].user?.image ? (
                <img
                  src={topThree[2].user.image}
                  alt={topThree[2].user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {topThree[2].user?.name?.[0] || '?'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mb-1">
              {getMedalIcon(3)}
              <span className="text-sm font-bold text-amber-600">#3</span>
            </div>
            <button
              onClick={() => onUserClick(topThree[2].userId)}
              className="text-sm font-semibold hover:text-cyan-400 transition-colors text-center line-clamp-1"
            >
              {topThree[2].user?.name}
            </button>
            <div className="text-lg font-bold text-cyan-400">
              {topThree[2].score?.toLocaleString()}
            </div>
            <span className="text-xs text-muted-foreground">{scoreLabel}</span>
          </motion.div>
        )}
      </div>

      {/* User's Position (if not in top 3) */}
      {userPosition && userPosition.rank > 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <Card className="border-2 border-cyan-500/50 bg-cyan-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-cyan-400">#{userPosition.rank}</div>
                  <div className="flex items-center gap-3">
                    {userPosition.user?.image ? (
                      <img
                        src={userPosition.user.image}
                        alt={userPosition.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-bold text-xl">
                        {userPosition.user?.name?.[0] || 'Y'}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-white">You</div>
                      <div className="text-sm text-slate-400">{userPosition.user?.name}</div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-400">
                    {userPosition.score?.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">{scoreLabel}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Rest of Leaders */}
      <div className="space-y-2">
        {restOfLeaders.map((entry, index) => {
          const isCurrentUser = entry.userId === currentUserId
          
          return (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={cn(
                  'hover:shadow-lg transition-all cursor-pointer group',
                  isCurrentUser && 'border-2 border-cyan-500/50 bg-cyan-500/5'
                )}
                onClick={() => onUserClick(entry.userId)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={cn(
                        'text-xl font-bold w-8 text-center',
                        isCurrentUser ? 'text-cyan-400' : 'text-slate-400'
                      )}>
                        #{entry.rank}
                      </div>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {entry.user?.image ? (
                          <img
                            src={entry.user.image}
                            alt={entry.user.name}
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                            {entry.user?.name?.[0] || '?'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white truncate">
                            {entry.user?.name}
                            {isCurrentUser && <span className="text-cyan-400 ml-2">(You)</span>}
                          </div>
                          {entry.user?.rating && (
                            <div className="text-xs text-slate-400">Rating: {entry.user.rating}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xl font-bold text-cyan-400">
                          {entry.score?.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-400">{scoreLabel}</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
