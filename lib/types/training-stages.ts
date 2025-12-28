
// Training Stage System Types
// Transforms simple video watching into comprehensive coaching journeys

export interface TrainingStage {
  id: string
  name: string
  type: 'LEARN' | 'PRACTICE' | 'ASSESS' | 'CHALLENGE' | 'REFLECT'
  description: string
  order: number
  requirements: StageRequirement[]
  rewards: StageReward[]
  estimatedDuration: number // minutes
  isUnlocked: boolean
  isCompleted: boolean
  completedAt?: Date
  icon: string
}

export interface StageRequirement {
  type: 'VIDEO_WATCH' | 'SKILL_ASSESSMENT' | 'PRACTICE_LOG' | 'CHALLENGE_COMPLETE' | 'REFLECTION_SUBMIT'
  target: string // video ID, assessment ID, etc.
  progress: number // 0-100
  isCompleted: boolean
}

export interface StageReward {
  type: 'BADGE' | 'POINTS' | 'SKILL_UNLOCK' | 'NEXT_STAGE'
  value: string
  description: string
}

export interface CoachingJourney {
  id: string
  programId: string
  userId: string
  currentStage: number
  totalStages: number
  overallProgress: number
  stages: TrainingStage[]
  milestones: JourneyMilestone[]
  skillProgression: SkillProgression[]
  nextRecommendation: string
}

export interface JourneyMilestone {
  id: string
  name: string
  description: string
  requiredStages: string[]
  isAchieved: boolean
  achievedAt?: Date
  badge?: string
  points: number
}

export interface SkillProgression {
  skillName: string
  currentLevel: number
  maxLevel: number
  progressPercentage: number
  recentImprovement: number
}

export interface PracticeChallenge {
  id: string
  name: string
  description: string
  type: 'ACCURACY' | 'CONSISTENCY' | 'TECHNIQUE' | 'MENTAL'
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  requirements: string[]
  successCriteria: string[]
  estimatedAttempts: number
  currentAttempts: number
  isCompleted: boolean
  bestScore?: number
}

export interface SkillAssessment {
  id: string
  name: string
  description: string
  questions: AssessmentQuestion[]
  passingScore: number
  currentScore?: number
  attempts: number
  maxAttempts: number
  isCompleted: boolean
}

export interface AssessmentQuestion {
  id: string
  question: string
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SELF_RATING' | 'VIDEO_ANALYSIS'
  options?: string[]
  correctAnswer?: string
  userAnswer?: string
  isCorrect?: boolean
}

export interface ReflectionPrompt {
  id: string
  prompt: string
  type: 'TEXT' | 'RATING' | 'GOALS'
  isRequired: boolean
  userResponse?: string
  submittedAt?: Date
}

export interface TrainingSession {
  id: string
  userId: string
  journeyId: string
  stageId: string
  startTime: Date
  endTime?: Date
  activities: SessionActivity[]
  focusScore: number
  effortLevel: number
  notes?: string
  isCompleted: boolean
}

export interface SessionActivity {
  type: 'VIDEO_WATCH' | 'PRACTICE' | 'ASSESSMENT' | 'REFLECTION'
  activityId: string
  duration: number
  success: boolean
  score?: number
  notes?: string
}
