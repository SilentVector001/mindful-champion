
"use client"

import { useState, useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { AlertTriangle } from "lucide-react"

interface SendWarningModalProps {
  userId: string
  userName: string
  conversationId?: string
  selectedMessage?: {
    id: string
    content: string
    role: string
  }
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function SendWarningModal({
  userId,
  userName,
  conversationId,
  selectedMessage,
  isOpen,
  onClose,
  onSuccess
}: SendWarningModalProps) {
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState("")
  const [message, setMessage] = useState("")
  const [quotedContent, setQuotedContent] = useState(selectedMessage?.content || "")
  const [warningType, setWarningType] = useState("BEHAVIOR")
  const [severity, setSeverity] = useState("LOW")

  // Update quoted content when selected message changes
  useEffect(() => {
    if (selectedMessage?.content) {
      setQuotedContent(selectedMessage.content)
    }
  }, [selectedMessage])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reason.trim() || !message.trim()) {
      toast.error("Reason and message are required")
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${userId}/warnings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reason, 
          message, 
          warningType, 
          severity,
          quotedContent: quotedContent.trim() || undefined,
          conversationId,
          messageId: selectedMessage?.id
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Warning sent successfully! User will receive an email notification.")
        onSuccess()
      } else {
        toast.error(data.error || "Failed to send warning")
      }
    } catch (error) {
      console.error('Error sending warning:', error)
      toast.error("Failed to send warning")
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
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Send Warning to {userName}
            </DialogTitle>
            <DialogDescription>
              Send an official warning to the user regarding their behavior or content.
              This will be recorded in their account history.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="warningType">Warning Type</Label>
              <Select value={warningType} onValueChange={setWarningType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEHAVIOR">Behavior</SelectItem>
                  <SelectItem value="CONTENT">Content</SelectItem>
                  <SelectItem value="TERMS_VIOLATION">Terms Violation</SelectItem>
                  <SelectItem value="SPAM">Spam</SelectItem>
                  <SelectItem value="ABUSE">Abuse</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="FINAL">Final Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Internal)</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Brief internal reason for warning..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quotedContent">Quote from Conversation (Optional)</Label>
              <Textarea
                id="quotedContent"
                value={quotedContent}
                onChange={(e) => setQuotedContent(e.target.value)}
                placeholder="Optionally include a specific message or content that prompted this warning..."
                rows={3}
              />
              <p className="text-xs text-slate-500">
                This will be included in the email and notification to provide context.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message to User</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Professional, polite message that will be sent to the user..."
                rows={6}
                required
              />
              <p className="text-xs text-slate-500">
                This message will be sent via email and shown as a pop-up on their next login.
              </p>
            </div>

            {severity === "FINAL" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ This is a FINAL WARNING. The user's account may be suspended if violations continue.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              variant={severity === "FINAL" ? "destructive" : "default"}
            >
              {loading ? "Sending..." : "Send Warning"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
