
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Trophy,
  TrendingUp,
  Target,
  Calendar,
  Brain,
  Users,
  Play,
  BookOpen,
  Settings,
  Zap,
  Crown,
  Timer,
  Award,
  MessageSquare,
  BarChart3
} from "lucide-react"
import DashboardHeader from "./dashboard-header"
import PerformanceCards from "./performance-cards"
import EnhancedVictoryCoach from "./enhanced-victory-coach"
import ChampionAnalytics from "./champion-analytics"
import MentalMastery from "./mental-mastery"
import CommunityHub from "./community-hub"
import LiveCommandCenter from "./live-command-center"
import EliteCoaching from "./elite-coaching"
import ContentLibrary from "./content-library"
import TrainingHub from "./training-hub"
import AvatarCoach from "../avatar/avatar-coach"

interface DashboardProps {
  user: any
  isTrialExpired?: boolean
}

const navigationTabs = [
  { value: "overview", label: "Champion Dashboard", icon: Trophy, gradient: "from-teal-500 to-orange-500" },
  { value: "ai-coach", label: "Coach Kai", icon: MessageSquare, gradient: "from-blue-500 to-cyan-500" },
  { value: "analytics", label: "Champion Analytics", icon: BarChart3, gradient: "from-purple-500 to-pink-500" },
  { value: "training", label: "Training Hub", icon: Target, gradient: "from-green-500 to-emerald-500" },
  { value: "mental", label: "Mental Mastery", icon: Brain, gradient: "from-indigo-500 to-purple-500" },
  { value: "community", label: "Community Hub", icon: Users, gradient: "from-orange-500 to-red-500" },
  { value: "live", label: "Live Command Center", icon: Play, gradient: "from-rose-500 to-pink-500" },
  { value: "coaching", label: "Elite Coaching", icon: Calendar, gradient: "from-teal-500 to-blue-500" },
  { value: "content", label: "Content Library", icon: BookOpen, gradient: "from-violet-500 to-purple-500" },
]

// Helper function to generate personalized welcome messages
function getWelcomeMessage(user: any): string {
  const name = user?.firstName || 'Champion'
  const streak = user?.currentStreak || 0
  const winRate = user?.totalMatches ? ((user?.totalWins || 0) / user.totalMatches * 100).toFixed(0) : 0
  
  const messages = [
    `Welcome back, ${name}! Ready to dominate the court today? Your ${streak} day streak shows incredible dedication! 🏆`,
    `Hey ${name}! You're making amazing progress. With a ${winRate}% win rate, you're on fire! Let's keep that momentum going! 🔥`,
    `Great to see you, ${name}! Remember, champions aren't born - they're made one practice at a time. Let's crush today's goals! 💪`,
    `${name}, your consistency is inspiring! ${streak} days in a row - that's the mark of a true champion. Ready for today's challenge? ⚡`,
    `Looking strong, ${name}! Your game is evolving beautifully. Let's focus on strategy today and take it to the next level! 🎯`,
  ]
  
  // Select message based on day of week for variety
  const dayIndex = new Date().getDay()
  return messages[dayIndex % messages.length]
}

