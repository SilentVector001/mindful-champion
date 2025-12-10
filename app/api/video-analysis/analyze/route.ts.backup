
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes for video analysis

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { AdvancedAnalysisEngine } from '@/lib/video-analysis/advanced-analysis-engine'
import { LLMShotDetector } from '@/lib/video-analysis/llm-shot-detector'
import { downloadVideoForProcessing } from '@/lib/video-analysis/video-downloader'
import { sendEmailViaGmail } from '@/lib/email/gmail-sender'
import { generateVideoAnalysisCompleteEmail } from '@/lib/email/templates/video-analysis-complete'
import { extractSnapshotFromAnalysis } from '@/lib/email/snapshot-generator'

export async function POST(request: NextRequest) {
  let videoId: string | null = null
  let cleanup: (() => Promise<void>) | null = null
  
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

    // Initialize advanced analysis engine
    const engine = new AdvancedAnalysisEngine()

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

    // Set status to PROCESSING and initialize progress
    await prisma.videoAnalysis.update({
      where: { id: videoId },
      data: { 
        analysisStatus: 'PROCESSING',
        shotDetectionProgress: {
          stage: 'initializing',
          currentFrame: 0,
          totalFrames: 0,
          currentBatch: 0,
          totalBatches: 0,
          shotsDetected: 0,
          message: 'Starting video analysis...',
        } as any,
      },
    })

    console.log('🎬 Starting video analysis for:', videoId)
    
    // STEP 1: Run LLM-powered shot detection if video is in S3
    let detectedShots: any[] = []
    let totalFramesAnalyzed = 0
    let videoPath: string | null = null
    
    try {
      if (existingAnalysis.cloud_storage_path) {
        console.log('📥 Downloading video from S3 for shot detection...')
        
        // Download video from S3
        const downloaded = await downloadVideoForProcessing(
          videoId,
          existingAnalysis.cloud_storage_path,
          existingAnalysis.isPublic ?? false
        )
        videoPath = downloaded.localPath
        cleanup = downloaded.cleanup
        
        console.log('🎯 Running LLM-powered shot detection...')
        
        // Create progress callback
        const progressCallback = async (progress: any) => {
          try {
            await prisma.videoAnalysis.update({
              where: { id: videoId },
              data: { shotDetectionProgress: progress as any },
            })
          } catch (error) {
            console.error('Failed to update progress:', error)
          }
        }
        
        // Run shot detection
        const detector = new LLMShotDetector(videoId, progressCallback)
        const shotDetectionResult = await detector.detectShots(videoPath)
        detectedShots = shotDetectionResult.shots
        totalFramesAnalyzed = shotDetectionResult.totalFramesAnalyzed
        
        console.log(`✅ Shot detection complete: ${detectedShots.length} shots from ${totalFramesAnalyzed} frames`)
      } else {
        console.log('⚠️  No cloud_storage_path - skipping shot detection')
      }
    } catch (shotError) {
      console.error('⚠️  Shot detection failed:', shotError)
      // Update progress to show failure but continue with analysis
      await prisma.videoAnalysis.update({
        where: { id: videoId },
        data: {
          shotDetectionProgress: {
            stage: 'failed',
            currentFrame: 0,
            totalFrames: 0,
            currentBatch: 0,
            totalBatches: 0,
            shotsDetected: 0,
            message: 'Shot detection failed, using fallback analysis',
            error: shotError instanceof Error ? shotError.message : 'Unknown error',
          } as any,
        },
      })
    }
    
    // STEP 2: Run advanced analysis (provides additional metrics)
    console.log('🎯 Running advanced analysis engine...')
    const baseAnalysisResult = await engine.analyze({
      videoId,
      videoUrl,
      userId: session.user.id,
      skillLevel,
      analysisType: 'FULL',
    })
    
    // STEP 3: Merge shot detection results with advanced analysis
    let analysisResult
    if (detectedShots.length > 0) {
      console.log('📊 Merging shot detection results with analysis...')
      analysisResult = mergeAnalysisResults(baseAnalysisResult, detectedShots, totalFramesAnalyzed)
    } else {
      console.log('📊 Using base analysis results')
      analysisResult = baseAnalysisResult
    }
    
    console.log('✅ Analysis complete for:', videoId, 'Score:', analysisResult.overallScore)
    
    // Clean up downloaded video file
    if (cleanup) {
      await cleanup().catch(err => console.warn('Failed to cleanup video file:', err))
    }

    // Update existing analysis record instead of creating a new one
    const savedAnalysis = await prisma.videoAnalysis.update({
      where: { id: videoId },
      data: {
        analyzedAt: new Date(),
        analysisStatus: 'COMPLETED',
        overallScore: Math.round(analysisResult.overallScore),
        strengths: analysisResult.strengths,
        areasForImprovement: analysisResult.weaknesses,
        recommendations: analysisResult.prioritizedImprovements.map((i: any) => i.title),
        shotTypes: analysisResult.shotStatistics.byType as any,
        totalShots: analysisResult.shotStatistics.total,
        movementMetrics: analysisResult.movementMetrics as any,
        technicalScores: analysisResult.technicalMetrics as any,
        keyMoments: analysisResult.keyMoments as any,
        // Save shot detection results if available
        detectedShots: analysisResult.detectedShots || null,
        totalFramesAnalyzed: analysisResult.totalFramesAnalyzed || 0,
        posesDetected: analysisResult.posesDetected || 0,
        shotDetectionProgress: {
          stage: 'completed',
          currentFrame: analysisResult.totalFramesAnalyzed || 0,
          totalFrames: analysisResult.totalFramesAnalyzed || 0,
          currentBatch: 0,
          totalBatches: 0,
          shotsDetected: detectedShots.length,
          message: 'Analysis complete',
        } as any,
      },
    })

    // Send email notification asynchronously (don't block response)
    sendAnalysisCompleteEmail({
      user,
      analysis: savedAnalysis,
      analysisResult,
    }).catch(error => {
      console.error('Failed to send email notification:', error)
      // Don't throw error - email failure shouldn't break the analysis
    })

    return NextResponse.json({
      ...analysisResult,
      savedAnalysisId: savedAnalysis.id,
    })
  } catch (error: any) {
    console.error('Analysis error:', error)
    
    // Clean up downloaded video file if it exists
    if (cleanup) {
      await cleanup().catch(err => console.warn('Failed to cleanup video file during error:', err))
    }
    
    // Update video status to FAILED on error
    if (videoId) {
      try {
        await prisma.videoAnalysis.update({
          where: { id: videoId },
          data: { 
            analysisStatus: 'FAILED',
            shotDetectionProgress: {
              stage: 'failed',
              currentFrame: 0,
              totalFrames: 0,
              currentBatch: 0,
              totalBatches: 0,
              shotsDetected: 0,
              message: 'Analysis failed',
              error: error.message || 'Unknown error',
            } as any,
          }
        })
      } catch (updateError) {
        console.error('Failed to update video status to FAILED:', updateError)
      }
    }
    
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    )
  }
}

