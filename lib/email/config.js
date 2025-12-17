"use strict";
/**
 * Email Configuration for Mindful Champion
 *
 * All email accounts and templates configuration for the application.
 * Uses Resend with mindfulchampion.com domain.
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
exports.checkDomainStatus = exports.EMAIL_TEMPLATES = exports.getEmailAccount = exports.getFromEmail = exports.EMAIL_CONFIG = void 0;
exports.EMAIL_CONFIG = {
    // Domain
    DOMAIN: 'mindfulchampion.com',
    // Email Accounts
    ACCOUNTS: {
        // System emails (sign ups, payments, rewards, notifications)
        NOREPLY: {
            email: 'noreply@mindfulchampion.com',
            name: 'Mindful Champion',
            formatted: 'Mindful Champion <noreply@mindfulchampion.com>',
            purpose: 'System emails: sign ups, payments, rewards, notifications',
        },
        // Partner and sponsor communications
        PARTNERS: {
            email: 'partners@mindfulchampion.com',
            name: 'Mindful Champion Partners',
            formatted: 'Mindful Champion Partners <partners@mindfulchampion.com>',
            purpose: 'Sponsor applications, partner requests, business inquiries',
        },
        // Administrative communications
        ADMIN: {
            email: 'dean@mindfulchampion.com',
            name: 'Dean - Mindful Champion',
            formatted: 'Dean - Mindful Champion <dean@mindfulchampion.com>',
            purpose: 'Administrative emails, support, personal communications',
        },
    },
    // Email Types mapped to accounts
    TYPE_TO_ACCOUNT: {
        // System emails use NOREPLY
        'SIGNUP': 'NOREPLY',
        'WELCOME': 'NOREPLY',
        'PAYMENT': 'NOREPLY',
        'PAYMENT_SUCCESS': 'NOREPLY',
        'REWARD': 'NOREPLY',
        'ACHIEVEMENT': 'NOREPLY',
        'NOTIFICATION': 'NOREPLY',
        'VIDEO_ANALYSIS_COMPLETE': 'NOREPLY',
        // Partner/sponsor emails use PARTNERS
        'SPONSOR_APPLICATION': 'PARTNERS',
        'SPONSOR_APPROVAL': 'PARTNERS',
        'SPONSOR_REJECTION': 'PARTNERS',
        'PARTNER_REQUEST': 'PARTNERS',
        'PARTNER_INVITATION': 'PARTNERS',
        // Admin emails use ADMIN
        'ADMIN_CUSTOM': 'ADMIN',
        'ADMIN_TEST': 'ADMIN',
        'ADMIN_NOTIFICATION': 'ADMIN',
        'SUPPORT': 'ADMIN',
        'WARNING': 'ADMIN',
    },
};
/**
 * Get the from email address for a specific email type
 */
function getFromEmail(emailType) {
    var accountKey = exports.EMAIL_CONFIG.TYPE_TO_ACCOUNT[emailType] || 'NOREPLY';
    var account = exports.EMAIL_CONFIG.ACCOUNTS[accountKey];
    return account.formatted;
}
exports.getFromEmail = getFromEmail;
/**
 * Get email account details
 */
function getEmailAccount(accountKey) {
    return exports.EMAIL_CONFIG.ACCOUNTS[accountKey];
}
exports.getEmailAccount = getEmailAccount;
/**
 * Email Templates
 */
exports.EMAIL_TEMPLATES = {
    WELCOME: {
        subject: '🏓 Welcome to Mindful Champion - Your Journey Begins!',
        account: 'NOREPLY',
    },
    PAYMENT_SUCCESS: {
        subject: '✅ Payment Confirmed - Mindful Champion Pro',
        account: 'NOREPLY',
    },
    REWARD_EARNED: {
        subject: '🎉 You Earned Rewards - Mindful Champion',
        account: 'NOREPLY',
    },
    SPONSOR_APPLICATION_RECEIVED: {
        subject: '🎉 Sponsor Application Received - Mindful Champion',
        account: 'PARTNERS',
    },
    SPONSOR_APPROVED: {
        subject: '✅ Sponsor Application Approved - Mindful Champion',
        account: 'PARTNERS',
    },
    PARTNER_REQUEST: {
        subject: '🤝 New Partner Request - Mindful Champion',
        account: 'PARTNERS',
    },
    ADMIN_TEST: {
        subject: '🧪 Test Email - Mindful Champion',
        account: 'ADMIN',
    },
};
/**
 * Domain setup status check
 * In production, you would check this via Resend API
 */
function checkDomainStatus() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // This is a placeholder - in production you would call Resend API
            return [2 /*return*/, {
                    domain: exports.EMAIL_CONFIG.DOMAIN,
                    verified: true,
                    dnsRecords: {
                        spf: { configured: true },
                        dkim: { configured: true },
                        dmarc: { configured: true },
                    },
                    accounts: Object.entries(exports.EMAIL_CONFIG.ACCOUNTS).map(function (_a) {
                        var key = _a[0], account = _a[1];
                        return ({
                            key: key,
                            email: account.email,
                            purpose: account.purpose,
                            status: 'active',
                        });
                    }),
                }];
        });
    });
}
exports.checkDomainStatus = checkDomainStatus;
