
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle2, PlayCircle, Calendar, Clock, Target, ChevronLeft, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Video {
  id: string
  title: string
  url: string
  channel: string
  duration: string
  description: string
  thumbnailUrl?: string
  day: number
  order: number
  watched: boolean
}

interface ProgramViewerProps {
  program: any
  userProgram: any
  userId: string
}

export default function ProgramViewer({ program, userProgram, userId }: ProgramViewerProps) {
  const router = useRouter()
  const [selectedDay, setSelectedDay] = useState(userProgram?.currentDay || 1)
  const [watchingVideo, setWatchingVideo] = useState<Video | null>(null)

  const videosForDay = program.videos?.filter((v: Video) => v.day === selectedDay) || []
  const completedDays = program.videos?.filter((v: Video) => v.watched).map((v: Video) => v.day) || []
  const uniqueCompletedDays = [...new Set(completedDays)].length

  const markVideoWatched = async (videoId: string) => {
    try {
      const response = await fetch('/api/training/videos/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          videoId, 
          watched: true,
          programId: program.id 
        })
      })

      if (response.ok) {
        toast.success('Video marked as watched!')
        router.refresh()
      }
    } catch (error) {
      console.error('Error marking video watched:', error)
      toast.error('Failed to update progress')
    }
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1] || url.split('/').pop()
    return `https://www.youtube.com/embed/${videoId}`
  }

  const progressPercentage = program.videos?.length 
    ? (program.videos.filter((v: Video) => v.watched).length / program.videos.length) * 100
    : 0

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

      {/* Program Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg p-8 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <Badge className="bg-white/20 text-white border-white/30">
              {program.skillLevel}
            </Badge>
            <h1 className="text-4xl font-bold">{program.name}</h1>
            <p className="text-lg text-emerald-100 italic">{program.tagline}</p>
            <p className="text-emerald-50 max-w-2xl">{program.description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <Calendar className="h-5 w-5 mb-2" />
            <div className="text-2xl font-bold">{program.durationDays}</div>
            <div className="text-sm text-emerald-100">Days</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <Clock className="h-5 w-5 mb-2" />
            <div className="text-2xl font-bold">{program.estimatedTimePerDay}</div>
            <div className="text-sm text-emerald-100">Per Day</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <Target className="h-5 w-5 mb-2" />
            <div className="text-2xl font-bold">{uniqueCompletedDays}/{program.durationDays}</div>
            <div className="text-sm text-emerald-100">Days Completed</div>
          </div>
        </div>

        {/* Progress Bar */}
        {userProgram && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-semibold">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3 bg-white/20" />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Day Selector */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Program Days</CardTitle>
            <CardDescription>Select a day to view videos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: program.durationDays }, (_, i) => i + 1).map((day) => {
                const dayVideos = program.videos?.filter((v: Video) => v.day === day) || []
                const allWatched = dayVideos.length > 0 && dayVideos.every((v: Video) => v.watched)
                
                return (
                  <Button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    variant={selectedDay === day ? 'default' : 'outline'}
                    className={`w-full justify-between ${
                      selectedDay === day 
                        ? 'bg-emerald-600 hover:bg-emerald-700' 
                        : ''
                    }`}
                  >
                    <span>Day {day}</span>
                    {allWatched && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    )}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Videos for Selected Day */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-semibold">Day {selectedDay} Videos</h2>
          
          {videosForDay.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <p>No videos scheduled for this day yet.</p>
                <p className="text-sm mt-2">Check back as the program develops!</p>
              </CardContent>
            </Card>
          ) : (
            videosForDay.map((video: Video) => (
              <Card key={video.id} className={`${video.watched ? 'bg-emerald-50 border-emerald-200' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {video.watched && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                        )}
                        {video.title}
                      </CardTitle>
                      <CardDescription>
                        {video.channel} • {video.duration}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{video.description}</p>
                  
                  {/* Video Player */}
                  {watchingVideo?.id === video.id ? (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <iframe
                        src={getYouTubeEmbedUrl(video.url)}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden group cursor-pointer"
                         onClick={() => setWatchingVideo(video)}>
                      {video.thumbnailUrl ? (
                        <img 
                          src={video.thumbnailUrl} 
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-600 to-teal-600">
                          <PlayCircle className="h-20 w-20 text-white opacity-80" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all flex items-center justify-center">
                        <PlayCircle className="h-16 w-16 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    {!video.watched && (
                      <Button
                        onClick={() => markVideoWatched(video.id)}
                        variant="outline"
                        className="flex-1"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark as Watched
                      </Button>
                    )}
                    <Button
                      onClick={() => window.open(video.url, '_blank')}
                      variant="outline"
                      className="flex-1"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Watch on YouTube
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Key Outcomes */}
      {program.keyOutcomes && program.keyOutcomes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>What You'll Learn</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid md:grid-cols-2 gap-3">
              {program.keyOutcomes.map((outcome: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
