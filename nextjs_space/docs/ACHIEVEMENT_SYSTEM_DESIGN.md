# Achievement System Design Document

## Overview
The Achievement System is a comprehensive gamification feature for Mindful Champion that motivates users to complete training programs, practice drills, and engage deeply with the platform.

## Achievement Tiers & Types

### 1. Drill Completion Achievements (Medals)
Individual drill completions within sections:
- **Bronze Medal**: Complete a drill 1 time
- **Silver Medal**: Complete a drill 5 times  
- **Gold Medal**: Complete a drill 10 times

Example: "Serving - Bronze Medal" → "Serving - Silver Medal" → "Serving - Gold Medal"

### 2. Section Completion Achievements (Badges)
Complete all drills in a category:
- **Serving Master**: Complete all serving drills
- **Dinking Expert**: Complete all dinking drills
- **Third Shot Specialist**: Complete all third shot drills
- **Volley Champion**: Complete all volley drills
- **Strategy Guru**: Complete all strategy drills
- **Advanced Techniques Master**: Complete all advanced technique drills
- **Mental Game Champion**: Complete all mental game drills

### 3. Skill Level Achievements (Level Badges)
Complete all sections at a skill level:
- **Beginner Champion**: Complete all Beginner sections
- **Intermediate Master**: Complete all Intermediate sections
- **Advanced Expert**: Complete all Advanced sections
- **Pro Legend**: Complete all Pro sections

### 4. Multi-Section Achievements (Combo Badges)
Complete multiple specific categories:
- **Fundamentals Ace**: Complete Serving + Return sections
- **Kitchen Dominator**: Complete Dinking + Volley sections
- **Court Commander**: Complete Footwork + Strategy sections
- **Complete Player**: Complete all fundamental categories

### 5. Ultimate Achievement (Crown)
- **Mindful Champion Crown**: Complete ALL training programs across ALL skill levels

## Database Schema

### Updated Achievement Model
```prisma
enum AchievementTier {
  BRONZE
  SILVER
  GOLD
  BADGE
  CROWN
}

enum AchievementCategory {
  SERVING
  RETURN_OF_SERVE
  DINKING
  THIRD_SHOT
  VOLLEY
  FOOTWORK
  STRATEGY
  MENTAL_GAME
  ADVANCED_TECHNIQUES
  SKILL_LEVEL
  MULTI_SECTION
  ULTIMATE
}

model Achievement {
  id            String              @id @default(cuid())
  achievementId String              @unique // e.g., "serving_bronze", "beginner_champion"
  name          String              // e.g., "Serving Bronze Medal"
  description   String              @db.Text
  tier          AchievementTier
  category      AchievementCategory
  icon          String?             // Icon name or URL
  badgeUrl      String?             // Image URL for badge
  requirement   Json                // Detailed requirements (see below)
  points        Int                 @default(0)
  rarity        String              @default("common") // common, rare, epic, legendary
  order         Int                 @default(0) // Display order
  isActive      Boolean             @default(true)
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt
  
  userAchievements UserAchievement[]
  progressTracking AchievementProgress[]
}

model UserAchievement {
  id            String       @id @default(cuid())
  userId        String
  achievementId String
  unlockedAt    DateTime     @default(now())
  notified      Boolean      @default(false) // Whether user has seen the notification
  
  user          User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement   Achievement  @relation(fields: [achievementId], references: [id], onDelete: Cascade)
  
  @@unique([userId, achievementId])
  @@index([userId])
  @@index([unlockedAt])
}

model AchievementProgress {
  id              String      @id @default(cuid())
  userId          String
  achievementId   String
  currentValue    Float       @default(0) // e.g., 3 out of 10 completions
  targetValue     Float       // e.g., 10
  percentage      Float       @default(0) // 0-100
  lastUpdated     DateTime    @updatedAt
  
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement     Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)
  
  @@unique([userId, achievementId])
  @@index([userId])
}
```

### Requirement JSON Structure
```json
{
  "type": "drill_completion" | "section_completion" | "level_completion" | "multi_section" | "ultimate",
  "criteria": {
    "drillId": "serving_basics", // For drill achievements
    "completions": 10, // For medal tiers
    "section": "serving", // For section achievements
    "skillLevel": "BEGINNER", // For level achievements
    "sections": ["serving", "return_of_serve"], // For multi-section
    "allSections": true // For ultimate
  }
}
```

