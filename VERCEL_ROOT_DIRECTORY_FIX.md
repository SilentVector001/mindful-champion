# Vercel Root Directory Fix - December 28, 2025

## Problem Identified

The live site (mindfulchampion.com) was showing outdated code (HeyGen interface) despite:
- ✅ Clearing browser cache completely
- ✅ Having correct code in the codebase
- ✅ Multiple deployments being triggered

**Root Cause:** Vercel was deploying from `nextjs_space/` subdirectory because that's what was tracked in the Git repository, while the latest code updates were only in the root directory (not tracked by Git).

## Diagnosis

```bash
# Git was only tracking nextjs_space/
git ls-files | head -20
# Output showed: nextjs_space/app/..., nextjs_space/components/..., etc.

# Root directory had the correct, updated code
ls -la | grep -E "app|components|lib"
# Output showed: app/, components/, lib/, prisma/, etc. at root level

# Files were different
diff app/train/coach/page.tsx nextjs_space/app/train/coach/page.tsx
# Output showed differences - root had newer code
```

## Solution Applied

### Step 1: Remove nextjs_space from Git tracking
```bash
cd /home/ubuntu/mindful_champion_deploy
git rm -r --cached nextjs_space
```

### Step 2: Add all root files to Git
```bash
git add app components lib prisma public types scripts
git add package.json tsconfig.json next.config.js vercel.json .eslintrc.json .npmrc
git add *.md *.json
```

### Step 3: Commit and Push
```bash
git commit -m "CRITICAL FIX: Move Next.js app from nextjs_space/ to root for Vercel deployment"
git push origin master
```

**Commit Hash:** 5835154
**Changes:** 3,119 files changed (all moved as renames to preserve history)

## Technical Details

### Before Fix
```
Repository structure in Git:
/home/ubuntu/mindful_champion_deploy/
├── nextjs_space/          # ← Git tracked this (OUTDATED)
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── ...
├── app/                   # ← NOT in Git (LATEST CODE)
├── components/            # ← NOT in Git (LATEST CODE)
└── ...
```

### After Fix
```
Repository structure in Git:
/home/ubuntu/mindful_champion_deploy/
├── app/                   # ✅ Now tracked in Git (LATEST CODE)
├── components/            # ✅ Now tracked in Git
├── lib/                   # ✅ Now tracked in Git
├── prisma/                # ✅ Now tracked in Git
├── public/                # ✅ Now tracked in Git
├── package.json           # ✅ Root level config
├── next.config.js         # ✅ Root level config
├── vercel.json            # ✅ Root level config
└── nextjs_space/          # ← No longer in Git
```

## Vercel Configuration

The `vercel.json` at root level is correctly configured:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install --legacy-peer-deps",
  "functions": {
    "app/api/**/*.ts": { "maxDuration": 300 },
    "app/**/*.tsx": { "maxDuration": 60 }
  }
}
```

Vercel will now:
1. Read `package.json` from root
2. Run `npm install --legacy-peer-deps` at root
3. Build Next.js app from `app/` directory at root
4. Deploy the correct, up-to-date code

## Expected Outcome

✅ **Vercel will now deploy the latest code** including:
- SimpleCoachKai text-based chat interface (NO HeyGen)
- All recent bug fixes and enhancements
- Updated tournament data
- Fixed drill library

## Verification Steps

1. **Check Vercel Dashboard**: 
   - Go to https://vercel.com/dean-snows-projects-/mindful-champion/deployments
   - Look for new deployment triggered by commit 5835154
   - Wait for "Ready" status

2. **Clear Cache Again** (optional but recommended):
   ```bash
   # In browser:
   # Chrome: Settings → Privacy and security → Clear browsing data → Cached images and files
   # Safari: Safari → Settings → Privacy → Manage Website Data → Remove All
   ```

3. **Visit Live Site**:
   - Go to https://mindfulchampion.com/train/coach
   - Should see text-based Coach Kai interface with animated avatar
   - Should NOT see HeyGen video interface
   - Message should be: "Hey [Name]! 🏓 I'm Coach Kai, ready to help you level up your pickleball game."

4. **Verify Build Logs**:
   - Check Vercel build logs for:
     - "Building Next.js app from root directory"
     - No references to `nextjs_space/`
     - Successful deployment

## Rollback Plan (if needed)

If anything goes wrong:

```bash
cd /home/ubuntu/mindful_champion_deploy
git revert 5835154
git push origin master
```

However, this should not be necessary as the change is straightforward and Git preserved all file history through renames.

## Why This Happened

The repository was originally structured with the Next.js app in a subdirectory (`nextjs_space/`), likely for organization purposes. At some point, files were copied to the root directory for easier deployment, but Git was not updated to track the root files. This caused a "split brain" scenario where:

- **Local development**: Used root directory (latest code)
- **Git repository**: Tracked only nextjs_space/ (outdated code)
- **Vercel**: Deployed from Git repository (outdated code)

This fix aligns all three to use the root directory.

## Future Recommendations

1. **Always ensure Git tracks the correct files**:
   ```bash
   git status  # Check what's tracked
   git ls-files | head -20  # Verify tracked files
   ```

2. **After major directory restructuring**:
   ```bash
   git rm -r --cached old_directory/
   git add new_directory/
   git commit -m "Restructure: Move from old_directory to new_directory"
   ```

3. **Monitor Vercel builds** to ensure they're pulling from the correct location.

## Related Files

- `/home/ubuntu/mindful_champion_deploy/vercel.json` - Vercel configuration
- `/home/ubuntu/mindful_champion_deploy/package.json` - npm dependencies
- `/home/ubuntu/mindful_champion_deploy/app/train/coach/page.tsx` - Coach Kai page
- `/home/ubuntu/mindful_champion_deploy/components/coach/simple-coach-kai.tsx` - Coach Kai component

## Status

✅ **COMPLETED**: Changes committed and pushed to GitHub
⏳ **PENDING**: Vercel deployment in progress
🔍 **NEXT**: User verification of live site

---

**Fixed by:** DeepAgent  
**Date:** December 28, 2025  
**Commit:** 5835154  
**Branch:** master
