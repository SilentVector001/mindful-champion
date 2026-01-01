
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Heart,
  Star,
  Video,
  MessageSquare,
  Flame,
  TrendingUp,
  Sparkles,
  Plus,
  Activity,
  Award,
  Target,
  Calendar,
  UserPlus
} from "lucide-react"
import MainNavigation from "@/components/navigation/main-navigation"
import AvatarCoach from "@/components/avatar/avatar-coach"
import { CommunityFeed } from "@/components/community/CommunityFeed"
import { useRouter } from "next/navigation"

interface ConnectPageProps {
  user: any
  practicePartners: any[]
}

export default function ConnectPage({ user, practicePartners }: ConnectPageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('feed')
  const [communityStats, setCommunityStats] = useState({
    totalMembers: 0,
    activeNow: 0,
    postsToday: 0,
    trending: 0
  })

  // Fetch real community stats
  useEffect(() => {
    fetchCommunityStats()
  }, [])

  const fetchCommunityStats = async () => {
    try {
      const response = await fetch('/api/dashboard/community')
      if (response.ok) {
        const data = await response.json()
        setCommunityStats({
          totalMembers: data.totalUsers || 0,
          activeNow: data.activeUsers || 0,
          postsToday: data.postsToday || 0,
          trending: data.trendingPosts || 0
        })
      }
    } catch (error) {
      console.error('Failed to load community stats:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <MainNavigation user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instagram/TikTok Style Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Title Section */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 rounded-full border border-cyan-500/30 mb-4"
            >
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent">
                Community Center
              </span>
              <Heart className="w-5 h-5 text-pink-400" />
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Your Pickleball <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Family</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Share your progress, learn from others, and celebrate victories together
            </p>
          </div>

          {/* Instagram-Style Stats Stories */}
          <div className="flex justify-center items-center gap-6 mb-8 overflow-x-auto pb-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-2 cursor-pointer"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <Users className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {communityStats.activeNow}
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium">Active Now</span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-2 cursor-pointer"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-red-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <Flame className="w-8 h-8 text-rose-400" />
                  </div>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium">Trending</span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-2 cursor-pointer"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 via-violet-500 to-indigo-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <Video className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium">Videos</span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-2 cursor-pointer"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <Award className="w-8 h-8 text-amber-400" />
                  </div>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium">Achievements</span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push('/train/video')}
              className="flex flex-col items-center gap-2 cursor-pointer"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 border-2 border-dashed border-slate-500">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-slate-400" />
                  </div>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium">Share</span>
            </motion.div>
          </div>

          {/* Quick Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-4 gap-4 mb-6"
          >
            <Card className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-cyan-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400 mb-1">
                  {communityStats.totalMembers.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400">Members</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {communityStats.activeNow}
                </div>
                <div className="text-xs text-slate-400">Online</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {communityStats.postsToday}
                </div>
                <div className="text-xs text-slate-400">Posts Today</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-rose-400 mb-1 flex items-center justify-center gap-1">
                  <TrendingUp className="w-5 h-5" />
                  {communityStats.trending}
                </div>
                <div className="text-xs text-slate-400">Trending</div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 bg-slate-800/50 border border-slate-700 mb-8">
            <TabsTrigger value="feed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-500">
              <Video className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Community Feed</span>
              <span className="sm:hidden">Feed</span>
            </TabsTrigger>
            <TabsTrigger value="matches" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500">
              <Target className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">My Matches</span>
              <span className="sm:hidden">Matches</span>
            </TabsTrigger>
            <TabsTrigger value="partners" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500">
              <UserPlus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Find Partners</span>
              <span className="sm:hidden">Partners</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Events</span>
              <span className="sm:hidden">Events</span>
            </TabsTrigger>
          </TabsList>

          {/* Community Feed Tab */}
          <TabsContent value="feed" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              {/* Value Proposition Card */}
              <Card className="mb-6 bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-emerald-500/10 border-cyan-500/30">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-cyan-500/20 rounded-xl">
                      <Heart className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">Why This Matters</h3>
                      <p className="text-slate-300 text-sm leading-relaxed mb-4">
                        Training alone is hard. Plateaus feel endless. Losses sting more. But here, you're part of something bigger—a community that understands your journey because they're on it too.
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Sparkles className="w-4 h-4 text-cyan-400" />
                          <span>Get unstuck with real advice</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Star className="w-4 h-4 text-amber-400" />
                          <span>Celebrate wins together</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Flame className="w-4 h-4 text-rose-400" />
                          <span>Find motivation daily</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Activity className="w-4 h-4 text-green-400" />
                          <span>Learn from experiences</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Community Feed Component */}
              <CommunityFeed />
            </motion.div>
          </TabsContent>

          {/* My Matches Tab */}
          <TabsContent value="matches">
            <div className="max-w-3xl mx-auto">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                    <Target className="h-10 w-10 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Match Tracking Coming Soon</h3>
                  <p className="text-slate-400 mb-6 max-w-md mx-auto">
                    We're building an amazing match tracking system. Connect with DUPR, log matches, and track your progress—all in one place.
                  </p>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Star className="h-5 w-5 mr-2" />
                    Get Notified
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Find Partners Tab */}
          <TabsContent value="partners">
            <div className="max-w-3xl mx-auto">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
                    <UserPlus className="h-10 w-10 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Partner Matching Coming Soon</h3>
                  <p className="text-slate-400 mb-6 max-w-md mx-auto">
                    Find practice partners near you, matched by skill level and availability. The perfect way to improve your game!
                  </p>
                  <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                    <Users className="h-5 w-5 mr-2" />
                    Join Waitlist
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <div className="max-w-3xl mx-auto">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center">
                    <Calendar className="h-10 w-10 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Community Events Coming Soon</h3>
                  <p className="text-slate-400 mb-6 max-w-md mx-auto">
                    Join local tournaments, practice sessions, and social events. Connect with players in your area!
                  </p>
                  <Button 
                    onClick={() => router.push('/tournaments')}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Browse Tournaments
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Avatar Coach */}
      <AvatarCoach userName={user?.firstName || user?.name?.split(' ')[0] || 'Champion'} context="connect" />
    </div>
  )
}
