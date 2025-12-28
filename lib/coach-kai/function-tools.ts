// Coach Kai Function Calling Tools
// Tools that Coach Kai can invoke to interact with the platform

import { drillsDatabase, Drill, DrillCategory } from '@/lib/drills-data'

export type CoachKaiTool = 
  | 'create_goal'
  | 'search_drills'
  | 'recommend_program'
  | 'set_reminder'
  | 'get_user_progress'
  | 'navigate_to'

export interface ToolCall {
  name: CoachKaiTool
  arguments: Record<string, any>
}

export interface ToolResult {
  success: boolean
  data?: any
  message: string
  navigation?: string
}

// Goal category to drill category mapping
const GOAL_TO_DRILL_MAP: Record<string, DrillCategory[]> = {
  'SERVE_IMPROVEMENT': ['serving'],
  'DINK_MASTERY': ['dinking', 'resets'],
  'THIRD_SHOT_DROPS': ['third-shot', 'strategy'],
  'VOLLEY_SKILLS': ['volley', 'overhead'],
  'FOOTWORK': ['footwork', 'warmup'],
  'MENTAL_GAME': ['mental', 'strategy'],
  'TOURNAMENT_PREP': ['strategy', 'mental', 'warmup'],
  'GENERAL_IMPROVEMENT': ['serving', 'dinking', 'third-shot', 'volley'],
  'CONSISTENCY': ['dinking', 'third-shot', 'returns'],
  'POWER': ['serving', 'drives', 'overhead'],
  'DEFENSE': ['resets', 'returns', 'footwork'],
  'OFFENSIVE': ['third-shot', 'drives', 'volley']
}

// Skill level to difficulty mapping
const SKILL_TO_DIFFICULTY: Record<string, string[]> = {
  'BEGINNER': ['beginner'],
  'INTERMEDIATE': ['beginner', 'intermediate'],
  'ADVANCED': ['intermediate', 'advanced'],
  'PRO': ['advanced', 'pro']
}

// Intent recognition patterns
export const INTENT_PATTERNS = {
  GOAL_SETTING: [
    /want to (improve|get better|work on|master|learn)/i,
    /goal is to/i,
    /trying to (improve|fix|work on)/i,
    /need to (improve|get better|work)/i,
    /my (serve|dink|volley|drop|footwork|mental) needs work/i,
    /keep (missing|failing|struggling with)/i,
    /want to win more/i,
    /want to play (better|at a higher level)/i
  ],
  DRILL_REQUEST: [
    /drill(s)? for/i,
    /practice (routine|exercises|drills)/i,
    /how (do i|can i|should i) practice/i,
    /exercises for/i,
    /training for/i
  ],
  PROGRESS_CHECK: [
    /how am i doing/i,
    /my (progress|stats|performance)/i,
    /show me my/i,
    /what('s| is) my/i
  ],
  TOURNAMENT_PREP: [
    /tournament/i,
    /competition/i,
    /match prep/i,
    /big game/i
  ],
  MENTAL_GAME: [
    /mental/i,
    /nervous|anxiety|pressure/i,
    /confidence/i,
    /focus/i,
    /under pressure/i,
    /stress/i
  ]
}

// Detect user intent from message
export function detectIntent(message: string): string | null {
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        return intent
      }
    }
  }
  return null
}

// Extract skill area from message
export function extractSkillArea(message: string): string | null {
  const skillKeywords: Record<string, string> = {
    'serve': 'SERVE_IMPROVEMENT',
    'dink': 'DINK_MASTERY',
    'third shot': 'THIRD_SHOT_DROPS',
    'drop shot': 'THIRD_SHOT_DROPS',
    'volley': 'VOLLEY_SKILLS',
    'overhead': 'VOLLEY_SKILLS',
    'footwork': 'FOOTWORK',
    'movement': 'FOOTWORK',
    'mental': 'MENTAL_GAME',
    'confidence': 'MENTAL_GAME',
    'tournament': 'TOURNAMENT_PREP',
    'competition': 'TOURNAMENT_PREP',
    'consistency': 'CONSISTENCY',
    'power': 'POWER',
    'defense': 'DEFENSE',
    'attack': 'OFFENSIVE',
    'reset': 'DEFENSE',
    'return': 'DEFENSE'
  }

  const lowerMessage = message.toLowerCase()
  for (const [keyword, category] of Object.entries(skillKeywords)) {
    if (lowerMessage.includes(keyword)) {
      return category
    }
  }
  return 'GENERAL_IMPROVEMENT'
}

