// Coach Kai Goal Functions - Deep Goals Integration
// Enables Kai to create, update, and celebrate goals via chat

import { prisma } from '@/lib/db';
import { GoalCategory } from '@prisma/client';

export const GOAL_CATEGORY_MAP: Record<string, GoalCategory> = {
  'serve': 'SKILL_IMPROVEMENT',
  'backhand': 'SKILL_IMPROVEMENT', 
  'forehand': 'SKILL_IMPROVEMENT',
  'dink': 'SKILL_IMPROVEMENT',
  'volley': 'SKILL_IMPROVEMENT',
  'footwork': 'SKILL_IMPROVEMENT',
  'third shot': 'SKILL_IMPROVEMENT',
  'tournament': 'TOURNAMENT',
  'compete': 'TOURNAMENT',
  'match': 'TOURNAMENT',
  'fitness': 'FITNESS',
  'endurance': 'FITNESS',
  'strength': 'FITNESS',
  'mental': 'MENTAL_GAME',
  'focus': 'MENTAL_GAME',
  'confidence': 'MENTAL_GAME',
  'partner': 'SOCIAL',
  'doubles': 'SOCIAL',
  'community': 'SOCIAL',
};

export const CELEBRATION_MESSAGES = [
  "🎉 AMAZING! You crushed that goal! I'm so proud of you!",
  "🏆 CHAMPION MOVE! Goal completed - you're unstoppable!",
  "🌟 YES! Another milestone conquered! Keep this energy!",
  "🔥 INCREDIBLE! You did it! This is what champions are made of!",
  "✨ WOW! Goal achieved! You're on fire, keep it going!",
  "🎯 BULLSEYE! Perfect execution on that goal!",
  "💪 LEGENDARY! You showed that goal who's boss!",
  "🚀 STELLAR! You're leveling up faster than I expected!"
];

export const PROGRESS_ENCOURAGEMENTS = {
  low: [ // 0-25%
    "Great start! Every journey begins with a single step. 🌱",
    "You've planted the seed - now let's watch it grow! 🌟",
    "The foundation is set. Keep building! 💪"
  ],
  medium: [ // 26-50%
    "You're gaining momentum! Halfway there! 🔥",
    "Look at you go! The finish line is getting closer! 🎯",
    "Solid progress! Your dedication is showing! ⭐"
  ],
  high: [ // 51-75%
    "You can almost taste victory! Keep pushing! 🏆",
    "So close! Don't let up now - you've got this! 💪",
    "The end is in sight! Final push time! 🚀"
  ],
  almostThere: [ // 76-99%
    "ONE MORE PUSH! You're right at the finish line! 🎉",
    "SO CLOSE! Victory is within your grasp! 🏅",
    "Almost there! This is YOUR moment! ✨"
  ]
};

