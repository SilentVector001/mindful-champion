
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Target, X, Bell, Clock } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface Milestone {
  title: string
  description: string
  targetValue?: number
  unit?: string
}

interface CreateGoalDialogProps {
  onGoalCreated: () => void
}

export default function CreateGoalDialog({ onGoalCreated }: CreateGoalDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "SKILL_IMPROVEMENT",
    targetDate: ""
  })
  const [milestones, setMilestones] = useState<Milestone[]>([
    { title: "", description: "" }
  ])
  const [notificationPreferences, setNotificationPreferences] = useState({
    enableDailyReminders: true,
    preferredTime: "08:00",
    frequency: "daily" as "daily" | "every_other_day" | "weekly"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          milestones: milestones.filter(m => m.title.trim()),
          notificationPreferences
        })
      })

      if (response.ok) {
        setOpen(false)
        setFormData({
          title: "",
          description: "",
          category: "SKILL_IMPROVEMENT",
          targetDate: ""
        })
        setMilestones([{ title: "", description: "" }])
        setNotificationPreferences({
          enableDailyReminders: true,
          preferredTime: "08:00",
          frequency: "daily"
        })
        onGoalCreated()
      }
    } catch (error) {
      console.error("Error creating goal:", error)
    } finally {
      setLoading(false)
    }
  }

  const addMilestone = () => {
    setMilestones([...milestones, { title: "", description: "" }])
  }

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  const updateMilestone = (index: number, field: keyof Milestone, value: any) => {
    const updated = [...milestones]
    updated[index] = { ...updated[index], [field]: value }
    setMilestones(updated)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-teal-600 to-orange-600 hover:from-teal-700 hover:to-orange-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Goal</DialogTitle>
          <DialogDescription>
            Set a new improvement goal and break it down into achievable milestones.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Goal Title */}
          <div>
            <Label htmlFor="title">Goal Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Master the Third Shot Drop"
              required
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What do you want to achieve and why?"
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SKILL_IMPROVEMENT">Skill Improvement</SelectItem>
                <SelectItem value="TOURNAMENT">Tournament</SelectItem>
                <SelectItem value="FITNESS">Fitness</SelectItem>
                <SelectItem value="MENTAL_GAME">Mental Game</SelectItem>
                <SelectItem value="SOCIAL">Social</SelectItem>
                <SelectItem value="CUSTOM">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Date */}
          <div>
            <Label htmlFor="targetDate">Target Date</Label>
            <Input
              id="targetDate"
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Milestones */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4 text-teal-600" />
                Milestones
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMilestone}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Milestone
              </Button>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 border border-slate-200 rounded-lg space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <Input
                        placeholder={`Milestone ${index + 1} title`}
                        value={milestone.title}
                        onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                        className="flex-1"
                      />
                      {milestones.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMilestone(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      placeholder="Description (optional)"
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-teal-600" />
                <div>
                  <Label className="text-base font-semibold">Daily Check-ins from Coach Kai</Label>
                  <p className="text-sm text-slate-500 mt-1">
                    Get personalized tips and motivation to help you reach your goal
                  </p>
                </div>
              </div>
              <Switch
                checked={notificationPreferences.enableDailyReminders}
                onCheckedChange={(checked) =>
                  setNotificationPreferences({ ...notificationPreferences, enableDailyReminders: checked })
                }
              />
            </div>

            {notificationPreferences.enableDailyReminders && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 ml-7 pl-4 border-l-2 border-teal-200"
              >
                <div>
                  <Label htmlFor="preferredTime" className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    Preferred Time
                  </Label>
                  <Input
                    id="preferredTime"
                    type="time"
                    value={notificationPreferences.preferredTime}
                    onChange={(e) =>
                      setNotificationPreferences({ ...notificationPreferences, preferredTime: e.target.value })
                    }
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Choose when you'd like to receive your daily check-in
                  </p>
                </div>

                <div>
                  <Label htmlFor="frequency" className="text-sm">Frequency</Label>
                  <Select
                    value={notificationPreferences.frequency}
                    onValueChange={(value: "daily" | "every_other_day" | "weekly") =>
                      setNotificationPreferences({ ...notificationPreferences, frequency: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Every Day</SelectItem>
                      <SelectItem value="every_other_day">Every Other Day</SelectItem>
                      <SelectItem value="weekly">Once a Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-900">
                    💡 <strong>Pro Tip:</strong> Daily check-ins have been shown to increase goal achievement by 42%!
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title}
              className="flex-1 bg-gradient-to-r from-teal-600 to-orange-600"
            >
              {loading ? "Creating..." : "Create Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
