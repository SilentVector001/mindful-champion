# Video Analysis Progress Tracking - Deployment Guide

## Overview
This guide covers the deployment of the premium video analysis with progress tracking feature, which includes new database models, API endpoints, and achievements system.

## ✅ Pre-Deployment Checklist

### 1. Code Changes (Already Completed)
- [x] Created `VideoAnalysisProgress` model in Prisma schema
- [x] Created `VideoAnalysisAchievement` model in Prisma schema  
- [x] Created `VideoAnalysisUserAchievement` junction table
- [x] Added `/api/video-analysis/progress` endpoint
- [x] Added `/api/video-analysis/achievements` endpoint
- [x] Created seed script for video achievements (`scripts/seed-video-achievements.ts`)
- [x] Updated `video-analysis-results.tsx` component
- [x] All TypeScript checks pass
- [x] Local build succeeds

### 2. Database Migration Required ⚠️

The deployment is failing because the **production database** doesn't have the new tables yet. You need to apply the schema changes to your production database.

#### Option A: Using Prisma Migrate (Recommended)
```bash
cd /home/ubuntu/mindful_champion/nextjs_space

# Generate migration file
npx prisma migrate dev --name add_video_analysis_progress_and_achievements

# Apply to production (requires production DATABASE_URL)
DATABASE_URL="your_production_database_url" npx prisma migrate deploy
```

#### Option B: Using Prisma DB Push (Faster, but no migration history)
```bash
cd /home/ubuntu/mindful_champion/nextjs_space

# Push schema directly to production
DATABASE_URL="your_production_database_url" npx prisma db push
```

### 3. Seed Video Achievements

After applying the schema, seed the achievement definitions:

```bash
cd /home/ubuntu/mindful_champion/nextjs_space

# Run seed script
DATABASE_URL="your_production_database_url" npx ts-node scripts/seed-video-achievements.ts
```

### 4. Verify Environment Variables in Vercel

Ensure these environment variables are set in your Vercel project settings:

```
DATABASE_URL=your_production_postgres_url
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=https://mindfulchampion.com
RESEND_API_KEY=your_resend_key
AWS_ACCESS_KEY_ID=your_aws_key (for video uploads)
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_aws_region
AWS_S3_BUCKET_NAME=your_bucket_name
```

## 📋 New Database Models

### VideoAnalysisProgress
Tracks user progress for each skill type (serve, dink, drive, etc.):
- `userId` - Links to User model
- `skillType` - Type of shot being tracked
- `averageScore` - Running average of scores
- `totalShots` - Total shots analyzed for this skill
- `bestScore` - Personal best score
- `sessionsCount` - Number of analysis sessions
- `improvementRate` - Percentage improvement over time

### VideoAnalysisAchievement
Defines available achievements:
- `code` - Unique identifier (e.g., "FIRST_ANALYSIS")
- `name` - Display name
- `description` - Achievement description
- `icon` - Icon name for UI
- `category` - Type: milestone, speed, score, accuracy, improvement, consistency
- `threshold` - Value needed to unlock
- `thresholdType` - Type: count, speed, score, percentage
- `points` - Reward points

### VideoAnalysisUserAchievement
Junction table linking users to unlocked achievements:
- `userId` - Links to User
- `achievementId` - Links to Achievement
- `unlockedAt` - Timestamp when unlocked
- `value` - Actual value that triggered unlock (e.g., speed in MPH)

## 🔧 API Endpoints Added

### GET /api/video-analysis/progress
Returns user's video analysis progress, history, and achievements:
```json
{
  "stats": {
    "totalAnalyses": 15,
    "totalShots": 247,
    "avgScore": 78,
    "improvement": 12
  },
  "analyses": [...],
  "skillProgress": [...],
  "achievements": [...],
  "historyData": [...]
}
```

### GET /api/video-analysis/achievements
Returns all achievements with user's unlock status:
```json
{
  "achievements": [...],
  "byCategory": {
    "milestone": [...],
    "speed": [...],
    "score": [...]
  },
  "totalUnlocked": 5,
  "totalAchievements": 18,
  "totalPoints": 165
}
```

## 🚀 Deployment Steps

### Step 1: Apply Database Changes
Choose one of the migration options above and apply it to your production database.

### Step 2: Seed Achievements
Run the seed script to populate the 18 predefined achievements.

### Step 3: Verify Build Locally
```bash
cd /home/ubuntu/mindful_champion/nextjs_space
npm run build
```

