
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Play,
  Clock,
  Target,
  Users,
  Trophy,
  Calendar,
  Sparkles,
  BookOpen,
  ChevronRight,
  Star,
  Zap,
  Brain,
  Heart
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

interface TrainingProgramsDashboardProps {
  user: any
  programs: TrainingProgram[]
  userPrograms: UserProgram[]
}

export default function TrainingProgramsDashboard({ user, programs, userPrograms }: TrainingProgramsDashboardProps) {
  const router = useRouter()
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [customGoal, setCustomGoal] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedProgram, setGeneratedProgram] = useState<any>(null)

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Champion'

  // Skill taxonomy for custom program creation
  const skillCategories = [
    {
      category: "Serving",
      skills: ["Basic Serve", "Power Serve", "Spin Serve", "Placement", "Consistency"]
    },
    {
      category: "Return of Serve",
      skills: ["Deep Return", "Attacking Return", "Defensive Return", "Positioning"]
    },
    {
      category: "Dinking",
      skills: ["Soft Touch", "Cross-Court Dinks", "Straight Dinks", "Speed-ups", "Reset Shots"]
    },
    {
      category: "Third Shot",
      skills: ["Third Shot Drop", "Third Shot Drive", "Selection", "Timing"]
    },
    {
      category: "Volleys",
      skills: ["Punch Volley", "Block Volley", "Attacking Volley", "Defensive Volley"]
    },
    {
      category: "Strategy & Mental Game",
      skills: ["Court Positioning", "Communication", "Mental Toughness", "Game Planning"]
    }
  ]

  const getProgramIcon = (skillLevel: string) => {
    switch (skillLevel.toLowerCase()) {
      case 'beginner': return BookOpen
      case 'intermediate': return Target
      case 'advanced': return Trophy
      case 'pro': return Star
      default: return BookOpen
    }
  }

  const getProgramColor = (skillLevel: string) => {
    switch (skillLevel.toLowerCase()) {
      case 'beginner': return "from-champion-green to-emerald-600"
      case 'intermediate': return "from-champion-blue to-cyan-600"
      case 'advanced': return "from-champion-gold to-amber-600"
      case 'pro': return "from-purple-600 to-violet-600"
      default: return "from-champion-green to-emerald-600"
    }
  }

  const handleGenerateCustomProgram = async () => {
    if (selectedSkills.length === 0 && !customGoal.trim()) return

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/training/generate-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedSkills,
          customGoal: customGoal.trim(),
          userSkillLevel: user.skillLevel,
          userGoals: user.primaryGoals
        })
      })
      
      const data = await response.json()
      setGeneratedProgram(data.program)
    } catch (error) {
      console.error('Error generating program:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStartProgram = async (programId: string) => {
    try {
      await fetch('/api/training/start-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId })
      })
      
      router.push(`/train/program/${programId}`)
    } catch (error) {
      console.error('Error starting program:', error)
    }
  }

  // Filter programs by user's skill level or one level above
  const recommendedPrograms = programs.filter(program => {
    const userLevel = user.skillLevel?.toLowerCase() || 'beginner'
    const programLevel = program.skillLevel.toLowerCase()
    
    if (userLevel === 'beginner') return ['beginner', 'intermediate'].includes(programLevel)
    if (userLevel === 'intermediate') return ['intermediate', 'advanced'].includes(programLevel)
    if (userLevel === 'advanced') return ['advanced', 'pro'].includes(programLevel)
    return true
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Training Programs
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
          Welcome back, <span className="text-champion-green font-semibold">{firstName}</span>!
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Choose from expertly designed programs or create your own personalized training plan
        </p>
      </motion.div>

      {/* Active Programs */}
      {userPrograms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-champion-green" />
            Your Active Programs
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userPrograms.map((userProgram, index) => {
              const IconComponent = getProgramIcon(userProgram.program.skillLevel)
              const color = getProgramColor(userProgram.program.skillLevel)
              
              return (
                <Card 
                  key={userProgram.id}
                  className="group hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-champion-green/20"
                  onClick={() => router.push(`/train/program/${userProgram.program.programId}`)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                        color
                      )}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <Badge className={cn(
                        "text-white shadow-sm bg-gradient-to-r",
                        color
                      )}>
                        Day {userProgram.currentDay} of {userProgram.program.durationDays}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mb-2 group-hover:text-champion-green transition-colors">
                      {userProgram.program.name}
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {userProgram.program.tagline}
                    </p>
                    <Progress value={userProgram.completionPercentage} className="mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {userProgram.completionPercentage.toFixed(0)}% Complete
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-gradient-to-r from-champion-green to-emerald-600">
                      <Play className="w-4 h-4 mr-2" />
                      Continue Program
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Browse Programs
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Create Custom Program
          </TabsTrigger>
        </TabsList>

        {/* Browse Programs Tab */}
        <TabsContent value="browse" className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-champion-green" />
              Recommended for You
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedPrograms.map((program, index) => {
                const IconComponent = getProgramIcon(program.skillLevel)
                const color = getProgramColor(program.skillLevel)
                const isEnrolled = userPrograms.some(up => up.program.programId === program.programId)
                
                return (
                  <Card 
                    key={program.id}
                    className="group hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-champion-green/20"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                          color
                        )}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <Badge className={cn(
                          "text-white shadow-sm bg-gradient-to-r",
                          color
                        )}>
                          {program.skillLevel}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-2 group-hover:text-champion-green transition-colors">
                        {program.name}
                      </CardTitle>
                      {program.tagline && (
                        <p className="text-champion-green font-medium text-sm mb-3">
                          {program.tagline}
                        </p>
                      )}
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {program.description}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">Duration</span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {program.durationDays} days
                          </span>
                        </div>
                        {program.estimatedTimePerDay && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">Daily Time</span>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {program.estimatedTimePerDay}
                            </span>
                          </div>
                        )}
                      </div>

                      {program.keyOutcomes && program.keyOutcomes.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">You'll Learn:</h4>
                          <ul className="space-y-1">
                            {program.keyOutcomes.slice(0, 3).map((outcome: string, i: number) => (
                              <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-champion-green mt-2 flex-shrink-0" />
                                {outcome}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Button 
                        className="w-full bg-gradient-to-r from-champion-green to-emerald-600 hover:shadow-lg"
                        onClick={() => handleStartProgram(program.programId)}
                        disabled={isEnrolled}
                      >
                        {isEnrolled ? (
                          <>
                            <Trophy className="w-4 h-4 mr-2" />
                            Enrolled
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start Program
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </motion.div>
        </TabsContent>

        {/* Custom Program Tab */}
        <TabsContent value="custom" className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-champion-green" />
              Create Your Custom Program
            </h2>
            
            <div className="max-w-4xl space-y-8">
              {/* Method 1: Select Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-champion-green" />
                    Option 1: Select Skills to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {skillCategories.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="space-y-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {category.category}
                        </h4>
                        <div className="space-y-2">
                          {category.skills.map((skill, skillIndex) => (
                            <label 
                              key={skillIndex}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedSkills.includes(skill)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSkills([...selectedSkills, skill])
                                  } else {
                                    setSelectedSkills(selectedSkills.filter(s => s !== skill))
                                  }
                                }}
                                className="rounded text-champion-green focus:ring-champion-green"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {skill}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Method 2: Custom Goal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-champion-blue" />
                    Option 2: Describe Your Goal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Label htmlFor="custom-goal">
                    What would you like to improve? Be as specific as possible.
                  </Label>
                  <Textarea
                    id="custom-goal"
                    placeholder="Example: I want to improve my third shot drop consistency and placement, especially under pressure during tournaments..."
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    rows={4}
                  />
                </CardContent>
              </Card>

              {/* Generate Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleGenerateCustomProgram}
                  disabled={isGenerating || (selectedSkills.length === 0 && !customGoal.trim())}
                  className="px-8 py-3 bg-gradient-to-r from-champion-green to-emerald-600 hover:shadow-lg text-lg"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                      Generating Your Program...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate My Program
                    </>
                  )}
                </Button>
              </div>

              {/* Generated Program */}
              {generatedProgram && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <Card className="border-2 border-champion-green/20 bg-gradient-to-r from-champion-green/5 to-emerald-50 dark:to-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-champion-green">
                        <Trophy className="w-6 h-6" />
                        Your Custom Program
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <h3 className="text-xl font-bold">{generatedProgram.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{generatedProgram.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Duration:</span>
                          <p className="font-semibold">{generatedProgram.estimatedDays} days</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Selected Videos:</span>
                          <p className="font-semibold">{generatedProgram.videoCount} videos</p>
                        </div>
                      </div>
                      
                      <Button className="w-full bg-gradient-to-r from-champion-green to-emerald-600">
                        <Play className="w-4 h-4 mr-2" />
                        Start This Program
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
