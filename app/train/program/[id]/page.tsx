
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma as db } from '@/lib/db'
import MainNavigation from '@/components/navigation/main-navigation'
import PremiumProgramViewer from '@/components/train/premium-program-viewer'
import AvatarCoach from '@/components/avatar/avatar-coach'

export const dynamic = 'force-dynamic'

interface TrainingProgramPageProps {
  params: { id: string }
}

async function getProgram(programId: string) {
  try {
    const program = await db.trainingProgram.findFirst({
      where: { 
        OR: [
          { id: programId },
          { programId: programId }
        ]
      }
    })
    
    if (!program) return null
    
    // Transform to match expected type
    // Handle both array format and object with days property
    let dailyStructure = []
    if (Array.isArray(program.dailyStructure)) {
      dailyStructure = program.dailyStructure
    } else if (program.dailyStructure && typeof program.dailyStructure === 'object' && 'days' in program.dailyStructure) {
      dailyStructure = (program.dailyStructure as any).days || []
    }
    
    return {
      ...program,
      dailyStructure
    }
  } catch (error) {
    console.error('Error fetching program:', error)
    return null
  }
}

async function getUserProgram(userId: string, programId: string) {
  try {
    const userProgram = await db.userProgram.findFirst({
      where: {
        userId,
        programId
      },
      include: {
        program: true
      }
    })
    
    return userProgram || undefined
  } catch (error) {
    console.error('Error fetching user program:', error)
    return undefined
  }
}

async function getProgramVideos(programId: string) {
  try {
    const programVideos = await db.programVideo.findMany({
      where: { programId },
      include: {
        video: true
      },
      orderBy: [
        { day: 'asc' },
        { order: 'asc' }
      ]
    })

    return programVideos.map((pv: any) => ({
      id: pv.video.id,
      title: pv.video.title,
      description: pv.video.description,
      youtubeUrl: pv.video.url,
      duration: parseInt(pv.video.duration) || 600,
      dayNumber: pv.day,
      order: pv.order,
      skillLevel: pv.video.skillLevel,
      primaryTopic: pv.video.primaryTopic
    }))
  } catch (error) {
    console.error('Error fetching program videos:', error)
    return []
  }
}

export default async function TrainingProgramPage({ params }: TrainingProgramPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) {
    redirect('/auth/signin')
  }

  // Get program data
  const program = await getProgram(params.id)
  if (!program) {
    notFound()
  }

  // Get user's enrollment status
  const userProgram = await getUserProgram(session.user.id, program.id)

  // Get program videos
  const programVideos = await getProgramVideos(program.id)

  // Transform videos to match expected format
  const videos = programVideos.map((video: any) => ({
    id: video.id,
    videoId: video.youtubeUrl?.split('v=')[1]?.split('&')[0] || video.id,
    title: video.title,
    duration: `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`,
    thumbnailUrl: null,
    watched: false, // TODO: Get actual watch status
    difficulty: Math.min(Math.max(Math.floor(Math.random() * 3) + 1, 1), 3)
  }))

  // Action handlers (these would be client-side in a real implementation)
  const handleStartProgram = async () => {
    'use server'
    // This would be implemented client-side
  }

  const handleVideoClick = async (videoId: string) => {
    'use server'
    redirect(`/train/video/${videoId}`)
  }

  const handleMarkDayComplete = async (day: number) => {
    'use server'
    // This would be implemented client-side
  }

  const handlePauseProgram = async () => {
    'use server'
    // This would be implemented client-side
  }

  const handleResumeProgram = async () => {
    'use server'
    // This would be implemented client-side
  }

  const handleUpdateNotes = async (notes: string) => {
    'use server'
    // This would be implemented client-side
  }

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Champion'

  return (
    <div className="min-h-screen">
      <MainNavigation user={user} />
      
      <main>
        <PremiumProgramViewer
          program={program}
          userProgram={userProgram}
          videos={videos}
          user={user}
          onStartProgram={handleStartProgram}
          onVideoClick={handleVideoClick}
          onMarkDayComplete={handleMarkDayComplete}
          onPauseProgram={handlePauseProgram}
          onResumeProgram={handleResumeProgram}
          onUpdateNotes={handleUpdateNotes}
        />
      </main>

      <AvatarCoach userName={firstName} context="training_program" />
    </div>
  )
}
