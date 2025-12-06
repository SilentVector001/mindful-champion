import type { PoseData, BodyAngles, PoseKeypoint } from './pose-detector'
import { PoseDetector } from './pose-detector'

export interface ShotDetection {
  type: 'serve' | 'forehand' | 'backhand' | 'volley' | 'dink' | 'smash'
  timestamp: number
  frameNumber: number
  confidence: number
  handSide: 'left' | 'right'
  paddleAngle?: number
  followThrough: number
  bodyRotation: number
}

export interface StanceAnalysis {
  quality: number // 0-100
  balance: number // 0-100
  readyPosition: number // 0-100
  weightDistribution: 'forward' | 'backward' | 'balanced'
  kneeFlexion: number // degrees
  torsoAlignment: number // degrees from vertical
}

export interface MovementAnalysis {
  courtCoverage: number // 0-100
  avgSpeed: number // units per second
  efficiency: number // 0-100
  positioning: number // 0-100
  anticipation: number // 0-100
  footwork: number // 0-100
}

export interface TechnicalScores {
  paddleAngle: number
  followThrough: number
  bodyRotation: number
  readyPosition: number
  gripTechnique: number
  overall: number
}

export interface PickleballAnalysisResult {
  shots: ShotDetection[]
  stanceAnalysis: StanceAnalysis
  movementAnalysis: MovementAnalysis
  technicalScores: TechnicalScores
  overallScore: number
  strengths: string[]
  areasForImprovement: string[]
  recommendations: string[]
}

export class PickleballAnalyzer {
  private poseDetector: PoseDetector

  constructor() {
    this.poseDetector = new PoseDetector()
  }

  /**
   * Analyze a video for pickleball-specific metrics
   */
  async analyzeVideo(poses: PoseData[]): Promise<PickleballAnalysisResult> {
    // Detect shots
    const shots = this.detectShots(poses)

    // Analyze stance
    const stanceAnalysis = this.analyzeStance(poses)

    // Analyze movement
    const movementAnalysis = this.analyzeMovement(poses)

    // Calculate technical scores
    const technicalScores = this.calculateTechnicalScores(poses, shots)

    // Calculate overall score
    const overallScore = this.calculateOverallScore(
      stanceAnalysis,
      movementAnalysis,
      technicalScores
    )

    // Generate insights
    const strengths = this.identifyStrengths(
      shots,
      stanceAnalysis,
      movementAnalysis,
      technicalScores
    )

    const areasForImprovement = this.identifyImprovements(
      shots,
      stanceAnalysis,
      movementAnalysis,
      technicalScores
    )

    const recommendations = this.generateRecommendations(areasForImprovement)

    return {
      shots,
      stanceAnalysis,
      movementAnalysis,
      technicalScores,
      overallScore,
      strengths,
      areasForImprovement,
      recommendations
    }
  }

  /**
   * Detect shots in the video
   */
  private detectShots(poses: PoseData[]): ShotDetection[] {
    const shots: ShotDetection[] = []

    for (let i = 1; i < poses.length; i++) {
      const currentPose = poses[i]
      const previousPose = poses[i - 1]

      const angles = this.poseDetector.calculateBodyAngles(currentPose)
      const prevAngles = this.poseDetector.calculateBodyAngles(previousPose)

      // Detect arm swing motion (indicates a shot)
      const rightArmMotion = Math.abs(angles.rightElbow - prevAngles.rightElbow) +
                             Math.abs(angles.rightShoulder - prevAngles.rightShoulder)
      const leftArmMotion = Math.abs(angles.leftElbow - prevAngles.leftElbow) +
                            Math.abs(angles.leftShoulder - prevAngles.leftShoulder)

      const threshold = 20 // degrees of motion to consider a shot

      if (rightArmMotion > threshold || leftArmMotion > threshold) {
        const handSide = rightArmMotion > leftArmMotion ? 'right' : 'left'
        const shotType = this.classifyShot(currentPose, previousPose, handSide)

        shots.push({
          type: shotType,
          timestamp: currentPose.timestamp,
          frameNumber: currentPose.frameNumber,
          confidence: Math.min(currentPose.score, previousPose.score),
          handSide,
          paddleAngle: handSide === 'right' ? angles.rightElbow : angles.leftElbow,
          followThrough: this.calculateFollowThrough(angles, handSide),
          bodyRotation: angles.torsoLean
        })

        // Skip next few poses to avoid detecting same shot multiple times
        i += 5
      }
    }

    return shots
  }

