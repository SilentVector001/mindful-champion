// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send, Trash2, X, Reply } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
  replies?: Comment[]
}

interface CommentSectionProps {
  postId: string
  onClose?: () => void
}

export function CommentSection({ postId, onClose }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`)
      const data = await res.json()
      setComments(data.comments || [])
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (parentId?: string) => {
    const content = parentId ? replyContent : newComment
    if (!content.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId })
      })
      const data = await res.json()
      
      if (data.comment) {
        if (parentId) {
          setComments(prev => prev.map(c => 
            c.id === parentId 
              ? { ...c, replies: [...(c.replies || []), data.comment] }
              : c
          ))
          setReplyContent("")
          setReplyingTo(null)
        } else {
          setComments(prev => [data.comment, ...prev])
          setNewComment("")
        }
        toast.success("Comment added")
      }
    } catch (error) {
      toast.error("Failed to add comment")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      await fetch(`/api/community/comments/${commentId}`, { method: "DELETE" })
      setComments(prev => prev.filter(c => c.id !== commentId))
      toast.success("Comment deleted")
    } catch (error) {
      toast.error("Failed to delete comment")
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-white">Comments</h4>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white h-6 w-6">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* New Comment Input */}
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[60px] resize-none"
          />
          <Button
            onClick={() => handleSubmit()}
            disabled={!newComment.trim() || submitting}
            size="icon"
            className="bg-teal-500 hover:bg-teal-600 h-[60px]"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>

        {/* Comments List */}
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-slate-400 py-4">No comments yet. Be the first!</p>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-2">
                {/* Main Comment */}
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.image || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white text-xs">
                      {comment.user.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm">{comment.user.name || "Anonymous"}</span>
                      <span className="text-xs text-slate-500">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-slate-300 text-sm">{comment.content}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(comment.id)}
                        className="text-slate-400 hover:text-teal-400 h-6 px-2"
                      >
                        <Reply className="w-3 h-3 mr-1" /> Reply
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Reply Input */}
                {replyingTo === comment.id && (
                  <div className="ml-11 flex gap-2">
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[50px] resize-none text-sm"
                    />
                    <div className="flex flex-col gap-1">
                      <Button
                        onClick={() => handleSubmit(comment.id)}
                        disabled={!replyContent.trim() || submitting}
                        size="icon"
                        className="bg-teal-500 hover:bg-teal-600 h-6 w-6"
                      >
                        <Send className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => { setReplyingTo(null); setReplyContent("") }}
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 h-6 w-6"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-11 space-y-2 border-l-2 border-slate-700 pl-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={reply.user.image || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white text-xs">
                            {reply.user.name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white text-xs">{reply.user.name || "Anonymous"}</span>
                            <span className="text-xs text-slate-500">{formatDate(reply.createdAt)}</span>
                          </div>
                          <p className="text-slate-300 text-xs">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
