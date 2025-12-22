"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreVertical,
  Play,
  Flag,
  Pencil,
  Trash2,
  Eye,
  Clock,
  Star,
  Award,
  Trophy,
  Crown,
  Zap,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  Sparkles
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
    subscriptionTier?: string
  }
}

interface CommunityPostCardProps {
  post: {
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
      subscriptionTier?: string
      playerRating?: string
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
  currentUserId?: string
  onLike?: (postId: string) => void
  onSave?: (postId: string) => void
  onComment?: (postId: string) => void
  onShare?: (postId: string) => void
  onReport?: (postId: string) => void
  onEdit?: (postId: string) => void
  onDelete?: (postId: string) => void
}

export function CommunityPostCard({
  post,
  currentUserId,
  onLike,
  onSave,
  onComment,
  onShare,
  onReport,
  onEdit,
  onDelete
}: CommunityPostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false)
  const [isSaved, setIsSaved] = useState(post.isSaved || false)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showAllComments, setShowAllComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  
  const isOwner = currentUserId === post.user.id
  const video = post.videoAnalysis

  // Fetch comments on mount
  useEffect(() => {
    fetchComments()
  }, [post.id])

  const fetchComments = async () => {
    setLoadingComments(true)
    try {
      const res = await fetch(`/api/community/posts/${post.id}/comments`)
      const data = await res.json()
      setComments(data.comments || [])
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setLoadingComments(false)
    }
  }

