
/**
 * Visual Overlay Generator for Video Analysis
 * Creates visual overlays showing pose tracking and form indicators
 */

import { PoseData, Keypoint } from '../pose-detection/tensorflow-pose-detector';
import { createCanvas, Canvas, CanvasRenderingContext2D } from 'canvas';

export interface OverlayConfig {
  showSkeleton?: boolean;
  showKeypoints?: boolean;
  showAngles?: boolean;
  showFormIndicators?: boolean;
  skeletonColor?: string;
  keypointColor?: string;
  goodFormColor?: string;
  badFormColor?: string;
}

export interface OverlayFrame {
  frameIndex: number;
  timestamp: number;
  overlayDataUrl: string; // Base64 encoded PNG
}

export class PoseOverlayGenerator {
  private config: Required<OverlayConfig>;

  constructor(config: OverlayConfig = {}) {
    this.config = {
      showSkeleton: config.showSkeleton ?? true,
      showKeypoints: config.showKeypoints ?? true,
      showAngles: config.showAngles ?? true,
      showFormIndicators: config.showFormIndicators ?? true,
      skeletonColor: config.skeletonColor || '#00FF00',
      keypointColor: config.keypointColor || '#FF0000',
      goodFormColor: config.goodFormColor || '#00FF00',
      badFormColor: config.badFormColor || '#FF0000',
    };
  }

  /**
   * Generate overlay data for a pose
   */
  generateOverlay(pose: PoseData, videoWidth: number, videoHeight: number): OverlayFrame {
    // Create transparent canvas for overlay
    const canvas = createCanvas(videoWidth, videoHeight);
    const ctx = canvas.getContext('2d');

    // Draw skeleton
    if (this.config.showSkeleton) {
      this.drawSkeleton(ctx, pose.keypoints, videoWidth, videoHeight);
    }

    // Draw keypoints
    if (this.config.showKeypoints) {
      this.drawKeypoints(ctx, pose.keypoints, videoWidth, videoHeight);
    }

    // Draw angles
    if (this.config.showAngles) {
      this.drawAngles(ctx, pose.keypoints, videoWidth, videoHeight);
    }

    // Draw form indicators
    if (this.config.showFormIndicators) {
      this.drawFormIndicators(ctx, pose.keypoints, videoWidth, videoHeight);
    }

    // Convert canvas to base64
    const overlayDataUrl = canvas.toDataURL('image/png');

    return {
      frameIndex: pose.frameIndex,
      timestamp: pose.timestamp,
      overlayDataUrl,
    };
  }

  /**
   * Generate overlays for multiple poses
   */
  generateOverlays(
    poses: PoseData[],
    videoWidth: number,
    videoHeight: number,
    onProgress?: (current: number, total: number) => void
  ): OverlayFrame[] {
    const overlays: OverlayFrame[] = [];

    for (let i = 0; i < poses.length; i++) {
      overlays.push(this.generateOverlay(poses[i], videoWidth, videoHeight));
      
      if (onProgress) {
        onProgress(i + 1, poses.length);
      }
    }

    return overlays;
  }

  /**
   * Draw skeleton connections
   */
  private drawSkeleton(
    ctx: CanvasRenderingContext2D,
    keypoints: Keypoint[],
    width: number,
    height: number
  ): void {
    // Define skeleton connections
    const connections = [
      // Head
      ['nose', 'left_eye'],
      ['nose', 'right_eye'],
      ['left_eye', 'left_ear'],
      ['right_eye', 'right_ear'],
      // Upper body
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_elbow'],
      ['right_shoulder', 'right_elbow'],
      ['left_elbow', 'left_wrist'],
      ['right_elbow', 'right_wrist'],
      // Torso
      ['left_shoulder', 'left_hip'],
      ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      // Lower body
      ['left_hip', 'left_knee'],
      ['right_hip', 'right_knee'],
      ['left_knee', 'left_ankle'],
      ['right_knee', 'right_ankle'],
    ];

    ctx.strokeStyle = this.config.skeletonColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // Draw connections
    for (const [start, end] of connections) {
      const startKp = keypoints.find(kp => kp.name === start);
      const endKp = keypoints.find(kp => kp.name === end);

      if (startKp && endKp && startKp.score > 0.3 && endKp.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(startKp.x, startKp.y);
        ctx.lineTo(endKp.x, endKp.y);
        ctx.stroke();
      }
    }
  }

