
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import MainNavigation from "@/components/navigation/main-navigation"
import CommunityBoard from "@/components/community/community-board"
import AvatarCoach from "@/components/avatar/avatar-coach"

export default async function CommunityPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) {
    redirect("/auth/signin")
  }

  // Fetch all posts with counts
  const posts = await prisma.communityPost.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          skillLevel: true
        }
      },
      _count: {
        select: {
          comments: true,
          likes: true
        }
      }
    },
    orderBy: [
      { isPinned: 'desc' },
      { createdAt: 'desc' }
    ],
    take: 100
  })

  const postsWithCounts = posts.map(post => ({
    ...post,
    likeCount: post._count.likes,
    commentCount: post._count.comments
  }))

  // Fetch community stats
  const [totalPosts, communityStatsCount, activeTodayCount] = await Promise.all([
    prisma.communityPost.count(),
    prisma.communityStats.count(),
    prisma.communityStats.count({
      where: {
        lastActiveAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })
  ])

  const stats = {
    totalPosts,
    totalMembers: communityStatsCount,
    activeToday: activeTodayCount
  }

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Champion'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50/30">
      <MainNavigation user={user} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <CommunityBoard posts={postsWithCounts} user={user} stats={stats} />
      </main>

      <AvatarCoach userName={firstName} context="community" />
    </div>
  )
}
