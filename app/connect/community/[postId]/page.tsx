
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import MainNavigation from "@/components/navigation/main-navigation"
import PostDetail from "@/components/community/post-detail"
import AvatarCoach from "@/components/avatar/avatar-coach"

export default async function PostDetailPage({ params }: { params: { postId: string } }) {
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

  // Fetch post with all details
  const post = await prisma.communityPost.findUnique({
    where: { id: params.postId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          skillLevel: true
        }
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        },
        where: {
          parentId: null
        },
        orderBy: {
          createdAt: 'asc'
        }
      },
      likes: {
        where: {
          userId: session.user.id
        }
      },
      bookmarks: {
        where: {
          userId: session.user.id
        }
      }
    }
  })

  if (!post) {
    notFound()
  }

  // Increment view count
  await prisma.communityPost.update({
    where: { id: params.postId },
    data: { views: { increment: 1 } }
  })

  const postWithStatus = {
    ...post,
    isLiked: post.likes.length > 0,
    isBookmarked: post.bookmarks.length > 0
  }

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Champion'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50/30">
      <MainNavigation user={user} />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <PostDetail post={postWithStatus} currentUser={user} />
      </main>

      <AvatarCoach userName={firstName} context="community_post" />
    </div>
  )
}
