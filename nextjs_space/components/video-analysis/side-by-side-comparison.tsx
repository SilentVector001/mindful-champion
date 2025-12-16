
"use client"

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Play, Pause, RotateCcw, ArrowLeftRight, TrendingUp, TrendingDown,
  Minus, CheckCircle2, AlertCircle, Download, Volume2, VolumeX, 
  Maximize, Minimize, Settings, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface SideBySideComparisonProps {
  userVideoUrl: string
  userVideoId?: string
  proVideoUrl?: string
  analysisData: any
  className?: string
}

export default function SideBySideComparison({
  userVideoUrl,
  userVideoId,
  proVideoUrl = '/videos/pro-technique-demo.mp4', // Professional pickleball technique demonstration
  analysisData,
  className
}: SideBySideComparisonProps) {
  const userVideoRef = useRef<HTMLVideoElement>(null)
  const proVideoRef = useRef<HTMLVideoElement>(null)
  const userCanvasRef = useRef<HTMLCanvasElement>(null)
  const proCanvasRef = useRef<HTMLCanvasElement>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [splitPosition, setSplitPosition] = useState(50)
  const [syncVideos, setSyncVideos] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [userVolume, setUserVolume] = useState(50)
  const [proVolume, setProVolume] = useState(50)
  const [userMuted, setUserMuted] = useState(false)
  const [proMuted, setProMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [userVideoError, setUserVideoError] = useState<string | null>(null)
  const [proVideoError, setProVideoError] = useState<string | null>(null)
  const [userVideoLoaded, setUserVideoLoaded] = useState(false)
  const [proVideoLoaded, setProVideoLoaded] = useState(false)
  const [signedUserVideoUrl, setSignedUserVideoUrl] = useState<string>(userVideoUrl)
  const [isLoadingSignedUrl, setIsLoadingSignedUrl] = useState(false)
  
  // Fetch signed URL for user video if needed
  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (userVideoId && !userVideoUrl?.startsWith('http')) {
        setIsLoadingSignedUrl(true)
        try {
          const response = await fetch(`/api/video-analysis/${userVideoId}/signed-url`)
          if (response.ok) {
            const data = await response.json()
            if (data.videoUrl) {
              setSignedUserVideoUrl(data.videoUrl)
            } else if (data.warning) {
              setUserVideoError(data.warning)
            }
          } else {
            throw new Error('Failed to fetch signed URL')
          }
        } catch (error) {
          console.error('Error fetching signed URL:', error)
          setUserVideoError('Failed to load video. The video may not be available.')
        } finally {
          setIsLoadingSignedUrl(false)
        }
      } else {
        setSignedUserVideoUrl(userVideoUrl)
      }
    }
    
    fetchSignedUrl()
  }, [userVideoUrl, userVideoId])
  
  const comparisonMetrics = [
    { name: 'Paddle Angle', user: 82, pro: 85, ideal: 85, unit: '°' },
    { name: 'Elbow Extension', user: 105, pro: 110, ideal: 110, unit: '°' },
    { name: 'Weight Transfer', user: 72, pro: 95, ideal: 95, unit: '%' },
    { name: 'Follow Through', user: 88, pro: 92, ideal: 90, unit: '%' },
    { name: 'Body Rotation', user: 65, pro: 75, ideal: 75, unit: '°' },
    { name: 'Timing', user: 78, pro: 90, ideal: 90, unit: '%' }
  ]

  const togglePlay = () => {
    const userVideo = userVideoRef.current
    const proVideo = proVideoRef.current
    if (!userVideo || !proVideo) return

    if (isPlaying) {
      userVideo.pause()
      if (syncVideos) proVideo.pause()
    } else {
      userVideo.play()
      if (syncVideos) proVideo.play()
    }
    setIsPlaying(!isPlaying)
  }

  const restart = () => {
    const userVideo = userVideoRef.current
    const proVideo = proVideoRef.current
    if (!userVideo || !proVideo) return

    userVideo.currentTime = 0
    if (syncVideos) proVideo.currentTime = 0
    setCurrentTime(0)
  }

  const downloadVideo = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
    if (userVideoRef.current) userVideoRef.current.playbackRate = speed
    if (proVideoRef.current && syncVideos) proVideoRef.current.playbackRate = speed
  }

  const handleUserVolumeChange = (value: number[]) => {
    const vol = value[0]
    setUserVolume(vol)
    if (userVideoRef.current) {
      userVideoRef.current.volume = vol / 100
      setUserMuted(vol === 0)
    }
  }

  const handleProVolumeChange = (value: number[]) => {
    const vol = value[0]
    setProVolume(vol)
    if (proVideoRef.current) {
      proVideoRef.current.volume = vol / 100
      setProMuted(vol === 0)
    }
  }

  const toggleUserMute = () => {
    if (userVideoRef.current) {
      userVideoRef.current.muted = !userMuted
      setUserMuted(!userMuted)
    }
  }

  const toggleProMute = () => {
    if (proVideoRef.current) {
      proVideoRef.current.muted = !proMuted
      setProMuted(!proMuted)
    }
  }

  const handleTimeUpdate = () => {
    const userVideo = userVideoRef.current
    if (!userVideo) return
    setCurrentTime(userVideo.currentTime)
    
    if (syncVideos && proVideoRef.current) {
      const timeDiff = Math.abs(userVideo.currentTime - proVideoRef.current.currentTime)
      if (timeDiff > 0.1) {
        proVideoRef.current.currentTime = userVideo.currentTime
      }
    }
  }

  useEffect(() => {
    const userVideo = userVideoRef.current
    const proVideo = proVideoRef.current
    if (!userVideo || !proVideo) return

    const handleUserVideoLoaded = () => {
      setUserVideoLoaded(true)
      setUserVideoError(null)
    }

    const handleProVideoLoaded = () => {
      setProVideoLoaded(true)
      setProVideoError(null)
    }

    const handleUserVideoError = () => {
      setUserVideoError('Failed to load your video. The file may be missing or in an unsupported format.')
      setUserVideoLoaded(false)
    }

    const handleProVideoError = () => {
      setProVideoError('Failed to load pro technique video.')
      setProVideoLoaded(false)
    }

    userVideo.addEventListener('timeupdate', handleTimeUpdate)
    userVideo.addEventListener('loadedmetadata', handleUserVideoLoaded)
    userVideo.addEventListener('canplay', handleUserVideoLoaded)
    userVideo.addEventListener('error', handleUserVideoError)
    
    proVideo.addEventListener('loadedmetadata', handleProVideoLoaded)
    proVideo.addEventListener('canplay', handleProVideoLoaded)
    proVideo.addEventListener('error', handleProVideoError)

    return () => {
      userVideo.removeEventListener('timeupdate', handleTimeUpdate)
      userVideo.removeEventListener('loadedmetadata', handleUserVideoLoaded)
      userVideo.removeEventListener('canplay', handleUserVideoLoaded)
      userVideo.removeEventListener('error', handleUserVideoError)
      
      proVideo.removeEventListener('loadedmetadata', handleProVideoLoaded)
      proVideo.removeEventListener('canplay', handleProVideoLoaded)
      proVideo.removeEventListener('error', handleProVideoError)
    }
  }, [syncVideos])

  const getMetricDiff = (userValue: number, proValue: number) => {
    const diff = userValue - proValue
    const absDiff = Math.abs(diff)
    return { diff, absDiff, isPositive: diff >= 0 }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-champion-blue/30 shadow-2xl shadow-champion-blue/10">
        <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-white flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-champion-blue to-cyan-600">
                <ArrowLeftRight className="w-5 h-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Side-by-Side Comparison
              </span>
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant={syncVideos ? "default" : "outline"}
                onClick={() => setSyncVideos(!syncVideos)}
                className={cn(
                  "transition-all duration-300",
                  syncVideos 
                    ? "bg-gradient-to-r from-champion-blue to-cyan-600 hover:from-champion-blue/90 hover:to-cyan-600/90 shadow-lg shadow-champion-blue/30" 
                    : "border-slate-600 hover:border-champion-blue/50"
                )}
              >
                <Settings className="w-4 h-4 mr-2" />
                {syncVideos ? 'Synced' : 'Independent'}
              </Button>
            </div>
          </div>
        </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        {/* Video Comparison */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* User Video */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <Badge className="bg-gradient-to-r from-champion-blue to-cyan-600 text-white border-0 shadow-lg shadow-champion-blue/30">
                Your Technique
              </Badge>
              <span className="text-sm font-semibold text-cyan-400">Score: 82/100</span>
            </div>
            
            <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-champion-blue/20 border border-champion-blue/30 bg-black group">
              <div className="relative aspect-video">
                {isLoadingSignedUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-10">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-cyan-400 mx-auto mb-3 animate-spin" />
                      <p className="text-slate-300 text-sm">Loading video...</p>
                    </div>
                  </div>
                )}
                {!isLoadingSignedUrl && signedUserVideoUrl && (
                  <video
                    ref={userVideoRef}
                    src={signedUserVideoUrl}
                    className="w-full h-full object-contain"
                    playsInline
                    preload="metadata"
                  />
                )}
                <canvas
                  ref={userCanvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  width={640}
                  height={360}
                />
                
                {/* User Video Error Overlay */}
                {userVideoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                    <div className="text-center p-4">
                      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                      <p className="text-sm text-slate-300 mb-2">Video Unavailable</p>
                      <p className="text-xs text-slate-400">{userVideoError}</p>
                    </div>
                  </div>
                )}
                
                {/* User Video Loading Overlay */}
                {!userVideoLoaded && !userVideoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
                      <p className="text-xs text-slate-300">Loading...</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleUserMute}
                    className="text-white hover:bg-white/20"
                  >
                    {userMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <Slider
                    value={[userVolume]}
                    onValueChange={handleUserVolumeChange}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => downloadVideo(userVideoUrl, 'your-technique.mp4')}
                    className="bg-gradient-to-r from-champion-blue to-cyan-600 hover:from-champion-blue/90 hover:to-cyan-600/90"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Pro Video */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <Badge className="bg-gradient-to-r from-champion-green to-emerald-600 text-white border-0 shadow-lg shadow-champion-green/30">
                Pro Technique
              </Badge>
              <span className="text-sm font-semibold text-emerald-400">Score: 95/100</span>
            </div>
            
            <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-champion-green/20 border border-champion-green/30 bg-black group">
              <div className="relative aspect-video">
                <video
                  ref={proVideoRef}
                  src={proVideoUrl}
                  className="w-full h-full object-contain"
                  playsInline
                  loop
                  preload="metadata"
                />
                <canvas
                  ref={proCanvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  width={640}
                  height={360}
                />
                
                {/* Pro Video Error Overlay */}
                {proVideoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                    <div className="text-center p-4">
                      <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                      <p className="text-sm text-slate-300 mb-2">Pro Video Unavailable</p>
                      <p className="text-xs text-slate-400">{proVideoError}</p>
                    </div>
                  </div>
                )}
                
                {/* Pro Video Loading Overlay */}
                {!proVideoLoaded && !proVideoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-2" />
                      <p className="text-xs text-slate-300">Loading...</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleProMute}
                    className="text-white hover:bg-white/20"
                  >
                    {proMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <Slider
                    value={[proVolume]}
                    onValueChange={handleProVolumeChange}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => downloadVideo(proVideoUrl, 'pro-technique.mp4')}
                    className="bg-gradient-to-r from-champion-green to-emerald-600 hover:from-champion-green/90 hover:to-emerald-600/90"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Enhanced Playback Controls */}
        <motion.div 
          className="rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-900/50 p-4 border border-slate-700/50 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left Controls */}
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={restart}
                className="border-slate-600 hover:border-champion-blue/50 hover:bg-champion-blue/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart
              </Button>
            </div>
            
            {/* Center Play Control */}
            <Button 
              size="lg" 
              onClick={togglePlay} 
              className="bg-gradient-to-r from-champion-blue to-cyan-600 hover:from-champion-blue/90 hover:to-cyan-600/90 shadow-lg shadow-champion-blue/30 px-8"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause Both
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Play Both
                </>
              )}
            </Button>
            
            {/* Right Controls - Speed */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 mr-1">Speed:</span>
              {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                <Button
                  key={speed}
                  size="sm"
                  variant={playbackSpeed === speed ? "default" : "outline"}
                  onClick={() => handleSpeedChange(speed)}
                  className={cn(
                    "min-w-[50px] transition-all",
                    playbackSpeed === speed
                      ? "bg-gradient-to-r from-champion-blue to-cyan-600 shadow-lg shadow-champion-blue/30"
                      : "border-slate-600 hover:border-champion-blue/50"
                  )}
                >
                  {speed}x
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Enhanced Metrics Comparison */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-champion-blue/20 to-cyan-600/20 border border-champion-blue/30">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              Technique Metrics Comparison
            </h4>
            <Badge className="bg-slate-800/50 text-slate-300 border-slate-600">
              {comparisonMetrics.length} Metrics
            </Badge>
          </div>
          
          <div className="grid gap-4">
            {comparisonMetrics.map((metric, index) => {
              const { diff, absDiff, isPositive } = getMetricDiff(metric.user, metric.pro)
              const userProgress = (metric.user / metric.ideal) * 100
              const proProgress = (metric.pro / metric.ideal) * 100
              const matchesIdeal = absDiff <= (metric.ideal * 0.05)
              
              return (
                <motion.div 
                  key={metric.name} 
                  className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-xl p-5 space-y-4 border border-slate-700/50 shadow-lg hover:shadow-xl hover:shadow-champion-blue/10 transition-all duration-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (index * 0.1) }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-white">{metric.name}</span>
                    <div className="flex items-center gap-2">
                      {matchesIdeal ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isPositive ? '+' : ''}{diff}{metric.unit}</span>
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{isPositive ? '+' : ''}{diff}{metric.unit}</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {/* User bar */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-14 font-medium">You</span>
                      <div className="flex-1 relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-champion-blue via-cyan-500 to-cyan-400 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(userProgress, 100)}%` }}
                          transition={{ duration: 1, delay: 0.6 + (index * 0.1) }}
                        />
                      </div>
                      <span className="text-sm text-cyan-400 font-bold w-16 text-right">
                        {metric.user}{metric.unit}
                      </span>
                    </div>
                    
                    {/* Pro bar */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-14 font-medium">Pro</span>
                      <div className="flex-1 relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-champion-green via-emerald-500 to-emerald-400 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(proProgress, 100)}%` }}
                          transition={{ duration: 1, delay: 0.7 + (index * 0.1) }}
                        />
                      </div>
                      <span className="text-sm text-emerald-400 font-bold w-16 text-right">
                        {metric.pro}{metric.unit}
                      </span>
                    </div>
                  </div>
                  
                  {/* Ideal marker */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Minus className="w-3 h-3" />
                      <span className="font-medium">Ideal Target</span>
                    </div>
                    <span className="text-xs text-slate-300 font-bold">{metric.ideal}{metric.unit}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
        
        {/* Enhanced Key Differences */}
        <motion.div 
          className="rounded-xl bg-gradient-to-br from-slate-800/70 to-slate-900/70 p-6 border border-amber-500/30 shadow-xl shadow-amber-500/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="text-lg font-bold text-white">Key Differences to Address</h4>
          </div>
          
          <div className="space-y-4">
            <motion.div 
              className="flex items-start gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="p-1.5 rounded-full bg-emerald-500/20">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1">
                <span className="font-bold text-emerald-400">Weight Transfer</span>
                <p className="text-sm text-slate-300 mt-1">
                  Pro shifts weight earlier in the swing phase. <span className="text-emerald-400 font-semibold">15% faster transition</span> generates more power.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-start gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
            >
              <div className="p-1.5 rounded-full bg-emerald-500/20">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1">
                <span className="font-bold text-emerald-400">Body Rotation</span>
                <p className="text-sm text-slate-300 mt-1">
                  Pro rotates hips <span className="text-emerald-400 font-semibold">10° more</span> for optimal power generation through kinetic chain.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
            >
              <div className="p-1.5 rounded-full bg-amber-500/20">
                <TrendingDown className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1">
                <span className="font-bold text-amber-400">Follow Through</span>
                <p className="text-sm text-slate-300 mt-1">
                  Your paddle stops <span className="text-amber-400 font-semibold">4% earlier</span> than optimal. Extend follow-through for better control and spin.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
    </motion.div>
  )
}
