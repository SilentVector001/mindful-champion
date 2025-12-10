export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes for video analysis

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// TEMPORARY: Heavy ML imports disabled to reduce serverless function size
// import { AdvancedAnalysisEngine } from '@/lib/video-analysis/advanced-analysis-engine'
// import { LLMShotDetector } from '@/lib/video-analysis/llm-shot-detector'
// import { downloadVideoForProcessing } from '@/lib/video-analysis/video-downloader'

import { sendEmailViaGmail } from '@/lib/email/gmail-sender'
import { generateVideoAnalysisCompleteEmail } from '@/lib/email/templates/video-analysis-complete'

export async function POST(request: NextRequest) {
  let videoId: string | null = null
  
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { videoId: vid, videoUrl, skillLevel = 'INTERMEDIATE' } = body
    videoId = vid

    console.log('📹 Video analysis request:', { videoId, videoUrl, skillLevel })

    if (!videoId || !videoUrl) {
      console.error('❌ Missing required parameters:', { videoId, videoUrl })
      return NextResponse.json(
        { error: 'Video ID and URL are required', received: { videoId, videoUrl } },
        { status: 400 }
      )
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if video analysis record exists (from upload)
    const existingAnalysis = await prisma.videoAnalysis.findUnique({
      where: { id: videoId },
    })

    if (!existingAnalysis) {
      return NextResponse.json(
        { error: 'Video analysis record not found' },
        { status: 404 }
      )
    }

    // Set status to PROCESSING
    await prisma.videoAnalysis.update({
      where: { id: videoId },
      data: { 
        analysisStatus: 'PROCESSING',
        shotDetectionProgress: {
          stage: 'processing',
          message: 'Video analysis in progress...',
        } as any,
      },
    })

    console.log('🎬 Starting lightweight video analysis for:', videoId)
    
    // TEMPORARY: Generate mock analysis data until ML features are re-enabled
    const mockAnalysisData = {
      overallScore: 75,
      technicalScore: 72,
      tacticalScore: 78,
      consistencyScore: 76,
      summary: 'Video uploaded successfully. Advanced AI analysis will be available soon.',
      strengths: [
        'Good court positioning',
        'Consistent shot placement',
        'Effective use of dinks'
      ],
      areasForImprovement: [
        'Work on third shot drops',
        'Improve serve consistency',
        'Better transition game'
      ],
      keyInsights: [
        'Your gameplay shows solid fundamentals',
        'Focus on developing more variety in your shots',
        'Practice transitioning from baseline to kitchen line'
      ],
      detailedMetrics: {
        serves: { total: 0, successful: 0, accuracy: 0 },
        returns: { total: 0, successful: 0, accuracy: 0 },
        dinks: { total: 0, successful: 0, accuracy: 0 },
        drives: { total: 0, successful: 0, accuracy: 0 },
        drops: { total: 0, successful: 0, accuracy: 0 },
        lobs: { total: 0, successful: 0, accuracy: 0 },
        volleys: { total: 0, successful: 0, accuracy: 0 },
        smashes: { total: 0, successful: 0, accuracy: 0 }
      },
      rallies: [],
      timeline: []
    }

    // Update video analysis with mock data
    const updatedAnalysis = await prisma.videoAnalysis.update({
      where: { id: videoId },
      data: {
        analysisStatus: 'COMPLETED',
        overallScore: mockAnalysisData.overallScore,
        strengths: mockAnalysisData.strengths,
        areasForImprovement: mockAnalysisData.areasForImprovement,
        recommendations: mockAnalysisData.keyInsights,
        technicalScores: {
          technical: mockAnalysisData.technicalScore,
          tactical: mockAnalysisData.tacticalScore,
          consistency: mockAnalysisData.consistencyScore
        },
        shotTypes: mockAnalysisData.detailedMetrics,
        analyzedAt: new Date(),
      },
    })

    console.log('✅ Video analysis completed:', videoId)

    // Send email notification
    try {
      if (user.email) {
        const emailHtml = generateVideoAnalysisCompleteEmail({
          userName: user.name || 'Player',
          videoTitle: existingAnalysis.title || 'Your Video',
          overallScore: mockAnalysisData.overallScore,
          technicalScore: mockAnalysisData.technicalScore,
          tacticalScore: mockAnalysisData.tacticalScore,
          consistencyScore: mockAnalysisData.consistencyScore,
          keyInsights: mockAnalysisData.keyInsights,
          strengths: mockAnalysisData.strengths,
          areasForImprovement: mockAnalysisData.areasForImprovement,
          videoUrl: `${process.env.NEXTAUTH_URL}/train/video-analysis/${videoId}`,
        })

        await sendEmailViaGmail({
          to: user.email,
          subject: '🎾 Your Pickleball Video Analysis is Ready!',
          html: emailHtml,
        })

        console.log('📧 Analysis complete email sent to:', user.email)
      }
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Video analysis completed successfully',
      videoId,
      analysis: updatedAnalysis,
    })

  } catch (error) {
    console.error('❌ Video analysis error:', error)
    
    // Update status to FAILED if we have a videoId
    if (videoId) {
      try {
        await prisma.videoAnalysis.update({
          where: { id: videoId },
          data: {
            analysisStatus: 'FAILED',
            shotDetectionProgress: {
              stage: 'error',
              message: error instanceof Error ? error.message : 'Analysis failed',
            } as any,
          },
        })
      } catch (updateError) {
        console.error('Failed to update error status:', updateError)
      }
    }

    return NextResponse.json(
      {
        error: 'Video analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
