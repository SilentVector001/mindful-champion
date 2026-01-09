// @ts-nocheck

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import VideoAnalysisView from '@/components/train/video-analysis-view'

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
  let analysis = null
  try {
    analysis = await prisma.VideoAnalysis.findUnique({
      where: { id: params.analysisId }
    })
  } catch (error) {
    console.error('Error fetching analysis:', error)
  }

  if (!analysis) {
    notFound()
  }

  // Check if user owns this analysis
  if (analysis.userId !== session.user.id) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to view this analysis.</p>
        </div>
      </div>
    )
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      firstName: true,
      email: true,
      image: true,
      subscriptionTier: true
    }
  })

  return <VideoAnalysisView analysis={analysis} user={user} />
}
