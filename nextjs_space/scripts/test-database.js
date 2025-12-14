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
// Load environment variables
dotenv.config({ path: '.env' });
var prisma = new client_1.PrismaClient();
function testDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var userCount, usersWithPoints, tierCount, tiers, achievementCount, achievementsByTier, unlockCount, recentUnlocks, userAchievementCount, sampleUser, userAchievements, tierUnlocks, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🔍 Testing Database Connection...\n');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 19, 20, 22]);
                    // Test 1: Basic connection
                    console.log('✅ Test 1: Database Connection');
                    return [4 /*yield*/, prisma.$connect()];
                case 2:
                    _a.sent();
                    console.log('   ✓ Successfully connected to database\n');
                    // Test 2: Count users
                    console.log('✅ Test 2: User Model');
                    return [4 /*yield*/, prisma.user.count()];
                case 3:
                    userCount = _a.sent();
                    console.log("   \u2713 Total users: ".concat(userCount));
                    return [4 /*yield*/, prisma.user.count({
                            where: {
                                rewardPoints: {
                                    gt: 0
                                }
                            }
                        })];
                case 4:
                    usersWithPoints = _a.sent();
                    console.log("   \u2713 Users with reward points: ".concat(usersWithPoints, "\n"));
                    // Test 3: RewardTier model
                    console.log('✅ Test 3: RewardTier Model');
                    return [4 /*yield*/, prisma.rewardTier.count()];
                case 5:
                    tierCount = _a.sent();
                    console.log("   \u2713 Total reward tiers: ".concat(tierCount));
                    return [4 /*yield*/, prisma.rewardTier.findMany({
                            select: {
                                id: true,
                                name: true,
                                displayName: true,
                                minPoints: true,
                                _count: {
                                    select: {
                                        unlocks: true
                                    }
                                }
                            }
                        })];
                case 6:
                    tiers = _a.sent();
                    if (tiers.length > 0) {
                        console.log('   ✓ Reward Tiers:');
                        tiers.forEach(function (tier) {
                            console.log("      - ".concat(tier.displayName, " (").concat(tier.name, "): ").concat(tier.minPoints, " pts, ").concat(tier._count.unlocks, " unlocks"));
                        });
                    }
                    else {
                        console.log('   ⚠️  No reward tiers found in database');
                    }
                    console.log('');
                    // Test 4: Achievement model
                    console.log('✅ Test 4: Achievement Model');
                    return [4 /*yield*/, prisma.achievement.count()];
                case 7:
                    achievementCount = _a.sent();
                    console.log("   \u2713 Total achievements: ".concat(achievementCount));
                    return [4 /*yield*/, prisma.achievement.groupBy({
                            by: ['tier'],
                            _count: true
                        })];
                case 8:
                    achievementsByTier = _a.sent();
                    if (achievementsByTier.length > 0) {
                        console.log('   ✓ Achievements by tier:');
                        achievementsByTier.forEach(function (group) {
                            console.log("      - ".concat(group.tier, ": ").concat(group._count, " achievements"));
                        });
                    }
                    console.log('');
                    // Test 5: TierUnlock model
                    console.log('✅ Test 5: TierUnlock Model');
                    return [4 /*yield*/, prisma.tierUnlock.count()];
                case 9:
                    unlockCount = _a.sent();
                    console.log("   \u2713 Total tier unlocks: ".concat(unlockCount));
                    if (!(unlockCount > 0)) return [3 /*break*/, 11];
                    return [4 /*yield*/, prisma.tierUnlock.findMany({
                            take: 5,
                            orderBy: {
                                unlockedAt: 'desc'
                            },
                            include: {
                                tier: {
                                    select: {
                                        displayName: true
                                    }
                                },
                                user: {
                                    select: {
                                        email: true,
                                        rewardPoints: true
                                    }
                                }
                            }
                        })];
                case 10:
                    recentUnlocks = _a.sent();
                    console.log('   ✓ Recent tier unlocks:');
                    recentUnlocks.forEach(function (unlock) {
                        console.log("      - ".concat(unlock.user.email, ": ").concat(unlock.tier.displayName, " (").concat(unlock.pointsAtUnlock, " pts)"));
                    });
                    return [3 /*break*/, 12];
                case 11:
                    console.log('   ℹ️  No tier unlocks yet');
                    _a.label = 12;
                case 12:
                    console.log('');
                    // Test 6: UserAchievement model
                    console.log('✅ Test 6: UserAchievement Model');
                    return [4 /*yield*/, prisma.userAchievement.count()];
                case 13:
                    userAchievementCount = _a.sent();
                    console.log("   \u2713 Total user achievements unlocked: ".concat(userAchievementCount, "\n"));
                    // Test 7: Check sample user rewards data
                    console.log('✅ Test 7: Sample User Rewards Data');
                    return [4 /*yield*/, prisma.user.findFirst({
                            where: {
                                rewardPoints: {
                                    gt: 0
                                }
                            }
                        })];
                case 14:
                    sampleUser = _a.sent();
                    if (!sampleUser) return [3 /*break*/, 17];
                    console.log("   \u2713 Sample user: ".concat(sampleUser.email));
                    console.log("   \u2713 Reward points: ".concat(sampleUser.rewardPoints));
                    return [4 /*yield*/, prisma.userAchievement.count({
                            where: { userId: sampleUser.id }
                        })];
                case 15:
                    userAchievements = _a.sent();
                    console.log("   \u2713 Achievements unlocked: ".concat(userAchievements));
                    return [4 /*yield*/, prisma.tierUnlock.count({
                            where: { userId: sampleUser.id }
                        })];
                case 16:
                    tierUnlocks = _a.sent();
                    console.log("   \u2713 Tiers unlocked: ".concat(tierUnlocks));
                    return [3 /*break*/, 18];
                case 17:
                    console.log('   ℹ️  No users with reward points found');
                    _a.label = 18;
                case 18:
                    console.log('');
                    console.log('='.repeat(60));
                    console.log('✅ ALL DATABASE TESTS PASSED!');
                    console.log('='.repeat(60));
                    console.log('\nSummary:');
                    console.log("- Users: ".concat(userCount));
                    console.log("- Users with points: ".concat(usersWithPoints));
                    console.log("- Reward Tiers: ".concat(tierCount));
                    console.log("- Achievements: ".concat(achievementCount));
                    console.log("- Tier Unlocks: ".concat(unlockCount));
                    console.log("- User Achievements: ".concat(userAchievementCount));
                    return [3 /*break*/, 22];
                case 19:
                    error_1 = _a.sent();
                    console.error('\n❌ Database Test Failed:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 22];
                case 20: return [4 /*yield*/, prisma.$disconnect()];
                case 21:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 22: return [2 /*return*/];
            }
        });
    });
}
testDatabase();
