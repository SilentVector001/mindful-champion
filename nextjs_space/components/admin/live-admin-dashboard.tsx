// @ts-nocheck
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users, DollarSign, Trophy, TrendingUp, Mail, ArrowLeft, RefreshCw, Search,
  Eye, Send, UserPlus, Calendar, Clock, CheckCircle, AlertCircle, Crown,
  Activity, Zap, Video, Lock, Trash2, MessageSquare, Shield, AlertTriangle,
  Play, Pause, Settings, Bell, ChevronRight, Circle, Wifi, WifiOff, Ban,
  UserCog, CreditCard, BarChart3, PieChart
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow, format } from "date-fns"
import { cn } from "@/lib/utils"

interface LiveAdminDashboardProps {
  initialData: any
}

// Live Activity Item
function ActivityItem({ activity, isNew }: { activity: any, isNew?: boolean }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'signup': return <UserPlus className="w-4 h-4 text-emerald-400" />
      case 'subscription': return <Crown className="w-4 h-4 text-amber-400" />
      case 'login': return <CheckCircle className="w-4 h-4 text-cyan-400" />
      case 'video_upload': return <Video className="w-4 h-4 text-purple-400" />
      case 'coach_chat': return <MessageSquare className="w-4 h-4 text-blue-400" />
      case 'achievement': return <Trophy className="w-4 h-4 text-yellow-400" />
      default: return <Activity className="w-4 h-4 text-slate-400" />
    }
  }

  return (
    <motion.div
      initial={isNew ? { opacity: 0, x: -20, backgroundColor: 'rgba(34, 211, 238, 0.1)' } : {}}
      animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
      transition={{ duration: 0.5 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border",
        isNew ? "border-cyan-500/50 bg-cyan-500/5" : "border-slate-700/50 bg-slate-800/30"
      )}
    >
      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">
          {activity.userName || 'User'}
        </p>
        <p className="text-slate-400 text-xs truncate">{activity.description}</p>
      </div>
      <div className="text-right">
        <p className="text-slate-500 text-xs">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </p>
        {isNew && (
          <Badge className="bg-cyan-500/20 text-cyan-400 text-[10px] mt-1">NEW</Badge>
        )}
      </div>
    </motion.div>
  )
}

