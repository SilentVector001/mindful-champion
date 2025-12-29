"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { 
  TrendingUp, Users, DollarSign, Activity, Video, BookOpen,
  Target, Trophy, Eye, Clock, Award
} from "lucide-react"

export default function AnalyticsSection() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/analytics/overview?period=${period}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      
      // Validate data structure
      if (!data || data.error) {
        console.error("Analytics API returned error:", data?.error)
        setAnalytics(null)
        return
      }
      
      setAnalytics(data)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
      setAnalytics(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Loading analytics...</p>
      </div>
    )
  }

  if (!analytics) {
    return <div className="text-center py-12 text-slate-600">Failed to load analytics</div>
  }

  // Safely destructure with defaults
  const overview = analytics?.overview || {}
  const revenue = analytics?.revenue || {}
  const engagement = analytics?.engagement || {}
  const conversions = analytics?.conversions || {}
  const trends = analytics?.trends || {}
  const popular = analytics?.popular || {}

  // Prepare data for charts with safe accessors
  const userGrowthData = trends?.userGrowth?.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: parseInt(item.count)
  })) || []

  const dauData = trends?.dauTrend?.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: parseInt(item.users)
  })) || []

  const revenueByTierData = revenue?.revenueByTier?.map((item: any) => ({
    tier: item.tier,
    amount: item.amount,
    count: item.count
  })) || []

  const COLORS = ['#8b5cf6', '#f97316', '#3b82f6', '#10b981']

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-end">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
            <SelectItem value="365">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {[
          { label: 'Total Users', value: overview.totalUsers ?? 0, icon: Users, gradient: 'from-blue-500 to-cyan-500' },
          { label: 'Active Users', value: overview.activeUsers ?? 0, icon: Activity, gradient: 'from-green-500 to-emerald-500' },
          { label: 'Trial Users', value: overview.trialUsers ?? 0, icon: TrendingUp, gradient: 'from-purple-500 to-pink-500' },
          { label: 'Premium', value: overview.premiumUsers ?? 0, icon: Trophy, gradient: 'from-orange-500 to-red-500' },
          { label: 'Pro', value: overview.proUsers ?? 0, icon: Award, gradient: 'from-pink-500 to-rose-500' },
          { label: 'New Users', value: overview.newUsers ?? 0, icon: Users, gradient: 'from-cyan-500 to-blue-500' },
          { label: 'Onboarded', value: overview.onboardingCompleted ?? 0, icon: Target, gradient: 'from-yellow-500 to-orange-500' },
          { label: 'Locked', value: overview.lockedAccounts ?? 0, icon: Activity, gradient: 'from-red-500 to-rose-500' },
        ].map((stat, idx) => (
          <Card key={idx} className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.gradient} rounded-lg flex items-center justify-center mb-2`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stat.value.toLocaleString()}</div>
              <div className="text-xs text-slate-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue & Engagement Metrics */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                <div className="text-sm text-green-600 mb-1">Total Revenue</div>
                <div className="text-2xl font-bold text-green-700">
                  ${(revenue.totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                <div className="text-sm text-blue-600 mb-1">MRR</div>
                <div className="text-2xl font-bold text-blue-700">
                  ${(revenue.mrr ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-600 mb-2">Revenue by Tier</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueByTierData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tier" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Engagement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Page Views', value: engagement.totalPageViews ?? 0, icon: Eye },
                { label: 'Sessions', value: engagement.totalSessions ?? 0, icon: Clock },
                { label: 'Videos Watched', value: engagement.totalVideoWatches ?? 0, icon: Video },
                { label: 'Drills Done', value: engagement.totalDrillCompletions ?? 0, icon: BookOpen },
              ].map((metric, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <metric.icon className="w-4 h-4 text-slate-400" />
                    <div className="text-xs text-slate-600">{metric.label}</div>
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {metric.value.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <div className="text-sm text-purple-600 mb-1">Avg Session Duration</div>
              <div className="text-2xl font-bold text-purple-700">
                {Math.round((engagement.avgSessionDuration ?? 0) / 60)} minutes
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Metrics */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Conversion & Retention Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {(conversions.trialConversionRate ?? 0)}%
              </div>
              <div className="text-sm text-slate-600">Trial Conversion Rate</div>
              <div className="text-xs text-slate-500 mt-1">
                {(conversions.trialConversions ?? 0)} converted
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {(conversions.churnRate ?? 0)}%
              </div>
              <div className="text-sm text-slate-600">Churn Rate</div>
              <div className="text-xs text-slate-500 mt-1">
                {(conversions.churnedUsers ?? 0)} churned
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {(revenue.payments ?? 0)}
              </div>
              <div className="text-sm text-slate-600">Total Payments</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {(engagement.totalMatches ?? 0)}
              </div>
              <div className="text-sm text-slate-600">Matches Played</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>User Growth Trend</CardTitle>
            <CardDescription>New users per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Daily Active Users</CardTitle>
            <CardDescription>Active users per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dauData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Popular Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              Most Viewed Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(popular.pages ?? []).slice(0, 10).map((page: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-900 truncate flex-1">{page.path}</span>
                  <Badge variant="secondary">{page.views}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-500" />
              Popular Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(popular.videos ?? []).slice(0, 10).map((video: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-900 truncate flex-1">
                    {video.title || video.id}
                  </span>
                  <Badge variant="secondary">{video.completions}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-500" />
              Popular Drills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(popular.drills ?? []).slice(0, 10).map((drill: any, idx: number) => (
                <div key={idx} className="p-2 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900">{drill.name}</span>
                    <Badge variant="secondary">{drill.completions}</Badge>
                  </div>
                  <div className="text-xs text-slate-600">{drill.category}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Achievements */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Most Earned Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {(popular.achievements ?? []).map((achievement: any, idx: number) => (
              <div key={idx} className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm font-medium text-slate-900 mb-1">{achievement.name}</div>
                <Badge className="bg-orange-500">{achievement.count} earned</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
