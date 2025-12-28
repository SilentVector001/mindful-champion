# Prisma Schema Updates Summary - Media Center & Subscription Management

## Overview
Updated the Prisma database schema to support comprehensive media center features with tiered access control, trial expiration tracking, and user engagement analytics.

**Date:** November 9, 2025  
**Status:** ✅ Schema Updated & Prisma Client Generated

---

## 1. Subscription Tier Management ✅

### Existing Fields in User Model
The User model already includes comprehensive subscription management:

```prisma
subscriptionTier        SubscriptionTier         @default(FREE)
subscriptionStatus      SubscriptionStatus       @default(ACTIVE)
trialStartDate          DateTime?
trialEndDate            DateTime?
isTrialActive           Boolean                  @default(true)
stripeCustomerId        String?
stripeSubscriptionId    String?
```

### Subscription Tier Enum
```prisma
enum SubscriptionTier {
  TRIAL
  FREE
  PREMIUM
  PRO
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
  UNPAID
  TRIALING
}
```

---

## 2. Media Content Models 🆕

### StreamingPlatform Model (NEW)
Comprehensive streaming platform management with tiered access control.

**Key Features:**
- Platform details (name, description, logo, website)
- Subscription cost and free access options
- Feature lists and content types
- Platform availability (Web, iOS, Android, Roku, etc.)
- Tier-based access control
- View/click tracking
- User favorites relationship

**Fields:**
```prisma
model StreamingPlatform {
  id                 String                   @id @default(cuid())
  platformId         String                   @unique
  name               String
  description        String?
  officialWebsite    String?
  streamingUrl       String?
  logoUrl            String?
  type               StreamingPlatformType    @default(SUBSCRIPTION)
  subscriptionCost   String?
  hasFreeAccess      Boolean                  @default(false)
  freeAccessDetails  Json?
  features           Json?
  content            Json?
  platforms          Json?
  socialLinks        Json?
  isActive           Boolean                  @default(true)
  tierAccess         SubscriptionTier         @default(FREE)
  viewCount          Int                      @default(0)
  clickCount         Int                      @default(0)
  userFavorites      UserFavoriteStreamingPlatform[]
}
```

**New Enum:**
```prisma
enum StreamingPlatformType {
  SUBSCRIPTION
  FREE
  FREEMIUM
  CABLE
  PAY_PER_VIEW
}
```

### TournamentOrganization Model (NEW)
Track major pickleball organizations (PPA, MLP, APP, USA Pickleball, etc.).

**Key Features:**
- Organization details and branding
- Social media links
- User follow/unfollow functionality
- Engagement tracking

**Fields:**
```prisma
model TournamentOrganization {
  id                String                       @id @default(cuid())
  organizationId    String                       @unique
  name              String
  fullName          String?
  description       String?
  logoUrl           String?
  websiteUrl        String?
  type              TournamentOrganizationType
  socialLinks       Json?
  headquarters      String?
  foundedYear       Int?
  isActive          Boolean                      @default(true)
  viewCount         Int                          @default(0)
  clickCount        Int                          @default(0)
  userFollows       UserFollowedOrganization[]
}
```

**New Enum:**
```prisma
enum TournamentOrganizationType {
  PPA_TOUR
  MLP
  APP_TOUR
  USA_PICKLEBALL
  INTERNATIONAL
  LOCAL
  COLLEGIATE
  JUNIOR
  SENIOR
  OTHER
}
```

### Enhanced Existing Models
The following models already existed and support media features:
- **PodcastShow** - Podcast series management
- **PodcastEpisode** - Individual podcast episodes
- **LiveStream** - Live streaming events
- **ExternalEvent** - Tournament and event tracking
- **NewsItem** - Pickleball news articles

---

## 3. Email Notification Tracking ✅

### EmailNotification Model (EXISTING)
Comprehensive email tracking with delivery status, open rates, and error handling.

**Enhanced EmailNotificationType Enum:**
```prisma
enum EmailNotificationType {
  VIDEO_ANALYSIS_COMPLETE
  WELCOME
  SUBSCRIPTION_RENEWAL
  ACHIEVEMENT_UNLOCKED
  MATCH_REMINDER
  TRAINING_REMINDER
  SYSTEM_UPDATE
  TRIAL_EXPIRATION
  TRIAL_WARNING_7_DAYS      // NEW
  TRIAL_WARNING_3_DAYS      // NEW
  TRIAL_WARNING_1_DAY       // NEW
  UPGRADE_REMINDER          // NEW
  EVENT_REMINDER            // NEW
  PODCAST_NEW_EPISODE       // NEW
  LIVE_STREAM_STARTING      // NEW
  CUSTOM
}
```

### TrialExpirationReminder Model (NEW)
Automated trial expiration reminder system.

**Key Features:**
- Scheduled reminders (7-day, 3-day, 1-day warnings)
- Email delivery tracking
- Retry logic support
- Reminder status management

