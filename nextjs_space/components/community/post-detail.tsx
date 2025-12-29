
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  ThumbsUp,
  MessageCircle,
  Bookmark,
  Share2,
  ArrowLeft,
  Send,
  Clock,
  Eye,
  Pin,
  Brain,
  Target,
  Sparkles,
  Award,
  Trophy,
  Zap,
  MessageSquare,
  MoreVertical,
  Flag
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

const CATEGORIES: any = {
  STRATEGY: { label: "Strategy", icon: Brain, color: "text-purple-600" },
  TECHNIQUE: { label: "Technique", icon: Target, color: "text-blue-600" },
  MENTAL_GAME: { label: "Mental Game", icon: Sparkles, color: "text-pink-600" },
  EQUIPMENT: { label: "Equipment", icon: Award, color: "text-amber-600" },
  MATCH_STORIES: { label: "Match Stories", icon: Trophy, color: "text-green-600" },
  TRAINING_TIPS: { label: "Training Tips", icon: Zap, color: "text-orange-600" },
  QUESTIONS: { label: "Questions", icon: MessageSquare, color: "text-indigo-600" },
  CELEBRATIONS: { label: "Celebrations", icon: Trophy, color: "text-yellow-600" },
  GENERAL: { label: "General", icon: MessageCircle, color: "text-slate-600" },
}

interface PostDetailProps {
  post: any
  currentUser: any
}

export default function PostDetail({ post, currentUser }: PostDetailProps) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked)
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)

  const categoryInfo = CATEGORIES[post.category] || CATEGORIES.GENERAL
  const Icon = categoryInfo.icon

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/community/posts/${post.id}/like`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to like post')

      const { liked } = await response.json()
      setIsLiked(liked)
      setLikeCount((prev: number) => liked ? prev + 1 : prev - 1)
      
      if (liked) {
        toast.success('Post liked!')
      }
    } catch (error) {
      console.error('Error liking post:', error)
      toast.error('Failed to like post')
    }
  }

  const handleComment = async () => {
    if (!commentText.trim()) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/community/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentText.trim(),
          parentId: replyTo
        })
      })

      if (!response.ok) throw new Error('Failed to post comment')

      toast.success('Comment posted!')
      setCommentText("")
      setReplyTo(null)
      router.refresh()
    } catch (error) {
      console.error('Error posting comment:', error)
      toast.error('Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/connect/community">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Community
        </Link>
      </Button>

      {/* Post Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={cn(post.isPinned && "border-2 border-cyan-200 bg-cyan-50/50")}>
          <CardHeader>
            <div className="flex items-start gap-4">
              {/* Author Avatar */}
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-semibold text-lg">
                  {post.user.name?.[0] || "U"}
                </div>
              </div>

              {/* Post Header Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {post.isPinned && (
                    <Pin className="w-4 h-4 text-cyan-600" />
                  )}
                  <Badge variant="outline" className="text-xs">
                    <Icon className={cn("w-3 h-3 mr-1", categoryInfo.color)} />
                    {categoryInfo.label}
                  </Badge>
                  <span className="font-medium">{post.user.nickname || post.user.name}</span>
                  {post.user.nickname && post.user.name && (
                    <span className="text-xs text-muted-foreground">({post.user.name})</span>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {post.user.playerRating || post.user.skillLevel}
                  </Badge>
                  {post.user.ageRange && (post.user.ageRange === '10-12' || post.user.ageRange.includes('child')) && (
                    <Badge className="text-[10px] bg-yellow-400 text-yellow-900 hover:bg-yellow-500">
                      Junior Player
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </span>
                </div>

                <CardTitle className="text-2xl mb-3">{post.title}</CardTitle>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{post.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments.length} comments</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Post Content */}
            <div className="prose prose-slate max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>

            <Separator />

            {/* Engagement Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant={isLiked ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                className={cn(
                  isLiked && "bg-gradient-to-r from-cyan-600 to-teal-600"
                )}
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                {likeCount} Likes
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  document.getElementById('comment-input')?.focus()
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Reply
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success('Link copied to clipboard!')
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Comment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Join the Discussion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {replyTo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Replying to a comment</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(null)}
              >
                Cancel
              </Button>
            </div>
          )}

          <Textarea
            id="comment-input"
            placeholder="Share your thoughts..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={4}
            maxLength={2000}
          />

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {commentText.length}/2000 characters
            </p>
            <Button
              onClick={handleComment}
              disabled={isSubmitting || !commentText.trim()}
              className="bg-gradient-to-r from-cyan-600 to-teal-600"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      {post.comments.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
          </h3>

          {post.comments.map((comment: any, idx: number) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <CommentCard
                comment={comment}
                currentUser={currentUser}
                onReply={(commentId: string) => {
                  setReplyTo(commentId)
                  document.getElementById('comment-input')?.focus()
                }}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
          <p className="text-muted-foreground">
            Be the first to share your thoughts!
          </p>
        </Card>
      )}
    </div>
  )
}

function CommentCard({ comment, currentUser, onReply }: any) {
  const isChild = comment.user.ageRange && (comment.user.ageRange === '10-12' || comment.user.ageRange.includes('child'))
  const displayName = comment.user.nickname || comment.user.name
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="shrink-0 relative">
            {comment.user.image ? (
              <img 
                src={comment.user.image} 
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                {displayName?.[0] || "U"}
              </div>
            )}
            {isChild && (
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-yellow-900 text-[9px] font-bold px-1 py-0.5 rounded-full border-2 border-white">
                JR
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-medium">{displayName}</span>
              {comment.user.nickname && comment.user.name && (
                <span className="text-xs text-muted-foreground">({comment.user.name})</span>
              )}
              {comment.user.playerRating && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {comment.user.playerRating}
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>

            <p className="text-sm leading-relaxed mb-3 whitespace-pre-wrap">
              {comment.content}
            </p>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(comment.id)}
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              Reply
            </Button>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 ml-6 space-y-3 border-l-2 border-slate-200 pl-4">
                {comment.replies.map((reply: any) => {
                  const isReplyChild = reply.user.ageRange && (reply.user.ageRange === '10-12' || reply.user.ageRange.includes('child'))
                  const replyDisplayName = reply.user.nickname || reply.user.name
                  
                  return (
                    <div key={reply.id} className="flex gap-3">
                      <div className="shrink-0 relative">
                        {reply.user.image ? (
                          <img 
                            src={reply.user.image} 
                            alt={replyDisplayName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-sm font-semibold">
                            {replyDisplayName?.[0] || "U"}
                          </div>
                        )}
                        {isReplyChild && (
                          <div className="absolute -bottom-0.5 -right-0.5 bg-yellow-400 text-yellow-900 text-[8px] font-bold px-1 py-0.5 rounded-full border border-white">
                            JR
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-medium text-sm">{replyDisplayName}</span>
                          {reply.user.nickname && reply.user.name && (
                            <span className="text-[10px] text-muted-foreground">({reply.user.name})</span>
                          )}
                          {reply.user.playerRating && (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0">
                              {reply.user.playerRating}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                          </span>
                        </div>

                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
