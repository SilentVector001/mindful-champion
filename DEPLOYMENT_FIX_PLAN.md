# Vercel Deployment Fix Plan

## Critical Issue: Serverless Function Size Exceeded
- **Problem**: Video analysis functions are 364MB (exceeds 250MB Pro limit)
- **Root Cause**: TensorFlow, MediaPipe, and FFmpeg being bundled into serverless functions
- **Solution**: Temporarily disable ML-heavy features, use lightweight alternatives

## Fixes to Implement:

### 1. Video Analysis API Routes (CRITICAL)
- [ ] Disable heavy ML imports in `analyze/route.ts`
- [ ] Disable heavy ML imports in `analyze-enhanced/route.ts`
- [ ] Disable heavy ML imports in `detect-shots/route.ts`
- [ ] Keep basic video upload/library functionality working

### 2. Media Hub Issues
- [ ] Check Media Hub API endpoints
- [ ] Verify data fetching and display
- [ ] Test live tournaments and scores

### 3. Rewards Points Display
- [ ] Fix points not showing in Rewards page
- [ ] Fix points not showing at top of Achievement Center
- [ ] Verify points calculation API

### 4. Other Issues
- [ ] Review all failed deployments
- [ ] Test all critical user flows
- [ ] Verify database connections

## Implementation Strategy:
1. Create lightweight versions of analysis engines
2. Use mock/placeholder responses for ML features
3. Add feature flags to re-enable later
4. Deploy and verify build succeeds
5. Test critical functionality
6. Fix remaining issues (Media Hub, Points)
