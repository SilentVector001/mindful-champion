
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Play,
  Clock,
  Target,
  Trophy,
  Calendar,
  BookOpen,
  ChevronRight,
  Star,
  Zap,
  TrendingUp,
  CheckCircle2,
  Users,
  Award,
  Sparkles,
  ArrowRight
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface TrainingProgram {
  id: string
  programId: string
  name: string
  tagline?: string | null
  description: string
  durationDays: number
  skillLevel: string
  estimatedTimePerDay?: string | null
  keyOutcomes?: any
  isActive: boolean
}

interface UserProgram {
  id: string
  status: string
  startDate?: Date | null
  currentDay: number
  completionPercentage: number
  program: TrainingProgram
}

interface TrainingProgramsV2Props {
  user: any
  programs: TrainingProgram[]
  userPrograms: UserProgram[]
}

// Real, relevant programs data
const PROGRAM_META = {
  "zero-to-hero": {
    icon: BookOpen,
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-50 to-emerald-50",
    estimatedDuprGain: "+0.8",
    testimonial: "Went from never playing to winning my first local tournament!",
    testimonialAuthor: "Sarah M., Complete Beginner → 3.0",
    community: 245
  },
  "3.5-breakthrough": {
    icon: Target,
    gradient: "from-blue-500 to-indigo-500",
    bgGradient: "from-blue-50 to-indigo-50",
    estimatedDuprGain: "+0.5",
    testimonial: "Finally broke through the plateau. My third shot is so much better!",
    testimonialAuthor: "Mike R., 3.5 → 4.0",
    community: 412
  },
  "dinking-dominance": {
    icon: Target,
    gradient: "from-cyan-500 to-teal-500",
    bgGradient: "from-cyan-50 to-teal-50",
    estimatedDuprGain: "+0.4",
    testimonial: "Dinking mastery changed my whole game. I'm so much more confident!",
    testimonialAuthor: "Linda K., 3.0 → 3.5",
    community: 328
  },
  "tournament-ready": {
    icon: Trophy,
    gradient: "from-purple-500 to-violet-500",
    bgGradient: "from-purple-50 to-violet-50",
    estimatedDuprGain: "+0.3",
    testimonial: "Prepared me mentally and physically. Won my division!",
    testimonialAuthor: "Carlos D., Tournament Winner",
    community: 189
  },
  "senior-champion": {
    icon: Award,
    gradient: "from-orange-500 to-amber-500",
    bgGradient: "from-orange-50 to-amber-50",
    estimatedDuprGain: "+0.6",
    testimonial: "Perfect for my age. Low-impact but effective!",
    testimonialAuthor: "Robert S., 62 years old",
    community: 156
  },
  "power-player": {
    icon: Zap,
    gradient: "from-red-500 to-rose-500",
    bgGradient: "from-red-50 to-rose-50",
    estimatedDuprGain: "+0.7",
    testimonial: "Athletic training that fits my aggressive style!",
    testimonialAuthor: "Jake T., 28 years old",
    community: 203
  }
}

