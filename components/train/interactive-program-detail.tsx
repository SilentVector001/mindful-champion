
"use client"

/**
 * Interactive Program Detail
 * 
 * Dynamic, engaging program experience with:
 * - Smooth day-to-day navigation
 * - Real-time progress updates
 * - Animated transitions
 * - Gamification elements
 * 
 * User Experience: Intuitive flow
 * Code Architecture: Sophisticated state management
 */

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Play,
  CheckCircle2,
  Clock,
  Target,
  Trophy,
  BookOpen,
  Star,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Flame,
  TrendingUp,
  Award,
  Lock,
  Video
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import SeamlessVideoPlayer from "./seamless-video-player"

interface InteractiveProgramDetailProps {
  user: any
  program: any
  userProgram: any
  programVideos: any[]
}

export default function InteractiveProgramDetail({
  user,
  program,
  userProgram,
  programVideos
}: InteractiveProgramDetailProps) {
  const router = useRouter()
  const [selectedDay, setSelectedDay] = useState(userProgram?.currentDay || 1)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [activeVideoIndex, setActiveVideoIndex] = useState(0)

  const isEnrolled = !!userProgram
  const currentDayVideos = programVideos.filter(v => v.dayNumber === selectedDay)
  const totalDays = program.durationDays || 7
  const completedDays = userProgram?.currentDay || 0

  const getSkillLevelConfig = (skillLevel: string) => {
    const configs = {
      beginner: {
        color: "from-champion-green to-emerald-600",
        icon: BookOpen,
        badge: "bg-champion-green text-white"
      },
      intermediate: {
        color: "from-champion-blue to-cyan-600",
        icon: Target,
        badge: "bg-champion-blue text-white"
      },
      advanced: {
        color: "from-champion-gold to-amber-600",
        icon: Trophy,
        badge: "bg-champion-gold text-white"
      },
      elite: {
        color: "from-purple-600 to-violet-600",
        icon: Award,
        badge: "bg-purple-600 text-white"
      }
    }
    return configs[skillLevel?.toLowerCase() as keyof typeof configs] || configs.beginner
  }

  const config = getSkillLevelConfig(program.skillLevel)
  const IconComponent = config.icon

  const handleStartProgram = async () => {
    setIsEnrolling(true)
    try {
      const response = await fetch('/api/training/programs/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId: program.id })
      })

      if (!response.ok) throw new Error('Failed to enroll')

      toast.success('🎉 Program started! Let\'s begin!')
      router.refresh()
    } catch (error) {
      toast.error('Failed to start program')
    } finally {
      setIsEnrolling(false)
    }
  }

  const handleDaySelect = (day: number) => {
    // Can only access current day or completed days
    if (!isEnrolled) {
      toast.error('Please enroll in the program first')
      return
    }
    if (day <= completedDays) {
      setSelectedDay(day)
      setActiveVideoIndex(0)
    } else {
      toast.error('Complete previous days first')
    }
  }

  const handleCompleteDay = async () => {
    try {
      const response = await fetch('/api/training/programs/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: program.id,
          currentDay: selectedDay + 1,
          progress: Math.round(((selectedDay + 1) / totalDays) * 100)
        })
      })

      if (!response.ok) throw new Error('Failed to update progress')

      toast.success('🎉 Day completed! Great work!')
      router.refresh()
      setSelectedDay(selectedDay + 1)
    } catch (error) {
      toast.error('Failed to complete day')
    }
  }

  const handleNextVideo = () => {
    if (activeVideoIndex < currentDayVideos.length - 1) {
      setActiveVideoIndex(activeVideoIndex + 1)
    }
  }

  const handlePreviousVideo = () => {
    if (activeVideoIndex > 0) {
      setActiveVideoIndex(activeVideoIndex - 1)
    }
  }

  const currentVideo = currentDayVideos[activeVideoIndex]

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push('/train')}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Training
        </Button>

        <Card className="overflow-hidden">
          <div className={cn(
            "h-2 bg-gradient-to-r",
            config.color
          )} />
          
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-16 h-16 rounded-xl bg-gradient-to-br flex items-center justify-center",
                  config.color
                )}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl mb-2">{program.name}</CardTitle>
                  <p className="text-muted-foreground">{program.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={config.badge}>{program.skillLevel}</Badge>
                    <Badge variant="outline">{totalDays} Days</Badge>
                    <Badge variant="outline">{parseInt(program.estimatedTimePerDay || "30")} min/day</Badge>
                  </div>
                </div>
              </div>

              {!isEnrolled && (
                <Button
                  size="lg"
                  className={cn(
                    "bg-gradient-to-r text-white",
                    config.color
                  )}
                  onClick={handleStartProgram}
                  disabled={isEnrolling}
                >
                  {isEnrolling ? "Starting..." : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Start Program
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>

          {isEnrolled && (
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-semibold">{userProgram.completionPercentage}%</span>
                  </div>
                  <Progress value={userProgram.completionPercentage} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <Calendar className="w-5 h-5 mx-auto mb-1 text-champion-green" />
                    <div className="text-2xl font-bold">{completedDays}</div>
                    <div className="text-xs text-muted-foreground">Days Completed</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                    <div className="text-2xl font-bold">{completedDays}</div>
                    <div className="text-xs text-muted-foreground">Day Streak</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <TrendingUp className="w-5 h-5 mx-auto mb-1 text-champion-blue" />
                    <div className="text-2xl font-bold">{totalDays - completedDays}</div>
                    <div className="text-xs text-muted-foreground">Days Remaining</div>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Day Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Daily Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
                const isCompleted = isEnrolled && day < completedDays
                const isCurrent = isEnrolled && day === completedDays
                const isLocked = isEnrolled && day > completedDays
                const isSelected = day === selectedDay

                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: day * 0.05 }}
                  >
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "w-full justify-start",
                        isCompleted && "border-champion-green/50",
                        isCurrent && "border-champion-blue",
                        isLocked && "opacity-50"
                      )}
                      onClick={() => handleDaySelect(day)}
                      disabled={!isEnrolled || isLocked}
                    >
                      <div className="flex items-center gap-3 w-full">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-champion-green" />
                        ) : isCurrent ? (
                          <Play className="w-5 h-5 text-champion-blue" />
                        ) : isLocked ? (
                          <Lock className="w-5 h-5" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-current" />
                        )}
                        <div className="text-left flex-1">
                          <div className="font-semibold">Day {day}</div>
                          <div className="text-xs text-muted-foreground">
                            {programVideos.filter(v => v.dayNumber === day).length} drills
                          </div>
                        </div>
                        {isCurrent && <Badge className="bg-champion-blue">Current</Badge>}
                      </div>
                    </Button>
                  </motion.div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Video Player & Content */}
        <div className="lg:col-span-2">
          {!isEnrolled ? (
            <Card className="p-12 text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-champion-gold" />
              <h3 className="text-2xl font-bold mb-2">Ready to Start?</h3>
              <p className="text-muted-foreground mb-6">
                Enroll in this program to access all training videos and track your progress
              </p>
              <Button
                size="lg"
                className={cn(
                  "bg-gradient-to-r text-white",
                  config.color
                )}
                onClick={handleStartProgram}
                disabled={isEnrolling}
              >
                {isEnrolling ? "Starting..." : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start Program Now
                  </>
                )}
              </Button>
            </Card>
          ) : currentDayVideos.length === 0 ? (
            <Card className="p-12 text-center">
              <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Videos Yet</h3>
              <p className="text-muted-foreground">
                Videos for this day will be added soon
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Video Player */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentVideo?.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {currentVideo && (
                    <SeamlessVideoPlayer
                      videoId={currentVideo.id}
                      userId={user.id}
                      videoUrl={currentVideo.youtubeUrl}
                      title={currentVideo.title}
                      duration={currentVideo.duration || 600}
                      onNext={activeVideoIndex < currentDayVideos.length - 1 ? handleNextVideo : undefined}
                      onPrevious={activeVideoIndex > 0 ? handlePreviousVideo : undefined}
                      hasNext={activeVideoIndex < currentDayVideos.length - 1}
                      hasPrevious={activeVideoIndex > 0}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Video List */}
              <Card>
                <CardHeader>
                  <CardTitle>Day {selectedDay} Drills ({currentDayVideos.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {currentDayVideos.map((video, index) => (
                    <Button
                      key={video.id}
                      variant={index === activeVideoIndex ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setActiveVideoIndex(index)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      <div className="text-left flex-1">
                        <div className="font-semibold">{video.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {Math.floor((video.duration || 0) / 60)} min
                        </div>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Complete Day Button */}
              {selectedDay === completedDays && (
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-champion-green to-emerald-600 text-white"
                  onClick={handleCompleteDay}
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Complete Day {selectedDay}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
