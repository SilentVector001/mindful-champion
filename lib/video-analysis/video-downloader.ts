/**
 * Video Downloader Utility
 * Downloads videos from S3 or HTTP URLs to temporary local files for processing
 */

import { getFileUrl } from '@/lib/s3'
import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'
import { finished } from 'stream/promises'

export interface DownloadedVideo {
  localPath: string
  cleanup: () => Promise<void>
}

/**
 * Download a video from S3 or HTTP to a temporary local file
 * @param videoId - Video analysis ID
 * @param cloudStoragePath - S3 key
 * @param isPublic - Whether the file is public
 * @returns Local file path and cleanup function
 */
export async function downloadVideoForProcessing(
  videoId: string,
  cloudStoragePath: string,
  isPublic: boolean
): Promise<DownloadedVideo> {
  console.log('[VideoDownloader] Starting download for:', videoId)
  
  try {
    // Generate signed URL for the video
    const videoUrl = await getFileUrl(cloudStoragePath, isPublic)
    console.log('[VideoDownloader] Got video URL, starting download...')
    
    // Create temp directory
    const tempDir = path.join(process.cwd(), 'temp', 'video-analysis')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
    
    // Generate temp file path
    const ext = path.extname(cloudStoragePath) || '.mp4'
    const tempFilePath = path.join(tempDir, `${videoId}${ext}`)
    
    // Download the video
    const response = await fetch(videoUrl)
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`)
    }
    
    if (!response.body) {
      throw new Error('Response body is null')
    }
    
    // Convert web stream to Node.js stream and save to file
    const fileStream = fs.createWriteStream(tempFilePath)
    const nodeStream = Readable.fromWeb(response.body as any)
    await finished(nodeStream.pipe(fileStream))
    
    console.log('[VideoDownloader] Download complete:', tempFilePath)
    
    // Return path and cleanup function
    return {
      localPath: tempFilePath,
      cleanup: async () => {
        try {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath)
            console.log('[VideoDownloader] Cleaned up temp file:', tempFilePath)
          }
        } catch (error) {
          console.warn('[VideoDownloader] Failed to cleanup temp file:', error)
        }
      }
    }
  } catch (error) {
    console.error('[VideoDownloader] Download failed:', error)
    throw new Error(`Failed to download video: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