  /**
   * Classify the type of shot
   */
  private classifyShot(
    currentPose: PoseData,
    previousPose: PoseData,
    handSide: 'left' | 'right'
  ): ShotDetection['type'] {
    const angles = this.poseDetector.calculateBodyAngles(currentPose)
    
    // Get wrist and elbow positions
    const wrist = currentPose.keypoints.find(kp => 
      kp.name.toLowerCase().includes(handSide) && kp.name.toLowerCase().includes('wrist')
    )
    const elbow = currentPose.keypoints.find(kp =>
      kp.name.toLowerCase().includes(handSide) && kp.name.toLowerCase().includes('elbow')
    )
    const shoulder = currentPose.keypoints.find(kp =>
      kp.name.toLowerCase().includes(handSide) && kp.name.toLowerCase().includes('shoulder')
    )

    if (!wrist || !elbow || !shoulder) return 'forehand' // default

    const elbowAngle = handSide === 'right' ? angles.rightElbow : angles.leftElbow
    const wristHeight = wrist.y
    const elbowHeight = elbow.y
    const shoulderHeight = shoulder.y

    // Classification logic
    if (wristHeight < shoulderHeight - 50) {
      // High shot
      return 'smash'
    } else if (wristHeight > elbowHeight + 30 && elbowAngle < 120) {
      // Low, soft shot
      return 'dink'
    } else if (wristHeight > shoulderHeight && elbowAngle < 100) {
      // Net shot
      return 'volley'
    } else if (shoulderHeight - 20 < wristHeight && wristHeight < shoulderHeight + 20) {
      // Mid-height groundstroke
      return Math.random() > 0.5 ? 'forehand' : 'backhand'
    } else {
      // Serve (high backswing)
      return 'serve'
    }
  }

  /**
   * Calculate follow-through quality
   */
  private calculateFollowThrough(angles: BodyAngles, handSide: 'left' | 'right'): number {
    const elbowAngle = handSide === 'right' ? angles.rightElbow : angles.leftElbow
    const shoulderAngle = handSide === 'right' ? angles.rightShoulder : angles.leftShoulder

    // Good follow-through: elbow extends (angle > 150°), shoulder rotates
    const elbowExtension = Math.max(0, Math.min(100, (elbowAngle - 90) / 90 * 100))
    const shoulderRotation = Math.max(0, Math.min(100, shoulderAngle / 90 * 100))

    return (elbowExtension + shoulderRotation) / 2
  }

  /**
   * Analyze stance quality across all frames
   */
  private analyzeStance(poses: PoseData[]): StanceAnalysis {
    let totalQuality = 0
    let totalBalance = 0
    let totalReadyPosition = 0
    let forwardWeight = 0
    let backwardWeight = 0
    let balancedWeight = 0
    let totalKneeFlexion = 0
    let totalTorsoAlignment = 0
    let validPoses = 0

    for (const pose of poses) {
      if (!this.poseDetector.isPoseValid(pose)) continue

      const angles = this.poseDetector.calculateBodyAngles(pose)
      
      // Analyze knee flexion (athletic stance)
      const avgKneeAngle = (angles.leftKnee + angles.rightKnee) / 2
      const kneeFlexionScore = this.scoreKneeFlexion(avgKneeAngle)
      totalKneeFlexion += avgKneeAngle
      
      // Analyze balance
      const balanceScore = this.scoreBalance(pose)
      totalBalance += balanceScore

      // Analyze ready position
      const readyPosScore = this.scoreReadyPosition(pose, angles)
      totalReadyPosition += readyPosScore

      // Analyze weight distribution
      const weightDist = this.analyzeWeightDistribution(pose)
      if (weightDist === 'forward') forwardWeight++
      else if (weightDist === 'backward') backwardWeight++
      else balancedWeight++

      totalTorsoAlignment += angles.torsoLean
      totalQuality += (kneeFlexionScore + balanceScore + readyPosScore) / 3

      validPoses++
    }

    const avgQuality = totalQuality / validPoses
    const avgBalance = totalBalance / validPoses
    const avgReadyPosition = totalReadyPosition / validPoses
    const avgKneeFlexion = totalKneeFlexion / validPoses
    const avgTorsoAlignment = totalTorsoAlignment / validPoses

    // Determine dominant weight distribution
    let weightDistribution: StanceAnalysis['weightDistribution'] = 'balanced'
    if (forwardWeight > backwardWeight && forwardWeight > balancedWeight) {
      weightDistribution = 'forward'
    } else if (backwardWeight > forwardWeight && backwardWeight > balancedWeight) {
      weightDistribution = 'backward'
    }

    return {
      quality: Math.round(avgQuality),
      balance: Math.round(avgBalance),
      readyPosition: Math.round(avgReadyPosition),
      weightDistribution,
      kneeFlexion: Math.round(avgKneeFlexion),
      torsoAlignment: Math.round(avgTorsoAlignment)
    }
  }