**Fields:**
```prisma
model TrialExpirationReminder {
  id             String                      @id @default(cuid())
  userId         String
  reminderType   TrialReminderType
  reminderTiming Int                         // days before expiration
  status         ReminderStatus              @default(PENDING)
  scheduledFor   DateTime
  sentAt         DateTime?
  emailSent      Boolean                     @default(false)
  emailStatus    EmailStatus?
  error          String?
  metadata       Json?
  user           User                        @relation("UserTrialReminders")
}
```

**New Enums:**
```prisma
enum TrialReminderType {
  TRIAL_STARTED
  TRIAL_7_DAYS_LEFT
  TRIAL_3_DAYS_LEFT
  TRIAL_1_DAY_LEFT
  TRIAL_EXPIRED
  UPGRADE_PROMPT
}

enum ReminderStatus {
  PENDING
  SENT
  FAILED
  CANCELLED
}
```

---

## 4. User Preferences for Media 🆕

### UserMediaPreferences Model (NEW)
Centralized user preferences for all media features.

**Key Features:**
- Event reminder settings (timing, enabled/disabled)
- Tournament and live stream notifications
- Podcast episode notifications
- Weekly media digest opt-in
- Content recommendations toggle
- Video quality preferences
- Autoplay settings

**Fields:**
```prisma
model UserMediaPreferences {
  id                               String   @id @default(cuid())
  userId                           String   @unique
  eventReminderEnabled             Boolean  @default(true)
  eventReminderTiming              Int      @default(24) // hours before event
  tournamentReminderEnabled        Boolean  @default(true)
  liveStreamReminderEnabled        Boolean  @default(true)
  podcastNewEpisodeNotification    Boolean  @default(true)
  weeklyMediaDigestEnabled         Boolean  @default(false)
  favoritePodcasts                 Json?    // Array of podcast IDs
  followedTournamentOrganizations  Json?    // Array of organization IDs
  favoriteStreamingPlatforms       Json?    // Array of platform IDs
  upcomingEventNotifications       Json?    // Customized per event type
  contentRecommendationsEnabled    Boolean  @default(true)
  autoplayEnabled                  Boolean  @default(false)
  preferredVideoQuality            String   @default("auto")
  user                             User     @relation()
}
```

### UserFavoriteStreamingPlatform Model (NEW)
Track user's favorite streaming platforms.

```prisma
model UserFavoriteStreamingPlatform {
  id         String            @id @default(cuid())
  userId     String
  platformId String
  addedAt    DateTime          @default(now())
  user       User              @relation("UserFavoriteStreamingPlatforms")
  platform   StreamingPlatform @relation()
}
```

### UserFollowedOrganization Model (NEW)
Track tournament organizations users follow.

```prisma
model UserFollowedOrganization {
  id             String                 @id @default(cuid())
  userId         String
  organizationId String
  followedAt     DateTime               @default(now())
  user           User                   @relation("UserFollowedOrganizations")
  organization   TournamentOrganization @relation()
}
```

### Enhanced Existing Models
- **ContentBookmark** - Bookmark any content type
- **PodcastBookmark** - Bookmark specific podcast episodes
- **UserWatchHistory** - Track viewing history

---

## 5. Media Analytics 📊

### MediaEngagementMetrics Model (NEW)
Comprehensive tracking of all user interactions with media content.

**Tracked Engagement Types:**
- VIEW - Content viewed
- CLICK - External link clicked
- PLAY - Media playback started
- PAUSE - Media paused
- COMPLETE - Media fully consumed
- BOOKMARK - Content bookmarked
- SHARE - Content shared
- FAVORITE - Content favorited
- FOLLOW/UNFOLLOW - Organization followed/unfollowed
- SUBSCRIBE - Platform subscribed
- VISIT_WEBSITE - External website visited

**Fields:**
```prisma
model MediaEngagementMetrics {
  id                   String                  @id @default(cuid())
  userId               String?
  sessionId            String?
  contentType          MediaContentType
  contentId            String                  // Generic reference
  contentTitle         String?
  engagementType       MediaEngagementType
  metadata             Json?                   // Additional context
  timestamp            DateTime                @default(now())
}
```

**New Enums:**
```prisma
enum MediaContentType {
  STREAMING_PLATFORM
  TOURNAMENT_ORGANIZATION
  PODCAST
  LIVE_EVENT
  TOURNAMENT
  VIDEO
  TRAINING_CONTENT
  NEWS
}

enum MediaEngagementType {
  VIEW
  CLICK
  PLAY
  PAUSE
  COMPLETE
  BOOKMARK
  SHARE
  FAVORITE
  FOLLOW
  UNFOLLOW
  SUBSCRIBE
  VISIT_WEBSITE
}
```

### Existing Analytics Models
- **UserWatchHistory** - Watch time, completion tracking
- **UserContentRecommendation** - AI-powered recommendations
- **UserVideoProgress** - Video progress tracking
- **UserPodcastProgress** - Podcast listening progress

