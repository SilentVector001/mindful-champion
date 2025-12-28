
// Video Analysis Type Definitions

export interface VideoAnalysisData {
  id: string
  userId: string
  videoUrl: string
  thumbnailUrl?: string
  title: string
  description?: string
  fileName: string
  fileSize: number
  duration: number
  uploadedAt: Date
  analysisStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  
  // Analysis Results
  overallScore?: number
  strengths?: string[]
  areasForImprovement?: string[]
  recommendations?: string[]
  
  // Shot Analysis
  shotTypes?: ShotAnalysis[]
  totalShots?: number
  detectedShots?: any[]  // LLM-detected shots with timing and analysis
  
  // Movement & Technique
  movementMetrics?: MovementMetrics
  technicalScores?: TechnicalScores
  
  // AI Insights
  keyMoments?: KeyMoment[]
  heatmap?: HeatmapData
  progressComparison?: ProgressData
}

export interface ShotAnalysis {
  type: 'serve' | 'forehand' | 'backhand' | 'volley' | 'dink' | 'smash' | 'lob'
  count: number
  accuracy: number
  avgSpeed?: number
  successRate: number
  powerRating: number
}

export interface MovementMetrics {
  courtCoverage: number
  avgSpeed: number
  efficiency: number
  positioning: number
  anticipation: number
  footwork: number
}

export interface TechnicalScores {
  paddleAngle: number
  followThrough: number
  bodyRotation: number
  readyPosition: number
  gripTechnique: number
  overall: number
}

export interface KeyMoment {
  timestamp: number
  timestampFormatted: string
  type: 'strength' | 'improvement' | 'critical'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  videoUrl?: string
}

export interface HeatmapData {
  courtZones: {
    zone: string
    frequency: number
    effectiveness: number
  }[]
}

export interface ProgressData {
  previousScore: number
  currentScore: number
  improvement: number
  trend: 'improving' | 'stable' | 'declining'
}

export interface VideoLibraryStats {
  totalVideos: number
  totalAnalyzed: number
  storageUsed: number
  storageLimit: number
  recentlyAnalyzed: number
  avgImprovement: number
}
