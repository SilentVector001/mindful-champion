"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  Upload, Brain, Activity, Sparkles, CheckCircle2, Loader2,
  Video, Eye, Target, Zap, BarChart3, Award
} from "lucide-react"

interface AnalysisStep {
  id: string
  label: string
  description: string
  icon: React.ElementType
  duration: number // estimated ms
}

const ANALYSIS_STEPS: AnalysisStep[] = [
  {
    id: 'upload',
    label: 'Uploading',
    description: 'Securely transferring your video',
    icon: Upload,
    duration: 5000
  },
  {
    id: 'processing',
    label: 'Processing',
    description: 'Preparing video for analysis',
    icon: Video,
    duration: 3000
  },
  {
    id: 'detection',
    label: 'Pose Detection',
    description: 'Identifying player movements',
    icon: Eye,
    duration: 8000
  },
  {
    id: 'technique',
    label: 'Analyzing Technique',
    description: 'Evaluating form and mechanics',
    icon: Target,
    duration: 6000
  },
  {
    id: 'shots',
    label: 'Shot Analysis',
    description: 'Identifying and scoring shots',
    icon: Zap,
    duration: 5000
  },
  {
    id: 'metrics',
    label: 'Generating Metrics',
    description: 'Calculating performance scores',
    icon: BarChart3,
    duration: 3000
  },
  {
    id: 'feedback',
    label: 'Creating Feedback',
    description: 'Generating personalized insights',
    icon: Brain,
    duration: 4000
  },
  {
    id: 'complete',
    label: 'Analysis Complete',
    description: 'Your results are ready!',
    icon: Award,
    duration: 0
  }
]

interface AnalysisProgressIndicatorProps {
  status: 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error'
  uploadProgress?: number
  analysisProgress?: number
  errorMessage?: string
  onComplete?: () => void
}

export default function AnalysisProgressIndicator({
  status,
  uploadProgress = 0,
  analysisProgress = 0,
  errorMessage,
  onComplete
}: AnalysisProgressIndicatorProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [stepProgress, setStepProgress] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Determine current step based on status and progress
  useEffect(() => {
    if (status === 'uploading') {
      setCurrentStepIndex(0)
      setStepProgress(uploadProgress)
    } else if (status === 'analyzing') {
      // Map analysis progress to steps 1-6
      const analysisSteps = 6
      const stepSize = 100 / analysisSteps
      const step = Math.min(Math.floor(analysisProgress / stepSize) + 1, analysisSteps)
      setCurrentStepIndex(step)
      setStepProgress((analysisProgress % stepSize) * (100 / stepSize))
    } else if (status === 'complete') {
      setCurrentStepIndex(ANALYSIS_STEPS.length - 1)
      setStepProgress(100)
      onComplete?.()
    }
  }, [status, uploadProgress, analysisProgress, onComplete])

  // Animated progress simulation for better UX
  useEffect(() => {
    if (status === 'analyzing' && !isAnimating) {
      setIsAnimating(true)
      const interval = setInterval(() => {
        setStepProgress(prev => {
          if (prev >= 95) return prev
          return prev + Math.random() * 3
        })
      }, 200)
      return () => clearInterval(interval)
    }
  }, [status, isAnimating])

  const currentStep = ANALYSIS_STEPS[currentStepIndex] || ANALYSIS_STEPS[0]
  const overallProgress = status === 'uploading' 
    ? uploadProgress * 0.2 
    : status === 'analyzing' 
      ? 20 + (analysisProgress * 0.8)
      : status === 'complete' ? 100 : 0

  if (status === 'idle') return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={status !== 'complete' && status !== 'error' ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              status === 'error' 
                ? "bg-red-500/20" 
                : status === 'complete'
                  ? "bg-emerald-500/20"
                  : "bg-gradient-to-br from-cyan-500/20 to-emerald-500/20"
            )}
          >
            {status === 'error' ? (
              <Activity className="w-6 h-6 text-red-400" />
            ) : status === 'complete' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : (
              <currentStep.icon className="w-6 h-6 text-cyan-400" />
            )}
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {status === 'error' ? 'Analysis Failed' : currentStep.label}
            </h3>
            <p className="text-sm text-slate-400">
              {status === 'error' ? errorMessage : currentStep.description}
            </p>
          </div>
        </div>
        <Badge className={cn(
          "px-3 py-1",
          status === 'error'
            ? "bg-red-500/20 text-red-400 border-red-500/30"
            : status === 'complete'
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
        )}>
          {status === 'error' ? 'Error' : status === 'complete' ? 'Done' : `${Math.round(overallProgress)}%`}
        </Badge>
      </div>

      {/* Overall Progress Bar */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Overall Progress</span>
          <span className="text-cyan-400 font-mono">{Math.round(overallProgress)}%</span>
        </div>
        <div className="relative h-2 rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              status === 'error'
                ? "bg-red-500"
                : "bg-gradient-to-r from-cyan-500 to-emerald-500"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          {status !== 'complete' && status !== 'error' && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          )}
        </div>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
        {ANALYSIS_STEPS.map((step, index) => {
          const StepIcon = step.icon
          const isComplete = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const isPending = index > currentStepIndex

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: isPending ? 0.4 : 1, 
                scale: isCurrent ? 1.1 : 1 
              }}
              className="flex flex-col items-center gap-1"
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                isComplete && "bg-emerald-500/20",
                isCurrent && "bg-cyan-500/20 ring-2 ring-cyan-500/50",
                isPending && "bg-slate-800"
              )}>
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-4 h-4 text-cyan-400" />
                  </motion.div>
                ) : (
                  <StepIcon className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <span className={cn(
                "text-[10px] text-center leading-tight hidden md:block",
                isComplete && "text-emerald-400",
                isCurrent && "text-cyan-400",
                isPending && "text-slate-500"
              )}>
                {step.label.split(' ')[0]}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* AI Processing Animation */}
      {(status === 'analyzing') && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 pt-4 border-t border-slate-700"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full"
                  animate={{
                    height: [4, Math.random() * 16 + 4, 4],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.3,
                    repeat: Infinity,
                    delay: i * 0.05
                  }}
                />
              ))}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-cyan-400 font-medium">AI Neural Network Active</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Processing frames with advanced pose detection</p>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
              <Activity className="w-3 h-3 mr-1" /> LIVE
            </Badge>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
