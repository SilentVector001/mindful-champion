// @ts-nocheck
'use client'

/**
 * Day Completion Modal
 * 
 * Provides clear feedback and next steps guidance when a user completes a training day.
 * Shows celebration, progress stats, and prominent CTAs for the next action.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle,
  Trophy,
  ChevronRight,
  Target,
  Calendar,
  Sparkles,
  ArrowRight,
  Star,
  Flame,
  Award
} from 'lucide-react'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'
import { useEffect } from 'react'

interface DayCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  completedDay: number
  nextDay: number
  totalDays: number
  completionPercentage: number
  streak?: number
  programName: string
  nextDayTitle?: string
  onStartNextDay?: () => void
  onViewProgress?: () => void
  isProgramComplete?: boolean
}

export default function DayCompletionModal({
  isOpen,
  onClose,
  completedDay,
  nextDay,
  totalDays,
  completionPercentage,
  streak = 0,
  programName,
  nextDayTitle,
  onStartNextDay,
  onViewProgress,
  isProgramComplete = false
}: DayCompletionModalProps) {

  // Trigger confetti on open
  useEffect(() => {
    if (isOpen) {
      // Launch confetti
      const duration = isProgramComplete ? 5000 : 3000
      const end = Date.now() + duration

      const colors = isProgramComplete 
        ? ['#FFD700', '#FFA500', '#FF6347', '#4169E1']
        : ['#10b981', '#3b82f6', '#8b5cf6']

      const frame = () => {
        confetti({
          particleCount: isProgramComplete ? 7 : 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        })
        confetti({
          particleCount: isProgramComplete ? 7 : 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()
    }
  }, [isOpen, isProgramComplete])

  const getMilestoneReward = () => {
    if (isProgramComplete) {
      return { icon: Trophy, text: 'Program Complete!', color: 'text-yellow-500', bgColor: 'bg-yellow-100' }
    }
    if (completionPercentage >= 75) {
      return { icon: Award, text: '75% Milestone!', color: 'text-purple-500', bgColor: 'bg-purple-100' }
    }
    if (completionPercentage >= 50) {
      return { icon: Star, text: 'Halfway There!', color: 'text-blue-500', bgColor: 'bg-blue-100' }
    }
    if (completionPercentage >= 25) {
      return { icon: Target, text: 'Quarter Mark!', color: 'text-green-500', bgColor: 'bg-green-100' }
    }
    return null
  }

  const milestone = getMilestoneReward()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Day Completed</DialogTitle>
        </DialogHeader>

        <motion.div
          className="space-y-6 py-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Celebration Header */}
          <div className="text-center">
            <motion.div
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-2xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15,
                delay: 0.2 
              }}
            >
              <CheckCircle className="w-14 h-14 text-white" />
            </motion.div>

            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {isProgramComplete ? '🎊 Program Complete! 🎊' : `🎉 Day ${completedDay} Complete! 🎉`}
            </motion.h2>

            <motion.p 
              className="text-lg text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {isProgramComplete 
                ? `Congratulations on completing ${programName}!`
                : 'Great work, Champion! Your dedication is paying off.'
              }
            </motion.p>
          </div>

          {/* Milestone Badge */}
          {milestone && (
            <motion.div
              className={cn(
                "p-6 rounded-2xl border-2",
                milestone.bgColor,
                "border-current"
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-center gap-4">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center",
                  milestone.bgColor.replace('100', '200')
                )}>
                  <milestone.icon className={cn("w-8 h-8", milestone.color)} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{milestone.text}</h3>
                  <p className="text-gray-600">You've reached a major milestone!</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Progress Stats */}
          <motion.div
            className="bg-gradient-to-br from-slate-50 to-emerald-50 p-6 rounded-2xl border border-emerald-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-500" />
              Your Progress
            </h3>

            <div className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Completion</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {Math.round(completionPercentage)}%
                  </span>
                </div>
                <Progress value={completionPercentage} className="h-3" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{completedDay}</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>

                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {totalDays - completedDay}
                  </div>
                  <div className="text-xs text-gray-600">Remaining</div>
                </div>

                {streak > 0 && (
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-orange-100 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{streak}</div>
                    <div className="text-xs text-gray-600">Day Streak</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* What's Next Section */}
          {!isProgramComplete && nextDay <= totalDays && (
            <motion.div
              className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">What's Next?</h3>
                  <p className="text-gray-600">Day {nextDay} is now unlocked and ready for you!</p>
                </div>
              </div>

              {nextDayTitle && (
                <div className="bg-white/50 p-4 rounded-xl mb-4">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-500 text-white">Day {nextDay}</Badge>
                    <span className="font-semibold text-gray-900">{nextDayTitle}</span>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-700 bg-white/50 p-3 rounded-lg">
                <strong>💡 Pro Tip:</strong> Consistency is key! Try to complete your training at the same time each day to build a strong habit.
              </p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {!isProgramComplete && nextDay <= totalDays ? (
              <>
                <Button
                  onClick={onStartNextDay}
                  className="flex-1 py-6 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Day {nextDay}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Button
                  onClick={onViewProgress}
                  variant="outline"
                  className="flex-1 py-6 text-lg"
                  size="lg"
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  View My Progress
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={onViewProgress}
                  className="flex-1 py-6 text-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg"
                  size="lg"
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  View My Journey
                </Button>

                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 py-6 text-lg"
                  size="lg"
                >
                  Close
                </Button>
              </>
            )}
          </motion.div>

          {/* Skip for Now Option */}
          {!isProgramComplete && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <button
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                I'll start later
              </button>
            </motion.div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

// Missing import - Add Play icon
import { Play } from 'lucide-react'
