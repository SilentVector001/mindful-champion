// @ts-nocheck
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Target, Calendar, CheckCircle2, Circle, ChevronDown, ChevronRight,
  Trophy, Trash2, Plus, Clock, Zap, GitBranch, Sparkles
} from "lucide-react"
import { format, differenceInDays } from "date-fns"

interface Milestone {
  id: string
  title: string
  description?: string
  status: string
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
  color?: string
  parentGoalId?: string
  milestones: Milestone[]
  SubGoals?: Goal[]
}

interface Props {
  goal: Goal
  allGoals: Goal[]
  onUpdate: (id: string, data: any) => void
  onDelete: (id: string) => void
  onRefresh: () => void
  isSubGoal?: boolean
}

const categoryConfig: Record<string, { gradient: string; border: string; label: string }> = {
  SKILL_IMPROVEMENT: { gradient: "from-blue-500 to-cyan-500", border: "border-blue-500/30", label: "Skill" },
  TOURNAMENT: { gradient: "from-purple-500 to-pink-500", border: "border-purple-500/30", label: "Tournament" },
  FITNESS: { gradient: "from-green-500 to-emerald-500", border: "border-green-500/30", label: "Fitness" },
  MENTAL_GAME: { gradient: "from-orange-500 to-red-500", border: "border-orange-500/30", label: "Mental" },
  SOCIAL: { gradient: "from-teal-500 to-blue-500", border: "border-teal-500/30", label: "Social" },
  CUSTOM: { gradient: "from-slate-500 to-gray-600", border: "border-slate-500/30", label: "Custom" }
}

