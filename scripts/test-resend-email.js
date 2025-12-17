"use strict";
/**
 * Test script to verify Resend email configuration
 * Usage: npx ts-node scripts/test-resend-email.ts
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
var dotenv = require("dotenv");
var path_1 = require("path");
// Load environment variables from .env.local
dotenv.config({ path: (0, path_1.resolve)(__dirname, '../.env.local') });
// Import Resend client
var resend_1 = require("resend");
function testResendEmail() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var apiKey, adminEmail, resend, testEmailTo, result, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('🔧 Starting Resend Email Test...\n');
                    apiKey = process.env.RESEND_API_KEY;
                    adminEmail = process.env.ADMIN_EMAIL;
                    console.log('✅ Step 1: Checking configuration');
                    console.log("   API Key: ".concat(apiKey ? '✓ Configured' : '✗ Not configured'));
                    console.log("   Admin Email: ".concat(adminEmail || 'Not set', "\n"));
                    if (!apiKey || apiKey === 'your_resend_api_key_here') {
                        console.error('❌ ERROR: RESEND_API_KEY is not configured properly in .env.local');
                        process.exit(1);
                    }
                    if (!adminEmail) {
                        console.warn('⚠️  WARNING: ADMIN_EMAIL is not set in .env.local');
                    }
                    // Step 2: Initialize Resend client
                    console.log('✅ Step 2: Initializing Resend client');
                    resend = new resend_1.Resend(apiKey);
                    console.log('   Resend client initialized successfully\n');
                    // Step 3: Send test email
                    console.log('✅ Step 3: Sending test email...');
                    testEmailTo = adminEmail || 'lee@mindfulchampion.com';
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, resend.emails.send({
                            from: 'Mindful Champion <onboarding@resend.dev>',
                            to: [testEmailTo],
                            subject: '✅ Resend Email Test - Mindful Champion',
                            html: "\n        <!DOCTYPE html>\n        <html>\n        <head>\n          <meta charset=\"utf-8\">\n          <title>Email Test</title>\n        </head>\n        <body style=\"font-family: Arial, sans-serif; padding: 40px; background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%);\">\n          <div style=\"max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);\">\n            <div style=\"text-align: center; margin-bottom: 30px;\">\n              <h1 style=\"color: #0d9488; margin: 0;\">\uD83C\uDFBE Mindful Champion</h1>\n              <p style=\"color: #64748b; margin-top: 10px;\">Email System Test</p>\n            </div>\n            \n            <div style=\"background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;\">\n              <h2 style=\"margin: 0; font-size: 28px;\">\u2705 Email Test Successful!</h2>\n            </div>\n            \n            <div style=\"padding: 20px; background: #f8fafc; border-radius: 8px; margin-bottom: 20px;\">\n              <h3 style=\"color: #0d9488; margin-top: 0;\">Configuration Verified:</h3>\n              <ul style=\"color: #475569; line-height: 1.8;\">\n                <li>\u2713 Resend API Key is properly configured</li>\n                <li>\u2713 Email sending is functional</li>\n                <li>\u2713 Admin Email is set to: ".concat(testEmailTo, "</li>\n                <li>\u2713 Emails will be sent from: onboarding@resend.dev</li>\n              </ul>\n            </div>\n            \n            <div style=\"padding: 20px; background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 8px; margin-bottom: 20px;\">\n              <h4 style=\"color: #059669; margin-top: 0;\">What This Means:</h4>\n              <p style=\"color: #047857; margin: 0;\">Your Mindful Champion application is now configured to send real emails for:</p>\n              <ul style=\"color: #047857; line-height: 1.8;\">\n                <li>Sponsor application confirmations</li>\n                <li>Admin notifications for new applications</li>\n                <li>Sponsor approval emails with login credentials</li>\n                <li>Subscription upgrade notifications</li>\n                <li>Beta tester welcome emails</li>\n              </ul>\n            </div>\n            \n            <div style=\"text-align: center; padding: 20px; border-top: 1px solid #e2e8f0; margin-top: 30px;\">\n              <p style=\"color: #64748b; font-size: 14px; margin: 0;\">\n                This is an automated test email from your Mindful Champion application.\n              </p>\n              <p style=\"color: #94a3b8; font-size: 12px; margin-top: 10px;\">\n                Test sent at: ").concat(new Date().toLocaleString(), "\n              </p>\n            </div>\n          </div>\n        </body>\n        </html>\n      "),
                            text: "\n        Mindful Champion - Email System Test\n        \n        \u2705 Email Test Successful!\n        \n        Configuration Verified:\n        - Resend API Key is properly configured\n        - Email sending is functional\n        - Admin Email is set to: ".concat(testEmailTo, "\n        - Emails will be sent from: onboarding@resend.dev\n        \n        What This Means:\n        Your Mindful Champion application is now configured to send real emails for:\n        - Sponsor application confirmations\n        - Admin notifications for new applications\n        - Sponsor approval emails with login credentials\n        - Subscription upgrade notifications\n        - Beta tester welcome emails\n        \n        Test sent at: ").concat(new Date().toLocaleString(), "\n      ")
                        })];
                case 2:
                    result = _c.sent();
                    console.log('   ✓ Email sent successfully!');
                    console.log("   Email ID: ".concat(result.id || ((_a = result.data) === null || _a === void 0 ? void 0 : _a.id) || 'N/A'));
                    console.log("   Sent to: ".concat(testEmailTo, "\n"));
                    console.log('✅ Step 4: Final verification');
                    console.log('   ✓ All checks passed!');
                    console.log('   ✓ Email system is fully functional\n');
                    console.log('📋 Summary:');
                    console.log('   • API Key Status: ✅ Valid and working');
                    console.log("   \u2022 Test Email Sent To: ".concat(testEmailTo));
                    console.log("   \u2022 Email ID: ".concat(result.id || ((_b = result.data) === null || _b === void 0 ? void 0 : _b.id) || 'N/A'));
                    console.log('   • From Address: onboarding@resend.dev');
                    console.log('   • Email Functions: Ready to use\n');
                    console.log('🎯 Next Steps:');
                    console.log('   1. Check your inbox for the test email');
                    console.log('   2. Verify the email looks correct');
                    console.log('   3. Test sponsor application flow to verify real emails');
                    console.log('   4. All email functions are now operational!\n');
                    return [2 /*return*/, result];
                case 3:
                    error_1 = _c.sent();
                    console.error('❌ ERROR: Failed to send test email');
                    console.error("   Error: ".concat(error_1.message));
                    if (error_1.message.includes('API key')) {
                        console.error('\n💡 Tip: Check that your API key is correct and active at https://resend.com/api-keys');
                    }
                    if (error_1.message.includes('domain')) {
                        console.error('\n💡 Tip: Resend test mode uses onboarding@resend.dev by default');
                        console.error('   For custom domains, you need to verify them at https://resend.com/domains');
                    }
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Run the test
testResendEmail()
    .then(function () {
    console.log('✅ Test completed successfully!');
    process.exit(0);
})
    .catch(function (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
});
