#!/bin/bash

# Force Custom Domain Sync Script
# Purpose: Trigger a fresh deployment to sync custom domain with latest code

echo "================================================"
echo "  Mindful Champion - Force Domain Sync"
echo "================================================"
echo ""

# Change to project directory
cd /home/ubuntu/mc_deploy || exit 1

# Display current status
echo "📊 Current Status:"
echo "  - Latest Commit: $(git rev-parse --short HEAD)"
echo "  - Commit Message: $(git log -1 --pretty=%B | head -1)"
echo "  - Current Branch: $(git branch --show-current)"
echo ""

# Create force rebuild timestamp
TIMESTAMP=$(date +%Y%m%d%H%M%S)
echo "⚡ Creating force rebuild file..."
echo "Force rebuild $TIMESTAMP - Custom domain sync" > .force-rebuild
echo "  ✅ Created .force-rebuild with timestamp: $TIMESTAMP"
echo ""

# Check if there are any uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "📝 Committing force rebuild file..."
    git add .force-rebuild
    git commit -m "Force rebuild $TIMESTAMP - Sync custom domain to latest deployment"
    echo "  ✅ Committed force rebuild trigger"
    echo ""
    
    echo "🚀 Pushing to remote..."
    git push origin $(git branch --show-current)
    
    if [ $? -eq 0 ]; then
        echo "  ✅ Successfully pushed to remote"
    else
        echo "  ❌ Failed to push to remote"
        exit 1
    fi
else
    echo "ℹ️  No changes to commit (force-rebuild file may already exist)"
fi

echo ""
echo "================================================"
echo "  Next Steps:"
echo "================================================"
echo ""
echo "1. Monitor the Abacus.AI platform for build triggers"
echo "   URL: https://apps.abacus.ai/chatllm/?appId=appllm_engineer"
echo ""
echo "2. Wait 15-30 minutes for:"
echo "   - Build process (5-10 min)"
echo "   - Deployment (2-5 min)"
echo "   - CDN propagation (5-15 min)"
echo ""
echo "3. Verify on custom domain:"
echo "   URL: https://mindfulchampion.com"
echo ""
echo "4. Check for these indicators:"
echo "   ✓ Vibrant dashboard (not washed out)"
echo "   ✓ No 'Play' link in navigation"
echo "   ✓ Video analysis shows mph readings"
echo "   ✓ Coach Kai uses female avatar"
echo ""
echo "5. If still showing old version after 30 min:"
echo "   - Clear browser cache (Ctrl+Shift+Delete)"
echo "   - Try incognito/private window"
echo "   - Contact support@abacus.ai"
echo ""
echo "================================================"
echo "  Diagnostic Commands:"
echo "================================================"
echo ""
echo "# Check build logs:"
echo "  ls -lah /home/ubuntu/mc_deploy/build*.log"
echo ""
echo "# Test custom domain:"
echo "  curl -I https://mindfulchampion.com"
echo ""
echo "# Test preview URL:"
echo "  curl -I https://mindful-champion-8zziwi.abacusai.app"
echo ""
echo "# View git status:"
echo "  cd /home/ubuntu/mc_deploy && git status"
echo ""
echo "================================================"
echo "Script completed at: $(date)"
echo "================================================"
