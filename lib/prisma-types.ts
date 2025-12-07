/**
 * Prisma Types - Local definitions to avoid Prisma client generation issues during Vercel build
 * These types mirror the enums defined in prisma/schema.prisma
 */

// Email types
export type EmailStatus = 'PENDING' | 'SENDING' | 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'FAILED' | 'UNSUBSCRIBED';
export type EmailNotificationType = 'VIDEO_ANALYSIS_COMPLETE' | 'WELCOME' | 'SUBSCRIPTION_RENEWAL' | 'ACHIEVEMENT_UNLOCKED' | 'MATCH_REMINDER' | 'TRAINING_REMINDER' | 'SYSTEM_UPDATE' | 'CUSTOM' | 'TRIAL_EXPIRATION' | 'TRIAL_WARNING_7_DAYS' | 'TRIAL_WARNING_3_DAYS' | 'TRIAL_WARNING_1_DAY';

// Promo code types
export type PromoCodeStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'USED';
export type PromoCodeType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_TRIAL' | 'SUBSCRIPTION_UPGRADE';

// Subscription types
export type SubscriptionTier = 'FREE' | 'PREMIUM' | 'PRO';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE' | 'TRIALING';

// User types
export type UserRole = 'USER' | 'ADMIN' | 'COACH' | 'SPONSOR';

// Tournament types
export type TournamentStatus = 'UPCOMING' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TournamentFormat = 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'ROUND_ROBIN' | 'SWISS';
export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
export type RegistrationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'WAITLISTED';

// Notification types
export type NotificationCategory = 'TRAINING' | 'GOALS' | 'ACHIEVEMENTS' | 'SOCIAL' | 'SYSTEM' | 'MARKETING' | 'COACH_KAI';
export type NotificationFrequency = 'IMMEDIATELY' | 'DAILY' | 'WEEKLY' | 'NEVER';
export type NotificationDeliveryMethod = 'EMAIL' | 'PUSH' | 'SMS' | 'IN_APP';
export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ';

// SMS types
export type SMSVerificationType = 'PHONE_VERIFICATION' | 'TWO_FACTOR_AUTH' | 'PASSWORD_RESET' | 'LOGIN_VERIFICATION';

// Security types
export type SecurityEventType = 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'PASSWORD_RESET' | 'TWO_FACTOR_ENABLED' | 'TWO_FACTOR_DISABLED' | 'ACCOUNT_LOCKED' | 'SUSPICIOUS_ACTIVITY';
export type SecurityEventSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Sponsor types
export type SponsorApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type SponsorTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
export type SponsorOfferStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'REJECTED';

// Media types
export type ContentType = 'VIDEO' | 'ARTICLE' | 'PODCAST' | 'LIVE_STREAM';
export type LiveStreamStatus = 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
export type LiveStreamPlatform = 'YOUTUBE' | 'TWITCH' | 'CUSTOM';
export type ExternalEventType = 'TOURNAMENT' | 'MATCH' | 'TRAINING_CAMP' | 'EXHIBITION' | 'OTHER';

// Wearable types
export type WearableDeviceType = 'APPLE_WATCH' | 'FITBIT' | 'GARMIN' | 'WHOOP' | 'OURA' | 'OTHER';
export type HealthDataType = 'HEART_RATE' | 'STEPS' | 'SLEEP' | 'CALORIES' | 'DISTANCE' | 'ACTIVE_MINUTES';

// Video types
export type VideoInteractionType = 'VIEW' | 'LIKE' | 'SHARE' | 'COMMENT' | 'BOOKMARK';
export type DrillStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';

// News types
export type NewsCategory = 'GENERAL' | 'TOURNAMENTS' | 'PLAYERS' | 'EQUIPMENT' | 'TRAINING' | 'HEALTH';
