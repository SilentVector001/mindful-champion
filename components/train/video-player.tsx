"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, ExternalLink, Clock, Award } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface VideoDemo {
  title: string
  url: string
  duration: string
  description: string
  skillLevel: string
  channel?: string
}

interface VideoPlayerProps {
  videos: VideoDemo[]
  drillName: string
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

// Check if URL is a YouTube playlist
function isYouTubePlaylist(url: string): boolean {
  return url.includes('youtube.com/playlist') || url.includes('list=')
}

export default function VideoPlayer({ videos, drillName }: VideoPlayerProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoDemo | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const openVideo = (video: VideoDemo) => {
    setSelectedVideo(video)
    setIsDialogOpen(true)
  }

  const closeVideo = () => {
    setIsDialogOpen(false)
    setTimeout(() => setSelectedVideo(null), 300) // Delay to allow dialog animation
  }

  if (!videos || videos.length === 0) {
    return null
  }

  return (
    <>
      <div className="mt-4 space-y-3">
        <h4 className="font-semibold text-sm flex items-center gap-2 text-teal-900 dark:text-teal-100">
          <Play className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          Video Demonstrations ({videos.length})
        </h4>
        
        <div className="space-y-2">
          {videos.map((video, idx) => {
            const isYouTube = isYouTubeUrl(video.url)
            const isPlaylist = isYouTubePlaylist(video.url)
            
            return (
              <Card 
                key={idx}
                className="bg-slate-50 dark:bg-gray-800/50 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer border-slate-200 dark:border-gray-700"
                onClick={() => openVideo(video)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Play className="h-3 w-3 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                        <h5 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {video.title}
                        </h5>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {video.description}
                      </p>
                      <div className="flex flex-wrap gap-2 items-center">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-2.5 w-2.5 mr-1" />
                          {video.duration}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Award className="h-2.5 w-2.5 mr-1" />
                          {video.skillLevel}
                        </Badge>
                        {video.channel && (
                          <span className="text-xs text-slate-500 dark:text-gray-500">
                            {video.channel}
                          </span>
                        )}
                        {isPlaylist && (
                          <Badge className="text-xs bg-purple-600 text-white">
                            Playlist
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                        <Play className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Video Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeVideo}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedVideo && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Play className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  {selectedVideo.title}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {drillName} - Video Demonstration
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Video Embed or Link */}
                {isYouTubeUrl(selectedVideo.url) && !isYouTubePlaylist(selectedVideo.url) && getYouTubeVideoId(selectedVideo.url) ? (
                  <div className="aspect-video w-full bg-slate-900 rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedVideo.url)}`}
                      title={selectedVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/50 dark:to-emerald-950/50 p-6 rounded-lg border-2 border-dashed border-teal-200 dark:border-teal-800">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto">
                        <ExternalLink className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white mb-2">
                          {isYouTubePlaylist(selectedVideo.url) ? "YouTube Playlist" : "External Video Link"}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">
                          {isYouTubePlaylist(selectedVideo.url) 
                            ? "This is a YouTube playlist with multiple videos. Click below to watch on YouTube."
                            : "This video is hosted externally. Click below to watch it on the source website."}
                        </p>
                        <Button
                          onClick={() => window.open(selectedVideo.url, '_blank')}
                          className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Watch Video
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Video Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">About This Video</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-slate-600 dark:text-gray-400">
                      {selectedVideo.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-sm">
                        <Clock className="h-3 w-3 mr-1" />
                        Duration: {selectedVideo.duration}
                      </Badge>
                      <Badge variant="secondary" className="text-sm">
                        <Award className="h-3 w-3 mr-1" />
                        Skill Level: {selectedVideo.skillLevel}
                      </Badge>
                      {selectedVideo.channel && (
                        <Badge className="text-sm bg-teal-600 text-white">
                          {selectedVideo.channel}
                        </Badge>
                      )}
                    </div>

                    {!isYouTubeUrl(selectedVideo.url) && (
                      <div className="pt-3 border-t border-slate-200 dark:border-gray-700">
                        <Button
                          variant="outline"
                          onClick={() => window.open(selectedVideo.url, '_blank')}
                          className="w-full"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in New Tab
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
