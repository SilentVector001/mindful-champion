
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Target,
  Calendar,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Trophy,
  Trash2,
  Edit
} from "lucide-react"
import { format } from "date-fns"

interface Milestone {
  id: string
  title: string
  description?: string
  status: string
  currentValue?: number
  targetValue?: number
  unit?: string
  completedAt?: string
}

interface Goal {
  id: string
  title: string
  description?: string
  category: string
  status: string
  progress: number
  targetDate?: string
  createdAt: string
  completedAt?: string
  milestones: Milestone[]
}

interface GoalCardProps {
  goal: Goal
  onUpdate: (goalId: string, data: any) => void
  onDelete: (goalId: string) => void
}

const categoryColors: Record<string, string> = {
  SKILL_IMPROVEMENT: "from-blue-500 to-cyan-500",
  TOURNAMENT: "from-purple-500 to-pink-500",
  FITNESS: "from-green-500 to-emerald-500",
  MENTAL_GAME: "from-orange-500 to-red-500",
  SOCIAL: "from-teal-500 to-blue-500",
  CUSTOM: "from-slate-500 to-gray-500"
}

const categoryLabels: Record<string, string> = {
  SKILL_IMPROVEMENT: "Skill",
  TOURNAMENT: "Tournament",
  FITNESS: "Fitness",
  MENTAL_GAME: "Mental",
  SOCIAL: "Social",
  CUSTOM: "Custom"
}

export default function GoalCard({ goal, onUpdate, onDelete }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [updatingMilestone, setUpdatingMilestone] = useState<string | null>(null)

  const handleMilestoneToggle = async (milestone: Milestone) => {
    setUpdatingMilestone(milestone.id)
    const newStatus = milestone.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED'
    
    try {
      const response = await fetch(`/api/milestones/${milestone.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        // Refresh the goal data
        onUpdate(goal.id, {})
      }
    } catch (error) {
      console.error("Error updating milestone:", error)
    } finally {
      setUpdatingMilestone(null)
    }
  }

  const daysUntilTarget = goal.targetDate
    ? Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`bg-gradient-to-r ${categoryColors[goal.category]} border-0 text-white`}>
                  {categoryLabels[goal.category]}
                </Badge>
                {goal.status === 'COMPLETED' && (
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl font-bold text-slate-900 mb-1">
                {goal.title}
              </CardTitle>
              {goal.description && (
                <p className="text-sm text-slate-600">{goal.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="text-slate-600 hover:text-slate-900"
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Overall Progress</span>
              <span className="text-sm font-bold text-slate-900">{Math.round(goal.progress)}%</span>
            </div>
            <Progress value={goal.progress} className="h-2" />
          </div>

          {/* Target Date */}
          {goal.targetDate && (
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
              <Calendar className="h-4 w-4" />
              <span>
                Target: {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                {daysUntilTarget !== null && daysUntilTarget > 0 && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {daysUntilTarget} days left
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Milestones */}
          {expanded && goal.milestones.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3 pt-4 border-t border-slate-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-semibold text-slate-900">Milestones</span>
              </div>
              {goal.milestones.map((milestone) => (
                <motion.div
                  key={milestone.id}
                  whileHover={{ x: 4 }}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                    milestone.status === 'COMPLETED'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <button
                    onClick={() => handleMilestoneToggle(milestone)}
                    disabled={updatingMilestone === milestone.id}
                    className="mt-0.5 transition-transform hover:scale-110 disabled:opacity-50"
                  >
                    {milestone.status === 'COMPLETED' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-400" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className={`font-medium ${
                      milestone.status === 'COMPLETED' ? 'text-green-700 line-through' : 'text-slate-900'
                    }`}>
                      {milestone.title}
                    </div>
                    {milestone.description && (
                      <p className="text-xs text-slate-600 mt-1">{milestone.description}</p>
                    )}
                    {milestone.targetValue && (
                      <div className="text-xs text-slate-600 mt-1">
                        Target: {milestone.targetValue}{milestone.unit}
                      </div>
                    )}
                    {milestone.completedAt && (
                      <div className="text-xs text-green-600 mt-1">
                        ✓ Completed {format(new Date(milestone.completedAt), 'MMM d')}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Actions */}
          {expanded && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onDelete(goal.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
