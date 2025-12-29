"use strict";
/**
 * Comprehensive Email System Test
 * Tests all email types and verifies Resend configuration
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var unified_email_service_1 = require("../lib/email/unified-email-service");
var TEST_EMAIL = process.env.TEST_EMAIL || 'dean@mindfulchampion.com';
function testEmailSystem() {
    return __awaiter(this, void 0, void 0, function () {
        var results, result, error_1, result, error_2, result, error_3, result, error_4, result, error_5, result, error_6, result, error_7, result, error_8, result, error_9, result, error_10, passed, failed, total;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n🧪 TESTING UNIFIED EMAIL SYSTEM\n');
                    console.log('='.repeat(60));
                    results = [];
                    // Test 1: Welcome Email
                    console.log('\n1️⃣  Testing WELCOME email...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, unified_email_service_1.EmailSender.welcome('test-user-id', TEST_EMAIL, 'Test User')];
                case 2:
                    result = _a.sent();
                    results.push({ name: 'Welcome Email', success: result.success, error: result.error });
                    console.log(result.success ? '✅ PASSED' : "\u274C FAILED: ".concat(result.error));
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    results.push({ name: 'Welcome Email', success: false, error: error_1.message });
                    console.log("\u274C FAILED: ".concat(error_1.message));
                    return [3 /*break*/, 4];
                case 4:
                    // Test 2: Password Reset Email
                    console.log('\n2️⃣  Testing PASSWORD RESET email...');
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, unified_email_service_1.EmailSender.passwordReset('test-user-id', TEST_EMAIL, 'Test User', 'test-reset-token-123', 'https://mindfulchampion.com/reset-password?token=test-reset-token-123')];
                case 6:
                    result = _a.sent();
                    results.push({ name: 'Password Reset Email', success: result.success, error: result.error });
                    console.log(result.success ? '✅ PASSED' : "\u274C FAILED: ".concat(result.error));
                    return [3 /*break*/, 8];
                case 7:
                    error_2 = _a.sent();
                    results.push({ name: 'Password Reset Email', success: false, error: error_2.message });
                    console.log("\u274C FAILED: ".concat(error_2.message));
                    return [3 /*break*/, 8];
                case 8:
                    // Test 3: Subscription Confirmation
                    console.log('\n3️⃣  Testing SUBSCRIPTION CONFIRMATION email...');
                    _a.label = 9;
                case 9:
                    _a.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, unified_email_service_1.EmailSender.subscriptionConfirmed('test-user-id', TEST_EMAIL, 'Test User', 'Pro Plan', 29.99, 'December 13, 2025')];
                case 10:
                    result = _a.sent();
                    results.push({ name: 'Subscription Confirmation', success: result.success, error: result.error });
                    console.log(result.success ? '✅ PASSED' : "\u274C FAILED: ".concat(result.error));
                    return [3 /*break*/, 12];
                case 11:
                    error_3 = _a.sent();
                    results.push({ name: 'Subscription Confirmation', success: false, error: error_3.message });
                    console.log("\u274C FAILED: ".concat(error_3.message));
                    return [3 /*break*/, 12];
                case 12:
                    // Test 4: Subscription Expiring
                    console.log('\n4️⃣  Testing SUBSCRIPTION EXPIRING email...');
                    _a.label = 13;
                case 13:
                    _a.trys.push([13, 15, , 16]);
                    return [4 /*yield*/, unified_email_service_1.EmailSender.subscriptionExpiring('test-user-id', TEST_EMAIL, 'Test User', 'Pro Plan', 'December 20, 2025', 7)];
                case 14:
                    result = _a.sent();
                    results.push({ name: 'Subscription Expiring', success: result.success, error: result.error });
                    console.log(result.success ? '✅ PASSED' : "\u274C FAILED: ".concat(result.error));
                    return [3 /*break*/, 16];
                case 15:
                    error_4 = _a.sent();
                    results.push({ name: 'Subscription Expiring', success: false, error: error_4.message });
                    console.log("\u274C FAILED: ".concat(error_4.message));
                    return [3 /*break*/, 16];
                case 16:
                    // Test 5: Payment Receipt
                    console.log('\n5️⃣  Testing PAYMENT RECEIPT email...');
                    _a.label = 17;
                case 17:
                    _a.trys.push([17, 19, , 20]);
                    return [4 /*yield*/, unified_email_service_1.EmailSender.paymentReceipt('test-user-id', TEST_EMAIL, 'Test User', 29.99, 'Pro Plan', 'txn_1234567890', 'December 12, 2025')];
                case 18:
                    result = _a.sent();
                    results.push({ name: 'Payment Receipt', success: result.success, error: result.error });
                    console.log(result.success ? '✅ PASSED' : "\u274C FAILED: ".concat(result.error));
                    return [3 /*break*/, 20];
                case 19:
                    error_5 = _a.sent();
                    results.push({ name: 'Payment Receipt', success: false, error: error_5.message });
                    console.log("\u274C FAILED: ".concat(error_5.message));
                    return [3 /*break*/, 20];
                case 20:
                    // Test 6: Tournament Registration
                    console.log('\n6️⃣  Testing TOURNAMENT REGISTRATION email...');
                    _a.label = 21;
                case 21:
                    _a.trys.push([21, 23, , 24]);
                    return [4 /*yield*/, unified_email_service_1.EmailSender.tournamentRegistration('test-user-id', TEST_EMAIL, 'Test User', 'Holiday Pickleball Championship', 'December 20, 2025', 'Downtown Sports Complex')];
                case 22:
                    result = _a.sent();
                    results.push({ name: 'Tournament Registration', success: result.success, error: result.error });
                    console.log(result.success ? '✅ PASSED' : "\u274C FAILED: ".concat(result.error));
                    return [3 /*break*/, 24];
                case 23:
                    error_6 = _a.sent();
                    results.push({ name: 'Tournament Registration', success: false, error: error_6.message });
                    console.log("\u274C FAILED: ".concat(error_6.message));
                    return [3 /*break*/, 24];
                case 24:
                    // Test 7: Video Analysis Failed
                    console.log('\n7️⃣  Testing VIDEO ANALYSIS FAILED email...');
                    _a.label = 25;
                case 25:
                    _a.trys.push([25, 27, , 28]);
                    return [4 /*yield*/, unified_email_service_1.EmailSender.analysisFailed('test-user-id', TEST_EMAIL, 'Test User', 'My Practice Match.mp4', 'Video format not supported. Please upload MP4, MOV, or AVI format.')];
                case 26:
                    result = _a.sent();
                    results.push({ name: 'Video Analysis Failed', success: result.success, error: result.error });
                    console.log(result.success ? '✅ PASSED' : "\u274C FAILED: ".concat(result.error));
                    return [3 /*break*/, 28];
                case 27:
                    error_7 = _a.sent();
                    results.push({ name: 'Video Analysis Failed', success: false, error: error_7.message });
                    console.log("\u274C FAILED: ".concat(error_7.message));
                    return [3 /*break*/, 28];
                case 28:
                    // Test 8: Redemption Request
                    console.log('\n8️⃣  Testing REDEMPTION REQUEST email...');
                    _a.label = 29;
                case 29:
                    _a.trys.push([29, 31, , 32]);
                    return [4 /*yield*/, unified_email_service_1.EmailSender.redemptionRequest('test-user-id', TEST_EMAIL, 'Test User', 'Pro Paddle Upgrade', 500, 'req_abc123xyz')];
                case 30:
                    result = _a.sent();
                    results.push({ name: 'Redemption Request', success: result.success, error: result.error });
                    console.log(result.success ? '✅ PASSED' : "\u274C FAILED: ".concat(result.error));
                    return [3 /*break*/, 32];
                case 31:
                    error_8 = _a.sent();
                    results.push({ name: 'Redemption Request', success: false, error: error_8.message });
                    console.log("\u274C FAILED: ".concat(error_8.message));
                    return [3 /*break*/, 32];
                case 32:
                    // Test 9: Admin New User Alert
                    console.log('\n9️⃣  Testing ADMIN NEW USER alert...');
                    _a.label = 33;
                case 33:
                    _a.trys.push([33, 35, , 36]);
                    return [4 /*yield*/, unified_email_service_1.EmailSender.adminNewUser('Test User', TEST_EMAIL, 'test-user-id-123', 'December 12, 2025 at 3:45 PM')];
                case 34:
                    result = _a.sent();
                    results.push({ name: 'Admin New User Alert', success: result.success, error: result.error });
                    console.log(result.success ? '✅ PASSED' : "\u274C FAILED: ".concat(result.error));
                    return [3 /*break*/, 36];
                case 35:
                    error_9 = _a.sent();
                    results.push({ name: 'Admin New User Alert', success: false, error: error_9.message });
                    console.log("\u274C FAILED: ".concat(error_9.message));
                    return [3 /*break*/, 36];
                case 36:
                    // Test 10: Admin Payment Alert
                    console.log('\n🔟 Testing ADMIN PAYMENT alert...');
                    _a.label = 37;
                case 37:
                    _a.trys.push([37, 39, , 40]);
                    return [4 /*yield*/, unified_email_service_1.EmailSender.adminPayment('Test User', TEST_EMAIL, 29.99, 'Pro Plan', 'txn_1234567890')];
                case 38:
                    result = _a.sent();
                    results.push({ name: 'Admin Payment Alert', success: result.success, error: result.error });
                    console.log(result.success ? '✅ PASSED' : "\u274C FAILED: ".concat(result.error));
                    return [3 /*break*/, 40];
                case 39:
                    error_10 = _a.sent();
                    results.push({ name: 'Admin Payment Alert', success: false, error: error_10.message });
                    console.log("\u274C FAILED: ".concat(error_10.message));
                    return [3 /*break*/, 40];
                case 40:
                    // Print Summary
                    console.log('\n' + '='.repeat(60));
                    console.log('\n📊 TEST SUMMARY\n');
                    passed = results.filter(function (r) { return r.success; }).length;
                    failed = results.filter(function (r) { return !r.success; }).length;
                    total = results.length;
                    console.log("Total Tests: ".concat(total));
                    console.log("\u2705 Passed: ".concat(passed));
                    console.log("\u274C Failed: ".concat(failed));
                    console.log("Success Rate: ".concat(((passed / total) * 100).toFixed(1), "%\n"));
                    if (failed > 0) {
                        console.log('❌ FAILED TESTS:\n');
                        results.filter(function (r) { return !r.success; }).forEach(function (r) {
                            console.log("   - ".concat(r.name, ": ").concat(r.error));
                        });
                        console.log();
                    }
                    console.log('='.repeat(60));
                    if (passed === total) {
                        console.log('\n🎉 ALL TESTS PASSED! Email system is fully operational.\n');
                    }
                    else {
                        console.log('\n⚠️  SOME TESTS FAILED. Please review the errors above.\n');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// Run tests
testEmailSystem()
    .then(function () {
    console.log('✅ Email system test complete');
    process.exit(0);
})
    .catch(function (error) {
    console.error('❌ Email system test failed:', error);
    process.exit(1);
});
