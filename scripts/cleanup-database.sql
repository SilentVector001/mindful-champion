-- MINDFUL CHAMPION - DATABASE CLEANUP FOR FRESH DECEMBER 1 LAUNCH
-- This script deletes all non-admin user data while preserving admin accounts

-- First, let's see what we're working with
SELECT 'BEFORE CLEANUP - USER COUNTS' as info;
SELECT 
  role,
  COUNT(*) as count
FROM "User"
GROUP BY role;

-- Identify admin users that will be preserved
SELECT '\n=== ADMIN ACCOUNTS TO BE PRESERVED ===' as info;
SELECT id, email, "firstName", "lastName", role, "createdAt"
FROM "User"
WHERE role = 'ADMIN';

-- Get counts of what will be deleted
SELECT '\n=== DATA TO BE DELETED ===' as info;

SELECT 'Non-Admin Users' as table_name, COUNT(*) as count
FROM "User" WHERE role != 'ADMIN'
UNION ALL
SELECT 'Video Analyses', COUNT(*) 
FROM "VideoAnalysis" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN')
UNION ALL
SELECT 'Sponsor Applications', COUNT(*) 
FROM "SponsorApplication"
UNION ALL
SELECT 'Sponsor Profiles', COUNT(*) 
FROM "SponsorProfile" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN')
UNION ALL
SELECT 'Subscriptions', COUNT(*) 
FROM "Subscription" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN')
UNION ALL
SELECT 'User Achievements', COUNT(*) 
FROM "UserAchievement" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN')
UNION ALL
SELECT 'Matches', COUNT(*) 
FROM "Match" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN')
   OR "opponentId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN')
UNION ALL
SELECT 'Training Plans', COUNT(*) 
FROM "TrainingPlan" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN')
UNION ALL
SELECT 'User Programs', COUNT(*) 
FROM "UserProgram" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

-- START TRANSACTION
BEGIN;

-- Delete in correct order (respecting foreign keys)

-- Video related
DELETE FROM "UserVideoProgress" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "VideoAnalysis" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

-- Sponsor related  
DELETE FROM "OfferRedemption" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "SponsorProfile" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "SponsorApplication";

-- Subscription related
DELETE FROM "SubscriptionHistory" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "Subscription" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

-- Achievement related
DELETE FROM "AchievementProgress" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "UserAchievementStats" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "UserAchievement" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

-- Activity tracking
DELETE FROM "ActivityLog" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "ActivityEvent" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

-- Matches
DELETE FROM "Match" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN')
   OR "opponentId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

-- Training related
DELETE FROM "DrillCompletion" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "UserProgram" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "TrainingPlan" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

-- Progress tracking
DELETE FROM "SkillProgress" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "CommunityStats" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

-- Beta testing
DELETE FROM "BetaTester" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

-- Media center
DELETE FROM "UserWatchHistory" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "UserContentRecommendation" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

-- Tier unlocks
DELETE FROM "TierUnlock" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

-- Additional user-related data
DELETE FROM "Account" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "Session" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "UserSession" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "Goal" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "UserGoal" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "HealthData" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "PracticeLog" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "MentalSession" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "UserChallenge" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "Booking" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "SavedContent" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "ContentBookmark" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "VideoBookmark" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "PostBookmark" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "PodcastBookmark" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "UserPodcastProgress" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "UserVideoRating" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "VideoInteraction" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "UserMediaPreferences" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "UserFavoriteStreamingPlatform" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "CommunityPost" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "PostComment" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "PostLike" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "CommentLike" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "ChatMessage" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "AIConversation" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "EmailNotification" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "EmailSettings" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "SecurityLog" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "PageView" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "NavigationPath" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "RewardRedemption" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "BiometricCredential" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

DELETE FROM "WearableDevice" 
WHERE "userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN');

-- Reset promo codes
UPDATE "PromoCode"
SET "timesRedeemed" = 0,
    "redeemedBy" = '{}',
    "redeemedAt" = NULL,
    status = 'ACTIVE'
WHERE status != 'EXPIRED';

-- Finally, delete non-admin users
DELETE FROM "User" WHERE role != 'ADMIN';

-- COMMIT TRANSACTION
COMMIT;

-- Verify cleanup
SELECT '\n=== AFTER CLEANUP - VERIFICATION ===' as info;

SELECT 'Remaining Users' as metric, COUNT(*) as count
FROM "User"
UNION ALL
SELECT 'Remaining Admins', COUNT(*) 
FROM "User" WHERE role = 'ADMIN'
UNION ALL
SELECT 'Remaining Non-Admins', COUNT(*) 
FROM "User" WHERE role != 'ADMIN'
UNION ALL
SELECT 'Remaining Video Analyses', COUNT(*) 
FROM "VideoAnalysis"
UNION ALL
SELECT 'Remaining Sponsor Apps', COUNT(*) 
FROM "SponsorApplication"
UNION ALL
SELECT 'Remaining Subscriptions', COUNT(*) 
FROM "Subscription"
UNION ALL
SELECT 'Remaining Achievements', COUNT(*) 
FROM "UserAchievement"
UNION ALL
SELECT 'Remaining Matches', COUNT(*) 
FROM "Match"
UNION ALL
SELECT 'Remaining Training Plans', COUNT(*) 
FROM "TrainingPlan";

SELECT '\n=== PRESERVED ADMIN ACCOUNTS ===' as info;
SELECT email, "firstName", "lastName", role
FROM "User"
WHERE role = 'ADMIN';

SELECT '\n✅ DATABASE CLEANUP COMPLETE - READY FOR DECEMBER 1 LAUNCH! 🚀' as info;
