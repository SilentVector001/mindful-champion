
'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import PremiumTrainingPrograms from '@/components/train/premium-training-programs'
import MainNavigation from '@/components/navigation/main-navigation'
import { useState, useEffect } from 'react'

interface TrainPageProps {
  user: any
}

export default function TrainPage({ user }: TrainPageProps) {
  const {data: session, status} = useSession() || {}
  const [programs, setPrograms] = useState([])
  const [userEnrollments, setUserEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchTrainingData()
    }
  }, [session])

  const fetchTrainingData = async () => {
    try {
      const response = await fetch('/api/training/programs')
      if (response.ok) {
        const data = await response.json()
        setPrograms(data.programs || [])
        
        // Separate enrolled programs
        const enrolled = data.programs
          ?.filter((p: any) => p.isEnrolled)
          ?.map((p: any) => ({
            id: `user-${p.id}`,
            programId: p.programId,
            status: 'in_progress',
            currentDay: 1,
            progress: p.progress,
            completionPercentage: p.progress,
            startedAt: new Date(),
            program: {
              id: p.id,
              programId: p.programId,  // Added missing programId
              name: p.name,
              description: p.description,
              skillLevel: p.skillLevel,
              totalDays: p.durationDays,
              durationDays: p.durationDays,
              estimatedTimePerDay: p.estimatedTimePerDay,
              category: 'structured'
            }
          })) || []
        
        setUserEnrollments(enrolled)
      }
    } catch (error) {
      console.error('Error fetching training data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen">
      <MainNavigation user={user} />
      
      <main>
        <PremiumTrainingPrograms 
          user={user}
          programs={programs}
          userPrograms={userEnrollments}
        />
      </main>
    </div>
  )
}
