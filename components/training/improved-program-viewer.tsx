'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle2,
  PlayCircle,
  Calendar,
  Clock,
  Target,
  ChevronLeft,
  Trophy,
  Flame,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Star,
  Video,
  BookOpen,
  Zap,
  Award,
  ArrowRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface ImprovedProgramViewerProps {
  program: any
  userProgram: any
  userId: string
}

export default function ImprovedProgramViewer({ program, userProgram, userId }: ImprovedProgramViewerProps) {
  const router = useRouter()
  const [selectedDay, setSelectedDay] = useState(userProgram?.currentDay || 1)
  const [expandedDay, setExpandedDay] = useState<number | null>(1)
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum'>('curriculum')

  // Group videos by day
  const videosByDay: Record<number, any[]> = {}
  program.videos?.forEach((video: any) => {
    if (!videosByDay[video.day]) {
      videosByDay[video.day] = []
    }
    videosByDay[video.day].push(video)
  })

  const totalDays = program.durationDays
  const completedDays = (userProgram?.currentDay || 1) - 1
  const progressPercentage = (completedDays / totalDays) * 100
  const totalVideos = program.videos?.length || 0
  const watchedVideos = program.videos?.filter((v: any) => v.watched).length || 0

  const getSkillLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'from-emerald-600 via-teal-600 to-cyan-600'
      case 'intermediate': return 'from-blue-600 via-indigo-600 to-purple-600'
      case 'advanced': return 'from-purple-600 via-fuchsia-600 to-pink-600'
      default: return 'from-gray-600 via-gray-700 to-gray-800'
    }
  }

  const getSkillLevelBadge = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      case 'intermediate': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'advanced': return 'bg-purple-100 text-purple-800 border-purple-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const extractVideoId = (url: string) => {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return match ? match[1] : url
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = extractVideoId(url)
    return `https://www.youtube.com/embed/${videoId}?rel=0`
  }

  const markDayComplete = async (day: number) => {
    try {
      const response = await fetch('/api/training/mark-day-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: program.id,
          day: day,
          userId: userId
        })
      })

      if (response.ok) {
        toast.success(`Day ${day} completed! 🎉`)
        if (day < totalDays) {
          setTimeout(() => {
            setSelectedDay(day + 1)
            setExpandedDay(day + 1)
          }, 1000)
        }
        router.refresh()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to update progress')
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        onClick={() => router.push('/train/programs')}
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
        className={`relative overflow-hidden bg-gradient-to-br ${getSkillLevelColor(program.skillLevel)} text-white rounded-2xl p-8 shadow-2xl`}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Badge className={`${getSkillLevelBadge(program.skillLevel)} border-2 text-lg px-4 py-1`}>
                  {program.skillLevel}
                </Badge>
                <Badge variant="outline" className="bg-white/20 text-white border-white/40 text-lg px-4 py-1">
                  {totalDays} Days
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-3">{program.name}</h1>
              <p className="text-2xl text-white/90 italic mb-4">"{program.tagline}"</p>
              <p className="text-lg text-white/80 max-w-3xl">{program.description}</p>
            </div>
            <div className="hidden md:block">
              <Trophy className="w-24 h-24 text-amber-300" />
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <Video className="h-6 w-6 mb-2 text-white" />
              <div className="text-3xl font-bold">{totalVideos}</div>
              <div className="text-sm text-white/80">Training Videos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <Clock className="h-6 w-6 mb-2 text-white" />
              <div className="text-3xl font-bold">{program.estimatedTimePerDay || '30-45 min'}</div>
              <div className="text-sm text-white/80">Per Day</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <Flame className="h-6 w-6 mb-2 text-orange-300" />
              <div className="text-3xl font-bold">{completedDays}</div>
              <div className="text-sm text-white/80">Days Done</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <TrendingUp className="h-6 w-6 mb-2 text-blue-300" />
              <div className="text-3xl font-bold">{Math.round(progressPercentage)}%</div>
              <div className="text-sm text-white/80">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold">Your Progress</span>
              <span>Day {userProgram?.currentDay || 1} of {totalDays}</span>
            </div>
            <Progress value={progressPercentage} className="h-3 bg-white/20" />
          </div>
        </div>
      </motion.div>

      {/* Tabs: Overview & Curriculum */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">
            <BookOpen className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="curriculum">
            <Calendar className="w-4 h-4 mr-2" />
            Daily Curriculum
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* What You'll Learn */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6 text-emerald-600" />
                What You'll Achieve
              </CardTitle>
              <CardDescription>
                Key outcomes and skills you'll master in this program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {(program.keyOutcomes as string[])?.map((outcome: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-gray-800 font-medium">{outcome}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Program Structure */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <BookOpen className="w-6 h-6 text-blue-600" />
                Program Structure
              </CardTitle>
              <CardDescription className="text-blue-800">
                Comprehensive {totalDays}-day journey with {totalVideos} professional videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 border-2 border-blue-200">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{totalDays}</div>
                  <div className="text-gray-800 font-semibold">Training Days</div>
                  <div className="text-sm text-gray-600 mt-1">Structured progression</div>
                </div>
                <div className="bg-white rounded-xl p-5 border-2 border-blue-200">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{totalVideos}</div>
                  <div className="text-gray-800 font-semibold">Pro Videos</div>
                  <div className="text-sm text-gray-600 mt-1">Expert instruction</div>
                </div>
                <div className="bg-white rounded-xl p-5 border-2 border-blue-200">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {Math.round(totalVideos / totalDays)}
                  </div>
                  <div className="text-gray-800 font-semibold">Videos/Day</div>
                  <div className="text-sm text-gray-600 mt-1">Focused learning</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Curriculum Tab */}
        <TabsContent value="curriculum" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-emerald-600" />
                {totalDays}-Day Training Schedule
              </CardTitle>
              <CardDescription>
                Click any day to view the training videos and drills
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
                const dayVideos = videosByDay[day] || []
                const isDayCompleted = day < (userProgram?.currentDay || 1)
                const isCurrentDay = day === (userProgram?.currentDay || 1)
                const isExpanded = expandedDay === day

                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: day * 0.03 }}
                    className={`
                      border-2 rounded-xl transition-all overflow-hidden
                      ${isCurrentDay ? 'border-emerald-500 bg-emerald-50 shadow-lg' : ''}
                      ${isDayCompleted ? 'border-green-300 bg-green-50' : ''}
                      ${!isCurrentDay && !isDayCompleted ? 'border-gray-200 bg-white' : ''}
                    `}
                  >
                    {/* Day Header */}
                    <div
                      onClick={() => setExpandedDay(isExpanded ? null : day)}
                      className="p-5 cursor-pointer hover:bg-white/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {isDayCompleted && (
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-6 h-6 text-white" />
                            </div>
                          )}
                          {isCurrentDay && (
                            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shrink-0">
                              <Zap className="w-6 h-6 text-white" />
                            </div>
                          )}
                          {!isDayCompleted && !isCurrentDay && (
                            <div className="w-10 h-10 border-2 border-gray-300 rounded-full flex items-center justify-center shrink-0">
                              <span className="text-gray-600 font-bold">{day}</span>
                            </div>
                          )}
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Day {day}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Video className="w-3 h-3" />
                                {dayVideos.length} {dayVideos.length === 1 ? 'drill' : 'drills'}
                              </Badge>
                              {dayVideos.length > 0 && (
                                <span className="text-sm text-gray-600">
                                  • {Math.round((dayVideos.length * 8))} min
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Day Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t-2 border-gray-200"
                        >
                          <div className="p-5 space-y-4 bg-white">
                            {dayVideos.length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                <Video className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                <p className="font-medium">No videos assigned to this day yet</p>
                                <p className="text-sm mt-1">Check back soon for updates!</p>
                              </div>
                            ) : (
                              <>
                                <div className="space-y-4">
                                  {dayVideos.map((video: any, idx: number) => (
                                    <div key={idx} className="border-2 border-emerald-200 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
                                      {/* Video Embed */}
                                      <div className="aspect-video bg-black">
                                        <iframe
                                          src={getYouTubeEmbedUrl(video.url)}
                                          title={video.title}
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                          className="w-full h-full"
                                        />
                                      </div>
                                      {/* Video Info */}
                                      <div className="p-4">
                                        <div className="flex items-start gap-3">
                                          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                                            <span className="text-white font-bold">{idx + 1}</span>
                                          </div>
                                          <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 mb-1">{video.title}</h4>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                              <Clock className="w-4 h-4" />
                                              <span>{video.duration || '8 min'}</span>
                                              {video.watched && (
                                                <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-300">
                                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                                  Watched
                                                </Badge>
                                              )}
                                            </div>
                                            {video.description && (
                                              <p className="text-sm text-gray-700 mt-2">{video.description}</p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Complete Day Button */}
                                {isCurrentDay && dayVideos.length > 0 && (
                                  <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-none">
                                    <CardContent className="p-6 text-center">
                                      <Trophy className="w-12 h-12 mx-auto mb-3 text-amber-300" />
                                      <h3 className="text-xl font-bold mb-2">Ready to Complete Day {day}?</h3>
                                      <p className="text-emerald-100 mb-4">
                                        Mark this day complete to unlock the next training session!
                                      </p>
                                      <Button
                                        onClick={() => markDayComplete(day)}
                                        size="lg"
                                        className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold"
                                      >
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        Complete Day {day}
                                      </Button>
                                    </CardContent>
                                  </Card>
                                )}
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
