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
  compact?: boolean // New prop for compact mode
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
  compact = true // Default to compact mode
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

  const [showComments, setShowComments] = useState(false)

  // Compact card layout (social media style)
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
              <Avatar className="h-8 w-8 border border-teal-500/50">
                <AvatarImage src={post.user.image || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white text-xs font-bold">
                  {post.user.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-white text-sm truncate">{post.user.name || "Anonymous"}</p>
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

          {/* Compact Video - smaller aspect ratio */}
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
            {/* Caption - truncated */}
            {post.caption && (
              <p className="text-slate-200 text-sm line-clamp-2">
                <span className="font-semibold text-white mr-1">{post.user.name}</span>
                {post.caption}
              </p>
            )}

            {/* Tags - compact */}
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

            {/* Compact Stats & Actions Row */}
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
                <Button variant="ghost" size="icon" onClick={() => setShowComments(!showComments)} className="h-7 w-7 text-slate-400 hover:text-blue-400">
                  <MessageCircle className="w-4 h-4" />
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

          {/* Expandable Comments Section */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-slate-700/30 overflow-hidden"
              >
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
                {comments.length > 0 && (
                  <div className="px-2 pb-2 space-y-2 max-h-[150px] overflow-y-auto">
                    {comments.slice(0, 3).map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={comment.user.image || undefined} />
                          <AvatarFallback className="bg-teal-600 text-white text-xs">{comment.user.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-slate-800/50 rounded-lg px-2 py-1">
                          <span className="font-semibold text-white text-xs mr-1">{comment.user.name}</span>
                          <span className="text-slate-300 text-xs">{comment.content}</span>
                        </div>
                      </div>
                    ))}
                    {comments.length > 3 && (
                      <button className="text-xs text-teal-400 hover:text-teal-300 w-full text-center">
                        View all {comments.length} comments
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    )
  }

  // Original full-size layout (kept for detail pages)
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
          {/* Video Section */}
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
