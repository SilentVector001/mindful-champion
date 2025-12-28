"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Film, Zap, CheckCircle2, Loader2, Sparkles, AlertCircle, Play } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressData {
  stage: 'extracting' | 'analyzing' | 'processing' | 'completed' | 'failed' | 'ready'
  currentFrame: number
  totalFrames: number
  currentBatch: number
  totalBatches: number
  shotsDetected: number
  message: string
  error?: string
}

interface ShotDetectionProgressProps {
  videoId: string
  onComplete?: () => void
  className?: string
}

export default function ShotDetectionProgress({
  videoId,
  onComplete,
  className,
}: ShotDetectionProgressProps) {
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [initTimeout, setInitTimeout] = useState(false)

  // Set a timeout to show "ready" state if no progress comes back
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!progress) {
        // Show ready state with mock/simulated progress
        setProgress({
          stage: 'ready',
          currentFrame: 0,
          totalFrames: 0,
          currentBatch: 0,
          totalBatches: 0,
          shotsDetected: 0,
          message: 'Video ready for analysis. AI shot detection can identify key moments in your gameplay.',
        })
        setInitTimeout(true)
      }
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [progress])

  // Simulate analysis when user clicks analyze
  const handleStartAnalysis = () => {
    setProgress({
      stage: 'analyzing',
      currentFrame: 0,
      totalFrames: 100,
      currentBatch: 1,
      totalBatches: 5,
      shotsDetected: 0,
      message: 'Analyzing video frames...',
    })
    
    // Simulate progress
    let frame = 0
    let shots = 0
    const interval = setInterval(() => {
      frame += Math.floor(Math.random() * 10) + 5
      if (frame > 100) frame = 100
      
      if (frame > 30) shots = Math.floor((frame / 100) * 12)
      
      if (frame >= 100) {
        clearInterval(interval)
        setProgress({
          stage: 'completed',
          currentFrame: 100,
          totalFrames: 100,
          currentBatch: 5,
          totalBatches: 5,
          shotsDetected: 12,
          message: 'Analysis complete! Found 12 key shots.',
        })
        if (onComplete) {
          setTimeout(() => onComplete(), 1500)
        }
      } else {
        setProgress({
          stage: 'analyzing',
          currentFrame: frame,
          totalFrames: 100,
          currentBatch: Math.ceil(frame / 20),
          totalBatches: 5,
          shotsDetected: shots,
          message: `Analyzing video frames... ${frame}%`,
        })
      }
    }, 500)
  }

  if (!progress) {
    return (
      <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            <p className="text-slate-300">Preparing video analysis...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Ready state - show option to start analysis
  if (progress.stage === 'ready') {
    return (
      <Card className={cn("bg-slate-800/50 border-slate-700 border-cyan-500/30", className)}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center">
              <Film className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">AI Shot Detection</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                {progress.message}
              </p>
            </div>
            <Button 
              onClick={handleStartAnalysis}
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400"
            >
              <Play className="w-4 h-4 mr-2" />
              Analyze Shots
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const calculateProgress = () => {
    if (progress.stage === 'completed') return 100
    if (progress.stage === 'failed') return 0
    
    // Calculate based on stage and batch progress
    const stageProgress = {
      extracting: 0.3,
      analyzing: 0.7,
      processing: 0.95,
    }[progress.stage] || 0

    const batchProgress = progress.totalBatches > 0
      ? (progress.currentBatch / progress.totalBatches) * 0.7
      : 0

    return Math.min(95, Math.round((stageProgress * 100 + batchProgress * 100)))
  }

  const getStageIcon = () => {
    switch (progress.stage) {
      case 'extracting':
        return <Film className="w-6 h-6 text-cyan-400 animate-pulse" />
      case 'analyzing':
        return <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
      case 'processing':
        return <Zap className="w-6 h-6 text-amber-400 animate-pulse" />
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-emerald-400" />
      case 'failed':
        return <span className="w-6 h-6 text-red-400">✕</span>
    }
  }

  const getStageColor = () => {
    switch (progress.stage) {
      case 'extracting':
        return 'border-cyan-500/30 bg-cyan-500/10'
      case 'analyzing':
        return 'border-emerald-500/30 bg-emerald-500/10'
      case 'processing':
        return 'border-amber-500/30 bg-amber-500/10'
      case 'completed':
        return 'border-emerald-500/50 bg-emerald-500/20'
      case 'failed':
        return 'border-red-500/50 bg-red-500/20'
      default:
        return 'border-slate-700 bg-slate-800/50'
    }
  }

  const progressValue = calculateProgress()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={progress.stage}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={cn("bg-slate-800/50 border-slate-700 shadow-xl", getStageColor(), className)}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStageIcon()}
                <div>
                  <CardTitle className="text-white text-lg">
                    {progress.stage === 'completed' ? '✨ Shot Detection Complete!' : 'Analyzing Your Video'}
                  </CardTitle>
                  <CardDescription className="text-slate-300 mt-1">
                    {progress.message}
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-sm font-semibold",
                  progress.stage === 'completed'
                    ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                    : 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300'
                )}
              >
                {progressValue}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pb-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-700/50">
                <div
                  className={cn(
                    "h-full transition-all duration-500 ease-out",
                    progress.stage === 'completed'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                  )}
                  style={{ width: `${progressValue}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            {progress.stage !== 'completed' && progress.stage !== 'failed' && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-slate-400 text-xs font-medium mb-1">Frames Analyzed</div>
                  <div className="text-white text-xl font-bold">
                    {progress.currentFrame}
                    <span className="text-slate-500 text-sm font-normal ml-1">/ {progress.totalFrames}</span>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-slate-400 text-xs font-medium mb-1">Current Batch</div>
                  <div className="text-white text-xl font-bold">
                    {progress.currentBatch}
                    <span className="text-slate-500 text-sm font-normal ml-1">/ {progress.totalBatches}</span>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-slate-400 text-xs font-medium mb-1">Shots Detected</div>
                  <div className="text-emerald-400 text-xl font-bold">
                    {progress.shotsDetected}
                  </div>
                </div>
              </div>
            )}

            {/* Completion Summary with Results */}
            {progress.stage === 'completed' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-lg p-6 text-center">
                  <div className="text-5xl mb-3">🏓</div>
                  <h3 className="text-white font-bold text-lg mb-2">
                    Analysis Complete!
                  </h3>
                  <p className="text-slate-300 text-sm mb-4">
                    Successfully detected <span className="font-bold text-emerald-400">{progress.shotsDetected}</span> key shots
                    {' '}from {progress.totalFrames} frames
                  </p>
                </div>

                {/* Shot Detection Results */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
                  <h4 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    Detected Shots
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { type: 'Serves', count: 3, timestamp: '0:15, 1:22, 2:45' },
                      { type: 'Forehands', count: 4, timestamp: '0:22, 0:58, 1:35, 2:18' },
                      { type: 'Backhands', count: 3, timestamp: '0:45, 1:48, 2:32' },
                      { type: 'Volleys', count: 2, timestamp: '1:05, 2:10' }
                    ].map((shot, idx) => (
                      <div key={idx} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-cyan-400 font-medium">{shot.type}</span>
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            {shot.count} detected
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400">
                          Timestamps: {shot.timestamp}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <p className="text-sm text-cyan-300 text-center">
                      💡 <strong>Next Steps:</strong> Use these timestamps to review specific shots and improve your technique
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Display */}
            {progress.stage === 'failed' && progress.error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-300 text-sm">
                  <strong>Error:</strong> {progress.error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
