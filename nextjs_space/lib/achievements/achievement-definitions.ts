/**
 * Achievement Definitions for Mindful Champion
 * 
 * This file contains all achievement definitions that will be seeded into the database.
 * Each achievement has a unique ID, tier, category, requirements, and point value.
 */

export interface AchievementRequirement {
  type: 'drill_completion' | 'section_completion' | 'level_completion' | 'multi_section' | 'ultimate';
  criteria: {
    category?: string;
    completions?: number;
    skillLevel?: string;
    sections?: string[];
    allSections?: boolean;
  };
}

export interface AchievementDefinition {
  achievementId: string;
  name: string;
  description: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'BADGE' | 'CROWN';
  category: string;
  icon: string;
  badgeUrl?: string;
  requirement: AchievementRequirement;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  order: number;
}

export const achievementDefinitions: AchievementDefinition[] = [
  // ============================================================================
  // SERVING ACHIEVEMENTS
  // ============================================================================
  {
    achievementId: 'serving_bronze',
    name: 'Serving Bronze Medal',
    description: 'Complete 1 serving drill to earn your bronze medal',
    tier: 'BRONZE',
    category: 'SERVING',
    icon: '🥉',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'serving',
        completions: 1,
      },
    },
    points: 10,
    rarity: 'common',
    order: 1,
  },
  {
    achievementId: 'serving_silver',
    name: 'Serving Silver Medal',
    description: 'Complete 5 serving drills to upgrade to silver',
    tier: 'SILVER',
    category: 'SERVING',
    icon: '🥈',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'serving',
        completions: 5,
      },
    },
    points: 25,
    rarity: 'common',
    order: 2,
  },
  {
    achievementId: 'serving_gold',
    name: 'Serving Gold Medal',
    description: 'Complete 10 serving drills to achieve gold status',
    tier: 'GOLD',
    category: 'SERVING',
    icon: '🥇',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'serving',
        completions: 10,
      },
    },
    points: 50,
    rarity: 'rare',
    order: 3,
  },
  {
    achievementId: 'serving_master',
    name: 'Serving Master',
    description: 'Complete all serving drills to master the serve',
    tier: 'BADGE',
    category: 'SERVING',
    icon: '🎯',
    requirement: {
      type: 'section_completion',
      criteria: {
        category: 'serving',
      },
    },
    points: 100,
    rarity: 'epic',
    order: 4,
  },

  // ============================================================================
  // RETURN OF SERVE ACHIEVEMENTS
  // ============================================================================
  {
    achievementId: 'return_bronze',
    name: 'Return Bronze Medal',
    description: 'Complete 1 return of serve drill',
    tier: 'BRONZE',
    category: 'RETURN_OF_SERVE',
    icon: '🥉',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'return_of_serve',
        completions: 1,
      },
    },
    points: 10,
    rarity: 'common',
    order: 5,
  },
  {
    achievementId: 'return_silver',
    name: 'Return Silver Medal',
    description: 'Complete 5 return of serve drills',
    tier: 'SILVER',
    category: 'RETURN_OF_SERVE',
    icon: '🥈',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'return_of_serve',
        completions: 5,
      },
    },
    points: 25,
    rarity: 'common',
    order: 6,
  },
  {
    achievementId: 'return_gold',
    name: 'Return Gold Medal',
    description: 'Complete 10 return of serve drills',
    tier: 'GOLD',
    category: 'RETURN_OF_SERVE',
    icon: '🥇',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'return_of_serve',
        completions: 10,
      },
    },
    points: 50,
    rarity: 'rare',
    order: 7,
  },
  {
    achievementId: 'return_specialist',
    name: 'Return Specialist',
    description: 'Complete all return of serve drills',
    tier: 'BADGE',
    category: 'RETURN_OF_SERVE',
    icon: '↩️',
    requirement: {
      type: 'section_completion',
      criteria: {
        category: 'return_of_serve',
      },
    },
    points: 100,
    rarity: 'epic',
    order: 8,
  },

  // ============================================================================
  // DINKING ACHIEVEMENTS
  // ============================================================================
  {
    achievementId: 'dinking_bronze',
    name: 'Dinking Bronze Medal',
    description: 'Complete 1 dinking drill',
    tier: 'BRONZE',
    category: 'DINKING',
    icon: '🥉',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'dinking',
        completions: 1,
      },
    },
    points: 10,
    rarity: 'common',
    order: 9,
  },
  {
    achievementId: 'dinking_silver',
    name: 'Dinking Silver Medal',
    description: 'Complete 5 dinking drills',
    tier: 'SILVER',
    category: 'DINKING',
    icon: '🥈',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'dinking',
        completions: 5,
      },
    },
    points: 25,
    rarity: 'common',
    order: 10,
  },
  {
    achievementId: 'dinking_gold',
    name: 'Dinking Gold Medal',
    description: 'Complete 10 dinking drills',
    tier: 'GOLD',
    category: 'DINKING',
    icon: '🥇',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'dinking',
        completions: 10,
      },
    },
    points: 50,
    rarity: 'rare',
    order: 11,
  },
  {
    achievementId: 'dinking_expert',
    name: 'Dinking Expert',
    description: 'Complete all dinking drills and dominate the kitchen',
    tier: 'BADGE',
    category: 'DINKING',
    icon: '🏓',
    requirement: {
      type: 'section_completion',
      criteria: {
        category: 'dinking',
      },
    },
    points: 100,
    rarity: 'epic',
    order: 12,
  },

  // ============================================================================
  // THIRD SHOT ACHIEVEMENTS
  // ============================================================================
  {
    achievementId: 'third_shot_bronze',
    name: 'Third Shot Bronze Medal',
    description: 'Complete 1 third shot drill',
    tier: 'BRONZE',
    category: 'THIRD_SHOT',
    icon: '🥉',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'third_shot',
        completions: 1,
      },
    },
    points: 10,
    rarity: 'common',
    order: 13,
  },
  {
    achievementId: 'third_shot_silver',
    name: 'Third Shot Silver Medal',
    description: 'Complete 5 third shot drills',
    tier: 'SILVER',
    category: 'THIRD_SHOT',
    icon: '🥈',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'third_shot',
        completions: 5,
      },
    },
    points: 25,
    rarity: 'common',
    order: 14,
  },
  {
    achievementId: 'third_shot_gold',
    name: 'Third Shot Gold Medal',
    description: 'Complete 10 third shot drills',
    tier: 'GOLD',
    category: 'THIRD_SHOT',
    icon: '🥇',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'third_shot',
        completions: 10,
      },
    },
    points: 50,
    rarity: 'rare',
    order: 15,
  },
  {
    achievementId: 'third_shot_specialist',
    name: 'Third Shot Specialist',
    description: 'Complete all third shot drills and master this crucial shot',
    tier: 'BADGE',
    category: 'THIRD_SHOT',
    icon: '🏓',
    requirement: {
      type: 'section_completion',
      criteria: {
        category: 'third_shot',
      },
    },
    points: 100,
    rarity: 'epic',
    order: 16,
  },

  // ============================================================================
  // VOLLEY ACHIEVEMENTS
  // ============================================================================
  {
    achievementId: 'volley_bronze',
    name: 'Volley Bronze Medal',
    description: 'Complete 1 volley drill',
    tier: 'BRONZE',
    category: 'VOLLEY',
    icon: '🥉',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'volleys',
        completions: 1,
      },
    },
    points: 10,
    rarity: 'common',
    order: 17,
  },
  {
    achievementId: 'volley_silver',
    name: 'Volley Silver Medal',
    description: 'Complete 5 volley drills',
    tier: 'SILVER',
    category: 'VOLLEY',
    icon: '🥈',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'volleys',
        completions: 5,
      },
    },
    points: 25,
    rarity: 'common',
    order: 18,
  },
  {
    achievementId: 'volley_gold',
    name: 'Volley Gold Medal',
    description: 'Complete 10 volley drills',
    tier: 'GOLD',
    category: 'VOLLEY',
    icon: '🥇',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'volleys',
        completions: 10,
      },
    },
    points: 50,
    rarity: 'rare',
    order: 19,
  },
  {
    achievementId: 'volley_champion',
    name: 'Volley Champion',
    description: 'Complete all volley drills and become a volley master',
    tier: 'BADGE',
    category: 'VOLLEY',
    icon: '⚡',
    requirement: {
      type: 'section_completion',
      criteria: {
        category: 'volleys',
      },
    },
    points: 100,
    rarity: 'epic',
    order: 20,
  },

  // ============================================================================
  // STRATEGY ACHIEVEMENTS
  // ============================================================================
  {
    achievementId: 'strategy_bronze',
    name: 'Strategy Bronze Medal',
    description: 'Complete 1 strategy drill',
    tier: 'BRONZE',
    category: 'STRATEGY',
    icon: '🥉',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'strategy',
        completions: 1,
      },
    },
    points: 10,
    rarity: 'common',
    order: 21,
  },
  {
    achievementId: 'strategy_silver',
    name: 'Strategy Silver Medal',
    description: 'Complete 5 strategy drills',
    tier: 'SILVER',
    category: 'STRATEGY',
    icon: '🥈',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'strategy',
        completions: 5,
      },
    },
    points: 25,
    rarity: 'common',
    order: 22,
  },
  {
    achievementId: 'strategy_gold',
    name: 'Strategy Gold Medal',
    description: 'Complete 10 strategy drills',
    tier: 'GOLD',
    category: 'STRATEGY',
    icon: '🥇',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'strategy',
        completions: 10,
      },
    },
    points: 50,
    rarity: 'rare',
    order: 23,
  },
  {
    achievementId: 'strategy_guru',
    name: 'Strategy Guru',
    description: 'Complete all strategy drills and think like a pro',
    tier: 'BADGE',
    category: 'STRATEGY',
    icon: '🧠',
    requirement: {
      type: 'section_completion',
      criteria: {
        category: 'strategy',
      },
    },
    points: 100,
    rarity: 'epic',
    order: 24,
  },

  // ============================================================================
  // FOOTWORK ACHIEVEMENTS
  // ============================================================================
  {
    achievementId: 'footwork_bronze',
    name: 'Footwork Bronze Medal',
    description: 'Complete 1 footwork drill',
    tier: 'BRONZE',
    category: 'FOOTWORK',
    icon: '🥉',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'footwork',
        completions: 1,
      },
    },
    points: 10,
    rarity: 'common',
    order: 25,
  },
  {
    achievementId: 'footwork_silver',
    name: 'Footwork Silver Medal',
    description: 'Complete 5 footwork drills',
    tier: 'SILVER',
    category: 'FOOTWORK',
    icon: '🥈',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'footwork',
        completions: 5,
      },
    },
    points: 25,
    rarity: 'common',
    order: 26,
  },
  {
    achievementId: 'footwork_gold',
    name: 'Footwork Gold Medal',
    description: 'Complete 10 footwork drills',
    tier: 'GOLD',
    category: 'FOOTWORK',
    icon: '🥇',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'footwork',
        completions: 10,
      },
    },
    points: 50,
    rarity: 'rare',
    order: 27,
  },
  {
    achievementId: 'footwork_master',
    name: 'Footwork Master',
    description: 'Complete all footwork drills and move like a pro',
    tier: 'BADGE',
    category: 'FOOTWORK',
    icon: '👟',
    requirement: {
      type: 'section_completion',
      criteria: {
        category: 'footwork',
      },
    },
    points: 100,
    rarity: 'epic',
    order: 28,
  },

  // ============================================================================
  // MENTAL GAME ACHIEVEMENTS
  // ============================================================================
  {
    achievementId: 'mental_bronze',
    name: 'Mental Game Bronze Medal',
    description: 'Complete 1 mental game drill',
    tier: 'BRONZE',
    category: 'MENTAL_GAME',
    icon: '🥉',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'mental_game',
        completions: 1,
      },
    },
    points: 10,
    rarity: 'common',
    order: 29,
  },
  {
    achievementId: 'mental_silver',
    name: 'Mental Game Silver Medal',
    description: 'Complete 5 mental game drills',
    tier: 'SILVER',
    category: 'MENTAL_GAME',
    icon: '🥈',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'mental_game',
        completions: 5,
      },
    },
    points: 25,
    rarity: 'common',
    order: 30,
  },
  {
    achievementId: 'mental_gold',
    name: 'Mental Game Gold Medal',
    description: 'Complete 10 mental game drills',
    tier: 'GOLD',
    category: 'MENTAL_GAME',
    icon: '🥇',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'mental_game',
        completions: 10,
      },
    },
    points: 50,
    rarity: 'rare',
    order: 31,
  },
  {
    achievementId: 'mental_champion',
    name: 'Mental Game Champion',
    description: 'Complete all mental game drills and develop an unbreakable mindset',
    tier: 'BADGE',
    category: 'MENTAL_GAME',
    icon: '🧘',
    requirement: {
      type: 'section_completion',
      criteria: {
        category: 'mental_game',
      },
    },
    points: 100,
    rarity: 'epic',
    order: 32,
  },

  // ============================================================================
  // ADVANCED TECHNIQUES ACHIEVEMENTS
  // ============================================================================
  {
    achievementId: 'advanced_bronze',
    name: 'Advanced Techniques Bronze Medal',
    description: 'Complete 1 advanced technique drill',
    tier: 'BRONZE',
    category: 'ADVANCED_TECHNIQUES',
    icon: '🥉',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'advanced_techniques',
        completions: 1,
      },
    },
    points: 10,
    rarity: 'common',
    order: 33,
  },
  {
    achievementId: 'advanced_silver',
    name: 'Advanced Techniques Silver Medal',
    description: 'Complete 5 advanced technique drills',
    tier: 'SILVER',
    category: 'ADVANCED_TECHNIQUES',
    icon: '🥈',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'advanced_techniques',
        completions: 5,
      },
    },
    points: 25,
    rarity: 'common',
    order: 34,
  },
  {
    achievementId: 'advanced_gold',
    name: 'Advanced Techniques Gold Medal',
    description: 'Complete 10 advanced technique drills',
    tier: 'GOLD',
    category: 'ADVANCED_TECHNIQUES',
    icon: '🥇',
    requirement: {
      type: 'drill_completion',
      criteria: {
        category: 'advanced_techniques',
        completions: 10,
      },
    },
    points: 50,
    rarity: 'rare',
    order: 35,
  },
  {
    achievementId: 'advanced_master',
    name: 'Advanced Techniques Master',
    description: 'Complete all advanced technique drills and unlock elite skills',
    tier: 'BADGE',
    category: 'ADVANCED_TECHNIQUES',
    icon: '⚔️',
    requirement: {
      type: 'section_completion',
      criteria: {
        category: 'advanced_techniques',
      },
    },
    points: 100,
    rarity: 'epic',
    order: 36,
  },

  // ============================================================================
  // SKILL LEVEL ACHIEVEMENTS
  // ============================================================================
  {
    achievementId: 'beginner_champion',
    name: 'Beginner Champion',
    description: 'Complete all Beginner level sections and graduate to intermediate',
    tier: 'BADGE',
    category: 'SKILL_LEVEL',
    icon: '🌱',
    requirement: {
      type: 'level_completion',
      criteria: {
        skillLevel: 'BEGINNER',
      },
    },
    points: 250,
    rarity: 'epic',
    order: 37,
  },
  {
    achievementId: 'intermediate_master',
    name: 'Intermediate Master',
    description: 'Complete all Intermediate level sections and advance to the next tier',
    tier: 'BADGE',
    category: 'SKILL_LEVEL',
    icon: '🌿',
    requirement: {
      type: 'level_completion',
      criteria: {
        skillLevel: 'INTERMEDIATE',
      },
    },
    points: 250,
    rarity: 'epic',
    order: 38,
  },
  {
    achievementId: 'advanced_expert',
    name: 'Advanced Expert',
    description: 'Complete all Advanced level sections and approach pro status',
    tier: 'BADGE',
    category: 'SKILL_LEVEL',
    icon: '🌳',
    requirement: {
      type: 'level_completion',
      criteria: {
        skillLevel: 'ADVANCED',
      },
    },
    points: 250,
    rarity: 'legendary',
    order: 39,
  },
  {
    achievementId: 'pro_legend',
    name: 'Pro Legend',
    description: 'Complete all Pro level sections and join the elite ranks',
    tier: 'BADGE',
    category: 'SKILL_LEVEL',
    icon: '🏆',
    requirement: {
      type: 'level_completion',
      criteria: {
        skillLevel: 'PRO',
      },
    },
    points: 250,
    rarity: 'legendary',
    order: 40,
  },

  // ============================================================================
  // MULTI-SECTION ACHIEVEMENTS
  // ============================================================================
  {
    achievementId: 'fundamentals_ace',
    name: 'Fundamentals Ace',
    description: 'Complete both Serving and Return sections to master the first two shots',
    tier: 'BADGE',
    category: 'MULTI_SECTION',
    icon: '🎯',
    requirement: {
      type: 'multi_section',
      criteria: {
        sections: ['serving', 'return_of_serve'],
      },
    },
    points: 200,
    rarity: 'epic',
    order: 41,
  },
  {
    achievementId: 'kitchen_dominator',
    name: 'Kitchen Dominator',
    description: 'Complete both Dinking and Volley sections to control the net',
    tier: 'BADGE',
    category: 'MULTI_SECTION',
    icon: '👨‍🍳',
    requirement: {
      type: 'multi_section',
      criteria: {
        sections: ['dinking', 'volleys'],
      },
    },
    points: 200,
    rarity: 'epic',
    order: 42,
  },
  {
    achievementId: 'court_commander',
    name: 'Court Commander',
    description: 'Complete both Footwork and Strategy sections to master court movement and tactics',
    tier: 'BADGE',
    category: 'MULTI_SECTION',
    icon: '🗺️',
    requirement: {
      type: 'multi_section',
      criteria: {
        sections: ['footwork', 'strategy'],
      },
    },
    points: 200,
    rarity: 'epic',
    order: 43,
  },
  {
    achievementId: 'complete_player',
    name: 'Complete Player',
    description: 'Complete all fundamental categories (Serving, Return, Dinking, Third Shot, Volley)',
    tier: 'BADGE',
    category: 'MULTI_SECTION',
    icon: '💪',
    requirement: {
      type: 'multi_section',
      criteria: {
        sections: ['serving', 'return_of_serve', 'dinking', 'third_shot', 'volleys'],
      },
    },
    points: 200,
    rarity: 'legendary',
    order: 44,
  },

  // ============================================================================
  // ULTIMATE ACHIEVEMENT
  // ============================================================================
  {
    achievementId: 'mindful_champion_crown',
    name: 'Mindful Champion Crown',
    description: 'Complete ALL training programs across ALL skill levels to earn the ultimate achievement',
    tier: 'CROWN',
    category: 'ULTIMATE',
    icon: '👑',
    requirement: {
      type: 'ultimate',
      criteria: {
        allSections: true,
      },
    },
    points: 1000,
    rarity: 'legendary',
    order: 45,
  },
];

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: string): AchievementDefinition[] {
  return achievementDefinitions.filter((a) => a.category === category);
}

/**
 * Get achievements by tier
 */
export function getAchievementsByTier(tier: string): AchievementDefinition[] {
  return achievementDefinitions.filter((a) => a.tier === tier);
}

/**
 * Get achievement by ID
 */
export function getAchievementById(achievementId: string): AchievementDefinition | undefined {
  return achievementDefinitions.find((a) => a.achievementId === achievementId);
}

/**
 * Get all medal achievements (Bronze, Silver, Gold)
 */
export function getMedalAchievements(): AchievementDefinition[] {
  return achievementDefinitions.filter((a) => ['BRONZE', 'SILVER', 'GOLD'].includes(a.tier));
}

/**
 * Get all badge achievements
 */
export function getBadgeAchievements(): AchievementDefinition[] {
  return achievementDefinitions.filter((a) => a.tier === 'BADGE');
}

/**
 * Get the crown achievement
 */
export function getCrownAchievement(): AchievementDefinition | undefined {
  return achievementDefinitions.find((a) => a.tier === 'CROWN');
}
