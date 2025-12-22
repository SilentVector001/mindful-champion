"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Star
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

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
  
  const isOwner = currentUserId === post.user.id
  const video = post.videoAnalysis

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

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/community/${post.id}`)
    toast.success("Link copied to clipboard!")
    onShare?.(post.id)
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
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    return d.toLocaleDateString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-slate-900/50 border-slate-700/50 overflow-hidden hover:border-teal-500/30 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <Link href={`/profile/${post.user.id}`} className="flex items-center gap-3 hover:opacity-80">
            <Avatar className="h-10 w-10 border-2 border-teal-500/30">
              <AvatarImage src={post.user.image || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
                {post.user.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-white">{post.user.name || "Anonymous"}</p>
              <p className="text-xs text-slate-400">{formatDate(post.createdAt)}</p>
            </div>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
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

        {/* Video */}
        {video && (
          <div className="relative aspect-video bg-slate-950">
            {isPlaying ? (
              <video
                src={video.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            ) : (
              <>
                {video.thumbnailUrl ? (
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                    <Play className="w-16 h-16 text-slate-600" />
                  </div>
                )}
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
                >
                  <div className="w-16 h-16 rounded-full bg-teal-500/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                  </div>
                </button>
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(video.duration)}
                </div>
                {video.overallScore && (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-bold flex items-center gap-1">
                    <Star className="w-4 h-4" fill="currentColor" />
                    {video.overallScore}/100
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <CardContent className="p-4 space-y-3">
          {/* Caption */}
          {post.caption && (
            <p className="text-slate-200">{post.caption}</p>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-teal-500/20 text-teal-400 hover:bg-teal-500/30">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-slate-400 pt-2 border-t border-slate-700/50">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" /> {post.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" /> {likeCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> {post.commentCount}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={cn(
                  "text-slate-400 hover:text-red-400",
                  isLiked && "text-red-500"
                )}
              >
                <Heart className={cn("w-5 h-5 mr-1", isLiked && "fill-current")} />
                Like
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onComment?.(post.id)}
                className="text-slate-400 hover:text-teal-400"
              >
                <MessageCircle className="w-5 h-5 mr-1" />
                Comment
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-slate-400 hover:text-cyan-400"
              >
                <Share2 className="w-5 h-5 mr-1" />
                Share
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              className={cn(
                "text-slate-400 hover:text-amber-400",
                isSaved && "text-amber-500"
              )}
            >
              <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
