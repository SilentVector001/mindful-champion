

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import TrainingVideoPlayer from "@/components/train/training-video-player"

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
  id: string
  watched: boolean
  rating?: number | null
  notes?: string | null
}

interface VideoPlayerClientProps {
  video: TrainingVideo
  relatedVideos: RelatedVideo[]
  userProgress?: UserProgress
  programContext?: {
    programName: string
    currentVideoIndex: number
    totalVideos: number
    nextVideoTitle?: string | null
  }
  programId?: string
}

export default function VideoPlayerClient({
  video,
  relatedVideos,
  userProgress,
  programContext,
  programId
}: VideoPlayerClientProps) {
  const router = useRouter()

  const handleProgressUpdate = async () => {
    // Refresh the page to get updated progress
    router.refresh()
  }

  const handleNextVideo = () => {
    if (programId) {
      router.push(`/train/program/${programId}`)
    }
  }

  return (
    <div>
      {/* Back Navigation */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-champion-green hover:text-champion-green/80 transition-colors"
        >
          ← Back
        </button>
      </div>

      <TrainingVideoPlayer
        video={video}
        relatedVideos={relatedVideos}
        userProgress={userProgress ? {
          watched: userProgress.watched,
          rating: userProgress.rating || undefined,
          notes: userProgress.notes || undefined
        } : undefined}
        onProgressUpdate={handleProgressUpdate}
        onNextVideo={programContext ? handleNextVideo : undefined}
        programContext={programContext ? {
          ...programContext,
          nextVideoTitle: programContext.nextVideoTitle || undefined
        } : undefined}
      />
    </div>
  )
}
