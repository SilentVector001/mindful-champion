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
function testUploadFlow() {
    return __awaiter(this, void 0, void 0, function () {
        var testVideo, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🧪 Testing Upload Flow (Database Creation)...\n');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 7]);
                    // Try to create a test video record
                    console.log('📝 Attempting to create test video record...');
                    return [4 /*yield*/, prisma.videoAnalysis.create({
                            data: {
                                userId: 'test-user-id',
                                videoUrl: '6482/uploads/test-video.mp4',
                                cloud_storage_path: '6482/uploads/test-video.mp4',
                                isPublic: false,
                                fileName: 'test-video.mp4',
                                fileSize: 1024,
                                duration: 10,
                                title: 'Test Video',
                                analysisStatus: 'PENDING'
                            }
                        })];
                case 2:
                    testVideo = _a.sent();
                    console.log('✅ Successfully created video record!');
                    console.log('   ID:', testVideo.id);
                    console.log('   User ID:', testVideo.userId);
                    console.log('   Cloud Path:', testVideo.cloud_storage_path);
                    console.log('   Status:', testVideo.analysisStatus);
                    console.log();
                    // Now try to delete it
                    console.log('🗑️  Cleaning up test record...');
                    return [4 /*yield*/, prisma.videoAnalysis.delete({
                            where: {
                                id: testVideo.id
                            }
                        })];
                case 3:
                    _a.sent();
                    console.log('✅ Test record deleted\n');
                    console.log('✅ Database creation works! The issue might be:');
                    console.log('   1. Invalid userId in upload API');
                    console.log('   2. Upload API is catching and suppressing the error');
                    console.log('   3. Upload API is not being called at all');
                    return [3 /*break*/, 7];
                case 4:
                    error_1 = _a.sent();
                    console.error('❌ Failed to create video record!');
                    console.error('Error:', error_1);
                    if (error_1 instanceof Error) {
                        console.error('\n📋 Error Details:');
                        console.error('   Message:', error_1.message);
                        console.error('   Name:', error_1.name);
                        // Prisma-specific errors
                        if (error_1.message.includes('Foreign key constraint')) {
                            console.error('\n💡 ISSUE: Foreign key constraint failed');
                            console.error('   The userId does not exist in the User table');
                            console.error('   This is likely why uploads are failing!');
                        }
                        else if (error_1.message.includes('Unique constraint')) {
                            console.error('\n💡 ISSUE: Unique constraint failed');
                            console.error('   A record with this value already exists');
                        }
                        else if (error_1.message.includes('required')) {
                            console.error('\n💡 ISSUE: Required field missing');
                            console.error('   One or more required fields are not provided');
                        }
                    }
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, prisma.$disconnect()];
                case 6:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
testUploadFlow();
