
"use client"

import { useState, useEffect } from "react"
import { X, Mail, Calendar, Shield, Trophy, Video, Target, Users, ExternalLink, ChevronLeft, ChevronRight, Upload, Plus, Check, Lock, Award, TrendingUp, Trash2, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { toast } from "sonner"
import { AdminVideoHub } from "@/components/admin/video/admin-video-hub"
import UserSubscription from "@/components/admin/user-detail/user-subscription"

interface UserDetailPanelProps {
  userId: string
  onClose: () => void
  onNavigate?: (userId: string) => void
  allUserIds?: string[]
}

export default function UserDetailPanel({ userId, onClose, onNavigate, allUserIds = [] }: UserDetailPanelProps) {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("")
  const [deleteReason, setDeleteReason] = useState("")
  const [deleting, setDeleting] = useState(false)

  // SAFETY CHECK: If no userId provided, close immediately
  useEffect(() => {
    if (!userId || userId.trim() === '') {
      console.warn('[UserDetailPanel] No valid userId provided, closing panel')
      onClose()
    }
  }, [userId, onClose])

  // Handle escape key to close panel
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  useEffect(() => {
    if (userId && userId.trim() !== '') {
      fetchUserData()
    }
  }, [userId])

  const fetchUserData = async () => {
    setLoading(true)
    try {
      // Add timeout to prevent infinite loading
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) throw new Error('Failed to fetch user data')
      const data = await response.json()
      setUserData(data)
    } catch (error) {
      console.error("Failed to fetch user details:", error)
      setUserData(null) // Set to null to trigger error UI
    } finally {
      setLoading(false)
    }
  }

  const currentIndex = allUserIds.indexOf(userId)
  const canNavigatePrev = currentIndex > 0
  const canNavigateNext = currentIndex < allUserIds.length - 1

  const handlePrevUser = () => {
    if (canNavigatePrev && onNavigate) {
      onNavigate(allUserIds[currentIndex - 1])
    }
  }

  const handleNextUser = () => {
    if (canNavigateNext && onNavigate) {
      onNavigate(allUserIds[currentIndex + 1])
    }
  }

  const handleDeleteUser = async () => {
    if (!userData?.user?.email || deleteConfirmEmail !== userData.user.email) {
      toast.error("Email confirmation does not match")
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: deleteReason || 'No reason provided',
          confirmEmail: deleteConfirmEmail,
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('User account deleted successfully', {
          description: `${userData.user.email} has been permanently deleted`
        })
        setDeleteDialogOpen(false)
        onClose()
        // Refresh the page to update the user list
        window.location.reload()
      } else {
        toast.error('Failed to delete user', {
          description: result.error || 'Unknown error'
        })
      }
    } catch (error) {
      console.error('Delete user error:', error)
      toast.error('Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
        <div className="bg-white rounded-xl p-8 max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="text-center">
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading user details...</p>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="mt-4"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
        <div className="bg-white rounded-xl p-8 max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="text-center">
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-slate-600 mb-4">Failed to load user details.</p>
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const user = userData.user || {}
  const stats = userData.stats || {}

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-end"
        onClick={onClose}
      >
        {/* Floating Close Button (visible on overlay) */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="lg"
          className="fixed top-4 right-4 z-[60] bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 shadow-2xl hover:shadow-red-200 rounded-full w-12 h-12 p-0 flex items-center justify-center"
          aria-label="Close panel"
        >
          <X className="w-6 h-6" />
        </Button>

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          className="bg-white h-full w-full max-w-3xl shadow-2xl overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Navigation */}
          <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 z-10 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">User Details</h2>
              <div className="flex items-center gap-2">
                {/* Navigation Buttons */}
                {allUserIds.length > 1 && (
                  <div className="flex items-center gap-1 mr-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePrevUser}
                      disabled={!canNavigatePrev}
                      className="text-white hover:bg-white/10"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <span className="text-sm text-slate-300 mx-2">
                      {currentIndex + 1} / {allUserIds.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNextUser}
                      disabled={!canNavigateNext}
                      className="text-white hover:bg-white/10"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* User Header Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-2xl font-bold">
                {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge className={
                    user.subscriptionTier === 'PRO' ? 'bg-purple-500' :
                    user.subscriptionTier === 'PREMIUM' ? 'bg-blue-500' :
                    'bg-slate-500'
                  }>
                    {user.subscriptionTier || 'FREE'}
                  </Badge>
                  {user.skillLevel && (
                    <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                      {user.skillLevel}
                    </Badge>
                  )}
                  {user.role === 'ADMIN' && (
                    <Badge className="bg-red-500">
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="points" className="flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  Points
                </TabsTrigger>
                <TabsTrigger value="subscriptions">Subscription</TabsTrigger>
                <TabsTrigger value="videos" className="flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  Videos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Video className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{stats.videoAnalysisCount || 0}</p>
                      <p className="text-xs text-slate-600">Videos</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                      <p className="text-2xl font-bold">{stats.achievementsCount || 0}</p>
                      <p className="text-xs text-slate-600">Achievements</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold">{stats.goalsCount || 0}</p>
                      <p className="text-xs text-slate-600">Goals</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                      <p className="text-2xl font-bold">{stats.matchesCount || 0}</p>
                      <p className="text-xs text-slate-600">Matches</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Account Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Account Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="text-sm">
                        Joined {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'N/A'}
                      </span>
                    </div>
                    {user.lastLogin && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-sm">
                          Last login {format(new Date(user.lastLogin), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(`/admin/users/${userId}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Full Profile
                  </Button>
                </div>

                {/* Danger Zone - Delete User */}
                {user.role !== 'ADMIN' && (
                  <Card className="border-red-200 bg-red-50 mt-6">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-red-700 text-base flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Danger Zone
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-sm text-red-600 mb-4">
                        Permanently delete this user account and all associated data. This action cannot be undone.
                      </p>
                      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            className="w-full bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                              <AlertTriangle className="w-5 h-5" />
                              Delete User Account
                            </AlertDialogTitle>
                            <AlertDialogDescription className="space-y-3">
                              <p>
                                You are about to permanently delete the account for:
                              </p>
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="font-mono text-sm font-semibold text-red-700">{user.email}</p>
                              </div>
                              <p className="text-red-600 font-semibold">
                                This will permanently delete ALL user data including:
                              </p>
                              <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                                <li>Profile and account information</li>
                                <li>Subscription and payment history</li>
                                <li>Videos, matches, and achievements</li>
                                <li>AI conversations and training data</li>
                                <li>All associated content and progress</li>
                              </ul>
                              <p className="text-red-700 font-bold">This action CANNOT be undone!</p>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="delete-reason" className="text-sm font-medium">
                                Reason for deletion (optional)
                              </Label>
                              <Textarea
                                id="delete-reason"
                                placeholder="Enter reason for deleting this account..."
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                                className="resize-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirm-email" className="text-sm font-medium text-red-600">
                                Type the user's email to confirm: <span className="font-mono">{user.email}</span>
                              </Label>
                              <Input
                                id="confirm-email"
                                placeholder="Enter email to confirm"
                                value={deleteConfirmEmail}
                                onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                                className="font-mono"
                              />
                            </div>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => {
                              setDeleteConfirmEmail("")
                              setDeleteReason("")
                            }}>
                              Cancel
                            </AlertDialogCancel>
                            <Button
                              variant="destructive"
                              onClick={handleDeleteUser}
                              disabled={deleting || deleteConfirmEmail !== user.email}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deleting ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Permanently
                                </>
                              )}
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userData.recentActivity && userData.recentActivity.length > 0 ? (
                      <div className="space-y-3">
                        {userData.recentActivity.map((activity: any, index: number) => (
                          <div key={index} className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {format(new Date(activity.createdAt), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-slate-500 py-8">No recent activity</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements">
                <Card>
                  <CardHeader>
                    <CardTitle>Unlocked Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userData.achievements && userData.achievements.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {userData.achievements.map((achievement: any) => (
                          <div key={achievement.id} className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{achievement.achievement?.icon || '🏆'}</div>
                              <div>
                                <p className="font-semibold text-sm">{achievement.achievement?.name}</p>
                                <p className="text-xs text-slate-500">
                                  {achievement.unlockedAt ? format(new Date(achievement.unlockedAt), 'MMM d, yyyy') : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-slate-500 py-8">No achievements yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subscriptions">
                <UserSubscription data={userData} onRefresh={fetchUserData} />
              </TabsContent>

              <TabsContent value="points" className="space-y-6">
                {/* Points Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      Reward Points Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Current Points */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Current Balance</p>
                        <p className="text-3xl font-bold text-yellow-600">
                          {userData?.rewardPoints?.toLocaleString?.() ?? 0}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">points</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white"
                          onClick={async () => {
                            const points = prompt('Enter points to add (+) or remove (-):');
                            if (points && /^[+-]?\d+$/.test(points)) {
                              try {
                                const amount = parseInt(points);
                                const response = await fetch(`/api/admin/users/${userId}/adjust-points`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ points: amount, reason: 'Admin adjustment' })
                                });
                                if (response.ok) {
                                  toast.success(`Points adjusted: ${amount > 0 ? '+' : ''}${amount}`);
                                  fetchUserData();
                                } else {
                                  const error = await response.json();
                                  toast.error(error?.error ?? 'Failed to adjust points');
                                }
                              } catch (error) {
                                toast.error('Failed to adjust points');
                              }
                            }
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Adjust
                        </Button>
                      </div>
                    </div>

                    {/* Tier Status */}
                    <div>
                      <h3 className="font-semibold mb-3 text-sm text-slate-700">Tier Status</h3>
                      <div className="grid gap-3">
                        {[
                          { name: 'Bronze', min: 0, icon: '🥉', color: 'bg-orange-100 text-orange-700 border-orange-200' },
                          { name: 'Silver', min: 500, icon: '🥈', color: 'bg-slate-100 text-slate-700 border-slate-200' },
                          { name: 'Gold', min: 1000, icon: '🥇', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
                        ].map((tier) => {
                          const unlocked = (userData?.rewardPoints ?? 0) >= tier.min;
                          return (
                            <div 
                              key={tier.name}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                unlocked ? tier.color : 'bg-slate-50 text-slate-400 border-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{tier.icon}</span>
                                <div>
                                  <p className="font-semibold text-sm">{tier.name} Tier</p>
                                  <p className="text-xs opacity-75">{tier.min.toLocaleString()} points required</p>
                                </div>
                              </div>
                              {unlocked ? (
                                <Check className="w-5 h-5 text-green-600" />
                              ) : (
                                <Lock className="w-5 h-5" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Award className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                        <p className="text-lg font-bold text-blue-700">
                          {userData?.userAchievements?.length ?? 0}
                        </p>
                        <p className="text-xs text-blue-600">Achievements</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <Trophy className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                        <p className="text-lg font-bold text-purple-700">
                          {userData?.tierUnlocks?.length ?? 0}
                        </p>
                        <p className="text-xs text-purple-600">Tiers Unlocked</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
                        <p className="text-lg font-bold text-green-700">
                          {userData?.rewardPoints ?? 0}
                        </p>
                        <p className="text-xs text-green-600">Total Points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tier Unlock History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tier Unlock History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userData?.tierUnlocks && userData.tierUnlocks.length > 0 ? (
                      <div className="space-y-3">
                        {userData.tierUnlocks.map((unlock: any) => (
                          <div 
                            key={unlock?.id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-yellow-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm">
                                  {unlock?.tier?.displayName ?? 'Unknown Tier'}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Unlocked at {unlock?.pointsAtUnlock?.toLocaleString?.()} points
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-500">
                                {unlock?.unlockedAt ? new Date(unlock.unlockedAt).toLocaleDateString() : 'N/A'}
                              </p>
                              {unlock?.celebrationShown && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  🎉 Celebrated
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Lock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No tiers unlocked yet</p>
                        <p className="text-xs mt-1">User needs to earn more points</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Points Earning Guide */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">How to Earn Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {[
                        { icon: '✅', action: 'Complete drills', points: '10-50' },
                        { icon: '🎯', action: 'Unlock achievements', points: '25-100' },
                        { icon: '📹', action: 'Watch video lessons', points: '5-20' },
                        { icon: '📊', action: 'Track match performance', points: '15-30' },
                        { icon: '🔥', action: 'Maintain daily streak', points: '10-25' },
                        { icon: '🎓', action: 'Complete programs', points: '50-200' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-sm text-slate-700">{item.action}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {item.points} pts
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="videos">
                <AdminVideoHub
                  userId={userId}
                />
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
