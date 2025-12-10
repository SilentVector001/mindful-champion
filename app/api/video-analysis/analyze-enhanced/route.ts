
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes for TensorFlow processing

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
// TEMPORARY: Heavy ML imports disabled to reduce serverless function size
// import { LLMShotDetector } from '@/lib/video-analysis/llm-shot-detector'
// import { EnhancedAnalysisEngine } from '@/lib/video-analysis/enhanced-analysis-engine'
import path from 'path'

export async function POST(request: NextRequest) {
  let videoId: string | null = null;
  
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { videoId: vid, videoUrl, skillLevel = 'INTERMEDIATE', useTensorFlow = true } = body
    videoId = vid

    if (!videoId || !videoUrl) {
      return NextResponse.json(
        { error: 'Video ID and URL are required' },
        { status: 400 }
      )
    }

    console.log('📹 Enhanced video analysis request (MOCK MODE):', { videoId, videoUrl, skillLevel })

    // Check if video analysis record exists
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
          message: 'Enhanced video analysis in progress...',
        } as any,
      },
    })

    console.log('🎬 Starting lightweight enhanced video analysis for:', videoId)
    
    // TEMPORARY: Generate mock analysis data until ML features are re-enabled
    const mockAnalysisData = {
      overallScore: 78,
      technicalScore: 75,
      tacticalScore: 80,
      consistencyScore: 79,
      summary: 'Video uploaded successfully. Enhanced AI analysis with pose detection will be available soon.',
      strengths: [
        'Good court positioning and movement',
        'Consistent shot placement',
        'Effective use of dinks and drops',
        'Strong defensive positioning'
      ],
      areasForImprovement: [
        'Work on third shot drops',
        'Improve serve consistency and placement',
        'Better transition game from baseline to kitchen',
        'Develop more variety in shot selection'
      ],
      keyInsights: [
        'Your gameplay shows solid fundamentals and good court awareness',
        'Focus on developing more variety in your shots to keep opponents guessing',
        'Practice transitioning from baseline to kitchen line more smoothly',
        'Work on anticipating opponent shots for better positioning'
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
        analysisData: mockAnalysisData as any,
        overallScore: mockAnalysisData.overallScore,
        technicalScore: mockAnalysisData.technicalScore,
        tacticalScore: mockAnalysisData.tacticalScore,
        consistencyScore: mockAnalysisData.consistencyScore,
        completedAt: new Date(),
      },
    })

    console.log('✅ Enhanced video analysis completed (MOCK MODE):', videoId)

    return NextResponse.json({
      success: true,
      message: 'Enhanced video analysis completed successfully (mock mode)',
      videoId,
      analysis: updatedAnalysis,
      note: 'Full AI analysis with pose detection will be available soon'
    })

  } catch (error) {
    console.error('❌ Enhanced video analysis error:', error)
    
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
        error: 'Enhanced video analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
