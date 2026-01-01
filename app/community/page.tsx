import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import MainNavigation from "@/components/navigation/main-navigation"
import { CommunityFeed } from "@/components/community"
import Link from "next/link"
import { Video, Bookmark, User, Sparkles, Play } from "lucide-react"

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
  const totalPosts = await prisma.communityPost.count({ 
    where: { isVideoPost: true, isPublished: true } 
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <MainNavigation user={null} />
      <main className="container mx-auto px-4 pt-20 pb-8 max-w-5xl">
        {/* Compact Instagram-style Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                <Play className="w-7 h-7 text-teal-400" />
                Community
              </h1>
              <p className="text-slate-400 text-sm mt-1">Watch. Learn. Share.</p>
            </div>
            
            {/* Inline Stats Badge */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-teal-500/10 to-purple-500/10 border border-teal-500/30 rounded-full px-4 py-2">
              <Video className="w-4 h-4 text-teal-400" />
              <span className="text-white font-semibold">{totalPosts}</span>
              <span className="text-slate-400 text-sm hidden sm:inline">videos</span>
            </div>
          </div>
        </div>

        {/* Quick Access Cards - Instagram Style */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <Link
            href="/community/my-posts"
            className="group relative bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-4 hover:scale-[1.02] hover:border-purple-400/50 transition-all duration-300"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-white font-medium text-sm">My Posts</span>
            </div>
          </Link>

          <Link
            href="/community/saved"
            className="group relative bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-2xl p-4 hover:scale-[1.02] hover:border-amber-400/50 transition-all duration-300"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bookmark className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-white font-medium text-sm">Saved</span>
            </div>
          </Link>

          <Link
            href="/train/video"
            className="group relative bg-gradient-to-br from-teal-600/20 to-cyan-600/20 border border-teal-500/30 rounded-2xl p-4 hover:scale-[1.02] hover:border-teal-400/50 transition-all duration-300"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-teal-400" />
              </div>
              <span className="text-white font-medium text-sm">Upload</span>
            </div>
          </Link>
        </div>

        {/* Feed - Moved Up with Less Spacing */}
        <div className="mt-4">
          <CommunityFeed pageTitle="Latest Videos" />
        </div>
      </main>
    </div>
  )
}
