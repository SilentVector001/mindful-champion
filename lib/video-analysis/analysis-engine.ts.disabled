import { VideoProcessor } from './video-processor'
import { PoseDetector } from './pose-detector'
import { PickleballAnalyzer } from './pickleball-analyzer'
import type { ShotDetection } from './pickleball-analyzer'

export interface VideoAnalysisInput {
  videoPath: string
  userId?: string
  skillLevel?: string
}

export interface KeyMoment {
  timestamp: number
  timestampFormatted: string
  type: 'strength' | 'improvement' | 'critical'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
}

export interface ShotTypeStats {
  type: string
  count: number
  accuracy: number
  avgSpeed: number
  successRate: number
  powerRating: number
}

export interface VideoAnalysisOutput {
  overallScore: number
  strengths: string[]
  areasForImprovement: string[]
  recommendations: string[]
  shotTypes: ShotTypeStats[]
  totalShots: number
  movementMetrics: {
    courtCoverage: number
    avgSpeed: number
    efficiency: number
    positioning: number
    anticipation: number
    footwork: number
  }
  technicalScores: {
    paddleAngle: number
    followThrough: number
    bodyRotation: number
    readyPosition: number
    gripTechnique: number
    overall: number
  }
  keyMoments: KeyMoment[]
}

export class AnalysisEngine {
  private videoProcessor: VideoProcessor
  private poseDetector: PoseDetector
  private pickleballAnalyzer: PickleballAnalyzer

  constructor() {
    this.videoProcessor = new VideoProcessor()
    this.poseDetector = new PoseDetector()
    this.pickleballAnalyzer = new PickleballAnalyzer()
  }

  /**
   * Main analysis function - processes video and returns complete analysis
   */
  async analyzeVideo(input: VideoAnalysisInput): Promise<VideoAnalysisOutput> {
    console.log('Starting video analysis...', input.videoPath)

    // Step 1: Extract frames from video (2 fps)
    console.log('Extracting frames from video...')
    const frames = await this.videoProcessor.extractFrames(input.videoPath, 2)
    console.log(`Extracted ${frames.length} frames`)

    // Step 2: Detect poses in frames
    console.log('Detecting poses in frames...')
    await this.poseDetector.initialize()
    const poses = await this.poseDetector.detectPosesInFrames(frames)
    console.log(`Detected poses in ${poses.length} frames`)

    // Step 3: Analyze pickleball-specific metrics
    console.log('Analyzing pickleball metrics...')
    const analysis = await this.pickleballAnalyzer.analyzeVideo(poses)

    // Step 4: Convert to output format
    console.log('Generating analysis output...')
    const output = this.formatOutput(analysis, input.skillLevel || 'INTERMEDIATE')

    // Step 5: Cleanup
    await this.poseDetector.dispose()

    console.log('Analysis complete!')
    return output
  }

  /**
   * Format analysis result to match expected API output
   */
  private formatOutput(
    analysis: any,
    skillLevel: string
  ): VideoAnalysisOutput {
    // Convert shot detections to shot type stats
    const shotTypes = this.aggregateShotStats(analysis.shots)

    // Generate key moments from the analysis
    const keyMoments = this.generateKeyMoments(
      analysis.shots,
      analysis.stanceAnalysis,
      analysis.technicalScores
    )

    return {
      overallScore: analysis.overallScore,
      strengths: analysis.strengths,
      areasForImprovement: analysis.areasForImprovement,
      recommendations: analysis.recommendations,
      shotTypes,
      totalShots: analysis.shots.length,
      movementMetrics: {
        courtCoverage: analysis.movementAnalysis.courtCoverage,
        avgSpeed: analysis.movementAnalysis.avgSpeed,
        efficiency: analysis.movementAnalysis.efficiency,
        positioning: analysis.movementAnalysis.positioning,
        anticipation: analysis.movementAnalysis.anticipation,
        footwork: analysis.movementAnalysis.footwork
      },
      technicalScores: analysis.technicalScores,
      keyMoments
    }
  }

  /**
   * Aggregate shot detections into stats by type
   */
  private aggregateShotStats(shots: ShotDetection[]): ShotTypeStats[] {
    const shotsByType = new Map<string, ShotDetection[]>()

    // Group shots by type
    for (const shot of shots) {
      if (!shotsByType.has(shot.type)) {
        shotsByType.set(shot.type, [])
      }
      shotsByType.get(shot.type)!.push(shot)
    }

    // Calculate stats for each type
    const stats: ShotTypeStats[] = []

    for (const [type, typeShots] of shotsByType) {
      const avgConfidence = typeShots.reduce((sum, s) => sum + s.confidence, 0) / typeShots.length
      const avgFollowThrough = typeShots.reduce((sum, s) => sum + s.followThrough, 0) / typeShots.length

      // Estimate speed based on shot type
      const speedMap: Record<string, number> = {
        serve: 45,
        forehand: 38,
        backhand: 35,
        volley: 28,
        dink: 15,
        smash: 52
      }

      // Estimate power rating based on shot type
      const powerMap: Record<string, number> = {
        serve: 75,
        forehand: 70,
        backhand: 65,
        volley: 60,
        dink: 45,
        smash: 90
      }

      stats.push({
        type,
        count: typeShots.length,
        accuracy: Math.round(avgConfidence * 100),
        avgSpeed: speedMap[type] || 30,
        successRate: Math.round(avgFollowThrough),
        powerRating: powerMap[type] || 65
      })
    }

    return stats
  }

