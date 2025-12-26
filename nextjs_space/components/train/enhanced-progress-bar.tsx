'use client'

/**
 * Enhanced Progress Bar Component
 * 
 * Provides beautiful, animated progress visualization with:
 * - Gradient progress fills
 * - Milestone markers
 * - Percentage display
 * - Smooth animations
 * - Motivational messages
 */

import { useEffect, useState } from 'react'
import { Trophy, Target, Flame, Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface EnhancedProgressBarProps {
  current: number
  total: number
  showMilestones?: boolean
  showStats?: boolean
  className?: string
}

export default function EnhancedProgressBar({
  current,
  total,
  showMilestones = true,
  showStats = true,
  className = ''
}: EnhancedProgressBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const percentage = Math.round((current / total) * 100)

  // Animate progress on mount and when it changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(percentage)
    }, 100)

    return () => clearTimeout(timer)
  }, [percentage])

  // Calculate milestone positions (25%, 50%, 75%, 100%)
  const milestones = [
    { percent: 25, label: '¼', icon: Target, color: 'text-blue-500' },
    { percent: 50, label: '½', icon: Flame, color: 'text-orange-500' },
    { percent: 75, label: '¾', icon: Star, color: 'text-yellow-500' },
    { percent: 100, label: '✓', icon: Trophy, color: 'text-emerald-500' }
  ]

  // Get motivational message based on progress
  const getMotivationalMessage = () => {
    if (percentage === 0) return 'Let\'s start your journey! 🚀'
    if (percentage < 25) return 'Great start! Keep going! 💪'
    if (percentage < 50) return 'You\'re making progress! 🔥'
    if (percentage < 75) return 'Over halfway there! 🎯'
    if (percentage < 100) return 'Almost there, champion! ⭐'
    return 'Program completed! Amazing! 🏆'
  }

  // Get progress bar color based on percentage
  const getProgressGradient = () => {
    if (percentage === 100) {
      return 'from-emerald-500 via-teal-500 to-cyan-500'
    } else if (percentage >= 75) {
      return 'from-purple-500 via-pink-500 to-rose-500'
    } else if (percentage >= 50) {
      return 'from-orange-500 via-amber-500 to-yellow-500'
    } else if (percentage >= 25) {
      return 'from-blue-500 via-indigo-500 to-purple-500'
    } else {
      return 'from-teal-500 via-cyan-500 to-blue-500'
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header with Stats */}
      {showStats && (
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Progress
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {getMotivationalMessage()}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
                {percentage}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {current} of {total} days
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar Container */}
      <div className="relative">
        {/* Background Track */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
          {/* Animated Progress Fill */}
          <motion.div
            className={`h-full bg-gradient-to-r ${getProgressGradient()} relative overflow-hidden`}
            initial={{ width: 0 }}
            animate={{ width: `${animatedProgress}%` }}
            transition={{
              duration: 1,
              ease: "easeOut"
            }}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </motion.div>
        </div>

        {/* Milestone Markers */}
        {showMilestones && (
          <div className="absolute -top-6 left-0 right-0 flex justify-between px-0">
            {milestones.map((milestone) => {
              const isReached = percentage >= milestone.percent
              const Icon = milestone.icon

              return (
                <div
                  key={milestone.percent}
                  className="flex flex-col items-center"
                  style={{ marginLeft: `${milestone.percent}%`, transform: 'translateX(-50%)' }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: isReached ? 1 : 0.5 }}
                    transition={{ duration: 0.3 }}
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center
                      ${isReached 
                        ? `bg-gradient-to-br from-teal-500 to-purple-600 shadow-lg ${milestone.color}` 
                        : 'bg-gray-300 dark:bg-gray-600'
                      }
                      transition-all duration-300
                    `}
                  >
                    <Icon className={`w-3 h-3 ${isReached ? 'text-white' : 'text-gray-400'}`} />
                  </motion.div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Days Remaining */}
      {showStats && current < total && (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <Target className="w-3 h-3" />
          <span>
            {total - current} day{total - current !== 1 ? 's' : ''} remaining
          </span>
        </div>
      )}

      {/* Completion Badge */}
      {percentage === 100 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", delay: 0.5 }}
          className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-white shadow-lg"
        >
          <Trophy className="w-5 h-5" />
          <span className="font-semibold">Program Completed!</span>
          <Trophy className="w-5 h-5" />
        </motion.div>
      )}
    </div>
  )
}
