/**
 * Prisma Types - Re-exported from Prisma client for consistency
 * This ensures all imports use the actual generated Prisma types
 */

// Re-export all enums from Prisma client (both types and values)
export {
  EmailStatus,
  EmailNotificationType,
  PromoCodeStatus,
  PromoCodeType,
  SubscriptionTier,
  SubscriptionStatus,
  UserRole,
  TournamentStatus,
  TournamentFormat,
  SkillLevel,
  RegistrationStatus,
  NotificationCategory,
  NotificationFrequency,
  NotificationDeliveryMethod,
  NotificationStatus,
  NotificationSource,
  SMSVerificationType,
  SecurityEventType,
  SecurityEventSeverity,
  SponsorApplicationStatus,
  SponsorTier,
  SponsorOfferStatus,
  ContentType,
  LiveStreamStatus,
  LiveStreamPlatform,
  ExternalEventType,
  WearableDeviceType,
  HealthDataType,
  VideoInteractionType,
  DrillStatus,
  NewsCategory,
} from '@prisma/client';

// Re-export types that are not enums
export type { NotificationPreferences, ScheduledNotification } from '@prisma/client';
