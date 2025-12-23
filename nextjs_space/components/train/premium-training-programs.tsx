
"use client"

/**
 * Premium Training Programs Component
 * 
 * Sophisticated, eye-popping redesign of the training programs interface
 * with AI-powered features, premium styling, and engaging interactions.
 */

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Play,
  Crown,
  Sparkles,
  TrendingUp,
  Target,
  Calendar,
  Clock,
  Users,
  Award,
  Brain,
  Zap,
  ChevronRight,
  Star,
  Trophy,
  Flame,
  BookOpen
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import premiumDesign, { 
  premiumAnimations, 
  premiumBackgrounds, 
  skillLevelConfigs,
  getSkillConfig 
} from "@/lib/premium-design-system"
import AIInsightsPanel from "@/components/ai/ai-insights-panel"

interface TrainingProgram {
  id: string
  programId: string
  name: string
  tagline?: string | null
  description: string
  durationDays: number
  skillLevel: string
  estimatedTimePerDay?: string | null
  keyOutcomes?: string[]
  isActive: boolean
  enrollmentCount?: number
  rating?: number
  difficulty?: number
}

interface UserProgram {
  id: string
  status: string
  startDate?: Date | null
  currentDay: number
  completionPercentage: number
  program: TrainingProgram
  streakDays?: number
  lastActivityDate?: Date
}

interface PremiumTrainingProgramsProps {
  user: any
  programs: TrainingProgram[]
  userPrograms: UserProgram[]
}

