# Quick Start: Video Upload Testing

## ⚡ Quick Test (2 minutes)

### 1. Start the Server (if not running)
```bash
cd /home/ubuntu/mindful_champion/nextjs_space
npx next dev
```

Server will run on: http://localhost:3000

### 2. Access the App
Open in browser: http://localhost:3000

### 3. Test Video Upload
1. **Sign in** to your account
2. Go to: **Training** > **Video Analysis**
3. **Upload a video** (or drag & drop)
4. Watch the upload progress

---

## 🔍 Verify the Fix

### Run Diagnostic (30 seconds)
```bash
cd /home/ubuntu/mindful_champion/nextjs_space
node diagnose_video_upload.js
```

Expected output:
```
✅ Environment: OK
✅ Credentials: OK
✅ S3 Client: OK
✅ Pre-Signed URL: OK
✅ API Endpoint: OK
🎉 All systems operational!
```

---

## 🎯 What's Fixed

✅ **Retry Logic**: Automatically retries on failures (3 attempts)  
✅ **Caching**: Credentials cached for 5 minutes  
✅ **Error Messages**: Clear, actionable error messages  
✅ **Logging**: Detailed server logs for debugging  

---

## 📊 Monitor Server Logs

Watch logs in real-time:
```bash
tail -f /tmp/next-dev.log | grep -E "\[PreSignedURL\]|\[AWS Config\]"
```

Look for:
- `✅ Pre-signed URL generated successfully` = Working!
- `❌ FATAL ERROR` = Issue found (check details)

---

## 🚨 If Issues Occur

1. **Check user is logged in**
2. **Check server logs**: `tail -50 /tmp/next-dev.log`
3. **Run diagnostic**: `node diagnose_video_upload.js`
4. **Check browser console** (F12 > Console tab)

---

## 📝 Important Notes

- **Max file size**: 500MB
- **Supported formats**: MP4, MOV, AVI, WebM
- **Upload URL valid for**: 1 hour
- **Credential cache TTL**: 5 minutes

---

## ✅ Success Indicators

When upload works correctly, you'll see:
1. Progress bar showing upload percentage
2. "Upload complete! Starting AI analysis..." toast
3. Analysis progress indicator
4. Results displayed after analysis completes

---

## 🎉 You're All Set!

The video upload feature is now more reliable with:
- Automatic retry on transient failures
- Cached credentials for better performance
- Detailed error messages for easy debugging

**Need help?** Check `VIDEO_UPLOAD_FIX_SUMMARY.md` for detailed information.

---

*Last Updated: December 8, 2025*
