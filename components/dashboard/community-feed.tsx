
"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import {
  Users,
  Trophy,
  TrendingUp,
  Activity,
  Crown,
  Medal,
  Zap,
  Star,
  ChevronRight,
  Timer,
  Flame
} from 'lucide-react'

interface CommunityData {
  totalUsers: number
  activeUsersToday: number
  socialProof: {
    playersTrainedToday: number
    totalTrainingSessions: number
    totalMatches: number
  }
  leaderboard: Array<{
    rank: number
    name: string
    points: number
    skillLevel: string
    streak: number
    winRate: number
    isCurrentUser: boolean
  }>
  userRank: {
    position: number
    percentile: number
  }
  recentAchievements: Array<{
    playerName: string
    achievementName: string
    description: string
    tier: string
    timeAgo: number
  }>
  recentActivity: Array<{
    playerName: string
    skillLevel: string
    activity: string
    timeAgo: number
  }>
}

interface CommunityFeedProps {
  className?: string
}

const getTierColor = (tier: string) => {
  switch (tier?.toUpperCase()) {
    case 'BRONZE': return 'text-orange-600'
    case 'SILVER': return 'text-gray-500'
    case 'GOLD': return 'text-yellow-500'
    case 'PLATINUM': return 'text-purple-500'
    default: return 'text-gray-600'
  }
}

const getSkillColor = (level: string) => {
  switch (level?.toUpperCase()) {
    case 'BEGINNER': return 'bg-green-100 text-green-700'
    case 'INTERMEDIATE': return 'bg-blue-100 text-blue-700'
    case 'ADVANCED': return 'bg-purple-100 text-purple-700'
    case 'PRO': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export default function CommunityFeed({ className }: CommunityFeedProps) {
  const [communityData, setCommunityData] = useState<CommunityData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'activity' | 'achievements'>('leaderboard')

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const response = await fetch('/api/dashboard/community')
        const data = await response.json()
        if (data.success) {
          setCommunityData(data.community)
        }
      } catch (error) {
        console.error('Failed to fetch community data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCommunityData()
    const interval = setInterval(fetchCommunityData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <Card className={cn("border-0 shadow-lg", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Community Pulse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="w-3/4 h-4 bg-gray-200 rounded" />
                <div className="w-1/2 h-3 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!communityData) return null

  return (
    <Card className={cn("border-0 shadow-lg bg-white", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-champion-blue" />
            Community Pulse
          </CardTitle>
          <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>{communityData.activeUsersToday} online</span>
          </div>
        </div>

        {/* Social Proof Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {communityData.socialProof.playersTrainedToday}
            </div>
            <div className="text-xs text-green-700">trained today</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {Math.floor(communityData.socialProof.totalTrainingSessions / 1000)}k+
            </div>
            <div className="text-xs text-blue-700">total sessions</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.floor(communityData.socialProof.totalMatches / 100)}k+
            </div>
            <div className="text-xs text-purple-700">matches played</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mt-4 p-1 bg-gray-100 rounded-lg">
          {[
            { id: 'leaderboard', label: 'Top Players', icon: Crown },
            { id: 'activity', label: 'Activity', icon: Activity },
            { id: 'achievements', label: 'Recent Wins', icon: Trophy }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all",
                  activeTab === tab.id
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

      <CardContent className="pt-0">
        <AnimatePresence mode="wait">
          {/* Leaderboard */}
          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {communityData.leaderboard.slice(0, 5).map((player, index) => (
                <motion.div
                  key={player.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-md",
                    player.isCurrentUser 
                      ? "bg-gradient-to-r from-champion-blue/10 to-champion-green/10 border-champion-blue/30" 
                      : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                    player.rank === 1 ? "bg-yellow-100 text-yellow-700" :
                    player.rank === 2 ? "bg-gray-100 text-gray-700" :
                    player.rank === 3 ? "bg-orange-100 text-orange-700" :
                    "bg-blue-100 text-blue-700"
                  )}>
                    {player.rank === 1 ? <Crown className="w-4 h-4" /> : player.rank}
                  </div>

                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-champion-blue/20 text-champion-blue font-semibold">
                      {player.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-semibold",
                        player.isCurrentUser ? "text-champion-blue" : "text-gray-900"
                      )}>
                        {player.name}
                        {player.isCurrentUser && <span className="text-xs">(You)</span>}
                      </span>
                      <Badge variant="outline" className={getSkillColor(player.skillLevel)}>
                        {player.skillLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="font-medium text-champion-gold">
                        {player.points.toLocaleString()} pts
                      </span>
                      {player.streak > 0 && (
                        <span className="flex items-center gap-1 text-orange-600">
                          <Flame className="w-3 h-3" />
                          {player.streak}
                        </span>
                      )}
                      {player.winRate > 0 && (
                        <span className="text-green-600">{player.winRate}% wins</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {communityData.userRank.position > 5 && (
                <div className="mt-4 p-3 bg-gradient-to-r from-champion-blue/10 to-champion-green/10 rounded-lg border border-champion-blue/30">
                  <div className="text-center">
                    <div className="font-semibold text-champion-blue">Your Rank</div>
                    <div className="text-2xl font-bold text-champion-blue">#{communityData.userRank.position}</div>
                    <div className="text-sm text-gray-600">
                      Top {communityData.userRank.percentile}% of players
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Recent Activity */}
          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {communityData.recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="bg-champion-green/20 text-champion-green">
                      {activity.playerName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{activity.playerName}</span>
                      <Badge variant="outline" className={getSkillColor(activity.skillLevel)}>
                        {activity.skillLevel}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">{activity.activity}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Timer className="w-3 h-3" />
                    {activity.timeAgo}m ago
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Recent Achievements */}
          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {communityData.recentAchievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200/50"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{achievement.playerName}</span>
                      <Badge className={cn("text-xs", getTierColor(achievement.tier))}>
                        {achievement.tier}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-yellow-700">{achievement.achievementName}</div>
                    <div className="text-xs text-gray-600">{achievement.description}</div>
                  </div>
                  <div className="text-xs text-gray-500">{achievement.timeAgo}h ago</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
