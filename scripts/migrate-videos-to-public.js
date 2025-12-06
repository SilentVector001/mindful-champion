"use strict";
/**
 * Migration script to update existing videos to use public URLs
 *
 * This script:
 * 1. Finds all videos with cloud_storage_path
 * 2. Generates public URLs for them
 * 3. Updates videoUrl and isPublic fields
 *
 * Run with: npx ts-node --project tsconfig.json scripts/migrate-videos-to-public.ts
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
var client_1 = require("@prisma/client");
var aws_config_1 = require("../lib/aws-config");
var prisma = new client_1.PrismaClient();
function migrateVideosToPublic() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, bucketName, region, videos, videosToMigrate, successCount, errorCount, _i, videosToMigrate_1, video, publicUrl, error_1, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('🚀 Starting video migration to public URLs...\n');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 9, 10, 12]);
                    _a = (0, aws_config_1.getBucketConfig)(), bucketName = _a.bucketName, region = _a.region;
                    if (!bucketName || !region) {
                        throw new Error('AWS_BUCKET_NAME or AWS_REGION not configured');
                    }
                    console.log("\u2705 AWS Config: bucket=".concat(bucketName, ", region=").concat(region, "\n"));
                    return [4 /*yield*/, prisma.videoAnalysis.findMany({
                            where: {
                                cloud_storage_path: {
                                    not: null
                                }
                            },
                            select: {
                                id: true,
                                videoUrl: true,
                                cloud_storage_path: true,
                                isPublic: true,
                                title: true
                            }
                        })];
                case 2:
                    videos = _b.sent();
                    console.log("\uD83D\uDCF9 Found ".concat(videos.length, " videos with cloud storage paths\n"));
                    if (videos.length === 0) {
                        console.log('✨ No videos to migrate. All done!');
                        return [2 /*return*/];
                    }
                    videosToMigrate = videos.filter(function (video) { var _a; return !((_a = video.videoUrl) === null || _a === void 0 ? void 0 : _a.startsWith('http')) && video.cloud_storage_path; });
                    console.log("\uD83D\uDD27 ".concat(videosToMigrate.length, " videos need migration\n"));
                    if (videosToMigrate.length === 0) {
                        console.log('✨ All videos already have public URLs. All done!');
                        return [2 /*return*/];
                    }
                    successCount = 0;
                    errorCount = 0;
                    _i = 0, videosToMigrate_1 = videosToMigrate;
                    _b.label = 3;
                case 3:
                    if (!(_i < videosToMigrate_1.length)) return [3 /*break*/, 8];
                    video = videosToMigrate_1[_i];
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    publicUrl = "https://".concat(bucketName, ".s3.").concat(region, ".amazonaws.com/").concat(video.cloud_storage_path);
                    // Update video record
                    return [4 /*yield*/, prisma.videoAnalysis.update({
                            where: { id: video.id },
                            data: {
                                videoUrl: publicUrl,
                                isPublic: true
                            }
                        })];
                case 5:
                    // Update video record
                    _b.sent();
                    console.log("\u2705 Migrated: ".concat(video.title || video.id));
                    console.log("   Old: ".concat(video.videoUrl));
                    console.log("   New: ".concat(publicUrl, "\n"));
                    successCount++;
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _b.sent();
                    console.error("\u274C Failed to migrate video ".concat(video.id, ":"), error_1);
                    errorCount++;
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8:
                    console.log('\n' + '='.repeat(60));
                    console.log('📊 Migration Summary');
                    console.log('='.repeat(60));
                    console.log("\u2705 Successfully migrated: ".concat(successCount));
                    console.log("\u274C Failed: ".concat(errorCount));
                    console.log("\uD83D\uDCF9 Total videos: ".concat(videos.length));
                    console.log('='.repeat(60));
                    if (successCount > 0) {
                        console.log('\n🎉 Migration completed successfully!');
                        console.log('💡 All videos now use public URLs for direct playback.');
                    }
                    return [3 /*break*/, 12];
                case 9:
                    error_2 = _b.sent();
                    console.error('❌ Migration failed:', error_2);
                    throw error_2;
                case 10: return [4 /*yield*/, prisma.$disconnect()];
                case 11:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    });
}
// Run migration
migrateVideosToPublic()
    .catch(function (error) {
    console.error('Fatal error:', error);
    process.exit(1);
});
