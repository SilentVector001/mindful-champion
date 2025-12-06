# Video Analysis AI Enhancement - Deployment Instructions

## 🎯 What Was Implemented

### Phase 1: Core AI Features (COMPLETED ✅)

1. **Real TensorFlow.js Pose Detection**
   - Uses MoveNet model for accurate body tracking
   - Detects 17 keypoints (shoulders, elbows, wrists, hips, knees, ankles, etc.)
   - Frame-by-frame analysis with confidence scoring

2. **Pickleball-Specific Technique Analysis**
   - Serve mechanics (arm angle, follow-through, body rotation)
   - Footwork patterns (stance, agility, split-step timing)
   - Paddle position (height, angle, ready position)
   - Body positioning (alignment, center of gravity)

3. **Visual Overlays**
   - Skeleton tracking with green lines
   - Red keypoint markers
   - Angle measurements in degrees
   - Color-coded form indicators (green=good, yellow=okay, red=needs work)
   - Interactive video player with overlay toggle

4. **Personalized Drill Recommendations**
   - 10+ drill library (serve, footwork, volleys, dinks, groundstrokes, positioning)
   - Difficulty levels (beginner, intermediate, advanced)
   - Detailed instructions (4-5 steps per drill)
   - Weekly training plan (4-day schedule)

5. **Benchmark Comparison**
   - Compare against skill level (beginner, intermediate, advanced, pro)
   - 13 technique metrics analyzed
   - Percentile ranking
   - Identify strengths and weaknesses

6. **Progress Tracking**
   - Historical performance analysis
   - Improvement percentage calculation
   - Trend identification (improving/stable/declining)
   - Best/average score tracking
   - Personalized insights

## 📁 Files Created/Modified

### New Files Created (18)
1. `lib/video-analysis/pose-detection/tensorflow-pose-detector.ts` - TensorFlow.js pose detection
2. `lib/video-analysis/pose-detection/pickleball-technique-analyzer.ts` - Pickleball technique analysis
3. `lib/video-analysis/visual-overlays/pose-overlay-generator.ts` - Visual overlay generation
4. `lib/video-analysis/drills/drill-recommendation-engine.ts` - Drill recommendation system
5. `lib/video-analysis/comparison/metrics-comparison.ts` - Benchmark comparison & progress tracking
6. `lib/video-analysis/enhanced-analysis-engine.ts` - Main orchestration engine
7. `app/api/video-analysis/analyze-enhanced/route.ts` - New API endpoint
8. `components/video-analysis/enhanced/pose-overlay-viewer.tsx` - Overlay viewer component
9. `components/video-analysis/enhanced/drill-recommendations.tsx` - Drill recommendations UI
10. `components/video-analysis/enhanced/benchmark-comparison.tsx` - Comparison charts UI
11. `components/video-analysis/enhanced/progress-tracker.tsx` - Progress visualization UI
12. `components/video-analysis/enhanced/index.ts` - Component exports
13. `docs/VIDEO_ANALYSIS_AI_ENHANCEMENT.md` - Comprehensive documentation

### Files Modified (2)
1. `prisma/schema.prisma` - Added new fields for enhanced analysis data
2. `next.config.js` - Added webpack configuration for TensorFlow.js

## 🚀 Deployment Steps

### Step 1: Update Database Schema

```bash
cd /home/ubuntu/mindful_champion/nextjs_space
npx prisma generate
npx prisma db push
```

This will add the new fields to the VideoAnalysis table:
- visualOverlays
- poseDetectionData
- drillRecommendations
- benchmarkComparison
- progressTracking
- totalFramesAnalyzed
- posesDetected
- usedTensorFlow

### Step 2: Install Dependencies (Already Installed)

The following dependencies are already in place:
- @tensorflow-models/pose-detection@^2.1.3
- @tensorflow/tfjs-node@^4.22.0
- canvas@3.2.0

### Step 3: Stop Current Production Server

```bash
# Find and stop the production server
pm2 list
pm2 stop nextjs-app  # or whatever the process name is
```

### Step 4: Build Production Bundle

```bash
cd /home/ubuntu/mindful_champion/nextjs_space
npm run build
```

Expected output: Build should complete successfully with "Compiled successfully" message.

### Step 5: Start Production Server

```bash
pm2 start npm --name "nextjs-app" -- start
# Or if using a custom script:
# pm2 start ecosystem.config.js
```

### Step 6: Verify Deployment

1. **Check server is running:**
   ```bash
   pm2 logs nextjs-app
   curl http://localhost:3000/api/health  # or your health check endpoint
   ```

2. **Test TensorFlow.js initialization:**
   - Upload a test video through the UI
   - Monitor logs for TensorFlow initialization messages
   - Look for: "🔄 Initializing TensorFlow.js pose detector..."
   - Should see: "✅ TensorFlow.js pose detector initialized successfully"

3. **Test analysis pipeline:**
   - Go to /train/video
   - Upload a short pickleball video (2-5 minutes recommended for testing)
   - Check that analysis completes
   - Verify new features display:
     * Pose overlay viewer
     * Drill recommendations
     * Benchmark comparison
     * Progress tracking

## 🧪 Testing Checklist

