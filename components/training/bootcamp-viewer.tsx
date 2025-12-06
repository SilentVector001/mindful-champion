'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import {
  CheckCircle2,
  PlayCircle,
  Calendar,
  Clock,
  Target,
  ChevronLeft,
  Trophy,
  Flame,
  Heart,
  Zap,
  Star,
  Award,
  TrendingUp,
  Users,
  Brain,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { beginnerBootcampDays, type BootcampDay } from '@/lib/bootcamp-content'
import { motion, AnimatePresence } from 'framer-motion'

interface BootcampViewerProps {
  program: any
  userProgram: any
  userId: string
}

export default function BootcampViewer({ program, userProgram, userId }: BootcampViewerProps) {
  const router = useRouter()
  const [selectedDay, setSelectedDay] = useState(userProgram?.currentDay || 1)
  const [expandedDrill, setExpandedDrill] = useState<number | null>(0)
  const [completedChecklist, setCompletedChecklist] = useState<Record<number, boolean>>({})

  const currentDayData = beginnerBootcampDays[selectedDay - 1]
  const completedDays = selectedDay - 1
  const progressPercentage = (completedDays / 14) * 100

  const getYouTubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?rel=0`
  }

  const handleChecklistToggle = (index: number) => {
    setCompletedChecklist(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const markDayComplete = async () => {
    try {
      toast.success(`Day ${selectedDay} completed! 🎉 Amazing work, Champion!`)
      
      // Move to next day if not at the end
      if (selectedDay < 14) {
        setTimeout(() => setSelectedDay(selectedDay + 1), 1000)
      }
      
      router.refresh()
    } catch (error) {
      console.error('Error marking day complete:', error)
      toast.error('Failed to update progress')
    }
  }

  if (!currentDayData) {
    return <div>Loading bootcamp data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        onClick={() => router.push('/train')}
        variant="ghost"
        className="mb-4"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Programs
      </Button>

      {/* Bootcamp Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-2xl p-8 shadow-2xl"
      >
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">2-Week Beginner Bootcamp</h1>
              <p className="text-xl text-emerald-100 italic">Build a rock-solid foundation in just 14 days</p>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <Flame className="h-6 w-6 mb-2 text-orange-300" />
              <div className="text-3xl font-bold">{completedDays}</div>
              <div className="text-sm text-emerald-100">Days Completed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <Target className="h-6 w-6 mb-2 text-yellow-300" />
              <div className="text-3xl font-bold">{14 - completedDays}</div>
              <div className="text-sm text-emerald-100">Days Remaining</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <TrendingUp className="h-6 w-6 mb-2 text-blue-300" />
              <div className="text-3xl font-bold">{Math.round(progressPercentage)}%</div>
              <div className="text-sm text-emerald-100">Progress</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <Sparkles className="h-6 w-6 mb-2 text-purple-300" />
              <div className="text-3xl font-bold">Day {selectedDay}</div>
              <div className="text-sm text-emerald-100">Current Day</div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">Bootcamp Progress</span>
              <span>Day {selectedDay} of 14</span>
            </div>
            <Progress value={progressPercentage} className="h-3 bg-white/20" />
          </div>
        </div>
      </motion.div>

      {/* Day Selector Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Select Your Training Day
          </CardTitle>
          <CardDescription>
            Click on any day to view the training. Complete them in order for best results!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-3">
            {beginnerBootcampDays.map((day) => {
              const isCompleted = day.day < selectedDay
              const isCurrent = day.day === selectedDay
              const isLocked = day.day > selectedDay

              return (
                <motion.button
                  key={day.day}
                  whileHover={{ scale: isLocked ? 1 : 1.05 }}
                  whileTap={{ scale: isLocked ? 1 : 0.95 }}
                  onClick={() => !isLocked && setSelectedDay(day.day)}
                  disabled={isLocked}
                  className={`
                    aspect-square rounded-xl p-2 flex flex-col items-center justify-center gap-1 text-sm font-semibold transition-all
                    ${isCurrent ? 'bg-emerald-600 text-white shadow-lg ring-4 ring-emerald-200' : ''}
                    ${isCompleted ? 'bg-green-100 text-green-800 border-2 border-green-300' : ''}
                    ${isLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50' : ''}
                    ${!isCurrent && !isCompleted && !isLocked ? 'bg-white border-2 border-gray-200 hover:border-emerald-300' : ''}
                  `}
                >
                  {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  {isCurrent && <Zap className="w-4 h-4" />}
                  <span>Day {day.day}</span>
                </motion.button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Day Content */}
      <motion.div
        key={selectedDay}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Day Header */}
        <Card className="border-l-4 border-l-emerald-600 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-emerald-600 text-white">
                    Day {currentDayData.day}
                  </Badge>
                  <Badge variant="outline" className="text-emerald-700 border-emerald-300">
                    Week {currentDayData.day <= 7 ? '1' : '2'}
                  </Badge>
                </div>
                <CardTitle className="text-3xl mb-2">{currentDayData.title}</CardTitle>
                <CardDescription className="text-lg font-medium text-emerald-700">
                  {currentDayData.subtitle}
                </CardDescription>
              </div>
              <Star className="w-12 h-12 text-amber-400 fill-amber-400" />
            </div>
          </CardHeader>
        </Card>

        {/* Coach's Pep Talk */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              Coach Kai's Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed text-gray-800 italic">
              "{currentDayData.coachMessage}"
            </p>
          </CardContent>
        </Card>

        {/* Your Mission Today */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Target className="w-6 h-6 text-amber-600" />
              Your Mission Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {currentDayData.objectives.map((objective, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm font-bold mt-0.5 shrink-0">
                    {idx + 1}
                  </div>
                  <span className="text-gray-800 font-medium">{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Warmup */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Flame className="w-6 h-6 text-orange-500" />
              Warmup ({currentDayData.warmup.duration})
            </CardTitle>
            <CardDescription>Get your body ready for training!</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentDayData.warmup.instructions.map((instruction, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
                  <span className="text-gray-800">{instruction}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Main Training Drills */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <PlayCircle className="w-7 h-7 text-emerald-600" />
            Main Training
          </h2>
          
          {currentDayData.drills.map((drill, drillIdx) => (
            <Card key={drillIdx} className="overflow-hidden shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 cursor-pointer"
                         onClick={() => setExpandedDrill(expandedDrill === drillIdx ? null : drillIdx)}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-emerald-900">
                      Drill {drillIdx + 1}: {drill.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {drill.duration}
                      </span>
                      <Badge variant="outline">Video Included</Badge>
                    </CardDescription>
                  </div>
                  {expandedDrill === drillIdx ? (
                    <ChevronUp className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-emerald-600" />
                  )}
                </div>
              </CardHeader>
              
              <AnimatePresence>
                {expandedDrill === drillIdx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="pt-6 space-y-6">
                      {/* Embedded YouTube Video */}
                      <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-xl">
                        <iframe
                          src={getYouTubeEmbedUrl(drill.videoId)}
                          title={drill.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>

                      {/* Instructions */}
                      <div>
                        <h4 className="font-semibold text-lg mb-3 text-gray-900">📋 Follow These Steps:</h4>
                        <ol className="space-y-3">
                          {drill.instructions.map((instruction, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold mt-0.5 shrink-0">
                                {idx + 1}
                              </div>
                              <span className="text-gray-700">{instruction}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Pro Tip */}
                      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-l-amber-500 p-4 rounded-r-lg">
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <h5 className="font-semibold text-amber-900 mb-1">💡 Pro Tip</h5>
                            <p className="text-amber-800">{drill.proTip}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>

        {/* Practice Checklist */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              Practice Checklist
            </CardTitle>
            <CardDescription>
              Check off each task as you complete it. You got this! 💪
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentDayData.practiceChecklist.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <Checkbox
                    id={`checklist-${idx}`}
                    checked={completedChecklist[idx]}
                    onCheckedChange={() => handleChecklistToggle(idx)}
                    className="mt-1"
                  />
                  <label
                    htmlFor={`checklist-${idx}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium text-gray-900">{item.task}</div>
                    {item.reps && (
                      <div className="text-sm text-gray-600 mt-1">
                        Target: {item.reps} reps
                      </div>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cool Down & Reflect */}
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <Brain className="w-6 h-6 text-indigo-600" />
              Cool Down & Reflect
            </CardTitle>
            <CardDescription>Take a moment to reflect on today's training</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-indigo-900 mb-3">🤔 Think About:</h4>
              <ul className="space-y-2">
                {currentDayData.cooldown.reflection.map((question, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <ChevronRight className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                    <span className="text-gray-700 italic">{question}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Key Takeaway
              </h4>
              <p className="text-gray-800 font-medium italic">
                "{currentDayData.cooldown.keyTakeaway}"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tomorrow's Preview */}
        {selectedDay < 14 && (
          <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-900">
                <Sparkles className="w-6 h-6 text-cyan-600" />
                Coming Up Tomorrow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-800 italic">
                {currentDayData.tomorrowPreview}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Complete Day Button */}
        <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-300" />
            <h3 className="text-2xl font-bold mb-2">Ready to Complete Day {selectedDay}?</h3>
            <p className="text-emerald-100 mb-6">
              Great work today, Champion! Mark this day complete and move on to the next challenge.
            </p>
            <Button
              onClick={markDayComplete}
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-8 py-4 text-lg"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Complete Day {selectedDay}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
