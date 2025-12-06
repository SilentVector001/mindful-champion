"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Trophy, Award, Star, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points: number
}

interface AchievementToastProps {
  achievements: Achievement[]
  onDismiss: () => void
}

export function AchievementToast({ achievements, onDismiss }: AchievementToastProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const currentAchievement = achievements[currentIndex]

  useEffect(() => {
    if (!currentAchievement) return

    // Trigger confetti animation
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#10B981', '#3B82F6', '#8B5CF6']
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#10B981', '#3B82F6', '#8B5CF6']
      })
    }, 250)

    return () => clearInterval(interval)
  }, [currentAchievement])

  const handleNext = () => {
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      handleClose()
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onDismiss, 300)
  }

  if (!currentAchievement || !isVisible) return null

  const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed bottom-6 right-6 z-[9999] max-w-md"
      >
        <Card className="bg-gradient-to-br from-champion-gold/10 via-white to-champion-green/10 border-2 border-champion-gold shadow-2xl backdrop-blur-lg overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-champion-gold/20 to-champion-green/20 animate-pulse" />
          
          <div className="relative p-6">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full hover:bg-white/50"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Achievement Icon */}
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 10, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-champion-gold to-yellow-600 rounded-full blur-xl opacity-60 animate-pulse" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-champion-gold to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-4xl">{currentAchievement.icon}</span>
                </div>
              </motion.div>
            </div>

            {/* Achievement Details */}
            <div className="text-center space-y-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold bg-gradient-to-r from-champion-green via-champion-gold to-champion-blue bg-clip-text text-transparent">
                  Achievement Unlocked!
                </h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h4 className="text-xl font-bold text-gray-900">
                  {currentAchievement.name}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {currentAchievement.description}
                </p>
              </motion.div>

              {/* Points Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="flex items-center justify-center gap-2 mt-4"
              >
                <div className="bg-gradient-to-r from-champion-gold to-yellow-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span className="font-bold text-lg">+{currentAchievement.points} points</span>
                </div>
              </motion.div>

              {/* Progress indicator */}
              {achievements.length > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-center gap-2 mt-4"
                >
                  <span className="text-sm text-gray-500">
                    {currentIndex + 1} of {achievements.length}
                  </span>
                </motion.div>
              )}

              {/* Total Points if multiple achievements */}
              {achievements.length > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-sm text-gray-600"
                >
                  Total: <span className="font-bold text-champion-gold">{totalPoints} points</span>
                </motion.div>
              )}

              {/* Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-4"
              >
                <Button
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-champion-green to-champion-gold hover:from-champion-green/90 hover:to-champion-gold/90 text-white font-bold shadow-lg"
                >
                  {currentIndex < achievements.length - 1 ? 'Next Achievement' : 'Awesome!'}
                </Button>
              </motion.div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Hook to manage achievement notifications
 */
export function useAchievementNotifications() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isShowing, setIsShowing] = useState(false)

  const showAchievements = (newAchievements: Achievement[]) => {
    if (newAchievements.length > 0) {
      setAchievements(newAchievements)
      setIsShowing(true)
    }
  }

  const dismissAchievements = () => {
    setIsShowing(false)
    setAchievements([])
  }

  const checkForAchievements = async (actionType?: 'video' | 'practice' | 'subscription' | 'all') => {
    try {
      const response = await fetch('/api/rewards/check-achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: actionType || 'all' })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.newAchievements && data.newAchievements.length > 0) {
          showAchievements(data.newAchievements)
        }
      }
    } catch (error) {
      console.error('Failed to check achievements:', error)
    }
  }

  return {
    achievements,
    isShowing,
    showAchievements,
    dismissAchievements,
    checkForAchievements
  }
}