The build should complete successfully (it already does locally).

### Step 4: Push to GitHub
```bash
cd /home/ubuntu/mindful_champion/nextjs_space
git add -A
git commit -m "Video analysis progress tracking - deployment ready"
git push origin master
```

### Step 5: Trigger Vercel Deployment
Vercel will automatically deploy when you push to master. Monitor the deployment at:
https://vercel.com/your-account/mindful-champion

### Step 6: Verify Deployment
After deployment succeeds:

1. **Test Progress API:**
   ```bash
   curl -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
     https://mindfulchampion.com/api/video-analysis/progress
   ```

2. **Test Achievements API:**
   ```bash
   curl -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
     https://mindfulchampion.com/api/video-analysis/achievements
   ```

3. **Test UI:**
   - Upload a video at https://mindfulchampion.com/train/video
   - Complete analysis
   - Check for achievements and progress tracking

## 🐛 Troubleshooting

### Issue: "Table 'VideoAnalysisProgress' does not exist"
**Solution:** You haven't applied the database migration yet. Run the migration commands above.

### Issue: "No achievements found"
**Solution:** Run the seed script to populate achievements.

### Issue: Build fails with "Dynamic server usage" errors
**Solution:** These are warnings and don't prevent deployment. The build completes successfully.

### Issue: "Resend domain not verified"
**Solution:** This is a separate issue. See `RESEND_DOMAIN_SETUP_GUIDE.md` for email configuration.

## 📊 Testing Achievements Locally

To test achievement unlocking logic locally:

```bash
# Start development server
npm run dev

# Upload a test video
# Complete analysis
# Check console logs for achievement triggers
# Verify achievements appear in UI
```

## 🎯 18 Available Achievements

**Milestones:**
- First Steps (1 analysis) - 25 pts
- Getting Serious (5) - 50 pts
- Dedicated Player (10) - 100 pts
- Analysis Pro (25) - 250 pts

**Speed:**
- Speed Demon (30 MPH) - 30 pts
- Power Player (40 MPH) - 50 pts
- Cannon Arm (50 MPH) - 100 pts

**Score:**
- Solid Technique (80+) - 40 pts
- Elite Form (90+) - 75 pts
- Pro Level (95+) - 150 pts

**Accuracy:**
- Perfect Shot (1 excellent) - 15 pts
- Hot Streak (5 excellent) - 50 pts
- Flawless Performance (all excellent) - 200 pts

**Improvement:**
- Getting Better (10% improvement) - 40 pts
- Major Progress (25% improvement) - 100 pts
- Transformation (50% improvement) - 250 pts

**Consistency:**
- Weekly Warrior (3 weeks streak) - 60 pts
- Monthly Dedication (4 videos/month) - 80 pts

## ✨ What's New for Users

1. **Progress Tracking Dashboard** - View improvement over time with charts
2. **Skill-Specific Metrics** - Track progress for each shot type separately
3. **Achievement System** - Unlock 18 achievements across 6 categories
4. **Historical Analysis** - Compare current performance to past sessions
5. **Improvement Percentage** - See quantified improvement from first analysis

## 🔄 Post-Deployment Monitoring

After successful deployment, monitor:

1. **Error Logs** - Check Vercel logs for any API errors
2. **Database Performance** - Monitor query performance with new tables
3. **User Engagement** - Track achievement unlock rates
4. **API Response Times** - Ensure progress endpoint performs well

## 📝 Commit Reference

The feature was implemented in commit: `ec8277f`

**Changed Files:**
- `prisma/schema.prisma` - Added 3 new models
- `app/api/video-analysis/progress/route.ts` - New endpoint
- `app/api/video-analysis/achievements/route.ts` - New endpoint
- `components/train/video-analysis-results.tsx` - UI updates
- `scripts/seed-video-achievements.ts` - New seed script

## 🎉 Success Criteria

Deployment is successful when:
- ✅ Build completes without errors
- ✅ Database has 3 new tables
- ✅ 18 achievements are seeded
- ✅ Progress API returns data
- ✅ Achievements API returns data
- ✅ UI displays progress and achievements
- ✅ Users can unlock achievements

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify database connection
3. Ensure all environment variables are set
4. Check Prisma schema syntax
5. Verify seed script ran successfully

---

**Last Updated:** December 23, 2025  
**Feature Version:** Premium Video Analysis with Progress Tracking v1.0