/**
 * Merge shot detection results with advanced analysis
 */
function mergeAnalysisResults(
  baseAnalysis: any,
  detectedShots: any[],
  totalFramesAnalyzed: number
) {
  // Calculate statistics from detected shots
  const shotTypeStats: Record<string, any> = {}
  let totalQualityScore = 0
  
  detectedShots.forEach(shot => {
    const type = shot.type
    if (!shotTypeStats[type]) {
      shotTypeStats[type] = {
        count: 0,
        totalAccuracy: 0,
        totalPower: 0,
        avgQuality: 0,
      }
    }
    shotTypeStats[type].count += 1
    shotTypeStats[type].totalAccuracy += shot.analysis?.accuracy || 70
    shotTypeStats[type].totalPower += shot.analysis?.power || 70
    shotTypeStats[type].avgQuality += shot.score || 70
    totalQualityScore += shot.score || 70
  })

  // Calculate averages
  const shotStatistics = Object.entries(shotTypeStats).map(([type, stats]: [string, any]) => ({
    type,
    count: stats.count,
    accuracy: Math.round(stats.totalAccuracy / stats.count),
    avgSpeed: 20 + Math.random() * 20,
    successRate: Math.round(stats.avgQuality / stats.count),
    powerRating: Math.round(stats.totalPower / stats.count),
  }))

  const overallScore = detectedShots.length > 0 
    ? Math.round(totalQualityScore / detectedShots.length)
    : baseAnalysis.overallScore

  // Extract key moments from detected shots
  const keyMoments = detectedShots
    .filter(shot => shot.quality === 'excellent' || shot.quality === 'needs-work')
    .slice(0, 5)
    .map(shot => {
      const mins = Math.floor(shot.time / 60)
      const secs = Math.floor(shot.time % 60)
      return {
        timestamp: Math.round(shot.time),
        timestampFormatted: `${mins}:${secs.toString().padStart(2, '0')}`,
        type: shot.quality === 'excellent' ? 'strength' : 'improvement',
        title: shot.quality === 'excellent' ? `Excellent ${shot.type}` : `Improve ${shot.type}`,
        description: shot.analysis?.technique || shot.type,
        impact: 'high',
      }
    })

  // Generate strengths and weaknesses from detected shots
  const excellentShots = detectedShots.filter(s => s.quality === 'excellent')
  const needsWorkShots = detectedShots.filter(s => s.quality === 'needs-work')
  
  const strengths = excellentShots.length > 0
    ? excellentShots.slice(0, 3).map(s => `Strong ${s.type} execution`)
    : baseAnalysis.strengths || ['Good overall technique', 'Consistent movement']
  
  const weaknesses = needsWorkShots.length > 0
    ? needsWorkShots.slice(0, 3).map(s => `Improve ${s.type} technique`)
    : baseAnalysis.weaknesses || ['Continue practicing for improvement']

  // Merge with base analysis
  return {
    ...baseAnalysis,
    overallScore,
    strengths,
    weaknesses,
    prioritizedImprovements: needsWorkShots.slice(0, 3).map((shot, idx) => ({
      title: `Improve ${shot.type}`,
      priority: idx + 1,
      description: shot.analysis?.improvements?.[0] || 'Focus on technique refinement',
    })),
    shotStatistics: {
      byType: shotStatistics,
      total: detectedShots.length
    },
    keyMoments: keyMoments.length > 0 ? keyMoments : baseAnalysis.keyMoments,
    detectedShots,
    totalFramesAnalyzed,
    posesDetected: detectedShots.length,
    coachCommentary: `Great work! I analyzed ${detectedShots.length} shots in your video with an overall score of ${overallScore}. ${
      excellentShots.length > 0 
        ? `You executed ${excellentShots.length} excellent shots! ` 
        : ''
    }${
      needsWorkShots.length > 0 
        ? `Focus on improving ${needsWorkShots.slice(0, 2).map(s => s.type.toLowerCase()).join(' and ')} for better results.`
        : 'Keep up the great work!'
    }`
  }
}

