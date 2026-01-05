#!/bin/bash

# Deployment Status Checker
# Purpose: Diagnose deployment discrepancies between preview and custom domain

echo "================================================"
echo "  Deployment Status Diagnostic"
echo "================================================"
echo ""

cd /home/ubuntu/mc_deploy || exit 1

# Git Status
echo "📦 Git Repository Status:"
echo "  Current Commit: $(git rev-parse HEAD)"
echo "  Short Hash: $(git rev-parse --short HEAD)"
echo "  Branch: $(git branch --show-current)"
echo "  Last Commit: $(git log -1 --pretty=format:'%s' | head -1)"
echo "  Commit Date: $(git log -1 --pretty=format:'%ci')"
echo ""

# Force Rebuild Status
echo "🔄 Force Rebuild Status:"
if [ -f .force-rebuild ]; then
    echo "  ✅ Force rebuild file exists"
    echo "  Content: $(cat .force-rebuild)"
    echo "  Modified: $(stat -c '%y' .force-rebuild 2>/dev/null || stat -f '%Sm' .force-rebuild)"
else
    echo "  ❌ No force rebuild file found"
fi
echo ""

# Build Logs
echo "📝 Recent Build Logs:"
if ls build*.log rebuild.log 2>/dev/null | head -5; then
    echo ""
    echo "  Most recent build logs:"
    ls -lht build*.log rebuild.log 2>/dev/null | head -3 | awk '{print "    " $0}'
else
    echo "  ⚠️  No build logs found"
fi
echo ""

# Deployment Configuration
echo "⚙️  Deployment Configuration:"
if [ -f .abacus.donotdelete ]; then
    echo "  ✅ Abacus.AI deployment config exists"
    echo "  Size: $(stat -c '%s' .abacus.donotdelete 2>/dev/null || stat -f '%z' .abacus.donotdelete) bytes"
    echo "  Modified: $(stat -c '%y' .abacus.donotdelete 2>/dev/null || stat -f '%Sm' .abacus.donotdelete)"
else
    echo "  ❌ No deployment config found"
fi
echo ""

# URL Testing
echo "🌐 URL Response Testing:"
echo ""

echo "  Testing Custom Domain (mindfulchampion.com)..."
CUSTOM_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://mindfulchampion.com --max-time 10 2>/dev/null || echo "FAILED")
CUSTOM_SIZE=$(curl -s https://mindfulchampion.com --max-time 10 2>/dev/null | wc -c)
echo "    Status: $CUSTOM_STATUS"
echo "    Response Size: $CUSTOM_SIZE bytes"
echo ""

echo "  Testing Preview URL (mindful-champion-8zziwi.abacusai.app)..."
PREVIEW_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://mindful-champion-8zziwi.abacusai.app --max-time 10 2>/dev/null || echo "FAILED")
PREVIEW_SIZE=$(curl -s https://mindful-champion-8zziwi.abacusai.app --max-time 10 2>/dev/null | wc -c)
echo "    Status: $PREVIEW_STATUS"
echo "    Response Size: $PREVIEW_SIZE bytes"
echo ""

# Compare responses
if [ "$CUSTOM_SIZE" != "$PREVIEW_SIZE" ] && [ "$CUSTOM_SIZE" != "0" ] && [ "$PREVIEW_SIZE" != "0" ]; then
    SIZE_DIFF=$((PREVIEW_SIZE - CUSTOM_SIZE))
    echo "  ⚠️  SIZE MISMATCH DETECTED!"
    echo "    Difference: $SIZE_DIFF bytes"
    echo "    This suggests different versions are being served"
    echo ""
fi

# Check for key features in responses
echo "🔍 Feature Detection:"
echo ""

echo "  Checking Custom Domain for key features..."
CUSTOM_HTML=$(curl -s https://mindfulchampion.com --max-time 10 2>/dev/null)

if echo "$CUSTOM_HTML" | grep -q "Overall Score"; then
    echo "    ✅ 'Overall Score' found (new video analysis)"
else
    echo "    ❌ 'Overall Score' not found (may be old version)"
fi

if echo "$CUSTOM_HTML" | grep -q "Coach Kai"; then
    echo "    ✅ 'Coach Kai' found"
else
    echo "    ⚠️  'Coach Kai' not found in initial load"
fi

echo ""
echo "  Checking Preview URL for key features..."
PREVIEW_HTML=$(curl -s https://mindful-champion-8zziwi.abacusai.app --max-time 10 2>/dev/null)

if echo "$PREVIEW_HTML" | grep -q "Overall Score"; then
    echo "    ✅ 'Overall Score' found (new video analysis)"
else
    echo "    ❌ 'Overall Score' not found"
fi

if echo "$PREVIEW_HTML" | grep -q "Coach Kai"; then
    echo "    ✅ 'Coach Kai' found"
else
    echo "    ⚠️  'Coach Kai' not found in initial load"
fi

echo ""
echo "================================================"
echo "  Summary:"
echo "================================================"
echo ""

if [ "$CUSTOM_STATUS" = "200" ] && [ "$PREVIEW_STATUS" = "200" ]; then
    echo "✅ Both URLs are accessible (HTTP 200)"
else
    echo "❌ One or both URLs are not responding properly"
    echo "   Custom: $CUSTOM_STATUS | Preview: $PREVIEW_STATUS"
fi

if [ "$CUSTOM_SIZE" = "$PREVIEW_SIZE" ] && [ "$CUSTOM_SIZE" != "0" ]; then
    echo "✅ Response sizes match (likely same version)"
else
    echo "⚠️  Response sizes differ (likely different versions)"
    echo "   Custom: $CUSTOM_SIZE bytes | Preview: $PREVIEW_SIZE bytes"
fi

echo ""
echo "================================================"
echo "  Recommendations:"
echo "================================================"
echo ""

if [ "$CUSTOM_SIZE" != "$PREVIEW_SIZE" ] || [ "$CUSTOM_STATUS" != "200" ]; then
    echo "🔧 Deployment sync needed. Run:"
    echo "   ./force-domain-sync.sh"
    echo ""
    echo "📋 Or follow manual steps in:"
    echo "   CUSTOM_DOMAIN_SYNC_REPORT.md"
else
    echo "✅ Deployments appear to be in sync"
    echo ""
    echo "If you still see visual differences:"
    echo "  1. Clear browser cache (Ctrl+Shift+Delete)"
    echo "  2. Try incognito/private window"
    echo "  3. Check browser developer console for errors"
fi

echo ""
echo "================================================"
echo "Script completed at: $(date)"
echo "================================================"
