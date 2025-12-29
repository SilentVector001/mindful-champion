-- Manual Migration: Add Video Analysis Progress Tracking
-- Created: December 23, 2025
-- Description: Adds VideoAnalysisProgress, VideoAnalysisAchievement, and VideoAnalysisUserAchievement tables

-- ============================================
-- 1. VideoAnalysisProgress Table
-- ============================================
CREATE TABLE IF NOT EXISTS "VideoAnalysisProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "skillType" TEXT NOT NULL,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalShots" INTEGER NOT NULL DEFAULT 0,
    "bestScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sessionsCount" INTEGER NOT NULL DEFAULT 0,
    "lastAnalyzed" TIMESTAMP(3),
    "improvementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "VideoAnalysisProgress_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add unique constraint and indexes
CREATE UNIQUE INDEX IF NOT EXISTS "VideoAnalysisProgress_userId_skillType_key" 
    ON "VideoAnalysisProgress"("userId", "skillType");
CREATE INDEX IF NOT EXISTS "VideoAnalysisProgress_userId_idx" 
    ON "VideoAnalysisProgress"("userId");

-- ============================================
-- 2. VideoAnalysisAchievement Table
-- ============================================
CREATE TABLE IF NOT EXISTS "VideoAnalysisAchievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "thresholdType" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Add unique index on code
CREATE UNIQUE INDEX IF NOT EXISTS "VideoAnalysisAchievement_code_key" 
    ON "VideoAnalysisAchievement"("code");

-- ============================================
-- 3. VideoAnalysisUserAchievement Table
-- ============================================
CREATE TABLE IF NOT EXISTS "VideoAnalysisUserAchievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" DOUBLE PRECISION,
    
    CONSTRAINT "VideoAnalysisUserAchievement_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VideoAnalysisUserAchievement_achievementId_fkey" 
        FOREIGN KEY ("achievementId") REFERENCES "VideoAnalysisAchievement"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add unique constraint and indexes
CREATE UNIQUE INDEX IF NOT EXISTS "VideoAnalysisUserAchievement_userId_achievementId_key" 
    ON "VideoAnalysisUserAchievement"("userId", "achievementId");
CREATE INDEX IF NOT EXISTS "VideoAnalysisUserAchievement_userId_idx" 
    ON "VideoAnalysisUserAchievement"("userId");
CREATE INDEX IF NOT EXISTS "VideoAnalysisUserAchievement_achievementId_idx" 
    ON "VideoAnalysisUserAchievement"("achievementId");

-- ============================================
-- 4. Verify Tables Created
-- ============================================
-- Run this query to verify all tables exist:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%VideoAnalysis%';

