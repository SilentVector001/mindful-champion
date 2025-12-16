
"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users,
  DollarSign,
  TrendingUp,
  Trophy,
  Shield,
  UserCheck,
  CreditCard,
  Calendar,
  Crown,
  Zap,
  Target,
  BarChart3,
  PieChart,
  Eye
} from "lucide-react"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar } from 'recharts'

interface AdminDashboardProps {
  data: any
}

const colors = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#FF6363', '#80D8C3']

export default function AdminDashboard({ data }: AdminDashboardProps) {
  // Mock revenue trend data
  const revenueData = [
    { month: 'Jan', revenue: 4200, users: 120 },
    { month: 'Feb', revenue: 5800, users: 180 },
    { month: 'Mar', revenue: 7200, users: 240 },
    { month: 'Apr', revenue: 8900, users: 320 },
    { month: 'May', revenue: 11200, users: 410 },
    { month: 'Jun', revenue: 13800, users: 520 },
  ]

  const subscriptionData = [
    { name: 'Free', value: data.stats.freeUsers, color: colors[0] },
    { name: 'Premium', value: data.stats.premiumUsers, color: colors[1] },
    { name: 'Pro', value: data.stats.proUsers, color: colors[2] },
    { name: 'Trial', value: data.stats.trialUsers, color: colors[3] },
  ]

  const statCards = [
    {
      title: "Total Users",
      value: data.stats.totalUsers.toLocaleString(),
      change: "+12%",
      icon: Users,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Active Subscriptions", 
      value: data.stats.activeSubscriptions.toLocaleString(),
      change: "+8%",
      icon: Crown,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Total Revenue",
      value: `$${data.stats.totalRevenue.toLocaleString()}`,
      change: "+24%",
      icon: DollarSign,
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "Monthly Revenue",
      value: `$${data.stats.monthlyRevenue.toLocaleString()}`,
      change: "+18%",
      icon: TrendingUp,
      gradient: "from-orange-500 to-red-500"
    },
    {
      title: "Total Matches",
      value: data.stats.totalMatches.toLocaleString(),
      change: "+32%",
      icon: Trophy,
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      title: "Conversion Rate",
      value: `${data.conversionRate.toFixed(1)}%`,
      change: "+5%",
      icon: Target,
      gradient: "from-teal-500 to-blue-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-sm text-slate-600">Mindful Champion Platform Management</p>
              </div>
            </div>
            <Badge className="bg-red-100 text-red-800">
              <Shield className="w-3 h-3 mr-1" />
              Admin Access
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden border-0 shadow-lg">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        {stat.value}
                      </p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm font-medium text-green-600">
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-500" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>
                  Monthly revenue and user growth over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                      />
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10B981" 
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Subscription Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-500" />
                  Subscription Distribution
                </CardTitle>
                <CardDescription>
                  Current breakdown of subscription tiers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center">
                  <div className="w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <RechartsPieChart
                          data={subscriptionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}

                          dataKey="value"
                        >
                          {subscriptionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </RechartsPieChart>
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 space-y-3">
                    {subscriptionData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-slate-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Data Tables */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-white border shadow-sm">
              <TabsTrigger value="users">Recent Users</TabsTrigger>
              <TabsTrigger value="subscriptions">Active Subscriptions</TabsTrigger>
              <TabsTrigger value="payments">Recent Payments</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-500" />
                    Recent User Signups
                  </CardTitle>
                  <CardDescription>
                    New users from the last 7 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.recentUsers.map((user: any, index: number) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-medium">
                            {user.firstName?.[0] || user.name?.[0] || 'U'}
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">
                              {user.name || `${user.firstName} ${user.lastName}`}
                            </h4>
                            <p className="text-sm text-slate-600">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {user.skillLevel}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {user.playerRating} rating
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={
                            user.subscriptionTier === 'PRO' ? 'bg-purple-500' :
                            user.subscriptionTier === 'PREMIUM' ? 'bg-orange-500' :
                            'bg-slate-500'
                          }>
                            {user.subscriptionTier}
                          </Badge>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscriptions">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-purple-500" />
                    Active Subscriptions
                  </CardTitle>
                  <CardDescription>
                    Current paying subscribers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.subscriptions.slice(0, 8).map((subscription: any, index: number) => (
                      <div key={subscription.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 bg-gradient-to-br ${
                            subscription.tier === 'PRO' ? 'from-purple-500 to-pink-500' : 'from-orange-500 to-red-500'
                          } rounded-full flex items-center justify-center text-white font-medium`}>
                            {subscription.user.firstName?.[0] || subscription.user.name?.[0] || 'U'}
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">
                              {subscription.user.name || `${subscription.user.firstName} ${subscription.user.lastName}`}
                            </h4>
                            <p className="text-sm text-slate-600">{subscription.user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={
                            subscription.tier === 'PRO' ? 'bg-purple-500' : 'bg-orange-500'
                          }>
                            {subscription.tier} - {subscription.billingCycle}
                          </Badge>
                          <p className="text-sm text-slate-600 mt-1">
                            ${(subscription.amount / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-500" />
                    Recent Payments
                  </CardTitle>
                  <CardDescription>
                    Latest payment transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.payments.map((payment: any, index: number) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">
                              {payment.user.name || `${payment.user.firstName} ${payment.user.lastName}`}
                            </h4>
                            <p className="text-sm text-slate-600">
                              {payment.subscriptionTier} - {payment.billingCycle}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-600">
                            +${(payment.amount / 100).toFixed(2)}
                          </p>
                          <p className="text-sm text-slate-500">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-500" />
                      Key Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Trial Conversion Rate</span>
                      <span className="font-semibold">{((data.stats.premiumUsers + data.stats.proUsers) / Math.max(data.stats.trialUsers, 1) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Average Revenue Per User</span>
                      <span className="font-semibold">${(data.stats.totalRevenue / Math.max(data.stats.totalUsers, 1)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Churn Rate</span>
                      <span className="font-semibold">2.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Customer Lifetime Value</span>
                      <span className="font-semibold">$247</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-orange-500" />
                      Growth Targets
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Monthly Users Goal</span>
                        <span>750 / 1000</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Revenue Target</span>
                        <span>${data.stats.monthlyRevenue.toLocaleString()} / $25,000</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(data.stats.monthlyRevenue / 25000 * 100, 100)}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Subscription Goal</span>
                        <span>{data.stats.activeSubscriptions} / 500</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: `${Math.min(data.stats.activeSubscriptions / 500 * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
