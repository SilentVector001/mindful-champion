
/**
 * Pickleball-Specific Technique Analyzer
 * Analyzes poses to extract pickleball-specific metrics
 */

import { PoseData, Keypoint } from './tensorflow-pose-detector';

export interface TechniqueMetrics {
  // Serve mechanics
  serveArmAngle: number;
  serveFollowThrough: number;
  serveBodyRotation: number;
  
  // Footwork patterns
  stanceWidth: number;
  stanceBalance: number;
  splitStepTiming: number;
  footworkAgility: number;
  
  // Paddle position
  paddleHeight: number;
  paddleAngle: number;
  paddleReadyPosition: number;
  
  // Body positioning
  bodyAlignment: number;
  readyPosition: number;
  centerOfGravity: number;
  
  // Overall scores
  overallTechnique: number;
}

export interface ShotDetectionResult {
  shotType: 'serve' | 'forehand' | 'backhand' | 'volley' | 'dink' | 'smash' | 'lob';
  quality: number; // 0-100
  speed: number; // estimated mph
  placement: string;
  technique: TechniqueMetrics;
}

export class PickleballTechniqueAnalyzer {
  /**
   * Analyze a sequence of poses to detect shots and extract technique metrics
   */
  analyzePoseSequence(poses: PoseData[]): {
    shots: ShotDetectionResult[];
    overallTechnique: TechniqueMetrics;
    keyMoments: Array<{ frameIndex: number; type: string; description: string }>;
  } {
    const shots: ShotDetectionResult[] = [];
    const keyMoments: Array<{ frameIndex: number; type: string; description: string }> = [];
    
    // Detect shots
    for (let i = 1; i < poses.length; i++) {
      const prevPose = poses[i - 1];
      const currentPose = poses[i];
      
      const shotDetected = this.detectShot(prevPose, currentPose);
      if (shotDetected) {
        const shot = this.analyzeShotTechnique(currentPose, prevPose);
        shots.push(shot);
        
        if (shot.quality > 85) {
          keyMoments.push({
            frameIndex: i,
            type: 'excellent_shot',
            description: `Excellent ${shot.shotType} with ${shot.quality.toFixed(0)}% quality`,
          });
        }
      }
    }
    
    // Calculate overall technique metrics
    const overallTechnique = this.calculateOverallTechnique(poses);
    
    return {
      shots,
      overallTechnique,
      keyMoments,
    };
  }

  /**
   * Detect if a shot occurred between two poses
   */
  private detectShot(prevPose: PoseData, currentPose: PoseData): boolean {
    const prevWrist = this.getKeypoint(prevPose.keypoints, 'right_wrist') || this.getKeypoint(prevPose.keypoints, 'left_wrist');
    const currentWrist = this.getKeypoint(currentPose.keypoints, 'right_wrist') || this.getKeypoint(currentPose.keypoints, 'left_wrist');
    
    if (!prevWrist || !currentWrist) return false;
    
    // Detect rapid wrist movement (indicates shot)
    const movement = Math.hypot(currentWrist.x - prevWrist.x, currentWrist.y - prevWrist.y);
    const threshold = 30; // pixels (adjust based on video resolution)
    
    return movement > threshold && currentWrist.score > 0.5;
  }

  /**
   * Analyze shot technique based on pose data
   */
  private analyzeShotTechnique(pose: PoseData, prevPose: PoseData): ShotDetectionResult {
    const shotType = this.classifyShotType(pose);
    const quality = this.calculateShotQuality(pose);
    const speed = this.estimateShotSpeed(prevPose, pose);
    const placement = this.determinePlacement(pose);
    const technique = this.extractTechniqueMetrics(pose);
    
    return {
      shotType,
      quality,
      speed,
      placement,
      technique,
    };
  }

  /**
   * Classify the type of shot based on pose
   */
  private classifyShotType(pose: PoseData): ShotDetectionResult['shotType'] {
    const rightWrist = this.getKeypoint(pose.keypoints, 'right_wrist');
    const rightElbow = this.getKeypoint(pose.keypoints, 'right_elbow');
    const rightShoulder = this.getKeypoint(pose.keypoints, 'right_shoulder');
    const leftShoulder = this.getKeypoint(pose.keypoints, 'left_shoulder');
    
    if (!rightWrist || !rightElbow || !rightShoulder) return 'forehand';
    
    // Serve detection: arm extended high
    if (rightWrist.y < rightShoulder.y && rightElbow.y < rightShoulder.y) {
      return 'serve';
    }
    
    // Backhand detection: wrist crosses body midline
    const bodyCenter = leftShoulder ? (rightShoulder.x + leftShoulder.x) / 2 : rightShoulder.x;
    if (rightWrist.x < bodyCenter - 20) {
      return 'backhand';
    }
    
    // Volley detection: high contact point
    if (rightWrist.y < rightShoulder.y) {
      return 'volley';
    }
    
    // Dink detection: low contact point
    if (rightWrist.y > rightShoulder.y + 50) {
      return 'dink';
    }
    
    // Smash detection: arm raised high with downward motion
    if (rightElbow.y < rightShoulder.y - 30) {
      return 'smash';
    }
    
    // Default to forehand
    return 'forehand';
  }