## Achievement Points System

| Tier | Points |
|------|--------|
| Bronze Medal | 10 |
| Silver Medal | 25 |
| Gold Medal | 50 |
| Section Badge | 100 |
| Level Badge | 250 |
| Multi-Section Badge | 200 |
| Ultimate Crown | 1000 |

## Achievement Engine Logic

### 1. Trigger Points
Achievement checks are triggered when:
- User completes a drill
- User completes a video within a training program
- User marks a training session as complete
- User finishes a training program

### 2. Check Flow
```
1. Event occurs (e.g., drill completion)
2. Update relevant progress trackers
3. Check if any achievements are unlocked
4. Award achievements
5. Update user's total points
6. Queue notification
7. Log achievement event
```

### 3. Progress Calculation
For each achievement type:

**Drill Medals:**
- Bronze: 1 completion
- Silver: 5 completions
- Gold: 10 completions

**Section Badges:**
- Count unique drills completed in section
- Achievement unlocked when count = total drills in section

**Level Badges:**
- Count sections completed at skill level
- Achievement unlocked when count = total sections at level

**Multi-Section:**
- Track completion of specific sections
- Achievement unlocked when all required sections complete

**Ultimate Crown:**
- Track completion across all levels and sections
- Achievement unlocked when everything is complete

## UI Components

### 1. Achievement Gallery Page
- Grid layout showing all achievements
- Filter by: All, Locked, Unlocked, By Category
- Each achievement card shows:
  - Icon/Badge
  - Name
  - Description
  - Progress bar (for locked)
  - Points earned
  - Unlock date (for unlocked)
  - Rarity indicator

### 2. Achievement Notification
Pop-up animation when achievement is earned:
- Large badge/medal display
- Confetti animation
- Achievement name and description
- Points earned
- "Share" and "View Gallery" buttons

### 3. Progress Indicators
- Show progress toward next achievement in relevant sections
- Mini progress bars on training pages
- "Next achievement" widget on dashboard

### 4. User Profile Showcase
- Display top 3-5 achievements
- Total points and rank
- Achievement completion percentage
- Recent unlocks

### 5. Leaderboard (Optional)
- Top users by total achievement points
- Weekly/Monthly/All-time views
- Filter by skill level

## API Endpoints

### GET /api/achievements
Get all achievement definitions
- Query params: category, tier, userId (to include progress)

### GET /api/achievements/user/:userId
Get user's achievements and progress
- Returns: unlocked achievements, progress toward locked achievements

### POST /api/achievements/check
Check for achievement unlocks
- Body: { userId, eventType, eventData }
- Returns: newly unlocked achievements

### GET /api/achievements/leaderboard
Get achievement leaderboard
- Query params: period, skillLevel, limit

### PATCH /api/achievements/notification/:achievementId
Mark achievement notification as seen
- Body: { userId }

## Achievement Definitions

### Serving Category
1. **Serving Bronze** - Complete 1 serving drill
2. **Serving Silver** - Complete 5 serving drills  
3. **Serving Gold** - Complete 10 serving drills
4. **Serving Master** - Complete all serving drills

### Dinking Category
1. **Dinking Bronze** - Complete 1 dinking drill
2. **Dinking Silver** - Complete 5 dinking drills
3. **Dinking Gold** - Complete 10 dinking drills
4. **Dinking Expert** - Complete all dinking drills

### Third Shot Category
1. **Third Shot Bronze** - Complete 1 third shot drill
2. **Third Shot Silver** - Complete 5 third shot drills
3. **Third Shot Gold** - Complete 10 third shot drills
4. **Third Shot Specialist** - Complete all third shot drills

### Volley Category
1. **Volley Bronze** - Complete 1 volley drill
2. **Volley Silver** - Complete 5 volley drills
3. **Volley Gold** - Complete 10 volley drills
4. **Volley Champion** - Complete all volley drills

### Strategy Category
1. **Strategy Bronze** - Complete 1 strategy drill
2. **Strategy Silver** - Complete 5 strategy drills
3. **Strategy Gold** - Complete 10 strategy drills
4. **Strategy Guru** - Complete all strategy drills

### Advanced Techniques Category
1. **Advanced Bronze** - Complete 1 advanced drill
2. **Advanced Silver** - Complete 5 advanced drills
3. **Advanced Gold** - Complete 10 advanced drills
4. **Advanced Master** - Complete all advanced drills

