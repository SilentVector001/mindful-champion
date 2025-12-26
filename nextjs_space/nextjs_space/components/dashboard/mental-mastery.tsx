
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Brain,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Star,
  Zap,
  Target,
  Heart,
  TrendingUp,
  Award,
  Wind
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface MentalMasteryProps {
  user: any
}

const mentalSessions = [
  {
    title: "Pre-Match Focus",
    duration: 5,
    description: "Sharpen your concentration before stepping on court",
    icon: Target,
    gradient: "from-blue-500 to-cyan-500",
    emoji: "🎯",
    category: "Focus"
  },
  {
    title: "Breathing Excellence",
    duration: 3,
    description: "Master breathing techniques for calm under pressure",
    icon: Wind,
    gradient: "from-green-500 to-emerald-500",
    emoji: "🌬️",
    category: "Breathing"
  },
  {
    title: "Victory Visualization",
    duration: 7,
    description: "Mentally rehearse your perfect game performance",
    icon: Star,
    gradient: "from-purple-500 to-pink-500",
    emoji: "👁️",
    category: "Visualization"
  },
  {
    title: "Post-Match Recovery",
    duration: 10,
    description: "Reset your mind and analyze performance calmly",
    icon: RotateCcw,
    gradient: "from-indigo-500 to-purple-500",
    emoji: "🧘",
    category: "Recovery"
  },
]

const mentalMetrics = [
  {
    name: "Focus Score",
    score: 8.2,
    maxScore: 10,
    change: "+0.5",
    color: "from-blue-500 to-cyan-500",
    icon: Target,
    description: "Your ability to maintain concentration during matches"
  },
  {
    name: "Stress Management", 
    score: 7.5,
    maxScore: 10,
    change: "+0.2",
    color: "from-green-500 to-emerald-500",
    icon: Heart,
    description: "How well you handle pressure situations"
  },
  {
    name: "Confidence Level",
    score: 9.0,
    maxScore: 10,
    change: "+0.8",
    color: "from-purple-500 to-pink-500",
    icon: Star,
    description: "Your self-belief and mental strength on court"
  }
]

