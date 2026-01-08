// @ts-nocheck
'use client'

/**
 * Interactive Drill Components
 * Provides timers, rep counters, and activity tracking for training drills
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Timer,
  Plus,
  Minus,
  Target,
  Clock,
  Zap,
  Award,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ============================================
// TIMER COMPONENT
// ============================================
interface DrillTimerProps {
  duration_minutes: number
  onComplete?: () => void
  autoStart?: boolean
}

export function DrillTimer({ duration_minutes, onComplete, autoStart = false }: DrillTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration_minutes * 60) // Convert to seconds
  const [isRunning, setIsRunning] = useState(autoStart)
  const [isCompleted, setIsCompleted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsCompleted(true)
            onComplete?.()
            toast.success('⏰ Time\'s up! Great work!')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, timeLeft, onComplete])

  const toggleTimer = () => setIsRunning(!isRunning)
  
  const resetTimer = () => {
    setTimeLeft(duration_minutes * 60)
    setIsRunning(false)
    setIsCompleted(false)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const totalSeconds = duration_minutes * 60
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <Card className={cn(
        "border-2 transition-all duration-300",
        isCompleted ? "border-emerald-500 bg-emerald-50" : "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50"
      )}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Timer className={cn(
              "w-5 h-5",
              isRunning ? "text-blue-500 animate-pulse" : "text-gray-500"
            )} />
            Drill Timer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timer Display */}
          <div className="text-center">
            <div className={cn(
              "text-6xl font-bold tracking-tight transition-colors duration-300",
              isCompleted ? "text-emerald-600" : isRunning ? "text-blue-600" : "text-gray-700"
            )}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {isCompleted ? "Completed!" : isRunning ? "Keep going!" : "Ready to start"}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-xs text-gray-600">
              <span>{Math.round(progress)}% Complete</span>
              <span>{duration_minutes} min drill</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2 justify-center">
            {!isCompleted ? (
              <>
                <Button
                  onClick={toggleTimer}
                  className={cn(
                    "flex-1",
                    isRunning ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-500 hover:bg-blue-600"
                  )}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </>
                  )}
                </Button>
                <Button
                  onClick={resetTimer}
                  variant="outline"
                  className="flex-shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                onClick={resetTimer}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete - Reset for Next Round
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================
// REP COUNTER COMPONENT
// ============================================
interface RepCounterProps {
  targetReps: number
  exerciseName: string
  onComplete?: () => void
}

