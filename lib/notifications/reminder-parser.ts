/**
 * Natural Language Reminder Parser for Coach Kai
 * Extracts reminder information from user messages
 */

import { NotificationCategory, NotificationFrequency } from '@/lib/prisma-types';

export interface ParsedReminder {
  isReminder: boolean;
  title: string;
  description?: string;
  category: NotificationCategory;
  scheduledFor: Date;
  frequency: NotificationFrequency;
  timeOfDay?: string; // e.g., "8:00 AM", "15:00"
  confidence: number; // 0-1 score of how confident we are this is a reminder
}

// Reminder intent patterns (comprehensive set for natural language)
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

// Time patterns
const TIME_PATTERNS = {
  // Relative times
  tomorrow: /tomorrow/i,
  nextWeek: /next\s+week/i,
  inHours: /in\s+(\d+)\s+hour/i,
  inDays: /in\s+(\d+)\s+day/i,
  
  // Specific times
  specificTime: /(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?/,
  
  // Days of week
  monday: /monday/i,
  tuesday: /tuesday/i,
  wednesday: /wednesday/i,
  thursday: /thursday/i,
  friday: /friday/i,
  saturday: /saturday/i,
  sunday: /sunday/i,
  
  // Special phrases
  morning: /(?:in\s+the\s+)?morning/i,
  afternoon: /(?:in\s+the\s+)?afternoon/i,
  evening: /(?:in\s+the\s+)?evening/i,
  night: /(?:at\s+)?night/i,
};

// Frequency patterns
const FREQUENCY_PATTERNS = {
  daily: /(every\s+day|daily)/i,
  weekly: /(every\s+week|weekly|once\s+a\s+week)/i,
  multiple: /(twice|multiple\s+times)/i,
};

// Category keywords
const CATEGORY_KEYWORDS = {
  GOALS: ['goal', 'objective', 'target', 'achievement'],
  VIDEO_ANALYSIS: ['video', 'analysis', 'analyze', 'upload', 'record'],
  TOURNAMENTS: ['tournament', 'competition', 'match', 'game'],
  MEDIA: ['watch', 'stream', 'podcast', 'video'],
  COACH_KAI: ['ask coach', 'chat', 'question', 'advice'],
};

/**
 * Main parsing function - determines if text is a reminder request
 */
export function parseReminderRequest(userMessage: string): ParsedReminder | null {
  // Check if this is a reminder intent
  const isReminder = REMINDER_PATTERNS.some(pattern => pattern.test(userMessage));
  
  if (!isReminder) {
    return null;
  }

  // Extract reminder details
  const title = extractTitle(userMessage);
  const description = extractDescription(userMessage);
  const category = extractCategory(userMessage);
  const { scheduledFor, timeOfDay } = extractDateTime(userMessage);
  const frequency = extractFrequency(userMessage);
  const confidence = calculateConfidence(userMessage);

  return {
    isReminder: true,
    title,
    description,
    category,
    scheduledFor,
    frequency,
    timeOfDay,
    confidence,
  };
}

/**
 * Extract the main title/action from the reminder request
 */
function extractTitle(message: string): string {
  // Remove reminder keywords to get the core action
  let cleaned = message
    .replace(/remind\s+me\s+(to|about|of|when)\s+/gi, '')
    .replace(/set\s+(a|an)?\s*reminder\s+(to|about|for)?\s*/gi, '')
    .replace(/notify\s+me\s+(about|when|to)\s+/gi, '')
    .replace(/send\s+me\s+(a|an)?\s*(daily|weekly)?\s*reminder\s*(to|about)?\s*/gi, '')
    .replace(/I\s+want\s+to\s+be\s+reminded\s+(to|about)?\s*/gi, '');

  // Remove time phrases
  cleaned = cleaned
    .replace(/tomorrow/gi, '')
    .replace(/next\s+week/gi, '')
    .replace(/at\s+\d{1,2}(?::\d{2})?\s*(am|pm)?/gi, '')
    .replace(/(?:in\s+the\s+)?(morning|afternoon|evening)/gi, '')
    .replace(/every\s+(day|week)/gi, '')
    .replace(/daily|weekly/gi, '')
    .trim();

  // Capitalize first letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Extract additional description if present
 */
function extractDescription(message: string): string | undefined {
  // If message is long, use it as description
  if (message.length > 50) {
    return message;
  }
  return undefined;
}

/**
 * Determine the reminder category based on keywords
 */
function extractCategory(message: string): NotificationCategory {
  const lowerMessage = message.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return category as NotificationCategory;
    }
  }
  
  // Default to GOALS
  return 'GOALS';
}

/**
 * Extract date and time from the message
 */