### Backend Testing
- [ ] Video upload works (`/api/video-analysis/upload`)
- [ ] Enhanced analysis endpoint works (`/api/video-analysis/analyze-enhanced`)
- [ ] TensorFlow.js initializes successfully
- [ ] Pose detection runs without errors
- [ ] Analysis results save to database
- [ ] All new JSON fields populate correctly

### Frontend Testing
- [ ] Video analysis page loads (`/train/video`)
- [ ] File upload component works
- [ ] Analysis progress displays
- [ ] Results page shows all new features:
  - [ ] Pose overlay viewer with video controls
  - [ ] Drill recommendations with top drills and weekly plan
  - [ ] Benchmark comparison with percentile
  - [ ] Progress tracking visualization
- [ ] Overlays can be toggled on/off
- [ ] Video playback controls work (play/pause/seek)
- [ ] Drill details expand/collapse
- [ ] All metrics display correctly

### Performance Testing
- [ ] 2-5 min video: Completes in 1-2 minutes
- [ ] 5-10 min video: Completes in 3-5 minutes
- [ ] No memory leaks (check with longer videos)
- [ ] TensorFlow resources properly disposed
- [ ] Database queries are efficient

## 🐛 Troubleshooting

### Issue: "Cannot find module '@tensorflow/tfjs-node'"
**Solution:** Module is dynamically imported. If error persists:
```bash
npm install @tensorflow/tfjs-node@^4.22.0
npm rebuild @tensorflow/tfjs-node --build-from-source
```

### Issue: "ffmpeg not found"
**Solution:** Install ffmpeg on the server:
```bash
sudo apt-get update
sudo apt-get install -y ffmpeg
ffmpeg -version  # Verify installation
```

### Issue: Analysis times out
**Possible causes:**
1. Video is too long (>15 minutes)
2. Server has insufficient resources
3. API timeout is too short

**Solutions:**
- Use shorter video for testing
- Increase API timeout in route.ts (currently 300s)
- Check server RAM (needs 512MB+ for TensorFlow)

### Issue: Pose detection returns empty results
**Possible causes:**
1. Poor video quality (too dark, shaky)
2. Player not visible in frame
3. Video resolution too low

**Solutions:**
- Verify video meets requirements (see docs)
- Test with high-quality sample video
- Check console logs for specific errors

### Issue: UI components not displaying
**Possible causes:**
1. Build didn't complete successfully
2. Old browser cache
3. Missing component imports

**Solutions:**
```bash
# Rebuild and restart
npm run build
pm2 restart nextjs-app

# Clear browser cache (user action)
# Check browser console for errors
```

## 📊 Monitoring

### Key Metrics to Track

1. **Analysis Success Rate**
   - Query database for COMPLETED vs FAILED analyses
   - Target: >95% success rate

2. **Processing Times**
   - Monitor analysis duration
   - Alert if consistently over expected times

3. **TensorFlow Performance**
   - Check pose detection count vs frame count
   - Monitor model initialization time
   - Track resource usage

4. **User Engagement**
   - Videos uploaded per day
   - Drill recommendations viewed
   - Progress tracking usage

### Database Queries for Monitoring

```sql
-- Success rate (last 7 days)
SELECT 
  analysisStatus,
  COUNT(*) as count
FROM VideoAnalysis
WHERE uploadedAt >= NOW() - INTERVAL '7 days'
GROUP BY analysisStatus;

-- Average processing time
SELECT 
  AVG(EXTRACT(EPOCH FROM (analyzedAt - uploadedAt))) as avg_seconds
FROM VideoAnalysis
WHERE analysisStatus = 'COMPLETED'
  AND analyzedAt IS NOT NULL;

-- TensorFlow usage
SELECT 
  usedTensorFlow,
  COUNT(*) as count
FROM VideoAnalysis
WHERE analyzedAt >= NOW() - INTERVAL '7 days'
GROUP BY usedTensorFlow;
```

## 🔄 Rolling Back

If issues occur, you can temporarily disable TensorFlow.js:

1. **Use fallback analysis:**
   - The old `AdvancedAnalysisEngine` still exists
   - Switch API route to use old engine
   - Or add feature flag to toggle between engines

2. **Quick rollback:**
   ```bash
   git stash  # Save current changes
   pm2 restart nextjs-app
   ```

## 📚 Documentation

- **Full technical documentation:** `docs/VIDEO_ANALYSIS_AI_ENHANCEMENT.md`
- **Component documentation:** See individual component files
- **API documentation:** See route.ts files

## 🎯 Next Steps (Future Enhancements)

1. Real-time analysis during upload
2. Side-by-side video comparison
3. Pro player technique comparison
4. 3D pose visualization
5. Mobile app optimization
6. Batch video analysis
7. Custom drill creation for coaches
8. Social sharing of results

## 📞 Support

For issues or questions:
- Check logs: `pm2 logs nextjs-app`
- Review database: Check VideoAnalysis table
- Console logs: Look for TensorFlow errors
- Test with small video files first

## ✅ Deployment Verification

After deployment, verify:
1. [ ] Server is running and accessible
2. [ ] Database schema is updated
3. [ ] Video upload works
4. [ ] TensorFlow.js initializes
5. [ ] Analysis completes successfully
6. [ ] All UI components display
7. [ ] No console errors
8. [ ] Performance is acceptable

---

**Deployed By:** [Your Name]  
**Deployment Date:** [Date]  
**Version:** 1.0.0  
**Status:** Ready for Production ✅
