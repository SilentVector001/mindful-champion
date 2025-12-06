
"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SimplifiedNav from "@/components/layout/simplified-nav"
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
  Brain
} from "lucide-react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import Link from "next/link"

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

export default function VideoAnalysis() {
  const { data: session } = useSession() || {}
  const userData = session?.user as any
  
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [analysisStage, setAnalysisStage] = useState<string>("")

  const subscriptionTier = userData?.subscriptionTier || 'FREE'
  const isPremium = subscriptionTier === 'PREMIUM'
  const isPro = subscriptionTier === 'PRO'
  const hasAccess = isPremium || isPro

  // Tier-based limits
  const maxFileSize = isPro ? 500 : isPremium ? 200 : 100 // MB
  const maxVideosPerMonth = isPro ? 'Unlimited' : isPremium ? 50 : 5
  const maxDuration = isPro ? 60 : isPremium ? 30 : 10 // minutes

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.wmv']
    },
    maxSize: maxFileSize * 1024 * 1024,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0])
        setError(null)
        setAnalysis(null)
      }
    },
    onDropRejected: (fileRejections) => {
      setError(`File too large! Max size: ${maxFileSize}MB for your ${subscriptionTier} tier.`)
    }
  })

  const analyzeVideo = async () => {
    if (!file) return

    setUploading(true)
    setAnalyzing(true)
    setProgress(10)
    setError(null)
    setAnalysisStage("Uploading video...")

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('tier', subscriptionTier)

      setProgress(20)
      setAnalysisStage("Processing video frames...")
      
      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Analysis failed')
      }

      setProgress(40)
      setAnalysisStage("Analyzing technique and movements...")
      
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let partialRead = ''

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        partialRead += decoder.decode(value, { stream: true })
        let lines = partialRead.split('\n')
        partialRead = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.status === 'processing') {
                setProgress(prev => Math.min(prev + 5, 95))
                if (parsed.stage) setAnalysisStage(parsed.stage)
              } else if (parsed.status === 'completed') {
                setAnalysis(parsed.result)
                setProgress(100)
                setAnalysisStage("Analysis complete!")
                return
              } else if (parsed.status === 'error') {
                throw new Error(parsed.message || 'Analysis failed')
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Analysis error:', error)
      setError(error.message || 'Failed to analyze video. Please try again.')
    } finally {
      setUploading(false)
      setAnalyzing(false)
      setAnalysisStage("")
    }
  }

  return (
    <>
      <SimplifiedNav />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-orange-500 rounded-xl blur-md opacity-50" />
                    <div className="relative w-12 h-12 bg-gradient-to-br from-teal-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <Video className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
                      AI Video Analysis
                    </h1>
                    <p className="text-slate-600 text-sm mt-1">
                      Upload your match footage for instant, AI-powered coaching insights
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge
                  className={cn(
                    "gap-1 items-center h-8 px-4",
                    isPro
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : isPremium
                      ? 'bg-gradient-to-r from-teal-500 to-orange-500 text-white'
                      : 'bg-slate-500 text-white'
                  )}
                >
                  {isPro && <Crown className="w-4 h-4" />}
                  {subscriptionTier} Plan
                </Badge>
                {!hasAccess && (
                  <Link href="/pricing">
                    <Button className="gap-2 bg-gradient-to-r from-teal-600 to-orange-600 hover:from-teal-700 hover:to-orange-700">
                      <Sparkles className="w-4 h-4" />
                      Upgrade
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Tier Features Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-5 w-5 text-slate-600" />
                    <span className="font-semibold text-slate-900">Max Duration</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{maxDuration} min</p>
                  <p className="text-xs text-slate-600 mt-1">Per video analysis</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Film className="h-5 w-5 text-teal-600" />
                    <span className="font-semibold text-slate-900">Monthly Limit</span>
                  </div>
                  <p className="text-2xl font-bold text-teal-600">{maxVideosPerMonth}</p>
                  <p className="text-xs text-slate-600 mt-1">Video analyses per month</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold text-slate-900">Max File Size</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{maxFileSize} MB</p>
                  <p className="text-xs text-slate-600 mt-1">Upload size limit</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Upload & Analysis Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upload Card */}
              <Card className="border-2 border-dashed border-slate-300 hover:border-teal-400 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-teal-600" />
                    Upload Your Video
                  </CardTitle>
                  <CardDescription>
                    Drag & drop your match or practice video • Supported: MP4, MOV, AVI, WMV • Max {maxFileSize}MB
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    {...getRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
                      isDragActive 
                        ? "border-teal-500 bg-gradient-to-br from-teal-50 to-orange-50 scale-105" 
                        : "border-slate-300 hover:border-teal-400 hover:bg-slate-50"
                    )}
                  >
                    <input {...getInputProps()} />
                    {file ? (
                      <div className="space-y-4">
                        <div className="relative inline-block">
                          <div className="absolute inset-0 bg-teal-500 rounded-full blur-xl opacity-30" />
                          <FileVideo className="relative h-16 w-16 mx-auto text-teal-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg text-slate-900">{file.name}</p>
                          <p className="text-sm text-slate-600">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setFile(null)
                            setAnalysis(null)
                          }}
                        >
                          Remove & Choose Another
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative inline-block">
                          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-orange-500 rounded-full blur-xl opacity-20" />
                          <Upload className="relative h-16 w-16 mx-auto text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-slate-900">
                            {isDragActive ? "Drop your video here!" : "Drag & drop your video"}
                          </p>
                          <p className="text-sm text-slate-600 mt-2">or click to browse your files</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Up to {maxDuration} minutes • {maxFileSize}MB max
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {file && !analyzing && !analysis && (
                    <Button
                      onClick={analyzeVideo}
                      className="w-full mt-6 h-12 text-lg bg-gradient-to-r from-teal-600 to-orange-600 hover:from-teal-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Starting Analysis...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Analyze Video with AI
                        </>
                      )}
                    </Button>
                  )}

                  {analyzing && (
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-teal-600 animate-pulse" />
                          <span className="text-slate-600 font-medium">{analysisStage || "Analyzing..."}</span>
                        </div>
                        <span className="font-semibold text-teal-600">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-3" />
                      <p className="text-xs text-center text-slate-500">
                        AI is analyzing your technique, movements, and shot selection...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="border-2">
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription className="text-base">{error}</AlertDescription>
                </Alert>
              )}

              {/* Analysis Results */}
              {analysis && (
                <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                      <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                        Analysis Complete
                      </span>
                    </CardTitle>
                    <CardDescription>
                      AI-powered insights based on your {subscriptionTier} plan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4">
                        <TabsTrigger value="overview">
                          <Eye className="h-4 w-4 mr-2" />
                          Overview
                        </TabsTrigger>
                        <TabsTrigger value="technique" disabled={!isPremium && !isPro}>
                          <Activity className="h-4 w-4 mr-2" />
                          Technique
                          {!isPremium && !isPro && <Lock className="h-3 w-3 ml-1" />}
                        </TabsTrigger>
                        <TabsTrigger value="stats" disabled={!isPro}>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Stats
                          {!isPro && <Lock className="h-3 w-3 ml-1" />}
                        </TabsTrigger>
                        <TabsTrigger value="timeline" disabled={!isPro}>
                          <LineChart className="h-4 w-4 mr-2" />
                          Timeline
                          {!isPro && <Lock className="h-3 w-3 ml-1" />}
                        </TabsTrigger>
                      </TabsList>

                      {/* Overview Tab */}
                      <TabsContent value="overview" className="space-y-6 mt-6">
                        {analysis.strengths && analysis.strengths.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2 text-green-700">
                              <Trophy className="h-5 w-5" />
                              Your Strengths
                            </h3>
                            <div className="space-y-2">
                              {analysis.strengths.map((strength: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-slate-700">{strength}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {analysis.areasForImprovement && analysis.areasForImprovement.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2 text-amber-700">
                              <Target className="h-5 w-5" />
                              Areas for Improvement
                            </h3>
                            <div className="space-y-2">
                              {analysis.areasForImprovement.map((area: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200">
                                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-slate-700">{area}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {analysis.recommendations && analysis.recommendations.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2 text-teal-700">
                              <Lightbulb className="h-5 w-5" />
                              Personalized Recommendations
                            </h3>
                            <div className="space-y-2">
                              {analysis.recommendations.map((rec: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-teal-200">
                                  <Zap className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-slate-700">{rec}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      {/* Technique Tab (Premium+) */}
                      <TabsContent value="technique" className="space-y-6 mt-6">
                        {(isPremium || isPro) && analysis.technicalBreakdown ? (
                          <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Technical Breakdown</h3>
                            {/* Add technical breakdown visualization */}
                            <p className="text-slate-600">Detailed technique analysis available in Pro tier</p>
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Lock className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
                            <p className="text-slate-600 mb-4">
                              Unlock detailed technique analysis with Premium or Pro
                            </p>
                            <Link href="/pricing">
                              <Button className="bg-gradient-to-r from-teal-600 to-orange-600">
                                Upgrade Now
                              </Button>
                            </Link>
                          </div>
                        )}
                      </TabsContent>

                      {/* Stats Tab (Pro only) */}
                      <TabsContent value="stats" className="space-y-6 mt-6">
                        {isPro ? (
                          <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Advanced Statistics</h3>
                            {/* Add stats visualization */}
                            <p className="text-slate-600">Shot types, accuracy, movement metrics</p>
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Crown className="h-16 w-16 mx-auto text-purple-300 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Pro Feature</h3>
                            <p className="text-slate-600 mb-4">
                              Get detailed statistics and metrics with Pro
                            </p>
                            <Link href="/pricing">
                              <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                                Upgrade to Pro
                              </Button>
                            </Link>
                          </div>
                        )}
                      </TabsContent>

                      {/* Timeline Tab (Pro only) */}
                      <TabsContent value="timeline" className="space-y-6 mt-6">
                        {isPro ? (
                          <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Video Timeline Analysis</h3>
                            {/* Add timeline visualization */}
                            <p className="text-slate-600">Key moments and events in your match</p>
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Crown className="h-16 w-16 mx-auto text-purple-300 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Pro Feature</h3>
                            <p className="text-slate-600 mb-4">
                              Access frame-by-frame timeline analysis with Pro
                            </p>
                            <Link href="/pricing">
                              <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                                Upgrade to Pro
                              </Button>
                            </Link>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>

                    <div className="mt-6 pt-6 border-t flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFile(null)
                          setAnalysis(null)
                          setProgress(0)
                        }}
                        className="flex-1"
                      >
                        Analyze Another Video
                      </Button>
                      <Button className="flex-1 bg-gradient-to-r from-teal-600 to-orange-600">
                        Save Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Tips & Features */}
            <div className="space-y-6">
              {/* Recording Tips */}
              <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-teal-700">
                    <Lightbulb className="h-5 w-5" />
                    Recording Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-teal-600 mt-2 flex-shrink-0" />
                    <p className="text-sm text-slate-700">
                      <strong>Side angle:</strong> Record from the side for full court visibility
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-teal-600 mt-2 flex-shrink-0" />
                    <p className="text-sm text-slate-700">
                      <strong>Lighting:</strong> Ensure good lighting and stable camera position
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-teal-600 mt-2 flex-shrink-0" />
                    <p className="text-sm text-slate-700">
                      <strong>Duration:</strong> Include at least 3-5 minutes of gameplay
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-teal-600 mt-2 flex-shrink-0" />
                    <p className="text-sm text-slate-700">
                      <strong>Focus:</strong> Capture match play rather than isolated drills
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-teal-600 mt-2 flex-shrink-0" />
                    <p className="text-sm text-slate-700">
                      <strong>Stability:</strong> Use a tripod or stable surface to avoid shaky footage
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* What You Get */}
              <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <Sparkles className="h-5 w-5" />
                    Your {subscriptionTier} Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">Basic technique analysis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">Strengths & weaknesses</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">Personalized recommendations</span>
                  </div>
                  {(isPremium || isPro) && (
                    <>
                      <div className="flex items-center gap-3">
                        <Crown className="h-5 w-5 text-teal-600 flex-shrink-0" />
                        <span className="text-sm text-slate-700">Advanced movement analysis</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Crown className="h-5 w-5 text-teal-600 flex-shrink-0" />
                        <span className="text-sm text-slate-700">Detailed technique breakdown</span>
                      </div>
                    </>
                  )}
                  {isPro && (
                    <>
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0" />
                        <span className="text-sm text-slate-700">Shot-by-shot analysis</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0" />
                        <span className="text-sm text-slate-700">Video timeline with key moments</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0" />
                        <span className="text-sm text-slate-700">Competitor insights</span>
                      </div>
                    </>
                  )}
                  
                  {!hasAccess && (
                    <div className="pt-3 border-t">
                      <Link href="/pricing">
                        <Button className="w-full bg-gradient-to-r from-teal-600 to-orange-600 hover:from-teal-700 hover:to-orange-700">
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Upgrade for More
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-slate-700" />
                    Your Usage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">This Month</span>
                      <span className="font-semibold">2 / {maxVideosPerMonth}</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                  <p className="text-xs text-slate-500">
                    {maxVideosPerMonth === 'Unlimited' 
                      ? 'Unlimited video analysis with Pro' 
                      : `${typeof maxVideosPerMonth === 'number' ? maxVideosPerMonth - 2 : 0} analyses remaining this month`
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
