// @ts-nocheck
"use client"

import { useState, useEffect, useMemo } from "react"
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
  Trophy,
  Crown,
  Zap,
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

// Emoji reactions available
const EMOJI_REACTIONS = [
  { emoji: "🆒", label: "Cool" },
  { emoji: "❤️", label: "Love" },
  { emoji: "👏", label: "Nice" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "😂", label: "Funny" }
]

// Color palette for user avatars/names
const USER_COLORS = [
  { bg: "from-rose-500 to-pink-600", border: "border-rose-400", text: "text-rose-400" },
  { bg: "from-violet-500 to-purple-600", border: "border-violet-400", text: "text-violet-400" },
  { bg: "from-blue-500 to-cyan-600", border: "border-blue-400", text: "text-blue-400" },
  { bg: "from-emerald-500 to-teal-600", border: "border-emerald-400", text: "text-emerald-400" },
  { bg: "from-amber-500 to-orange-600", border: "border-amber-400", text: "text-amber-400" },
  { bg: "from-red-500 to-rose-600", border: "border-red-400", text: "text-red-400" },
  { bg: "from-indigo-500 to-blue-600", border: "border-indigo-400", text: "text-indigo-400" },
  { bg: "from-fuchsia-500 to-pink-600", border: "border-fuchsia-400", text: "text-fuchsia-400" },
  { bg: "from-lime-500 to-green-600", border: "border-lime-400", text: "text-lime-400" },
  { bg: "from-cyan-500 to-teal-600", border: "border-cyan-400", text: "text-cyan-400" },
]

// Get consistent color for a user based on their ID
function getUserColor(userId: string) {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length]
}

