
"use client"

/**
 * AI Insights Panel Component
 * 
 * Provides intelligent, personalized insights and recommendations
 * powered by Coach Kai for the premium training experience
 */

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  Sparkles,
  Zap,
  Award,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface AIInsight {
  id: string
  type: 'recommendation' | 'analysis' | 'tip' | 'achievement'
  title: string
  content: string
  confidence: number
  actionable: boolean
  priority: 'high' | 'medium' | 'low'
  action?: {
    label: string
    path: string
  }
}

interface AIInsightsPanelProps {
  userId?: string
  context: 'dashboard' | 'program' | 'progress'
  userProgress?: any
  className?: string
}

export default function AIInsightsPanel({ 
  userId, 
  context, 
  userProgress,
  className 
}: AIInsightsPanelProps) {
  const router = useRouter()
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null)

  useEffect(() => {
    generateAIInsights()
  }, [userId, context, userProgress])

  const generateAIInsights = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/ai-coach/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          context,
          userProgress,
          requestType: 'training_insights'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setInsights(data.insights || [])
      } else {
        setInsights(generateSampleInsights())
      }
    } catch (error) {
      console.error('Error generating AI insights:', error)
      setInsights(generateSampleInsights())
    } finally {
      setLoading(false)
    }
  }

  const generateSampleInsights = (): AIInsight[] => {
    return [
      {
        id: '1',
        type: 'recommendation',
        title: 'Focus on Third Shot Drops',
        content: 'Based on your recent progress, improving your third shot drop consistency could increase your win rate by 15%. I recommend spending 20 minutes daily on precision placement drills.',
        confidence: 87,
        actionable: true,
        priority: 'high',
        action: {
          label: 'Start Drill',
          path: '/train/drills'
        }
      },
      {
        id: '2', 
        type: 'analysis',
        title: 'Serving Pattern Analysis',
        content: 'Your serve placement shows improvement! You\'ve increased accuracy to the backhand side by 23% this week. Consider adding more spin variation to keep opponents guessing.',
        confidence: 92,
        actionable: true,
        priority: 'medium',
        action: {
          label: 'View Progress',
          path: '/progress'
        }
      },
      {
        id: '3',
        type: 'tip',
        title: 'Video Analysis Recommended',
        content: 'Upload a recent match video to get detailed technique feedback. Coach Kai can identify specific areas for improvement in your form.',
        confidence: 85,
        actionable: true,
        priority: 'high',
        action: {
          label: 'Upload Video',
          path: '/train/video'
        }
      }
    ]
  }

  const handleTakeAction = (insight: AIInsight) => {
    if (insight.action && insight.action.path) {
      toast.success(`Taking you to ${insight.action.label}...`)
      router.push(insight.action.path)
    } else {
      toast.info('Action coming soon!')
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation': return Target
      case 'analysis': return TrendingUp
      case 'tip': return Lightbulb
      case 'achievement': return Award
      default: return Brain
    }
  }

  const getInsightColor = (type: string, priority: string) => {
    if (type === 'achievement') return 'from-amber-500 to-yellow-600'
    if (priority === 'high') return 'from-emerald-500 to-green-600'
    if (priority === 'medium') return 'from-blue-500 to-indigo-600'
    return 'from-gray-500 to-slate-600'
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return { color: 'bg-red-100 text-red-800', label: 'High Priority' }
      case 'medium': return { color: 'bg-blue-100 text-blue-800', label: 'Medium Priority' }
      case 'low': return { color: 'bg-gray-100 text-gray-800', label: 'Low Priority' }
      default: return { color: 'bg-gray-100 text-gray-800', label: 'Info' }
    }
  }

  if (loading) {
    return (
      <Card className={cn("border-2 border-dashed border-gray-200", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-blue-500 animate-pulse" />
              <span className="text-gray-600">Coach Kai is analyzing your progress...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">AI Insights</h3>
          <p className="text-sm text-gray-600">Personalized recommendations from Coach Kai</p>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const IconComponent = getInsightIcon(insight.type)
          const colorClasses = getInsightColor(insight.type, insight.priority)
          const priorityBadge = getPriorityBadge(insight.priority)
          const isSelected = selectedInsight === insight.id

          return (
            <Card 
              key={insight.id}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:shadow-lg border-l-4",
                isSelected ? "ring-2 ring-blue-500 shadow-lg" : "",
                insight.type === 'achievement' ? "border-l-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50" :
                insight.priority === 'high' ? "border-l-emerald-500" :
                insight.priority === 'medium' ? "border-l-blue-500" : "border-l-gray-400"
              )}
              onClick={() => setSelectedInsight(isSelected ? null : insight.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={cn(
                      "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                      colorClasses
                    )}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {insight.title}
                        </h4>
                        <Badge className={cn("text-xs", priorityBadge.color)}>
                          {priorityBadge.label}
                        </Badge>
                      </div>
                      
                      <p className={cn(
                        "text-sm text-gray-600 leading-relaxed",
                        isSelected ? "" : "line-clamp-2"
                      )}>
                        {insight.content}
                      </p>
                      
                      {insight.confidence && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">Confidence:</span>
                          <div className="flex items-center gap-1">
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={cn("h-full rounded-full bg-gradient-to-r", colorClasses)}
                                style={{ width: `${insight.confidence}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-700">
                              {insight.confidence}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {insight.actionable && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTakeAction(insight)
                        }}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        {insight.action?.label || 'Take Action'}
                      </Button>
                    )}
                    
                    <ArrowRight className={cn(
                      "w-4 h-4 text-gray-400 transition-transform duration-200",
                      isSelected ? "rotate-90" : ""
                    )} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Generate More Insights */}
      <Button
        variant="outline"
        className="w-full mt-4 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
        onClick={generateAIInsights}
        disabled={loading}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Get More AI Insights
      </Button>
    </div>
  )
}
