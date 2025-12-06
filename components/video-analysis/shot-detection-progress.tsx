"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Film, Zap, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressData {
  stage: 'extracting' | 'analyzing' | 'processing' | 'completed' | 'failed'
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
  const [isPolling, setIsPolling] = useState(true)
  const [detectionTriggered, setDetectionTriggered] = useState(false)

  // Auto-trigger shot detection on mount
  useEffect(() => {
    const triggerDetection = async () => {
      if (detectionTriggered) return;
      
      try {
        console.log('[ShotDetection] Auto-triggering detection for video:', videoId);
        setDetectionTriggered(true);
        
        // Get video data first
        const videoResponse = await fetch(`/api/video-analysis/${videoId}`);
        if (!videoResponse.ok) {
          console.error('[ShotDetection] Failed to fetch video data');
          return;
        }
        
        const videoData = await videoResponse.json();
        
        // Trigger shot detection
        const response = await fetch('/api/video-analysis/detect-shots', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoId,
            videoUrl: videoData.videoUrl,
          }),
        });
        
        if (!response.ok) {
          console.error('[ShotDetection] Failed to trigger detection:', await response.text());
        } else {
          console.log('[ShotDetection] Detection triggered successfully');
        }
      } catch (error) {
        console.error('[ShotDetection] Error triggering detection:', error);
      }
    };
    
    // Trigger after a short delay to ensure component is mounted
    const timer = setTimeout(triggerDetection, 1000);
    return () => clearTimeout(timer);
  }, [videoId, detectionTriggered]);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout

    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/video-analysis/progress?videoId=${videoId}`)
        if (!response.ok) return

        const data = await response.json()
        
        if (data?.progress) {
          setProgress(data.progress)

          // Stop polling if completed or failed
          if (data.progress.stage === 'completed' || data.progress.stage === 'failed') {
            setIsPolling(false)
            if (data.progress.stage === 'completed' && onComplete) {
              // Wait a moment before triggering completion to show final state
              setTimeout(() => onComplete(), 1500)
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch progress:', error)
      }
    }

    // Initial fetch
    fetchProgress()

    // Start polling every 2 seconds
    if (isPolling) {
      pollInterval = setInterval(fetchProgress, 2000)
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [videoId, isPolling, onComplete])

  if (!progress) {
    return (
      <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            <p className="text-slate-300">Initializing shot detection...</p>
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

            {/* Completion Summary */}
            {progress.stage === 'completed' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-lg p-6 text-center"
              >
                <div className="text-5xl mb-3">🏓</div>
                <h3 className="text-white font-bold text-lg mb-2">
                  Analysis Complete!
                </h3>
                <p className="text-slate-300 text-sm mb-4">
                  Successfully detected <span className="font-bold text-emerald-400">{progress.shotsDetected}</span> shots
                  {' '}from {progress.totalFrames} frames
                </p>
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