/**
 * Send analysis complete email notification
 */
async function sendAnalysisCompleteEmail({
  user,
  analysis,
  analysisResult,
}: {
  user: { id: string; name: string | null; email: string }
  analysis: any
  analysisResult: any
}) {
  try {
    // Extract snapshot data
    const snapshot = extractSnapshotFromAnalysis(analysisResult)
    
    // Get top strengths and improvements
    const topStrengths = Array.isArray(analysisResult.strengths)
      ? analysisResult.strengths.slice(0, 3)
      : []
    
    const topImprovements = analysisResult.prioritizedImprovements
      ? analysisResult.prioritizedImprovements.slice(0, 3).map((imp: any) => imp.title)
      : []
    
    // Generate video thumbnail URL (if available)
    const baseUrl = process.env.NEXTAUTH_URL || 'https://mindful-champion-2hzb4j.abacusai.app'
    const videoThumbnail = analysis.videoUrl 
      ? `${baseUrl}${analysis.videoUrl.startsWith('/') ? '' : '/'}${analysis.videoUrl}`
      : undefined
    
    // Generate email HTML
    const htmlContent = generateVideoAnalysisCompleteEmail({
      recipientName: user.name || 'Champion',
      analysisId: analysis.id,
      overallScore: Math.round(analysisResult.overallScore),
      topStrengths,
      topImprovements,
      totalShots: analysisResult.shotStatistics?.total,
      duration: analysis.duration,
      analyzedDate: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      baseUrl,
      videoThumbnail,
    })
    
    // Generate plain text version
    const textContent = `
Hi ${user.name || 'Champion'}!

Your Video Analysis is Ready! 🏓

Coach Kai has finished analyzing your pickleball game. Here's what we discovered:

OVERALL PERFORMANCE SCORE: ${Math.round(analysisResult.overallScore)}/100

TOP STRENGTHS:
${topStrengths.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

PRIORITY FOCUS AREAS:
${topImprovements.map((item: string, idx: number) => `${idx + 1}. ${item}`).join('\n')}

${analysisResult.shotStatistics?.total ? `Total Shots Analyzed: ${analysisResult.shotStatistics.total}` : ''}
${analysis.duration ? `Video Duration: ${Math.floor(analysis.duration / 60)}:${(analysis.duration % 60).toString().padStart(2, '0')}` : ''}

View your full analysis here:
${baseUrl}/train/video?analysis=${analysis.id}

Keep improving your game with Coach Kai!

© ${new Date().getFullYear()} Mindful Champion. All rights reserved.
    `.trim()
    
    // Send email via Gmail
    const result = await sendEmailViaGmail({
      userId: user.id,
      recipientEmail: user.email,
      recipientName: user.name || undefined,
      subject: '🏓 Your Video Analysis is Ready!',
      htmlContent,
      textContent,
      type: 'VIDEO_ANALYSIS_COMPLETE',
      videoAnalysisId: analysis.id,
      metadata: {
        overallScore: Math.round(analysisResult.overallScore),
        totalShots: analysisResult.shotStatistics?.total,
      },
    })
    
    if (result.success) {
      console.log('✅ Analysis complete email sent to:', user.email)
    } else {
      console.error('❌ Failed to send analysis email:', result.error)
    }
    
    return result
  } catch (error) {
    console.error('Error in sendAnalysisCompleteEmail:', error)
    throw error
  }
}
