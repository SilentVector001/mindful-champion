
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma as db } from '@/lib/db'
import CustomProgramViewer from '@/components/train/custom-program-viewer'

export const dynamic = 'force-dynamic'

interface CustomProgramPageProps {
  params: { id: string }
}

async function getCustomProgram(programId: string, userId: string) {
  try {
    return await db.customProgram.findFirst({
      where: { 
        id: programId,
        userId: userId // Ensure user owns this custom program
      }
    })
  } catch (error) {
    console.error('Error fetching custom program:', error)
    return null
  }
}

async function getCustomProgramVideos(videoIds: string[]) {
  try {
    const videos = await db.trainingVideo.findMany({
      where: {
        id: {
          in: videoIds
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return videos.map((video: any, index: number) => ({
      id: video.id,
      title: video.title,
      description: video.description,
      youtubeUrl: video.url,
      duration: parseInt(video.duration) || 600,
      dayNumber: Math.floor(index / 2) + 1, // ~2 videos per day
      order: (index % 2) + 1,
      skillLevel: video.skillLevel,
      primaryTopic: video.primaryTopic
    }))
  } catch (error) {
    console.error('Error fetching custom program videos:', error)
    return []
  }
}

export default async function CustomProgramPage({ params }: CustomProgramPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Get custom program data
  const customProgram = await getCustomProgram(params.id, session.user.id)
  
  if (!customProgram) {
    notFound()
  }

  // Get videos for this custom program
  const videoIds = Array.isArray(customProgram.generatedVideoIds) 
    ? customProgram.generatedVideoIds as string[]
    : []
  
  const programVideos = await getCustomProgramVideos(videoIds)

  return (
    <CustomProgramViewer
      user={session.user}
      customProgram={customProgram}
      programVideos={programVideos}
    />
  )
}
