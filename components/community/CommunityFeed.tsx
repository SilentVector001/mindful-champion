"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Filter, RefreshCw, Video, Users, TrendingUp } from "lucide-react"
import { CommunityPostCard } from "./CommunityPostCard"
import { CommentSection } from "./CommentSection"
import { ReportModal } from "./ReportModal"
import { toast } from "sonner"

const SKILL_TAGS = [
  "serve", "dink", "third-shot-drop", "footwork", "strategy",
  "volleys", "resets", "lobs", "erne", "around-the-post"
]

interface Post {
  id: string
  caption?: string
  tags: string[]
  createdAt: string
  views: number
  likeCount: number
  commentCount: number
  isLiked?: boolean
  isSaved?: boolean
  user: {
    id: string
    name: string | null
    image: string | null
    skillLevel?: string
  }
  videoAnalysis?: {
    id: string
    videoUrl: string
    thumbnailUrl?: string | null
    title: string
    duration: number
    overallScore?: number | null
  } | null
}

interface CommunityFeedProps {
  initialPosts?: Post[]
  showFilters?: boolean
  userId?: string
  pageTitle?: string
}

export function CommunityFeed({ initialPosts, showFilters = true, userId, pageTitle }: CommunityFeedProps) {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>(initialPosts || [])
  const [loading, setLoading] = useState(!initialPosts)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null)
  const [reportingPostId, setReportingPostId] = useState<string | null>(null)
  const [showFilterExpanded, setShowFilterExpanded] = useState(false)

  const fetchPosts = useCallback(async (reset = false) => {
    try {
      setLoading(true)
      const currentPage = reset ? 1 : page
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10"
      })
      if (selectedTag) params.set("tag", selectedTag)
      if (userId) params.set("userId", userId)

      const res = await fetch(`/api/community/posts?${params}`)
      const data = await res.json()

      if (data.posts) {
        if (reset) {
          setPosts(data.posts)
          setPage(1)
        } else {
          setPosts(prev => [...prev, ...data.posts])
        }
        setHasMore(data.pagination.page < data.pagination.totalPages)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast.error("Failed to load posts")
    } finally {
      setLoading(false)
    }
  }, [page, selectedTag, userId])

  useEffect(() => {
    if (!initialPosts) {
      fetchPosts(true)
    }
  }, [selectedTag])

  const handleLike = async (postId: string) => {
    try {
      await fetch(`/api/community/posts/${postId}/like`, { method: "POST" })
    } catch (error) {
      toast.error("Failed to like post")
    }
  }

  const handleSave = async (postId: string) => {
    try {
      await fetch(`/api/community/posts/${postId}/save`, { method: "POST" })
    } catch (error) {
      toast.error("Failed to save post")
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return
    try {
      await fetch(`/api/community/posts/${postId}`, { method: "DELETE" })
      setPosts(prev => prev.filter(p => p.id !== postId))
      toast.success("Post deleted")
    } catch (error) {
      toast.error("Failed to delete post")
    }
  }

  const handleReport = async (postId: string, reason: string) => {
    try {
      await fetch(`/api/community/posts/${postId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason })
      })
      toast.success("Report submitted. Thank you!")
      setReportingPostId(null)
    } catch (error) {
      toast.error("Failed to submit report")
    }
  }

  const loadMore = () => {
    setPage(prev => prev + 1)
    fetchPosts()
  }

  return (
    <div className="space-y-4">
      {/* Compact Header with Filter Toggle */}
      {pageTitle && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-teal-400" />
            {pageTitle}
          </h2>
          <div className="flex items-center gap-2">
            {showFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilterExpanded(!showFilterExpanded)}
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <Filter className="w-4 h-4 mr-1" />
                {showFilterExpanded ? 'Hide' : 'Filter'}
                {selectedTag && !showFilterExpanded && (
                  <Badge className="ml-2 bg-teal-500 text-white text-[10px] px-1.5 py-0">
                    #{selectedTag}
                  </Badge>
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchPosts(true)}
              className="text-slate-400 hover:text-white hover:bg-slate-800/50"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Collapsible Tag Filters - Compact */}
      <AnimatePresence>
        {showFilters && showFilterExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-slate-900/30 border-slate-700/30 overflow-hidden">
              <CardContent className="p-3">
                <div className="flex flex-wrap gap-1.5">
                  <Badge
                    variant={selectedTag === null ? "default" : "secondary"}
                    className={selectedTag === null 
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white cursor-pointer text-xs"
                      : "bg-slate-700/50 text-slate-300 cursor-pointer hover:bg-slate-600/50 text-xs"
                    }
                    onClick={() => setSelectedTag(null)}
                  >
                    All
                  </Badge>
                  {SKILL_TAGS.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTag === tag ? "default" : "secondary"}
                      className={selectedTag === tag
                        ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white cursor-pointer text-xs"
                        : "bg-slate-700/50 text-slate-300 cursor-pointer hover:bg-slate-600/50 text-xs"
                      }
                      onClick={() => setSelectedTag(tag)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts - Grid Layout for compact cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {posts.map(post => (
            <div key={post.id}>
              <CommunityPostCard
                post={post}
                currentUserId={session?.user?.id}
                onLike={handleLike}
                onSave={handleSave}
                onComment={(id) => setCommentingPostId(id)}
                onReport={(id) => setReportingPostId(id)}
                onDelete={handleDelete}
                compact={true}
              />
              {commentingPostId === post.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2"
                >
                  <CommentSection
                    postId={post.id}
                    onClose={() => setCommentingPostId(null)}
                  />
                </motion.div>
              )}
            </div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="col-span-full flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        )}

        {!loading && posts.length === 0 && (
          <Card className="col-span-full bg-slate-900/50 border-slate-700/50">
            <CardContent className="py-12 text-center">
              <Video className="w-12 h-12 mx-auto mb-4 text-slate-500" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No videos shared yet</h3>
              <p className="text-slate-400">Be the first to share your training videos!</p>
            </CardContent>
          </Card>
        )}

        {hasMore && !loading && posts.length > 0 && (
          <div className="col-span-full flex justify-center">
            <Button onClick={loadMore} variant="outline" className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10">
              Load more
            </Button>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {reportingPostId && (
        <ReportModal
          onSubmit={(reason) => handleReport(reportingPostId, reason)}
          onClose={() => setReportingPostId(null)}
        />
      )}
    </div>
  )
}