// User Row Component
function UserRow({ user, onAction }: { user: any, onAction: (action: string, user: any) => void }) {
  const getTierBadge = () => {
    switch (user.subscriptionTier) {
      case 'PREMIUM': return <Badge className="bg-purple-500">Elite</Badge>
      case 'PRO': return <Badge className="bg-cyan-500">Pro</Badge>
      case 'TRIAL': return <Badge className="bg-amber-500">Trial</Badge>
      default: return <Badge className="bg-slate-600">Free</Badge>
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
        {(user.firstName?.[0] || user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white font-medium truncate">
            {user.firstName || user.name || 'User'} {user.lastName || ''}
          </p>
          {getTierBadge()}
          {user.role === 'ADMIN' && <Badge className="bg-red-500">Admin</Badge>}
        </div>
        <p className="text-slate-400 text-sm truncate">{user.email}</p>
        <p className="text-slate-500 text-xs">
          Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={() => onAction('view', user)} className="text-slate-400 hover:text-white">
          <Eye className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onAction('upgrade', user)} className="text-slate-400 hover:text-cyan-400">
          <Crown className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onAction('message', user)} className="text-slate-400 hover:text-blue-400">
          <MessageSquare className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onAction('warn', user)} className="text-slate-400 hover:text-amber-400">
          <AlertTriangle className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// Video Row Component
function VideoRow({ video, onAction }: { video: any, onAction: (action: string, video: any) => void }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
      <div className="w-20 h-12 bg-slate-700 rounded overflow-hidden flex items-center justify-center">
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <Video className="w-6 h-6 text-slate-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{video.fileName || 'Video'}</p>
        <p className="text-slate-400 text-sm">{video.user?.email || 'Unknown user'}</p>
        <p className="text-slate-500 text-xs">
          {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={cn(
          video.analysisStatus === 'COMPLETED' ? 'bg-emerald-500' :
          video.analysisStatus === 'PROCESSING' ? 'bg-cyan-500' :
          video.analysisStatus === 'FAILED' ? 'bg-red-500' : 'bg-slate-600'
        )}>
          {video.analysisStatus}
        </Badge>
        <Button size="sm" variant="ghost" onClick={() => onAction('view', video)} className="text-slate-400 hover:text-white">
          <Eye className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onAction('lock', video)} className="text-slate-400 hover:text-amber-400">
          <Lock className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onAction('delete', video)} className="text-slate-400 hover:text-red-400">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default function LiveAdminDashboard({ initialData }: LiveAdminDashboardProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('live')
  const [isLive, setIsLive] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5000) // 5 seconds
  const [users, setUsers] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [stats, setStats] = useState(initialData?.stats || {})
  const [searchQuery, setSearchQuery] = useState('')
  const [lastActivityId, setLastActivityId] = useState<string | null>(null)
  const [newActivityCount, setNewActivityCount] = useState(0)
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [modalType, setModalType] = useState<'upgrade' | 'message' | 'warn' | null>(null)
  const [messageText, setMessageText] = useState('')
  const [selectedTier, setSelectedTier] = useState('')

  // Fetch functions
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users/list')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (e) { console.error(e) }
  }

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/admin/videos')
      if (res.ok) {
        const data = await res.json()
        setVideos(data.videos || [])
      }
    } catch (e) { console.error(e) }
  }

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/admin/activity-feed')
      if (res.ok) {
        const data = await res.json()
        const newActivities = data.activities || []
        
        // Check for new activities
        if (lastActivityId && newActivities.length > 0) {
          const newCount = newActivities.findIndex((a: any) => a.id === lastActivityId)
          if (newCount > 0) setNewActivityCount(prev => prev + newCount)
        }
        
        if (newActivities.length > 0) setLastActivityId(newActivities[0].id)
        setActivities(newActivities)
      }
    } catch (e) { console.error(e) }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (e) { console.error(e) }
  }

  // Initial load
  useEffect(() => {
    fetchUsers()
    fetchVideos()
    fetchActivities()
    fetchStats()
  }, [])

  // Live refresh
  useEffect(() => {
    if (!isLive) return
    const interval = setInterval(() => {
      fetchActivities()
      fetchStats()
      if (activeTab === 'users') fetchUsers()
      if (activeTab === 'videos') fetchVideos()
    }, refreshInterval)
    return () => clearInterval(interval)
  }, [isLive, refreshInterval, activeTab])

  // User actions
  const handleUserAction = async (action: string, user: any) => {
    setSelectedUser(user)
    if (action === 'view') {
      router.push(`/admin/users/${user.id}`)
    } else if (action === 'upgrade') {
      setModalType('upgrade')
      setSelectedTier(user.subscriptionTier || 'FREE')
    } else if (action === 'message') {
      setModalType('message')
      setMessageText('')
    } else if (action === 'warn') {
      setModalType('warn')
      setMessageText('')
    }
  }

  // Video actions
  const handleVideoAction = async (action: string, video: any) => {
    if (action === 'view') {
      window.open(`/train/analysis/${video.id}`, '_blank')
    } else if (action === 'lock') {
      if (confirm('Lock this video from public viewing?')) {
        await fetch(`/api/admin/videos/${video.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isLocked: true })
        })
        fetchVideos()
      }
    } else if (action === 'delete') {
      if (confirm('Permanently delete this video?')) {
        await fetch(`/api/admin/videos/${video.id}`, { method: 'DELETE' })
        fetchVideos()
      }
    }
  }

  // Submit modal actions
  const submitModalAction = async () => {
    if (!selectedUser) return

    try {
      if (modalType === 'upgrade') {
        await fetch(`/api/admin/users/${selectedUser.id}/subscription`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier: selectedTier })
        })
        alert(`Upgraded ${selectedUser.email} to ${selectedTier}`)
      } else if (modalType === 'message') {
        await fetch(`/api/admin/users/${selectedUser.id}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'message', content: messageText })
        })
        alert(`Message sent to ${selectedUser.email}`)
      } else if (modalType === 'warn') {
        await fetch(`/api/admin/users/${selectedUser.id}/warnings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: messageText })
        })
        alert(`Warning issued to ${selectedUser.email}`)
      }
      fetchUsers()
    } catch (e) {
      alert('Action failed')
    }
    setModalType(null)
    setSelectedUser(null)
  }

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.firstName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const recentSignups = [...users].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 10)

  // Stats calculation
  const trialUsers = users.filter(u => u.subscriptionTier === 'TRIAL' || u.isTrialActive).length
  const proUsers = users.filter(u => u.subscriptionTier === 'PRO').length
  const premiumUsers = users.filter(u => u.subscriptionTier === 'PREMIUM').length
  const freeUsers = users.filter(u => !u.subscriptionTier || u.subscriptionTier === 'FREE').length

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
              </Button>
              <div className="h-6 w-px bg-slate-700" />
              <h1 className="text-xl font-bold text-white">Command Center</h1>
              <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500">v2.0 BETA</Badge>
            </div>
            <div className="flex items-center gap-3">
              {/* Live Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLive(!isLive)}
                  className={cn(
                    "flex items-center gap-2",
                    isLive ? "text-emerald-400" : "text-slate-400"
                  )}
                >
                  {isLive ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                  {isLive ? 'LIVE' : 'Paused'}
                </Button>
                {isLive && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-emerald-500"
                  />
                )}
              </div>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white"
              >
                <option value={3000}>3s</option>
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs uppercase">Total Users</p>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-white/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-600 to-amber-700 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs uppercase">Trials</p>
                  <p className="text-2xl font-bold text-white">{trialUsers}</p>
                </div>
                <Clock className="w-8 h-8 text-white/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-cyan-600 to-cyan-700 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs uppercase">Pro</p>
                  <p className="text-2xl font-bold text-white">{proUsers}</p>
                </div>
                <Crown className="w-8 h-8 text-white/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs uppercase">Elite</p>
                  <p className="text-2xl font-bold text-white">{premiumUsers}</p>
                </div>
                <Zap className="w-8 h-8 text-white/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs uppercase">Videos</p>
                  <p className="text-2xl font-bold text-white">{videos.length}</p>
                </div>
                <Video className="w-8 h-8 text-white/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="live" className="data-[state=active]:bg-cyan-500">
              <Activity className="w-4 h-4 mr-2" /> Live Feed
              {newActivityCount > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-[10px]">{newActivityCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-cyan-500">
              <CreditCard className="w-4 h-4 mr-2" /> Subscriptions
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-cyan-500">
              <Users className="w-4 h-4 mr-2" /> All Users
            </TabsTrigger>
            <TabsTrigger value="videos" className="data-[state=active]:bg-cyan-500">
              <Video className="w-4 h-4 mr-2" /> Video Control
            </TabsTrigger>
          </TabsList>

          {/* Live Feed Tab */}
          <TabsContent value="live" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Activity Stream */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-cyan-400" />
                      Live Activity Stream
                    </CardTitle>
                    {isLive && (
                      <div className="flex items-center gap-2 text-emerald-400 text-xs">
                        <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 rounded-full bg-emerald-500" />
                        Updating every {refreshInterval / 1000}s
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                  <AnimatePresence>
                    {activities.length > 0 ? activities.map((activity, i) => (
                      <ActivityItem key={activity.id} activity={activity} isNew={i < newActivityCount} />
                    )) : (
                      <p className="text-slate-500 text-center py-8">No recent activity</p>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* Recent Signups */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-emerald-400" />
                    Recent Signups
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                  {recentSignups.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                          {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {user.firstName || user.name || 'User'} {user.lastName || ''}
                          </p>
                          <p className="text-slate-400 text-xs">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={cn(
                          "text-[10px]",
                          user.subscriptionTier === 'PREMIUM' ? 'bg-purple-500' :
                          user.subscriptionTier === 'PRO' ? 'bg-cyan-500' :
                          user.isTrialActive ? 'bg-amber-500' : 'bg-slate-600'
                        )}>
                          {user.subscriptionTier === 'PREMIUM' ? 'Elite' :
                           user.subscriptionTier === 'PRO' ? 'Pro' :
                           user.isTrialActive ? 'Trial' : 'Free'}
                        </Badge>
                        <p className="text-slate-500 text-xs mt-1">
                          {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Subscription Breakdown */}
              <Card className="bg-slate-900 border-slate-800 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-cyan-400" />
                    Subscription Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-slate-800 rounded-lg text-center">
                      <p className="text-3xl font-bold text-slate-400">{freeUsers}</p>
                      <p className="text-slate-500 text-sm">Free</p>
                    </div>
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center">
                      <p className="text-3xl font-bold text-amber-400">{trialUsers}</p>
                      <p className="text-amber-400/70 text-sm">Trial (7 days)</p>
                    </div>
                    <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-center">
                      <p className="text-3xl font-bold text-cyan-400">{proUsers}</p>
                      <p className="text-cyan-400/70 text-sm">Pro</p>
                    </div>
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
                      <p className="text-3xl font-bold text-purple-400">{premiumUsers}</p>
                      <p className="text-purple-400/70 text-sm">Elite</p>
                    </div>
                  </div>
                  
                  {/* Users by tier list */}
                  <div className="space-y-2">
                    <h4 className="text-white font-medium mb-3">Trial Users (Ending Soon)</h4>
                    {users.filter(u => u.isTrialActive || u.subscriptionTier === 'TRIAL').slice(0, 5).map(user => (
                      <div key={user.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                        <span className="text-slate-300 text-sm">{user.email}</span>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-amber-500/20 text-amber-400 text-xs">
                            {user.trialEndsAt ? `Ends ${format(new Date(user.trialEndsAt), 'MMM d')}` : 'Trial'}
                          </Badge>
                          <Button size="sm" variant="ghost" onClick={() => handleUserAction('upgrade', user)} className="text-cyan-400 hover:text-cyan-300 h-6 px-2">
                            Upgrade
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-cyan-500 hover:bg-cyan-600" onClick={() => router.push('/admin/emails')}>
                    <Mail className="w-4 h-4 mr-2" /> Send Bulk Email
                  </Button>
                  <Button className="w-full bg-purple-500 hover:bg-purple-600" variant="outline">
                    <Trophy className="w-4 h-4 mr-2" /> Grant Achievement
                  </Button>
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600" variant="outline">
                    <Zap className="w-4 h-4 mr-2" /> Add Promo Code
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">All Users ({users.length})</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredUsers.map(user => (
                  <UserRow key={user.id} user={user} onAction={handleUserAction} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="mt-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-400" />
                  Video Control Center ({videos.length} videos)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {videos.length > 0 ? videos.map(video => (
                  <VideoRow key={video.id} video={video} onAction={handleVideoAction} />
                )) : (
                  <p className="text-slate-500 text-center py-8">No videos uploaded yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Modal */}
      {modalType && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white">
                {modalType === 'upgrade' && <><Crown className="w-5 h-5 inline mr-2 text-amber-400" />Upgrade User</>}
                {modalType === 'message' && <><MessageSquare className="w-5 h-5 inline mr-2 text-blue-400" />Send Message</>}
                {modalType === 'warn' && <><AlertTriangle className="w-5 h-5 inline mr-2 text-amber-400" />Issue Warning</>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-400">User: <strong className="text-white">{selectedUser.email}</strong></p>
              
              {modalType === 'upgrade' && (
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="FREE" className="text-white">Free</SelectItem>
                    <SelectItem value="TRIAL" className="text-white">Trial (7 days)</SelectItem>
                    <SelectItem value="PRO" className="text-white">Pro</SelectItem>
                    <SelectItem value="PREMIUM" className="text-white">Elite/Premium</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {(modalType === 'message' || modalType === 'warn') && (
                <Textarea
                  placeholder={modalType === 'warn' ? 'Warning reason...' : 'Your message...'}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="bg-slate-900 border-slate-600 text-white min-h-[100px]"
                />
              )}
            </CardContent>
            <div className="flex gap-3 p-4 pt-0">
              <Button variant="ghost" onClick={() => { setModalType(null); setSelectedUser(null) }} className="flex-1 text-slate-400">
                Cancel
              </Button>
              <Button onClick={submitModalAction} className="flex-1 bg-cyan-500 hover:bg-cyan-600">
                {modalType === 'upgrade' ? 'Upgrade' : modalType === 'warn' ? 'Issue Warning' : 'Send'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
