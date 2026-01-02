// @ts-nocheck

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
import { Plus, Target, X, Bell, Clock, Lightbulb, Sparkles } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Milestone {
  title: string
  description: string
  targetValue?: number
  unit?: string
}

interface CreateGoalDialogProps {
  onGoalCreated: () => void
}

// Goal templates for each category
const GOAL_TEMPLATES = {
  SKILL_IMPROVEMENT: {
    title: "Master the Third Shot Drop",
    description: "Perfect my third shot drop technique to consistently land the ball in the kitchen with proper height and spin control",
    milestones: [
      { title: "Land 5 consecutive drops in the kitchen", description: "During practice drills" },
      { title: "Complete 10 drill sessions", description: "2-3 sessions per week" },
      { title: "Use successfully in 3 matches", description: "Track successful executions" }
    ]
  },
  TOURNAMENT: {
    title: "Win a 4.0 Tournament",
    description: "Train consistently and compete to win my first tournament at the 4.0 skill level",
    milestones: [
      { title: "Register for 3 tournaments", description: "Schedule and sign up" },
      { title: "Practice 4x per week", description: "Focus on match play scenarios" },
      { title: "Win first match in tournament", description: "Build confidence" }
    ]
  },
  FITNESS: {
    title: "Build Pickleball Endurance",
    description: "Improve my cardiovascular fitness and agility to maintain peak performance in long matches",
    milestones: [
      { title: "Complete 30min cardio 3x/week", description: "Running or cycling" },
      { title: "Do agility drills 2x/week", description: "Ladder drills and footwork" },
      { title: "Play without fatigue for 90 minutes", description: "Test in practice matches" }
    ]
  },
  MENTAL_GAME: {
    title: "Stay Calm Under Pressure",
    description: "Develop mental resilience to maintain composure during close games and crucial points",
    milestones: [
      { title: "Practice breathing exercises daily", description: "5 minutes before play" },
      { title: "Complete mental game training", description: "Read or watch instructional content" },
      { title: "Win 3 close games", description: "Games decided by 2 points or less" }
    ]
  },
  SOCIAL: {
    title: "Build My Pickleball Community",
    description: "Connect with other players, join leagues, and make pickleball a regular social activity",
    milestones: [
      { title: "Join a local pickleball league", description: "Find and register" },
      { title: "Play with 10 different partners", description: "Expand network" },
      { title: "Attend a social pickleball event", description: "Mixer or tournament" }
    ]
  },
  CUSTOM: {
    title: "",
    description: "",
    milestones: [
      { title: "", description: "" }
    ]
  }
}