---

## 6. User Model Updates

### New Relations Added to User Model
```prisma
model User {
  // ... existing fields ...
  
  // NEW MEDIA CENTER RELATIONS
  favoriteStreamingPlatforms UserFavoriteStreamingPlatform[] @relation("UserFavoriteStreamingPlatforms")
  followedOrganizations      UserFollowedOrganization[] @relation("UserFollowedOrganizations")
  trialReminders             TrialExpirationReminder[] @relation("UserTrialReminders")
  mediaPreferences           UserMediaPreferences?
}
```

---

## Database Migration Guide

### Option 1: Development Reset (Recommended for Development)
```bash
cd /home/ubuntu/mindful_champion/nextjs_space
npx prisma migrate reset
npx prisma migrate dev --name media_center_subscription_management
```

### Option 2: Production Migration (Zero Downtime)
```bash
cd /home/ubuntu/mindful_champion/nextjs_space
npx prisma migrate deploy
```

---

## API Integration Tasks

### 1. Streaming Platform Management
- [ ] Create `/api/media/streaming-platforms` endpoints (GET, POST)
- [ ] Implement tier-based access control
- [ ] Add user favorite/unfavorite functionality
- [ ] Track engagement metrics

### 2. Tournament Organization Management
- [ ] Create `/api/media/organizations` endpoints (GET, POST)
- [ ] Implement follow/unfollow functionality
- [ ] Add organization details page

### 3. User Preferences
- [ ] Create `/api/users/media-preferences` endpoints
- [ ] Implement preference update logic
- [ ] Add notification scheduling system

### 4. Trial Management
- [ ] Create trial expiration reminder scheduler
- [ ] Implement email notification system
- [ ] Add upgrade flow

### 5. Analytics Dashboard
- [ ] Create admin analytics dashboard
- [ ] Add engagement metrics visualization
- [ ] Implement user behavior tracking

---

## UI Component Tasks

### 1. Media Center Pages
- [ ] `/media` - Main media hub
- [ ] `/media/streaming` - Streaming platforms
- [ ] `/media/podcasts` - Podcast directory
- [ ] `/media/tournaments` - Tournament calendar
- [ ] `/media/organizations` - Organization directory

### 2. User Settings
- [ ] `/settings/media-preferences` - Media notification settings
- [ ] `/settings/favorites` - Manage favorites

### 3. Trial Management UI
- [ ] Trial status banner
- [ ] Upgrade call-to-action
- [ ] Trial expiration countdown

---

## Seeding Data

### Streaming Platforms to Seed
Based on `/home/ubuntu/pickleball_media_research.json`:
- PickleballTV
- YouTube Channels (PPA Tour, Pickleball Channel, USA Pickleball, MLP, etc.)
- ESPN/ESPN+
- CBS Sports
- Fox Sports
- DIRECTV MyFree
- Philo

### Tournament Organizations to Seed
- PPA Tour
- Major League Pickleball (MLP)
- APP Tour
- USA Pickleball

### Podcasts to Seed
- PicklePod
- Pickleball Studio Podcast
- It Feels Right Pickleball Podcast
- The McGuffin Show
- Third Shot Podcast

---

## Testing Checklist

### Schema Validation ✅
- [x] Prisma format completed successfully
- [x] Prisma client generated successfully
- [x] No validation errors

### Next Steps
- [ ] Run database migration
- [ ] Create seed data script
- [ ] Test all relationships
- [ ] Build API endpoints
- [ ] Create UI components
- [ ] Test trial reminder system
- [ ] Implement engagement tracking

---

## Summary Statistics

**New Models Added:** 7
- StreamingPlatform
- TournamentOrganization
- UserMediaPreferences
- UserFavoriteStreamingPlatform
- UserFollowedOrganization
- MediaEngagementMetrics
- TrialExpirationReminder

**Enhanced Models:** 2
- User (4 new relations)
- EmailNotificationType (7 new types)

**New Enums:** 7
- StreamingPlatformType
- TournamentOrganizationType
- MediaContentType
- MediaEngagementType
- TrialReminderType
- ReminderStatus

**Total Database Tables:** 100+
**Total Enums:** 40+

---

## Notes

1. **Backward Compatibility:** All changes are additive and don't break existing functionality.

2. **Performance:** Added strategic indexes on frequently queried fields.

3. **Scalability:** Generic contentId/contentType pattern allows tracking any content type.

4. **Privacy:** User engagement can be tracked anonymously (userId optional).

5. **Flexibility:** JSON fields allow storing platform-specific metadata without schema changes.

---

## Support

For questions or issues with the schema updates, check:
- `/home/ubuntu/pickleball_media_research.json` - Source data structure
- `prisma/schema.prisma` - Complete schema definition
- Prisma documentation: https://www.prisma.io/docs

---

**Schema Last Updated:** November 9, 2025  
**Prisma Client Version:** 6.7.0  
**Status:** ✅ Ready for Migration
