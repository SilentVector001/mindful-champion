
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Hero Section with Premium Background */}
      <motion.div 
        className="relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(45, 80, 22, 0.8)), url(${premiumBackgrounds.hero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        {...premiumAnimations.heroReveal}
      >
        <div className={premiumDesign.spacing.container}>
          <div className={premiumDesign.spacing.hero}>
            <div className="max-w-4xl mx-auto text-center text-white">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <Crown className="w-4 h-4 mr-1" />
                  Premium Training Experience
                </Badge>
              </motion.div>
              
              <motion.h1
                className={cn(premiumDesign.typography.heading.hero, "mb-6")}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Master Your Game with
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-yellow-400 bg-clip-text text-transparent">
                  AI-Powered Training
                </span>
              </motion.h1>
              
              <motion.p
                className={cn(premiumDesign.typography.body.lead, "text-gray-200 mb-8 max-w-3xl mx-auto")}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Welcome back, <span className="text-yellow-400 font-semibold">{firstName}</span>! 
                Experience sophisticated training programs designed by world-class coaches and 
                powered by advanced AI to accelerate your pickleball mastery.
              </motion.p>

              {/* Skill Level Filters */}
              <motion.div
                className="flex flex-wrap justify-center gap-3 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Button
                  variant={selectedSkillLevel === null ? "default" : "outline"}
                  className={cn(
                    "bg-white/20 border-white/30 text-white backdrop-blur-sm hover:bg-white/30",
                    selectedSkillLevel === null && "bg-white text-gray-900 hover:bg-gray-100"
                  )}
                  onClick={() => setSelectedSkillLevel(null)}
                >
                  All Levels
                </Button>
                {Object.entries(skillLevelConfigs).map(([level, config]) => (
                  <Button
                    key={level}
                    variant={selectedSkillLevel === level ? "default" : "outline"}
                    className={cn(
                      "bg-white/20 border-white/30 text-white backdrop-blur-sm hover:bg-white/30",
                      selectedSkillLevel === level && "bg-white text-gray-900 hover:bg-gray-100"
                    )}
                    onClick={() => setSelectedSkillLevel(level)}
                  >
                    <config.icon className="w-4 h-4 mr-2" />
                    {config.name}
                  </Button>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Floating Stats */}
        <motion.div
          className="absolute bottom-8 right-8 hidden lg:block"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{programs.length}</div>
                  <div className="text-xs text-gray-300">Programs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{userPrograms.length}</div>
                  <div className="text-xs text-gray-300">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">98%</div>
                  <div className="text-xs text-gray-300">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className={premiumDesign.spacing.container}>
        <div className="-mt-16 relative z-10 space-y-16">
          
          {/* Active Programs - Premium Cards */}
          {activePrograms.length > 0 && (
            <motion.section
              {...premiumAnimations.cardReveal}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className={premiumDesign.typography.heading.h3}>Your Active Journey</h2>
                  <p className={premiumDesign.typography.body.small}>Continue building your championship skills</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {activePrograms.map((userProgram, index) => {
                  const skillConfig = getSkillConfig(userProgram.program.skillLevel)
                  const metrics = getProgressMetrics(userProgram)
                  const IconComponent = skillConfig.icon

                  return (
                    <motion.div
                      key={userProgram.id}
                      {...premiumAnimations.staggerItem}
                      transition={{ delay: index * 0.1 }}
                      {...premiumAnimations.cardHover}
                    >
                      <Card className={premiumDesign.components.cards.featured}>
                        <CardContent className="p-8">
                          {/* Program Header */}
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-start gap-4">
                              <div className={cn(
                                "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-xl",
                                skillConfig.gradient
                              )}>
                                <IconComponent className="w-8 h-8 text-white" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                  {userProgram.program.name}
                                </h3>
                                <Badge className={skillConfig.badge}>
                                  {skillConfig.name}
                                </Badge>
                                {userProgram.program.tagline && (
                                  <p className="text-sm text-gray-600 mt-2">
                                    {userProgram.program.tagline}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {metrics.isOnTrack && (
                              <Badge className="bg-green-100 text-green-800">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                On Track
                              </Badge>
                            )}
                          </div>

                          {/* Progress Visualization */}
                          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                              <span className="text-lg font-bold text-gray-900">
                                {Math.round(metrics.progress)}%
                              </span>
                            </div>
                            <Progress value={metrics.progress} className="h-3 mb-4" />
                            
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <div className="text-xl font-bold text-blue-600">
                                  {userProgram.currentDay}
                                </div>
                                <div className="text-xs text-gray-500">Current Day</div>
                              </div>
                              <div>
                                <div className="text-xl font-bold text-orange-500">
                                  {metrics.streak}
                                </div>
                                <div className="text-xs text-gray-500">Day Streak</div>
                              </div>
                              <div>
                                <div className="text-xl font-bold text-green-600">
                                  {userProgram.program.durationDays}
                                </div>
                                <div className="text-xs text-gray-500">Total Days</div>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <Button
                            className={cn(
                              "w-full h-12 text-lg font-semibold bg-gradient-to-r",
                              skillConfig.gradient,
                              "hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                            )}
                            onClick={() => router.push(`/train/program/${userProgram.program.programId || userProgram.program.id}`)}
                          >
                            <Play className="w-5 h-5 mr-2" />
                            Continue Day {userProgram.currentDay}
                            <ChevronRight className="w-5 h-5 ml-2" />
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
            {...premiumAnimations.cardReveal}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-2 border-cyan-200/50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      📚 Welcome to Your Training Hub!
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Browse <strong>{programs.length} structured training programs</strong> designed by world-class coaches. Each program includes day-by-day lessons, video tutorials, and progress tracking. Simply <strong>click "Start Program"</strong> on any card below to begin your journey!
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200">
                        <Target className="w-3 h-3 mr-1" />
                        {programs.length} Programs Available
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <Calendar className="w-3 h-3 mr-1" />
                        7-30 Days Each
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Track Your Progress
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
