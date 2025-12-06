"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DollarSign, Users, TrendingUp, TrendingDown, RefreshCw, 
  UserPlus, CreditCard, Crown, Sparkles, Calendar, Clock,
  ArrowUpRight, ArrowDownRight, Zap, Target, PieChart
} from "lucide-react"
import { toast } from "sonner"

interface RevenueData {
  signups: {
    today: number
    thisWeek: number
    thisMonth: number
    total: number
  }
  revenue: {
    today: number
    thisWeek: number
    thisMonth: number
    thisYear: number
    total: number
  }
  subscriptions: {
    free: number
    premium: number
    pro: number
    trial: number
    active: number
    total: number
  }
  metrics: {
    mrr: number
    arr: number
    churnRate: number
    conversionRate: string
  }
  recentPayments: Array<{
    id: string
    amount: number
    tier: string
    email: string
    name: string
    createdAt: string
  }>
  trends: {
    monthlyRevenue: Array<{ month: string; total: number }>
    dailySignups: Array<{ day: string; count: number }>
  }
  lastUpdated: string
}

export default function RevenueDashboard() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(30)

  const fetchData = useCallback(async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true)
      const response = await fetch('/api/admin/analytics/revenue')
      if (!response.ok) throw new Error('Failed to fetch revenue data')
      const result = await response.json()
      setData(result)
      setLastRefresh(new Date())
      setSecondsUntilRefresh(30)
      if (showToast) {
        toast.success('Dashboard refreshed', {
          description: `Updated at ${new Date().toLocaleTimeString()}`
        })
      }
    } catch (error) {
      console.error('Failed to fetch revenue data:', error)
      toast.error('Failed to refresh dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefreshEnabled) return

    const refreshInterval = setInterval(() => {
      fetchData()
    }, 30000)

    const countdownInterval = setInterval(() => {
      setSecondsUntilRefresh(prev => prev > 0 ? prev - 1 : 30)
    }, 1000)

    return () => {
      clearInterval(refreshInterval)
      clearInterval(countdownInterval)
    }
  }, [autoRefreshEnabled, fetchData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading revenue dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600">Failed to load revenue data</p>
        <Button onClick={() => fetchData(true)} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Auto-Refresh Status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Real-Time Revenue Dashboard
          </h2>
          <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
            <Clock className="w-4 h-4" />
            Last updated: {lastRefresh?.toLocaleTimeString() || 'Never'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2">
            <div className={`w-2 h-2 rounded-full ${autoRefreshEnabled ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="text-sm text-slate-600">
              {autoRefreshEnabled ? `Auto-refresh in ${secondsUntilRefresh}s` : 'Auto-refresh disabled'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
            className={autoRefreshEnabled ? 'border-green-500 text-green-600' : ''}
          >
            {autoRefreshEnabled ? 'Pause' : 'Resume'}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Now
          </Button>
        </div>
      </motion.div>

      {/* Sign-Up Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white overflow-hidden">
          <div className="absolute inset-0 bg-white/5" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Real-Time Sign-Ups
            </CardTitle>
            <CardDescription className="text-blue-100">
              New user registrations tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <motion.p 
                  key={data.signups.today}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-bold"
                >
                  {data.signups.today}
                </motion.p>
                <p className="text-sm text-blue-100 mt-1">Today</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <motion.p 
                  key={data.signups.thisWeek}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-bold"
                >
                  {data.signups.thisWeek}
                </motion.p>
                <p className="text-sm text-blue-100 mt-1">This Week</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <motion.p 
                  key={data.signups.thisMonth}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-bold"
                >
                  {data.signups.thisMonth}
                </motion.p>
                <p className="text-sm text-blue-100 mt-1">This Month</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <motion.p 
                  key={data.signups.total}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-bold"
                >
                  {data.signups.total.toLocaleString()}
                </motion.p>
                <p className="text-sm text-blue-100 mt-1">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Today", value: data.revenue.today, icon: Calendar, color: "from-green-500 to-emerald-500" },
          { label: "This Week", value: data.revenue.thisWeek, icon: TrendingUp, color: "from-blue-500 to-cyan-500" },
          { label: "This Month", value: data.revenue.thisMonth, icon: DollarSign, color: "from-purple-500 to-pink-500" },
          { label: "This Year", value: data.revenue.thisYear, icon: Target, color: "from-orange-500 to-red-500" },
          { label: "All Time", value: data.revenue.total, icon: Sparkles, color: "from-yellow-500 to-amber-500" },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{item.label}</p>
                    <motion.p 
                      key={item.value}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-bold text-slate-900 mt-1"
                    >
                      {formatCurrency(item.value)}
                    </motion.p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-green-600 uppercase">MRR</p>
                  <p className="text-3xl font-bold text-green-700">{formatCurrency(data.metrics.mrr)}</p>
                  <p className="text-xs text-green-600 mt-1">Monthly Recurring Revenue</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase">ARR</p>
                  <p className="text-3xl font-bold text-blue-700">{formatCurrency(data.metrics.arr)}</p>
                  <p className="text-xs text-blue-600 mt-1">Annual Run Rate</p>
                </div>
                <Zap className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-purple-600 uppercase">Conversion Rate</p>
                  <p className="text-3xl font-bold text-purple-700">{data.metrics.conversionRate}%</p>
                  <p className="text-xs text-purple-600 mt-1">Free to Paid</p>
                </div>
                <Target className="w-10 h-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45 }}
        >
          <Card className={`border-2 ${data.metrics.churnRate > 5 ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-semibold uppercase ${data.metrics.churnRate > 5 ? 'text-red-600' : 'text-amber-600'}`}>Churn Rate</p>
                  <p className={`text-3xl font-bold ${data.metrics.churnRate > 5 ? 'text-red-700' : 'text-amber-700'}`}>{data.metrics.churnRate}%</p>
                  <p className={`text-xs mt-1 ${data.metrics.churnRate > 5 ? 'text-red-600' : 'text-amber-600'}`}>Last 30 days</p>
                </div>
                {data.metrics.churnRate > 5 ? (
                  <TrendingDown className="w-10 h-10 text-red-500" />
                ) : (
                  <TrendingUp className="w-10 h-10 text-amber-500" />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Subscription Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-500" />
                Subscription Breakdown
              </CardTitle>
              <CardDescription>Current user distribution by plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Visual Bar Chart */}
                <div className="h-8 rounded-full overflow-hidden flex bg-slate-100">
                  {data.subscriptions.total > 0 && (
                    <>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(data.subscriptions.pro / data.subscriptions.total) * 100}%` }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-full"
                        title={`Pro: ${data.subscriptions.pro}`}
                      />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(data.subscriptions.premium / data.subscriptions.total) * 100}%` }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full"
                        title={`Premium: ${data.subscriptions.premium}`}
                      />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(data.subscriptions.trial / data.subscriptions.total) * 100}%` }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-full"
                        title={`Trial: ${data.subscriptions.trial}`}
                      />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(data.subscriptions.free / data.subscriptions.total) * 100}%` }}
                        transition={{ duration: 1, delay: 0.9 }}
                        className="bg-gradient-to-r from-slate-400 to-slate-500 h-full"
                        title={`Free: ${data.subscriptions.free}`}
                      />
                    </>
                  )}
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <span className="text-sm font-medium text-slate-700">Pro</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-purple-700">{data.subscriptions.pro}</span>
                      <span className="text-xs text-slate-500 ml-1">
                        ({data.subscriptions.total > 0 ? ((data.subscriptions.pro / data.subscriptions.total) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm font-medium text-slate-700">Premium</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-blue-700">{data.subscriptions.premium}</span>
                      <span className="text-xs text-slate-500 ml-1">
                        ({data.subscriptions.total > 0 ? ((data.subscriptions.premium / data.subscriptions.total) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <span className="text-sm font-medium text-slate-700">Trial</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-orange-700">{data.subscriptions.trial}</span>
                      <span className="text-xs text-slate-500 ml-1">
                        ({data.subscriptions.total > 0 ? ((data.subscriptions.trial / data.subscriptions.total) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-500" />
                      <span className="text-sm font-medium text-slate-700">Free</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-slate-700">{data.subscriptions.free}</span>
                      <span className="text-xs text-slate-500 ml-1">
                        ({data.subscriptions.total > 0 ? ((data.subscriptions.free / data.subscriptions.total) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Active Subscriptions</span>
                    <Badge className="bg-green-500">{data.subscriptions.active} active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Payments */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-500" />
                Recent Payments
              </CardTitle>
              <CardDescription>Latest successful transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[350px] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {data.recentPayments.map((payment, index) => (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          payment.tier === 'PRO' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                          payment.tier === 'PREMIUM' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                          'bg-gradient-to-br from-slate-400 to-slate-500'
                        }`}>
                          {payment.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">{payment.name}</p>
                          <p className="text-xs text-slate-500">{payment.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                        <div className="flex items-center gap-1 justify-end">
                          <Badge variant="outline" className={`text-xs ${
                            payment.tier === 'PRO' ? 'border-purple-500 text-purple-600' :
                            payment.tier === 'PREMIUM' ? 'border-blue-500 text-blue-600' :
                            'border-slate-400 text-slate-600'
                          }`}>
                            {payment.tier}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {data.recentPayments.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No recent payments</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Daily Signups Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Daily Sign-ups (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-40">
              {data.trends.dailySignups.map((item, index) => {
                const maxCount = Math.max(...data.trends.dailySignups.map(s => s.count), 1)
                const height = (item.count / maxCount) * 100
                const date = new Date(item.day)
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 5)}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg relative group cursor-pointer"
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.count} sign-ups
                      </div>
                    </motion.div>
                    <span className="text-xs text-slate-600">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
