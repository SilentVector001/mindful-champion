
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
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
  RotateCcw,
  PauseCircle,
  Sparkles
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface DayStructure {
  day: number
  title: string
  focus: string
  videos: string[]
  practice_goals: string[]
  success_metric: string
}

interface TrainingProgram {
  id: string
  programId: string
  name: string
  tagline?: string | null
  description: string
  durationDays: number
  skillLevel: string
  estimatedTimePerDay?: string | null
  keyOutcomes?: any
  dailyStructure: any
}

interface UserProgram {
  id: string
  status: string
  startDate?: Date | null
  currentDay: number
  completionPercentage: number
}

interface VideoInfo {
  id: string
  videoId: string
  title: string
  duration: string
  thumbnailUrl?: string | null
  watched?: boolean
}

interface ProgramDetailProps {
  program: TrainingProgram
  userProgram?: UserProgram
  videos: VideoInfo[]
  onStartProgram: () => void
  onVideoClick: (videoId: string) => void
  onMarkDayComplete: (day: number) => void
  onPauseProgram: () => void
  onResumeProgram: () => void
}

export default function ProgramDetail({
  program,
  userProgram,
  videos,
  onStartProgram,
  onVideoClick,
  onMarkDayComplete,
  onPauseProgram,
  onResumeProgram
}: ProgramDetailProps) {
  const router = useRouter()
  const [selectedDay, setSelectedDay] = useState(userProgram?.currentDay || 1)

  const getSkillLevelIcon = (skillLevel: string) => {
    switch (skillLevel.toLowerCase()) {
      case 'beginner': return BookOpen
      case 'intermediate': return Target
      case 'advanced': return Trophy
      case 'pro': return Star
      default: return BookOpen
    }
  }

  const getSkillLevelColor = (skillLevel: string) => {
    switch (skillLevel.toLowerCase()) {
      case 'beginner': return "from-champion-green to-emerald-600"
      case 'intermediate': return "from-champion-blue to-cyan-600"
      case 'advanced': return "from-champion-gold to-amber-600"
      case 'pro': return "from-purple-600 to-violet-600"
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

  // Create video lookup map
  const videoMap = videos.reduce((map, video) => {
    map[video.videoId] = video
    return map
  }, {} as Record<string, VideoInfo>)

  const IconComponent = getSkillLevelIcon(program.skillLevel)
  const colorClass = getSkillLevelColor(program.skillLevel)

  const isDayCompleted = (dayNumber: number) => {
    return userProgram && dayNumber < userProgram.currentDay
  }

  const isDayAvailable = (dayNumber: number) => {
    if (!userProgram) return dayNumber === 1
    return dayNumber <= userProgram.currentDay
  }

  const getCurrentDayData = () => {
    return program.dailyStructure.find((day: any) => day.day === selectedDay)
  }

  const selectedDayData = getCurrentDayData()

  return (
    <div className="space-y-8">
      {/* Program Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className={cn(
            "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
            colorClass
          )}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {program.name}
            </h1>
            {program.tagline && (
              <p className="text-xl text-champion-green font-medium mt-1">
                {program.tagline}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mb-6">
          <Badge className={cn("text-white shadow-sm bg-gradient-to-r", colorClass)}>
            {program.skillLevel}
          </Badge>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{program.durationDays} days</span>
          </div>
          {program.estimatedTimePerDay && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{program.estimatedTimePerDay}</span>
            </div>
          )}
          {userProgram && (
            <Badge className={getStatusColor(userProgram.status)}>
              {userProgram.status.replace('_', ' ')}
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        {userProgram && (
          <div className="max-w-md mx-auto space-y-2">
            <Progress value={userProgram.completionPercentage} className="h-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {userProgram.completionPercentage.toFixed(0)}% Complete
              {userProgram.status === 'IN_PROGRESS' && (
                <span> • Day {userProgram.currentDay} of {program.durationDays}</span>
              )}
            </p>
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center gap-4"
      >
        {!userProgram ? (
          <Button 
            onClick={onStartProgram}
            className="px-8 py-3 bg-gradient-to-r from-champion-green to-emerald-600 hover:shadow-lg text-lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Program
          </Button>
        ) : (
          <>
            {userProgram.status === 'PAUSED' ? (
              <Button 
                onClick={onResumeProgram}
                className="px-6 py-2 bg-gradient-to-r from-champion-green to-emerald-600"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume Program
              </Button>
            ) : (
              <Button 
                onClick={onPauseProgram}
                variant="outline"
              >
                <PauseCircle className="w-4 h-4 mr-2" />
                Pause Program
              </Button>
            )}
            <Button 
              onClick={() => onVideoClick(selectedDayData?.videos?.[0] || '')}
              className="px-6 py-2 bg-gradient-to-r from-champion-blue to-cyan-600"
              disabled={!isDayAvailable(selectedDay)}
            >
              <Play className="w-4 h-4 mr-2" />
              {selectedDay === userProgram.currentDay ? 'Continue Today' : 'View Day'}
            </Button>
          </>
        )}
      </motion.div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">Daily Schedule</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Program Description</CardTitle>
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
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-champion-green" />
                  What You'll Achieve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {program.keyOutcomes.map((outcome: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-champion-green mt-2.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Day Selection Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Program Schedule</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {program.dailyStructure.map((day: any) => (
                      <button
                        key={day.day}
                        onClick={() => setSelectedDay(day.day)}
                        className={cn(
                          "w-full p-3 rounded-lg text-left transition-all",
                          selectedDay === day.day
                            ? "bg-champion-green text-white shadow-md"
                            : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700",
                          !isDayAvailable(day.day) && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={!isDayAvailable(day.day)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Day {day.day}</span>
                          {isDayCompleted(day.day) && (
                            <CheckCircle className="w-4 h-4 text-champion-green" />
                          )}
                        </div>
                        <p className="text-xs opacity-80 mt-1 line-clamp-1">
                          {day.title}
                        </p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Day Detail */}
            <div className="lg:col-span-3">
              {selectedDayData && (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">
                          Day {selectedDayData.day}: {selectedDayData.title}
                        </CardTitle>
                        <Badge className="mt-2 bg-champion-blue/10 text-champion-blue border-champion-blue/20">
                          Focus: {selectedDayData.focus}
                        </Badge>
                      </div>
                      {isDayCompleted(selectedDayData.day) && (
                        <Badge className="bg-champion-green text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Videos */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Play className="w-5 h-5 text-champion-green" />
                        Training Videos
                      </h3>
                      <div className="space-y-3">
                        {selectedDayData.videos.map((videoId: string, index: number) => {
                          const videoInfo = videoMap[videoId]
                          if (!videoInfo) return null

                          return (
                            <div
                              key={videoId}
                              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              onClick={() => onVideoClick(videoId)}
                            >
                              <div className="w-20 h-14 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0 flex items-center justify-center">
                                {videoInfo.thumbnailUrl ? (
                                  <img 
                                    src={videoInfo.thumbnailUrl} 
                                    alt={videoInfo.title}
                                    className="w-full h-full object-cover rounded"
                                  />
                                ) : (
                                  <Play className="w-6 h-6 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium line-clamp-1">{videoInfo.title}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{videoInfo.duration}</span>
                                  {videoInfo.watched && (
                                    <Badge className="bg-champion-green/10 text-champion-green text-xs">
                                      Watched
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Practice Goals */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5 text-champion-blue" />
                        Practice Goals
                      </h3>
                      <ul className="space-y-2">
                        {selectedDayData.practice_goals.map((goal: string, index: number) => (
                          <li key={index} className="flex items-start gap-3">
                            <Checkbox 
                              id={`goal-${index}`}
                              className="mt-1"
                              disabled={!isDayAvailable(selectedDayData.day)}
                            />
                            <label 
                              htmlFor={`goal-${index}`} 
                              className="text-gray-700 dark:text-gray-300 cursor-pointer"
                            >
                              {goal}
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Success Metric */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-champion-gold" />
                        Success Metric
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 bg-champion-gold/5 p-4 rounded-lg border border-champion-gold/20">
                        {selectedDayData.success_metric}
                      </p>
                    </div>

                    {/* Day Actions */}
                    {userProgram && isDayAvailable(selectedDayData.day) && !isDayCompleted(selectedDayData.day) && (
                      <div className="flex justify-center pt-4">
                        <Button
                          onClick={() => onMarkDayComplete(selectedDayData.day)}
                          className="bg-gradient-to-r from-champion-green to-emerald-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Day {selectedDayData.day} Complete
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          {userProgram ? (
            <>
              {/* Progress Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-champion-green mb-2">
                      {userProgram.currentDay - 1}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Days Completed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-champion-blue mb-2">
                      {program.durationDays - userProgram.currentDay + 1}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Days Remaining</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-champion-gold mb-2">
                      {userProgram.completionPercentage.toFixed(0)}%
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Progress</p>
                  </CardContent>
                </Card>
              </div>

              {/* Completion Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Journey</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {program.dailyStructure.slice(0, userProgram.currentDay).map((day: any) => (
                      <div 
                        key={day.day}
                        className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                      >
                        <CheckCircle className="w-6 h-6 text-champion-green flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium">Day {day.day}: {day.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Focus: {day.focus}
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
              <CardContent className="p-12 text-center">
                <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Start Your Journey
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Begin this program to track your progress and achievements.
                </p>
                <Button 
                  onClick={onStartProgram}
                  className="bg-gradient-to-r from-champion-green to-emerald-600"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Program
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
