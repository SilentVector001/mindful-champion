
"use client"

/**
 * Premium Program Viewer Component
 * 
 * Sophisticated, engaging individual program viewer with AI insights,
 * premium styling, and interactive progress tracking.
 */

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Play,
  CheckCircle,
  Clock,
  Calendar,
  Target,
  Trophy,
  Star,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Brain,
  TrendingUp,
  Award,
  Zap,
  Eye,
  BookOpen,
  Users,
  Flame,
  Crown,
  PauseCircle,
  RotateCcw,
  MessageCircle,
  ArrowLeft,
  Dumbbell,
  Video,
  ListChecks
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import premiumDesign, { 
  premiumAnimations, 
  premiumBackgrounds, 
  getSkillConfig,
  calculateProgress 
} from "@/lib/premium-design-system"
import AIInsightsPanel from "@/components/ai/ai-insights-panel"

interface DayStructure {
  day: number
  title: string
  focus: string
  description?: string
  duration_minutes?: number
  videos?: string[]
  exercises?: string[]
  warmup?: {
    title?: string
    exercises?: string[]
    duration_minutes?: number
  }
  main_drills?: {
    name: string
    description: string
    duration_minutes?: number
    reps_or_sets?: string
    tips?: string[]
  }[]
  practice_goals: string[]
  success_metric?: string
  success_metrics?: string[]
  cooldown?: string[]
  coach_notes?: string
  age_adaptations?: {
    youth?: string
    adult?: string
    senior?: string
  }
  gender_tips?: {
    general?: string
    power_focus?: string
    finesse_focus?: string
  }
  estimated_minutes?: number
  difficulty_level?: number
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
  dailyStructure: DayStructure[]
  category?: string
}

interface UserProgram {
  id: string
  status: string
  startDate?: Date | null
  currentDay: number
  completionPercentage: number
  completedDays?: number[]
  notes?: string
}

interface VideoInfo {
  id: string
  videoId: string
  title: string
  duration: string
  thumbnailUrl?: string | null
  watched?: boolean
  difficulty?: number
}

interface PremiumProgramViewerProps {
  program: TrainingProgram
  userProgram?: UserProgram
  videos: VideoInfo[]
  user: any
  onStartProgram: () => void
  onVideoClick: (videoId: string) => void
  onMarkDayComplete: (day: number) => void
  onPauseProgram: () => void
  onResumeProgram: () => void
  onUpdateNotes?: (notes: string) => void
}