function extractDateTime(message: string): { scheduledFor: Date; timeOfDay?: string } {
  const now = new Date();
  let scheduledFor = new Date(now);
  let timeOfDay: string | undefined;

  // Check for "tomorrow"
  if (TIME_PATTERNS.tomorrow.test(message)) {
    scheduledFor.setDate(scheduledFor.getDate() + 1);
  }
  
  // Check for "next week"
  else if (TIME_PATTERNS.nextWeek.test(message)) {
    scheduledFor.setDate(scheduledFor.getDate() + 7);
  }
  
  // Check for "in X hours"
  const hoursMatch = message.match(TIME_PATTERNS.inHours);
  if (hoursMatch) {
    const hours = parseInt(hoursMatch[1]);
    scheduledFor.setHours(scheduledFor.getHours() + hours);
  }
  
  // Check for "in X days"
  const daysMatch = message.match(TIME_PATTERNS.inDays);
  if (daysMatch) {
    const days = parseInt(daysMatch[1]);
    scheduledFor.setDate(scheduledFor.getDate() + days);
  }
  
  // Check for specific days of week
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < daysOfWeek.length; i++) {
    const dayPattern = TIME_PATTERNS[daysOfWeek[i] as keyof typeof TIME_PATTERNS];
    if (dayPattern && (dayPattern as RegExp).test(message)) {
      const currentDay = scheduledFor.getDay();
      const targetDay = i;
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7; // Next occurrence
      scheduledFor.setDate(scheduledFor.getDate() + daysToAdd);
      break;
    }
  }

  // Extract specific time
  const timeMatch = message.match(TIME_PATTERNS.specificTime);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const meridiem = timeMatch[3]?.toLowerCase();
    
    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;
    
    scheduledFor.setHours(hours, minutes, 0, 0);
    timeOfDay = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  // Check for time of day keywords
  else if (TIME_PATTERNS.morning.test(message)) {
    scheduledFor.setHours(8, 0, 0, 0);
    timeOfDay = '08:00';
  } else if (TIME_PATTERNS.afternoon.test(message)) {
    scheduledFor.setHours(14, 0, 0, 0);
    timeOfDay = '14:00';
  } else if (TIME_PATTERNS.evening.test(message)) {
    scheduledFor.setHours(18, 0, 0, 0);
    timeOfDay = '18:00';
  } else if (TIME_PATTERNS.night.test(message)) {
    scheduledFor.setHours(20, 0, 0, 0);
    timeOfDay = '20:00';
  } else {
    // Default to 9 AM
    scheduledFor.setHours(9, 0, 0, 0);
    timeOfDay = '09:00';
  }

  // Make sure scheduled time is in the future
  if (scheduledFor <= now) {
    scheduledFor.setDate(scheduledFor.getDate() + 1);
  }

  return { scheduledFor, timeOfDay };
}

/**
 * Determine the frequency of the reminder
 */
function extractFrequency(message: string): NotificationFrequency {
  if (FREQUENCY_PATTERNS.daily.test(message)) {
    return 'DAILY';
  }
  if (FREQUENCY_PATTERNS.weekly.test(message)) {
    return 'WEEKLY';
  }
  if (FREQUENCY_PATTERNS.multiple.test(message)) {
    return 'MULTIPLE';
  }
  
  // Check for specific days mentioned (implies weekly)
  const dayKeywords = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  if (dayKeywords.some(day => message.toLowerCase().includes(day))) {
    return 'WEEKLY';
  }
  
  return 'CUSTOM'; // One-time reminder
}

/**
 * Calculate confidence score (0-1) for parsing accuracy
 */
function calculateConfidence(message: string): number {
  let score = 0.5; // Base score
  
  // Higher confidence if we have clear reminder keywords
  const hasStrongIntent = REMINDER_PATTERNS.slice(0, 3).some(pattern => pattern.test(message));
  if (hasStrongIntent) score += 0.2;
  
  // Higher confidence if we have time information
  const hasTimeInfo = Object.values(TIME_PATTERNS).some(pattern => pattern.test(message));
  if (hasTimeInfo) score += 0.2;
  
  // Higher confidence if we have frequency information
  const hasFrequency = Object.values(FREQUENCY_PATTERNS).some(pattern => pattern.test(message));
  if (hasFrequency) score += 0.1;
  
  return Math.min(score, 1.0);
}

/**
 * Test/validate natural language patterns
 */
export function testReminderPatterns() {
  const testCases = [
    "Remind me to practice serves tomorrow at 3 PM",
    "Set a daily reminder at 8 AM to review my goals",
    "I want to be notified every Monday at 9 AM about tournaments",
    "Send me a reminder in 2 hours",
    "Remind me to upload a video next week",
    "Daily motivation at 7 AM please",
    "Can you remind me to check the tournament hub every Friday?",
  ];

  console.log('Testing Reminder Parser:');
  testCases.forEach(testCase => {
    const result = parseReminderRequest(testCase);
    console.log(`\nInput: "${testCase}"`);
    console.log('Result:', JSON.stringify(result, null, 2));
  });
}
