# 🎯 Visual Guide: Update Vercel Root Directory

## Step-by-Step with Screenshots

### Step 1: Open Vercel Dashboard

1. Go to: **https://vercel.com/dashboard**
2. You should see your projects list

```
┌───────────────────────────────────────────────────┐
│  Vercel Dashboard                                 │
├───────────────────────────────────────────────────┤
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │  mindful-champion                           │ │
│  │  mindfulchampion.com                        │ │
│  │  ● Production - Ready                       │ │
│  │  2h ago by SilentVector001                  │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
└───────────────────────────────────────────────────┘
```

**Click on the "mindful-champion" project card**

---

### Step 2: Go to Settings

Once in your project, you'll see tabs at the top:

```
┌───────────────────────────────────────────────────┐
│  [Overview] [Deployments] [Analytics] [Settings]  │
└───────────────────────────────────────────────────┘
```

**Click on "Settings" tab**

---

### Step 3: Navigate to General Settings

On the left sidebar, you'll see:

```
┌───────────────────┐
│  Settings         │
├───────────────────┤
│  ● General        │  ← Click here!
│    Domains        │
│    Git            │
│    Environment... │
│    Functions      │
│    Security       │
│    ...            │
└───────────────────┘
```

**Click on "General"**

---

### Step 4: Find Root Directory Section

Scroll down the General settings page. You'll pass:
- Project Name
- Framework Preset (Next.js)
- Build & Development Settings
- Node.js Version

Keep scrolling until you see:

```
┌─────────────────────────────────────────────────┐
│  Root Directory                                 │
├─────────────────────────────────────────────────┤
│  The directory within your project, in case     │
│  your code is not located at the root.          │
│                                                 │
│  Root Directory:  (none)                [Edit]  │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Click the "Edit" button**

---

### Step 5: Enter "nextjs_space"

After clicking Edit, you'll see:

```
┌─────────────────────────────────────────────────┐
│  Root Directory                                 │
├─────────────────────────────────────────────────┤
│  The directory within your project, in case     │
│  your code is not located at the root.          │
│                                                 │
│  Root Directory:  [_____________]     [Cancel]  │
│                                       [Save]    │
└─────────────────────────────────────────────────┘
```

**Type in the box: `nextjs_space`**

**IMPORTANT:** 
- ✅ Correct: `nextjs_space`
- ❌ Wrong: `nextjs_space/`
- ❌ Wrong: `/nextjs_space`
- ❌ Wrong: `nextjs space` (no space!)

---

### Step 6: Save Changes

After typing `nextjs_space`:

```
┌─────────────────────────────────────────────────┐
│  Root Directory                                 │
├─────────────────────────────────────────────────┤
│  The directory within your project, in case     │
│  your code is not located at the root.          │
│                                                 │
│  Root Directory:  [nextjs_space]      [Cancel]  │
│                                       [Save] ←   │
└─────────────────────────────────────────────────┘
```

**Click "Save"**

You should see a success message:
```
✅ Project settings updated
```

---

### Step 7: Trigger Deployment

Now that the Root Directory is set, you need to trigger a deployment.

**Option A: Empty Commit (Recommended)**

Open terminal and run:
```bash
cd /home/ubuntu/mindful_champion
git commit --allow-empty -m "Deploy: Configure Vercel for nextjs_space subdirectory"
git push
```

**Option B: Redeploy in Dashboard**

1. Click on "Deployments" tab
2. Find the latest deployment
3. Click the "..." (three dots) button
4. Click "Redeploy"

---

### Step 8: Monitor Deployment

After triggering deployment:

1. Go to **Deployments** tab
2. You'll see a new deployment with status "Building"

```
┌─────────────────────────────────────────────────┐
│  Building...                                    │
│  ● master                                       │
│  Deploy: Configure Vercel for nextjs_space...  │
│  Just now by SilentVector001                    │
└─────────────────────────────────────────────────┘
```

**Wait 1-2 minutes for it to turn green:**

```
┌─────────────────────────────────────────────────┐
│  ✅ Ready                                       │
│  ● master                                       │
│  Deploy: Configure Vercel for nextjs_space...  │
│  2m ago by SilentVector001                      │
└─────────────────────────────────────────────────┘
```

---

### Step 9: Verify Build Logs

**Click on the deployment** to see build logs.

Look for confirmation that it's building from `nextjs_space`:

```
Build Logs:
─────────────────────────────────────────────
  Cloning repository...
  Analyzing source code...
  Installing dependencies from nextjs_space/package.json
  Building Next.js application from nextjs_space/
  ✓ Compiled successfully
  ✓ Generated static pages
  ✓ Deployment complete
─────────────────────────────────────────────
```

**Key thing to verify:** Logs should mention `nextjs_space/` 

---

### Step 10: Test Your Site

Open these URLs to verify everything works:

#### Should Work (200 OK):
- ✅ https://mindfulchampion.com
- ✅ https://mindfulchampion.com/connect/tournaments
- ✅ https://mindfulchampion.com/train
- ✅ https://mindfulchampion.com/dashboard (after login)

#### Should Show 404 (Expected):
- ❌ https://mindfulchampion.com/media
- ❌ https://mindfulchampion.com/media-center

**If all looks good, reply:** "Done - Everything works!"

---

## 🎯 Quick Checklist

- [ ] Opened Vercel Dashboard
- [ ] Selected mindful-champion project
- [ ] Clicked Settings → General
- [ ] Found Root Directory section
- [ ] Clicked Edit
- [ ] Typed `nextjs_space` (exactly)
- [ ] Clicked Save
- [ ] Saw "Project settings updated" message
- [ ] Triggered deployment (empty commit or redeploy)
- [ ] Waited for deployment to complete
- [ ] Checked build logs mention nextjs_space
- [ ] Tested live site - works!
- [ ] Confirmed /media shows 404
- [ ] Replied "Done - Everything works!"

---

## 🆘 Troubleshooting

### "Can't find Root Directory setting"
- Make sure you're in **Settings** → **General**
- Scroll down - it's below "Build & Development Settings"
- Should be near "Node.js Version" setting

### "Save button is disabled"
- Make sure you typed exactly: `nextjs_space`
- No spaces, no slashes, no extra characters

### "Build failed after saving"
- Check you typed `nextjs_space` not `nextjs_space/`
- Verify in Settings that it shows: `nextjs_space`
- Check deployment logs for specific error

### "Site shows 404 on all pages"
- Wait 30 more seconds - deployment might still be processing
- Check deployment status in Deployments tab
- Ensure Root Directory is exactly `nextjs_space`

---

## 📞 After You're Done

Reply with one of these:
- ✅ "Done - Vercel is deploying" (if you just saved the setting)
- ✅ "Done - Deployment complete" (if deployment finished)
- ✅ "Done - Everything works!" (if you tested and it all works)

Then I'll:
1. Verify everything
2. Clean up duplicate directories
3. Create final completion report
4. Celebrate! 🎉

---

**Current Status:** ⏳ Awaiting your Root Directory update  
**Time Required:** 2 minutes  
**Difficulty:** ⭐ Very Easy

Let's do this! 🚀
