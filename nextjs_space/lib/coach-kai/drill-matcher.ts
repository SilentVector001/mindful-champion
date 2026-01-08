// @ts-nocheck
// Drill Matcher - Match user needs to available drills

import { drillsDatabase, Drill } from '@/lib/drills-data';
import { DrillRecommendation } from './types';

const TECHNIQUE_KEYWORDS: Record<string, string[]> = {
  serving: ['serve', 'serving', 'first shot', 'service'],
  dinking: ['dink', 'dinking', 'soft game', 'kitchen', 'nvz', 'net play'],
  'third-shot': ['third shot', 'drop shot', 'third-shot drop', 'approach'],
  volley: ['volley', 'volleying', 'punch', 'block', 'net'],
  overhead: ['overhead', 'smash', 'lob defense', 'high ball'],
  footwork: ['footwork', 'movement', 'speed', 'agility', 'positioning'],
  returns: ['return', 'returns', 'return of serve', 'receiving'],
  backhand: ['backhand', 'weak side', 'left hand'],
  forehand: ['forehand', 'strong side', 'right hand'],
  strategy: ['strategy', 'tactics', 'game plan', 'positioning', 'doubles'],
  mental: ['mental', 'confidence', 'focus', 'pressure', 'nerves', 'anxiety']
};

export function extractTechniquesFromText(text: string): string[] {
  const lowerText = text.toLowerCase();
  const techniques: string[] = [];
  
  for (const [technique, keywords] of Object.entries(TECHNIQUE_KEYWORDS)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      techniques.push(technique);
    }
  }
  
  return techniques;
}

export function matchDrillsToTechniques(
  techniques: string[],
  skillLevel?: string,
  maxResults: number = 5
): DrillRecommendation[] {
  const recommendations: DrillRecommendation[] = [];
  const usedDrillIds = new Set<string>();
  
  // Map skill levels
  const levelMap: Record<string, string[]> = {
    'BEGINNER': ['beginner'],
    'INTERMEDIATE': ['beginner', 'intermediate'],
    'ADVANCED': ['intermediate', 'advanced'],
    'PRO': ['advanced', 'pro']
  };
  
  const allowedDifficulties = levelMap[skillLevel || 'INTERMEDIATE'] || ['beginner', 'intermediate'];
  
  for (const technique of techniques) {
    // Find drills matching this technique
    const matchingDrills = drillsDatabase.filter(drill => {
      if (usedDrillIds.has(drill.id)) return false;
      
      // Check category match
      const categoryMatch = drill.category === technique || 
        drill.focusAreas.some(f => f.toLowerCase().includes(technique));
        
      // Check difficulty match
      const difficultyMatch = allowedDifficulties.includes(drill.difficulty);
      
      return categoryMatch && difficultyMatch;
    });
    
    // Sort by popularity and effectiveness
    matchingDrills.sort((a, b) => {
      const scoreA = (a.popularityScore || 5) + (a.effectivenessRating || 3);
      const scoreB = (b.popularityScore || 5) + (b.effectivenessRating || 3);
      return scoreB - scoreA;
    });
    
    // Add top matches
    for (const drill of matchingDrills.slice(0, 2)) {
      if (recommendations.length >= maxResults) break;
      usedDrillIds.add(drill.id);
      recommendations.push({
        drillId: drill.id,
        name: drill.name,
        reason: drill.tagline,
        difficulty: drill.difficulty,
        duration: drill.duration,
        category: drill.category
      });
    }
  }
  
  // If no specific matches, add general popular drills
  if (recommendations.length === 0) {
    const popularDrills = drillsDatabase
      .filter(d => allowedDifficulties.includes(d.difficulty))
      .sort((a, b) => (b.popularityScore || 5) - (a.popularityScore || 5))
      .slice(0, maxResults);
      
    for (const drill of popularDrills) {
      recommendations.push({
        drillId: drill.id,
        name: drill.name,
        reason: drill.tagline,
        difficulty: drill.difficulty,
        duration: drill.duration,
        category: drill.category
      });
    }
  }
  
  return recommendations.slice(0, maxResults);
}

export function getDrillById(drillId: string): Drill | undefined {
  return drillsDatabase.find(d => d.id === drillId);
}

export function getDrillsByCategory(category: string, limit: number = 5): Drill[] {
  return drillsDatabase
    .filter(d => d.category === category)
    .sort((a, b) => (b.popularityScore || 5) - (a.popularityScore || 5))
    .slice(0, limit);
}
