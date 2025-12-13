/**
 * Comprehensive Email System Test
 * Tests all email types and verifies Resend configuration
 */

import { UnifiedEmailService, EmailSender } from '../lib/email/unified-email-service';

const TEST_EMAIL = process.env.TEST_EMAIL || 'dean@mindfulchampion.com';

async function testEmailSystem() {
  console.log('\n🧪 TESTING UNIFIED EMAIL SYSTEM\n');
  console.log('='.repeat(60));
  
  const results: { name: string; success: boolean; error?: string }[] = [];
  
  // Test 1: Welcome Email
  console.log('\n1️⃣  Testing WELCOME email...');
  try {
    const result = await EmailSender.welcome('test-user-id', TEST_EMAIL, 'Test User');
    results.push({ name: 'Welcome Email', success: result.success, error: result.error });
    console.log(result.success ? '✅ PASSED' : `❌ FAILED: ${result.error}`);
  } catch (error: any) {
    results.push({ name: 'Welcome Email', success: false, error: error.message });
    console.log(`❌ FAILED: ${error.message}`);
  }
  
  // Test 2: Password Reset Email
  console.log('\n2️⃣  Testing PASSWORD RESET email...');
  try {
    const result = await EmailSender.passwordReset(
      'test-user-id',
      TEST_EMAIL,
      'Test User',
      'test-reset-token-123',
      'https://mindfulchampion.com/reset-password?token=test-reset-token-123'
    );
    results.push({ name: 'Password Reset Email', success: result.success, error: result.error });
    console.log(result.success ? '✅ PASSED' : `❌ FAILED: ${result.error}`);
  } catch (error: any) {
    results.push({ name: 'Password Reset Email', success: false, error: error.message });
    console.log(`❌ FAILED: ${error.message}`);
  }
  
  // Test 3: Subscription Confirmation
  console.log('\n3️⃣  Testing SUBSCRIPTION CONFIRMATION email...');
  try {
    const result = await EmailSender.subscriptionConfirmed(
      'test-user-id',
      TEST_EMAIL,
      'Test User',
      'Pro Plan',
      29.99,
      'December 13, 2025'
    );
    results.push({ name: 'Subscription Confirmation', success: result.success, error: result.error });
    console.log(result.success ? '✅ PASSED' : `❌ FAILED: ${result.error}`);
  } catch (error: any) {
    results.push({ name: 'Subscription Confirmation', success: false, error: error.message });
    console.log(`❌ FAILED: ${error.message}`);
  }
  
  // Test 4: Subscription Expiring
  console.log('\n4️⃣  Testing SUBSCRIPTION EXPIRING email...');
  try {
    const result = await EmailSender.subscriptionExpiring(
      'test-user-id',
      TEST_EMAIL,
      'Test User',
      'Pro Plan',
      'December 20, 2025',
      7
    );
    results.push({ name: 'Subscription Expiring', success: result.success, error: result.error });
    console.log(result.success ? '✅ PASSED' : `❌ FAILED: ${result.error}`);
  } catch (error: any) {
    results.push({ name: 'Subscription Expiring', success: false, error: error.message });
    console.log(`❌ FAILED: ${error.message}`);
  }
  
  // Test 5: Payment Receipt
  console.log('\n5️⃣  Testing PAYMENT RECEIPT email...');
  try {
    const result = await EmailSender.paymentReceipt(
      'test-user-id',
      TEST_EMAIL,
      'Test User',
      29.99,
      'Pro Plan',
      'txn_1234567890',
      'December 12, 2025'
    );
    results.push({ name: 'Payment Receipt', success: result.success, error: result.error });
    console.log(result.success ? '✅ PASSED' : `❌ FAILED: ${result.error}`);
  } catch (error: any) {
    results.push({ name: 'Payment Receipt', success: false, error: error.message });
    console.log(`❌ FAILED: ${error.message}`);
  }
  
  // Test 6: Tournament Registration
  console.log('\n6️⃣  Testing TOURNAMENT REGISTRATION email...');
  try {
    const result = await EmailSender.tournamentRegistration(
      'test-user-id',
      TEST_EMAIL,
      'Test User',
      'Holiday Pickleball Championship',
      'December 20, 2025',
      'Downtown Sports Complex'
    );
    results.push({ name: 'Tournament Registration', success: result.success, error: result.error });
    console.log(result.success ? '✅ PASSED' : `❌ FAILED: ${result.error}`);
  } catch (error: any) {
    results.push({ name: 'Tournament Registration', success: false, error: error.message });
    console.log(`❌ FAILED: ${error.message}`);
  }
  
  // Test 7: Video Analysis Failed
  console.log('\n7️⃣  Testing VIDEO ANALYSIS FAILED email...');
  try {
    const result = await EmailSender.analysisFailed(
      'test-user-id',
      TEST_EMAIL,
      'Test User',
      'My Practice Match.mp4',
      'Video format not supported. Please upload MP4, MOV, or AVI format.'
    );
    results.push({ name: 'Video Analysis Failed', success: result.success, error: result.error });
    console.log(result.success ? '✅ PASSED' : `❌ FAILED: ${result.error}`);
  } catch (error: any) {
    results.push({ name: 'Video Analysis Failed', success: false, error: error.message });
    console.log(`❌ FAILED: ${error.message}`);
  }
  
  // Test 8: Redemption Request
  console.log('\n8️⃣  Testing REDEMPTION REQUEST email...');
  try {
    const result = await EmailSender.redemptionRequest(
      'test-user-id',
      TEST_EMAIL,
      'Test User',
      'Pro Paddle Upgrade',
      500,
      'req_abc123xyz'
    );
    results.push({ name: 'Redemption Request', success: result.success, error: result.error });
    console.log(result.success ? '✅ PASSED' : `❌ FAILED: ${result.error}`);
  } catch (error: any) {
    results.push({ name: 'Redemption Request', success: false, error: error.message });
    console.log(`❌ FAILED: ${error.message}`);
  }
  
  // Test 9: Admin New User Alert
  console.log('\n9️⃣  Testing ADMIN NEW USER alert...');
  try {
    const result = await EmailSender.adminNewUser(
      'Test User',
      TEST_EMAIL,
      'test-user-id-123',
      'December 12, 2025 at 3:45 PM'
    );
    results.push({ name: 'Admin New User Alert', success: result.success, error: result.error });
    console.log(result.success ? '✅ PASSED' : `❌ FAILED: ${result.error}`);
  } catch (error: any) {
    results.push({ name: 'Admin New User Alert', success: false, error: error.message });
    console.log(`❌ FAILED: ${error.message}`);
  }
  
  // Test 10: Admin Payment Alert
  console.log('\n🔟 Testing ADMIN PAYMENT alert...');
  try {
    const result = await EmailSender.adminPayment(
      'Test User',
      TEST_EMAIL,
      29.99,
      'Pro Plan',
      'txn_1234567890'
    );
    results.push({ name: 'Admin Payment Alert', success: result.success, error: result.error });
    console.log(result.success ? '✅ PASSED' : `❌ FAILED: ${result.error}`);
  } catch (error: any) {
    results.push({ name: 'Admin Payment Alert', success: false, error: error.message });
    console.log(`❌ FAILED: ${error.message}`);
  }
  
  // Print Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 TEST SUMMARY\n');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);
  
  if (failed > 0) {
    console.log('❌ FAILED TESTS:\n');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
    console.log();
  }
  
  console.log('='.repeat(60));
  
  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED! Email system is fully operational.\n');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Please review the errors above.\n');
  }
}

// Run tests
testEmailSystem()
  .then(() => {
    console.log('✅ Email system test complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Email system test failed:', error);
    process.exit(1);
  });
