# Video Analysis Testing Guide

## Pre-Test Checklist
- [ ] Development server running (`npm run dev`)
- [ ] Database connected and accessible
- [ ] User authenticated (test user account ready)
- [ ] Upload directory exists: `/public/uploads/videos/`

## Test Scenarios

### ✅ Test 1: Complete Upload & Analysis Flow

**Steps:**
1. Navigate to http://localhost:3000/train/video
2. Click upload area or drag & drop a video file
3. Select a small test video (< 50MB recommended for testing)
4. Click "Analyze Video" button
5. Wait for upload (watch progress bar: 0% → 100%)
6. Wait for analysis (watch progress: 0% → 100%)
7. Verify analysis results display

**Expected Results:**
- ✅ Upload progress updates smoothly
- ✅ Video file saved to `/public/uploads/videos/`
- ✅ Database record created with status PENDING
- ✅ Status automatically changes to PROCESSING
- ✅ Analysis completes within 5-10 seconds (simulated)
- ✅ Status changes to COMPLETED
- ✅ Results display with scores, strengths, recommendations
- ✅ Email notification sent (if configured)

**Verification Queries:**
```bash
# Check video in database
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.videoAnalysis.findMany({
  orderBy: { uploadedAt: 'desc' },
  take: 1
}).then(console.log).finally(() => prisma.\$disconnect());
"

# Check file on disk
ls -lh public/uploads/videos/ | tail -5
```

---

### ✅ Test 2: Video Library Display

**Steps:**
1. Navigate to http://localhost:3000/train/library
2. Check that uploaded video appears
3. Verify status badge shows correct state
4. Check action buttons are appropriate for status

**Expected Results:**
- ✅ All videos appear in library
- ✅ COMPLETED videos show score badge (e.g., "85%")
- ✅ COMPLETED videos have "View" button
- ✅ PROCESSING videos show "Analyzing..." with pulse
- ✅ PENDING videos show "Waiting..."
- ✅ FAILED videos show "Failed" in red
- ✅ All videos have delete button
- ✅ Statistics section shows correct counts

---

### ✅ Test 3: View Analysis Results

**Steps:**
1. From video library, click "View" on completed analysis
2. Navigate to `/train/video/[videoId]`
3. Check all analysis sections load

**Expected Results:**
- ✅ Video player loads and plays
- ✅ Overall score displays prominently
- ✅ Technical metrics show (paddle angle, footwork, etc.)
- ✅ Movement metrics show (speed, positioning, etc.)
- ✅ Strengths list displays
- ✅ Areas for improvement list displays
- ✅ Recommendations display
- ✅ Key moments timeline works
- ✅ Shot statistics show

---

### ⚠️ Test 4: Error Handling (Manual)

**Steps to Simulate Error:**
1. Temporarily break analysis engine (or disconnect database)
2. Upload video
3. Attempt analysis
4. Verify error handling

**Expected Results:**
- ✅ Status updates to FAILED
- ✅ Error message shown to user
- ✅ Video appears in library with "Failed" badge
- ✅ User can delete failed video
- ✅ No partial/corrupt data in database

---

### ✅ Test 5: File Validation

**Steps:**
1. Try uploading invalid file types:
   - Text file (.txt)
   - Image file (.jpg)
   - Large file (> 100MB)

**Expected Results:**
- ✅ Invalid types rejected with error message
- ✅ Oversized files rejected with error message
- ✅ No database records created for rejected files
- ✅ Error messages are user-friendly

---

### ✅ Test 6: Multiple Videos

**Steps:**
1. Upload and analyze 3 different videos
2. Check library shows all 3
3. Verify statistics update correctly
4. Test sorting by date vs. score

**Expected Results:**
- ✅ All videos appear independently
- ✅ Each has correct status
- ✅ Statistics show total count
- ✅ Average score calculates correctly
- ✅ Best score shows highest
- ✅ Sorting works properly

---

## Quick Verification Commands

### Check Recent Videos
```bash
cd /home/ubuntu/mindful_champion/nextjs_space
node -p "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const videos = await prisma.videoAnalysis.findMany({
    orderBy: { uploadedAt: 'desc' },
    take: 5,
    select: {
      fileName: true,
      analysisStatus: true,
      overallScore: true,
      uploadedAt: true
    }
  });
  console.table(videos);
  await prisma.\$disconnect();
})();
"
```

### Check Upload Directory
```bash
ls -lh /home/ubuntu/mindful_champion/nextjs_space/public/uploads/videos/
```

### Count Videos by Status
```bash
cd /home/ubuntu/mindful_champion/nextjs_space
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const pending = await prisma.videoAnalysis.count({ where: { analysisStatus: 'PENDING' } });
  const processing = await prisma.videoAnalysis.count({ where: { analysisStatus: 'PROCESSING' } });
  const completed = await prisma.videoAnalysis.count({ where: { analysisStatus: 'COMPLETED' } });
  const failed = await prisma.videoAnalysis.count({ where: { analysisStatus: 'FAILED' } });
  console.log({ pending, processing, completed, failed });
  await prisma.\$disconnect();
})();
"
```

---

## Known Limitations (MVP)

1. **Simulated Analysis**: Currently uses mock/simulated AI analysis data
2. **No Real Computer Vision**: Not processing actual video frames yet
3. **No Real Shot Detection**: Shot statistics are generated randomly
4. **Mock Metrics**: Technical and movement scores are simulated

## Future Enhancements

- [ ] Integrate real computer vision (TensorFlow, MediaPipe)
- [ ] Actual shot detection and classification
- [ ] Real-time frame analysis
- [ ] Video frame extraction and pose estimation
- [ ] Background job queue for long analyses
- [ ] Progress updates via WebSocket
- [ ] Video trimming/clipping tools
- [ ] Side-by-side comparison with pro players

---

## Troubleshooting

### Upload Fails
- Check file size (< 100MB)
- Verify file type (MP4, MOV, AVI, WebM)
- Check upload directory permissions
- Review browser console for errors

### Analysis Stuck in PROCESSING
- Check server logs for errors
- Verify database connection
- Check if analysis engine threw exception
- Manual status update if needed:
  ```sql
  UPDATE "VideoAnalysis" 
  SET "analysisStatus" = 'FAILED' 
  WHERE "analysisStatus" = 'PROCESSING' 
  AND "uploadedAt" < NOW() - INTERVAL '10 minutes';
  ```

### Videos Not Appearing in Library
- Check user authentication (correct user logged in)
- Verify database query filters
- Check browser network tab for API errors
- Clear browser cache and reload

---

**Test Date**: November 9, 2025
**Status**: Ready for Testing ✅
