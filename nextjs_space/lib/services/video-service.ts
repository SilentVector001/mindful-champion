/**
 * Video Service - Simplified Video Management
 * 
 * Handles video progress tracking using the actual Prisma schema
 */

import { prisma as db } from "@/lib/db"

export class VideoService {
  private static instance: VideoService

  private constructor() {}

  static getInstance(): VideoService {
    if (!VideoService.instance) {
      VideoService.instance = new VideoService()
    }
    return VideoService.instance
  }

  /**
   * Track video progress
   */
  async trackProgress(
    userId: string,
    videoId: string,
    watchPercentage: number,
    lastPosition: number
  ): Promise<void> {
    const watched = watchPercentage >= 90

    await db.userVideoProgress.upsert({
      where: {
        userId_videoId: { userId, videoId }
      },
      create: {
        userId,
        videoId,
        watched,
        watchPercentage,
        lastPosition,
        watchDate: new Date(),
        completedAt: watched ? new Date() : null
      },
      update: {
        watched,
        watchPercentage,
        lastPosition,
        watchDate: new Date(),
        ...(watched && { completedAt: new Date() })
      }
    })
  }

  /**
   * Get video progress
   */
  async getProgress(userId: string, videoId: string): Promise<any | null> {
    return await db.userVideoProgress.findFirst({
      where: { userId, videoId }
    })
  }

  /**
   * Mark video as completed
   */
  async markCompleted(userId: string, videoId: string): Promise<void> {
    await db.userVideoProgress.upsert({
      where: {
        userId_videoId: { userId, videoId }
      },
      create: {
        userId,
        videoId,
        watched: true,
        watchPercentage: 100,
        watchDate: new Date(),
        completedAt: new Date()
      },
      update: {
        watched: true,
        watchPercentage: 100,
        completedAt: new Date()
      }
    })
  }
}

export const videoService = VideoService.getInstance()
