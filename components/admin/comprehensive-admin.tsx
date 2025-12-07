
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, Video, Target, Trophy, UserPlus, MessageSquare,
  DollarSign, BookOpen, Brain, Calendar, Flag, Filter,
  Search, Download, RefreshCw, Shield, Eye, CheckCircle,
  XCircle, Clock, TrendingUp, Activity, ArrowLeft, Home, Mail, ExternalLink, Building2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import EnhancedUsersSection from "./sections/enhanced-users-section"
import TrainingSection from "./sections/training-section"
import GoalsSection from "./sections/goals-section"
import MatchesSection from "./sections/matches-section"
import PartnersSection from "./sections/partners-section"
import VideosSection from "./sections/videos-section"
import CoachSection from "./sections/coach-section"
import ModerationSection from "./sections/moderation-section"
import SecuritySection from "./sections/security-section"
import AnalyticsSection from "./sections/analytics-section"
import KaiConversationsSection from "./sections/kai-conversations-section"
import UserActivityFeed from "./sections/user-activity-feed"
import RevenueDashboard from "./sections/revenue-dashboard"

interface ComprehensiveAdminProps {
  initialData: any
}

export default function ComprehensiveAdmin({ initialData }: ComprehensiveAdminProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [refreshing, setRefreshing] = useState(false)
  const [showRefreshSuccess, setShowRefreshSuccess] = useState(false)
  const router = useRouter()

  const handleRefresh = async () => {
    setRefreshing(true)
    // Trigger refresh with animation
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  const sections = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "revenue", label: "💰 Revenue", icon: DollarSign },
    { id: "users", label: "Users", icon: Users },
    { id: "sponsors", label: "Sponsors", icon: Building2 },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "video-analytics", label: "Video Analytics", icon: Video },
    { id: "email-notifications", label: "Email Notifications", icon: Mail },
    { id: "kai-conversations", label: "Kai Conversations", icon: MessageSquare },
    { id: "training", label: "Training", icon: Video },
    { id: "goals", label: "Goals & Progress", icon: Target },
    { id: "matches", label: "Matches", icon: Trophy },
    { id: "partners", label: "Partners", icon: UserPlus },
    { id: "videos", label: "Video Clips", icon: Video },
    { id: "coach", label: "AI Coach", icon: MessageSquare },
    { id: "moderation", label: "Moderation", icon: Shield },
    { id: "security", label: "Security", icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Enhanced Header with gradient background */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-lg sticky top-0 z-50"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-purple-500/5 to-blue-500/5 pointer-events-none" />
        <div className="max-w-[1600px] mx-auto px-6 py-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Enhanced Back to Dashboard Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToDashboard}
                  className="gap-2 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Back to Dashboard</span>
                </Button>
              </motion.div>
              
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent hidden sm:block" />
              
              <motion.div 
                className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Shield className="w-6 h-6 text-white drop-shadow-lg" />
              </motion.div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                  Comprehensive Admin Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">Complete platform management & analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Enhanced Refresh Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="gap-2 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 border-2 hover:border-blue-300 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-500' : ''}`} />
                  <span className="hidden sm:inline font-medium">Refresh</span>
                </Button>
              </motion.div>
              
              {/* Enhanced Admin Access Badge */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer"
              >
                <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white gap-1.5 px-3 py-1.5 shadow-lg hover:shadow-xl transition-all duration-200">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-semibold">Admin Access</span>
                </Badge>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-[1600px] mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Enhanced Navigation Tabs - Responsive Grid */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-3 overflow-hidden"
          >
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2 bg-transparent h-auto">
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="h-full"
                >
                  <TabsTrigger
                    value={section.id}
                    className="w-full h-full flex flex-col sm:flex-row items-center justify-center gap-1.5 px-2 py-3 relative overflow-hidden transition-all duration-300 data-[state=active]:bg-gradient-to-br data-[state=active]:from-red-500 data-[state=active]:via-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-slate-100 hover:scale-102 rounded-lg whitespace-normal text-center"
                  >
                    <section.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium leading-tight break-words">{section.label}</span>
                  </TabsTrigger>
                </motion.div>
              ))}
            </TabsList>
          </motion.div>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <OverviewDashboard data={initialData} setActiveTab={setActiveTab} />
          </TabsContent>

          {/* Revenue Dashboard Tab */}
          <TabsContent value="revenue">
            <RevenueDashboard />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <EnhancedUsersSection />
          </TabsContent>

          {/* Sponsors Tab */}
          <TabsContent value="sponsors">
            <Card>
              <CardHeader className="bg-gradient-to-r from-teal-50 to-purple-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-600" />
                  Sponsor Management
                </CardTitle>
                <CardDescription>
                  Review sponsor applications and manage sponsor offers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Building2 className="w-16 h-16 text-teal-600" />
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">Sponsor Management Dashboard</h3>
                    <p className="text-gray-600 mb-6">
                      Review applications, approve offers, and manage partner relationships
                    </p>
                    <Link href="/admin/sponsors">
                      <Button className="bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Sponsor Management Dashboard
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsSection />
          </TabsContent>

          {/* Video Management Tab */}
          <TabsContent value="video-analytics">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Video Management Center
                  </CardTitle>
                  <CardDescription>
                    Upload videos to user accounts, manage content, and monitor security events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/admin/videos">
                    <Button className="w-full sm:w-auto">
                      Open Video Management Center
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Email Notifications Tab */}
          <TabsContent value="email-notifications">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Management
                  </CardTitle>
                  <CardDescription>
                    Send, manage, and track all system emails
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Send custom emails, manage email templates, track delivery status, and resend emails. 
                      View complete email history and test the email system.
                    </p>
                    <Link href="/admin/emails">
                      <Button className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
                        <Mail className="h-4 w-4 mr-2" />
                        Open Email Management Dashboard
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Kai Conversations Tab */}
          <TabsContent value="kai-conversations">
            <KaiConversationsSection />
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training">
            <TrainingSection />
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals">
            <GoalsSection />
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches">
            <MatchesSection />
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners">
            <PartnersSection />
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <VideosSection />
          </TabsContent>

          {/* Coach Tab */}
          <TabsContent value="coach">
            <CoachSection />
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation">
            <ModerationSection />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <SecuritySection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function OverviewDashboard({ data, setActiveTab }: { data: any; setActiveTab: (tab: string) => void }) {
  const router = useRouter()
  
  const navigateToUsersTab = () => {
    setActiveTab("users");
  }
  
  const navigateToAnalyticsTab = () => {
    setActiveTab("analytics");
  }

  const quickStats = [
    {
      title: "Total Users",
      value: data.stats.totalUsers.toLocaleString(),
      change: data.stats.userTrend,
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      clickable: true,
      onClick: navigateToUsersTab,
      hint: "Click to view all users",
      description: "Active accounts"
    },
    {
      title: "Active Subscriptions",
      value: data.stats.activeSubscriptions.toLocaleString(),
      change: data.stats.subscriptionTrend,
      icon: DollarSign,
      gradient: "from-green-500 to-emerald-500",
      clickable: true,
      onClick: navigateToAnalyticsTab,
      hint: "Click for analytics",
      description: "Paying users"
    },
    {
      title: "Total Revenue",
      value: `$${Math.round(data.stats.totalRevenue).toLocaleString()}`,
      change: data.stats.revenueTrend,
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-500",
      clickable: true,
      onClick: navigateToAnalyticsTab,
      hint: "Click for analytics",
      description: "All-time revenue"
    },
    {
      title: "Total Matches",
      value: data.stats.totalMatches.toLocaleString(),
      change: data.stats.matchesTrend,
      icon: Trophy,
      gradient: "from-orange-500 to-red-500",
      clickable: true,
      onClick: () => {
        const tabs = document.querySelector('[role="tablist"]');
        const matchesTab = tabs?.querySelector('[value="matches"]') as HTMLElement;
        matchesTab?.click();
      },
      hint: "Click to view matches",
      description: "Games tracked"
    },
  ]

  return (
    <div className="space-y-6">
      {/* Enhanced Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-0 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30 pointer-events-none" />
          <CardContent className="p-6 relative">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring" }}
                >
                  <Users className="w-7 h-7 text-white drop-shadow-lg" />
                </motion.div>
                <div>
                  <h4 className="font-bold text-xl text-white drop-shadow-lg">Looking for a specific user account?</h4>
                  <p className="text-sm text-blue-50 drop-shadow">
                    Click the "View All Users" button to search through all <span className="font-bold">{data.stats.totalUsers} accounts</span>
                  </p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={navigateToUsersTab}
                  className="bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 gap-2 shadow-xl hover:shadow-2xl transition-all duration-200 font-semibold px-6"
                >
                  <Users className="w-4 h-4" />
                  View All Users
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group ${
                stat.clickable ? 'cursor-pointer' : ''
              }`}
              onClick={stat.onClick}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none`} />
              
              {/* Top accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${stat.gradient} pointer-events-none`} />
              
              {/* Animated gradient on hover */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 pointer-events-none`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.05 }}
              />
              
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">{stat.title}</p>
                    <p className="text-4xl font-bold text-slate-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-slate-600 mb-3">{stat.description}</p>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        {stat.change.startsWith('+') || stat.change === '0%' ? (
                          <>
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1.5" />
                            <span className="text-sm font-bold text-green-600">{stat.change}</span>
                          </>
                        ) : (
                          <>
                            <TrendingUp className="w-4 h-4 text-red-500 mr-1.5 rotate-180" />
                            <span className="text-sm font-bold text-red-600">{stat.change}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {stat.hint && (
                      <motion.p 
                        className="text-xs font-semibold mt-3 flex items-center gap-1"
                        initial={{ opacity: 0.7 }}
                        whileHover={{ opacity: 1 }}
                      >
                        <span className={`bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                          {stat.hint}
                        </span>
                        <ExternalLink className="w-3 h-3 text-blue-500 group-hover:translate-x-1 transition-transform" />
                      </motion.p>
                    )}
                  </div>
                  
                  {/* Icon with enhanced styling */}
                  <motion.div 
                    className={`w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <stat.icon className="w-8 h-8 text-white drop-shadow-lg" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Enhanced Tier Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-0 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 opacity-5 pointer-events-none" />
          <CardHeader className="relative">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Subscription Tier Distribution
            </CardTitle>
            <CardDescription className="text-base">
              Current breakdown of user subscription levels
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="p-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl font-black text-slate-700 group-hover:text-slate-900 transition-colors">
                    {data.stats.freeUsers}
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-sm font-bold text-slate-600 uppercase tracking-wide">Free Users</div>
                <div className="mt-2 h-1 w-full bg-slate-300 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-slate-500 to-slate-600 w-full" />
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="p-6 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl font-black text-blue-700 group-hover:text-blue-900 transition-colors">
                    {data.stats.trialUsers}
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-sm font-bold text-blue-600 uppercase tracking-wide">Trial Users</div>
                <div className="mt-2 h-1 w-full bg-blue-300 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 w-full" />
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="p-6 bg-gradient-to-br from-orange-100 to-amber-200 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl font-black text-orange-700 group-hover:text-orange-900 transition-colors">
                    {data.stats.premiumUsers}
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-sm font-bold text-orange-600 uppercase tracking-wide">Premium Users</div>
                <div className="mt-2 h-1 w-full bg-orange-300 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-amber-600 w-full" />
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="p-6 bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl font-black text-purple-700 group-hover:text-purple-900 transition-colors">
                    {data.stats.proUsers}
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-sm font-bold text-purple-600 uppercase tracking-wide">Pro Users</div>
                <div className="mt-2 h-1 w-full bg-purple-300 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-600 w-full" />
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Platform Activity Feed */}
      <UserActivityFeed />

      {/* Enhanced Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 opacity-5 pointer-events-none" />
            <CardHeader className="relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    Recent User Signups
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm">
                    Last 7 days • Showing {Math.min(5, data.recentUsers?.length || 0)} of {data.recentUsers?.length || 0} recent signups
                  </CardDescription>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={navigateToUsersTab}
                    className="gap-2 bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 shadow-md"
                  >
                    <Users className="w-4 h-4" />
                    View All
                  </Button>
                </motion.div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-3">
                {data.recentUsers && data.recentUsers.length > 0 ? (
                  <>
                    {data.recentUsers.slice(0, 5).map((user: any, index: number) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.05 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all cursor-pointer shadow-md hover:shadow-xl group"
                        onClick={navigateToUsersTab}
                      >
                        <div className="flex items-center gap-4">
                          <motion.div 
                            className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg text-lg"
                            whileHover={{ rotate: 5 }}
                          >
                            {user.firstName?.[0] || user.name?.[0] || 'U'}
                          </motion.div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                              {user.name || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Unknown User')}
                            </div>
                            <div className="text-sm text-slate-600">{user.email}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={`shadow-md ${
                            user.subscriptionTier === 'PRO' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                            user.subscriptionTier === 'PREMIUM' ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                            'bg-gradient-to-r from-slate-500 to-slate-600'
                          } text-white font-semibold`}>
                            {user.subscriptionTier || 'FREE'}
                          </Badge>
                          <span className="text-xs text-slate-500 font-medium">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    {data.stats.totalUsers > 5 && (
                      <div className="pt-3 border-t-2 border-dashed border-slate-200">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="ghost"
                            className="w-full gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 font-semibold shadow-md hover:shadow-lg transition-all"
                            onClick={navigateToUsersTab}
                          >
                            <Eye className="w-4 h-4" />
                            View All {data.stats.totalUsers} User Accounts
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </motion.div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 mb-4">No recent signups in the last 7 days</p>
                    <Button
                      variant="outline"
                      onClick={navigateToUsersTab}
                      className="gap-2"
                    >
                      <Users className="w-4 h-4" />
                      View All {data.stats.totalUsers} User Accounts
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50 opacity-5 pointer-events-none" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                Recent Payments
              </CardTitle>
              <CardDescription className="mt-1">
                Latest payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-3">
                {data.payments && data.payments.length > 0 ? (
                  data.payments.slice(0, 5).map((payment: any, index: number) => (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                      whileHover={{ scale: 1.02, x: -5 }}
                      className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all cursor-pointer shadow-md hover:shadow-xl group"
                    >
                      <div className="flex items-center gap-4">
                        <motion.div 
                          className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg"
                          whileHover={{ rotate: -5 }}
                        >
                          <DollarSign className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-green-700 transition-colors">
                            {payment.user?.name || (payment.user?.firstName && payment.user?.lastName ? `${payment.user.firstName} ${payment.user.lastName}` : 'Unknown User')}
                          </div>
                          <div className="text-sm text-slate-600">
                            {payment.subscriptionTier || 'FREE'} {payment.billingCycle ? `- ${payment.billingCycle}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-green-600 group-hover:text-green-700 transition-colors">
                          +${((payment.amount || 0) / 100).toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <DollarSign className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500">No recent payments</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}