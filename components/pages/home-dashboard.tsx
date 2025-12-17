
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar,
  Sparkles,
  Zap,
  Clock,
  Play,
  Video,
  Users,
  ChevronRight,
  Flame
} from "lucide-react"
import MainNavigation from "@/components/navigation/main-navigation"
import AvatarCoach from "@/components/avatar/avatar-coach"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface HomeDashboardProps {
  user: any
  isTrialExpired?: boolean
}

export default function HomeDashboard({ user, isTrialExpired }: HomeDashboardProps) {
  const router = useRouter()
  const [currentGoal, setCurrentGoal] = useState("")
  const [goalProgress, setGoalProgress] = useState(65)
  const [mounted, setMounted] = useState(false)

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Champion'

  // Generate today's personalized goal
  useEffect(() => {
    setMounted(true)
    const goals = {
      BEGINNER: "Master 10 third-shot drops in a row",
      INTERMEDIATE: "Complete a 20-minute dinking drill",
      ADVANCED: "Perfect your serve placement strategy",
      EXPERT: "Dominate net positioning against strong opponents"
    }
    setCurrentGoal(goals[user?.skillLevel as keyof typeof goals] || goals.BEGINNER)
  }, [user?.skillLevel])

  // Calculate stats safely after mount to avoid hydration issues
  const winRate = mounted && user?.totalMatches ? ((user.totalWins || 0) / user.totalMatches * 100) : 0
  const recentMatches = user?.matches?.slice(0, 3) || []
  const currentStreak = user?.currentStreak || 0

  // Get time-based greeting (only on client side to avoid hydration mismatch)
  const [greeting, setGreeting] = useState("Hello")
  
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-champion-green/5 dark:from-champion-charcoal dark:via-gray-900 dark:to-champion-green/5">
      {/* Navigation */}
      <MainNavigation user={user} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {greeting}, {firstName}!
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Ready to be a champion today?
              </p>
            </div>

            {/* Streak Badge */}
            {currentStreak > 0 && (
              <InfoTooltip content={`You've trained ${currentStreak} days in a row! Keep the momentum going!`}>
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-lg gap-2 hover:shadow-lg hover:scale-105 transition-all">
                  <Flame className="w-5 h-5" />
                  {currentStreak} Day Streak
                </Badge>
              </InfoTooltip>
            )}
          </div>
        </motion.div>

        {/* Hero Section - Today's Focus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="relative overflow-hidden border-2 border-champion-green/20 shadow-xl">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-champion-green/10 via-champion-gold/5 to-champion-blue/10"></div>
            
            <CardContent className="relative p-8">
              <div className="flex items-start gap-6">
                {/* Avatar Coach Preview */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-champion-green to-champion-gold flex items-center justify-center text-5xl shadow-lg animate-breathing">
                    😊
                  </div>
                </div>

                {/* Coach Message */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-champion-green" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Today's Focus
                    </h2>
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                    Based on your recent performance, let's work on: <span className="font-bold text-champion-green">{currentGoal}</span>
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Your Progress</span>
                      <span className="text-sm font-bold text-champion-green">{goalProgress}%</span>
                    </div>
                    <Progress value={goalProgress} className="h-3" />
                  </div>

                  {/* Action Button */}
                  <InfoTooltip content="Begin a personalized training session focused on today's goal">
                    <Button 
                      size="lg"
                      onClick={() => router.push('/train')}
                      className="bg-gradient-to-r from-champion-green to-champion-gold hover:shadow-lg hover:shadow-champion-green/50 text-white font-semibold transition-all hover:scale-105"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Training Session
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </InfoTooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* Win Rate */}
          <InfoTooltip content="Your overall match win percentage - up 8% this month!">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-champion-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Win Rate</CardTitle>
                  <Trophy className="w-5 h-5 text-champion-gold" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {winRate.toFixed(1)}%
                </div>
                <p className="text-sm text-emotion-success flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {winRate > 50 ? "Improving!" : "Building momentum"}
                </p>
              </CardContent>
            </Card>
          </InfoTooltip>

          {/* Practice Time */}
          <InfoTooltip content="Total training time this week - you're on fire!">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-champion-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Practice This Week</CardTitle>
                  <Clock className="w-5 h-5 text-champion-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {user?.weeklyPracticeHours || 0}h
                </div>
                <p className="text-sm text-gray-500">
                  Goal: 12 hours
                </p>
              </CardContent>
            </Card>
          </InfoTooltip>

          {/* Next Goal */}
          <InfoTooltip content="Days until you reach your 'Advanced Serve' milestone">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-champion-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Next Goal</CardTitle>
                  <Target className="w-5 h-5 text-champion-green" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  3 days
                </div>
                <p className="text-sm text-emotion-warning">
                  Advanced Serve Mastery
                </p>
              </CardContent>
            </Card>
          </InfoTooltip>
        </motion.div>

        {/* Quick Actions & Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-champion-gold" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoTooltip content="Upload your match footage for AI-powered technique analysis" side="right">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-4 hover:bg-champion-green/5 hover:border-champion-green transition-all group"
                  onClick={() => router.push('/train/video')}
                >
                  <Video className="w-5 h-5 text-champion-green group-hover:scale-110 transition-transform" />
                  <div className="text-left flex-1">
                    <p className="font-semibold">Upload Video</p>
                    <p className="text-sm text-gray-500">Get AI technique analysis</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-champion-green transition-colors" />
                </Button>
              </InfoTooltip>

              <InfoTooltip content="Match with players at your skill level for practice sessions" side="right">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-4 hover:bg-champion-blue/5 hover:border-champion-blue transition-all group"
                  onClick={() => router.push('/connect/partners')}
                >
                  <Users className="w-5 h-5 text-champion-blue group-hover:scale-110 transition-transform" />
                  <div className="text-left flex-1">
                    <p className="font-semibold">Find Practice Partner</p>
                    <p className="text-sm text-gray-500">AI-matched players near you</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-champion-blue transition-colors" />
                </Button>
              </InfoTooltip>

              <InfoTooltip content="Track your improvement with detailed stats and insights" side="right">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-4 hover:bg-champion-gold/5 hover:border-champion-gold transition-all group"
                  onClick={() => router.push('/progress')}
                >
                  <TrendingUp className="w-5 h-5 text-champion-gold group-hover:scale-110 transition-transform" />
                  <div className="text-left flex-1">
                    <p className="font-semibold">View Progress</p>
                    <p className="text-sm text-gray-500">See your improvement trends</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-champion-gold transition-colors" />
                </Button>
              </InfoTooltip>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-champion-green" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentMatches.length > 0 ? (
                <div className="space-y-4">
                  {recentMatches.map((match: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          match.result === 'WIN' 
                            ? "bg-emotion-success/20 text-emotion-success"
                            : "bg-emotion-error/20 text-emotion-error"
                        )}>
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {match.result === 'WIN' ? 'Victory' : 'Match'} vs {match.opponentName || 'Opponent'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(match.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={match.result === 'WIN' ? 'default' : 'secondary'}>
                        {match.result}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No matches recorded yet</p>
                  <Button variant="outline" size="sm" onClick={() => router.push('/connect/matches')}>
                    Log Your First Match
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Trial Expiry Warning */}
        {isTrialExpired && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="border-2 border-emotion-warning bg-emotion-warning/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Sparkles className="w-8 h-8 text-emotion-warning flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Your trial has ended</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Upgrade to Premium or Pro to continue your coaching journey and unlock advanced features!
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push('/pricing')}
                    className="bg-gradient-to-r from-champion-green to-champion-gold hover:shadow-lg text-white"
                  >
                    View Plans
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      {/* Persistent Avatar Coach */}
      <AvatarCoach userName={firstName} context="home" />
    </div>
  )
}
