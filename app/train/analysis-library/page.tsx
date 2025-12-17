
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import VideoLibrary from '@/components/train/video-library'

export const metadata = {
  title: 'Video Analysis Library | Mindful Champion',
  description: 'View and manage your saved video analyses',
}

export default async function VideoAnalysisLibraryPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/train/analysis-library')
  }

  return <VideoLibrary />
}
