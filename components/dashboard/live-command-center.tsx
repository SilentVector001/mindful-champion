
"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Play,
  Square,
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Users,
  Eye,
  Plus,
  Minus,
  RotateCcw,
  Trophy,
  Timer,
  Target,
  Zap,
  Upload,
  Save
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface LiveCommandCenterProps {
  user: any
}

export default function LiveCommandCenter({ user }: LiveCommandCenterProps) {
  const [playerScore, setPlayerScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [gameTime, setGameTime] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [viewers, setViewers] = useState(0)
  const [cameraOn, setCameraOn] = useState(false)
  const [micOn, setMicOn] = useState(false)
  const [currentOpponent, setCurrentOpponent] = useState("Alex Rivera")
  const videoRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()

  const handleScoreChange = (player: 'player' | 'opponent', change: number) => {
    if (player === 'player') {
      setPlayerScore(Math.max(0, playerScore + change))
    } else {
      setOpponentScore(Math.max(0, opponentScore + change))
    }
  }

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      setIsRecording(true)
      setCameraOn(true)
      setMicOn(true)
      
      toast({
        title: "Recording Started! 🎥",
        description: "Your match is being recorded. Focus on your game!",
      })
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to record matches.",
        variant: "destructive",
      })
    }
  }

  const handleStopRecording = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    
    setIsRecording(false)
    setCameraOn(false)
    setMicOn(false)
    
    toast({
      title: "Recording Saved! 📹",
      description: "Your match recording has been saved to your clip library.",
    })
  }

  const handleStartStream = async () => {
    if (!isRecording) {
      await handleStartRecording()
    }
    
    setIsStreaming(true)
    setViewers(Math.floor(Math.random() * 20) + 5) // Simulate viewers
    
    toast({
      title: "Live Stream Started! 📡",
      description: "You're now broadcasting live to the community!",
    })
  }

  const handleStopStream = () => {
    setIsStreaming(false)
    setViewers(0)
    
    toast({
      title: "Stream Ended",
      description: "Thanks for sharing your match with the community!",
    })
  }

  const handleToggleCamera = () => {
    setCameraOn(!cameraOn)
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !cameraOn
      }
    }
  }

  const handleToggleMic = () => {
    setMicOn(!micOn)
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !micOn
      }
    }
  }

  const resetScores = () => {
    setPlayerScore(0)
    setOpponentScore(0)
    setGameTime(0)
    
    toast({
      title: "Scores Reset",
      description: "Ready for a new game!",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Live Command Center
          </h2>
          <p className="text-slate-600 mt-2">
            Real-time scoring, live streaming, and match recording hub
          </p>
        </div>
        {isStreaming && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-red-100 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-700">LIVE</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{viewers} viewers</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live Scoring */}
        <div className="lg:col-span-2 space-y-6">
          {/* Score Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">Live Match Score</CardTitle>
                <CardDescription className="text-slate-300">
                  vs {currentOpponent}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Score Display */}
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-teal-400 mb-2">
                      {playerScore}
                    </div>
                    <div className="text-lg font-medium">
                      {user?.firstName || 'You'}
                    </div>
                    <div className="text-sm text-slate-400">
                      {user?.playerRating || '3.5'} Rating
                    </div>
                  </div>
                  
                  <div className="text-4xl text-slate-400 font-bold">
                    :
                  </div>
                  
                  <div className="text-center">
                    <div className="text-6xl font-bold text-orange-400 mb-2">
                      {opponentScore}
                    </div>
                    <div className="text-lg font-medium">
                      {currentOpponent}
                    </div>
                    <div className="text-sm text-slate-400">
                      3.5 Rating
                    </div>
                  </div>
                </div>

                {/* Score Controls */}
                <div className="flex justify-center gap-8">
                  <div className="space-y-2">
                    <div className="text-center text-sm text-slate-300 mb-2">Your Score</div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline" 
                        className="w-10 h-10 p-0 bg-slate-700 border-slate-600 hover:bg-slate-600"
                        onClick={() => handleScoreChange('player', -1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Button
                        size="lg"
                        className="w-16 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-xl font-bold"
                        onClick={() => handleScoreChange('player', 1)}
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-center text-sm text-slate-300 mb-2">Opponent Score</div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-10 h-10 p-0 bg-slate-700 border-slate-600 hover:bg-slate-600"
                        onClick={() => handleScoreChange('opponent', -1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Button
                        size="lg"
                        className="w-16 h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-xl font-bold"
                        onClick={() => handleScoreChange('opponent', 1)}
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Game Controls */}
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={resetScores}
                    className="bg-slate-700 border-slate-600 hover:bg-slate-600"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                    <Trophy className="w-4 h-4 mr-2" />
                    Finish Game
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Video Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-rose-500" />
                  Live Camera Feed
                </CardTitle>
                <CardDescription>
                  Record your matches and stream live to the community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
                  {isRecording ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-slate-400">
                        <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Camera Off</p>
                        <p className="text-sm">Start recording to see live feed</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Recording Indicator */}
                  {isRecording && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-white">REC</span>
                    </div>
                  )}
                  
                  {/* Stream Indicator */}
                  {isStreaming && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-white">LIVE</span>
                    </div>
                  )}
                </div>

                {/* Video Controls */}
                <div className="flex justify-center gap-3 mt-4">
                  {!isRecording ? (
                    <Button
                      onClick={handleStartRecording}
                      className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button
                      onClick={handleStopRecording}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop Recording
                    </Button>
                  )}
                  
                  {isRecording && !isStreaming && (
                    <Button
                      onClick={handleStartStream}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Go Live
                    </Button>
                  )}
                  
                  {isStreaming && (
                    <Button
                      onClick={handleStopStream}
                      variant="outline"
                      className="border-purple-300 text-purple-600 hover:bg-purple-50"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      End Stream
                    </Button>
                  )}
                  
                  {isRecording && (
                    <>
                      <Button
                        onClick={handleToggleCamera}
                        variant="outline"
                        size="sm"
                        className={cameraOn ? '' : 'bg-slate-100'}
                      >
                        {cameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        onClick={handleToggleMic}
                        variant="outline"
                        size="sm"
                        className={micOn ? '' : 'bg-slate-100'}
                      >
                        {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-rose-800">
                  <Zap className="w-5 h-5" />
                  Live Coaching Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Focus on split-step timing",
                  "Keep deep, soft returns",
                  "Watch for cross-court dinking opportunities",
                  "Use lane openings strategically"
                ].map((tip, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-white rounded-lg">
                    <Target className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{tip}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Live Streams */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Live Streams
                </CardTitle>
                <CardDescription>
                  Watch other champions play live
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { 
                      name: "Sarah Martinez", 
                      title: "Tournament Practice", 
                      viewers: 45,
                      image: "https://live.staticflickr.com/2835/9128160147_373878103f_z.jpg"
                    },
                    { 
                      name: "Mike Thompson", 
                      title: "Mental Game Clinic", 
                      viewers: 32,
                      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face"
                    },
                    { 
                      name: "Lisa Chen", 
                      title: "Beginner Fundamentals", 
                      viewers: 28,
                      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
                    }
                  ].map((stream, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <Image
                            src={stream.image}
                            alt={stream.name}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{stream.name}</h4>
                        <p className="text-sm text-slate-600">{stream.title}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Eye className="w-3 h-3" />
                          <span>{stream.viewers} watching</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Clips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="w-5 h-5 text-green-500" />
                  Recent Clips
                </CardTitle>
                <CardDescription>
                  Your saved match recordings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user?.clips?.length > 0 ? (
                    user.clips.slice(0, 3).map((clip: any, index: number) => (
                      <div key={clip.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                          <Play className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{clip.title}</h4>
                          <p className="text-sm text-slate-600">
                            {clip.duration}s • {new Date(clip.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-500">
                      <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No clips yet</p>
                      <p className="text-xs">Start recording to save clips</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
