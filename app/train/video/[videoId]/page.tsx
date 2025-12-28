
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import MainNavigation from "@/components/navigation/main-navigation"
import VideoPlayerClient from "./video-player-client"
import AvatarCoach from "@/components/avatar/avatar-coach"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function VideoDetailPage({ params }: { params: { videoId: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) {
    redirect("/auth/signin")
  }

  // Fetch the training video
  const video = await prisma.trainingVideo.findUnique({
    where: { id: params.videoId },
    include: {
      userVideoProgress: {
        where: { userId: session.user.id }
      }
    }
  })

  if (!video) {
    notFound()
  }

  const userProgress = video.userVideoProgress[0] || null
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Champion'

  // Fetch related videos
  const relatedVideos = await prisma.trainingVideo.findMany({
    where: {
      id: { not: params.videoId },
      skillLevel: video.skillLevel,
    },
    select: {
      id: true,
      videoId: true,
      title: true,
      channel: true,
      duration: true,
      thumbnailUrl: true
    },
    take: 6
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-champion-green/5 dark:from-champion-charcoal dark:via-gray-900 dark:to-champion-green/5">
      <MainNavigation user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            asChild
          >
            <Link href="/train/library">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Video Library
            </Link>
          </Button>
        </div>

        <VideoPlayerClient 
          video={video} 
          relatedVideos={relatedVideos}
          userProgress={userProgress}
        />
      </main>

      <AvatarCoach userName={firstName} context="video_training" />
    </div>
  )
}