  /**
   * Draw keypoints
   */
  private drawKeypoints(
    ctx: CanvasRenderingContext2D,
    keypoints: Keypoint[],
    width: number,
    height: number
  ): void {
    keypoints.forEach(kp => {
      if (kp.score > 0.3) {
        // Draw circle for keypoint
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = this.config.keypointColor;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }

  /**
   * Draw angle measurements
   */
  private drawAngles(
    ctx: CanvasRenderingContext2D,
    keypoints: Keypoint[],
    width: number,
    height: number
  ): void {
    // Draw elbow angle
    const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
    const rightElbow = keypoints.find(kp => kp.name === 'right_elbow');
    const rightWrist = keypoints.find(kp => kp.name === 'right_wrist');

    if (rightShoulder && rightElbow && rightWrist && 
        rightShoulder.score > 0.3 && rightElbow.score > 0.3 && rightWrist.score > 0.3) {
      const angle = this.calculateAngle(rightShoulder, rightElbow, rightWrist);
      
      // Draw angle text
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(`${angle.toFixed(0)}°`, rightElbow.x + 10, rightElbow.y - 10);
      ctx.fillText(`${angle.toFixed(0)}°`, rightElbow.x + 10, rightElbow.y - 10);
    }
  }

  /**
   * Draw form indicators (red/yellow/green zones)
   */
  private drawFormIndicators(
    ctx: CanvasRenderingContext2D,
    keypoints: Keypoint[],
    width: number,
    height: number
  ): void {
    const rightWrist = keypoints.find(kp => kp.name === 'right_wrist');
    const rightElbow = keypoints.find(kp => kp.name === 'right_elbow');
    const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');

    if (rightWrist && rightElbow && rightShoulder) {
      const angle = this.calculateAngle(rightShoulder, rightElbow, rightWrist);
      
      // Determine form quality based on angle
      let color = this.config.badFormColor; // Red
      if (angle >= 140 && angle <= 170) {
        color = this.config.goodFormColor; // Green
      } else if (angle >= 120 && angle < 140 || angle > 170 && angle <= 180) {
        color = '#FFFF00'; // Yellow
      }

      // Draw indicator circle around wrist
      ctx.beginPath();
      ctx.arc(rightWrist.x, rightWrist.y, 15, 0, 2 * Math.PI);
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.stroke();
    }
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
   * Generate JSON data for client-side overlay rendering
   */
  generateOverlayData(pose: PoseData): {
    skeleton: Array<{ from: {x: number; y: number}; to: {x: number; y: number} }>;
    keypoints: Array<{ x: number; y: number; label: string; score: number }>;
    angles: Array<{ x: number; y: number; value: number; label: string }>;
    indicators: Array<{ x: number; y: number; color: string; type: string }>;
  } {
    const result = {
      skeleton: [] as any[],
      keypoints: [] as any[],
      angles: [] as any[],
      indicators: [] as any[],
    };

    // Generate skeleton data
    const connections = [
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_elbow'],
      ['right_shoulder', 'right_elbow'],
      ['left_elbow', 'left_wrist'],
      ['right_elbow', 'right_wrist'],
      ['left_shoulder', 'left_hip'],
      ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'],
      ['right_hip', 'right_knee'],
      ['left_knee', 'left_ankle'],
      ['right_knee', 'right_ankle'],
    ];

    for (const [start, end] of connections) {
      const startKp = pose.keypoints.find(kp => kp.name === start);
      const endKp = pose.keypoints.find(kp => kp.name === end);

      if (startKp && endKp && startKp.score > 0.3 && endKp.score > 0.3) {
        result.skeleton.push({
          from: { x: startKp.x, y: startKp.y },
          to: { x: endKp.x, y: endKp.y },
        });
      }
    }

    // Generate keypoints data
    result.keypoints = pose.keypoints
      .filter(kp => kp.score > 0.3)
      .map(kp => ({
        x: kp.x,
        y: kp.y,
        label: kp.name,
        score: kp.score,
      }));

    // Generate angles data
    const rightShoulder = pose.keypoints.find(kp => kp.name === 'right_shoulder');
    const rightElbow = pose.keypoints.find(kp => kp.name === 'right_elbow');
    const rightWrist = pose.keypoints.find(kp => kp.name === 'right_wrist');

    if (rightShoulder && rightElbow && rightWrist) {
      const angle = this.calculateAngle(rightShoulder, rightElbow, rightWrist);
      result.angles.push({
        x: rightElbow.x,
        y: rightElbow.y,
        value: angle,
        label: 'Elbow',
      });
    }

    // Generate indicators data
    if (rightWrist && rightElbow && rightShoulder) {
      const angle = this.calculateAngle(rightShoulder, rightElbow, rightWrist);
      let color = '#FF0000';
      if (angle >= 140 && angle <= 170) color = '#00FF00';
      else if (angle >= 120 && angle < 140 || angle > 170 && angle <= 180) color = '#FFFF00';

      result.indicators.push({
        x: rightWrist.x,
        y: rightWrist.y,
        color,
        type: 'form',
      });
    }

    return result;
  }
}
