
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { PlayCircle, Clock, Target, CheckCircle2, Calendar, Sparkles, ChevronRight, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Program {
  id: string
  programId: string
  name: string
  tagline: string
  description: string
  durationDays: number
  skillLevel: string
  estimatedTimePerDay: string
  keyOutcomes: string[]
  videosCount?: number
  isEnrolled?: boolean
  progress?: number
}

interface TrainingProgramsProps {
  userSkillLevel: string
  onboardingData?: any
}

export default function TrainingPrograms({ userSkillLevel, onboardingData }: TrainingProgramsProps) {
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [customGoal, setCustomGoal] = useState('')
  const [showCustomGoalInput, setShowCustomGoalInput] = useState(false)
  const [processingCustomGoal, setProcessingCustomGoal] = useState(false)

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/training/programs')
      if (response.ok) {
        const data = await response.json()
        setPrograms(data.programs || [])
      }
    } catch (error) {
      console.error('Error fetching programs:', error)
      toast.error('Failed to load training programs')
    } finally {
      setLoading(false)
    }
  }

  const enrollInProgram = async (programId: string) => {
    try {
      const response = await fetch('/api/training/programs/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId })
      })

      if (response.ok) {
        toast.success('Successfully enrolled in program!')
        router.push(`/train/program/${programId}`)
      } else {
        toast.error('Failed to enroll in program')
      }
    } catch (error) {
      console.error('Error enrolling:', error)
      toast.error('An error occurred')
    }
  }

  const handleCustomGoalSubmit = async () => {
    if (!customGoal.trim()) {
      toast.error('Please enter your training goal')
      return
    }

    setProcessingCustomGoal(true)
    try {
      const response = await fetch('/api/training/programs/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          goal: customGoal,
          skillLevel: userSkillLevel 
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Custom program created!')
        router.push(`/train/programs/custom/${data.programId}`)
      } else {
        toast.error('Failed to create custom program')
      }
    } catch (error) {
      console.error('Error creating custom program:', error)
      toast.error('An error occurred')
    } finally {
      setProcessingCustomGoal(false)
    }
  }

  const getSkillLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'BEGINNER': return 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30'
      case 'INTERMEDIATE': return 'bg-blue-500/20 text-blue-700 border-blue-500/30'
      case 'ADVANCED': return 'bg-purple-500/20 text-purple-700 border-purple-500/30'
      case 'PRO': return 'bg-amber-500/20 text-amber-700 border-amber-500/30'
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Training Programs
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Choose a structured program or tell us what you want to improve - we'll create a custom plan just for you.
        </p>
      </div>

      {/* Custom Goal Input Card */}
      <Card className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="h-6 w-6 text-emerald-600" />
                Create Your Custom Program
              </CardTitle>
              <CardDescription className="text-base">
                Tell us what you want to improve, and we'll curate the perfect video series for you
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showCustomGoalInput ? (
            <Button
              onClick={() => setShowCustomGoalInput(true)}
              size="lg"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md"
            >
              <Target className="mr-2 h-5 w-5" />
              Start Custom Program
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  What do you want to improve?
                </label>
                <Textarea
                  placeholder="Example: I want to improve my dink consistency and learn when to speed up from the kitchen line..."
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  rows={4}
                  className="border-2 border-emerald-200 focus:border-emerald-500"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleCustomGoalSubmit}
                  disabled={processingCustomGoal || !customGoal.trim()}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  {processingCustomGoal ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating Program...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create My Program
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowCustomGoalInput(false)
                    setCustomGoal('')
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>

              <div className="bg-emerald-100 border border-emerald-300 rounded-lg p-4">
                <p className="text-sm text-emerald-800">
                  💡 <strong>Tip:</strong> Be specific! The more detail you provide, the better we can match you with the right training videos.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pre-Defined Programs */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recommended Programs</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <Card
              key={program.id}
              className="hover:shadow-xl transition-all duration-300 border-2 hover:border-emerald-500/50 group"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className={`${getSkillLevelColor(program.skillLevel)} border`}>
                    {program.skillLevel}
                  </Badge>
                  {program.isEnrolled && (
                    <Badge variant="secondary" className="bg-emerald-500 text-white">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Enrolled
                    </Badge>
                  )}
                </div>
                
                <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors">
                  {program.name}
                </CardTitle>
                <CardDescription className="text-sm italic">
                  {program.tagline}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {program.description}
                </p>

                {/* Program Stats */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium">{program.durationDays} days</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium">{program.estimatedTimePerDay}</span>
                  </div>
                </div>

                {/* Key Outcomes */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700 uppercase">What You'll Learn:</p>
                  <ul className="space-y-1">
                    {program.keyOutcomes.slice(0, 3).map((outcome, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Progress Bar (if enrolled) */}
                {program.isEnrolled && program.progress !== undefined && (
                  <div className="space-y-1 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700">Progress</span>
                      <span className="text-emerald-600 font-semibold">{Math.round(program.progress)}%</span>
                    </div>
                    <Progress value={program.progress} className="h-2" />
                  </div>
                )}

                {/* Action Button */}
                <Button
                  onClick={() => program.isEnrolled 
                    ? router.push(`/train/programs/${program.programId}`)
                    : enrollInProgram(program.programId)
                  }
                  className="w-full group-hover:bg-emerald-600 group-hover:text-white transition-all"
                  variant={program.isEnrolled ? "default" : "outline"}
                >
                  {program.isEnrolled ? (
                    <>
                      Continue Program
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Start Program
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {programs.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
            <p className="text-gray-500">No training programs available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
