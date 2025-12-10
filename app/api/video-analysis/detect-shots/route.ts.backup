export const dynamic = "force-dynamic";
export const maxDuration = 300;

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { LLMShotDetector } from '@/lib/video-analysis/llm-shot-detector';
import path from 'path';
import fs from 'fs';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { videoId, videoUrl } = body;

    if (!videoId || !videoUrl) {
      return NextResponse.json(
        { error: 'Video ID and URL are required' },
        { status: 400 }
      );
    }

    console.log('🎯 Starting shot detection...');
    console.log('   Video ID:', videoId);
    console.log('   Video URL:', videoUrl);

    // Verify video exists
    const video = await prisma.videoAnalysis.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    let videoPath: string;
    let isTemporaryFile = false;

    // Check if videoUrl is an S3 URL or local path
    if (videoUrl.startsWith('http')) {
      // S3 URL - download temporarily
      console.log('   Downloading video from S3...');
      const tempDir = path.join(process.cwd(), 'tmp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const tempFilePath = path.join(tempDir, `temp_${videoId}_${Date.now()}.mp4`);
      
      // Download video
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(tempFilePath, Buffer.from(buffer));
      
      videoPath = tempFilePath;
      isTemporaryFile = true;
      console.log('   Video downloaded to:', videoPath);
    } else {
      // Local path
      videoPath = path.join(process.cwd(), 'public', videoUrl);
      console.log('   Local video path:', videoPath);
    }

    // Update status to PROCESSING
    await prisma.videoAnalysis.update({
      where: { id: videoId },
      data: {
        analysisStatus: 'PROCESSING',
        shotDetectionProgress: {
          stage: 'extracting',
          currentFrame: 0,
          totalFrames: 0,
          currentBatch: 0,
          totalBatches: 0,
          shotsDetected: 0,
          message: 'Starting shot detection...',
        } as any,
      },
    });

    try {
      // Initialize shot detector
      const detector = new LLMShotDetector();

      // Detect shots
      const result = await detector.detectShots(videoPath);

      console.log(`✅ Shot detection complete: ${result.shots.length} shots detected`);

      // Store detected shots in database
      await prisma.videoAnalysis.update({
        where: { id: videoId },
        data: {
          detectedShots: result.shots as any,
          totalFramesAnalyzed: result.totalFramesAnalyzed,
          analysisStatus: 'COMPLETED',
          shotDetectionProgress: {
            stage: 'completed',
            currentFrame: result.totalFramesAnalyzed,
            totalFrames: result.totalFramesAnalyzed,
            currentBatch: 1,
            totalBatches: 1,
            shotsDetected: result.shots.length,
            message: `Successfully detected ${result.shots.length} shots`,
          } as any,
        },
      });

      // Send completion email
      try {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { email: true, firstName: true, name: true },
        });

        if (user?.email) {
          await sendEmail({
            to: user.email,
            subject: '🏓 Your Video Analysis is Ready!',
            text: `Hi ${user.firstName || user.name || 'there'},\n\nGreat news! Your video analysis is now complete. Our AI has analyzed your gameplay and detected ${result.shots.length} shots for detailed breakdown.\n\nAnalysis Summary:\n- Total Shots Detected: ${result.shots.length}\n- Frames Analyzed: ${result.totalFramesAnalyzed}\n- Status: Ready to View\n\nView Your Analysis: ${process.env.NEXTAUTH_URL}/train/analysis/${videoId}\n\nReady to improve your game? Check out your detailed shot-by-shot breakdown now!`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">✨ Analysis Complete!</h1>
                </div>
                
                <div style="background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px; color: #2d3748; margin-bottom: 20px;">
                    Hi ${user.firstName || user.name || 'there'},
                  </p>
                  
                  <p style="font-size: 16px; color: #2d3748; margin-bottom: 20px;">
                    Great news! Your video analysis is now complete. Our AI has analyzed your gameplay and detected 
                    <strong style="color: #667eea;">${result.shots.length} shots</strong> for detailed breakdown.
                  </p>
                  
                  <div style="background: white; border-left: 4px solid #48bb78; padding: 20px; margin: 25px 0; border-radius: 5px;">
                    <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px;">📊 Analysis Summary</h3>
                    <ul style="color: #4a5568; margin: 0; padding-left: 20px;">
                      <li>Total Shots Detected: <strong>${result.shots.length}</strong></li>
                      <li>Frames Analyzed: <strong>${result.totalFramesAnalyzed}</strong></li>
                      <li>Status: <strong style="color: #48bb78;">Ready to View</strong></li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXTAUTH_URL}/train/analysis/${videoId}" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                              color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; 
                              font-weight: bold; font-size: 16px;">
                      View Your Analysis
                    </a>
                  </div>
                  
                  <p style="font-size: 14px; color: #718096; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    Ready to improve your game? Check out your detailed shot-by-shot breakdown now!
                  </p>
                </div>
              </div>
            `,
          });
          console.log('✉️ Completion email sent to:', user.email);
        }
      } catch (emailError) {
        console.error('Failed to send completion email:', emailError);
        // Don't fail the request if email fails
      }

      return NextResponse.json({
        success: true,
        shots: result.shots,
        totalFramesAnalyzed: result.totalFramesAnalyzed,
        detectionConfidence: result.detectionConfidence,
      });
    } finally {
      // Clean up temporary file
      if (isTemporaryFile && fs.existsSync(videoPath)) {
        try {
          fs.unlinkSync(videoPath);
          console.log('   Cleaned up temporary file:', videoPath);
        } catch (cleanupError) {
          console.error('Failed to clean up temporary file:', cleanupError);
        }
      }
    }
  } catch (error: any) {
    console.error('❌ Shot detection error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Shot detection failed',
        details: error instanceof Error ? error.stack : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
