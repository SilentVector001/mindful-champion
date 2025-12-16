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
var client_1 = require("@prisma/client");
var dotenv = require("dotenv");
dotenv.config({ path: '.env.local' });
var prisma = new client_1.PrismaClient();
function checkEmailLogs() {
    return __awaiter(this, void 0, void 0, function () {
        var totalCount, statusCounts, typeCounts, recentEmails, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, 6, 8]);
                    console.log('🔍 Checking EmailNotification table...\n');
                    return [4 /*yield*/, prisma.emailNotification.count()];
                case 1:
                    totalCount = _a.sent();
                    console.log("\uD83D\uDCCA Total Email Records: ".concat(totalCount));
                    return [4 /*yield*/, prisma.emailNotification.groupBy({
                            by: ['status'],
                            _count: true,
                        })];
                case 2:
                    statusCounts = _a.sent();
                    console.log('\n📈 Breakdown by Status:');
                    statusCounts.forEach(function (group) {
                        console.log("  ".concat(group.status, ": ").concat(group._count));
                    });
                    return [4 /*yield*/, prisma.emailNotification.groupBy({
                            by: ['type'],
                            _count: true,
                        })];
                case 3:
                    typeCounts = _a.sent();
                    console.log('\n📋 Breakdown by Type:');
                    typeCounts.forEach(function (group) {
                        console.log("  ".concat(group.type, ": ").concat(group._count));
                    });
                    return [4 /*yield*/, prisma.emailNotification.findMany({
                            take: 10,
                            orderBy: { createdAt: 'desc' },
                            include: {
                                user: {
                                    select: {
                                        email: true,
                                        firstName: true,
                                        lastName: true,
                                    }
                                }
                            }
                        })];
                case 4:
                    recentEmails = _a.sent();
                    if (recentEmails.length > 0) {
                        console.log('\n📧 Recent Emails:');
                        recentEmails.forEach(function (email) {
                            console.log("\n  ID: ".concat(email.id));
                            console.log("  Type: ".concat(email.type));
                            console.log("  Status: ".concat(email.status));
                            console.log("  To: ".concat(email.recipientEmail));
                            console.log("  Subject: ".concat(email.subject));
                            console.log("  Created: ".concat(email.createdAt));
                            console.log("  Sent: ".concat(email.sentAt || 'Not sent'));
                        });
                    }
                    else {
                        console.log('\n❌ No email records found in database');
                    }
                    return [3 /*break*/, 8];
                case 5:
                    error_1 = _a.sent();
                    console.error('❌ Error checking email logs:', error_1);
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, prisma.$disconnect()];
                case 7:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
}
checkEmailLogs();
