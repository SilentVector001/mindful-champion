"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2, Target, Trophy, Clock } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from "date-fns"

interface Goal {
  id: string
  title: string
  category: string
  status: string
  progress: number
  targetDate?: string
  completedAt?: string
  milestones: any[]
}

const categoryColors: Record<string, string> = {
  SKILL_IMPROVEMENT: "bg-blue-500",
  TOURNAMENT: "bg-purple-500",
  FITNESS: "bg-green-500",
  MENTAL_GAME: "bg-orange-500",
  SOCIAL: "bg-teal-500",
  CUSTOM: "bg-slate-500"
}

const monthColors = [
  "from-rose-500 to-pink-500",
  "from-orange-500 to-amber-500",
  "from-amber-500 to-yellow-500",
  "from-lime-500 to-green-500",
  "from-emerald-500 to-teal-500",
  "from-cyan-500 to-blue-500",
  "from-blue-500 to-indigo-500",
  "from-indigo-500 to-purple-500",
  "from-purple-500 to-pink-500",
  "from-pink-500 to-rose-500",
  "from-rose-500 to-red-500",
  "from-teal-500 to-cyan-500"
]

export default function MilestoneCalendar({ goals }: { goals: Goal[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const monthColor = monthColors[currentMonth.getMonth()]

  // Build event map for the calendar
  const eventMap = useMemo(() => {
    const map: Record<string, { type: string; items: any[] }[]> = {}
    
    goals?.forEach(goal => {
      // Add goal target dates
      if (goal?.targetDate) {
        const dateKey = format(new Date(goal.targetDate), 'yyyy-MM-dd')
        if (!map[dateKey]) map[dateKey] = []
        map[dateKey].push({ type: 'deadline', items: [{ ...goal, eventType: 'Goal Deadline' }] })
      }
      
      // Add completed goals
      if (goal?.completedAt) {
        const dateKey = format(new Date(goal.completedAt), 'yyyy-MM-dd')
        if (!map[dateKey]) map[dateKey] = []
        map[dateKey].push({ type: 'completed', items: [{ ...goal, eventType: 'Goal Completed' }] })
      }
      
      // Add milestone completions
      goal?.milestones?.forEach(milestone => {
        if (milestone?.completedAt) {
          const dateKey = format(new Date(milestone.completedAt), 'yyyy-MM-dd')
          if (!map[dateKey]) map[dateKey] = []
          map[dateKey].push({ type: 'milestone', items: [{ ...milestone, goalTitle: goal?.title, eventType: 'Milestone Achieved' }] })
        }
      })
    })
    
    return map
  }, [goals])

  const getEventsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return eventMap[dateKey] ?? []
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  return (
    <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className={`h-5 w-5 bg-gradient-to-r ${monthColor} bg-clip-text text-teal-400`} />
            Milestone Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className={`text-lg font-semibold bg-gradient-to-r ${monthColor} bg-clip-text text-transparent px-4`}>
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {/* Padding for days before month start */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`pad-${i}`} className="h-20" />
          ))}
          
          {days.map(day => {
            const events = getEventsForDate(day)
            const hasDeadline = events.some(e => e.type === 'deadline')
            const hasCompleted = events.some(e => e.type === 'completed' || e.type === 'milestone')
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            
            return (
              <motion.button
                key={day.toISOString()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(isSelected ? null : day)}
                className={`h-20 p-1 rounded-lg transition-all relative ${
                  isToday(day)
                    ? `bg-gradient-to-br ${monthColor} text-white`
                    : isSelected
                    ? 'bg-slate-600 ring-2 ring-teal-500'
                    : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <span className={`text-sm font-medium ${isToday(day) ? 'text-white' : ''}`}>
                  {format(day, 'd')}
                </span>
                
                {/* Event indicators */}
                <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-0.5 justify-center">
                  {hasDeadline && (
                    <div className="w-2 h-2 rounded-full bg-amber-500" title="Deadline" />
                  )}
                  {hasCompleted && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500" title="Achievement" />
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Selected Date Details */}
        {selectedDate && selectedDateEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600"
          >
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-teal-400" />
              {format(selectedDate, 'MMMM d, yyyy')}
            </h4>
            <div className="space-y-2">
              {selectedDateEvents.flatMap(eventGroup => 
                eventGroup.items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg flex items-start gap-3 ${
                      eventGroup.type === 'deadline'
                        ? 'bg-amber-500/10 border border-amber-500/20'
                        : eventGroup.type === 'completed'
                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                        : 'bg-purple-500/10 border border-purple-500/20'
                    }`}
                  >
                    {eventGroup.type === 'deadline' ? (
                      <Clock className="h-5 w-5 text-amber-400 mt-0.5" />
                    ) : eventGroup.type === 'completed' ? (
                      <Trophy className="h-5 w-5 text-emerald-400 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-purple-400 mt-0.5" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-white">
                        {item?.title ?? item?.goalTitle}
                      </div>
                      <div className="text-xs text-slate-400">
                        {item?.eventType}
                        {item?.goalTitle && ` • ${item.goalTitle}`}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Deadline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Achievement</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${monthColor}`} />
            <span>Today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
