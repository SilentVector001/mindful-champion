/**
 * Quick test script for reminder parser
 * Run with: node test-reminder-parser.js
 */

// Test patterns
const testMessages = [
  "Remind me to practice serves tomorrow at 3 PM",
  "Set a daily reminder at 8 AM to review my goals",
  "I want to be notified every Monday at 9 AM about tournaments",
  "Send me a reminder in 2 hours",
  "Remind me to upload a video next week",
  "Daily motivation at 7 AM please",
  "Can you remind me to check the tournament hub every Friday?",
  "What's the weather like?", // Should not be detected
  "How do I improve my serve?", // Should not be detected
];

// Reminder detection patterns (updated to be more comprehensive)
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

function hasReminderIntent(message) {
  return REMINDER_PATTERNS.some(pattern => pattern.test(message));
}

console.log('🧪 Testing Reminder Detection\n');
console.log('='.repeat(80));

testMessages.forEach((message, index) => {
  const isReminder = hasReminderIntent(message);
  const emoji = isReminder ? '✅' : '❌';
  console.log(`\n${index + 1}. ${emoji} "${message}"`);
  console.log(`   Detected as: ${isReminder ? 'REMINDER' : 'NOT A REMINDER'}`);
});

console.log('\n' + '='.repeat(80));
console.log('\n✨ Test completed!\n');
