
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import VideoAnalysisDetail from '@/components/train/video-analysis-detail'

export default async function VideoAnalysisDetailPage({ 
  params 
}: { 
  params: { analysisId: string } 
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/train/analysis/' + params.analysisId)
  }

  // Fetch the video analysis
  const analysis = await prisma.videoAnalysis.findUnique({
    where: { id: params.analysisId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })

  if (!analysis) {
    notFound()
  }

  // Check if user owns this analysis
  if (analysis.userId !== session.user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to view this analysis.</p>
        </div>
      </div>
    )
  }

  return <VideoAnalysisDetail videoId={analysis.id} />
}
