// @ts-nocheck

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Zap, 
  Clock, 
  Target, 
  Play, 
  CheckCircle2, 
  TrendingUp,
  Flame,
  Trophy,
  ArrowRight,
  ChevronRight,
  Plus,
  Calendar,
  Sparkles,
  Activity,
  Heart
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { drillsDatabase, getDrillsByContext, getDrillsByDuration, type Drill } from "@/lib/drills-data"

// Context-based drill sequences
const DRILL_SEQUENCES = {
  "pre-match": {
    id: "pre-match",
    name: "Pre-Match Warmup",
    duration: "10 min",
    description: "Essential activation before competition",
    icon: Trophy,
    color: "emerald",
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-50 to-teal-50",
    sequence: [
      { drillId: "warmup-001", duration: 5, order: 1 },
      { drillId: "dink-001", duration: 3, order: 2 },
      { drillId: "serve-001", duration: 2, order: 3 }
    ],
    reasoning: "Dynamic warmup → Dinking (80% of game) → Serve activation"
  },
  "quick-practice": {
    id: "quick-practice",
    name: "Quick Practice",
    duration: "20 min",
    description: "Efficient skill work in limited time",
    icon: Target,
    color: "blue",
    gradient: "from-blue-500 to-indigo-500",
    bgGradient: "from-blue-50 to-indigo-50",
    sequence: [
      { drillId: "footwork-001", duration: 5, order: 1 },
      { drillId: "dink-002", duration: 8, order: 2 },
      { drillId: "third-shot-001", duration: 7, order: 3 }
    ],
    reasoning: "Movement fundamentals → Advanced dinking → Third shot mastery"
  },
  "skill-tuneup": {
    id: "skill-tuneup",
    name: "Skill Tune-Up",
    duration: "15 min",
    description: "Target specific weaknesses",
    icon: Activity,
    color: "purple",
    gradient: "from-purple-500 to-violet-500",
    bgGradient: "from-purple-50 to-violet-50",
    sequence: [
      { drillId: "serve-002", duration: 5, order: 1 },
      { drillId: "volley-001", duration: 5, order: 2 },
      { drillId: "overhead-001", duration: 5, order: 3 }
    ],
    reasoning: "Serve variety → Volley reflexes → Overhead power"
  },
  "custom": {
    id: "custom",
    name: "Build Your Session",
    duration: "Custom",
    description: "Pick drills that match your needs",
    icon: Plus,
    color: "orange",
    gradient: "from-orange-500 to-red-500",
    bgGradient: "from-orange-50 to-red-50",
    sequence: [],
    reasoning: "Personalized drill selection"
  }
}

