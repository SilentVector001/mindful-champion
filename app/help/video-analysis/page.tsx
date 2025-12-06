
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Video, Upload, Play, BarChart3, Target, Lightbulb, 
  CheckCircle2, AlertCircle, Trophy, Zap, Info, Star,
  Download, Share2, Clock, Gauge, Activity, Brain
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function VideoAnalysisHelpPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/help/video-analysis')
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
            <Video className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Video Analysis Guide</h1>
            <p className="text-muted-foreground">
              AI-powered pickleball analysis to perfect your technique
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Start
          </CardTitle>
          <CardDescription>
            Get your first video analysis in 3 simple steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold">Navigate to Video Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Go to Train → Video Analysis or click the button below
                </p>
                <Link href="/train/video">
                  <Button className="mt-2" size="sm">
                    Go to Video Analysis <Video className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold">Upload Your Video</h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop or click to browse (MP4, MOV, or AVI, up to 500MB)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold">Review Insights & Improve</h3>
                <p className="text-sm text-muted-foreground">
                  Get AI-powered technique analysis, specific drill recommendations, and track your progress
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What Gets Analyzed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            What Gets Analyzed
          </CardTitle>
          <CardDescription>
            Our AI analyzes every aspect of your game
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                Technical Metrics (8)
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 pl-6">
                <li>• Paddle angle consistency</li>
                <li>• Follow-through quality</li>
                <li>• Body rotation mechanics</li>
                <li>• Ready position</li>
                <li>• Grip technique</li>
                <li>• Contact point optimization</li>
                <li>• Weight transfer</li>
                <li>• Head stability</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                Movement Analytics (10)
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 pl-6">
                <li>• Court coverage percentage</li>
                <li>• Average & maximum speed</li>
                <li>• Movement efficiency</li>
                <li>• Positioning quality</li>
                <li>• Anticipation rating</li>
                <li>• Footwork score</li>
                <li>• Balance maintenance</li>
                <li>• Split-step timing</li>
                <li>• Recovery patterns</li>
                <li>• Energy efficiency</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-orange-500" />
                Shot Statistics (7 Types)
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 pl-6">
                <li>• Serves (success rate & quality)</li>
                <li>• Forehands (technique & placement)</li>
                <li>• Backhands (consistency & power)</li>
                <li>• Volleys (timing & control)</li>
                <li>• Dinks (soft game finesse)</li>
                <li>• Smashes (power & accuracy)</li>
                <li>• Lobs (strategic execution)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Strategic Insights
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 pl-6">
                <li>• Pattern recognition</li>
                <li>• Tactical suggestions</li>
                <li>• Mental game notes</li>
                <li>• Pro player comparison</li>
                <li>• Competitive advantages</li>
                <li>• Game IQ assessment</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Understanding Your Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-blue-500" />
            Understanding Your Results
          </CardTitle>
          <CardDescription>
            How to interpret your analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold mb-2">Overall Score (0-100)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="font-bold text-red-700 dark:text-red-400">0-50</div>
                  <div className="text-xs text-red-600 dark:text-red-500">Beginner</div>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <div className="font-bold text-yellow-700 dark:text-yellow-400">51-70</div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-500">Intermediate</div>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="font-bold text-blue-700 dark:text-blue-400">71-85</div>
                  <div className="text-xs text-blue-600 dark:text-blue-500">Advanced</div>
                </div>
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="font-bold text-green-700 dark:text-green-400">86-100</div>
                  <div className="text-xs text-green-600 dark:text-green-500">Elite</div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Three Analysis Tabs</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">Overview</Badge>
                  <p className="text-sm text-muted-foreground">
                    Your overall score, top strengths, weaknesses, and quick recommendations
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">Analysis</Badge>
                  <p className="text-sm text-muted-foreground">
                    Detailed breakdown of all 18 metrics, shot statistics, and frame-by-frame review
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">Recommendations</Badge>
                  <p className="text-sm text-muted-foreground">
                    Prioritized improvement plan with specific drills, timelines, and Coach Kai commentary
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Best Practices
          </CardTitle>
          <CardDescription>
            Get the most accurate analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Do This
              </h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ Good lighting (outdoor or well-lit court)</li>
                <li>✓ Stable camera (tripod recommended)</li>
                <li>✓ Full court view (capture entire player)</li>
                <li>✓ 720p or higher resolution</li>
                <li>✓ 2-15 minute videos</li>
                <li>✓ Clear focus on one player</li>
                <li>✓ Side or diagonal angle best</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Avoid This
              </h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✗ Dark or backlit videos</li>
                <li>✗ Shaky handheld footage</li>
                <li>✗ Zoomed in too close</li>
                <li>✗ Low resolution (below 480p)</li>
                <li>✗ Videos over 500MB</li>
                <li>✗ Multiple players in frame</li>
                <li>✗ Behind-fence obstructions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Processing Time
          </CardTitle>
          <CardDescription>
            How long does analysis take?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="font-medium">Short videos (2-5 min)</span>
              <Badge variant="secondary">1-2 minutes</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="font-medium">Medium videos (5-10 min)</span>
              <Badge variant="secondary">3-5 minutes</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="font-medium">Long videos (10-15 min)</span>
              <Badge variant="secondary">5-8 minutes</Badge>
            </div>
          </div>
          
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Processing time may vary based on video quality, resolution, and server load. 
              You can leave the page and return later - your analysis will be saved automatically.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Free vs Pro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Free vs Pro Features
          </CardTitle>
          <CardDescription>
            What's included in each tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2 p-4 rounded-lg border">
              <h3 className="font-semibold">Free Tier</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ 1 video analysis per month</li>
                <li>✓ Basic technical metrics</li>
                <li>✓ Shot breakdown</li>
                <li>✓ Coach commentary</li>
                <li>✓ Drill recommendations</li>
              </ul>
            </div>

            <div className="space-y-2 p-4 rounded-lg border border-violet-500 bg-violet-50 dark:bg-violet-900/10">
              <h3 className="font-semibold flex items-center gap-2">
                Pro Tier 
                <Badge className="bg-violet-500">$20/mo</Badge>
              </h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ <strong>Unlimited</strong> video analyses</li>
                <li>✓ Advanced movement analytics</li>
                <li>✓ Frame-by-frame review</li>
                <li>✓ <strong>PDF export</strong></li>
                <li>✓ Video library storage (5GB)</li>
                <li>✓ <strong>Progress tracking</strong> over time</li>
                <li>✓ Pro player comparison</li>
                <li>✓ Priority processing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Troubleshooting
          </CardTitle>
          <CardDescription>
            Common issues and solutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold mb-1">Video won't upload</h4>
              <p className="text-muted-foreground">Check file size (max 500MB) and format (MP4, MOV, AVI only)</p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-1">Analysis failed or stuck</h4>
              <p className="text-muted-foreground">Ensure video has good lighting and clear player visibility. Try a shorter clip.</p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-1">Results seem inaccurate</h4>
              <p className="text-muted-foreground">Verify camera angle captures full player movement. Side/diagonal angles work best.</p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-1">Can't find my video</h4>
              <p className="text-muted-foreground">Check your Video Library tab. Videos are saved automatically after analysis.</p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-1">Processing takes too long</h4>
              <p className="text-muted-foreground">Try uploading during off-peak hours or use shorter video clips.</p>
            </div>
          </div>

          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Still having issues? <Link href="/help/submit-ticket" className="underline font-semibold">Submit a support ticket</Link> and our team will help you.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-violet-200 dark:border-violet-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Ready to Analyze Your Game?</h3>
              <p className="text-sm text-muted-foreground">
                Upload your first video and get professional-grade insights in minutes
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/train/video">
                <Button size="lg" className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                  Start Analysis <Video className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/help">
                <Button size="lg" variant="outline">
                  Back to Help
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
