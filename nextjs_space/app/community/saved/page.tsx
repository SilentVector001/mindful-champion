import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import MainNavigation from "@/components/navigation/main-navigation"
import { CommunityFeed } from "@/components/community"
import Link from "next/link"
import { ArrowLeft, Bookmark } from "lucide-react"

export const metadata = {
  title: "Saved Videos | Mindful Champion",
  description: "Your saved community videos"
}

export default async function SavedPostsPage() {
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

  // Fetch saved posts
  const bookmarks = await prisma.postBookmark.findMany({
    where: {
      userId: user.id,
      post: {
        isVideoPost: true
      }
    },
    include: {
      post: {
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
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  const savedPosts = bookmarks
    ?.filter(b => b?.post?.isVideoPost ?? false)
    ?.map(b => ({
      ...(b?.post ?? {}),
      isLiked: false,
      isSaved: true,
      likeCount: b?.post?._count?.likes ?? 0,
      commentCount: b?.post?._count?.comments ?? 0
    })) ?? []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <MainNavigation user={null} />
      <main className="container mx-auto px-4 py-8 pt-24">
        <Link href="/community" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Community
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-amber-400" />
            Saved Videos
          </h1>
          <p className="text-slate-400">Videos you've bookmarked for later</p>
        </div>

        <CommunityFeed initialPosts={savedPosts as any} showFilters={false} />
      </main>
    </div>
  )
}
