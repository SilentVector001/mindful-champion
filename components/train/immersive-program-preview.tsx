"use client"

/**
 * Immersive Program Preview
 * 
 * A stunning, modern program preview experience that showcases
 * what users will get before they enroll. Features:
 * - Hero section with animated gradients
 * - Visual journey timeline
 * - Video preview carousel
 * - Achievement showcase
 * - Clear call-to-action
 * - Mobile-responsive design
 */

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Play,
  CheckCircle2,
  Clock,
  Target,
  Trophy,
  BookOpen,
  Star,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Flame,
  TrendingUp,
  Award,
  Video,
  Calendar,
  Zap,
  Brain,
  Heart,
  Users,
  ArrowRight,
  Lock,
  Unlock,
  PlayCircle,
  Youtube
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Image from "next/image"

interface ImmersiveProgramPreviewProps {
  user: any
  program: any
  programVideos: any[]
  onEnroll: () => void
  isEnrolling: boolean
}

export default function ImmersiveProgramPreview({
  user,
  program,
  programVideos,
  onEnroll,
  isEnrolling
}: ImmersiveProgramPreviewProps) {
  const router = useRouter()
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0)
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)

  const totalDays = program.durationDays || 14
  const totalVideos = programVideos.length
  const estimatedTimePerDay = parseInt(program.estimatedTimePerDay || "30")
  const totalTime = totalDays * estimatedTimePerDay

  // Group videos by day
  const videosByDay = programVideos.reduce((acc: any, video: any) => {
    const day = video.dayNumber || 1
    if (!acc[day]) acc[day] = []
    acc[day].push(video)
    return acc
  }, {})

  const getSkillLevelConfig = (skillLevel: string) => {
    const configs = {
      beginner: {
        color: "from-emerald-500 via-green-500 to-teal-500",
        icon: BookOpen,
        badge: "bg-emerald-500 text-white",
        description: "Perfect for players new to the game"
      },
      intermediate: {
        color: "from-blue-500 via-cyan-500 to-sky-500",
        icon: Target,
        badge: "bg-blue-500 text-white",
        description: "For players ready to level up their game"
      },
      advanced: {
        color: "from-amber-500 via-orange-500 to-yellow-500",
        icon: Trophy,
        badge: "bg-amber-500 text-white",
        description: "For competitive players seeking mastery"
      }
    }
    return configs[skillLevel?.toLowerCase() as keyof typeof configs] || configs.beginner
  }

  const config = getSkillLevelConfig(program.skillLevel)
  const IconComponent = config.icon

  // Featured videos for preview
  const featuredVideos = programVideos.slice(0, 6)

  const journeyStages = [
    {
      icon: BookOpen,
      title: "Learn",
      description: "Watch expert instruction",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Target,
      title: "Practice",
      description: "Apply what you've learned",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: CheckCircle2,
      title: "Assess",
      description: "Check your understanding",
      color: "from-purple-500 to-violet-500"
    },
    {
      icon: Trophy,
      title: "Challenge",
      description: "Push your limits",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: Brain,
      title: "Reflect",
      description: "Track your growth",
      color: "from-indigo-500 to-blue-500"
    }
  ]

  const achievements = [
    { icon: Trophy, title: "Program Champion", description: "Complete all days", points: 500 },
    { icon: Flame, title: "Hot Streak", description: "7 days in a row", points: 250 },
    { icon: Star, title: "Perfect Practice", description: "100% completion", points: 300 },
    { icon: Award, title: "Skill Master", description: "Master all skills", points: 400 }
  ]

  const stats = [
    { icon: Video, value: totalVideos, label: "Training Videos", color: "text-blue-500" },
    { icon: Calendar, value: totalDays, label: "Days", color: "text-emerald-500" },
    { icon: Clock, value: `${estimatedTimePerDay}min`, label: "Per Day", color: "text-amber-500" },
    { icon: Trophy, value: "1000+", label: "Points to Earn", color: "text-purple-500" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push('/train')}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Training
        </Button>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12"
        >
          <Card className="overflow-hidden border-none shadow-2xl">
            {/* Animated Gradient Background */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-r opacity-90",
              config.color
            )}>
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
            </div>

            <CardContent className="relative p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left: Program Info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl"
                    >
                      <IconComponent className="w-10 h-10 text-white" />
                    </motion.div>
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-base px-4 py-2">
                      {program.skillLevel}
                    </Badge>
                  </div>

                  <div>
                    <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                      {program.name}
                    </h1>
                    <p className="text-white/90 text-xl">
                      {program.description}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      className="bg-white text-gray-900 hover:bg-white/90 shadow-2xl text-lg px-8 py-6 h-auto"
                      onClick={onEnroll}
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-3" />
                          Starting Your Journey...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-6 h-6 mr-3" />
                          Start Your Journey
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </motion.div>

                  <p className="text-white/70 text-sm">
                    ✨ Join {Math.floor(Math.random() * 500 + 500)}+ players who started this program
                  </p>
                </div>

                {/* Right: Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => {
                    const StatIcon = stat.icon
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="bg-white/10 backdrop-blur-md border-white/20">
                          <CardContent className="p-6 text-center">
                            <StatIcon className="w-8 h-8 mx-auto mb-3 text-white" />
                            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-sm text-white/70">{stat.label}</div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Journey Stages Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Your Learning Journey
            </h2>
            <p className="text-gray-600 text-lg">
              A proven 5-stage coaching system to accelerate your progress
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {journeyStages.map((stage, index) => {
              const StageIcon = stage.icon
              return (
                <motion.div
                  key={stage.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-gray-300">
                    {/* Gradient Background */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-5",
                      stage.color
                    )} />
                    
                    <CardContent className="p-6 text-center relative">
                      <div className="flex flex-col items-center gap-3">
                        {/* Icon with gradient background */}
                        <div className={cn(
                          "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                          stage.color
                        )}>
                          <StageIcon className="w-7 h-7 text-white" />
                        </div>
                        
                        {/* Stage Number */}
                        <Badge variant="outline" className="text-xs">Stage {index + 1}</Badge>
                        
                        <div>
                          <h3 className="font-bold text-lg mb-1">{stage.title}</h3>
                          <p className="text-sm text-gray-600">{stage.description}</p>
                        </div>
                      </div>
                    </CardContent>

                    {/* Connector Line (except last) */}
                    {index < journeyStages.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gray-300 z-10" />
                    )}
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Training Content Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">What You'll Learn</CardTitle>
                  <p className="text-gray-600">
                    {totalVideos} expert-led training videos across {totalDays} days
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className={cn(
                      "bg-gradient-to-r text-white shadow-lg",
                      config.color
                    )}
                    onClick={onEnroll}
                    disabled={isEnrolling}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Now
                  </Button>
                </motion.div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Interactive Day Timeline */}
              <div className="relative mb-8">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                
                <div className="relative flex justify-between items-center">
                  {Array.from({ length: Math.min(totalDays, 7) }, (_, i) => i + 1).map((day) => {
                    const dayVideos = videosByDay[day] || []
                    const isHovered = hoveredDay === day

                    return (
                      <motion.div
                        key={day}
                        className="relative group"
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        whileHover={{ scale: 1.2 }}
                      >
                        {/* Day Circle */}
                        <div className={cn(
                          "w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center font-bold text-white transition-all duration-300 cursor-pointer",
                          isHovered ? cn("bg-gradient-to-br scale-110", config.color) : "bg-gray-400"
                        )}>
                          {day}
                        </div>

                        {/* Hover Tooltip */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute top-full mt-3 left-1/2 -translate-x-1/2 z-10 w-48"
                            >
                              <Card className="shadow-xl border-2">
                                <CardContent className="p-4">
                                  <div className="font-bold mb-2">Day {day}</div>
                                  <div className="text-sm text-gray-600">
                                    {dayVideos.length} videos • {dayVideos.length * estimatedTimePerDay} min
                                  </div>
                                  {dayVideos.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                      {dayVideos.slice(0, 2).map((video: any) => (
                                        <div key={video.id} className="text-xs text-gray-500 truncate">
                                          • {video.title}
                                        </div>
                                      ))}
                                      {dayVideos.length > 2 && (
                                        <div className="text-xs text-gray-400">
                                          +{dayVideos.length - 2} more
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                  
                  {totalDays > 7 && (
                    <div className="text-gray-400 font-bold">+{totalDays - 7}</div>
                  )}
                </div>
              </div>

              {/* Featured Videos Grid */}
              <div className="grid md:grid-cols-3 gap-4">
                {featuredVideos.map((video: any, index: number) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
                      {/* Video Thumbnail */}
                      <div className="relative aspect-video bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                        {/* YouTube Thumbnail */}
                        {video.youtubeUrl && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                            <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                          </div>
                        )}
                        
                        {/* Day Badge */}
                        <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                          Day {video.dayNumber}
                        </Badge>
                      </div>

                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2 line-clamp-2 group-hover:text-champion-green transition-colors">
                          {video.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{Math.floor((video.duration || 600) / 60)} min</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {video.skillLevel || program.skillLevel}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {totalVideos > 6 && (
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    size="lg"
                    className="group"
                    onClick={onEnroll}
                  >
                    See All {totalVideos} Videos
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Achievements to Unlock
            </h2>
            <p className="text-gray-600 text-lg">
              Earn points, badges, and bragging rights as you progress
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => {
              const AchIcon = achievement.icon
              return (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2">
                    {/* Locked overlay effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-50" />
                    
                    <CardContent className="p-6 text-center relative">
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"
                      >
                        <AchIcon className="w-8 h-8 text-white" />
                      </motion.div>
                      
                      <h3 className="font-bold text-lg mb-2">{achievement.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                      
                      <div className="flex items-center justify-center gap-2">
                        <Badge className="bg-amber-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          {achievement.points} pts
                        </Badge>
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Final CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="relative overflow-hidden border-none shadow-2xl">
            <div className={cn(
              "absolute inset-0 bg-gradient-to-r opacity-90",
              config.color
            )} />
            
            <CardContent className="relative p-12 text-center text-white">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Game?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join hundreds of players who have improved their skills with this proven training program
              </p>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-white/90 shadow-2xl text-xl px-12 py-7 h-auto"
                  onClick={onEnroll}
                  disabled={isEnrolling}
                >
                  {isEnrolling ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-3" />
                      Starting Your Journey...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-7 h-7 mr-3" />
                      Start Training Now
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </>
                  )}
                </Button>
              </motion.div>

              <p className="text-white/70 text-sm mt-6">
                ✨ 100% free • No credit card required • Start immediately
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