export default function PremiumTrainingPrograms({ 
  user, 
  programs, 
  userPrograms 
}: PremiumTrainingProgramsProps) {
  const router = useRouter()
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string | null>(null)
  const [featuredProgram, setFeaturedProgram] = useState<TrainingProgram | null>(null)
  const [isEnrolling, setIsEnrolling] = useState<string | null>(null)
  const [aiRecommendations, setAIRecommendations] = useState<TrainingProgram[]>([])

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Champion'
  const userLevel = user?.skillLevel?.toLowerCase() || 'beginner'

  useEffect(() => {
    // Set featured program and generate AI recommendations
    if (programs.length > 0) {
      const featured = programs.find(p => p.skillLevel.toLowerCase() === userLevel) || programs[0]
      setFeaturedProgram(featured)
      generateAIRecommendations()
    }
  }, [programs, userLevel])

  const generateAIRecommendations = async () => {
    try {
      const response = await fetch('/api/ai-coach/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          userLevel,
          currentPrograms: userPrograms,
          skillAreas: user?.primaryGoals || []
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAIRecommendations(data.recommendations || programs.slice(0, 3))
      } else {
        setAIRecommendations(programs.slice(0, 3))
      }
    } catch (error) {
      console.error('Error generating AI recommendations:', error)
      setAIRecommendations(programs.slice(0, 3))
    }
  }

  const handleEnrollProgram = async (programId: string) => {
    setIsEnrolling(programId)
    
    try {
      const response = await fetch('/api/training/programs/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId })
      })

      if (response.ok) {
        toast.success('🚀 Program started! Let\'s begin your journey to mastery!')
        router.push(`/train/program/${programId}`)
      } else {
        throw new Error('Failed to start program')
      }
    } catch (error) {
      console.error('Error starting program:', error)
      toast.error('Unable to start program. Please try again.')
    } finally {
      setIsEnrolling(null)
    }
  }

  const filteredPrograms = selectedSkillLevel
    ? programs.filter(p => p.skillLevel.toLowerCase() === selectedSkillLevel)
    : programs

  const activePrograms = userPrograms.filter(up => 
    up.status === 'IN_PROGRESS' || up.status === 'in_progress'
  )

  const getProgressMetrics = (userProgram: UserProgram) => {
    const daysActive = userProgram.lastActivityDate 
      ? Math.floor((Date.now() - new Date(userProgram.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0
    
    return {
      progress: userProgram.completionPercentage || 0,
      streak: userProgram.streakDays || 0,
      daysActive,
      isOnTrack: daysActive <= 1 // Active within last day
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Compact Premium Hero Section */}
      <motion.div 
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="https://cdn.abacus.ai/images/d48a8f9d-90ef-4c84-989b-f0b286faec63.jpg"
            alt="Pickleball training"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950" />
        </div>

        {/* Accent Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-10 md:py-14 lg:py-16">
            {/* Header Row with Stats */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 backdrop-blur-sm">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI-Powered
                  </Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 backdrop-blur-sm">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  Master Your Game
                </h1>
                <p className="text-gray-400 mt-1 text-sm md:text-base">
                  Welcome back, <span className="text-cyan-400 font-medium">{firstName}</span> — Let&apos;s train
                </p>
              </motion.div>

              {/* Inline Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex items-center gap-4 md:gap-6"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/50">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span className="text-xl font-bold text-white">{programs.length}</span>
                  <span className="text-xs text-gray-400">Programs</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/50">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-xl font-bold text-white">{userPrograms.length}</span>
                  <span className="text-xs text-gray-400">Active</span>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/50">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xl font-bold text-white">98%</span>
                  <span className="text-xs text-gray-400">Success</span>
                </div>
              </motion.div>
            </div>

            {/* Compact Skill Level Filters */}
            <motion.div
              className="flex flex-wrap items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <span className="text-sm text-gray-500 mr-2">Filter:</span>
              <Button
                size="sm"
                variant={selectedSkillLevel === null ? "default" : "outline"}
                className={cn(
                  "h-8 text-xs",
                  selectedSkillLevel === null 
                    ? "bg-cyan-500 hover:bg-cyan-600 text-white border-0" 
                    : "bg-slate-800/60 border-slate-700/50 text-gray-300 hover:bg-slate-700/60 hover:text-white"
                )}
                onClick={() => setSelectedSkillLevel(null)}
              >
                All Levels
              </Button>
              {Object.entries(skillLevelConfigs).map(([level, config]) => (
                <Button
                  key={level}
                  size="sm"
                  variant={selectedSkillLevel === level ? "default" : "outline"}
                  className={cn(
                    "h-8 text-xs",
                    selectedSkillLevel === level 
                      ? "bg-cyan-500 hover:bg-cyan-600 text-white border-0" 
                      : "bg-slate-800/60 border-slate-700/50 text-gray-300 hover:bg-slate-700/60 hover:text-white"
                  )}
                  onClick={() => setSelectedSkillLevel(level)}
                >
                  <config.icon className="w-3 h-3 mr-1" />
                  {config.name}
                </Button>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="pt-8 space-y-12">
          
          {/* Active Programs - Premium Cards */}
          {activePrograms.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Your Active Journey</h2>
                  <p className="text-sm text-gray-400">Continue building your championship skills</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activePrograms.map((userProgram, index) => {
                  const skillConfig = getSkillConfig(userProgram.program.skillLevel)
                  const metrics = getProgressMetrics(userProgram)
                  const IconComponent = skillConfig.icon

                  return (
                    <motion.div
                      key={userProgram.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/80 transition-all">
                        <CardContent className="p-6">
                          {/* Program Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                                skillConfig.gradient
                              )}>
                                <IconComponent className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-white mb-1">
                                  {userProgram.program.name}
                                </h3>
                                <Badge className={skillConfig.badge}>
                                  {skillConfig.name}
                                </Badge>
                                {userProgram.program.tagline && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    {userProgram.program.tagline}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {metrics.isOnTrack && (
                              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                On Track
                              </Badge>
                            )}
                          </div>

                          {/* Progress Visualization */}
                          <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-medium text-gray-400">Progress</span>
                              <span className="text-sm font-bold text-white">
                                {Math.round(metrics.progress)}%
                              </span>
                            </div>
                            <Progress value={metrics.progress} className="h-2 mb-3" />
                            
                            <div className="grid grid-cols-3 gap-3 text-center">
                              <div>
                                <div className="text-lg font-bold text-cyan-400">
                                  {userProgram.currentDay}
                                </div>
                                <div className="text-xs text-gray-500">Day</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-orange-400">
                                  {metrics.streak}
                                </div>
                                <div className="text-xs text-gray-500">Streak</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-emerald-400">
                                  {userProgram.program.durationDays}
                                </div>
                                <div className="text-xs text-gray-500">Total</div>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <Button
                            className={cn(
                              "w-full h-10 font-semibold bg-gradient-to-r",
                              skillConfig.gradient,
                              "hover:shadow-lg transition-all duration-300"
                            )}
                            onClick={() => router.push(`/train/program/${userProgram.program.programId || userProgram.program.id}`)}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Continue Day {userProgram.currentDay}
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </motion.section>
          )}

          {/* Explanation Card - What is this page? */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/20 backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">
                      Your Training Hub
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-3">
                      Browse <span className="text-cyan-400 font-medium">{programs.length} structured programs</span> designed by world-class coaches. Click &quot;Start Program&quot; to begin!
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                        <Target className="w-3 h-3 mr-1" />
                        {programs.length} Programs
                      </Badge>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        <Calendar className="w-3 h-3 mr-1" />
                        7-30 Days Each
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Track Progress
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Layout: Programs First, AI Tips on Side */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Side: Training Programs (Takes 3 columns - 75%) */}
            <div className="lg:col-span-3 space-y-10">
              {/* Featured Program */}
              {featuredProgram && (
                <motion.section
                  {...premiumAnimations.cardReveal}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className={premiumDesign.typography.heading.h3}>⭐ Featured Program for You</h2>
                      <p className={premiumDesign.typography.body.small}>Perfect match for your skill level — start here!</p>
                    </div>
                  </div>

                  <FeaturedProgramCard 
                    program={featuredProgram}
                    onEnroll={handleEnrollProgram}
                    isEnrolling={isEnrolling === featuredProgram.programId}
                  />
                </motion.section>
              )}

              {/* All Available Programs Grid */}
              <motion.section
                {...premiumAnimations.cardReveal}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className={premiumDesign.typography.heading.h3}>🎯 Browse All Programs</h2>
                      <p className={premiumDesign.typography.body.small}>
                        {selectedSkillLevel 
                          ? `Showing ${filteredPrograms.length} ${skillLevelConfigs[selectedSkillLevel as keyof typeof skillLevelConfigs]?.name} programs` 
                          : `Showing all ${filteredPrograms.length} programs across all levels`}
                      </p>
                    </div>
                  </div>
                </div>

                {filteredPrograms.length === 0 ? (
                  <Card className="p-12 text-center">
                    <p className="text-gray-500 text-lg">No programs found for this skill level.</p>
                    <Button 
                      onClick={() => setSelectedSkillLevel(null)}
                      className="mt-4"
                      variant="outline"
                    >
                      View All Programs
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence>
                      {filteredPrograms.map((program, index) => (
                        <PremiumProgramCard
                          key={program.id}
                          program={program}
                          index={index}
                          onEnroll={handleEnrollProgram}
                          isEnrolling={isEnrolling === program.programId}
                          isEnrolled={userPrograms.some(up => up.program.programId === program.programId)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.section>
            </div>

            {/* Right Sidebar: Coach Kai's Tips (Takes 1 column - 25%) */}
            <motion.div
              className="lg:col-span-1"
              {...premiumAnimations.cardReveal}
              transition={{ delay: 0.5 }}
            >
              <div className="sticky top-8 space-y-4">
                {/* Header for AI Insights */}
                <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-bold text-sm text-gray-900">Coach Kai's Tips</h3>
                    </div>
                    <p className="text-xs text-gray-600">
                      AI-powered recommendations based on your progress
                    </p>
                  </CardContent>
                </Card>
                
                <AIInsightsPanel
                  userId={user?.id}
                  context="dashboard"
                  userProgress={userPrograms}
                  className=""
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Featured Program Card Component
function FeaturedProgramCard({ 
  program, 
  onEnroll, 
  isEnrolling 
}: { 
  program: TrainingProgram
  onEnroll: (id: string) => void
  isEnrolling: boolean
}) {
  const skillConfig = getSkillConfig(program.skillLevel)
  const IconComponent = skillConfig.icon

  return (
    <motion.div {...premiumAnimations.cardHover}>
      <Card className="relative overflow-hidden bg-gradient-to-br from-white via-amber-50/50 to-yellow-50 border-2 border-amber-200/50 shadow-2xl">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${premiumBackgrounds.equipment})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        <CardContent className="relative p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Program Info */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className={cn(
                  "w-20 h-20 rounded-3xl bg-gradient-to-br flex items-center justify-center shadow-2xl",
                  skillConfig.gradient
                )}>
                  <IconComponent className="w-10 h-10 text-white" />
                </div>
                <div>
                  <Badge className="mb-2 bg-amber-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                  <h3 className="text-3xl font-bold text-gray-900">{program.name}</h3>
                </div>
              </div>
              
              {program.tagline && (
                <p className="text-lg text-amber-700 font-medium mb-3">{program.tagline}</p>
              )}
              
              <p className="text-gray-700 mb-6 leading-relaxed">{program.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">{program.durationDays} days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">{program.estimatedTimePerDay || '30min'}/day</span>
                </div>
              </div>
            </div>

            {/* Key Outcomes */}
            <div>
              {program.keyOutcomes && program.keyOutcomes.length > 0 && (
                <div className="bg-white/80 rounded-2xl p-6 backdrop-blur-sm">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-amber-600" />
                    What You'll Master
                  </h4>
                  <ul className="space-y-3">
                    {program.keyOutcomes.slice(0, 4).map((outcome, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-8">
            <Button
              className={cn(
                "w-full h-14 text-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-600",
                "hover:from-amber-600 hover:to-yellow-700 shadow-xl hover:shadow-2xl",
                "hover:scale-[1.02] transition-all duration-300"
              )}
              onClick={() => onEnroll(program.programId || program.id)}
              disabled={isEnrolling}
            >
              {isEnrolling ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  Starting Your Journey...
                </>
              ) : (
                <>
                  <Crown className="w-6 h-6 mr-3" />
                  Start Featured Program
                  <Sparkles className="w-6 h-6 ml-3" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Premium Program Card Component
function PremiumProgramCard({ 
  program, 
  index, 
  onEnroll, 
  isEnrolling, 
  isEnrolled 
}: {
  program: TrainingProgram
  index: number
  onEnroll: (id: string) => void
  isEnrolling: boolean
  isEnrolled: boolean
}) {
  const skillConfig = getSkillConfig(program.skillLevel)
  const IconComponent = skillConfig.icon

  return (
    <motion.div
      {...premiumAnimations.staggerItem}
      transition={{ delay: index * 0.1 }}
      {...premiumAnimations.cardHover}
    >
      <Card className={cn(
        premiumDesign.components.cards.premium,
        "h-full flex flex-col overflow-hidden group"
      )}>
        {/* Header with Icon and Badge */}
        <div className={cn(
          "h-32 bg-gradient-to-br relative",
          skillConfig.gradient
        )}>
          <div className="absolute inset-0 flex items-center justify-center">
            <IconComponent className="w-20 h-20 text-white/90 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <Badge className="absolute top-4 right-4 bg-white/20 text-white backdrop-blur-sm border-white/30">
            {skillConfig.name}
          </Badge>
          {program.rating && (
            <div className="absolute bottom-4 left-4 flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-white font-medium">{program.rating}</span>
            </div>
          )}
        </div>

        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
              {program.name}
            </h3>
            
            {program.tagline && (
              <p className="text-emerald-600 font-medium text-sm mb-3">
                {program.tagline}
              </p>
            )}
            
            <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
              {program.description}
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Duration</span>
                </div>
                <span className="font-semibold text-gray-900">{program.durationDays} days</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Daily Time</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {program.estimatedTimePerDay || '30min'}
                </span>
              </div>
              
              {program.enrollmentCount && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>Enrolled</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {program.enrollmentCount.toLocaleString()}+
                  </span>
                </div>
              )}
            </div>
          </div>

          <Button
            className={cn(
              "w-full bg-gradient-to-r transition-all duration-300",
              skillConfig.gradient,
              isEnrolled ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"
            )}
            onClick={() => onEnroll(program.programId || program.id)}
            disabled={isEnrolling || isEnrolled}
          >
            {isEnrolled ? (
              <>
                <Trophy className="w-4 h-4 mr-2" />
                Enrolled
              </>
            ) : isEnrolling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Starting...
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
    </motion.div>
  )
}
