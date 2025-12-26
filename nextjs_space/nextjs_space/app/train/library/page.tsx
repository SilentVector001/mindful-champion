
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import TrainingLibrary from '@/components/video-command-center/training-library'

export const metadata = {
  title: 'Video Library | Mindful Champion',
  description: 'Browse our curated collection of high-quality pickleball training videos from top coaches',
}

export default async function VideoLibraryPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/train/library')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Video Library</h1>
          <p className="text-muted-foreground">
            Browse our curated collection of high-quality pickleball training videos
          </p>
        </div>
        <TrainingLibrary />
      </div>
    </div>
  )
}