export default function Dashboard({ user, isTrialExpired }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRemaining, setTimeRemaining] = useState("")
  const [partnerRequests, setPartnerRequests] = useState<any[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(true)

  // Load partner requests
  useEffect(() => {
    const loadRequests = async () => {
      try {
        const response = await fetch('/api/partners/requests')
        if (response.ok) {
          const data = await response.json()
          setPartnerRequests(data.received || [])
        }
      } catch (error) {
        console.error('Failed to load partner requests:', error)
      } finally {
        setIsLoadingRequests(false)
      }
    }
    
    loadRequests()
  }, [])

  // Calculate trial time remaining
  useEffect(() => {
    if (user?.trialEndDate && user?.isTrialActive) {
      const updateTimeRemaining = () => {
        const now = new Date()
        const end = new Date(user.trialEndDate)
        const diff = end.getTime() - now.getTime()
        
        if (diff <= 0) {
          setTimeRemaining("Trial expired")
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24))
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          setTimeRemaining(`${days}d ${hours}h remaining`)
        }
      }

      updateTimeRemaining()
      const interval = setInterval(updateTimeRemaining, 1000 * 60 * 60) // Update every hour
      return () => clearInterval(interval)
    }
  }, [user?.trialEndDate, user?.isTrialActive])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <DashboardHeader user={user} />
      
      {/* Trial Banner */}
      {user?.isTrialActive && !isTrialExpired && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-teal-500 to-orange-500 text-white px-6 py-3"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5" />
              <span className="font-medium">Free Trial Active</span>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {timeRemaining}
              </Badge>
            </div>
            <Button variant="secondary" size="sm" className="bg-white text-teal-600 hover:bg-white/90">
              Upgrade Now
            </Button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation */}
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-9 bg-white border shadow-sm h-auto p-2">
              {navigationTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex flex-col items-center gap-2 p-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-teal-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-lg transition-all"
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="text-xs font-medium hidden sm:block">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Contents */}
          <TabsContent value="overview" className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
                    Welcome back, {user?.firstName || 'Champion'}! 🏆
                  </h1>
                  <p className="text-slate-600 mt-2">
                    Ready to elevate your pickleball mastery today?
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${user?.subscriptionTier === 'PRO' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : user?.subscriptionTier === 'PREMIUM' ? 'bg-gradient-to-r from-teal-500 to-orange-500' : 'bg-slate-500'}`}>
                    {user?.subscriptionTier || 'FREE'} Champion
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <span>{user?.currentStreak || 0} day streak</span>
                  </div>
                </div>
              </div>
              
              {/* Avatar Coach Welcome Message (Pro Feature) */}
              {user?.avatarEnabled && user?.subscriptionTier === 'PRO' && (
                <AvatarCoach
                  message={getWelcomeMessage(user)}
                  avatarType={user.avatarType || "coach-female-1"}
                  avatarPhotoUrl={user.avatarPhotoUrl}
                  avatarName={user.avatarName || "Coach"}
                  voiceEnabled={user.avatarVoiceEnabled ?? true}
                  size="md"
                />
              )}
              
              <PerformanceCards user={user} />

              {/* Partner Requests Widget */}
              {!isLoadingRequests && partnerRequests.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                            <Users className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                              {partnerRequests.length} New Partner Request{partnerRequests.length > 1 ? 's' : ''}! 🏓
                            </h3>
                            <p className="text-white/90 mb-3">
                              {partnerRequests[0]?.senderName} wants to practice with you
                              {partnerRequests.length > 1 && ` and ${partnerRequests.length - 1} other${partnerRequests.length > 2 ? 's' : ''}`}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {partnerRequests.slice(0, 3).map((req, idx) => (
                                <Badge key={idx} variant="outline" className="bg-white/10 border-white/30 text-white backdrop-blur-sm">
                                  {req.senderName}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => window.location.href = '/connect/my-requests'}
                          size="lg"
                          className="bg-white text-purple-600 hover:bg-white/90 font-semibold shadow-lg"
                        >
                          View All Requests →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { 
                    title: "Coach Kai", 
                    description: "Get instant AI coaching advice",
                    icon: MessageSquare, 
                    gradient: "from-blue-500 to-cyan-500",
                    action: () => setActiveTab("ai-coach")
                  },
                  { 
                    title: "Log Match", 
                    description: "Track your latest game results",
                    icon: Trophy, 
                    gradient: "from-green-500 to-emerald-500",
                    action: () => setActiveTab("analytics")
                  },
                  { 
                    title: "Mental Training", 
                    description: "Build focus and confidence",
                    icon: Brain, 
                    gradient: "from-indigo-500 to-purple-500",
                    action: () => setActiveTab("mental")
                  },
                  { 
                    title: "Find Partners", 
                    description: "Connect with local players",
                    icon: Users, 
                    gradient: "from-orange-500 to-red-500",
                    action: () => window.location.href = '/connect/partners'
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -2 }}
                  >
                    <Card 
                      className="p-4 cursor-pointer hover:shadow-lg transition-all border-0 bg-white"
                      onClick={item.action}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{item.title}</h3>
                          <p className="text-sm text-slate-600">{item.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-coach">
            <EnhancedVictoryCoach user={user} />
          </TabsContent>

          <TabsContent value="analytics">
            <ChampionAnalytics user={user} />
          </TabsContent>

          <TabsContent value="training">
            <TrainingHub user={user} />
          </TabsContent>

          <TabsContent value="mental">
            <MentalMastery user={user} />
          </TabsContent>

          <TabsContent value="community">
            <CommunityHub user={user} />
          </TabsContent>

          <TabsContent value="live">
            <LiveCommandCenter user={user} />
          </TabsContent>

          <TabsContent value="coaching">
            <EliteCoaching user={user} />
          </TabsContent>

          <TabsContent value="content">
            <ContentLibrary user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
