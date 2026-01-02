'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, Check, Lock, Clock, Target, Video, ChevronDown, ChevronUp,
  Zap, Star, BookOpen, Trophy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import DrillTimer from './drill-timer'

interface Drill {
  id: string
  name: string
  description: string
  duration: number
  videoUrl?: string
  type: 'warmup' | 'drill' | 'cooldown'
  reps?: number
}

interface DayData {
  dayNumber: number
  title: string
  focus: string
  description: string
  drills: Drill[]
  estimatedTime: number
  xpReward: number
}

interface ProgramDayViewProps {
  programId: string
  programName: string
  day: DayData
  isUnlocked: boolean
  isCompleted: boolean
  onDayComplete?: () => void
}

export default function ProgramDayView({
  programId,
  programName,
  day,
  isUnlocked,
  isCompleted: initialCompleted,
  onDayComplete
}: ProgramDayViewProps) {
  const [expanded, setExpanded] = useState(false)
  const [completedDrills, setCompletedDrills] = useState<Set<string>>(new Set())
  const [activeDrill, setActiveDrill] = useState<Drill | null>(null)
  const [isCompleted, setIsCompleted] = useState(initialCompleted)
  const [showVideo, setShowVideo] = useState<string | null>(null)

  const allDrillsCompleted = completedDrills.size >= (day?.drills?.length ?? 0)
  const progress = day?.drills?.length ? (completedDrills.size / day.drills.length) * 100 : 0

  const handleDrillComplete = (drillId: string) => {
    setCompletedDrills(prev => new Set([...prev, drillId]))
    setActiveDrill(null)
  }

  const handleDayComplete = async () => {
    try {
      await fetch('/api/training/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'day_complete',
          programId,
          dayNumber: day?.dayNumber
        })
      })
      setIsCompleted(true)
      onDayComplete?.()
    } catch (error) {
      console.error('Error completing day:', error)
    }
  }

  const getDrillIcon = (type: string) => {
    switch (type) {
      case 'warmup': return '🏃'
      case 'cooldown': return '🧘'
      default: return '🎾'
    }
  }

  if (!isUnlocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 opacity-60"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center">
            <Lock className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-400">Day {day?.dayNumber}: {day?.title}</h4>
            <p className="text-sm text-slate-500">Complete previous days to unlock</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border transition-all",
        isCompleted
          ? "bg-emerald-500/10 border-emerald-500/30"
          : "bg-slate-800/60 border-slate-700/50 hover:border-cyan-500/30"
      )}
    >
      {/* Day Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-4"
      >
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
          isCompleted
            ? "bg-emerald-500 text-white"
            : "bg-gradient-to-br from-cyan-500 to-emerald-600 text-white"
        )}>
          {isCompleted ? <Check className="w-6 h-6" /> : day?.dayNumber}
        </div>
        
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-white">{day?.title}</h4>
            {isCompleted && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                Completed
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-400">{day?.focus}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-1 text-sm text-slate-400">
              <Clock className="w-4 h-4" />
              {day?.estimatedTime} min
            </div>
            <div className="flex items-center gap-1 text-sm text-cyan-400">
              <Zap className="w-4 h-4" />
              +{day?.xpReward} XP
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Progress Bar */}
              {!isCompleted && (day?.drills?.length ?? 0) > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-white">{completedDrills.size}/{day?.drills?.length ?? 0} drills</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Day Description */}
              <p className="text-slate-300 text-sm">{day?.description}</p>

              {/* Drills List */}
              <div className="space-y-3">
                {day?.drills?.map((drill, index) => {
                  const isDrillCompleted = completedDrills.has(drill?.id)

                  return (
                    <motion.div
                      key={drill?.id || index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "p-4 rounded-lg border transition-all",
                        isDrillCompleted
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : "bg-slate-700/50 border-slate-600/50 hover:border-cyan-500/30"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-lg",
                          isDrillCompleted ? "bg-emerald-500" : "bg-slate-600"
                        )}>
                          {isDrillCompleted ? <Check className="w-5 h-5 text-white" /> : getDrillIcon(drill?.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-white">{drill?.name}</h5>
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                              {drill?.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">{drill?.description}</p>
                          
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {Math.floor((drill?.duration ?? 0) / 60)} min
                            </span>
                            {drill?.reps && (
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {drill.reps} reps
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {drill?.videoUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-600"
                              onClick={() => setShowVideo(drill.videoUrl || null)}
                            >
                              <Video className="w-4 h-4" />
                            </Button>
                          )}
                          {!isDrillCompleted && (
                            <Button
                              size="sm"
                              className="bg-cyan-500 hover:bg-cyan-600"
                              onClick={() => setActiveDrill(drill)}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Start
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Complete Day Button */}
              {allDrillsCompleted && !isCompleted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                    onClick={handleDayComplete}
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    Complete Day {day?.dayNumber} (+{day?.xpReward} XP)
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Drill Modal */}
      <AnimatePresence>
        {activeDrill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setActiveDrill(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <DrillTimer
                drillName={activeDrill?.name ?? ''}
                drillId={activeDrill?.id ?? ''}
                programId={programId}
                dayNumber={day?.dayNumber}
                initialDuration={activeDrill?.duration ?? 300}
                initialReps={activeDrill?.reps}
                showReps={!!activeDrill?.reps}
                onComplete={() => handleDrillComplete(activeDrill?.id ?? '')}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setShowVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-3xl aspect-video bg-black rounded-xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <iframe
                src={showVideo?.replace('watch?v=', 'embed/')}
                className="w-full h-full"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
