/**
 * LLM-powered Shot Detection System
 * Uses vision-capable LLM to analyze video frames and identify shot types
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Get ffmpeg paths dynamically (prevents bundling issues)
 */
function getFfmpegPaths(): { ffmpegPath: string; ffprobePath: string } {
  try {
    // Try to dynamically load ffmpeg from npm package
    // This must be done at runtime to avoid Next.js bundling issues
    const ffmpegInstaller = eval('require')('@ffmpeg-installer/ffmpeg');
    const ffmpegPath = ffmpegInstaller.path;
    const ffprobePath = ffmpegPath.replace(/ffmpeg$/, 'ffprobe');
    return { ffmpegPath, ffprobePath };
  } catch (error) {
    // Fallback to system ffmpeg if package not available
    console.warn('⚠️  @ffmpeg-installer/ffmpeg not found, using system ffmpeg');
    return { ffmpegPath: 'ffmpeg', ffprobePath: 'ffprobe' };
  }
}

export interface DetectedShot {
  id: number;
  time: number;
  type: string;
  quality: 'excellent' | 'good' | 'needs-work';
  score: number;
  frameIndex: number;
  analysis: {
    technique: string;
    power: number;
    accuracy: number;
    timing: number;
    positioning: number;
    notes: string[];
    improvements: string[];
  };
  courtPosition?: {
    courtZone: 'baseline' | 'transition-zone' | 'kitchen-line' | 'mid-court';
    positionQuality: number;
    courtCoverage: number;
    balanceAndStance: number;
  };
  shotSelection?: {
    shotPurpose: string;
    wasItOptimal: boolean;
    betterAlternative: string | null;
    tacticalReasoning: string;
  };
  decisionMaking?: {
    situationReading: number;
    anticipation: number;
    riskAssessment: 'too-aggressive' | 'perfect' | 'too-conservative';
    gameAwareness: number;
  };
  tacticalFeedback?: {
    strengths: string[];
    improvements: string[];
    coachKaiTip: string;
  };
  positioningImprovements?: {
    currentPositionIssues: string | null;
    optimalPosition: string;
    recoveryPath: string;
    footworkNotes: string;
  };
}

export interface ShotDetectionResult {
  shots: DetectedShot[];
  totalFramesAnalyzed: number;
  detectionConfidence: number;
}

export class LLMShotDetector {
  private readonly apiKey: string;
  private readonly model: string = 'gpt-4o';
  private videoId?: string;
  private progressCallback?: (progress: any) => Promise<void>;

