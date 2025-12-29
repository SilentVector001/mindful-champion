"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, ChevronLeft, ChevronRight, Users, Mail, Calendar, ExternalLink,
  Filter, Download, RefreshCw, Activity, Clock, TrendingUp, Crown, Sparkles,
  UserCheck, UserX, AlertTriangle, CircleDot
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import UserDetailPanel from "@/components/admin/user-detail-panel"
import { toast } from "sonner"

interface User {
  id: string
  name?: string
  firstName?: string
  lastName?: string
  email: string
  createdAt: string
  subscriptionTier?: string
  skillLevel?: string
  isTrialActive?: boolean
  lastActiveDate?: string
  loginCount?: number
  accountLocked?: boolean
  stripeCustomerId?: string
  _count?: {
    matches: number
    goals: number
    userAchievements: number
    payments: number
    securityLogs: number
  }
}

interface PaginationData {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasMore: boolean
}

interface StatsData {
  totalUsers: number
  activeTrials: number
  onboardingCompleted: number
  lockedAccounts: number
}

export default function EnhancedUsersSection() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [tierFilter, setTierFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  // Safety: Clear selectedUserId on unmount
  useEffect(() => {
    return () => {
      setSelectedUserId(null)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [tierFilter, statusFilter, search, sortBy, sortOrder, page])

  const fetchUsers = async (showToast = false) => {
    if (showToast) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(tierFilter !== 'all' && { tier: tierFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(search && { search }),
        sortBy,
        sortOrder,
      })
      
      const response = await fetch(`/api/admin/users/list?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
      }
      const data = await response.json()
      setUsers(data.users || [])
      setPagination(data.pagination || null)
      setStats(data.stats || null)
      
      if (showToast) {
        toast.success('User list refreshed')
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
      setError("Failed to load users. Please try again.")
      setUsers([])
      if (showToast) {
        toast.error('Failed to refresh user list')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchUsers(true)
  }

  const exportUsers = () => {
    // Create CSV data
    const headers = ['Name', 'Email', 'Tier', 'Skill Level', 'Signup Date', 'Last Active', 'Logins', 'Matches', 'Status']
    const csvData = users.map(user => [
      getUserDisplayName(user),
      user.email,
      user.subscriptionTier || 'FREE',
      user.skillLevel || 'BEGINNER',
      formatDate(user.createdAt),
      user.lastActiveDate ? formatDate(user.lastActiveDate) : 'Never',
      user.loginCount || 0,
      user._count?.matches || 0,
      user.accountLocked ? 'Locked' : user.isTrialActive ? 'Trial' : 'Active'
    ])

    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Users exported to CSV')
  }

  const getUserDisplayName = (user: User): string => {
    if (user.name) return user.name
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`
    if (user.firstName) return user.firstName
    return user.email.split('@')[0]
  }

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy')
    } catch {
      return 'N/A'
    }
  }

  const viewUserDetails = (userId: string) => {
    setSelectedUserId(userId)
  }

  const handleNavigateUser = (userId: string) => {
    setSelectedUserId(userId)
  }

  const getLastActiveText = (lastActiveDate?: string) => {
    if (!lastActiveDate) return 'Never'
    try {
      return formatDistanceToNow(new Date(lastActiveDate), { addSuffix: true })
    } catch {
      return 'Unknown'
    }
  }

  const getStatusBadge = (user: User) => {
    if (user.accountLocked) {
      return <Badge className="bg-red-500 text-white"><UserX className="w-3 h-3 mr-1" /> Locked</Badge>
    }
    if (user.isTrialActive) {
      return <Badge className="bg-orange-500 text-white"><Clock className="w-3 h-3 mr-1" /> Trial</Badge>
    }
    if (user.stripeCustomerId) {
      return <Badge className="bg-green-500 text-white"><UserCheck className="w-3 h-3 mr-1" /> Paid</Badge>
    }
    return <Badge variant="outline" className="text-slate-600">Free</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Users</p>
                  <motion.p 
                    key={stats.totalUsers}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-slate-900"
                  >
                    {stats.totalUsers.toLocaleString()}
                  </motion.p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Active Trials</p>
                  <motion.p 
                    key={stats.activeTrials}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-orange-600"
                  >
                    {stats.activeTrials}
                  </motion.p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Onboarded</p>
                  <motion.p 
                    key={stats.onboardingCompleted}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-green-600"
                  >
                    {stats.onboardingCompleted}
                  </motion.p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Locked Accounts</p>
                  <motion.p 
                    key={stats.lockedAccounts}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-red-600"
                  >
                    {stats.lockedAccounts}
                  </motion.p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10 h-11"
                />
              </div>
              <Select value={tierFilter} onValueChange={(v) => { setTierFilter(v); setPage(1) }}>
                <SelectTrigger className="w-full lg:w-40 h-11">
                  <Crown className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Subscription" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="PREMIUM">Premium</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger className="w-full lg:w-40 h-11">
                  <Filter className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">On Trial</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-40 h-11">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Join Date</SelectItem>
                  <SelectItem value="lastActiveDate">Last Active</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="h-11"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
              </Button>
              <Button
                variant="outline"
                className="h-11"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                className="h-11"
                onClick={exportUsers}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">User Accounts</CardTitle>
                <CardDescription>
                  {pagination?.totalCount?.toLocaleString() || 0} total users • Click a row or double-click for quick view
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-600">Loading users...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={handleRefresh}>Try Again</Button>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-20 text-slate-600">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No users found matching your criteria</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50">
                        <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                        <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subscription</th>
                        <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Activity</th>
                        <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stats</th>
                        <th className="text-right p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence mode="popLayout">
                        {users.map((user, index) => (
                          <motion.tr 
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.02 }}
                            className="border-b border-slate-100 hover:bg-blue-50/50 transition-all cursor-pointer group"
                            onClick={() => viewUserDetails(user.id)}
                            onDoubleClick={() => viewUserDetails(user.id)}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-11 h-11 bg-gradient-to-br ${
                                  user.subscriptionTier === 'PRO' ? 'from-purple-500 to-pink-500' :
                                  user.subscriptionTier === 'PREMIUM' ? 'from-blue-500 to-cyan-500' :
                                  user.isTrialActive ? 'from-orange-400 to-amber-400' :
                                  'from-slate-400 to-slate-500'
                                } rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow`}>
                                  {user.subscriptionTier === 'PRO' && <Sparkles className="w-5 h-5" />}
                                  {user.subscriptionTier === 'PREMIUM' && <Crown className="w-5 h-5" />}
                                  {user.subscriptionTier !== 'PRO' && user.subscriptionTier !== 'PREMIUM' && getUserDisplayName(user).charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-900 truncate">{getUserDisplayName(user)}</p>
                                  <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge className={`${
                                user.subscriptionTier === 'PRO' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                                user.subscriptionTier === 'PREMIUM' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                                'bg-slate-200 text-slate-700'
                              }`}>
                                {user.subscriptionTier === 'PRO' && <Sparkles className="w-3 h-3 mr-1" />}
                                {user.subscriptionTier === 'PREMIUM' && <Crown className="w-3 h-3 mr-1" />}
                                {user.subscriptionTier || 'FREE'}
                              </Badge>
                            </td>
                            <td className="p-4">
                              {getStatusBadge(user)}
                            </td>
                            <td className="p-4">
                              <div className="space-y-1">
                                <p className="text-sm text-slate-700 flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  Joined {formatDate(user.createdAt)}
                                </p>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                  <Activity className="w-3 h-3" />
                                  Active {getLastActiveText(user.lastActiveDate)}
                                </p>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3 text-xs text-slate-600">
                                <span className="flex items-center gap-1" title="Login count">
                                  <TrendingUp className="w-3 h-3" />
                                  {user.loginCount || 0} logins
                                </span>
                                <span className="flex items-center gap-1" title="Matches">
                                  <CircleDot className="w-3 h-3" />
                                  {user._count?.matches || 0}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  viewUserDetails(user.id)
                                }}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t bg-slate-50/50">
                    <div className="text-sm text-slate-600">
                      Showing <span className="font-semibold">{((page - 1) * (pagination.limit || 20)) + 1}</span> to <span className="font-semibold">{Math.min(page * (pagination.limit || 20), pagination.totalCount)}</span> of <span className="font-semibold">{pagination.totalCount.toLocaleString()}</span> users
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let pageNum: number
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1
                          } else if (page <= 3) {
                            pageNum = i + 1
                          } else if (page >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i
                          } else {
                            pageNum = page - 2 + i
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={page === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPage(pageNum)}
                              className={page === pageNum ? 'bg-blue-600' : ''}
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                        {pagination.totalPages > 5 && page < pagination.totalPages - 2 && (
                          <>
                            <span className="px-2 text-slate-400">...</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPage(pagination.totalPages)}
                            >
                              {pagination.totalPages}
                            </Button>
                          </>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === pagination.totalPages}
                        onClick={() => setPage(page + 1)}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* User Detail Side Panel */}
      <AnimatePresence>
        {selectedUserId && (
          <UserDetailPanel
            userId={selectedUserId}
            onClose={() => setSelectedUserId(null)}
            onNavigate={handleNavigateUser}
            allUserIds={users.map(u => u.id)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
