"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Target, Zap, Activity, Brain, TrendingUp, Award
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface KeyMetricsDashboardProps {
  analysisData: any
  className?: string
}

export default function KeyMetricsDashboard({ analysisData, className }: KeyMetricsDashboardProps) {
  // Safety check for analysisData
  if (!analysisData) {
    return null
  }

  // Calculate the 4 key distinctions from analysis data with proper null checks
  const shotQuality = analysisData?.technicalScores?.overall || analysisData?.overallScore || 75
  const techniqueScore = analysisData?.technicalScores?.gripTechnique || 
    (analysisData?.technicalScores ? 
      Math.round((
        (analysisData.technicalScores.paddleAngle || 0) +
        (analysisData.technicalScores.followThrough || 0) +
        (analysisData.technicalScores.bodyRotation || 0) +
        (analysisData.technicalScores.readyPosition || 0)
      ) / 4) : 72)
  
  const movementScore = analysisData?.movementMetrics?.efficiency || 
    (analysisData?.movementMetrics ? 
      Math.round((
        (analysisData.movementMetrics.courtCoverage || 0) +
        (analysisData.movementMetrics.positioning || 0) +
        (analysisData.movementMetrics.footwork || 0)
      ) / 3) : 78)
  
  const decisionMakingScore = analysisData?.technicalScores?.overall || 
    analysisData?.overallScore || 70

  const metrics = [
    {
      id: 'shot-quality',
      title: 'Shot Quality',
      description: 'Overall accuracy and execution',
      score: shotQuality,
      icon: Target,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400'
    },
    {
      id: 'technique',
      title: 'Technique',
      description: 'Form and mechanics quality',
      score: techniqueScore,
      icon: Zap,
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      textColor: 'text-cyan-400'
    },
    {
      id: 'movement',
      title: 'Movement & Positioning',
      description: 'Court coverage and footwork',
      score: movementScore,
      icon: Activity,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400'
    },
    {
      id: 'decision-making',
      title: 'Decision Making',
      description: 'Shot selection and tactics',
      score: decisionMakingScore,
      icon: Brain,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400'
    }
  ]

  const getScoreLabel = (score: number) => {
    if (score >= 85) return { label: 'Excellent', color: 'text-emerald-400' }
    if (score >= 75) return { label: 'Good', color: 'text-cyan-400' }
    if (score >= 65) return { label: 'Fair', color: 'text-amber-400' }
    return { label: 'Needs Work', color: 'text-red-400' }
  }

  return (
    <motion.div
      className={cn("mb-8", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/30">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Performance Analysis
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              4 key distinctions that matter most for your improvement
            </p>
          </div>
        </div>
      </div>

      {/* 4 Key Metrics Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          const scoreLabel = getScoreLabel(metric.score)
          
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <Card className={cn(
                "bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 transition-all duration-300 hover:scale-[1.02]",
                metric.borderColor
              )}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-3 rounded-xl shadow-lg",
                        `bg-gradient-to-br ${metric.color}`
                      )}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{metric.title}</CardTitle>
                        <p className="text-xs text-slate-400 mt-1">{metric.description}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Score Display */}
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-5xl font-bold text-white mb-1">
                        {metric.score}
                        <span className="text-2xl text-slate-500">/100</span>
                      </div>
                      <Badge className={cn(
                        "text-xs font-semibold",
                        metric.bgColor,
                        metric.textColor,
                        "border",
                        metric.borderColor
                      )}>
                        {scoreLabel.label}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                        <TrendingUp className="w-4 h-4" />
                        <span>+5%</span>
                      </div>
                      <p className="text-xs text-slate-500">vs last session</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Progress</span>
                      <span>{metric.score}%</span>
                    </div>
                    <Progress 
                      value={metric.score} 
                      className="h-3 bg-slate-700/50"
                    />
                  </div>
                  
                  {/* Quick Insight */}
                  <div className={cn(
                    "rounded-lg p-3 border",
                    metric.bgColor,
                    metric.borderColor
                  )}>
                    <p className="text-xs text-slate-300">
                      {metric.score >= 85 && "🎯 Outstanding performance! Keep up the excellent work."}
                      {metric.score >= 75 && metric.score < 85 && "✅ Solid performance with room for refinement."}
                      {metric.score >= 65 && metric.score < 75 && "📊 Good foundation, focus on consistency."}
                      {metric.score < 65 && "💪 Key area for improvement - prioritize drills."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Overall Performance Summary */}
      <Card className="mt-6 bg-gradient-to-br from-slate-800/80 via-cyan-900/20 to-slate-800/80 border-cyan-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/50">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Overall Performance</h3>
                <p className="text-sm text-slate-300">
                  Combined analysis across all key metrics
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {Math.round((shotQuality + techniqueScore + movementScore + decisionMakingScore) / 4)}
                <span className="text-xl text-slate-500">/100</span>
              </div>
              <Badge className="mt-2 bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                {getScoreLabel(Math.round((shotQuality + techniqueScore + movementScore + decisionMakingScore) / 4)).label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
