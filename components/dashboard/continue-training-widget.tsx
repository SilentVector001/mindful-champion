'use client'

/**
 * Continue Training Widget
 * 
 * Quick access widget for the dashboard that shows:
 * - Current active training program
 * - Progress visualization
 * - Quick continue button
 * - Streak tracking
 * - Next day preview
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlayCircle, Target, Flame, Calendar, Trophy, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface TrainingEnrollment {
  id: string
  programId: string
  currentDay: number
  completedDays: number
  totalDays: number
  status: string
  streak: number
  lastTrainedAt: Date | null
  program: {
    id: string
    name: string
    description: string
    skillLevel: string
    durationDays: number
  }
}

export default function ContinueTrainingWidget() {
  const router = useRouter()
  const [enrollment, setEnrollment] = useState<TrainingEnrollment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentEnrollment()
  }, [])

  const fetchCurrentEnrollment = async () => {
    try {
      const response = await fetch('/api/training/current-enrollment')
      if (response.ok) {
        const data = await response.json()
        setEnrollment(data.enrollment)
      }
    } catch (error) {
      console.error('Error fetching enrollment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    if (enrollment) {
      router.push(`/train/program/${enrollment.programId}`)
    } else {
      router.push('/train')
    }
  }

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No active enrollment
  if (!enrollment) {
    return (
      <Card className="overflow-hidden border-2 border-dashed border-teal-200 bg-gradient-to-br from-teal-50 via-white to-purple-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                Start Your Training Journey
              </h3>
              <p className="text-sm text-gray-600">
                Choose from 7 expert-designed programs
              </p>
            </div>
            <Button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-teal-600 to-purple-600 hover:from-teal-700 hover:to-purple-700"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Browse Programs
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Active enrollment
  const completionPercentage = Math.round((enrollment.completedDays / enrollment.totalDays) * 100)
  const daysRemaining = enrollment.totalDays - enrollment.completedDays

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* Gradient Header */}
      <div className="h-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-purple-600" />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">Continue Training</CardTitle>
            <p className="text-sm text-gray-600 font-medium">
              {enrollment.program.name}
            </p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-teal-100 text-teal-700">
            <span className="text-xs font-semibold uppercase tracking-wide">
              {enrollment.program.skillLevel}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-6">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold text-teal-600">{completionPercentage}%</span>
          </div>
          
          <div className="relative">
            <Progress value={completionPercentage} className="h-2.5" />
          </div>

          <div className="text-xs text-gray-500 text-center">
            {enrollment.completedDays} of {enrollment.totalDays} days completed
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Current Day */}
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100">
            <Calendar className="w-5 h-5 mx-auto mb-1 text-teal-600" />
            <div className="text-lg font-bold text-teal-900">
              Day {enrollment.currentDay}
            </div>
            <div className="text-xs text-teal-600">Current</div>
          </div>

          {/* Streak */}
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
            <Flame className="w-5 h-5 mx-auto mb-1 text-orange-600" />
            <div className="text-lg font-bold text-orange-900">
              {enrollment.streak || 0}
            </div>
            <div className="text-xs text-orange-600">Day Streak</div>
          </div>

          {/* Days Left */}
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
            <Trophy className="w-5 h-5 mx-auto mb-1 text-purple-600" />
            <div className="text-lg font-bold text-purple-900">
              {daysRemaining}
            </div>
            <div className="text-xs text-purple-600">Days Left</div>
          </div>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          className="w-full bg-gradient-to-r from-teal-600 to-purple-600 hover:from-teal-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          <PlayCircle className="w-5 h-5 mr-2" />
          Continue Day {enrollment.currentDay}
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Button>

        {/* Last Trained */}
        {enrollment.lastTrainedAt && (
          <div className="text-xs text-center text-gray-500">
            Last trained: {new Date(enrollment.lastTrainedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