// Search drills based on criteria
export function searchDrills(params: {
  category?: string
  skillLevel?: string
  difficulty?: string
  limit?: number
}): Drill[] {
  const { category, skillLevel = 'INTERMEDIATE', difficulty, limit = 5 } = params
  
  let drills = [...drillsDatabase]
  
  // Filter by category
  if (category) {
    const drillCategories = GOAL_TO_DRILL_MAP[category] || [category.toLowerCase() as DrillCategory]
    drills = drills.filter(d => drillCategories.includes(d.category))
  }
  
  // Filter by skill level/difficulty
  const allowedDifficulties = SKILL_TO_DIFFICULTY[skillLevel] || ['beginner', 'intermediate']
  if (difficulty) {
    drills = drills.filter(d => d.difficulty === difficulty)
  } else {
    drills = drills.filter(d => allowedDifficulties.includes(d.difficulty))
  }
  
  // Sort by popularity and effectiveness
  drills.sort((a, b) => (b.popularityScore + b.effectivenessRating) - (a.popularityScore + a.effectivenessRating))
  
  return drills.slice(0, limit)
}

// Format drills for Coach Kai response
export function formatDrillsForResponse(drills: Drill[]): string {
  if (drills.length === 0) {
    return "I couldn't find specific drills matching your criteria, but let's work on a custom practice plan!"
  }
  
  const drillList = drills.slice(0, 3).map((d, i) => {
    return `${i + 1}. **${d.name}** (${d.duration} min) - ${d.tagline}`
  }).join('\n')
  
  return `Here are some great drills for you:\n\n${drillList}\n\nWant me to add any of these to your training plan?`
}

// Recommend program based on goals
export function recommendProgram(goalCategory: string, skillLevel: string): {
  programId: string
  programName: string
  reason: string
} | null {
  const programMap: Record<string, { programId: string, programName: string, reason: string }> = {
    'SERVE_IMPROVEMENT': { programId: 'serve-mastery', programName: 'Serve Mastery Program', reason: 'Build a consistent, powerful serve in 14 days' },
    'DINK_MASTERY': { programId: 'soft-game', programName: 'Soft Game Excellence', reason: 'Master the dink game and patience' },
    'THIRD_SHOT_DROPS': { programId: 'transition-game', programName: 'Transition Game Mastery', reason: 'Perfect your third shot and kitchen line transition' },
    'MENTAL_GAME': { programId: 'mental-edge', programName: 'Mental Edge Training', reason: 'Build unshakeable confidence and focus' },
    'GENERAL_IMPROVEMENT': { programId: 'complete-player', programName: 'Complete Player Development', reason: 'Well-rounded improvement across all skills' }
  }
  
  return programMap[goalCategory] || programMap['GENERAL_IMPROVEMENT']
}

// Create goal suggestion from conversation
export function createGoalSuggestion(skillArea: string, userMessage: string): {
  title: string
  description: string
  category: string
  suggestedMilestones: string[]
} {
  const goalTemplates: Record<string, { title: string, description: string, milestones: string[] }> = {
    'SERVE_IMPROVEMENT': {
      title: 'Improve Serve Accuracy',
      description: 'Develop a consistent, accurate serve that hits targets reliably',
      milestones: ['Hit 70% of serves in target zone', 'Develop 2 serve variations', 'Add depth to all serves']
    },
    'DINK_MASTERY': {
      title: 'Master the Dink Game',
      description: 'Build patience and precision at the kitchen line',
      milestones: ['Sustain 20 dink rallies consistently', 'Hit to all 4 corners', 'Add spin variations']
    },
    'THIRD_SHOT_DROPS': {
      title: 'Perfect Third Shot Drops',
      description: 'Develop reliable third shot drops to transition to the net',
      milestones: ['Land 60% of drops in kitchen', 'Develop drop from both forehand/backhand', 'Use drops under pressure']
    },
    'FOOTWORK': {
      title: 'Improve Court Movement',
      description: 'Enhance footwork and positioning for better shot preparation',
      milestones: ['Master split step timing', 'Improve lateral movement', 'Faster transition to kitchen']
    },
    'MENTAL_GAME': {
      title: 'Strengthen Mental Game',
      description: 'Build mental resilience and focus under pressure',
      milestones: ['Develop pre-point routine', 'Master reset breathing', 'Stay positive after errors']
    },
    'GENERAL_IMPROVEMENT': {
      title: 'Elevate Overall Game',
      description: 'Comprehensive improvement across all skill areas',
      milestones: ['Improve rating by 0.5', 'Win 60% of matches', 'Master 3 new shots']
    }
  }
  
  const template = goalTemplates[skillArea] || goalTemplates['GENERAL_IMPROVEMENT']
  
  return {
    title: template.title,
    description: template.description,
    category: skillArea,
    suggestedMilestones: template.milestones
  }
}

// Navigation destinations
export const NAVIGATION_DESTINATIONS: Record<string, { path: string, name: string }> = {
  'goals': { path: '/progress/goals', name: 'Goals & Milestones' },
  'drills': { path: '/train/drills', name: 'Drill Library' },
  'programs': { path: '/train/programs', name: 'Training Programs' },
  'video_analysis': { path: '/train/video', name: 'Video Analysis Lab' },
  'match_history': { path: '/progress/matches', name: 'Match History' },
  'tournaments': { path: '/tournaments', name: 'Tournament Hub' },
  'settings': { path: '/settings', name: 'Settings' },
  'profile': { path: '/profile', name: 'Profile' }
}