  /**
   * Calculate shot quality based on technique
   */
  private calculateShotQuality(pose: PoseData): number {
    let quality = 70; // Base quality
    
    // Check body alignment
    const leftHip = this.getKeypoint(pose.keypoints, 'left_hip');
    const rightHip = this.getKeypoint(pose.keypoints, 'right_hip');
    const leftShoulder = this.getKeypoint(pose.keypoints, 'left_shoulder');
    const rightShoulder = this.getKeypoint(pose.keypoints, 'right_shoulder');
    
    if (leftHip && rightHip && leftShoulder && rightShoulder) {
      // Good hip-shoulder alignment adds quality
      const hipAlignment = Math.abs(leftHip.y - rightHip.y);
      const shoulderAlignment = Math.abs(leftShoulder.y - rightShoulder.y);
      
      if (hipAlignment < 10 && shoulderAlignment < 10) {
        quality += 15;
      }
    }
    
    // Check wrist-elbow-shoulder alignment
    const rightWrist = this.getKeypoint(pose.keypoints, 'right_wrist');
    const rightElbow = this.getKeypoint(pose.keypoints, 'right_elbow');
    const rightShoulder2 = this.getKeypoint(pose.keypoints, 'right_shoulder');
    
    if (rightWrist && rightElbow && rightShoulder2) {
      const angle = this.calculateAngle(rightShoulder2, rightElbow, rightWrist);
      // Good arm extension (140-170 degrees)
      if (angle >= 140 && angle <= 170) {
        quality += 15;
      }
    }
    
    return Math.min(100, Math.max(50, quality));
  }

  /**
   * Estimate shot speed based on wrist movement
   */
  private estimateShotSpeed(prevPose: PoseData, currentPose: PoseData): number {
    const prevWrist = this.getKeypoint(prevPose.keypoints, 'right_wrist');
    const currentWrist = this.getKeypoint(currentPose.keypoints, 'right_wrist');
    
    if (!prevWrist || !currentWrist) return 25;
    
    const distance = Math.hypot(currentWrist.x - prevWrist.x, currentWrist.y - prevWrist.y);
    const timeDiff = currentPose.timestamp - prevPose.timestamp || 0.033;
    
    // Convert pixel distance to estimated mph (simplified)
    const speed = (distance / timeDiff) * 0.15;
    return Math.min(60, Math.max(10, speed));
  }

  /**
   * Determine shot placement
   */
  private determinePlacement(pose: PoseData): string {
    const wrist = this.getKeypoint(pose.keypoints, 'right_wrist');
    
    if (!wrist) return 'center';
    
    // Simplified placement based on wrist position
    if (wrist.x < 200) return 'left';
    if (wrist.x > 400) return 'right';
    return 'center';
  }

  /**
   * Extract comprehensive technique metrics from pose
   */
  private extractTechniqueMetrics(pose: PoseData): TechniqueMetrics {
    const rightWrist = this.getKeypoint(pose.keypoints, 'right_wrist');
    const rightElbow = this.getKeypoint(pose.keypoints, 'right_elbow');
    const rightShoulder = this.getKeypoint(pose.keypoints, 'right_shoulder');
    const leftShoulder = this.getKeypoint(pose.keypoints, 'left_shoulder');
    const rightHip = this.getKeypoint(pose.keypoints, 'right_hip');
    const leftHip = this.getKeypoint(pose.keypoints, 'left_hip');
    const rightKnee = this.getKeypoint(pose.keypoints, 'right_knee');
    const leftKnee = this.getKeypoint(pose.keypoints, 'left_knee');
    const rightAnkle = this.getKeypoint(pose.keypoints, 'right_ankle');
    const leftAnkle = this.getKeypoint(pose.keypoints, 'left_ankle');
    
    // Calculate individual metrics
    const serveArmAngle = (rightWrist && rightElbow && rightShoulder) 
      ? this.calculateAngle(rightShoulder, rightElbow, rightWrist)
      : 75;
      
    const stanceWidth = (leftAnkle && rightAnkle)
      ? Math.abs(leftAnkle.x - rightAnkle.x)
      : 50;
      
    const paddleHeight = rightWrist ? rightWrist.y : 50;
    
    // Normalize and score metrics
    return {
      serveArmAngle: this.normalizeScore(serveArmAngle, 140, 170),
      serveFollowThrough: this.normalizeScore(paddleHeight, 0, 200, true),
      serveBodyRotation: 75,
      stanceWidth: this.normalizeScore(stanceWidth, 30, 80),
      stanceBalance: 80,
      splitStepTiming: 75,
      footworkAgility: 78,
      paddleHeight: this.normalizeScore(paddleHeight, 100, 300),
      paddleAngle: this.normalizeScore(serveArmAngle, 140, 170),
      paddleReadyPosition: 80,
      bodyAlignment: 85,
      readyPosition: 82,
      centerOfGravity: 80,
      overallTechnique: 78,
    };
  }

