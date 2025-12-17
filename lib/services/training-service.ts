
/**
 * Training Service - Core Business Logic Layer
 * 
 * This service encapsulates all training-related business logic,
 * making the codebase modular, testable, and scalable.
 * 
 * Architecture Pattern: Service Layer Pattern
 * Purpose: Separation of concerns, reusability, maintainability
 */

import { prisma as db } from "@/lib/db"
import { toast } from "sonner"

export interface TrainingProgram {
  id: string
  programId: string
  name: string
  tagline?: string | null
  description: string
  durationDays: number
  skillLevel: string
  estimatedTimePerDay?: string | null
  keyOutcomes?: any
  dailyStructure: any
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserProgramEnrollment {
  id: string
  userId: string
  programId: string
  status: string
  currentDay: number
  completionPercentage: number
  startDate?: Date | null
  completedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Training Service Class
 * Handles all training program operations with sophisticated caching and optimization
 */
export class TrainingService {
  private static instance: TrainingService
  private cache: Map<string, any> = new Map()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  private constructor() {}

  static getInstance(): TrainingService {
    if (!TrainingService.instance) {
      TrainingService.instance = new TrainingService()
    }
    return TrainingService.instance
  }

  /**
   * Get all training programs with caching
   */
  async getPrograms(filters?: {
    skillLevel?: string
    isActive?: boolean
  }): Promise<TrainingProgram[]> {
    const cacheKey = `programs_${JSON.stringify(filters || {})}`
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }
    }

    const programs = await db.trainingProgram.findMany({
      where: {
        isActive: filters?.isActive ?? true,
        ...(filters?.skillLevel && { skillLevel: filters.skillLevel as any })
      },
      orderBy: { createdAt: 'desc' }
    })

    this.cache.set(cacheKey, {
      data: programs,
      timestamp: Date.now()
    })

    return programs as TrainingProgram[]
  }

  /**
   * Get user's program enrollments with progress
   */
  async getUserEnrollments(userId: string): Promise<UserProgramEnrollment[]> {
    const enrollments = await db.userProgram.findMany({
      where: { userId },
      include: {
        program: true
      },
      orderBy: { updatedAt: 'desc' }
    })

    return enrollments as any[]
  }

  /**
   * Enroll user in a program with sophisticated error handling
   */
  async enrollInProgram(
    userId: string,
    programId: string
  ): Promise<{ success: boolean; enrollment?: UserProgramEnrollment; error?: string }> {
    try {
      // Check if already enrolled
      const existing = await db.userProgram.findFirst({
        where: { userId, programId }
      })

      if (existing) {
        return {
          success: false,
          error: "Already enrolled in this program"
        }
      }

      // Create enrollment
      const enrollment = await db.userProgram.create({
        data: {
          userId,
          programId,
          status: "IN_PROGRESS",
          currentDay: 1,
          completionPercentage: 0,
          startDate: new Date()
        }
      })

      // Clear cache
      this.clearUserCache(userId)

      return {
        success: true,
        enrollment: enrollment as UserProgramEnrollment
      }
    } catch (error) {
      console.error("[TrainingService] Enrollment error:", error)
      return {
        success: false,
        error: "Failed to enroll in program"
      }
    }
  }

  /**
   * Update program progress with analytics tracking
   */
  async updateProgramProgress(
    userId: string,
    programId: string,
    updates: {
      currentDay?: number
      completionPercentage?: number
      status?: any
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {
        ...(updates.currentDay !== undefined && { currentDay: updates.currentDay }),
        ...(updates.completionPercentage !== undefined && { completionPercentage: updates.completionPercentage }),
        ...(updates.status && { status: updates.status })
      }

      if (updates.status === "COMPLETED") {
        updateData.completedAt = new Date()
        updateData.completionPercentage = 100
      }

      await db.userProgram.updateMany({
        where: { userId, programId },
        data: updateData
      })

      // Clear cache
      this.clearUserCache(userId)

      return { success: true }
    } catch (error) {
      console.error("[TrainingService] Update progress error:", error)
      return {
        success: false,
        error: "Failed to update progress"
      }
    }
  }



  /**
   * Get program statistics for analytics
   */
  async getProgramStats(programId: string): Promise<{
    totalEnrolled: number
    activeUsers: number
    completionRate: number
    avgProgress: number
  }> {
    const enrollments = await db.userProgram.findMany({
      where: { programId }
    })

    const totalEnrolled = enrollments.length
    const activeUsers = enrollments.filter((e: any) => e.status === "IN_PROGRESS").length
    const completed = enrollments.filter((e: any) => e.status === "COMPLETED").length
    const completionRate = totalEnrolled > 0 ? (completed / totalEnrolled) * 100 : 0
    const avgProgress = totalEnrolled > 0
      ? enrollments.reduce((sum: number, e: any) => sum + (e.completionPercentage || 0), 0) / totalEnrolled
      : 0

    return {
      totalEnrolled,
      activeUsers,
      completionRate,
      avgProgress
    }
  }

  /**
   * Clear user-specific cache
   */
  private clearUserCache(userId: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(userId)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear()
  }
}

// Export singleton instance
export const trainingService = TrainingService.getInstance()
