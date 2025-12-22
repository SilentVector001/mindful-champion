import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import MainNavigation from "@/components/navigation/main-navigation"
import { CommunityFeed } from "@/components/community"
import Link from "next/link"
import { ArrowLeft, User, Video } from "lucide-react"

export const metadata = {
  title: "My Posts | Mindful Champion",
  description: "Your shared community videos"
}

export default async function MyPostsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    redirect("/auth/signin")
  }

  // Fetch user's posts
  const posts = await prisma.communityPost.findMany({
    where: {
      userId: user.id,
      isVideoPost: true
    },
    include: {
      user: {
        select: { id: true, name: true, image: true, skillLevel: true }
      },
      videoAnalysis: {
        select: {
          id: true,
          videoUrl: true,
          thumbnailUrl: true,
          title: true,
          duration: true,
          overallScore: true
        }
      },
      _count: {
        select: { comments: true, likes: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  const myPosts = posts.map(p => ({
    ...p,
    isLiked: false,
    isSaved: false,
    likeCount: p._count.likes,
    commentCount: p._count.comments
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <MainNavigation />
      <main className="container mx-auto px-4 py-8 pt-24">
        <Link href="/community" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Community
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <User className="w-8 h-8 text-purple-400" />
            My Shared Videos
          </h1>
          <p className="text-slate-400">Videos you've shared with the community</p>
        </div>

        {myPosts.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 border border-slate-700/50 rounded-xl">
            <Video className="w-12 h-12 mx-auto mb-4 text-slate-500" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No videos shared yet</h3>
            <p className="text-slate-400 mb-4">Share your first training video from Video Analysis!</p>
            <Link
              href="/train/video-analysis"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
            >
              <Video className="w-4 h-4" /> Go to Video Analysis
            </Link>
          </div>
        ) : (
          <CommunityFeed initialPosts={myPosts} showFilters={false} />
        )}
      </main>
    </div>
  )
}