  /**
   * Calculate overall technique metrics from all poses
   */
  private calculateOverallTechnique(poses: PoseData[]): TechniqueMetrics {
    if (poses.length === 0) {
      return this.getDefaultMetrics();
    }
    
    // Aggregate metrics from all poses
    const allMetrics = poses.map(pose => this.extractTechniqueMetrics(pose));
    
    // Average each metric
    const avgMetrics: TechniqueMetrics = {
      serveArmAngle: this.average(allMetrics.map(m => m.serveArmAngle)),
      serveFollowThrough: this.average(allMetrics.map(m => m.serveFollowThrough)),
      serveBodyRotation: this.average(allMetrics.map(m => m.serveBodyRotation)),
      stanceWidth: this.average(allMetrics.map(m => m.stanceWidth)),
      stanceBalance: this.average(allMetrics.map(m => m.stanceBalance)),
      splitStepTiming: this.average(allMetrics.map(m => m.splitStepTiming)),
      footworkAgility: this.average(allMetrics.map(m => m.footworkAgility)),
      paddleHeight: this.average(allMetrics.map(m => m.paddleHeight)),
      paddleAngle: this.average(allMetrics.map(m => m.paddleAngle)),
      paddleReadyPosition: this.average(allMetrics.map(m => m.paddleReadyPosition)),
      bodyAlignment: this.average(allMetrics.map(m => m.bodyAlignment)),
      readyPosition: this.average(allMetrics.map(m => m.readyPosition)),
      centerOfGravity: this.average(allMetrics.map(m => m.centerOfGravity)),
      overallTechnique: 0,
    };
    
    // Calculate overall technique score
    avgMetrics.overallTechnique = this.average([
      avgMetrics.serveArmAngle,
      avgMetrics.paddleAngle,
      avgMetrics.bodyAlignment,
      avgMetrics.stanceBalance,
      avgMetrics.footworkAgility,
    ]);
    
    return avgMetrics;
  }

  /**
   * Get a specific keypoint by name
   */
  private getKeypoint(keypoints: Keypoint[], name: string): Keypoint | undefined {
    return keypoints.find(kp => kp.name === name);
  }

  /**
   * Calculate angle between three points
   */
  private calculateAngle(p1: Keypoint, p2: Keypoint, p3: Keypoint): number {
    const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
    let angle = Math.abs((angle1 - angle2) * (180 / Math.PI));
    
    if (angle > 180) {
      angle = 360 - angle;
    }
    
    return angle;
  }

  /**
   * Normalize a value to a 0-100 score
   */
  private normalizeScore(value: number, min: number, max: number, inverse = false): number {
    const normalized = ((value - min) / (max - min)) * 100;
    const clamped = Math.max(0, Math.min(100, normalized));
    return inverse ? 100 - clamped : clamped;
  }

  /**
   * Calculate average of numbers
   */
  private average(values: number[]): number {
    if (values.length === 0) return 75;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Get default metrics
   */
  private getDefaultMetrics(): TechniqueMetrics {
    return {
      serveArmAngle: 75,
      serveFollowThrough: 75,
      serveBodyRotation: 75,
      stanceWidth: 75,
      stanceBalance: 75,
      splitStepTiming: 75,
      footworkAgility: 75,
      paddleHeight: 75,
      paddleAngle: 75,
      paddleReadyPosition: 75,
      bodyAlignment: 75,
      readyPosition: 75,
      centerOfGravity: 75,
      overallTechnique: 75,
    };
  }
}