### Mental Game Category
1. **Mental Bronze** - Complete 1 mental game drill
2. **Mental Silver** - Complete 5 mental game drills
3. **Mental Gold** - Complete 10 mental game drills
4. **Mental Champion** - Complete all mental game drills

### Skill Level Badges
1. **Beginner Champion** - Complete all Beginner sections
2. **Intermediate Master** - Complete all Intermediate sections
3. **Advanced Expert** - Complete all Advanced sections
4. **Pro Legend** - Complete all Pro sections

### Multi-Section Badges
1. **Fundamentals Ace** - Complete Serving + Return sections
2. **Kitchen Dominator** - Complete Dinking + Volley sections
3. **Court Commander** - Complete Footwork + Strategy sections
4. **Complete Player** - Complete all fundamental sections

### Ultimate Achievement
1. **Mindful Champion Crown** - Complete ALL training programs across ALL levels

## Integration Points

### 1. Drill Completion Hook
When user completes a drill:
```typescript
await checkAchievements(userId, 'drill_completion', {
  drillId: drill.id,
  drillName: drill.name,
  category: drill.category,
  skillLevel: drill.skillLevel
});
```

### 2. Video Completion Hook
When user completes a training video:
```typescript
await checkAchievements(userId, 'video_completion', {
  videoId: video.id,
  programId: video.programId,
  day: video.day
});
```

### 3. Program Completion Hook
When user completes a training program:
```typescript
await checkAchievements(userId, 'program_completion', {
  programId: program.id,
  skillLevel: program.skillLevel
});
```

## Notification Strategy

### In-App Notifications
- Popup modal with animation when achievement is unlocked
- Notification bell icon with badge count
- Achievement feed on dashboard

### Email Notifications (Optional)
- Weekly digest of achievements earned
- Special email for major achievements (Level badges, Crown)

### Push Notifications (Future)
- Mobile app push notifications for achievement unlocks

## Visual Design

### Color Coding
- Bronze: #CD7F32
- Silver: #C0C0C0
- Gold: #FFD700
- Badge: #4F46E5 (Indigo)
- Crown: #9333EA (Purple) with gold accents

### Icons
Use Lucide React icons:
- Medal: Trophy, Award
- Badge: Shield, Star
- Crown: Crown
- Progress: BarChart, TrendingUp

### Animations
- Unlock animation: Scale + Fade + Confetti
- Progress bar: Smooth fill animation
- Badge shake on hover

## Testing Strategy

### Unit Tests
- Achievement engine logic
- Progress calculation
- Point calculation

### Integration Tests
- Drill completion → Achievement unlock
- Multiple achievements at once
- Progress tracking accuracy

### E2E Tests
- Complete user journey from drill → achievement
- Gallery display and filtering
- Notification display

## Performance Considerations

### Caching
- Cache achievement definitions (rarely change)
- Cache user achievement status
- Invalidate cache on new unlock

### Database Indexes
- Index on userId in UserAchievement and AchievementProgress
- Index on achievementId for quick lookups
- Composite index on (userId, achievementId)

### Batch Processing
- Check multiple achievements in single query
- Bulk insert for progress updates
- Queue notifications for async processing

## Future Enhancements

1. **Social Features**
   - Share achievements on social media
   - Compare achievements with friends
   - Achievement showcases on profile

2. **Seasonal Achievements**
   - Limited-time special achievements
   - Holiday-themed achievements
   - Tournament achievements

3. **Streak Achievements**
   - Login streaks
   - Training streaks
   - Consistency badges

4. **Milestone Achievements**
   - Total drills completed
   - Total training hours
   - Total videos watched

5. **Community Achievements**
   - Help other users
   - Share tips
   - Contribute to community

## Success Metrics

Track the following to measure achievement system success:
- Achievement unlock rate by type
- Average achievements per user
- User engagement increase after achievements launch
- Training completion rate change
- Session duration change
- User retention improvement

## Implementation Timeline

### Phase 1: Core System (Week 1)
- Database schema
- Achievement engine
- Basic UI components

### Phase 2: Integration (Week 2)
- Hook into drill completion
- Hook into training programs
- Testing and bug fixes

### Phase 3: Polish (Week 3)
- Animations and visual effects
- Leaderboard
- Notification system

### Phase 4: Launch (Week 4)
- Deploy to production
- Monitor metrics
- Gather user feedback