export function RepCounter({ targetReps, exerciseName, onComplete }: RepCounterProps) {
  const [currentReps, setCurrentReps] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const increment = () => {
    if (currentReps < targetReps) {
      const newCount = currentReps + 1
      setCurrentReps(newCount)
      
      if (newCount === targetReps) {
        setIsCompleted(true)
        onComplete?.()
        toast.success(`🎯 ${exerciseName} completed! ${targetReps} reps done!`)
      }
    }
  }

  const decrement = () => {
    if (currentReps > 0) {
      setCurrentReps(currentReps - 1)
      setIsCompleted(false)
    }
  }

  const reset = () => {
    setCurrentReps(0)
    setIsCompleted(false)
  }

  const progress = (currentReps / targetReps) * 100

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full"
    >
      <Card className={cn(
        "border-2 transition-all duration-300",
        isCompleted ? "border-emerald-500 bg-emerald-50" : "border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50"
      )}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className={cn(
              "w-5 h-5",
              isCompleted ? "text-emerald-500" : "text-purple-500"
            )} />
            {exerciseName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Counter Display */}
          <div className="text-center">
            <div className={cn(
              "text-7xl font-bold tracking-tight transition-colors duration-300",
              isCompleted ? "text-emerald-600" : "text-purple-600"
            )}>
              {currentReps}
            </div>
            <p className="text-2xl text-gray-600 mt-2">
              of {targetReps} reps
            </p>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-xs text-gray-600">
              <span>{Math.round(progress)}% Complete</span>
              <span>{targetReps - currentReps} remaining</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button
              onClick={decrement}
              variant="outline"
              size="lg"
              disabled={currentReps === 0}
              className="flex-shrink-0"
            >
              <Minus className="w-5 h-5" />
            </Button>
            <Button
              onClick={increment}
              size="lg"
              disabled={isCompleted}
              className={cn(
                "flex-1 text-lg font-semibold",
                isCompleted 
                  ? "bg-emerald-500 hover:bg-emerald-600" 
                  : "bg-purple-500 hover:bg-purple-600"
              )}
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Complete!
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Count Rep
                </>
              )}
            </Button>
            <Button
              onClick={reset}
              variant="outline"
              size="lg"
              className="flex-shrink-0"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>

          {/* Motivational message */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-emerald-700 font-medium"
            >
              🎉 Excellent work! Take a quick breather.
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================
// DRILL CHECKLIST COMPONENT
// ============================================
interface DrillChecklistProps {
  drills: {
    name: string
    description: string
    duration_minutes?: number
    reps_or_sets?: string
    tips?: string[]
  }[]
  onAllComplete?: () => void
}

export function DrillChecklist({ drills, onAllComplete }: DrillChecklistProps) {
  const [completedDrills, setCompletedDrills] = useState<Set<number>>(new Set())
  const [expandedDrill, setExpandedDrill] = useState<number | null>(null)

  const toggleDrill = (index: number) => {
    const newCompleted = new Set(completedDrills)
    if (newCompleted.has(index)) {
      newCompleted.delete(index)
    } else {
      newCompleted.add(index)
      toast.success(`✅ ${drills[index].name} marked complete!`)
    }
    setCompletedDrills(newCompleted)

    // Check if all drills are completed
    if (newCompleted.size === drills.length) {
      onAllComplete?.()
      toast.success('🏆 All drills completed! Amazing work!')
    }
  }

  const toggleExpanded = (index: number) => {
    setExpandedDrill(expandedDrill === index ? null : index)
  }

  const progress = (completedDrills.size / drills.length) * 100

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-gray-900">
                Main Drills Progress
              </span>
            </div>
            <Badge className={cn(
              "text-sm",
              completedDrills.size === drills.length
                ? "bg-emerald-500"
                : "bg-amber-500"
            )}>
              {completedDrills.size} / {drills.length} Complete
            </Badge>
          </div>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>

      {/* Drill Items */}
      <div className="space-y-3">
        {drills.map((drill, index) => {
          const isCompleted = completedDrills.has(index)
          const isExpanded = expandedDrill === index

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(
                "border-2 transition-all duration-300 cursor-pointer",
                isCompleted 
                  ? "border-emerald-300 bg-emerald-50/50" 
                  : "border-gray-200 hover:border-blue-300 hover:shadow-md"
              )}>
                <CardContent className="p-4">
                  {/* Drill Header */}
                  <div 
                    className="flex items-start gap-3"
                    onClick={() => toggleExpanded(index)}
                  >
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => toggleDrill(index)}
                      className="mt-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <h4 className={cn(
                        "font-semibold mb-1 transition-colors",
                        isCompleted ? "text-emerald-700 line-through" : "text-gray-900"
                      )}>
                        {drill.name}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {drill.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {drill.duration_minutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{drill.duration_minutes} min</span>
                          </div>
                        )}
                        {drill.reps_or_sets && (
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            <span>{drill.reps_or_sets}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {isCompleted && (
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    )}
                  </div>

                  {/* Expanded Tips */}
                  <AnimatePresence>
                    {isExpanded && drill.tips && drill.tips.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pl-8 space-y-2"
                      >
                        <p className="text-sm font-medium text-blue-700">💡 Tips:</p>
                        <ul className="space-y-1">
                          {drill.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-blue-500 mt-0.5">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Completion Message */}
      {completedDrills.size === drills.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white"
        >
          <Award className="w-12 h-12 mx-auto mb-3" />
          <h3 className="text-2xl font-bold mb-2">All Drills Complete! 🎉</h3>
          <p className="text-emerald-100">
            Excellent work today! You've completed all your training drills.
          </p>
        </motion.div>
      )}
    </div>
  )
}

// ============================================
// ACTIVITY SUMMARY COMPONENT
// ============================================
interface ActivitySummaryProps {
  warmupCompleted: boolean
  drillsCompleted: number
  totalDrills: number
  videoWatched: boolean
  cooldownCompleted: boolean
  onMarkDayComplete: () => void
}

export function ActivitySummary({
  warmupCompleted,
  drillsCompleted,
  totalDrills,
  videoWatched,
  cooldownCompleted,
  onMarkDayComplete
}: ActivitySummaryProps) {
  const activities = [
    { name: 'Watched Training Video', completed: videoWatched },
    { name: 'Completed Warm-up', completed: warmupCompleted },
    { name: `Finished ${drillsCompleted}/${totalDrills} Main Drills`, completed: drillsCompleted === totalDrills },
    { name: 'Completed Cool-down', completed: cooldownCompleted }
  ]

  const totalCompleted = activities.filter(a => a.completed).length
  const allComplete = totalCompleted === activities.length
  const progress = (totalCompleted / activities.length) * 100

  return (
    <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Today's Activity Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Overall Progress</span>
            <span className={cn(
              allComplete ? "text-emerald-600" : "text-blue-600"
            )}>
              {totalCompleted} / {activities.length} Complete
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Activity Checklist */}
        <div className="space-y-2">
          {activities.map((activity, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                activity.completed 
                  ? "bg-emerald-100 text-emerald-800" 
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {activity.completed ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{activity.name}</span>
            </div>
          ))}
        </div>

        {/* Complete Day Button */}
        <Button
          onClick={onMarkDayComplete}
          disabled={!allComplete}
          className={cn(
            "w-full text-lg py-6",
            allComplete 
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
        >
          {allComplete ? (
            <>
              <Award className="w-5 h-5 mr-2" />
              Mark Day Complete 🎉
            </>
          ) : (
            <>
              <Clock className="w-5 h-5 mr-2" />
              Complete All Activities First
            </>
          )}
        </Button>

        {!allComplete && (
          <p className="text-xs text-center text-gray-600">
            Finish all activities to unlock day completion
          </p>
        )}
      </CardContent>
    </Card>
  )
}