  const submitComment = async () => {
    if (!newComment.trim() || submittingComment) return
    
    setSubmittingComment(true)
    try {
      const res = await fetch(`/api/community/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment })
      })
      const data = await res.json()
      
      if (data.comment) {
        setComments(prev => [data.comment, ...prev])
        setNewComment("")
        toast.success("Comment added! 💬")
      }
    } catch (error) {
      toast.error("Failed to add comment")
    } finally {
      setSubmittingComment(false)
    }
  }

  // Helper to get subscription badge
  const getSubscriptionBadge = (tier?: string) => {
    if (!tier || tier === 'FREE') return null
    
    const badges = {
      PRO: { icon: Crown, color: "from-amber-400 to-orange-500", text: "PRO" },
      PREMIUM: { icon: Sparkles, color: "from-purple-400 to-pink-500", text: "PREMIUM" },
      TRIAL: { icon: Zap, color: "from-cyan-400 to-blue-500", text: "TRIAL" }
    }
    
    const badge = badges[tier as keyof typeof badges]
    if (!badge) return null
    
    const Icon = badge.icon
    return (
      <Badge className={cn("bg-gradient-to-r", badge.color, "text-white border-0 px-2 py-0.5")}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </Badge>
    )
  }

  // Helper to get skill level badge
  const getSkillBadge = (level?: string, rating?: string) => {
    if (!level) return null
    
    const colors = {
      BEGINNER: "bg-green-500/20 text-green-400 border-green-500/30",
      INTERMEDIATE: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      ADVANCED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      EXPERT: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      PRO: "bg-red-500/20 text-red-400 border-red-500/30"
    }
    
    const color = colors[level as keyof typeof colors] || colors.BEGINNER
    const displayText = rating ? `${rating} • ${level}` : level
    
    return (
      <Badge variant="outline" className={cn("border", color, "text-xs")}>
        <Award className="w-3 h-3 mr-1" />
        {displayText}
      </Badge>
    )
  }

  const handleLike = async () => {
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
    onLike?.(post.id)
  }

  const handleSave = async () => {
    setIsSaved(!isSaved)
    onSave?.(post.id)
    toast.success(isSaved ? "Removed from saved" : "Saved to collection")
  }

  const handleShare = async () => {
    // Create branded share message
    const postUrl = `${window.location.origin}/connect/community/${post.id}`
    const userName = post.user.name || "A player"
    const caption = post.caption || "Check out this training video"
    const videoTitle = video?.title || "pickleball training"
    
    // Format the message with branding
    const shareTitle = "🏓 Mindful Champion Community"
    const shareText = `🎾 ${userName} shared: "${caption.slice(0, 100)}${caption.length > 100 ? '...' : ''}"\n\n✨ Watch and join the discussion!\n\n🚀 Improve your game with AI-powered coaching at mindfulchampion.com`
    
    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: postUrl
        })
        toast.success("Shared successfully! 🎉")
        onShare?.(post.id)
      } catch (err: any) {
        // User cancelled or error occurred
        if (err.name !== 'AbortError') {
          // Fallback to clipboard
          await copyToClipboard(shareText, postUrl)
        }
      }
    } else {
      // Fallback to clipboard copy
      await copyToClipboard(shareText, postUrl)
    }
  }

  const copyToClipboard = async (shareText: string, postUrl: string) => {
    try {
      // Copy formatted text with link
      const fullText = `${shareText}\n\n${postUrl}`
      await navigator.clipboard.writeText(fullText)
      toast.success("📋 Link copied to clipboard!")
      onShare?.(post.id)
    } catch (err) {
      // If clipboard API fails, show the URL for manual copy
      toast.error("Unable to copy. Please manually copy: " + postUrl)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (seconds < 60) return "just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    if (days < 30) return `${Math.floor(days / 7)}w ago`
    return d.toLocaleDateString()
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
  }

  const displayedComments = showAllComments ? comments : comments.slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-slate-900/50 border-slate-700/50 overflow-hidden hover:border-teal-500/30 transition-all">
        {/* Header with User Info & Badges */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <Link href={`/profile/${post.user.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-gradient-to-br from-teal-500 to-cyan-600">
                <AvatarImage src={post.user.image || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-bold">
                  {post.user.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {/* Online status indicator */}
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-white text-base truncate">{post.user.name || "Anonymous"}</p>
                {getSubscriptionBadge(post.user.subscriptionTier)}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {getSkillBadge(post.user.skillLevel, post.user.playerRating)}
                <span className="text-xs text-slate-400">• {formatDate(post.createdAt)}</span>
              </div>
            </div>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white shrink-0">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              {isOwner && (
                <>
                  <DropdownMenuItem onClick={() => onEdit?.(post.id)} className="text-slate-300 hover:text-white">
                    <Pencil className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete?.(post.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </>
              )}
              {!isOwner && (
                <DropdownMenuItem onClick={() => onReport?.(post.id)} className="text-slate-300 hover:text-white">
                  <Flag className="w-4 h-4 mr-2" /> Report
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CardContent className="p-0 space-y-0">
          {/* Compact Video Section - 40% of card */}
          {video && (
            <div className="relative w-full bg-slate-950" style={{ aspectRatio: '16/9', maxHeight: '400px' }}>
              {isPlaying ? (
                <video
                  src={video.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  {video.thumbnailUrl ? (
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
                      <div className="text-center">
                        <Play className="w-16 h-16 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">{video.title}</p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
                    aria-label="Play video"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-teal-500/30">
                      <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                    </div>
                  </button>
                  {/* Duration badge */}
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1.5 shadow-lg">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDuration(video.duration)}
                  </div>
                  {/* AI Score badge */}
                  {video.overallScore && (
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-bold flex items-center gap-1.5 shadow-lg">
                      <Trophy className="w-4 h-4" fill="currentColor" />
                      {video.overallScore}/100
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Caption & Content */}
          <div className="p-4 space-y-3">
            {/* Prominent View Count & Engagement Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
                <Eye className="w-4 h-4" />
                <span>{formatViews(post.views)} views</span>
              </div>
              <div className="flex items-center gap-1.5 text-red-400 font-semibold">
                <Heart className="w-4 h-4" />
                <span>{likeCount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                <MessageCircle className="w-4 h-4" />
                <span>{comments.length}</span>
              </div>
            </div>

            {/* Caption */}
            {post.caption && (
              <div className="text-slate-200 text-sm leading-relaxed">
                <span className="font-semibold text-white mr-2">{post.user.name}</span>
                {post.caption}
              </div>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map(tag => (
                  <Badge key={tag} className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-400 hover:from-teal-500/30 hover:to-cyan-500/30 border-teal-500/30 text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-4 pb-3 flex items-center justify-between border-t border-slate-700/30 pt-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={cn(
                  "text-slate-400 hover:text-red-400 transition-colors",
                  isLiked && "text-red-500"
                )}
              >
                <Heart className={cn("w-5 h-5 mr-1.5 transition-all", isLiked && "fill-current scale-110")} />
                <span className="font-medium">Like</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onComment?.(post.id)}
                className="text-slate-400 hover:text-blue-400 transition-colors"
              >
                <MessageCircle className="w-5 h-5 mr-1.5" />
                <span className="font-medium">Comment</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <Share2 className="w-5 h-5 mr-1.5" />
                <span className="font-medium">Share</span>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              className={cn(
                "text-slate-400 hover:text-amber-400 transition-colors",
                isSaved && "text-amber-500"
              )}
            >
              <Bookmark className={cn("w-5 h-5 transition-all", isSaved && "fill-current scale-110")} />
            </Button>
          </div>

          {/* Comments Section - Visible by Default */}
          <div className="border-t border-slate-700/30">
            {/* Add Comment Input */}
            <div className="p-4 bg-slate-800/30">
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="bg-slate-900/70 border-slate-600/50 text-white placeholder:text-slate-500 min-h-[44px] max-h-[120px] resize-none text-sm focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      submitComment()
                    }
                  }}
                />
                <Button
                  onClick={submitComment}
                  disabled={!newComment.trim() || submittingComment}
                  size="icon"
                  className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 h-[44px] w-[44px] shrink-0 shadow-lg shadow-teal-500/20"
                >
                  {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Comments List */}
            {loadingComments ? (
              <div className="flex justify-center py-6 bg-slate-800/20">
                <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
              </div>
            ) : comments.length > 0 ? (
              <div className="px-4 pb-4 space-y-3 bg-slate-800/20">
                <AnimatePresence>
                  {displayedComments.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-3 py-2"
                    >
                      <Avatar className="h-8 w-8 border border-slate-700/50 shrink-0">
                        <AvatarImage src={comment.user.image || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-teal-600 to-cyan-700 text-white text-xs font-medium">
                          {comment.user.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="bg-slate-800/50 rounded-2xl px-3 py-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white text-sm">{comment.user.name || "Anonymous"}</span>
                            {getSubscriptionBadge(comment.user.subscriptionTier)}
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed break-words">{comment.content}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-1 ml-3">
                          <span className="text-xs text-slate-500">{formatDate(comment.createdAt)}</span>
                          <button className="text-xs text-slate-500 hover:text-teal-400 font-medium transition-colors">
                            Like
                          </button>
                          <button className="text-xs text-slate-500 hover:text-teal-400 font-medium transition-colors">
                            Reply
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* View More/Less Comments Button */}
                {comments.length > 3 && (
                  <button
                    onClick={() => setShowAllComments(!showAllComments)}
                    className="w-full py-2 text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors flex items-center justify-center gap-2"
                  >
                    {showAllComments ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        View all {comments.length} comments
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="px-4 py-6 text-center bg-slate-800/20">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm text-slate-400">No comments yet. Be the first!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
