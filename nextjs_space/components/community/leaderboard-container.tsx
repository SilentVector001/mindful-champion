// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Trophy, Zap, TrendingUp, Target, Video, CheckCircle, Flame,
  Crown, Medal, Award, ChevronRight, Sparkles, Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LeaderboardList } from './leaderboard-list'
import { UserProfileModal } from './user-profile-modal'

interface LeaderboardContainerProps {
  user: any
}

const LEADERBOARD_TYPES = [
  { value: 'xp-all', label: 'All-Time XP', icon: Trophy, color: 'from-yellow-500 to-amber-600', badge: 'Total' },
  { value: 'xp-weekly', label: 'Weekly XP', icon: TrendingUp, color: 'from-cyan-500 to-blue-600', badge: 'This Week' },
  { value: 'xp-monthly', label: 'Monthly XP', icon: Calendar, color: 'from-purple-500 to-pink-600', badge: 'This Month' },
  { value: 'streaks', label: 'Streaks', icon: Flame, color: 'from-orange-500 to-red-600', badge: 'Current' },
  { value: 'training', label: 'Training', icon: Target, color: 'from-green-500 to-emerald-600', badge: 'Drills' },
  { value: 'videos', label: 'Videos', icon: Video, color: 'from-indigo-500 to-violet-600', badge: 'Analyzed' },
  { value: 'goals', label: 'Goals', icon: CheckCircle, color: 'from-teal-500 to-cyan-600', badge: 'Completed' }
]

export default function LeaderboardContainer({ user }: LeaderboardContainerProps) {
  const [selectedType, setSelectedType] = useState('xp-all')
  const [leaderboardData, setLeaderboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const currentType = LEADERBOARD_TYPES.find(t => t.value === selectedType) || LEADERBOARD_TYPES[0]

  useEffect(() => {
    fetchLeaderboard()
  }, [selectedType])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      let endpoint = ''
      let params = ''

      if (selectedType.startsWith('xp-')) {
        const period = selectedType.replace('xp-', '')
        endpoint = '/api/leaderboard/xp'
        params = `?period=${period}`
      } else {
        endpoint = `/api/leaderboard/${selectedType}`
      }

      const res = await fetch(`${endpoint}${params}`)
      if (res.ok) {
        const data = await res.json()
        setLeaderboardData(data)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const openUserProfile = async (userId: string) => {
    try {
      const res = await fetch(`/api/leaderboard/user/${userId}`)
      if (res.ok) {
        const userData = await res.json()
        setSelectedUser(userData)
        setShowProfileModal(true)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Leaderboards</h1>
                  <p className="text-white/90 text-lg">See how you stack up against the best</p>
                </div>
              </div>
            </div>
            <Crown className="w-16 h-16 text-yellow-300/50" />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Medal className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-medium">Top Players</span>
              </div>
              <p className="text-2xl font-bold">100+</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span className="text-sm font-medium">Categories</span>
              </div>
              <p className="text-2xl font-bold">7</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-300" />
                <span className="text-sm font-medium">Live Updates</span>
              </div>
              <p className="text-2xl font-bold">Real-time</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Award className="w-3 h-3 mr-1" />
              Track Your Progress
            </Badge>
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Target className="w-3 h-3 mr-1" />
              Compete with Friends
            </Badge>
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Trophy className="w-3 h-3 mr-1" />
              Earn Badges
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Leaderboard Type Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {LEADERBOARD_TYPES.map(type => {
          const Icon = type.icon
          const isActive = selectedType === type.value
          
          return (
            <Button
              key={type.value}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(type.value)}
              className={cn(
                'shrink-0 gap-2',
                isActive && `bg-gradient-to-r ${type.color} hover:opacity-90 text-white border-0`
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="font-semibold">{type.label}</span>
              <Badge variant="secondary" className={cn(
                'ml-1',
                isActive ? 'bg-white/20 text-white hover:bg-white/30' : ''
              )}>
                {type.badge}
              </Badge>
            </Button>
          )
        })}
      </div>

      {/* Leaderboard Content */}
      <Card className="border-2">
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse bg-slate-800/50 rounded-xl h-20" />
              ))}
            </div>
          ) : (
            <LeaderboardList
              data={leaderboardData}
              type={selectedType}
              currentUserId={user?.id}
              onUserClick={openUserProfile}
            />
          )}
        </CardContent>
      </Card>

      {/* User Profile Modal */}
      <UserProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userData={selectedUser}
      />
    </div>
  )
}
