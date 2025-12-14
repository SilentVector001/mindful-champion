
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import VideoAnalysisHub from '@/components/train/video-analysis-hub'

export const metadata = {
  title: 'Video Analysis Lab | Mindful Champion',
  description: 'Upload and analyze your pickleball match videos with AI-powered insights',
}

export default async function VideoAnalysisPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/train/video')
  }

  return <VideoAnalysisHub />
}
