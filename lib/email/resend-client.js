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
exports.Resend = exports.getResendClient = void 0;
var resend_1 = require("resend");
Object.defineProperty(exports, "Resend", { enumerable: true, get: function () { return resend_1.Resend; } });
var resendClient = null;
function getResendClient() {
    var _this = this;
    if (!resendClient) {
        var apiKey = process.env.RESEND_API_KEY;
        if (!apiKey || apiKey === 'your_resend_api_key_here') {
            var errorMessage = '⚠️ CRITICAL: RESEND_API_KEY not configured in environment variables. Emails cannot be sent.';
            console.error(errorMessage);
            console.error('📝 Setup Instructions:');
            console.error('1. Get API key from https://resend.com/api-keys');
            console.error('2. Add RESEND_API_KEY to Vercel environment variables');
            console.error('3. Redeploy the application');
            console.error('4. Current environment:', process.env.NODE_ENV || 'unknown');
            // Return a mock client that throws clear errors
            return {
                emails: {
                    send: function (options) { return __awaiter(_this, void 0, void 0, function () {
                        var timestamp;
                        return __generator(this, function (_a) {
                            timestamp = new Date().toISOString();
                            console.error("\u274C [EMAIL NOT SENT - RESEND_API_KEY MISSING] ".concat(timestamp), {
                                to: options.to,
                                subject: options.subject,
                                from: options.from,
                                environment: process.env.NODE_ENV || 'unknown',
                                vercel: process.env.VERCEL ? 'yes' : 'no',
                            });
                            // Return error instead of success for mock emails
                            return [2 /*return*/, {
                                    data: null,
                                    error: {
                                        message: 'RESEND_API_KEY is not configured in environment variables. Please add it to Vercel to enable email sending.',
                                        name: 'MissingApiKeyError',
                                        statusCode: 500
                                    }
                                }];
                        });
                    }); }
                }
            };
        }
        // Validate API key format
        if (!apiKey.startsWith('re_')) {
            console.error('⚠️ WARNING: RESEND_API_KEY may be invalid (should start with "re_")');
            console.error("   Current key starts with: ".concat(apiKey.substring(0, 5), "..."));
            console.error('   Please verify at: https://resend.com/api-keys');
        }
        resendClient = new resend_1.Resend(apiKey);
        console.log('✅ Resend client initialized successfully');
        console.log("   API Key: ".concat(apiKey.substring(0, 7), "..."));
        console.log("   Environment: ".concat(process.env.NODE_ENV || 'unknown'));
        // Log domain configuration reminder
        console.log('');
        console.log('📧 Email Domain Configuration:');
        console.log('   ⚠️  Using sandbox domains (@resend.dev)');
        console.log('   💡 For production, verify custom domain at: https://resend.com/domains');
        console.log('');
    }
    return resendClient;
}
exports.getResendClient = getResendClient;
