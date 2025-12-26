
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, Mail, Phone, MapPin, Calendar, Trophy, Target, 
  DollarSign, Activity, Shield, Video, BookOpen, Award,
  Lock, Unlock, RefreshCw, ExternalLink, AlertTriangle
} from "lucide-react"

import UserOverview from "./user-overview"
import UserActivity from "./user-activity"
import UserSubscription from "./user-subscription"
import UserSecurity from "./user-security"
import UserTimeline from "./user-timeline"

interface UserDetailClientProps {
  userId: string
}

export default function UserDetailClient({ userId }: UserDetailClientProps) {
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchUserData()
  }, [userId])

  const fetchUserData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      const data = await response.json()
      setUserData(data)
    } catch (error) {
      console.error("Failed to fetch user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccountAction = async (action: string, data?: any) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data })
      })

      if (response.ok) {
        alert(`Action "${action}" completed successfully`)
        fetchUserData()
      } else {
        alert(`Failed to perform action: ${action}`)
      }
    } catch (error) {
      console.error('Account action error:', error)
      alert('Failed to perform action')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading user details...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">User Not Found</h2>
          <p className="text-slate-600 mb-4">The user you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const { user, analytics } = userData

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 bg-gradient-to-br ${
                  user.subscriptionTier === 'PRO' ? 'from-purple-500 to-pink-500' :
                  user.subscriptionTier === 'PREMIUM' ? 'from-orange-500 to-red-500' :
                  'from-blue-500 to-cyan-500'
                } rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                  {user.firstName?.[0] || user.name?.[0] || 'U'}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {user.name || `${user.firstName} ${user.lastName}`}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">{user.email}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={fetchUserData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              {user.accountLocked ? (
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => handleAccountAction('updateStatus', { locked: false })}
                >
                  <Unlock className="w-4 h-4 mr-2" />
                  Unlock Account
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => {
                    const reason = prompt('Enter reason for locking account:')
                    if (reason) {
                      handleAccountAction('updateStatus', { locked: true, reason })
                    }
                  }}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Lock Account
                </Button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4">
            <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
              <div className="text-sm text-blue-600 mb-1">Subscription</div>
              <Badge className={
                user.subscriptionTier === 'PRO' ? 'bg-purple-500' :
                user.subscriptionTier === 'PREMIUM' ? 'bg-orange-500' :
                'bg-slate-500'
              }>
                {user.subscriptionTier}
              </Badge>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="text-sm text-green-600 mb-1">Lifetime Value</div>
              <div className="text-lg font-bold text-green-700">
                ${analytics.lifetimeValue.toFixed(2)}
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <div className="text-sm text-purple-600 mb-1">Matches</div>
              <div className="text-lg font-bold text-purple-700">{user._count.matches}</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <div className="text-sm text-orange-600 mb-1">Goals</div>
              <div className="text-lg font-bold text-orange-700">{user._count.goals}</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg">
              <div className="text-sm text-cyan-600 mb-1">Page Views</div>
              <div className="text-lg font-bold text-cyan-700">{analytics.totalPageViews}</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg">
              <div className="text-sm text-pink-600 mb-1">Avg Session</div>
              <div className="text-lg font-bold text-pink-700">
                {Math.round(analytics.avgSessionTime / 60)}m
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
            <TabsList className="grid w-full grid-cols-5 gap-2 bg-transparent">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Activity className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Target className="w-4 h-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="subscription" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <DollarSign className="w-4 h-4 mr-2" />
                Subscription
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Calendar className="w-4 h-4 mr-2" />
                Timeline
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <UserOverview data={userData} />
          </TabsContent>

          <TabsContent value="activity">
            <UserActivity data={userData} />
          </TabsContent>

          <TabsContent value="subscription">
            <UserSubscription data={userData} onRefresh={fetchUserData} />
          </TabsContent>

          <TabsContent value="security">
            <UserSecurity data={userData} onAction={handleAccountAction} />
          </TabsContent>

          <TabsContent value="timeline">
            <UserTimeline data={userData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
