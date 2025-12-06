
"use client"

/**
 * Coaching Journey Viewer
 * 
 * Transforms simple video watching into a comprehensive coaching experience
 * Features:
 * - Multi-stage progression (Learn → Practice → Assess → Challenge → Reflect)
 * - Visual journey map with milestones
 * - Skill progression tracking
 * - Meaningful achievements and rewards
 * - Intelligent recommendations
 */

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import {
  BookOpen,
  Target,
  CheckCircle2,
  Trophy,
  Brain,
  Play,
  Lock,
  Star,
  Award,
  TrendingUp,
  Flame,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Clock,
  Calendar,
  MapPin,
  Zap,
  Heart,
  Shield,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import SeamlessVideoPlayer from "./seamless-video-player"
import CoachingJourneyService from "@/lib/services/coaching-journey-service"
import { CoachingJourney, TrainingStage, JourneyMilestone, PracticeChallenge, SkillAssessment, ReflectionPrompt } from "@/lib/types/training-stages"
import ImmersiveProgramPreview from "./immersive-program-preview"

interface CoachingJourneyViewerProps {
  user: any
  program: any
  userProgram: any
  programVideos: any[]
}

export default function CoachingJourneyViewer({
  user,
  program,
  userProgram,
  programVideos
}: CoachingJourneyViewerProps) {
  const router = useRouter()
  const [journey, setJourney] = useState<CoachingJourney | null>(null)
  const [selectedStage, setSelectedStage] = useState<TrainingStage | null>(null)
  const [activeVideoIndex, setActiveVideoIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [practiceLog, setPracticeLog] = useState('')
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({})
  const [reflectionResponse, setReflectionResponse] = useState('')
  const [challengeAttempts, setChallengeAttempts] = useState(0)
  const [isEnrolling, setIsEnrolling] = useState(false)
  
  const isEnrolled = !!userProgram

  useEffect(() => {
    // Generate comprehensive coaching journey
    const generatedJourney = CoachingJourneyService.transformProgramToJourney(
      program,
      userProgram,
      programVideos
    )
    setJourney(generatedJourney)
    setSelectedStage(generatedJourney.stages[0])
    setIsLoading(false)
  }, [program, userProgram, programVideos])

  const getStageIcon = (type: string) => {
    const icons = {
      LEARN: BookOpen,
      PRACTICE: Target,
      ASSESS: CheckCircle2,
      CHALLENGE: Trophy,
      REFLECT: Brain
    }
    return icons[type as keyof typeof icons] || BookOpen
  }

  const getStageColor = (type: string, isCompleted: boolean, isUnlocked: boolean) => {
    if (isCompleted) return "from-champion-green to-emerald-600"
    if (!isUnlocked) return "from-gray-400 to-gray-500"
    
    const colors = {
      LEARN: "from-champion-blue to-cyan-600",
      PRACTICE: "from-champion-gold to-amber-600", 
      ASSESS: "from-purple-600 to-violet-600",
      CHALLENGE: "from-red-500 to-pink-600",
      REFLECT: "from-indigo-500 to-blue-600"
    }
    return colors[type as keyof typeof colors] || "from-champion-blue to-cyan-600"
  }

  const handleEnroll = async () => {
    setIsEnrolling(true)
    try {
      const response = await fetch('/api/training/programs/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId: program.id })
      })

      if (!response.ok) throw new Error('Failed to enroll')

      toast.success('🎉 Program started! Let\'s begin your journey!')
      router.refresh()
    } catch (error) {
      toast.error('Failed to start program')
    } finally {
      setIsEnrolling(false)
    }
  }

  const handleStageSelect = (stage: TrainingStage) => {
    if (!stage.isUnlocked) {
      toast.error('Complete previous stages first to unlock this one')
      return
    }
    setSelectedStage(stage)
    setActiveVideoIndex(0)
  }

  const handleCompleteStage = async (stageId: string) => {
    try {
      const response = await fetch('/api/training/stages/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          stageId,
          programId: program.id,
          userId: user.id,
          completionData: {
            practiceLog,
            assessmentAnswers,
            reflectionResponse,
            challengeAttempts
          }
        })
      })

      if (!response.ok) throw new Error('Failed to complete stage')

      toast.success('🎉 Stage completed! Amazing progress!')
      
      // Update journey state to unlock next stage and mark current as complete
      if (journey) {
        const updatedStages = journey.stages.map((stage, index) => {
          if (stage.id === stageId) {
            return { ...stage, isCompleted: true }
          }
          // Unlock next stage
          const currentIndex = journey.stages.findIndex(s => s.id === stageId)
          if (index === currentIndex + 1) {
            return { ...stage, isUnlocked: true }
          }
          return stage
        })
        
        setJourney({ ...journey, stages: updatedStages })
        
        // Move to next stage if available
        const currentIndex = journey.stages.findIndex(s => s.id === stageId)
        if (currentIndex < journey.stages.length - 1) {
          setSelectedStage(updatedStages[currentIndex + 1])
        }
      }

      // Clear form states
      setPracticeLog('')
      setAssessmentAnswers({})
      setReflectionResponse('')
      setChallengeAttempts(0)

    } catch (error) {
      toast.error('Failed to complete stage')
    }
  }

  const renderStageContent = () => {
    if (!selectedStage) return null

    const StageIcon = getStageIcon(selectedStage.type)
    const stageColor = getStageColor(selectedStage.type, selectedStage.isCompleted, selectedStage.isUnlocked)

    switch (selectedStage.type) {
      case 'LEARN':
        return (
          <div className="space-y-6">
            <div className={cn("p-6 rounded-xl bg-gradient-to-r text-white", stageColor)}>
              <div className="flex items-center gap-3 mb-3">
                <StageIcon className="w-8 h-8" />
                <h3 className="text-2xl font-bold">{selectedStage.name}</h3>
              </div>
              <p className="text-white/90 mb-4">{selectedStage.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{selectedStage.estimatedDuration} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  <span>{selectedStage.requirements.filter(r => r.type === 'VIDEO_WATCH').length} videos</span>
                </div>
              </div>
            </div>

            {/* Video Content */}
            <div className="grid gap-6">
              {selectedStage.requirements.filter(r => r.type === 'VIDEO_WATCH').map((req, index) => {
                const video = programVideos.find(v => v.id === req.target)
                if (!video) return null

                return (
                  <Card key={req.target} className="overflow-hidden">
                    <CardContent className="p-0">
                      <SeamlessVideoPlayer
                        videoId={video.id}
                        userId={user.id}
                        videoUrl={video.youtubeUrl}
                        title={video.title}
                        duration={video.duration || 600}
                        onNext={index < selectedStage.requirements.length - 1 ? () => setActiveVideoIndex(index + 1) : undefined}
                        onPrevious={index > 0 ? () => setActiveVideoIndex(index - 1) : undefined}
                        hasNext={index < selectedStage.requirements.length - 1}
                        hasPrevious={index > 0}
                      />
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Complete Stage Button */}
            <Button
              size="lg"
              className={cn("w-full text-white", stageColor)}
              onClick={() => handleCompleteStage(selectedStage.id)}
              disabled={selectedStage.isCompleted}
            >
              {selectedStage.isCompleted ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Stage Completed
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Complete Learning Stage
                </>
              )}
            </Button>
          </div>
        )

      case 'PRACTICE':
        return (
          <div className="space-y-6">
            <div className={cn("p-6 rounded-xl bg-gradient-to-r text-white", stageColor)}>
              <div className="flex items-center gap-3 mb-3">
                <StageIcon className="w-8 h-8" />
                <h3 className="text-2xl font-bold">{selectedStage.name}</h3>
              </div>
              <p className="text-white/90 mb-4">{selectedStage.description}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Practice Session Log
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="p-4 text-center bg-orange-50">
                    <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                    <div className="text-2xl font-bold">20</div>
                    <div className="text-sm text-gray-600">min recommended</div>
                  </Card>
                  <Card className="p-4 text-center bg-blue-50">
                    <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">Focus</div>
                    <div className="text-sm text-gray-600">Quality over quantity</div>
                  </Card>
                  <Card className="p-4 text-center bg-green-50">
                    <Heart className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">Track</div>
                    <div className="text-sm text-gray-600">Your progress</div>
                  </Card>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">Practice Session Notes</Label>
                  <Textarea
                    placeholder="Describe your practice session: What did you work on? How did it feel? What challenges did you face? Any breakthroughs or insights?"
                    value={practiceLog}
                    onChange={(e) => setPracticeLog(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-sm text-gray-500">
                    💡 Tip: Be specific about what you practiced and how it went. This helps track your improvement over time.
                  </p>
                </div>

                <Button
                  size="lg"
                  className={cn("w-full text-white", stageColor)}
                  onClick={() => handleCompleteStage(selectedStage.id)}
                  disabled={selectedStage.isCompleted || !practiceLog.trim()}
                >
                  {selectedStage.isCompleted ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Practice Session Logged
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Complete Practice Stage
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case 'ASSESS':
        const assessment = CoachingJourneyService.generateSkillAssessment(selectedStage.id, program)
        
        return (
          <div className="space-y-6">
            <div className={cn("p-6 rounded-xl bg-gradient-to-r text-white", stageColor)}>
              <div className="flex items-center gap-3 mb-3">
                <StageIcon className="w-8 h-8" />
                <h3 className="text-2xl font-bold">{selectedStage.name}</h3>
              </div>
              <p className="text-white/90 mb-4">{selectedStage.description}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  {assessment.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {assessment.questions.map((question, index) => (
                  <div key={question.id} className="space-y-3">
                    <Label className="text-base font-medium">
                      {index + 1}. {question.question}
                    </Label>
                    {question.type === 'MULTIPLE_CHOICE' && (
                      <RadioGroup
                        value={assessmentAnswers[question.id] || ''}
                        onValueChange={(value) => 
                          setAssessmentAnswers(prev => ({ ...prev, [question.id]: value }))
                        }
                      >
                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`q${question.id}_${optionIndex}`} />
                            <Label htmlFor={`q${question.id}_${optionIndex}`}>{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    {question.type === 'SELF_RATING' && (
                      <RadioGroup
                        value={assessmentAnswers[question.id] || ''}
                        onValueChange={(value) => 
                          setAssessmentAnswers(prev => ({ ...prev, [question.id]: value }))
                        }
                        className="flex flex-wrap gap-4"
                      >
                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`rating_${question.id}_${optionIndex}`} />
                            <Label htmlFor={`rating_${question.id}_${optionIndex}`}>{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </div>
                ))}

                <Button
                  size="lg"
                  className={cn("w-full text-white", stageColor)}
                  onClick={() => handleCompleteStage(selectedStage.id)}
                  disabled={selectedStage.isCompleted || Object.keys(assessmentAnswers).length < assessment.questions.length}
                >
                  {selectedStage.isCompleted ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Assessment Completed
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Submit Assessment
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case 'CHALLENGE':
        const challenge = CoachingJourneyService.generatePracticeChallenge(selectedStage.id, program)
        
        return (
          <div className="space-y-6">
            <div className={cn("p-6 rounded-xl bg-gradient-to-r text-white", stageColor)}>
              <div className="flex items-center gap-3 mb-3">
                <StageIcon className="w-8 h-8" />
                <h3 className="text-2xl font-bold">{selectedStage.name}</h3>
              </div>
              <p className="text-white/90 mb-4">{selectedStage.description}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  {challenge.name}
                  <Badge className="bg-red-100 text-red-700">{challenge.difficulty}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600">{challenge.description}</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Requirements:</h4>
                    <ul className="space-y-2">
                      {challenge.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Success Criteria:</h4>
                    <ul className="space-y-2">
                      {challenge.successCriteria.map((criteria, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Star className="w-4 h-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                          <span className="text-sm">{criteria}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">Challenge Tips:</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Take your time and focus on quality over speed. You have {challenge.estimatedAttempts} attempts to complete this challenge successfully.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-gray-900">{challengeAttempts}/{challenge.estimatedAttempts}</div>
                  <div className="text-sm text-gray-500">Attempts used</div>
                </div>

                <Button
                  size="lg"
                  className={cn("w-full text-white", stageColor)}
                  onClick={() => {
                    if (challengeAttempts < challenge.estimatedAttempts) {
                      setChallengeAttempts(prev => prev + 1)
                      if (challengeAttempts + 1 >= challenge.estimatedAttempts) {
                        handleCompleteStage(selectedStage.id)
                      } else {
                        toast.success('Attempt logged! Keep pushing your limits!')
                      }
                    }
                  }}
                  disabled={selectedStage.isCompleted || challengeAttempts >= challenge.estimatedAttempts}
                >
                  {selectedStage.isCompleted ? (
                    <>
                      <Trophy className="w-5 h-5 mr-2" />
                      Challenge Completed!
                    </>
                  ) : challengeAttempts >= challenge.estimatedAttempts ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Complete Challenge Stage
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Log Attempt {challengeAttempts + 1}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case 'REFLECT':
        const reflection = CoachingJourneyService.generateReflectionPrompt(selectedStage.id, program)
        
        return (
          <div className="space-y-6">
            <div className={cn("p-6 rounded-xl bg-gradient-to-r text-white", stageColor)}>
              <div className="flex items-center gap-3 mb-3">
                <StageIcon className="w-8 h-8" />
                <h3 className="text-2xl font-bold">{selectedStage.name}</h3>
              </div>
              <p className="text-white/90 mb-4">{selectedStage.description}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Reflection & Goal Setting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-indigo-800">Reflection Prompt:</h4>
                      <p className="text-indigo-700 mt-1">{reflection.prompt}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">Your Response:</Label>
                  <Textarea
                    placeholder="Take your time to reflect thoughtfully on your journey so far..."
                    value={reflectionResponse}
                    onChange={(e) => setReflectionResponse(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                  <p className="text-sm text-gray-500">
                    💭 Reflection helps consolidate your learning and identify areas for future growth.
                  </p>
                </div>

                <Button
                  size="lg"
                  className={cn("w-full text-white", stageColor)}
                  onClick={() => handleCompleteStage(selectedStage.id)}
                  disabled={selectedStage.isCompleted || !reflectionResponse.trim()}
                >
                  {selectedStage.isCompleted ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Reflection Submitted
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Submit Reflection
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return <div>Stage type not recognized</div>
    }
  }

  if (isLoading || !journey) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-champion-green mx-auto mb-4" />
          <h3 className="text-xl font-semibold">Loading Your Coaching Journey...</h3>
        </Card>
      </div>
    )
  }

  // Show immersive preview if not enrolled
  if (!isEnrolled) {
    return (
      <ImmersiveProgramPreview
        user={user}
        program={program}
        programVideos={programVideos}
        onEnroll={handleEnroll}
        isEnrolling={isEnrolling}
      />
    )
  }

  // Show coaching journey if enrolled
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push('/train')}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Training
        </Button>

        <Card className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-champion-green via-champion-blue to-champion-gold" />
          
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div>
                  <CardTitle className="text-3xl mb-2 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-champion-green to-emerald-600 flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    {program.name} - Coaching Journey
                  </CardTitle>
                  <p className="text-muted-foreground text-lg">{program.description}</p>
                </div>
                
                {/* Journey Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Journey Progress</span>
                    <span className="font-semibold">{journey.overallProgress}%</span>
                  </div>
                  <Progress value={journey.overallProgress} className="h-3" />
                  <div className="text-sm text-muted-foreground">
                    Stage {journey.currentStage} of {journey.totalStages} • 
                    Next: {journey.nextRecommendation}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Journey Map Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Journey Map
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[70vh] overflow-y-auto">
              {journey.stages.map((stage, index) => {
                const StageIcon = getStageIcon(stage.type)
                const isSelected = selectedStage?.id === stage.id
                const stageColor = getStageColor(stage.type, stage.isCompleted, stage.isUnlocked)

                return (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "w-full justify-start p-3 h-auto",
                        stage.isCompleted && "border-champion-green/50 bg-green-50",
                        !stage.isUnlocked && "opacity-50",
                        isSelected && "bg-gradient-to-r from-champion-green to-emerald-600 text-white"
                      )}
                      onClick={() => handleStageSelect(stage)}
                      disabled={!stage.isUnlocked}
                    >
                      <div className="flex items-center gap-3 w-full">
                        {stage.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-champion-green" />
                        ) : stage.isUnlocked ? (
                          <StageIcon className={cn("w-5 h-5", isSelected ? "text-white" : "text-champion-blue")} />
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}
                        <div className="text-left flex-1">
                          <div className="font-semibold text-sm">{stage.name}</div>
                          <div className={cn("text-xs", isSelected ? "text-white/80" : "text-muted-foreground")}>
                            {stage.type} • {stage.estimatedDuration}min
                          </div>
                        </div>
                        {stage.isCompleted && (
                          <Badge className="bg-champion-green text-white text-xs">Complete</Badge>
                        )}
                      </div>
                    </Button>
                  </motion.div>
                )
              })}
            </CardContent>
          </Card>

          {/* Milestones */}
          {journey.milestones.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="w-4 h-4" />
                  Milestones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {journey.milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg text-sm",
                      milestone.isAchieved ? "bg-champion-green/10" : "bg-gray-50"
                    )}
                  >
                    {milestone.isAchieved ? (
                      <Trophy className="w-4 h-4 text-champion-gold" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-gray-300" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{milestone.name}</div>
                      <div className="text-xs text-muted-foreground">{milestone.points} pts</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedStage?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderStageContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
