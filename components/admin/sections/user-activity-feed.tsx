"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Activity, Video, Trophy, UserPlus, MessageSquare, 
  Target, TrendingUp, Calendar, Clock, RefreshCw,
  Eye, Play, Upload, ArrowRight, Filter, AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface UserActivityFeedProps {
  activities?: any[]
}

export default function UserActivityFeed({ activities = [] }: UserActivityFeedProps) {
  const [loading, setLoading] = useState(true)
  const [activityData, setActivityData] = useState<any[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/analytics/activity-feed')
      if (response.ok) {
        const data = await response.json()
        setActivityData(data.activities || [])
        console.log('Activity feed loaded:', data.activities?.length || 0, 'activities')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch activities' }))
        console.error('Activity feed error:', errorData)
        setError(errorData.error || 'Failed to load activity feed')
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
      setError('Network error while loading activities. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'signup':
        return { icon: UserPlus, color: 'text-green-500', bg: 'bg-green-500/10' }
      case 'video_upload':
        return { icon: Upload, color: 'text-blue-500', bg: 'bg-blue-500/10' }
      case 'video_analysis':
        return { icon: Play, color: 'text-purple-500', bg: 'bg-purple-500/10' }
      case 'match':
        return { icon: Trophy, color: 'text-orange-500', bg: 'bg-orange-500/10' }
      case 'goal_created':
        return { icon: Target, color: 'text-cyan-500', bg: 'bg-cyan-500/10' }
      case 'chat':
        return { icon: MessageSquare, color: 'text-pink-500', bg: 'bg-pink-500/10' }
      case 'subscription':
        return { icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
      default:
        return { icon: Activity, color: 'text-slate-500', bg: 'bg-slate-500/10' }
    }
  }

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'signup': return 'New Signup'
      case 'video_upload': return 'Video Upload'
      case 'video_analysis': return 'Video Analyzed'
      case 'match': return 'Match Recorded'
      case 'goal_created': return 'Goal Created'
      case 'chat': return 'Coach Chat'
      case 'subscription': return 'Subscription'
      default: return 'Activity'
    }
  }

  const filteredActivities = filter === 'all' 
    ? activityData 
    : activityData.filter(a => a.type === filter)

  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'signup', label: 'Signups' },
    { value: 'video_upload', label: 'Videos' },
    { value: 'match', label: 'Matches' },
    { value: 'subscription', label: 'Subscriptions' }
  ]

  if (loading) {
    return (
      <Card className="border-0 shadow-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Activity className="w-6 h-6 text-purple-500" />
            Platform Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <Card className="border-0 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50 opacity-5 pointer-events-none" />
        <CardHeader className="relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                Platform Activity Feed
              </CardTitle>
              <CardDescription className="mt-1 text-sm">
                Real-time user activities • Last 7 days
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchActivities}
                  className="gap-2 bg-white hover:bg-purple-50 border-purple-200 hover:border-purple-300 shadow-md"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Activity Type Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {activityTypes.map((type) => (
              <Button
                key={type.value}
                variant={filter === type.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(type.value)}
                className={cn(
                  "text-xs",
                  filter === type.value 
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" 
                    : "hover:bg-purple-50"
                )}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="relative">
          {/* Error State */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-300 mb-1">Error Loading Activities</h4>
                <p className="text-sm text-slate-300">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchActivities}
                  className="mt-3 gap-2 bg-white/5 hover:bg-white/10 border-red-500/30 text-red-300 hover:text-red-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {!error && filteredActivities.length > 0 ? (
              filteredActivities.map((activity: any, index: number) => {
                const { icon: Icon, color, bg } = getActivityIcon(activity.type)
                return (
                  <motion.div
                    key={activity.id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, x: 5 }}
                    className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all cursor-pointer shadow-sm hover:shadow-lg group border border-slate-100"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <motion.div 
                        className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-md", bg)}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                      >
                        <Icon className={cn("w-6 h-6", color)} />
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                            {activity.userName || 'User'}
                          </span>
                          <Badge className="text-xs" variant="outline">
                            {getActivityLabel(activity.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          {activity.description || activity.details}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-500 font-medium">
                            {activity.timeAgo || new Date(activity.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                  </motion.div>
                )
              })
            ) : !error && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-slate-700 font-medium mb-2">
                  {filter === 'all' ? 'No Recent Activity' : `No ${activityTypes.find(t => t.value === filter)?.label || 'Activities'}`}
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  {filter === 'all' 
                    ? 'No user activities recorded in the last 7 days. The activity feed will automatically update as users interact with the platform.'
                    : 'No activities of this type in the last 7 days. Try a different filter or check back later.'}
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto mb-4">
                  <p className="text-xs text-blue-700 font-medium mb-2">💡 Activity Feed Tips:</p>
                  <ul className="text-xs text-blue-600 text-left space-y-1">
                    <li>• User signups appear instantly</li>
                    <li>• Video uploads & analysis tracked in real-time</li>
                    <li>• Match recordings and goal creation logged</li>
                    <li>• Coach Kai conversations monitored</li>
                    <li>• Subscription changes captured</li>
                  </ul>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchActivities}
                  className="gap-2 hover:bg-purple-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Feed
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
