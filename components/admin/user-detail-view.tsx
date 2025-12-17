"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, User, Mail, Calendar, Shield, DollarSign, Trophy, 
  Target, Activity, Video, Eye, Lock, Unlock, RefreshCw, Edit,
  TrendingUp, Clock, MapPin, Award, Flag, AlertCircle, CheckCircle,
  XCircle, Pause, Play, Ban, RefreshCcw, BarChart, Navigation
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import UserNavigationFlow from "./user-detail/user-navigation-flow"

interface UserDetailViewProps {
  userId: string
}

export default function UserDetailView({ userId }: UserDetailViewProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [subscriptionAction, setSubscriptionAction] = useState<string | null>(null)
  const [reason, setReason] = useState("")

  useEffect(() => {
    fetchUserData()
  }, [userId])

  const fetchUserData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/detail?userId=${userId}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Failed to fetch user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccountAction = async (action: string) => {
    if (!confirm(`Are you sure you want to ${action} this account?`)) {
      return
    }

    try {
      const updates: any = {}
      if (action === 'lock') {
        updates.accountLocked = true
        updates.accountLockedReason = 'Locked by admin'
      } else if (action === 'unlock') {
        updates.accountLocked = false
        updates.accountLockedReason = null
        updates.failedLoginAttempts = 0
      }

      const response = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates })
      })

      if (response.ok) {
        alert(`Account ${action}ed successfully`)
        fetchUserData()
      } else {
        alert(`Failed to ${action} account`)
      }
    } catch (error) {
      console.error(`Error ${action}ing account:`, error)
      alert(`Error ${action}ing account`)
    }
  }

  const handleSubscriptionAction = async () => {
    if (!subscriptionAction) return

    try {
      const response = await fetch('/api/admin/subscriptions/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: subscriptionAction, 
          userId,
          reason 
        })
      })

      if (response.ok) {
        alert(`Subscription ${subscriptionAction}ed successfully`)
        setSubscriptionAction(null)
        setReason("")
        fetchUserData()
      } else {
        const error = await response.json()
        alert(`Failed: ${error.details || error.error}`)
      }
    } catch (error) {
      console.error('Error managing subscription:', error)
      alert('Error managing subscription')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
      </div>
    )
  }

  if (!data || !data.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">User Not Found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const { user, engagementMetrics, recentActivity, topPages, topNavigationPaths } = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {user.firstName?.[0] || user.name?.[0] || 'U'}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {user.name || `${user.firstName} ${user.lastName}`}
                  </h1>
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchUserData}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              {user.accountLocked ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleAccountAction('unlock')}
                >
                  <Unlock className="w-4 h-4 mr-2" />
                  Unlock Account
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleAccountAction('lock')}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Lock Account
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6">
        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge className={`
            ${user.subscriptionTier === 'PRO' ? 'bg-purple-500' :
              user.subscriptionTier === 'PREMIUM' ? 'bg-orange-500' :
              'bg-slate-500'}
          `}>
            {user.subscriptionTier}
          </Badge>
          <Badge className={`
            ${user.subscriptionStatus === 'ACTIVE' ? 'bg-green-500' :
              user.subscriptionStatus === 'CANCELED' ? 'bg-red-500' :
              'bg-yellow-500'}
          `}>
            {user.subscriptionStatus}
          </Badge>
          {user.isTrialActive && (
            <Badge className="bg-blue-500">
              Trial Active
            </Badge>
          )}
          {user.accountLocked && (
            <Badge className="bg-red-500">
              <Lock className="w-3 h-3 mr-1" />
              Account Locked
            </Badge>
          )}
          <Badge variant="outline">
            {user.skillLevel}
          </Badge>
          <Badge variant="outline">
            <Calendar className="w-3 h-3 mr-1" />
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Revenue"
            value={`$${engagementMetrics.totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            gradient="from-green-500 to-emerald-500"
          />
          <StatCard
            title="Total Sessions"
            value={engagementMetrics.totalSessions}
            icon={Activity}
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            title="Videos Watched"
            value={engagementMetrics.totalVideoWatched}
            icon={Video}
            gradient="from-purple-500 to-pink-500"
          />
          <StatCard
            title="Drills Completed"
            value={engagementMetrics.totalDrillsCompleted}
            icon={Trophy}
            gradient="from-orange-500 to-red-500"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 gap-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InfoRow label="Name" value={user.name || `${user.firstName} ${user.lastName}`} />
                  <InfoRow label="Email" value={user.email} />
                  <InfoRow label="Skill Level" value={user.skillLevel} />
                  <InfoRow label="Player Rating" value={user.playerRating} />
                  <InfoRow label="Location" value={user.location || 'Not set'} />
                  <InfoRow label="Timezone" value={user.timezone} />
                  <InfoRow label="Age Range" value={user.ageRange || 'Not set'} />
                  <InfoRow label="Gender" value={user.gender || 'Not set'} />
                  <InfoRow 
                    label="Stripe Customer" 
                    value={user.stripeCustomerId ? `✓ ${user.stripeCustomerId.substring(0, 20)}...` : 'None'} 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InfoRow 
                    label="Total Sessions" 
                    value={engagementMetrics.totalSessions} 
                  />
                  <InfoRow 
                    label="Avg Session Duration" 
                    value={`${Math.floor(engagementMetrics.avgSessionDuration / 60)}m ${engagementMetrics.avgSessionDuration % 60}s`} 
                  />
                  <InfoRow 
                    label="Total Page Views" 
                    value={engagementMetrics.totalPageViews} 
                  />
                  <InfoRow 
                    label="Videos Watched" 
                    value={engagementMetrics.totalVideoWatched} 
                  />
                  <InfoRow 
                    label="Drills Completed" 
                    value={engagementMetrics.totalDrillsCompleted} 
                  />
                  <InfoRow 
                    label="Login Count" 
                    value={user.loginCount} 
                  />
                  <InfoRow 
                    label="Last Active" 
                    value={user.lastActiveDate ? new Date(user.lastActiveDate).toLocaleString() : 'Never'} 
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Subscription Management</CardTitle>
                    <CardDescription>Manage user subscription and billing</CardDescription>
                  </div>
                  {!user.stripeCustomerId ? (
                    <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      No Stripe subscription
                    </div>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Edit className="w-4 h-4 mr-2" />
                          Manage Subscription
                        </Button>
                      </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Manage Subscription</DialogTitle>
                        <DialogDescription>
                          Choose an action to perform on this user's subscription
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setSubscriptionAction('pause')}
                            className={subscriptionAction === 'pause' ? 'bg-slate-100' : ''}
                          >
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setSubscriptionAction('resume')}
                            className={subscriptionAction === 'resume' ? 'bg-slate-100' : ''}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Resume
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setSubscriptionAction('cancel')}
                            className={subscriptionAction === 'cancel' ? 'bg-slate-100' : ''}
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setSubscriptionAction('refund')}
                            className={subscriptionAction === 'refund' ? 'bg-slate-100' : ''}
                          >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Refund
                          </Button>
                        </div>
                        {subscriptionAction && (
                          <div className="space-y-2">
                            <Label>Reason (optional)</Label>
                            <Textarea
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              placeholder="Enter reason for this action..."
                              rows={3}
                            />
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSubscriptionAction(null)
                            setReason("")
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubscriptionAction}
                          disabled={!subscriptionAction}
                        >
                          Confirm {subscriptionAction}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Current Subscription</h4>
                    <div className="space-y-2">
                      <InfoRow label="Tier" value={user.subscriptionTier} />
                      <InfoRow label="Status" value={user.subscriptionStatus} />
                      <InfoRow 
                        label="Trial Active" 
                        value={user.isTrialActive ? 'Yes' : 'No'} 
                      />
                      {user.trialEndDate && (
                        <InfoRow 
                          label="Trial Ends" 
                          value={new Date(user.trialEndDate).toLocaleDateString()} 
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Subscription History</h4>
                    <div className="space-y-2">
                      {data.subscriptions.length > 0 ? (
                        data.subscriptions.map((sub: any) => (
                          <div key={sub.id} className="p-3 bg-slate-50 rounded-lg text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{sub.tier}</span>
                              <Badge className={`
                                ${sub.status === 'ACTIVE' ? 'bg-green-500' :
                                  sub.status === 'CANCELED' ? 'bg-red-500' :
                                  'bg-yellow-500'}
                              `}>
                                {sub.status}
                              </Badge>
                            </div>
                            <div className="text-slate-600">
                              {sub.billingCycle} • ${(sub.amount / 100).toFixed(2)}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {new Date(sub.currentPeriodStart).toLocaleDateString()} - 
                              {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-sm">No subscription history</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity Timeline</CardTitle>
                <CardDescription>Last 50 activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {recentActivity.map((activity: any, index: number) => (
                    <ActivityItem key={index} activity={activity} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Achievement Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.achievementStats ? (
                    <div className="space-y-3">
                      <InfoRow 
                        label="Total Points" 
                        value={data.achievementStats.totalPoints} 
                      />
                      <InfoRow 
                        label="Total Achievements" 
                        value={data.achievementStats.totalAchievements} 
                      />
                      <InfoRow 
                        label="Bronze Medals" 
                        value={data.achievementStats.bronzeMedals} 
                      />
                      <InfoRow 
                        label="Silver Medals" 
                        value={data.achievementStats.silverMedals} 
                      />
                      <InfoRow 
                        label="Gold Medals" 
                        value={data.achievementStats.goldMedals} 
                      />
                      <InfoRow 
                        label="Badges" 
                        value={data.achievementStats.badges} 
                      />
                      <InfoRow 
                        label="Has Crown" 
                        value={data.achievementStats.hasCrown ? 'Yes' : 'No'} 
                      />
                      {data.achievementStats.rank && (
                        <InfoRow label="Rank" value={data.achievementStats.rank} />
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500">No achievement stats available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {user.userAchievements && user.userAchievements.length > 0 ? (
                      user.userAchievements.map((ua: any) => (
                        <div key={ua.id} className="p-3 bg-slate-50 rounded-lg">
                          <div className="font-medium">{ua.achievement.name}</div>
                          <div className="text-sm text-slate-600">
                            {ua.achievement.description}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Unlocked: {new Date(ua.unlockedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-sm">No achievements yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Events</CardTitle>
                <CardDescription>Security logs and authentication history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {data.securityLogs && data.securityLogs.length > 0 ? (
                    data.securityLogs.map((log: any) => (
                      <div key={log.id} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{log.eventType}</span>
                          <Badge className={`
                            ${log.severity === 'CRITICAL' ? 'bg-red-500' :
                              log.severity === 'HIGH' ? 'bg-orange-500' :
                              log.severity === 'MEDIUM' ? 'bg-yellow-500' :
                              'bg-blue-500'}
                          `}>
                            {log.severity}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600">{log.description}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {new Date(log.timestamp).toLocaleString()}
                          {log.ipAddress && ` • ${log.ipAddress}`}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500">No security logs</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Behavior Tab */}
          <TabsContent value="behavior">
            <UserNavigationFlow data={{ topNavigationPaths, topPages }} />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>All payments from this user</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.payments && data.payments.length > 0 ? (
                    data.payments.map((payment: any) => (
                      <div key={payment.id} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            ${(payment.amount / 100).toFixed(2)}
                          </span>
                          <Badge className={`
                            ${payment.status === 'succeeded' ? 'bg-green-500' :
                              payment.status === 'refunded' ? 'bg-red-500' :
                              'bg-yellow-500'}
                          `}>
                            {payment.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600">
                          {payment.subscriptionTier} - {payment.billingCycle}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {new Date(payment.createdAt).toLocaleString()}
                        </div>
                        {payment.stripePaymentIntentId && (
                          <div className="text-xs text-slate-400 mt-1 font-mono">
                            {payment.stripePaymentIntentId.substring(0, 30)}...
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500">No payment history</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, gradient }: any) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
          <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function InfoRow({ label, value }: { label: string, value: any }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  )
}

function ActivityItem({ activity }: { activity: any }) {
  const getIcon = () => {
    const iconMap: any = {
      'page_view': <Eye className="w-4 h-4 text-blue-500" />,
      'navigation': <Navigation className="w-4 h-4 text-indigo-500" />,
      'video_interaction': <Video className="w-4 h-4 text-purple-500" />,
      'drill_completion': <Trophy className="w-4 h-4 text-green-500" />,
      'security_event': <Shield className="w-4 h-4 text-red-500" />,
      'authentication': <Lock className="w-4 h-4 text-amber-500" />,
    }
    return iconMap[activity.type] || <Activity className="w-4 h-4 text-slate-500" />
  }

  const getCategoryColor = (category: string) => {
    const colorMap: any = {
      'Navigation': 'bg-blue-50 text-blue-700 border-blue-200',
      'Training': 'bg-purple-50 text-purple-700 border-purple-200',
      'Security': 'bg-red-50 text-red-700 border-red-200',
      'Account': 'bg-green-50 text-green-700 border-green-200',
      'Progress': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    }
    return colorMap[category] || 'bg-slate-50 text-slate-700 border-slate-200'
  }

  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-slate-900">{activity.title || 'Activity'}</span>
          {activity.category && (
            <span className={`text-xs px-2 py-0.5 rounded border ${getCategoryColor(activity.category)}`}>
              {activity.category}
            </span>
          )}
        </div>
        <div className="text-sm text-slate-700 mb-1">
          {activity.description || getDescription()}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{activity.timestampFormatted || new Date(activity.timestamp).toLocaleString()}</span>
          {activity.relativeTime && (
            <span className="text-slate-400">• {activity.relativeTime}</span>
          )}
        </div>
        {activity.metadata && Object.keys(activity.metadata).some(key => activity.metadata[key]) && (
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.entries(activity.metadata).map(([key, value]: [string, any]) => 
              value && (
                <span key={key} className="text-xs px-1.5 py-0.5 bg-white rounded border border-slate-200">
                  {key}: {String(value)}
                </span>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )

  function getDescription() {
    switch (activity.type) {
      case 'page_view':
        return `Viewed: ${activity.data?.path || 'Unknown page'}`
      case 'video_interaction':
        return `${activity.data?.interactionType}: ${activity.data?.videoTitle || 'Video'}`
      case 'drill_completion':
        return `${activity.data?.status}: ${activity.data?.drillName}`
      case 'security_event':
        return `${activity.data?.eventType} (${activity.data?.severity})`
      default:
        return 'Activity'
    }
  }
}