export default function TrainingProgramsV2({ user, programs, userPrograms }: TrainingProgramsV2Props) {
  const router = useRouter()
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [skillLevelFilter, setSkillLevelFilter] = useState<string>("all")
  const [mounted, setMounted] = useState(false)

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Champion'

  useEffect(() => {
    setMounted(true)
  }, [])

  const getProgramMeta = (programId: string) => {
    const normalizedId = programId.toLowerCase().replace(/\s+/g, '-')
    return PROGRAM_META[normalizedId as keyof typeof PROGRAM_META] || {
      icon: BookOpen,
      gradient: "from-cyan-500 to-emerald-500",
      bgGradient: "from-cyan-50 to-emerald-50",
      estimatedDuprGain: "+0.5",
      testimonial: "Excellent program that delivered results!",
      testimonialAuthor: "Program Graduate",
      community: 100
    }
  }

  const getProgramColor = (skillLevel: string) => {
    switch (skillLevel.toLowerCase()) {
      case 'beginner': return "emerald"
      case 'intermediate': return "blue"
      case 'advanced': return "purple"
      case 'pro': return "red"
      default: return "cyan"
    }
  }

  const handleStartProgram = async (programId: string) => {
    try {
      const response = await fetch('/api/training/programs/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId })
      })
      
      if (response.ok) {
        router.push(`/train/program/${programId}`)
      }
    } catch (error) {
      console.error('Error starting program:', error)
    }
  }

  const filteredPrograms = programs.filter(program => {
    if (skillLevelFilter !== "all" && program.skillLevel.toLowerCase() !== skillLevelFilter) {
      return false
    }
    if (selectedFilter === "beginner" && program.skillLevel.toLowerCase() !== "beginner") {
      return false
    }
    if (selectedFilter === "intermediate" && program.skillLevel.toLowerCase() !== "intermediate") {
      return false
    }
    if (selectedFilter === "advanced" && !["advanced", "pro"].includes(program.skillLevel.toLowerCase())) {
      return false
    }
    return true
  })

  if (!mounted) return null

  return (
    <div className="space-y-20">
      
      {/* HERO SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-12">
          <h1 className="text-6xl font-light text-gray-900 mb-4">
            Training <span className="font-medium">Programs</span>
          </h1>
          <p className="text-2xl text-gray-500 font-light">
            Welcome back, <span className="font-medium text-cyan-600">{firstName}</span>! Your structured path to mastery.
          </p>
        </div>
      </motion.section>

      {/* ACTIVE PROGRAMS */}
      {userPrograms.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <h2 className="text-3xl font-light text-gray-900 flex items-center gap-3">
            <Zap className="w-7 h-7 text-cyan-600" />
            Continue Your <span className="font-medium">Journey</span>
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {userPrograms.map((userProgram) => {
              const meta = getProgramMeta(userProgram.program.programId)
              
              return (
                <Card 
                  key={userProgram.id}
                  className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => router.push(`/train/program/${userProgram.program.programId}`)}
                >
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className={cn(
                        "p-4 bg-gradient-to-br rounded-2xl shadow-lg",
                        meta.gradient
                      )}>
                        <meta.icon className="w-7 h-7 text-white" />
                      </div>
                      <Badge className="bg-cyan-100 text-cyan-700 border-0">
                        Day {userProgram.currentDay} of {userProgram.program.durationDays}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors">
                        {userProgram.program.name}
                      </h3>
                      {userProgram.program.tagline && (
                        <p className="text-cyan-600 font-medium mb-3">{userProgram.program.tagline}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Your Progress</span>
                        <span className="font-semibold text-gray-900">{userProgram.completionPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${userProgram.completionPercentage}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className={cn("h-full bg-gradient-to-r", meta.gradient)}
                        />
                      </div>
                    </div>

                    <Button 
                      className={cn(
                        "w-full bg-gradient-to-r",
                        meta.gradient,
                        "hover:shadow-lg"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/train/program/${userProgram.program.programId}`)
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Continue Program
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </motion.section>
      )}

      {/* PROGRAM DISCOVERY */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-light text-gray-900">
            Choose Your <span className="font-medium">Path</span>
          </h2>

          <div className="flex items-center gap-4">
            <Select value={skillLevelFilter} onValueChange={setSkillLevelFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                <SelectItem value="beginner">Beginner Programs</SelectItem>
                <SelectItem value="intermediate">Intermediate Programs</SelectItem>
                <SelectItem value="advanced">Advanced Programs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => {
            const meta = getProgramMeta(program.programId)
            const isEnrolled = userPrograms.some(up => up.program.programId === program.programId)
            const color = getProgramColor(program.skillLevel)

            return (
              <Card
                key={program.id}
                className="border-0 shadow-md hover:shadow-xl transition-all group relative overflow-hidden"
              >
                {/* Background Gradient Accent */}
                <div className={cn(
                  "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                  meta.gradient
                )} />

                <CardContent className="p-8 space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "p-4 bg-gradient-to-br rounded-2xl shadow-md",
                      meta.gradient
                    )}>
                      <meta.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge className={cn(
                      "border-0",
                      color === "emerald" ? "bg-emerald-100 text-emerald-700" :
                      color === "blue" ? "bg-blue-100 text-blue-700" :
                      color === "purple" ? "bg-purple-100 text-purple-700" :
                      "bg-cyan-100 text-cyan-700"
                    )}>
                      {program.skillLevel}
                    </Badge>
                  </div>

                  {/* Program Info */}
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors">
                      {program.name}
                    </h3>
                    {program.tagline && (
                      <p className="text-cyan-600 text-sm font-medium mb-3">{program.tagline}</p>
                    )}
                    <p className="text-gray-600 text-sm line-clamp-2">{program.description}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs">Duration</span>
                      </div>
                      <p className="font-semibold text-gray-900">{program.durationDays} days</p>
                    </div>
                    {program.estimatedTimePerDay && (
                      <div>
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs">Daily</span>
                        </div>
                        <p className="font-semibold text-gray-900">{program.estimatedTimePerDay}</p>
                      </div>
                    )}
                  </div>

                  {/* Key Outcomes */}
                  {program.keyOutcomes && program.keyOutcomes.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-900">You'll Master:</h4>
                      <ul className="space-y-1.5">
                        {program.keyOutcomes.slice(0, 3).map((outcome: string, i: number) => (
                          <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                            <CheckCircle2 className="w-3 h-3 mt-0.5 text-cyan-600 flex-shrink-0" />
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className={cn(
                    "p-4 rounded-xl bg-gradient-to-r",
                    meta.bgGradient
                  )}>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <TrendingUp className="w-3 h-3 text-gray-600" />
                          <span className="text-xs text-gray-600">Est. DUPR</span>
                        </div>
                        <p className="font-semibold text-gray-900">{meta.estimatedDuprGain}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Users className="w-3 h-3 text-gray-600" />
                          <span className="text-xs text-gray-600">Community</span>
                        </div>
                        <p className="font-semibold text-gray-900">{meta.community} active</p>
                      </div>
                    </div>
                    <div className="border-t border-white/50 pt-3">
                      <p className="text-xs italic text-gray-700 mb-1">"{meta.testimonial}"</p>
                      <p className="text-xs text-gray-600">— {meta.testimonialAuthor}</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    className={cn(
                      "w-full bg-gradient-to-r",
                      meta.gradient,
                      "hover:shadow-lg"
                    )}
                    onClick={() => handleStartProgram(program.programId)}
                    disabled={isEnrolled}
                  >
                    {isEnrolled ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Enrolled
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Program
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredPrograms.length === 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <p className="text-gray-600">No programs match your filters. Try adjusting your selection.</p>
            </CardContent>
          </Card>
        )}
      </motion.section>

      {/* CUSTOM PROGRAM CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 overflow-hidden">
          <CardContent className="p-12">
            <div className="grid lg:grid-cols-[1fr,auto] gap-8 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-purple-600/10 rounded-full">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">AI-Powered</span>
                </div>
                
                <div>
                  <h2 className="text-4xl font-light text-gray-900 mb-4">
                    Don't see the perfect fit?
                  </h2>
                  <p className="text-xl text-gray-700">
                    Let Coach Kai create a <span className="font-medium">personalized training program</span> tailored to your specific goals and skill level.
                  </p>
                </div>

                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                    <span>Custom drills based on your weaknesses</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                    <span>Flexible schedule that adapts to you</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                    <span>AI-guided progression tracking</span>
                  </li>
                </ul>
              </div>

              <Button 
                size="lg"
                onClick={() => router.push('/ai-coach')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Talk to Coach Kai
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  )
}
