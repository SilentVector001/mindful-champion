import ffmpeg from 'fluent-ffmpeg'
import { promisify } from 'util'
import { unlink } from 'fs/promises'
import path from 'path'
import { createCanvas, loadImage, ImageData as CanvasImageData } from 'canvas'

// Set ffmpeg path
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
ffmpeg.setFfmpegPath(ffmpegPath)

export interface VideoFrameData {
  frameNumber: number
  timestamp: number
  imageData: CanvasImageData
  width: number
  height: number
}

export interface VideoMetadata {
  duration: number
  fps: number
  width: number
  height: number
  totalFrames: number
}

export class VideoProcessor {
  /**
   * Extract frames from a video file at specified intervals
   * @param videoPath Path to the video file
   * @param framesPerSecond Number of frames to extract per second (default: 2)
   * @returns Array of frame data
   */
  async extractFrames(
    videoPath: string,
    framesPerSecond: number = 2
  ): Promise<VideoFrameData[]> {
    const metadata = await this.getVideoMetadata(videoPath)
    const outputPattern = path.join('/tmp', `frame-%04d.jpg`)
    
    // Calculate frame extraction rate
    const frameRate = metadata.fps || 30
    const skipFrames = Math.floor(frameRate / framesPerSecond)
    
    // Extract frames
    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .outputOptions([
          `-vf select='not(mod(n\\,${skipFrames}))'`,
          '-vsync', 'vfr'
        ])
        .output(outputPattern)
        .on('end', () => resolve())
        .on('error', (err: any) => reject(err))
        .run()
    })

    // Load extracted frames
    const frames: VideoFrameData[] = []
    const totalFramesToExtract = Math.floor(metadata.duration * framesPerSecond)
    
    for (let i = 1; i <= totalFramesToExtract; i++) {
      const framePath = path.join('/tmp', `frame-${String(i).padStart(4, '0')}.jpg`)
      
      try {
        const image = await loadImage(framePath)
        const canvas = createCanvas(image.width, image.height)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0)
        
        const imageData = ctx.getImageData(0, 0, image.width, image.height)
        
        frames.push({
          frameNumber: i,
          timestamp: (i - 1) / framesPerSecond,
          imageData,
          width: image.width,
          height: image.height
        })
        
        // Clean up frame file
        await unlink(framePath).catch(() => {})
      } catch (error) {
        console.error(`Error loading frame ${i}:`, error)
      }
    }
    
    return frames
  }

  /**
   * Get video metadata
   */
  async getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err: any, metadata: any) => {
        if (err) {
          reject(err)
          return
        }

        const videoStream = metadata.streams.find((s: any) => s.codec_type === 'video')
        if (!videoStream) {
          reject(new Error('No video stream found'))
          return
        }

        const fps = eval(videoStream.r_frame_rate || '30/1') as number
        const duration = metadata.format.duration || 0
        const width = videoStream.width || 0
        const height = videoStream.height || 0
        const totalFrames = Math.floor(duration * fps)

        resolve({
          duration,
          fps,
          width,
          height,
          totalFrames
        })
      })
    })
  }

  /**
   * Extract a single frame at a specific timestamp
   */
  async extractFrameAtTime(
    videoPath: string,
    timestamp: number
  ): Promise<VideoFrameData | null> {
    const outputPath = path.join('/tmp', `frame-${Date.now()}.jpg`)
    
    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(timestamp)
        .outputOptions(['-frames:v', '1'])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err: any) => reject(err))
        .run()
    })

    try {
      const image = await loadImage(outputPath)
      const canvas = createCanvas(image.width, image.height)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0)
      
      const imageData = ctx.getImageData(0, 0, image.width, image.height)
      
      await unlink(outputPath).catch(() => {})
      
      return {
        frameNumber: Math.floor(timestamp * 30), // Approximate
        timestamp,
        imageData,
        width: image.width,
        height: image.height
      }
    } catch (error) {
      console.error('Error extracting frame:', error)
      return null
    }
  }
}