export default function EnhancedGoalCard({ goal, allGoals, onUpdate, onDelete, onRefresh, isSubGoal = false }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [showSubGoals, setShowSubGoals] = useState(true)
  const [addingSubGoal, setAddingSubGoal] = useState(false)
  const [newSubGoal, setNewSubGoal] = useState({ title: '', description: '' })
  const [updatingMilestone, setUpdatingMilestone] = useState<string | null>(null)

  const config = categoryConfig[goal?.category ?? 'CUSTOM'] ?? categoryConfig.CUSTOM
  const subGoals = allGoals?.filter(g => g?.parentGoalId === goal?.id) ?? []
  
  const daysLeft = goal?.targetDate 
    ? differenceInDays(new Date(goal.targetDate), new Date())
    : null

  // Calculate combined progress including sub-goals
  const calculateTotalProgress = () => {
    if ((subGoals?.length ?? 0) === 0) return goal?.progress ?? 0
    const subProgress = subGoals?.reduce((sum, sg) => sum + (sg?.progress ?? 0), 0) ?? 0
    return Math.round(((goal?.progress ?? 0) + subProgress) / (1 + (subGoals?.length ?? 0)))
  }
  const totalProgress = calculateTotalProgress()

  const handleMilestoneToggle = async (milestone: Milestone) => {
    setUpdatingMilestone(milestone.id)
    const newStatus = milestone.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED'
    
    try {
      await fetch(`/api/milestones/${milestone.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      onRefresh()
    } catch (error) {
      console.error("Error updating milestone:", error)
    } finally {
      setUpdatingMilestone(null)
    }
  }

  const handleAddSubGoal = async () => {
    if (!newSubGoal.title.trim()) return
    try {
      await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSubGoal.title,
          description: newSubGoal.description,
          category: goal?.category ?? 'CUSTOM',
          parentGoalId: goal?.id
        })
      })
      setNewSubGoal({ title: '', description: '' })
      setAddingSubGoal(false)
      onRefresh()
    } catch (error) {
      console.error("Error creating sub-goal:", error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={isSubGoal ? 'ml-8' : ''}
    >
      <Card className={`bg-slate-800/70 backdrop-blur-sm border ${config.border} shadow-xl hover:shadow-2xl transition-all overflow-hidden`}>
        {/* Gradient Top Bar */}
        <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className={`bg-gradient-to-r ${config.gradient} border-0 text-white shadow-md`}>
                  {config.label}
                </Badge>
                {goal?.status === 'COMPLETED' && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                  </Badge>
                )}
                {(subGoals?.length ?? 0) > 0 && (
                  <Badge variant="outline" className="border-slate-600 text-slate-400">
                    <GitBranch className="w-3 h-3 mr-1" /> {subGoals.length} sub-goals
                  </Badge>
                )}
                {isSubGoal && (
                  <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                    Sub-goal
                  </Badge>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{goal?.title ?? 'Untitled Goal'}</h3>
              {goal?.description && (
                <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-3 mb-2">
                  <p className="text-sm text-slate-300 leading-relaxed">{goal.description}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="text-slate-400 hover:text-white hover:bg-slate-700"
              >
                {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Progress Ring & Bar */}
          <div className="flex items-center gap-6 mb-4">
            {/* Circular Progress */}
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(100,116,139,0.3)" strokeWidth="6" />
                <motion.circle
                  cx="40" cy="40" r="35" fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={220}
                  initial={{ strokeDashoffset: 220 }}
                  animate={{ strokeDashoffset: 220 - (220 * totalProgress / 100) }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{totalProgress}%</span>
              </div>
            </div>

            {/* Linear Progress */}
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Overall Progress</span>
                <span className="text-white font-medium">{totalProgress}%</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${config.gradient} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${totalProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm mb-4">
            {goal?.targetDate && (
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>Target: {format(new Date(goal.targetDate), 'MMM d, yyyy')}</span>
                {daysLeft !== null && daysLeft > 0 && (
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {daysLeft} days left
                  </Badge>
                )}
                {daysLeft !== null && daysLeft <= 0 && daysLeft > -7 && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    <Clock className="w-3 h-3 mr-1" /> Due!
                  </Badge>
                )}
              </div>
            )}
            {(goal?.milestones?.length ?? 0) > 0 && (
              <div className="flex items-center gap-2 text-slate-400">
                <Target className="h-4 w-4" />
                <span>{goal?.milestones?.filter(m => m?.status === 'COMPLETED')?.length ?? 0}/{goal?.milestones?.length ?? 0} milestones</span>
              </div>
            )}
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4"
              >
                {/* Milestones */}
                {(goal?.milestones?.length ?? 0) > 0 && (
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-teal-400" />
                        <span className="text-sm font-semibold text-white">Milestones</span>
                      </div>
                      <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                        {goal?.milestones?.filter(m => m?.status === 'COMPLETED')?.length ?? 0} / {goal?.milestones?.length ?? 0} complete
                      </Badge>
                    </div>
                    
                    {/* Milestone Progress Bar */}
                    <div className="mb-4">
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${((goal?.milestones?.filter(m => m?.status === 'COMPLETED')?.length ?? 0) / (goal?.milestones?.length ?? 1)) * 100}%` 
                          }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      {goal?.milestones?.map((milestone, idx) => (
                        <motion.div
                          key={milestone.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ x: 4 }}
                          className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                            milestone.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 border border-emerald-500/20'
                              : 'bg-slate-700/50 border border-slate-600/50 hover:border-slate-500'
                          }`}
                        >
                          <button
                            onClick={() => handleMilestoneToggle(milestone)}
                            disabled={updatingMilestone === milestone.id}
                            className="mt-0.5 transition-transform hover:scale-110 disabled:opacity-50"
                          >
                            {milestone.status === 'COMPLETED' ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            ) : (
                              <Circle className="h-5 w-5 text-slate-500 hover:text-teal-400 transition-colors" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className={`font-medium flex items-center gap-2 ${
                              milestone.status === 'COMPLETED' ? 'text-emerald-400 line-through' : 'text-white'
                            }`}>
                              {milestone.title}
                              {milestone.status === 'COMPLETED' && (
                                <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-xs">
                                  Done
                                </Badge>
                              )}
                            </div>
                            {milestone.description && (
                              <p className="text-xs text-slate-400 mt-1">{milestone.description}</p>
                            )}
                            {milestone.completedAt && (
                              <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                Completed {format(new Date(milestone.completedAt), 'MMM d, yyyy')}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-Goals */}
                {!isSubGoal && (
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-purple-400" />
                        <span className="text-sm font-semibold text-white">Sub-Goals</span>
                        {(subGoals?.length ?? 0) > 0 && (
                          <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                            {subGoals.length}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAddingSubGoal(!addingSubGoal)}
                        className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Sub-Goal
                      </Button>
                    </div>

                    {/* Add Sub-Goal Form */}
                    <AnimatePresence>
                      {addingSubGoal && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mb-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                        >
                          <Input
                            placeholder="Sub-goal title"
                            value={newSubGoal.title}
                            onChange={(e) => setNewSubGoal({ ...newSubGoal, title: e.target.value })}
                            className="mb-2 bg-slate-800 border-slate-600 text-white"
                          />
                          <Input
                            placeholder="Description (optional)"
                            value={newSubGoal.description}
                            onChange={(e) => setNewSubGoal({ ...newSubGoal, description: e.target.value })}
                            className="mb-3 bg-slate-800 border-slate-600 text-white"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleAddSubGoal}
                              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500"
                            >
                              Create Sub-Goal
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setAddingSubGoal(false)}
                              className="text-slate-400"
                            >
                              Cancel
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Sub-Goals List */}
                    {(subGoals?.length ?? 0) > 0 && (
                      <div className="space-y-3">
                        {subGoals?.map((subGoal) => (
                          <EnhancedGoalCard
                            key={subGoal?.id}
                            goal={subGoal}
                            allGoals={allGoals}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            onRefresh={onRefresh}
                            isSubGoal={true}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(goal?.id ?? '')}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