  /**
   * Generate key moments from analysis
   */
  private generateKeyMoments(
    shots: ShotDetection[],
    stanceAnalysis: any,
    technicalScores: any
  ): KeyMoment[] {
    const moments: KeyMoment[] = []

    // Find best shots (high follow-through and confidence)
    const bestShots = shots
      .filter(s => s.followThrough >= 80 && s.confidence >= 0.8)
      .sort((a, b) => b.followThrough - a.followThrough)
      .slice(0, 3)

    for (const shot of bestShots) {
      moments.push({
        timestamp: Math.round(shot.timestamp),
        timestampFormatted: this.formatTimestamp(shot.timestamp),
        type: 'strength',
        title: `Excellent ${shot.type.charAt(0).toUpperCase() + shot.type.slice(1)}`,
        description: `Great technique and follow-through on this ${shot.type}. Your paddle angle was perfect and body rotation was strong.`,
        impact: 'high'
      })
    }

    // Find shots that need improvement
    const weakShots = shots
      .filter(s => s.followThrough < 60 || s.bodyRotation > 30)
      .slice(0, 2)

    for (const shot of weakShots) {
      moments.push({
        timestamp: Math.round(shot.timestamp),
        timestampFormatted: this.formatTimestamp(shot.timestamp),
        type: 'improvement',
        title: `${shot.type.charAt(0).toUpperCase() + shot.type.slice(1)} Technique`,
        description: shot.followThrough < 60
          ? 'Your follow-through is cutting short here. Extend through the ball for more power and consistency.'
          : 'Body rotation could be improved. Engage your core more to generate power.',
        impact: 'medium'
      })
    }

    // Add stance-related moment if needed
    if (stanceAnalysis.quality < 70) {
      const midpoint = shots.length > 0 ? shots[Math.floor(shots.length / 2)].timestamp : 60
      moments.push({
        timestamp: Math.round(midpoint),
        timestampFormatted: this.formatTimestamp(midpoint),
        type: 'critical',
        title: 'Ready Position',
        description: 'Your stance needs improvement. Keep knees bent and weight forward for better reaction time.',
        impact: 'high'
      })
    }

    // Add a technical highlight if scores are high
    if (technicalScores.overall >= 80 && moments.length < 5) {
      const timestamp = shots.length > 0 ? shots[shots.length - 1].timestamp : 120
      moments.push({
        timestamp: Math.round(timestamp),
        timestampFormatted: this.formatTimestamp(timestamp),
        type: 'strength',
        title: 'Technical Excellence',
        description: 'Outstanding overall technique throughout this sequence. Your fundamentals are strong!',
        impact: 'high'
      })
    }

    return moments.slice(0, 5) // Limit to 5 key moments
  }

  /**
   * Format timestamp as MM:SS
   */
  private formatTimestamp(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * Generate Coach Kai feedback based on analysis
   */
  async generateCoachKaiFeedback(
    analysis: VideoAnalysisOutput,
    userSkillLevel: string
  ): Promise<string> {
    // This would integrate with your OpenAI API for Coach Kai
    // For now, we'll generate a structured feedback message

    const feedback: string[] = []

    feedback.push(`Hey there! 👋 I've analyzed your video and I'm impressed!`)
    feedback.push('')
    feedback.push(`**Overall Performance: ${analysis.overallScore}/100** 🎯`)
    feedback.push('')

    // Add strengths
    if (analysis.strengths.length > 0) {
      feedback.push('**What You\'re Doing Great:**')
      analysis.strengths.forEach((strength, i) => {
        feedback.push(`${i + 1}. ${strength}`)
      })
      feedback.push('')
    }

    // Add improvements
    if (analysis.areasForImprovement.length > 0) {
      feedback.push('**Areas to Work On:**')
      analysis.areasForImprovement.forEach((improvement, i) => {
        feedback.push(`${i + 1}. ${improvement}`)
      })
      feedback.push('')
    }

    // Add recommendations
    if (analysis.recommendations.length > 0) {
      feedback.push('**My Recommendations:**')
      analysis.recommendations.slice(0, 3).forEach((rec, i) => {
        feedback.push(`${i + 1}. ${rec}`)
      })
      feedback.push('')
    }

    // Add shot breakdown
    feedback.push('**Shot Breakdown:**')
    analysis.shotTypes.forEach(shot => {
      feedback.push(`- ${shot.type}: ${shot.count} shots (${shot.accuracy}% accuracy)`)
    })
    feedback.push('')

    feedback.push('Keep up the great work! 💪 Let\'s focus on those areas for improvement and you\'ll see rapid progress!')

    return feedback.join('\n')
  }
}
