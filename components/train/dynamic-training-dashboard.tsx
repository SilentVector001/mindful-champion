
"use client"

/**
 * Dynamic Training Dashboard
 * 
 * Sophisticated, interactive training experience with:
 * - Animated progress tracking
 * - Real-time updates
 * - Smooth transitions
 * - Engaging visual feedback
 * 
 * User Experience: Dead simple, intuitive
 * Code Architecture: Complex, scalable, investor-ready
 */

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  Play,
  CheckCircle2,
  TrendingUp,
  Award,
  Flame,
  Target,
  Calendar,
  Clock,
  ChevronRight,
  Sparkles,
  Star,
  Trophy,
  BookOpen,
  Lock,
  Brain,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Program {
  id: string
  name: string
  description: string
  skillLevel: string
  totalDays?: number
  dailyTimeMinutes?: number
  durationDays?: number
  estimatedTimePerDay?: string
  category?: string
}

interface UserProgram {
  id: string
  programId: string
  status: string
  currentDay: number
  progress?: number
  completionPercentage?: number
  startedAt?: Date
  program: Program
}

interface DynamicTrainingDashboardProps {
  programs: Program[]
  userEnrollments: UserProgram[]
}

export default function DynamicTrainingDashboard({
  programs,
  userEnrollments
}: DynamicTrainingDashboardProps) {
  const router = useRouter()
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [isEnrolling, setIsEnrolling] = useState<string | null>(null)
  const [showCustomGoal, setShowCustomGoal] = useState(false)
  const [customGoal, setCustomGoal] = useState('')
  const [isCreatingCustom, setIsCreatingCustom] = useState(false)

  // Filter programs
  const filteredPrograms = selectedLevel
    ? programs.filter(p => p.skillLevel.toLowerCase() === selectedLevel.toLowerCase())
    : programs

  // Separate active and available programs
  const activePrograms = userEnrollments.filter(
    up => up.status === "in_progress" || up.status === "paused"
  )
  const availablePrograms = filteredPrograms.filter(
    p => !userEnrollments.some(up => up.programId === p.id)
  )

  const getLevelConfig = (level: string) => {
    const configs = {
      beginner: {
        color: "from-champion-green to-emerald-600",
        icon: BookOpen,
        badge: "bg-champion-green text-white"
      },
      intermediate: {
        color: "from-champion-blue to-cyan-600",
        icon: Target,
        badge: "bg-champion-blue text-white"
      },
      advanced: {
        color: "from-champion-gold to-amber-600",
        icon: Trophy,
        badge: "bg-champion-gold text-white"
      },
      elite: {
        color: "from-purple-600 to-violet-600",
        icon: Award,
        badge: "bg-purple-600 text-white"
      }
    }
    return configs[level.toLowerCase() as keyof typeof configs] || configs.beginner
  }

  const handleEnroll = async (programId: string) => {
    setIsEnrolling(programId)
    try {
      const response = await fetch("/api/training/programs/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId })
      })

      if (!response.ok) throw new Error("Failed to enroll")

      toast.success("🎉 Program started! Let's get to work!")
      // Navigate to the program detail page
      router.push(`/train/program/${programId}`)
    } catch (error) {
      toast.error("Failed to start program")
    } finally {
      setIsEnrolling(null)
    }
  }

  const handleCreateCustomProgram = async () => {
    console.log('🔥 CREATE PROGRAM BUTTON CLICKED!')
    console.log('Custom Goal:', customGoal)
    
    if (!customGoal.trim()) {
      console.log('⚠️ Goal is empty, showing error')
      toast.error('Please describe your training goal')
      return
    }

    console.log('✅ Starting custom program creation...')
    setIsCreatingCustom(true)
    
    try {
      console.log('📡 Making API request to /api/training/programs/custom')
      const response = await fetch('/api/training/programs/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          goal: customGoal,
          skillLevel: 'intermediate' 
        })
      })

      console.log('📥 API Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ API Response data:', data)
        toast.success('🎯 Custom program created by Coach Kai!')
        console.log('🚀 Redirecting to:', `/train/custom-program/${data.programId}`)
        // Redirect to regular program viewer with custom program ID
        router.push(`/train/custom-program/${data.programId}`)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ Custom program creation failed:', errorData)
        toast.error(errorData.error || 'Failed to create custom program')
      }
    } catch (error) {
      console.error('💥 Error creating custom program:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      console.log('🏁 Setting isCreatingCustom to false')
      setIsCreatingCustom(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header with Filters */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-light text-gray-900 mb-3">
              Your Training <span className="font-medium bg-gradient-to-r from-champion-green to-champion-gold bg-clip-text text-transparent">Journey</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Choose from structured programs designed by top coaches, or let us create a personalized path just for you.
            </p>
          </div>

          {/* Level Filters */}
          <div className="flex flex-wrap gap-2">
            {["All", "Beginner", "Intermediate", "Advanced"].map((level) => (
              <Button
                key={level}
                variant={selectedLevel === (level === "All" ? null : level.toLowerCase()) ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLevel(level === "All" ? null : level.toLowerCase())}
                className={cn(
                  "transition-all duration-200",
                  selectedLevel === (level === "All" ? null : level.toLowerCase()) &&
                    "bg-gradient-to-r from-champion-green to-emerald-600 text-white"
                )}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Active Programs Section */}
      {activePrograms.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="text-2xl font-bold">Continue Your Journey</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activePrograms.map((userProgram, index) => {
              const config = getLevelConfig(userProgram.program.skillLevel)
              const IconComponent = config.icon

              return (
                <motion.div
                  key={userProgram.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 border-champion-green/20">
                    {/* Gradient Header */}
                    <div className={cn(
                      "h-2 bg-gradient-to-r",
                      config.color
                    )} />

                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                            config.color
                          )}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{userProgram.program.name}</h3>
                            <Badge className={config.badge} variant="secondary">
                              {userProgram.program.skillLevel}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Progress Stats */}
                      <div className="space-y-4 mb-6">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Overall Progress</span>
                            <span className="font-semibold">{Math.round(userProgram.completionPercentage || 0)}%</span>
                          </div>
                          <Progress value={userProgram.completionPercentage || 0} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>Day {userProgram.currentDay} of {userProgram.program.durationDays}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{parseInt(userProgram.program.estimatedTimePerDay || "30") || 30} min/day</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-champion-green to-emerald-600 hover:from-champion-green/90 hover:to-emerald-600/90"
                        onClick={() => router.push(`/train/program/${userProgram.programId}`)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Continue Training
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.section>
      )}

      {/* AI Custom Program Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: activePrograms.length > 0 ? 0.3 : 0.2 }}
        className="mb-12"
      >
        <Card className="border-2 border-dashed border-champion-gold/50 bg-gradient-to-br from-champion-gold/5 via-white to-champion-green/5 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-champion-gold to-amber-600 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  AI-Powered Custom Program
                  <Badge className="bg-champion-gold text-white">New</Badge>
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Don't see what you're looking for? Let Coach Kai create a personalized program for you.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showCustomGoal ? (
              <Button
                onClick={() => setShowCustomGoal(true)}
                size="lg"
                className="w-full bg-gradient-to-r from-champion-gold to-amber-600 hover:from-champion-gold/90 hover:to-amber-600/90 text-white"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create My Custom Program
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    What would you like to improve?
                  </label>
                  <Textarea
                    placeholder="Example: I want to improve my dinking consistency and learn when to speed up from the kitchen line. I struggle with the transition between soft and aggressive play..."
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    rows={4}
                    className="border-2 border-champion-gold/30 focus:border-champion-gold resize-none"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      console.log('🎯 Button onClick fired!')
                      handleCreateCustomProgram()
                    }}
                    disabled={isCreatingCustom || !customGoal.trim()}
                    className="flex-1 bg-gradient-to-r from-champion-gold to-amber-600 hover:from-champion-gold/90 hover:to-amber-600/90 text-white"
                  >
                    {isCreatingCustom ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Coach Kai is creating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Create Program
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCustomGoal(false)
                      setCustomGoal('')
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    <strong>Pro Tip:</strong> Be specific about your challenges! The more detail you provide, the better Coach Kai can tailor your program.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>

      {/* Available Programs Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-champion-gold" />
          <h2 className="text-2xl font-bold">Available Programs</h2>
        </div>

        {availablePrograms.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">All Programs Unlocked!</h3>
            <p className="text-muted-foreground">
              You're enrolled in all available programs. Keep training!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {availablePrograms.map((program, index) => {
                const config = getLevelConfig(program.skillLevel)
                const IconComponent = config.icon

                return (
                  <motion.div
                    key={program.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                      {/* Gradient Header */}
                      <div className={cn(
                        "h-32 bg-gradient-to-br relative",
                        config.color
                      )}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <IconComponent className="w-16 h-16 text-white/90" />
                        </div>
                        <Badge className="absolute top-3 right-3 bg-white/20 text-white backdrop-blur-sm border-white/30">
                          {program.skillLevel}
                        </Badge>
                      </div>

                      <CardContent className="p-6 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg mb-2">{program.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4 flex-1">
                          {program.description}
                        </p>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{program.durationDays} days</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{(parseInt(program.estimatedTimePerDay || "30") || 30)} min/day</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Target className="w-4 h-4 text-muted-foreground" />
                            <span className="capitalize">{program.category}</span>
                          </div>
                        </div>

                        <Button
                          className={cn(
                            "w-full bg-gradient-to-r",
                            config.color,
                            "text-white hover:opacity-90 transition-opacity"
                          )}
                          onClick={() => handleEnroll(program.id)}
                          disabled={isEnrolling === program.id}
                        >
                          {isEnrolling === program.id ? (
                            "Starting..."
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Start Program
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.section>
    </div>
  )
}
