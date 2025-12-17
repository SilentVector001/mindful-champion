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
exports.getEmailsByRecipient = exports.getEmailsByApplication = exports.updateEmailStatus = exports.logEmail = void 0;
var db_1 = require("@/lib/db");
/**
 * Log an email to the database for tracking and admin viewing
 * This should be called AFTER the email is sent
 */
function logEmail(params, sendResult) {
    return __awaiter(this, void 0, void 0, function () {
        var type, recipientEmail, recipientName, subject, htmlContent, textContent, userId, sponsorApplicationId, videoAnalysisId, metadata, resendEmailId, status_1, error, emailLog, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    type = params.type, recipientEmail = params.recipientEmail, recipientName = params.recipientName, subject = params.subject, htmlContent = params.htmlContent, textContent = params.textContent, userId = params.userId, sponsorApplicationId = params.sponsorApplicationId, videoAnalysisId = params.videoAnalysisId, metadata = params.metadata, resendEmailId = params.resendEmailId;
                    status_1 = sendResult.success ? 'SENT' : 'FAILED';
                    error = sendResult.error
                        ? typeof sendResult.error === 'string'
                            ? sendResult.error
                            : sendResult.error.message || JSON.stringify(sendResult.error)
                        : null;
                    return [4 /*yield*/, db_1.prisma.emailNotification.create({
                            data: {
                                type: type,
                                recipientEmail: recipientEmail,
                                recipientName: recipientName || null,
                                subject: subject,
                                htmlContent: htmlContent,
                                textContent: textContent || null,
                                status: status_1,
                                sentAt: sendResult.success ? new Date() : null,
                                failedAt: sendResult.success ? null : new Date(),
                                error: error,
                                metadata: metadata || {},
                                resendEmailId: resendEmailId || null,
                                userId: userId || null,
                                sponsorApplicationId: sponsorApplicationId || null,
                                videoAnalysisId: videoAnalysisId || null,
                                retryCount: 0,
                            },
                        })];
                case 1:
                    emailLog = _a.sent();
                    console.log("\uD83D\uDCE7 Email logged to database: ".concat(emailLog.id, " (").concat(status_1, ")"));
                    return [2 /*return*/, emailLog];
                case 2:
                    error_1 = _a.sent();
                    console.error('❌ Failed to log email to database:', error_1);
                    // Don't throw - logging failure shouldn't break the email send
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.logEmail = logEmail;
/**
 * Update email status (for webhooks from email provider)
 */
function updateEmailStatus(emailId, status, metadata) {
    return __awaiter(this, void 0, void 0, function () {
        var updateData, emailLog, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    updateData = {
                        status: status,
                        updatedAt: new Date(),
                    };
                    if (status === 'DELIVERED') {
                        updateData.deliveredAt = new Date();
                    }
                    else if (status === 'OPENED') {
                        updateData.openedAt = new Date();
                    }
                    else if (status === 'CLICKED') {
                        updateData.clickedAt = new Date();
                    }
                    else if (status === 'FAILED' || status === 'BOUNCED') {
                        updateData.failedAt = new Date();
                        if (metadata === null || metadata === void 0 ? void 0 : metadata.error) {
                            updateData.error = metadata.error;
                        }
                    }
                    if (metadata) {
                        updateData.metadata = metadata;
                    }
                    return [4 /*yield*/, db_1.prisma.emailNotification.update({
                            where: { id: emailId },
                            data: updateData,
                        })];
                case 1:
                    emailLog = _a.sent();
                    console.log("\uD83D\uDCE7 Email status updated: ".concat(emailId, " -> ").concat(status));
                    return [2 /*return*/, emailLog];
                case 2:
                    error_2 = _a.sent();
                    console.error('❌ Failed to update email status:', error_2);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.updateEmailStatus = updateEmailStatus;
/**
 * Get email logs by sponsor application ID
 */
function getEmailsByApplication(sponsorApplicationId) {
    return __awaiter(this, void 0, void 0, function () {
        var emails, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db_1.prisma.emailNotification.findMany({
                            where: { sponsorApplicationId: sponsorApplicationId },
                            orderBy: { createdAt: 'desc' },
                        })];
                case 1:
                    emails = _a.sent();
                    return [2 /*return*/, emails];
                case 2:
                    error_3 = _a.sent();
                    console.error('❌ Failed to fetch emails by application:', error_3);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getEmailsByApplication = getEmailsByApplication;
/**
 * Get email logs by recipient email
 */
function getEmailsByRecipient(recipientEmail) {
    return __awaiter(this, void 0, void 0, function () {
        var emails, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db_1.prisma.emailNotification.findMany({
                            where: { recipientEmail: recipientEmail },
                            orderBy: { createdAt: 'desc' },
                        })];
                case 1:
                    emails = _a.sent();
                    return [2 /*return*/, emails];
                case 2:
                    error_4 = _a.sent();
                    console.error('❌ Failed to fetch emails by recipient:', error_4);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getEmailsByRecipient = getEmailsByRecipient;
