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
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Brain,
  Dumbbell
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import EnhancedVideoPlayer from '@/components/train/enhanced-video-player'

interface UniversalProgramViewerProps {
  program: any
  userProgram: any
  userId: string
}

export default function UniversalProgramViewer({ program, userProgram, userId }: UniversalProgramViewerProps) {
  const router = useRouter()
  const [selectedDay, setSelectedDay] = useState(userProgram?.currentDay || 1)
  const [expandedVideo, setExpandedVideo] = useState<number | null>(0)
  const [completedChecklist, setCompletedChecklist] = useState<Record<number, boolean>>({})

  // Group videos by day
  const videosByDay: Record<number, any[]> = {}
  program.videos.forEach((video: any) => {
    if (!videosByDay[video.day]) {
      videosByDay[video.day] = []
    }
    videosByDay[video.day].push(video)
  })

  const totalDays = program.durationDays
  const completedDays = (userProgram?.currentDay || 1) - 1
  const progressPercentage = (completedDays / totalDays) * 100
  const currentDayVideos = videosByDay[selectedDay] || []

  const getYouTubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?rel=0`
  }

  const extractVideoId = (url: string) => {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return match ? match[1] : url
  }

  const handleChecklistToggle = (index: number) => {
    setCompletedChecklist(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const getCoachMessage = (day: number, programName: string) => {
    const messages = [
      `Welcome to ${programName}! Today's training is designed to build your foundation. Remember, every champion started exactly where you are now. Let's make today count! 💪`,
      `Great job showing up for Day ${day}! Consistency is what separates good players from great ones. Focus on technique over power today.`,
      `You're building momentum, Champion! Day ${day} is all about refining those skills. Trust the process and stay present with each drill.`,
      `Halfway through the week already! Your dedication is inspiring. Today we're taking your skills to the next level. Ready? Let's go! 🚀`,
      `Look at you, crushing Day ${day}! Your improvement is real, even if you can't see it yet. Focus on the small wins today.`,
      `Weekend warrior mode activated! Day ${day} is your chance to put everything together. Remember: quality reps over quantity.`,
      `Fantastic work reaching Day ${day}! Every drill you complete is another brick in your championship foundation. Keep building! 🏆`,
    ]
    return messages[(day - 1) % messages.length]
  }

  const getDailyObjectives = (videos: any[], day: number) => {
    return [
      `Watch and practice all ${videos.length} training ${videos.length === 1 ? 'video' : 'videos'} for today`,
      `Focus on proper technique and form throughout each drill`,
      `Complete the practice checklist before moving to the next day`,
      `Reflect on your progress and identify areas for improvement`
    ]
  }

  const getPracticeChecklist = (videos: any[]) => {
    const checklist = [
      { task: 'Complete 5-minute warmup (dynamic stretches, easy rallying)', reps: null },
      ...videos.map(v => ({ task: `Watch and practice: ${v.title}`, reps: '3-5 sets' })),
      { task: 'Cool down with light stretching', reps: '5 minutes' },
      { task: 'Hydrate and reflect on today\'s training', reps: null }
    ]
    return checklist
  }

  const getReflectionQuestions = () => {
    return [
      'What felt most natural today?',
      'Which drill challenged you the most?',
      'What will you focus on improving tomorrow?'
    ]
  }

  const getTomorrowPreview = (day: number, totalDays: number) => {
    if (day >= totalDays) return ''
    return `Tomorrow we'll build on today's foundation with new drills and challenges. Get some rest, Champion – you've earned it! 🌟`
  }

  const markDayComplete = async () => {
    try {
      toast.success(`Day ${selectedDay} completed! 🎉 Amazing work, Champion!`)
      
      // Move to next day if not at the end
      if (selectedDay < totalDays) {
        setTimeout(() => setSelectedDay(selectedDay + 1), 1000)
      }
      
      router.refresh()
    } catch (error) {
      console.error('Error marking day complete:', error)
      toast.error('Failed to update progress')
    }
  }

  const getSkillLevelColor = () => {
    const level = program.skillLevel?.toLowerCase()
    switch (level) {
      case 'beginner': return 'from-emerald-600 via-teal-600 to-cyan-600'
      case 'intermediate': return 'from-blue-600 via-cyan-600 to-indigo-600'
      case 'advanced': return 'from-purple-600 via-violet-600 to-fuchsia-600'
      default: return 'from-emerald-600 via-teal-600 to-cyan-600'
    }
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

      {/* Program Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden bg-gradient-to-br ${getSkillLevelColor()} text-white rounded-2xl p-8 shadow-2xl`}
      >
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{program.name}</h1>
              {program.tagline && (
                <p className="text-xl text-white/90 italic mt-1">{program.tagline}</p>
              )}
            </div>
          </div>

          {/* Program Details */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {program.skillLevel}
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Calendar className="w-3 h-3 mr-1" />
              {totalDays} Days
            </Badge>
            {program.estimatedTimePerDay && (
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Clock className="w-3 h-3 mr-1" />
                {program.estimatedTimePerDay}
              </Badge>
            )}
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <Flame className="h-6 w-6 mb-2 text-orange-300" />
              <div className="text-3xl font-bold">{completedDays}</div>
              <div className="text-sm text-white/80">Days Completed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <Target className="h-6 w-6 mb-2 text-yellow-300" />
              <div className="text-3xl font-bold">{totalDays - completedDays}</div>
              <div className="text-sm text-white/80">Days Remaining</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <TrendingUp className="h-6 w-6 mb-2 text-blue-300" />
              <div className="text-3xl font-bold">{Math.round(progressPercentage)}%</div>
              <div className="text-sm text-white/80">Progress</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <Sparkles className="h-6 w-6 mb-2 text-purple-300" />
              <div className="text-3xl font-bold">Day {selectedDay}</div>
              <div className="text-sm text-white/80">Current Day</div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">Program Progress</span>
              <span>Day {selectedDay} of {totalDays}</span>
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
            {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
              const isCompleted = day < selectedDay
              const isCurrent = day === selectedDay
              const isLocked = day > selectedDay

              return (
                <motion.button
                  key={day}
                  whileHover={{ scale: isLocked ? 1 : 1.05 }}
                  whileTap={{ scale: isLocked ? 1 : 0.95 }}
                  onClick={() => !isLocked && setSelectedDay(day)}
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
                  <span>Day {day}</span>
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
                    Day {selectedDay}
                  </Badge>
                  <Badge variant="outline" className="text-emerald-700 border-emerald-300">
                    {program.name}
                  </Badge>
                </div>
                <CardTitle className="text-3xl mb-2">Day {selectedDay} Training</CardTitle>
                <CardDescription className="text-lg font-medium text-emerald-700">
                  {currentDayVideos.length} Training {currentDayVideos.length === 1 ? 'Video' : 'Videos'} Today
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
              "{getCoachMessage(selectedDay, program.name)}"
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
              {getDailyObjectives(currentDayVideos, selectedDay).map((objective, idx) => (
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
              Warmup (5-10 minutes)
            </CardTitle>
            <CardDescription>Get your body ready for training!</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
                <span className="text-gray-800">Light cardio: Jog in place or jumping jacks (2-3 minutes)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
                <span className="text-gray-800">Dynamic stretches: Arm circles, leg swings, torso twists</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
                <span className="text-gray-800">Easy rallying: Start slow and gradually increase intensity</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Main Training Videos */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <PlayCircle className="w-7 h-7 text-emerald-600" />
            Main Training
          </h2>
          
          {currentDayVideos.map((video, videoIdx) => {
            const videoId = extractVideoId(video.videoUrl || video.videoId)
            
            return (
              <Card key={videoIdx} className="overflow-hidden shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 cursor-pointer"
                           onClick={() => setExpandedVideo(expandedVideo === videoIdx ? null : videoIdx)}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-emerald-900">
                        Video {videoIdx + 1}: {video.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {video.duration || '5-10 min'}
                        </span>
                        {video.watched && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Watched
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    {expandedVideo === videoIdx ? (
                      <ChevronUp className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-emerald-600" />
                    )}
                  </div>
                </CardHeader>
                
                <AnimatePresence>
                  {expandedVideo === videoIdx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="pt-6 space-y-6">
                        {/* Enhanced YouTube Video Player with Progress Tracking */}
                        {videoId && (
                          <EnhancedVideoPlayer
                            videoId={videoId}
                            videoDbId={video.id || videoId}
                            title={video.title}
                            duration={video.duration}
                            onComplete={() => {
                              toast.success('Video completed! 🎉')
                              router.refresh()
                            }}
                          />
                        )}

                        {/* Video Description */}
                        {video.description && (
                          <div>
                            <h4 className="font-semibold text-lg mb-2 text-gray-900">📝 About This Drill:</h4>
                            <p className="text-gray-700">{video.description}</p>
                          </div>
                        )}

                        {/* Practice Instructions */}
                        <div>
                          <h4 className="font-semibold text-lg mb-3 text-gray-900">📋 How to Practice:</h4>
                          <ol className="space-y-3">
                            <li className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold mt-0.5 shrink-0">
                                1
                              </div>
                              <span className="text-gray-700">Watch the entire video first to understand the technique</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold mt-0.5 shrink-0">
                                2
                              </div>
                              <span className="text-gray-700">Start slow and focus on proper form and technique</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold mt-0.5 shrink-0">
                                3
                              </div>
                              <span className="text-gray-700">Practice 3-5 sets, gradually increasing speed as you improve</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold mt-0.5 shrink-0">
                                4
                              </div>
                              <span className="text-gray-700">Take breaks between sets to maintain quality</span>
                            </li>
                          </ol>
                        </div>

                        {/* Pro Tip */}
                        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-l-amber-500 p-4 rounded-r-lg">
                          <div className="flex items-start gap-3">
                            <Sparkles className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <h5 className="font-semibold text-amber-900 mb-1">💡 Pro Tip</h5>
                              <p className="text-amber-800">Film yourself practicing this drill and compare it to the video. Visual feedback is one of the fastest ways to improve your technique!</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            )
          })}
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
              {getPracticeChecklist(currentDayVideos).map((item, idx) => (
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
                        Target: {item.reps}
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
                {getReflectionQuestions().map((question, idx) => (
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
                Remember
              </h4>
              <p className="text-gray-800 font-medium italic">
                "Progress isn't always linear. Some days will feel easier than others, and that's perfectly normal. What matters is showing up and putting in the work. You're building skills that will last a lifetime!"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tomorrow's Preview */}
        {selectedDay < totalDays && (
          <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-900">
                <Sparkles className="w-6 w-6 text-cyan-600" />
                Coming Up Tomorrow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-800 italic">
                {getTomorrowPreview(selectedDay, totalDays)}
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
