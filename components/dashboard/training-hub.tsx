
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Target,
  Calendar,
  Clock,
  CheckCircle,
  Play,
  RotateCcw,
  Trophy,
  Dumbbell,
  Zap,
  Star,
  ArrowRight
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TrainingHubProps {
  user: any
}

const weeklyPlan = [
  {
    day: "Monday",
    focus: "Serve Mastery",
    duration: "30 min",
    completed: false,
    exercises: [
      "Deep serve consistency - 50 serves",
      "Short serve placement - 30 serves", 
      "Power serve practice - 20 serves"
    ],
    icon: Target,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    day: "Tuesday", 
    focus: "Dinking Excellence",
    duration: "45 min",
    completed: true,
    exercises: [
      "Cross-court dinking - 100 shots",
      "Down-the-line dinking - 75 shots",
      "Speed-up dinking - 50 shots"
    ],
    icon: Zap,
    gradient: "from-green-500 to-emerald-500"
  },
  {
    day: "Wednesday",
    focus: "Third Shot Drop",
    duration: "40 min", 
    completed: false,
    exercises: [
      "Forehand drop shots - 60 shots",
      "Backhand drop shots - 40 shots",
      "Drop shot placement drill - 30 shots"
    ],
    icon: Trophy,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    day: "Thursday",
    focus: "Mindful Recovery",
    duration: "20 min",
    completed: true,
    exercises: [
      "Breathing meditation - 10 min",
      "Visualization training - 5 min",
      "Gentle stretching - 5 min"
    ],
    icon: Star,
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    day: "Friday",
    focus: "Match Play Strategy",
    duration: "60 min",
    completed: false,
    exercises: [
      "Positioning drills - 20 min",
      "Transition practice - 20 min",
      "Strategy simulation - 20 min"
    ],
    icon: Dumbbell,
    gradient: "from-orange-500 to-red-500"
  },
  {
    day: "Saturday",
    focus: "Competitive Play",
    duration: "90 min",
    completed: false,
    exercises: [
      "Live match practice",
      "Tournament preparation",
      "Performance analysis"
    ],
    icon: Trophy,
    gradient: "from-yellow-500 to-orange-500"
  },
  {
    day: "Sunday",
    focus: "Active Recovery",
    duration: "30 min",
    completed: false,
    exercises: [
      "Light drilling - 15 min",
      "Mental training - 10 min",
      "Goal setting - 5 min"
    ],
    icon: RotateCcw,
    gradient: "from-teal-500 to-blue-500"
  },
]

const drillLibrary = [
  {
    name: "Power Serve Challenge",
    description: "Develop consistent, powerful serves",
    duration: 15,
    difficulty: "Intermediate",
    category: "Serving",
    icon: Target,
    gradient: "from-red-500 to-rose-500"
  },
  {
    name: "Dinking Precision",
    description: "Master soft game control", 
    duration: 20,
    difficulty: "Advanced",
    category: "Dinking",
    icon: Zap,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    name: "Third Shot Mastery",
    description: "Perfect the most important shot",
    duration: 25,
    difficulty: "Advanced", 
    category: "Strategy",
    icon: Trophy,
    gradient: "from-green-500 to-emerald-500"
  },
  {
    name: "Quick Reflexes",
    description: "Improve reaction time at the net",
    duration: 10,
    difficulty: "Beginner",
    category: "Volleys",
    icon: Dumbbell,
    gradient: "from-purple-500 to-pink-500"
  },
]

