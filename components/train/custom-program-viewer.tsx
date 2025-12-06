
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  CheckCircle2,
  Brain,
  Calendar,
  Clock,
  Video,
  ChevronLeft,
  Sparkles,
  Target
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ProgramVideo {
  id: string
  title: string
  description: string
  youtubeUrl: string
  duration: number
  dayNumber: number
  order: number
  skillLevel: string
  primaryTopic: string
}

interface CustomProgram {
  id: string
  programName: string
  customGoalText: string | null
  selectedSkills: any
  estimatedDays: number | null
  status: string
  createdAt: Date
}

interface CustomProgramViewerProps {
  user: any
  customProgram: CustomProgram
  programVideos: ProgramVideo[]
}

export default function CustomProgramViewer({
  user,
  customProgram,
  programVideos
}: CustomProgramViewerProps) {
  const router = useRouter()
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set())
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  // Group videos by day
  const videosByDay = programVideos.reduce((acc, video) => {
    if (!acc[video.dayNumber]) {
      acc[video.dayNumber] = []
    }
    acc[video.dayNumber].push(video)
    return acc
  }, {} as Record<number, ProgramVideo[]>)

  const totalDays = Object.keys(videosByDay).length
  const currentDay = currentVideoIndex < programVideos.length 
    ? programVideos[currentVideoIndex]?.dayNumber || 1
    : totalDays

  const completionPercentage = programVideos.length > 0
    ? Math.round((completedVideos.size / programVideos.length) * 100)
    : 0

  const handleVideoComplete = (videoId: string) => {
    setCompletedVideos(prev => new Set([...prev, videoId]))
    toast.success('Video completed! 🎉')
    
    // Move to next video
    if (currentVideoIndex < programVideos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1)
    }
  }

  const handleStartVideo = (index: number) => {
    setCurrentVideoIndex(index)
  }

  const currentVideo = programVideos[currentVideoIndex]
  const skills = Array.isArray(customProgram.selectedSkills) 
    ? customProgram.selectedSkills 
    : []

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Button
          variant="ghost"
          onClick={() => router.push('/train')}
          className="mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Training
        </Button>

        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-champion-gold to-amber-600 flex items-center justify-center flex-shrink-0">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-4xl font-light text-gray-900">
                {customProgram.programName}
              </h1>
              <Badge className="bg-champion-gold text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Generated
              </Badge>
            </div>
            {customProgram.customGoalText && (
              <p className="text-lg text-gray-600 mb-4">
                <strong>Your Goal:</strong> {customProgram.customGoalText}
              </p>
            )}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string) => (
                  <Badge key={skill} variant="outline" className="capitalize">
                    <Target className="w-3 h-3 mr-1" />
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Progress Stats */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-semibold">{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Current Day</p>
                  <p className="text-lg font-semibold">{currentDay} of {totalDays}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Videos Completed</p>
                  <p className="text-lg font-semibold">{completedVideos.size} of {programVideos.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video Player */}
        <div className="lg:col-span-2">
          {currentVideo ? (
            <motion.div
              key={currentVideo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-champion-green" />
                    {currentVideo.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    {currentVideo.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                    <iframe
                      src={currentVideo.youtubeUrl.replace('watch?v=', 'embed/')}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="capitalize">
                        {currentVideo.skillLevel}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {currentVideo.primaryTopic}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {Math.round(currentVideo.duration / 60)} min
                      </span>
                    </div>

                    {!completedVideos.has(currentVideo.id) && (
                      <Button
                        onClick={() => handleVideoComplete(currentVideo.id)}
                        className="bg-gradient-to-r from-champion-green to-emerald-600"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card className="p-12 text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
              <p className="text-muted-foreground">
                Coach Kai is preparing your custom training videos.
              </p>
            </Card>
          )}
        </div>

        {/* Video List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Training Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(videosByDay).map(([day, videos]) => (
                <div key={day}>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Day {day}
                  </h4>
                  <div className="space-y-2">
                    {videos.map((video, index) => {
                      const globalIndex = programVideos.findIndex(v => v.id === video.id)
                      const isCompleted = completedVideos.has(video.id)
                      const isCurrent = currentVideoIndex === globalIndex

                      return (
                        <button
                          key={video.id}
                          onClick={() => handleStartVideo(globalIndex)}
                          className={cn(
                            "w-full text-left p-3 rounded-lg transition-all",
                            isCurrent && "bg-champion-green/10 border-2 border-champion-green",
                            !isCurrent && "bg-gray-50 hover:bg-gray-100",
                            isCompleted && "opacity-60"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-champion-green flex-shrink-0 mt-0.5" />
                            ) : (
                              <Play className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {video.title}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {Math.round(video.duration / 60)} min
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
