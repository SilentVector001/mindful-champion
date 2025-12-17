
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Lightbulb, DollarSign, Bug, Settings, Palette, HelpCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const categories = [
  {
    value: "FEATURE_REQUEST",
    label: "💡 Feature Request",
    description: "Suggest new features or improvements",
    icon: Lightbulb
  },
  {
    value: "PAYMENT_BILLING",
    label: "💳 Payment/Billing",
    description: "Issues with payments or subscriptions",
    icon: DollarSign
  },
  {
    value: "BUG_FUNCTIONALITY",
    label: "🐛 Bug/Functionality",
    description: "Report bugs or broken features",
    icon: Bug
  },
  {
    value: "SYSTEM_TECHNICAL",
    label: "⚙️ System/Technical",
    description: "Technical issues or errors",
    icon: Settings
  },
  {
    value: "DESIGN_UX",
    label: "🎨 Design/UX Feedback",
    description: "Feedback on design or user experience",
    icon: Palette
  },
  {
    value: "GENERAL_HELP",
    label: "❓ General Help",
    description: "General questions or support",
    icon: HelpCircle
  }
]

export default function SubmitTicketForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    description: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.category || !formData.subject || !formData.description) {
      toast.error("Please fill in all fields")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to submit ticket')

      const { ticket } = await response.json()
      
      toast.success("Ticket submitted successfully! 🎉")
      setFormData({ category: "", subject: "", description: "" })
      
      // Redirect to help page after a short delay
      setTimeout(() => {
        router.push('/help')
      }, 1000)
    } catch (error) {
      toast.error("Failed to submit ticket. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Submit a Support Ticket</CardTitle>
        <CardDescription>
          Tell us how we can help. We'll get back to you as soon as possible!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.category && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {categories.find(c => c.value === formData.category)?.description}
              </p>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Brief description of the issue"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              maxLength={150}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Please provide as much detail as possible..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tip: Include steps to reproduce the issue if reporting a bug
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-champion-green to-emerald-600"
            >
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
