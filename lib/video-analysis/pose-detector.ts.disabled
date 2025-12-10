import type { VideoFrameData } from './video-processor'
import { createCanvas, Image } from 'canvas'

export interface PoseKeypoint {
  x: number
  y: number
  score: number
  name: string
}

export interface PoseData {
  keypoints: PoseKeypoint[]
  score: number
  frameNumber: number
  timestamp: number
}

export interface BodyAngles {
  leftElbow: number
  rightElbow: number
  leftKnee: number
  rightKnee: number
  leftShoulder: number
  rightShoulder: number
  leftHip: number
  rightHip: number
  torsoLean: number
}

export class PoseDetector {
  private detector: any = null
  private isInitialized: boolean = false
  private poseDetection: any = null
  private tf: any = null

  /**
   * Initialize the pose detector with MoveNet model (optimized for Node.js)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log('Loading TensorFlow.js modules...')
      
      // Dynamically import to avoid build-time loading
      this.tf = await import('@tensorflow/tfjs-node')
      this.poseDetection = await import('@tensorflow-models/pose-detection')
      
      console.log('Initializing TensorFlow.js backend...')
      await this.tf.ready()
      console.log('TensorFlow.js backend ready:', this.tf.getBackend())

      // Use MoveNet with TensorFlow.js backend for server-side processing
      const detectorConfig = {
        modelType: this.poseDetection.movenet.modelType.SINGLEPOSE_THUNDER, // Best accuracy
        enableSmoothing: true,
        minPoseScore: 0.3
      }

      this.detector = await this.poseDetection.createDetector(
        this.poseDetection.SupportedModels.MoveNet,
        detectorConfig
      )

      this.isInitialized = true
      console.log('Pose detector initialized successfully with MoveNet')
    } catch (error) {
      console.error('Error initializing pose detector:', error)
      throw new Error('Failed to initialize pose detection model: ' + (error as Error).message)
    }
  }

  /**
   * Detect pose in a single frame
   */
  async detectPoseInFrame(frame: VideoFrameData): Promise<PoseData | null> {
    if (!this.detector) {
      await this.initialize()
    }

    try {
      // Convert ImageData to TensorFlow.js tensor
      const tensor = this.tf.browser.fromPixels(frame.imageData as any)
      
      // Estimate poses
      const poses = await this.detector!.estimatePoses(tensor as any)
      
      // Clean up tensor
      tensor.dispose()
      
      if (poses.length === 0) {
        return null
      }

      // Use the first detected pose (main person in frame)
      const pose = poses[0]
      
      const keypoints: PoseKeypoint[] = pose.keypoints.map((kp: any) => ({
        x: kp.x,
        y: kp.y,
        score: kp.score || 0,
        name: kp.name || 'unknown'
      }))

      return {
        keypoints,
        score: pose.score || 0,
        frameNumber: frame.frameNumber,
        timestamp: frame.timestamp
      }
    } catch (error) {
      console.error('Error detecting pose in frame', frame.frameNumber, ':', error)
      return null
    }
  }

  /**
   * Detect poses in multiple frames
   */
  async detectPosesInFrames(frames: VideoFrameData[]): Promise<PoseData[]> {
    const poses: PoseData[] = []

    for (const frame of frames) {
      const pose = await this.detectPoseInFrame(frame)
      if (pose) {
        poses.push(pose)
      }
    }

    return poses
  }

  /**
   * Calculate body angles from pose keypoints
   */
  calculateBodyAngles(pose: PoseData): BodyAngles {
    const keypoints = pose.keypoints
    
    // Helper function to get keypoint by name
    const getKeypoint = (name: string) => {
      return keypoints.find(kp => kp.name.toLowerCase().includes(name.toLowerCase()))
    }

    // Helper function to calculate angle between three points
    const calculateAngle = (p1?: PoseKeypoint, p2?: PoseKeypoint, p3?: PoseKeypoint): number => {
      if (!p1 || !p2 || !p3) return 0
      
      const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - 
                     Math.atan2(p1.y - p2.y, p1.x - p2.x)
      let angle = Math.abs(radians * 180.0 / Math.PI)
      
      if (angle > 180.0) {
        angle = 360.0 - angle
      }
      
      return angle
    }

    // Calculate major joint angles
    const leftShoulder = getKeypoint('left_shoulder')
    const rightShoulder = getKeypoint('right_shoulder')
    const leftElbowKp = getKeypoint('left_elbow')
    const rightElbowKp = getKeypoint('right_elbow')
    const leftWrist = getKeypoint('left_wrist')
    const rightWrist = getKeypoint('right_wrist')
    const leftHipKp = getKeypoint('left_hip')
    const rightHipKp = getKeypoint('right_hip')
    const leftKneeKp = getKeypoint('left_knee')
    const rightKneeKp = getKeypoint('right_knee')
    const leftAnkle = getKeypoint('left_ankle')
    const rightAnkle = getKeypoint('right_ankle')

    // Calculate angles
    const leftElbow = calculateAngle(leftShoulder, leftElbowKp, leftWrist)
    const rightElbow = calculateAngle(rightShoulder, rightElbowKp, rightWrist)
    const leftKnee = calculateAngle(leftHipKp, leftKneeKp, leftAnkle)
    const rightKnee = calculateAngle(rightHipKp, rightKneeKp, rightAnkle)
    const leftShoulderAngle = calculateAngle(leftHipKp, leftShoulder, leftElbowKp)
    const rightShoulderAngle = calculateAngle(rightHipKp, rightShoulder, rightElbowKp)
    const leftHip = calculateAngle(leftShoulder, leftHipKp, leftKneeKp)
    const rightHip = calculateAngle(rightShoulder, rightHipKp, rightKneeKp)

    // Calculate torso lean (angle from vertical)
    let torsoLean = 0
    if (leftShoulder && rightShoulder && leftHipKp && rightHipKp) {
      const shoulderMidpoint = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2
      }
      const hipMidpoint = {
        x: (leftHipKp.x + rightHipKp.x) / 2,
        y: (leftHipKp.y + rightHipKp.y) / 2
      }
      
      torsoLean = Math.abs(Math.atan2(
        shoulderMidpoint.x - hipMidpoint.x,
        hipMidpoint.y - shoulderMidpoint.y
      ) * 180 / Math.PI)
    }

    return {
      leftElbow,
      rightElbow,
      leftKnee,
      rightKnee,
      leftShoulder: leftShoulderAngle,
      rightShoulder: rightShoulderAngle,
      leftHip,
      rightHip,
      torsoLean
    }
  }

  /**
   * Get keypoint confidence scores
   */
  getKeypointConfidence(pose: PoseData): Map<string, number> {
    const confidence = new Map<string, number>()
    
    pose.keypoints.forEach(kp => {
      confidence.set(kp.name, kp.score)
    })

    return confidence
  }

  /**
   * Check if pose is valid (enough keypoints detected with high confidence)
   */
  isPoseValid(pose: PoseData, minScore: number = 0.5): boolean {
    const validKeypoints = pose.keypoints.filter(kp => kp.score >= minScore)
    return validKeypoints.length >= 10 && pose.score >= minScore
  }

  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    if (this.detector) {
      this.detector.dispose()
      this.detector = null
      this.isInitialized = false
    }
  }
}
