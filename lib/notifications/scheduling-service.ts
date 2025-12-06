/**
 * Scheduling Service
 * Handles recurring notifications and timezone-aware scheduling
 */

import { prisma } from '@/lib/db';
import {
  NotificationCategory,
  NotificationFrequency,
  type NotificationPreferences,
} from '@prisma/client';
import { scheduleNotification } from './notification-service';

export interface ScheduleRecurringParams {
  userId: string;
  category: NotificationCategory;
  type: string;
  title: string;
  message: string;
  frequency: NotificationFrequency;
  customTimes?: string[]; // e.g., ["08:00", "12:00", "18:00"]
  timezone?: string;
  data?: any;
}

// Default notification times
export const DEFAULT_TIMES = {
  MORNING: '08:00',
  MIDDAY: '12:00',
  EVENING: '18:00',
};

/**
 * Calculate the next trigger time for a notification
 */
export function calculateNextTrigger(
  frequency: NotificationFrequency,
  customTimes: string[] | null,
  timezone: string
): Date {
  const now = new Date();
  const userTimezoneOffset = getTimezoneOffset(timezone);
  
  switch (frequency) {
    case NotificationFrequency.DAILY:
      // Send once per day at the user's preferred time (default: 8 AM)
      const dailyTime = customTimes?.[0] || DEFAULT_TIMES.MORNING;
      return getNextOccurrence(dailyTime, userTimezoneOffset);
    
    case NotificationFrequency.MULTIPLE:
      // Send multiple times per day
      const times = customTimes || [DEFAULT_TIMES.MORNING, DEFAULT_TIMES.MIDDAY, DEFAULT_TIMES.EVENING];
      return getNextOccurrenceFromMultiple(times, userTimezoneOffset);
    
    case NotificationFrequency.WEEKLY:
      // Send once per week at the user's preferred time
      const weeklyTime = customTimes?.[0] || DEFAULT_TIMES.MORNING;
      const nextWeekly = getNextOccurrence(weeklyTime, userTimezoneOffset);
      // Add 7 days
      nextWeekly.setDate(nextWeekly.getDate() + 7);
      return nextWeekly;
    
    case NotificationFrequency.CUSTOM:
      // Use custom times provided
      if (!customTimes || customTimes.length === 0) {
        throw new Error('Custom frequency requires customTimes array');
      }
      return getNextOccurrenceFromMultiple(customTimes, userTimezoneOffset);
    
    default:
      throw new Error(`Unknown frequency: ${frequency}`);
  }
}

/**
 * Schedule a recurring notification
 */
export async function scheduleRecurringNotification(params: ScheduleRecurringParams): Promise<void> {
  const {
    userId,
    category,
    type,
    title,
    message,
    frequency,
    customTimes,
    timezone = 'America/New_York',
    data,
  } = params;

  // Get user preferences to check if enabled
  const preferences = await prisma.notificationPreferences.findUnique({
    where: {
      userId_category: {
        userId,
        category,
      },
    },
  });

  if (!preferences || !preferences.emailEnabled) {
    console.log(`Notifications disabled for user ${userId}, category ${category}`);
    return;
  }

  // Calculate next trigger time
  const nextTrigger = calculateNextTrigger(
    frequency,
    customTimes || null,
    timezone
  );

  // Schedule the notification
  await scheduleNotification({
    userId,
    category,
    type,
    title,
    message,
    scheduledFor: nextTrigger,
    data,
  });

  console.log(`Scheduled ${type} notification for user ${userId} at ${nextTrigger.toISOString()}`);
}

/**
 * Update a user's notification schedule
 */
export async function updateSchedule(
  userId: string,
  category: NotificationCategory,
  newSchedule: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  // Update preferences
  const updated = await prisma.notificationPreferences.upsert({
    where: {
      userId_category: {
        userId,
        category,
      },
    },
    update: newSchedule,
    create: {
      userId,
      category,
      emailEnabled: newSchedule.emailEnabled ?? true,
      pushEnabled: newSchedule.pushEnabled ?? true,
      inAppEnabled: newSchedule.inAppEnabled ?? true,
      frequency: newSchedule.frequency ?? NotificationFrequency.DAILY,
      customTimes: newSchedule.customTimes ?? null,
      timezone: newSchedule.timezone ?? 'America/New_York',
    },
  });

  // Cancel any pending notifications for this category
  await prisma.scheduledNotification.updateMany({
    where: {
      userId,
      category,
      status: 'PENDING',
    },
    data: {
      status: 'CANCELLED',
    },
  });

  return updated;
}

/**
 * Get the next occurrence of a time (HH:MM format) in the future
 */
function getNextOccurrence(time: string, timezoneOffset: number): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  
  // Create date in user's timezone
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  
  // Adjust for timezone
  next.setMinutes(next.getMinutes() - timezoneOffset);
  
  // If the time has already passed today, schedule for tomorrow
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  
  return next;
}

/**
 * Get the next occurrence from multiple times
 */
function getNextOccurrenceFromMultiple(times: string[], timezoneOffset: number): Date {
  const now = new Date();
  const occurrences = times.map(time => getNextOccurrence(time, timezoneOffset));
  
  // Sort by date and return the earliest
  occurrences.sort((a, b) => a.getTime() - b.getTime());
  
  return occurrences[0];
}

/**
 * Get timezone offset in minutes
 * This is a simplified version - in production, use a library like moment-timezone
 */
function getTimezoneOffset(timezone: string): number {
  // Common timezone offsets (in minutes from UTC)
  const offsets: Record<string, number> = {
    'America/New_York': 300,      // EST/EDT
    'America/Chicago': 360,        // CST/CDT
    'America/Denver': 420,         // MST/MDT
    'America/Los_Angeles': 480,    // PST/PDT
    'America/Phoenix': 420,        // MST (no DST)
    'America/Anchorage': 540,      // AKST/AKDT
    'Pacific/Honolulu': 600,       // HST
    'Europe/London': -60,          // GMT/BST
    'Europe/Paris': -120,          // CET/CEST
    'Asia/Tokyo': -540,            // JST
    'Australia/Sydney': -660,      // AEDT/AEST
    'UTC': 0,
  };
  
  return offsets[timezone] || 0;
}

/**
 * Schedule daily goal notifications for a user
 */
export async function scheduleDailyGoalNotifications(
  userId: string,
  goalData?: any
): Promise<void> {
  const preferences = await prisma.notificationPreferences.findUnique({
    where: {
      userId_category: {
        userId,
        category: 'GOALS',
      },
    },
  });

  const frequency = preferences?.frequency || NotificationFrequency.DAILY;
  const customTimes = preferences?.customTimes as string[] | null;
  const timezone = preferences?.timezone || 'America/New_York';

  await scheduleRecurringNotification({
    userId,
    category: 'GOALS',
    type: 'daily_goal_tip',
    title: '🎯 Daily Goal Check-In',
    message: 'Time to review your progress and plan your next session!',
    frequency,
    customTimes: customTimes || undefined,
    timezone,
    data: goalData,
  });
}
