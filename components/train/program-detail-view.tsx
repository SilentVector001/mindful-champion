
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Play,
  CheckCircle,
  Clock,
  Target,
  Trophy,
  BookOpen,
  Star,
  ChevronRight,
  PauseCircle,
  Sparkles,
  Download,
  Bell,
  Flame,
  TrendingUp,
  Award
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ProgramDetailViewProps {
  user: any
  program: any
  userProgram: any
  programVideos: any[]
}

export default function ProgramDetailView({
  user,
  program,
  userProgram,
  programVideos
}: ProgramDetailViewProps) {
  const router = useRouter()
  const [selectedDay, setSelectedDay] = useState(userProgram?.currentDay || 1)
  const [isEnrolling, setIsEnrolling] = useState(false)

  const getSkillLevelIcon = (skillLevel: string) => {
    switch (skillLevel?.toLowerCase()) {
      case 'beginner': return BookOpen
      case 'intermediate': return Target
      case 'advanced': return Trophy
      case 'elite': return Award
      default: return BookOpen
    }
  }

  const getSkillLevelColor = (skillLevel: string) => {
    switch (skillLevel?.toLowerCase()) {
      case 'beginner': return "from-champion-green to-emerald-600"
      case 'intermediate': return "from-champion-blue to-cyan-600"
      case 'advanced': return "from-champion-gold to-amber-600"
      case 'elite': return "from-purple-600 to-violet-600"
      default: return "from-champion-green to-emerald-600"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return "bg-champion-green text-white"
      case 'in_progress': return "bg-champion-blue text-white"
      case 'paused': return "bg-yellow-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const IconComponent = getSkillLevelIcon(program.skillLevel)
  const colorClass = getSkillLevelColor(program.skillLevel)

  const handleStartProgram = async () => {
    setIsEnrolling(true)
    try {
      const response = await fetch('/api/training/programs/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId: program.id })
      })

      if (!response.ok) throw new Error('Failed to enroll')

      toast.success('🎉 Program started! Let\'s go!')
      router.refresh()
    } catch (error) {
      toast.error('Failed to start program')
    } finally {
      setIsEnrolling(false)
    }
  }

  const handlePauseProgram = async () => {
    try {
      const response = await fetch(`/api/training/program/${program.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAUSED' })
      })

      if (!response.ok) throw new Error('Failed to pause')

      toast.success('Program paused')
      router.refresh()
    } catch (error) {
      toast.error('Failed to pause program')
    }
  }

  const handleResumeProgram = async () => {
    try {
      const response = await fetch(`/api/training/program/${program.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' })
      })

      if (!response.ok) throw new Error('Failed to resume')

      toast.success('Program resumed! 💪')
      router.refresh()
    } catch (error) {
      toast.error('Failed to resume program')
    }
  }

  // Group videos by day
  const videosByDay = programVideos.reduce((acc, pv) => {
    if (!acc[pv.day]) {
      acc[pv.day] = []
    }
    acc[pv.day].push(pv)
    return acc
  }, {} as Record<number, typeof programVideos>)

  const days = Object.keys(videosByDay).map(Number).sort((a, b) => a - b)
  const totalDays = days.length
  const completedDays = userProgram?.currentDay ? userProgram.currentDay - 1 : 0

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        ← Back to Programs
      </Button>

      {/* Program Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <Card className="border-2">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Icon and Title */}
              <div className="flex items-center gap-6 flex-1">
                <div className={cn(
                  "w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-xl",
                  colorClass
                )}>
                  <IconComponent className="w-10 h-10 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                      {program.name}
                    </h1>
                    <Badge className={cn("shadow-sm bg-gradient-to-r text-white", colorClass)}>
                      {program.skillLevel}
                    </Badge>
                  </div>
                  {program.tagline && (
                    <p className="text-xl text-champion-green font-medium">
                      {program.tagline}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              {userProgram && (
                <Badge className={cn("text-sm px-4 py-2", getStatusColor(userProgram.status))}>
                  {userProgram.status.replace('_', ' ')}
                </Badge>
              )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-champion-green/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-champion-green" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {program.durationDays || totalDays} days
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-champion-blue/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-champion-blue" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Daily Time</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {program.estimatedTimePerDay || '60-90 minutes'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-champion-gold/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-champion-gold" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Progress</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {userProgram?.completionPercentage?.toFixed(0) || 0}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Videos</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {programVideos.length} total
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {userProgram && (
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Day {userProgram.currentDay} of {totalDays}
                  </span>
                  <span className="font-bold text-champion-green">
                    {completedDays} days completed
                  </span>
                </div>
                <Progress value={userProgram.completionPercentage} className="h-3" />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              {!userProgram ? (
                <Button 
                  onClick={handleStartProgram}
                  disabled={isEnrolling}
                  className={cn(
                    "px-8 py-6 text-lg bg-gradient-to-r text-white shadow-lg hover:shadow-xl transition-all",
                    colorClass
                  )}
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {isEnrolling ? 'Starting...' : 'Start Program'}
                </Button>
              ) : (
                <>
                  {userProgram.status === 'PAUSED' ? (
                    <Button 
                      onClick={handleResumeProgram}
                      className="px-6 py-6 bg-gradient-to-r from-champion-green to-emerald-600 text-white"
                      size="lg"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Resume Program
                    </Button>
                  ) : userProgram.status === 'IN_PROGRESS' && (
                    <>
                      <Button 
                        onClick={() => {
                          const currentDayVideos = videosByDay[userProgram.currentDay]
                          if (currentDayVideos && currentDayVideos[0]) {
                            router.push(`/train/video/${currentDayVideos[0].video.videoId}`)
                          }
                        }}
                        className={cn(
                          "px-6 py-6 bg-gradient-to-r text-white shadow-lg",
                          colorClass
                        )}
                        size="lg"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Continue Day {userProgram.currentDay}
                      </Button>
                      <Button 
                        onClick={handlePauseProgram}
                        variant="outline"
                        size="lg"
                        className="px-6 py-6"
                      >
                        <PauseCircle className="w-5 h-5 mr-2" />
                        Pause Program
                      </Button>
                    </>
                  )}
                </>
              )}
              
              {/* Quick Actions */}
              <Button
                variant="outline"
                size="lg"
                className="px-6 py-6"
                onClick={() => router.push('/train/coach')}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Ask Coach Kai
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="overview" className="text-base">Overview</TabsTrigger>
          <TabsTrigger value="schedule" className="text-base">Daily Schedule</TabsTrigger>
          <TabsTrigger value="progress" className="text-base">Your Progress</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Program Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {program.description}
              </p>
            </CardContent>
          </Card>

          {program.keyOutcomes && program.keyOutcomes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-10 h-10 rounded-lg bg-champion-green/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-champion-green" />
                  </div>
                  What You'll Master
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {program.keyOutcomes.map((outcome: string, index: number) => (
                    <li key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-champion-green flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-base">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Program Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Program Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Download className="w-5 h-5 text-champion-blue mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Offline Access
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Download videos to train anywhere
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Bell className="w-5 h-5 text-champion-gold mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Smart Reminders
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Stay on track with personalized notifications
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-champion-green mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Progress Tracking
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      See your improvement day by day
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      AI Coach Support
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get personalized tips from Coach Kai
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6 mt-6">
          <div className="space-y-4">
            {days.map((day) => {
              const dayVideos = videosByDay[day]
              const isCurrentDay = userProgram?.currentDay === day
              const isCompleted = userProgram?.currentDay ? day < userProgram.currentDay : false
              const isLocked = userProgram?.currentDay ? day > userProgram.currentDay : day > 1

              return (
                <Card
                  key={day}
                  className={cn(
                    "border-2 transition-all",
                    isCurrentDay && "border-champion-green shadow-lg",
                    isCompleted && "border-champion-green/30 bg-champion-green/5",
                    isLocked && "opacity-60"
                  )}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
                          isCompleted && "bg-champion-green text-white",
                          isCurrentDay && "bg-champion-blue text-white",
                          isLocked && "bg-gray-200 dark:bg-gray-700 text-gray-400"
                        )}>
                          {isCompleted ? <CheckCircle className="w-6 h-6" /> : day}
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            Day {day}
                            {isCurrentDay && (
                              <Badge className="ml-3 bg-champion-green text-white">
                                Current
                              </Badge>
                            )}
                            {isLocked && (
                              <Badge className="ml-3 bg-gray-300 text-gray-600">
                                Locked
                              </Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {dayVideos.length} video{dayVideos.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      {!isLocked && (
                        <Button
                          onClick={() => {
                            if (dayVideos[0]) {
                              router.push(`/train/video/${dayVideos[0].video.videoId}`)
                            }
                          }}
                          className={cn(
                            isCurrentDay && cn("bg-gradient-to-r text-white", colorClass)
                          )}
                          variant={isCurrentDay ? "default" : "outline"}
                        >
                          {isCompleted ? "Review" : "Start"}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  {!isLocked && (
                    <CardContent>
                      <div className="space-y-2">
                        {dayVideos.map((pv: any) => {
                          const isWatched = pv.video.userVideoProgress?.[0]?.watchedPercentage >= 90
                          return (
                            <div
                              key={pv.id}
                              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                              onClick={() => router.push(`/train/video/${pv.video.videoId}`)}
                            >
                              <Play className="w-4 h-4 text-champion-green" />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {pv.video.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {pv.video.duration}
                                </p>
                              </div>
                              {isWatched && (
                                <Badge className="bg-champion-green/10 text-champion-green text-xs">
                                  Completed
                                </Badge>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6 mt-6">
          {userProgram ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-champion-green/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-champion-green" />
                    </div>
                    <div className="text-4xl font-bold text-champion-green mb-2">
                      {completedDays}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Days Completed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-champion-blue/10 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-champion-blue" />
                    </div>
                    <div className="text-4xl font-bold text-champion-blue mb-2">
                      {totalDays - completedDays}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Days Remaining</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-champion-gold/10 flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-8 h-8 text-champion-gold" />
                    </div>
                    <div className="text-4xl font-bold text-champion-gold mb-2">
                      {userProgram.completionPercentage.toFixed(0)}%
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Complete</p>
                  </CardContent>
                </Card>
              </div>

              {/* Journey Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Your Journey</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {days.slice(0, userProgram.currentDay).map((day) => (
                      <div 
                        key={day}
                        className="flex items-center gap-4 p-4 rounded-lg bg-champion-green/5 border border-champion-green/20"
                      >
                        <CheckCircle className="w-7 h-7 text-champion-green flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Day {day} Completed
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {videosByDay[day]?.length} videos watched
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-16 text-center">
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                  Start Your Journey
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Begin this program to track your progress, unlock achievements, and become a better player.
                </p>
                <Button 
                  onClick={handleStartProgram}
                  disabled={isEnrolling}
                  className={cn(
                    "px-8 py-6 text-lg bg-gradient-to-r text-white shadow-lg",
                    colorClass
                  )}
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {isEnrolling ? 'Starting...' : 'Start Program Now'}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