// Detect if user wants to create a goal
export function detectGoalCreationIntent(message: string): boolean {
  const lowerMsg = message.toLowerCase();
  const createPatterns = [
    /help me (set|create|make|start).*(goal|objective)/i,
    /i want to (improve|get better|work on)/i,
    /set.*(goal|target|objective)/i,
    /create.*(goal|plan)/i,
    /my goal is/i,
    /i('d| would) like to (achieve|accomplish|reach)/i,
    /can you help me with.*(goal|improvement)/i
  ];
  return createPatterns.some(p => p.test(lowerMsg));
}

// Detect if user wants to update progress
export function detectProgressUpdateIntent(message: string): boolean {
  const lowerMsg = message.toLowerCase();
  const updatePatterns = [
    /i (did|completed|finished|practiced)/i,
    /just (finished|completed|did|practiced)/i,
    /update.*progress/i,
    /log.*(practice|session|drill)/i,
    /mark.*(done|complete)/i,
    /i('ve| have) been (working|practicing)/i
  ];
  return updatePatterns.some(p => p.test(lowerMsg));
}

// Detect what skill area user is interested in
export function extractSkillArea(message: string): string | null {
  const lowerMsg = message.toLowerCase();
  const skillKeywords = [
    'serve', 'serving', 'backhand', 'forehand', 'dink', 'dinking',
    'volley', 'footwork', 'third shot', 'drop shot', 'lob',
    'return', 'spin', 'power', 'accuracy', 'consistency'
  ];
  
  for (const skill of skillKeywords) {
    if (lowerMsg.includes(skill)) return skill;
  }
  return null;
}

// Get celebration message
export function getCelebrationMessage(): string {
  return CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
}

// Get progress encouragement based on percentage
export function getProgressEncouragement(progress: number): string {
  const bracket = progress <= 25 ? 'low' 
    : progress <= 50 ? 'medium'
    : progress <= 75 ? 'high'
    : 'almostThere';
  const messages = PROGRESS_ENCOURAGEMENTS[bracket];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Suggest milestones for a skill area
export function suggestMilestones(skillArea: string): { title: string; description: string }[] {
  const milestoneTemplates: Record<string, { title: string; description: string }[]> = {
    'serve': [
      { title: 'Master the Basic Motion', description: 'Practice 50 serves with correct form' },
      { title: 'Improve Placement', description: 'Land 7/10 serves in target zone' },
      { title: 'Add Power', description: 'Increase serve speed while maintaining accuracy' },
      { title: 'Game Application', description: 'Successfully use new serve in 3 matches' }
    ],
    'backhand': [
      { title: 'Shadow Practice', description: 'Complete 100 shadow backhand swings' },
      { title: 'Wall Drill', description: 'Rally against wall 50 times consecutively' },
      { title: 'Partner Rally', description: 'Complete 20-shot backhand rally' },
      { title: 'Match Integration', description: 'Hit confident backhands in competitive play' }
    ],
    'dink': [
      { title: 'Soft Touch Development', description: 'Practice 100 kitchen line dinks' },
      { title: 'Placement Control', description: 'Hit 8/10 dinks to target spots' },
      { title: 'Patience Drill', description: 'Complete 30-dink rally without speeding up' },
      { title: 'Strategic Dinking', description: 'Win points using patient dink exchanges' }
    ],
    'default': [
      { title: 'Learn the Basics', description: 'Understand proper technique and form' },
      { title: 'Practice Drills', description: 'Complete 5 focused practice sessions' },
      { title: 'Build Consistency', description: 'Achieve 80% success rate in drills' },
      { title: 'Game Application', description: 'Successfully use in match play' }
    ]
  };
  
  return milestoneTemplates[skillArea.toLowerCase()] || milestoneTemplates['default'];
}

// Create goal from chat context
export async function createGoalFromChat(
  userId: string,
  title: string,
  skillArea: string | null,
  targetDays: number = 30
): Promise<{ success: boolean; goal?: any; error?: string }> {
  try {
    const category = skillArea 
      ? (GOAL_CATEGORY_MAP[skillArea.toLowerCase()] || 'SKILL_IMPROVEMENT')
      : 'CUSTOM';
    
    const milestones = skillArea ? suggestMilestones(skillArea) : suggestMilestones('default');
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + targetDays);
    
    const goalId = `goal_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const goal = await prisma.goal.create({
      data: {
        id: goalId,
        userId,
        title,
        description: `Goal created with Coach Kai to improve ${skillArea || 'pickleball skills'}`,
        category,
        targetDate,
        updatedAt: new Date(),
        Milestone: {
          create: milestones.map((m, i) => ({
            id: `milestone_${goalId}_${i}_${Math.random().toString(36).substring(7)}`,
            title: m.title,
            description: m.description,
            order: i,
            updatedAt: new Date()
          }))
        }
      },
      include: { Milestone: true }
    });
    
    return { success: true, goal };
  } catch (error: any) {
    console.error('[Goal Functions] Create goal error:', error);
    return { success: false, error: error.message };
  }
}

// Update goal progress from chat
export async function updateGoalProgress(
  userId: string,
  goalId: string,
  progressIncrement: number
): Promise<{ success: boolean; goal?: any; celebration?: string; error?: string }> {
  try {
    const existingGoal = await prisma.goal.findFirst({
      where: { id: goalId, userId }
    });
    
    if (!existingGoal) {
      return { success: false, error: 'Goal not found' };
    }
    
    const newProgress = Math.min(100, (existingGoal.progress || 0) + progressIncrement);
    const isCompleted = newProgress >= 100;
    
    const goal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        progress: newProgress,
        status: isCompleted ? 'COMPLETED' : 'ACTIVE',
        completedAt: isCompleted ? new Date() : null
      },
      include: { Milestone: true }
    });
    
    const response: { success: boolean; goal: any; celebration?: string } = {
      success: true,
      goal
    };
    
    if (isCompleted) {
      response.celebration = getCelebrationMessage();
    }
    
    return response;
  } catch (error: any) {
    console.error('[Goal Functions] Update progress error:', error);
    return { success: false, error: error.message };
  }
}

// Complete a milestone
export async function completeMilestone(
  userId: string,
  milestoneId: string
): Promise<{ success: boolean; milestone?: any; goalProgress?: number; celebration?: string; error?: string }> {
  try {
    // Get milestone with its goal
    const milestone = await prisma.milestone.findFirst({
      where: { id: milestoneId },
      include: { 
        Goal: {
          include: { Milestone: true }
        }
      }
    });
    
    if (!milestone || milestone.Goal?.userId !== userId) {
      return { success: false, error: 'Milestone not found' };
    }
    
    // Update milestone
    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });
    
    // Calculate new goal progress
    const totalMilestones = milestone.Goal?.Milestone?.length || 1;
    const completedMilestones = (milestone.Goal?.Milestone?.filter((m: any) => m.status === 'COMPLETED')?.length || 0) + 1;
    const newProgress = Math.round((completedMilestones / totalMilestones) * 100);
    
    // Update goal progress
    const isGoalCompleted = newProgress >= 100;
    await prisma.goal.update({
      where: { id: milestone.goalId },
      data: {
        progress: newProgress,
        status: isGoalCompleted ? 'COMPLETED' : 'ACTIVE',
        completedAt: isGoalCompleted ? new Date() : null
      }
    });
    
    return {
      success: true,
      milestone: updatedMilestone,
      goalProgress: newProgress,
      celebration: isGoalCompleted ? getCelebrationMessage() : getProgressEncouragement(newProgress)
    };
  } catch (error: any) {
    console.error('[Goal Functions] Complete milestone error:', error);
    return { success: false, error: error.message };
  }
}

// Get user's goal context for Kai
export async function getUserGoalContext(userId: string): Promise<{
  activeGoals: any[];
  recentlyCompleted: any[];
  totalProgress: number;
  streak: number;
  nextMilestone: any | null;
}> {
  try {
    const [activeGoals, completedGoals] = await Promise.all([
      prisma.goal.findMany({
        where: { userId, status: 'ACTIVE' },
        include: { Milestone: { orderBy: { order: 'asc' } } },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.goal.findMany({
        where: { userId, status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
        take: 3
      })
    ]);
    
    // Map to consistent format for frontend
    const formattedActiveGoals = activeGoals.map((g: any) => ({
      ...g,
      milestones: g.Milestone || []
    }));
    
    // Calculate total progress across active goals
    const totalProgress = formattedActiveGoals.length > 0
      ? formattedActiveGoals.reduce((sum: number, g: any) => sum + (g.progress || 0), 0) / formattedActiveGoals.length
      : 0;
    
    // Find next incomplete milestone
    let nextMilestone = null;
    for (const goal of formattedActiveGoals) {
      const incompleteMilestone = goal.milestones?.find((m: any) => m.status !== 'COMPLETED');
      if (incompleteMilestone) {
        nextMilestone = { ...incompleteMilestone, goalTitle: goal.title, goalId: goal.id };
        break;
      }
    }
    
    // Calculate streak (simplified)
    const recentCompletions = completedGoals.filter((g: any) => {
      if (!g.completedAt) return false;
      const daysSince = (Date.now() - new Date(g.completedAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    });
    
    return {
      activeGoals: formattedActiveGoals,
      recentlyCompleted: completedGoals,
      totalProgress: Math.round(totalProgress),
      streak: recentCompletions.length,
      nextMilestone
    };
  } catch (error) {
    console.error('[Goal Functions] Get context error:', error);
    return {
      activeGoals: [],
      recentlyCompleted: [],
      totalProgress: 0,
      streak: 0,
      nextMilestone: null
    };
  }
}
