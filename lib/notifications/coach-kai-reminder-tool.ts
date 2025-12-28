/**
 * Coach Kai Reminder Tool
 * LLM tool definition for creating reminders through natural language
 */

import { prisma } from '@/lib/db';
import { NotificationCategory, NotificationFrequency, NotificationDeliveryMethod, NotificationStatus } from '@/lib/prisma-types';
import { parseReminderRequest, ParsedReminder } from './reminder-parser';

export interface ReminderToolInput {
  userId: string;
  userMessage: string;
  conversationId?: string;
}

export interface ReminderToolOutput {
  success: boolean;
  reminderId?: string;
  reminder?: ParsedReminder;
  confirmationMessage: string;
  error?: string;
}

/**
 * Main function to create a reminder from Coach Kai chat
 */
export async function createReminderFromCoachKai(
  input: ReminderToolInput
): Promise<ReminderToolOutput> {
  try {
    const { userId, userMessage, conversationId } = input;

    // Parse the natural language request
    const parsed = parseReminderRequest(userMessage);
    
    if (!parsed || !parsed.isReminder) {
      return {
        success: false,
        confirmationMessage: "I couldn't detect a valid reminder request. Could you try rephrasing it?",
        error: 'No reminder detected',
      };
    }

    // Low confidence - ask for clarification
    if (parsed.confidence < 0.6) {
      return {
        success: false,
        reminder: parsed,
        confirmationMessage: buildClarificationMessage(parsed),
      };
    }

    // Create the scheduled notification in the database
    const scheduledNotification = await prisma.scheduledNotification.create({
      data: {
        userId,
        category: parsed.category,
        type: 'REMINDER',
        title: parsed.title,
        message: parsed.description || parsed.title,
        scheduledFor: parsed.scheduledFor,
        status: 'PENDING' as NotificationStatus,
        deliveryMethod: 'APP' as NotificationDeliveryMethod,
        source: 'COACH_KAI',
        data: {
          frequency: parsed.frequency,
          timeOfDay: parsed.timeOfDay,
          createdFrom: 'coach_kai',
          conversationId,
          originalMessage: userMessage,
        },
      },
    });

    // Build confirmation message
    const confirmationMessage = buildConfirmationMessage(parsed, scheduledNotification.id);

    return {
      success: true,
      reminderId: scheduledNotification.id,
      reminder: parsed,
      confirmationMessage,
    };
  } catch (error) {
    console.error('Error creating Coach Kai reminder:', error);
    return {
      success: false,
      confirmationMessage: "Oops! I had trouble setting up that reminder. Want to try again?",
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Build a user-friendly confirmation message
 */
function buildConfirmationMessage(parsed: ParsedReminder, reminderId: string): string {
  const timeStr = formatDateTime(parsed.scheduledFor);
  const frequencyStr = formatFrequency(parsed.frequency);
  const emoji = getCategoryEmoji(parsed.category);
  
  let message = `✅ ${emoji} Got it! I'll remind you to "${parsed.title}"`;
  
  if (parsed.frequency !== 'CUSTOM') {
    message += ` ${frequencyStr} at ${parsed.timeOfDay || formatTime(parsed.scheduledFor)}.`;
  } else {
    message += ` ${timeStr}.`;
  }
  
  message += `\n\n🔔 You can manage this reminder in your [Notifications Settings](/settings/notifications).`;
  
  return message;
}

/**
 * Build clarification message when confidence is low
 */
function buildClarificationMessage(parsed: ParsedReminder): string {
  const emoji = getCategoryEmoji(parsed.category);
  
  let message = `${emoji} I think you want a reminder to "${parsed.title}"`;
  
  if (parsed.scheduledFor) {
    message += ` on ${formatDateTime(parsed.scheduledFor)}`;
  }
  
  message += `. Is that right?\n\n`;
  message += `If not, could you be more specific? For example:\n`;
  message += `• "Remind me tomorrow at 3 PM to practice serves"\n`;
  message += `• "Daily reminder at 8 AM to review goals"\n`;
  message += `• "Remind me every Monday about tournaments"`;
  
  return message;
}

/**
 * Format date and time in user-friendly way
 */
function formatDateTime(date: Date): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  
  if (isToday) {
    return `today at ${formatTime(date)}`;
  } else if (isTomorrow) {
    return `tomorrow at ${formatTime(date)}`;
  } else {
    const daysDiff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) {
      return `on ${date.toLocaleDateString('en-US', { weekday: 'long' })} at ${formatTime(date)}`;
    } else {
      return `on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${formatTime(date)}`;
    }
  }
}

/**
 * Format time in 12-hour format
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format frequency in user-friendly way
 */
function formatFrequency(frequency: NotificationFrequency): string {
  switch (frequency) {
    case 'DAILY':
      return 'every day';
    case 'WEEKLY':
      return 'every week';
    case 'MULTIPLE':
      return 'multiple times';
    default:
      return 'once';
  }
}

/**
 * Get emoji for category
 */
function getCategoryEmoji(category: NotificationCategory): string {
  const emojiMap: Record<NotificationCategory, string> = {
    GOALS: '🎯',
    VIDEO_ANALYSIS: '📹',
    TOURNAMENTS: '🏆',
    MEDIA: '📺',
    ACCOUNT: '👤',
    ACHIEVEMENTS: '⭐',
    COACH_KAI: '💬',
  };
  
  return emojiMap[category] || '🔔';
}

/**
 * Detect if a message contains reminder intent (quick check)
 * Uses same patterns as reminder-parser for consistency
 */
export function hasReminderIntent(message: string): boolean {
  const REMINDER_PATTERNS = [
    /remind\s+me/i,
    /set\s+(a|an)?\s*(daily|weekly)?\s*reminder/i,
    /(notify|notified)\s+me/i,
    /send\s+me\s+(a|an)?\s*(reminder|notification)/i,
    /I\s+want\s+to\s+be\s+(reminded|notified)/i,
    /can\s+you\s+remind/i,
    /schedule\s+(a|an)?\s*reminder/i,
    /alert\s+me/i,
    /reminder\s+(for|about|to|at)/i,
    /(daily|weekly)\s+(reminder|notification|motivation)/i,
  ];
  
  return REMINDER_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Get user's reminder statistics (for Coach Kai to reference)
 */
export async function getUserReminderStats(userId: string) {
  try {
    const activeReminders = await prisma.scheduledNotification.count({
      where: {
        userId,
        status: 'PENDING',
        source: 'COACH_KAI',
      },
    });

    const completedReminders = await prisma.scheduledNotification.count({
      where: {
        userId,
        status: 'SENT',
        source: 'COACH_KAI',
      },
    });

    const recentReminders = await prisma.scheduledNotification.findMany({
      where: {
        userId,
        source: 'COACH_KAI',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
      select: {
        title: true,
        scheduledFor: true,
        status: true,
      },
    });

    return {
      active: activeReminders,
      completed: completedReminders,
      recent: recentReminders,
      total: activeReminders + completedReminders,
    };
  } catch (error) {
    console.error('Error fetching reminder stats:', error);
    return null;
  }
}

/**
 * Cancel/delete a reminder (for follow-up conversations)
 */
export async function cancelReminder(userId: string, reminderId: string): Promise<boolean> {
  try {
    const reminder = await prisma.scheduledNotification.findFirst({
      where: {
        id: reminderId,
        userId,
      },
    });

    if (!reminder) {
      return false;
    }

    await prisma.scheduledNotification.delete({
      where: { id: reminderId },
    });

    return true;
  } catch (error) {
    console.error('Error canceling reminder:', error);
    return false;
  }
}

/**
 * Update a reminder (for modifications)
 */
export async function updateReminder(
  userId: string,
  reminderId: string,
  updates: Partial<{
    title: string;
    scheduledFor: Date;
    frequency: NotificationFrequency;
  }>
): Promise<boolean> {
  try {
    const reminder = await prisma.scheduledNotification.findFirst({
      where: {
        id: reminderId,
        userId,
      },
    });

    if (!reminder) {
      return false;
    }

    await prisma.scheduledNotification.update({
      where: { id: reminderId },
      data: updates,
    });

    return true;
  } catch (error) {
    console.error('Error updating reminder:', error);
    return false;
  }
}

/**
 * Tool definition for LLM (OpenAI function calling format)
 */
export const REMINDER_TOOL_DEFINITION = {
  type: 'function',
  function: {
    name: 'create_reminder',
    description: 'Create a reminder for the user based on their natural language request. Use this when the user asks to be reminded about something, wants to set a notification, or schedule an alert.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Short title/description of what to remind the user about',
        },
        scheduledFor: {
          type: 'string',
          description: 'ISO 8601 formatted date/time when the reminder should trigger',
        },
        frequency: {
          type: 'string',
          enum: ['CUSTOM', 'DAILY', 'WEEKLY', 'MULTIPLE'],
          description: 'How often the reminder should repeat',
        },
        category: {
          type: 'string',
          enum: [
            'GOALS',
            'VIDEO_ANALYSIS',
            'TOURNAMENTS',
            'MENTAL_TRAINING',
            'MEDIA',
            'COACH_KAI',
            'SOCIAL',
            'TRAINING_REMINDER',
            'MATCH_REMINDER',
            'GENERAL',
          ],
          description: 'Category of the reminder based on the content',
        },
      },
      required: ['title', 'scheduledFor'],
    },
  },
};
