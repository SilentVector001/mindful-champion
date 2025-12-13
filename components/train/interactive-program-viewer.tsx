'use client'

/**
 * Interactive Program Viewer Wrapper
 * 
 * Client-side wrapper that provides actual functionality for program interactions:
 * - Enrollment
 * - Day completion
 * - Progress tracking
 * - Video playback
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import PremiumProgramViewer from './premium-program-viewer'
import { 
  celebrateDayComplete, 
  celebrateMilestone, 
  celebrateProgramComplete,
  celebrateStreak,
  showAchievementToast 
} from '@/lib/celebrations'

interface InteractiveProgramViewerProps {
  program: any
  userProgram?: any
  videos: any[]
  user: any
}

export default function InteractiveProgramViewer({
  program,
  userProgram: initialUserProgram,
  videos,
  user
}: InteractiveProgramViewerProps) {
  const router = useRouter()
  const [userProgram, setUserProgram] = useState(initialUserProgram)
  const [isLoading, setIsLoading] = useState(false)

  const handleStartProgram = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/training/programs/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId: program.id })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('🚀 Program started! Let\'s begin your journey to mastery!')
        
        // Update local state
        setUserProgram({
          id: data.userProgramId,
          status: 'IN_PROGRESS',
          startDate: new Date(),
          currentDay: 1,
          completionPercentage: 0,
          completedDays: []
        })
        
        // Refresh the page to show enrolled state
        router.refresh()
      } else {
        throw new Error('Failed to start program')
      }
    } catch (error) {
      console.error('Error starting program:', error)
      toast.error('Unable to start program. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVideoClick = async (videoId: string) => {
    // Open video in YouTube (you can customize this to open in a modal or embedded player)
    const video = videos.find(v => v.videoId === videoId)
    if (video && video.id) {
      // Navigate to video analysis or just open YouTube
      window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')
    }
  }

  const handleMarkDayComplete = async (day: number) => {
    if (!userProgram) {
      toast.error('Please start the program first')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/training/mark-day-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: program.id,
          day,
          userId: user.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Trigger celebration animations
        if (data.isCompleted) {
          // Program completed!
          celebrateProgramComplete()
          showAchievementToast(
            'Program Completed! 🏆',
            'Congratulations on completing your training program!',
            '🏆'
          )
          toast.success('🎉 Program completed! Amazing work!')
        } else {
          // Day completed
          celebrateDayComplete()
          
          // Check for milestones
          const completionPercentage = Math.round((data.userProgram.completedDays.length / program.durationDays) * 100)
          if (completionPercentage === 25 || completionPercentage === 50 || completionPercentage === 75) {
            setTimeout(() => {
              celebrateMilestone()
              showAchievementToast(
                `${completionPercentage}% Milestone! ⭐`,
                `You're ${completionPercentage}% through your training!`,
                '⭐'
              )
            }, 1000)
          }
          
          // Check for streaks
          if (data.streak && data.streak >= 3) {
            setTimeout(() => {
              celebrateStreak(data.streak)
            }, 2000)
          }
          
          toast.success(`✅ Day ${day} completed! Keep up the great work!`)
        }
        
        // Update local state
        setUserProgram(data.userProgram)
        
        // Refresh the page
        router.refresh()
      } else {
        throw new Error('Failed to mark day complete')
      }
    } catch (error) {
      console.error('Error marking day complete:', error)
      toast.error('Unable to update progress. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePauseProgram = async () => {
    if (!userProgram) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/training/program/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: program.id,
          status: 'PAUSED'
        })
      })

      if (response.ok) {
        toast.success('Program paused. Resume anytime!')
        setUserProgram({ ...userProgram, status: 'PAUSED' })
        router.refresh()
      }
    } catch (error) {
      console.error('Error pausing program:', error)
      toast.error('Unable to pause program. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResumeProgram = async () => {
    if (!userProgram) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/training/program/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: program.id,
          status: 'IN_PROGRESS'
        })
      })

      if (response.ok) {
        toast.success('Welcome back! Let\'s continue your journey!')
        setUserProgram({ ...userProgram, status: 'IN_PROGRESS' })
        router.refresh()
      }
    } catch (error) {
      console.error('Error resuming program:', error)
      toast.error('Unable to resume program. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateNotes = async (notes: string) => {
    if (!userProgram) return

    try {
      const response = await fetch('/api/training/program/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: program.id,
          notes
        })
      })

      if (response.ok) {
        setUserProgram({ ...userProgram, notes })
        toast.success('Notes saved!')
      }
    } catch (error) {
      console.error('Error updating notes:', error)
      toast.error('Unable to save notes. Please try again.')
    }
  }

  return (
    <PremiumProgramViewer
      program={program}
      userProgram={userProgram}
      videos={videos}
      user={user}
      onStartProgram={handleStartProgram}
      onVideoClick={handleVideoClick}
      onMarkDayComplete={handleMarkDayComplete}
      onPauseProgram={handlePauseProgram}
      onResumeProgram={handleResumeProgram}
      onUpdateNotes={handleUpdateNotes}
    />
  )
}