export default function PremiumProgramViewer({
  program,
  userProgram,
  videos,
  user,
  onStartProgram,
  onVideoClick,
  onMarkDayComplete,
  onPauseProgram,
  onResumeProgram,
  onUpdateNotes
}: PremiumProgramViewerProps) {
  const router = useRouter()
  const [selectedDay, setSelectedDay] = useState((userProgram?.currentDay ?? 1) || 1)
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState(userProgram?.notes || "")
  const [aiCoaching, setAICoaching] = useState<any>(null)
  const [loadingAI, setLoadingAI] = useState(false)

  // Ensure dailyStructure is always an array
  // Handle multiple possible formats
  const dailySchedule: DayStructure[] = (() => {
    try {
      const structure = program.dailyStructure
      
      // If it's already an array, use it
      if (Array.isArray(structure)) {
        console.log(`✅ Parsed ${structure.length} days from array format`)
        return structure as DayStructure[]
      }
      
      // If it's an object with a 'days' property
      if (structure && typeof structure === 'object') {
        if ('days' in structure && Array.isArray((structure as any).days)) {
          const daysData = (structure as any).days
          console.log(`✅ Parsed ${daysData.length} days from object.days format`)
          return daysData as DayStructure[]
        }
        
        // If it's an object with numeric keys, convert to array
        const keys = Object.keys(structure)
        if (keys.length > 0) {
          // Check if keys look like day numbers
          const dayNumbers = keys.map(k => parseInt(k)).filter(n => !isNaN(n))
          if (dayNumbers.length > 0) {
            const sorted = dayNumbers.sort((a, b) => a - b)
            const daysArray = sorted.map(day => (structure as any)[day.toString()])
            console.log(`✅ Parsed ${daysArray.length} days from object with numeric keys`)
            return daysArray as DayStructure[]
          }
        }
      }
      
      // If it's a string (JSON), parse it
      if (typeof structure === 'string') {
        const parsed = JSON.parse(structure)
        if (Array.isArray(parsed)) {
          console.log(`✅ Parsed ${parsed.length} days from JSON string (array)`)
          return parsed as DayStructure[]
        }
        if (parsed.days && Array.isArray(parsed.days)) {
          console.log(`✅ Parsed ${parsed.days.length} days from JSON string (object.days)`)
          return parsed.days as DayStructure[]
        }
      }
      
      console.error('❌ Unable to parse dailyStructure:', {
        type: typeof structure,
        isArray: Array.isArray(structure),
        keys: structure && typeof structure === 'object' ? Object.keys(structure) : 'N/A',
        sample: JSON.stringify(structure).substring(0, 200)
      })
      return []
    } catch (error) {
      console.error('❌ Error parsing dailySchedule:', error)
      console.error('Program data:', program.id, program.name)
      return []
    }
  })()

  // Debug logging
  useEffect(() => {
    if (dailySchedule.length === 0) {
      console.error('Premium Program Viewer: No daily schedule data available')
      console.error('Program data:', {
        id: program.id,
        name: program.name,
        dailyStructureType: typeof program.dailyStructure,
        isArray: Array.isArray(program.dailyStructure),
        hasDatesProp: program.dailyStructure && typeof program.dailyStructure === 'object' && 'days' in program.dailyStructure,
        value: JSON.stringify(program.dailyStructure).substring(0, 200)
      })
    } else {
      console.log(`Premium Program Viewer: Loaded program "${program.name}" with ${dailySchedule.length} days`)
    }
  }, [])

  const skillConfig = getSkillConfig(program.skillLevel)
  const IconComponent = skillConfig.icon

  useEffect(() => {
    if (userProgram && selectedDay === userProgram.currentDay) {
      generateAICoaching()
    }
  }, [selectedDay, userProgram])

  const generateAICoaching = async () => {
    if (!userProgram || selectedDay !== userProgram.currentDay) return
    
    setLoadingAI(true)
    try {
      const response = await fetch('/api/ai-coach/daily-coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: program.programId,
          currentDay: selectedDay,
          userProgress: userProgram,
          skillLevel: program.skillLevel,
          focusArea: getCurrentDayData()?.focus
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAICoaching(data.coaching)
      }
    } catch (error) {
      console.error('Error generating AI coaching:', error)
    } finally {
      setLoadingAI(false)
    }
  }

  const isDayCompleted = (dayNumber: number) => {
    return userProgram?.completedDays?.includes(dayNumber) || 
           (userProgram && dayNumber < userProgram.currentDay)
  }

  const isDayAvailable = (dayNumber: number) => {
    if (!userProgram) return dayNumber === 1
    return dayNumber <= userProgram.currentDay
  }

  const getCurrentDayData = () => {
    return dailySchedule.find((day: any) => day.day === selectedDay)
  }

  const selectedDayData = getCurrentDayData()

  const handleSaveNotes = () => {
    if (onUpdateNotes) {
      onUpdateNotes(notes)
      toast.success('Notes saved!')
    }
    setShowNotes(false)
  }

  // Create video lookup map
  const videoMap = videos.reduce((map, video) => {
    map[video.videoId] = video
    return map
  }, {} as Record<string, VideoInfo>)

  const getProgressStats = () => {
    const completedDays = userProgram?.completedDays?.length || (userProgram?.currentDay ? userProgram.currentDay - 1 : 0) || 0
    const totalDays = program.durationDays
    const progressPercent = calculateProgress(completedDays, totalDays)
    const estimatedCompletion = userProgram?.startDate 
      ? new Date(new Date(userProgram.startDate).getTime() + (totalDays * 24 * 60 * 60 * 1000))
      : null

    return {
      completedDays,
      totalDays,
      progressPercent,
      estimatedCompletion,
      daysRemaining: totalDays - completedDays
    }
  }

  const stats = getProgressStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Premium Hero Header */}
      <motion.div 
        className="relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(45, 80, 22, 0.9)), url(${premiumBackgrounds.journey})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        {...premiumAnimations.heroReveal}
      >
        <div className={premiumDesign.spacing.container}>
          <div className="py-12 md:py-16">
            {/* Back Button */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Button
                variant="ghost"
                onClick={() => router.push('/train')}
                className="text-white hover:bg-white/10 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Programs
              </Button>
            </motion.div>

            <div className="max-w-4xl mx-auto text-center text-white">
              {/* Program Icon and Title */}
              <motion.div
                className="flex items-center justify-center gap-6 mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className={cn(
                  "w-20 h-20 rounded-3xl bg-gradient-to-br flex items-center justify-center shadow-2xl",
                  skillConfig.gradient
                )}>
                  <IconComponent className="w-10 h-10 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-5xl font-bold mb-2">{program.name}</h1>
                  {program.tagline && (
                    <p className="text-xl text-emerald-400 font-medium">{program.tagline}</p>
                  )}
                </div>
              </motion.div>

              {/* Program Meta */}
              <motion.div
                className="flex items-center justify-center gap-8 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-white shadow-lg", skillConfig.badge)}>
                    {skillConfig.name}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-5 h-5" />
                  <span>{program.durationDays} days</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-5 h-5" />
                  <span>{program.estimatedTimePerDay || '30min'}/day</span>
                </div>
                {userProgram && (
                  <Badge className={cn(
                    "text-white shadow-lg",
                    userProgram.status === 'IN_PROGRESS' ? "bg-blue-500" :
                    userProgram.status === 'COMPLETED' ? "bg-green-500" :
                    userProgram.status === 'PAUSED' ? "bg-yellow-500" : "bg-gray-500"
                  )}>
                    {userProgram.status.replace('_', ' ')}
                  </Badge>
                )}
              </motion.div>

              {/* Progress Bar */}
              {userProgram && (
                <motion.div
                  className="max-w-2xl mx-auto mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-200">Progress</span>
                      <span className="text-2xl font-bold text-white">
                        {stats.progressPercent}%
                      </span>
                    </div>
                    <Progress value={stats.progressPercent} className="h-3 mb-4" />
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-emerald-400">
                          {stats.completedDays}
                        </div>
                        <div className="text-xs text-gray-300">Completed</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-blue-400">
                          {userProgram.currentDay}
                        </div>
                        <div className="text-xs text-gray-300">Current Day</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-yellow-400">
                          {stats.daysRemaining}
                        </div>
                        <div className="text-xs text-gray-300">Remaining</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                className="flex justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {!userProgram ? (
                  <Button 
                    onClick={onStartProgram}
                    className={cn(
                      "px-10 py-4 text-lg font-semibold bg-gradient-to-r",
                      skillConfig.gradient,
                      "hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    )}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Begin Your Journey
                  </Button>
                ) : (
                  <div className="flex gap-4">
                    {userProgram.status === 'PAUSED' ? (
                      <Button 
                        onClick={onResumeProgram}
                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Resume Program
                      </Button>
                    ) : (
                      <>
                        <Button 
                          onClick={() => {
                            if (selectedDayData?.videos?.[0]) {
                              onVideoClick(selectedDayData.videos[0])
                            }
                          }}
                          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-xl"
                          disabled={!isDayAvailable(selectedDay)}
                        >
                          <Play className="w-5 h-5 mr-2" />
                          {selectedDay === userProgram.currentDay ? 'Continue Today' : `Start Day ${selectedDay}`}
                        </Button>
                        
                        <Button 
                          onClick={onPauseProgram}
                          variant="outline"
                          className="px-6 py-3 border-white/30 text-white hover:bg-white/10"
                        >
                          <PauseCircle className="w-5 h-5 mr-2" />
                          Pause Program
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={premiumDesign.spacing.container}>
        <div className="-mt-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Day Navigation Sidebar */}
            <motion.div
              className="lg:col-span-1"
              {...premiumAnimations.cardReveal}
              transition={{ delay: 0.2 }}
            >
              <Card className={cn(premiumDesign.components.cards.premium, "sticky top-8")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Program Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {dailySchedule.length > 0 ? (
                      dailySchedule.map((day: DayStructure) => (
                        <motion.button
                        key={day.day}
                        onClick={() => setSelectedDay(day.day)}
                        className={cn(
                          "w-full p-4 rounded-xl text-left transition-all duration-300 group",
                          selectedDay === day.day
                            ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg"
                            : "bg-gray-50 hover:bg-gray-100",
                          !isDayAvailable(day.day) && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={!isDayAvailable(day.day)}
                        whileHover={{ scale: isDayAvailable(day.day) ? 1.02 : 1 }}
                        whileTap={{ scale: isDayAvailable(day.day) ? 0.98 : 1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold">Day {day.day}</span>
                          <div className="flex items-center gap-1">
                            {isDayCompleted(day.day) && (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            )}
                            {day.difficulty_level && (
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i}
                                    className={cn(
                                      "w-3 h-3",
                                      i < (day.difficulty_level || 0)
                                        ? "text-yellow-400 fill-current" 
                                        : "text-gray-300"
                                    )}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm opacity-90 line-clamp-2 mb-1">
                          {day.title}
                        </p>
                        <div className="flex items-center gap-3 text-xs opacity-75">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{day.estimated_minutes || 30}min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            <span>{day.focus}</span>
                          </div>
                        </div>
                      </motion.button>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No schedule data available</p>
                        <p className="text-xs mt-1">Please refresh the page</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Day Detail Content */}
            <div className="lg:col-span-2 space-y-8">
              {selectedDayData && (
                <motion.div
                  key={selectedDay}
                  {...premiumAnimations.cardReveal}
                  transition={{ delay: 0.3 }}
                >
                  <Card className={premiumDesign.components.cards.featured}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{selectedDayData.day}</span>
                            </div>
                            <CardTitle className="text-2xl">
                              {selectedDayData.title}
                            </CardTitle>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            <Target className="w-3 h-3 mr-1" />
                            Focus: {selectedDayData.focus}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isDayCompleted(selectedDayData.day) && (
                            <Badge className="bg-emerald-100 text-emerald-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                          {selectedDay > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedDay(selectedDay - 1)}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                          )}
                          {selectedDay < program.durationDays && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedDay(selectedDay + 1)}
                              disabled={!isDayAvailable(selectedDay + 1)}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-8">
                      {/* AI Daily Coaching */}
                      {userProgram && selectedDay === userProgram.currentDay && (
                        <motion.div
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                              <Brain className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">AI Daily Coaching</h4>
                              <p className="text-sm text-gray-600">Personalized guidance from Coach Kai</p>
                            </div>
                          </div>
                          
                          {loadingAI ? (
                            <div className="flex items-center gap-3 py-4">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
                              <span className="text-gray-600">Coach Kai is analyzing your progress...</span>
                            </div>
                          ) : aiCoaching ? (
                            <div className="space-y-3">
                              <p className="text-gray-700 leading-relaxed">{aiCoaching.message}</p>
                              {aiCoaching.tips && (
                                <div className="space-y-2">
                                  <h5 className="font-medium text-gray-900">Today's Pro Tips:</h5>
                                  <ul className="space-y-1">
                                    {aiCoaching.tips.map((tip: string, index: number) => (
                                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                        <Sparkles className="w-3 h-3 text-blue-500 mt-1 flex-shrink-0" />
                                        {tip}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={generateAICoaching}
                              className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            >
                              <Brain className="w-4 h-4 mr-2" />
                              Get AI Coaching for Today
                            </Button>
                          )}
                        </motion.div>
                      )}

                      {/* Day Description */}
                      {selectedDayData.description && (
                        <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 rounded-2xl border border-gray-200">
                          <p className="text-gray-700 text-lg leading-relaxed">{selectedDayData.description}</p>
                        </div>
                      )}

                      {/* Warm-Up Section */}
                      {selectedDayData.warmup && (
                        <div>
                          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Flame className="w-5 h-5 text-orange-500" />
                            {selectedDayData.warmup.title || 'Warm-Up'} ({selectedDayData.warmup.duration_minutes || 5} min)
                          </h3>
                          <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-200">
                            <div className="space-y-2">
                              {(selectedDayData.warmup.exercises || []).map((exercise: string, index: number) => (
                                <motion.div
                                  key={index}
                                  className="flex items-center gap-3"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                >
                                  <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {index + 1}
                                  </div>
                                  <span className="text-gray-700">{exercise}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Main Drills Section */}
                      {selectedDayData.main_drills && selectedDayData.main_drills.length > 0 && (
                        <div>
                          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Dumbbell className="w-5 h-5 text-purple-500" />
                            Today's Training Drills
                          </h3>
                          <div className="space-y-4">
                            {selectedDayData.main_drills.map((drill: any, index: number) => (
                              <motion.div
                                key={index}
                                className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 overflow-hidden"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <div className="p-6">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center font-bold">
                                        {index + 1}
                                      </div>
                                      <div>
                                        <h4 className="text-lg font-bold text-gray-900">{drill.name}</h4>
                                        {drill.duration_minutes && (
                                          <span className="text-sm text-purple-600 font-medium">{drill.duration_minutes} minutes</span>
                                        )}
                                      </div>
                                    </div>
                                    {drill.reps_or_sets && (
                                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                        {drill.reps_or_sets}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-gray-700 mb-4">{drill.description}</p>
                                  {drill.tips && drill.tips.length > 0 && (
                                    <div className="bg-white/50 rounded-xl p-4">
                                      <h5 className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        Pro Tips
                                      </h5>
                                      <ul className="space-y-1">
                                        {drill.tips.map((tip: string, tipIndex: number) => (
                                          <li key={tipIndex} className="flex items-start gap-2 text-sm text-gray-600">
                                            <ChevronRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                                            {tip}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                          
                          <div className="mt-4 p-4 bg-purple-100 rounded-xl">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-purple-900 font-semibold">Total Session Time:</span>
                              <span className="text-purple-700 font-bold text-lg">
                                {selectedDayData.duration_minutes || 40} minutes
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Legacy Exercises Support */}
                      {selectedDayData.exercises && selectedDayData.exercises.length > 0 && !selectedDayData.main_drills && (
                        <div>
                          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Dumbbell className="w-5 h-5 text-purple-500" />
                            Today's Workout Breakdown
                          </h3>
                          <div className="space-y-3">
                            {selectedDayData.exercises.map((exercise: string, index: number) => (
                              <motion.div
                                key={index}
                                className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0 mt-1">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="text-gray-800 font-medium leading-relaxed">
                                    {exercise}
                                  </p>
                                </div>
                                <Clock className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                              </motion.div>
                            ))}
                          </div>
                          
                          <div className="mt-4 p-4 bg-purple-100 rounded-xl">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-purple-900 font-semibold">Total Time:</span>
                              <span className="text-purple-700 font-bold text-lg">
                                {selectedDayData.duration_minutes || selectedDayData.estimated_minutes || 40} minutes
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Training Videos */}
                      <div>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <Video className="w-5 h-5 text-emerald-500" />
                          Training Videos
                        </h3>
                        <div className="space-y-3">
                          {selectedDayData.videos?.map((videoId: string, index: number) => {
                            const videoInfo = videoMap[videoId]
                            if (!videoInfo) return null

                            return (
                              <motion.div
                                key={videoId}
                                className="group cursor-pointer"
                                onClick={() => onVideoClick(videoId)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Card className="overflow-hidden border-2 border-transparent group-hover:border-emerald-200 group-hover:shadow-lg transition-all duration-300">
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                      <div className="w-20 h-14 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                                        {videoInfo.thumbnailUrl ? (
                                          <Image
                                            src={videoInfo.thumbnailUrl}
                                            alt={videoInfo.title}
                                            fill
                                            className="object-cover"
                                          />
                                        ) : (
                                          <Play className="w-6 h-6 text-gray-400" />
                                        )}
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
                                        <Play className="absolute w-6 h-6 text-white opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
                                          {videoInfo.title}
                                        </h4>
                                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                          <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{videoInfo.duration}</span>
                                          </div>
                                          {videoInfo.watched && (
                                            <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                                              <CheckCircle className="w-3 h-3 mr-1" />
                                              Watched
                                            </Badge>
                                          )}
                                          {videoInfo.difficulty && (
                                            <div className="flex">
                                              {Array.from({ length: 3 }).map((_, i) => (
                                                <Star 
                                                  key={i}
                                                  className={cn(
                                                    "w-3 h-3",
                                                    i < (videoInfo.difficulty || 0)
                                                      ? "text-yellow-400 fill-current" 
                                                      : "text-gray-300"
                                                  )}
                                                />
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all duration-300" />
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Practice Goals */}
                      <div>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <ListChecks className="w-5 h-5 text-blue-500" />
                          Practice Goals ({selectedDayData.practice_goals?.length || 0})
                        </h3>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                          <div className="space-y-3">
                            {selectedDayData.practice_goals?.map((goal: string, index: number) => (
                              <motion.div 
                                key={index} 
                                className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <Checkbox 
                                  id={`goal-${index}`}
                                  className="mt-1"
                                  disabled={!isDayAvailable(selectedDayData.day)}
                                />
                                <label 
                                  htmlFor={`goal-${index}`} 
                                  className="text-gray-800 cursor-pointer leading-relaxed flex-1 font-medium"
                                >
                                  {goal}
                                </label>
                                <Target className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Equipment Needed */}
                      <div>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <Dumbbell className="w-5 h-5 text-orange-500" />
                          Equipment Needed
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200 text-center">
                            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-500 flex items-center justify-center">
                              <span className="text-2xl">🏓</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-800">Paddle</p>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200 text-center">
                            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-500 flex items-center justify-center">
                              <span className="text-2xl">🏓</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-800">Pickleballs (6-12)</p>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200 text-center">
                            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-500 flex items-center justify-center">
                              <span className="text-2xl">🎯</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-800">Target Cones</p>
                          </div>
                        </div>
                      </div>

                      {/* Success Metrics */}
                      {(selectedDayData.success_metrics || selectedDayData.success_metric) && (
                        <div>
                          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Success Metrics
                          </h3>
                          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-2xl border-2 border-yellow-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300 opacity-10 rounded-full -mr-16 -mt-16" />
                            <div className="relative">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 flex-shrink-0 rounded-full bg-yellow-500 flex items-center justify-center">
                                  <Trophy className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900">Today's Success Criteria</h4>
                                  <p className="text-sm text-gray-600">Complete these to unlock Day {selectedDayData.day + 1}!</p>
                                </div>
                              </div>
                              
                              {Array.isArray(selectedDayData.success_metrics) ? (
                                <div className="space-y-2">
                                  {selectedDayData.success_metrics.map((metric: string, index: number) => (
                                    <div key={index} className="flex items-start gap-3 bg-white/50 p-3 rounded-xl">
                                      <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-800 font-medium">{metric}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-900 leading-relaxed font-semibold text-lg">
                                  {selectedDayData.success_metric}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Coach's Notes */}
                      {selectedDayData.coach_notes && (
                        <div>
                          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-emerald-500" />
                            Coach Kai's Insight
                          </h3>
                          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                <Brain className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-800 leading-relaxed text-lg italic">
                                  "{selectedDayData.coach_notes}"
                                </p>
                                <p className="text-emerald-600 font-semibold mt-2">— Coach Kai</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cooldown Section */}
                      {selectedDayData.cooldown && selectedDayData.cooldown.length > 0 && (
                        <div>
                          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <RotateCcw className="w-5 h-5 text-blue-500" />
                            Cool Down
                          </h3>
                          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
                            <div className="flex flex-wrap gap-3">
                              {selectedDayData.cooldown.map((item: string, index: number) => (
                                <div key={index} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-blue-200">
                                  <CheckCircle className="w-4 h-4 text-blue-500" />
                                  <span className="text-gray-700 text-sm">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Age Group Adaptations */}
                      {selectedDayData.age_adaptations && (
                        <div>
                          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" />
                            Personalized for Your Age Group
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {selectedDayData.age_adaptations.youth && (
                              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="font-bold text-green-800">Youth (Under 18)</span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">{selectedDayData.age_adaptations.youth}</p>
                              </div>
                            )}
                            {selectedDayData.age_adaptations.adult && (
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                    <Target className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="font-bold text-blue-800">Adult (18-50)</span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">{selectedDayData.age_adaptations.adult}</p>
                              </div>
                            )}
                            {selectedDayData.age_adaptations.senior && (
                              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-5 rounded-2xl border border-purple-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                                    <Crown className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="font-bold text-purple-800">Senior (50+)</span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">{selectedDayData.age_adaptations.senior}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Gender Tips */}
                      {selectedDayData.gender_tips && selectedDayData.gender_tips.general && (
                        <div>
                          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-pink-500" />
                            Training Tips
                          </h3>
                          <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-2xl border border-pink-200">
                            <p className="text-gray-700 leading-relaxed">{selectedDayData.gender_tips.general}</p>
                            {(selectedDayData.gender_tips.power_focus || selectedDayData.gender_tips.finesse_focus) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {selectedDayData.gender_tips.power_focus && (
                                  <div className="bg-white/50 p-4 rounded-xl">
                                    <span className="font-semibold text-red-700 flex items-center gap-2">
                                      <Flame className="w-4 h-4" />
                                      Power Players:
                                    </span>
                                    <p className="text-sm text-gray-600 mt-1">{selectedDayData.gender_tips.power_focus}</p>
                                  </div>
                                )}
                                {selectedDayData.gender_tips.finesse_focus && (
                                  <div className="bg-white/50 p-4 rounded-xl">
                                    <span className="font-semibold text-blue-700 flex items-center gap-2">
                                      <Eye className="w-4 h-4" />
                                      Finesse Players:
                                    </span>
                                    <p className="text-sm text-gray-600 mt-1">{selectedDayData.gender_tips.finesse_focus}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Day Navigation & Actions */}
                      <div className="border-t pt-8 mt-8">
                        {/* Day Navigation */}
                        <div className="flex items-center justify-between mb-6">
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setSelectedDay(selectedDay - 1)}
                            disabled={selectedDay <= 1}
                            className="flex-1 max-w-xs"
                          >
                            <ChevronLeft className="w-5 h-5 mr-2" />
                            Previous Day
                          </Button>
                          
                          <div className="px-6 text-center">
                            <div className="text-sm text-gray-600 mb-1">Current Day</div>
                            <div className="text-3xl font-bold text-gray-900">
                              {selectedDayData.day} / {program.durationDays}
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setSelectedDay(selectedDay + 1)}
                            disabled={selectedDay >= program.durationDays || !isDayAvailable(selectedDay + 1)}
                            className="flex-1 max-w-xs"
                          >
                            Next Day
                            <ChevronRight className="w-5 h-5 ml-2" />
                          </Button>
                        </div>

                        {/* Action Buttons */}
                        {userProgram && isDayAvailable(selectedDayData.day) && !isDayCompleted(selectedDayData.day) && (
                          <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button
                              onClick={() => onMarkDayComplete(selectedDayData.day)}
                              size="lg"
                              className={cn(
                                "px-10 py-6 text-lg bg-gradient-to-r",
                                skillConfig.gradient,
                                "hover:shadow-xl hover:scale-105 transition-all duration-300"
                              )}
                            >
                              <CheckCircle className="w-6 h-6 mr-3" />
                              Complete Day {selectedDayData.day}
                            </Button>
                            
                            <Dialog open={showNotes} onOpenChange={setShowNotes}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="lg" className="px-8 py-6">
                                  <MessageCircle className="w-5 h-5 mr-2" />
                                  Add Notes
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Day {selectedDayData.day} Notes</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Textarea
                                    placeholder="How did today's training go? Any insights or challenges?"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={4}
                                  />
                                  <div className="flex gap-2">
                                    <Button onClick={handleSaveNotes} className="flex-1">
                                      Save Notes
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowNotes(false)}>
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}

                        {/* Completed Badge */}
                        {isDayCompleted(selectedDayData.day) && (
                          <motion.div
                            className="mt-4 p-6 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl text-center text-white"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                          >
                            <CheckCircle className="w-12 h-12 mx-auto mb-3" />
                            <h4 className="text-xl font-bold mb-2">Day {selectedDayData.day} Complete! 🎉</h4>
                            <p className="text-emerald-100">
                              Great work, champion! Keep up the momentum.
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              {/* No Data Message */}
              {!selectedDayData && dailySchedule.length === 0 && (
                <Card className="p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      Program Schedule Loading
                    </h3>
                    <p className="text-gray-600 mb-4">
                      We're having trouble loading the program schedule. This might be a temporary issue.
                    </p>
                    <Button 
                      onClick={() => router.refresh()}
                      variant="outline"
                      className="mt-4"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Refresh Page
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* AI Insights Sidebar */}
            <motion.div
              className="lg:col-span-1"
              {...premiumAnimations.cardReveal}
              transition={{ delay: 0.4 }}
            >
              <AIInsightsPanel
                userId={user?.id}
                context="program"
                userProgress={userProgram}
                className="sticky top-8"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