export default function TrainingHub({ user }: TrainingHubProps) {
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [completedSessions, setCompletedSessions] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Load completed sessions from localStorage or user data
    const completed = user?.trainingPlans?.filter((p: any) => p.completed)?.map((p: any) => p.day) || []
    setCompletedSessions(completed)
  }, [user])

  const handleCompleteSession = async (day: string) => {
    try {
      // In a real app, this would update the database
      setCompletedSessions(prev => [...prev, day])
      toast({
        title: "Session Completed! 🏆",
        description: `Great job completing your ${day} training session!`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark session as complete.",
        variant: "destructive",
      })
    }
  }

  const handleStartSession = (session: any) => {
    setSelectedSession(session)
  }

  const weekProgress = Math.round((completedSessions.length / weeklyPlan.length) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Training Hub
          </h2>
          <p className="text-slate-600 mt-2">
            Your personalized weekly training plan designed to elevate your game
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900">{weekProgress}%</div>
          <div className="text-sm text-slate-600">Week Progress</div>
        </div>
      </div>

      {/* Weekly Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Calendar className="w-5 h-5" />
              This Week's Champion Plan
            </CardTitle>
            <CardDescription className="text-green-700">
              Complete all sessions to unlock next week's advanced training
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Weekly Progress</span>
                <span className="text-sm font-medium text-green-800">
                  {completedSessions.length} / {weeklyPlan.length} sessions
                </span>
              </div>
              <Progress 
                value={weekProgress} 
                className="h-3"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Training Schedule */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {weeklyPlan.map((session, index) => {
          const isCompleted = completedSessions.includes(session.day)
          const isToday = session.day === new Date().toLocaleDateString('en-US', { weekday: 'long' })
          
          return (
            <motion.div
              key={session.day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <Card className={`relative overflow-hidden border-0 shadow-lg cursor-pointer transition-all duration-300 ${
                isToday ? 'ring-2 ring-orange-500' : ''
              } ${isCompleted ? 'bg-green-50' : 'hover:shadow-xl'}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${session.gradient} opacity-5`} />
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${session.gradient}`} />
                
                {isToday && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-orange-500 text-white">Today</Badge>
                  </div>
                )}
                
                {isCompleted && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 bg-gradient-to-br ${session.gradient} rounded-xl flex items-center justify-center`}>
                      <session.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{session.day}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-3 h-3" />
                        <span>{session.duration}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <h4 className="font-semibold text-slate-900 mb-2">
                    {session.focus}
                  </h4>
                  <div className="space-y-1 mb-4">
                    {session.exercises.slice(0, 2).map((exercise, i) => (
                      <div key={i} className="text-xs text-slate-600 flex items-center gap-1">
                        <div className="w-1 h-1 bg-slate-400 rounded-full" />
                        {exercise}
                      </div>
                    ))}
                    {session.exercises.length > 2 && (
                      <div className="text-xs text-slate-500">
                        +{session.exercises.length - 2} more exercises
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {!isCompleted ? (
                      <>
                        <Button 
                          size="sm" 
                          className={`flex-1 bg-gradient-to-r ${session.gradient} hover:opacity-90`}
                          onClick={() => handleStartSession(session)}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Start
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="px-3"
                          onClick={() => handleCompleteSession(session.day)}
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" disabled className="flex-1 bg-green-500 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Drill Library */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-green-500" />
              Champion Drill Library
            </CardTitle>
            <CardDescription>
              Additional drills to supplement your training and target specific skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {drillLibrary.map((drill, index) => (
                <motion.div
                  key={drill.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="p-4 hover:shadow-md transition-all border-slate-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 bg-gradient-to-br ${drill.gradient} rounded-lg flex items-center justify-center`}>
                        <drill.icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <Badge variant="secondary" className="text-xs">
                          {drill.category}
                        </Badge>
                      </div>
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-1">
                      {drill.name}
                    </h4>
                    <p className="text-sm text-slate-600 mb-3">
                      {drill.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                      <span>{drill.duration} min</span>
                      <Badge variant={
                        drill.difficulty === 'Beginner' ? 'secondary' :
                        drill.difficulty === 'Intermediate' ? 'default' : 'destructive'
                      } className="text-xs">
                        {drill.difficulty}
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      <Play className="w-3 h-3 mr-1" />
                      Start Drill
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Session Detail Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedSession && (
                <div className={`w-10 h-10 bg-gradient-to-br ${selectedSession.gradient} rounded-xl flex items-center justify-center`}>
                  <selectedSession.icon className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <div>{selectedSession?.day} Training</div>
                <div className="text-sm font-normal text-slate-600">
                  {selectedSession?.focus} • {selectedSession?.duration}
                </div>
              </div>
            </DialogTitle>
            <DialogDescription>
              Complete all exercises below to master today's focus area
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                {selectedSession.exercises.map((exercise: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{exercise}</p>
                      <p className="text-sm text-slate-600 mt-1">
                        Focus on form and consistency rather than speed
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedSession(null)}>
              Save for Later
            </Button>
            <Button 
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              onClick={() => {
                if (selectedSession) {
                  handleCompleteSession(selectedSession.day)
                  setSelectedSession(null)
                }
              }}
            >
              Mark as Complete
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
