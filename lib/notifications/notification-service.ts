/**
 * Notification Service
 * Handles sending, scheduling, and managing notifications
 */

import { prisma } from '@/lib/db';
import {
  NotificationCategory,
  NotificationStatus,
  NotificationDeliveryMethod,
  NotificationSource,
  type ScheduledNotification,
  type NotificationPreferences,
} from '@prisma/client';
import { sendNotificationEmail } from './email-templates';

export interface SendNotificationParams {
  userId: string;
  category: NotificationCategory;
  type: string;
  title: string;
  message: string;
  data?: any;
  deliveryMethod?: NotificationDeliveryMethod;
  source?: NotificationSource;
}

export interface ScheduleNotificationParams {
  userId: string;
  category: NotificationCategory;
  type: string;
  title: string;
  message: string;
  scheduledFor: Date;
  data?: any;
  deliveryMethod?: NotificationDeliveryMethod;
  source?: NotificationSource;
}

/**
 * Send a notification immediately
 */
export async function sendNotification(params: SendNotificationParams): Promise<ScheduledNotification> {
  const {
    userId,
    category,
    type,
    title,
    message,
    data,
    deliveryMethod = NotificationDeliveryMethod.EMAIL,
    source = NotificationSource.SYSTEM,
  } = params;

  // Get user preferences
  const preferences = await getUserPreferences(userId, category);
  
  // Check if notifications are enabled for this delivery method
  if (!isDeliveryMethodEnabled(preferences, deliveryMethod)) {
    throw new Error(`${deliveryMethod} notifications are disabled for ${category}`);
  }

  // Create the notification
  const notification = await prisma.scheduledNotification.create({
    data: {
      userId,
      category,
      type,
      title,
      message,
      data,
      scheduledFor: new Date(), // Send immediately
      status: NotificationStatus.PENDING,
      deliveryMethod,
      source,
    },
  });

  // Send the notification
  try {
    await deliverNotification(notification);
    
    // Update status to SENT
    const updated = await prisma.scheduledNotification.update({
      where: { id: notification.id },
      data: {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      },
    });

    // Create history record
    await prisma.notificationHistory.create({
      data: {
        userId,
        notificationId: notification.id,
        deliveredAt: new Date(),
      },
    });

    return updated;
  } catch (error) {
    // Update status to FAILED
    await prisma.scheduledNotification.update({
      where: { id: notification.id },
      data: { status: NotificationStatus.FAILED },
    });
    throw error;
  }
}

/**
 * Schedule a notification for future delivery
 */
export async function scheduleNotification(params: ScheduleNotificationParams): Promise<ScheduledNotification> {
  const {
    userId,
    category,
    type,
    title,
    message,
    scheduledFor,
    data,
    deliveryMethod = NotificationDeliveryMethod.EMAIL,
    source = NotificationSource.SYSTEM,
  } = params;

  // Get user preferences
  const preferences = await getUserPreferences(userId, category);
  
  // Check if notifications are enabled for this delivery method
  if (!isDeliveryMethodEnabled(preferences, deliveryMethod)) {
    throw new Error(`${deliveryMethod} notifications are disabled for ${category}`);
  }

  // Create the scheduled notification
  const notification = await prisma.scheduledNotification.create({
    data: {
      userId,
      category,
      type,
      title,
      message,
      data,
      scheduledFor,
      status: NotificationStatus.PENDING,
      deliveryMethod,
      source,
    },
  });

  return notification;
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  await prisma.scheduledNotification.update({
    where: { id: notificationId },
    data: { status: NotificationStatus.CANCELLED },
  });
}

/**
 * Get upcoming notifications for a user
 */
export async function getUpcomingNotifications(
  userId: string,
  limit = 10
): Promise<ScheduledNotification[]> {
  return prisma.scheduledNotification.findMany({
    where: {
      userId,
      status: NotificationStatus.PENDING,
      scheduledFor: {
        gte: new Date(),
      },
    },
    orderBy: {
      scheduledFor: 'asc',
    },
    take: limit,
  });
}

/**
 * Process scheduled notifications (to be called by a cron job)
 */
export async function processScheduledNotifications(): Promise<void> {
  const now = new Date();
  
  // Find all pending notifications that should be sent
  const notifications = await prisma.scheduledNotification.findMany({
    where: {
      status: NotificationStatus.PENDING,
      scheduledFor: {
        lte: now,
      },
    },
    include: {
      user: true,
    },
  });

  console.log(`Processing ${notifications.length} scheduled notifications...`);

  // Process each notification
  for (const notification of notifications) {
    try {
      await deliverNotification(notification);
      
      // Update status to SENT
      await prisma.scheduledNotification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        },
      });

      // Create history record
      await prisma.notificationHistory.create({
        data: {
          userId: notification.userId,
          notificationId: notification.id,
          deliveredAt: new Date(),
        },
      });

      console.log(`✓ Sent notification ${notification.id} to user ${notification.userId}`);
    } catch (error) {
      console.error(`✗ Failed to send notification ${notification.id}:`, error);
      
      // Update status to FAILED
      await prisma.scheduledNotification.update({
        where: { id: notification.id },
        data: { status: NotificationStatus.FAILED },
      });
    }
  }
}

/**
 * Get user preferences for a category
 */
async function getUserPreferences(
  userId: string,
  category: NotificationCategory
): Promise<NotificationPreferences | null> {
  return prisma.notificationPreferences.findUnique({
    where: {
      userId_category: {
        userId,
        category,
      },
    },
  });
}

/**
 * Check if a delivery method is enabled
 */
function isDeliveryMethodEnabled(
  preferences: NotificationPreferences | null,
  method: NotificationDeliveryMethod
): boolean {
  if (!preferences) {
    return true; // Default to enabled if no preferences set
  }

  switch (method) {
    case NotificationDeliveryMethod.EMAIL:
      return preferences.emailEnabled;
    case NotificationDeliveryMethod.PUSH:
      return preferences.pushEnabled;
    case NotificationDeliveryMethod.IN_APP:
      return preferences.inAppEnabled;
    default:
      return true;
  }
}

/**
 * Deliver a notification using the specified method
 */
async function deliverNotification(notification: ScheduledNotification): Promise<void> {
  switch (notification.deliveryMethod) {
    case NotificationDeliveryMethod.EMAIL:
      await sendNotificationEmail({
        userId: notification.userId,
        category: notification.category,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data as any,
      });
      break;
    
    case NotificationDeliveryMethod.PUSH:
      // TODO: Implement push notification logic
      console.log('Push notifications not yet implemented');
      break;
    
    case NotificationDeliveryMethod.IN_APP:
      // For in-app notifications, just mark as delivered
      // The frontend will query for them
      break;
    
    default:
      throw new Error(`Unknown delivery method: ${notification.deliveryMethod}`);
  }
}