interface Reaction {
  emoji: string
  count: number
  userReacted: boolean
}

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
  reactions?: Reaction[]
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
  compact?: boolean
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
  onDelete,
  compact = true
}: CommunityPostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false)
  const [isSaved, setIsSaved] = useState(post.isSaved || false)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [isPlaying, setIsPlaying] = useState(false)
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

  const handleReaction = async (commentId: string, emoji: string) => {
    try {
      const res = await fetch(`/api/community/comments/${commentId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji })
      })
      const data = await res.json()
      
      if (data.success) {
        // Update local state
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            const existingReactions = comment.reactions || []
            const reactionIndex = existingReactions.findIndex(r => r.emoji === emoji)
            
            if (data.action === 'added') {
              if (reactionIndex >= 0) {
                existingReactions[reactionIndex].count++
                existingReactions[reactionIndex].userReacted = true
              } else {
                existingReactions.push({ emoji, count: 1, userReacted: true })
              }
            } else if (data.action === 'removed') {
              if (reactionIndex >= 0) {
                existingReactions[reactionIndex].count--
                existingReactions[reactionIndex].userReacted = false
                if (existingReactions[reactionIndex].count <= 0) {
                  existingReactions.splice(reactionIndex, 1)
                }
              }
            }
            return { ...comment, reactions: [...existingReactions] }
          }
          return comment
        }))
      }
    } catch (error) {
      console.error("Error toggling reaction:", error)
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
    const postUrl = `${window.location.origin}/connect/community/${post.id}`
    const userName = post.user.name || "A player"
    const caption = post.caption || "Check out this training video"
    
    const shareTitle = "🏓 Mindful Champion Community"
    const shareText = `🎾 ${userName} shared: "${caption.slice(0, 100)}${caption.length > 100 ? '...' : ''}"\n\n✨ Watch and join the discussion!\n\n🚀 Improve your game at mindfulchampion.com`
    
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: postUrl })
        toast.success("Shared successfully! 🎉")
        onShare?.(post.id)
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          await copyToClipboard(shareText, postUrl)
        }
      }
    } else {
      await copyToClipboard(shareText, postUrl)
    }
  }

  const copyToClipboard = async (shareText: string, postUrl: string) => {
    try {
      const fullText = `${shareText}\n\n${postUrl}`
      await navigator.clipboard.writeText(fullText)
      toast.success("📋 Link copied to clipboard!")
      onShare?.(post.id)
    } catch (err) {
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

  // Comment component with color coding and reactions
  const CommentItem = ({ comment, isCompact = false }: { comment: Comment; isCompact?: boolean }) => {
    const [showReactions, setShowReactions] = useState(false)
    const userColor = getUserColor(comment.user.id)
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("flex gap-2", isCompact ? "py-1" : "py-2")}
      >
        <Avatar className={cn(
          "shrink-0 border-2",
          userColor.border,
          isCompact ? "h-6 w-6" : "h-8 w-8"
        )}>
          <AvatarImage src={comment.user.image || undefined} />
          <AvatarFallback className={cn("bg-gradient-to-br text-white font-bold", userColor.bg, isCompact ? "text-xs" : "text-sm")}>
            {comment.user.name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className={cn(
            "bg-slate-800/60 rounded-2xl px-3",
            isCompact ? "py-1.5" : "py-2"
          )}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn("font-semibold", userColor.text, isCompact ? "text-xs" : "text-sm")}>
                {comment.user.name || "Anonymous"}
              </span>
              {!isCompact && getSubscriptionBadge(comment.user.subscriptionTier)}
            </div>
            <p className={cn("text-slate-300 break-words", isCompact ? "text-xs" : "text-sm")}>
              {comment.content}
            </p>
          </div>
          
          {/* Reactions row */}
          <div className="flex items-center gap-2 mt-1 ml-2 flex-wrap">
            <span className="text-xs text-slate-500">{formatDate(comment.createdAt)}</span>
            
            {/* Existing reactions */}
            {comment.reactions && comment.reactions.length > 0 && (
              <div className="flex items-center gap-1">
                {comment.reactions.map((reaction) => (
                  <motion.button
                    key={reaction.emoji}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleReaction(comment.id, reaction.emoji)}
                    className={cn(
                      "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-all",
                      reaction.userReacted 
                        ? "bg-teal-500/30 border border-teal-400/50" 
                        : "bg-slate-700/50 hover:bg-slate-600/50"
                    )}
                  >
                    <span>{reaction.emoji}</span>
                    <span className="text-slate-300">{reaction.count}</span>
                  </motion.button>
                ))}
              </div>
            )}
            
            {/* Add reaction button */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setShowReactions(!showReactions)}
                className="text-xs text-slate-500 hover:text-teal-400 transition-colors px-1"
              >
                {showReactions ? "×" : "😊+"}
              </motion.button>
              
              <AnimatePresence>
                {showReactions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -5 }}
                    className="absolute bottom-full left-0 mb-1 flex gap-1 bg-slate-800 border border-slate-600 rounded-full px-2 py-1 shadow-lg z-10"
                  >
                    {EMOJI_REACTIONS.map((reaction) => (
                      <motion.button
                        key={reaction.emoji}
                        whileHover={{ scale: 1.3, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          handleReaction(comment.id, reaction.emoji)
                          setShowReactions(false)
                        }}
                        className="text-lg hover:bg-slate-700 rounded-full p-0.5 transition-colors"
                        title={reaction.label}
                      >
                        {reaction.emoji}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Compact card layout (social media style) - comments shown by default
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="bg-slate-900/50 border-slate-700/50 overflow-hidden hover:border-teal-500/30 transition-all">
          {/* Compact Header */}
          <div className="flex items-center justify-between px-3 py-2">
            <Link href={`/profile/${post.user.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-1 min-w-0">
              <Avatar className={cn("h-8 w-8 border-2", getUserColor(post.user.id).border)}>
                <AvatarImage src={post.user.image || undefined} />
                <AvatarFallback className={cn("bg-gradient-to-br text-white text-xs font-bold", getUserColor(post.user.id).bg)}>
                  {post.user.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className={cn("font-semibold text-sm truncate", getUserColor(post.user.id).text)}>
                    {post.user.name || "Anonymous"}
                  </p>
                  {getSubscriptionBadge(post.user.subscriptionTier)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  {post.user.playerRating && <span>{post.user.playerRating}</span>}
                  <span>• {formatDate(post.createdAt)}</span>
                </div>
              </div>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                {isOwner ? (
                  <>
                    <DropdownMenuItem onClick={() => onEdit?.(post.id)} className="text-slate-300 text-sm">
                      <Pencil className="w-3 h-3 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete?.(post.id)} className="text-red-400 text-sm">
                      <Trash2 className="w-3 h-3 mr-2" /> Delete
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => onReport?.(post.id)} className="text-slate-300 text-sm">
                    <Flag className="w-3 h-3 mr-2" /> Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Compact Video */}
          {video && (
            <div className="relative w-full bg-slate-950" style={{ aspectRatio: '16/9', maxHeight: '180px' }}>
              {isPlaying ? (
                <video src={video.videoUrl} controls autoPlay className="w-full h-full object-cover" />
              ) : (
                <>
                  {video.thumbnailUrl ? (
                    <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover" sizes="300px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                      <Play className="w-10 h-10 text-slate-600" />
                    </div>
                  )}
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                    </div>
                  </button>
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(video.duration)}
                  </div>
                  {video.overallScore && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      {video.overallScore}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Compact Content */}
          <div className="px-3 py-2 space-y-1.5">
            {post.caption && (
              <p className="text-slate-200 text-sm line-clamp-2">
                <span className={cn("font-semibold mr-1", getUserColor(post.user.id).text)}>
                  {post.user.name}
                </span>
                {post.caption}
              </p>
            )}

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.slice(0, 4).map(tag => (
                  <Badge key={tag} className="bg-teal-500/20 text-teal-400 border-0 text-xs px-1.5 py-0">
                    #{tag}
                  </Badge>
                ))}
                {post.tags.length > 4 && (
                  <Badge className="bg-slate-700/50 text-slate-400 border-0 text-xs px-1.5 py-0">
                    +{post.tags.length - 4}
                  </Badge>
                )}
              </div>
            )}

            {/* Stats & Actions Row */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-700/30">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {formatViews(post.views)}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" /> {likeCount}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" /> {comments.length}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon" onClick={handleLike} className={cn("h-7 w-7", isLiked ? "text-red-500" : "text-slate-400 hover:text-red-400")}>
                  <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleShare} className="h-7 w-7 text-slate-400 hover:text-cyan-400">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSave} className={cn("h-7 w-7", isSaved ? "text-amber-500" : "text-slate-400 hover:text-amber-400")}>
                  <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
                </Button>
              </div>
            </div>
          </div>

          {/* Comments Section - ALWAYS VISIBLE */}
          <div className="border-t border-slate-700/30">
            {/* Add Comment Input */}
            <div className="p-2 bg-slate-800/30">
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="bg-slate-900/70 border-slate-600/50 text-white placeholder:text-slate-500 min-h-[36px] max-h-[80px] resize-none text-sm"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment() }}}
                />
                <Button onClick={submitComment} disabled={!newComment.trim() || submittingComment} size="icon" className="bg-teal-500 hover:bg-teal-600 h-9 w-9">
                  {submittingComment ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                </Button>
              </div>
            </div>
            
            {/* Comments List - Always shown */}
            {loadingComments ? (
              <div className="flex justify-center py-3">
                <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
              </div>
            ) : comments.length > 0 ? (
              <div className="px-2 pb-2 space-y-1 max-h-[200px] overflow-y-auto">
                {comments.slice(0, 5).map((comment) => (
                  <CommentItem key={comment.id} comment={comment} isCompact={true} />
                ))}
                {comments.length > 5 && (
                  <Link 
                    href={`/connect/community/${post.id}`}
                    className="block text-xs text-teal-400 hover:text-teal-300 w-full text-center py-1"
                  >
                    View all {comments.length} comments →
                  </Link>
                )}
              </div>
            ) : (
              <div className="px-2 pb-2 text-center py-2">
                <p className="text-xs text-slate-500">No comments yet. Be the first! 💬</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    )
  }

  // Full-size layout (for detail pages)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-slate-900/50 border-slate-700/50 overflow-hidden hover:border-teal-500/30 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <Link href={`/profile/${post.user.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1">
            <Avatar className={cn("h-12 w-12 border-2", getUserColor(post.user.id).border)}>
              <AvatarImage src={post.user.image || undefined} />
              <AvatarFallback className={cn("bg-gradient-to-br text-white font-bold", getUserColor(post.user.id).bg)}>
                {post.user.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={cn("font-bold text-base truncate", getUserColor(post.user.id).text)}>
                  {post.user.name || "Anonymous"}
                </p>
                {getSubscriptionBadge(post.user.subscriptionTier)}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
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
              {isOwner ? (
                <>
                  <DropdownMenuItem onClick={() => onEdit?.(post.id)} className="text-slate-300 hover:text-white">
                    <Pencil className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete?.(post.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => onReport?.(post.id)} className="text-slate-300 hover:text-white">
                  <Flag className="w-4 h-4 mr-2" /> Report
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CardContent className="p-0 space-y-0">
          {/* Video */}
          {video && (
            <div className="relative w-full bg-slate-950" style={{ aspectRatio: '16/9', maxHeight: '400px' }}>
              {isPlaying ? (
                <video src={video.videoUrl} controls autoPlay className="w-full h-full object-cover" />
              ) : (
                <>
                  {video.thumbnailUrl ? (
                    <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                      <Play className="w-16 h-16 text-slate-600" />
                    </div>
                  )}
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                    </div>
                  </button>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 text-white text-xs font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDuration(video.duration)}
                  </div>
                  {video.overallScore && (
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-bold flex items-center gap-1.5">
                      <Trophy className="w-4 h-4" fill="currentColor" />
                      {video.overallScore}/100
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Caption & Stats */}
          <div className="p-4 space-y-3">
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

            {post.caption && (
              <div className="text-slate-200 text-sm leading-relaxed">
                <span className={cn("font-semibold mr-2", getUserColor(post.user.id).text)}>{post.user.name}</span>
                {post.caption}
              </div>
            )}

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map(tag => (
                  <Badge key={tag} className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-400 border-teal-500/30 text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-4 pb-3 flex items-center justify-between border-t border-slate-700/30 pt-2">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={handleLike} className={cn("text-slate-400 hover:text-red-400", isLiked && "text-red-500")}>
                <Heart className={cn("w-5 h-5 mr-1.5", isLiked && "fill-current")} />
                <span className="font-medium">Like</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare} className="text-slate-400 hover:text-cyan-400">
                <Share2 className="w-5 h-5 mr-1.5" />
                <span className="font-medium">Share</span>
              </Button>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSave} className={cn("text-slate-400 hover:text-amber-400", isSaved && "text-amber-500")}>
              <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
            </Button>
          </div>

          {/* Comments Section - ALWAYS VISIBLE */}
          <div className="border-t border-slate-700/30">
            <div className="p-4 bg-slate-800/30">
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="bg-slate-900/70 border-slate-600/50 text-white placeholder:text-slate-500 min-h-[44px] max-h-[120px] resize-none text-sm focus:border-teal-500/50"
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
                  className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 h-[44px] w-[44px] shrink-0"
                >
                  {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {loadingComments ? (
              <div className="flex justify-center py-6 bg-slate-800/20">
                <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
              </div>
            ) : comments.length > 0 ? (
              <div className="px-4 pb-4 space-y-2 bg-slate-800/20 max-h-[400px] overflow-y-auto">
                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center bg-slate-800/20">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm text-slate-400">No comments yet. Be the first! 💬</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
