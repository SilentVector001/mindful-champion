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

  // Get stats - Get user's stats
  const [totalPosts, userPosts, savedPosts] = await Promise.all([
    prisma.communityPost.count({ where: { isVideoPost: true, isPublished: true } }),
    prisma.communityPost.count({ where: { userId: user.id, isVideoPost: true, isPublished: true } }),
    prisma.postBookmark.count({ where: { userId: user.id } })
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <MainNavigation user={null} />
      <main className="container mx-auto px-4 py-6 pt-20">
        {/* Compact Modern Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 flex items-center gap-2">
              <Users className="w-6 h-6 md:w-7 md:h-7 text-teal-400" />
              Community Center
            </h1>
            <p className="text-sm text-slate-400">Share and discover training videos</p>
          </div>
          
          {/* Trending Badge */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-full px-3 py-1.5">
            <TrendingUp className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-medium text-pink-400">Live</span>
          </div>
        </div>

        {/* Compact Stats Bar - Instagram/TikTok Style */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* Videos Shared - Total */}
          <div className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20 rounded-2xl p-3 text-center hover:scale-105 transition-transform cursor-default">
            <div className="flex items-center justify-center gap-1.5 text-teal-400 mb-1">
              <Video className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Videos Shared</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-white">{totalPosts}</p>
          </div>
          
          {/* My Posts */}
          <Link
            href="/community/my-posts"
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-3 text-center hover:scale-105 transition-all hover:border-purple-500/40"
          >
            <div className="flex items-center justify-center gap-1.5 text-purple-400 mb-1">
              <User className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">My Posts</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-white">{userPosts}</p>
          </Link>
          
          {/* Saved */}
          <Link
            href="/community/saved"
            className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-3 text-center hover:scale-105 transition-all hover:border-amber-500/40"
          >
            <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
              <Bookmark className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Saved</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-white">{savedPosts}</p>
          </Link>
        </div>

        {/* Feed */}
        <CommunityFeed pageTitle="Latest Videos" />
      </main>
    </div>
  )
}
