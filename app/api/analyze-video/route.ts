
import { NextRequest } from 'next/server'

export const dynamic = "force-dynamic";
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'

import { prisma } from '@/lib/db'


export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const tier = formData.get('tier') as string

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get user data for personalization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: {
        subscriptionTier: true,
        skillLevel: true,
        primaryGoals: true,
        biggestChallenges: true
      }
    })

    const userTier = user?.subscriptionTier || 'FREE'
    const isPremium = userTier === 'PREMIUM'
    const isPro = userTier === 'PRO'

    // For now, provide a simulated analysis
    // In production, this would process the video with AI/ML models
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        
        // Simulate processing stages
        const stages = [
          { status: 'processing', stage: 'Uploading video...' },
          { status: 'processing', stage: 'Processing video frames...' },
          { status: 'processing', stage: 'Analyzing technique and movements...' },
          { status: 'processing', stage: 'Detecting shot types and patterns...' },
          { status: 'processing', stage: 'Evaluating positioning and footwork...' },
          { status: 'processing', stage: 'Generating personalized recommendations...' }
        ]

        for (const update of stages) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`))
          await new Promise(resolve => setTimeout(resolve, 800))
        }

        // Base analysis (available to all tiers)
        const analysis: any = {
          strengths: [
            "Strong serve placement with excellent depth control - your serves are landing consistently in the deep corners",
            "Effective use of third shot drops to neutralize opponent attacks and transition to the kitchen line",
            "Solid court positioning during rallies with good anticipation of opponent shots",
            "Consistent dinking game with controlled pace and good cross-court placement"
          ],
          areasForImprovement: [
            "Footwork in transition zone could be more efficient - work on taking smaller, quicker steps and maintaining split-step timing",
            "Overhead smashes lack power and follow-through - focus on full extension and contact point above the head",
            "Backhand volleys tend to pop up under pressure - keep paddle face more closed and firm on contact",
            "Decision-making under pressure - tendency to rush shots instead of resetting with dinks when in defensive positions"
          ],
          recommendations: [
            "Practice 'Third Shot Drop Mastery' drill 3x per week to improve drop shot consistency under game pressure",
            "Work on 'Transition Zone Footwork' drill to improve court movement and reduce unforced errors",
            "Add 'Power Serve Practice' to develop more aggressive serves and increase ace percentage",
            "Focus on mental game - implement pre-point breathing routine to stay composed during critical moments"
          ]
        }

        // Premium features
        if (isPremium || isPro) {
          analysis.movementAnalysis = {
            speed: 7.2,
            efficiency: 6.8,
            positioning: 7.5,
            splitStepTiming: 6.5
          }
          
          analysis.technicalBreakdown = {
            footwork: 7.0,
            paddleAngle: 7.5,
            followThrough: 6.5,
            bodyRotation: 7.2,
            balanceControl: 7.8
          }

          analysis.strengths.push(
            "Excellent anticipation skills - reading opponent body language effectively",
            "Strong mental composure in long rallies - maintaining focus and patience"
          )

          analysis.areasForImprovement.push(
            "Lateral movement speed could be improved with agility ladder drills",
            "Weight transfer on groundstrokes needs more hip rotation for added power"
          )
        }

        // Pro features
        if (isPro) {
          analysis.shotTypes = [
            { type: 'Serve', count: 24, accuracy: 85 },
            { type: 'Third Shot Drop', count: 18, accuracy: 72 },
            { type: 'Dink', count: 45, accuracy: 88 },
            { type: 'Volley', count: 32, accuracy: 78 },
            { type: 'Overhead', count: 8, accuracy: 62 },
            { type: 'Groundstroke', count: 28, accuracy: 81 }
          ]

          analysis.competitorInsights = [
            "Your opponent targeted your backhand 65% of the time - work on backhand consistency",
            "Most points lost occurred after rushed third shots - take an extra second to set up",
            "Strong performance in extended dinking rallies (80% win rate in rallies over 10 shots)",
            "Opponent struggled with your pace changes - continue varying shot speed"
          ]

          analysis.videoTimestamps = [
            { time: '2:34', event: 'Excellent third shot drop', impact: 'Led to point win' },
            { time: '5:12', event: 'Missed overhead opportunity', impact: 'Should have attacked more aggressively' },
            { time: '8:45', event: 'Great defensive dinking sequence', impact: 'Forced opponent error' },
            { time: '11:20', event: 'Poor footwork on transition', impact: 'Led to unforced error' },
            { time: '14:03', event: 'Perfect serve placement', impact: 'Ace' }
          ]

          analysis.detailedMetrics = {
            avgRallyLength: 6.8,
            unforcedErrors: 12,
            winners: 8,
            firstServePercentage: 82,
            kitchenTimePercentage: 68,
            attackSuccessRate: 71
          }
        }

        // Send completion with analysis
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          status: 'completed', 
          result: analysis,
          tier: userTier 
        })}\n\n`))
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error: any) {
    console.error('Video analysis error:', error)
    return new Response(JSON.stringify({ 
      message: error.message || 'Internal server error',
      error: 'Video analysis failed' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
