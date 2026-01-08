// TypeScript interface for Mindful Champion Pickleball Drill Library
// Generated: December 22, 2025

export type DrillDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'pro';

export type AgeGroup = 
  | 'Kids 8-12' 
  | 'Teens 13-17' 
  | 'Adults 18-55' 
  | 'Seniors 55+' 
  | 'All Ages';

export type Gender = 'Male' | 'Female' | 'All';

export type DrillCategory = 
  | 'Warm-up & Conditioning'
  | 'Footwork & Movement'
  | 'Dinking Drills'
  | 'Serving & Return Drills'
  | 'Volley Drills'
  | 'Third Shot Drops'
  | 'Overhead & Lob Drills'
  | 'Strategy & Positioning'
  | 'Partner/Team Drills'
  | 'Solo Practice Drills'
  | 'Cool-down & Recovery';

export interface VideoResource {
  url: string;
  title: string;
  description: string;
}

export interface PickleballDrill {
  id: number;
  title: string;
  tagline: string;
  description: string;
  category: DrillCategory;
  difficulty: DrillDifficulty;
  ageGroups: AgeGroup[];
  gender: Gender;
  skillLevelRange: string; // e.g., "1.0-2.5", "3.0-3.5", "4.0-4.5", "5.0+"
  duration: number; // in minutes
  playersRequired: number;
  equipment: string[];
  focusAreas: string[];
  instructions: string[];
  proTips: string[];
  commonMistakes: string[];
  successMetrics: string;
  videos: VideoResource[];
}

// Example usage:
// import drillsData from './pickleball_drills.json';
// const drills: PickleballDrill[] = drillsData;

// Filter examples:
// const beginnerDrills = drills.filter(d => d.difficulty === 'beginner');
// const dinkingDrills = drills.filter(d => d.category === 'Dinking Drills');
// const seniorDrills = drills.filter(d => d.ageGroups.includes('Seniors 55+'));
// const soloDrills = drills.filter(d => d.playersRequired === 1);
// const quickDrills = drills.filter(d => d.duration <= 15);

// Search by focus area:
// const footworkDrills = drills.filter(d => 
//   d.focusAreas.some(area => area.toLowerCase().includes('footwork'))
// );

// Get drills for specific skill level:
// function getDrillsForSkillLevel(level: number): PickleballDrill[] {
//   return drills.filter(drill => {
//     const [min, max] = drill.skillLevelRange.split('-').map(s => parseFloat(s));
//     return level >= min && level <= (max || 5.0);
//   });
// }

// Database schema suggestion (Prisma example):
/*
model Drill {
  id                Int       @id @default(autoincrement())
  title             String
  tagline           String
  description       String    @db.Text
  category          String
  difficulty        String
  ageGroups         String[]
  gender            String
  skillLevelRange   String
  duration          Int
  playersRequired   Int
  equipment         String[]
  focusAreas        String[]
  instructions      String[]
  proTips           String[]
  commonMistakes    String[]
  successMetrics    String    @db.Text
  videos            Json      // Array of VideoResource objects
  
  // Additional fields for tracking
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  userProgress      UserDrillProgress[]
  userFavorites     UserFavoriteDrill[]
  
  @@index([category])
  @@index([difficulty])
  @@index([duration])
}

model UserDrillProgress {
  id              Int       @id @default(autoincrement())
  userId          String
  drillId         Int
  completedAt     DateTime  @default(now())
  rating          Int?      // 1-5 stars
  notes           String?   @db.Text
  
  drill           Drill     @relation(fields: [drillId], references: [id])
  
  @@unique([userId, drillId, completedAt])
  @@index([userId])
}

model UserFavoriteDrill {
  id              Int       @id @default(autoincrement())
  userId          String
  drillId         Int
  addedAt         DateTime  @default(now())
  
  drill           Drill     @relation(fields: [drillId], references: [id])
  
  @@unique([userId, drillId])
  @@index([userId])
}
*/
