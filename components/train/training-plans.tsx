
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, Target, CheckCircle2, Circle, Play, TrendingUp, Award, Flame, Lock, Star, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const trainingPlans = [
  {
    id: 1,
    name: "7-Day Beginner Bootcamp",
    description: "Perfect introduction to pickleball fundamentals with daily progressive drills",
    duration: "7 days",
    level: "Beginner",
    stage: "current",
    dailyTime: "30-45 min",
    focus: ["Serving", "Dinking", "Positioning", "Basic Strategy"],
    programId: "7day-beginner-bootcamp",
    days: [
      { day: 1, title: "Serve Fundamentals", drills: 3, completed: false },
      { day: 2, title: "Dinking Basics", drills: 3, completed: false },
      { day: 3, title: "Court Positioning", drills: 4, completed: false },
      { day: 4, title: "Third Shot Drop Intro", drills: 3, completed: false },
      { day: 5, title: "Volley Practice", drills: 4, completed: false },
      { day: 6, title: "Strategy & Scoring", drills: 3, completed: false },
      { day: 7, title: "Practice Matches", drills: 2, completed: false }
    ]
  },
  {
    id: 2,
    name: "30-Day Intermediate Challenge",
    description: "Elevate your game with advanced technique refinement and tactical development",
    duration: "30 days",
    level: "Intermediate",
    stage: "advanced",
    dailyTime: "45-60 min",
    focus: ["Third Shot Mastery", "Net Play", "Power Shots", "Match Strategy"],
    programId: "30day-intermediate-challenge",
    days: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      title: i < 10 ? "Third Shot Week" : i < 20 ? "Net Play Week" : "Power & Strategy Week",
      drills: 4,
      completed: false
    }))
  },
  {
    id: 3,
    name: "Advanced Tournament Prep",
    description: "Intensive 14-day program to sharpen skills and mental game for competitive play",
    duration: "14 days",
    level: "Advanced",
    stage: "elite",
    dailyTime: "60-90 min",
    focus: ["Erne Technique", "ATP Shots", "Mental Game", "Advanced Strategy"],
    programId: "advanced-tournament-prep",
    days: Array.from({ length: 14 }, (_, i) => ({
      day: i + 1,
      title: i < 4 ? "Advanced Shots" : i < 8 ? "Strategy Mastery" : i < 11 ? "Mental Training" : "Tournament Simulation",
      drills: 5,
      completed: false
    }))
  },
  {
    id: 4,
    name: "Weekend Warrior Program",
    description: "Flexible 8-week program designed for players with limited practice time",
    duration: "8 weeks",
    level: "Intermediate",
    stage: "advanced",
    dailyTime: "30 min",
    focus: ["Efficient Practice", "Key Skills", "Quick Improvement"],
    programId: "weekend-warrior",
    days: Array.from({ length: 16 }, (_, i) => ({
      day: (i + 1) * 3.5,
      title: `Weekend ${Math.floor(i / 2) + 1}`,
      drills: 3,
      completed: false
    }))
  }
]

