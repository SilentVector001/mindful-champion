
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Target, 
  Play, 
  Clock, 
  CheckCircle,
  Upload,
  Camera,
  BookOpen,
  Zap,
  Award,
  Timer
} from "lucide-react"
import SimplifiedNav from "@/components/layout/simplified-nav"
import PersistentAvatar from "@/components/avatar/persistent-avatar"

const drillCategories = [
  {
    name: "Serving",
    icon: Target,
    color: "from-blue-500 to-blue-600",
    drills: [
      { name: "Power Serve Practice", duration: "15 min", difficulty: "Beginner" },
      { name: "Placement Precision", duration: "20 min", difficulty: "Intermediate" },
      { name: "Spin Serve Mastery", duration: "25 min", difficulty: "Advanced" },
    ]
  },
  {
    name: "Third Shot Drop",
    icon: Zap,
    color: "from-green-500 to-green-600",
    drills: [
      { name: "Basic Drop Form", duration: "10 min", difficulty: "Beginner" },
      { name: "Target Practice", duration: "15 min", difficulty: "Intermediate" },
      { name: "Under Pressure", duration: "20 min", difficulty: "Advanced" },
    ]
  },
  {
    name: "Dinking",
    icon: Timer,
    color: "from-purple-500 to-purple-600",
    drills: [
      { name: "Crosscourt Control", duration: "12 min", difficulty: "Beginner" },
      { name: "Speed Variations", duration: "18 min", difficulty: "Intermediate" },
      { name: "Kitchen Battle", duration: "25 min", difficulty: "Advanced" },
    ]
  },
  {
    name: "Volleys",
    icon: Award,
    color: "from-orange-500 to-orange-600",
    drills: [
      { name: "Basic Volley Form", duration: "8 min", difficulty: "Beginner" },
      { name: "Reflex Training", duration: "15 min", difficulty: "Intermediate" },
      { name: "Power Volleys", duration: "22 min", difficulty: "Advanced" },
    ]
  }
]

export default function TrainPage() {
  const [selectedCategory, setSelectedCategory] = useState(0)
  const [completedDrills, setCompletedDrills] = useState<Set<string>>(new Set())
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [sessionTime, setSessionTime] = useState(0)

  // Timer for active session
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (activeSession) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1)
      }, 1000)
    } else if (!activeSession && sessionTime !== 0) {
      if (interval) clearInterval(interval)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeSession, sessionTime])

  const startDrill = (drillName: string) => {
    setActiveSession(drillName)
    setSessionTime(0)
  }

  const completeDrill = (drillName: string) => {
    setCompletedDrills(prev => new Set([...prev, drillName]))
    setActiveSession(null)
    setSessionTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const totalDrills = drillCategories.reduce((sum, category) => sum + category.drills.length, 0)
  const completedCount = completedDrills.size
  const progressPercentage = (completedCount / totalDrills) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <SimplifiedNav />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Training Hub 🎯
          </h1>
          <p className="text-slate-600 mb-4">
            Master your skills with personalized drills and video analysis
          </p>
          
          {/* Progress Overview */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-green-800">Today's Progress</span>
                <span className="text-sm text-green-600">{completedCount}/{totalDrills} drills completed</span>
              </div>
              <Progress value={progressPercentage} className="h-2 mb-2" />
              <div className="flex items-center gap-4 text-sm text-green-700">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {completedCount} completed
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.floor(sessionTime / 60)} minutes active
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-4 mb-8"
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1">Upload Video</h3>
              <p className="text-sm text-slate-600">Get AI analysis of your form</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1">Live Recording</h3>
              <p className="text-sm text-slate-600">Record and analyze in real-time</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1">Technique Library</h3>
              <p className="text-sm text-slate-600">Browse form guides & tips</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Session Banner */}
        {activeSession && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="font-medium">Active Session: {activeSession}</span>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {formatTime(sessionTime)}
                    </Badge>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => completeDrill(activeSession)}
                    className="bg-white text-orange-600 hover:bg-white/90"
                  >
                    Complete Drill
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Drill Categories */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Category Selection */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold text-slate-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {drillCategories.map((category, index) => (
                <motion.button
                  key={category.name}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedCategory(index)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedCategory === index
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                      : 'bg-white hover:bg-slate-50 text-slate-700 border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <category.icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className={`text-sm ${selectedCategory === index ? 'text-white/80' : 'text-slate-500'}`}>
                        {category.drills.length} drills
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Drill List */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">
                {drillCategories[selectedCategory].name} Drills
              </h3>
              <Badge variant="outline">
                {drillCategories[selectedCategory].drills.length} available
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {drillCategories[selectedCategory].drills.map((drill, index) => {
                const isCompleted = completedDrills.has(drill.name)
                const isActive = activeSession === drill.name
                
                return (
                  <motion.div
                    key={drill.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -2 }}
                  >
                    <Card className={`h-full transition-all border-0 ${
                      isActive 
                        ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg'
                        : isCompleted
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                        : 'bg-white hover:shadow-lg'
                    }`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className={`text-lg ${isActive ? 'text-white' : isCompleted ? 'text-green-800' : 'text-slate-900'}`}>
                            {drill.name}
                          </CardTitle>
                          {isCompleted && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className={`h-4 w-4 ${isActive ? 'text-white/80' : 'text-slate-500'}`} />
                            <span className={`text-sm ${isActive ? 'text-white/80' : 'text-slate-600'}`}>
                              {drill.duration}
                            </span>
                          </div>
                          <Badge 
                            variant={isActive ? "secondary" : "outline"}
                            className={isActive ? "bg-white/20 text-white" : ""}
                          >
                            {drill.difficulty}
                          </Badge>
                        </div>
                        
                        <Button
                          onClick={() => isActive ? completeDrill(drill.name) : startDrill(drill.name)}
                          disabled={isCompleted}
                          className={`w-full ${
                            isActive
                              ? 'bg-white text-orange-600 hover:bg-white/90'
                              : isCompleted
                              ? 'bg-green-600 text-white'
                              : 'bg-gradient-to-r from-teal-600 to-orange-600 hover:from-teal-700 hover:to-orange-700 text-white'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Complete ({formatTime(sessionTime)})
                            </>
                          ) : isCompleted ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Completed
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Start Drill
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Avatar */}
      <PersistentAvatar currentPage="train" />
    </div>
  )
}
