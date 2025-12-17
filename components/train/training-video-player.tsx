
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Play, Star, Clock, Award, ChevronRight, SkipForward } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrainingVideo {
  id: string
  videoId: string
  title: string
  url: string
  channel: string
  duration: string
  description: string
  skillLevel: string
  primaryTopic: string
  secondaryTopics?: any
}

interface RelatedVideo {
  id: string
  videoId: string
  title: string
  channel: string
  duration: string
  thumbnailUrl?: string | null
}

interface UserProgress {
  watched: boolean
  rating?: number
  notes?: string
}

interface ProgramContext {
  programName: string
  currentVideoIndex: number
  totalVideos: number
  nextVideoTitle?: string
}

interface TrainingVideoPlayerProps {
  video: TrainingVideo
  relatedVideos: RelatedVideo[]
  userProgress?: UserProgress
  programContext?: ProgramContext
  onProgressUpdate?: () => Promise<void>
  onNextVideo?: () => void
}

// Extract YouTube video ID from various URL formats
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
    /youtube\.com\/watch\?.*v=([^&]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

// Check if URL is a YouTube video
function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

export default function TrainingVideoPlayer({
  video,
  relatedVideos,
  userProgress,
  programContext,
  onProgressUpdate,
  onNextVideo
}: TrainingVideoPlayerProps) {
  const [rating, setRating] = useState(userProgress?.rating || 0)
  const [notes, setNotes] = useState(userProgress?.notes || "")
  const [isWatched, setIsWatched] = useState(userProgress?.watched || false)

  const handleRating = async (newRating: number) => {
    setRating(newRating)
    // You can implement the API call to save rating here
    if (onProgressUpdate) {
      await onProgressUpdate()
    }
  }

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes)
  }

  const handleMarkWatched = async () => {
    setIsWatched(true)
    // You can implement the API call to mark as watched here
    if (onProgressUpdate) {
      await onProgressUpdate()
    }
  }

  return (
    <div className="space-y-6">
      {/* Program Progress */}
      {programContext && (
        <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/50 dark:to-emerald-950/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-teal-900 dark:text-teal-100">
                  {programContext.programName}
                </h3>
                <p className="text-sm text-teal-700 dark:text-teal-300">
                  Video {programContext.currentVideoIndex} of {programContext.totalVideos}
                </p>
              </div>
              {onNextVideo && programContext.nextVideoTitle && (
                <Button onClick={onNextVideo} className="bg-teal-600 hover:bg-teal-700">
                  <SkipForward className="h-4 w-4 mr-2" />
                  Next Video
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Video */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <Play className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                {video.title}
              </CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {video.duration}
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  <Award className="h-3 w-3 mr-1" />
                  {video.skillLevel}
                </Badge>
                <Badge className="text-sm bg-teal-600 text-white">
                  {video.channel}
                </Badge>
                {isWatched && (
                  <Badge className="text-sm bg-green-600 text-white">
                    ✓ Watched
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Player */}
          {isYouTubeUrl(video.url) && getYouTubeVideoId(video.url) ? (
            <div className="aspect-video w-full bg-slate-900 rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(video.url)}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <div className="text-center space-y-3">
                <Play className="h-16 w-16 text-slate-400 mx-auto" />
                <p className="text-slate-600 dark:text-slate-400">Video not available</p>
                <Button
                  onClick={() => window.open(video.url, '_blank')}
                  variant="outline"
                >
                  Open External Link
                </Button>
              </div>
            </div>
          )}

          {/* Video Description */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-white">About This Video</h4>
            <p className="text-slate-600 dark:text-slate-400">{video.description}</p>
            
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>Topic: {video.primaryTopic}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {!isWatched && (
              <Button onClick={handleMarkWatched} className="bg-green-600 hover:bg-green-700">
                Mark as Watched
              </Button>
            )}
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-white">Rate This Video</h4>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className={cn(
                    "p-1 transition-colors",
                    star <= rating
                      ? "text-yellow-400"
                      : "text-slate-300 dark:text-slate-600 hover:text-yellow-400"
                  )}
                >
                  <Star className="h-5 w-5" fill={star <= rating ? "currentColor" : "none"} />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                  {rating} of 5 stars
                </span>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-white">Your Notes</h4>
            <Textarea
              placeholder="Add your notes about this video..."
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Related Videos */}
      {relatedVideos && relatedVideos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Related Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {relatedVideos.map((relatedVideo) => (
                <Card 
                  key={relatedVideo.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.location.href = `/train/video/${relatedVideo.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <Play className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm text-slate-900 dark:text-white truncate">
                          {relatedVideo.title}
                        </h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {relatedVideo.channel} • {relatedVideo.duration}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