  /**
   * Score knee flexion (athletic stance should be 120-140 degrees)
   */
  private scoreKneeFlexion(kneeAngle: number): number {
    const ideal = 130
    const tolerance = 20
    const deviation = Math.abs(kneeAngle - ideal)

    if (deviation <= tolerance) {
      return 100 - (deviation / tolerance) * 30
    } else {
      return Math.max(0, 70 - (deviation - tolerance))
    }
  }

  /**
   * Score balance based on hip and shoulder alignment
   */
  private scoreBalance(pose: PoseData): number {
    const leftShoulder = pose.keypoints.find(kp => kp.name.toLowerCase().includes('left_shoulder'))
    const rightShoulder = pose.keypoints.find(kp => kp.name.toLowerCase().includes('right_shoulder'))
    const leftHip = pose.keypoints.find(kp => kp.name.toLowerCase().includes('left_hip'))
    const rightHip = pose.keypoints.find(kp => kp.name.toLowerCase().includes('right_hip'))

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return 50

    // Check if shoulders and hips are level
    const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y)
    const hipDiff = Math.abs(leftHip.y - rightHip.y)
    const maxDiff = 20 // pixels

    const shoulderScore = Math.max(0, 100 - (shoulderDiff / maxDiff) * 100)
    const hipScore = Math.max(0, 100 - (hipDiff / maxDiff) * 100)

