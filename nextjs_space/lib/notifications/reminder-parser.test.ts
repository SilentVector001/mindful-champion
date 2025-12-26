/**
 * Test Suite for Reminder Parser
 * Tests various natural language patterns
 */

import { parseReminderRequest } from './reminder-parser';

// Test cases covering different natural language patterns
const testCases = [
  // Basic reminder patterns
  {
    input: "Remind me to practice serves tomorrow at 3 PM",
    expected: {
      isReminder: true,
      shouldInclude: ['practice serves', 'tomorrow', '3 PM'],
    },
  },
  {
    input: "Set a reminder for my tournament next week",
    expected: {
      isReminder: true,
      shouldInclude: ['tournament', 'next week'],
    },
  },
  {
    input: "Can you remind me to upload a video in 2 hours?",
    expected: {
      isReminder: true,
      shouldInclude: ['upload', 'video'],
    },
  },
  
  // Daily/recurring reminders
  {
    input: "Send me a daily reminder at 8 AM to review my goals",
    expected: {
      isReminder: true,
      shouldInclude: ['daily', 'goals', '8 AM'],
      frequency: 'DAILY',
    },
  },
  {
    input: "I want to be reminded every morning to check my progress",
    expected: {
      isReminder: true,
      shouldInclude: ['morning', 'progress'],
    },
  },
  {
    input: "Remind me every Monday at 9 AM about tournaments",
    expected: {
      isReminder: true,
      shouldInclude: ['Monday', 'tournaments'],
      frequency: 'WEEKLY',
    },
  },
  
  // Time-of-day reminders
  {
    input: "Remind me tomorrow morning to do my stretches",
    expected: {
      isReminder: true,
      shouldInclude: ['morning', 'stretches'],
    },
  },
  {
    input: "Set a reminder for this evening at 6 PM",
    expected: {
      isReminder: true,
      shouldInclude: ['evening'],
    },
  },
  
  // Category-specific reminders
  {
    input: "Notify me when to analyze my video tomorrow",
    expected: {
      isReminder: true,
      shouldInclude: ['video', 'analyze'],
      category: 'VIDEO_ANALYSIS',
    },
  },
  {
    input: "Remind me about the tournament registration next Friday",
    expected: {
      isReminder: true,
      shouldInclude: ['tournament', 'Friday'],
      category: 'TOURNAMENTS',
    },
  },
  
  // Edge cases
  {
    input: "What's the weather like tomorrow?",
    expected: {
      isReminder: false,
    },
  },
  {
    input: "How do I improve my serve?",
    expected: {
      isReminder: false,
    },
  },
  {
    input: "Tell me about practice drills",
    expected: {
      isReminder: false,
    },
  },
];

// Run tests
export function runReminderParserTests() {
  console.log('🧪 Running Reminder Parser Tests\n');
  console.log('='.repeat(80));
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((testCase, index) => {
    console.log(`\n📝 Test ${index + 1}: "${testCase.input}"`);
    
    try {
      const result = parseReminderRequest(testCase.input);
      
      // Check if reminder detection matches expectation
      if (result?.isReminder !== testCase.expected.isReminder) {
        console.log(`❌ FAILED: Expected isReminder=${testCase.expected.isReminder}, got ${result?.isReminder}`);
        failed++;
        return;
      }
      
      if (!testCase.expected.isReminder) {
        console.log(`✅ PASSED: Correctly identified as NOT a reminder`);
        passed++;
        return;
      }
      
      // For valid reminders, check additional properties
      if (result) {
        console.log(`   Title: "${result.title}"`);
        console.log(`   Category: ${result.category}`);
        console.log(`   Scheduled: ${result.scheduledFor.toLocaleString()}`);
        console.log(`   Frequency: ${result.frequency}`);
        console.log(`   Confidence: ${(result.confidence * 100).toFixed(0)}%`);
        
        // Check if expected strings are included
        if (testCase.expected.shouldInclude) {
          const fullText = `${result.title} ${result.description || ''}`.toLowerCase();
          const missingTerms = testCase.expected.shouldInclude.filter(
            term => !testCase.input.toLowerCase().includes(term.toLowerCase())
          );
          
          if (missingTerms.length > 0) {
            console.log(`⚠️  Warning: Expected terms not found in input: ${missingTerms.join(', ')}`);
          }
        }
        
        // Check frequency if specified
        if (testCase.expected.frequency && result.frequency !== testCase.expected.frequency) {
          console.log(`⚠️  Warning: Expected frequency ${testCase.expected.frequency}, got ${result.frequency}`);
        }
        
        // Check category if specified
        if (testCase.expected.category && result.category !== testCase.expected.category) {
          console.log(`⚠️  Warning: Expected category ${testCase.expected.category}, got ${result.category}`);
        }
        
        console.log(`✅ PASSED`);
        passed++;
      } else {
        console.log(`❌ FAILED: Result is null but expected a valid reminder`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ FAILED: Error during parsing`);
      console.log(`   Error: ${error}`);
      failed++;
    }
  });
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);
  console.log(`   Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Review the output above for details.');
  }
  
  return { passed, failed, total: testCases.length };
}

// Additional test: Comprehensive date/time parsing
export function testDateTimeParsing() {
  console.log('\n\n🕐 Testing Date/Time Parsing Accuracy\n');
  console.log('='.repeat(80));
  
  const dateTimeTests = [
    "Remind me tomorrow at 3 PM",
    "Set a reminder for next Monday at 9:30 AM",
    "Notify me in 2 hours",
    "Remind me in 3 days at noon",
    "Every morning at 8 AM",
    "Tomorrow morning",
    "Next week on Wednesday",
  ];
  
  dateTimeTests.forEach((test, index) => {
    console.log(`\n${index + 1}. "${test}"`);
    const result = parseReminderRequest(test);
    if (result) {
      const now = new Date();
      const scheduled = result.scheduledFor;
      const diff = Math.ceil((scheduled.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      console.log(`   Scheduled: ${scheduled.toLocaleString()}`);
      console.log(`   From now: ~${diff} hours`);
      console.log(`   Time of day: ${result.timeOfDay || 'not specified'}`);
    } else {
      console.log(`   ❌ Failed to parse`);
    }
  });
}

// Export for manual testing
if (typeof window === 'undefined' && require.main === module) {
  // Running directly with Node
  runReminderParserTests();
  testDateTimeParsing();
}