export default function QuickDrillsV2() {
  const router = useRouter()
  const [selectedContext, setSelectedContext] = useState<string | null>(null)
  const [customDrills, setCustomDrills] = useState<string[]>([])
  const [completedDrills, setCompletedDrills] = useState<Set<string>>(new Set())
  const [currentStreak, setCurrentStreak] = useState(3)
  const [totalSessionsThisWeek, setTotalSessionsThisWeek] = useState(12)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getDrillDetails = (drillId: string): Drill | undefined => {
    return drillsDatabase.find(d => d.id === drillId)
  }

  const toggleDrillCompletion = (drillId: string) => {
    setCompletedDrills(prev => {
      const updated = new Set(prev)
      if (updated.has(drillId)) {
        updated.delete(drillId)
      } else {
        updated.add(drillId)
      }
      return updated
    })
  }

  const addCustomDrill = (drillId: string) => {
    if (!customDrills.includes(drillId)) {
      setCustomDrills([...customDrills, drillId])
    }
  }

  const removeCustomDrill = (drillId: string) => {
    setCustomDrills(customDrills.filter(id => id !== drillId))
  }

  const calculateTotalDuration = (drillIds: string[]) => {
    return drillIds.reduce((total, id) => {
      const drill = getDrillDetails(id)
      return total + (drill?.duration || 0)
    }, 0)
  }

  const getContextSequence = () => {
    if (selectedContext === "custom") {
      return customDrills.map(id => getDrillDetails(id)).filter(Boolean) as Drill[]
    }
    
    if (selectedContext && DRILL_SEQUENCES[selectedContext as keyof typeof DRILL_SEQUENCES]) {
      const sequence = DRILL_SEQUENCES[selectedContext as keyof typeof DRILL_SEQUENCES].sequence
      return sequence.map(s => getDrillDetails(s.drillId)).filter(Boolean) as Drill[]
    }
    
    return []
  }

  const currentSequence = getContextSequence()
  const completionRate = currentSequence.length > 0 
    ? (Array.from(completedDrills).filter(id => currentSequence.find(d => d.id === id)).length / currentSequence.length) * 100 
    : 0

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Spacious Container */}
      <main className="max-w-[1400px] mx-auto px-8 sm:px-12 py-16 space-y-20">
        
        {/* HERO SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          {/* Header */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl shadow-lg shadow-cyan-500/30">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-6xl font-light text-white">
                Quick <span className="font-medium">Drills</span>
              </h1>
            </div>
            <p className="text-2xl text-slate-300 font-light">
              Focused practice sessions designed for your schedule
            </p>
          </div>

          {/* Intro/Explanation Card */}
          <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-emerald-500/10 to-blue-500/10 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-white mb-2">
                    What are Quick Drills?
                  </h2>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    Quick Drills are focused, time-efficient practice sessions designed to fit your busy schedule. 
                    Choose from pre-built sequences optimized for specific scenarios (pre-match warmup, quick practice, skill tune-up) 
                    or build your own custom session. Track your progress with stats below!
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                      <Clock className="w-3 h-3 mr-1" />
                      10-20 Minutes
                    </Badge>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      <Target className="w-3 h-3 mr-1" />
                      Targeted Practice
                    </Badge>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Track Progress
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Row */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-orange-500/30 bg-slate-800/80 backdrop-blur-sm shadow-xl shadow-orange-500/10">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-300 font-medium">Current Streak</span>
                  <div className="p-2 bg-orange-500/20 rounded-xl border border-orange-500/30">
                    <Flame className="w-5 h-5 text-orange-400" />
                  </div>
                </div>
                <div className="text-5xl font-light text-white mb-2">
                  {currentStreak}<span className="text-3xl text-slate-400"> days</span>
                </div>
                <p className="text-sm text-orange-400 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-4 h-4" />
                  Keep it going!
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/30 bg-slate-800/80 backdrop-blur-sm shadow-xl shadow-emerald-500/10">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-300 font-medium">This Week</span>
                  <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div className="text-5xl font-light text-white mb-2">
                  {totalSessionsThisWeek}<span className="text-3xl text-slate-400"> sessions</span>
                </div>
                <p className="text-sm text-emerald-400 font-medium">Above average</p>
              </CardContent>
            </Card>

            <Card className="border-blue-500/30 bg-slate-800/80 backdrop-blur-sm shadow-xl shadow-blue-500/10">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-300 font-medium">Next Goal</span>
                  <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <div className="text-5xl font-light text-white mb-2">
                  15<span className="text-3xl text-slate-400"> min</span>
                </div>
                <p className="text-sm text-slate-300 font-medium">Dinking mastery</p>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* CONTEXT SELECTOR */}
        {!selectedContext && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-light text-white">
              What brings you to the <span className="font-medium">court today?</span>
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(DRILL_SEQUENCES).map(([key, sequence]) => (
                <Card
                  key={key}
                  className="border-slate-700/50 bg-slate-800/60 backdrop-blur-sm shadow-lg hover:shadow-xl hover:bg-slate-800/80 hover:border-cyan-500/50 transition-all cursor-pointer group"
                  onClick={() => setSelectedContext(key)}
                >
                  <CardContent className="p-8 text-center space-y-6">
                    <div className={cn(
                      "w-16 h-16 mx-auto bg-gradient-to-br rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg",
                      sequence.gradient
                    )}>
                      <sequence.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-white mb-2 group-hover:text-cyan-400 transition-colors">{sequence.name}</h3>
                      <Badge className="mb-3 bg-slate-700/60 text-slate-300 border-slate-600/50">
                        <Clock className="w-3 h-3 mr-1" />
                        {sequence.duration}
                      </Badge>
                      <p className="text-sm text-slate-400 leading-relaxed">{sequence.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>
        )}

        {/* SELECTED SEQUENCE VIEW */}
        {selectedContext && (
          <AnimatePresence mode="wait">
            <motion.section
              key="sequence-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-12"
            >
              {/* Sequence Header */}
              {(() => {
                const currentSequenceData = DRILL_SEQUENCES[selectedContext as keyof typeof DRILL_SEQUENCES]
                const SequenceIcon = currentSequenceData?.icon || Target
                
                return (
                  <Card className="border-slate-700/50 bg-slate-800/80 backdrop-blur-sm shadow-xl overflow-hidden">
                    <CardContent className="p-12">
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-6">
                          <div className={cn(
                            "p-4 bg-gradient-to-br rounded-2xl shadow-lg",
                            currentSequenceData?.gradient || "from-cyan-500 to-emerald-500"
                          )}>
                            <SequenceIcon className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h2 className="text-4xl font-light text-white mb-2">
                              {currentSequenceData?.name}
                            </h2>
                            <p className="text-xl text-slate-300">
                              {currentSequenceData?.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                          onClick={() => {
                            setSelectedContext(null)
                            setCompletedDrills(new Set())
                            setCustomDrills([])
                          }}
                        >
                          Change Session
                        </Button>
                      </div>

                      {selectedContext !== "custom" && (
                        <div className="bg-slate-900/60 backdrop-blur rounded-xl p-6 space-y-4 border border-slate-700/50">
                          <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="w-5 h-5 text-cyan-400" />
                            <span className="font-medium text-white">Recommended Sequence</span>
                          </div>
                          <p className="text-slate-300">
                            {currentSequenceData?.reasoning}
                          </p>
                          <div className="flex items-center justify-between pt-4">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <Clock className="w-4 h-4" />
                              <span>Total: {currentSequenceData?.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-400">Progress: {completionRate.toFixed(0)}%</span>
                              <Progress value={completionRate} className="w-32" />
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedContext === "custom" && (
                        <div className="bg-slate-900/60 backdrop-blur rounded-xl p-6 border border-slate-700/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-slate-300 mb-2">Build your custom session below</p>
                              <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Clock className="w-4 h-4" />
                                <span>Total: {calculateTotalDuration(customDrills)} min</span>
                              </div>
                            </div>
                            {customDrills.length > 0 && (
                              <Button
                                className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Start Custom Session
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })()}

              {/* Drill Sequence */}
              <div className="space-y-8">
                <h3 className="text-2xl font-light text-white">
                  {selectedContext === "custom" ? "Add Drills to Your Session" : "Your Session"}
                </h3>

                <div className="space-y-4">
                  {currentSequence.map((drill, index) => {
                    const isCompleted = completedDrills.has(drill.id)
                    const isCustomSession = selectedContext === "custom"

                    return (
                      <Card
                        key={drill.id}
                        className={cn(
                          "border-slate-700/50 bg-slate-800/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all",
                          isCompleted && "bg-gradient-to-r from-emerald-900/40 to-green-900/40 border-emerald-500/30"
                        )}
                      >
                        <CardContent className="p-8">
                          <div className="grid lg:grid-cols-[auto,1fr,auto] gap-8 items-center">
                            {/* Step Number */}
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center text-xl font-light shadow-lg",
                              isCompleted 
                                ? "bg-emerald-600 text-white" 
                                : "bg-slate-700 text-slate-300"
                            )}>
                              {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : index + 1}
                            </div>

                            {/* Drill Info */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h4 className="text-2xl font-light text-white">{drill.name}</h4>
                                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                                  {drill.category}
                                </Badge>
                                <div className="flex items-center gap-1 text-slate-400">
                                  <Clock className="w-4 h-4" />
                                  <span className="text-sm">{drill.duration} min</span>
                                </div>
                              </div>
                              <p className="text-slate-300">{drill.description}</p>
                              <p className="text-sm text-cyan-400 italic">{drill.tagline}</p>
                              
                              {/* Focus Areas */}
                              <div className="flex flex-wrap gap-2">
                                {drill.focusAreas.slice(0, 3).map((area, i) => (
                                  <Badge key={i} variant="outline" className="text-xs border-slate-600 text-slate-400">
                                    {area}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                              <Button
                                variant="outline"
                                size="lg"
                                onClick={() => router.push(`/train/drills#${drill.id}`)}
                              >
                                View Details
                              </Button>
                              <Button
                                size="lg"
                                className={cn(
                                  isCompleted
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700"
                                )}
                                onClick={() => toggleDrillCompletion(drill.id)}
                              >
                                {isCompleted ? (
                                  <>
                                    <CheckCircle2 className="w-5 h-5 mr-2" />
                                    Done
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-5 h-5 mr-2" />
                                    Start
                                  </>
                                )}
                              </Button>
                              {isCustomSession && (
                                <Button
                                  variant="outline"
                                  size="lg"
                                  onClick={() => removeCustomDrill(drill.id)}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Add More Drills for Custom Session */}
                {selectedContext === "custom" && (
                  <Card className="border-slate-700/50 bg-slate-800/60 backdrop-blur-sm shadow-lg">
                    <CardContent className="p-8">
                      <h4 className="text-xl font-medium text-white mb-6">Available Drills</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {drillsDatabase
                          .filter(d => !customDrills.includes(d.id))
                          .slice(0, 6)
                          .map(drill => (
                            <Button
                              key={drill.id}
                              variant="outline"
                              className="justify-between h-auto p-4 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-cyan-500/50"
                              onClick={() => addCustomDrill(drill.id)}
                            >
                              <div className="text-left">
                                <div className="font-medium">{drill.name}</div>
                                <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                                  <Clock className="w-3 h-3" />
                                  {drill.duration} min
                                  <Badge className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30">{drill.category}</Badge>
                                </div>
                              </div>
                              <Plus className="w-4 h-4 ml-2" />
                            </Button>
                          ))}
                      </div>
                      <Button
                        variant="link"
                        className="mt-4 text-cyan-400 hover:text-cyan-300"
                        onClick={() => router.push('/train/drills')}
                      >
                        View all drills <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Completion CTA */}
                {completionRate === 100 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm shadow-xl">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-6">
                          <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
                            <Trophy className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-medium text-white mb-2">Session Complete!</h3>
                            <p className="text-slate-300">Great work today. Ready for your next challenge?</p>
                          </div>
                          <Button
                            size="lg"
                            onClick={() => router.push('/connect/matches')}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-8"
                          >
                            Find a Match
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </motion.section>
          </AnimatePresence>
        )}
      </main>
    </div>
  )
}