export default function CreateGoalDialog({ onGoalCreated }: CreateGoalDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showTemplates, setShowTemplates] = useState(true)
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

  // Load template when category changes
  const handleCategoryChange = (category: string) => {
    setFormData({ ...formData, category })
    if (showTemplates && GOAL_TEMPLATES[category as keyof typeof GOAL_TEMPLATES]) {
      const template = GOAL_TEMPLATES[category as keyof typeof GOAL_TEMPLATES]
      if (template.title && !formData.title) {
        setFormData({
          ...formData,
          category,
          title: template.title,
          description: template.description
        })
        if (template.milestones.length > 0) {
          setMilestones(template.milestones)
        }
      }
    }
  }

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
        <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Create Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
            <Target className="h-6 w-6 text-teal-400" />
            Create New Goal
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Set a new improvement goal and break it down into achievable milestones. Use our templates or create your own!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Helper Text */}
          <Alert className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border-teal-500/30">
            <Lightbulb className="h-4 w-4 text-teal-400" />
            <AlertDescription className="text-sm text-slate-300 ml-2">
              <strong>Pro Tip:</strong> Specific, measurable goals with clear milestones are 42% more likely to be achieved!
              Select a category to see an example template.
            </AlertDescription>
          </Alert>

          {/* Category (moved up for template loading) */}
          <div>
            <Label htmlFor="category" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-400" />
              Goal Category *
            </Label>
            <Select
              value={formData.category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="mt-1 bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="SKILL_IMPROVEMENT">🎯 Skill Improvement</SelectItem>
                <SelectItem value="TOURNAMENT">🏆 Tournament</SelectItem>
                <SelectItem value="FITNESS">💪 Fitness</SelectItem>
                <SelectItem value="MENTAL_GAME">🧠 Mental Game</SelectItem>
                <SelectItem value="SOCIAL">👥 Social</SelectItem>
                <SelectItem value="CUSTOM">✏️ Custom</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-400 mt-1">
              Select a category to load an example template (you can customize it)
            </p>
          </div>

          {/* Toggle Templates */}
          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-white">Use Template Examples</span>
            </div>
            <Switch
              checked={showTemplates}
              onCheckedChange={(checked) => {
                setShowTemplates(checked)
                if (checked && formData.category) {
                  handleCategoryChange(formData.category)
                }
              }}
            />
          </div>

          {/* Goal Title */}
          <div>
            <Label htmlFor="title">Goal Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Master the Third Shot Drop"
              required
              className="mt-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Make it specific and actionable (what exactly do you want to master?)
            </p>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">What Success Looks Like</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what achieving this goal looks like. Be specific! How will you know you've succeeded?"
              rows={3}
              className="mt-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Examples: "Land 8/10 third shots in the kitchen" or "Win 3 matches at 4.0 level"
            </p>
          </div>

          {/* Target Date */}
          <div>
            <Label htmlFor="targetDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-teal-400" />
              Target Date
            </Label>
            <Input
              id="targetDate"
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              className="mt-1 bg-slate-800 border-slate-600 text-white"
            />
            <p className="text-xs text-slate-400 mt-1">
              When do you want to achieve this? Having a deadline increases commitment!
            </p>
          </div>

          {/* Milestones */}
          <div className="border-t border-slate-700 pt-6">
            <div className="flex items-center justify-between mb-3">
              <Label className="flex items-center gap-2 text-base">
                <Target className="h-5 w-5 text-teal-400" />
                Milestones (Checkpoints)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMilestone}
                className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Milestone
              </Button>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Break your goal into smaller, measurable steps. This makes progress tracking easier and keeps you motivated!
            </p>

            <div className="space-y-3">
              <AnimatePresence>
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-slate-700/30 border border-slate-600 rounded-lg space-y-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </div>
                      <span className="text-xs text-slate-400">Milestone {index + 1}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Input
                        placeholder={`e.g., "Complete 5 practice drills"`}
                        value={milestone.title}
                        onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                        className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                      />
                      {milestones.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMilestone(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      placeholder={`How will you measure this? e.g., "Track in practice log"`}
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="border-t border-slate-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <Label className="text-base font-semibold text-white">Daily Check-ins from Coach Kai</Label>
                  <p className="text-sm text-slate-400 mt-1">
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
                className="space-y-4 ml-7 pl-4 border-l-2 border-teal-500/30"
              >
                <div>
                  <Label htmlFor="preferredTime" className="flex items-center gap-2 text-sm text-white">
                    <Clock className="h-4 w-4 text-teal-400" />
                    Preferred Time
                  </Label>
                  <Input
                    id="preferredTime"
                    type="time"
                    value={notificationPreferences.preferredTime}
                    onChange={(e) =>
                      setNotificationPreferences({ ...notificationPreferences, preferredTime: e.target.value })
                    }
                    className="mt-1 bg-slate-800 border-slate-600 text-white"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Choose when you'd like to receive your daily check-in
                  </p>
                </div>

                <div>
                  <Label htmlFor="frequency" className="text-sm text-white">Frequency</Label>
                  <Select
                    value={notificationPreferences.frequency}
                    onValueChange={(value: "daily" | "every_other_day" | "weekly") =>
                      setNotificationPreferences({ ...notificationPreferences, frequency: value })
                    }
                  >
                    <SelectTrigger className="mt-1 bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="daily">Every Day</SelectItem>
                      <SelectItem value="every_other_day">Every Other Day</SelectItem>
                      <SelectItem value="weekly">Once a Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-xs text-blue-300">
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
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title}
              className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Goal
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
