// @ts-nocheck
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Loader2, Share2, Video, Users } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const AVAILABLE_TAGS = [
  "serve", "dink", "third-shot-drop", "footwork", "strategy",
  "volleys", "resets", "lobs", "erne", "around-the-post",
  "singles", "doubles", "drill", "match"
]

interface PublishToCommunityModalProps {
  videoAnalysisId: string
  videoTitle: string
  onClose: () => void
  onSuccess?: () => void
}

export function PublishToCommunityModal({
  videoAnalysisId,
  videoTitle,
  onClose,
  onSuccess
}: PublishToCommunityModalProps) {
  const [caption, setCaption] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [publishing, setPublishing] = useState(false)

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handlePublish = async () => {
    setPublishing(true)
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoAnalysisId,
          caption,
          tags: selectedTags
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to publish")
      }

      toast.success("Video shared to community! 🎉")
      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast.error(error.message || "Failed to share video")
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Card className="w-full max-w-lg bg-slate-900 border-slate-700">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-teal-400" />
              Share to Community
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              Share your training video with other players
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Video Preview */}
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-white">{videoTitle}</p>
              <p className="text-xs text-slate-400">Will be visible to all community members</p>
            </div>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Caption (optional)</label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Share what you're working on, ask for feedback..."
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[80px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-slate-500 text-right">{caption.length}/500</p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Tags (help others find your video)</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedTags.includes(tag)
                      ? "bg-teal-500 text-white hover:bg-teal-600"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  )}
                  onClick={() => toggleTag(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-teal-500/10 rounded-lg border border-teal-500/20">
            <Users className="w-5 h-5 text-teal-400 mt-0.5" />
            <div className="text-sm">
              <p className="text-teal-300 font-medium">Community Guidelines</p>
              <p className="text-slate-400">Be respectful and supportive. Share content you have rights to. No spam.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              disabled={publishing}
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            >
              {publishing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</>
              ) : (
                <><Share2 className="w-4 h-4 mr-2" /> Share to Community</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
