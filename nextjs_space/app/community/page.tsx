import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import MainNavigation from "@/components/navigation/main-navigation"
import { CommunityFeed } from "@/components/community"
import Link from "next/link"
import { Video, Bookmark, User, Users, TrendingUp } from "lucide-react"

export const metadata = {
  title: "Community Center | Mindful Champion",
  description: "Share and discover training videos from the pickleball community"
}

export default async function CommunityPage() {
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

  // Get stats
  const [totalPosts, totalUsers] = await Promise.all([
    prisma.communityPost.count({ where: { isVideoPost: true, isPublished: true } }),
    prisma.user.count()
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <MainNavigation user={null} />
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-teal-400" />
            Community Center
          </h1>
          <p className="text-slate-400">Share your training videos and learn from fellow players</p>
        </div>

        {/* Quick Stats & Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-teal-400 mb-1">
              <Video className="w-4 h-4" />
              <span className="text-sm">Videos Shared</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalPosts}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">Members</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalUsers}</p>
          </div>
          <Link
            href="/community/my-posts"
            className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 hover:border-teal-500/30 transition-colors"
          >
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <User className="w-4 h-4" />
              <span className="text-sm">My Posts</span>
            </div>
            <p className="text-sm text-slate-400">View your shared videos</p>
          </Link>
          <Link
            href="/community/saved"
            className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 hover:border-teal-500/30 transition-colors"
          >
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Bookmark className="w-4 h-4" />
              <span className="text-sm">Saved</span>
            </div>
            <p className="text-sm text-slate-400">Your bookmarked posts</p>
          </Link>
        </div>

        {/* Feed */}
        <CommunityFeed pageTitle="Latest Videos" />
      </main>
    </div>
  )
}