export default function TrainingPlans() {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [planProgress, setPlanProgress] = useState<{[key: number]: boolean[]}>({})
  const router = useRouter()

  const getLevelConfig = (level: string) => {
    switch (level) {
      case "Beginner": 
        return { 
          color: "bg-champion-green text-white",
          gradient: "from-champion-green to-emerald-600",
          icon: Target
        }
      case "Intermediate": 
        return { 
          color: "bg-champion-blue text-white",
          gradient: "from-champion-blue to-cyan-600",
          icon: TrendingUp
        }
      case "Advanced": 
        return { 
          color: "bg-champion-gold text-white",
          gradient: "from-champion-gold to-amber-600",
          icon: Award
        }
      default: 
        return { 
          color: "bg-gray-500 text-white",
          gradient: "from-gray-500 to-gray-600",
          icon: Target
        }
    }
  }

  const getStageConfig = (stage: string) => {
    switch (stage) {
      case "current":
        return {
          label: "Current Level",
          color: "bg-champion-green/10 text-champion-green border-champion-green/20"
        }
      case "advanced":
        return {
          label: "Advanced",
          color: "bg-champion-blue/10 text-champion-blue border-champion-blue/20"
        }
      case "elite":
        return {
          label: "Elite",
          color: "bg-champion-gold/10 text-champion-gold border-champion-gold/20"
        }
      default:
        return {
          label: "",
          color: ""
        }
    }
  }

  const toggleDayCompletion = (planId: number, dayIndex: number) => {
    setPlanProgress(prev => {
      const planDays = prev[planId] || Array(trainingPlans.find(p => p.id === planId)?.days.length).fill(false)
      const updated = [...planDays]
      updated[dayIndex] = !updated[dayIndex]
      return { ...prev, [planId]: updated }
    })
  }

  const getCompletionPercentage = (planId: number) => {
    const progress = planProgress[planId]
    if (!progress) return 0
    const completed = progress.filter(Boolean).length
    return Math.round((completed / progress.length) * 100)
  }

  const handleViewProgram = (programId: string) => {
    router.push(`/train/program/${programId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-champion-green/5 dark:from-champion-charcoal dark:via-gray-900 dark:to-champion-green/5">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <Badge className="mb-4 bg-champion-green/10 text-champion-green border-champion-green/20">
            <Flame className="w-3 h-3 mr-1" />
            Structured Training
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-champion-green to-emerald-600 bg-clip-text text-transparent">
            Training Plans
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Structured programs to take your game to the next level
          </p>
        </div>

        {selectedPlan === null ? (
          <>
            {/* Quick Action Banner */}
            <Card className="mb-8 border-champion-green/20 bg-gradient-to-r from-champion-green/5 to-emerald-600/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-champion-green/20 flex items-center justify-center">
                      <Flame className="w-6 h-6 text-champion-green" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        Ready to level up?
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Choose a program that matches your current skill level
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => router.push('/train/drills')}
                    >
                      Quick Drills
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-champion-green to-emerald-600 hover:from-champion-green/90 hover:to-emerald-700"
                      onClick={() => router.push('/train/coach')}
                    >
                      Talk to Coach Kai
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Plans Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {trainingPlans.map(plan => {
                const levelConfig = getLevelConfig(plan.level)
                const stageConfig = getStageConfig(plan.stage)
                const IconComponent = levelConfig.icon
                const progress = getCompletionPercentage(plan.id)

                return (
                  <Card 
                    key={plan.id} 
                    className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-champion-green/30"
                  >
                    <CardHeader className="space-y-4">
                      {/* Header with Icon and Badges */}
                      <div className="flex items-start justify-between">
                        <div className={cn(
                          "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                          levelConfig.gradient
                        )}>
                          <IconComponent className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={levelConfig.color}>
                            {plan.level}
                          </Badge>
                          {stageConfig.label && (
                            <Badge variant="outline" className={stageConfig.color}>
                              {stageConfig.label}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Title and Description */}
                      <div>
                        <CardTitle className="text-2xl mb-2 group-hover:text-champion-green transition-colors">
                          {plan.name}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {plan.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-5">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-champion-green/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-champion-green" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{plan.duration}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-champion-blue/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-champion-blue" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Daily</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{plan.dailyTime}</p>
                          </div>
                        </div>
                      </div>

                      {/* Focus Areas */}
                      <div>
                        <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                          Focus Areas
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {plan.focus.map((area, idx) => (
                            <Badge 
                              key={idx} 
                              variant="secondary" 
                              className="text-xs bg-white dark:bg-gray-800 border"
                            >
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Progress (if started) */}
                      {planProgress[plan.id] && progress > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">Your Progress</span>
                            <span className="font-bold text-champion-green">
                              {progress}%
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={() => setSelectedPlan(plan.id)}
                          variant="outline"
                          className="flex-1"
                        >
                          View Details
                        </Button>
                        <Button
                          onClick={() => handleViewProgram(plan.programId)}
                          className={cn(
                            "flex-1 bg-gradient-to-r text-white shadow-md hover:shadow-lg transition-all",
                            levelConfig.gradient
                          )}
                        >
                          {planProgress[plan.id] ? (
                            <>Continue <ChevronRight className="ml-1 h-4 w-4" /></>
                          ) : (
                            <>Start <Play className="ml-1 h-4 w-4" /></>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Bottom CTA */}
            <Card className="mt-8 border-2 border-dashed border-gray-300 dark:border-gray-700">
              <CardContent className="p-8 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Need a Custom Plan?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Work with Coach Kai to create a personalized training program
                  </p>
                  <Button
                    onClick={() => router.push('/train/coach')}
                    className="bg-gradient-to-r from-champion-green to-emerald-600"
                  >
                    Create Custom Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div>
            {trainingPlans.filter(p => p.id === selectedPlan).map(plan => {
              const levelConfig = getLevelConfig(plan.level)
              const IconComponent = levelConfig.icon

              return (
                <div key={plan.id} className="space-y-6">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedPlan(null)}
                    className="mb-4"
                  >
                    ← Back to all plans
                  </Button>

                  {/* Program Header Card */}
                  <Card className="border-2">
                    <CardHeader className="space-y-6">
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-16 h-16 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                            levelConfig.gradient
                          )}>
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-3xl mb-2">{plan.name}</CardTitle>
                            <CardDescription className="text-base">{plan.description}</CardDescription>
                          </div>
                        </div>
                        <Badge className={levelConfig.color}>
                          {plan.level}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <Calendar className="h-6 w-6 text-champion-green" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                            <p className="font-semibold text-lg text-gray-900 dark:text-white">{plan.duration}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <Clock className="h-6 w-6 text-champion-blue" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Daily Time</p>
                            <p className="font-semibold text-lg text-gray-900 dark:text-white">{plan.dailyTime}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-champion-gold" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Progress</p>
                            <p className="font-semibold text-lg text-gray-900 dark:text-white">{getCompletionPercentage(plan.id)}%</p>
                          </div>
                        </div>
                      </div>

                      {planProgress[plan.id] && (
                        <Progress value={getCompletionPercentage(plan.id)} className="h-3 mb-6" />
                      )}

                      <Button
                        onClick={() => handleViewProgram(plan.programId)}
                        className={cn(
                          "w-full md:w-auto bg-gradient-to-r text-white shadow-md hover:shadow-lg",
                          levelConfig.gradient
                        )}
                        size="lg"
                      >
                        <Play className="mr-2 h-5 w-5" />
                        {planProgress[plan.id] ? "Continue Program" : "Start Program"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Daily Schedule */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Daily Schedule
                    </h2>
                    <div className="space-y-3">
                      {plan.days.map((day, index) => {
                        const isCompleted = planProgress[plan.id]?.[index] || false
                        return (
                          <Card
                            key={index}
                            className={cn(
                              "cursor-pointer transition-all hover:shadow-md",
                              isCompleted && "bg-champion-green/5 border-champion-green/30"
                            )}
                            onClick={() => toggleDayCompletion(plan.id, index)}
                          >
                            <CardContent className="py-5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  {isCompleted ? (
                                    <CheckCircle2 className="h-7 w-7 text-champion-green flex-shrink-0" />
                                  ) : (
                                    <Circle className="h-7 w-7 text-gray-300 flex-shrink-0" />
                                  )}
                                  <div>
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                      Day {Math.floor(day.day)} - {day.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {day.drills} drills · {plan.dailyTime}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant={isCompleted ? "outline" : "default"}
                                  className={cn(
                                    !isCompleted && cn(
                                      "bg-gradient-to-r text-white",
                                      levelConfig.gradient
                                    )
                                  )}
                                >
                                  {isCompleted ? "Review" : "Start"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
