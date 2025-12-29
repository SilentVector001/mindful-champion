"use strict";
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
var resend_client_1 = require("../lib/email/resend-client");
var dotenv = require("dotenv");
// Load environment variables
dotenv.config({ path: '.env.local' });
function sendTestEmails() {
    return __awaiter(this, void 0, void 0, function () {
        var resend, fromEmail, testEmails, results, _i, testEmails_1, recipient, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🚀 Starting test email sending process...\n');
                    resend = (0, resend_client_1.getResendClient)();
                    fromEmail = 'Mindful Champion <noreply@mindfulchampion.com>';
                    testEmails = [
                        {
                            to: 'lee@onesoulpickleball.com',
                            name: 'Lee'
                        },
                        {
                            to: 'Deansnow59@gmail.com',
                            name: 'Dean'
                        }
                    ];
                    results = [];
                    _i = 0, testEmails_1 = testEmails;
                    _a.label = 1;
                case 1:
                    if (!(_i < testEmails_1.length)) return [3 /*break*/, 6];
                    recipient = testEmails_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    console.log("\uD83D\uDCE7 Sending test email to ".concat(recipient.to, "..."));
                    return [4 /*yield*/, resend.emails.send({
                            from: fromEmail,
                            to: recipient.to,
                            subject: '🏓 Test Email from Mindful Champion - Email System Working!',
                            html: "\n<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n</head>\n<body style=\"margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;\">\n  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color: #f3f4f6; padding: 40px 20px;\">\n    <tr>\n      <td align=\"center\">\n        <table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\">\n          \n          <!-- Header with gradient -->\n          <tr>\n            <td style=\"background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%); padding: 40px 30px; text-align: center;\">\n              <h1 style=\"margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;\">\uD83C\uDFBE Mindful Champion</h1>\n              <p style=\"margin: 10px 0 0; color: #e0f2fe; font-size: 16px;\">Email System Test</p>\n            </td>\n          </tr>\n          \n          <!-- Content -->\n          <tr>\n            <td style=\"padding: 40px 30px;\">\n              <h2 style=\"margin: 0 0 20px; color: #0f172a; font-size: 24px;\">Hi ".concat(recipient.name, "! \uD83D\uDC4B</h2>\n              \n              <p style=\"margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 1.6;\">\n                This is a <strong>test email</strong> to confirm that the Mindful Champion email system is working perfectly!\n              </p>\n              \n              <div style=\"background: linear-gradient(135deg, #f0fdfa 0%, #cffafe 100%); border-left: 4px solid #0d9488; padding: 20px; margin: 24px 0; border-radius: 8px;\">\n                <p style=\"margin: 0; color: #0f172a; font-size: 15px; line-height: 1.6;\">\n                  \u2705 <strong>Email delivery:</strong> Working<br>\n                  \u2705 <strong>HTML formatting:</strong> Working<br>\n                  \u2705 <strong>Resend integration:</strong> Working<br>\n                  \u2705 <strong>Admin email system:</strong> Ready to use\n                </p>\n              </div>\n              \n              <h3 style=\"margin: 24px 0 12px; color: #0f172a; font-size: 18px;\">\uD83D\uDCCB What's Next?</h3>\n              <ul style=\"margin: 0 0 24px; padding-left: 20px; color: #475569; font-size: 15px; line-height: 1.8;\">\n                <li>Admin email management interface is being built</li>\n                <li>You'll be able to send custom emails from the admin panel</li>\n                <li>Resend emails with one click</li>\n                <li>View complete email history and logs</li>\n                <li>Use pre-built templates for common emails</li>\n              </ul>\n              \n              <div style=\"background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 24px 0;\">\n                <p style=\"margin: 0; color: #92400e; font-size: 14px;\">\n                  <strong>\uD83D\uDD14 Note:</strong> This is a test email. No action is required from you. If you received this, the email system is working correctly!\n                </p>\n              </div>\n              \n              <p style=\"margin: 24px 0 0; color: #475569; font-size: 15px; line-height: 1.6;\">\n                If you have any questions or concerns, please contact the Mindful Champion team.\n              </p>\n            </td>\n          </tr>\n          \n          <!-- Footer -->\n          <tr>\n            <td style=\"background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;\">\n              <p style=\"margin: 0 0 8px; color: #64748b; font-size: 13px;\">\n                \u00A9 2024 Mindful Champion. All rights reserved.\n              </p>\n              <p style=\"margin: 0; color: #94a3b8; font-size: 12px;\">\n                Sent via Resend \u2022 Test Email System\n              </p>\n            </td>\n          </tr>\n          \n        </table>\n      </td>\n    </tr>\n  </table>\n</body>\n</html>\n        "),
                            text: "\nHi ".concat(recipient.name, "!\n\nThis is a test email to confirm that the Mindful Champion email system is working perfectly!\n\n\u2713 Email delivery: Working\n\u2713 HTML formatting: Working\n\u2713 Resend integration: Working\n\u2713 Admin email system: Ready to use\n\nWhat's Next?\n- Admin email management interface is being built\n- You'll be able to send custom emails from the admin panel\n- Resend emails with one click\n- View complete email history and logs\n- Use pre-built templates for common emails\n\nNote: This is a test email. No action is required from you. If you received this, the email system is working correctly!\n\n\u00A9 2024 Mindful Champion. All rights reserved.\nSent via Resend \u2022 Test Email System\n        ")
                        })];
                case 3:
                    result = _a.sent();
                    console.log("\u2705 Successfully sent to ".concat(recipient.to));
                    console.log("   Email ID: ".concat(result.id, "\n"));
                    results.push({
                        email: recipient.to,
                        success: true,
                        id: result.id
                    });
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("\u274C Failed to send to ".concat(recipient.to));
                    console.error("   Error: ".concat(error_1.message, "\n"));
                    results.push({
                        email: recipient.to,
                        success: false,
                        error: error_1.message
                    });
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    // Summary
                    console.log('\n' + '='.repeat(60));
                    console.log('📊 TEST EMAIL SUMMARY');
                    console.log('='.repeat(60));
                    console.log("Total emails attempted: ".concat(results.length));
                    console.log("Successfully sent: ".concat(results.filter(function (r) { return r.success; }).length));
                    console.log("Failed: ".concat(results.filter(function (r) { return !r.success; }).length));
                    console.log('='.repeat(60) + '\n');
                    // Detailed results
                    console.log('📋 DETAILED RESULTS:');
                    results.forEach(function (result, index) {
                        console.log("\n".concat(index + 1, ". ").concat(result.email));
                        if (result.success) {
                            console.log("   \u2705 Status: Sent successfully");
                            console.log("   \uD83D\uDCE7 Email ID: ".concat(result.id));
                        }
                        else {
                            console.log("   \u274C Status: Failed");
                            console.log("   \u26A0\uFE0F  Error: ".concat(result.error));
                        }
                    });
                    console.log('\n✨ Test email process completed!\n');
                    return [2 /*return*/];
            }
        });
    });
}
// Run the script
sendTestEmails()
    .then(function () {
    console.log('Script finished successfully');
    process.exit(0);
})
    .catch(function (error) {
    console.error('Script failed:', error);
    process.exit(1);
});
