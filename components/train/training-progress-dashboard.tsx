
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Trophy,
  Star,
  Play,
  Calendar as CalendarIcon,
  Clock,
  Target,
  TrendingUp,
  BookOpen,
  Award,
  Plus,
  CheckCircle,
  Zap,
  BarChart3
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface TrainingProgressDashboardProps {
  user: any
  stats: {
    videosWatched: number
    totalVideos: number
    programsCompleted: number
    activePrograms: number
    totalPracticeHours: number
    totalPracticeSessions: number
    achievementsUnlocked: number
  }
  userPrograms: any[]
  videoProgress: any[]
  practiceLogs: any[]
  userGoals: any[]
  userAchievements: any[]
}

export default function TrainingProgressDashboard({
  user,
  stats,
  userPrograms,
  videoProgress,
  practiceLogs,
  userGoals,
  userAchievements
}: TrainingProgressDashboardProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showGoalDialog, setShowGoalDialog] = useState(false)
  const [showPracticeDialog, setShowPracticeDialog] = useState(false)
  const [goalText, setGoalText] = useState("")
  const [goalDate, setGoalDate] = useState<Date | undefined>(undefined)

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Champion'

  const getSkillLevelColor = (skillLevel: string) => {
    switch (skillLevel?.toLowerCase()) {
      case 'beginner': return "bg-champion-green text-white"
      case 'intermediate': return "bg-champion-blue text-white"
      case 'advanced': return "bg-champion-gold text-white"
      case 'pro': return "bg-purple-600 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const handleCreateGoal = async () => {
    if (!goalText.trim()) return

    try {
      await fetch('/api/training/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalText: goalText.trim(),
          targetDate: goalDate?.toISOString()
        })
      })

      setGoalText("")
      setGoalDate(undefined)
      setShowGoalDialog(false)
      // Refresh page or update state
      window.location.reload()
    } catch (error) {
      console.error("Error creating goal:", error)
    }
  }

  const handleLogPractice = async (practiceData: any) => {
    try {
      await fetch('/api/training/practice-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(practiceData)
      })

      setShowPracticeDialog(false)
      // Refresh page or update state
      window.location.reload()
    } catch (error) {
      console.error("Error logging practice:", error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Training Progress
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
          Track your pickleball journey, <span className="text-champion-green font-semibold">{firstName}</span>
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor your improvement across videos, programs, and practice sessions
        </p>
      </motion.div>

      {/* Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-champion-green mb-2">
              {stats.videosWatched}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Videos Watched</p>
            <Progress 
              value={(stats.videosWatched / Math.max(stats.totalVideos, 1)) * 100} 
              className="mt-2 h-1" 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-champion-blue mb-2">
              {stats.programsCompleted}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Programs Completed</p>
            {stats.activePrograms > 0 && (
              <p className="text-xs text-champion-blue mt-1">
                {stats.activePrograms} active
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-champion-gold mb-2">
              {stats.totalPracticeHours}h
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Practice Time</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalPracticeSessions} sessions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.achievementsUnlocked}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Achievements</p>
            <Trophy className="w-4 h-4 mx-auto mt-1 text-purple-600" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-champion-green" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {practiceLogs.slice(0, 5).map((log, index) => (
                    <div key={log.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-champion-green" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Practice Session - {log.durationMinutes} minutes
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {format(new Date(log.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {practiceLogs.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      No practice sessions logged yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-champion-gold" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userAchievements.slice(0, 3).map((userAchievement) => (
                    <div key={userAchievement.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-champion-gold/5 to-amber-50 dark:to-gray-800 rounded-lg border border-champion-gold/20">
                      <div className="text-2xl">{userAchievement.achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-champion-gold">
                          {userAchievement.achievement.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {userAchievement.achievement.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Unlocked {format(new Date(userAchievement.unlockedAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <Badge className="bg-champion-gold/10 text-champion-gold">
                        +{userAchievement.achievement.points}
                      </Badge>
                    </div>
                  ))}
                  {userAchievements.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Complete training activities to unlock achievements
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Dialog open={showPracticeDialog} onOpenChange={setShowPracticeDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-champion-green to-emerald-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Log Practice Session
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Practice Session</DialogTitle>
                </DialogHeader>
                <PracticeLogForm onSubmit={handleLogPractice} />
              </DialogContent>
            </Dialog>

            <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-champion-blue text-champion-blue hover:bg-champion-blue hover:text-white">
                  <Target className="w-4 h-4 mr-2" />
                  Create Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Training Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="goal-text">What do you want to achieve?</Label>
                    <Textarea
                      id="goal-text"
                      placeholder="Example: Improve my third shot drop consistency to 80% success rate"
                      value={goalText}
                      onChange={(e) => setGoalText(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Target Date (optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {goalDate ? format(goalDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={goalDate}
                          onSelect={setGoalDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateGoal}
                      className="flex-1 bg-gradient-to-r from-champion-green to-emerald-600"
                      disabled={!goalText.trim()}
                    >
                      Create Goal
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowGoalDialog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userPrograms.map((userProgram) => (
              <Card key={userProgram.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{userProgram.program.name}</CardTitle>
                      <Badge className={cn("mt-2", getSkillLevelColor(userProgram.program.skillLevel))}>
                        {userProgram.program.skillLevel}
                      </Badge>
                    </div>
                    <Badge 
                      className={cn(
                        userProgram.status === 'COMPLETED' ? "bg-champion-green text-white" :
                        userProgram.status === 'IN_PROGRESS' ? "bg-champion-blue text-white" :
                        "bg-gray-500 text-white"
                      )}
                    >
                      {userProgram.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{userProgram.completionPercentage.toFixed(0)}%</span>
                      </div>
                      <Progress value={userProgram.completionPercentage} />
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Day {userProgram.currentDay} of {userProgram.program.durationDays}</span>
                      {userProgram.startDate && (
                        <span>Started {format(new Date(userProgram.startDate), 'MMM dd')}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videoProgress.filter(vp => vp.watched).map((progress) => (
              <Card key={progress.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-champion-green mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {progress.video.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {progress.video.channel} • {progress.video.primaryTopic}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={cn("text-xs", getSkillLevelColor(progress.video.skillLevel))}>
                          {progress.video.skillLevel}
                        </Badge>
                        {progress.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{progress.rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userGoals.map((goal) => (
              <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Target className="w-5 h-5 text-champion-blue mt-1" />
                    <Badge 
                      className={cn(
                        goal.status === 'COMPLETED' ? "bg-champion-green text-white" :
                        goal.status === 'ACTIVE' ? "bg-champion-blue text-white" :
                        "bg-gray-500 text-white"
                      )}
                    >
                      {goal.status}
                    </Badge>
                  </div>
                  
                  <h4 className="font-semibold mb-3">{goal.goalText}</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{goal.progressPercentage.toFixed(0)}%</span>
                      </div>
                      <Progress value={goal.progressPercentage} />
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Created {format(new Date(goal.createdAt), 'MMM dd, yyyy')}</span>
                      {goal.targetDate && (
                        <span>Target: {format(new Date(goal.targetDate), 'MMM dd, yyyy')}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {userGoals.length === 0 && (
              <Card className="md:col-span-2">
                <CardContent className="p-12 text-center">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Goals Set Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Create your first training goal to track your progress and stay motivated.
                  </p>
                  <Button 
                    onClick={() => setShowGoalDialog(true)}
                    className="bg-gradient-to-r from-champion-green to-emerald-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Goal
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Practice Log Form Component
function PracticeLogForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [date, setDate] = useState<Date>(new Date())
  const [duration, setDuration] = useState("")
  const [focusAreas, setFocusAreas] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [satisfaction, setSatisfaction] = useState(0)

  const skillAreas = [
    "Serving", "Return of Serve", "Dinking", "Third Shot", "Volleys", 
    "Footwork", "Strategy", "Mental Game"
  ]

  const handleSubmit = () => {
    if (!duration || parseInt(duration) < 1) return

    onSubmit({
      date: date.toISOString(),
      durationMinutes: parseInt(duration),
      focusAreas,
      notes: notes.trim() || null,
      satisfactionRating: satisfaction > 0 ? satisfaction : null
    })
  }

  return (
    <div className="space-y-4 pt-4">
      <div>
        <Label>Practice Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          min="1"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="60"
        />
      </div>

      <div>
        <Label>Focus Areas (optional)</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {skillAreas.map((area) => (
            <label key={area} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={focusAreas.includes(area)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFocusAreas([...focusAreas, area])
                  } else {
                    setFocusAreas(focusAreas.filter(a => a !== area))
                  }
                }}
                className="rounded text-champion-green"
              />
              <span className="text-sm">{area}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="How did the practice go? Any breakthroughs or areas to focus on next time?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <Label>Satisfaction Rating (optional)</Label>
        <div className="flex gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => setSatisfaction(rating)}
              className="p-1"
            >
              <Star
                className={cn(
                  "w-6 h-6",
                  rating <= satisfaction
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300 hover:text-yellow-400"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          onClick={handleSubmit}
          className="flex-1 bg-gradient-to-r from-champion-green to-emerald-600"
          disabled={!duration || parseInt(duration) < 1}
        >
          Log Practice Session
        </Button>
      </div>
    </div>
  )
}
