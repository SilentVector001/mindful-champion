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
var path = require("path");
// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
var prisma = new client_1.PrismaClient();
function checkDbS3Match() {
    return __awaiter(this, void 0, void 0, function () {
        var s3Files, totalCount, _i, s3Files_1, s3Key, record, recentVideos, orphanCount, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🔍 Checking Database-S3 Match...\n');
                    s3Files = [
                        '6482/uploads/1764506058385-IMG_4404.mov',
                        '6482/uploads/1764500917308-CD13B324-9947-46FB-A233-6FD2F71239BD.mov',
                        '6482/uploads/1764495957631-CD13B324-9947-46FB-A233-6FD2F71239BD.mov',
                        '6482/uploads/1764463260393-IMG_4404__3_.mov',
                        '6482/uploads/1764463013262-IMG_4404__3_.mov'
                    ];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, 9, 11]);
                    return [4 /*yield*/, prisma.videoAnalysis.count()];
                case 2:
                    totalCount = _a.sent();
                    console.log("\uD83D\uDCCA Total videos in database: ".concat(totalCount, "\n"));
                    // Check each S3 file
                    console.log('🔎 Checking if S3 files have database records:\n');
                    _i = 0, s3Files_1 = s3Files;
                    _a.label = 3;
                case 3:
                    if (!(_i < s3Files_1.length)) return [3 /*break*/, 6];
                    s3Key = s3Files_1[_i];
                    return [4 /*yield*/, prisma.videoAnalysis.findFirst({
                            where: {
                                cloud_storage_path: s3Key
                            },
                            select: {
                                id: true,
                                uploadedAt: true,
                                analysisStatus: true,
                                fileName: true,
                                user: {
                                    select: {
                                        email: true
                                    }
                                }
                            }
                        })];
                case 4:
                    record = _a.sent();
                    if (record) {
                        console.log("\u2705 ".concat(s3Key));
                        console.log("   ID: ".concat(record.id));
                        console.log("   User: ".concat(record.user.email));
                        console.log("   Uploaded: ".concat(record.uploadedAt));
                        console.log("   Status: ".concat(record.analysisStatus));
                    }
                    else {
                        console.log("\u274C ".concat(s3Key));
                        console.log("   No database record found!");
                    }
                    console.log();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    // Get most recent 5 videos from database
                    console.log('📹 Most Recent 5 Videos in Database:\n');
                    return [4 /*yield*/, prisma.videoAnalysis.findMany({
                            orderBy: {
                                uploadedAt: 'desc'
                            },
                            take: 5,
                            select: {
                                id: true,
                                uploadedAt: true,
                                cloud_storage_path: true,
                                analysisStatus: true,
                                fileName: true,
                                user: {
                                    select: {
                                        email: true
                                    }
                                }
                            }
                        })];
                case 7:
                    recentVideos = _a.sent();
                    if (recentVideos.length === 0) {
                        console.log('❌ No videos found in database!\n');
                    }
                    else {
                        recentVideos.forEach(function (video, i) {
                            console.log("".concat(i + 1, ". Video ID: ").concat(video.id));
                            console.log("   User: ".concat(video.user.email));
                            console.log("   Uploaded: ".concat(video.uploadedAt));
                            console.log("   File: ".concat(video.fileName));
                            console.log("   S3 Path: ".concat(video.cloud_storage_path || 'NULL'));
                            console.log("   Status: ".concat(video.analysisStatus));
                            console.log();
                        });
                    }
                    // Check for orphaned S3 files
                    console.log('🔍 Diagnosis:\n');
                    orphanCount = s3Files.length - recentVideos.length;
                    if (orphanCount > 0) {
                        console.log("\u26A0\uFE0F Found ".concat(orphanCount, " S3 files without database records"));
                        console.log('   This suggests uploads are reaching S3 but database records are not being created.');
                        console.log('   Possible causes:');
                        console.log('   - Transaction failure after S3 upload');
                        console.log('   - Database connection issues');
                        console.log('   - Error in the Prisma create operation\n');
                    }
                    if (recentVideos.some(function (v) { return !v.cloud_storage_path; })) {
                        console.log('⚠️ Some database records are missing cloud_storage_path');
                        console.log('   This will cause videos to fail loading\n');
                    }
                    return [3 /*break*/, 11];
                case 8:
                    error_1 = _a.sent();
                    console.error('❌ Error:', error_1);
                    return [3 /*break*/, 11];
                case 9: return [4 /*yield*/, prisma.$disconnect()];
                case 10:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
checkDbS3Match();
