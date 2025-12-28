"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Dumbbell, Clock, ChevronRight, Loader2, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface DrillRecommendation {
  id: string
  name: string
  tagline: string
  category: string
  difficulty: string
  duration: number
  focusAreas?: string[]
  url: string
}

interface AIDrillRecommendationsProps {
  goalId?: string
  goalCategory?: string
}

export default function AIDrillRecommendations({ goalId, goalCategory }: AIDrillRecommendationsProps) {
  const [drills, setDrills] = useState<DrillRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [browseUrl, setBrowseUrl] = useState('/train/drills')

  useEffect(() => {
    fetchRecommendations()
  }, [goalId, goalCategory])

  const fetchRecommendations = async () => {
    try {
      const params = new URLSearchParams()
      if (goalId) params.set('goalId', goalId)
      if (goalCategory) params.set('category', goalCategory)
      
      const res = await fetch(`/api/coach-kai/recommend-drills?${params}`)
      if (res.ok) {
        const data = await res.json()
        setDrills(data.drills || [])
        if (data.browseUrl) setBrowseUrl(data.browseUrl)
      }
    } catch (error) {
      console.error('Failed to fetch drill recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'advanced': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'pro': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-teal-50/50 to-orange-50/50 dark:from-teal-900/20 dark:to-orange-900/20">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
        </CardContent>
      </Card>
    )
  }

  if (drills.length === 0) {
    return null
  }

  return (
    <Card className="bg-gradient-to-br from-teal-50/50 to-orange-50/50 dark:from-teal-900/20 dark:to-orange-900/20 border-teal-200/50 dark:border-teal-800/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-teal-500" />
          AI-Recommended Drills
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Coach Kai suggests these drills to help you reach your goal
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {drills.slice(0, 3).map((drill, index) => (
          <motion.div
            key={drill.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={drill.url || `/train/drills?drill=${drill.id}`}>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Dumbbell className="w-4 h-4 text-teal-500" />
                      <span className="font-medium text-gray-900 dark:text-white group-hover:text-teal-600 transition-colors">
                        {drill.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                      {drill.tagline}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className={getDifficultyColor(drill.difficulty)}>
                        {drill.difficulty}
                      </Badge>
                      <span className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {drill.duration} min
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-500 transition-colors" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}

        <Link href={browseUrl}>
          <Button variant="outline" className="w-full mt-2 group">
            Browse All Recommended Drills
            <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
