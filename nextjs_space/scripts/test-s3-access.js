"use strict";
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
var client_s3_1 = require("@aws-sdk/client-s3");
var s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
var dotenv = require("dotenv");
var path = require("path");
// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
function testS3Access() {
    return __awaiter(this, void 0, void 0, function () {
        var accessKeyId, secretAccessKey, sessionToken, bucketName, region, folderPrefix, s3Client, listCommand, listResult, testKey, testContent, putCommand, getCommand, signedUrl, videoListCommand, videoListResult, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🔍 Testing S3 Access...\n');
                    accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.ABACUS_AWS_ACCESS_KEY_ID;
                    secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.ABACUS_AWS_SECRET_ACCESS_KEY;
                    sessionToken = process.env.AWS_SESSION_TOKEN || process.env.ABACUS_AWS_SESSION_TOKEN;
                    bucketName = process.env.AWS_BUCKET_NAME;
                    region = process.env.AWS_REGION || 'us-west-2';
                    folderPrefix = process.env.AWS_FOLDER_PREFIX || '';
                    console.log('📋 Configuration:');
                    console.log('  Access Key ID:', accessKeyId ? '✅ SET' : '❌ NOT SET');
                    console.log('  Secret Key:', secretAccessKey ? '✅ SET' : '❌ NOT SET');
                    console.log('  Session Token:', sessionToken ? '✅ SET' : '❌ NOT SET');
                    console.log('  Bucket Name:', bucketName || '❌ NOT SET');
                    console.log('  Region:', region);
                    console.log('  Folder Prefix:', folderPrefix || '(none)');
                    console.log();
                    if (!bucketName) {
                        console.error('❌ AWS_BUCKET_NAME is not configured!');
                        return [2 /*return*/];
                    }
                    if (!accessKeyId || !secretAccessKey) {
                        console.error('❌ AWS credentials are not configured!');
                        return [2 /*return*/];
                    }
                    s3Client = new client_s3_1.S3Client({
                        region: region,
                        credentials: __assign({ accessKeyId: accessKeyId, secretAccessKey: secretAccessKey }, (sessionToken && { sessionToken: sessionToken }))
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    // Test 1: List objects in bucket
                    console.log('📂 Test 1: Listing objects in bucket...');
                    listCommand = new client_s3_1.ListObjectsV2Command({
                        Bucket: bucketName,
                        Prefix: folderPrefix,
                        MaxKeys: 5
                    });
                    return [4 /*yield*/, s3Client.send(listCommand)];
                case 2:
                    listResult = _a.sent();
                    console.log("\u2705 List successful! Found ".concat(listResult.KeyCount, " objects (showing max 5)"));
                    if (listResult.Contents && listResult.Contents.length > 0) {
                        console.log('   Sample objects:');
                        listResult.Contents.slice(0, 3).forEach(function (obj) {
                            console.log("   - ".concat(obj.Key, " (").concat(obj.Size, " bytes, modified: ").concat(obj.LastModified, ")"));
                        });
                    }
                    console.log();
                    // Test 2: Upload a test file
                    console.log('📤 Test 2: Uploading test file...');
                    testKey = "".concat(folderPrefix, "test-upload-").concat(Date.now(), ".txt");
                    testContent = "Test upload at ".concat(new Date().toISOString());
                    putCommand = new client_s3_1.PutObjectCommand({
                        Bucket: bucketName,
                        Key: testKey,
                        Body: Buffer.from(testContent),
                        ContentType: 'text/plain'
                    });
                    return [4 /*yield*/, s3Client.send(putCommand)];
                case 3:
                    _a.sent();
                    console.log("\u2705 Upload successful! Key: ".concat(testKey));
                    console.log();
                    // Test 3: Generate signed URL
                    console.log('🔗 Test 3: Generating signed URL...');
                    getCommand = new client_s3_1.GetObjectCommand({
                        Bucket: bucketName,
                        Key: testKey
                    });
                    return [4 /*yield*/, (0, s3_request_presigner_1.getSignedUrl)(s3Client, getCommand, { expiresIn: 300 })];
                case 4:
                    signedUrl = _a.sent();
                    console.log('✅ Signed URL generated successfully!');
                    console.log("   URL: ".concat(signedUrl.substring(0, 100), "..."));
                    console.log();
                    // Test 4: Check for recent video uploads
                    console.log('📹 Test 4: Looking for recent video uploads...');
                    videoListCommand = new client_s3_1.ListObjectsV2Command({
                        Bucket: bucketName,
                        Prefix: "".concat(folderPrefix, "uploads/"),
                        MaxKeys: 10
                    });
                    return [4 /*yield*/, s3Client.send(videoListCommand)];
                case 5:
                    videoListResult = _a.sent();
                    console.log("Found ".concat(videoListResult.KeyCount, " files in uploads folder"));
                    if (videoListResult.Contents && videoListResult.Contents.length > 0) {
                        console.log('   Recent uploads:');
                        videoListResult.Contents
                            .sort(function (a, b) { var _a, _b; return (((_a = b.LastModified) === null || _a === void 0 ? void 0 : _a.getTime()) || 0) - (((_b = a.LastModified) === null || _b === void 0 ? void 0 : _b.getTime()) || 0); })
                            .slice(0, 5)
                            .forEach(function (obj) {
                            console.log("   - ".concat(obj.Key));
                            console.log("     Size: ".concat(obj.Size, " bytes"));
                            console.log("     Modified: ".concat(obj.LastModified));
                        });
                    }
                    else {
                        console.log('   ⚠️ No files found in uploads folder');
                    }
                    console.log();
                    console.log('✅ All S3 tests passed!');
                    console.log('\n📊 Summary:');
                    console.log('  ✅ S3 credentials are valid');
                    console.log('  ✅ Can list objects in bucket');
                    console.log('  ✅ Can upload files to bucket');
                    console.log('  ✅ Can generate signed URLs');
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error('\n❌ S3 Test Failed!');
                    console.error('Error:', error_1);
                    if (error_1 instanceof Error) {
                        console.error('\nError Details:');
                        console.error('  Message:', error_1.message);
                        console.error('  Name:', error_1.name);
                        // Provide helpful error messages
                        if (error_1.message.includes('credentials')) {
                            console.error('\n💡 Tip: Check your AWS credentials are correct and not expired');
                        }
                        else if (error_1.message.includes('AccessDenied')) {
                            console.error('\n💡 Tip: The AWS credentials lack permission to access this bucket');
                        }
                        else if (error_1.message.includes('NoSuchBucket')) {
                            console.error('\n💡 Tip: The bucket name is incorrect or does not exist');
                        }
                        else if (error_1.message.includes('ExpiredToken')) {
                            console.error('\n💡 Tip: Your AWS session token has expired. Please refresh your credentials');
                        }
                    }
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
testS3Access();
