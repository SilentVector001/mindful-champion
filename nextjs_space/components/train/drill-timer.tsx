'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Check, Volume2, VolumeX, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DrillTimerProps {
  drillName: string
  drillId: string
  programId?: string
  dayNumber?: number
  initialDuration?: number // seconds
  initialReps?: number
  onComplete?: (timeSpent: number, rating?: number) => void
  showReps?: boolean
}

export default function DrillTimer({
  drillName,
  drillId,
  programId,
  dayNumber,
  initialDuration = 300,
  initialReps = 10,
  onComplete,
  showReps = false
}: DrillTimerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [targetDuration] = useState(initialDuration)
  const [repsCompleted, setRepsCompleted] = useState(0)
  const [targetReps] = useState(initialReps)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)
  const [rating, setRating] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/ding.mp3')
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  // Audio cue every 30 seconds
  useEffect(() => {
    if (timeElapsed > 0 && timeElapsed % 30 === 0 && soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }, [timeElapsed, soundEnabled])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  const handleReset = () => {
    setIsRunning(false)
    setTimeElapsed(0)
    setRepsCompleted(0)
    setIsCompleted(false)
    setRating(0)
  }

  const handleComplete = async () => {
    setIsRunning(false)
    setIsCompleted(true)
    
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {})
    }

    // Save progress
    try {
      await fetch('/api/training/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'drill_complete',
          drillId,
          programId,
          dayNumber,
          timeSpent: timeElapsed,
          rating: rating || undefined
        })
      })
    } catch (error) {
      console.error('Error saving progress:', error)
    }

    onComplete?.(timeElapsed, rating)
  }

  const progress = showReps 
    ? (repsCompleted / targetReps) * 100
    : Math.min((timeElapsed / targetDuration) * 100, 100)

  const circumference = 2 * Math.PI * 90
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-6 border border-cyan-500/20"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-1">{drillName}</h3>
        <p className="text-slate-400 text-sm">Focus on form and consistency</p>
      </div>

      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="90"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-700"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="90"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showReps ? (
            <>
              <div className="text-5xl font-bold text-white">{repsCompleted}</div>
              <div className="text-slate-400">/ {targetReps} reps</div>
            </>
          ) : (
            <>
              <div className="text-4xl font-bold text-white">{formatTime(timeElapsed)}</div>
              <div className="text-slate-400 text-sm">/ {formatTime(targetDuration)}</div>
            </>
          )}
        </div>
      </div>

      {/* Rep Counter Buttons */}
      {showReps && (
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full border-slate-600"
            onClick={() => setRepsCompleted(Math.max(0, repsCompleted - 1))}
          >
            <Minus className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-16 h-16 rounded-full border-emerald-500 bg-emerald-500/20 hover:bg-emerald-500/30"
            onClick={() => setRepsCompleted(repsCompleted + 1)}
          >
            <Plus className="w-8 h-8 text-emerald-400" />
          </Button>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full border-slate-600"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </Button>

        <Button
          size="icon"
          className={cn(
            "w-16 h-16 rounded-full transition-all",
            isRunning
              ? "bg-orange-500 hover:bg-orange-600"
              : "bg-gradient-to-br from-cyan-500 to-emerald-600 hover:from-cyan-600 hover:to-emerald-700"
          )}
          onClick={() => setIsRunning(!isRunning)}
          disabled={isCompleted}
        >
          {isRunning ? (
            <Pause className="w-7 h-7" />
          ) : (
            <Play className="w-7 h-7 ml-1" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full border-slate-600"
          onClick={handleReset}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Complete Button */}
      <AnimatePresence>
        {(progress >= 100 || timeElapsed > 60) && !isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Rating */}
            <div className="mb-4">
              <p className="text-center text-slate-400 text-sm mb-2">How was this drill?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={cn(
                      "text-2xl transition-all",
                      star <= rating ? "scale-110" : "opacity-40 hover:opacity-70"
                    )}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
              onClick={handleComplete}
            >
              <Check className="w-5 h-5 mr-2" />
              Mark Complete (+25 XP)
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Celebration */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="text-5xl mb-2"
            >
              🎉
            </motion.div>
            <h4 className="text-xl font-bold text-emerald-400">Great Work!</h4>
            <p className="text-slate-400">Drill completed in {formatTime(timeElapsed)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
