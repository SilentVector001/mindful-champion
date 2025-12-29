"use strict";
/**
 * Unified Email Service
 * Single source for ALL email sending in the application
 *
 * This service replaces direct email sending and provides:
 * - Centralized email configuration
 * - Template management
 * - Database logging
 * - Error handling
 * - Resend integration
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.EmailSender = exports.UnifiedEmailService = void 0;
var resend_client_1 = require("./resend-client");
var config_1 = require("./config");
var log_email_1 = require("./log-email");
// Import all email templates
var welcome_email_1 = require("./templates/welcome-email");
var password_reset_email_1 = require("./templates/password-reset-email");
var subscription_emails_1 = require("./templates/subscription-emails");
var tournament_emails_1 = require("./templates/tournament-emails");
var analysis_failed_email_1 = require("./templates/analysis-failed-email");
var admin_alert_emails_1 = require("./templates/admin-alert-emails");
var redemption_emails_1 = require("./templates/redemption-emails");
var UnifiedEmailService = /** @class */ (function () {
    function UnifiedEmailService() {
    }
    /**
     * Send an email based on type
     */
    UnifiedEmailService.sendEmail = function (params) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var emailContent, fromEmail, resend, result, logError_1, error_1, logError_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 11]);
                        emailContent = void 0;
                        switch (params.type) {
                            case 'CUSTOM':
                                emailContent = {
                                    subject: params.subject,
                                    html: params.html,
                                    text: params.text,
                                };
                                break;
                            case 'WELCOME':
                                emailContent = (0, welcome_email_1.generateWelcomeEmail)(params.userName, params.recipientEmail);
                                break;
                            case 'PASSWORD_RESET':
                                emailContent = (0, password_reset_email_1.generatePasswordResetEmail)(params.userName, params.resetToken, params.resetUrl);
                                break;
                            case 'SUBSCRIPTION_CONFIRMATION':
                                emailContent = (0, subscription_emails_1.generateSubscriptionConfirmationEmail)(params.userName, params.planName, params.amount, params.billingDate);
                                break;
                            case 'SUBSCRIPTION_EXPIRING':
                                emailContent = (0, subscription_emails_1.generateSubscriptionExpiringEmail)(params.userName, params.planName, params.expiryDate, params.daysLeft);
                                break;
                            case 'SUBSCRIPTION_CANCELLED':
                                emailContent = (0, subscription_emails_1.generateSubscriptionCancelledEmail)(params.userName, params.planName, params.endDate);
                                break;
                            case 'PAYMENT_RECEIPT':
                                emailContent = (0, subscription_emails_1.generatePaymentReceiptEmail)(params.userName, params.amount, params.planName, params.transactionId, params.date);
                                break;
                            case 'TOURNAMENT_REGISTRATION':
                                emailContent = (0, tournament_emails_1.generateTournamentRegistrationEmail)(params.userName, params.tournamentName, params.tournamentDate, params.location);
                                break;
                            case 'TOURNAMENT_REMINDER':
                                emailContent = (0, tournament_emails_1.generateTournamentReminderEmail)(params.userName, params.tournamentName, params.hoursUntil, params.location);
                                break;
                            case 'TOURNAMENT_RESULTS':
                                emailContent = (0, tournament_emails_1.generateTournamentResultsEmail)(params.userName, params.tournamentName, params.placement, params.totalParticipants);
                                break;
                            case 'VIDEO_ANALYSIS_FAILED':
                                emailContent = (0, analysis_failed_email_1.generateAnalysisFailedEmail)(params.userName, params.videoTitle, params.errorReason);
                                break;
                            case 'REDEMPTION_REQUEST':
                                emailContent = (0, redemption_emails_1.generateRedemptionRequestEmail)(params.userName, params.rewardName, params.pointsCost, params.requestId);
                                break;
                            case 'REDEMPTION_APPROVED':
                                emailContent = (0, redemption_emails_1.generateRedemptionApprovedEmail)(params.userName, params.rewardName, params.sponsorName, params.instructions);
                                break;
                            case 'REDEMPTION_SHIPPED':
                                emailContent = (0, redemption_emails_1.generateRedemptionShippedEmail)(params.userName, params.rewardName, params.trackingNumber, params.carrier, params.estimatedDelivery);
                                break;
                            case 'ADMIN_NEW_USER':
                                emailContent = (0, admin_alert_emails_1.generateNewUserAlertEmail)(params.userName, params.userEmail, params.userId, params.signupDate);
                                break;
                            case 'ADMIN_PAYMENT':
                                emailContent = (0, admin_alert_emails_1.generatePaymentAlertEmail)(params.userName, params.userEmail, params.amount, params.planName, params.transactionId);
                                break;
                            case 'ADMIN_ERROR':
                                emailContent = (0, admin_alert_emails_1.generateSystemErrorAlertEmail)(params.errorType, params.errorMessage, params.errorStack, params.userId, params.timestamp);
                                break;
                            default:
                                throw new Error("Unsupported email type: ".concat(params.type));
                        }
                        fromEmail = (0, config_1.getFromEmail)(params.type);
                        resend = (0, resend_client_1.getResendClient)();
                        return [4 /*yield*/, resend.emails.send({
                                from: fromEmail,
                                to: params.recipientEmail,
                                subject: emailContent.subject,
                                html: emailContent.html,
                                text: emailContent.text,
                            })];
                    case 1:
                        result = _c.sent();
                        // Check for errors
                        if (result.error) {
                            throw new Error(result.error.message || 'Unknown Resend error');
                        }
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, (0, log_email_1.logEmailNotification)({
                                userId: params.userId,
                                type: params.type,
                                recipientEmail: params.recipientEmail,
                                recipientName: params.recipientName,
                                subject: emailContent.subject,
                                htmlContent: emailContent.html,
                                textContent: emailContent.text,
                                status: 'SENT',
                                resendEmailId: (_a = result.data) === null || _a === void 0 ? void 0 : _a.id,
                            })];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        logError_1 = _c.sent();
                        console.error('Failed to log email notification:', logError_1);
                        return [3 /*break*/, 5];
                    case 5:
                        console.log("\u2705 Email sent successfully: ".concat(params.type, " to ").concat(params.recipientEmail));
                        return [2 /*return*/, { success: true, emailId: (_b = result.data) === null || _b === void 0 ? void 0 : _b.id }];
                    case 6:
                        error_1 = _c.sent();
                        console.error("\u274C Failed to send ".concat(params.type, " email:"), error_1);
                        _c.label = 7;
                    case 7:
                        _c.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, (0, log_email_1.logEmailNotification)({
                                userId: params.userId,
                                type: params.type,
                                recipientEmail: params.recipientEmail,
                                recipientName: params.recipientName,
                                subject: 'subject' in params ? params.subject : 'Email',
                                htmlContent: 'html' in params ? params.html : '',
                                textContent: 'text' in params ? params.text : '',
                                status: 'FAILED',
                                error: error_1.message || 'Unknown error',
                            })];
                    case 8:
                        _c.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        logError_2 = _c.sent();
                        console.error('Failed to log failed email:', logError_2);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/, { success: false, error: error_1.message || 'Failed to send email' }];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send email to admin (uses dean@mindfulchampion.com)
     */
    UnifiedEmailService.sendAdminEmail = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var adminEmail;
            return __generator(this, function (_a) {
                adminEmail = config_1.EMAIL_CONFIG.ACCOUNTS.ADMIN.email;
                return [2 /*return*/, this.sendEmail(__assign(__assign({}, params), { recipientEmail: adminEmail }))];
            });
        });
    };
    /**
     * Test email sending
     */
    UnifiedEmailService.sendTestEmail = function (recipientEmail) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.sendEmail({
                        type: 'CUSTOM',
                        recipientEmail: recipientEmail,
                        recipientName: 'Test User',
                        subject: '🧪 Test Email - Mindful Champion',
                        html: '<h1>Test Email</h1><p>This is a test email from Mindful Champion email system.</p>',
                        text: 'Test Email\n\nThis is a test email from Mindful Champion email system.',
                    })];
            });
        });
    };
    return UnifiedEmailService;
}());
exports.UnifiedEmailService = UnifiedEmailService;
// Export convenience functions for common email types
exports.EmailSender = {
    // User emails
    welcome: function (userId, email, name) {
        return UnifiedEmailService.sendEmail({ type: 'WELCOME', userId: userId, recipientEmail: email, recipientName: name, userName: name });
    },
    passwordReset: function (userId, email, name, resetToken, resetUrl) {
        return UnifiedEmailService.sendEmail({ type: 'PASSWORD_RESET', userId: userId, recipientEmail: email, recipientName: name, userName: name, resetToken: resetToken, resetUrl: resetUrl });
    },
    // Subscription emails
    subscriptionConfirmed: function (userId, email, name, planName, amount, billingDate) {
        return UnifiedEmailService.sendEmail({ type: 'SUBSCRIPTION_CONFIRMATION', userId: userId, recipientEmail: email, recipientName: name, userName: name, planName: planName, amount: amount, billingDate: billingDate });
    },
    subscriptionExpiring: function (userId, email, name, planName, expiryDate, daysLeft) {
        return UnifiedEmailService.sendEmail({ type: 'SUBSCRIPTION_EXPIRING', userId: userId, recipientEmail: email, recipientName: name, userName: name, planName: planName, expiryDate: expiryDate, daysLeft: daysLeft });
    },
    subscriptionCancelled: function (userId, email, name, planName, endDate) {
        return UnifiedEmailService.sendEmail({ type: 'SUBSCRIPTION_CANCELLED', userId: userId, recipientEmail: email, recipientName: name, userName: name, planName: planName, endDate: endDate });
    },
    paymentReceipt: function (userId, email, name, amount, planName, transactionId, date) {
        return UnifiedEmailService.sendEmail({ type: 'PAYMENT_RECEIPT', userId: userId, recipientEmail: email, recipientName: name, userName: name, amount: amount, planName: planName, transactionId: transactionId, date: date });
    },
    // Tournament emails
    tournamentRegistration: function (userId, email, name, tournamentName, tournamentDate, location) {
        return UnifiedEmailService.sendEmail({ type: 'TOURNAMENT_REGISTRATION', userId: userId, recipientEmail: email, recipientName: name, userName: name, tournamentName: tournamentName, tournamentDate: tournamentDate, location: location });
    },
    tournamentReminder: function (userId, email, name, tournamentName, hoursUntil, location) {
        return UnifiedEmailService.sendEmail({ type: 'TOURNAMENT_REMINDER', userId: userId, recipientEmail: email, recipientName: name, userName: name, tournamentName: tournamentName, hoursUntil: hoursUntil, location: location });
    },
    tournamentResults: function (userId, email, name, tournamentName, placement, totalParticipants) {
        return UnifiedEmailService.sendEmail({ type: 'TOURNAMENT_RESULTS', userId: userId, recipientEmail: email, recipientName: name, userName: name, tournamentName: tournamentName, placement: placement, totalParticipants: totalParticipants });
    },
    // Video analysis
    analysisFailed: function (userId, email, name, videoTitle, errorReason) {
        return UnifiedEmailService.sendEmail({ type: 'VIDEO_ANALYSIS_FAILED', userId: userId, recipientEmail: email, recipientName: name, userName: name, videoTitle: videoTitle, errorReason: errorReason });
    },
    // Redemptions
    redemptionRequest: function (userId, email, name, rewardName, pointsCost, requestId) {
        return UnifiedEmailService.sendEmail({ type: 'REDEMPTION_REQUEST', userId: userId, recipientEmail: email, recipientName: name, userName: name, rewardName: rewardName, pointsCost: pointsCost, requestId: requestId });
    },
    redemptionApproved: function (userId, email, name, rewardName, sponsorName, instructions) {
        return UnifiedEmailService.sendEmail({ type: 'REDEMPTION_APPROVED', userId: userId, recipientEmail: email, recipientName: name, userName: name, rewardName: rewardName, sponsorName: sponsorName, instructions: instructions });
    },
    redemptionShipped: function (userId, email, name, rewardName, trackingNumber, carrier, estimatedDelivery) {
        return UnifiedEmailService.sendEmail({ type: 'REDEMPTION_SHIPPED', userId: userId, recipientEmail: email, recipientName: name, userName: name, rewardName: rewardName, trackingNumber: trackingNumber, carrier: carrier, estimatedDelivery: estimatedDelivery });
    },
    // Admin alerts
    adminNewUser: function (userName, userEmail, userId, signupDate) {
        return UnifiedEmailService.sendAdminEmail({ type: 'ADMIN_NEW_USER', userName: userName, userEmail: userEmail, userId: userId, signupDate: signupDate });
    },
    adminPayment: function (userName, userEmail, amount, planName, transactionId) {
        return UnifiedEmailService.sendAdminEmail({ type: 'ADMIN_PAYMENT', userName: userName, userEmail: userEmail, amount: amount, planName: planName, transactionId: transactionId });
    },
    adminError: function (errorType, errorMessage, errorStack, userId, timestamp) {
        return UnifiedEmailService.sendAdminEmail({ type: 'ADMIN_ERROR', errorType: errorType, errorMessage: errorMessage, errorStack: errorStack, userId: userId, timestamp: timestamp });
    },
};