  constructor(videoId?: string, progressCallback?: (progress: any) => Promise<void>) {
    this.apiKey = process.env.ABACUSAI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('ABACUSAI_API_KEY not configured');
    }
    this.videoId = videoId;
    this.progressCallback = progressCallback;
  }

  /**
   * Update progress tracking
   */
  private async updateProgress(progress: any) {
    if (this.progressCallback) {
      await this.progressCallback(progress);
    }
  }

  /**
   * Main entry point: Analyze video and detect shots
   */
  async detectShots(videoPath: string): Promise<ShotDetectionResult> {
    console.log('🎬 Starting LLM-powered shot detection...');
    console.log('📹 Video path:', videoPath);

    try {
      // Step 1: Extract frames from video at strategic intervals
      await this.updateProgress({
        stage: 'extracting',
        currentFrame: 0,
        totalFrames: 0,
        currentBatch: 0,
        totalBatches: 0,
        shotsDetected: 0,
        message: 'Extracting key frames from video...',
      });

      const frames = await this.extractKeyFrames(videoPath);
      console.log(`✅ Extracted ${frames.length} key frames for analysis`);

      const totalBatches = Math.ceil(frames.length / 4);

      await this.updateProgress({
        stage: 'analyzing',
        currentFrame: 0,
        totalFrames: frames.length,
        currentBatch: 0,
        totalBatches,
        shotsDetected: 0,
        message: `Analyzing ${frames.length} frames with AI vision...`,
      });

      // Step 2: Analyze frames in batches using LLM vision
      const shots = await this.analyzFramesWithLLM(frames, videoPath);
      console.log(`✅ Detected ${shots.length} shots`);

      // Step 3: Calculate confidence
      const avgConfidence = shots.length > 0
        ? shots.reduce((sum, s) => sum + s.score, 0) / shots.length
        : 0;

      await this.updateProgress({
        stage: 'completed',
        currentFrame: frames.length,
        totalFrames: frames.length,
        currentBatch: totalBatches,
        totalBatches,
        shotsDetected: shots.length,
        message: `Analysis complete! Detected ${shots.length} shots.`,
      });

      return {
        shots,
        totalFramesAnalyzed: frames.length,
        detectionConfidence: avgConfidence,
      };
    } catch (error: any) {
      await this.updateProgress({
        stage: 'failed',
        currentFrame: 0,
        totalFrames: 0,
        currentBatch: 0,
        totalBatches: 0,
        shotsDetected: 0,
        message: 'Shot detection failed',
        error: error?.message || 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Extract key frames from video at regular intervals
   */
  private async extractKeyFrames(videoPath: string): Promise<Array<{ path: string; timestamp: number; frameIndex: number }>> {
    const tempDir = path.join(path.dirname(videoPath), 'temp_frames');
    
    // Create temp directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    try {
      // Get ffmpeg paths dynamically
      const { ffmpegPath, ffprobePath } = getFfmpegPaths();
      
      // Get video duration
      const durationCmd = `"${ffprobePath}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
      const { stdout: durationStr } = await execAsync(durationCmd);
      const duration = parseFloat(durationStr?.trim() || '60');

      console.log(`📊 Video duration: ${duration.toFixed(2)}s`);

      // Extract frames every 3-5 seconds (adaptive based on duration)
      // For shorter videos, sample more frequently to catch all shots
      const interval = duration < 20 ? 2 : duration < 40 ? 3 : duration < 90 ? 4 : 5;
      const frameCount = Math.min(Math.floor(duration / interval), 25); // Max 25 frames
      
      console.log(`🎯 Extracting ${frameCount} frames at ${interval}s intervals`);

      const frames: Array<{ path: string; timestamp: number; frameIndex: number }> = [];

      for (let i = 0; i < frameCount; i++) {
        const timestamp = (i + 1) * interval;
        if (timestamp > duration) break;

        const framePath = path.join(tempDir, `frame_${i}.jpg`);
        
        // Extract single frame at specific timestamp
        const cmd = `"${ffmpegPath}" -ss ${timestamp} -i "${videoPath}" -vframes 1 -q:v 2 "${framePath}" -y 2>&1`;
        
        try {
          await execAsync(cmd);
          
          if (fs.existsSync(framePath)) {
            frames.push({
              path: framePath,
              timestamp,
              frameIndex: i,
            });
          }
        } catch (error) {
          console.warn(`⚠️  Failed to extract frame at ${timestamp}s:`, error);
        }
      }

      return frames;
    } catch (error) {
      console.error('❌ Frame extraction failed:', error);
      throw error;
    }
  }

  /**
   * Analyze frames using LLM vision to detect shots
   */
  private async analyzFramesWithLLM(
    frames: Array<{ path: string; timestamp: number; frameIndex: number }>,
    videoPath: string
  ): Promise<DetectedShot[]> {
    console.log('🤖 Analyzing frames with LLM vision...');

    const shots: DetectedShot[] = [];
    let shotId = 1;

    // Process frames in batches of 4 for efficiency
    const batchSize = 4;
    const totalBatches = Math.ceil(frames.length / batchSize);

    for (let i = 0; i < frames.length; i += batchSize) {
      const batch = frames.slice(i, i + batchSize);
      const currentBatch = Math.floor(i / batchSize) + 1;
      
      try {
        // Report progress before processing batch
        await this.updateProgress({
          stage: 'analyzing',
          currentFrame: i,
          totalFrames: frames.length,
          currentBatch,
          totalBatches,
          shotsDetected: shots.length,
          message: `Analyzing batch ${currentBatch} of ${totalBatches}...`,
        });

        const batchShots = await this.analyzeBatch(batch, shotId);
        shots.push(...batchShots);
        shotId += batchShots.length;

        // Report progress after processing batch
        await this.updateProgress({
          stage: 'analyzing',
          currentFrame: Math.min(i + batchSize, frames.length),
          totalFrames: frames.length,
          currentBatch,
          totalBatches,
          shotsDetected: shots.length,
          message: `Completed batch ${currentBatch} of ${totalBatches} - ${shots.length} shots detected`,
        });
      } catch (error) {
        console.error(`❌ Batch ${currentBatch} analysis failed:`, error);
      }
    }

    // Processing stage
    await this.updateProgress({
      stage: 'processing',
      currentFrame: frames.length,
      totalFrames: frames.length,
      currentBatch: totalBatches,
      totalBatches,
      shotsDetected: shots.length,
      message: 'Finalizing analysis results...',
    });

    // Clean up temp frames
    const tempDir = path.dirname(frames[0]?.path || '');
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (error) {
        console.warn('⚠️  Failed to clean up temp frames:', error);
      }
    }

    return shots;
  }

  /**
   * Analyze a batch of frames with LLM
   */
  private async analyzeBatch(
    frames: Array<{ path: string; timestamp: number; frameIndex: number }>,
    startId: number
  ): Promise<DetectedShot[]> {
    // Convert frames to base64
    const frameData = frames.map(f => ({
      timestamp: f.timestamp,
      frameIndex: f.frameIndex,
      base64: fs.readFileSync(f.path).toString('base64'),
    }));

    // Build messages for LLM with enhanced intelligence
    const content: any[] = [
      {
        type: 'text',
        text: `You are Coach Kai, an elite pickleball coach with deep expertise in tactical decision-making and court positioning. Analyze these ${frames.length} frames from a pickleball video with comprehensive intelligence.

For EACH frame showing a shot being executed, provide:

1. **SHOT TYPE** - Be VERY specific and accurate:
   - Serve (underhand from baseline)
   - Return of Serve (first shot after serve)
   - Forehand Drive (powerful groundstroke, usually from mid-court)
   - Backhand Drive (powerful backhand groundstroke)
   - Forehand Volley (hit before bounce, usually at net)
   - Backhand Volley (backhand hit before bounce)
   - Dink (soft shot from kitchen line, lands in opponent's kitchen)
   - Third Shot Drop (soft shot after serve-return, aimed to land in kitchen)
   - Overhead Smash (aggressive overhead shot)
   - Lob (high arcing shot over opponents)
   - Block (defensive volley at net)
   - Reset (soft defensive shot to slow down pace)

2. **COURT POSITION ANALYSIS** - Critical for understanding decision-making:
   - courtZone: "baseline" | "transition-zone" | "kitchen-line" | "mid-court"
   - positionQuality: How well positioned for this shot (0-100)
   - courtCoverage: How much court they're covering (0-100)
   - balanceAndStance: Are they balanced and in ready position? (0-100)

3. **SHOT SELECTION INTELLIGENCE** - WHY did they choose this shot?
   - shotPurpose: What were they trying to accomplish? (e.g., "Force opponent back", "Change pace", "Attack weakness", "Defend position")
   - wasItOptimal: true/false - Was this the best shot choice for the situation?
   - betterAlternative: If not optimal, what shot would have been better? (e.g., "Third shot drop would have been safer", "Crosscourt dink to move opponent")
   - tacticalReasoning: 2-3 sentences explaining the strategic thinking

4. **DECISION-MAKING ANALYSIS** - The "WHY" not just "WHAT":
   - situationReading: How well did they read the game situation? (0-100)
   - anticipation: Did they anticipate opponent's response? (0-100)
   - riskAssessment: Was the risk level appropriate? ("too-aggressive" | "perfect" | "too-conservative")
   - gameAwareness: Understanding of score, momentum, opponent positioning (0-100)

5. **TECHNICAL EXECUTION QUALITY**:
   - quality: "excellent" (90-100) | "good" (70-89) | "needs-work" (0-69)
   - score: Overall shot score (0-100)
   - power: Force/speed in the shot (0-100)
   - accuracy: Paddle face control and target precision (0-100)
   - timing: Contact point and shot timing (0-100)
   - positioning: Body position quality (0-100)

6. **TACTICAL FEEDBACK** - Strategic insights:
   - strengths: 2-3 positive tactical observations (e.g., "Perfect use of depth to control rally", "Smart shot selection under pressure")
   - improvements: 2-3 specific tactical improvements (e.g., "Consider attacking middle more often", "Set up points with better court positioning")
   - coachKaiTip: 1 sentence of wisdom from Coach Kai about decision-making

7. **POSITIONING IMPROVEMENTS**:
   - currentPositionIssues: What's wrong with current position? (if anything)
   - optimalPosition: Where should they be standing?
   - recoveryPath: How to get to better position after this shot?
   - footworkNotes: Specific footwork adjustments needed

CRITICAL ANALYSIS RULES:
- ONLY identify frames showing ACTUAL SHOTS being hit
- Skip: ready position, transitioning, walking, waiting between points
- Focus on BOTH technique AND tactical intelligence
- Always explain WHY a shot was or wasn't optimal
- Consider opponent positioning when evaluating shot selection
- Think about point strategy, not just individual shots
- Provide actionable improvements with clear reasoning

Respond in JSON format:
{
  "frames": [
    {
      "timestamp": <number>,
      "frameIndex": <number>,
      "shotType": "<shot type>",
      "courtPosition": {
        "courtZone": "baseline|transition-zone|kitchen-line|mid-court",
        "positionQuality": <0-100>,
        "courtCoverage": <0-100>,
        "balanceAndStance": <0-100>
      },
      "shotSelection": {
        "shotPurpose": "<purpose>",
        "wasItOptimal": <true|false>,
        "betterAlternative": "<alternative shot or null>",
        "tacticalReasoning": "<2-3 sentence explanation>"
      },
      "decisionMaking": {
        "situationReading": <0-100>,
        "anticipation": <0-100>,
        "riskAssessment": "too-aggressive|perfect|too-conservative",
        "gameAwareness": <0-100>
      },
      "quality": "excellent|good|needs-work",
      "score": <0-100>,
      "technique": "<brief technique description>",
      "power": <0-100>,
      "accuracy": <0-100>,
      "timing": <0-100>,
      "positioning": <0-100>,
      "tacticalFeedback": {
        "strengths": ["strength1", "strength2"],
        "improvements": ["improvement1", "improvement2"],
        "coachKaiTip": "<wisdom from Coach Kai>"
      },
      "positioningImprovements": {
        "currentPositionIssues": "<issues or null>",
        "optimalPosition": "<where to be>",
        "recoveryPath": "<how to recover>",
        "footworkNotes": "<footwork adjustments>"
      },
      "notes": ["note1", "note2"],
      "improvements": ["improvement1", "improvement2"]
    }
  ]
}

Respond with raw JSON only. No markdown, no code blocks.`,
      },
    ];

    // Add each frame as an image
    frameData.forEach((frame, idx) => {
      content.push({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${frame.base64}`,
        },
      });
      content.push({
        type: 'text',
        text: `Frame ${idx + 1}: Timestamp ${frame.timestamp.toFixed(1)}s`,
      });
    });

    // Call LLM API
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'user',
            content,
          },
        ],
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content;

    if (!resultText) {
      throw new Error('No response from LLM');
    }

    // Parse JSON response
    let result: any;
    try {
      result = JSON.parse(resultText);
    } catch (error) {
      console.error('Failed to parse LLM response:', resultText);
      throw new Error('Invalid JSON response from LLM');
    }

    // Convert to DetectedShot format
    const shots: DetectedShot[] = [];
    const frameResults = result.frames || [];

    frameResults.forEach((frame: any, idx: number) => {
      // Filter out non-shot frames
      const shotType = frame.shotType || 'Unknown';
      if (
        shotType.toLowerCase().includes('ready') ||
        shotType.toLowerCase().includes('transition') ||
        shotType.toLowerCase().includes('waiting') ||
        shotType.toLowerCase().includes('none')
      ) {
        return; // Skip non-action frames
      }

      shots.push({
        id: startId + idx,
        time: frame.timestamp || frameData[idx]?.timestamp || 0,
        type: shotType,
        quality: this.normalizeQuality(frame.quality),
        score: Math.min(100, Math.max(0, frame.score || 70)),
        frameIndex: frame.frameIndex || frameData[idx]?.frameIndex || 0,
        analysis: {
          technique: frame.technique || 'Shot executed',
          power: Math.min(100, Math.max(0, frame.power || 70)),
          accuracy: Math.min(100, Math.max(0, frame.accuracy || 70)),
          timing: Math.min(100, Math.max(0, frame.timing || 70)),
          positioning: Math.min(100, Math.max(0, frame.positioning || 70)),
          notes: Array.isArray(frame.notes) ? frame.notes : [],
          improvements: Array.isArray(frame.improvements) ? frame.improvements : [],
        },
        courtPosition: frame.courtPosition ? {
          courtZone: frame.courtPosition.courtZone || 'mid-court',
          positionQuality: Math.min(100, Math.max(0, frame.courtPosition.positionQuality || 70)),
          courtCoverage: Math.min(100, Math.max(0, frame.courtPosition.courtCoverage || 70)),
          balanceAndStance: Math.min(100, Math.max(0, frame.courtPosition.balanceAndStance || 70)),
        } : undefined,
        shotSelection: frame.shotSelection ? {
          shotPurpose: frame.shotSelection.shotPurpose || 'Execute shot',
          wasItOptimal: frame.shotSelection.wasItOptimal !== false,
          betterAlternative: frame.shotSelection.betterAlternative || null,
          tacticalReasoning: frame.shotSelection.tacticalReasoning || 'Good shot choice for the situation',
        } : undefined,
        decisionMaking: frame.decisionMaking ? {
          situationReading: Math.min(100, Math.max(0, frame.decisionMaking.situationReading || 75)),
          anticipation: Math.min(100, Math.max(0, frame.decisionMaking.anticipation || 75)),
          riskAssessment: frame.decisionMaking.riskAssessment || 'perfect',
          gameAwareness: Math.min(100, Math.max(0, frame.decisionMaking.gameAwareness || 75)),
        } : undefined,
        tacticalFeedback: frame.tacticalFeedback ? {
          strengths: Array.isArray(frame.tacticalFeedback.strengths) ? frame.tacticalFeedback.strengths : [],
          improvements: Array.isArray(frame.tacticalFeedback.improvements) ? frame.tacticalFeedback.improvements : [],
          coachKaiTip: frame.tacticalFeedback.coachKaiTip || 'Keep practicing and focus on the fundamentals',
        } : undefined,
        positioningImprovements: frame.positioningImprovements ? {
          currentPositionIssues: frame.positioningImprovements.currentPositionIssues || null,
          optimalPosition: frame.positioningImprovements.optimalPosition || 'Maintain balanced ready position',
          recoveryPath: frame.positioningImprovements.recoveryPath || 'Split step and reset to center',
          footworkNotes: frame.positioningImprovements.footworkNotes || 'Stay light on your feet',
        } : undefined,
      });
    });

    return shots;
  }

  /**
   * Normalize quality string
   */
  private normalizeQuality(quality: string): 'excellent' | 'good' | 'needs-work' {
    const q = (quality || 'good').toLowerCase();
    if (q.includes('excellent') || q.includes('great')) return 'excellent';
    if (q.includes('needs') || q.includes('poor') || q.includes('weak')) return 'needs-work';
    return 'good';
  }
}
