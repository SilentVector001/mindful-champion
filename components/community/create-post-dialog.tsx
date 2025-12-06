
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Target, Sparkles, Award, Trophy, Zap, MessageSquare, MessageCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const CATEGORIES = [
  { value: "STRATEGY", label: "Strategy", icon: Brain, description: "Game plans and tactical discussions" },
  { value: "TECHNIQUE", label: "Technique", icon: Target, description: "Shot mechanics and form" },
  { value: "MENTAL_GAME", label: "Mental Game", icon: Sparkles, description: "Mindset and psychology" },
  { value: "EQUIPMENT", label: "Equipment", icon: Award, description: "Gear reviews and recommendations" },
  { value: "MATCH_STORIES", label: "Match Stories", icon: Trophy, description: "Share your match experiences" },
  { value: "TRAINING_TIPS", label: "Training Tips", icon: Zap, description: "Practice drills and routines" },
  { value: "QUESTIONS", label: "Questions", icon: MessageSquare, description: "Ask the community" },
  { value: "CELEBRATIONS", label: "Celebrations", icon: Trophy, description: "Share your wins and milestones" },
  { value: "GENERAL", label: "General", icon: MessageCircle, description: "Everything else pickleball" },
]

interface CreatePostDialogProps {
  open: boolean
  onClose: () => void
  user: any
}

export function CreatePostDialog({ open, onClose, user }: CreatePostDialogProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("GENERAL")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category })
      })

      if (!response.ok) throw new Error("Failed to create post")

      const { post } = await response.json()
      
      toast.success("Post created successfully!")
      setTitle("")
      setContent("")
      setCategory("GENERAL")
      onClose()
      router.refresh()
      router.push(`/connect/community/${post.id}`)
    } catch (error) {
      console.error("Error creating post:", error)
      toast.error("Failed to create post")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a New Post</DialogTitle>
          <DialogDescription>
            Share your thoughts, questions, or experiences with the community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon
                  return (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{cat.label}</div>
                          <div className="text-xs text-muted-foreground">{cat.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="What's your post about?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {title.length}/200 characters
            </p>
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts, questions, or experiences..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {content.length}/5000 characters
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="bg-gradient-to-r from-cyan-600 to-teal-600"
          >
            {isSubmitting ? "Creating..." : "Create Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
