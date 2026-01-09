// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Users, DollarSign, Trophy, TrendingUp, Mail, 
  ArrowLeft, RefreshCw, Search, Eye, Send, UserPlus,
  Calendar, Clock, CheckCircle, AlertCircle, Crown
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

interface StreamlinedAdminProps {
  initialData: any
}

export default function StreamlinedAdmin({ initialData }: StreamlinedAdminProps) {
  const [activeView, setActiveView] = useState<'overview' | 'users' | 'emails'>('overview')
  const [users, setUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users/list')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const sendWelcomeEmail = async (userId: string, email: string) => {
    setSendingEmail(userId)
    try {
      const res = await fetch('/api/admin/send-welcome-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      if (res.ok) {
        alert(`Welcome email sent to ${email}`)
        fetchUsers() // Refresh to update status
      } else {
        alert('Failed to send email')
      }
    } catch (error) {
      alert('Error sending email')
    } finally {
      setSendingEmail(null)
    }
  }

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const { stats, recentUsers } = initialData

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <motion.div whileHover={{ y: -2 }} className="flex-1">
      <Card className={`bg-gradient-to-br ${color} border-0 shadow-lg`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-xs font-medium uppercase tracking-wide">{title}</p>
              <p className="text-2xl font-bold text-white mt-1">{value}</p>
              {trend && <p className="text-white/70 text-xs mt-1">{trend}</p>}
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div className="h-6 w-px bg-slate-600" />
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                v1.50 BETA
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick Nav */}
        <div className="flex gap-2 mb-6">
          {['overview', 'users', 'emails'].map(view => (
            <Button
              key={view}
              variant={activeView === view ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView(view as any)}
              className={activeView === view 
                ? 'bg-cyan-500 hover:bg-cyan-600 text-white' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </Button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon={Users} 
            trend={stats.userTrend}
            color="from-blue-600 to-blue-700"
          />
          <StatCard 
            title="Revenue" 
            value={`$${stats.totalRevenue.toFixed(0)}`} 
            icon={DollarSign} 
            trend={stats.revenueTrend}
            color="from-emerald-600 to-emerald-700"
          />
          <StatCard 
            title="Active Trials" 
            value={stats.trialUsers} 
            icon={Clock} 
            color="from-amber-600 to-amber-700"
          />
          <StatCard 
            title="Pro Users" 
            value={stats.proUsers + stats.premiumUsers} 
            icon={Crown} 
            color="from-purple-600 to-purple-700"
          />
        </div>

        {/* Main Content */}
        {activeView === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Signups */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-cyan-400" />
                  Recent Signups
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentUsers?.slice(0, 5).map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">
                        {user.firstName || user.name || 'User'} {user.lastName || ''}
                      </p>
                      <p className="text-slate-400 text-sm">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={user.isTrialActive 
                        ? 'bg-amber-500/20 text-amber-400' 
                        : 'bg-slate-600 text-slate-300'
                      }>
                        {user.subscriptionTier || 'FREE'}
                      </Badge>
                      <p className="text-slate-500 text-xs mt-1">
                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="ghost" 
                  className="w-full text-cyan-400 hover:text-cyan-300 hover:bg-slate-700"
                  onClick={() => setActiveView('users')}
                >
                  View All Users →
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/users" className="block">
                  <Button variant="outline" className="w-full justify-start text-left bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700">
                    <Users className="w-4 h-4 mr-3 text-blue-400" />
                    Manage All Users
                  </Button>
                </Link>
                <Link href="/admin/videos" className="block">
                  <Button variant="outline" className="w-full justify-start text-left bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700">
                    <Trophy className="w-4 h-4 mr-3 text-amber-400" />
                    Video Analytics
                  </Button>
                </Link>
                <Link href="/admin/emails" className="block">
                  <Button variant="outline" className="w-full justify-start text-left bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700">
                    <Mail className="w-4 h-4 mr-3 text-emerald-400" />
                    Email Management
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700"
                  onClick={() => setActiveView('emails')}
                >
                  <Send className="w-4 h-4 mr-3 text-purple-400" />
                  Send Welcome Emails
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === 'users' && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">All Users ({users.length})</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="text-white font-medium">
                          {user.firstName || user.name || 'User'} {user.lastName || ''}
                        </p>
                        <Badge className={user.role === 'ADMIN' 
                          ? 'bg-red-500/20 text-red-400' 
                          : user.subscriptionTier === 'PRO' 
                            ? 'bg-purple-500/20 text-purple-400'
                            : user.isTrialActive
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-slate-600 text-slate-300'
                        }>
                          {user.role === 'ADMIN' ? 'ADMIN' : user.subscriptionTier || 'FREE'}
                        </Badge>
                        {user.welcomeEmailSent && (
                          <CheckCircle className="w-4 h-4 text-emerald-400" title="Welcome email sent" />
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">{user.email}</p>
                      <p className="text-slate-500 text-xs mt-1">
                        Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                        {user.lastActiveDate && ` • Active ${formatDistanceToNow(new Date(user.lastActiveDate), { addSuffix: true })}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/users/${user.id}`}>
                        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-600">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      {!user.welcomeEmailSent && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-cyan-400 hover:text-cyan-300 hover:bg-slate-600"
                          onClick={() => sendWelcomeEmail(user.id, user.email)}
                          disabled={sendingEmail === user.id}
                        >
                          {sendingEmail === user.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Mail className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeView === 'emails' && (
          <div className="space-y-6">
            {/* Pending Emails */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-cyan-400" />
                  Pending Welcome Emails
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredUsers.filter(u => !u.welcomeEmailSent).length === 0 ? (
                    <div className="text-center py-4">
                      <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">All welcome emails sent!</p>
                    </div>
                  ) : (
                    filteredUsers.filter(u => !u.welcomeEmailSent).map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                        <div>
                          <p className="text-white font-medium">
                            {user.firstName || user.name || 'User'} {user.lastName || ''}
                          </p>
                          <p className="text-slate-400 text-sm">{user.email}</p>
                        </div>
                        <Button
                          onClick={() => sendWelcomeEmail(user.id, user.email)}
                          disabled={sendingEmail === user.id}
                          size="sm"
                          className="bg-cyan-500 hover:bg-cyan-600 text-white"
                        >
                          {sendingEmail === user.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Email History */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-cyan-400" />
                  Email History ({initialData?.emailLogs?.length || 0} sent)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!initialData?.emailLogs?.length ? (
                  <div className="text-center py-8 text-slate-400">
                    <Mail className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>No emails have been sent yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {initialData.emailLogs.map((log: any) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {log.status === 'SENT' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          )}
                          <div>
                            <p className="text-white text-sm">{log.type}</p>
                            <p className="text-slate-400 text-xs">{log.recipientEmail}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={log.status === 'SENT' ? 'border-emerald-500/50 text-emerald-400' : 'border-red-500/50 text-red-400'}>
                            {log.status}
                          </Badge>
                          <p className="text-slate-500 text-xs mt-1">
                            {formatDistanceToNow(new Date(log.sentAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
