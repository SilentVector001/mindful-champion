
"use client"

import { useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload,
  Video,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
  FileVideo,
  Crown,
  Lock,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  Clock,
  Eye,
  Activity,
  BarChart3,
  Lightbulb,
  Trophy,
  Film,
  LineChart,
  Brain,
  Cpu,
  Gauge,
  Timer,
  Award,
  Users,
  Star
} from "lucide-react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"

interface AnalysisResult {
  strengths?: string[]
  areasForImprovement?: string[]
  recommendations?: string[]
  // Pro features
  shotTypes?: { type: string; count: number; accuracy: number }[]
  movementAnalysis?: { speed: number; efficiency: number; positioning: number }
  technicalBreakdown?: { footwork: number; paddleAngle: number; followThrough: number }
  competitorInsights?: string[]
  videoTimestamps?: { time: string; event: string; impact: string }[]
}

export default function VideoAnalysisPro() {
  const { data: session } = useSession() || {}
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      setVideoPreview(URL.createObjectURL(file))
      setError(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm']
    },
    maxSize: 500 * 1024 * 1024, // 500MB
    multiple: false
  })

  const handleAnalyze = async () => {
    if (!selectedFile) return

    setError(null)
    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(uploadInterval)
            return 95
          }
          return prev + 10
        })
      }, 200)

      const uploadResponse = await fetch("/api/analyze-video", {
        method: "POST",
        body: formData,
      })

      clearInterval(uploadInterval)
      setUploadProgress(100)

      if (!uploadResponse.ok) {
        throw new Error("Upload failed")
      }

      // Upload complete - show success
      toast.success("Video uploaded successfully!", {
        description: "Starting AI analysis...",
        duration: 3000
      })
      
      setUploading(false)
      setAnalyzing(true)
      setAnalysisProgress(0)

      // Handle streaming response
      const reader = uploadResponse.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("Failed to read response")
      }

      let buffer = ''
      let finalResult: any = null

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data === '[DONE]') {
              continue
            }

            try {
              const parsed = JSON.parse(data)
              
              if (parsed.status === 'processing') {
                // Update progress based on stage
                setAnalysisProgress((prev) => Math.min(prev + 15, 90))
              } else if (parsed.status === 'completed') {
                setAnalysisProgress(100)
                finalResult = parsed.result
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e)
            }
          }
        }
      }

      // Show success and results
      if (finalResult) {
        toast.success("Analysis Complete!", {
          description: "Your personalized insights are ready to view.",
          duration: 4000
        })
        
        setTimeout(() => {
          setAnalysisResult(finalResult)
          setAnalyzing(false)
        }, 500)
      } else {
        throw new Error("No analysis result received")
      }

    } catch (err) {
      console.error("Analysis error:", err)
      const errorMessage = "Failed to analyze video. Please try again."
      setError(errorMessage)
      
      toast.error("Upload Failed", {
        description: errorMessage,
        duration: 5000
      })
      
      setUploading(false)
      setAnalyzing(false)
      setUploadProgress(0)
      setAnalysisProgress(0)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setVideoPreview(null)
    setAnalysisResult(null)
    setUploadProgress(0)
    setAnalysisProgress(0)
    setError(null)
  }

  // If showing results
  if (analysisResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-champion-green/5 dark:from-champion-charcoal dark:via-gray-900 dark:to-champion-green/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-champion-green/10 rounded-full mb-4">
              <CheckCircle2 className="w-12 h-12 text-champion-green" />
            </div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
              Analysis Complete!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Your personalized insights are ready
            </p>
            <Button 
              onClick={handleReset}
              size="lg"
              variant="outline"
              className="mb-8"
            >
              <Upload className="w-4 h-4 mr-2" />
              Analyze Another Video
            </Button>
          </div>

          {/* Results Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Strengths */}
            {analysisResult.strengths && analysisResult.strengths.length > 0 && (
              <Card className="border-champion-green/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-champion-green">
                    <Trophy className="w-5 h-5" />
                    Your Strengths
                  </CardTitle>
                  <CardDescription>
                    What you're doing well
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysisResult.strengths.map((strength: string, index: number) => (
                      <li key={index} className="flex gap-3 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-champion-green flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Areas for Improvement */}
            {analysisResult.areasForImprovement && analysisResult.areasForImprovement.length > 0 && (
              <Card className="border-champion-gold/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-champion-gold">
                    <Target className="w-5 h-5" />
                    Areas for Growth
                  </CardTitle>
                  <CardDescription>
                    Opportunities to elevate your game
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysisResult.areasForImprovement.map((area: string, index: number) => (
                      <li key={index} className="flex gap-3 text-sm">
                        <Zap className="w-5 h-5 text-champion-gold flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{area}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
              <Card className="border-champion-blue/20 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-champion-blue">
                    <Lightbulb className="w-5 h-5" />
                    Personalized Recommendations
                  </CardTitle>
                  <CardDescription>
                    Your action plan to improve
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysisResult.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex gap-3 text-sm">
                        <Sparkles className="w-5 h-5 text-champion-blue flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Shot Types (Pro feature) */}
            {analysisResult.shotTypes && analysisResult.shotTypes.length > 0 && (
              <Card className="border-champion-green/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-champion-green" />
                    Shot Analysis
                  </CardTitle>
                  <CardDescription>
                    Breakdown by shot type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisResult.shotTypes.map((shot: any, index: number) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {shot.type}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {shot.count} shots • {shot.accuracy}% accuracy
                          </span>
                        </div>
                        <Progress value={shot.accuracy} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Movement Analysis (Premium feature) */}
            {analysisResult.movementAnalysis && (
              <Card className="border-champion-gold/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-champion-gold" />
                    Movement Metrics
                  </CardTitle>
                  <CardDescription>
                    Court positioning and footwork
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analysisResult.movementAnalysis).map(([key, value]: [string, any]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-900 dark:text-white capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-champion-gold font-semibold">
                            {value}/10
                          </span>
                        </div>
                        <Progress value={value * 10} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-champion-green/5 dark:from-champion-charcoal dark:via-gray-900 dark:to-champion-green/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-champion-green/10 text-champion-green border-champion-green/20">
            <Star className="w-3 h-3 mr-1 fill-champion-green" />
            #1 AI-Powered Pickleball Analysis
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            See What You Can't See
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-800 dark:text-gray-200 mb-4 max-w-3xl mx-auto font-medium">
            Powered by advanced AI technology that analyzes every shot, movement, and decision—giving you insights that transform your game.
          </p>
          
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Upload any match or practice footage and receive professional-grade analysis in minutes. No special equipment needed—just your phone.
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-champion-green" />
              <span>AI-Powered Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-champion-gold" />
              <span>Results in Minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-champion-blue" />
              <span>Pro-Level Insights</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emotion-success" />
              <span>Trusted by 10,000+ Players</span>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="mb-12 border-2 border-dashed border-gray-300 dark:border-gray-700 shadow-xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl mb-2 text-gray-900 dark:text-white">Upload Your Game Footage</CardTitle>
            <CardDescription className="text-base text-gray-700 dark:text-gray-300">
              Record with any device • Supports MP4, MOV, AVI formats • Up to 500MB
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedFile ? (
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200",
                  isDragActive
                    ? "border-champion-green bg-champion-green/5 scale-105"
                    : "border-gray-300 dark:border-gray-700 hover:border-champion-green hover:bg-champion-green/5",
                  "min-h-[300px] flex flex-col items-center justify-center"
                )}
              >
                <input {...getInputProps()} />
                
                <div className="mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-champion-green/20 to-champion-blue/20 blur-3xl rounded-full"></div>
                  <div className="relative bg-gradient-to-br from-champion-green to-champion-blue p-6 rounded-2xl">
                    <Upload className="w-12 h-12 text-white" />
                  </div>
                </div>
                
                {isDragActive ? (
                  <p className="text-xl font-semibold text-champion-green mb-2">
                    Drop your video here
                  </p>
                ) : (
                  <>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Drag & drop your video here
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      or click to browse from your device
                    </p>
                  </>
                )}

                <div className="flex flex-wrap gap-2 justify-center text-xs text-gray-400">
                  <Badge variant="outline" className="gap-1">
                    <FileVideo className="w-3 h-3" />
                    MP4
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <FileVideo className="w-3 h-3" />
                    MOV
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <FileVideo className="w-3 h-3" />
                    AVI
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <FileVideo className="w-3 h-3" />
                    MKV
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Video Preview */}
                {videoPreview && (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full h-full"
                    />
                  </div>
                )}

                {/* File Info */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-champion-green/10 rounded-lg">
                      <FileVideo className="w-5 h-5 text-champion-green" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    disabled={uploading || analyzing}
                  >
                    Change Video
                  </Button>
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                      <span className="font-medium text-champion-green">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* Analysis Progress */}
                {analyzing && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-champion-green/5 border border-champion-green/20 rounded-xl">
                      <Loader2 className="w-5 h-5 text-champion-green animate-spin" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white mb-1">
                          AI Analysis in Progress
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Our AI is analyzing your technique, shot selection, and movement patterns...
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Processing</span>
                        <span className="font-medium text-champion-green">{analysisProgress}%</span>
                      </div>
                      <Progress value={analysisProgress} className="h-2" />
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Action Button */}
                {!uploading && !analyzing && (
                  <Button
                    onClick={handleAnalyze}
                    size="lg"
                    className="w-full bg-gradient-to-r from-champion-green to-champion-blue hover:opacity-90 text-white"
                    disabled={!selectedFile}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze My Game
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* How It Works Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <Badge className="mb-4" variant="outline">
              <Brain className="w-3 h-3 mr-1" />
              Powered by Advanced AI
            </Badge>
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">How Our Technology Works</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Industry-leading computer vision and machine learning algorithms analyze every frame of your game
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <Card className="border-2 hover:border-champion-green/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-champion-green to-champion-green/50 rounded-xl flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl mb-2 text-gray-900 dark:text-white">1. Intelligent Detection</CardTitle>
                <CardDescription className="text-base text-gray-700 dark:text-gray-300">
                  Our AI automatically identifies players, tracks the ball, and detects every shot type—serves, dinks, volleys, and drives—with precision accuracy.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Step 2 */}
            <Card className="border-2 hover:border-champion-gold/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-champion-gold to-champion-gold/50 rounded-xl flex items-center justify-center mb-4">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl mb-2 text-gray-900 dark:text-white">2. Deep Analysis</CardTitle>
                <CardDescription className="text-base text-gray-700 dark:text-gray-300">
                  Advanced biomechanical analysis evaluates your paddle angle, body positioning, footwork, timing, and shot placement—revealing what you can't see in real-time.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Step 3 */}
            <Card className="border-2 hover:border-champion-blue/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-champion-blue to-champion-blue/50 rounded-xl flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl mb-2 text-gray-900 dark:text-white">3. Actionable Insights</CardTitle>
                <CardDescription className="text-base text-gray-700 dark:text-gray-300">
                  Get personalized, prioritized recommendations based on your playing style and skill level—exactly what to practice to level up your game.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Everything You Need to Improve</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Professional-grade analysis tools that give you the competitive edge
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-champion-green/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-champion-green" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Shot Tracking</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Automatic detection and classification of every shot with accuracy metrics
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-champion-gold/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-6 h-6 text-champion-gold" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Movement Analysis</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Court positioning, footwork efficiency, and recovery speed evaluation
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-champion-blue/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-champion-blue" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Performance Metrics</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Detailed statistics on consistency, power, placement, and decision-making
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-emotion-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-6 h-6 text-emotion-success" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Frame-by-Frame</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Slow-motion breakdown of critical moments with technique annotations
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Social Proof */}
        <Card className="bg-gradient-to-br from-champion-green/5 to-champion-blue/5 border-champion-green/20">
          <CardContent className="pt-8 pb-8">
            <div className="text-center mb-8">
              <Trophy className="w-12 h-12 text-champion-gold mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Trusted by Top Players</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Join thousands of players who have transformed their game with AI-powered analysis
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-champion-green mb-2">10,000+</div>
                <p className="text-gray-600 dark:text-gray-400">Videos Analyzed</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-champion-gold mb-2">98%</div>
                <p className="text-gray-600 dark:text-gray-400">Satisfaction Rate</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-champion-blue mb-2">4.9★</div>
                <p className="text-gray-600 dark:text-gray-400">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
