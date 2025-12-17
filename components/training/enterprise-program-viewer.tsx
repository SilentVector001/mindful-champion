
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  BookOpen,
  Award,
  BarChart3,
  Users,
  GraduationCap,
  Zap,
  Star,
  ArrowRight,
  CheckCircle,
  Circle,
  Lock,
  FileText,
  Brain,
  Dumbbell,
  Video,
  AlertCircle,
  Info
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import EnhancedVideoPlayer from '@/components/train/enhanced-video-player'

interface EnterpriseProgramViewerProps {
  program: any
  userProgram: any
  userId: string
}

export default function EnterpriseProgramViewer({ program, userProgram, userId }: EnterpriseProgramViewerProps) {
  const router = useRouter()
  const [selectedDay, setSelectedDay] = useState(userProgram?.currentDay || 1)
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedSection, setExpandedSection] = useState<string | null>('curriculum')

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
  const totalVideos = program.videos.length
  const watchedVideos = program.videos.filter((v: any) => v.watched).length

  const extractVideoId = (url: string) => {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return match ? match[1] : url
  }

  const getSkillLevelConfig = () => {
    const level = program.skillLevel?.toLowerCase()
    switch (level) {
      case 'beginner':
        return {
          color: 'from-emerald-600 via-teal-600 to-cyan-600',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: <GraduationCap className="w-5 h-5" />,
          description: 'Perfect for players just starting their pickleball journey'
        }
      case 'intermediate':
        return {
          color: 'from-blue-600 via-indigo-600 to-purple-600',
          badge: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <Target className="w-5 h-5" />,
          description: 'Designed for players with fundamental skills looking to advance'
        }
      case 'advanced':
        return {
          color: 'from-purple-600 via-fuchsia-600 to-pink-600',
          badge: 'bg-purple-100 text-purple-800 border-purple-300',
          icon: <Trophy className="w-5 h-5" />,
          description: 'Elite-level training for competitive players'
        }
      default:
        return {
          color: 'from-emerald-600 via-teal-600 to-cyan-600',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: <Target className="w-5 h-5" />,
          description: 'Structured training program'
        }
    }
  }

  const skillConfig = getSkillLevelConfig()

  // Parse key outcomes if they're stored as JSON
  const keyOutcomes = typeof program.keyOutcomes === 'string' 
    ? JSON.parse(program.keyOutcomes) 
    : program.keyOutcomes || []

  const markDayComplete = async () => {
    try {
      toast.success(`Day ${selectedDay} completed! 🎉`)
      if (selectedDay < totalDays) {
        setTimeout(() => setSelectedDay(selectedDay + 1), 1000)
      }
      router.refresh()
    } catch (error) {
      console.error('Error marking day complete:', error)
      toast.error('Failed to update progress')
    }
  }

  return (
    <div className="space-y-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => router.push('/train/programs')}
          variant="ghost"
          className="group"
        >
          <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to All Programs
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <Video className="w-3 h-3" />
            {watchedVideos} / {totalVideos} Videos Completed
          </Badge>
        </div>
      </div>

      {/* Hero Header - Professional Design */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden bg-gradient-to-br ${skillConfig.color} text-white rounded-2xl shadow-2xl`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 p-8 md:p-12">
          {/* Header Content */}
          <div className="max-w-4xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                {/* Skill Level Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-sm px-4 py-2">
                    {skillConfig.icon}
                    <span className="ml-2 font-semibold">{program.skillLevel} Level</span>
                  </Badge>
                  {userProgram && (
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-sm px-4 py-2">
                      <Flame className="w-4 h-4 mr-1" />
                      In Progress
                    </Badge>
                  )}
                </div>

                {/* Program Title */}
                <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">{program.name}</h1>
                
                {/* Tagline */}
                {program.tagline && (
                  <p className="text-xl md:text-2xl text-white/90 font-medium italic mb-4">{program.tagline}</p>
                )}

                {/* Description */}
                <p className="text-lg text-white/80 leading-relaxed max-w-3xl">
                  {program.description}
                </p>
              </div>

              {/* Trophy Icon */}
              <div className="hidden md:block ml-8">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl">
                  <Trophy className="w-12 h-12 text-amber-300 fill-amber-300" />
                </div>
              </div>
            </div>

            <Separator className="my-6 bg-white/20" />

            {/* Program Meta Information */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Calendar className="h-5 w-5 mb-2 text-white/80" />
                <div className="text-2xl font-bold">{totalDays}</div>
                <div className="text-sm text-white/70">Days Total</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Clock className="h-5 w-5 mb-2 text-white/80" />
                <div className="text-2xl font-bold">{program.estimatedTimePerDay || '30-45m'}</div>
                <div className="text-sm text-white/70">Per Day</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Video className="h-5 w-5 mb-2 text-white/80" />
                <div className="text-2xl font-bold">{totalVideos}</div>
                <div className="text-sm text-white/70">Video Lessons</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <BarChart3 className="h-5 w-5 mb-2 text-white/80" />
                <div className="text-2xl font-bold">{Math.round(progressPercentage)}%</div>
                <div className="text-sm text-white/70">Completed</div>
              </div>
            </div>

            {/* Progress Bar */}
            {userProgram && (
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>Your Progress</span>
                  <span>Day {userProgram.currentDay} of {totalDays}</span>
                </div>
                <Progress value={progressPercentage} className="h-3 bg-white/20" />
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>{completedDays} days completed</span>
                  <span>{totalDays - completedDays} days remaining</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Professional Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50">
          <TabsTrigger value="overview" className="flex items-center gap-2 py-3">
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="flex items-center gap-2 py-3">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Curriculum</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2 py-3">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Progress</span>
          </TabsTrigger>
          <TabsTrigger value="train" className="flex items-center gap-2 py-3">
            <Dumbbell className="w-4 h-4" />
            <span className="hidden sm:inline">Train Now</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Program Context & Philosophy */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Target className="w-6 h-6 text-emerald-600" />
                Program Philosophy & Structure
              </CardTitle>
              <CardDescription className="text-base">
                Understanding how this program fits into your complete training journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Training Methodology</h3>
                    <p className="text-gray-700 leading-relaxed">
                      This {totalDays}-day program employs progressive skill-building techniques used by professional coaches worldwide. 
                      Each day builds upon the previous, creating a comprehensive learning path that develops both technical proficiency 
                      and strategic understanding. The structured approach ensures you master fundamentals before advancing to complex techniques.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    What You'll Master
                  </h3>
                  <ul className="space-y-3">
                    {keyOutcomes && Array.isArray(keyOutcomes) && keyOutcomes.length > 0 ? (
                      keyOutcomes.map((outcome: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                          <span className="text-gray-700">{outcome}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                          <span className="text-gray-700">Progressive skill development through structured daily training</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                          <span className="text-gray-700">Expert video instruction from professional coaches</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                          <span className="text-gray-700">Comprehensive understanding of technique, strategy, and execution</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Who This Is For
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <Star className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{program.skillLevel} Players</div>
                        <div className="text-sm text-gray-600">{skillConfig.description}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                        <Target className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Dedicated Learners</div>
                        <div className="text-sm text-gray-600">Players committed to {program.estimatedTimePerDay || '30-45 minutes'} of daily practice</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Growth Mindset</div>
                        <div className="text-sm text-gray-600">Players ready to challenge themselves and track measurable progress</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How This Program Fits Into Your Journey */}
          <Card className="border-2 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-amber-900">
                <Sparkles className="w-6 h-6 text-amber-600" />
                Your Complete Training Ecosystem
              </CardTitle>
              <CardDescription className="text-amber-800">
                This program is part of Mindful Champion's comprehensive training system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-5 border-2 border-amber-200">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                      <BookOpen className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">1. Structured Programs</h4>
                    <p className="text-sm text-gray-700">Multi-day curricula like this one for systematic skill development</p>
                  </div>
                  <div className="bg-white rounded-xl p-5 border-2 border-amber-200">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                      <Video className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">2. Video Library</h4>
                    <p className="text-sm text-gray-700">88+ on-demand videos for targeted practice anytime</p>
                  </div>
                  <div className="bg-white rounded-xl p-5 border-2 border-amber-200">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                      <Brain className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">3. AI Coach Kai</h4>
                    <p className="text-sm text-gray-700">Personalized guidance and instant feedback throughout your journey</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-5 border-2 border-amber-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                      <ArrowRight className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Recommended Path After This Program</h4>
                      <p className="text-sm text-gray-700">
                        Upon completion, progress to more advanced programs or use the drill library to maintain and refine specific skills. 
                        Continue working with Coach Kai for personalized recommendations based on your performance and goals.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Curriculum Tab */}
        <TabsContent value="curriculum" className="space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BookOpen className="w-6 h-6 text-emerald-600" />
                Complete {totalDays}-Day Curriculum
              </CardTitle>
              <CardDescription className="text-base">
                Structured daily lessons with {totalVideos} professional video instructions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
                    const dayVideos = videosByDay[day] || []
                    const isDayCompleted = day < (userProgram?.currentDay || 1)
                    const isCurrentDay = day === (userProgram?.currentDay || 1)
                    const isLocked = day > (userProgram?.currentDay || 1)

                    return (
                      <motion.div
                        key={day}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: day * 0.05 }}
                        className={`
                          border-2 rounded-xl p-5 transition-all
                          ${isCurrentDay ? 'border-emerald-500 bg-emerald-50 shadow-lg' : ''}
                          ${isDayCompleted ? 'border-green-300 bg-green-50' : ''}
                          ${isLocked ? 'border-gray-200 bg-gray-50' : ''}
                          ${!isCurrentDay && !isDayCompleted && !isLocked ? 'border-gray-200 bg-white' : ''}
                        `}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              {isDayCompleted && (
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                  <CheckCircle2 className="w-5 h-5 text-white" />
                                </div>
                              )}
                              {isCurrentDay && (
                                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                                  <Zap className="w-5 h-5 text-white" />
                                </div>
                              )}
                              {isLocked && (
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                  <Lock className="w-5 h-5 text-gray-500" />
                                </div>
                              )}
                              {!isDayCompleted && !isCurrentDay && !isLocked && (
                                <div className="w-8 h-8 border-2 border-gray-300 rounded-full flex items-center justify-center">
                                  <Circle className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">Day {day}</h3>
                                <Badge variant={isCurrentDay ? "default" : "outline"} className="mt-1">
                                  {dayVideos.length} {dayVideos.length === 1 ? 'Video' : 'Videos'}
                                </Badge>
                              </div>
                            </div>

                            {dayVideos.length > 0 ? (
                              <div className="space-y-2 ml-11">
                                {dayVideos.map((video: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-3 text-sm">
                                    <PlayCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span className="text-gray-700 font-medium">{video.title}</span>
                                    {video.watched && (
                                      <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="ml-11 text-sm text-gray-500 italic">
                                Content will be available on this day
                              </div>
                            )}
                          </div>

                          {isCurrentDay && (
                            <Button
                              onClick={() => {
                                setSelectedDay(day)
                                setActiveTab('train')
                              }}
                              size="sm"
                              className="ml-4"
                            >
                              Start Training
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Days Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-emerald-600">{completedDays}</div>
                <div className="text-sm text-muted-foreground mt-1">out of {totalDays} total days</div>
                <Progress value={progressPercentage} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-500" />
                  Videos Watched
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600">{watchedVideos}</div>
                <div className="text-sm text-muted-foreground mt-1">out of {totalVideos} total videos</div>
                <Progress value={(watchedVideos / totalVideos) * 100} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-500" />
                  Current Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-purple-600">Day {userProgram?.currentDay || 1}</div>
                <div className="text-sm text-muted-foreground mt-1">{totalDays - (userProgram?.currentDay || 1) + 1} days remaining</div>
                {userProgram?.startDate && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Started: {new Date(userProgram.startDate).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                Training History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: Math.min(completedDays, 5) }, (_, i) => completedDays - i).map((day) => (
                  <div key={day} className="flex items-center gap-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Day {day} Complete</div>
                      <div className="text-sm text-gray-600">{videosByDay[day]?.length || 0} videos watched</div>
                    </div>
                    <Badge className="bg-green-600 text-white">✓</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Train Now Tab */}
        <TabsContent value="train" className="space-y-6">
          <Card className="border-2 border-emerald-500">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Dumbbell className="w-6 h-6 text-emerald-600" />
                    Day {selectedDay} Training
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    {currentDayVideos.length} professional video{currentDayVideos.length !== 1 ? 's' : ''} today
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-emerald-600">Day {selectedDay}</div>
                  <div className="text-sm text-muted-foreground">of {totalDays}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {currentDayVideos.length > 0 ? (
                <div className="space-y-6">
                  {currentDayVideos.map((video: any, idx: number) => {
                    const videoId = extractVideoId(video.videoUrl || video.videoId)
                    
                    return (
                      <Card key={idx} className="overflow-hidden shadow-lg border-2">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <CardTitle className="text-xl flex items-center gap-2">
                            <PlayCircle className="w-6 h-6 text-emerald-600" />
                            Video {idx + 1}: {video.title}
                          </CardTitle>
                          {video.duration && (
                            <CardDescription className="flex items-center gap-2 mt-2">
                              <Clock className="w-4 h-4" />
                              {video.duration}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="pt-6">
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
                          {video.description && (
                            <div className="mt-4">
                              <h4 className="font-semibold mb-2">About this lesson:</h4>
                              <p className="text-gray-700">{video.description}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}

                  {/* Complete Day Button */}
                  <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0">
                    <CardContent className="p-8 text-center">
                      <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-300" />
                      <h3 className="text-2xl font-bold mb-2">Complete Day {selectedDay}</h3>
                      <p className="text-emerald-100 mb-6">
                        Excellent work today! Mark this day complete to continue your journey.
                      </p>
                      <Button
                        onClick={markDayComplete}
                        size="lg"
                        className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-8"
                      >
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Mark Day {selectedDay} Complete
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Videos Yet</h3>
                  <p className="text-gray-600">
                    Videos for this day will be added soon. Check back later!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
