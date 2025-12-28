
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Flag } from "lucide-react"
import { format } from "date-fns"

interface FlagMessageModalProps {
  message: any
  conversationId: string
  userId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function FlagMessageModal({
  message,
  conversationId,
  userId,
  isOpen,
  onClose,
  onSuccess
}: FlagMessageModalProps) {
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState("MANUAL_REVIEW")
  const [reviewNotes, setReviewNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      const response = await fetch('/api/admin/messages/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: message.id,
          conversationId,
          userId,
          reason,
          reviewNotes: reviewNotes || null
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Message flagged successfully")
        onSuccess()
      } else {
        toast.error(data.error || "Failed to flag message")
      }
    } catch (error) {
      console.error('Error flagging message:', error)
      toast.error("Failed to flag message")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-600" />
              Flag Message for Review
            </DialogTitle>
            <DialogDescription>
              Flag this message for administrative review
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Message Preview */}
            <div className="bg-slate-50 border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-700">
                  {message.role === 'user' ? 'User Message' : 'Coach Kai Response'}
                </span>
                <span className="text-xs text-slate-500">
                  {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                </span>
              </div>
              <p className="text-sm text-slate-700">{message.content}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Flag Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INAPPROPRIATE_CONTENT">Inappropriate Content</SelectItem>
                  <SelectItem value="ABUSE">Abuse</SelectItem>
                  <SelectItem value="SPAM">Spam</SelectItem>
                  <SelectItem value="SAFETY_CONCERN">Safety Concern</SelectItem>
                  <SelectItem value="MANUAL_REVIEW">Manual Review</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewNotes">Review Notes (Optional)</Label>
              <Textarea
                id="reviewNotes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add any additional context or notes..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} variant="destructive">
              {loading ? "Flagging..." : "Flag Message"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