    return (shoulderScore + hipScore) / 2
  }

  /**
   * Score ready position
   */
  private scoreReadyPosition(pose: PoseData, angles: BodyAngles): number {
    // Ready position: knees bent, hands up, balanced stance
    const kneeBentScore = this.scoreKneeFlexion((angles.leftKnee + angles.rightKnee) / 2)
    const balanceScore = this.scoreBalance(pose)
    
    // Check hands are up (above waist)
    const leftWrist = pose.keypoints.find(kp => kp.name.toLowerCase().includes('left_wrist'))
    const rightWrist = pose.keypoints.find(kp => kp.name.toLowerCase().includes('right_wrist'))
    const leftHip = pose.keypoints.find(kp => kp.name.toLowerCase().includes('left_hip'))
    const rightHip = pose.keypoints.find(kp => kp.name.toLowerCase().includes('right_hip'))

    let handsUpScore = 50
    if (leftWrist && rightWrist && leftHip && rightHip) {
      const avgWristY = (leftWrist.y + rightWrist.y) / 2
      const avgHipY = (leftHip.y + rightHip.y) / 2
      handsUpScore = avgWristY < avgHipY ? 100 : 50
    }

    return (kneeBentScore + balanceScore + handsUpScore) / 3
  }

  /**
   * Analyze weight distribution
   */
  private analyzeWeightDistribution(pose: PoseData): 'forward' | 'backward' | 'balanced' {
    const leftAnkle = pose.keypoints.find(kp => kp.name.toLowerCase().includes('left_ankle'))
    const rightAnkle = pose.keypoints.find(kp => kp.name.toLowerCase().includes('right_ankle'))
    const leftShoulder = pose.keypoints.find(kp => kp.name.toLowerCase().includes('left_shoulder'))
    const rightShoulder = pose.keypoints.find(kp => kp.name.toLowerCase().includes('right_shoulder'))

    if (!leftAnkle || !rightAnkle || !leftShoulder || !rightShoulder) return 'balanced'

    const ankleCenter = ((leftAnkle.x + rightAnkle.x) / 2)
    const shoulderCenter = ((leftShoulder.x + rightShoulder.x) / 2)

    const diff = shoulderCenter - ankleCenter

    if (diff > 10) return 'forward'
    if (diff < -10) return 'backward'
    return 'balanced'
  }

  /**
   * Analyze movement throughout the video
   */
  private analyzeMovement(poses: PoseData[]): MovementAnalysis {
    let totalDistance = 0
    let maxX = -Infinity, minX = Infinity
    let maxY = -Infinity, minY = Infinity

    // Calculate movement
    for (let i = 1; i < poses.length; i++) {
      const current = this.getBodyCenter(poses[i])
      const previous = this.getBodyCenter(poses[i - 1])

      if (current && previous) {
        const distance = Math.sqrt(
          Math.pow(current.x - previous.x, 2) + Math.pow(current.y - previous.y, 2)
        )
        totalDistance += distance

        maxX = Math.max(maxX, current.x)
        minX = Math.min(minX, current.x)
        maxY = Math.max(maxY, current.y)
        minY = Math.min(minY, current.y)
      }
    }

    const duration = poses[poses.length - 1].timestamp - poses[0].timestamp
    const avgSpeed = totalDistance / duration

    // Court coverage (normalized area covered)
    const xRange = maxX - minX
    const yRange = maxY - minY
    const coverage = Math.min(100, (xRange * yRange) / 10000 * 100)

    // Movement efficiency (less is more for pickleball positioning)
    const efficiency = Math.max(0, 100 - (avgSpeed * 10))

    // These would need more sophisticated analysis in production
    const positioning = 70 + Math.random() * 20 // Placeholder
    const anticipation = 70 + Math.random() * 20 // Placeholder
    const footwork = 70 + Math.random() * 20 // Placeholder

    return {
      courtCoverage: Math.round(coverage),
      avgSpeed: Math.round(avgSpeed * 10) / 10,
      efficiency: Math.round(efficiency),
      positioning: Math.round(positioning),
      anticipation: Math.round(anticipation),
      footwork: Math.round(footwork)
    }
  }

  /**
   * Get center of body
   */
  private getBodyCenter(pose: PoseData): { x: number, y: number } | null {
    const leftHip = pose.keypoints.find(kp => kp.name.toLowerCase().includes('left_hip'))
    const rightHip = pose.keypoints.find(kp => kp.name.toLowerCase().includes('right_hip'))

    if (!leftHip || !rightHip) return null

    return {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2
    }
  }

  /**
   * Calculate technical scores
   */
  private calculateTechnicalScores(
    poses: PoseData[],
    shots: ShotDetection[]
  ): TechnicalScores {
    // Calculate averages from shots
    const avgPaddleAngle = shots.length > 0
      ? shots.reduce((sum, shot) => sum + (shot.paddleAngle || 0), 0) / shots.length
      : 75

    const avgFollowThrough = shots.length > 0
      ? shots.reduce((sum, shot) => sum + shot.followThrough, 0) / shots.length
      : 75

    const avgBodyRotation = shots.length > 0
      ? shots.reduce((sum, shot) => sum + Math.max(0, 100 - shot.bodyRotation), 0) / shots.length
      : 75

    // Calculate ready position from all poses
    let readyPositionSum = 0
    let validPoses = 0

    for (const pose of poses) {
      if (!this.poseDetector.isPoseValid(pose)) continue
      const angles = this.poseDetector.calculateBodyAngles(pose)
      readyPositionSum += this.scoreReadyPosition(pose, angles)
      validPoses++
    }

    const readyPosition = validPoses > 0 ? readyPositionSum / validPoses : 75

    // Grip technique (placeholder - would need hand/paddle detection)
    const gripTechnique = 75 + Math.random() * 10

    const overall = (avgPaddleAngle + avgFollowThrough + avgBodyRotation + readyPosition + gripTechnique) / 5

    return {
      paddleAngle: Math.round(Math.min(100, avgPaddleAngle)),
      followThrough: Math.round(avgFollowThrough),
      bodyRotation: Math.round(avgBodyRotation),
      readyPosition: Math.round(readyPosition),
      gripTechnique: Math.round(gripTechnique),
      overall: Math.round(overall)
    }
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(
    stance: StanceAnalysis,
    movement: MovementAnalysis,
    technical: TechnicalScores
  ): number {
    return Math.round(
      (stance.quality * 0.25 +
       movement.courtCoverage * 0.15 +
       movement.efficiency * 0.15 +
       movement.positioning * 0.15 +
       technical.overall * 0.30) * 0.9 + 10
    )
  }

  /**
   * Identify strengths
   */
  private identifyStrengths(
    shots: ShotDetection[],
    stance: StanceAnalysis,
    movement: MovementAnalysis,
    technical: TechnicalScores
  ): string[] {
    const strengths: string[] = []

    if (stance.quality >= 80) {
      strengths.push(`Excellent stance quality (${stance.quality}%) - maintaining strong athletic positioning`)
    }

    if (stance.balance >= 80) {
      strengths.push(`Great balance and stability (${stance.balance}%) - well-aligned body positioning`)
    }

    if (technical.followThrough >= 80) {
      strengths.push(`Strong follow-through technique (${technical.followThrough}%) - completing shots fully`)
    }

    if (movement.courtCoverage >= 75) {
      strengths.push(`Good court coverage (${movement.courtCoverage}%) - actively moving to balls`)
    }

    if (technical.readyPosition >= 80) {
      strengths.push(`Excellent ready position (${technical.readyPosition}%) - prepared for incoming shots`)
    }

    // Analyze shot types
    const shotCounts = this.countShotTypes(shots)
    const totalShots = shots.length

    if (shotCounts.dink / totalShots >= 0.25 && shotCounts.dink >= 5) {
      strengths.push('Strong dinking game - good soft touch and control at the net')
    }

    if (shotCounts.volley / totalShots >= 0.20 && shotCounts.volley >= 5) {
      strengths.push('Solid volley technique - quick hands and good net play')
    }

    return strengths
  }

  /**
   * Identify areas for improvement
   */
  private identifyImprovements(
    shots: ShotDetection[],
    stance: StanceAnalysis,
    movement: MovementAnalysis,
    technical: TechnicalScores
  ): string[] {
    const improvements: string[] = []

    if (stance.quality < 70) {
      improvements.push(`Stance quality needs work (${stance.quality}%) - focus on maintaining athletic position`)
    }

    if (stance.balance < 70) {
      improvements.push(`Balance could be improved (${stance.balance}%) - work on stable base`)
    }

    if (technical.followThrough < 70) {
      improvements.push(`Follow-through is incomplete (${technical.followThrough}%) - extend through your shots`)
    }

    if (movement.efficiency < 60) {
      improvements.push(`Movement efficiency needs improvement (${movement.efficiency}%) - reduce unnecessary steps`)
    }

    if (technical.bodyRotation < 70) {
      improvements.push(`Body rotation is limited (${technical.bodyRotation}%) - engage core for more power`)
    }

    if (stance.weightDistribution === 'backward') {
      improvements.push('Weight distribution is too far back - move forward onto balls of feet')
    }

    // Analyze shot diversity
    const shotCounts = this.countShotTypes(shots)
    const totalShots = shots.length

    if (shotCounts.dink / totalShots < 0.15 && totalShots >= 10) {
      improvements.push('Limited dinking - work on soft game and touch shots')
    }

    return improvements
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(improvements: string[]): string[] {
    const recommendations: string[] = []

    for (const improvement of improvements) {
      if (improvement.includes('stance') || improvement.includes('balance')) {
        recommendations.push('Practice athletic stance drills - focus on bent knees and balanced weight distribution')
      }

      if (improvement.includes('follow-through')) {
        recommendations.push('Work on follow-through extension - complete each shot with full arm extension')
      }

      if (improvement.includes('movement') || improvement.includes('efficiency')) {
        recommendations.push('Practice efficient footwork patterns - take direct paths to balls')
      }

      if (improvement.includes('body rotation')) {
        recommendations.push('Add core rotation exercises to your training - engage torso for more power')
      }

      if (improvement.includes('dinking')) {
        recommendations.push('Do soft touch drills at the kitchen line - practice controlled dinking rallies')
      }

      if (improvement.includes('weight distribution')) {
        recommendations.push('Focus on forward balance - stay on balls of feet in ready position')
      }
    }

    // Add general recommendations
    if (recommendations.length < 3) {
      recommendations.push('Review video analysis to identify specific moments for improvement')
      recommendations.push('Work with a coach to refine technique and address weak points')
    }

    return [...new Set(recommendations)].slice(0, 6) // Remove duplicates and limit to 6
  }

  /**
   * Count shot types
   */
  private countShotTypes(shots: ShotDetection[]): Record<string, number> {
    const counts: Record<string, number> = {
      serve: 0,
      forehand: 0,
      backhand: 0,
      volley: 0,
      dink: 0,
      smash: 0
    }

    for (const shot of shots) {
      counts[shot.type]++
    }

    return counts
  }
}