export default function MentalMastery({ user }: MentalMasteryProps) {
  const [activeSession, setActiveSession] = useState<any>(null)
  const [sessionTimer, setSessionTimer] = useState(0)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isSessionActive && !isPaused && sessionTimer > 0) {
      interval = setInterval(() => {
        setSessionTimer((prev) => {
          if (prev <= 1) {
            setIsSessionActive(false)
            handleSessionComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isSessionActive, isPaused, sessionTimer])

  const handleStartSession = (session: any) => {
    setActiveSession(session)
    setSessionTimer(session.duration * 60) // Convert minutes to seconds
    setIsSessionActive(true)
    setIsPaused(false)
    
    toast({
      title: `${session.title} Started`,
      description: "Find a quiet space and focus on your breathing",
    })
  }

  const handlePauseResume = () => {
    setIsPaused(!isPaused)
  }

  const handleStopSession = () => {
    setIsSessionActive(false)
    setActiveSession(null)
    setSessionTimer(0)
    setIsPaused(false)
  }

  const handleSessionComplete = async () => {
    if (activeSession) {
      toast({
        title: "Session Complete! 🧘",
        description: `Great work on your ${activeSession.title} session. Your mental game is getting stronger!`,
      })
      
      // In a real app, this would update the user's mental session history
      try {
        await fetch('/api/mental-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionType: activeSession.category.toLowerCase(),
            duration: activeSession.duration,
            completed: true,
            rating: Math.floor(Math.random() * 3) + 8, // Simulate 8-10 rating
          }),
        })
      } catch (error) {
        console.error('Failed to log mental session:', error)
      }
    }
    setActiveSession(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Mental Mastery
          </h2>
          <p className="text-slate-600 mt-2">
            Train your mind to become unshakeable under pressure
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-slate-600">Mindful Champion Zone</span>
        </div>
      </div>

      {/* Mental Performance Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        {mentalMetrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5`} />
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${metric.color}`} />
              
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{metric.name}</CardTitle>
                  <div className={`w-8 h-8 bg-gradient-to-br ${metric.color} rounded-lg flex items-center justify-center`}>
                    <metric.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold text-slate-900">
                      {metric.score.toFixed(1)}
                    </span>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800">
                        {metric.change} this week
                      </Badge>
                    </div>
                  </div>
                  
                  <Progress 
                    value={(metric.score / metric.maxScore) * 100}
                    className="h-2"
                  />
                  
                  <p className="text-sm text-slate-600">
                    {metric.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Active Session Card */}
      {activeSession && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:w-96 z-50"
        >
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <div className={`absolute inset-0 bg-gradient-to-br ${activeSession.gradient} opacity-10 rounded-lg`} />
            
            <CardHeader className="text-center pb-4">
              <div className="text-4xl mb-2">{activeSession.emoji}</div>
              <CardTitle className="text-2xl">{activeSession.title}</CardTitle>
              <CardDescription>{activeSession.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="text-center space-y-6">
              {/* Timer Display */}
              <div className="text-6xl font-mono font-bold text-slate-900">
                {formatTime(sessionTimer)}
              </div>
              
              {/* Progress Circle */}
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-200"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 54}`}
                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - (sessionTimer / (activeSession.duration * 60)))}`}
                    className="text-indigo-500 transition-all duration-1000 ease-linear"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-600">
                    {Math.round(((activeSession.duration * 60 - sessionTimer) / (activeSession.duration * 60)) * 100)}%
                  </span>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePauseResume}
                  className="px-6"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleStopSession}
                  className="px-6"
                >
                  Stop Session
                </Button>
              </div>
              
              {/* Session Status */}
              <div className="text-center">
                {isPaused && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Session Paused
                  </Badge>
                )}
                {!isPaused && isSessionActive && (
                  <Badge className="bg-green-100 text-green-800">
                    Session Active
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Session Library */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-500" />
              Mental Training Sessions
            </CardTitle>
            <CardDescription>
              Choose a session to strengthen your mental game and build championship mindset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {mentalSessions.map((session, index) => (
                <motion.div
                  key={session.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-all border-slate-200 relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${session.gradient} opacity-5`} />
                    
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{session.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900">{session.title}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {session.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">
                          {session.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Timer className="w-4 h-4" />
                            <span>{session.duration} minutes</span>
                          </div>
                          <Button
                            size="sm"
                            className={`bg-gradient-to-r ${session.gradient} hover:opacity-90`}
                            onClick={() => handleStartSession(session)}
                            disabled={isSessionActive}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Start
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Insight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-800">
              <Zap className="w-5 h-5" />
              Today's Mental Champion Insight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src="https://cdn.abacus.ai/images/c24b1eb6-b223-42e0-800b-fef9849ac34e.png"
                  alt="Mental training"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <div>
                <p className="text-indigo-900 font-medium mb-2">
                  "Your focus peaks in morning sessions. Consider scheduling important matches before noon for optimal performance."
                </p>
                <div className="flex items-center gap-2 text-sm text-indigo-700">
                  <Award className="w-4 h-4" />
                  <span>Based on your mental performance data</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mental Training History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Recent Mental Training
            </CardTitle>
            <CardDescription>
              Your mental training progress over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user?.mentalSessions?.length > 0 ? (
              <div className="space-y-3">
                {user.mentalSessions.slice(0, 5).map((session: any, index: number) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 capitalize">
                          {session.sessionType} Session
                        </p>
                        <p className="text-sm text-slate-600">
                          {session.duration} minutes • {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-800">
                      {session.rating}/10
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No mental training sessions yet</p>
                <p className="text-sm">Start your first session to build mental strength</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
